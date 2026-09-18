import React from 'react';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { MediaLibrary } from '@/components/admin/media/MediaLibrary';
import { mediaRepository } from '@/repositories';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thư Viện Media | DoctorCheck CMS',
  robots: { index: false, follow: false },
};

interface AdminMediaPageProps {
  searchParams: Promise<{
    search?: string;
    mimeType?: string;
    status?: string;
    offset?: string;
    limit?: string;
  }>;
}

export default async function AdminMediaPage({ searchParams }: AdminMediaPageProps) {
  // 1. Server-side Authentication & Permission Guard
  const guard = await guardAdminModule(Permission.MEDIA_UPLOAD, '/admin/media');

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.MEDIA_UPLOAD}
        userRoles={guard.user.roles}
        moduleName="Thư viện Media"
      />
    );
  }

  // 2. Parse Query Parameters
  const params = await searchParams;
  const search = params.search || '';
  const mimeType = params.mimeType || 'all';
  const status = (params.status as 'active' | 'archived' | 'all') || 'active';
  const limit = Math.min(Math.max(parseInt(params.limit || '24', 10), 1), 100);
  const offset = Math.max(parseInt(params.offset || '0', 10), 0);

  // 3. Fetch Media Records from PostgreSQL
  const mediaResult = await mediaRepository.list({
    search: search.trim() || undefined,
    mimeType: mimeType !== 'all' ? mimeType : undefined,
    status,
    limit,
    offset,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // 4. Fetch Stats for Tabs
  const [activeCount, archivedCount] = await Promise.all([
    mediaRepository.count({ status: 'active' }),
    mediaRepository.count({ status: 'archived' }),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Thư Viện Quản Lý Media & Hình Ảnh"
        description="Kho lưu trữ tài nguyên hình ảnh y khoa, tài liệu hướng dẫn và chứng nhận phòng khám"
        iconName="Image"
        phaseBadge="CMS-3: ACTIVE"
        statusBadge={`PostgreSQL: ${activeCount} tệp hoạt động`}
      />

      <MediaLibrary
        initialItems={mediaResult.items}
        total={mediaResult.total}
        limit={limit}
        offset={offset}
        search={search}
        mimeType={mimeType}
        status={status}
        activeCount={activeCount}
        archivedCount={archivedCount}
      />
    </div>
  );
}
