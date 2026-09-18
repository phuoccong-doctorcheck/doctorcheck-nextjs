import type { auditLogs } from '@/db/schema';

export type AuditLogRow = typeof auditLogs.$inferSelect;

export interface AuditLogListOptions {
  page?: number;
  limit?: number;
  actorId?: string;
  actorEmail?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface AuditLogListResult {
  logs: AuditLogRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IAuditRepository {
  listAuditLogs(options?: AuditLogListOptions): Promise<AuditLogListResult>;
  getById(id: string): Promise<AuditLogRow | null>;
  getRecentByEntity(entityType: string, entityId: string, limit?: number): Promise<AuditLogRow[]>;
  getRecentByActor(actorId: string, limit?: number): Promise<AuditLogRow[]>;
}
