'use server';

import { getCurrentUser } from '@/services/auth.service';
import { workflowService, WorkflowUserContext } from '@/services/workflow.service';
import { ContentType, WorkflowOperationResult } from '@/lib/workflow/types';
import { ContentRevision } from '@/db/schema/workflow';
import { revisionRepository } from '@/repositories/postgres/postgres-revision.repository';
import { Permission, hasPermission } from '@/lib/auth/rbac';
import type { HomepageData } from '@/lib/data/homepage';

function getUserContext(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>): WorkflowUserContext {
  return {
    userId: user.id,
    userEmail: user.email,
    roles: user.roles,
    permissions: user.permissions,
  };
}

// =============================================================================
// HOMEPAGE CMS SERVER ACTIONS
// =============================================================================

export interface SaveHomepageDraftInput {
  revisionId?: string;
  expectedVersion?: number;
  payload: HomepageData;
  changeSummary?: string;
}

/**
 * Saves or updates a Homepage configuration draft in content_revisions.
 * Leaving canonical homepage_blocks UNTOUCHED until publication.
 */
export async function saveHomepageDraftAction(
  input: SaveHomepageDraftInput
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  const userContext = getUserContext(user);

  const canEditHomepage = hasPermission(user.roles, user.permissions, Permission.HOMEPAGE_EDIT);
  if (!canEditHomepage) {
    return { success: false, error: 'Bạn không có quyền chỉnh sửa cấu hình Trang chủ.' };
  }

  const entityId = 'default';

  if (input.revisionId && typeof input.expectedVersion === 'number') {
    return await workflowService.updateDraftRevision(
      input.revisionId,
      input.expectedVersion,
      input.payload as unknown as Record<string, unknown>,
      userContext,
      { changeSummary: input.changeSummary }
    );
  }

  return await workflowService.createDraftRevision(
    ContentType.HOMEPAGE,
    entityId,
    input.payload as unknown as Record<string, unknown>,
    userContext,
    {
      title: input.payload.hero?.title || 'Cấu hình Trang chủ',
      changeSummary: input.changeSummary || 'Cập nhật nội dung cấu hình Trang chủ',
    }
  );
}

/**
 * Submits a homepage draft revision for review.
 */
export async function submitHomepageReviewAction(
  revisionId: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn.' };
  }

  const canEdit = hasPermission(user.roles, user.permissions, Permission.HOMEPAGE_EDIT);
  if (!canEdit) {
    return { success: false, error: 'Bạn không có quyền gửi duyệt Trang chủ.' };
  }

  return await workflowService.submitForReview(revisionId, getUserContext(user));
}

/**
 * Approves a homepage revision (requires HOMEPAGE_PUBLISH permission).
 */
export async function approveHomepageAction(
  revisionId: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn.' };
  }

  const canPublish = hasPermission(user.roles, user.permissions, Permission.HOMEPAGE_PUBLISH);
  if (!canPublish) {
    return { success: false, error: 'Bạn không có quyền phê duyệt Trang chủ.' };
  }

  return await workflowService.approveRevision(revisionId, getUserContext(user));
}

/**
 * Publishes a homepage revision atomically to homepage_blocks.
 */
export async function publishHomepageAction(
  revisionId: string,
  _expectedVersion?: number
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn.' };
  }

  const canPublish = hasPermission(user.roles, user.permissions, Permission.HOMEPAGE_PUBLISH);
  if (!canPublish) {
    return { success: false, error: 'Bạn không có quyền xuất bản Trang chủ.' };
  }

  return await workflowService.publishRevision(revisionId, getUserContext(user));
}

/**
 * Restores a historical homepage revision by creating a new draft revision.
 */
export async function restoreHomepageRevisionAction(
  historicalRevisionId: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn.' };
  }

  const canEdit = hasPermission(user.roles, user.permissions, Permission.HOMEPAGE_EDIT);
  if (!canEdit) {
    return { success: false, error: 'Bạn không có quyền khôi phục phiên bản Trang chủ.' };
  }

  return await workflowService.restoreRevision(historicalRevisionId, getUserContext(user));
}

/**
 * Retrieves the revision history for Homepage.
 */
export async function getHomepageRevisionsAction(): Promise<ContentRevision[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const canRead = hasPermission(user.roles, user.permissions, Permission.HOMEPAGE_EDIT);
  if (!canRead) return [];

  return await revisionRepository.listByEntity(ContentType.HOMEPAGE, 'default');
}

/**
 * Retrieves the latest active draft revision for Homepage if one exists.
 */
export async function getLatestHomepageRevisionAction(): Promise<ContentRevision | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  return await revisionRepository.getLatestByEntity(ContentType.HOMEPAGE, 'default');
}
