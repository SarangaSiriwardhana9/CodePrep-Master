This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
.gitignore
.repomixignore
backend/package.json
backend/src/app.ts
backend/src/config/constants.ts
backend/src/config/database.ts
backend/src/controllers/authController.ts
backend/src/index.ts
backend/src/middleware/authMiddleware.ts
backend/src/models/User.ts
backend/src/routes/authRoutes.ts
backend/src/types/index.ts
backend/src/utils/passwordUtils.ts
backend/src/utils/tokenUtils.ts
backend/tsconfig.json
repomix.config.json
```

# Files

## File: .repomixignore
```
# Add patterns to ignore here, one per line
# Example:
# *.log
# tmp/
```

## File: repomix.config.json
```json
{
  "$schema": "https://repomix.com/schemas/latest/schema.json",
  "input": {
    "maxFileSize": 52428800
  },
  "output": {
    "filePath": "repomix-output.md",
    "style": "markdown",
    "parsableStyle": false,
    "fileSummary": true,
    "directoryStructure": true,
    "files": true,
    "removeComments": false,
    "removeEmptyLines": false,
    "compress": false,
    "topFilesLength": 5,
    "showLineNumbers": false,
    "copyToClipboard": false,
    "git": {
      "sortByChanges": true,
      "sortByChangesMaxCommits": 100,
      "includeDiffs": false
    }
  },
  "include": [],
  "ignore": {
    "useGitignore": true,
    "useDefaultPatterns": true,
    "customPatterns": []
  },
  "security": {
    "enableSecurityCheck": true
  },
  "tokenCount": {
    "encoding": "o200k_base"
  }
}
```

## File: .gitignore
```
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Build outputs
dist/
build/
*.tsbuildinfo

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
logs/
*.log

# Testing
coverage/
.nyc_output/

# Temporary files
*.tmp
*.temp
.cache/
```

## File: backend/package.json
```json
{
  "name": "backend",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.19.2"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cookie-parser": "^1.4.10",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.4",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^24.9.1",
    "nodemon": "^3.1.10",
    "ts-node": "^10.9.2",
    "typescript": "^5.9.3"
  }
}
```

## File: backend/src/app.ts
```typescript
import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(cookieParser());

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

export default app;
```

## File: backend/src/config/constants.ts
```typescript
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
```

## File: backend/src/config/database.ts
```typescript
import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/codeprep';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error);
    process.exit(1);
  }
};
```

## File: backend/src/controllers/authController.ts
```typescript
import { Request, Response } from 'express';
import { User } from '../models/User';
import {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
} from '../utils/passwordUtils';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetToken,
  getResetTokenExpiry,
} from '../utils/tokenUtils';
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  NAME_REGEX,
  LOGIN_ATTEMPT_LIMIT,
  LOGIN_ATTEMPT_WINDOW,
  ACCOUNT_LOCK_TIME,
} from '../config/constants';
import { AuthResponse } from '../types/index';

const setCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,  
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,  
  });
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, confirmPassword } = req.body;

 
    if (!name || !email || !password || !confirmPassword) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide all required fields',
          details: ['name', 'email', 'password', 'confirmPassword'],
        },
      });
      return;
    }

    // Name validation
    if (!NAME_REGEX.test(name)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: ERROR_MESSAGES.INVALID_NAME,
        },
      });
      return;
    }

    // Email validation (basic)
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: ERROR_MESSAGES.INVALID_EMAIL,
        },
      });
      return;
    }

    // Password match
    if (password !== confirmPassword) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: ERROR_MESSAGES.PASSWORDS_NOT_MATCH,
        },
      });
      return;
    }

    // Password strength
    if (!validatePasswordStrength(password)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: ERROR_MESSAGES.PASSWORD_WEAK,
        },
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: {
          code: 'DUPLICATE_RESOURCE',
          message: ERROR_MESSAGES.EMAIL_EXISTS,
        },
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
    });
    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
    });

    // Set cookies
    setCookies(res, accessToken, refreshToken);

    const response: AuthResponse = {
      success: true,
      message: SUCCESS_MESSAGES.SIGNUP_SUCCESS,
      token: accessToken,
      refreshToken,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    };

    res.status(HTTP_STATUS.CREATED).json(response);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    // Validation
    if (!email || !password) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide email and password',
        },
      });
      return;
    }

    // Find user with password and login attempt fields
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password +loginAttempts +lastLoginAttempt +lockedUntil'
    );

    if (!user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: ERROR_MESSAGES.INVALID_CREDENTIALS,
        },
      });
      return;
    }

    // Check if account is locked
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      res.status(HTTP_STATUS.LOCKED).json({
        success: false,
        error: {
          code: 'ACCOUNT_LOCKED',
          message: ERROR_MESSAGES.ACCOUNT_LOCKED,
        },
      });
      return;
    }

    // Reset lock if lock time has expired
    if (user.lockedUntil && new Date() >= user.lockedUntil) {
      user.lockedUntil = null;
      user.loginAttempts = 0;
      await user.save();
    }

    // Compare password
    const isPasswordMatch = await comparePassword(password, user.password);

    if (!isPasswordMatch) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      user.lastLoginAttempt = new Date();

      // Lock account if exceeded attempts
      if (user.loginAttempts >= LOGIN_ATTEMPT_LIMIT) {
        user.lockedUntil = new Date(Date.now() + ACCOUNT_LOCK_TIME);
      }

      await user.save();

      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: ERROR_MESSAGES.INVALID_CREDENTIALS,
        },
      });
      return;
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lastLoginAttempt = null;
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
    });
    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
    });

    // Set cookies
    setCookies(res, accessToken, refreshToken);

    const response: AuthResponse = {
      success: true,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      token: accessToken,
      refreshToken,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    };

    res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshTokenFromCookie = req.cookies.refreshToken;

    if (!refreshTokenFromCookie) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: ERROR_MESSAGES.NO_TOKEN,
        },
      });
      return;
    }

    const decoded = verifyRefreshToken(refreshTokenFromCookie);

    if (!decoded) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: ERROR_MESSAGES.TOKEN_EXPIRED,
        },
      });
      return;
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: ERROR_MESSAGES.USER_NOT_FOUND,
        },
      });
      return;
    }

    const newAccessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
    });
    const newRefreshToken = generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
    });

    // Set cookies
    setCookies(res, newAccessToken, newRefreshToken);

    const response: AuthResponse = {
      success: true,
      message: SUCCESS_MESSAGES.TOKEN_REFRESHED,
      token: newAccessToken,
      refreshToken: newRefreshToken,
    };

    res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide an email',
        },
      });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+resetToken +resetTokenExpiry'
    );

    // Return same message whether email exists or not (security)
    if (!user) {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_RESET_SENT,
      });
      return;
    }

    const resetToken = generateResetToken();
    const resetTokenExpiry = getResetTokenExpiry();

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // TODO: Send email with reset link
    // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    // await sendResetEmail(user.email, resetLink);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_RESET_SENT,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide token and new password',
        },
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: ERROR_MESSAGES.PASSWORDS_NOT_MATCH,
        },
      });
      return;
    }

    if (!validatePasswordStrength(newPassword)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: ERROR_MESSAGES.PASSWORD_WEAK,
        },
      });
      return;
    }

    const user = await User.findOne({
      resetToken: token,
    })
      .select('+resetToken +resetTokenExpiry +password')
      .exec();

    if (!user || !user.resetTokenExpiry) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: ERROR_MESSAGES.RESET_TOKEN_EXPIRED,
        },
      });
      return;
    }

    // Check if token is expired
    if (new Date() > user.resetTokenExpiry) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: ERROR_MESSAGES.RESET_TOKEN_EXPIRED,
        },
      });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    user.loginAttempts = 0;
    user.lockedUntil = null;
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: ERROR_MESSAGES.USER_NOT_FOUND,
        },
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.PROFILE_FETCHED,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};
```

## File: backend/src/index.ts
```typescript
import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

## File: backend/src/middleware/authMiddleware.ts
```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokenUtils';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: ERROR_MESSAGES.NO_TOKEN,
        },
      });
      return;
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: ERROR_MESSAGES.INVALID_TOKEN,
        },
      });
      return;
    }

    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};
```

## File: backend/src/models/User.ts
```typescript
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
```

## File: backend/src/routes/authRoutes.ts
```typescript
import express from 'express';
import {
  signup,
  login,
  logout,
  refreshToken,
  getProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', authMiddleware, getProfile);

export default router;
```

## File: backend/src/types/index.ts
```typescript
export interface User {
  name: string;
  email: string;
  password: string;
  loginAttempts?: number;
  lastLoginAttempt?: Date | null;
  lockedUntil?: Date | null;
  lastLogin?: Date | null;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JwtPayload {
  id: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  user?: Omit<User, 'password' | 'resetToken' | 'resetTokenExpiry'> & { _id?: string };
}
```

## File: backend/src/utils/passwordUtils.ts
```typescript
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
```

## File: backend/src/utils/tokenUtils.ts
```typescript
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JwtPayload } from '../types/index';

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
```

## File: backend/tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```
