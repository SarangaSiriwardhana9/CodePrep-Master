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
