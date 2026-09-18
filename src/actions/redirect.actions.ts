'use server';

import { getCurrentUser } from '@/services/auth.service';
import { redirectRepository, AdminRedirectListOptions, AdminRedirectListResult } from '@/repositories/postgres/postgres-redirect.repository';
import { redirectService } from '@/services/redirect.service';
import { revalidationService, RevalidationListOptions, RevalidationListResult, RevalidationResult } from '@/services/revalidation.service';
import { Permission, hasPermission, Role } from '@/lib/auth/rbac';
import { Redirect } from '@/db/schema/settings';

function getUserContext(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) {
  return {
    userId: user.id,
    userEmail: user.email,
    roles: user.roles,
    permissions: user.permissions,
  };
}

/**
 * Lists redirects for admin management.
 */
export async function listRedirectsAction(
  options: AdminRedirectListOptions = {}
): Promise<{ success: boolean; data?: AdminRedirectListResult; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  const isAuthorized =
    hasPermission(user.roles, user.permissions, Permission.REDIRECTS_MANAGE) ||
    user.roles.includes(Role.SUPER_ADMIN) ||
    user.roles.includes(Role.ADMIN);

  if (!isAuthorized) {
    return { success: false, error: 'Bạn không có quyền xem danh sách chuyển hướng.' };
  }

  try {
    const result = await redirectRepository.list(options);
    return { success: true, data: result };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Lỗi truy vấn danh sách chuyển hướng: ${msg}` };
  }
}

/**
 * Disables an active redirect record.
 */
export async function disableRedirectAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  const isAuthorized =
    hasPermission(user.roles, user.permissions, Permission.REDIRECTS_MANAGE) ||
    user.roles.includes(Role.SUPER_ADMIN);

  if (!isAuthorized) {
    return { success: false, error: 'Bạn không có quyền vô hiệu hóa chuyển hướng này.' };
  }

  try {
    const userContext = getUserContext(user);
    const ok = await redirectService.disableRedirect(id, userContext);
    if (!ok) {
      return { success: false, error: 'Không tìm thấy bản ghi chuyển hướng để vô hiệu hóa.' };
    }
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Lỗi vô hiệu hóa chuyển hướng: ${msg}` };
  }
}

/**
 * Enables a disabled redirect record.
 */
export async function enableRedirectAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  const isAuthorized =
    hasPermission(user.roles, user.permissions, Permission.REDIRECTS_MANAGE) ||
    user.roles.includes(Role.SUPER_ADMIN);

  if (!isAuthorized) {
    return { success: false, error: 'Bạn không có quyền kích hoạt chuyển hướng này.' };
  }

  try {
    const userContext = getUserContext(user);
    const ok = await redirectService.enableRedirect(id, userContext);
    if (!ok) {
      return { success: false, error: 'Không tìm thấy bản ghi chuyển hướng để kích hoạt.' };
    }
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Lỗi kích hoạt chuyển hướng: ${msg}` };
  }
}

/**
 * Creates an authorized manual redirect.
 */
export async function createManualRedirectAction(
  sourcePath: string,
  targetPath: string
): Promise<{ success: boolean; data?: Redirect; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  const isAuthorized =
    hasPermission(user.roles, user.permissions, Permission.REDIRECTS_MANAGE) ||
    user.roles.includes(Role.SUPER_ADMIN);

  if (!isAuthorized) {
    return { success: false, error: 'Bạn không có quyền tạo chuyển hướng thủ công.' };
  }

  try {
    const record = await redirectService.createPublishedRouteRedirect({
      sourcePath,
      targetPath,
      createdBy: user.id,
      statusCode: 301,
    });
    return { success: true, data: record };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Lists revalidation operations from the outbox.
 */
export async function listRevalidationOperationsAction(
  options: RevalidationListOptions = {}
): Promise<{ success: boolean; data?: RevalidationListResult; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  const isAuthorized =
    user.roles.includes(Role.SUPER_ADMIN) ||
    user.roles.includes(Role.ADMIN) ||
    hasPermission(user.roles, user.permissions, Permission.REDIRECTS_MANAGE);

  if (!isAuthorized) {
    return { success: false, error: 'Bạn không có quyền xem nhật ký revalidation.' };
  }

  try {
    const result = await revalidationService.listOperations(options);
    return { success: true, data: result };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Lỗi truy vấn tác vụ revalidation: ${msg}` };
  }
}

/**
 * Idempotently retries a failed revalidation operation.
 */
export async function retryRevalidationAction(
  operationId: string
): Promise<RevalidationResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      revalidatedPaths: [],
      revalidatedTags: [],
      error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.',
    };
  }

  const isAuthorized =
    user.roles.includes(Role.SUPER_ADMIN) ||
    user.roles.includes(Role.ADMIN) ||
    hasPermission(user.roles, user.permissions, Permission.REDIRECTS_MANAGE);

  if (!isAuthorized) {
    return {
      success: false,
      revalidatedPaths: [],
      revalidatedTags: [],
      error: 'Bạn không có quyền thực hiện thử lại revalidation.',
    };
  }

  return await revalidationService.retryOperation(operationId);
}
