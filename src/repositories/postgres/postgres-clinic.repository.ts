import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import * as schema from '@/db/schema';
import type { IClinicRepository } from '../contracts/clinic.repository';
import type { ClinicInfo } from '@/types/doctorcheck';
import { mapClinicRowToDomain } from '../mappers/clinic.mapper';

export class PostgresClinicRepository implements IClinicRepository {
  async getClinicInfo(): Promise<ClinicInfo> {
    const rows = await db
      .select()
      .from(schema.clinicInfo)
      .where(eq(schema.clinicInfo.id, 'default'))
      .limit(1);

    if (!rows.length || !rows[0]) {
      throw new Error('Clinic info not found in database');
    }

    return mapClinicRowToDomain(rows[0]);
  }

  async getAdminClinicInfo(): Promise<typeof schema.clinicInfo.$inferSelect> {
    const rows = await db
      .select()
      .from(schema.clinicInfo)
      .where(eq(schema.clinicInfo.id, 'default'))
      .limit(1);

    if (!rows.length || !rows[0]) {
      throw new Error('Clinic info not found in database');
    }

    return rows[0];
  }
}

