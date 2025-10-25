 
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

export const ERROR_MESSAGES = {
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
  RESET_TOKEN_SENT: 'Password reset email sent successfully',
};

export const SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: 'User registered successfully',
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  PROFILE_FETCHED: 'Profile fetched successfully',
  PASSWORD_RESET_SENT: 'Password reset email sent',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully',
};

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
export const NAME_REGEX = /^[a-zA-Z\s'-]+$/;
export const LOGIN_ATTEMPT_LIMIT = 5;
export const LOGIN_ATTEMPT_WINDOW = 15 * 60 * 1000;  
export const ACCOUNT_LOCK_TIME = 30 * 60 * 1000;  