import React from 'react';
import { notFound } from 'next/navigation';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { doctorRepository } from '@/repositories';
import { revisionRepository } from '@/repositories/postgres/postgres-revision.repository';
import { ContentType } from '@/lib/workflow/types';
import { DoctorTemplate } from '@/components/templates/DoctorTemplate';
import type { Doctor } from '@/types/doctorcheck';
import type { Metadata } from 'next';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '[XEM TRƯỚC BẢN NHÁP] Hồ Sơ Bác Sĩ | DoctorCheck Admin',
  robots: { index: false, follow: false },
};

interface AdminDoctorPreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminDoctorPreviewPage({ params }: AdminDoctorPreviewPageProps) {
  const { id } = await params;
  const guard = await guardAdminModule(Permission.DOCTOR_READ, `/admin/doctors/${id}/preview`);

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.DOCTOR_READ}
        userRoles={guard.user.roles}
        moduleName="Xem trước Hồ sơ Bác sĩ"
      />
    );
  }

  // Fetch doctor detail and active workflow revision
  const [canonicalDoctor, activeRevision] = await Promise.all([
    doctorRepository.getAdminById(id),
    revisionRepository.getLatestByEntity(ContentType.DOCTOR, id),
  ]);

  if (!canonicalDoctor && !activeRevision) {
    notFound();
  }

  const payload = activeRevision?.payload as Record<string, unknown> | null;

  // Reconstruct Doctor object for preview
  const name = (payload?.name as string) || canonicalDoctor?.name || 'Bác sĩ DoctorCheck';
  const title = (payload?.title as string) || canonicalDoctor?.title || 'Bác Sĩ Chuyên Khoa';
  const specialty = (payload?.specialtySummary as string) || canonicalDoctor?.specialtySummary || 'Nội Tổng Hợp';
  const cchn = (payload?.cchn as string) || canonicalDoctor?.cchn || '000000/HCM-CCHN';
  const clinicalScope = (payload?.clinicalScope as string) || canonicalDoctor?.clinicalScope || '';
  const hospital = (payload?.hospital as string) || canonicalDoctor?.hospital || 'Phòng khám DoctorCheck';
  const image = (payload?.imageUrl as string) || canonicalDoctor?.imageUrl || '/sites/doctorcheck-vn/root/images/doctors/trinh-ai-nhi.webp';
  const description = (payload?.description as string) || canonicalDoctor?.description || '';
  const schedule = (payload?.schedule as string) || canonicalDoctor?.schedule || 'Thứ 2 - Thứ 7';
  const experienceYears = Number(payload?.experienceYears ?? canonicalDoctor?.experienceYears ?? 10);
  const featured = Boolean(payload?.isFeatured ?? canonicalDoctor?.isFeatured ?? true);

  const previewDoctor: Doctor = {
    id: canonicalDoctor?.id || id,
    name,
    title,
    specialty,
    cchn,
    clinicalScope,
    hospital,
    image,
    description,
    schedule,
    experienceYears,
    featured,
    dataClassification: 'VERIFIED_PRODUCTION',
  };

  const status = activeRevision?.status || canonicalDoctor?.status || 'draft';
  const revNum = activeRevision?.revisionNumber ?? 1;

  return (
    <div className="relative min-h-screen">
      {/* Floating Preview Watermark Bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between bg-amber-500 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-md">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 text-slate-900" />
          <span>
            CHẾ ĐỘ XEM TRƯỚC HỒ SƠ BÁC SĨ (PREVIEW DRAFT v{revNum} - Trạng thái: {status.toUpperCase()}) — KHÔNG CÔNG KHAI
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/doctors/${id}`}
            className="inline-flex items-center gap-1 rounded bg-slate-900 px-2.5 py-1 text-xs text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Quay lại Trình Biên Tập
          </Link>
        </div>
      </div>

      {/* Render Public Template */}
      <DoctorTemplate doctor={previewDoctor} />
    </div>
  );
}
