import React from 'react';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { ArticleEditorForm } from '@/components/admin/articles/ArticleEditorForm';
import { categoryRepository } from '@/repositories';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tạo Bài Viết Mới | DoctorCheck CMS',
  robots: { index: false, follow: false },
};

export default async function AdminNewArticlePage() {
  const guard = await guardAdminModule(Permission.ARTICLE_CREATE, '/admin/articles/new');

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.ARTICLE_CREATE}
        userRoles={guard.user.roles}
        moduleName="Tạo Bài viết Y khoa"
      />
    );
  }

  const allCategories = await categoryRepository.getAll();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tạo Bài Viết Y Khoa Mới"
        description="Khởi tạo bản nháp bài viết chuyên môn y khoa. Nội dung lưu ở trạng thái bản nháp không ảnh hưởng website công khai."
        iconName="FileText"
        phaseBadge="CMS-5"
        statusBadge="Khởi tạo Bản Nháp"
      />

      <ArticleEditorForm
        allCategories={allCategories}
        userRoles={guard.user.roles}
        userPermissions={guard.user.permissions}
      />
    </div>
  );
}
