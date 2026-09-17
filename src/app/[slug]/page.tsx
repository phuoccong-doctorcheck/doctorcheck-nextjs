import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { resolveContent, getAllRootSlugs } from '@/lib/routing/resolve-content';
import { ArticleTemplate } from '@/components/templates/ArticleTemplate';
import { PackageTemplate } from '@/components/templates/PackageTemplate';
import { CategoryTemplate } from '@/components/templates/CategoryTemplate';
import { PageTemplate } from '@/components/templates/PageTemplate';
import {
  generateArticleJsonLd,
  generatePackageJsonLd,
  generateArticleBreadcrumbJsonLd,
  generatePackageBreadcrumbJsonLd,
  generateCategoryBreadcrumbJsonLd,
} from '@/lib/seo/structured-data';
import { categoriesData } from '@/lib/data/categories';
import type { MedicalArticle } from '@/types/doctorcheck';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllRootSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = resolveContent(slug);

  if (content.type === 'notFound' || content.type === 'redirect') {
    return {
      title: 'Không Tìm Thấy Trang - Doctor Check',
      robots: { index: false, follow: false },
    };
  }

  const article = content.type === 'article' ? (content.data?.article as MedicalArticle) : undefined;
  const pkg = content.type === 'package' ? content.data?.package : undefined;

  const isAboutPage = slug === 've-chung-toi' || slug === 've-doctor-check';
  const title = isAboutPage
    ? (slug === 've-doctor-check' ? 'Về Doctor Check' : 'Về chúng tôi - Doctor Check')
    : `${content.title} | Doctor Check Tầm Soát Bệnh`;
  const description = isAboutPage
    ? 'Thấu hiểu SỨC KHỎE LÀ VÀNG - nền tảng của cuộc sống trọn vẹn và hạnh phúc, Doctor Check được thành lập giúp bạn bắt đầu hành trình bảo vệ sức khỏe toàn diện'
    : article?.excerpt ||
      (content.type === 'article'
        ? `Bài viết y khoa: ${content.title}. Hướng dẫn tầm soát bệnh lý tiêu hóa, nội soi không đau và phát hiện sớm ung thư tại Doctor Check.`
        : content.type === 'package'
        ? `Gói khám tầm soát: ${content.title}. Chi phí niêm yết minh bạch, Bác sĩ Chuyên khoa II trực tiếp tư vấn.`
        : content.type === 'category'
        ? `Tổng hợp kiến thức y khoa chuyên mục ${content.title}. Tư vấn chuyên môn bởi Bác sĩ Chuyên khoa II Doctor Check.`
        : `${content.title} - Trung tâm Tầm Soát Bệnh & Nội Soi Tiêu Hóa Doctor Check TP.HCM.`);

  const ogImage = isAboutPage
    ? 'https://www.doctorcheck.vn/wp-content/uploads/2024/12/bai3.webp'
    : article?.featuredImageUrl ||
      pkg?.image ||
      'https://www.doctorcheck.vn/wp-content/uploads/2024/11/banner-doctor-check.webp';

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
      type: content.type === 'article' ? 'article' : 'website',
      images: ogImage ? [{ url: ogImage, alt: content.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function DynamicRootRoute({ params }: PageProps) {
  const { slug } = await params;
  const content = resolveContent(slug);

  // 1. Handle Legacy 301 Redirects
  if (content.type === 'redirect' && content.redirectTarget) {
    redirect(content.redirectTarget);
  }

  // 2. Doctor profile at root -> redirect to canonical /doctor/[slug]/
  if (content.type === 'doctor' && content.data?.doctor) {
    redirect(`/doctor/${content.data.doctor.id}/`);
  }

  // Structured Data JSON-LD
  const jsonLdList: object[] = [];
  if (slug === 've-chung-toi' || slug === 've-doctor-check') {
    const pageName = slug === 've-doctor-check' ? 'Về Doctor Check' : 'Về chúng tôi - Doctor Check';
    const pageUrl = `https://www.doctorcheck.vn/${slug}/`;
    jsonLdList.push({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://www.doctorcheck.vn/#organization",
          "name": "Doctor Check"
        },
        {
          "@type": "WebSite",
          "@id": "https://www.doctorcheck.vn/#website",
          "url": "https://www.doctorcheck.vn",
          "name": "Doctor Check",
          "publisher": { "@id": "https://www.doctorcheck.vn/#organization" },
          "inLanguage": "vi"
        },
        {
          "@type": "ImageObject",
          "@id": "https://www.doctorcheck.vn/wp-content/uploads/2024/12/bai3.webp",
          "url": "https://www.doctorcheck.vn/wp-content/uploads/2024/12/bai3.webp",
          "width": "660",
          "height": "422",
          "inLanguage": "vi"
        },
        {
          "@type": "WebPage",
          "@id": `${pageUrl}#webpage`,
          "url": pageUrl,
          "name": pageName,
          "datePublished": "2024-12-12T07:14:48+07:00",
          "dateModified": "2026-03-18T14:20:47+07:00",
          "isPartOf": { "@id": "https://www.doctorcheck.vn/#website" },
          "primaryImageOfPage": { "@id": "https://www.doctorcheck.vn/wp-content/uploads/2024/12/bai3.webp" },
          "inLanguage": "vi"
        },
        {
          "@type": "AboutPage",
          "@id": `${pageUrl}#webpage`,
          "url": pageUrl,
          "name": pageName,
          "description": "Trang giới thiệu Doctor Check - trung tâm tầm soát bệnh chuyên sâu, trình bày tầm nhìn, sứ mệnh, các cam kết dành cho khách hàng, không gian phòng khám và hệ thống trang thiết bị hiện đại.",
          "inLanguage": "vi",
          "isPartOf": { "@type": "WebSite", "name": "Doctor Check", "url": "https://www.doctorcheck.vn/" },
          "about": { "@id": "https://www.doctorcheck.vn/#clinic" },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": "1", "name": "Trang Chủ", "item": "https://www.doctorcheck.vn/" },
              { "@type": "ListItem", "position": "2", "name": slug === 've-doctor-check' ? "Về Doctor Check" : "Về chúng tôi", "item": pageUrl }
            ]
          }
        },
        {
          "@type": "MedicalClinic",
          "@id": "https://www.doctorcheck.vn/#clinic",
          "name": "Doctor Check",
          "url": "https://www.doctorcheck.vn/",
          "description": "Doctor Check là trung tâm tầm soát bệnh chuyên sâu, tập trung giúp khách hàng tầm soát bệnh định kỳ, phát hiện sớm vấn đề sức khỏe tiềm ẩn và xây dựng giải pháp sống khỏe, sống thọ.",
          "medicalSpecialty": "https://schema.org/InternalMedicine",
          "availableService": [
            { "@type": "Service", "name": "Tầm soát bệnh định kỳ" },
            { "@type": "Service", "name": "Khám nội tổng quát" },
            { "@type": "Service", "name": "Nội soi tiêu hóa" },
            { "@type": "Service", "name": "Tầm soát ung thư tiêu hóa" }
          ]
        }
      ]
    });
  } else if (content.type === 'article' && content.data?.article) {
    const article = content.data.article as MedicalArticle;
    jsonLdList.push(generateArticleJsonLd(article));
    const catId = article.categories?.[0];
    const category = catId ? categoriesData.find((c) => c.id === catId) : undefined;
    jsonLdList.push(generateArticleBreadcrumbJsonLd(article, category));
  } else if (content.type === 'package' && content.data?.package) {
    jsonLdList.push(generatePackageJsonLd(content.data.package));
    jsonLdList.push(generatePackageBreadcrumbJsonLd(content.data.package));
  } else if (content.type === 'category' && content.data?.category) {
    jsonLdList.push(generateCategoryBreadcrumbJsonLd(content.data.category));
  }

  // 3. Render Appropriate Template
  return (
    <>
      {jsonLdList.map((schema, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {(() => {
        switch (content.type) {
          case 'article':
            if (content.data?.article) {
              return <ArticleTemplate article={content.data.article as MedicalArticle} />;
            }
            break;

          case 'package':
            if (content.data?.package) {
              return <PackageTemplate pkg={content.data.package} />;
            }
            break;

          case 'category':
            if (content.data?.category) {
              return <CategoryTemplate category={content.data.category} />;
            }
            break;

          case 'page':
            if (content.data?.page) {
              return (
                <PageTemplate
                  page={content.data.page}
                  pageContent={content.data.pageContent}
                />
              );
            }
            break;

          default:
            break;
        }

        // Fallback to 404 for unknown content
        notFound();
      })()}
    </>
  );
}
