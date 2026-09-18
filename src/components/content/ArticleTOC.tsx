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
      const yOffset = -90; // Account for 90px fixed sticky header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Mục lục bài viết"
      className="bg-[#F8FBFC] border border-[#C5D9E2] rounded-xl p-5 mb-8 shadow-xs font-sans"
    >
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5">
          <List className="w-5 h-5 text-[#005570]" />
          <span className="font-bold text-[#005570] text-base sm:text-lg">
            Mục Lục Nội Dung
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 bg-[#005570]/10 text-[#005570] rounded-full">
            {items.length} phần
          </span>
        </div>
        <button
          type="button"
          aria-label={isExpanded ? 'Thu gọn mục lục' : 'Mở rộng mục lục'}
          className="text-gray-500 hover:text-[#005570] transition-colors p-1"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <ul className="mt-4 space-y-1.5 text-sm border-t border-[#DDE4EA] pt-3">
          {items.map((item, idx) => {
            const isSub = item.level === 3;
            return (
              <li
                key={`${item.id}-${idx}`}
                className={isSub ? 'ml-4 pl-3 border-l-2 border-[#C5D9E2]' : ''}
              >
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleScrollTo(e, item.id)}
                  className={`block py-1 transition-colors ${
                    isSub
                      ? 'text-xs sm:text-[13px] text-[#4D5565] hover:text-[#005570]'
                      : 'font-semibold text-[#005570] hover:text-[#FFB500] text-sm'
                  }`}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
