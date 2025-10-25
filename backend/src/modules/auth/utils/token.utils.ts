import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JwtPayload } from '../types/auth.types';

const JWT_SECRET = (process.env.JWT_SECRET || 'jwt_secret_key') as string;
const REFRESH_TOKEN_SECRET = (process.env.REFRESH_TOKEN_SECRET ||
  'refresh_token_secret_key') as string;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || '30d';

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE as any });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRE as any,
  });
};

export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const getResetTokenExpiry = (): Date => {
  return new Date(Date.now() + 60 * 60 * 1000); // 1 hour
};
