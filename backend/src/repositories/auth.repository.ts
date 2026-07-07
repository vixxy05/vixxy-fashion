
import prisma from '../lib/prisma';
import { Role, User, RefreshToken } from '@prisma/client';

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User & { userRoles: { role: Role }[] } | null> {
    return prisma.user.findUnique({
      where: { email },
      include: { userRoles: { include: { role: true } } },
    });
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    phone?: string;
  }): Promise<User> {
    const customerRole = await prisma.role.findUnique({
      where: { roleName: 'CUSTOMER' },
    });

    if (!customerRole) {
      throw new Error('Customer role not found');
    }

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          fullName: data.fullName,
          phone: data.phone,
        },
      });

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: customerRole.id,
        },
      });

      return user;
    });
  }

  async updateUser(
    userId: number,
    data: {
      fullName?: string;
      phone?: string;
      avatar?: string;
      birthday?: Date;
      gender?: 'male' | 'female' | 'other';
      address?: string;
    }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data,
      include: { userRoles: { include: { role: true } } },
    });
  }

  async incrementFailedAttempts(userId: number): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: { increment: 1 } },
    });
  }

  async resetFailedAttempts(userId: number): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: 0, lockedAt: null, lockoutExpiresAt: null },
    });
  }

  async lockAccount(userId: number, durationMinutes: number): Promise<User> {
    const lockoutExpiresAt = new Date(Date.now() + durationMinutes * 60000);
    return prisma.user.update({
      where: { id: userId },
      data: {
        lockedAt: new Date(),
        lockoutExpiresAt,
      },
    });
  }

  async getUserById(userId: number) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });
  }

  async createRefreshToken(data: {
    userId: number;
    token: string;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({ data });
  }

  async revokeRefreshToken(token: string) {
    return prisma.refreshToken.update({
      where: { token },
      data: { revoked: true },
    });
  }

  async revokeAllUserTokens(userId: number) {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findFirst({
      where: {
        token,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      include: { 
        user: { 
          include: { 
            userRoles: { 
              include: { 
                role: true 
              } 
            } 
          } 
        } 
      },
    });
  }

  async updateLastLogin(userId: number) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async createLoginHistory(data: {
    userId?: number;
    ipAddress?: string;
    deviceInfo?: string;
    browserInfo?: string;
    success: boolean;
    failureReason?: string;
  }) {
    return prisma.loginHistory.create({ data });
  }

  async getUserActiveTokens(userId: number) {
    return prisma.refreshToken.findMany({
      where: { userId, revoked: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
