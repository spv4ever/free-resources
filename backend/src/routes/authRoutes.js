import express from 'express';
import { body } from 'express-validator';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { registerUser, loginUser, verifyEmail, getRegisterLogs  } from '../controllers/authController.js';
import { getMe } from '../controllers/authController.js';
import { forgotPassword, resetPassword } from '../controllers/authController.js';
import { updateUserProfile } from '../controllers/authController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
import '../config/passport.js';




const router = express.Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Debe ser un correo válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
  ],
  registerUser
);

router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/profile', protect, updateUserProfile);
router.get('/register-logs', protect, admin, getRegisterLogs);


// Login con Google (redirección al login de Google)
router.get('/google', passport.authenticate('google-free-resources', {
  scope: ['profile', 'email'],
  prompt: 'consent'
}));

// Callback desde Google (Google redirige aquí después del login)
router.get(
  '/google/callback',
  passport.authenticate('google-free-resources', {
    session: false,
    failureRedirect: '/login?error=unauthorized'
  }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.redirect(`${process.env.FRONTEND_BASE_URL}/auth/callback?token=${token}`);
  }
);

export default router;
