'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/services/auth.service';
import { workflowService, WorkflowUserContext } from '@/services/workflow.service';
import { revisionRepository } from '@/repositories/postgres/postgres-revision.repository';
import { ContentType } from '@/lib/workflow/types';
import { Permission } from '@/lib/auth/rbac';
import { ContentRevision } from '@/db/schema/workflow';
import { PageRouteType, computePagePath, validatePageRoutePolicy } from '@/lib/routing/page-route-policy';

export interface SavePageDraftInput {
  entityId?: string;
  revisionId?: string;
  expectedVersion?: number;
  title: string;
  slug: string;
  routeType: PageRouteType;
  subpath?: string | null;
  excerpt?: string | null;
  contentHtml: string;
  featuredImageUrl?: string | null;
  isUxBuilder?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  changeSummary?: string;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  conflict?: {
    currentVersion: number;
    expectedVersion: number;
    message: string;
  };
}

async function getAuthContext(): Promise<WorkflowUserContext> {
  const user = await getCurrentUser();
  if (!user || !user.isActive) {
    throw new Error('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
  }
  return {
    userId: user.id,
    userEmail: user.email,
    roles: user.roles,
    permissions: user.permissions,
  };
}

/**
 * Saves a page draft revision with optimistic concurrency protection.
 * Never mutates canonical 'pages' table directly.
 */
export async function savePageDraftAction(
  input: SavePageDraftInput
): Promise<ActionResult<ContentRevision>> {
  try {
    const userContext = await getAuthContext();

    // Route policy validation
    const routeValidation = validatePageRoutePolicy(input.routeType, input.slug, input.subpath);
    if (!routeValidation.valid) {
      return { success: false, error: routeValidation.error };
    }

    const computedPath = computePagePath(input.routeType, input.slug, input.subpath);
    const isRoot = input.routeType === PageRouteType.ROOT;

    const payload = {
      title: input.title.trim(),
      slug: input.slug.trim().toLowerCase(),
      path: computedPath,
      routeType: input.routeType,
      subpath: input.routeType === PageRouteType.ENDOSCOPY_CHILD ? (input.subpath || '').trim() : null,
      excerpt: input.excerpt ? input.excerpt.trim() : null,
      contentHtml: input.contentHtml,
      featuredImageUrl: input.featuredImageUrl ? input.featuredImageUrl.trim() : null,
      isRoot,
      isUxBuilder: input.isUxBuilder ?? false,
      status: input.routeType === PageRouteType.INTERNAL ? 'internal' : 'published',
      seoTitle: input.seoTitle ? input.seoTitle.trim() : null,
      seoDescription: input.seoDescription ? input.seoDescription.trim() : null,
    };

    if (input.revisionId && input.expectedVersion !== undefined) {
      // Update existing draft revision with concurrency check
      const result = await workflowService.updateDraftRevision(
        input.revisionId,
        input.expectedVersion,
        payload,
        userContext,
        {
          title: input.title,
          changeSummary: input.changeSummary || 'Lưu bản nháp trang tĩnh',
        }
      );

      if (!result.success) {
        if (result.conflict) {
          return {
            success: false,
            error: result.error,
            conflict: {
              currentVersion: result.conflict.currentVersion,
              expectedVersion: result.conflict.expectedVersion,
              message: result.conflict.message,
            },
          };
        }
        return { success: false, error: result.error };
      }

      revalidatePath('/admin/pages');
      if (input.entityId) {
        revalidatePath(`/admin/pages/${input.entityId}`);
      }
      return { success: true, data: result.data };
    } else {
      // Create new draft revision
      const entityId = input.entityId || `page-${Date.now()}`;
      const result = await workflowService.createDraftRevision(
        ContentType.PAGE,
        entityId,
        payload,
        userContext,
        {
          title: input.title,
          changeSummary: input.changeSummary || 'Khởi tạo bản nháp trang tĩnh',
        }
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      revalidatePath('/admin/pages');
      return { success: true, data: result.data };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi hệ thống khi lưu bản nháp trang tĩnh';
    return { success: false, error: errorMsg };
  }
}

/**
 * Submits a page draft revision for review.
 */
export async function submitPageReviewAction(
  revisionId: string
): Promise<ActionResult<ContentRevision>> {
  try {
    const userContext = await getAuthContext();
    const result = await workflowService.submitForReview(revisionId, userContext);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath('/admin/pages');
    return { success: true, data: result.data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Lỗi khi gửi duyệt' };
  }
}

/**
 * Returns a page revision to draft with feedback.
 */
export async function returnPageToDraftAction(
  revisionId: string,
  notes?: string
): Promise<ActionResult<ContentRevision>> {
  try {
    const userContext = await getAuthContext();
    const result = await workflowService.returnToDraft(
      revisionId,
      userContext,
      notes ? { reviewNotes: notes } : {}
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath('/admin/pages');
    return { success: true, data: result.data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Lỗi khi yêu cầu chỉnh sửa' };
  }
}

/**
 * Approves a page revision.
 */
export async function approvePageAction(
  revisionId: string,
  notes?: string
): Promise<ActionResult<ContentRevision>> {
  try {
    const userContext = await getAuthContext();
    const result = await workflowService.approveRevision(
      revisionId,
      userContext,
      notes ? { medicalReviewNotes: notes } : {}
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath('/admin/pages');
    return { success: true, data: result.data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Lỗi khi phê duyệt trang tĩnh' };
  }
}

/**
 * Atomically publishes a page revision to the canonical pages table.
 */
export async function publishPageAction(
  revisionId: string
): Promise<ActionResult<ContentRevision>> {
  try {
    const userContext = await getAuthContext();
    const result = await workflowService.publishRevision(revisionId, userContext);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath('/admin/pages');
    return { success: true, data: result.data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Lỗi khi xuất bản trang tĩnh' };
  }
}

/**
 * Restores a historical page revision into a new draft.
 */
export async function restorePageRevisionAction(
  revisionId: string
): Promise<ActionResult<ContentRevision>> {
  try {
    const userContext = await getAuthContext();
    const result = await workflowService.restoreRevision(revisionId, userContext);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath('/admin/pages');
    return { success: true, data: result.data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Lỗi khi khôi phục phiên bản' };
  }
}

/**
 * Archives a page revision and marks the canonical page as archived.
 */
export async function archivePageAction(
  revisionId: string
): Promise<ActionResult<ContentRevision>> {
  try {
    const userContext = await getAuthContext();
    const result = await workflowService.archiveRevision(revisionId, userContext);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath('/admin/pages');
    return { success: true, data: result.data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Lỗi khi lưu trữ trang tĩnh' };
  }
}

/**
 * Fetches revision history for a page entity.
 */
export async function getPageRevisionsAction(
  entityId: string
): Promise<ActionResult<ContentRevision[]>> {
  try {
    const userContext = await getAuthContext();
    const hasRead = userContext.permissions.includes(Permission.PAGE_READ);
    if (!hasRead) {
      return { success: false, error: 'Bạn không có quyền xem lịch sử phiên bản trang tĩnh.' };
    }

    const revisions = await revisionRepository.listByEntity(ContentType.PAGE, entityId);
    return { success: true, data: revisions };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Lỗi khi lấy lịch sử phiên bản' };
  }
}
