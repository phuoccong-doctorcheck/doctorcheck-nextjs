import React from 'react';
import { Header } from '@/components/sites/doctorcheck-vn/root/Header';
import { HeroSection } from '@/components/sites/doctorcheck-vn/root/HeroSection';
import { ConfuseSection } from '@/components/sites/doctorcheck-vn/root/ConfuseSection';
import { BenefitsSection } from '@/components/sites/doctorcheck-vn/root/BenefitsSection';
import { DoctorsSection } from '@/components/sites/doctorcheck-vn/root/DoctorsSection';
import { EquipmentSection } from '@/components/sites/doctorcheck-vn/root/EquipmentSection';
import { PricingSection } from '@/components/sites/doctorcheck-vn/root/PricingSection';
import { CancerScreeningSection } from '@/components/sites/doctorcheck-vn/root/CancerScreeningSection';
import { CustomerStoriesSection } from '@/components/sites/doctorcheck-vn/root/CustomerStoriesSection';
import { BookingSection } from '@/components/sites/doctorcheck-vn/root/BookingSection';
import { FaqSection } from '@/components/sites/doctorcheck-vn/root/FaqSection';
import { BannerCtaSection } from '@/components/sites/doctorcheck-vn/root/BannerCtaSection';
import { Footer } from '@/components/sites/doctorcheck-vn/root/Footer';
import { MobileBottomBar } from '@/components/sites/doctorcheck-vn/root/MobileBottomBar';
import { FloatingWidgets } from '@/components/sites/doctorcheck-vn/root/FloatingWidgets';

import {
  homepageRepository,
  doctorRepository,
  clinicalTrustRepository,
  clinicRepository,
} from '@/repositories';

export default async function HomePage() {
  const [
    homepageData,
    doctors,
    equipment,
    clinicInfo,
  ] = await Promise.all([
    homepageRepository.getHomepageData(),
    doctorRepository.getAll(),
    clinicalTrustRepository.getEquipment(),
    clinicRepository.getClinicInfo(),
  ]);

  const doctorList = doctors.map((doc) => ({
    id: doc.id,
    slug: `/doctor/${doc.id}/`,
    degree: doc.title,
    name: doc.name,
    role: doc.specialty,
    image: doc.image,
  }));

  const equipmentList = equipment.map((eq) => ({
    id: eq.id,
    name: eq.name,
    desc: eq.description,
    image: eq.image,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDF6] selection:bg-[#FFB500] selection:text-[#005570]">
      {/* 0. Main Sticky Navigation (90px desktop / 64px mobile) */}
      <Header />

      <main className="flex-1">
        {/* 1. section-banner: Above-the-fold Hero (2560x1038 desktop / 856x1256 mobile) */}
        <HeroSection config={homepageData.hero} />

        {/* 2. section-confuse: 4 Patient Concerns + Customer Video Testimonials (unified section_294013533) */}
        <ConfuseSection
          painPointsConfig={homepageData.painPoints}
          videoHeadings={{
            titleDesktop: homepageData.sectionsMeta.videoTestimonialsHeader.titleDesktop,
            titleMobile: homepageData.sectionsMeta.videoTestimonialsHeader.titleMobile,
          }}
        />

        {/* 4. section-advanced: 5 Benefits Accordion + Video Banner */}
        <BenefitsSection config={homepageData.benefits} />

        {/* 5. section-doctor: 7 Doctors Carousel */}
        <DoctorsSection
          doctorsList={doctorList}
          header={homepageData.sectionsMeta.doctorsHeader}
        />

        {/* 6. section-facilities: 6 Photographic Equipment Cards */}
        <EquipmentSection
          equipmentList={equipmentList}
          header={homepageData.sectionsMeta.equipmentHeader}
        />

        {/* 7. section-service: Pricing Matrix (Nam / Nữ Tabs) */}
        <PricingSection
          pricingConfig={homepageData.pricing}
          header={homepageData.sectionsMeta.pricingHeader}
        />

        {/* 8. section-suggest: Cancer Screening Dark Section */}
        <CancerScreeningSection config={homepageData.cancerScreening} />

        {/* 9. section-customer: 3 Real Customer Stories */}
        <CustomerStoriesSection
          header={homepageData.sectionsMeta.customerStoriesHeader}
        />

        {/* 10. section-cta: Consultation & Booking Form (#tu-van) */}
        <BookingSection
          header={homepageData.sectionsMeta.bookingHeader}
          clinicInfo={clinicInfo}
        />

        {/* 11. section-faq: 4 Authentic FAQs Accordion */}
        <FaqSection
          header={homepageData.sectionsMeta.faqHeader}
        />

        {/* 12. section-banner-cta: Bottom Banner CTA (Desktop 1709x795 / Mobile 545x963) */}
        <BannerCtaSection config={homepageData.bannerCta} />
      </main>

      {/* 13. Comprehensive Clinic Footer */}
      <Footer />

      {/* Mobile Sticky Action Bar */}
      <MobileBottomBar />

      {/* Floating Quick Action Widgets */}
      <FloatingWidgets />
    </div>
  );
}
