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

export type {
  HeroBlockConfig,
  PainPointsBlockConfig,
  BenefitsBlockConfig,
  CancerScreeningBlockConfig,
  BannerCtaBlockConfig,
  SectionsMetaConfig,
  PricingBlockConfig,
  HomepageData,
};

export interface IHomepageRepository {
  getHomepageData(): Promise<HomepageData>;
  getBlock<T = unknown>(blockKey: string): Promise<T | null>;
  updateHomepageData(data: HomepageData, tx?: unknown): Promise<void>;
  updateBlock(
    blockKey: string,
    data: {
      title?: string | null;
      subtitle?: string | null;
      content?: Record<string, unknown>;
      isActive?: boolean;
    },
    tx?: unknown
  ): Promise<void>;
}
