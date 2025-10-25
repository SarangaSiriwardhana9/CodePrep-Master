 
import bcryptjs from 'bcryptjs';
import { PASSWORD_REGEX } from '../config/constants';

const SALT_ROUNDS = 10;

export const validatePasswordStrength = (password: string): boolean => {
  return PASSWORD_REGEX.test(password);
};

export const hashPassword = async (password: string): Promise<string> => {
  try {
    const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    throw new Error('Error hashing password');
  }
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    const isMatch = await bcryptjs.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error('Error comparing password');
  }
};