'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SectionsMetaConfig } from '@/lib/data/homepage';

const defaultDoctors = [
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

interface DoctorCardItem {
  id: string;
  slug: string;
  degree: string;
  name: string;
  role: string;
  image: string;
}

interface DoctorsSectionProps {
  doctorsList?: DoctorCardItem[];
  header?: SectionsMetaConfig['doctorsHeader'];
}

export function DoctorsSection({ doctorsList, header }: DoctorsSectionProps = {}) {
  const [startIndex, setStartIndex] = useState<number>(0);
  const doctors = doctorsList || defaultDoctors;
  const title = header?.title || 'Đội Ngũ Bác Sĩ Giàu Kinh Nghiệm, Đến Từ Các Bệnh Viện Lớn Tại TP.HCM';
  const subtitle = header?.subtitle || 'Đội ngũ Bác sĩ sẽ dành nhiều thời gian tư vấn cho bạn với mong muốn giúp bạn trở thành bác sĩ của chính mình.';
  const ctaUrl = header?.ctaUrl || '/doi-ngu-bac-si/';
  const ctaLabel = header?.ctaLabel || 'Tìm hiểu thêm về đội ngũ bác sĩ';

  const handlePrev = () => {
    setStartIndex((prev) => (prev === 0 ? doctors.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % doctors.length);
  };

  // Get 4 visible doctors with wrapping
  const visibleDoctors = [];
  for (let i = 0; i < 4; i++) {
    visibleDoctors.push(doctors[(startIndex + i) % doctors.length]);
  }

  return (
    <section className="section section-doctor" id="section_1563108974">
      {/* Background Watermark */}
      <div className="section-bg">
        <Image
          src="/sites/doctorcheck-vn/root/images/doctor-bg-master.webp"
          alt="Bác Sĩ Doctor Check"
          fill
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'left center' }}
          priority={false}
        />
      </div>

      <div className="section-content relative" style={{ zIndex: 2 }}>
        {/* Section Heading & Subtitle */}
        <div className="doctor-header">
          <h2>
            {title}
          </h2>
          <p>
            {subtitle}
          </p>
        </div>

        {/* Doctor Cards Carousel */}
        <div className="doctor-carousel-wrapper">
          {/* Previous Arrow Button */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Xem bác sĩ trước"
            className="doctor-nav-btn prev"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>

          {/* 4 Doctor Cards Row */}
          <div className="doctor-cards-row">
            {visibleDoctors.map((doc, idx) => (
              <Link
                key={`${doc.id}-${idx}`}
                href={doc.slug}
                className="doctor-card"
              >
                {/* Doctor Photo Area */}
                <div className="doctor-card-img">
                  <Image
                    src={doc.image}
                    alt={doc.name}
                    fill
                    sizes="(max-width: 640px) 80vw, 280px"
                    style={{ objectFit: 'contain', objectPosition: 'bottom' }}
                  />
                </div>

                {/* Doctor Info Area */}
                <div className="doctor-card-info">
                  <span className="doctor-degree">{doc.degree}</span>
                  <h3 className="doctor-name">{doc.name}</h3>
                  <p className="doctor-role">{doc.role}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Next Arrow Button */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Xem bác sĩ tiếp theo"
            className="doctor-nav-btn next"
          >
            <ChevronRight size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* CTA Button */}
        <div style={{ textAlign: 'center' }}>
          <Link href={ctaUrl} className="btn-doctor-cta">
            <span>{ctaLabel}</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
