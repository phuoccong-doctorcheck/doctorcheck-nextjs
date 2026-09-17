'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { VideoModal } from './VideoModal';

export function VideoTestimonialsSection() {
  const [activeSlide, setActiveSlide] = useState<number>(1);
  const [modalVideoId, setModalVideoId] = useState<string | null>(null);

  const videos = [
    {
      id: 'A4BCCgKqwVI',
      title: 'Trải Nghiệm Tầm Soát Bệnh Tại Doctor Check',
    },
    {
      id: '80iE-7mnZGM',
      title: 'Tiền Bạc Là Gì Khi Sức Khỏe Chẳng Còn - Câu Chuyện Của Anh Ken Võ',
    },
    {
      id: 'BpDdHblLz98',
      title: '10.000 Khách Hàng Đã Chọn Doctor Check Làm Nơi Đồng Hành',
    },
    {
      id: '83eK9z4xptU',
      title: '3 Điểm Nổi Bật Của Phòng Khám Doctor Check Dưới Cái Nhìn Của Chú Tú',
    },
    {
      id: '3ZVAQnYQQ4A',
      title: 'Cô Thanh - Minh Chứng Cho Sự Đồng Nhất Chất Lượng Của Doctor Check',
    },
    {
      id: 'CQvRnc-mJuI',
      title: '3 Lý Do Khiến Chú Tịnh "Gật Đầu" Sau 2 Năm Tìm Hiểu Về Khám Tổng Quát',
    },
    {
      id: '6yE2UnuG1ms',
      title: '[Chỉ 60 Phút] Trải Nghiệm Tầm Soát 18 Nhóm Bệnh Dịch Vụ Chuẩn 5🌟',
    },
    {
      id: 'ae4TGkVTOTE',
      title: 'Tái Khám Sau 3 Tháng - Cô Loan "Chấm Điểm 10" Cho Mọi Thứ',
    },
    {
      id: 'M5iujCgtPfg',
      title: 'Sống Khỏe Để Sống Thọ – Vợ Chồng Chú Hà Nói Gì Sau Lần Đầu Khám Tổng Quát',
    },
  ];

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % videos.length);
  };

  // Window of 3 visible items centered on activeSlide
  const prevIndex = (activeSlide - 1 + videos.length) % videos.length;
  const nextIndex = (activeSlide + 1) % videos.length;
  const visibleIndices = [prevIndex, activeSlide, nextIndex];

  return (
    <section className="section py-10 md:py-14 bg-[#FDFDF6] relative overflow-hidden" id="video-testimonials">
      <div className="section-content relative container max-w-[1250px] mx-auto px-[15px]">
        {/* Section Heading */}
        <div className="text-center mb-8">
          <div className="text show-for-small">
            <h2 className="capitalize font-bold text-[#005570]" style={{ fontSize: '1.4rem', textAlign: 'center', margin: 0 }}>
              Mời bạn lắng nghe những chia sẻ từ những khách hàng đã trải nghiệm
            </h2>
          </div>
          <div className="text hide-for-small">
            <h2 className="font-bold text-[#005570]" style={{ fontSize: '1.6rem', textAlign: 'center', margin: 0, lineHeight: 1.3 }}>
              Kiểm Chứng Ngay Qua <br />
              Những Chia Sẻ Từ Khách Hàng
            </h2>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Previous Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Xem video trước"
            className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-[#87E3DB] text-[#005570] flex items-center justify-center shadow-md hover:bg-[#EEF7FA] transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* 3-Card Video Carousel */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 py-2">
            {visibleIndices.map((idx, pos) => {
              const video = videos[idx];
              const isCenter = pos === 1;

              return (
                <div
                  key={video.id}
                  onClick={() => setModalVideoId(video.id)}
                  className={`group relative cursor-pointer overflow-hidden rounded-lg bg-black shadow-lg transition-all duration-300 ${
                    isCenter
                      ? 'w-[280px] sm:w-[340px] md:w-[360px] aspect-[9/16] z-10 scale-105 ring-2 ring-[#005570]'
                      : 'w-[220px] sm:w-[260px] md:w-[280px] aspect-[9/16] opacity-75 hover:opacity-100 hidden sm:block'
                  }`}
                >
                  {/* YouTube HQ Thumbnail */}
                  <Image
                    src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                    alt={video.title}
                    fill
                    sizes="(max-width: 640px) 280px, 360px"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />

                  {/* Dark Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Play Button Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#FFB500] group-hover:bg-[#e0a000] text-[#005570] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Video Title at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2 drop-shadow">
                      {video.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next Arrow */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Xem video tiếp theo"
            className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-[#87E3DB] text-[#005570] flex items-center justify-center shadow-md hover:bg-[#EEF7FA] transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Carousel Pagination Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {videos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveSlide(i)}
                aria-label={`Chuyển đến video ${i + 1}`}
                className={`transition-all duration-200 rounded-full ${
                  activeSlide === i
                    ? 'w-3 h-3 bg-[#005570] scale-110'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Video Modal Player */}
      <VideoModal
        isOpen={!!modalVideoId}
        videoId={modalVideoId}
        onClose={() => setModalVideoId(null)}
      />
    </section>
  );
}
