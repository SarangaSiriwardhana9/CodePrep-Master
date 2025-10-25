import mongoose, { Schema, Document } from 'mongoose';
import { User as IUser } from '../types/index';

interface UserDocument extends Document, IUser {
  _id: mongoose.Types.ObjectId;
  loginAttempts: number;
  lastLoginAttempt: Date | null;
  lockedUntil: Date | null;
  lastLogin: Date | null;
  resetTokenExpiry: Date | null;
  resetToken: string | null;
  role?: 'user' | 'admin';
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must not exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lastLoginAttempt: {
      type: Date,
      default: null,
      select: false,
    },
    lockedUntil: {
      type: Date,
      default: null,
      select: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    resetToken: {
      type: String,
      select: false,
    },
    resetTokenExpiry: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<UserDocument>('User', userSchema);