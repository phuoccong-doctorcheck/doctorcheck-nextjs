import type {
  IClinicalTrustRepository,
  EquipmentRow,
  FaqRow,
  TestimonialRow,
} from '../contracts/clinical-trust.repository';
import type { MedicalEquipment, FaqItem, TestimonialVideo, CustomerStory } from '@/types/doctorcheck';
import { equipmentData } from '@/lib/data/equipment';
import { faqsData } from '@/lib/data/faqs';
import { videoTestimonialsData } from '@/lib/data/testimonials';

const customerStoriesStatic: CustomerStory[] = [
  {
    id: 'co-lien',
    title: 'Có Người Nhà Bị Ung Thư Đại Tràng, Cô Liên Quyết Định Đến Doctor Check Để Tầm Soát Ung Thư',
    patientName: 'Cô Ngọc Liên',
    summary: 'Có Người Nhà Bị Ung Thư Đại Tràng...',
    fullStory: 'Có Người Nhà Bị Ung Thư Đại Tràng, Cô Liên Quyết Định Đến Doctor Check Để Tầm Soát Ung Thư! Cô Ngọc Liên, hiện đang sinh sống tại thành phố...',
    image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/c8f18d38-0720-41fa-89f9-8b088f3dbe00/w=1020,h=536',
    tag: 'Tầm soát Ung thư',
    dataClassification: 'VERIFIED_PRODUCTION',
  },
  {
    id: 'chu-hong-anh',
    title: 'Bị Tiểu Đường 26 Năm Nên Chú Hồng Anh Muốn Kiểm Tra Sức Khỏe Định Kỳ',
    patientName: 'Chú Hồng Anh',
    summary: 'Chú Hồng Anh, 72 Tuổi...',
    fullStory: 'Chú Hồng Anh, 72 Tuổi, Tại TPHCM có mắc bệnh nền bị tiểu đường. Thế nên, hôm nay chú quyết định đến phòng khám Doctor Check để kiểm tra sức...',
    image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/a1c13271-35cc-4174-e705-b03beb227e00/w=1020,h=536',
    tag: 'Bệnh Mạn Tính',
    dataClassification: 'VERIFIED_PRODUCTION',
  },
  {
    id: 'an-khong-ngon',
    title: 'Gần một tháng, tôi ăn không ngon, ngủ cũng không yên.',
    patientName: 'Bệnh nhân tầm soát',
    summary: 'Thời gian đó, tôi ăn uống rất khó chịu...',
    fullStory: 'Thời gian đó, tôi ăn uống rất khó chịu. Ăn vào là buồn nôn, có lúc ói ra ngay. Ngay cả khi không ăn, cảm giác này vẫn còn....',
    image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/c2435d61-05c2-492e-be58-c88a81822e00/w=800,h=800,fit=crop',
    tag: 'Nội Soi Tiêu Hóa',
    dataClassification: 'VERIFIED_PRODUCTION',
  },
];

export class StaticClinicalTrustRepository implements IClinicalTrustRepository {
  async getEquipment(): Promise<MedicalEquipment[]> {
    return equipmentData;
  }

  async getFaqs(): Promise<FaqItem[]> {
    return faqsData;
  }

  async getVideoTestimonials(): Promise<TestimonialVideo[]> {
    return videoTestimonialsData;
  }

  async getCustomerStories(): Promise<CustomerStory[]> {
    return customerStoriesStatic;
  }

  async getEquipmentAdminList(): Promise<EquipmentRow[]> {
    return equipmentData.map((e, idx) => ({
      id: e.id,
      name: e.name,
      origin: e.origin,
      manufacturer: e.manufacturer,
      imageUrl: e.image,
      description: e.description,
      features: e.features,
      sortOrder: idx + 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  async getEquipmentById(id: string): Promise<EquipmentRow | null> {
    const item = equipmentData.find((e) => e.id === id);
    if (!item) return null;
    return {
      id: item.id,
      name: item.name,
      origin: item.origin,
      manufacturer: item.manufacturer,
      imageUrl: item.image,
      description: item.description,
      features: item.features,
      sortOrder: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getFaqsAdminList(): Promise<FaqRow[]> {
    return faqsData.map((f, idx) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      category: f.category || 'general',
      sortOrder: idx + 1,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  async getFaqById(id: string): Promise<FaqRow | null> {
    const f = faqsData.find((item) => item.id === id);
    if (!f) return null;
    return {
      id: f.id,
      question: f.question,
      answer: f.answer,
      category: f.category || 'general',
      sortOrder: 1,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getVideoTestimonialsAdminList(): Promise<TestimonialRow[]> {
    return videoTestimonialsData.map((v, idx) => ({
      id: v.id,
      type: 'video',
      patientName: v.patientName,
      patientAge: v.patientAge || null,
      title: v.title,
      quote: v.quote || null,
      fullStory: null,
      videoId: v.videoId,
      imageUrl: v.thumbnail || null,
      tag: null,
      sortOrder: idx + 1,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  async getVideoTestimonialById(id: string): Promise<TestimonialRow | null> {
    const v = videoTestimonialsData.find((item) => item.id === id);
    if (!v) return null;
    return {
      id: v.id,
      type: 'video',
      patientName: v.patientName,
      patientAge: v.patientAge || null,
      title: v.title,
      quote: v.quote || null,
      fullStory: null,
      videoId: v.videoId,
      imageUrl: v.thumbnail || null,
      tag: null,
      sortOrder: 1,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getCustomerStoriesAdminList(): Promise<TestimonialRow[]> {
    return customerStoriesStatic.map((s, idx) => ({
      id: s.id,
      type: 'customer_story',
      patientName: s.patientName,
      patientAge: null,
      title: s.title,
      quote: s.summary,
      fullStory: s.fullStory,
      videoId: null,
      imageUrl: s.image,
      tag: s.tag,
      sortOrder: idx + 1,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  async getCustomerStoryById(id: string): Promise<TestimonialRow | null> {
    const s = customerStoriesStatic.find((item) => item.id === id);
    if (!s) return null;
    return {
      id: s.id,
      type: 'customer_story',
      patientName: s.patientName,
      patientAge: null,
      title: s.title,
      quote: s.summary,
      fullStory: s.fullStory,
      videoId: null,
      imageUrl: s.image,
      tag: s.tag,
      sortOrder: 1,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async reorderEquipment(_orderedIds: string[]): Promise<void> {}
  async reorderFaqs(_orderedIds: string[]): Promise<void> {}
  async reorderTestimonials(_orderedIds: string[]): Promise<void> {}
  async checkHomepageReferences(_domain: 'equipment' | 'faq' | 'testimonial', _id: string): Promise<string[]> {
    return [];
  }
}

