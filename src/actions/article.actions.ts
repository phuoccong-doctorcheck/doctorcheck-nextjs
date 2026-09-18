'use server';

import { getCurrentUser } from '@/services/auth.service';
import { workflowService, WorkflowUserContext } from '@/services/workflow.service';
import { ContentType, WorkflowOperationResult } from '@/lib/workflow/types';
import { ContentRevision } from '@/db/schema/workflow';
import { Permission, hasPermission } from '@/lib/auth/rbac';
import { revisionRepository } from '@/repositories/postgres/postgres-revision.repository';

export interface SaveArticleDraftInput {
  entityId?: string;
  revisionId?: string;
  expectedVersion?: number;
  payload: {
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
  changeSummary?: string;
}

function getUserContext(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>): WorkflowUserContext {
  return {
    userId: user.id,
    userEmail: user.email,
    roles: user.roles,
    permissions: user.permissions,
  };
}

/**
 * Saves an article draft.
 * If revisionId and expectedVersion are provided, updates the existing draft revision with concurrency check.
 * Otherwise, creates a new draft revision.
 */
export async function saveArticleDraftAction(
  input: SaveArticleDraftInput
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  const userContext = getUserContext(user);

  // 1. Updating an existing draft revision
  if (input.revisionId && typeof input.expectedVersion === 'number') {
    return await workflowService.updateDraftRevision(
      input.revisionId,
      input.expectedVersion,
      input.payload,
      userContext,
      {
        title: input.payload.title,
        changeSummary: input.changeSummary || 'Cập nhật bản nháp',
      }
    );
  }

  // 2. Creating a new draft revision
  const entityId = input.entityId || `art-${Date.now()}`;
  return await workflowService.createDraftRevision(
    ContentType.ARTICLE,
    entityId,
    input.payload,
    userContext,
    {
      title: input.payload.title,
      changeSummary: input.changeSummary || 'Khởi tạo bản nháp bài viết',
    }
  );
}

/**
 * Submits an article draft for medical review.
 */
export async function submitArticleReviewAction(
  revisionId: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  return await workflowService.submitForReview(revisionId, getUserContext(user));
}

/**
 * Returns an in-review article back to draft with reviewer feedback.
 */
export async function returnArticleToDraftAction(
  revisionId: string,
  reviewNotes?: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  return await workflowService.returnToDraft(revisionId, getUserContext(user), { reviewNotes });
}

/**
 * Approves an article for publication (Medical Reviewer).
 */
export async function approveArticleAction(
  revisionId: string,
  medicalReviewNotes?: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  return await workflowService.approveRevision(revisionId, getUserContext(user), {
    medicalReviewNotes,
  });
}

/**
 * Atomically publishes an approved article revision to PostgreSQL canonical tables.
 */
export async function publishArticleAction(
  revisionId: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  return await workflowService.publishRevision(revisionId, getUserContext(user));
}

/**
 * Restores a historical article revision into a new draft revision (History Preservation).
 */
export async function restoreArticleRevisionAction(
  revisionId: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  return await workflowService.restoreRevision(revisionId, getUserContext(user));
}

/**
 * Archives / Unpublishes an article.
 */
export async function archiveArticleAction(
  revisionId: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  return await workflowService.archiveRevision(revisionId, getUserContext(user));
}

/**
 * Fetches the complete revision history for an article.
 */
export async function getArticleRevisionsAction(entityId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Yêu cầu đăng nhập.' };
  }

  const isAuthorized = hasPermission(user.roles, user.permissions, Permission.ARTICLE_READ);
  if (!isAuthorized) {
    return { success: false, error: 'Không có quyền xem lịch sử bài viết.' };
  }

  const revisions = await revisionRepository.listByEntity(ContentType.ARTICLE, entityId);
  return { success: true, data: revisions };
}
