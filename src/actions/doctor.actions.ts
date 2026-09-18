'use server';

import { getCurrentUser } from '@/services/auth.service';
import { workflowService, WorkflowUserContext } from '@/services/workflow.service';
import { ContentType, WorkflowOperationResult } from '@/lib/workflow/types';
import { ContentRevision } from '@/db/schema/workflow';
import { Permission, hasPermission } from '@/lib/auth/rbac';
import { revisionRepository } from '@/repositories/postgres/postgres-revision.repository';
import { doctorRepository } from '@/repositories';

export interface SaveDoctorDraftInput {
  entityId?: string;
  revisionId?: string;
  expectedVersion?: number;
  payload: {
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
 * Saves a doctor draft.
 * Enforces CCHN authorization boundaries and optimistic concurrency.
 */
export async function saveDoctorDraftAction(
  input: SaveDoctorDraftInput
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  const userContext = getUserContext(user);

  // Check CCHN modification authorization
  const canEditCchn = hasPermission(user.roles, user.permissions, Permission.DOCTOR_EDIT_CCHN);
  if (input.entityId && !canEditCchn) {
    const canonical = await doctorRepository.getAdminById(input.entityId);
    if (canonical && canonical.cchn !== input.payload.cchn.trim()) {
      return {
        success: false,
        error: 'Bạn không có quyền chỉnh sửa Chứng chỉ hành nghề (CCHN). Thao tác này yêu cầu quyền Giám định Y khoa.',
      };
    }
  }

  // 1. Updating an existing draft revision
  if (input.revisionId && typeof input.expectedVersion === 'number') {
    return await workflowService.updateDraftRevision(
      input.revisionId,
      input.expectedVersion,
      input.payload,
      userContext,
      {
        title: input.payload.name,
        changeSummary: input.changeSummary || 'Cập nhật hồ sơ bác sĩ',
      }
    );
  }

  // 2. Creating a new draft revision
  const entityId = input.entityId || `doc-${Date.now()}`;
  return await workflowService.createDraftRevision(
    ContentType.DOCTOR,
    entityId,
    input.payload,
    userContext,
    {
      title: input.payload.name,
      changeSummary: input.changeSummary || 'Khởi tạo hồ sơ bác sĩ mới',
    }
  );
}

/**
 * Submits a doctor draft for review.
 */
export async function submitDoctorReviewAction(
  revisionId: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  return await workflowService.submitForReview(revisionId, getUserContext(user));
}

/**
 * Returns an in-review doctor profile back to draft with reviewer notes.
 */
export async function returnDoctorToDraftAction(
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
 * Approves a doctor profile for publication (Requires DOCTOR_EDIT_CCHN / Medical Reviewer).
 */
export async function approveDoctorAction(
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
 * Atomically publishes an approved doctor profile to canonical tables and synchronizes specialties.
 */
export async function publishDoctorAction(
  revisionId: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  return await workflowService.publishRevision(revisionId, getUserContext(user));
}

/**
 * Restores a historical doctor revision into a new draft revision.
 */
export async function restoreDoctorRevisionAction(
  revisionId: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  return await workflowService.restoreRevision(revisionId, getUserContext(user));
}

/**
 * Archives / Unpublishes a doctor profile.
 */
export async function archiveDoctorAction(
  revisionId: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  return await workflowService.archiveRevision(revisionId, getUserContext(user));
}

/**
 * Fetches the revision history for a doctor.
 */
export async function getDoctorRevisionsAction(entityId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Yêu cầu đăng nhập.' };
  }

  const isAuthorized = hasPermission(user.roles, user.permissions, Permission.DOCTOR_READ);
  if (!isAuthorized) {
    return { success: false, error: 'Không có quyền xem lịch sử bác sĩ.' };
  }

  const revisions = await revisionRepository.listByEntity(ContentType.DOCTOR, entityId);
  return { success: true, data: revisions };
}
