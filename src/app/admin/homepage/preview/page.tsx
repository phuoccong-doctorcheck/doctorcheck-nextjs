import React from 'react';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import {
  homepageRepository,
  doctorRepository,
  clinicalTrustRepository,
  clinicRepository,
} from '@/repositories';
import { revisionRepository } from '@/repositories/postgres/postgres-revision.repository';
import { ContentType } from '@/lib/workflow/types';
import type { HomepageData } from '@/lib/data/homepage';
import type { Metadata } from 'next';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Public Homepage UI Components (Reused 1:1 for zero visual drift)
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

export const metadata: Metadata = {
  title: '[XEM TRƯỚC BẢN NHÁP] Trang Chủ | DoctorCheck Admin',
  robots: { index: false, follow: false },
};

export default async function AdminHomepagePreviewPage() {
  const guard = await guardAdminModule(Permission.HOMEPAGE_EDIT, '/admin/homepage/preview');

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.HOMEPAGE_EDIT}
        userRoles={guard.user.roles}
        moduleName="Xem trước cấu hình Trang chủ"
      />
    );
  }

  // Fetch canonical homepage data, active draft revision, and referenced public entities
  const [
    canonicalData,
    activeRevision,
    doctors,
    equipment,
    clinicInfo,
  ] = await Promise.all([
    homepageRepository.getHomepageData(),
    revisionRepository.getLatestByEntity(ContentType.HOMEPAGE, 'default'),
    doctorRepository.getAll(),
    clinicalTrustRepository.getEquipment(),
    clinicRepository.getClinicInfo(),
  ]);

  // Use draft payload if present, otherwise fall back to canonical published data
  const homepageData = (activeRevision?.payload as HomepageData) || canonicalData;
  const status = activeRevision?.status || 'published';
  const revNum = activeRevision?.revisionNumber ?? 1;

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
    <div className="relative min-h-screen">
      {/* Floating Preview Watermark Bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between bg-amber-500 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-md">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 text-slate-900" />
          <span>
            CHẾ ĐỘ XEM TRƯỚC BẢN NHÁP TRANG CHỦ (PREVIEW DRAFT v{revNum} — Trạng thái: {status.toUpperCase()}) — KHÔNG CÔNG KHAI
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/homepage"
            className="inline-flex items-center gap-1 rounded bg-slate-900 px-2.5 py-1 text-xs text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Quay lại Trình Biên Tập
          </Link>
        </div>
      </div>

      {/* Public Homepage Presentation */}
      <div className="min-h-screen flex flex-col bg-[#FDFDF6] selection:bg-[#FFB500] selection:text-[#005570]">
        <Header />

        <main className="flex-1">
          {/* 1. Hero Section */}
          <HeroSection config={homepageData.hero} />

          {/* 2. Confuse Section */}
          <ConfuseSection
            painPointsConfig={homepageData.painPoints}
            videoHeadings={{
              titleDesktop: homepageData.sectionsMeta.videoTestimonialsHeader.titleDesktop,
              titleMobile: homepageData.sectionsMeta.videoTestimonialsHeader.titleMobile,
            }}
          />

          {/* 3. Benefits Section */}
          <BenefitsSection config={homepageData.benefits} />

          {/* 4. Doctors Section */}
          <DoctorsSection
            doctorsList={doctorList}
            header={homepageData.sectionsMeta.doctorsHeader}
          />

          {/* 5. Equipment Section */}
          <EquipmentSection
            equipmentList={equipmentList}
            header={homepageData.sectionsMeta.equipmentHeader}
          />

          {/* 6. Pricing Section */}
          <PricingSection
            pricingConfig={homepageData.pricing}
            header={homepageData.sectionsMeta.pricingHeader}
          />

          {/* 7. Cancer Screening Section */}
          <CancerScreeningSection config={homepageData.cancerScreening} />

          {/* 8. Customer Stories Section */}
          <CustomerStoriesSection
            header={homepageData.sectionsMeta.customerStoriesHeader}
          />

          {/* 9. Booking Section */}
          <BookingSection
            header={homepageData.sectionsMeta.bookingHeader}
            clinicInfo={clinicInfo}
          />

          {/* 10. FAQ Section */}
          <FaqSection
            header={homepageData.sectionsMeta.faqHeader}
          />

          {/* 11. Banner CTA Section */}
          <BannerCtaSection config={homepageData.bannerCta} />
        </main>

        <Footer />
        <MobileBottomBar />
        <FloatingWidgets />
      </div>
    </div>
  );
}
