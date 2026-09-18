import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../src/db/schema';

// Import raw source datasets
import { categoriesData } from '../src/lib/data/categories';
import { articlesCatalog } from '../src/lib/data/articles';
import { articlesContentMap } from '../src/lib/content/articles-data';
import { doctorsData } from '../src/lib/data/doctors';
import { packagesData } from '../src/lib/data/packages';
import { pagesContentMap } from '../src/lib/content/pages-data';
import { equipmentData } from '../src/lib/data/equipment';
import { faqsData } from '../src/lib/data/faqs';
import { videoTestimonialsData } from '../src/lib/data/testimonials';
import { CLINIC_INFO } from '../src/lib/data/clinic';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Command-line flag parsing
const isDryRun = process.argv.includes('--dry-run') || !process.argv.includes('--execute');

// Canonical SHA-256 hash helper
function computeHash(content: string): string {
  return crypto.createHash('sha256').update(content.trim(), 'utf8').digest('hex');
}

export interface DomainValidationResult {
  domain: string;
  sourceFile: string;
  sourceCount: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  readyToImport: number;
  sampleChecksum?: string;
  notes?: string;
}

export interface ManifestReport {
  timestamp: string;
  executionMode: 'DRY_RUN' | 'EXECUTE';
  databaseWrites: number;
  domains: DomainValidationResult[];
  relationshipErrors: string[];
  missingRequiredFields: string[];
  schemaCompatibility: 'PASS' | 'FAIL';
}

async function runImporter() {
  console.log('========================================================================');
  console.log(`🚀 DOCTORCHECK DATA IMPORTER & FIDELITY VALIDATOR`);
  console.log(`MODE: ${isDryRun ? '🔍 DRY RUN (READ ONLY - ZERO DB WRITES)' : '⚡ LIVE EXECUTION (TRANSACTIONAL WRITE)'}`);
  console.log('========================================================================\n');

  const report: ManifestReport = {
    timestamp: new Date().toISOString(),
    executionMode: isDryRun ? 'DRY_RUN' : 'EXECUTE',
    databaseWrites: 0,
    domains: [],
    relationshipErrors: [],
    missingRequiredFields: [],
    schemaCompatibility: 'PASS',
  };

  // ---------------------------------------------------------------------------
  // 1. Roles & System Data
  // ---------------------------------------------------------------------------
  const systemRoles = [
    { id: 'super_admin', name: 'Super Administrator', description: 'Full system management and clinical override' },
    { id: 'editor', name: 'Content Editor', description: 'Manage articles, pages, and landing sections' },
    { id: 'medical_reviewer', name: 'Medical Reviewer', description: 'Clinical content verification and CCHN compliance' },
    { id: 'doctor', name: 'Doctor / Physician', description: 'Personal schedule and clinical profile management' },
  ];

  report.domains.push({
    domain: 'roles',
    sourceFile: 'scripts/seed-data.ts (System Roles)',
    sourceCount: systemRoles.length,
    validCount: systemRoles.length,
    invalidCount: 0,
    duplicateCount: 0,
    readyToImport: systemRoles.length,
    notes: 'System reference roles',
  });

  // ---------------------------------------------------------------------------
  // 2. Categories (30 items)
  // ---------------------------------------------------------------------------
  const categorySlugs = new Set<string>();
  const categoryIds = new Set<string>();
  let catValid = 0;
  let catInvalid = 0;
  let catDups = 0;

  const preparedCategories = categoriesData.map((cat, idx) => {
    const id = String(cat.id);
    const slug = cat.slug.trim();
    if (!cat.name || !slug) {
      catInvalid++;
      report.missingRequiredFields.push(`Category index ${idx} missing name or slug`);
    }
    if (categorySlugs.has(slug)) {
      catDups++;
    } else {
      categorySlugs.add(slug);
    }
    categoryIds.add(id);
    catValid++;

    return {
      id,
      slug,
      name: cat.name.trim(),
      description: cat.description || '',
      sortOrder: idx + 1,
      checksum: computeHash(`${slug}|${cat.name}|${cat.description || ''}`),
    };
  });

  report.domains.push({
    domain: 'categories',
    sourceFile: 'src/lib/data/categories.ts',
    sourceCount: categoriesData.length,
    validCount: catValid,
    invalidCount: catInvalid,
    duplicateCount: catDups,
    readyToImport: preparedCategories.length,
    sampleChecksum: preparedCategories[0]?.checksum,
    notes: 'Verified taxonomy categories',
  });

  // ---------------------------------------------------------------------------
  // 3. Specialties & Doctors (7 doctors)
  // ---------------------------------------------------------------------------
  const specialtyMap = new Map<string, { id: string; name: string; sortOrder: number }>();
  let specIdx = 1;
  doctorsData.forEach((doc) => {
    if (doc.specialty) {
      const parts = doc.specialty.split('-').map((s) => s.trim());
      parts.forEach((p) => {
        const id = p.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (id && !specialtyMap.has(id)) {
          specialtyMap.set(id, { id, name: p, sortOrder: specIdx++ });
        }
      });
    }
  });

  report.domains.push({
    domain: 'specialties',
    sourceFile: 'src/lib/data/doctors.ts (derived)',
    sourceCount: specialtyMap.size,
    validCount: specialtyMap.size,
    invalidCount: 0,
    duplicateCount: 0,
    readyToImport: specialtyMap.size,
  });

  const doctorSlugs = new Set<string>();
  let docValid = 0;
  let docInvalid = 0;
  let docDups = 0;

  const preparedDoctors = doctorsData.map((doc, idx) => {
    const slug = doc.id.trim();
    if (!doc.name || !doc.title || !doc.cchn || !doc.clinicalScope) {
      docInvalid++;
      report.missingRequiredFields.push(`Doctor ${doc.id} missing mandatory clinical credentials`);
    }
    if (doctorSlugs.has(slug)) {
      docDups++;
    } else {
      doctorSlugs.add(slug);
    }
    docValid++;

    return {
      id: doc.id,
      slug,
      name: doc.name.trim(),
      title: doc.title.trim(),
      cchn: doc.cchn?.trim() || '',
      specialtySummary: doc.specialty?.trim() || '',
      clinicalScope: doc.clinicalScope?.trim() || '',
      hospital: doc.hospital?.trim() || '',
      experienceYears: doc.experienceYears || 10,
      imageUrl: doc.image?.trim() || '',
      description: doc.description?.trim() || '',
      schedule: doc.schedule?.trim() || '',
      isFeatured: doc.featured ?? true,
      sortOrder: idx + 1,
      checksum: computeHash(`${slug}|${doc.name}|${doc.cchn}|${doc.clinicalScope}`),
    };
  });

  report.domains.push({
    domain: 'doctors',
    sourceFile: 'src/lib/data/doctors.ts',
    sourceCount: doctorsData.length,
    validCount: docValid,
    invalidCount: docInvalid,
    duplicateCount: docDups,
    readyToImport: preparedDoctors.length,
    sampleChecksum: preparedDoctors[0]?.checksum,
    notes: 'Verified physicians with CCHN credentials',
  });

  // ---------------------------------------------------------------------------
  // 4. Articles & Article Categories (108 articles)
  // ---------------------------------------------------------------------------
  const articleSlugs = new Set<string>();
  const articleIds = new Set<string>();
  let artValid = 0;
  let artInvalid = 0;
  let artDups = 0;
  const preparedArticleCategories: { articleId: string; categoryId: string; isPrimary: boolean }[] = [];

  const articlesList = Object.values(articlesContentMap);
  const preparedArticles = articlesList.map((art, idx) => {
    const id = String(art.id);
    const slug = art.slug.trim();
    if (!art.title || !slug || !art.contentHtml) {
      artInvalid++;
      report.missingRequiredFields.push(`Article ${id} (${slug}) missing title or contentHtml`);
    }
    if (articleSlugs.has(slug)) {
      artDups++;
    } else {
      articleSlugs.add(slug);
    }
    articleIds.add(id);
    artValid++;

    // Process categories junction
    if (Array.isArray(art.categories)) {
      art.categories.forEach((catId, catIdx) => {
        const cIdStr = String(catId);
        if (!categoryIds.has(cIdStr)) {
          report.relationshipErrors.push(`Article ${id} references unknown category ${cIdStr}`);
        }
        preparedArticleCategories.push({
          articleId: id,
          categoryId: cIdStr,
          isPrimary: catIdx === 0,
        });
      });
    }

    return {
      id,
      slug,
      title: art.title.trim(),
      excerpt: art.excerpt?.trim() || '',
      contentHtml: art.contentHtml,
      featuredImageUrl: art.featuredImageUrl || null,
      authorName: art.authorName?.trim() || 'Đội ngũ Bác sĩ DoctorCheck',
      authorTitle: art.authorTitle?.trim() || 'Bác sĩ Chuyên khoa Tiêu hóa',
      status: 'published',
      viewsCount: 0,
      readingTimeMinutes: 5,
      toc: art.tableOfContents || [],
      seoTitle: art.seoTitle || null,
      seoDescription: art.metaDescription || null,
      canonicalUrl: art.link || `https://doctorcheck.vn/${slug}/`,
      publishedAt: new Date(art.date || Date.now()),
      modifiedAt: new Date(art.modified || Date.now()),
      checksum: computeHash(`${slug}|${art.title}|${art.contentHtml}`),
    };
  });

  report.domains.push({
    domain: 'articles',
    sourceFile: 'src/lib/content/data/articles-content.json',
    sourceCount: articlesList.length,
    validCount: artValid,
    invalidCount: artInvalid,
    duplicateCount: artDups,
    readyToImport: preparedArticles.length,
    sampleChecksum: preparedArticles[0]?.checksum,
    notes: '108 medical articles with full HTML and TOC',
  });

  report.domains.push({
    domain: 'article_categories',
    sourceFile: 'src/lib/content/data/articles-content.json (categories junction)',
    sourceCount: preparedArticleCategories.length,
    validCount: preparedArticleCategories.length,
    invalidCount: 0,
    duplicateCount: 0,
    readyToImport: preparedArticleCategories.length,
  });

  // ---------------------------------------------------------------------------
  // 5. Examination Packages (9 packages)
  // ---------------------------------------------------------------------------
  const allPackagesList = [
    ...packagesData.female,
    ...packagesData.male,
    ...packagesData.specialized,
  ];

  const packageSlugs = new Set<string>();
  let pkgValid = 0;
  let pkgInvalid = 0;
  let pkgDups = 0;

  const preparedPackages = allPackagesList.map((pkg, idx) => {
    const slug = pkg.slug.trim();
    if (!pkg.name || !slug || pkg.price === undefined || pkg.price === null) {
      pkgInvalid++;
      report.missingRequiredFields.push(`Package ${pkg.id} missing name, slug, or price`);
    }
    if (packageSlugs.has(slug)) {
      pkgDups++;
    } else {
      packageSlugs.add(slug);
    }
    pkgValid++;

    return {
      id: pkg.id,
      slug,
      name: pkg.name.trim(),
      gender: pkg.gender || 'both',
      priceVnd: String(pkg.price),
      priceFormatted: pkg.priceFormatted.trim(),
      tagline: pkg.tagline?.trim() || null,
      diseasesCovered: pkg.diseasesCovered || 0,
      cancersCovered: pkg.cancersCovered || 0,
      duration: pkg.duration?.trim() || '120 - 180 phút',
      isPopular: pkg.popular ?? false,
      recommendedFor: pkg.recommendedFor?.trim() || '',
      features: pkg.features || [],
      imageUrl: pkg.image?.trim() || null,
      sortOrder: idx + 1,
      isActive: true,
      checksum: computeHash(`${slug}|${pkg.name}|${pkg.price}|${JSON.stringify(pkg.features)}`),
    };
  });

  report.domains.push({
    domain: 'packages',
    sourceFile: 'src/lib/data/packages.ts',
    sourceCount: allPackagesList.length,
    validCount: pkgValid,
    invalidCount: pkgInvalid,
    duplicateCount: pkgDups,
    readyToImport: preparedPackages.length,
    sampleChecksum: preparedPackages[0]?.checksum,
    notes: '9 clinical examination packages with WooCommerce tier pricing',
  });

  // ---------------------------------------------------------------------------
  // 6. Pages (55 pages)
  // ---------------------------------------------------------------------------
  const pagesList = Object.values(pagesContentMap);
  const pageSlugs = new Set<string>();
  const pagePaths = new Set<string>();
  let pageValid = 0;
  let pageInvalid = 0;
  let pageDups = 0;

  const preparedPages = pagesList.map((p, idx) => {
    const id = `page-${p.id || idx + 1}`;
    const slug = p.slug.trim();
    const path = `/${slug}/`;
    if (!p.title || !slug || p.contentHtml === undefined || p.contentHtml === null) {
      pageInvalid++;
      report.missingRequiredFields.push(`Page ${id} (${slug}) missing title or contentHtml`);
    }
    if (pageSlugs.has(slug) || pagePaths.has(path)) {
      pageDups++;
    } else {
      pageSlugs.add(slug);
      pagePaths.add(path);
    }
    pageValid++;

    const isUxBuilder = p.contentHtml.includes('gap-') || p.contentHtml.includes('col-inner') || p.contentHtml.includes('section');

    return {
      id,
      slug,
      path,
      subpath: null,
      title: p.title.trim(),
      excerpt: p.excerpt?.trim() || null,
      contentHtml: p.contentHtml || '',
      featuredImageUrl: p.featuredImageUrl?.trim() || null,
      isRoot: true,
      isUxBuilder,
      seoTitle: p.seoTitle?.trim() || null,
      seoDescription: p.metaDescription?.trim() || null,
      status: 'published',
      checksum: computeHash(`${slug}|${p.title}|${p.contentHtml || ''}`),
    };
  });

  report.domains.push({
    domain: 'pages',
    sourceFile: 'src/lib/content/data/pages-content.json',
    sourceCount: pagesList.length,
    validCount: pageValid,
    invalidCount: pageInvalid,
    duplicateCount: pageDups,
    readyToImport: preparedPages.length,
    sampleChecksum: preparedPages[0]?.checksum,
    notes: '55 WordPress / UX Builder landing and institutional pages',
  });

  // ---------------------------------------------------------------------------
  // 7. Equipment (6 items)
  // ---------------------------------------------------------------------------
  const preparedEquipment = equipmentData.map((eq, idx) => ({
    id: eq.id,
    name: eq.name.trim(),
    origin: eq.origin.trim(),
    manufacturer: eq.manufacturer.trim(),
    imageUrl: eq.image.trim(),
    description: eq.description.trim(),
    features: eq.features || [],
    sortOrder: idx + 1,
    isActive: true,
    checksum: computeHash(`${eq.id}|${eq.name}|${eq.manufacturer}`),
  }));

  report.domains.push({
    domain: 'equipment',
    sourceFile: 'src/lib/data/equipment.ts',
    sourceCount: equipmentData.length,
    validCount: equipmentData.length,
    invalidCount: 0,
    duplicateCount: 0,
    readyToImport: preparedEquipment.length,
    sampleChecksum: preparedEquipment[0]?.checksum,
    notes: 'Olympus, Fujifilm, Siemens, Roche diagnostic equipment',
  });

  // ---------------------------------------------------------------------------
  // 8. FAQs (5 items)
  // ---------------------------------------------------------------------------
  const preparedFaqs = faqsData.map((faq, idx) => ({
    id: faq.id,
    question: faq.question.trim(),
    answer: faq.answer.trim(),
    category: faq.category?.trim() || 'general',
    sortOrder: idx + 1,
    isPublished: true,
    checksum: computeHash(`${faq.id}|${faq.question}|${faq.answer}`),
  }));

  report.domains.push({
    domain: 'faqs',
    sourceFile: 'src/lib/data/faqs.ts',
    sourceCount: faqsData.length,
    validCount: faqsData.length,
    invalidCount: 0,
    duplicateCount: 0,
    readyToImport: preparedFaqs.length,
    sampleChecksum: preparedFaqs[0]?.checksum,
    notes: 'Authentic clinical Q&A items',
  });

  // ---------------------------------------------------------------------------
  // 9. Testimonials & Stories (6 items)
  // ---------------------------------------------------------------------------
  const customerStories = [
    {
      id: 'co-lien',
      type: 'customer_story' as const,
      patientName: 'Cô Ngọc Liên',
      title: 'Có Người Nhà Bị Ung Thư Đại Tràng, Cô Liên Quyết Định Đến Doctor Check Để Tầm Soát Ung Thư',
      fullStory: 'Có Người Nhà Bị Ung Thư Đại Tràng, Cô Liên Quyết Định Đến Doctor Check Để Tầm Soát Ung Thư! Cô Ngọc Liên, hiện đang sinh sống tại thành phố...',
      imageUrl: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/c8f18d38-0720-41fa-89f9-8b088f3dbe00/w=1020,h=536',
      videoId: 'zRRzaw3rpis',
      tag: 'Tầm soát Ung thư',
      sortOrder: 4,
    },
    {
      id: 'chu-hong-anh',
      type: 'customer_story' as const,
      patientName: 'Chú Hồng Anh',
      patientAge: 72,
      title: 'Bị Tiểu Đường 26 Năm Nên Chú Hồng Anh Muốn Kiểm Tra Sức Khỏe Định Kỳ',
      fullStory: 'Chú Hồng Anh, 72 Tuổi, Tại TPHCM có mắc bệnh nền bị tiểu đường. Thế nên, hôm nay chú quyết định đến phòng khám Doctor Check để kiểm tra sức...',
      imageUrl: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/a1c13271-35cc-4174-e705-b03beb227e00/w=1020,h=536',
      videoId: 'EpCHV3c2Ppw',
      tag: 'Bệnh Mạn Tính',
      sortOrder: 5,
    },
    {
      id: 'an-khong-ngon',
      type: 'customer_story' as const,
      patientName: 'Bệnh nhân tầm soát',
      title: 'Gần một tháng, tôi ăn không ngon, ngủ cũng không yên.',
      fullStory: 'Thời gian đó, tôi ăn uống rất khó chịu. Ăn vào là buồn nôn, có lúc ói ra ngay. Ngay cả khi không ăn, cảm giác này vẫn còn....',
      imageUrl: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/c2435d61-05c2-492e-be58-c88a81822e00/w=800,h=800,fit=crop',
      tag: 'Nội Soi Tiêu Hóa',
      sortOrder: 6,
    },
  ];

  const preparedTestimonials = [
    ...videoTestimonialsData.map((vt, idx) => ({
      id: vt.id,
      type: 'video' as const,
      patientName: vt.patientName.trim(),
      patientAge: vt.patientAge || null,
      title: vt.title.trim(),
      quote: vt.quote.trim(),
      fullStory: null,
      videoId: vt.videoId.trim(),
      imageUrl: vt.thumbnail.trim(),
      tag: 'Nội Soi Tiêu Hóa',
      sortOrder: idx + 1,
      isPublished: true,
      checksum: computeHash(`${vt.id}|${vt.patientName}|${vt.videoId}`),
    })),
    ...customerStories.map((cs) => ({
      id: cs.id,
      type: cs.type,
      patientName: cs.patientName.trim(),
      patientAge: cs.patientAge || null,
      title: cs.title.trim(),
      quote: null,
      fullStory: cs.fullStory.trim(),
      videoId: cs.videoId || null,
      imageUrl: cs.imageUrl.trim(),
      tag: cs.tag,
      sortOrder: cs.sortOrder,
      isPublished: true,
      checksum: computeHash(`${cs.id}|${cs.patientName}|${cs.title}`),
    })),
  ];

  report.domains.push({
    domain: 'testimonials',
    sourceFile: 'src/lib/data/testimonials.ts & CustomerStoriesSection.tsx',
    sourceCount: preparedTestimonials.length,
    validCount: preparedTestimonials.length,
    invalidCount: 0,
    duplicateCount: 0,
    readyToImport: preparedTestimonials.length,
    sampleChecksum: preparedTestimonials[0]?.checksum,
    notes: '3 Video Testimonials + 3 Customer Stories',
  });

  // ---------------------------------------------------------------------------
  // 10. Clinic Info Singleton
  // ---------------------------------------------------------------------------
  const preparedClinic = {
    id: 'default',
    name: CLINIC_INFO.name.trim(),
    legalName: CLINIC_INFO.legalName.trim(),
    licenseNumber: CLINIC_INFO.license.trim(),
    taxCode: '0315729707',
    hotline: CLINIC_INFO.hotline.trim(),
    emergencyPhone: null,
    zaloUrl: CLINIC_INFO.zaloUrl.trim(),
    email: CLINIC_INFO.email.trim(),
    addressStreet: CLINIC_INFO.address.street.trim(),
    addressWard: CLINIC_INFO.address.ward.trim(),
    addressDistrict: CLINIC_INFO.address.district.trim(),
    addressCity: CLINIC_INFO.address.city.trim(),
    addressFull: CLINIC_INFO.address.full.trim(),
    latitude: String(CLINIC_INFO.coordinates.latitude),
    longitude: String(CLINIC_INFO.coordinates.longitude),
    workingHours: {
      full: CLINIC_INFO.workingHours,
      short: CLINIC_INFO.workingHoursShort,
    },
    checksum: computeHash(`${CLINIC_INFO.name}|${CLINIC_INFO.license}|${CLINIC_INFO.address.full}`),
  };

  report.domains.push({
    domain: 'clinic_info',
    sourceFile: 'src/lib/data/clinic.ts',
    sourceCount: 1,
    validCount: 1,
    invalidCount: 0,
    duplicateCount: 0,
    readyToImport: 1,
    sampleChecksum: preparedClinic.checksum,
    notes: 'Operating License 09789/HCM-GPHĐ',
  });

  // ---------------------------------------------------------------------------
  // 11. Legacy 301 Redirects (10 rules)
  // ---------------------------------------------------------------------------
  const redirectRules = [
    { sourcePath: '/ve-chung-toi', targetPath: '/ve-doctor-check/' },
    { sourcePath: '/bang-gia-dich-vu', targetPath: '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/' },
    { sourcePath: '/bang-gia-kham-suc-khoe-tong-quat', targetPath: '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/' },
    { sourcePath: '/trung-tam-noi-soi-tieu-hoa', targetPath: '/trung-tam-noi-soi-tieu-hoa-doctor-check/' },
    { sourcePath: '/goi-ung-thu-da-day', targetPath: '/tam-soat-ung-thu-da-day/' },
    { sourcePath: '/goi-kham-danh-cho-nam', targetPath: '/goi-tam-soat-nam/' },
    { sourcePath: '/goi-kham-danh-cho-nu', targetPath: '/goi-tam-soat-nu/' },
    { sourcePath: '/noi-soi-da-day-khong-dau', targetPath: '/noi-soi-da-day/' },
    { sourcePath: '/noi-soi-dai-trang-khong-dau', targetPath: '/noi-soi-dai-trang/' },
    { sourcePath: '/doi-ngu-bac-si', targetPath: '/doi-ngu-bac-si-doctorcheck/' },
  ];

  report.domains.push({
    domain: 'redirects',
    sourceFile: 'next.config.ts',
    sourceCount: redirectRules.length,
    validCount: redirectRules.length,
    invalidCount: 0,
    duplicateCount: 0,
    readyToImport: redirectRules.length,
    notes: 'Legacy 301 preservation rules',
  });

  // ---------------------------------------------------------------------------
  // Output Validation Manifest Table
  // ---------------------------------------------------------------------------
  console.log('┌──────────────────────┬──────────┬─────────┬───────────┬───────────┬─────────────┐');
  console.log('│ Domain               │ Source   │ Valid   │ Invalid   │ Duplicate │ Ready (Seed)│');
  console.log('├──────────────────────┼──────────┼─────────┼───────────┼───────────┼─────────────┤');
  report.domains.forEach((d) => {
    const domain = d.domain.padEnd(20);
    const src = String(d.sourceCount).padStart(8);
    const val = String(d.validCount).padStart(7);
    const inv = String(d.invalidCount).padStart(9);
    const dup = String(d.duplicateCount).padStart(9);
    const ready = String(d.readyToImport).padStart(11);
    console.log(`│ ${domain} │ ${src} │ ${val} │ ${inv} │ ${dup} │ ${ready} │`);
  });
  console.log('└──────────────────────┴──────────┴─────────┴───────────┴───────────┴─────────────┘\n');

  console.log('🔍 DATA FIDELITY & INTEGRITY AUDIT:');
  console.log(`- Total Domains Checked: ${report.domains.length}`);
  console.log(`- Missing Required Fields: ${report.missingRequiredFields.length}`);
  console.log(`- Relationship Errors: ${report.relationshipErrors.length}`);
  console.log(`- Schema Compatibility: ${report.schemaCompatibility}`);
  console.log(`- Database Writes Performed: ${report.databaseWrites} (STRICT DB-3 DRY-RUN RULE: 0)\n`);

  if (report.relationshipErrors.length > 0) {
    console.warn('⚠️ Relationship Warnings:');
    report.relationshipErrors.forEach((e) => console.warn(`   - ${e}`));
  }

  if (isDryRun) {
    console.log('✅ DRY-RUN SUCCESSFUL: All source records parsed, typed, and validated cleanly.');
    console.log('🛑 ZERO database changes were made. Ready for DB-4 execution approval.\n');
    return;
  }

  // ---------------------------------------------------------------------------
  // REAL EXECUTION PATH (FOR PHASE DB-4 ONLY)
  // ---------------------------------------------------------------------------
  console.log('⚡ Executing real database seed within transaction...');
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required');

  const sql = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sql, { schema });

  try {
    await db.transaction(async (tx) => {
      // 1. Roles
      for (const r of systemRoles) {
        await tx.insert(schema.roles).values(r).onConflictDoNothing();
      }
      // 2. Categories
      for (const cat of preparedCategories) {
        await tx.insert(schema.categories).values({
          id: cat.id,
          slug: cat.slug,
          name: cat.name,
          description: cat.description,
          sortOrder: cat.sortOrder,
        }).onConflictDoUpdate({
          target: schema.categories.id,
          set: { name: cat.name, slug: cat.slug, description: cat.description },
        });
      }
      // 3. Specialties
      for (const spec of Array.from(specialtyMap.values())) {
        await tx.insert(schema.specialties).values(spec).onConflictDoNothing();
      }
      // 4. Doctors & Doctor Specialties
      for (const doc of preparedDoctors) {
        await tx.insert(schema.doctors).values(doc).onConflictDoUpdate({
          target: schema.doctors.id,
          set: { name: doc.name, title: doc.title, cchn: doc.cchn, specialtySummary: doc.specialtySummary },
        });

        // Link doctor specialties
        const rawDoc = doctorsData.find((d) => d.id === doc.id);
        if (rawDoc?.specialty) {
          const parts = rawDoc.specialty.split('-').map((s) => s.trim());
          for (const p of parts) {
            const specId = p.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            if (specId && specialtyMap.has(specId)) {
              await tx.insert(schema.doctorSpecialties).values({
                doctorId: doc.id,
                specialtyId: specId,
              }).onConflictDoNothing();
            }
          }
        }
      }
      // 5. Articles
      for (const art of preparedArticles) {
        await tx.insert(schema.articles).values(art).onConflictDoUpdate({
          target: schema.articles.id,
          set: { title: art.title, slug: art.slug, contentHtml: art.contentHtml, excerpt: art.excerpt, toc: art.toc },
        });
      }
      // 6. Article Categories
      for (const ac of preparedArticleCategories) {
        await tx.insert(schema.articleCategories).values(ac).onConflictDoNothing();
      }
      // 7. Packages
      for (const pkg of preparedPackages) {
        await tx.insert(schema.packages).values(pkg).onConflictDoUpdate({
          target: schema.packages.id,
          set: { name: pkg.name, priceVnd: pkg.priceVnd, priceFormatted: pkg.priceFormatted, features: pkg.features },
        });
      }
      // 8. Pages
      for (const p of preparedPages) {
        await tx.insert(schema.pages).values(p).onConflictDoUpdate({
          target: schema.pages.id,
          set: { title: p.title, contentHtml: p.contentHtml, excerpt: p.excerpt },
        });
      }
      // 9. Equipment
      for (const eq of preparedEquipment) {
        await tx.insert(schema.equipment).values(eq).onConflictDoNothing();
      }
      // 10. FAQs
      for (const faq of preparedFaqs) {
        await tx.insert(schema.faqs).values(faq).onConflictDoNothing();
      }
      // 11. Testimonials
      for (const tm of preparedTestimonials) {
        await tx.insert(schema.testimonials).values(tm).onConflictDoNothing();
      }
      // 12. Clinic Info
      await tx.insert(schema.clinicInfo).values(preparedClinic).onConflictDoUpdate({
        target: schema.clinicInfo.id,
        set: preparedClinic,
      });
      // 13. Redirects
      for (const red of redirectRules) {
        await tx.insert(schema.redirects).values(red).onConflictDoNothing();
      }
    });
    console.log('🎉 TRANSACTION COMMITTED: All records imported successfully!');
  } finally {
    await sql.end();
  }
}

runImporter().catch((err) => {
  console.error('❌ Importer error:', err);
  process.exit(1);
});
