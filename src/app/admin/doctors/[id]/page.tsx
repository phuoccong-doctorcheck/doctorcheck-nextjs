import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { doctorRepository } from '@/repositories';
import { revisionRepository } from '@/repositories/postgres/postgres-revision.repository';
import { ContentType } from '@/lib/workflow/types';
import { DoctorEditorForm } from '@/components/admin/doctors/DoctorEditorForm';

export const metadata: Metadata = {
  title: 'Chỉnh Sửa Hồ Sơ Bác Sĩ | DoctorCheck Admin',
  robots: { index: false, follow: false },
};

interface AdminDoctorEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminDoctorEditPage({ params }: AdminDoctorEditPageProps) {
  const { id } = await params;
  const guard = await guardAdminModule(Permission.DOCTOR_READ, `/admin/doctors/${id}`);

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.DOCTOR_READ}
        userRoles={guard.user.roles}
        moduleName="Chỉnh sửa Hồ sơ Bác sĩ"
      />
    );
  }

  // Load canonical doctor and latest workflow revision in parallel
  const [canonicalDoctor, latestRevision, specialties] = await Promise.all([
    doctorRepository.getAdminById(id),
    revisionRepository.getLatestByEntity(ContentType.DOCTOR, id),
    doctorRepository.getAllSpecialties(),
  ]);

  if (!canonicalDoctor && !latestRevision) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <DoctorEditorForm
        initialDoctor={canonicalDoctor}
        activeRevision={latestRevision}
        specialties={specialties}
        userRoles={guard.user.roles}
        userPermissions={guard.user.permissions}
      />
    </div>
  );
}
