import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { CategoryItem } from '@/types/doctorcheck';

interface ArticleBreadcrumbProps {
  category?: CategoryItem;
  title: string;
}

export function ArticleBreadcrumb({ category, title }: ArticleBreadcrumbProps) {
  return (
    <div className="bg-[#F8FBFC] border-b border-[#DDE4EA]/60 py-3.5 font-sans">
      <div className="max-w-[1250px] mx-auto px-4 sm:px-6 md:px-8">
        <nav className="flex items-center gap-2 text-xs sm:text-[13px] text-[#64748B] flex-wrap" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#005570] transition-colors font-medium">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] flex-shrink-0" />
          {category && (
            <>
              <Link href={`/${category.slug}/`} className="hover:text-[#005570] transition-colors font-medium">
                {category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] flex-shrink-0" />
            </>
          )}
          <span className="text-[#2A2F38] font-semibold truncate max-w-[280px] sm:max-w-md">
            {title}
          </span>
        </nav>
      </div>
    </div>
  );
}
