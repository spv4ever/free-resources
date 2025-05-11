import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmail } from '../services/sendEmail.js';

export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      email,
      password,
      role: 'free',
      isVerified: false,
      verificationToken
    });

    await user.save();

    const verifyUrl = `${process.env.FRONTEND_BASE_URL}/verify-email?token=${verificationToken}`;
    const html = `<p>Gracias por registrarte.</p>
                  <p>Confirma tu correo haciendo clic en el siguiente enlace:</p>
                  <a href="${verifyUrl}">Verificar Email</a>`;

    await sendEmail({
      to: email,
      subject: 'Confirma tu cuenta',
      html
    });

    res.status(201).json({ message: 'Registro exitoso. Verifica tu email para activar la cuenta.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user || !(await user.matchPassword(password))) {
        return res.status(400).json({ message: 'Credenciales no válidas' });
      }
  
      if (!user.isVerified) {
        return res.status(403).json({ message: 'Debes verificar tu correo antes de iniciar sesión.' });
      }
  
      const token = jwt.sign(
        { id: user._id, name: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
  
      res.json({ token });
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

    res.status(200).json({ message: 'Cuenta verificada correctamente' });
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
  
