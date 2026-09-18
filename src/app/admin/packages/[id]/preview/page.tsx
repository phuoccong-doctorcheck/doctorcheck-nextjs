import React from 'react';
import { notFound } from 'next/navigation';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { packageRepository } from '@/repositories';
import { revisionRepository } from '@/repositories/postgres/postgres-revision.repository';
import { ContentType } from '@/lib/workflow/types';
import { PackageTemplate } from '@/components/templates/PackageTemplate';
import type { PackageTier } from '@/types/doctorcheck';
import type { Metadata } from 'next';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '[XEM TRƯỚC BẢN NHÁP] Gói Khám & Bảng Giá | DoctorCheck Admin',
  robots: { index: false, follow: false },
};

interface AdminPackagePreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPackagePreviewPage({ params }: AdminPackagePreviewPageProps) {
  const { id } = await params;
  const guard = await guardAdminModule(Permission.PACKAGE_READ, `/admin/packages/${id}/preview`);

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.PACKAGE_READ}
        userRoles={guard.user.roles}
        moduleName="Xem trước Gói Khám"
      />
    );
  }

  // Fetch package detail and active workflow revision
  const [canonicalPackage, activeRevision] = await Promise.all([
    packageRepository.getAdminById(id),
    revisionRepository.getLatestByEntity(ContentType.PACKAGE, id),
  ]);

  if (!canonicalPackage && !activeRevision) {
    notFound();
  }

  const payload = activeRevision?.payload as Record<string, unknown> | null;

  // Reconstruct PackageTier object for preview
  const name = (payload?.name as string) || canonicalPackage?.name || 'Gói Khám DoctorCheck';
  const slug = (payload?.slug as string) || canonicalPackage?.slug || 'goi-kham-xem-thu';
  const gender = (payload?.gender as 'male' | 'female' | 'both') || canonicalPackage?.gender || 'both';
  const priceVnd = Number(payload?.priceVnd ?? canonicalPackage?.priceVnd ?? 0);
  const priceFormatted = (payload?.priceFormatted as string) || canonicalPackage?.priceFormatted || `${priceVnd.toLocaleString('vi-VN')}đ`;
  const tagline = (payload?.tagline as string) || canonicalPackage?.tagline || '';
  const diseasesCovered = Number(payload?.diseasesCovered ?? canonicalPackage?.diseasesCovered ?? 0);
  const cancersCovered = Number(payload?.cancersCovered ?? canonicalPackage?.cancersCovered ?? 0);
  const duration = (payload?.duration as string) || canonicalPackage?.duration || '120 - 180 phút';
  const popular = Boolean(payload?.isPopular ?? canonicalPackage?.isPopular ?? false);
  const recommendedFor = (payload?.recommendedFor as string) || canonicalPackage?.recommendedFor || '';
  const features = (payload?.features as string[]) || canonicalPackage?.features || [];
  const image = (payload?.imageUrl as string) || canonicalPackage?.imageUrl || undefined;

  const previewPackage: PackageTier = {
    id: canonicalPackage?.id || id,
    slug,
    name,
    gender,
    price: priceVnd,
    priceFormatted,
    tagline,
    diseasesCovered,
    cancersCovered,
    duration,
    popular,
    features,
    recommendedFor,
    image,
    url: `https://www.doctorcheck.vn/${slug}/`,
    dataClassification: 'VERIFIED_PRODUCTION',
  };

  const status = activeRevision?.status || canonicalPackage?.status || 'draft';
  const revNum = activeRevision?.revisionNumber ?? 1;

  return (
    <div className="relative min-h-screen">
      {/* Floating Preview Watermark Bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between bg-amber-500 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-md">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 text-slate-900" />
          <span>
            CHẾ ĐỘ XEM TRƯỚC GÓI KHÁM & BẢNG GIÁ (PREVIEW DRAFT v{revNum} - Trạng thái: {status.toUpperCase()}) — KHÔNG CÔNG KHAI
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/packages/${id}`}
            className="inline-flex items-center gap-1 rounded bg-slate-900 px-2.5 py-1 text-xs text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Quay lại Trình Biên Tập
          </Link>
        </div>
      </div>

      {/* Render Public Template */}
      <PackageTemplate pkg={previewPackage} />
    </div>
  );
}
