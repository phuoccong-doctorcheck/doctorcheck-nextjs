import React from 'react';
import { Metadata } from 'next';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { PageEditorForm } from '@/components/admin/pages/PageEditorForm';

export const metadata: Metadata = {
  title: 'Tạo Trang Tĩnh Mới | Doctor Check CMS',
  robots: { index: false, follow: false },
};

export default async function AdminNewPage() {
  const guard = await guardAdminModule(Permission.PAGE_EDIT, '/admin/pages/new');

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.PAGE_EDIT}
        userRoles={guard.user.roles}
        moduleName="Tạo Trang tĩnh mới"
      />
    );
  }

  return (
    <div>
      <PageEditorForm isNew={true} />
    </div>
  );
}
