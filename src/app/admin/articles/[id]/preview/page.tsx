import React from 'react';
import { notFound } from 'next/navigation';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { articleRepository } from '@/repositories';
import { revisionRepository } from '@/repositories/postgres/postgres-revision.repository';
import { ContentType } from '@/lib/workflow/types';
import { ArticleTemplate } from '@/components/templates/ArticleTemplate';
import { extractTableOfContents } from '@/lib/content/toc-generator';
import type { MedicalArticle } from '@/types/doctorcheck';
import type { Metadata } from 'next';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '[XEM TRƯỚC BẢN NHÁP] Bài Viết Y Khoa | DoctorCheck Admin',
  robots: { index: false, follow: false },
};

interface AdminArticlePreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminArticlePreviewPage({ params }: AdminArticlePreviewPageProps) {
  const { id } = await params;
  const guard = await guardAdminModule(Permission.ARTICLE_READ, `/admin/articles/${id}/preview`);

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.ARTICLE_READ}
        userRoles={guard.user.roles}
        moduleName="Xem trước Bài viết Y khoa"
      />
    );
  }

  // Fetch article detail and active workflow revision
  const [canonicalArticle, activeRevision] = await Promise.all([
    articleRepository.getAdminById(id),
    revisionRepository.getLatestByEntity(ContentType.ARTICLE, id),
  ]);

  if (!canonicalArticle && !activeRevision) {
    notFound();
  }

  const payload = activeRevision?.payload as Record<string, unknown> | null;

  // Reconstruct MedicalArticle for preview
  const contentHtml = (payload?.contentHtml as string) || canonicalArticle?.contentHtml || '<p>Chưa có nội dung</p>';
  const title = (payload?.title as string) || canonicalArticle?.title || 'Bài viết xem thử';
  const slug = (payload?.slug as string) || canonicalArticle?.slug || 'bai-viet-xem-thu';
  const excerpt = (payload?.excerpt as string) || canonicalArticle?.excerpt || '';
  const featuredImageUrl = (payload?.featuredImageUrl as string) || canonicalArticle?.featuredImageUrl || '';
  const authorName = (payload?.authorName as string) || canonicalArticle?.authorName || 'Bác sĩ DoctorCheck';
  const authorTitle = (payload?.authorTitle as string) || canonicalArticle?.authorTitle || 'Chuyên khoa Tiêu hóa - Nội soi';
  const categoryIds = (payload?.categoryIds as string[]) || canonicalArticle?.categories?.map((c) => String(c.id)) || ['1'];

  const previewArticle: MedicalArticle = {
    id: typeof canonicalArticle?.id === 'number' ? canonicalArticle.id : 999999,
    slug,
    title,
    excerpt,
    contentHtml,
    featuredImageUrl,
    authorName,
    authorTitle,
    date: canonicalArticle?.publishedAt?.toISOString() || new Date().toISOString(),
    modified: new Date().toISOString(),
    categories: categoryIds.map((c) => Number(c) || 1),
    link: `https://www.doctorcheck.vn/${slug}/`,
    status: 'AUTHENTIC_METADATA_VERIFIED',
    contentImportStatus: 'CONTENT_MIGRATED_VERIFIED',
    dataClassification: 'VERIFIED_PRODUCTION',
    tableOfContents: extractTableOfContents(contentHtml),
    seoTitle: (payload?.seoTitle as string) || title,
    metaDescription: (payload?.seoDescription as string) || excerpt,
  };

  const status = activeRevision?.status || canonicalArticle?.status || 'draft';
  const revNum = activeRevision?.revisionNumber ?? 1;

  return (
    <div className="relative min-h-screen">
      {/* Floating Preview Watermark Bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between bg-amber-500 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-md">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 text-slate-900" />
          <span>
            CHẾ ĐỘ XEM TRƯỚC BẢN NHÁP (PREVIEW DRAFT v{revNum} - Trạng thái: {status.toUpperCase()}) — KHÔNG CÔNG KHAI
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/articles/${id}`}
            className="inline-flex items-center gap-1 rounded bg-slate-900 px-2.5 py-1 text-xs text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Quay lại Trình Biên Tập
          </Link>
        </div>
      </div>

      {/* Render Public Template */}
      <ArticleTemplate article={previewArticle} />
    </div>
  );
}
