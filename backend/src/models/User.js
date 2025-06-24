import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import UserTokenBalance from './UserTokenBalance.js'; // ← añadir esta línea
// Definir el esquema de Usuario
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  nickname: {
    type: String,
    trim: true,
    maxlength: 50,
    default: function () {
      return this.email?.split('@')[0]; // valor por defecto si no se define
    }
  },
  role: {
    type: String,
    enum: ['free', 'pro', 'admin'],
    default: 'free'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetToken: String,
  resetTokenExpires: Date
}, {
  timestamps: true
});

// Encriptar la contraseña antes de guardarla
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Crear saldo inicial post-registro
userSchema.post('save', async function (doc, next) {
  const exists = await UserTokenBalance.findOne({ user: doc._id });
  if (!exists) {
    await UserTokenBalance.create({ user: doc._id, balance: 5 }); // 5 tokens iniciales
  }
  next();
});

// Comparar contraseñas
userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Crear el modelo
const User = mongoose.model('User', userSchema);
export default User;
