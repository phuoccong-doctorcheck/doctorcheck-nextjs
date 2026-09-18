'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/sites/doctorcheck-vn/root/Header';
import { Footer } from '@/components/sites/doctorcheck-vn/root/Footer';
import { FloatingWidgets } from '@/components/sites/doctorcheck-vn/root/FloatingWidgets';
import { BookingSection } from '@/components/sites/doctorcheck-vn/root/BookingSection';
import { RichText } from '@/components/content/RichText';
import type { PageRouteMetadata } from '@/lib/routing/route-types';
import type { PageContent } from '@/types/doctorcheck';
import { ChevronRight, Phone, ShieldCheck, Stethoscope } from 'lucide-react';
import { CLINIC_INFO } from '@/lib/data/clinic';

interface ClinicalEndoscopyTemplateProps {
  page: PageRouteMetadata;
  pageContent?: PageContent;
}

export function ClinicalEndoscopyTemplate({ page, pageContent }: ClinicalEndoscopyTemplateProps) {
  const isNestedSubpath = page.subpath && page.subpath.trim().length > 0;
  const contentHtml = pageContent?.contentHtml || '';

  return (
    <div className="clinical-hub-page min-h-screen flex flex-col bg-[#FFFFFF] selection:bg-[#FFB500] selection:text-[#00475B]">
      {/* 1. Global Header */}
      <Header />

      {/* 2. Breadcrumb Navigation Bar */}
      <div className="bg-[#F8FBFC] border-b border-gray-100 py-2.5">
        <div className="max-w-[1250px] mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-gray-500 flex-wrap" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#00475B] transition-colors flex items-center gap-1">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            
            {isNestedSubpath ? (
              <>
                <Link
                  href="/trung-tam-noi-soi-tieu-hoa-doctor-check/"
                  className="hover:text-[#00475B] transition-colors truncate max-w-xs"
                >
                  Trung tâm nội soi tiêu hóa
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-[#005570] font-semibold truncate max-w-md">
                  {page.title}
                </span>
              </>
            ) : (
              <span className="text-[#005570] font-semibold truncate max-w-md">
                {page.title}
              </span>
            )}
          </nav>
        </div>
      </div>

      {/* 3. Main Clinical Landing Content */}
      <main id="main" className="flex-1 w-full">
        {contentHtml ? (
          <div className="w-full">
            <RichText contentHtml={contentHtml} />
          </div>
        ) : (
          <div className="max-w-[1250px] mx-auto px-4 py-16 text-center text-gray-500">
            Nội dung đang được cập nhật...
          </div>
        )}

        {/* 4. Clinical Assurance Trust Banner */}
        <section className="bg-[#EEF7FA] border-y border-[#DDE4EA] py-8 my-8">
          <div className="max-w-[1250px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#005570]/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-[#005570]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#005570] text-sm">Tiêu chuẩn Quốc tế</h4>
                  <p className="text-xs text-gray-600 mt-0.5">Kiểm soát nhiễm khuẩn & vô trùng 100%</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#FFB500]/15 flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-6 h-6 text-[#D97706]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#005570] text-sm">Bác sĩ Chuyên khoa</h4>
                  <p className="text-xs text-gray-600 mt-0.5">Bác sĩ Tiêu hóa & Nội soi giàu kinh nghiệm</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#005570]/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-[#005570]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#005570] text-sm">Tư vấn 24/7 Miễn phí</h4>
                  <a
                    href={CLINIC_INFO.hotlineTel}
                    className="text-xs font-bold text-[#005570] hover:text-[#FFB500] transition-colors"
                  >
                    Hotline: {CLINIC_INFO.hotline}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Consultation & Booking Form */}
        <div id="tu-van" className="w-full">
          <BookingSection />
        </div>
      </main>

      {/* 6. Footer & Floating Actions */}
      <Footer />
      <FloatingWidgets />
    </div>
  );
}
