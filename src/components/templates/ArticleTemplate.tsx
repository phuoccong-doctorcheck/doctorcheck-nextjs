'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/sites/doctorcheck-vn/root/Header';
import { Footer } from '@/components/sites/doctorcheck-vn/root/Footer';
import { FloatingWidgets } from '@/components/sites/doctorcheck-vn/root/FloatingWidgets';
import { BookingSection } from '@/components/sites/doctorcheck-vn/root/BookingSection';
import { CLINIC_INFO } from '@/lib/data/clinic';
import { categoriesData } from '@/lib/data/categories';
import { getAllArticles } from '@/lib/content/articles-data';
import type { MedicalArticle } from '@/types/doctorcheck';
import {
  ArticleBreadcrumb,
  ArticleMetadata,
  ArticleTOC,
  ArticleContent,
  RelatedArticles,
} from '@/components/content';
import { Phone } from 'lucide-react';

interface ArticleTemplateProps {
  article: MedicalArticle;
}

export function ArticleTemplate({ article }: ArticleTemplateProps) {
  // Find category details
  const categoryId = article.categories?.[0];
  const category = categoriesData.find((c) => c.id === categoryId);

  // Find related articles in the same category
  const allArticles = getAllArticles();
  const relatedArticles = allArticles
    .filter((a) => a.id !== article.id && a.categories?.includes(categoryId))
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDF6] selection:bg-[#FFB500] selection:text-[#005570] font-sans">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <ArticleBreadcrumb category={category} title={article.title} />

        {/* Article Reading Container */}
        <div className="w-full max-w-[1250px] mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
          <article className="max-w-[920px] mx-auto bg-white rounded-2xl shadow-xs border border-[#DDE4EA]/70 p-6 sm:p-8 md:p-12">
            {/* Header */}
            <header className="mb-8">
              {category && (
                <Link
                  href={`/${category.slug}/`}
                  className="inline-block bg-[#EEF7FA] text-[#005570] hover:bg-[#005570] hover:text-white transition-colors text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-3.5"
                >
                  {category.name}
                </Link>
              )}

              <h1 className="text-2xl sm:text-3xl md:text-[32px] font-bold text-[#005570] leading-[1.3] mb-4">
                {article.title}
              </h1>

              {/* Meta Bar */}
              <ArticleMetadata
                date={article.date}
                modified={article.modified}
                authorName={article.authorName}
                authorTitle={article.authorTitle}
              />
            </header>

            {/* Featured Image */}
            {article.featuredImageUrl && (
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden mb-8 bg-gray-100 shadow-xs border border-[#E2E8F0]/50">
                <Image
                  src={article.featuredImageUrl}
                  alt={article.featuredImageAlt || article.title}
                  fill
                  priority
                  sizes="(max-width: 920px) 100vw, 920px"
                  className="object-cover"
                />
              </div>
            )}

            {/* Table of Contents */}
            {article.tableOfContents && article.tableOfContents.length > 0 && (
              <ArticleTOC items={article.tableOfContents} />
            )}

            {/* Authentic Content HTML Body */}
            <ArticleContent contentHtml={article.contentHtml} />

            {/* Consultation CTA Card */}
            <div className="bg-[#005570] text-white p-6 sm:p-8 rounded-xl shadow-md my-10 flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#00475B]">
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">
                  Bạn đang gặp triệu chứng hoặc muốn kiểm tra định kỳ?
                </h3>
                <p className="text-xs sm:text-sm text-gray-200 max-w-xl leading-relaxed">
                  Đăng ký tư vấn trực tiếp cùng Bác sĩ Chuyên khoa II Doctor Check để được lên phác đồ kiểm tra phù hợp và an tâm nhất.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-shrink-0">
                <a
                  href={CLINIC_INFO.hotlineTel}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFB500] text-[#005570] font-bold text-xs sm:text-sm px-6 py-3 rounded-full hover:bg-[#e0a000] transition-colors shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>{CLINIC_INFO.hotline}</span>
                </a>
                <a
                  href="#booking"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full transition-colors border border-white/30"
                >
                  <span>Đặt lịch hẹn</span>
                </a>
              </div>
            </div>

            {/* Related Articles */}
            <RelatedArticles
              articles={relatedArticles}
              categoryName={category?.name}
            />
          </article>
        </div>

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
