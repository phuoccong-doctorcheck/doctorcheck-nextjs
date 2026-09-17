import React from 'react';

export function DoctorCheckLogo({ className = 'h-10 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Brand Icon Badge */}
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#00475B] to-[#005570] text-[#FFB500] shadow-md">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>
      {/* Brand Typography */}
      <div className="flex flex-col">
        <span className="text-xl font-black leading-tight tracking-tight text-[#00475B]">
          DOCTOR<span className="text-[#FFB500]">CHECK</span>
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#4D5565]">
          Tầm Soát Bệnh Để Sống Thọ Hơn
        </span>
      </div>
    </div>
  );
}

export function ZaloIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="24" fill="#0068FF" />
      <path d="M12 28.5c0-6.627 5.373-12 12-12s12 5.373 12 12-5.373 12-12 12c-2.022 0-3.928-.5-5.59-1.388L12 40l.888-5.41A11.95 11.95 0 0 1 12 28.5z" fill="#fff" />
      <path d="M18.5 24h11v2.5l-6.8 6.5H30V35H18v-2.5l6.8-6.5H18.5V24z" fill="#0068FF" />
    </svg>
  );
}
