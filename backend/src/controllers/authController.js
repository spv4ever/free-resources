import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmail } from '../services/sendEmail.js';
import { logUserRegistrationAttempt } from '../services/userLogService.js'
import RegistroUsuarioLog from '../models/RegistroUsuarioLog.js';
import UserTokenBalance from '../models/UserTokenBalance.js';

export const registerUser = async (req, res) => {
  const { email, password, nickname } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    logUserRegistrationAttempt({
      email,
      nickname,
      success: false,
      reason: 'Errores de validación',
      details: errors.array()
    });

    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      logUserRegistrationAttempt({
        email,
        nickname,
        success: false,
        reason: 'Correo ya registrado'
      });

      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      email,
      password,
      role: 'free',
      isVerified: false,
      verificationToken,
      nickname
    });

    await user.save();

    await sendEmail({
      to: email,
      subject: 'Confirma tu cuenta',
      html: `<p>Gracias por registrarte. <a href="${process.env.FRONTEND_BASE_URL}/verify-email?token=${verificationToken}">Verifica tu correo aquí</a></p>`
    });

    logUserRegistrationAttempt({
      email,
      nickname,
      success: true
    });

    res.status(201).json({ message: 'Registro exitoso. Verifica tu email para activar la cuenta.' });
  } catch (error) {
    console.error(error);

    logUserRegistrationAttempt({
      email,
      nickname,
      success: false,
      reason: 'Error del servidor',
      error: error.message
    });

    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });

      // 🚫 Validar si la cuenta fue creada por Google
      if (user && user.provider === 'google') {
        return res.status(403).json({ message: 'Esta cuenta solo puede iniciar sesión con Google.' });
      }
  
      if (!user || !(await user.matchPassword(password))) {
        return res.status(400).json({ message: 'Credenciales no válidas' });
      }
  
      if (!user.isVerified) {
        return res.status(403).json({ message: 'Debes verificar tu correo antes de iniciar sesión.' });
      }
  
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
  
      res.json({
        token,
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          nickname: user.nickname // ✅ opcional pero útil
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  };
  

export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Token de verificación faltante' });
  }

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Token no válido o ya verificado' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.redirect(`${process.env.FRONTEND_BASE_URL}/login?verified=true`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al verificar el email' });
  }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(200).json({ message: 'Si el correo existe, se enviará un enlace de recuperación' });
      }
  
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenExpires = Date.now() + 3600000; // 1 hora
  
      user.resetToken = resetToken;
      user.resetTokenExpires = tokenExpires;
      await user.save();
  
      const resetUrl = `${process.env.FRONTEND_BASE_URL}/reset-password?token=${resetToken}`;
      const html = `<p>Has solicitado restablecer tu contraseña.</p>
                    <p>Haz clic en el siguiente enlace:</p>
                    <a href="${resetUrl}">Restablecer Contraseña</a>
                    <p>Este enlace caduca en 1 hora.</p>`;
  
      await sendEmail({
        to: email,
        subject: 'Recuperación de contraseña',
        html
      });
  
      res.status(200).json({ message: 'Se ha enviado un correo si el email está registrado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al procesar la solicitud' });
    }
  };

  export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
  
    try {
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpires: { $gt: Date.now() }
      });
  
      if (!user) {
        return res.status(400).json({ message: 'Token inválido o expirado' });
      }
  
      user.password = newPassword;
      user.resetToken = undefined;
      user.resetTokenExpires = undefined;
  
      await user.save();
  
      res.status(200).json({ message: 'Contraseña restablecida correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al restablecer la contraseña' });
    }
  };
  
export const getAllUsers = async (req, res) => {
    try {
      // Obtener todos los usuarios sin contraseña
      const users = await User.find().sort({ createdAt: -1 }).select('-password').lean();

      // Obtener balances
      const balances = await UserTokenBalance.find().lean();

      // Crear un mapa { userId: balance }
      const balanceMap = {};
      balances.forEach(b => {
        balanceMap[b.user.toString()] = b.balance;
      });

      // Enriquecer los usuarios con su saldo
      const enrichedUsers = users.map(user => ({
        ...user,
        tokenBalance: balanceMap[user._id.toString()] ?? 0
      }));

      res.json(enrichedUsers);
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      res.status(500).json({ message: 'Error al obtener los usuarios' });
    }
  };

export const updateUserByAdmin = async (req, res) => {
  const { id } = req.params;
  const { role, isVerified, nickname, permiteImagenesPublicas } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (role) user.role = role;
    if (typeof isVerified === 'boolean') user.isVerified = isVerified;
    if (nickname) user.nickname = nickname.trim().slice(0, 50);
    if (typeof permiteImagenesPublicas === 'boolean') user.permiteImagenesPublicas = permiteImagenesPublicas;

    await user.save();

    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

  export const updateUserProfile = async (req, res) => {
  const userId = req.user.id; // asumimos que usas middleware de autenticación
  const { nickname } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (nickname) {
      user.nickname = nickname.trim().slice(0, 50);
      await user.save();
    }

    res.json({ message: 'Apodo actualizado correctamente', nickname: user.nickname });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar el apodo' });
  }
};

// Solo accesible por admin
export const getRegisterLogs = async (req, res) => {
  try {
    const logs = await RegistroUsuarioLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    console.error('❌ Error al obtener logs:', err);
    res.status(500).json({ message: 'Error al obtener los logs' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Obtener balance de tokens
    const balanceRecord = await UserTokenBalance.findOne({ user: user._id });
    const tokenBalance = balanceRecord ? balanceRecord.balance : 0;

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      nickname: user.nickname,
      isVerified: user.isVerified,
      permiteImagenesPublicas: user.permiteImagenesPublicas,
      tokenBalance
    });
  } catch (error) {
    console.error('❌ Error en getMe:', error);
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
};
