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
