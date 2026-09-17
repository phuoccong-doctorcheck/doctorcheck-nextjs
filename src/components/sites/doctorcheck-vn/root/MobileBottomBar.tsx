'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Phone, CalendarCheck } from 'lucide-react';
import { ZaloIcon } from '@/components/sites/doctorcheck-vn/shared/icons';
import { CLINIC_INFO } from '@/lib/data/clinic';

export function MobileBottomBar() {
  const router = useRouter();

  const scrollToBooking = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('tu-van');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/#tu-van');
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 block md:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,71,91,0.1)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-3 h-14 items-center text-center">
        {/* Call Hotline */}
        <a
          href={CLINIC_INFO.hotlineTel}
          className="flex flex-col items-center justify-center h-full text-[#005570] hover:bg-[#EEF7FA] active:bg-[#EEF7FA] transition-colors border-r border-gray-100 px-1"
          aria-label={`Gọi hotline ${CLINIC_INFO.hotlineFormatted}`}
        >
          <Phone className="w-5 h-5 text-[#005570] mb-0.5" />
          <span className="text-[11px] font-bold tracking-tight">Gọi Điện</span>
        </a>

        {/* Chat Zalo */}
        <a
          href={CLINIC_INFO.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center h-full text-[#0068FF] hover:bg-[#EEF7FA] active:bg-[#EEF7FA] transition-colors border-r border-gray-100 px-1"
          aria-label="Chat Zalo với Bác sĩ Doctor Check"
        >
          <ZaloIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-bold tracking-tight text-[#005570]">Chat Zalo</span>
        </a>

        {/* Quick Booking CTA */}
        <a
          href="#tu-van"
          onClick={scrollToBooking}
          className="flex flex-col items-center justify-center h-full bg-[#FFB500] hover:bg-[#e0a000] text-[#005570] active:scale-[0.98] transition-all px-1 font-bold"
          aria-label="Đặt lịch khám tư vấn"
        >
          <CalendarCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-bold tracking-tight uppercase">Đặt Lịch</span>
        </a>
      </div>
    </div>
  );
}
