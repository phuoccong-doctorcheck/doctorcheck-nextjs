'use server';

import { getCurrentUser } from '@/services/auth.service';
import { auditAdminService } from '@/services/audit-admin.service';
import type {
  AuditLogRow,
  AuditLogListOptions,
  AuditLogListResult,
} from '@/repositories/contracts/audit.repository';

/**
 * Lists audit log entries with bounded server pagination and filtering.
 */
export async function listAuditLogsAction(
  options: AuditLogListOptions = {}
): Promise<{ success: boolean; data?: AuditLogListResult; error?: string }> {
  const actor = await getCurrentUser();
  if (!actor) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  try {
    const data = await auditAdminService.listAuditLogs(options, actor);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Fetches single audit log entry by ID.
 */
export async function getAuditLogDetailAction(
  id: string
): Promise<{ success: boolean; data?: AuditLogRow; error?: string }> {
  const actor = await getCurrentUser();
  if (!actor) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  try {
    const data = await auditAdminService.getAuditLogDetail(id, actor);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Fetches recent audit logs for a specific entity.
 */
export async function getRecentAuditLogsByEntityAction(
  entityType: string,
  entityId: string,
  limit = 10
): Promise<{ success: boolean; data?: AuditLogRow[]; error?: string }> {
  const actor = await getCurrentUser();
  if (!actor) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  try {
    const data = await auditAdminService.getRecentByEntity(entityType, entityId, limit, actor);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
