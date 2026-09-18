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
import { ChevronRight } from 'lucide-react';

interface PricingTemplateProps {
  page: PageRouteMetadata;
  pageContent?: PageContent;
}

export function PricingTemplate({ page, pageContent }: PricingTemplateProps) {
  const content = pageContent;

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-[#FFB500] selection:text-[#00475B]">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <div className="bg-[#F8FBFC] border-b border-gray-100 py-3">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
            <nav className="flex items-center gap-2 text-xs text-gray-500 flex-wrap" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#005570] transition-colors">
                Trang chủ
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              {page.subpath && page.subpath !== page.slug && (
                <>
                  <Link
                    href="/trung-tam-noi-soi-tieu-hoa-doctor-check/"
                    className="hover:text-[#005570] transition-colors"
                  >
                    Trung Tâm Nội Soi Tiêu Hóa
                  </Link>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                </>
              )}
              <span className="text-gray-800 font-semibold truncate max-w-md">
                {page.title}
              </span>
            </nav>
          </div>
        </div>

        {/* Authentic Migrated Content Rendered via Enhanced Interactive RichText */}
        {content?.contentHtml && (
          <div className="w-full">
            <RichText contentHtml={content.contentHtml} />
          </div>
        )}

        {/* Global Consultation Booking Section */}
        <div id="booking">
          <BookingSection />
        </div>
      </main>

      <Footer />
      <FloatingWidgets />
    </div>
  );
}
