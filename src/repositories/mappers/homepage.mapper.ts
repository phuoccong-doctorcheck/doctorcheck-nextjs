import type {
  HeroBlockConfig,
  PainPointsBlockConfig,
  BenefitsBlockConfig,
  CancerScreeningBlockConfig,
  BannerCtaBlockConfig,
  SectionsMetaConfig,
  PricingBlockConfig,
  HomepageData,
} from '@/lib/data/homepage';
import { staticHomepageData } from '@/lib/data/homepage';
import type { InferSelectModel } from 'drizzle-orm';
import type { homepageBlocks } from '@/db/schema';

export type HomepageBlockRow = InferSelectModel<typeof homepageBlocks>;

export function mapHomepageRowsToDomain(rows: HomepageBlockRow[]): HomepageData {
  const rowMap = new Map<string, HomepageBlockRow>();
  for (const r of rows) {
    rowMap.set(r.blockKey, r);
  }

  // 1. Hero
  const heroRow = rowMap.get('hero');
  const heroContent = (heroRow?.content as Record<string, unknown>) || {};
  const hero: HeroBlockConfig = {
    title: heroRow?.title || staticHomepageData.hero.title,
    subtitle: (heroRow?.subtitle as string) || (heroContent.subtitle as string) || staticHomepageData.hero.subtitle,
    desktopBanner: (heroContent.desktopBanner as string) || staticHomepageData.hero.desktopBanner,
    mobileBanner: (heroContent.mobileBanner as string) || staticHomepageData.hero.mobileBanner,
    ctaTarget: (heroContent.ctaTarget as string) || staticHomepageData.hero.ctaTarget,
  };

  // 2. Pain Points
  const painPointsRow = rowMap.get('pain_points');
  const painPointsContent = (painPointsRow?.content as Record<string, unknown>) || {};
  const painPoints: PainPointsBlockConfig = {
    title: painPointsRow?.title || staticHomepageData.painPoints.title,
    subtitle: (painPointsRow?.subtitle as string) || staticHomepageData.painPoints.subtitle,
    items: (painPointsContent.items as PainPointsBlockConfig['items']) || staticHomepageData.painPoints.items,
  };

  // 3. Benefits
  const benefitsRow = rowMap.get('benefits');
  const benefitsContent = (benefitsRow?.content as Record<string, unknown>) || {};
  const benefits: BenefitsBlockConfig = {
    title: benefitsRow?.title || staticHomepageData.benefits.title,
    moreUrl: (benefitsContent.moreUrl as string) || staticHomepageData.benefits.moreUrl,
    moreLabel: (benefitsContent.moreLabel as string) || staticHomepageData.benefits.moreLabel,
    bannerImage: (benefitsContent.bannerImage as string) || staticHomepageData.benefits.bannerImage,
    bannerVideoId: (benefitsContent.bannerVideoId as string) || staticHomepageData.benefits.bannerVideoId,
    items: (benefitsContent.items as BenefitsBlockConfig['items']) || staticHomepageData.benefits.items,
  };

  // 4. Cancer Screening
  const cancerRow = rowMap.get('cancer_screening');
  const cancerContent = (cancerRow?.content as Record<string, unknown>) || {};
  const cancerScreening: CancerScreeningBlockConfig = {
    title: cancerRow?.title || staticHomepageData.cancerScreening.title,
    description: (cancerContent.description as string) || staticHomepageData.cancerScreening.description,
    ctaUrl: (cancerContent.ctaUrl as string) || staticHomepageData.cancerScreening.ctaUrl,
    ctaLabel: (cancerContent.ctaLabel as string) || staticHomepageData.cancerScreening.ctaLabel,
    featuredCards: (cancerContent.featuredCards as CancerScreeningBlockConfig['featuredCards']) || staticHomepageData.cancerScreening.featuredCards,
  };

  // 5. Banner CTA
  const bannerRow = rowMap.get('banner_cta');
  const bannerContent = (bannerRow?.content as Record<string, unknown>) || {};
  const bannerCta: BannerCtaBlockConfig = {
    brand: (bannerContent.brand as string) || staticHomepageData.bannerCta.brand,
    title: bannerRow?.title || staticHomepageData.bannerCta.title,
    workingHoursTitle: (bannerContent.workingHoursTitle as string) || staticHomepageData.bannerCta.workingHoursTitle,
    workingHoursWeekday: (bannerContent.workingHoursWeekday as string) || staticHomepageData.bannerCta.workingHoursWeekday,
    workingHoursSunday: (bannerContent.workingHoursSunday as string) || staticHomepageData.bannerCta.workingHoursSunday,
    buttonText: (bannerContent.buttonText as string) || staticHomepageData.bannerCta.buttonText,
    buttonTarget: (bannerContent.buttonTarget as string) || staticHomepageData.bannerCta.buttonTarget,
    desktopImage: (bannerContent.desktopImage as string) || staticHomepageData.bannerCta.desktopImage,
    mobileImage: (bannerContent.mobileImage as string) || staticHomepageData.bannerCta.mobileImage,
  };

  // 6. Sections Meta
  const sectionsRow = rowMap.get('sections_meta');
  const sectionsContent = (sectionsRow?.content as Record<string, unknown>) || {};
  const sectionsMeta: SectionsMetaConfig = {
    doctorsHeader: (sectionsContent.doctorsHeader as SectionsMetaConfig['doctorsHeader']) || staticHomepageData.sectionsMeta.doctorsHeader,
    equipmentHeader: (sectionsContent.equipmentHeader as SectionsMetaConfig['equipmentHeader']) || staticHomepageData.sectionsMeta.equipmentHeader,
    pricingHeader: (sectionsContent.pricingHeader as SectionsMetaConfig['pricingHeader']) || staticHomepageData.sectionsMeta.pricingHeader,
    customerStoriesHeader: (sectionsContent.customerStoriesHeader as SectionsMetaConfig['customerStoriesHeader']) || staticHomepageData.sectionsMeta.customerStoriesHeader,
    videoTestimonialsHeader: (sectionsContent.videoTestimonialsHeader as SectionsMetaConfig['videoTestimonialsHeader']) || staticHomepageData.sectionsMeta.videoTestimonialsHeader,
    faqHeader: (sectionsContent.faqHeader as SectionsMetaConfig['faqHeader']) || staticHomepageData.sectionsMeta.faqHeader,
    bookingHeader: (sectionsContent.bookingHeader as SectionsMetaConfig['bookingHeader']) || staticHomepageData.sectionsMeta.bookingHeader,
  };

  // 7. Pricing
  const pricingRow = rowMap.get('pricing');
  const pricingContent = (pricingRow?.content as Record<string, unknown>) || {};
  const pricing: PricingBlockConfig = {
    malePackages: (pricingContent.malePackages as PricingBlockConfig['malePackages']) || staticHomepageData.pricing.malePackages,
    femalePackages: (pricingContent.femalePackages as PricingBlockConfig['femalePackages']) || staticHomepageData.pricing.femalePackages,
  };

  return {
    hero,
    painPoints,
    benefits,
    cancerScreening,
    bannerCta,
    sectionsMeta,
    pricing,
  };
}
