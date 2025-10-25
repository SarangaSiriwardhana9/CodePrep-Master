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
