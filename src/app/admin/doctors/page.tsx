import React from 'react';
import type { Metadata } from 'next';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { doctorRepository } from '@/repositories';
import { DoctorListTable } from '@/components/admin/doctors/DoctorListTable';
import { UserCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Quản Lý Đội Ngũ Bác Sĩ | DoctorCheck Admin',
  robots: { index: false, follow: false },
};

interface AdminDoctorsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    specialtyId?: string;
    status?: string;
  }>;
}

export default async function AdminDoctorsPage({ searchParams }: AdminDoctorsPageProps) {
  const guard = await guardAdminModule(Permission.DOCTOR_READ, '/admin/doctors');

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.DOCTOR_READ}
        userRoles={guard.user.roles}
        moduleName="Quản lý Đội ngũ Bác sĩ"
      />
    );
  }

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search || '';
  const specialtyId = params.specialtyId || '';
  const status = params.status || '';

  const [doctorListResult, specialties] = await Promise.all([
    doctorRepository.listAdmin({
      page,
      pageSize: 15,
      search,
      specialtyId,
      status,
    }),
    doctorRepository.getAllSpecialties(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <UserCheck className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            Đội Ngũ Bác Sĩ & Chuyên Gia
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý hồ sơ bác sĩ, chứng chỉ hành nghề (CCHN), chuyên khoa công tác và phạm vi hoạt động y khoa.
          </p>
        </div>
      </div>

      {/* Main Table */}
      <DoctorListTable initialData={doctorListResult} specialties={specialties} />
    </div>
  );
}
