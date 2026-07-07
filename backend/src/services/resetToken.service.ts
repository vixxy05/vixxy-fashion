import prisma from '../lib/prisma';
import crypto from 'crypto';

const RESET_TOKEN_EXPIRY_HOURS = 1;

export class ResetTokenService {
  /**
   * Generate a reset token for a user
   */
  async generateResetToken(userId: number): Promise<string> {
    // Generate a random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Create the token in database
    await prisma.resetToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return token;
  }

  /**
   * Validate a reset token
   */
  async validateResetToken(token: string) {
    const resetToken = await prisma.resetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return { valid: false, error: 'Token not found' };
    }

    if (resetToken.used) {
      return { valid: false, error: 'Token has already been used' };
    }

    if (new Date() > resetToken.expiresAt) {
      return { valid: false, error: 'Token has expired' };
    }

    return { valid: true, userId: resetToken.userId, resetToken };
  }

  /**
   * Mark a token as used
   */
  async markTokenAsUsed(tokenId: number): Promise<void> {
    await prisma.resetToken.update({
      where: { id: tokenId },
      data: { used: true },
    });
  }

  /**
   * Revoke all tokens for a user (optional)
   */
  async revokeAllUserTokens(userId: number): Promise<void> {
    await prisma.resetToken.updateMany({
      where: { userId, used: false },
      data: { used: true },
    });
  }
}

export const resetTokenService = new ResetTokenService();
