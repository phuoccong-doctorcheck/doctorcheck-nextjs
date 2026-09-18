import { pgTable, uuid, varchar, text, date, timestamp, index } from 'drizzle-orm/pg-core';

export const bookingRequests = pgTable(
  'booking_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    customerName: varchar('customer_name', { length: 255 }).notNull(),
    customerPhone: varchar('customer_phone', { length: 32 }).notNull(),
    customerYear: varchar('customer_year', { length: 16 }),
    serviceRequested: varchar('service_requested', { length: 255 }).notNull(),
    appointmentDate: date('appointment_date'),
    notes: text('notes'),
    status: varchar('status', { length: 32 }).notNull().default('pending'), // 'pending', 'contacted', 'confirmed', 'cancelled'
    utmSource: varchar('utm_source', { length: 128 }),
    utmMedium: varchar('utm_medium', { length: 128 }),
    utmCampaign: varchar('utm_campaign', { length: 128 }),
    ipAddress: varchar('ip_address', { length: 64 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_booking_requests_created_at').on(table.createdAt),
    index('idx_booking_requests_status').on(table.status),
  ]
);
