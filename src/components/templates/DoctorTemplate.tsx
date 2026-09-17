'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TopBar } from '@/components/sites/doctorcheck-vn/root/TopBar';
import { Header } from '@/components/sites/doctorcheck-vn/root/Header';
import { Footer } from '@/components/sites/doctorcheck-vn/root/Footer';
import { FloatingWidgets } from '@/components/sites/doctorcheck-vn/root/FloatingWidgets';
import { BookingSection } from '@/components/sites/doctorcheck-vn/root/BookingSection';
import { CLINIC_INFO } from '@/lib/data/clinic';
import type { Doctor } from '@/types/doctorcheck';
import {
  ShieldCheck,
  Award,
  Clock,
  Building2,
  Calendar,
  Phone,
  ChevronRight,
  FileBadge,
} from 'lucide-react';

interface DoctorTemplateProps {
  doctor: Doctor;
}

export function DoctorTemplate({ doctor }: DoctorTemplateProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-[#FFB500] selection:text-[#00475B]">
      <TopBar />
      <Header />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <div className="bg-[#F8FBFC] border-b border-gray-100 py-3">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <nav className="flex items-center gap-2 text-xs text-gray-500" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#00475B] transition-colors">
                Trang chủ
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <Link href="/doi-ngu-bac-si-doctorcheck/" className="hover:text-[#00475B] transition-colors">
                Đội ngũ Bác sĩ
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-gray-800 font-medium truncate max-w-md">
                {doctor.name}
              </span>
            </nav>
          </div>
        </div>

        {/* Doctor Header & Bio Section */}
        <section className="bg-gradient-to-b from-[#EEF7FA] to-white py-10 md:py-16 border-b border-gray-100">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Doctor Avatar Card */}
              <div className="lg:col-span-4 flex justify-center">
                <div className="relative w-64 h-80 sm:w-72 sm:h-96 rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-[#00475B]">
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    fill
                    className="object-cover object-top"
                    priority
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white text-center">
                    <span className="text-xs font-bold text-[#FFB500] uppercase tracking-wider block">
                      {doctor.title}
                    </span>
                    <span className="text-sm font-semibold">
                      {doctor.specialty}
                    </span>
                  </div>
                </div>
              </div>

              {/* Doctor Credentials & Bio */}
              <div className="lg:col-span-8">
                <div className="inline-flex items-center gap-2 bg-[#00A896]/10 text-[#00A896] text-xs font-bold px-3 py-1 rounded-full mb-3">
                  <Award className="w-3.5 h-3.5" />
                  <span>{doctor.experienceYears}+ Năm Kinh Nghiệm Lâm Sàng</span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#00475B] leading-tight mb-2">
                  {doctor.name}
                </h1>
                <p className="text-base sm:text-lg font-semibold text-[#00A896] mb-4">
                  {doctor.title} – {doctor.specialty}
                </p>

                {/* License Badge */}
                {doctor.cchn && (
                  <div className="inline-flex items-center gap-2 bg-white border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-700 mb-6 shadow-sm">
                    <FileBadge className="w-4 h-4 text-[#00A896]" />
                    <span>Chứng chỉ hành nghề: <strong>{doctor.cchn}</strong></span>
                  </div>
                )}

                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-6 max-w-2xl">
                  {doctor.description}
                </p>

                {/* Details Matrix */}
                <div className="space-y-3 mb-8 max-w-2xl text-xs sm:text-sm text-gray-600">
                  {doctor.clinicalScope && (
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-[#00A896] flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Phạm vi hoạt động chuyên môn:</strong> {doctor.clinicalScope}
                      </div>
                    </div>
                  )}
                  {doctor.hospital && (
                    <div className="flex items-start gap-2.5">
                      <Building2 className="w-4 h-4 text-[#00A896] flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Kinh nghiệm công tác:</strong> {doctor.hospital}
                      </div>
                    </div>
                  )}
                  {doctor.schedule && (
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-[#FFB500] flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Lịch khám dự kiến:</strong> <span className="font-semibold text-[#00475B]">{doctor.schedule}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href="#booking"
                    className="inline-flex items-center gap-2 bg-[#FFB500] text-[#00475B] font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl hover:bg-[#FFA500] transition-colors shadow-md"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Đặt lịch khám cùng {doctor.name}</span>
                  </a>
                  <a
                    href={CLINIC_INFO.hotlineTel}
                    className="inline-flex items-center gap-2 bg-white border border-gray-200 text-[#00475B] font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <Phone className="w-4 h-4 text-[#00A896]" />
                    <span>{CLINIC_INFO.hotline}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Embedded Booking Section */}
        <div id="booking">
          <BookingSection />
        </div>
      </main>

      <Footer />
      <FloatingWidgets />
    </div>
  );
}
