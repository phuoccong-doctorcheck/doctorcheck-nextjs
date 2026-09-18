import type { ClinicInfo } from '@/types/doctorcheck';
import type { clinicInfo } from '@/db/schema/settings';

export type ClinicInfoRow = typeof clinicInfo.$inferSelect;

export interface IClinicRepository {
  getClinicInfo(): Promise<ClinicInfo>;
  getAdminClinicInfo(): Promise<ClinicInfoRow>;
}

