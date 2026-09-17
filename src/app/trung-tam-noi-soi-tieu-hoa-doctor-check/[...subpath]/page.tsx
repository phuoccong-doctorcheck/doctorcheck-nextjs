import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { resolveEndoscopySubpath } from '@/lib/routing/resolve-content';
import { staticPagesData } from '@/lib/routing/pages-data';
import { PageTemplate } from '@/components/templates/PageTemplate';
import { generateHubBreadcrumbJsonLd } from '@/lib/seo/structured-data';
import { getPageBySlug } from '@/lib/content/pages-data';

interface SubpathPageProps {
  params: Promise<{ subpath: string[] }>;
}

export async function generateStaticParams() {
  const nestedPages = staticPagesData.filter((p) => !p.isRoot && p.subpath);
  return nestedPages.map((p) => ({
    subpath: p.subpath.split('/'),
  }));
}

export async function generateMetadata({ params }: SubpathPageProps): Promise<Metadata> {
  const { subpath } = await params;
  const content = resolveEndoscopySubpath(subpath);

  if (content.type === 'notFound') {
    return {
      title: 'Không Tìm Thấy Trang - Doctor Check',
      robots: { index: false, follow: false },
    };
  }

  const title = `${content.title} | Trung Tâm Nội Soi Tiêu Hóa Doctor Check`;
  const description = `${content.title} - Chuyên khoa Tiêu Hóa & Nội Soi Dạ Dày, Đại Tràng Tiền Mê Chuẩn Quốc Tế tại Doctor Check.`;

  return {
    title,
    description,
    alternates: {
      canonical: content.canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: content.canonicalUrl,
      siteName: 'Doctor Check',
      locale: 'vi_VN',
      type: 'website',
    },
  };
}

export default async function EndoscopySubpathPage({ params }: SubpathPageProps) {
  const { subpath } = await params;
  const content = resolveEndoscopySubpath(subpath);

  if (content.type === 'notFound' || !content.data?.page) {
    notFound();
  }

  const parentTitles: Record<string, string> = {};
  if (subpath.length > 1) {
    for (let i = 0; i < subpath.length - 1; i++) {
      const seg = subpath[i];
      const matchPage = staticPagesData.find((p) => p.subpath === seg || p.slug === seg);
      if (matchPage) {
        const full = getPageBySlug(matchPage.slug);
        parentTitles[seg] = full?.title || matchPage.title;
      }
    }
  }

  const breadcrumbJsonLd = generateHubBreadcrumbJsonLd(content.title, subpath, parentTitles);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PageTemplate page={content.data.page} pageContent={content.data.pageContent} />
    </>
  );
}
