import React from 'react';
import type { Metadata } from 'next';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { doctorRepository } from '@/repositories';
import { DoctorEditorForm } from '@/components/admin/doctors/DoctorEditorForm';

export const metadata: Metadata = {
  title: 'Thêm Bác Sĩ Mới | DoctorCheck Admin',
  robots: { index: false, follow: false },
};

export default async function AdminDoctorNewPage() {
  const guard = await guardAdminModule(Permission.DOCTOR_EDIT_BIO, '/admin/doctors/new');

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.DOCTOR_EDIT_BIO}
        userRoles={guard.user.roles}
        moduleName="Tạo mới Hồ sơ Bác sĩ"
      />
    );
  }

  const specialties = await doctorRepository.getAllSpecialties();

  return (
    <div className="space-y-6">
      <DoctorEditorForm
        initialDoctor={null}
        activeRevision={null}
        specialties={specialties}
        userRoles={guard.user.roles}
        userPermissions={guard.user.permissions}
      />
    </div>
  );
}
