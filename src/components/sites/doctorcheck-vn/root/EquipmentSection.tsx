'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import type { SectionsMetaConfig } from '@/lib/data/homepage';

export interface EquipmentItem {
  id: string;
  name: string;
  desc: string;
  image: string;
}

const defaultEquipmentItems: EquipmentItem[] = [
  {
    id: 'noi-soi',
    name: 'Hệ Thống Máy Nội Soi',
    desc: 'Máy nội soi Olympus EVIS-X1 CV-1500 & Máy nội soi Fujifilm EP-7000 tích hợp nhiều công nghệ tiên tiến, cho hình ảnh rõ nét, giúp Bác Sĩ đánh giá chính xác tổn thương.',
    image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/78304e55-5a75-4c92-4e70-284df81aa800/w=874,h=582',
  },
  {
    id: 'xet-nghiem',
    name: 'Hệ Thống Máy Xét Nghiệm',
    desc: 'Các máy xét nghiệm đến từ hãng: Abbott, Roche, Olympus, Cobas,... phân tích các mẫu hoàn toàn tự động, giúp chẩn đoán bệnh lý tiêu hóa – gan mật và tầm soát ung thư hệ tiêu hóa.',
    image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/703a1139-9dab-4e78-b6e3-2c43858c6400/w=874,h=582',
  },
  {
    id: 'sieu-am',
    name: 'Hệ Thống Máy Siêu Âm Màu',
    desc: 'ACUSON Juniper từ hãng Siemens (Mỹ) cao cấp có thiết kế nhỏ gọn, màn hình cảm ứng lớn, hệ thống đầu dò đa dạng, giúp thu được hình ảnh chất lượng cao trong siêu âm cận lâm sàng tiêu hóa.',
    image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/4a217bbc-bd4a-4234-c715-bea676e88b00/w=874,h=582',
  },
  {
    id: 'x-quang',
    name: 'Máy Chụp X-Quang',
    desc: 'Hệ thống máy chụp X quang từ hãng Vikomed (Liên doanh Việt - Hàn) có thể thu nhận hình ảnh cả tư thế đứng & nằm, được sử dụng để khảo sát các bệnh lý bụng ngoại khoa, liệt ruột, tắc ruột,....',
    image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/d0946de2-a6a8-4c32-82c6-f2da3e64a300/w=874,h=582',
  },
  {
    id: 'dien-tim',
    name: 'Máy Đo Điện Tim 3 Kênh',
    desc: 'Máy FX 8100 từ hãng Fukuda (Nhật Bản) có màn hình màu LCD 7” giúp quan sát rõ dạng sóng ECG, sóng lâm sàng và nhịp tim. Kết quả in được ở nhiều định dạng, cho người dùng dễ đọc dữ liệu.',
    image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/5635de35-86cf-437c-07a6-91b577176c00/w=874,h=582',
  },
  {
    id: 'hpylori',
    name: 'Máy Đo H. pylori',
    desc: 'Máy FanHp từ hãng Fisher (Đức) được sử dụng để phân tích urease nhanh thông qua hơi thở, giúp sớm phát hiện nguy cơ mắc vi khuẩn Helicobacter pylori (HP) gây các bệnh lý trong dạ dày.',
    image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/878ede28-24d7-4976-be0d-f183342b3600/w=874,h=582',
  },
];

interface EquipmentSectionProps {
  equipmentList?: EquipmentItem[];
  header?: SectionsMetaConfig['equipmentHeader'];
}

export function EquipmentSection({ equipmentList, header }: EquipmentSectionProps = {}) {
  const equipmentItems = equipmentList || defaultEquipmentItems;
  const title = header?.title || 'Khám Phá Sức Mạnh Từ Trang Thiết Bị Máy Móc\nHiện Đại Tại Doctor Check';
  const description = header?.description || 'Doctor Check muốn mang đến cho bạn dịch vụ tầm soát không đau, nhanh chóng và khả năng chẩn đoán ngay từ giai đoạn sớm, phát hiện các bất thường trong cơ thể. Nên đã đầu tư toàn bộ trang bị hệ thống máy móc đạt chuẩn quốc tế.';

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const index = Math.round(scrollLeft / (clientWidth * 0.85));
    setActiveIndex(Math.min(Math.max(0, index), equipmentItems.length - 1));
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const itemWidth = scrollRef.current.clientWidth * 0.85;
    scrollRef.current.scrollTo({
      left: index * itemWidth,
      behavior: 'smooth',
    });
    setActiveIndex(index);
  };

  return (
    <section
      className="section section-facilities py-12 md:py-16 bg-[#FDFDF6] relative overflow-hidden"
      id="section_818310656"
    >
      <div className="container max-w-[1240px] mx-auto px-4 md:px-6">
        {/* Section Heading matching original 1:1 */}
        <div className="text-center max-w-[960px] mx-auto mb-10 md:mb-14">
          <h2 className="text-[26px] sm:text-[30px] md:text-[34px] font-bold text-[#005570] tracking-tight leading-[1.3] mb-4" style={{ whiteSpace: 'pre-line' }}>
            {title}
          </h2>
          <p className="text-[15.5px] sm:text-[16.5px] md:text-[17.5px] text-[#2A2F38] leading-[1.6] max-w-[880px] mx-auto font-normal">
            {description}
          </p>
        </div>

        {/* Desktop 6-Card Grid (3 columns x 2 rows) */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 w-full mx-auto">
          {equipmentItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-[16px] overflow-hidden aspect-[874/582] cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)] transition-all duration-300 bg-slate-800"
            >
              {/* 1. Background Image - Always fully visible */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 400px"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* 2. Default Bottom Gradient: Only covers bottom 45% so the machine photo is completely clear */}
              <div
                className="absolute inset-x-0 bottom-0 h-[48%] pointer-events-none transition-opacity duration-300 z-10 group-hover:opacity-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(4, 42, 53, 0.95) 0%, rgba(4, 42, 53, 0.6) 50%, rgba(4, 42, 53, 0) 100%)',
                }}
              />

              {/* 3. Hover Full Dark-Teal Gradient: Covers card on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-10"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(12, 123, 155, 0.35) 0%, rgba(4, 42, 53, 0.92) 55%, #042A35 100%)',
                }}
              />

              {/* 4. Text Container: Bottom in normal state, Centered on hover */}
              <div className="absolute inset-0 p-5 z-20 flex flex-col justify-end text-center transition-all duration-300 group-hover:justify-center">
                {/* Title */}
                <h3 className="capitalize text-white font-bold text-[18.5px] md:text-[19px] tracking-wide mb-1 drop-shadow-md group-hover:mb-3 transition-all duration-300">
                  {item.name}
                </h3>
                {/* Description revealed on hover */}
                <p className="text-[14.5px] md:text-[15px] text-white leading-[1.55] max-h-0 opacity-0 group-hover:max-h-44 group-hover:opacity-100 transition-all duration-300 overflow-hidden font-normal px-2">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Swipeable Carousel with White 2-Tier Cards */}
        <div className="block md:hidden w-full">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 pb-4 px-2 -mx-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {equipmentItems.map((item) => (
              <div
                key={item.id}
                className="snap-center shrink-0 w-[85vw] max-w-[340px] rounded-[16px] overflow-hidden bg-white shadow-[0_4px_14px_rgba(0,0,0,0.12)] flex flex-col"
              >
                {/* Top: Image */}
                <div className="relative aspect-[874/540] w-full overflow-hidden bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="85vw"
                    className="object-cover object-center"
                  />
                </div>

                {/* Bottom: White Card Content */}
                <div className="p-5 flex flex-col items-center text-center bg-white">
                  <h3 className="text-[#005570] font-bold text-[19.5px] sm:text-[20px] mb-2 leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-[#2A2F38] text-[15px] sm:text-[15.5px] leading-[1.55] font-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Pagination for Mobile */}
          <div className="flex justify-center items-center gap-2 mt-4">
            {equipmentItems.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollToIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  activeIndex === index
                    ? 'bg-[#005570] w-6'
                    : 'bg-[#D1D5DB] hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
