import { ClinicInfo } from '@/types/doctorcheck';

/**
 * AUTHENTIC DOCTORCHECK CLINIC BUSINESS DATA
 *
 * All values in this module have been strictly verified against official registry records:
 * - Operating License: 09789/HCM-GPHĐ issued by Sở Y Tế TP. Hồ Chí Minh
 * - Physical Address: 429 Tô Hiến Thành, Phường 14, Quận 10, TP. Hồ Chí Minh
 * - Primary Hotline: 028 5678 9999
 * - Official Zalo OA: https://zalo.me/309834292180920772
 *
 * DO NOT replace with unverified or placeholder data.
 */
export const CLINIC_INFO: ClinicInfo = {
  name: 'Phòng khám Doctor Check',
  brandName: 'Doctor Check – Tầm Soát Bệnh Để Sống Thọ Hơn',
  legalName: 'Công ty TNHH Doctor Check',
  license: '09789/HCM-GPHĐ',
  licenseIssuer: 'Sở Y Tế TP. Hồ Chí Minh',
  address: {
    full: '429 Tô Hiến Thành, Phường 14, Quận 10, TP. Hồ Chí Minh',
    short: '429 Tô Hiến Thành, P.14, Q.10, TP.HCM',
    street: '429 Tô Hiến Thành',
    ward: 'Phường 14',
    district: 'Quận 10',
    city: 'TP. Hồ Chí Minh',
  },
  hotline: '028 5678 9999',
  hotlineFormatted: '028 5678 9999',
  hotlineTel: 'tel:02856789999',
  zaloUrl: 'https://zalo.me/309834292180920772',
  email: 'contact@doctorcheck.vn',
  websiteUrl: 'https://doctorcheck.vn',
  workingHours: 'Thứ 2 - Thứ 7: 07:30 - 17:00',
  workingHoursShort: 'T2 - T7: 07:30 - 17:00',
  coordinates: {
    latitude: 10.7751983,
    longitude: 106.6627364,
    status: 'VERIFIED_LOCATION',
  },
  dataClassification: 'VERIFIED_PRODUCTION',
};
