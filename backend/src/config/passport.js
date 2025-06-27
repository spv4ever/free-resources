import dotenv from 'dotenv';
dotenv.config();
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js'; // Asegúrate de que esta ruta sea correcta
import { sendVerificationForGoogleUser } from '../controllers/authHelpers.js'; // o desde authHelpers si lo separaste
import { randomBytes } from 'crypto';
const isDev = process.env.NODE_ENV === 'development';

// console.log('🔐 GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID_FREE_RESOURCES);
// console.log('🔐 CALLBACK URL:', isDev
//   ? 'http://localhost:5000/api/auth/google/callback'
//   : 'https://api.keikodev.es/api/auth/google/callback');


passport.use('google-free-resources', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID_FREE_RESOURCES,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET_FREE_RESOURCES,
  callbackURL: isDev
    ? 'http://localhost:5000/api/auth/google/callback'
    : 'https://api.keikodev.es/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
    const randomPassword = randomBytes(16).toString('hex'); // ✅ Generar antes
    const newUser = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        password: randomPassword, // ✅ Usar como contraseña temporal
        avatar: profile.photos?.[0]?.value,
        role: 'free',
        nickname: profile.displayName?.slice(0, 50) ?? 'user',
        isVerified: true,
        provider: 'google' // 👈 esto lo identifica como Google-user
        });

    await newUser.save();
    await sendVerificationForGoogleUser(newUser); // 🔔 Envía email + loguea

    return done(null, newUser);
    }


        return done(null, existingUser);
  } catch (error) {
    return done(error, null);
  }
}));

export default passport;
