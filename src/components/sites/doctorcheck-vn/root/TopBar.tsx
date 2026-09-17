import React from 'react';
import { Phone, Clock, MapPin } from 'lucide-react';
import { CLINIC_INFO } from '@/lib/data/clinic';

export function TopBar() {
  return (
    <div className="bg-[#003848] text-xs text-white/90 py-2 border-b border-white/10 hidden md:block">
      <div className="container max-w-[1250px] mx-auto px-[15px] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#FFB500]" />
            <span>{CLINIC_INFO.workingHours}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#FFB500]" />
            <span>{CLINIC_INFO.address.short}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={CLINIC_INFO.hotlineTel}
            className="flex items-center gap-1.5 font-bold text-[#FFB500] hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Hotline tư vấn: {CLINIC_INFO.hotlineFormatted}</span>
          </a>
          <span className="text-white/30">|</span>
          <span className="text-white/80 font-medium">Giấy phép Sở Y Tế cấp: {CLINIC_INFO.license}</span>
        </div>
      </div>
    </div>
  );
}
