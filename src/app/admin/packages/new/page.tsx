import React from 'react';
import type { Metadata } from 'next';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { PackageEditorForm } from '@/components/admin/packages/PackageEditorForm';

export const metadata: Metadata = {
  title: 'Tạo Gói Khám Mới | DoctorCheck Admin',
  robots: { index: false, follow: false },
};

export default async function AdminPackageNewPage() {
  const guard = await guardAdminModule(Permission.PACKAGE_EDIT_CONTENT, '/admin/packages/new');

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.PACKAGE_EDIT_CONTENT}
        userRoles={guard.user.roles}
        moduleName="Tạo mới Gói Khám"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PackageEditorForm
        initialPackage={null}
        activeRevision={null}
        userRoles={guard.user.roles}
        userPermissions={guard.user.permissions}
      />
    </div>
  );
}
