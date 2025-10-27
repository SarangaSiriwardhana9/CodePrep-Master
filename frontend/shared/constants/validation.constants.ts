export const VALIDATION_PATTERNS = {
  EMAIL: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  NAME: /^[a-zA-Z\s'-]+$/,
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Invalid email format',
  EMAIL_EXISTS: 'Email already exists',
  INVALID_NAME: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  PASSWORD_WEAK: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number',
  PASSWORD_SHORT: 'Password must be at least 8 characters',
  PASSWORDS_NOT_MATCH: 'Passwords do not match',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Account locked due to multiple failed login attempts. Try again after 30 minutes',
  TOKEN_EXPIRED: 'Token expired',
  INVALID_TOKEN: 'Invalid token',
  NO_TOKEN: 'No token provided',
  UNAUTHORIZED: 'Unauthorized access',
  SERVER_ERROR: 'Internal server error',
  RESET_TOKEN_EXPIRED: 'Password reset token expired or invalid',
} as const;

export const SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: 'User registered successfully',
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  PROFILE_FETCHED: 'Profile fetched successfully',
  PASSWORD_RESET_SENT: 'Password reset email sent',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  ACCOUNT_DELETED: 'Account deleted successfully',
} as const;

export const VALIDATION_LIMITS = {
  LOGIN_ATTEMPT_LIMIT: 5,
  LOGIN_ATTEMPT_WINDOW: 15 * 60 * 1000, // 15 minutes
  ACCOUNT_LOCK_TIME: 30 * 60 * 1000, // 30 minutes
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const;
