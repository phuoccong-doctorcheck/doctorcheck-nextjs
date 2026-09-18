'use server';

import { getCurrentUser } from '@/services/auth.service';
import { Permission, hasPermission } from '@/lib/auth/rbac';
import { mediaService, MediaOperationResult } from '@/services/media.service';
import { Media } from '@/db/schema/media';
import { MediaReference } from '@/repositories/contracts/media.repository';
import { revalidatePath } from 'next/cache';

/**
 * Server Action to update Alt text and Caption for a media item.
 */
export async function updateMediaMetadataAction(
  id: string,
  updates: { altText?: string; caption?: string | null }
): Promise<MediaOperationResult<Media>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn.' };
  }

  const isAuthorized = hasPermission(user.roles, user.permissions, Permission.MEDIA_UPLOAD);
  if (!isAuthorized) {
    return { success: false, error: 'Bạn không có quyền chỉnh sửa thông tin media.' };
  }

  const result = await mediaService.updateMediaMetadata(id, updates, {
    userId: user.id,
    userEmail: user.email,
  });

  if (result.success) {
    revalidatePath('/admin/media');
  }

  return result;
}

/**
 * Server Action to archive a media item.
 */
export async function archiveMediaAction(id: string): Promise<MediaOperationResult<Media>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn.' };
  }

  const isAuthorized = hasPermission(user.roles, user.permissions, Permission.MEDIA_DELETE);
  if (!isAuthorized) {
    return { success: false, error: 'Bạn không có quyền lưu trữ media (Yêu cầu quyền media.delete).' };
  }

  const result = await mediaService.archiveMedia(id, {
    userId: user.id,
    userEmail: user.email,
  });

  if (result.success) {
    revalidatePath('/admin/media');
  }

  return result;
}

/**
 * Server Action to delete a media item safely with reference checking.
 */
export async function deleteMediaAction(id: string): Promise<MediaOperationResult<boolean>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn.' };
  }

  const isAuthorized = hasPermission(user.roles, user.permissions, Permission.MEDIA_DELETE);
  if (!isAuthorized) {
    return { success: false, error: 'Bạn không có quyền xóa media (Yêu cầu quyền media.delete).' };
  }

  const result = await mediaService.deleteMedia(id, {
    userId: user.id,
    userEmail: user.email,
  });

  if (result.success) {
    revalidatePath('/admin/media');
  }

  return result;
}

/**
 * Server Action to check references for a media item.
 */
export async function checkMediaReferencesAction(id: string): Promise<MediaReference[]> {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  return mediaService.checkReferences(id);
}
