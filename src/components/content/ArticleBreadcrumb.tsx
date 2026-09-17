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
    <div className="bg-[#F8FBFC] border-b border-gray-100 py-3">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-2 text-xs text-gray-500 flex-wrap" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#00475B] transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          {category && (
            <>
              <Link href={`/${category.slug}/`} className="hover:text-[#00475B] transition-colors">
                {category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            </>
          )}
          <span className="text-gray-800 font-medium truncate max-w-[280px] sm:max-w-md">
            {title}
          </span>
        </nav>
      </div>
    </div>
  );
}
