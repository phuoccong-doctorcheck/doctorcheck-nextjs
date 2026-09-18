import 'server-only';
import { auditRepository, type AuditLogRow, type AuditLogListOptions, type AuditLogListResult } from '@/repositories';
import { Permission, hasPermission } from '@/lib/auth/rbac';
import type { UserWithRoles } from './auth.service';

export class AuditAdminService {
  /**
   * Lists audit logs with bounded server pagination and filtering.
   * Strictly read-only.
   */
  async listAuditLogs(options: AuditLogListOptions, actor: UserWithRoles): Promise<AuditLogListResult> {
    if (!hasPermission(actor.roles, actor.permissions, Permission.AUDIT_READ)) {
      throw new Error('Bạn không có quyền truy cập nhật ký kiểm toán (Audit Logs).');
    }

    return await auditRepository.listAuditLogs(options);
  }

  /**
   * Retrieves single audit log record by ID.
   */
  async getAuditLogDetail(id: string, actor: UserWithRoles): Promise<AuditLogRow> {
    if (!hasPermission(actor.roles, actor.permissions, Permission.AUDIT_READ)) {
      throw new Error('Bạn không có quyền xem chi tiết nhật ký kiểm toán.');
    }

    const log = await auditRepository.getById(id);
    if (!log) {
      throw new Error(`Không tìm thấy bản ghi kiểm toán với ID: ${id}`);
    }

    return log;
  }

  /**
   * Retrieves recent audit logs for a specific entity.
   */
  async getRecentByEntity(entityType: string, entityId: string, limit: number, actor: UserWithRoles): Promise<AuditLogRow[]> {
    if (!hasPermission(actor.roles, actor.permissions, Permission.AUDIT_READ)) {
      throw new Error('Bạn không có quyền xem nhật ký kiểm toán của thực thể.');
    }

    return await auditRepository.getRecentByEntity(entityType, entityId, limit);
  }
}

export const auditAdminService = new AuditAdminService();
