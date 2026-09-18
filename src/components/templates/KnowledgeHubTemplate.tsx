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
import { ChevronRight, ShieldCheck, Stethoscope, BookOpen } from 'lucide-react';

interface KnowledgeHubTemplateProps {
  page: PageRouteMetadata;
  pageContent?: PageContent;
}

export function KnowledgeHubTemplate({ page, pageContent }: KnowledgeHubTemplateProps) {
  const isNestedSubpath = page.subpath && page.subpath.trim().length > 0;
  const contentHtml = pageContent?.contentHtml || '';

  return (
    <div className="knowledge-hub-page min-h-screen flex flex-col bg-[#FFFFFF] selection:bg-[#FFB500] selection:text-[#00475B]">
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

      {/* 3. Hero Header Banner */}
      <div className="page-header bg-gradient-to-r from-[#00847f]/10 via-[#00847f]/5 to-white border-b border-gray-100 py-8 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00847f]/10 text-[#00847f] text-xs font-semibold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            Cẩm nang y khoa chính thống
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#00475B] leading-tight">
            {page.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-3xl">
            Tổng hợp kiến thức y khoa, dấu hiệu nhận biết, phương pháp chẩn đoán và hướng dẫn tầm soát chuyên sâu từ đội ngũ bác sĩ chuyên khoa tại Doctor Check.
          </p>
        </div>
      </div>

      {/* 4. Main Knowledge Hub Content (Canonical HTML) */}
      <main className="flex-1 w-full" id="main-content">
        <div className="knowledge-content-wrap">
          {contentHtml ? (
            <RichText
              contentHtml={contentHtml}
              className="knowledge-hub-body font-sans text-gray-800"
            />
          ) : (
            <div className="py-12 text-center text-gray-500">
              <p>Nội dung đang được cập nhật từ hồ sơ y khoa chính thức.</p>
            </div>
          )}
        </div>
      </main>

      {/* 5. Clinical Trust Summary */}
      <section className="bg-[#F8FBFC] border-t border-gray-100 py-8 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-8 h-8 text-[#00847f] mb-2" />
            <h4 className="text-sm font-bold text-[#00475B]">Tiêu Chuẩn Quốc Tế AACI</h4>
            <p className="text-xs text-gray-500 mt-1">Đạt chứng nhận lâm sàng xuất sắc từ Hoa Kỳ</p>
          </div>
          <div className="flex flex-col items-center">
            <Stethoscope className="w-8 h-8 text-[#00847f] mb-2" />
            <h4 className="text-sm font-bold text-[#00475B]">Bác Sĩ Chuyên Khoa</h4>
            <p className="text-xs text-gray-500 mt-1">100% bác sĩ có CCHN và giàu kinh nghiệm</p>
          </div>
          <div className="flex flex-col items-center">
            <BookOpen className="w-8 h-8 text-[#00847f] mb-2" />
            <h4 className="text-sm font-bold text-[#00475B]">Kiến Thức Y Khoa Chuẩn</h4>
            <p className="text-xs text-gray-500 mt-1">Biên soạn và thẩm định theo phác đồ Bộ Y Tế</p>
          </div>
        </div>
      </section>

      {/* 6. Embedded Booking Section */}
      <BookingSection />

      {/* 7. Global Footer */}
      <Footer />

      {/* 8. Floating Widgets */}
      <FloatingWidgets />
    </div>
  );
}
export default KnowledgeHubTemplate;
