import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { MedicalArticle } from '@/types/doctorcheck';
import { ArrowRight, Calendar } from 'lucide-react';

interface RelatedArticlesProps {
  articles: MedicalArticle[];
  categoryName?: string;
}

export function RelatedArticles({ articles, categoryName }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-[#DDE4EA] pt-10 mt-12 font-sans">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#005570]">
          Bài Viết Cùng Chuyên Mục {categoryName ? `(${categoryName})` : ''}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((item) => {
          const formattedDate = item.date
            ? new Date(item.date).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })
            : '';

          return (
            <article
              key={item.id}
              className="group bg-white border border-[#DDE4EA] rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col"
            >
              {item.featuredImageUrl && (
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                  <Image
                    src={item.featuredImageUrl}
                    alt={item.featuredImageAlt || item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-104 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {formattedDate && (
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-2">
                      <Calendar className="w-3.5 h-3.5 text-[#005570]" />
                      <span>{formattedDate}</span>
                    </div>
                  )}

                  <h3 className="font-bold text-[#005570] text-base group-hover:text-[#FFB500] transition-colors line-clamp-2 leading-snug">
                    <Link href={`/${item.slug}/`}>
                      {item.title}
                    </Link>
                  </h3>

                  {item.excerpt && (
                    <p className="text-xs text-[#4D5565] line-clamp-2 mt-2 leading-relaxed">
                      {item.excerpt}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#EEF7FA] flex items-center text-xs font-semibold text-[#005570] group-hover:text-[#FFB500] group-hover:translate-x-1 transition-all">
                  <Link href={`/${item.slug}/`} className="flex items-center gap-1">
                    Đọc tiếp <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
