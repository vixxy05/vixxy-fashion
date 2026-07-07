
import { AuditLogRepository, CreateAuditLogParams } from '../repositories/auditLog.repository';

export class AuditLogService {
  private auditLogRepo: AuditLogRepository;

  constructor() {
    this.auditLogRepo = new AuditLogRepository();
  }

  async log(params: CreateAuditLogParams) {
    return this.auditLogRepo.createLog(params);
  }

  async getUserLogs(userId: number, limit: number = 100) {
    return this.auditLogRepo.getLogsByUserId(userId, limit);
  }
}

// Create a singleton instance for easy use
export const auditLogService = new AuditLogService();
