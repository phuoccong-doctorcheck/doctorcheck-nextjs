import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import * as schema from '@/db/schema';
import type { IHomepageRepository, HomepageData } from '../contracts/homepage.repository';
import { mapHomepageRowsToDomain } from '../mappers/homepage.mapper';

type DbOrTransaction = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

export class PostgresHomepageRepository implements IHomepageRepository {
  async getHomepageData(): Promise<HomepageData> {
    const rows = await db
      .select()
      .from(schema.homepageBlocks)
      .where(eq(schema.homepageBlocks.isActive, true));

    return mapHomepageRowsToDomain(rows);
  }

  async getBlock<T = unknown>(blockKey: string): Promise<T | null> {
    const rows = await db
      .select()
      .from(schema.homepageBlocks)
      .where(eq(schema.homepageBlocks.blockKey, blockKey))
      .limit(1);

    if (!rows.length || !rows[0]) return null;
    const domainData = mapHomepageRowsToDomain(rows);
    const keyMap: Record<string, keyof HomepageData> = {
      hero: 'hero',
      pain_points: 'painPoints',
      painPoints: 'painPoints',
      benefits: 'benefits',
      cancer_screening: 'cancerScreening',
      cancerScreening: 'cancerScreening',
      banner_cta: 'bannerCta',
      bannerCta: 'bannerCta',
      sections_meta: 'sectionsMeta',
      sectionsMeta: 'sectionsMeta',
      pricing: 'pricing',
    };
    const prop = keyMap[blockKey];
    return prop ? (domainData[prop] as unknown as T) : null;
  }

  async updateHomepageData(data: HomepageData, tx?: unknown): Promise<void> {
    const executor = (tx as DbOrTransaction) || db;
    const now = new Date();

    // 1. Hero
    await executor
      .update(schema.homepageBlocks)
      .set({
        title: data.hero.title,
        subtitle: data.hero.subtitle,
        content: {
          desktopBanner: data.hero.desktopBanner,
          mobileBanner: data.hero.mobileBanner,
          ctaTarget: data.hero.ctaTarget,
        },
        updatedAt: now,
      })
      .where(eq(schema.homepageBlocks.blockKey, 'hero'));

    // 2. Pain Points
    await executor
      .update(schema.homepageBlocks)
      .set({
        title: data.painPoints.title,
        subtitle: data.painPoints.subtitle,
        content: {
          items: data.painPoints.items,
        },
        updatedAt: now,
      })
      .where(eq(schema.homepageBlocks.blockKey, 'pain_points'));

    // 3. Benefits
    await executor
      .update(schema.homepageBlocks)
      .set({
        title: data.benefits.title,
        content: {
          moreUrl: data.benefits.moreUrl,
          moreLabel: data.benefits.moreLabel,
          bannerImage: data.benefits.bannerImage,
          bannerVideoId: data.benefits.bannerVideoId,
          items: data.benefits.items,
        },
        updatedAt: now,
      })
      .where(eq(schema.homepageBlocks.blockKey, 'benefits'));

    // 4. Cancer Screening
    await executor
      .update(schema.homepageBlocks)
      .set({
        title: data.cancerScreening.title,
        content: {
          description: data.cancerScreening.description,
          ctaUrl: data.cancerScreening.ctaUrl,
          ctaLabel: data.cancerScreening.ctaLabel,
          featuredCards: data.cancerScreening.featuredCards,
        },
        updatedAt: now,
      })
      .where(eq(schema.homepageBlocks.blockKey, 'cancer_screening'));

    // 5. Banner CTA
    await executor
      .update(schema.homepageBlocks)
      .set({
        title: data.bannerCta.title,
        content: {
          brand: data.bannerCta.brand,
          workingHoursTitle: data.bannerCta.workingHoursTitle,
          workingHoursWeekday: data.bannerCta.workingHoursWeekday,
          workingHoursSunday: data.bannerCta.workingHoursSunday,
          buttonText: data.bannerCta.buttonText,
          buttonTarget: data.bannerCta.buttonTarget,
          desktopImage: data.bannerCta.desktopImage,
          mobileImage: data.bannerCta.mobileImage,
        },
        updatedAt: now,
      })
      .where(eq(schema.homepageBlocks.blockKey, 'banner_cta'));

    // 6. Sections Meta
    await executor
      .update(schema.homepageBlocks)
      .set({
        content: data.sectionsMeta,
        updatedAt: now,
      })
      .where(eq(schema.homepageBlocks.blockKey, 'sections_meta'));

    // 7. Pricing
    await executor
      .update(schema.homepageBlocks)
      .set({
        content: data.pricing,
        updatedAt: now,
      })
      .where(eq(schema.homepageBlocks.blockKey, 'pricing'));
  }

  async updateBlock(
    blockKey: string,
    data: {
      title?: string | null;
      subtitle?: string | null;
      content?: Record<string, unknown>;
      isActive?: boolean;
    },
    tx?: unknown
  ): Promise<void> {
    const executor = (tx as DbOrTransaction) || db;
    await executor
      .update(schema.homepageBlocks)
      .set({
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.subtitle !== undefined ? { subtitle: data.subtitle } : {}),
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        updatedAt: new Date(),
      })
      .where(eq(schema.homepageBlocks.blockKey, blockKey));
  }
}
