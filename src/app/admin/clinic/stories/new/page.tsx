import React from 'react';
import type { Metadata } from 'next';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { CustomerStoryEditorForm } from '@/components/admin/clinic/CustomerStoryEditorForm';

export const metadata: Metadata = {
  title: 'Thêm Mới Câu Chuyện Khách Hàng | DoctorCheck CMS',
  robots: { index: false, follow: false },
};

export default async function AdminNewCustomerStoryPage() {
  const guard = await guardAdminModule(Permission.CLINIC_EDIT, '/admin/clinic/stories/new');

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.CLINIC_EDIT}
        userRoles={guard.user.roles}
        moduleName="Thêm mới Câu chuyện khách hàng"
      />
    );
  }

  return (
    <div>
      <CustomerStoryEditorForm
        initialData={null}
        latestDraftRevision={null}
        userPermissions={guard.user.permissions}
      />
    </div>
  );
}
