'use client';

import React, { useState } from 'react';
import type { TableOfContentsItem } from '@/types/doctorcheck';
import { List, ChevronDown, ChevronUp } from 'lucide-react';

interface ArticleTOCProps {
  items: TableOfContentsItem[];
}

export function ArticleTOC({ items }: ArticleTOCProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!items || items.length === 0) {
    return null;
  }

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100; // Account for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Mục lục bài viết"
      className="bg-[#F8FBFC] border border-[#00475B]/15 rounded-2xl p-5 mb-8 shadow-xs"
    >
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2.5">
          <List className="w-5 h-5 text-[#00A896]" />
          <span className="font-bold text-[#00475B] text-base sm:text-lg">
            Mục Lục Nội Dung
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 bg-[#00A896]/10 text-[#00A896] rounded-full">
            {items.length} phần
          </span>
        </div>
        <button
          type="button"
          aria-label={isExpanded ? 'Thu gọn mục lục' : 'Mở rộng mục lục'}
          className="text-gray-500 hover:text-[#00475B] transition-colors p-1"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <ul className="mt-4 space-y-2 text-sm border-t border-gray-200/60 pt-3">
          {items.map((item, idx) => (
            <li
              key={`${item.id}-${idx}`}
              className={`${item.level === 3 ? 'ml-4 pl-2 border-l-2 border-gray-200 text-xs text-gray-600' : 'font-medium text-gray-700'}`}
            >
              <a
                href={`#${item.id}`}
                onClick={(e) => handleScrollTo(e, item.id)}
                className="hover:text-[#00A896] transition-colors line-clamp-1 block py-0.5"
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
