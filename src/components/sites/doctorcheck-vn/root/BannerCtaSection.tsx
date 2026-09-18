import React from 'react';
import Image from 'next/image';
import { Calendar } from 'lucide-react';
import type { BannerCtaBlockConfig } from '@/lib/data/homepage';

interface BannerCtaSectionProps {
  config?: BannerCtaBlockConfig;
}

export function BannerCtaSection({ config }: BannerCtaSectionProps = {}) {
  const brand = config?.brand || 'Doctor Check';
  const title = config?.title || 'Tầm Soát Bệnh Để Sống Thọ Hơn';
  const workingHoursTitle = config?.workingHoursTitle || 'Thời gian làm việc';
  const workingHoursWeekday = config?.workingHoursWeekday || 'Thứ 2 – Thứ 7: 6h – 15h';
  const workingHoursSunday = config?.workingHoursSunday || 'Chủ nhật: 7h – 12h';
  const buttonText = config?.buttonText || 'Đặt hẹn ngay';
  const buttonTarget = config?.buttonTarget || '#tu-van';
  const desktopImage = config?.desktopImage || '/sites/doctorcheck-vn/root/images/banner-cta-desktop.webp';
  const mobileImage = config?.mobileImage || '/sites/doctorcheck-vn/root/images/banner-cta-mobile.webp';

  return (
    <section
      className="section section-banner-cta relative bg-white py-8 md:py-12"
      id="section_514095607"
    >
      <div className="container max-w-[1140px] mx-auto px-4">
        {/* Desktop Banner (md:block hidden) */}
        <div
          className="hidden md:block relative w-full aspect-[1709/700] lg:aspect-[1709/660] rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          id="banner-1487577125"
        >
          {/* Background image & illustration */}
          <div className="banner-bg absolute inset-0">
            <Image
              src={desktopImage}
              alt={`${brand} - ${title}`}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1140px"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Right-aligned Content Layer */}
          <div className="absolute inset-0 flex items-center justify-end z-10 pr-6 lg:pr-12">
            <div className="w-[58%] lg:w-[54%] flex flex-col items-center justify-center text-center">
              {/* Brand & Heading */}
              <div className="mb-2">
                <span className="text-[#FFB500] font-bold text-[22px] lg:text-[24px] block tracking-wide">
                  {brand}
                </span>
                <h2 className="text-[26px] lg:text-[30px] font-bold text-white leading-tight mt-1">
                  {title}
                </h2>
              </div>

              {/* Authentic DoctorCheck Yellow Capsule + Dot Divider */}
              <div className="flex items-center justify-center gap-1.5 my-3">
                <span className="w-8 h-[5px] bg-[#FFB500] rounded-full inline-block" />
                <span className="w-[5px] h-[5px] bg-[#FFB500] rounded-full inline-block" />
              </div>

              {/* Working Hours */}
              <div className="text-white space-y-1 mb-5">
                <p className="font-bold text-white text-[17px] lg:text-[18px]">
                  {workingHoursTitle}
                </p>
                <p className="text-[15.5px] lg:text-[16.5px] font-medium text-white">
                  {workingHoursWeekday}
                </p>
                <p className="text-[15.5px] lg:text-[16.5px] font-medium text-white">
                  {workingHoursSunday}
                </p>
              </div>

              {/* Action Button with Calendar Badge */}
              <a
                href={buttonTarget}
                className="inline-flex items-center gap-2.5 pl-7 pr-3 py-2 rounded-full bg-[#FFB500] hover:bg-[#FFA800] text-[#002A36] font-bold text-[15.5px] lg:text-[16px] shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <span>{buttonText}</span>
                <span className="w-7 h-7 rounded-full bg-[#E09800] flex items-center justify-center text-white">
                  <Calendar className="w-4 h-4 stroke-[2.2]" />
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Banner (md:hidden block) */}
        <div
          className="block md:hidden relative w-full aspect-[545/960] sm:aspect-[545/880] rounded-[20px] overflow-hidden shadow-md"
          id="banner-1858166176"
        >
          {/* Background image & nurse at bottom */}
          <div className="banner-bg absolute inset-0">
            <Image
              src={mobileImage}
              alt={`${brand} - ${title}`}
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>

          {/* Top-aligned Content Layer for Mobile */}
          <div className="absolute inset-0 flex flex-col justify-start items-center pt-8 px-5 z-10">
            <div className="text-center text-white w-full">
              {/* Brand & Heading */}
              <div className="mb-2">
                <span className="text-[#FFB500] font-bold text-[21px] block">
                  {brand}
                </span>
                <h2 className="text-[22px] sm:text-[24px] font-bold text-white leading-tight mt-1">
                  {title}
                </h2>
              </div>

              {/* Yellow Capsule + Dot Divider */}
              <div className="flex items-center justify-center gap-1.5 my-2.5">
                <span className="w-7 h-1 bg-[#FFB500] rounded-full inline-block" />
                <span className="w-1.5 h-1.5 bg-[#FFB500] rounded-full inline-block" />
              </div>

              {/* Working Hours */}
              <div className="text-white space-y-1 mb-4">
                <p className="font-bold text-white text-[16.5px]">
                  {workingHoursTitle}
                </p>
                <p className="text-[15px] font-medium text-white">
                  {workingHoursWeekday}
                </p>
                <p className="text-[15px] font-medium text-white">
                  {workingHoursSunday}
                </p>
              </div>

              {/* Action Button with Calendar Badge */}
              <a
                href={buttonTarget}
                className="inline-flex items-center gap-2 pl-6 pr-2.5 py-2 rounded-full bg-[#FFB500] hover:bg-[#FFA800] text-[#002A36] font-bold text-[15px] shadow-md transition-all duration-200"
              >
                <span>{buttonText}</span>
                <span className="w-6 h-6 rounded-full bg-[#E09800] flex items-center justify-center text-white">
                  <Calendar className="w-3.5 h-3.5 stroke-[2.2]" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
