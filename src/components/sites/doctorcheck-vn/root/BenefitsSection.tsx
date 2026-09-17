'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronUp, ChevronDown, ArrowRight, Play } from 'lucide-react';
import { VideoModal } from './VideoModal';

export function BenefitsSection() {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  const benefits = [
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

  return (
    <section className="section section-advanced py-10 md:py-14 bg-[#FDFDF6] relative overflow-hidden" id="section_1967412634">
      <div className="container max-w-[1250px] mx-auto px-[15px]">
        {/* Section Heading matching authentic WordPress HTML */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-[#005570] tracking-tight leading-snug">
            5 quyền lợi bạn nhận được khi tầm soát bệnh tại Doctor Check:
          </h2>
        </div>

        {/* 2 Columns: Accordion Left + Video Banner Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center max-w-[1100px] mx-auto">
          {/* Left Column: Authentic Accordion */}
          <div className="lg:col-span-6 flex flex-col space-y-3">
            {benefits.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={item.num}
                  className={`accordion-item overflow-hidden transition-all duration-200 ${
                    isOpen
                      ? 'bg-[#EEF7FA] rounded-t-lg rounded-b-none'
                      : 'bg-[#F5F5F7] hover:bg-[#EEF7FA] rounded-lg'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                    className={`w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-[#005570] transition-colors relative ${
                      isOpen ? 'pl-6' : ''
                    }`}
                  >
                    {/* Active Left Indicator Bar */}
                    {isOpen && (
                      <span className="absolute left-0 top-0 h-full w-1.5 bg-[#005570] rounded-l" />
                    )}

                    <h3 className="pr-4 leading-snug">{item.title}</h3>

                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#005570] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#005570] flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-[13.5px] text-[#4D5565] leading-relaxed bg-[#EEF7FA] rounded-b-lg border-t border-[#005570]/10">
                      <p>{item.desc}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* CTA Button */}
            <div className="pt-3">
              <Link
                href="/ve-chung-toi/"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#005570] hover:bg-[#00475B] text-white text-xs sm:text-sm font-bold shadow-md transition-all"
              >
                <span>Xem thêm về Doctor Check</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Authentic Banner with Master Image & Video Play Trigger */}
          <div className="lg:col-span-6 flex justify-center">
            <div
              onClick={() => setIsVideoModalOpen(true)}
              className="relative rounded-lg overflow-hidden shadow-xl border border-gray-100 bg-[#005570]/10 aspect-[534/329] w-full max-w-[500px] cursor-pointer group"
            >
              <Image
                src="/sites/doctorcheck-vn/root/images/benefits-banner-master.webp"
                alt="Quy trình khám tổng quát 60 phút tại Doctor Check"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover object-center group-hover:scale-103 transition-transform duration-500"
              />

              {/* Central Video Button */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-transparent transition-colors">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white/90 bg-white/30 backdrop-blur-xs flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:bg-white/50 transition-all">
                  <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Popup Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        videoId="VnL1iSrq7CY"
        onClose={() => setIsVideoModalOpen(false)}
      />
    </section>
  );
}
