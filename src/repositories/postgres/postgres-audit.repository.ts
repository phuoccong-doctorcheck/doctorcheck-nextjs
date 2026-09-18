import { eq, and, ilike, desc, count, gte, lte } from 'drizzle-orm';
import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import type {
  IAuditRepository,
  AuditLogRow,
  AuditLogListOptions,
  AuditLogListResult,
} from '../contracts/audit.repository';

export class PostgresAuditRepository implements IAuditRepository {
  async listAuditLogs(options: AuditLogListOptions = {}): Promise<AuditLogListResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    const conditions = [];

    if (options.actorId && options.actorId.trim()) {
      conditions.push(eq(auditLogs.actorId, options.actorId.trim()));
    }

    if (options.actorEmail && options.actorEmail.trim()) {
      conditions.push(ilike(auditLogs.actorEmail, `%${options.actorEmail.trim()}%`));
    }

    if (options.action && options.action.trim()) {
      conditions.push(eq(auditLogs.action, options.action.trim()));
    }

    if (options.entityType && options.entityType.trim()) {
      conditions.push(eq(auditLogs.entityType, options.entityType.trim()));
    }

    if (options.entityId && options.entityId.trim()) {
      conditions.push(eq(auditLogs.entityId, options.entityId.trim()));
    }

    if (options.startDate) {
      conditions.push(gte(auditLogs.createdAt, options.startDate));
    }

    if (options.endDate) {
      conditions.push(lte(auditLogs.createdAt, options.endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Total count
    const [countResult] = await db
      .select({ total: count() })
      .from(auditLogs)
      .where(whereClause);

    const total = Number(countResult?.total || 0);

    const rows = await db
      .select()
      .from(auditLogs)
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      logs: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getById(id: string): Promise<AuditLogRow | null> {
    const [row] = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.id, id))
      .limit(1);

    return row || null;
  }

  async getRecentByEntity(entityType: string, entityId: string, limit = 10): Promise<AuditLogRow[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId)))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  async getRecentByActor(actorId: string, limit = 10): Promise<AuditLogRow[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.actorId, actorId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }
}

export const auditRepository = new PostgresAuditRepository();
