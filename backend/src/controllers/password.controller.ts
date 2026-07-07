import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import { validateForgotPasswordDto, validateResetPasswordDto } from '../utils/validators';
import { ForgotPasswordDto, ResetPasswordDto } from '../dtos/password.dto';
import { resetTokenService } from '../services/resetToken.service';
import { emailService } from '../services/email.service';
import { successResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

/**
 * Forgot Password - Send reset link to email
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const data: ForgotPasswordDto = req.body;

    // Validate input
    const validationErrors = validateForgotPasswordDto(data);
    if (validationErrors.length > 0) {
      throw new BadRequestError('Validation failed', validationErrors);
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // Even if user doesn't exist, we still return success to prevent email enumeration attacks
    if (!user) {
      return successResponse(
        res,
        null,
        'Nếu email đã được đăng ký, bạn sẽ nhận được liên kết đặt lại mật khẩu'
      );
    }

    // Revoke all existing reset tokens for this user
    await resetTokenService.revokeAllUserTokens(user.id);

    // Generate new reset token
    const resetToken = await resetTokenService.generateResetToken(user.id);

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, user.fullName, resetToken);

    return successResponse(
      res,
      null,
      'Nếu email đã được đăng ký, bạn sẽ nhận được liên kết đặt lại mật khẩu'
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

/**
 * Reset Password - Use token to set new password
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const data: ResetPasswordDto = req.body;

    // Validate input
    const validationErrors = validateResetPasswordDto(data);
    if (validationErrors.length > 0) {
      throw new BadRequestError('Validation failed', validationErrors);
    }

    // Validate token
    const validation = await resetTokenService.validateResetToken(data.token);
    if (!validation.valid) {
      throw new BadRequestError(validation.error!);
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Update user password
    await prisma.user.update({
      where: { id: validation.userId },
      data: { passwordHash },
    });

    // Mark token as used
    await resetTokenService.markTokenAsUsed(validation.resetToken.id);

    return successResponse(res, null, 'Đặt lại mật khẩu thành công!');
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};
