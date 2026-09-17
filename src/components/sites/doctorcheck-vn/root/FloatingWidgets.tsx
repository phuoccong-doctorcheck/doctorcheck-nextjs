'use client';

import React, { useState, useEffect } from 'react';
import { Phone, ArrowUp } from 'lucide-react';
import { ZaloIcon } from '@/components/sites/doctorcheck-vn/shared/icons';
import { CLINIC_INFO } from '@/lib/data/clinic';

export function FloatingWidgets() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto">
        {/* Zalo Button */}
        <a
          href={CLINIC_INFO.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex items-center justify-center h-12 w-12 rounded-full bg-[#0068FF] text-white shadow-xl hover:scale-110 transition-transform duration-200 group"
          aria-label="Chat Zalo với Bác sĩ Doctor Check"
        >
          <span className="absolute -inset-1 rounded-full bg-[#0068FF]/30 animate-ping pointer-events-none" />
          <ZaloIcon className="h-7 w-7" />
          <span className="absolute right-14 px-3 py-1 rounded-lg bg-white text-[#00475B] text-xs font-bold whitespace-nowrap shadow-lg border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
            Chat Zalo tư vấn
          </span>
        </a>

        {/* Call Hotline Button */}
        <a
          href={CLINIC_INFO.hotlineTel}
          className="relative flex items-center justify-center h-12 w-12 rounded-full bg-[#FFB500] text-[#00475B] shadow-xl hover:scale-110 transition-transform duration-200 group"
          aria-label={`Gọi hotline ${CLINIC_INFO.hotlineFormatted}`}
        >
          <Phone className="h-5 w-5" />
          <span className="absolute right-14 px-3 py-1 rounded-lg bg-white text-[#00475B] text-xs font-bold whitespace-nowrap shadow-lg border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
            Hotline: {CLINIC_INFO.hotlineFormatted}
          </span>
        </a>

        {/* Scroll To Top Button */}
        {showScrollTop && (
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-white/90 hover:bg-white text-[#00475B] shadow-lg border border-gray-200 hover:scale-110 transition-all duration-200"
            aria-label="Lên đầu trang"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
