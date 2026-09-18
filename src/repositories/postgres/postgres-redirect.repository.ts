import 'server-only';
import { db } from '@/db';
import { redirects, Redirect, NewRedirect } from '@/db/schema/settings';
import { IRedirectRepository, AdminRedirectListOptions, AdminRedirectListResult } from '../contracts/redirect.repository';
import { eq, and, or, ilike, count, desc } from 'drizzle-orm';

export type { AdminRedirectListOptions, AdminRedirectListResult };

export class PostgresRedirectRepository implements IRedirectRepository {
  private getDb(tx?: unknown) {
    return (tx as typeof db) || db;
  }

  async list(options: AdminRedirectListOptions = {}): Promise<AdminRedirectListResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    const conditions = [];

    if (options.search?.trim()) {
      const term = `%${options.search.trim()}%`;
      conditions.push(or(ilike(redirects.sourcePath, term), ilike(redirects.targetPath, term)));
    }

    if (options.isActive !== undefined) {
      conditions.push(eq(redirects.isActive, options.isActive));
    }

    if (options.entityType?.trim()) {
      conditions.push(eq(redirects.entityType, options.entityType.trim()));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ total: count() })
      .from(redirects)
      .where(whereClause);

    const total = Number(countResult?.total || 0);

    const rows = await db
      .select()
      .from(redirects)
      .where(whereClause)
      .orderBy(desc(redirects.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      redirects: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getById(id: string, tx?: unknown): Promise<Redirect | null> {
    const client = this.getDb(tx);
    const [row] = await client.select().from(redirects).where(eq(redirects.id, id));
    return row ?? null;
  }

  async getBySource(sourcePath: string, tx?: unknown): Promise<Redirect | null> {
    try {
      const client = this.getDb(tx);
      const [row] = await client.select().from(redirects).where(eq(redirects.sourcePath, sourcePath));
      return row ?? null;
    } catch (err) {
      console.warn(`⚠️ REDIRECT_REPO_WARNING: getBySource('${sourcePath}') failed:`, err);
      return null;
    }
  }

  async getAllActive(tx?: unknown): Promise<Redirect[]> {
    const client = this.getDb(tx);
    return await client.select().from(redirects).where(eq(redirects.isActive, true));
  }

  async getByEntity(entityType: string, entityId: string, tx?: unknown): Promise<Redirect[]> {
    const client = this.getDb(tx);
    return await client
      .select()
      .from(redirects)
      .where(and(eq(redirects.entityType, entityType), eq(redirects.entityId, entityId)));
  }

  async create(data: NewRedirect, tx?: unknown): Promise<Redirect> {
    const client = this.getDb(tx);
    const [created] = await client.insert(redirects).values(data).returning();
    return created;
  }

  async update(id: string, data: Partial<NewRedirect>, tx?: unknown): Promise<Redirect | null> {
    const client = this.getDb(tx);
    const [updated] = await client
      .update(redirects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(redirects.id, id))
      .returning();
    return updated ?? null;
  }

  async updateTargetForSources(
    oldTarget: string,
    newTarget: string,
    supersededById?: string,
    tx?: unknown
  ): Promise<number> {
    const client = this.getDb(tx);
    const updatedRows = await client
      .update(redirects)
      .set({
        targetPath: newTarget,
        supersededById: supersededById || null,
        updatedAt: new Date(),
      })
      .where(and(eq(redirects.targetPath, oldTarget), eq(redirects.isActive, true)))
      .returning();

    return updatedRows.length;
  }

  async deactivate(id: string, tx?: unknown): Promise<boolean> {
    const client = this.getDb(tx);
    const [updated] = await client
      .update(redirects)
      .set({ isActive: false, disabledAt: new Date(), updatedAt: new Date() })
      .where(eq(redirects.id, id))
      .returning();
    return !!updated;
  }

  async delete(id: string, tx?: unknown): Promise<boolean> {
    const client = this.getDb(tx);
    const result = await client.delete(redirects).where(eq(redirects.id, id)).returning();
    return result.length > 0;
  }
}

export const redirectRepository = new PostgresRedirectRepository();
