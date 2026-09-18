'use server';

import { getCurrentUser } from '@/services/auth.service';
import { Permission, hasPermission } from '@/lib/auth/rbac';
import { categoryRepository } from '@/repositories';
import { revalidationService } from '@/services/revalidation.service';
import { logAuditEvent } from '@/lib/auth/audit';
import { CreateCategoryInput, UpdateCategoryInput } from '@/repositories/contracts/category.repository';

const PROTECTED_CATEGORY_SLUGS = new Set([
  'kien-thuc-ung-thu-da-day',
  'kien-thuc-ung-thu-dai-trang',
]);

/**
 * Creates a new article taxonomy category.
 */
export async function createCategoryAction(input: CreateCategoryInput) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  const isAuthorized = hasPermission(user.roles, user.permissions, Permission.CATEGORY_MANAGE);
  if (!isAuthorized) {
    return { success: false, error: 'Bạn không có quyền quản lý chuyên mục (Yêu cầu quyền category.manage).' };
  }

  const name = input.name?.trim();
  const slug = input.slug?.trim().toLowerCase();

  if (!name || name.length < 2) {
    return { success: false, error: 'Tên chuyên mục phải có ít nhất 2 ký tự.' };
  }

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return { success: false, error: 'Đường dẫn (slug) phải viết thường, chỉ gồm chữ cái, số và dấu gạch ngang.' };
  }

  // Check collision with existing category
  const existing = await categoryRepository.getBySlug(slug);
  if (existing) {
    return { success: false, error: `Đường dẫn '${slug}' đã được sử dụng bởi chuyên mục khác (${existing.name}).` };
  }

  try {
    const created = await categoryRepository.create({
      ...input,
      name,
      slug,
    });

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      action: 'CATEGORY_CREATE',
      entityType: 'category',
      entityId: String(created.id),
      metadata: { action: 'CREATE_CATEGORY', name: created.name, slug: created.slug },
    });

    await revalidationService.revalidateForEntity('category' as never, String(created.id), { slug: created.slug });

    return { success: true, data: created };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Tạo chuyên mục thất bại: ${msg}` };
  }
}

/**
 * Updates an existing category.
 */
export async function updateCategoryAction(id: string, input: UpdateCategoryInput) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  const isAuthorized = hasPermission(user.roles, user.permissions, Permission.CATEGORY_MANAGE);
  if (!isAuthorized) {
    return { success: false, error: 'Bạn không có quyền quản lý chuyên mục.' };
  }

  const existing = await categoryRepository.getById(id);
  if (!existing) {
    return { success: false, error: 'Không tìm thấy chuyên mục yêu cầu.' };
  }

  // Prevent changing protected collision slugs
  if (input.slug && input.slug !== existing.slug) {
    if (PROTECTED_CATEGORY_SLUGS.has(existing.slug)) {
      return {
        success: false,
        error: `Chuyên mục '${existing.name}' là từ khóa định tuyến được bảo vệ của hệ thống. Không thể thay đổi đường dẫn (slug).`,
      };
    }
  }

  try {
    const updated = await categoryRepository.update(id, input);
    if (!updated) {
      return { success: false, error: 'Cập nhật chuyên mục thất bại.' };
    }

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      action: 'CATEGORY_UPDATE',
      entityType: 'category',
      entityId: id,
      metadata: { action: 'UPDATE_CATEGORY', name: updated.name, slug: updated.slug },
    });

    await revalidationService.revalidateForEntity('category' as never, id, { slug: updated.slug });

    return { success: true, data: updated };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Cập nhật chuyên mục thất bại: ${msg}` };
  }
}

/**
 * Deletes a category if zero articles are associated with it.
 */
export async function deleteCategoryAction(id: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  const isAuthorized = hasPermission(user.roles, user.permissions, Permission.CATEGORY_MANAGE);
  if (!isAuthorized) {
    return { success: false, error: 'Bạn không có quyền quản lý chuyên mục.' };
  }

  const existing = await categoryRepository.getById(id);
  if (!existing) {
    return { success: false, error: 'Không tìm thấy chuyên mục yêu cầu.' };
  }

  if (PROTECTED_CATEGORY_SLUGS.has(existing.slug)) {
    return {
      success: false,
      error: `Chuyên mục '${existing.name}' là danh mục gốc cốt lõi của website. Không thể xóa.`,
    };
  }

  const usageCount = await categoryRepository.getUsageCount(id);
  if (usageCount > 0) {
    return {
      success: false,
      error: `Không thể xóa chuyên mục '${existing.name}' vì đang có ${usageCount} bài viết liên kết. Vui lòng chuyển hoặc gỡ các bài viết trước khi xóa.`,
    };
  }

  try {
    const success = await categoryRepository.delete(id);
    if (!success) {
      return { success: false, error: 'Xóa chuyên mục thất bại.' };
    }

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      action: 'CATEGORY_DELETE',
      entityType: 'category',
      entityId: id,
      metadata: { action: 'DELETE_CATEGORY', name: existing.name, slug: existing.slug },
    });

    await revalidationService.revalidateForEntity('category' as never, id, { slug: existing.slug });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Xóa chuyên mục thất bại: ${msg}` };
  }
}
