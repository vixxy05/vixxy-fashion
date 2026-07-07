
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/jwt.service';
import { UnauthorizedError } from '../utils/errors';
import prisma from '../lib/prisma';
import { RoleRepository } from '../repositories/role.repository';
import { Permission } from '@prisma/client';

const jwtService = new JwtService();
const roleRepository = new RoleRepository();

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        roleName: string;
        roles: string[];
        permissions: string[];
      };
    }
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authorization header is missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    const payload = jwtService.verifyAccessToken(token);

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Check account status
    if (user.status === 'inactive' || user.status === 'banned') {
      throw new UnauthorizedError('Account is not active');
    }

    // Get user roles
    const userRoles = user.userRoles.map(ur => ur.role.roleName);
    const primaryRole = userRoles.length > 0 ? userRoles[0] : 'CUSTOMER';

    // Get user permissions
    const userPermissions = await roleRepository.getUserPermissions(user.id);
    const permissionCodes = userPermissions.map(p => p.permissionCode);

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      roleName: primaryRole,
      roles: userRoles,
      permissions: permissionCodes,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const hasRequiredRole = req.user.roles.some(role => allowedRoles.includes(role));
    if (!hasRequiredRole) {
      throw new UnauthorizedError('Insufficient permissions');
    }

    next();
  };
};

export const requirePermission = (...requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const hasRequiredPermission = requiredPermissions.some(perm =>
      req.user?.permissions?.includes(perm)
    );

    if (!hasRequiredPermission) {
      throw new UnauthorizedError('Insufficient permissions');
    }

    next();
  };
};
