import type { MedicalEquipment, FaqItem, TestimonialVideo, CustomerStory } from '@/types/doctorcheck';
import type { equipment, faqs, testimonials } from '@/db/schema/clinical-trust';

export type EquipmentRow = typeof equipment.$inferSelect;
export type FaqRow = typeof faqs.$inferSelect;
export type TestimonialRow = typeof testimonials.$inferSelect;

export interface IClinicalTrustRepository {
  // Public
  getEquipment(): Promise<MedicalEquipment[]>;
  getFaqs(): Promise<FaqItem[]>;
  getVideoTestimonials(): Promise<TestimonialVideo[]>;
  getCustomerStories(): Promise<CustomerStory[]>;

  // Admin Listings & Lookups
  getEquipmentAdminList(): Promise<EquipmentRow[]>;
  getEquipmentById(id: string): Promise<EquipmentRow | null>;
  getFaqsAdminList(): Promise<FaqRow[]>;
  getFaqById(id: string): Promise<FaqRow | null>;
  getVideoTestimonialsAdminList(): Promise<TestimonialRow[]>;
  getVideoTestimonialById(id: string): Promise<TestimonialRow | null>;
  getCustomerStoriesAdminList(): Promise<TestimonialRow[]>;
  getCustomerStoryById(id: string): Promise<TestimonialRow | null>;

  // Deterministic Batch Reordering
  reorderEquipment(orderedIds: string[]): Promise<void>;
  reorderFaqs(orderedIds: string[]): Promise<void>;
  reorderTestimonials(orderedIds: string[]): Promise<void>;

  // Homepage Dependency & Reference Protection
  checkHomepageReferences(domain: 'equipment' | 'faq' | 'testimonial', id: string): Promise<string[]>;
}

