'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { PricingBlockConfig, SectionsMetaConfig, HomepagePackageCard } from '@/lib/data/homepage';

const defaultMalePackages: HomepagePackageCard[] = [
  {
    id: 'khuyen-cao-nam',
    slug: '/goi-khuyen-cao-danh-cho-nam/',
    name: 'Gói Khuyến Cáo',
    price: '3,000,000đ',
    sub: '21 Nhóm bệnh & 2 loại ung thư',
    image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/e4515038-e50c-45f6-f35d-8255929a6f00/w=625,h=400',
  },
  {
    id: 'chuyen-sau-nam',
    slug: '/goi-chuyen-sau-danh-cho-nam/',
    name: 'Gói Chuyên Sâu',
    price: '5,000,000đ',
    sub: '24 Nhóm bệnh & 5 loại ung thư',
    image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/9e90b45a-e67c-4570-0afe-de7f4b40a700/w=625,h=400',
  },
  {
    id: 'song-tho-nam',
    slug: '/goi-song-tho-danh-cho-nam/',
    name: 'Gói Sống Thọ',
    price: '11,500,000đ',
    sub: '29 Nhóm bệnh & 9 loại ung thư',
    image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/887ac26c-5b5c-4732-f2fe-37f2b4a4e200/w=625,h=400',
  },
];

const defaultFemalePackages: HomepagePackageCard[] = [
  {
    id: 'khuyen-cao-nu',
    slug: '/goi-khuyen-cao-danh-cho-nu/',
    name: 'Gói Khuyến Cáo',
    price: '3,000,000đ',
    sub: '21 Nhóm bệnh & 2 loại ung thư',
    image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/f95b8991-eaad-4b0d-0e10-363256915b00/w=625,h=400',
  },
  {
    id: 'chuyen-sau-nu',
    slug: '/goi-tam-soat-chuyen-sau-danh-cho-nu/',
    name: 'Gói Chuyên Sâu',
    price: '6,000,000đ',
    sub: '26 Nhóm bệnh & 4 loại ung thư',
    image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/ca8d1686-7b25-4e2b-b648-376b7cc69800/w=625,h=400',
  },
  {
    id: 'song-tho-nu',
    slug: '/goi-kham-song-tho-danh-cho-nu/',
    name: 'Gói Sống Thọ',
    price: '14,500,000đ',
    sub: '31 Nhóm bệnh & 10 loại ung thư',
    image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/f298c0dc-622c-4fc2-8f74-e4d83e1d5300/w=625,h=400',
  },
];

interface PricingSectionProps {
  pricingConfig?: PricingBlockConfig;
  header?: SectionsMetaConfig['pricingHeader'];
}

export function PricingSection({ pricingConfig, header }: PricingSectionProps = {}) {
  const [activeTab, setActiveTab] = useState<'male' | 'female'>('male');

  const malePackages = pricingConfig?.malePackages || defaultMalePackages;
  const femalePackages = pricingConfig?.femalePackages || defaultFemalePackages;
  const currentPackages = activeTab === 'male' ? malePackages : femalePackages;
  const title = header?.title || 'Bảng Giá Các Gói Khám Tổng\nQuát tại Doctor Check';
  const maleMoreUrl = header?.maleMoreUrl || '/goi-kham-danh-cho-nam/';
  const femaleMoreUrl = header?.femaleMoreUrl || '/goi-kham-danh-cho-nu/';
  const moreUrl = activeTab === 'male' ? maleMoreUrl : femaleMoreUrl;

  return (
    <section
      className="section section-service circle-blur py-10 md:py-16 bg-[#FDFDF6] relative overflow-hidden"
      id="section_1936328654"
    >
      <div className="container max-w-[1240px] mx-auto px-4 md:px-6">
        {/* Section Heading matching 1:1 */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-[#005570] font-bold text-[24px] sm:text-[28px] md:text-[34px] leading-[1.3] text-center" style={{ whiteSpace: 'pre-line' }}>
            {title}
          </h2>
        </div>

        {/* Tab Switcher (Gender Switcher Pill) */}
        <div className="flex justify-center mb-8 md:mb-12">
          <div className="inline-flex p-1.5 rounded-full bg-[#E5F3F7] shadow-inner gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('male')}
              className={`cursor-pointer px-6 sm:px-8 py-2.5 rounded-full font-bold text-[15.5px] sm:text-[17px] transition-all duration-300 ${
                activeTab === 'male'
                  ? 'bg-[#005570] text-white shadow-sm'
                  : 'text-[#005570] hover:text-[#003848] bg-transparent'
              }`}
            >
              Dành Cho Nam
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('female')}
              className={`cursor-pointer px-6 sm:px-8 py-2.5 rounded-full font-bold text-[15.5px] sm:text-[17px] transition-all duration-300 ${
                activeTab === 'female'
                  ? 'bg-[#005570] text-white shadow-sm'
                  : 'text-[#005570] hover:text-[#003848] bg-transparent'
              }`}
            >
              Dành Cho Nữ
            </button>
          </div>
        </div>

        {/* 3 Package Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-[1140px] mx-auto">
          {currentPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-[20px] p-5 sm:p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-gray-100/80 flex flex-col justify-between hover:shadow-[0_16px_36px_rgba(0,0,0,0.14)] hover:-translate-y-1 transition-all duration-300"
            >
              {/* Card Image Container with Corner Button Badge */}
              <div className="relative aspect-[625/400] w-full rounded-[14px] overflow-hidden mb-4 bg-gray-100">
                <Image
                  src={pkg.image}
                  alt={pkg.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 360px"
                  className="object-cover object-center hover:scale-103 transition-transform duration-300"
                />

                {/* Corner "Xem chi tiết →" Button Badge */}
                <Link
                  href={pkg.slug}
                  className="absolute bottom-3 right-3 bg-[#E5F3F7]/95 hover:bg-white text-[#005570] text-[13.5px] font-bold px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1 backdrop-blur-xs transition-all duration-200"
                >
                  <span>Xem chi tiết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Card Info Body */}
              <div className="flex flex-col flex-1 justify-between">
                {/* Package Name & Price Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="text-[#005570] font-bold text-[18px] sm:text-[19px]">
                    {pkg.name}
                  </h3>
                  <span className="text-[#1F2937] font-bold text-[18px] sm:text-[19px] whitespace-nowrap">
                    {pkg.price}
                  </span>
                </div>

                {/* Subtle Divider */}
                <div className="w-full h-px bg-[#E5E7EB] mb-3.5" />

                {/* Subtext Highlight */}
                <p className="text-[#1F2937] font-bold text-[18px] sm:text-[19px] leading-snug">
                  {pkg.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Button: TÌM HIỂU THÊM → */}
        <div className="text-center mt-10 md:mt-12">
          <Link
            href={moreUrl}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#005570] hover:bg-[#003848] text-white font-bold text-[15px] uppercase tracking-wide rounded-full shadow-md hover:shadow-lg transition-all duration-200"
          >
            <span>TÌM HIỂU THÊM</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
