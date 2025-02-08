import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  email: string;
  password: string;
  name: string;
  credit: number;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email gereklidir'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Şifre gereklidir'],
    minlength: 6,
    select: false,
  },
  name: {
    type: String,
    required: [true, 'İsim gereklidir'],
    trim: true,
  },
  credit: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Şifre hashleme
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Şifre hashleme hatası:', error);
    next(error as Error);
  }
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    const user = await User.findById(this._id).select('+password');
    if (!user?.password) return false;
    return await bcrypt.compare(candidatePassword, user.password);
  } catch (error) {
    console.error('Şifre karşılaştırma hatası:', error);
    return false;
  }
};

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User; 