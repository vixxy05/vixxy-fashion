
import prisma from '../lib/prisma';

export interface CreateAuditLogParams {
  userId?: number;
  action: string;
  resource?: string;
  resourceId?: number;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogRepository {
  async createLog(params: CreateAuditLogParams) {
    const { userId, action, resource, resourceId, oldValue, newValue, ipAddress, userAgent } = params;
    return prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        ipAddress,
        userAgent,
      },
    });
  }

  async getLogsByUserId(userId: number, limit: number = 100) {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getLogsByAction(action: string, limit: number = 100) {
    return prisma.auditLog.findMany({
      where: { action },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
