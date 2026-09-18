'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/sites/doctorcheck-vn/root/Header';
import { Footer } from '@/components/sites/doctorcheck-vn/root/Footer';
import { FloatingWidgets } from '@/components/sites/doctorcheck-vn/root/FloatingWidgets';
import { BookingSection } from '@/components/sites/doctorcheck-vn/root/BookingSection';
import { CLINIC_INFO } from '@/lib/data/clinic';
import type { PackageTier } from '@/types/doctorcheck';
import {
  Clock,
  ShieldCheck,
  ChevronRight,
  Phone,
  Activity,
  HeartPulse,
  UserCheck,
  Calendar,
} from 'lucide-react';

interface PackageTemplateProps {
  pkg: PackageTier;
}

export function PackageTemplate({ pkg }: PackageTemplateProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-[#FFB500] selection:text-[#00475B]">
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
              <Link href="/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/" className="hover:text-[#00475B] transition-colors">
                Gói tầm soát bệnh
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-gray-800 font-medium truncate max-w-md">
                {pkg.name}
              </span>
            </nav>
          </div>
        </div>

        {/* Package Hero Banner */}
        <section className="bg-gradient-to-b from-[#EEF7FA] to-white py-10 md:py-16 border-b border-gray-100">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {pkg.popular && (
                    <span className="bg-[#FFB500] text-[#00475B] font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                      Được chọn nhiều nhất
                    </span>
                  )}
                  <span className="bg-[#00475B]/10 text-[#00475B] font-semibold text-xs px-3 py-1 rounded-full">
                    {pkg.gender === 'female'
                      ? 'Dành cho Nữ'
                      : pkg.gender === 'male'
                      ? 'Dành cho Nam'
                      : 'Nam & Nữ'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#00475B] leading-tight mb-4">
                  {pkg.name}
                </h1>

                <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed max-w-2xl">
                  {pkg.tagline}
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <Activity className="w-5 h-5 text-[#00A896] flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-500">Tầm soát</div>
                      <div className="font-bold text-[#00475B] text-sm">
                        {pkg.diseasesCovered} Nhóm Bệnh
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <HeartPulse className="w-5 h-5 text-[#E63946] flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-500">Phát hiện sớm</div>
                      <div className="font-bold text-[#00475B] text-sm">
                        {pkg.cancersCovered} Loại Ung Thư
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 col-span-2 sm:col-span-1">
                    <Clock className="w-5 h-5 text-[#FFB500] flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-500">Thời gian</div>
                      <div className="font-bold text-[#00475B] text-sm">
                        {pkg.duration}
                      </div>
                    </div>
                  </div>
                </div>

                {pkg.recommendedFor && (
                  <div className="text-xs sm:text-sm text-gray-600 bg-white/70 p-3 rounded-lg border border-gray-200/60 inline-block">
                    <strong>Đối tượng khuyến nghị:</strong> {pkg.recommendedFor}
                  </div>
                )}
              </div>

              {/* Price & CTA Sidebar Box */}
              <div className="lg:col-span-4">
                <div className="bg-white rounded-2xl shadow-xl border-2 border-[#00A896]/30 p-6 sm:p-8 text-center">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    Chi phí trọn gói niêm yết
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-[#00475B] mb-2">
                    {pkg.priceFormatted}
                  </div>
                  <p className="text-xs text-gray-500 mb-6">
                    Cam kết không phát sinh chi phí phụ ngoài chỉ định
                  </p>

                  <div className="space-y-3">
                    <a
                      href="#booking"
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#FFB500] text-[#00475B] font-bold text-sm px-6 py-3.5 rounded-xl hover:bg-[#FFA500] transition-all shadow-md hover:shadow-lg"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Đăng ký gói khám</span>
                    </a>
                    <a
                      href={CLINIC_INFO.hotlineTel}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#EEF7FA] text-[#00475B] font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#DEEFF5] transition-colors"
                    >
                      <Phone className="w-4 h-4 text-[#00A896]" />
                      <span>Tư vấn: {CLINIC_INFO.hotline}</span>
                    </a>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#00A896]" /> BHYT & BHTN
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-[#00A896]" /> Bác sĩ CKII
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Item Breakdown */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#00475B] mb-3">
              Danh Mục Hạng Mục Khám & Cận Lâm Sàng Chi Tiết
            </h2>
            <p className="text-sm text-gray-600">
              Gói khám bao gồm {pkg.features.length} hạng mục tiêu chuẩn được hội đồng chuyên môn Doctor Check xây dựng theo tiêu chuẩn y học chứng cứ:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {pkg.features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-100 hover:border-[#00A896]/40 hover:shadow-sm transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-[#EEF7FA] text-[#00A896] flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                  {idx + 1}
                </div>
                <span className="text-sm text-gray-700 leading-relaxed font-medium">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Clinical Assurance */}
          <div className="bg-[#EEF7FA] rounded-2xl p-6 sm:p-8 border border-[#00A896]/20">
            <h3 className="text-base sm:text-lg font-bold text-[#00475B] mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#00A896]" />
              Cam Kết Chất Lượng Tại Doctor Check
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs sm:text-sm text-gray-700">
              <div>
                <strong className="block text-[#00475B] mb-1">Thiết bị hiện đại Nhật Bản</strong>
                Hệ thống máy nội soi Olympus EVIS-X1 và máy siêu âm chuyên dụng phát hiện vi tổn thương sớm.
              </div>
              <div>
                <strong className="block text-[#00475B] mb-1">Bác sĩ CKII thăm khám</strong>
                Đội ngũ bác sĩ hơn 15–20 năm kinh nghiệm từ các bệnh viện lớn trực tiếp tư vấn kết quả.
              </div>
              <div>
                <strong className="block text-[#00475B] mb-1">Hồ sơ sức khỏe số hóa</strong>
                Toàn bộ kết quả xét nghiệm, hình ảnh nội soi được lưu trữ bảo mật và theo dõi định kỳ.
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
