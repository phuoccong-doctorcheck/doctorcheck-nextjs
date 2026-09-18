import React from 'react';
import { notFound } from 'next/navigation';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { pageRepository } from '@/repositories';
import { revisionRepository } from '@/repositories/postgres/postgres-revision.repository';
import { ContentType } from '@/lib/workflow/types';
import { PageTemplate } from '@/components/templates/PageTemplate';
import { computePagePath, PageRouteType } from '@/lib/routing/page-route-policy';
import type { PageRouteMetadata } from '@/lib/routing/route-types';
import type { PageContent } from '@/types/doctorcheck';
import type { Metadata } from 'next';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '[XEM TRƯỚC BẢN NHÁP] Trang Tĩnh / Chuyên Khoa | DoctorCheck Admin',
  robots: { index: false, follow: false },
};

interface AdminPagePreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPagePreviewPage({ params }: AdminPagePreviewPageProps) {
  const { id } = await params;
  const guard = await guardAdminModule(Permission.PAGE_READ, `/admin/pages/${id}/preview`);

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.PAGE_READ}
        userRoles={guard.user.roles}
        moduleName="Xem trước Trang tĩnh"
      />
    );
  }

  // Fetch canonical page and active draft revision
  const [canonicalPage, activeRevision] = await Promise.all([
    pageRepository.getAdminById(id),
    revisionRepository.getLatestByEntity(ContentType.PAGE, id),
  ]);

  if (!canonicalPage && !activeRevision) {
    notFound();
  }

  const payload = activeRevision?.payload as Record<string, unknown> | null;

  const title = (payload?.title as string) || canonicalPage?.title || 'Trang xem thử';
  const slug = (payload?.slug as string) || canonicalPage?.slug || 'trang-xem-thu';
  const routeType = (payload?.routeType as PageRouteType) || (canonicalPage?.isRoot ? PageRouteType.ROOT : PageRouteType.ENDOSCOPY_CHILD);
  const subpath = (payload?.subpath as string) ?? canonicalPage?.subpath ?? '';
  const path = computePagePath({ routeType, slug, subpath });
  const contentHtml = (payload?.contentHtml as string) || canonicalPage?.contentHtml || '<p>Chưa có nội dung</p>';
  const excerpt = (payload?.excerpt as string) || canonicalPage?.excerpt || '';
  const featuredImageUrl = (payload?.featuredImageUrl as string) || canonicalPage?.featuredImageUrl || undefined;

  const pageMeta: PageRouteMetadata = {
    id: typeof canonicalPage?.id === 'number' ? canonicalPage.id : 999999,
    title,
    slug,
    path,
    isRoot: routeType === PageRouteType.ROOT,
    subpath: subpath || '',
    description: (payload?.seoDescription as string) || excerpt,
    contentHtml,
  };

  const pageContent: PageContent = {
    id: typeof canonicalPage?.id === 'number' ? canonicalPage.id : 999999,
    slug,
    title,
    excerpt,
    contentHtml,
    featuredImageUrl,
    dataClassification: 'VERIFIED_PRODUCTION',
    seoTitle: (payload?.seoTitle as string) || title,
    metaDescription: (payload?.seoDescription as string) || excerpt,
  };

  const status = activeRevision?.status || canonicalPage?.status || 'draft';
  const revNum = activeRevision?.revisionNumber ?? 1;

  return (
    <div className="relative min-h-screen">
      {/* Floating Preview Watermark Bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between bg-amber-500 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-md">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 text-slate-900" />
          <span>
            CHẾ ĐỘ XEM TRƯỚC TRANG (PREVIEW DRAFT v{revNum} - Trạng thái: {status.toUpperCase()}) — KHÔNG CÔNG KHAI
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded bg-amber-600/30 px-2 py-0.5 text-[11px] font-mono">
            Đường dẫn dự kiến: {path}
          </span>
          <Link
            href={`/admin/pages/${id}`}
            className="inline-flex items-center gap-1 rounded bg-slate-900 px-2.5 py-1 text-xs text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Quay lại Trình Biên Tập
          </Link>
        </div>
      </div>

      {/* Render Public Template */}
      <PageTemplate page={pageMeta} pageContent={pageContent} />
    </div>
  );
}
