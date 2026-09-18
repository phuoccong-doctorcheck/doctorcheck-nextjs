import { pgTable, varchar, text, integer, boolean, timestamp, primaryKey, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const specialties = pgTable('specialties', {
  id: varchar('id', { length: 64 }).primaryKey(), // e.g. 'tieu-hoa', 'noi-soi'
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const doctors = pgTable(
  'doctors',
  {
    id: varchar('id', { length: 64 }).primaryKey(), // e.g. 'bs-dang-nguyen-nhat-trung'
    slug: varchar('slug', { length: 128 }).notNull().unique(), // e.g. 'bac-si-dang-nguyen-nhat-trung'
    name: varchar('name', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(), // 'Bác sĩ CKI', 'Thạc sĩ Bác sĩ'
    cchn: varchar('cchn', { length: 64 }).notNull(), // Verified Medical Practice License Code
    specialtySummary: varchar('specialty_summary', { length: 255 }).notNull(), // 'Nội soi Tiêu hóa - Gan Mật'
    clinicalScope: text('clinical_scope').notNull(), // Phạm vi hoạt động chuyên môn
    hospital: varchar('hospital', { length: 255 }).notNull(), // 'Bệnh viện Chợ Rẫy'
    experienceYears: integer('experience_years').notNull().default(10),
    imageUrl: text('image_url').notNull(),
    description: text('description').notNull(),
    detailedBioHtml: text('detailed_bio_html'),
    schedule: varchar('schedule', { length: 255 }).notNull(), // 'Thứ 2 - Thứ 7 (Theo lịch hẹn)'
    isFeatured: boolean('is_featured').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    seoTitle: varchar('seo_title', { length: 255 }),
    seoDescription: text('seo_description'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_doctors_slug').on(table.slug),
  ]
);

export const doctorSpecialties = pgTable(
  'doctor_specialties',
  {
    doctorId: varchar('doctor_id', { length: 64 })
      .notNull()
      .references(() => doctors.id, { onDelete: 'cascade' }),
    specialtyId: varchar('specialty_id', { length: 64 })
      .notNull()
      .references(() => specialties.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.doctorId, table.specialtyId] }),
  ]
);

export const specialtiesRelations = relations(specialties, ({ many }) => ({
  doctorSpecialties: many(doctorSpecialties),
}));

export const doctorsRelations = relations(doctors, ({ many }) => ({
  doctorSpecialties: many(doctorSpecialties),
}));

export const doctorSpecialtiesRelations = relations(doctorSpecialties, ({ one }) => ({
  doctor: one(doctors, {
    fields: [doctorSpecialties.doctorId],
    references: [doctors.id],
  }),
  specialty: one(specialties, {
    fields: [doctorSpecialties.specialtyId],
    references: [specialties.id],
  }),
}));
