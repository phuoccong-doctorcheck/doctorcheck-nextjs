import 'server-only';
import { revalidatePath, revalidateTag } from 'next/cache';
import { ContentTypeId, RevalidationPlan } from '@/lib/workflow/types';
import { DOMAIN_WORKFLOW_REGISTRY } from '@/lib/workflow/registry';
import { db } from '@/db';
import { revalidationOperations, RevalidationOperation } from '@/db/schema/settings';
import { eq, desc, and, count } from 'drizzle-orm';

export interface RevalidationResult {
  success: boolean;
  revalidatedPaths: string[];
  revalidatedTags: string[];
  error?: string;
  operationId?: string;
}

export interface RevalidationListOptions {
  page?: number;
  limit?: number;
  status?: string;
  entityType?: string;
}

export interface RevalidationListResult {
  operations: RevalidationOperation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class RevalidationService {
  /**
   * Revalidates targeted paths and cache tags for a modified entity.
   * MUST be executed strictly AFTER the database transaction commits.
   */
  async revalidateForEntity(
    entityType: ContentTypeId,
    entityId: string,
    payload: Record<string, unknown>,
    revisionId?: string
  ): Promise<RevalidationResult> {
    const definition = DOMAIN_WORKFLOW_REGISTRY[entityType];
    const plan: RevalidationPlan = definition
      ? definition.getRevalidationPlan(entityId, payload)
      : { paths: ['/'], tags: [] };

    // Always include 'redirects' cache tag if redirect might be affected
    const tagsToRevalidate = [...(plan.tags || [])];
    if (!tagsToRevalidate.includes('redirects')) {
      tagsToRevalidate.push('redirects');
    }

    const revalidatedPaths: string[] = [];
    const revalidatedTags: string[] = [];
    let errorMessage: string | undefined;

    try {
      // Revalidate paths
      for (const path of plan.paths) {
        try {
          revalidatePath(path);
          revalidatedPaths.push(path);
        } catch (pathErr) {
          const pErr = pathErr instanceof Error ? pathErr.message : String(pathErr);
          errorMessage = `Lỗi revalidatePath('${path}'): ${pErr}`;
          console.warn(`⚠️ REVALIDATE_PATH_WARNING: Failed to revalidate path '${path}':`, pathErr);
        }
      }

      // Revalidate tags
      if (tagsToRevalidate.length > 0) {
        for (const tag of tagsToRevalidate) {
          try {
            revalidateTag(tag, 'max-age=0');
            revalidatedTags.push(tag);
          } catch (tagErr) {
            const tErr = tagErr instanceof Error ? tagErr.message : String(tagErr);
            errorMessage = errorMessage ? `${errorMessage}; Lỗi revalidateTag('${tag}'): ${tErr}` : `Lỗi revalidateTag('${tag}'): ${tErr}`;
            console.warn(`⚠️ REVALIDATE_TAG_WARNING: Failed to revalidate tag '${tag}':`, tagErr);
          }
        }
      }

      if (errorMessage) {
        // Record failure in persistent outbox
        const opId = await this.recordOperationFailure({
          entityType,
          entityId,
          revisionId,
          paths: plan.paths,
          tags: tagsToRevalidate,
          error: errorMessage,
        });

        return {
          success: false,
          revalidatedPaths,
          revalidatedTags,
          error: errorMessage,
          operationId: opId,
        };
      }

      return {
        success: true,
        revalidatedPaths,
        revalidatedTags,
      };
    } catch (err: unknown) {
      errorMessage = err instanceof Error ? err.message : String(err);
      console.error('❌ REVALIDATION_SERVICE_ERROR:', errorMessage);

      const opId = await this.recordOperationFailure({
        entityType,
        entityId,
        revisionId,
        paths: plan.paths,
        tags: tagsToRevalidate,
        error: errorMessage,
      });

      return {
        success: false,
        revalidatedPaths,
        revalidatedTags,
        error: errorMessage,
        operationId: opId,
      };
    }
  }

  /**
   * Revalidates a custom explicit list of paths.
   */
  async revalidateExplicitPaths(paths: string[]): Promise<RevalidationResult> {
    const revalidatedPaths: string[] = [];
    try {
      for (const path of paths) {
        revalidatePath(path);
        revalidatedPaths.push(path);
      }
      return { success: true, revalidatedPaths, revalidatedTags: [] };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, revalidatedPaths, revalidatedTags: [], error: errorMsg };
    }
  }

  /**
   * Records a failed revalidation into the revalidation_operations table.
   */
  async recordOperationFailure(params: {
    entityType: string;
    entityId: string;
    revisionId?: string;
    paths: string[];
    tags?: string[];
    error: string;
  }): Promise<string> {
    try {
      const [inserted] = await db
        .insert(revalidationOperations)
        .values({
          entityType: params.entityType,
          entityId: params.entityId,
          revisionId: params.revisionId || null,
          paths: params.paths,
          tags: params.tags || [],
          status: 'failed',
          attempts: 1,
          lastError: params.error,
        })
        .returning();

      return inserted.id;
    } catch (dbErr) {
      console.error('❌ Failed to record revalidation failure to DB:', dbErr);
      return '';
    }
  }

  /**
   * Idempotently retries a failed revalidation operation without republishing content.
   */
  async retryOperation(operationId: string): Promise<RevalidationResult> {
    const [op] = await db
      .select()
      .from(revalidationOperations)
      .where(eq(revalidationOperations.id, operationId));

    if (!op) {
      return {
        success: false,
        revalidatedPaths: [],
        revalidatedTags: [],
        error: 'Không tìm thấy bản ghi tác vụ revalidation.',
      };
    }

    if (op.status === 'completed') {
      return {
        success: true,
        revalidatedPaths: (op.paths as string[]) || [],
        revalidatedTags: (op.tags as string[]) || [],
      };
    }

    const paths = (op.paths as string[]) || [];
    const tags = (op.tags as string[]) || [];
    const revalidatedPaths: string[] = [];
    const revalidatedTags: string[] = [];
    let errorMessage: string | undefined;

    try {
      for (const p of paths) {
        try {
          revalidatePath(p);
          revalidatedPaths.push(p);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errorMessage = `Lỗi revalidatePath('${p}'): ${msg}`;
        }
      }

      for (const t of tags) {
        try {
          revalidateTag(t, 'max-age=0');
          revalidatedTags.push(t);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errorMessage = errorMessage ? `${errorMessage}; ${msg}` : msg;
        }
      }

      if (!errorMessage) {
        await db
          .update(revalidationOperations)
          .set({
            status: 'completed',
            attempts: op.attempts + 1,
            lastAttemptAt: new Date(),
            resolvedAt: new Date(),
            lastError: null,
          })
          .where(eq(revalidationOperations.id, operationId));

        return {
          success: true,
          revalidatedPaths,
          revalidatedTags,
        };
      } else {
        await db
          .update(revalidationOperations)
          .set({
            status: 'failed',
            attempts: op.attempts + 1,
            lastAttemptAt: new Date(),
            lastError: errorMessage,
          })
          .where(eq(revalidationOperations.id, operationId));

        return {
          success: false,
          revalidatedPaths,
          revalidatedTags,
          error: errorMessage,
        };
      }
    } catch (retryErr: unknown) {
      const errMsg = retryErr instanceof Error ? retryErr.message : String(retryErr);
      await db
        .update(revalidationOperations)
        .set({
          status: 'failed',
          attempts: op.attempts + 1,
          lastAttemptAt: new Date(),
          lastError: errMsg,
        })
        .where(eq(revalidationOperations.id, operationId));

      return {
        success: false,
        revalidatedPaths,
        revalidatedTags,
        error: errMsg,
      };
    }
  }

  /**
   * Lists revalidation operations with pagination & filtering.
   */
  async listOperations(options: RevalidationListOptions = {}): Promise<RevalidationListResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (options.status?.trim()) {
      conditions.push(eq(revalidationOperations.status, options.status.trim()));
    }
    if (options.entityType?.trim()) {
      conditions.push(eq(revalidationOperations.entityType, options.entityType.trim()));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ total: count() })
      .from(revalidationOperations)
      .where(whereClause);

    const total = Number(countResult?.total || 0);

    const rows = await db
      .select()
      .from(revalidationOperations)
      .where(whereClause)
      .orderBy(desc(revalidationOperations.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      operations: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

export const revalidationService = new RevalidationService();
