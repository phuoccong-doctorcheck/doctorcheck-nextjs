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
import { ChevronRight, MapPin, Phone, Clock, Mail } from 'lucide-react';
import { CLINIC_INFO } from '@/lib/data/clinic';

interface UtilityLegalTemplateProps {
  page: PageRouteMetadata;
  pageContent?: PageContent;
}

export function UtilityLegalTemplate({ page, pageContent }: UtilityLegalTemplateProps) {
  const contentHtml = pageContent?.contentHtml || '';
  const isContact = page.slug === 'lien-he';
  const isLegalPolicy = page.slug.startsWith('chinh-sach-') || page.slug.startsWith('dieu-khoan-');

  return (
    <div className="utility-legal-page min-h-screen flex flex-col bg-[#FFFFFF] selection:bg-[#FFB500] selection:text-[#00475B]">
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
            <span className="text-[#005570] font-semibold truncate max-w-md">
              {page.title}
            </span>
          </nav>
        </div>
      </div>

      {/* 3. Main Content Container */}
      <main id="main" className="flex-1 w-full">
        {/* Contact Specific Quick Information Cards (Above Content if Contact Page) */}
        {isContact && (
          <section className="bg-[#EEF7FA] border-b border-[#DDE4EA] py-8">
            <div className="max-w-[1250px] mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Address */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#005570]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5 text-[#005570]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#005570] text-sm mb-1">Địa chỉ phòng khám</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{CLINIC_INFO.address.full}</p>
                  </div>
                </div>

                {/* Hotline */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#005570]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone className="w-5 h-5 text-[#005570]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#005570] text-sm mb-1">Hotline 24/7</h4>
                    <a
                      href={CLINIC_INFO.hotlineTel}
                      className="text-sm font-bold text-[#005570] hover:text-[#FFB500] transition-colors block"
                    >
                      {CLINIC_INFO.hotline}
                    </a>
                    <p className="text-[11px] text-gray-500 mt-0.5">Tư vấn miễn phí</p>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#005570]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="w-5 h-5 text-[#005570]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#005570] text-sm mb-1">Email liên hệ</h4>
                    <a
                      href={`mailto:${CLINIC_INFO.email}`}
                      className="text-xs font-semibold text-[#005570] hover:text-[#FFB500] transition-colors block"
                    >
                      {CLINIC_INFO.email}
                    </a>
                    <p className="text-[11px] text-gray-500 mt-0.5">Hỗ trợ khách hàng</p>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#005570]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-5 h-5 text-[#005570]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#005570] text-sm mb-1">Giờ làm việc</h4>
                    <p className="text-xs text-gray-700 font-medium">{CLINIC_INFO.workingHours}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Thứ 2 đến Thứ 7</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Content Body */}
        {isLegalPolicy ? (
          <div className="max-w-[1250px] mx-auto px-4 sm:px-6">
            <div className="legal-content-wrap">
              <h1>{page.title}</h1>
              {contentHtml ? (
                <RichText contentHtml={contentHtml} />
              ) : (
                <p className="text-gray-500 italic">Nội dung đang được cập nhật...</p>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full">
            {contentHtml ? (
              <RichText contentHtml={contentHtml} />
            ) : (
              <div className="max-w-[1250px] mx-auto px-4 py-16 text-center text-gray-500">
                Nội dung đang được cập nhật...
              </div>
            )}
          </div>
        )}

        {/* Embedded Booking Consultation if Contact Page */}
        {isContact && (
          <div id="booking" className="w-full">
            <BookingSection />
          </div>
        )}
      </main>

      {/* 4. Global Footer & Floating Widgets */}
      <Footer />
      <FloatingWidgets />
    </div>
  );
}
