import React from 'react';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { CategoryManager } from '@/components/admin/categories/CategoryManager';
import { categoryRepository } from '@/repositories';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản Lý Chuyên Mục | DoctorCheck CMS',
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  const guard = await guardAdminModule(Permission.CATEGORY_MANAGE, '/admin/categories');

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.CATEGORY_MANAGE}
        userRoles={guard.user.roles}
        moduleName="Chuyên mục Bài viết"
      />
    );
  }

  const categories = await categoryRepository.getAll();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản Lý Chuyên Mục Bài Viết"
        description="Quản lý 30 danh mục phân loại bài viết y khoa, tối ưu SEO và bảo vệ định tuyến gốc"
        iconName="FolderTree"
        phaseBadge="CMS-5"
        statusBadge={`PostgreSQL: ${categories.length} chuyên mục`}
      />

      <CategoryManager initialCategories={categories} />
    </div>
  );
}
