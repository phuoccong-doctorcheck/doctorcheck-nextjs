'use client';

import React from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/sites/doctorcheck-vn/root/TopBar';
import { Header } from '@/components/sites/doctorcheck-vn/root/Header';
import { Footer } from '@/components/sites/doctorcheck-vn/root/Footer';
import { FloatingWidgets } from '@/components/sites/doctorcheck-vn/root/FloatingWidgets';
import { BookingSection } from '@/components/sites/doctorcheck-vn/root/BookingSection';
import { DoctorsSection } from '@/components/sites/doctorcheck-vn/root/DoctorsSection';
import { CLINIC_INFO } from '@/lib/data/clinic';
import { getPageBySlug } from '@/lib/content/pages-data';
import { RichText } from '@/components/content/RichText';
import type { PageRouteMetadata } from '@/lib/routing/route-types';
import type { PageContent } from '@/types/doctorcheck';
import { AboutUsPage } from '@/components/sites/doctorcheck-vn/about/AboutUsPage';
import { ChevronRight, MapPin, Phone, Clock } from 'lucide-react';

interface PageTemplateProps {
  page: PageRouteMetadata;
  pageContent?: PageContent;
}

export function PageTemplate({ page, pageContent }: PageTemplateProps) {
  const content = pageContent || getPageBySlug(page.slug);
  const isDoctorDirectory = page.slug === 'doi-ngu-bac-si-doctorcheck';
  const isContactPage = page.slug === 'lien-he';
  const isAboutPage = page.slug === 've-chung-toi' || page.slug === 've-doctor-check';

  // Check whether content is composed of UX Builder layout elements
  const isUxBuilder = Boolean(
    content?.contentHtml &&
      (content.contentHtml.includes('class="section') ||
        content.contentHtml.includes('class="banner') ||
        content.contentHtml.includes('class="row'))
  );

  if (isAboutPage) {
    return (
      <div className="min-h-screen flex flex-col bg-white selection:bg-[#FFB500] selection:text-[#00475B]">
        <TopBar />
        <Header />
        <main id="main" className="flex-1">
          <AboutUsPage />
        </main>
        <Footer />
        <FloatingWidgets />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-[#FFB500] selection:text-[#00475B]">
      <TopBar />
      <Header />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <div className="bg-[#F8FBFC] border-b border-gray-100 py-3">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <nav className="flex items-center gap-2 text-xs text-gray-500 flex-wrap" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#00475B] transition-colors">
                Trang chủ
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-gray-800 font-medium truncate max-w-md">
                {page.title}
              </span>
            </nav>
          </div>
        </div>

        {/* Page Header (Only for non-UX Builder pages to avoid duplicate banner) */}
        {!isUxBuilder && (
          <section className="bg-[#EEF7FA] py-8 md:py-10 border-b border-gray-200">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#005570] leading-tight">
                {page.title}
              </h1>
            </div>
          </section>
        )}

        {/* Contact Specific Cards if lien-he */}
        {isContactPage && (
          <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#EEF7FA] p-6 rounded-lg border border-gray-200 flex items-start gap-4">
                <MapPin className="w-6 h-6 text-[#005570] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-[#005570] text-sm mb-1">Địa chỉ phòng khám</h3>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    {CLINIC_INFO.address.full}
                  </p>
                </div>
              </div>

              <div className="bg-[#EEF7FA] p-6 rounded-lg border border-gray-200 flex items-start gap-4">
                <Phone className="w-6 h-6 text-[#005570] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-[#005570] text-sm mb-1">Hotline tư vấn 24/7</h3>
                  <a
                    href={CLINIC_INFO.hotlineTel}
                    className="text-base font-bold text-[#005570] hover:text-[#FFB500] transition-colors block"
                  >
                    {CLINIC_INFO.hotline}
                  </a>
                  <p className="text-xs text-gray-600 mt-1">Hỗ trợ đặt lịch & tư vấn chuẩn bị nội soi</p>
                </div>
              </div>

              <div className="bg-[#EEF7FA] p-6 rounded-lg border border-gray-200 flex items-start gap-4">
                <Clock className="w-6 h-6 text-[#005570] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-[#005570] text-sm mb-1">Giờ làm việc</h3>
                  <p className="text-xs sm:text-sm text-gray-700">
                    {CLINIC_INFO.workingHours}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Từ Thứ 2 đến Thứ 7</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Doctor Directory Carousel if doi-ngu-bac-si-doctorcheck */}
        {isDoctorDirectory && <DoctorsSection />}

        {/* Authentic Migrated Page HTML Content */}
        {content?.contentHtml && (
          isUxBuilder ? (
            <div className="w-full">
              <RichText contentHtml={content.contentHtml} />
            </div>
          ) : (
            <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 md:py-12">
              <RichText contentHtml={content.contentHtml} />
            </section>
          )
        )}

        {/* Embedded Booking Section */}
        <div id="booking">
          <BookingSection />
        </div>
      </main>

      <Footer />
      <FloatingWidgets />
    </div>
  );
}
