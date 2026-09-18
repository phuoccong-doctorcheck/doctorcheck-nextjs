'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { VideoModal } from './VideoModal';
import type { BenefitsBlockConfig } from '@/lib/data/homepage';

const defaultBenefitsData = [
  {
    num: 1,
    title: '1. Trung Tâm Đầu Tiên Chuyên Sâu Tầm Soát Bệnh',
    desc: 'Hằng năm, Doctor Check sẽ đồng hành cùng bạn trong việc phát hiện sớm các vấn đề tiềm ẩn, theo dõi và ngăn ngừa kịp thời để giúp bạn sống khoẻ & sống thọ hơn.',
  },
  {
    num: 2,
    title: '2. Chẩn Đoán Dựa Vào Y Học Chứng Cứ 100%',
    desc: 'Doctor Check đầu tư hệ thống xét nghiệm, chẩn đoán hình ảnh, nội soi & thăm dò chức năng theo tiêu chuẩn hàng đầu thế giới. Vì vậy, bạn sẽ hoàn toàn yên tâm khi nhận được kết quả chẩn đoán chính xác về tình trạng sức khoẻ của mình.',
  },
  {
    num: 3,
    title: '3. Quy Trình Tầm Soát Bệnh Chỉ Trong 60-90 Phút',
    desc: 'Doctor Check hiểu rằng việc chờ đợi là rất mệt mỏi, vì vậy Doctor Check cải tiến & thiết kế quy trình tầm soát bệnh một cách khoa học nhất để tiết kiệm tối đa thời gian cho bạn.',
  },
  {
    num: 4,
    title: '4. Kết Nối Bạn Với Chuyên Gia Bác Sĩ Hàng Đầu',
    desc: 'Khi tầm soát ra bệnh, Doctor Check sẽ kết nối bạn với chuyên gia hàng đầu về bệnh lý bạn đang mắc phải ở các bệnh viện lớn để việc điều trị đạt được hiệu quả cao nhất.',
  },
  {
    num: 5,
    title: '5. Tư Vấn Cách Để Bạn Sống Thọ Đến 85 Tuổi Như Người Nhật Bản',
    desc: 'Dựa trên kết quả tầm soát, bác sĩ Doctor Check sẽ đưa ra lời khuyên về ăn uống, nghỉ ngơi, tập luyện, … để giúp bạn trở thành bác sĩ của chính mình.',
  },
];

interface BenefitsSectionProps {
  config?: BenefitsBlockConfig;
}

/**
 * BenefitsSection (Section 3: 5 Clinical Benefits)
 * Forensic 1:1 reconstruction of original #section_1967412634 (.section-advanced)
 * Source: doctorcheck-source/html/homepage.html (#section_1967412634, #row-1877531772)
 * Layout: 1250px container, centered 5:5 flex column split, authentic Flatsome accordion with left indicator bar
 */
export function BenefitsSection({ config }: BenefitsSectionProps = {}) {
  const benefitsData = config?.items || defaultBenefitsData;
  const heading = config?.title || '5 quyền lợi bạn nhận được khi tầm soát bệnh tại Doctor Check:';
  const moreUrl = config?.moreUrl || '/ve-chung-toi/';
  const moreLabel = config?.moreLabel || 'Xem thêm về Doctor Check';
  const bannerImage = config?.bannerImage || '/sites/doctorcheck-vn/root/images/benefits-banner-master.webp';
  const bannerVideoId = config?.bannerVideoId || 'VnL1iSrq7CY';

  const [openIndex, setOpenIndex] = useState<number>(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  const toggleAccordion = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? -1 : idx));
  };

  return (
    <section className="section section-advanced" id="section_1967412634">
      <div className="section-bg fill" />

      <div className="section-content relative">
        {/* Section Heading */}
        <h2>
          {heading}
        </h2>

        {/* Two Columns Row */}
        <div className="row-advanced" id="row-1877531772">
          
          {/* Left Column: Accordion + Button */}
          <div className="col-accordion">
            <div className="accordion">
              {benefitsData.map((item, idx) => {
                const isActive = openIndex === idx;
                return (
                  <div
                    key={item.num}
                    className={`accordion-item ${isActive ? 'is-open' : ''}`}
                  >
                    {/* Accordion Header Button */}
                    <button
                      type="button"
                      onClick={() => toggleAccordion(idx)}
                      aria-expanded={isActive}
                      className="accordion-title"
                    >
                      <h3>{item.title}</h3>

                      {/* Arrow Chevron Toggle */}
                      <span className="toggle-chevron" aria-hidden="true">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    </button>

                    {/* Accordion Content Body */}
                    {isActive && (
                      <div className="accordion-inner">
                        <p>{item.desc}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Button: "Xem thêm về Doctor Check" */}
            <div>
              <Link href={moreUrl} className="btn-more">
                <span>{moreLabel}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Column: Banner Video (Hidden on small mobile) */}
          <div className="col-banner">
            <div
              id="banner-1539915461"
              className="banner-video-card"
              onClick={() => setIsVideoModalOpen(true)}
            >
              <Image
                src={bannerImage}
                alt={heading}
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                style={{ objectFit: 'cover' }}
                priority={false}
              />

              {/* Centered Play Button */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.06)',
                }}
              >
                <div className="play-btn-circle">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff" style={{ marginLeft: '3px' }}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Video Popup Modal (Youtube ID) */}
      <VideoModal
        isOpen={isVideoModalOpen}
        videoId={bannerVideoId}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </section>
  );
}
