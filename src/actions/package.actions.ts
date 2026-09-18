'use server';

import { getCurrentUser } from '@/services/auth.service';
import { workflowService, WorkflowUserContext } from '@/services/workflow.service';
import { ContentType, WorkflowOperationResult } from '@/lib/workflow/types';
import { ContentRevision } from '@/db/schema/workflow';
import { Permission, hasPermission } from '@/lib/auth/rbac';
import { revisionRepository } from '@/repositories/postgres/postgres-revision.repository';
import { packageRepository } from '@/repositories';

export interface SavePackageDraftInput {
  entityId?: string;
  revisionId?: string;
  expectedVersion?: number;
  payload: {
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
 * Saves a package draft.
 * Enforces pricing authorization boundaries and optimistic concurrency.
 */
export async function savePackageDraftAction(
  input: SavePackageDraftInput
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  const userContext = getUserContext(user);

  // Parse price numeric VND
  const numericPrice = typeof input.payload.priceVnd === 'number'
    ? input.payload.priceVnd
    : Number(String(input.payload.priceVnd).replace(/[^0-9]/g, '')) || 0;

  if (isNaN(numericPrice) || numericPrice < 0) {
    return { success: false, error: 'Giá gói khám không hợp lệ (phải là số nguyên không âm).' };
  }

  const canEditPrice = hasPermission(user.roles, user.permissions, Permission.PACKAGE_EDIT_PRICE);
  if (input.entityId && !canEditPrice) {
    const canonical = await packageRepository.getAdminById(input.entityId);
    if (canonical && canonical.priceVnd !== numericPrice) {
      return {
        success: false,
        error: 'Bạn không có quyền thay đổi bảng giá gói khám thương mại. Thao tác này yêu cầu quyền Quản lý Tài chính.',
      };
    }
  }

  const sanitizedPayload = {
    ...input.payload,
    priceVnd: numericPrice,
    priceFormatted: input.payload.priceFormatted?.trim() || `${numericPrice.toLocaleString('vi-VN')}đ`,
  };

  // 1. Updating an existing draft revision
  if (input.revisionId && typeof input.expectedVersion === 'number') {
    return await workflowService.updateDraftRevision(
      input.revisionId,
      input.expectedVersion,
      sanitizedPayload,
      userContext,
      {
        title: input.payload.name,
        changeSummary: input.changeSummary || 'Cập nhật gói khám',
      }
    );
  }

  // 2. Creating a new draft revision
  const entityId = input.entityId || `pkg-${Date.now()}`;
  return await workflowService.createDraftRevision(
    ContentType.PACKAGE,
    entityId,
    sanitizedPayload,
    userContext,
    {
      title: input.payload.name,
      changeSummary: input.changeSummary || 'Khởi tạo gói khám mới',
    }
  );
}

/**
 * Submits a package draft for review.
 */
export async function submitPackageReviewAction(
  revisionId: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  return await workflowService.submitForReview(revisionId, getUserContext(user));
}

/**
 * Returns an in-review package back to draft with reviewer notes.
 */
export async function returnPackageToDraftAction(
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
 * Approves a package for publication (Requires PACKAGE_EDIT_PRICE or Super Admin).
 */
export async function approvePackageAction(
  revisionId: string,
  reviewNotes?: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  return await workflowService.approveRevision(revisionId, getUserContext(user), {
    medicalReviewNotes: reviewNotes,
  });
}

/**
 * Atomically publishes an approved package revision to canonical tables and features jsonb.
 */
export async function publishPackageAction(
  revisionId: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  return await workflowService.publishRevision(revisionId, getUserContext(user));
}

/**
 * Restores a historical package revision into a new draft revision.
 */
export async function restorePackageRevisionAction(
  revisionId: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  return await workflowService.restoreRevision(revisionId, getUserContext(user));
}

/**
 * Archives / Disables a package.
 */
export async function archivePackageAction(
  revisionId: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  return await workflowService.archiveRevision(revisionId, getUserContext(user));
}

/**
 * Fetches the revision history for a package.
 */
export async function getPackageRevisionsAction(entityId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Yêu cầu đăng nhập.' };
  }

  const isAuthorized = hasPermission(user.roles, user.permissions, Permission.PACKAGE_READ);
  if (!isAuthorized) {
    return { success: false, error: 'Không có quyền xem lịch sử gói khám.' };
  }

  const revisions = await revisionRepository.listByEntity(ContentType.PACKAGE, entityId);
  return { success: true, data: revisions };
}
