import React from 'react';
import type { Metadata } from 'next';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { VideoTestimonialEditorForm } from '@/components/admin/clinic/VideoTestimonialEditorForm';

export const metadata: Metadata = {
  title: 'Thêm Mới Video Cảm Nhận | DoctorCheck CMS',
  robots: { index: false, follow: false },
};

export default async function AdminNewVideoTestimonialPage() {
  const guard = await guardAdminModule(Permission.CLINIC_EDIT, '/admin/clinic/testimonials/new');

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.CLINIC_EDIT}
        userRoles={guard.user.roles}
        moduleName="Thêm mới Video cảm nhận"
      />
    );
  }

  return (
    <div>
      <VideoTestimonialEditorForm
        initialData={null}
        latestDraftRevision={null}
        userPermissions={guard.user.permissions}
      />
    </div>
  );
}
