import 'server-only';
import { db } from '@/db';
import { contentRevisions, ContentRevision, NewContentRevision } from '@/db/schema/workflow';
import { IRevisionRepository, ConcurrencyUpdateResult } from '../contracts/revision.repository';
import { ContentTypeId, WorkflowStatus, WorkflowStatusType } from '@/lib/workflow/types';
import { eq, and, desc, sql } from 'drizzle-orm';

export class PostgresRevisionRepository implements IRevisionRepository {
  async getById(id: string): Promise<ContentRevision | null> {
    const [result] = await db.select().from(contentRevisions).where(eq(contentRevisions.id, id));
    return result ?? null;
  }

  async getByEntityAndRevision(
    entityType: ContentTypeId,
    entityId: string,
    revisionNumber: number
  ): Promise<ContentRevision | null> {
    const [result] = await db
      .select()
      .from(contentRevisions)
      .where(
        and(
          eq(contentRevisions.entityType, entityType),
          eq(contentRevisions.entityId, entityId),
          eq(contentRevisions.revisionNumber, revisionNumber)
        )
      );
    return result ?? null;
  }

  async getLatestByEntity(
    entityType: ContentTypeId,
    entityId: string
  ): Promise<ContentRevision | null> {
    const [result] = await db
      .select()
      .from(contentRevisions)
      .where(
        and(eq(contentRevisions.entityType, entityType), eq(contentRevisions.entityId, entityId))
      )
      .orderBy(desc(contentRevisions.revisionNumber))
      .limit(1);

    return result ?? null;
  }

  async getPublishedByEntity(
    entityType: ContentTypeId,
    entityId: string
  ): Promise<ContentRevision | null> {
    const [result] = await db
      .select()
      .from(contentRevisions)
      .where(
        and(
          eq(contentRevisions.entityType, entityType),
          eq(contentRevisions.entityId, entityId),
          eq(contentRevisions.status, WorkflowStatus.PUBLISHED)
        )
      )
      .orderBy(desc(contentRevisions.revisionNumber))
      .limit(1);

    return result ?? null;
  }

  async listByEntity(entityType: ContentTypeId, entityId: string): Promise<ContentRevision[]> {
    return db
      .select()
      .from(contentRevisions)
      .where(
        and(eq(contentRevisions.entityType, entityType), eq(contentRevisions.entityId, entityId))
      )
      .orderBy(desc(contentRevisions.revisionNumber));
  }

  async create(data: NewContentRevision): Promise<ContentRevision> {
    const [created] = await db.insert(contentRevisions).values(data).returning();
    return created;
  }

  async updateDraftWithConcurrency(
    id: string,
    expectedVersion: number,
    updates: Partial<NewContentRevision>
  ): Promise<ConcurrencyUpdateResult> {
    const existing = await this.getById(id);
    if (!existing) {
      return { updated: null, conflict: false };
    }

    // Check version
    if (existing.version !== expectedVersion) {
      return { updated: null, conflict: true, currentVersion: existing.version };
    }

    // Execute atomic conditional update incrementing version
    const [updated] = await db
      .update(contentRevisions)
      .set({
        ...updates,
        version: sql`${contentRevisions.version} + 1`,
        updatedAt: new Date(),
      })
      .where(and(eq(contentRevisions.id, id), eq(contentRevisions.version, expectedVersion)))
      .returning();

    if (!updated) {
      const refreshed = await this.getById(id);
      return { updated: null, conflict: true, currentVersion: refreshed?.version };
    }

    return { updated, conflict: false, currentVersion: updated.version };
  }

  async updateStatus(
    id: string,
    status: WorkflowStatusType,
    metadata: Partial<ContentRevision> = {}
  ): Promise<ContentRevision | null> {
    const [updated] = await db
      .update(contentRevisions)
      .set({
        ...metadata,
        status,
        updatedAt: new Date(),
      })
      .where(eq(contentRevisions.id, id))
      .returning();

    return updated ?? null;
  }

  async getNextRevisionNumber(entityType: ContentTypeId, entityId: string): Promise<number> {
    const [result] = await db
      .select({
        maxRev: sql<number>`COALESCE(MAX(${contentRevisions.revisionNumber}), 0)::int`,
      })
      .from(contentRevisions)
      .where(
        and(eq(contentRevisions.entityType, entityType), eq(contentRevisions.entityId, entityId))
      );

    return (result?.maxRev ?? 0) + 1;
  }
}

export const revisionRepository = new PostgresRevisionRepository();
