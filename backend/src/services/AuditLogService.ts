import db from "../models";

export default class AuditLogService {
  static async createLog(
    userId: number | null,
    action: string,
    entityType?: string,
    entityId?: number,
    oldData?: any,
    newData?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await db.AuditLog.create({
        userId,
        action,
        entityType,
        entityId,
        oldData: oldData ? JSON.stringify(oldData) : null,
        newData: newData ? JSON.stringify(newData) : null,
        ipAddress,
        userAgent,
      });
    } catch (error) {
      console.error("Failed to create audit log:", error);
    }
  }
}
