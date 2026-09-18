import 'server-only';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/db';
import * as schema from '@/db/schema';
import type { IClinicalTrustRepository } from '../contracts/clinical-trust.repository';
import type { MedicalEquipment, FaqItem, TestimonialVideo, CustomerStory } from '@/types/doctorcheck';

export class PostgresClinicalTrustRepository implements IClinicalTrustRepository {
  async getEquipment(): Promise<MedicalEquipment[]> {
    const rows = await db
      .select()
      .from(schema.equipment)
      .where(eq(schema.equipment.isActive, true))
      .orderBy(asc(schema.equipment.sortOrder));

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      origin: r.origin,
      manufacturer: r.manufacturer,
      image: r.imageUrl,
      description: r.description,
      features: (r.features as unknown as string[]) || [],
      dataClassification: 'VERIFIED_PRODUCTION',
    }));
  }

  async getFaqs(): Promise<FaqItem[]> {
    const rows = await db
      .select()
      .from(schema.faqs)
      .where(eq(schema.faqs.isPublished, true))
      .orderBy(asc(schema.faqs.sortOrder));

    return rows.map((r) => ({
      id: r.id,
      question: r.question,
      answer: r.answer,
      category: r.category && r.category !== 'general' ? r.category : undefined,
      dataClassification: 'VERIFIED_PRODUCTION',
    }));
  }

  async getVideoTestimonials(): Promise<TestimonialVideo[]> {
    const rows = await db
      .select()
      .from(schema.testimonials)
      .where(eq(schema.testimonials.type, 'video'))
      .orderBy(asc(schema.testimonials.sortOrder));

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      patientName: r.patientName,
      patientAge: r.patientAge || undefined,
      videoId: r.videoId || '',
      thumbnail: r.imageUrl || '',
      quote: r.quote || '',
      dataClassification: 'VERIFIED_PRODUCTION',
    }));
  }

  async getCustomerStories(): Promise<CustomerStory[]> {
    const rows = await db
      .select()
      .from(schema.testimonials)
      .where(eq(schema.testimonials.type, 'customer_story'))
      .orderBy(asc(schema.testimonials.sortOrder));

    return rows.map((r) => {
      let summary = '';
      if (r.id === 'co-lien') summary = 'Có Người Nhà Bị Ung Thư Đại Tràng...';
      else if (r.id === 'chu-hong-anh') summary = 'Chú Hồng Anh, 72 Tuổi...';
      else if (r.id === 'an-khong-ngon') summary = 'Thời gian đó, tôi ăn uống rất khó chịu...';
      else summary = r.fullStory ? `${r.fullStory.slice(0, 100)}...` : '';

      return {
        id: r.id,
        title: r.title,
        patientName: r.patientName,
        summary,
        fullStory: r.fullStory || '',
        image: r.imageUrl || '',
        tag: r.tag || 'Tầm Soát Ung Thư',
        dataClassification: 'VERIFIED_PRODUCTION' as const,
      };
    });
  }

  async getEquipmentAdminList(): Promise<schema.Equipment[]> {
    return await db
      .select()
      .from(schema.equipment)
      .orderBy(asc(schema.equipment.sortOrder));
  }

  async getEquipmentById(id: string): Promise<schema.Equipment | null> {
    const [row] = await db
      .select()
      .from(schema.equipment)
      .where(eq(schema.equipment.id, id))
      .limit(1);
    return row || null;
  }

  async getFaqsAdminList(): Promise<schema.Faq[]> {
    return await db
      .select()
      .from(schema.faqs)
      .orderBy(asc(schema.faqs.sortOrder));
  }

  async getFaqById(id: string): Promise<schema.Faq | null> {
    const [row] = await db
      .select()
      .from(schema.faqs)
      .where(eq(schema.faqs.id, id))
      .limit(1);
    return row || null;
  }

  async getVideoTestimonialsAdminList(): Promise<schema.Testimonial[]> {
    return await db
      .select()
      .from(schema.testimonials)
      .where(eq(schema.testimonials.type, 'video'))
      .orderBy(asc(schema.testimonials.sortOrder));
  }

  async getVideoTestimonialById(id: string): Promise<schema.Testimonial | null> {
    const [row] = await db
      .select()
      .from(schema.testimonials)
      .where(eq(schema.testimonials.id, id))
      .limit(1);
    return row && row.type === 'video' ? row : null;
  }

  async getCustomerStoriesAdminList(): Promise<schema.Testimonial[]> {
    return await db
      .select()
      .from(schema.testimonials)
      .where(eq(schema.testimonials.type, 'customer_story'))
      .orderBy(asc(schema.testimonials.sortOrder));
  }

  async getCustomerStoryById(id: string): Promise<schema.Testimonial | null> {
    const [row] = await db
      .select()
      .from(schema.testimonials)
      .where(eq(schema.testimonials.id, id))
      .limit(1);
    return row && row.type === 'customer_story' ? row : null;
  }

  async reorderEquipment(orderedIds: string[]): Promise<void> {
    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(schema.equipment)
          .set({ sortOrder: i + 1, updatedAt: new Date() })
          .where(eq(schema.equipment.id, orderedIds[i]));
      }
    });
  }

  async reorderFaqs(orderedIds: string[]): Promise<void> {
    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(schema.faqs)
          .set({ sortOrder: i + 1, updatedAt: new Date() })
          .where(eq(schema.faqs.id, orderedIds[i]));
      }
    });
  }

  async reorderTestimonials(orderedIds: string[]): Promise<void> {
    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(schema.testimonials)
          .set({ sortOrder: i + 1, updatedAt: new Date() })
          .where(eq(schema.testimonials.id, orderedIds[i]));
      }
    });
  }

  async checkHomepageReferences(
    domain: 'equipment' | 'faq' | 'testimonial',
    id: string
  ): Promise<string[]> {
    const references: string[] = [];
    const blocks = await db.select().from(schema.homepageBlocks);

    for (const block of blocks) {
      const contentStr = JSON.stringify(block.content || {});
      if (contentStr.includes(id)) {
        references.push(block.blockKey);
      }
    }

    return references;
  }
}

