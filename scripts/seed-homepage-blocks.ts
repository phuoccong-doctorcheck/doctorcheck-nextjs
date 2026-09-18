import * as dotenv from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../src/db/schema';
import { staticHomepageData } from '../src/lib/data/homepage';

dotenv.config({ path: '.env.local' });

async function seedHomepageBlocks() {
  console.log('========================================================================');
  console.log('🚀 SEEDING HOMEPAGE BLOCKS INTO POSTGRESQL');
  console.log('========================================================================\n');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required in .env.local');

  const sql = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sql, { schema });

  const blocksToSeed = [
    {
      blockKey: 'hero',
      title: staticHomepageData.hero.title,
      subtitle: staticHomepageData.hero.subtitle,
      content: {
        desktopBanner: staticHomepageData.hero.desktopBanner,
        mobileBanner: staticHomepageData.hero.mobileBanner,
        ctaTarget: staticHomepageData.hero.ctaTarget,
      },
      isActive: true,
    },
    {
      blockKey: 'pain_points',
      title: staticHomepageData.painPoints.title,
      subtitle: staticHomepageData.painPoints.subtitle,
      content: {
        items: staticHomepageData.painPoints.items,
      },
      isActive: true,
    },
    {
      blockKey: 'benefits',
      title: staticHomepageData.benefits.title,
      subtitle: null,
      content: {
        moreUrl: staticHomepageData.benefits.moreUrl,
        moreLabel: staticHomepageData.benefits.moreLabel,
        bannerImage: staticHomepageData.benefits.bannerImage,
        bannerVideoId: staticHomepageData.benefits.bannerVideoId,
        items: staticHomepageData.benefits.items,
      },
      isActive: true,
    },
    {
      blockKey: 'cancer_screening',
      title: staticHomepageData.cancerScreening.title,
      subtitle: null,
      content: {
        description: staticHomepageData.cancerScreening.description,
        ctaUrl: staticHomepageData.cancerScreening.ctaUrl,
        ctaLabel: staticHomepageData.cancerScreening.ctaLabel,
        featuredCards: staticHomepageData.cancerScreening.featuredCards,
      },
      isActive: true,
    },
    {
      blockKey: 'banner_cta',
      title: staticHomepageData.bannerCta.title,
      subtitle: null,
      content: {
        brand: staticHomepageData.bannerCta.brand,
        workingHoursTitle: staticHomepageData.bannerCta.workingHoursTitle,
        workingHoursWeekday: staticHomepageData.bannerCta.workingHoursWeekday,
        workingHoursSunday: staticHomepageData.bannerCta.workingHoursSunday,
        buttonText: staticHomepageData.bannerCta.buttonText,
        buttonTarget: staticHomepageData.bannerCta.buttonTarget,
        desktopImage: staticHomepageData.bannerCta.desktopImage,
        mobileImage: staticHomepageData.bannerCta.mobileImage,
      },
      isActive: true,
    },
    {
      blockKey: 'sections_meta',
      title: 'Homepage Section Headers & Meta',
      subtitle: null,
      content: staticHomepageData.sectionsMeta,
      isActive: true,
    },
    {
      blockKey: 'pricing',
      title: 'Bảng Giá Các Gói Khám Tổng Quát tại Doctor Check',
      subtitle: null,
      content: staticHomepageData.pricing,
      isActive: true,
    },
  ];

  try {
    for (const b of blocksToSeed) {
      console.log(`- Seeding block: [${b.blockKey}] - "${b.title}"`);
      await db
        .insert(schema.homepageBlocks)
        .values(b)
        .onConflictDoUpdate({
          target: schema.homepageBlocks.blockKey,
          set: {
            title: b.title,
            subtitle: b.subtitle,
            content: b.content,
            isActive: b.isActive,
            updatedAt: new Date(),
          },
        });
    }

    const seeded = await db.select().from(schema.homepageBlocks);
    console.log(`\n✅ Successfully seeded ${seeded.length} homepage blocks into PostgreSQL!`);
  } finally {
    await sql.end();
  }
}

seedHomepageBlocks().catch((err) => {
  console.error('❌ Error seeding homepage blocks:', err);
  process.exit(1);
});
