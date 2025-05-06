import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const router = express.Router();

// Ruta de registro de usuario
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Debe ser un correo válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Comprobar si el usuario ya existe
      const userExists = await User.findOne({ email });

      if (userExists) {
        return res.status(400).json({ message: 'El correo ya está registrado' });
      }

      // Crear un nuevo usuario
      const user = new User({
        email,
        password,
      });

      await user.save();

      res.status(201).json({ message: 'Usuario creado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }
);

// Ruta de inicio de sesión
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Comprobar si el usuario existe
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Credenciales no válidas' });
    }

    // Comprobar la contraseña
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales no válidas' });
    }
    //console.log(user.email)
    // Crear y firmar el JWT con el nombre y el rol del usuario
    const token = jwt.sign(
        { id: user._id, name: user.email, role: user.role }, // Aquí añadimos el nombre y el rol
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

    res.json({ token });
    // console.log(token)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

export default router;
