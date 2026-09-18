import type { IClinicRepository, ClinicInfoRow } from '../contracts/clinic.repository';
import type { ClinicInfo } from '@/types/doctorcheck';
import { CLINIC_INFO } from '@/lib/data/clinic';

export class StaticClinicRepository implements IClinicRepository {
  async getClinicInfo(): Promise<ClinicInfo> {
    return CLINIC_INFO;
  }

  async getAdminClinicInfo(): Promise<ClinicInfoRow> {
    return {
      id: 'default',
      name: CLINIC_INFO.name,
      legalName: CLINIC_INFO.legalName,
      licenseNumber: CLINIC_INFO.license,
      taxCode: '0315729707',
      hotline: CLINIC_INFO.hotline,
      emergencyPhone: null,
      zaloUrl: CLINIC_INFO.zaloUrl,
      email: CLINIC_INFO.email,
      addressStreet: CLINIC_INFO.address.street,
      addressWard: CLINIC_INFO.address.ward,
      addressDistrict: CLINIC_INFO.address.district,
      addressCity: CLINIC_INFO.address.city,
      addressFull: CLINIC_INFO.address.full,
      latitude: String(CLINIC_INFO.coordinates.latitude),
      longitude: String(CLINIC_INFO.coordinates.longitude),
      workingHours: { full: CLINIC_INFO.workingHours, short: CLINIC_INFO.workingHoursShort },
      updatedAt: new Date(),
    };
  }
}

