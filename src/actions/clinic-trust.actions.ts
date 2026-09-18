'use server';

import { getCurrentUser } from '@/services/auth.service';
import { workflowService, WorkflowUserContext } from '@/services/workflow.service';
import { ContentType, WorkflowOperationResult } from '@/lib/workflow/types';
import { ContentRevision } from '@/db/schema/workflow';
import { revisionRepository } from '@/repositories/postgres/postgres-revision.repository';
import { clinicalTrustRepository, clinicRepository } from '@/repositories';
import { Permission, hasPermission } from '@/lib/auth/rbac';

function getUserContext(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>): WorkflowUserContext {
  return {
    userId: user.id,
    userEmail: user.email,
    roles: user.roles,
    permissions: user.permissions,
  };
}

// =============================================================================
// 1. CLINIC PROFILE ACTIONS
// =============================================================================

export interface SaveClinicDraftInput {
  revisionId?: string;
  expectedVersion?: number;
  payload: {
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
  changeSummary?: string;
}

export async function saveClinicDraftAction(
  input: SaveClinicDraftInput
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  const userContext = getUserContext(user);

  // Check high-impact license/taxCode modification authorization
  const canEditClinic = hasPermission(user.roles, user.permissions, Permission.CLINIC_EDIT);
  if (!canEditClinic) {
    return { success: false, error: 'Bạn không có quyền chỉnh sửa thông tin phòng khám.' };
  }

  const entityId = 'default';

  if (input.revisionId && typeof input.expectedVersion === 'number') {
    return await workflowService.updateDraftRevision(
      input.revisionId,
      input.expectedVersion,
      input.payload,
      userContext,
      {
        title: input.payload.name,
        changeSummary: input.changeSummary || 'Cập nhật hồ sơ phòng khám',
      }
    );
  }

  return await workflowService.createDraftRevision(
    ContentType.CLINIC,
    entityId,
    input.payload,
    userContext,
    {
      title: input.payload.name,
      changeSummary: input.changeSummary || 'Khởi tạo bản nháp hồ sơ phòng khám',
    }
  );
}

export async function submitClinicReviewAction(revisionId: string): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  return await workflowService.submitForReview(revisionId, getUserContext(user));
}

export async function returnClinicToDraftAction(
  revisionId: string,
  reviewNotes?: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  return await workflowService.returnToDraft(revisionId, getUserContext(user), { reviewNotes });
}

export async function approveClinicAction(
  revisionId: string,
  notes?: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  return await workflowService.approveRevision(revisionId, getUserContext(user), { medicalReviewNotes: notes });
}

export async function publishClinicAction(revisionId: string): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  return await workflowService.publishRevision(revisionId, getUserContext(user));
}

export async function restoreClinicRevisionAction(historicalRevisionId: string): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  return await workflowService.restoreRevision(historicalRevisionId, getUserContext(user));
}

export async function getClinicRevisionsAction(): Promise<ContentRevision[]> {
  return await revisionRepository.listByEntity(ContentType.CLINIC, 'default');
}

// =============================================================================
// 2. EQUIPMENT ACTIONS
// =============================================================================

export interface SaveEquipmentDraftInput {
  entityId?: string;
  revisionId?: string;
  expectedVersion?: number;
  payload: {
    name: string;
    origin: string;
    manufacturer: string;
    imageUrl: string;
    description: string;
    features?: string[];
    sortOrder?: number;
    isActive?: boolean;
  };
  changeSummary?: string;
}

export async function saveEquipmentDraftAction(
  input: SaveEquipmentDraftInput
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };

  const userContext = getUserContext(user);
  const isAuthorized = hasPermission(user.roles, user.permissions, Permission.CLINIC_EDIT);
  if (!isAuthorized) return { success: false, error: 'Bạn không có quyền quản lý trang thiết bị.' };

  if (input.revisionId && typeof input.expectedVersion === 'number') {
    return await workflowService.updateDraftRevision(
      input.revisionId,
      input.expectedVersion,
      input.payload,
      userContext,
      {
        title: input.payload.name,
        changeSummary: input.changeSummary || 'Cập nhật thông số trang thiết bị',
      }
    );
  }

  const entityId = input.entityId || `equip-${Date.now()}`;
  return await workflowService.createDraftRevision(
    ContentType.EQUIPMENT,
    entityId,
    input.payload,
    userContext,
    {
      title: input.payload.name,
      changeSummary: input.changeSummary || 'Khởi tạo trang thiết bị mới',
    }
  );
}

export async function publishEquipmentAction(revisionId: string): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  return await workflowService.publishRevision(revisionId, getUserContext(user));
}

export async function archiveEquipmentAction(revisionId: string): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  return await workflowService.archiveRevision(revisionId, getUserContext(user));
}

export async function reorderEquipmentAction(orderedIds: string[]): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  if (!hasPermission(user.roles, user.permissions, Permission.CLINIC_EDIT)) {
    return { success: false, error: 'Bạn không có quyền sắp xếp thứ tự thiết bị.' };
  }

  try {
    await clinicalTrustRepository.reorderEquipment(orderedIds);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function getEquipmentRevisionsAction(entityId: string): Promise<ContentRevision[]> {
  return await revisionRepository.listByEntity(ContentType.EQUIPMENT, entityId);
}

// =============================================================================
// 3. FAQ ACTIONS
// =============================================================================

export interface SaveFaqDraftInput {
  entityId?: string;
  revisionId?: string;
  expectedVersion?: number;
  payload: {
    question: string;
    answer: string;
    category?: string;
    sortOrder?: number;
    isPublished?: boolean;
  };
  changeSummary?: string;
}

export async function saveFaqDraftAction(
  input: SaveFaqDraftInput
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };

  const userContext = getUserContext(user);
  const isAuthorized = hasPermission(user.roles, user.permissions, Permission.CLINICAL_TRUST_EDIT);
  if (!isAuthorized) return { success: false, error: 'Bạn không có quyền quản lý FAQs.' };

  if (input.revisionId && typeof input.expectedVersion === 'number') {
    return await workflowService.updateDraftRevision(
      input.revisionId,
      input.expectedVersion,
      input.payload,
      userContext,
      {
        title: input.payload.question,
        changeSummary: input.changeSummary || 'Cập nhật câu hỏi thường gặp',
      }
    );
  }

  const entityId = input.entityId || `faq-${Date.now()}`;
  return await workflowService.createDraftRevision(
    ContentType.FAQ,
    entityId,
    input.payload,
    userContext,
    {
      title: input.payload.question,
      changeSummary: input.changeSummary || 'Khởi tạo câu hỏi thường gặp mới',
    }
  );
}

export async function publishFaqAction(revisionId: string): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  return await workflowService.publishRevision(revisionId, getUserContext(user));
}

export async function archiveFaqAction(revisionId: string): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  return await workflowService.archiveRevision(revisionId, getUserContext(user));
}

export async function reorderFaqsAction(orderedIds: string[]): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  if (!hasPermission(user.roles, user.permissions, Permission.CLINICAL_TRUST_EDIT)) {
    return { success: false, error: 'Bạn không có quyền sắp xếp thứ tự FAQs.' };
  }

  try {
    await clinicalTrustRepository.reorderFaqs(orderedIds);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function getFaqRevisionsAction(entityId: string): Promise<ContentRevision[]> {
  return await revisionRepository.listByEntity(ContentType.FAQ, entityId);
}

// =============================================================================
// 4. TESTIMONIALS (VIDEOS & CUSTOMER STORIES) ACTIONS
// =============================================================================

export interface SaveTestimonialDraftInput {
  entityId?: string;
  revisionId?: string;
  expectedVersion?: number;
  payload: {
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
  changeSummary?: string;
}

export async function saveTestimonialDraftAction(
  input: SaveTestimonialDraftInput
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };

  const userContext = getUserContext(user);
  const isAuthorized = hasPermission(user.roles, user.permissions, Permission.CLINICAL_TRUST_EDIT);
  if (!isAuthorized) return { success: false, error: 'Bạn không có quyền quản lý cảm nhận & câu chuyện.' };

  // Strict YouTube ID format validation for video testimonials
  if (input.payload.type === 'video' && input.payload.videoId) {
    const vid = input.payload.videoId.trim();
    const cleanId = vid.includes('v=')
      ? vid.split('v=')[1]?.split('&')[0]
      : vid.includes('youtu.be/')
      ? vid.split('youtu.be/')[1]?.split('?')[0]
      : vid;

    if (!cleanId || cleanId.length < 5 || cleanId.includes('<') || cleanId.includes('javascript:')) {
      return { success: false, error: 'Mã YouTube Video ID không hợp lệ.' };
    }
    input.payload.videoId = cleanId;
  }

  if (input.revisionId && typeof input.expectedVersion === 'number') {
    return await workflowService.updateDraftRevision(
      input.revisionId,
      input.expectedVersion,
      input.payload,
      userContext,
      {
        title: input.payload.title,
        changeSummary: input.changeSummary || `Cập nhật ${input.payload.type === 'video' ? 'video cảm nhận' : 'câu chuyện khách hàng'}`,
      }
    );
  }

  const prefix = input.payload.type === 'video' ? 'vid' : 'story';
  const entityId = input.entityId || `${prefix}-${Date.now()}`;
  return await workflowService.createDraftRevision(
    ContentType.TESTIMONIAL,
    entityId,
    input.payload,
    userContext,
    {
      title: input.payload.title,
      changeSummary: input.changeSummary || `Khởi tạo ${input.payload.type === 'video' ? 'video cảm nhận' : 'câu chuyện khách hàng'} mới`,
    }
  );
}

export async function publishTestimonialAction(revisionId: string): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  return await workflowService.publishRevision(revisionId, getUserContext(user));
}

export async function archiveTestimonialAction(revisionId: string): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  return await workflowService.archiveRevision(revisionId, getUserContext(user));
}

export async function reorderTestimonialsAction(orderedIds: string[]): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  if (!hasPermission(user.roles, user.permissions, Permission.CLINICAL_TRUST_EDIT)) {
    return { success: false, error: 'Bạn không có quyền sắp xếp thứ tự cảm nhận.' };
  }

  try {
    await clinicalTrustRepository.reorderTestimonials(orderedIds);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function getTestimonialRevisionsAction(entityId: string): Promise<ContentRevision[]> {
  return await revisionRepository.listByEntity(ContentType.TESTIMONIAL, entityId);
}
