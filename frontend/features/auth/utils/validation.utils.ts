import { VALIDATION_PATTERNS, VALIDATION_MESSAGES } from '@/shared/constants/validation.constants';

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: VALIDATION_MESSAGES.REQUIRED_FIELD };
  }
  
  if (!VALIDATION_PATTERNS.EMAIL.test(email)) {
    return { isValid: false, error: VALIDATION_MESSAGES.INVALID_EMAIL };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: VALIDATION_MESSAGES.REQUIRED_FIELD };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: VALIDATION_MESSAGES.PASSWORD_SHORT };
  }
  
  if (!VALIDATION_PATTERNS.PASSWORD.test(password)) {
    return { isValid: false, error: VALIDATION_MESSAGES.PASSWORD_WEAK };
  }
  
  return { isValid: true };
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): { isValid: boolean; error?: string } => {
  if (password !== confirmPassword) {
    return { isValid: false, error: VALIDATION_MESSAGES.PASSWORDS_NOT_MATCH };
  }
  
  return { isValid: true };
};

export const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (!name) {
    return { isValid: false, error: VALIDATION_MESSAGES.REQUIRED_FIELD };
  }
  
  if (!VALIDATION_PATTERNS.NAME.test(name)) {
    return { isValid: false, error: VALIDATION_MESSAGES.INVALID_NAME };
  }
  
  if (name.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (name.length > 50) {
    return { isValid: false, error: 'Name must not exceed 50 characters' };
  }
  
  return { isValid: true };
};

export const validateSignupForm = (data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  const nameValidation = validateName(data.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error!;
  }
  
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error!;
  }
  
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error!;
  }
  
  const passwordMatchValidation = validatePasswordMatch(data.password, data.confirmPassword);
  if (!passwordMatchValidation.isValid) {
    errors.confirmPassword = passwordMatchValidation.error!;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateLoginForm = (data: {
  email: string;
  password: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error!;
  }
  
  if (!data.password) {
    errors.password = VALIDATION_MESSAGES.REQUIRED_FIELD;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
