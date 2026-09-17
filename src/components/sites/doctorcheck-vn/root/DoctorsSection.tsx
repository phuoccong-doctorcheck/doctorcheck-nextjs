'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export function DoctorsSection() {
  const [startIndex, setStartIndex] = useState<number>(0);

  const doctors = [
    {
      id: 'trinh-ai-nhi',
      slug: '/doctor/trinh-ai-nhi/',
      degree: 'BSCKII',
      name: 'Trịnh Ái Nhi',
      role: 'Bác Sĩ Nội Tổng Quát',
      image: '/sites/doctorcheck-vn/root/images/doctors/trinh-ai-nhi.webp',
    },
    {
      id: 'chau-quynh-phi-nha',
      slug: '/doctor/chau-quynh-phi-nha/',
      degree: 'BSCKII',
      name: 'Châu Quỳnh Phi Nhã',
      role: 'Bác Sĩ Nội Tổng Quát',
      image: '/sites/doctorcheck-vn/root/images/doctors/chau-quynh-phi-nha-master.webp',
    },
    {
      id: 'nguyen-ngoc-quynh-dung',
      slug: '/doctor/nguyen-ngoc-quynh-dung/',
      degree: 'ThS. BSCKII',
      name: 'Nguyễn Ngọc Quỳnh Dung',
      role: 'Bác Sĩ Nội Tổng Quát',
      image: '/sites/doctorcheck-vn/root/images/doctors/nguyen-ngoc-quynh-dung.webp',
    },
    {
      id: 'nguyen-hong-thanh',
      slug: '/doctor/nguyen-hong-thanh/',
      degree: 'ThS. BSCKII',
      name: 'Nguyễn Hồng Thanh',
      role: 'Bác Sĩ Nội Tổng Quát',
      image: '/sites/doctorcheck-vn/root/images/doctors/nguyen-hong-thanh.webp',
    },
    {
      id: 'luu-ngoc-mai',
      slug: '/doctor/luu-ngoc-mai/',
      degree: 'ThS. BSCKI',
      name: 'Lưu Ngọc Mai',
      role: 'Bác Sĩ Nội Tổng Quát',
      image: '/sites/doctorcheck-vn/root/images/doctors/luu-ngoc-mai.webp',
    },
    {
      id: 'thai-viet-nguyen',
      slug: '/doctor/thai-viet-nguyen/',
      degree: 'ThS. BSNT',
      name: 'Thái Việt Nguyên',
      role: 'Bác Sĩ Nội Tổng Quát',
      image: '/sites/doctorcheck-vn/root/images/doctors/thai-viet-nguyen.webp',
    },
    {
      id: 'dang-nguyen-nhat-thanh-thi',
      slug: '/doctor/dang-nguyen-nhat-thanh-thi/',
      degree: 'BSCKI',
      name: 'Đặng Nguyễn Nhật Thanh Thi',
      role: 'Bác Sĩ Nội Soi',
      image: '/sites/doctorcheck-vn/root/images/doctors/dang-nguyen-nhat-thanh-thi.webp',
    },
  ];

  const handlePrev = () => {
    setStartIndex((prev) => (prev === 0 ? doctors.length - 4 : prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev >= doctors.length - 4 ? 0 : prev + 1));
  };

  const visibleDoctors = doctors.slice(startIndex, startIndex + 4);
  if (visibleDoctors.length < 4) {
    visibleDoctors.push(...doctors.slice(0, 4 - visibleDoctors.length));
  }

  return (
    <section className="section section-doctor py-10 md:py-14 bg-white relative overflow-hidden" id="section_1563108974">
      {/* Authentic Master Background Watermark */}
      <div className="section-bg fill absolute inset-0 pointer-events-none opacity-40">
        <Image
          src="/sites/doctorcheck-vn/root/images/doctor-bg-master.webp"
          alt="Bác Sĩ Doctor Check"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="section-content relative container max-w-[1250px] mx-auto px-[15px] z-10">
        {/* Section Heading matching authentic WordPress HTML */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-[#005570] capitalize tracking-tight">
            Đội ngũ bác sĩ giàu kinh nghiệm, đến từ các bệnh viện lớn tại TP.HCM
          </h2>
          <p className="text-sm sm:text-base text-[#4D5565] mt-2">
            Đội ngũ Bác sĩ sẽ dành nhiều thời gian tư vấn cho bạn với mong muốn giúp bạn trở thành bác sĩ của chính mình.
          </p>
        </div>

        {/* Carousel Container with Arrows */}
        <div className="relative flex items-center justify-center w-full mx-auto">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Xem bác sĩ trước"
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-lg border border-[#87E3DB] bg-white hover:bg-[#EEF7FA] text-[#005570] flex items-center justify-center shadow-md transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* 4 Doctor Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {visibleDoctors.map((doc) => (
              <div
                key={doc.id}
                className="box has-hover box-text-bottom rounded-lg bg-white shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
              >
                <Link href={doc.slug} className="block group">
                  {/* Photo area with light blue frame */}
                  <div className="box-image relative w-full h-[210px] sm:h-[230px] bg-[#E8F5F8] overflow-hidden flex items-end justify-center">
                    <Image
                      src={doc.image}
                      alt={doc.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 280px"
                      className="object-contain object-bottom group-hover:scale-104 transition-transform duration-300"
                    />
                  </div>

                  {/* Text area */}
                  <div className="box-text text-center p-4 bg-white">
                    <div className="box-text-inner">
                      <h3 className="text-sm sm:text-[15px] font-black text-[#005570] leading-tight mb-1.5">
                        <span className="text-xs text-[#0A5063] block font-bold mb-0.5">{doc.degree}</span>
                        {doc.name}
                      </h3>
                      <p className="text-xs text-[#4D5565] font-semibold">{doc.role}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Xem bác sĩ tiếp theo"
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-lg border border-[#87E3DB] bg-white hover:bg-[#EEF7FA] text-[#005570] flex items-center justify-center shadow-md transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* CTA Button matching authentic WordPress HTML */}
        <div className="text-center mt-10">
          <Link
            href="/doi-ngu-bac-si"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#005570] hover:bg-[#00475B] text-white text-sm font-bold shadow-md transition-all"
          >
            <span>Tìm hiểu thêm về đội ngũ bác sĩ</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
