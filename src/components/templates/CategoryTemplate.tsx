'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TopBar } from '@/components/sites/doctorcheck-vn/root/TopBar';
import { Header } from '@/components/sites/doctorcheck-vn/root/Header';
import { Footer } from '@/components/sites/doctorcheck-vn/root/Footer';
import { FloatingWidgets } from '@/components/sites/doctorcheck-vn/root/FloatingWidgets';
import { BookingSection } from '@/components/sites/doctorcheck-vn/root/BookingSection';
import { getArticlesByCategory } from '@/lib/content/articles-data';
import type { CategoryItem } from '@/types/doctorcheck';
import { ChevronRight, Calendar, BookOpen, ChevronLeft } from 'lucide-react';

interface CategoryTemplateProps {
  category: CategoryItem;
}

const PAGE_SIZE = 9;

export function CategoryTemplate({ category }: CategoryTemplateProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Retrieve articles with full metadata (featuredImageUrl, excerpt, etc.)
  const articles = getArticlesByCategory(category.id);
  const totalPages = Math.ceil(articles.length / PAGE_SIZE);

  const paginatedArticles = articles.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-[#FFB500] selection:text-[#00475B]">
      <TopBar />
      <Header />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <div className="bg-[#F8FBFC] border-b border-gray-100 py-3">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <nav className="flex items-center gap-2 text-xs text-gray-500" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#00475B] transition-colors">
                Trang chủ
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <Link href="/blog/" className="hover:text-[#00475B] transition-colors">
                Chuyên mục y khoa
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-gray-800 font-medium truncate max-w-md">
                {category.name}
              </span>
            </nav>
          </div>
        </div>

        {/* Category Header */}
        <section className="bg-[#EEF7FA] py-8 md:py-10 border-b border-gray-200">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="max-w-3xl">
              <span className="inline-block text-[#005570] text-xs font-bold uppercase tracking-wider mb-2">
                Chuyên mục y khoa ({category.count} bài viết)
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#005570] leading-tight mb-3">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-sm sm:text-base text-[#4D5565] leading-relaxed">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 md:py-12">
          {articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedArticles.map((art) => {
                  const dateStr = art.date
                    ? new Date(art.date).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })
                    : '';

                  return (
                    <article
                      key={art.id}
                      className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Thumbnail Image */}
                        {art.featuredImageUrl ? (
                          <Link href={`/${art.slug}/`} className="block relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                            <Image
                              src={art.featuredImageUrl}
                              alt={art.featuredImageAlt || art.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                              className="object-cover group-hover:scale-103 transition-transform duration-300"
                            />
                          </Link>
                        ) : (
                          <Link href={`/${art.slug}/`} className="block aspect-[16/9] w-full bg-[#EEF7FA] flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-[#005570]/40" />
                          </Link>
                        )}

                        {/* Card Content */}
                        <div className="p-4 sm:p-5">
                          {dateStr && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{dateStr}</span>
                            </div>
                          )}
                          <h2 className="text-sm sm:text-base font-bold text-[#005570] group-hover:text-[#00475B] transition-colors leading-snug line-clamp-2 mb-2">
                            <Link href={`/${art.slug}/`}>
                              {art.title}
                            </Link>
                          </h2>
                          {art.excerpt && (
                            <p className="text-xs sm:text-[13px] text-[#4D5565] line-clamp-3 leading-relaxed">
                              {art.excerpt}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-4 sm:px-5 pb-4 pt-2">
                        <Link
                          href={`/${art.slug}/`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#005570] hover:text-[#FFB500] transition-colors"
                        >
                          <span>Xem chi tiết</span>
                          <span aria-hidden="true">&raquo;</span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-2 rounded-md border border-gray-200 text-[#005570] disabled:opacity-30 hover:bg-[#EEF7FA] transition-colors"
                    aria-label="Trang trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-md text-xs font-bold transition-all ${
                        currentPage === page
                          ? 'bg-[#005570] text-white'
                          : 'border border-gray-200 text-[#005570] hover:bg-[#EEF7FA]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-2 rounded-md border border-gray-200 text-[#005570] disabled:opacity-30 hover:bg-[#EEF7FA] transition-colors"
                    aria-label="Trang tiếp"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-[#F8FBFC] rounded-lg border border-dashed border-gray-200">
              <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#00475B] mb-1">Chuyên mục đang cập nhật bài viết mới</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Đội ngũ Bác sĩ Doctor Check đang chuẩn bị các nội dung y khoa chất lượng cao cho chuyên mục này.
              </p>
            </div>
          )}
        </section>

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
