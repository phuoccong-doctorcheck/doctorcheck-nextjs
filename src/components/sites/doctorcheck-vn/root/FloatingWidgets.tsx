'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

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

  if (!showScrollTop) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto">
        {/* Scroll To Top Button */}
        <button
          type="button"
          onClick={scrollToTop}
          className="flex items-center justify-center h-10 w-10 rounded-full bg-white/90 hover:bg-white text-[#00475B] shadow-lg border border-gray-200 hover:scale-110 transition-all duration-200"
          aria-label="Lên đầu trang"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
