import React from 'react';
import type { Metadata } from 'next';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { FaqEditorForm } from '@/components/admin/clinic/FaqEditorForm';

export const metadata: Metadata = {
  title: 'Thêm Mới Câu Hỏi Thường Gặp | DoctorCheck CMS',
  robots: { index: false, follow: false },
};

export default async function AdminNewFaqPage() {
  const guard = await guardAdminModule(Permission.CLINIC_EDIT, '/admin/clinic/faqs/new');

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.CLINIC_EDIT}
        userRoles={guard.user.roles}
        moduleName="Thêm mới Câu hỏi thường gặp"
      />
    );
  }

  return (
    <div>
      <FaqEditorForm
        initialData={null}
        latestDraftRevision={null}
        userPermissions={guard.user.permissions}
      />
    </div>
  );
}
