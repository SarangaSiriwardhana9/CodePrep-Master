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
