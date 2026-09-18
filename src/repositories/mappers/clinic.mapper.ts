import type { ClinicInfo } from '@/types/doctorcheck';
import type { clinicInfo } from '@/db/schema';

type ClinicRow = typeof clinicInfo.$inferSelect;

export function mapClinicRowToDomain(row: ClinicRow): ClinicInfo {
  const hours = (row.workingHours as { full?: string; short?: string }) || {};
  return {
    name: row.name,
    brandName: 'Doctor Check – Tầm Soát Bệnh Để Sống Thọ Hơn',
    legalName: row.legalName,
    license: row.licenseNumber,
    licenseIssuer: 'Sở Y Tế TP. Hồ Chí Minh',
    address: {
      full: row.addressFull,
      short: '429 Tô Hiến Thành, P.14, Q.10, TP.HCM',
      street: row.addressStreet,
      ward: row.addressWard,
      district: row.addressDistrict,
      city: row.addressCity,
    },
    hotline: row.hotline,
    hotlineFormatted: row.hotline,
    hotlineTel: `tel:${row.hotline.replace(/\s+/g, '')}`,
    zaloUrl: row.zaloUrl,
    email: row.email,
    websiteUrl: 'https://doctorcheck.vn',
    workingHours: hours.full || 'Thứ 2 - Thứ 7: 07:30 - 17:00',
    workingHoursShort: hours.short || 'T2 - T7: 07:30 - 17:00',
    coordinates: {
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      status: 'VERIFIED_LOCATION',
    },
    dataClassification: 'VERIFIED_PRODUCTION',
  };
}
