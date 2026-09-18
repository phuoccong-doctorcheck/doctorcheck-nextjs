import type { PackageTier } from '@/types/doctorcheck';
import type { packages } from '@/db/schema';

type PackageRow = typeof packages.$inferSelect;

export function mapPackageRowToDomain(row: PackageRow): PackageTier {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    gender: row.gender as 'male' | 'female' | 'both',
    price: Number(row.priceVnd),
    priceFormatted: row.priceFormatted,
    tagline: row.tagline || '',
    diseasesCovered: row.diseasesCovered,
    cancersCovered: row.cancersCovered,
    duration: row.duration,
    popular: row.isPopular,
    features: (row.features as unknown as string[]) || [],
    recommendedFor: row.recommendedFor,
    image: row.imageUrl || undefined,
    url: `https://www.doctorcheck.vn/${row.slug}/`,
    dataClassification: 'VERIFIED_PRODUCTION',
  };
}
