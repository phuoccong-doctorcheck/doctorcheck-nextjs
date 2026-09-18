import 'server-only';
import { db } from '@/db';
import { contentRevisions, ContentRevision, NewContentRevision } from '@/db/schema/workflow';
import { articles, articleCategories, categories } from '@/db/schema/articles';
import { extractTableOfContents } from '@/lib/content/toc-generator';
import { pages } from '@/db/schema/pages';
import { doctors, doctorSpecialties, specialties } from '@/db/schema/doctors';
import { packages } from '@/db/schema/packages';
import { clinicInfo, homepageBlocks } from '@/db/schema/settings';
import { equipment, faqs, testimonials } from '@/db/schema/clinical-trust';
import { media } from '@/db/schema/media';
import { auditLogs } from '@/db/schema/audit';
import { revisionRepository } from '@/repositories/postgres/postgres-revision.repository';
import { revalidationService } from './revalidation.service';
import type { HomepageData } from '@/lib/data/homepage';
import {
  ContentType,
  ContentTypeId,
  WorkflowStatus,
  WorkflowStatusType,
  WorkflowAction,
  WorkflowOperationResult,
  ConcurrencyConflictDetail,
} from '@/lib/workflow/types';
import {
  DOMAIN_WORKFLOW_REGISTRY,
  isValidTransition,
  validateDomainSnapshot,
} from '@/lib/workflow/registry';
import { hasPermission, Role } from '@/lib/auth/rbac';
import { logAuditEvent, AuditAction } from '@/lib/auth/audit';
import { computePagePath, PageRouteType } from '@/lib/routing/page-route-policy';
import { redirectService } from './redirect.service';
import { normalizeRoutePath } from '@/lib/routing/path-utils';
import { eq, and, not } from 'drizzle-orm';

export interface WorkflowUserContext {
  userId: string;
  userEmail: string;
  roles: string[];
  permissions: string[];
  ipAddress?: string | null;
  userAgent?: string | null;
}

export class WorkflowService {
  /**
   * Creates a new draft revision for an entity.
   */
  async createDraftRevision(
    entityType: ContentTypeId,
    entityId: string,
    payload: Record<string, unknown>,
    user: WorkflowUserContext,
    options: { title?: string; changeSummary?: string } = {}
  ): Promise<WorkflowOperationResult<ContentRevision>> {
    const definition = DOMAIN_WORKFLOW_REGISTRY[entityType];
    if (!definition) {
      return { success: false, error: `Loại nội dung không hợp lệ: ${entityType}` };
    }

    // 1. Authorization check
    const isAuthorized = hasPermission(user.roles, user.permissions, definition.permissions.createDraft);
    if (!isAuthorized) {
      return {
        success: false,
        error: `Bạn không có quyền tạo bản nháp (Yêu cầu quyền ${definition.permissions.createDraft}).`,
      };
    }

    // 2. Validate payload schema
    const validation = validateDomainSnapshot(entityType, payload);
    if (!validation.valid || !validation.sanitizedPayload) {
      return {
        success: false,
        error: 'Dữ liệu bản nháp không hợp lệ theo quy định phân hệ.',
        validationErrors: validation.errors,
      };
    }

    // 3. Get next revision number
    const nextRevNum = await revisionRepository.getNextRevisionNumber(entityType, entityId);

    // 4. Insert revision row
    const newRevision: NewContentRevision = {
      entityType,
      entityId,
      revisionNumber: nextRevNum,
      status: WorkflowStatus.DRAFT,
      title: options.title || (validation.sanitizedPayload.title as string) || (validation.sanitizedPayload.name as string) || null,
      payload: validation.sanitizedPayload,
      version: 1,
      changeSummary: options.changeSummary || 'Khởi tạo bản nháp mới',
      createdBy: user.userId,
    };

    const created = await revisionRepository.create(newRevision);

    // 5. Audit Log
    await logAuditEvent({
      actorId: user.userId,
      actorEmail: user.userEmail,
      action: AuditAction.CONTENT_DRAFT_CREATED,
      entityType,
      entityId,
      ipAddress: user.ipAddress,
      userAgent: user.userAgent,
      metadata: {
        revisionId: created.id,
        revisionNumber: created.revisionNumber,
        title: created.title,
      },
    });

    return { success: true, data: created };
  }

  /**
   * Updates an existing draft revision with optimistic concurrency protection.
   */
  async updateDraftRevision(
    revisionId: string,
    expectedVersion: number,
    payload: Record<string, unknown>,
    user: WorkflowUserContext,
    options: { title?: string; changeSummary?: string } = {}
  ): Promise<WorkflowOperationResult<ContentRevision>> {
    const revision = await revisionRepository.getById(revisionId);
    if (!revision) {
      return { success: false, error: 'Không tìm thấy bản ghi phiên bản yêu cầu.' };
    }

    // Must be in draft state to update payload
    if (revision.status !== WorkflowStatus.DRAFT) {
      return {
        success: false,
        error: `Chỉ có thể chỉnh sửa bản nháp ở trạng thái DRAFT (Trạng thái hiện tại: ${revision.status.toUpperCase()}).`,
      };
    }

    const definition = DOMAIN_WORKFLOW_REGISTRY[revision.entityType as ContentTypeId];
    if (!definition) {
      return { success: false, error: 'Phân hệ không hợp lệ.' };
    }

    // Authorization
    const isAuthorized = hasPermission(user.roles, user.permissions, definition.permissions.updateDraft);
    if (!isAuthorized) {
      return {
        success: false,
        error: `Bạn không có quyền chỉnh sửa bản nháp (Yêu cầu quyền ${definition.permissions.updateDraft}).`,
      };
    }

    // Schema Validation
    const validation = validateDomainSnapshot(revision.entityType as ContentTypeId, payload);
    if (!validation.valid || !validation.sanitizedPayload) {
      return {
        success: false,
        error: 'Dữ liệu bản nháp không hợp lệ.',
        validationErrors: validation.errors,
      };
    }

    // Concurrency-protected update
    const result = await revisionRepository.updateDraftWithConcurrency(revisionId, expectedVersion, {
      title: options.title || (validation.sanitizedPayload.title as string) || (validation.sanitizedPayload.name as string) || revision.title,
      payload: validation.sanitizedPayload,
      changeSummary: options.changeSummary || revision.changeSummary,
    });

    if (result.conflict) {
      const conflictDetail: ConcurrencyConflictDetail = {
        id: revisionId,
        entityType: revision.entityType as ContentTypeId,
        entityId: revision.entityId,
        currentVersion: result.currentVersion || revision.version,
        expectedVersion,
        message: 'Nội dung đã được thay đổi bởi một người dùng khác kể từ lần cuối bạn tải. Vui lòng làm mới để xem phiên bản mới nhất.',
      };

      return {
        success: false,
        conflict: conflictDetail,
        error: conflictDetail.message,
      };
    }

    if (!result.updated) {
      return { success: false, error: 'Cập nhật bản nháp thất bại.' };
    }

    // Audit Log
    await logAuditEvent({
      actorId: user.userId,
      actorEmail: user.userEmail,
      action: AuditAction.CONTENT_DRAFT_UPDATED,
      entityType: revision.entityType,
      entityId: revision.entityId,
      ipAddress: user.ipAddress,
      userAgent: user.userAgent,
      metadata: {
        revisionId,
        revisionNumber: result.updated.revisionNumber,
        newVersion: result.updated.version,
      },
    });

    return { success: true, data: result.updated };
  }

  /**
   * Submits a draft revision for editorial/medical review.
   */
  async submitForReview(
    revisionId: string,
    user: WorkflowUserContext
  ): Promise<WorkflowOperationResult<ContentRevision>> {
    const revision = await revisionRepository.getById(revisionId);
    if (!revision) {
      return { success: false, error: 'Không tìm thấy phiên bản yêu cầu.' };
    }

    if (!isValidTransition(revision.status as WorkflowStatusType, WorkflowStatus.IN_REVIEW, WorkflowAction.SUBMIT_REVIEW)) {
      return { success: false, error: `Không thể chuyển trạng thái từ ${revision.status} sang IN_REVIEW.` };
    }

    const definition = DOMAIN_WORKFLOW_REGISTRY[revision.entityType as ContentTypeId];
    const isAuthorized = hasPermission(user.roles, user.permissions, definition.permissions.submitReview);
    if (!isAuthorized) {
      return { success: false, error: 'Bạn không có quyền gửi duyệt nội dung.' };
    }

    const updated = await revisionRepository.updateStatus(revisionId, WorkflowStatus.IN_REVIEW);
    if (!updated) {
      return { success: false, error: 'Chuyển trạng thái thất bại.' };
    }

    await logAuditEvent({
      actorId: user.userId,
      actorEmail: user.userEmail,
      action: AuditAction.CONTENT_SUBMITTED_REVIEW,
      entityType: revision.entityType,
      entityId: revision.entityId,
      ipAddress: user.ipAddress,
      userAgent: user.userAgent,
      metadata: { revisionId, revisionNumber: updated.revisionNumber },
    });

    return { success: true, data: updated };
  }

  /**
   * Approves a revision in review.
   */
  async approveRevision(
    revisionId: string,
    user: WorkflowUserContext,
    options: { medicalReviewNotes?: string } = {}
  ): Promise<WorkflowOperationResult<ContentRevision>> {
    const revision = await revisionRepository.getById(revisionId);
    if (!revision) {
      return { success: false, error: 'Không tìm thấy phiên bản yêu cầu.' };
    }

    if (!isValidTransition(revision.status as WorkflowStatusType, WorkflowStatus.APPROVED, WorkflowAction.APPROVE)) {
      return { success: false, error: `Không thể duyệt phiên bản đang ở trạng thái ${revision.status}.` };
    }

    const definition = DOMAIN_WORKFLOW_REGISTRY[revision.entityType as ContentTypeId];
    const isAuthorized = hasPermission(user.roles, user.permissions, definition.permissions.approve);
    if (!isAuthorized) {
      return { success: false, error: 'Bạn không có quyền phê duyệt/thẩm định y khoa.' };
    }

    const updated = await revisionRepository.updateStatus(revisionId, WorkflowStatus.APPROVED, {
      reviewedBy: user.userId,
      reviewedAt: new Date(),
      medicalReviewNotes: options.medicalReviewNotes || revision.medicalReviewNotes,
    });

    if (!updated) {
      return { success: false, error: 'Phê duyệt thất bại.' };
    }

    await logAuditEvent({
      actorId: user.userId,
      actorEmail: user.userEmail,
      action: AuditAction.CONTENT_APPROVED,
      entityType: revision.entityType,
      entityId: revision.entityId,
      ipAddress: user.ipAddress,
      userAgent: user.userAgent,
      metadata: { revisionId, revisionNumber: updated.revisionNumber, notes: options.medicalReviewNotes },
    });

    return { success: true, data: updated };
  }

  /**
   * Returns a revision back to draft state (Request Changes / Reject).
   */
  async returnToDraft(
    revisionId: string,
    user: WorkflowUserContext,
    options: { reviewNotes?: string } = {}
  ): Promise<WorkflowOperationResult<ContentRevision>> {
    const revision = await revisionRepository.getById(revisionId);
    if (!revision) {
      return { success: false, error: 'Không tìm thấy phiên bản yêu cầu.' };
    }

    if (!isValidTransition(revision.status as WorkflowStatusType, WorkflowStatus.DRAFT, WorkflowAction.RETURN_TO_DRAFT)) {
      return { success: false, error: `Không thể trả về nháp từ trạng thái ${revision.status}.` };
    }

    const definition = DOMAIN_WORKFLOW_REGISTRY[revision.entityType as ContentTypeId];
    const isAuthorized = hasPermission(user.roles, user.permissions, definition.permissions.returnToDraft);
    if (!isAuthorized) {
      return { success: false, error: 'Bạn không có quyền trả về bản nháp.' };
    }

    const updated = await revisionRepository.updateStatus(revisionId, WorkflowStatus.DRAFT, {
      medicalReviewNotes: options.reviewNotes || revision.medicalReviewNotes,
    });

    if (!updated) {
      return { success: false, error: 'Trả về nháp thất bại.' };
    }

    await logAuditEvent({
      actorId: user.userId,
      actorEmail: user.userEmail,
      action: AuditAction.CONTENT_RETURNED_TO_DRAFT,
      entityType: revision.entityType,
      entityId: revision.entityId,
      ipAddress: user.ipAddress,
      userAgent: user.userAgent,
      metadata: { revisionId, revisionNumber: updated.revisionNumber, feedback: options.reviewNotes },
    });

    return { success: true, data: updated };
  }

  /**
   * Resolves the existing public canonical path for an entity if published.
   */
  private async getExistingCanonicalPath(
    entityType: ContentTypeId,
    entityId: string
  ): Promise<string | null> {
    switch (entityType) {
      case ContentType.ARTICLE: {
        const [row] = await db.select({ slug: articles.slug, status: articles.status }).from(articles).where(eq(articles.id, entityId));
        if (row && row.slug && row.status === 'published') return `/${row.slug}/`;
        return null;
      }
      case ContentType.PAGE: {
        const [row] = await db.select({ path: pages.path, status: pages.status }).from(pages).where(eq(pages.id, entityId));
        if (row && row.path && row.status === 'published') return normalizeRoutePath(row.path);
        return null;
      }
      case ContentType.DOCTOR: {
        const [row] = await db.select({ slug: doctors.slug, isFeatured: doctors.isFeatured }).from(doctors).where(eq(doctors.id, entityId));
        if (row && row.slug) return `/doctor/${row.slug}/`;
        return null;
      }
      case ContentType.PACKAGE: {
        const [row] = await db.select({ slug: packages.slug, isActive: packages.isActive }).from(packages).where(eq(packages.id, entityId));
        if (row && row.slug && row.isActive) return `/${row.slug}/`;
        return null;
      }
      default:
        return null;
    }
  }

  /**
   * Computes the new canonical path from payload.
   */
  private computeNewCanonicalPath(
    entityType: ContentTypeId,
    payload: Record<string, unknown>
  ): string | null {
    switch (entityType) {
      case ContentType.ARTICLE: {
        const slug = payload.slug as string | undefined;
        return slug ? `/${slug.trim().toLowerCase()}/` : null;
      }
      case ContentType.PAGE: {
        const routeType = (payload.routeType as PageRouteType) || (payload.isRoot ? PageRouteType.ROOT : PageRouteType.ENDOSCOPY_CHILD);
        const slug = (payload.slug as string) || '';
        const subpath = payload.subpath as string | null | undefined;
        const calculated = computePagePath({ routeType, slug, subpath });
        return normalizeRoutePath(calculated);
      }
      case ContentType.DOCTOR: {
        const slug = payload.slug as string | undefined;
        return slug ? `/doctor/${slug.trim().toLowerCase()}/` : null;
      }
      case ContentType.PACKAGE: {
        const slug = payload.slug as string | undefined;
        return slug ? `/${slug.trim().toLowerCase()}/` : null;
      }
      default:
        return null;
    }
  }

  /**
   * Atomically publishes a revision to canonical PostgreSQL tables.
   */
  async publishRevision(
    revisionId: string,
    user: WorkflowUserContext
  ): Promise<WorkflowOperationResult<ContentRevision>> {
    const revision = await revisionRepository.getById(revisionId);
    if (!revision) {
      return { success: false, error: 'Không tìm thấy phiên bản yêu cầu.' };
    }

    const definition = DOMAIN_WORKFLOW_REGISTRY[revision.entityType as ContentTypeId];
    if (!definition) {
      return { success: false, error: 'Phân hệ không hợp lệ.' };
    }

    // 0. Double-submit idempotency
    if (revision.status === WorkflowStatus.PUBLISHED) {
      return {
        success: true,
        data: revision,
        publishStatus: 'PUBLISH_SUCCEEDED',
        revalidationStatus: 'REVALIDATION_SKIPPED',
      };
    }

    // 1. Authorization check
    const isAuthorized = hasPermission(user.roles, user.permissions, definition.permissions.publish);
    if (!isAuthorized) {
      return {
        success: false,
        error: `Bạn không có quyền xuất bản nội dung (Yêu cầu quyền ${definition.permissions.publish}).`,
      };
    }

    // 2. Medical review check
    if (definition.requiresMedicalReview && revision.status !== WorkflowStatus.APPROVED) {
      // Super admin can bypass, ordinary publishers cannot
      if (!user.roles.includes(Role.SUPER_ADMIN) && revision.status !== WorkflowStatus.APPROVED) {
        return {
          success: false,
          error: 'Nội dung y khoa bắt buộc phải được Bác sĩ/Người thẩm định phê duyệt (APPROVED) trước khi xuất bản.',
        };
      }
    }

    // 3. Pre-publish Validation (Collision & Media References)
    const payload = revision.payload as Record<string, unknown>;
    const collisionError = await this.validateRouteCollision(
      revision.entityType as ContentTypeId,
      revision.entityId,
      payload
    );
    if (collisionError) {
      return { success: false, error: collisionError };
    }

    const mediaError = await this.validateMediaReferences(payload);
    if (mediaError) {
      return { success: false, error: mediaError };
    }

    // Determine current canonical path (if previously published) and new canonical path
    const oldCanonicalPath = await this.getExistingCanonicalPath(
      revision.entityType as ContentTypeId,
      revision.entityId
    );
    const newCanonicalPath = this.computeNewCanonicalPath(
      revision.entityType as ContentTypeId,
      payload
    );

    const isRouteChange =
      oldCanonicalPath &&
      newCanonicalPath &&
      oldCanonicalPath !== newCanonicalPath;

    if (isRouteChange && oldCanonicalPath && newCanonicalPath) {
      const hasLoop = await redirectService.detectRedirectLoop(
        oldCanonicalPath,
        newCanonicalPath,
        undefined,
        { ignoreSourcePath: newCanonicalPath }
      );
      if (hasLoop) {
        return {
          success: false,
          error: `Không thể xuất bản thay đổi đường dẫn vì gây ra vòng lặp chuyển hướng (Redirect Loop) giữa '${oldCanonicalPath}' và '${newCanonicalPath}'.`,
        };
      }
    }

    // 4. ATOMIC DATABASE TRANSACTION
    let publishedRevision: ContentRevision;
    try {
      publishedRevision = await db.transaction(async (tx) => {
        // A. If route changed, reconcile restore and create redirect
        if (isRouteChange && oldCanonicalPath && newCanonicalPath) {
          await redirectService.reconcileHistoricalRestore(
            revision.entityType,
            revision.entityId,
            newCanonicalPath,
            tx
          );

          await redirectService.createPublishedRouteRedirect(
            {
              sourcePath: oldCanonicalPath,
              targetPath: newCanonicalPath,
              entityType: revision.entityType,
              entityId: revision.entityId,
              createdFromRevisionId: revisionId,
              createdBy: user.userId,
              statusCode: 301,
            },
            tx
          );
        }

        // B. Mutate canonical table based on entity type
        await this.applyCanonicalPublishMutation(tx, revision.entityType as ContentTypeId, revision.entityId, payload);

        // C. Update revision status to published
        const [pubRev] = await tx
          .update(contentRevisions)
          .set({
            status: WorkflowStatus.PUBLISHED,
            publishedBy: user.userId,
            publishedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(contentRevisions.id, revisionId))
          .returning();

        // D. Mark any previous published revisions for this entity as archived
        await tx
          .update(contentRevisions)
          .set({
            status: WorkflowStatus.ARCHIVED,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(contentRevisions.entityType, revision.entityType),
              eq(contentRevisions.entityId, revision.entityId),
              eq(contentRevisions.status, WorkflowStatus.PUBLISHED),
              not(eq(contentRevisions.id, revisionId))
            )
          );

        // E. Insert audit log inside the same transaction
        await tx.insert(auditLogs).values({
          actorId: user.userId,
          actorEmail: user.userEmail,
          action: AuditAction.CONTENT_PUBLISHED,
          entityType: revision.entityType,
          entityId: revision.entityId,
          ipAddress: user.ipAddress || null,
          userAgent: user.userAgent || null,
          metadata: {
            revisionId,
            revisionNumber: pubRev.revisionNumber,
            title: pubRev.title,
            oldRoute: oldCanonicalPath || undefined,
            newRoute: newCanonicalPath || undefined,
          },
        });

        return pubRev;
      });
    } catch (txErr: unknown) {
      const msg = txErr instanceof Error ? txErr.message : String(txErr);
      return { success: false, error: `Giao dịch xuất bản thất bại và đã được hoàn tác (Rollback): ${msg}` };
    }

    // 5. POST-COMMIT TARGETED CACHE REVALIDATION
    const revalResult = await revalidationService.revalidateForEntity(
      revision.entityType as ContentTypeId,
      revision.entityId,
      payload,
      revisionId
    );

    // If route changed, also invalidate the old route path
    if (isRouteChange && oldCanonicalPath) {
      await revalidationService.revalidateExplicitPaths([oldCanonicalPath]);
    }

    return {
      success: true,
      data: publishedRevision,
      publishStatus: 'PUBLISH_SUCCEEDED',
      revalidationStatus: revalResult.success ? 'REVALIDATION_SUCCEEDED' : 'REVALIDATION_FAILED',
      revalidationPaths: revalResult.revalidatedPaths,
    };
  }

  /**
   * Restores an older revision by creating a new revision based on the historical payload.
   */
  async restoreRevision(
    historicalRevisionId: string,
    user: WorkflowUserContext
  ): Promise<WorkflowOperationResult<ContentRevision>> {
    const historical = await revisionRepository.getById(historicalRevisionId);
    if (!historical) {
      return { success: false, error: 'Không tìm thấy phiên bản lịch sử để khôi phục.' };
    }

    const definition = DOMAIN_WORKFLOW_REGISTRY[historical.entityType as ContentTypeId];
    const isAuthorized = hasPermission(user.roles, user.permissions, definition.permissions.restore);
    if (!isAuthorized) {
      return { success: false, error: 'Bạn không có quyền khôi phục phiên bản.' };
    }

    const nextRevNum = await revisionRepository.getNextRevisionNumber(
      historical.entityType as ContentTypeId,
      historical.entityId
    );

    const newRevision: NewContentRevision = {
      entityType: historical.entityType,
      entityId: historical.entityId,
      revisionNumber: nextRevNum,
      status: WorkflowStatus.DRAFT,
      title: historical.title,
      payload: historical.payload,
      version: 1,
      changeSummary: `Khôi phục từ Phiên bản ${historical.revisionNumber}`,
      createdBy: user.userId,
    };

    const created = await revisionRepository.create(newRevision);

    await logAuditEvent({
      actorId: user.userId,
      actorEmail: user.userEmail,
      action: AuditAction.CONTENT_RESTORED,
      entityType: historical.entityType,
      entityId: historical.entityId,
      ipAddress: user.ipAddress,
      userAgent: user.userAgent,
      metadata: {
        fromRevisionId: historical.id,
        fromRevisionNumber: historical.revisionNumber,
        newRevisionId: created.id,
        newRevisionNumber: created.revisionNumber,
      },
    });

    return { success: true, data: created };
  }

  /**
   * Archives / Unpublishes a content revision and marks canonical item as archived.
   */
  async archiveRevision(
    revisionId: string,
    user: WorkflowUserContext
  ): Promise<WorkflowOperationResult<ContentRevision>> {
    const revision = await revisionRepository.getById(revisionId);
    if (!revision) {
      return { success: false, error: 'Không tìm thấy bản ghi phiên bản.' };
    }

    const definition = DOMAIN_WORKFLOW_REGISTRY[revision.entityType as ContentTypeId];
    const isAuthorized = hasPermission(user.roles, user.permissions, definition.permissions.archive);
    if (!isAuthorized) {
      return { success: false, error: 'Bạn không có quyền lưu trữ / gỡ bài.' };
    }

    // 1. Category dependency check: block if published articles are assigned
    const activeArticles = await db
      .select({ id: articles.id, title: articles.title })
      .from(articleCategories)
      .innerJoin(articles, eq(articleCategories.articleId, articles.id))
      .where(and(eq(articleCategories.categoryId, revision.entityId), eq(articles.status, 'published')));

    if (activeArticles.length > 0) {
      return {
        success: false,
        error: `Không thể lưu trữ / ẩn chuyên mục này vì đang có ${activeArticles.length} bài viết đã xuất bản liên kết (${activeArticles.slice(0, 3).map((a) => a.title).join(', ')}${activeArticles.length > 3 ? '...' : ''}). Vui lòng gỡ liên kết hoặc chuyển chuyên mục cho các bài viết trước.`,
      };
    }

    // 2. Pre-archive dependency and reference checks for Homepage
    const blocks = await db.select().from(homepageBlocks);
    const idOrSlugToMatch = [revision.entityId];
    if (revision.entityType === ContentType.DOCTOR) {
      const [doc] = await db.select({ slug: doctors.slug }).from(doctors).where(eq(doctors.id, revision.entityId));
      if (doc?.slug) idOrSlugToMatch.push(doc.slug);
    } else if (revision.entityType === ContentType.PACKAGE) {
      const [pkg] = await db.select({ slug: packages.slug }).from(packages).where(eq(packages.id, revision.entityId));
      if (pkg?.slug) idOrSlugToMatch.push(pkg.slug);
    } else if (revision.entityType === ContentType.ARTICLE) {
      const [art] = await db.select({ slug: articles.slug }).from(articles).where(eq(articles.id, revision.entityId));
      if (art?.slug) idOrSlugToMatch.push(art.slug);
    }

    const refs = blocks.filter((b) => {
      const str = JSON.stringify(b.content || {});
      return idOrSlugToMatch.some((identifier) => str.includes(identifier));
    });

    if (refs.length > 0) {
      return {
        success: false,
        error: `Không thể lưu trữ / ẩn thực thể này vì đang được liên kết tại Trang chủ (Khối: ${refs.map((r) => r.blockKey).join(', ')}). Vui lòng cập nhật cấu hình Trang chủ trước.`,
      };
    }

    const updated = await revisionRepository.updateStatus(revisionId, WorkflowStatus.ARCHIVED);
    if (!updated) {
      return { success: false, error: 'Lưu trữ phiên bản thất bại.' };
    }

    // Update canonical status based on entity type
    if (revision.entityType === ContentType.ARTICLE) {
      await db
        .update(articles)
        .set({ status: 'archived', updatedAt: new Date() })
        .where(eq(articles.id, revision.entityId));
    } else if (revision.entityType === ContentType.PAGE) {
      await db
        .update(pages)
        .set({ status: 'archived', updatedAt: new Date() })
        .where(eq(pages.id, revision.entityId));
    } else if (revision.entityType === ContentType.DOCTOR) {
      await db
        .update(doctors)
        .set({ isFeatured: false, updatedAt: new Date() })
        .where(eq(doctors.id, revision.entityId));
    } else if (revision.entityType === ContentType.PACKAGE) {
      await db
        .update(packages)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(packages.id, revision.entityId));
    } else if (revision.entityType === ContentType.EQUIPMENT) {
      await db
        .update(equipment)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(equipment.id, revision.entityId));
    } else if (revision.entityType === ContentType.FAQ) {
      await db
        .update(faqs)
        .set({ isPublished: false, updatedAt: new Date() })
        .where(eq(faqs.id, revision.entityId));
    } else if (revision.entityType === ContentType.TESTIMONIAL) {
      await db
        .update(testimonials)
        .set({ isPublished: false, updatedAt: new Date() })
        .where(eq(testimonials.id, revision.entityId));
    }

    await logAuditEvent({
      actorId: user.userId,
      actorEmail: user.userEmail,
      action: AuditAction.CONTENT_UNPUBLISHED,
      entityType: revision.entityType,
      entityId: revision.entityId,
      metadata: { revisionId, status: 'archived' },
    });

    const payload = revision.payload as Record<string, unknown>;
    await revalidationService.revalidateForEntity(
      revision.entityType as ContentTypeId,
      revision.entityId,
      payload
    );

    return { success: true, data: updated };
  }

  // ---------------------------------------------------------------------------
  // Canonical Table Mutators (Called inside publishing transaction)
  // ---------------------------------------------------------------------------

  private async applyCanonicalPublishMutation(
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    entityType: ContentTypeId,
    entityId: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    const now = new Date();

    switch (entityType) {
      case ContentType.ARTICLE: {
        const p = payload as {
          title: string;
          slug: string;
          excerpt?: string | null;
          contentHtml: string;
          featuredImageId?: string | null;
          featuredImageUrl?: string | null;
          authorName?: string;
          authorTitle?: string;
          categoryIds?: string[];
          toc?: Array<{ id: string; text: string; level: number }>;
          seoTitle?: string | null;
          seoDescription?: string | null;
          canonicalUrl?: string | null;
        };

        const computedToc = (Array.isArray(p.toc) && p.toc.length > 0)
          ? p.toc
          : extractTableOfContents(p.contentHtml);

        const existing = await tx.select().from(articles).where(eq(articles.id, entityId));
        if (existing.length > 0) {
          await tx
            .update(articles)
            .set({
              title: p.title,
              slug: p.slug,
              excerpt: p.excerpt || null,
              contentHtml: p.contentHtml,
              featuredImageId: p.featuredImageId || null,
              featuredImageUrl: p.featuredImageUrl || null,
              authorName: p.authorName || 'Đội ngũ Bác sĩ DoctorCheck',
              authorTitle: p.authorTitle || 'Bác sĩ Chuyên khoa Tiêu hóa',
              toc: computedToc,
              seoTitle: p.seoTitle || null,
              seoDescription: p.seoDescription || null,
              canonicalUrl: p.canonicalUrl || null,
              status: 'published',
              modifiedAt: now,
              updatedAt: now,
            })
            .where(eq(articles.id, entityId));
        } else {
          await tx.insert(articles).values({
            id: entityId,
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt || null,
            contentHtml: p.contentHtml,
            featuredImageId: p.featuredImageId || null,
            featuredImageUrl: p.featuredImageUrl || null,
            authorName: p.authorName || 'Đội ngũ Bác sĩ DoctorCheck',
            authorTitle: p.authorTitle || 'Bác sĩ Chuyên khoa Tiêu hóa',
            toc: computedToc,
            seoTitle: p.seoTitle || null,
            seoDescription: p.seoDescription || null,
            canonicalUrl: p.canonicalUrl || null,
            status: 'published',
            publishedAt: now,
            modifiedAt: now,
            createdAt: now,
            updatedAt: now,
          });
        }

        // Atomically synchronize article_categories join table
        if (Array.isArray(p.categoryIds)) {
          await tx.delete(articleCategories).where(eq(articleCategories.articleId, entityId));
          if (p.categoryIds.length > 0) {
            const allCats = await tx.select({ id: categories.id, slug: categories.slug }).from(categories);
            const validCatIds: string[] = [];
            for (const cid of p.categoryIds) {
              const cidStr = String(cid).trim();
              const matched = allCats.find((c) => c.id === cidStr || c.slug === cidStr);
              if (matched && !validCatIds.includes(matched.id)) {
                validCatIds.push(matched.id);
              }
            }

            if (validCatIds.length > 0) {
              await tx.insert(articleCategories).values(
                validCatIds.map((cid, idx) => ({
                  articleId: entityId,
                  categoryId: cid,
                  isPrimary: idx === 0,
                }))
              );
            }
          }
        }
        break;
      }

      case ContentType.PAGE: {
        const p = payload as {
          title: string;
          slug: string;
          path?: string;
          routeType?: PageRouteType;
          subpath?: string | null;
          excerpt?: string | null;
          contentHtml: string;
          featuredImageUrl?: string | null;
          isRoot?: boolean;
          isUxBuilder?: boolean;
          status?: string;
          seoTitle?: string | null;
          seoDescription?: string | null;
        };

        const calculatedRouteType = (p.routeType as PageRouteType) || (p.isRoot ? PageRouteType.ROOT : PageRouteType.ENDOSCOPY_CHILD);
        const calculatedPath = (p.path && p.path.trim().length > 0)
          ? p.path
          : computePagePath({ routeType: calculatedRouteType, slug: p.slug, subpath: p.subpath });
        const calculatedIsRoot = calculatedRouteType === PageRouteType.ROOT;

        const existing = await tx.select().from(pages).where(eq(pages.id, entityId));
        if (existing.length > 0) {
          await tx
            .update(pages)
            .set({
              title: p.title,
              slug: p.slug,
              path: calculatedPath,
              subpath: p.subpath || null,
              excerpt: p.excerpt || null,
              contentHtml: p.contentHtml || '',
              featuredImageUrl: p.featuredImageUrl || null,
              isRoot: calculatedIsRoot,
              isUxBuilder: p.isUxBuilder ?? false,
              seoTitle: p.seoTitle || null,
              seoDescription: p.seoDescription || null,
              status: p.status || 'published',
              updatedAt: now,
            })
            .where(eq(pages.id, entityId));
        } else {
          await tx.insert(pages).values({
            id: entityId,
            title: p.title,
            slug: p.slug,
            path: calculatedPath,
            subpath: p.subpath || null,
            excerpt: p.excerpt || null,
            contentHtml: p.contentHtml || '',
            featuredImageUrl: p.featuredImageUrl || null,
            isRoot: calculatedIsRoot,
            isUxBuilder: p.isUxBuilder ?? false,
            seoTitle: p.seoTitle || null,
            seoDescription: p.seoDescription || null,
            status: p.status || 'published',
            createdAt: now,
            updatedAt: now,
          });
        }
        break;
      }

      case ContentType.DOCTOR: {
        const p = payload as {
          name: string;
          slug: string;
          title: string;
          cchn: string;
          specialtySummary: string;
          clinicalScope: string;
          hospital: string;
          experienceYears?: number;
          imageUrl: string;
          description: string;
          detailedBioHtml?: string | null;
          schedule?: string | null;
          isFeatured?: boolean;
          sortOrder?: number;
          specialtyIds?: string[];
          seoTitle?: string | null;
          seoDescription?: string | null;
        };

        const existing = await tx.select().from(doctors).where(eq(doctors.id, entityId));
        if (existing.length > 0) {
          await tx
            .update(doctors)
            .set({
              name: p.name,
              slug: p.slug,
              title: p.title,
              cchn: p.cchn,
              specialtySummary: p.specialtySummary,
              clinicalScope: p.clinicalScope,
              hospital: p.hospital,
              experienceYears: p.experienceYears ?? 10,
              imageUrl: p.imageUrl,
              description: p.description,
              detailedBioHtml: p.detailedBioHtml || null,
              schedule: p.schedule || 'Thứ 2 - Thứ 7 (Theo lịch hẹn)',
              isFeatured: p.isFeatured ?? true,
              sortOrder: p.sortOrder ?? 0,
              seoTitle: p.seoTitle || null,
              seoDescription: p.seoDescription || null,
              updatedAt: now,
            })
            .where(eq(doctors.id, entityId));
        } else {
          await tx.insert(doctors).values({
            id: entityId,
            name: p.name,
            slug: p.slug,
            title: p.title,
            cchn: p.cchn,
            specialtySummary: p.specialtySummary,
            clinicalScope: p.clinicalScope,
            hospital: p.hospital,
            experienceYears: p.experienceYears ?? 10,
            imageUrl: p.imageUrl,
            description: p.description,
            detailedBioHtml: p.detailedBioHtml || null,
            schedule: p.schedule || 'Thứ 2 - Thứ 7 (Theo lịch hẹn)',
            isFeatured: p.isFeatured ?? true,
            sortOrder: p.sortOrder ?? 0,
            seoTitle: p.seoTitle || null,
            seoDescription: p.seoDescription || null,
            createdAt: now,
            updatedAt: now,
          });
        }

        // Atomically synchronize doctor_specialties join table
        if (Array.isArray(p.specialtyIds)) {
          await tx.delete(doctorSpecialties).where(eq(doctorSpecialties.doctorId, entityId));
          if (p.specialtyIds.length > 0) {
            const allSpecs = await tx.select({ id: specialties.id }).from(specialties);
            const validSpecIds: string[] = [];
            for (const sid of p.specialtyIds) {
              const sidStr = String(sid).trim();
              const matched = allSpecs.find((s) => s.id === sidStr);
              if (matched && !validSpecIds.includes(matched.id)) {
                validSpecIds.push(matched.id);
              }
            }

            if (validSpecIds.length > 0) {
              await tx.insert(doctorSpecialties).values(
                validSpecIds.map((sid) => ({
                  doctorId: entityId,
                  specialtyId: sid,
                }))
              );
            }
          }
        }
        break;
      }

      case ContentType.PACKAGE: {
        const p = payload as {
          name: string;
          slug: string;
          gender?: 'male' | 'female' | 'both';
          priceVnd: number | string;
          priceFormatted?: string;
          tagline?: string | null;
          diseasesCovered?: number;
          cancersCovered?: number;
          duration?: string;
          isPopular?: boolean;
          recommendedFor: string;
          features?: string[];
          imageUrl?: string | null;
          sortOrder?: number;
          isActive?: boolean;
          seoTitle?: string | null;
          seoDescription?: string | null;
        };

        const numericPrice = typeof p.priceVnd === 'number' ? p.priceVnd : Number(p.priceVnd) || 0;
        const formattedPrice = p.priceFormatted?.trim() || `${numericPrice.toLocaleString('vi-VN')}đ`;

        const existing = await tx.select().from(packages).where(eq(packages.id, entityId));
        if (existing.length > 0) {
          await tx
            .update(packages)
            .set({
              name: p.name,
              slug: p.slug,
              gender: p.gender || 'both',
              priceVnd: String(numericPrice),
              priceFormatted: formattedPrice,
              tagline: p.tagline || null,
              diseasesCovered: p.diseasesCovered ?? 0,
              cancersCovered: p.cancersCovered ?? 0,
              duration: p.duration || '120 - 180 phút',
              isPopular: p.isPopular ?? false,
              recommendedFor: p.recommendedFor,
              features: p.features || [],
              imageUrl: p.imageUrl || null,
              sortOrder: p.sortOrder ?? 0,
              isActive: p.isActive ?? true,
              seoTitle: p.seoTitle || null,
              seoDescription: p.seoDescription || null,
              updatedAt: now,
            })
            .where(eq(packages.id, entityId));
        } else {
          await tx.insert(packages).values({
            id: entityId,
            name: p.name,
            slug: p.slug,
            gender: p.gender || 'both',
            priceVnd: String(numericPrice),
            priceFormatted: formattedPrice,
            tagline: p.tagline || null,
            diseasesCovered: p.diseasesCovered ?? 0,
            cancersCovered: p.cancersCovered ?? 0,
            duration: p.duration || '120 - 180 phút',
            isPopular: p.isPopular ?? false,
            recommendedFor: p.recommendedFor,
            features: p.features || [],
            imageUrl: p.imageUrl || null,
            sortOrder: p.sortOrder ?? 0,
            isActive: p.isActive ?? true,
            seoTitle: p.seoTitle || null,
            seoDescription: p.seoDescription || null,
            createdAt: now,
            updatedAt: now,
          });
        }
        break;
      }

      case ContentType.CLINIC: {
        const p = payload as {
          name: string;
          legalName: string;
          licenseNumber: string;
          taxCode: string;
          hotline: string;
          emergencyPhone?: string | null;
          zaloUrl: string;
          email: string;
          addressStreet: string;
          addressWard: string;
          addressDistrict: string;
          addressCity: string;
          addressFull: string;
          latitude: string | number;
          longitude: string | number;
          workingHours?: { full?: string; short?: string };
        };

        const existing = await tx.select().from(clinicInfo).where(eq(clinicInfo.id, 'default'));
        if (existing.length > 0) {
          await tx
            .update(clinicInfo)
            .set({
              name: p.name,
              legalName: p.legalName,
              licenseNumber: p.licenseNumber,
              taxCode: p.taxCode,
              hotline: p.hotline,
              emergencyPhone: p.emergencyPhone || null,
              zaloUrl: p.zaloUrl,
              email: p.email,
              addressStreet: p.addressStreet,
              addressWard: p.addressWard,
              addressDistrict: p.addressDistrict,
              addressCity: p.addressCity,
              addressFull: p.addressFull,
              latitude: String(p.latitude),
              longitude: String(p.longitude),
              workingHours: p.workingHours || { full: 'Thứ 2 - Thứ 7: 07:30 - 17:00', short: 'T2 - T7: 07:30 - 17:00' },
              updatedAt: now,
            })
            .where(eq(clinicInfo.id, 'default'));
        } else {
          await tx.insert(clinicInfo).values({
            id: 'default',
            name: p.name,
            legalName: p.legalName,
            licenseNumber: p.licenseNumber,
            taxCode: p.taxCode,
            hotline: p.hotline,
            emergencyPhone: p.emergencyPhone || null,
            zaloUrl: p.zaloUrl,
            email: p.email,
            addressStreet: p.addressStreet,
            addressWard: p.addressWard,
            addressDistrict: p.addressDistrict,
            addressCity: p.addressCity,
            addressFull: p.addressFull,
            latitude: String(p.latitude),
            longitude: String(p.longitude),
            workingHours: p.workingHours || { full: 'Thứ 2 - Thứ 7: 07:30 - 17:00', short: 'T2 - T7: 07:30 - 17:00' },
            updatedAt: now,
          });
        }
        break;
      }

      case ContentType.EQUIPMENT: {
        const p = payload as {
          name: string;
          origin: string;
          manufacturer: string;
          imageUrl: string;
          description: string;
          features?: string[];
          sortOrder?: number;
          isActive?: boolean;
        };

        const existing = await tx.select().from(equipment).where(eq(equipment.id, entityId));
        if (existing.length > 0) {
          await tx
            .update(equipment)
            .set({
              name: p.name,
              origin: p.origin,
              manufacturer: p.manufacturer,
              imageUrl: p.imageUrl,
              description: p.description,
              features: p.features || [],
              sortOrder: p.sortOrder ?? 0,
              isActive: p.isActive ?? true,
              updatedAt: now,
            })
            .where(eq(equipment.id, entityId));
        } else {
          await tx.insert(equipment).values({
            id: entityId,
            name: p.name,
            origin: p.origin,
            manufacturer: p.manufacturer,
            imageUrl: p.imageUrl,
            description: p.description,
            features: p.features || [],
            sortOrder: p.sortOrder ?? 0,
            isActive: p.isActive ?? true,
            createdAt: now,
            updatedAt: now,
          });
        }
        break;
      }

      case ContentType.FAQ: {
        const p = payload as {
          question: string;
          answer: string;
          category?: string;
          sortOrder?: number;
          isPublished?: boolean;
        };

        const existing = await tx.select().from(faqs).where(eq(faqs.id, entityId));
        if (existing.length > 0) {
          await tx
            .update(faqs)
            .set({
              question: p.question,
              answer: p.answer,
              category: p.category || 'general',
              sortOrder: p.sortOrder ?? 0,
              isPublished: p.isPublished ?? true,
              updatedAt: now,
            })
            .where(eq(faqs.id, entityId));
        } else {
          await tx.insert(faqs).values({
            id: entityId,
            question: p.question,
            answer: p.answer,
            category: p.category || 'general',
            sortOrder: p.sortOrder ?? 0,
            isPublished: p.isPublished ?? true,
            createdAt: now,
            updatedAt: now,
          });
        }
        break;
      }

      case ContentType.TESTIMONIAL: {
        const p = payload as {
          type: 'video' | 'customer_story';
          title: string;
          patientName: string;
          patientAge?: number | null;
          videoId?: string | null;
          imageUrl?: string | null;
          quote?: string | null;
          fullStory?: string | null;
          tag?: string | null;
          sortOrder?: number;
          isPublished?: boolean;
        };

        const existing = await tx.select().from(testimonials).where(eq(testimonials.id, entityId));
        if (existing.length > 0) {
          await tx
            .update(testimonials)
            .set({
              type: p.type,
              title: p.title,
              patientName: p.patientName,
              patientAge: p.patientAge ?? null,
              videoId: p.videoId || null,
              imageUrl: p.imageUrl || null,
              quote: p.quote || null,
              fullStory: p.fullStory || null,
              tag: p.tag || null,
              sortOrder: p.sortOrder ?? 0,
              isPublished: p.isPublished ?? true,
              updatedAt: now,
            })
            .where(eq(testimonials.id, entityId));
        } else {
          await tx.insert(testimonials).values({
            id: entityId,
            type: p.type,
            title: p.title,
            patientName: p.patientName,
            patientAge: p.patientAge ?? null,
            videoId: p.videoId || null,
            imageUrl: p.imageUrl || null,
            quote: p.quote || null,
            fullStory: p.fullStory || null,
            tag: p.tag || null,
            sortOrder: p.sortOrder ?? 0,
            isPublished: p.isPublished ?? true,
            createdAt: now,
            updatedAt: now,
          });
        }
        break;
      }

      case ContentType.HOMEPAGE: {
        const p = payload as unknown as HomepageData;

        // 1. Hero
        await tx
          .update(homepageBlocks)
          .set({
            title: p.hero.title,
            subtitle: p.hero.subtitle,
            content: {
              desktopBanner: p.hero.desktopBanner,
              mobileBanner: p.hero.mobileBanner,
              ctaTarget: p.hero.ctaTarget,
            },
            updatedAt: now,
          })
          .where(eq(homepageBlocks.blockKey, 'hero'));

        // 2. Pain Points
        await tx
          .update(homepageBlocks)
          .set({
            title: p.painPoints.title,
            subtitle: p.painPoints.subtitle,
            content: {
              items: p.painPoints.items,
            },
            updatedAt: now,
          })
          .where(eq(homepageBlocks.blockKey, 'pain_points'));

        // 3. Benefits
        await tx
          .update(homepageBlocks)
          .set({
            title: p.benefits.title,
            content: {
              moreUrl: p.benefits.moreUrl,
              moreLabel: p.benefits.moreLabel,
              bannerImage: p.benefits.bannerImage,
              bannerVideoId: p.benefits.bannerVideoId,
              items: p.benefits.items,
            },
            updatedAt: now,
          })
          .where(eq(homepageBlocks.blockKey, 'benefits'));

        // 4. Cancer Screening
        await tx
          .update(homepageBlocks)
          .set({
            title: p.cancerScreening.title,
            content: {
              description: p.cancerScreening.description,
              ctaUrl: p.cancerScreening.ctaUrl,
              ctaLabel: p.cancerScreening.ctaLabel,
              featuredCards: p.cancerScreening.featuredCards,
            },
            updatedAt: now,
          })
          .where(eq(homepageBlocks.blockKey, 'cancer_screening'));

        // 5. Banner CTA
        await tx
          .update(homepageBlocks)
          .set({
            title: p.bannerCta.title,
            content: {
              brand: p.bannerCta.brand,
              workingHoursTitle: p.bannerCta.workingHoursTitle,
              workingHoursWeekday: p.bannerCta.workingHoursWeekday,
              workingHoursSunday: p.bannerCta.workingHoursSunday,
              buttonText: p.bannerCta.buttonText,
              buttonTarget: p.bannerCta.buttonTarget,
              desktopImage: p.bannerCta.desktopImage,
              mobileImage: p.bannerCta.mobileImage,
            },
            updatedAt: now,
          })
          .where(eq(homepageBlocks.blockKey, 'banner_cta'));

        // 6. Sections Meta
        await tx
          .update(homepageBlocks)
          .set({
            content: p.sectionsMeta,
            updatedAt: now,
          })
          .where(eq(homepageBlocks.blockKey, 'sections_meta'));

        // 7. Pricing
        await tx
          .update(homepageBlocks)
          .set({
            content: p.pricing,
            updatedAt: now,
          })
          .where(eq(homepageBlocks.blockKey, 'pricing'));

        break;
      }

      default:
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // Pre-Publish Validators
  // ---------------------------------------------------------------------------

  private async validateRouteCollision(
    entityType: ContentTypeId,
    entityId: string,
    payload: Record<string, unknown>
  ): Promise<string | null> {
    const slug = (payload.slug as string)?.trim().toLowerCase();
    if (!slug) return null;

    // 1. Protected reserved collision list
    const RESERVED_PROTECTED_COLLISIONS = new Set([
      'dau-thuong-vi',
      'tieu-chay',
      'di-ngoai-ra-mau',
      'tao-bon',
      'kien-thuc-ung-thu-da-day',
      'kien-thuc-ung-thu-dai-trang',
    ]);

    // If an entity attempts to claim a protected collision
    if (RESERVED_PROTECTED_COLLISIONS.has(slug)) {
      if (entityType === ContentType.ARTICLE && slug.startsWith('kien-thuc-')) {
        return `Đường dẫn (slug) '${slug}' thuộc phân hệ Chuyên mục (Category). Không thể dùng cho bài viết.`;
      }
      return `Đường dẫn (slug) '${slug}' là từ khóa định tuyến được bảo vệ đặc biệt của website.`;
    }

    // 2. Cross-domain slug collision check
    if (entityType === ContentType.ARTICLE) {
      // Check collision against doctors
      const [doc] = await db.select().from(doctors).where(eq(doctors.slug, slug));
      if (doc) return `Đường dẫn (slug) '${slug}' trùng với Bác sĩ: ${doc.name}.`;

      // Check collision against packages
      const [pkg] = await db.select().from(packages).where(eq(packages.slug, slug));
      if (pkg) return `Đường dẫn (slug) '${slug}' trùng với Gói khám: ${pkg.name}.`;

      // Check collision against another article
      const [art] = await db.select().from(articles).where(and(eq(articles.slug, slug), not(eq(articles.id, entityId))));
      if (art) return `Đường dẫn (slug) '${slug}' đã được sử dụng bởi bài viết khác (${art.title}).`;
    } else if (entityType === ContentType.DOCTOR) {
      // Check collision against another doctor
      const [doc] = await db.select().from(doctors).where(and(eq(doctors.slug, slug), not(eq(doctors.id, entityId))));
      if (doc) return `Đường dẫn (slug) '${slug}' đã được sử dụng bởi Bác sĩ khác: ${doc.name}.`;
    } else if (entityType === ContentType.PACKAGE) {
      // Check collision against another package
      const [pkg] = await db.select().from(packages).where(and(eq(packages.slug, slug), not(eq(packages.id, entityId))));
      if (pkg) return `Đường dẫn (slug) '${slug}' đã được sử dụng bởi Gói khám khác: ${pkg.name}.`;

      // Check collision against articles
      const [art] = await db.select().from(articles).where(eq(articles.slug, slug));
      if (art) return `Đường dẫn (slug) '${slug}' trùng với Bài viết: ${art.title}.`;
    } else if (entityType === ContentType.PAGE) {
      // Check collision against another page
      const [page] = await db.select().from(pages).where(and(eq(pages.slug, slug), not(eq(pages.id, entityId))));
      if (page) return `Đường dẫn (slug) '${slug}' đã được sử dụng bởi Trang tĩnh khác (${page.title}).`;

      // Check collision against articles
      const [art] = await db.select().from(articles).where(eq(articles.slug, slug));
      if (art) return `Đường dẫn (slug) '${slug}' trùng với Bài viết: ${art.title}.`;

      // Check collision against categories
      const [cat] = await db.select().from(categories).where(eq(categories.slug, slug));
      if (cat) return `Đường dẫn (slug) '${slug}' trùng với Chuyên mục: ${cat.name}.`;

      // Check collision against doctors
      const [doc] = await db.select().from(doctors).where(eq(doctors.slug, slug));
      if (doc) return `Đường dẫn (slug) '${slug}' trùng với Bác sĩ: ${doc.name}.`;

      // Check collision against packages
      const [pkg] = await db.select().from(packages).where(eq(packages.slug, slug));
      if (pkg) return `Đường dẫn (slug) '${slug}' trùng với Gói khám: ${pkg.name}.`;
    }

    return null;
  }

  private async validateMediaReferences(payload: Record<string, unknown>): Promise<string | null> {
    const featuredImageId = payload.featuredImageId as string | undefined;
    if (featuredImageId) {
      const [img] = await db.select().from(media).where(eq(media.id, featuredImageId));
      if (!img) {
        return `Hình ảnh đại diện (ID: ${featuredImageId}) không tồn tại trong Thư viện Media.`;
      }
      if (img.status === 'archived') {
        return `Hình ảnh đại diện (${img.filename}) đã bị lưu trữ. Vui lòng chọn hình ảnh đang hoạt động.`;
      }
    }
    return null;
  }
}

export const workflowService = new WorkflowService();
