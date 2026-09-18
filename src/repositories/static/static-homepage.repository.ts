import { staticHomepageData, HomepageData } from '@/lib/data/homepage';
import type { IHomepageRepository } from '../contracts/homepage.repository';

export class StaticHomepageRepository implements IHomepageRepository {
  async getHomepageData(): Promise<HomepageData> {
    return staticHomepageData;
  }

  async getBlock<T = unknown>(blockKey: string): Promise<T | null> {
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
    return prop ? (staticHomepageData[prop] as unknown as T) : null;
  }

  async updateHomepageData(_data: HomepageData, _tx?: unknown): Promise<void> {
    // Static stub (no-op)
  }

  async updateBlock(
    _blockKey: string,
    _data: {
      title?: string | null;
      subtitle?: string | null;
      content?: Record<string, unknown>;
      isActive?: boolean;
    },
    _tx?: unknown
  ): Promise<void> {
    // Static stub (no-op)
  }
}
