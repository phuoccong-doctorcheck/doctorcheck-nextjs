import React from 'react';
import type { Metadata } from 'next';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { EquipmentEditorForm } from '@/components/admin/clinic/EquipmentEditorForm';

export const metadata: Metadata = {
  title: 'Thêm Mới Trang Thiết Bị | DoctorCheck CMS',
  robots: { index: false, follow: false },
};

export default async function AdminNewEquipmentPage() {
  const guard = await guardAdminModule(Permission.CLINIC_EDIT, '/admin/clinic/equipment/new');

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.CLINIC_EDIT}
        userRoles={guard.user.roles}
        moduleName="Thêm mới Trang thiết bị"
      />
    );
  }

  return (
    <div>
      <EquipmentEditorForm
        initialData={null}
        latestDraftRevision={null}
        userPermissions={guard.user.permissions}
      />
    </div>
  );
}
