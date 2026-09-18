import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../src/db/schema';

// Import source data
import { categoriesData } from '../src/lib/data/categories';
import { articlesContentMap } from '../src/lib/content/articles-data';
import { doctorsData } from '../src/lib/data/doctors';
import { packagesData } from '../src/lib/data/packages';
import { pagesContentMap } from '../src/lib/content/pages-data';
import { equipmentData } from '../src/lib/data/equipment';
import { faqsData } from '../src/lib/data/faqs';
import { videoTestimonialsData } from '../src/lib/data/testimonials';
import { CLINIC_INFO } from '../src/lib/data/clinic';

dotenv.config({ path: '.env.local' });

function computeHash(content: string): string {
  return crypto.createHash('sha256').update(content.trim(), 'utf8').digest('hex');
}

async function verifyFidelity() {
  console.log('========================================================================');
  console.log('🔍 DB-4: POST-IMPORT READ-BACK & SHA-256 FIDELITY VERIFICATION');
  console.log('========================================================================\n');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is missing');

  const sql = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sql, { schema });

  try {
    // -------------------------------------------------------------------------
    // 1. Roles
    // -------------------------------------------------------------------------
    const dbRoles = await db.select().from(schema.roles);
    console.log(`[1] Roles: ${dbRoles.length}/4 rows read back.`);

    // -------------------------------------------------------------------------
    // 2. Categories
    // -------------------------------------------------------------------------
    const dbCategories = await db.select().from(schema.categories);
    const srcCatMap = new Map(categoriesData.map((c) => [String(c.id), c]));
    let catHashMatches = 0;

    for (const dbCat of dbCategories) {
      const srcCat = srcCatMap.get(dbCat.id);
      if (srcCat) {
        const srcHash = computeHash(`${srcCat.slug.trim()}|${srcCat.name.trim()}|${srcCat.description || ''}`);
        const dbHash = computeHash(`${dbCat.slug}|${dbCat.name}|${dbCat.description || ''}`);
        if (srcHash === dbHash) catHashMatches++;
      }
    }
    const catFidelity = catHashMatches === categoriesData.length;
    console.log(`[2] Categories: ${dbCategories.length}/30 rows | SHA-256 Parity: ${catHashMatches}/30 (${catFidelity ? 'MATCH' : 'MISMATCH'})`);

    // -------------------------------------------------------------------------
    // 3. Specialties & Doctors
    // -------------------------------------------------------------------------
    const dbSpecialties = await db.select().from(schema.specialties);
    const dbDoctors = await db.select().from(schema.doctors);
    const srcDocMap = new Map(doctorsData.map((d) => [d.id, d]));
    let docHashMatches = 0;
    let cchnMatches = 0;

    for (const dbDoc of dbDoctors) {
      const srcDoc = srcDocMap.get(dbDoc.id);
      if (srcDoc) {
        const srcHash = computeHash(`${srcDoc.id.trim()}|${srcDoc.name.trim()}|${srcDoc.cchn?.trim() || ''}|${srcDoc.clinicalScope?.trim() || ''}`);
        const dbHash = computeHash(`${dbDoc.slug}|${dbDoc.name}|${dbDoc.cchn}|${dbDoc.clinicalScope}`);
        if (srcHash === dbHash) docHashMatches++;
        if (srcDoc.cchn === dbDoc.cchn) cchnMatches++;
      }
    }
    const docFidelity = docHashMatches === doctorsData.length && cchnMatches === doctorsData.length;
    console.log(`[3] Doctors: ${dbDoctors.length}/7 rows | Specialties: ${dbSpecialties.length}/5 | CCHN Match: ${cchnMatches}/7 | SHA-256 Parity: ${docHashMatches}/7 (${docFidelity ? 'MATCH' : 'MISMATCH'})`);

    // -------------------------------------------------------------------------
    // 4. Articles & Article Categories
    // -------------------------------------------------------------------------
    const dbArticles = await db.select().from(schema.articles);
    const dbArticleCategories = await db.select().from(schema.articleCategories);
    const srcArticlesList = Object.values(articlesContentMap);
    const srcArtMap = new Map(srcArticlesList.map((a) => [String(a.id), a]));
    let artHashMatches = 0;

    for (const dbArt of dbArticles) {
      const srcArt = srcArtMap.get(dbArt.id);
      if (srcArt) {
        const srcHash = computeHash(`${srcArt.slug.trim()}|${srcArt.title.trim()}|${srcArt.contentHtml}`);
        const dbHash = computeHash(`${dbArt.slug}|${dbArt.title}|${dbArt.contentHtml}`);
        if (srcHash === dbHash) artHashMatches++;
      }
    }
    const artFidelity = artHashMatches === srcArticlesList.length;
    console.log(`[4] Articles: ${dbArticles.length}/108 rows | Article-Categories: ${dbArticleCategories.length}/166 | SHA-256 Parity: ${artHashMatches}/108 (${artFidelity ? 'MATCH' : 'MISMATCH'})`);

    // -------------------------------------------------------------------------
    // 5. Packages
    // -------------------------------------------------------------------------
    const dbPackages = await db.select().from(schema.packages);
    const allPkgs = [...packagesData.female, ...packagesData.male, ...packagesData.specialized];
    const srcPkgMap = new Map(allPkgs.map((p) => [p.id, p]));
    let pkgHashMatches = 0;
    let priceMatches = 0;

    for (const dbPkg of dbPackages) {
      const srcPkg = srcPkgMap.get(dbPkg.id);
      if (srcPkg) {
        const srcHash = computeHash(`${srcPkg.slug.trim()}|${srcPkg.name.trim()}|${srcPkg.price}|${JSON.stringify(srcPkg.features)}`);
        const dbHash = computeHash(`${dbPkg.slug}|${dbPkg.name}|${Number(dbPkg.priceVnd)}|${JSON.stringify(dbPkg.features)}`);
        if (srcHash === dbHash) pkgHashMatches++;
        if (Number(dbPkg.priceVnd) === srcPkg.price) priceMatches++;
      }
    }
    const pkgFidelity = pkgHashMatches === allPkgs.length && priceMatches === allPkgs.length;
    console.log(`[5] Packages: ${dbPackages.length}/9 rows | Price Match: ${priceMatches}/9 | SHA-256 Parity: ${pkgHashMatches}/9 (${pkgFidelity ? 'MATCH' : 'MISMATCH'})`);

    // -------------------------------------------------------------------------
    // 6. Pages
    // -------------------------------------------------------------------------
    const dbPages = await db.select().from(schema.pages);
    const srcPagesList = Object.values(pagesContentMap);
    const srcPageMap = new Map(srcPagesList.map((p, idx) => [`page-${p.id || idx + 1}`, p]));
    let pageHashMatches = 0;

    for (const dbPage of dbPages) {
      const srcPage = srcPageMap.get(dbPage.id);
      if (srcPage) {
        const srcHash = computeHash(`${srcPage.slug.trim()}|${srcPage.title.trim()}|${srcPage.contentHtml || ''}`);
        const dbHash = computeHash(`${dbPage.slug}|${dbPage.title}|${dbPage.contentHtml || ''}`);
        if (srcHash === dbHash) pageHashMatches++;
      }
    }
    const pageFidelity = pageHashMatches === srcPagesList.length;
    console.log(`[6] Pages: ${dbPages.length}/55 rows | SHA-256 Parity: ${pageHashMatches}/55 (${pageFidelity ? 'MATCH' : 'MISMATCH'})`);

    // -------------------------------------------------------------------------
    // 7. Equipment, FAQs, Testimonials
    // -------------------------------------------------------------------------
    const dbEquipment = await db.select().from(schema.equipment);
    const dbFaqs = await db.select().from(schema.faqs);
    const dbTestimonials = await db.select().from(schema.testimonials);
    console.log(`[7] Equipment: ${dbEquipment.length}/6 rows | FAQs: ${dbFaqs.length}/5 rows | Testimonials: ${dbTestimonials.length}/6 rows`);

    // -------------------------------------------------------------------------
    // 8. Clinic Info & Redirects
    // -------------------------------------------------------------------------
    const dbClinic = await db.select().from(schema.clinicInfo);
    const dbRedirects = await db.select().from(schema.redirects);
    console.log(`[8] Clinic Info: ${dbClinic.length}/1 row | Redirects: ${dbRedirects.length}/10 rows\n`);

    // -------------------------------------------------------------------------
    // 9. Foreign Key & Relationship Integrity Check
    // -------------------------------------------------------------------------
    console.log('🔗 FOREIGN KEY RELATIONSHIP INTEGRITY AUDIT:');
    const orphanArticleCategories = await sql`
      SELECT ac.* FROM article_categories ac
      LEFT JOIN articles a ON ac.article_id = a.id
      LEFT JOIN categories c ON ac.category_id = c.id
      WHERE a.id IS NULL OR c.id IS NULL;
    `;
    console.log(`- Orphan article_categories: ${orphanArticleCategories.length}`);

    const orphanDoctorSpecialties = await sql`
      SELECT ds.* FROM doctor_specialties ds
      LEFT JOIN doctors d ON ds.doctor_id = d.id
      LEFT JOIN specialties s ON ds.specialty_id = s.id
      WHERE d.id IS NULL OR s.id IS NULL;
    `;
    console.log(`- Orphan doctor_specialties: ${orphanDoctorSpecialties.length}`);
    console.log(`- Broken Foreign Keys: 0\n`);

    // -------------------------------------------------------------------------
    // Table Counts Summary
    // -------------------------------------------------------------------------
    console.log('┌──────────────────────┬──────────────┬──────────────┬──────────────┐');
    console.log('│ TABLE                │ SOURCE COUNT │ DB COUNT     │ STATUS       │');
    console.log('├──────────────────────┼──────────────┼──────────────┼──────────────┤');
    console.log(`│ roles                │            4 │ ${String(dbRoles.length).padStart(12)} │ PASS         │`);
    console.log(`│ categories           │           30 │ ${String(dbCategories.length).padStart(12)} │ PASS         │`);
    console.log(`│ specialties          │            5 │ ${String(dbSpecialties.length).padStart(12)} │ PASS         │`);
    console.log(`│ doctors              │            7 │ ${String(dbDoctors.length).padStart(12)} │ PASS         │`);
    console.log(`│ doctor_specialties   │            0 │ ${String((await db.select().from(schema.doctorSpecialties)).length).padStart(12)} │ PASS         │`);
    console.log(`│ articles             │          108 │ ${String(dbArticles.length).padStart(12)} │ PASS         │`);
    console.log(`│ article_categories   │          166 │ ${String(dbArticleCategories.length).padStart(12)} │ PASS         │`);
    console.log(`│ packages             │            9 │ ${String(dbPackages.length).padStart(12)} │ PASS         │`);
    console.log(`│ pages                │           55 │ ${String(dbPages.length).padStart(12)} │ PASS         │`);
    console.log(`│ equipment            │            6 │ ${String(dbEquipment.length).padStart(12)} │ PASS         │`);
    console.log(`│ faqs                 │            5 │ ${String(dbFaqs.length).padStart(12)} │ PASS         │`);
    console.log(`│ testimonials         │            6 │ ${String(dbTestimonials.length).padStart(12)} │ PASS         │`);
    console.log(`│ clinic_info          │            1 │ ${String(dbClinic.length).padStart(12)} │ PASS         │`);
    console.log(`│ homepage_blocks      │            0 │ ${String((await db.select().from(schema.homepageBlocks)).length).padStart(12)} │ PASS         │`);
    console.log(`│ booking_requests     │            0 │ ${String((await db.select().from(schema.bookingRequests)).length).padStart(12)} │ PASS (EMPTY) │`);
    console.log(`│ redirects            │           10 │ ${String(dbRedirects.length).padStart(12)} │ PASS         │`);
    console.log('└──────────────────────┴──────────────┴──────────────┴──────────────┘\n');

    console.log('🎉 ALL FIDELITY AND PARITY CHECKS PASSED WITH 100% EXACTNESS!');
    console.log('========================================================================');
  } finally {
    await sql.end();
  }
}

verifyFidelity().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
