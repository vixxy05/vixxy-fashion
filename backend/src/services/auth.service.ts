import bcrypt from 'bcrypt';
import { AuthRepository } from '../repositories/auth.repository';
import { RegisterDTO, LoginDTO } from '../dtos/auth.dto';
import { validateRegisterDTO, validateLoginDTO, ValidationError } from '../utils/validators';
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '../utils/errors';
import { JwtService, JwtPayload } from './jwt.service';
import { auditLogService } from './auditLog.service';
import { RefreshToken, User } from '@prisma/client';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  tokens: AuthTokens;
  user: any;
}

export interface UpdateProfileDTO {
  fullName?: string;
  phone?: string;
  avatar?: string;
  birthday?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: string;
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

export class AuthService {
  private authRepository: AuthRepository;
  private jwtService: JwtService;

  constructor() {
    this.authRepository = new AuthRepository();
    this.jwtService = new JwtService();
  }

  async register(
    dto: RegisterDTO,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResponse> {
    const validationErrors: ValidationError[] = validateRegisterDTO(dto);
    if (validationErrors.length > 0) {
      throw new BadRequestError('Validation failed', validationErrors);
    }

    const existingUser = await this.authRepository.findUserByEmail(dto.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    await this.authRepository.createUser({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      phone: dto.phone,
    });

    const userWithRole = await this.authRepository.findUserByEmail(dto.email);
    if (!userWithRole) throw new NotFoundError('User not found');

    await this.authRepository.createLoginHistory({
      userId: userWithRole.id,
      ipAddress,
      deviceInfo: userAgent,
      browserInfo: userAgent,
      success: true,
    });

    await auditLogService.log({
      userId: userWithRole.id,
      action: 'USER_REGISTER',
      resource: 'User',
      resourceId: userWithRole.id,
      newValue: { email: userWithRole.email, fullName: userWithRole.fullName },
      ipAddress,
      userAgent,
    });

    await this.authRepository.updateLastLogin(userWithRole.id);

    const tokens = await this.generateTokens(userWithRole.id, userWithRole.email, 'CUSTOMER');

    return {
      tokens,
      user: this.formatUser(userWithRole),
    };
  }

  async login(
    dto: LoginDTO,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResponse> {
    const validationErrors: ValidationError[] = validateLoginDTO(dto);
    if (validationErrors.length > 0) {
      throw new BadRequestError('Validation failed', validationErrors);
    }

    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user) {
      await this.authRepository.createLoginHistory({
        ipAddress,
        deviceInfo: userAgent,
        browserInfo: userAgent,
        success: false,
        failureReason: 'User not found',
      });
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.status === 'inactive') {
      throw new UnauthorizedError('Account is inactive');
    }
    if (user.status === 'banned') {
      throw new UnauthorizedError('Account is banned');
    }

    if (await this.isAccountLocked(user)) {
      await this.authRepository.createLoginHistory({
        userId: user.id,
        ipAddress,
        deviceInfo: userAgent,
        browserInfo: userAgent,
        success: false,
        failureReason: 'Account locked',
      });
      const lockoutEnd = user.lockoutExpiresAt?.toLocaleString();
      throw new UnauthorizedError(`Account locked. Try again after ${lockoutEnd}`);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      await this.authRepository.createLoginHistory({
        userId: user.id,
        ipAddress,
        deviceInfo: userAgent,
        browserInfo: userAgent,
        success: false,
        failureReason: 'Invalid password',
      });

      const updatedUser = await this.authRepository.incrementFailedAttempts(user.id);
      
      if (updatedUser.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        await this.lockAccount(user.id);
        await auditLogService.log({
          userId: user.id,
          action: 'ACCOUNT_LOCKED',
          resource: 'User',
          resourceId: user.id,
          oldValue: { failedAttempts: updatedUser.failedLoginAttempts - 1 },
          newValue: { failedAttempts: updatedUser.failedLoginAttempts, locked: true },
          ipAddress,
          userAgent,
        });
        const lockoutEnd = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60000).toLocaleString();
        throw new UnauthorizedError(`Too many failed attempts. Account locked until ${lockoutEnd}`);
      }

      throw new UnauthorizedError('Invalid credentials');
    }

    await this.authRepository.resetFailedAttempts(user.id);

    await this.authRepository.createLoginHistory({
      userId: user.id,
      ipAddress,
      deviceInfo: userAgent,
      browserInfo: userAgent,
      success: true,
    });

    await auditLogService.log({
      userId: user.id,
      action: 'USER_LOGIN',
      resource: 'User',
      resourceId: user.id,
      ipAddress,
      userAgent,
    });

    await this.authRepository.updateLastLogin(user.id);

    const userRole = user.userRoles.length > 0 ? user.userRoles[0].role.roleName : 'CUSTOMER';
    const tokens = await this.generateTokens(user.id, user.email, userRole);

    return {
      tokens,
      user: this.formatUser(user),
    };
  }

  async logout(refreshToken: string, userId?: number, ipAddress?: string, userAgent?: string): Promise<void> {
    if (refreshToken) {
      try {
        await this.authRepository.revokeRefreshToken(refreshToken);
        if (userId) {
          await auditLogService.log({
            userId,
            action: 'USER_LOGOUT',
            resource: 'User',
            resourceId: userId,
            ipAddress,
            userAgent,
          });
        }
      } catch (error) {
        // Ignore if token doesn't exist
      }
    }
  }

  async logoutAllDevices(userId: number, ipAddress?: string, userAgent?: string): Promise<{ revokedCount: number }> {
    const result = await this.authRepository.revokeAllUserTokens(userId);
    await auditLogService.log({
      userId,
      action: 'LOGOUT_ALL_DEVICES',
      resource: 'User',
      resourceId: userId,
      ipAddress,
      userAgent,
    });
    return { revokedCount: result.count };
  }

  async revokeToken(token: string, userId?: number): Promise<RefreshToken> {
    const tokenRecord = await this.authRepository.findRefreshToken(token);
    if (!tokenRecord) {
      throw new NotFoundError('Token not found');
    }

    if (userId && tokenRecord.userId !== userId) {
      throw new UnauthorizedError('Cannot revoke token that does not belong to you');
    }

    return this.authRepository.revokeRefreshToken(token);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verifyRefreshToken(refreshToken);
      const tokenRecord = await this.authRepository.findRefreshToken(refreshToken);
      if (!tokenRecord) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      await this.authRepository.revokeRefreshToken(refreshToken);
      const user = await this.authRepository.getUserById(payload.userId);
      if (!user || user.status !== 'active') {
        throw new UnauthorizedError('User not found or inactive');
      }

      if (await this.isAccountLocked(user)) {
        throw new UnauthorizedError('Account is locked');
      }

      const userRole = user.userRoles.length > 0 ? user.userRoles[0].role.roleName : 'CUSTOMER';
      const newTokens = await this.generateTokens(user.id, user.email, userRole);

      return newTokens;
    } catch (error) {
      if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }
      throw error;
    }
  }

  async getUserActiveTokens(userId: number): Promise<RefreshToken[]> {
    return this.authRepository.getUserActiveTokens(userId);
  }

  async getProfile(userId: number) {
    const user = await this.authRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      user: this.formatUser(user),
    };
  }

  async updateProfile(userId: number, data: UpdateProfileDTO, ipAddress?: string, userAgent?: string) {
    const oldUser = await this.authRepository.getUserById(userId);
    if (!oldUser) {
      throw new NotFoundError('User not found');
    }
    
    const updatedUser = await this.authRepository.updateUser(userId, data);

    await auditLogService.log({
      userId,
      action: 'PROFILE_UPDATE',
      resource: 'User',
      resourceId: userId,
      oldValue: {
        fullName: oldUser.fullName,
        phone: oldUser.phone,
        avatar: oldUser.avatar,
        birthday: oldUser.birthday,
        gender: oldUser.gender,
        address: oldUser.address,
      },
      newValue: {
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        birthday: updatedUser.birthday,
        gender: updatedUser.gender,
        address: updatedUser.address,
      },
      ipAddress,
      userAgent,
    });

    return {
      user: this.formatUser(updatedUser),
    };
  }

  private formatUser(user: any) {
    const role = user.userRoles.length > 0 ? user.userRoles[0].role : { id: 0, roleName: 'CUSTOMER' };
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar,
      birthday: user.birthday?.toISOString(),
      gender: user.gender,
      address: user.address,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      lastLoginAt: user.lastLoginAt?.toISOString(),
      roleId: role.id,
      role: {
        id: role.id,
        roleName: role.roleName,
        description: role.description,
      },
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  private async isAccountLocked(user: User): Promise<boolean> {
    if (!user.lockoutExpiresAt) return false;
    return new Date() < user.lockoutExpiresAt;
  }

  private async lockAccount(userId: number): Promise<User> {
    return this.authRepository.lockAccount(userId, LOCKOUT_DURATION_MINUTES);
  }

  private async generateTokens(
    userId: number,
    email: string,
    roleName: string
  ): Promise<AuthTokens> {
    const payload: JwtPayload = {
      userId,
      email,
      roleName,
    };

    const accessToken = this.jwtService.generateAccessToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);
    const expiresInMs = 7 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + expiresInMs);

    await this.authRepository.createRefreshToken({
      userId,
      token: refreshToken,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
