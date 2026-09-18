'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/sites/doctorcheck-vn/root/Header';
import { Footer } from '@/components/sites/doctorcheck-vn/root/Footer';
import { FloatingWidgets } from '@/components/sites/doctorcheck-vn/root/FloatingWidgets';
import { BookingSection } from '@/components/sites/doctorcheck-vn/root/BookingSection';
import { DoctorsSection } from '@/components/sites/doctorcheck-vn/root/DoctorsSection';
import { RichText } from '@/components/content/RichText';
import type { PageRouteMetadata } from '@/lib/routing/route-types';
import type { PageContent } from '@/types/doctorcheck';
import { ChevronRight, ShieldCheck, Award, Phone } from 'lucide-react';
import { CLINIC_INFO } from '@/lib/data/clinic';

interface ClinicalProtocolsTemplateProps {
  page: PageRouteMetadata;
  pageContent?: PageContent;
}

export function ClinicalProtocolsTemplate({ page, pageContent }: ClinicalProtocolsTemplateProps) {
  const isNestedSubpath = page.subpath && page.subpath.trim().length > 0;
  const contentHtml = pageContent?.contentHtml || '';
  const isDoctorDirectory = page.slug === 'doi-ngu-bac-si-doctorcheck';

  return (
    <div className="clinical-protocols-page min-h-screen flex flex-col bg-[#FFFFFF] selection:bg-[#FFB500] selection:text-[#00475B]">
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

      {/* 3. Main Clinical Standards & Protocol Content */}
      <main id="main" className="flex-1 w-full">
        {/* Doctor Directory Specialized Carousel if doi-ngu-bac-si-doctorcheck */}
        {isDoctorDirectory && <DoctorsSection />}

        {contentHtml ? (
          <div className="w-full">
            <RichText contentHtml={contentHtml} />
          </div>
        ) : (
          <div className="max-w-[1250px] mx-auto px-4 py-16 text-center text-gray-500">
            Nội dung đang được cập nhật...
          </div>
        )}

        {/* 4. Accreditation & Quality Assurance Trust Banner */}
        <section className="bg-[#EEF7FA] border-y border-[#DDE4EA] py-8 my-8">
          <div className="max-w-[1250px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#005570]/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-[#005570]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#005570] text-sm">Chuẩn Quốc Tế AACI Hoa Kỳ</h4>
                  <p className="text-xs text-gray-600 mt-0.5">Tiêu chuẩn chất lượng lâm sàng xuất sắc</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#FFB500]/15 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-[#D97706]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#005570] text-sm">Vô Trùng & An Toàn Tuyệt Đối</h4>
                  <p className="text-xs text-gray-600 mt-0.5">Kiểm soát nhiễm khuẩn nghiêm ngặt 100%</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#005570]/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-[#005570]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#005570] text-sm">Tư Vấn Chuyên Môn 24/7</h4>
                  <a
                    href={CLINIC_INFO.hotlineTel}
                    className="text-xs font-bold text-[#005570] hover:text-[#FFB500] transition-colors block mt-0.5"
                  >
                    Hotline: {CLINIC_INFO.hotline}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Consultation & Booking Form */}
        <div id="dat-lich" className="w-full">
          <BookingSection />
        </div>
      </main>

      {/* 6. Footer & Floating Actions */}
      <Footer />
      <FloatingWidgets />
    </div>
  );
}
