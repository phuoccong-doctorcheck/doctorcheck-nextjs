'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, ShieldCheck, Clock, Activity } from 'lucide-react';
import { packagesData } from '@/lib/data/packages';
import type { PackageTier } from '@/types/doctorcheck';

interface PricingCardsGridProps {
  initialGender?: 'male' | 'female';
  showSpecialized?: boolean;
}

export function PricingCardsGrid({
  initialGender = 'male',
  showSpecialized = true,
}: PricingCardsGridProps) {
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>(initialGender);

  const currentPackages = packagesData[selectedGender] || [];
  const specializedPackages = packagesData.specialized || [];

  return (
    <section className="py-12 md:py-16 bg-[#FDFDF6]" id="pricing-packages">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1 rounded-full bg-[#E5F3F7] text-[#005570] text-xs font-bold uppercase tracking-wider mb-3">
            Bảng Giá Minh Bạch
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#005570] tracking-tight">
            Các Gói Khám Tầm Soát Sức Khỏe Toàn Diện
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Chi phí niêm yết trọn gói, không phát sinh chi phí ẩn. Bác Sĩ Chuyên Khoa II trực tiếp tư vấn và đồng hành.
          </p>
        </div>

        {/* Gender Tab Switcher */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-full bg-[#E5F3F7] border border-[#DDE4EA] shadow-inner gap-1">
            <button
              type="button"
              onClick={() => setSelectedGender('male')}
              className={`px-6 sm:px-8 py-2.5 rounded-full font-bold text-sm sm:text-base transition-all duration-300 cursor-pointer ${
                selectedGender === 'male'
                  ? 'bg-[#005570] text-white shadow-md'
                  : 'text-[#005570] hover:text-[#00475B]'
              }`}
            >
              Dành Cho Nam
            </button>
            <button
              type="button"
              onClick={() => setSelectedGender('female')}
              className={`px-6 sm:px-8 py-2.5 rounded-full font-bold text-sm sm:text-base transition-all duration-300 cursor-pointer ${
                selectedGender === 'female'
                  ? 'bg-[#005570] text-white shadow-md'
                  : 'text-[#005570] hover:text-[#00475B]'
              }`}
            >
              Dành Cho Nữ
            </button>
          </div>
        </div>

        {/* 3-Tier Core Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch mb-14">
          {currentPackages.map((pkg: PackageTier) => {
            const isPopular = pkg.popular;
            return (
              <div
                key={pkg.id}
                className={`relative bg-white rounded-2xl border transition-all duration-300 flex flex-col p-6 sm:p-8 ${
                  isPopular
                    ? 'border-[#005570] shadow-xl ring-2 ring-[#005570]/15 md:-translate-y-2'
                    : 'border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FFB500] text-[#00475B] font-bold text-xs uppercase px-4 py-1 rounded-full shadow-sm">
                    Khuyên Chọn Nhiều Nhất
                  </div>
                )}

                {/* Card Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-[#005570] leading-snug min-h-[56px] flex items-center">
                    {pkg.name}
                  </h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-[#005570]">
                      {pkg.priceFormatted}
                    </span>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-2">
                    {pkg.tagline}
                  </p>
                </div>

                {/* Key Metrics Badges */}
                <div className="grid grid-cols-2 gap-2 mb-6 p-3 rounded-xl bg-[#F8FBFC] border border-gray-100 text-xs text-gray-700">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Activity className="w-3.5 h-3.5 text-[#005570]" />
                    <span>{pkg.diseasesCovered} nhóm bệnh</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FFB500]" />
                    <span>{pkg.cancersCovered} loại ung thư</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 font-medium text-gray-500 pt-1 border-t border-gray-200/60">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Thời gian thực hiện: {pkg.duration}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="flex-1 mb-8">
                  <p className="text-xs font-bold text-[#005570] uppercase tracking-wider mb-3">
                    Danh mục nổi bật bao gồm:
                  </p>
                  <ul className="space-y-2.5">
                    {pkg.features.slice(0, 7).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                        <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#E5F3F7] text-[#005570] flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3" />
                        </span>
                        <span className="leading-tight">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action CTA */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <Link
                    href={`/${pkg.slug}/`}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 transition-all duration-200 ${
                      isPopular
                        ? 'bg-[#005570] text-white hover:bg-[#00475B] shadow-md'
                        : 'bg-[#EEF7FA] text-[#005570] hover:bg-[#005570] hover:text-white'
                    }`}
                  >
                    <span>Xem Chi Tiết Gói Khám</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Specialized Endoscopy Packages Section */}
        {showSpecialized && specializedPackages.length > 0 && (
          <div className="mt-14 pt-12 border-t border-gray-200">
            <div className="text-center mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-[#005570]">
                Gói Tầm Soát Chuyên Khoa Tiêu Hóa & Nội Soi
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Công nghệ nhuộm màu quang học NBI phóng đại chuẩn Nhật Bản
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {specializedPackages.map((pkg: PackageTier) => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-xs hover:shadow-md transition-shadow"
                >
                  <h4 className="font-bold text-[#005570] text-base mb-2">{pkg.name}</h4>
                  <p className="text-xs text-gray-600 mb-4 line-clamp-2">{pkg.tagline}</p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {pkg.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                        <Check className="w-3.5 h-3.5 text-[#005570] flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/${pkg.slug}/`}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#F8FBFC] border border-[#DDE4EA] text-[#005570] hover:bg-[#005570] hover:text-white font-semibold text-xs text-center transition-colors"
                  >
                    Xem Chi Tiết
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
