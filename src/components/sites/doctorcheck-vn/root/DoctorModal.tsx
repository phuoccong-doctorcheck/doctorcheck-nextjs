'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { Doctor } from '@/types/doctorcheck';
import { CLINIC_INFO } from '@/lib/data/clinic';
import { X, Award, Hospital, Phone, ShieldCheck, Clock } from 'lucide-react';

interface DoctorModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DoctorModal({ doctor, isOpen, onClose }: DoctorModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 hover:text-[#00475B] transition-colors shadow-sm"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Doctor Image */}
        <div className="relative h-64 md:h-auto md:w-5/12 bg-gradient-to-tr from-[#00475B] to-[#005570]">
          <Image
            src={doctor.image}
            alt={doctor.name}
            fill
            className="object-cover object-top"
          />
        </div>

        {/* Doctor Bio Details */}
        <div className="p-6 md:p-8 md:w-7/12 flex flex-col justify-between">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-[#EEF7FA] text-[#00475B] text-xs font-bold uppercase mb-2">
              {doctor.title}
            </div>
            <h3 className="text-xl font-black text-[#00475B] mb-1">{doctor.name}</h3>

            {doctor.cchn && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>CCHN: <strong>{doctor.cchn}</strong></span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs text-[#FFB500] font-bold mb-3">
              <Award className="w-4 h-4 text-[#FFB500]" />
              <span>Chuyên khoa: {doctor.specialty}</span>
            </div>

            {doctor.schedule && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-3">
                <Clock className="w-3.5 h-3.5 text-[#00475B] flex-shrink-0" />
                <span>Lịch khám: <strong>{doctor.schedule}</strong></span>
              </div>
            )}

            <div className="flex items-start gap-2 text-xs text-[#4D5565] mb-4 bg-[#EEF7FA]/50 p-3 rounded-xl">
              <Hospital className="w-4 h-4 text-[#00475B] flex-shrink-0 mt-0.5" />
              <span>{doctor.clinicalScope || doctor.hospital}</span>
            </div>

            <p className="text-xs sm:text-sm text-[#4D5565] leading-relaxed mb-6">
              {doctor.description}
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
            <a
              href="#booking"
              onClick={onClose}
              className="flex-1 text-center py-2.5 rounded-full bg-[#FFB500] text-[#00475B] font-bold text-xs shadow-sm hover:bg-[#e0a000] transition-colors"
            >
              ĐẶT LỊCH KHÁM VỚI BÁC SĨ
            </a>
            <a
              href={CLINIC_INFO.hotlineTel}
              className="p-2.5 rounded-full border border-[#00475B] text-[#00475B] hover:bg-[#EEF7FA] transition-colors"
              title={`Gọi hotline ${CLINIC_INFO.hotlineFormatted}`}
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
