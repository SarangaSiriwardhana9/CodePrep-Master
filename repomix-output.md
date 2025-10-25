
# Directory Structure
```
.gitignore
.repomixignore
backend/package.json
backend/src/app.ts
backend/src/config/constants.ts
backend/src/config/database.ts
backend/src/index.ts
backend/src/modules/auth/controllers/auth.controller.ts
backend/src/modules/auth/middleware/admin.middleware.ts
backend/src/modules/auth/middleware/auth.middleware.ts
backend/src/modules/auth/models/User.model.ts
backend/src/modules/auth/routes/auth.routes.ts
backend/src/modules/auth/types/auth.types.ts
backend/src/modules/auth/utils/password.utils.ts
backend/src/modules/auth/utils/token.utils.ts
backend/src/modules/problem/controllers/problem.controller.ts
backend/src/modules/problem/models/Problem.model.ts
backend/src/modules/problem/routes/problem.routes.ts
backend/src/modules/problem/types/problem.types.ts
backend/src/modules/user/controllers/user.controller.ts
backend/src/modules/user/routes/user.routes.ts
backend/src/modules/user/types/user.types.ts
backend/tsconfig.json
repomix.config.json
SRS.txt
```


## File: backend/src/config/database.ts
````typescript
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
````

## File: backend/src/index.ts
````typescript
import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
````

## File: backend/src/modules/auth/controllers/auth.controller.ts
````typescript
import { Request, Response } from 'express';
import { User } from '../models/User.model';
import {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
} from '../utils/password.utils';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetToken,
  getResetTokenExpiry,
} from '../utils/token.utils';
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  NAME_REGEX,
  LOGIN_ATTEMPT_LIMIT,
  LOGIN_ATTEMPT_WINDOW,
  ACCOUNT_LOCK_TIME,
} from '../../../config/constants';
import { AuthResponse } from '../types/auth.types';

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
````

## File: backend/src/modules/auth/middleware/admin.middleware.ts
````typescript
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { HTTP_STATUS, ERROR_MESSAGES } from '../../../config/constants';

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req;

    if (!userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: ERROR_MESSAGES.NO_TOKEN,
        },
      });
      return;
    }

    const user = await User.findById(userId).select('role');

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

    if (user.role !== 'admin') {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'You do not have permission to perform this action',
        },
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};
````

## File: backend/src/modules/auth/middleware/auth.middleware.ts
````typescript
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.utils';
import { HTTP_STATUS, ERROR_MESSAGES } from '../../../config/constants';

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
````

## File: backend/src/modules/auth/models/User.model.ts
````typescript
import mongoose, { Schema, Document } from 'mongoose';
import { User as IUser } from '../types/auth.types';

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
````

## File: backend/src/modules/auth/routes/auth.routes.ts
````typescript
import express from 'express';
import {
  signup,
  login,
  logout,
  refreshToken,
  getProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', authMiddleware, getProfile);

export default router;
````

## File: backend/src/modules/auth/types/auth.types.ts
````typescript
export interface User {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
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
````

## File: backend/src/modules/auth/utils/password.utils.ts
````typescript
import bcryptjs from 'bcryptjs';
import { PASSWORD_REGEX } from '../../../config/constants';

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
````

## File: backend/src/modules/auth/utils/token.utils.ts
````typescript
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
````

## File: backend/src/modules/problem/controllers/problem.controller.ts
````typescript
import { Request, Response } from 'express';
import { Problem } from '../models/Problem.model';
import { CreateProblemInput, UpdateProblemInput, ProblemFilterQuery } from '../types/problem.types';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../../config/constants';

// FR-PROB-002: Get All Problems with Filtering & Search
export const getAllProblems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { difficulty, concepts, companyTags, search, page = 1, limit = 20, sortBy = 'recent' } = req.query as any;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter: any = {};

    if (difficulty) {
      if (Array.isArray(difficulty)) {
        filter.difficulty = { $in: difficulty };
      } else {
        filter.difficulty = difficulty;
      }
    }

    if (concepts) {
      const conceptArray = Array.isArray(concepts) ? concepts : [concepts];
      filter.concepts = { $in: conceptArray.map((c: string) => c.toLowerCase()) };
    }

    if (companyTags) {
      const tagsArray = Array.isArray(companyTags) ? companyTags : [companyTags];
      filter.companyTags = { $in: tagsArray };
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort query
    let sortQuery: any = {};
    switch (sortBy) {
      case 'acceptance':
        sortQuery = { acceptanceRate: -1 };
        break;
      case 'difficulty':
        sortQuery = { difficulty: 1 };
        break;
      case 'recent':
      default:
        sortQuery = { createdAt: -1 };
    }

    // Execute query
    const total = await Problem.countDocuments(filter);
    const problems = await Problem.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum)
      .select('-testCases -solution.code')
      .lean();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Problems fetched successfully',
      data: {
        problems,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get all problems error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

 
// FR-PROB-003: Get Problem by ID or Slug
export const getProblemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    let problem;

    // Check if it's a valid MongoDB ID or a slug
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      problem = await Problem.findById(id).lean();
    } else {
      // Treat as slug
      problem = await Problem.findOne({ slug: id }).lean();
    }

    if (!problem) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Problem not found',
        },
      });
      return;
    }

    // Hide hidden test cases for non-authenticated users
    if (problem.testCases) {
      problem.testCases = problem.testCases.map((tc: any) => ({
        input: tc.input,
        expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
        isHidden: tc.isHidden,
      }));
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Problem fetched successfully',
      data: { problem },
    });
  } catch (error) {
    console.error('Get problem by ID error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};
// FR-PROB-004: Create Problem (Admin Only)
export const createProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req;
    const problemData: CreateProblemInput = req.body;

    // Validate required fields
    const requiredFields = ['title', 'slug', 'difficulty', 'description', 'concepts', 'constraints', 'examples', 'testCases'];
    const missingFields = requiredFields.filter((field) => !problemData[field as keyof CreateProblemInput]);

    if (missingFields.length > 0) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields',
          details: missingFields,
        },
      });
      return;
    }

    // Check if slug already exists
    const existingProblem = await Problem.findOne({ slug: problemData.slug.toLowerCase() });
    if (existingProblem) {
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: {
          code: 'DUPLICATE_RESOURCE',
          message: 'Problem with this slug already exists',
        },
      });
      return;
    }

    // Create problem
    const newProblem = await Problem.create({
      ...problemData,
      slug: problemData.slug.toLowerCase(),
      concepts: problemData.concepts.map((c) => c.toLowerCase()),
      createdBy: userId,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Problem created successfully',
      data: { problem: newProblem },
    });
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

// FR-PROB-005: Update Problem (Admin Only)
export const updateProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateProblemInput = req.body;

    // Don't allow empty updates
    if (Object.keys(updateData).length === 0) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No fields to update',
        },
      });
      return;
    }

    // Check for duplicate slug if slug is being updated
    if (updateData.slug) {
      const existingProblem = await Problem.findOne({
        slug: updateData.slug.toLowerCase(),
        _id: { $ne: id },
      });

      if (existingProblem) {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          error: {
            code: 'DUPLICATE_RESOURCE',
            message: 'Problem with this slug already exists',
          },
        });
        return;
      }

      updateData.slug = updateData.slug.toLowerCase();
    }

    // Normalize concepts to lowercase
    if (updateData.concepts) {
      updateData.concepts = updateData.concepts.map((c) => c.toLowerCase());
    }

    const updatedProblem = await Problem.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProblem) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Problem not found',
        },
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Problem updated successfully',
      data: { problem: updatedProblem },
    });
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

// FR-PROB-006: Delete Problem (Admin Only)
export const deleteProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedProblem = await Problem.findByIdAndDelete(id);

    if (!deletedProblem) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Problem not found',
        },
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Problem deleted successfully',
      data: { problem: deletedProblem },
    });
  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

// FR-PROB-007: Get Problem Stats
export const getProblemStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalProblems = await Problem.countDocuments();

    const statsByDifficulty = await Problem.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
          avgAcceptance: { $avg: '$acceptanceRate' },
        },
      },
    ]);

    const totalAttempts = await Problem.aggregate([
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: '$totalAttempts' },
          totalSolves: { $sum: '$totalSolves' },
        },
      },
    ]);

    const conceptStats = await Problem.aggregate([
      {
        $unwind: '$concepts',
      },
      {
        $group: {
          _id: '$concepts',
          problemCount: { $sum: 1 },
        },
      },
      {
        $sort: { problemCount: -1 },
      },
      {
        $limit: 20,
      },
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        totalProblems,
        statsByDifficulty,
        overall: totalAttempts[0] || { totalAttempts: 0, totalSolves: 0 },
        topConcepts: conceptStats,
      },
    });
  } catch (error) {
    console.error('Get problem stats error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

// FR-PROB-008: Search Problems
export const searchProblems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Search query is required',
        },
      });
      return;
    }

    const problems = await Problem.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(Math.min(parseInt(limit as string) || 10, 50))
      .select('-testCases -solution.code')
      .lean();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Search results',
      data: { problems, total: problems.length },
    });
  } catch (error) {
    console.error('Search problems error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

// FR-PROB-009: Get Problems by Concept
export const getProblemsByConcept = async (req: Request, res: Response): Promise<void> => {
  try {
    const { concept, difficulty, page = 1, limit = 20 } = req.query;

    if (!concept) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Concept parameter is required',
        },
      });
      return;
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { concepts: (concept as string).toLowerCase() };

    if (difficulty) {
      if (Array.isArray(difficulty)) {
        filter.difficulty = { $in: difficulty };
      } else {
        filter.difficulty = difficulty;
      }
    }

    const total = await Problem.countDocuments(filter);
    const problems = await Problem.find(filter)
      .sort({ difficulty: 1, acceptanceRate: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-testCases -solution.code')
      .lean();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        concept,
        problems,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get problems by concept error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};
````

## File: backend/src/modules/problem/models/Problem.model.ts
````typescript
import mongoose, { Schema, Document } from 'mongoose';
import { IProblem } from '../types/problem.types';

interface ProblemDocument extends Document, IProblem {
  _id: mongoose.Types.ObjectId;
}

const problemSchema = new Schema<ProblemDocument>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a problem title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title must not exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Please provide a slug'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: {
        values: ['Easy', 'Medium', 'Hard'],
        message: 'Difficulty must be Easy, Medium, or Hard',
      },
      required: [true, 'Please specify difficulty level'],
    },
    concepts: [
      {
        type: String,
        lowercase: true,
      },
    ],
    description: {
      type: String,
      required: [true, 'Please provide problem description'],
    },
    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    constraints: [String],
    starterCode: {
      javascript: {
        type: String,
        default: 'function solution() {\n  // Your code here\n}',
      },
      python: {
        type: String,
        default: 'def solution():\n    # Your code here\n    pass',
      },
      java: {
        type: String,
        default: 'class Solution {\n    public void solution() {\n        // Your code here\n    }\n}',
      },
      cpp: {
        type: String,
        default: '#include <iostream>\nusing namespace std;\n\nvoid solution() {\n    // Your code here\n}',
      },
    },
    testCases: [
      {
        input: Schema.Types.Mixed,
        expectedOutput: Schema.Types.Mixed,
        isHidden: {
          type: Boolean,
          default: false,
        },
      },
    ],
    hints: [String],
    solution: {
      approach: String,
      explanation: String,
      timeComplexity: String,
      spaceComplexity: String,
      code: String,
    },
    relatedProblems: [String],
    companyTags: [String],
    acceptanceRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
    totalSolves: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

 
problemSchema.index({ slug: 1 });
problemSchema.index({ difficulty: 1 });
problemSchema.index({ concepts: 1 });
problemSchema.index({ title: 'text', description: 'text' });

export const Problem = mongoose.model<ProblemDocument>('Problem', problemSchema);
````

## File: backend/src/modules/problem/routes/problem.routes.ts
````typescript
import express from 'express';
import {
  getAllProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemStats,
  searchProblems,
  getProblemsByConcept,
} from '../controllers/problem.controller';
import { authMiddleware } from '../../auth/middleware/auth.middleware';
import { adminMiddleware } from '../../auth/middleware/admin.middleware';

const router = express.Router();

// Public routes
router.get('/', getAllProblems);
router.get('/stats', getProblemStats);
router.get('/search', searchProblems);
router.get('/concept/:concept', getProblemsByConcept);
router.get('/:id', getProblemById);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, createProblem);
router.patch('/:id', authMiddleware, adminMiddleware, updateProblem);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProblem);

export default router;
````

## File: backend/src/modules/problem/types/problem.types.ts
````typescript
export interface IProblem {
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  concepts: string[];
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  starterCode: {
    javascript?: string;
    python?: string;
    java?: string;
    cpp?: string;
  };
  testCases: Array<{
    input: any;
    expectedOutput: any;
    isHidden?: boolean;
  }>;
  hints: string[];
  solution: {
    approach?: string;
    explanation?: string;
    timeComplexity?: string;
    spaceComplexity?: string;
    code?: string;
  };
  relatedProblems?: string[];
  companyTags?: string[];
  acceptanceRate?: number;
  totalAttempts?: number;
  totalSolves?: number;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateProblemInput {
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  concepts: string[];
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  starterCode?: {
    javascript?: string;
    python?: string;
    java?: string;
    cpp?: string;
  };
  testCases: Array<{
    input: any;
    expectedOutput: any;
    isHidden?: boolean;
  }>;
  hints?: string[];
  solution?: {
    approach?: string;
    explanation?: string;
    timeComplexity?: string;
    spaceComplexity?: string;
    code?: string;
  };
  relatedProblems?: string[];
  companyTags?: string[];
}

export interface UpdateProblemInput {
  title?: string;
  slug?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  concepts?: string[];
  description?: string;
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints?: string[];
  starterCode?: {
    javascript?: string;
    python?: string;
    java?: string;
    cpp?: string;
  };
  testCases?: Array<{
    input: any;
    expectedOutput: any;
    isHidden?: boolean;
  }>;
  hints?: string[];
  solution?: {
    approach?: string;
    explanation?: string;
    timeComplexity?: string;
    spaceComplexity?: string;
    code?: string;
  };
  relatedProblems?: string[];
  companyTags?: string[];
}

export interface ProblemFilterQuery {
  difficulty?: string;
  concepts?: string[];
  companyTags?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'recent' | 'acceptance' | 'difficulty';
}
````

## File: backend/src/modules/user/controllers/user.controller.ts
````typescript
import { Request, Response } from 'express';
import { User } from '../../auth/models/User.model';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../../config/constants';
import { UpdateUserInput } from '../types/user.types';

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
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
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const updateData: UpdateUserInput = req.body;
    const userId = req.userId;

    if (!updateData.name && !updateData.email) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No fields to update',
        },
      });
      return;
    }

    // Check if email already exists
    if (updateData.email) {
      const existingUser = await User.findOne({
        email: updateData.email.toLowerCase(),
        _id: { $ne: userId },
      });

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

      updateData.email = updateData.email.toLowerCase();
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
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
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        lastLogin: updatedUser.lastLogin,
      },
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const deleteUserAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
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
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete user account error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};
````

## File: backend/src/modules/user/routes/user.routes.ts
````typescript
import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
} from '../controllers/user.controller';
import { authMiddleware } from '../../auth/middleware/auth.middleware';

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);
router.patch('/profile', authMiddleware, updateUserProfile);
router.delete('/account', authMiddleware, deleteUserAccount);

export default router;
````

## File: backend/src/modules/user/types/user.types.ts
````typescript
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  lastLogin?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
}
````
## File: backend/src/config/constants.ts
````typescript
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
````

## File: backend/src/app.ts
````typescript
import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './modules/auth/routes/auth.routes';
import userRoutes from './modules/user/routes/user.routes';
import problemRoutes from './modules/problem/routes/problem.routes';

dotenv.config();

const app: Express = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(cookieParser());

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/problems', problemRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

export default app;
````
