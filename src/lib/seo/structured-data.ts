import type { MedicalArticle, PackageTier, Doctor } from '@/types/doctorcheck';
import { CLINIC_INFO } from '@/lib/data/clinic';

/**
 * Semantic Schema.org Structured Data Generators
 *
 * Clean, modern structured data for medical articles, packages, and doctors.
 * Replaces WordPress Rank Math bloat with validated, clean JSON-LD.
 */

export function generateArticleJsonLd(article: MedicalArticle) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    headline: article.title,
    description: article.excerpt || article.metaDescription,
    url: article.link || `https://doctorcheck.vn/${article.slug}/`,
    image: article.featuredImageUrl ? [article.featuredImageUrl] : undefined,
    datePublished: article.date,
    dateModified: article.modified || article.date,
    inLanguage: 'vi-VN',
    medicalAudience: 'Patient',
    author: {
      '@type': 'MedicalOrganization',
      name: 'Đội ngũ Bác sĩ Chuyên khoa II Doctor Check',
      url: 'https://doctorcheck.vn/doi-ngu-bac-si-doctorcheck/'
    },
    publisher: {
      '@type': 'MedicalOrganization',
      name: CLINIC_INFO.name,
      legalName: CLINIC_INFO.legalName,
      url: 'https://doctorcheck.vn',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.doctorcheck.vn/wp-content/uploads/2024/11/logo-doctor-check.webp'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://doctorcheck.vn/${article.slug}/`
    }
  };
}

export function generatePackageJsonLd(pkg: PackageTier) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: pkg.name,
    description: pkg.tagline,
    url: `https://doctorcheck.vn/${pkg.slug}/`,
    image: pkg.image ? [pkg.image] : undefined,
    category: 'Medical Examination Package',
    offers: {
      '@type': 'Offer',
      price: pkg.price,
      priceCurrency: 'VND',
      availability: 'https://schema.org/InStock',
      url: `https://doctorcheck.vn/${pkg.slug}/`
    },
    provider: {
      '@type': 'MedicalOrganization',
      name: CLINIC_INFO.name,
      telephone: CLINIC_INFO.hotline,
      address: {
        '@type': 'PostalAddress',
        streetAddress: CLINIC_INFO.address.street,
        addressLocality: CLINIC_INFO.address.district,
        addressRegion: CLINIC_INFO.address.city,
        addressCountry: 'VN'
      }
    }
  };
}

export function generateDoctorJsonLd(doctor: Doctor) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: doctor.name,
    jobTitle: doctor.title,
    medicalSpecialty: doctor.specialty,
    description: doctor.description,
    image: doctor.image,
    worksFor: {
      '@type': 'MedicalOrganization',
      name: CLINIC_INFO.name,
      url: 'https://doctorcheck.vn'
    }
  };
}

export interface BreadcrumbItem {
  name: string;
  item: string;
}

/**
 * Reusable BreadcrumbList JSON-LD generator (Schema.org compliant)
 */
export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, index) => {
      const cleanItem = crumb.item.startsWith('http')
        ? crumb.item
        : `https://doctorcheck.vn${crumb.item.startsWith('/') ? crumb.item : '/' + crumb.item}`;
      const canonicalItem = cleanItem.endsWith('/') ? cleanItem : `${cleanItem}/`;

      return {
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: canonicalItem,
      };
    }),
  };
}

export function generateArticleBreadcrumbJsonLd(
  article: MedicalArticle,
  category?: { name: string; slug: string }
) {
  const items: BreadcrumbItem[] = [
    { name: 'Trang chủ', item: 'https://doctorcheck.vn/' },
  ];
  if (category) {
    items.push({ name: category.name, item: `https://doctorcheck.vn/${category.slug}/` });
  }
  items.push({ name: article.title, item: `https://doctorcheck.vn/${article.slug}/` });
  return generateBreadcrumbJsonLd(items);
}

export function generatePackageBreadcrumbJsonLd(pkg: PackageTier) {
  return generateBreadcrumbJsonLd([
    { name: 'Trang chủ', item: 'https://doctorcheck.vn/' },
    { name: 'Bảng Giá Dịch Vụ', item: 'https://doctorcheck.vn/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/' },
    { name: pkg.name, item: `https://doctorcheck.vn/${pkg.slug}/` },
  ]);
}

export function generateCategoryBreadcrumbJsonLd(category: { name: string; slug: string }) {
  return generateBreadcrumbJsonLd([
    { name: 'Trang chủ', item: 'https://doctorcheck.vn/' },
    { name: category.name, item: `https://doctorcheck.vn/${category.slug}/` },
  ]);
}

export function generateHubBreadcrumbJsonLd(
  pageTitle: string,
  subpathSegments: string[],
  parentTitles?: Record<string, string>
) {
  const items: BreadcrumbItem[] = [
    { name: 'Trang chủ', item: 'https://doctorcheck.vn/' },
    { name: 'Trung Tâm Nội Soi Tiêu Hóa', item: 'https://doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/' },
  ];

  if (subpathSegments.length > 1) {
    let accumulatedPath = 'trung-tam-noi-soi-tieu-hoa-doctor-check';
    for (let i = 0; i < subpathSegments.length - 1; i++) {
      const seg = subpathSegments[i];
      accumulatedPath += `/${seg}`;
      const segName = parentTitles?.[seg] || seg;
      items.push({
        name: segName,
        item: `https://doctorcheck.vn/${accumulatedPath}/`,
      });
    }
  }

  const fullSubpath = subpathSegments.join('/');
  items.push({
    name: pageTitle,
    item: `https://doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/${fullSubpath}/`,
  });

  return generateBreadcrumbJsonLd(items);
}

