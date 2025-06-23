import express from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser, verifyEmail, getRegisterLogs  } from '../controllers/authController.js';
import { forgotPassword, resetPassword } from '../controllers/authController.js';
import { updateUserProfile } from '../controllers/authController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';




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
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/profile', protect, updateUserProfile);
router.get('/admin/register-logs', protect, admin, getRegisterLogs);

export default router;
