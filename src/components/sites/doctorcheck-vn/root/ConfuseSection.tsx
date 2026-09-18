'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { VideoModal } from './VideoModal';
import type { PainPointsBlockConfig } from '@/lib/data/homepage';

const defaultPainPoints = [
  { num: 1, title: 'Kết quả khám tổng quát không chính xác' },
  { num: 2, title: 'Bác sĩ không dành nhiều thời gian tư vấn cho bạn' },
  { num: 3, title: 'Mệt mỏi vì phải bốc số, chờ đợi quá lâu' },
  { num: 4, title: 'Phát sinh các chi phí không cần thiết' },
];

const defaultVideos = [
  { id: 'A4BCCgKqwVI', title: 'Trải Nghiệm Tầm Soát Bệnh Tại Doctor Check' },
  { id: '80iE-7mnZGM', title: 'Tiền Bạc Là Gì Khi Sức Khỏe Chẳng Còn - Câu Chuyện Của Anh Ken Võ' },
  { id: 'BpDdHblLz98', title: '10.000 Khách Hàng Đã Chọn Doctor Check Làm Nơi Đồng Hành' },
  { id: '83eK9z4xptU', title: '3 Điểm Nổi Bật Của Phòng Khám Doctor Check Dưới Cái Nhìn Của Chú Tú' },
  { id: '3ZVAQnYQQ4A', title: 'Cô Thanh - Minh Chứng Cho Sự Đồng Nhất Chất Lượng Của Doctor Check' },
  { id: 'CQvRnc-mJuI', title: '3 Lý Do Khiến Chú Tịnh "Gật Đầu" Sau 2 Năm Tìm Hiểu Về Khám Tổng Quát' },
  { id: '6yE2UnuG1ms', title: '[Chỉ 60 Phút] Trải Nghiệm Tầm Soát 18 Nhóm Bệnh Dịch Vụ Chuẩn 5🌟' },
  { id: 'ae4TGkVTOTE', title: 'Tái Khám Sau 3 Tháng - Cô Loan "Chấm Điểm 10" Cho Mọi Thứ' },
  { id: 'M5iujCgtPfg', title: 'Sống Khỏe Để Sống Thọ – Vợ Chồng Chú Hà Nói Gì Sau Lần Đầu Khám Tổng Quát' },
];

interface ConfuseSectionProps {
  painPointsConfig?: PainPointsBlockConfig;
  videoHeadings?: {
    titleDesktop?: string;
    titleMobile?: string;
  };
  videoList?: Array<{ id: string; title: string }>;
}

/**
 * ConfuseSection — Exact forensic visual reconstruction of original section_294013533 (.section-confuse)
 * Matches original WordPress/Flatsome layout, 1080px row grid, typography, and spacing.
 */
export function ConfuseSection({
  painPointsConfig,
  videoHeadings,
  videoList,
}: ConfuseSectionProps = {}) {
  const painPoints = painPointsConfig?.items || defaultPainPoints;
  const painPointsTitle = painPointsConfig?.title || 'Tầm Soát Bệnh – Một Khởi Đầu Thông Thái Cho Năm Mới';
  const painPointsSubtitle = painPointsConfig?.subtitle || 'Gỡ Bỏ 4 “Nỗi Lo” Khiến Bạn Chần Chừ Trước Khi Quyết Định Đi Tầm Soát Bệnh';
  const videos = videoList || defaultVideos;
  const videoTitleDesktop = videoHeadings?.titleDesktop || 'Kiểm Chứng Ngay Qua\nNhững Chia Sẻ Từ Khách Hàng';
  const videoTitleMobile = videoHeadings?.titleMobile || 'Mời bạn lắng nghe những chia sẻ từ những khách hàng đã trải nghiệm';

  // Start with index 6 ([Chỉ 60 Phút] Trải Nghiệm Tầm Soát) matching reference web mockup
  const [activeSlide, setActiveSlide] = useState(6);
  const [modalVideoId, setModalVideoId] = useState<string | null>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);

  // Auto-play every 6 seconds (matching original Flickity autoPlay: 6000)
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        setActiveSlide((prev) => (prev + 1) % videos.length);
      }
    }, 6000);
  }, [videos.length]);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [startAutoPlay]);

  const goToSlide = useCallback((index: number) => {
    setActiveSlide(index);
    startAutoPlay();
  }, [startAutoPlay]);

  // Compute visible slides: show 3 on desktop (prev, active, next)
  const prevIndex = (activeSlide - 1 + videos.length) % videos.length;
  const nextIndex = (activeSlide + 1) % videos.length;

  return (
    <section className="section section-confuse" id="section_294013533">
      <div className="section-bg fill" />

      <div className="section-content relative" style={{ width: '100%' }}>

        {/* ===== Part 1: Concerns (original rows within section-confuse) ===== */}

        {/* Main Title with dc-title bluesky decoration */}
        <div id="text-3883347502" className="text dc-title bluesky">
          <h1>
            {painPointsTitle}
          </h1>
          <div className="dc-title-decoration" aria-hidden="true">
            <span className="dc-pill" />
            <span className="dc-dot" />
          </div>
        </div>

        {/* Row: Subtitle + 4 Number Boxes in original 1080px row */}
        <div className="row row-confuse-cards" id="row-64855036">
          <div id="col-1356688087" className="col small-12 large-12">
            <div className="col-inner">
              {/* Subtitle */}
              <div id="text-62814145" className="text confuse-subtitle">
                <h2 className="capitalize">
                  {painPointsSubtitle}
                </h2>
              </div>
            </div>
          </div>

          {/* 4 Concern Cards: 4 columns on desktop (large-3), 2 columns on mobile (small-6) */}
          {painPoints.map((item) => (
            <div key={item.num} className="col medium-6 small-6 large-3 col-number-card">
              <div className="col-inner">
                <div className="text-center number-box">
                  <p className="number-wrap">
                    <span className="number">{item.num}</span>
                  </p>
                  <p className="title">{item.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ===== Part 2: Video Testimonials (original row-1385660731 + slider) ===== */}

        {/* Video Section Heading */}
        <div
          className="row row-collapse align-middle align-center video-heading"
          id="row-1385660731"
          style={{ maxWidth: 1080, margin: '15px auto 25px', paddingLeft: 15, paddingRight: 15 }}
        >
          <div className="col small-12 large-12">
            <div className="col-inner">
              {/* Mobile heading */}
              <div className="text show-for-small" style={{ textAlign: 'center' }}>
                <h2 className="capitalize">
                  {videoTitleMobile}
                </h2>
              </div>
              {/* Desktop heading */}
              <div className="text hide-for-small" style={{ textAlign: 'center' }}>
                <h2 style={{ whiteSpace: 'pre-line' }}>
                  {videoTitleDesktop}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Video Carousel (Flickity-style 3-card focus slider) */}
        <div
          className="row row-collapse align-middle align-center"
          id="row-1690800079"
          style={{ maxWidth: 1080, margin: '0 auto', paddingLeft: 15, paddingRight: 15 }}
          onMouseEnter={() => { isPausedRef.current = true; }}
          onMouseLeave={() => { isPausedRef.current = false; }}
        >
          <div className="col small-12 large-12">
            <div className="col-inner">
              <div className="confuse-slider">
                <div className="confuse-slider-track">
                  {/* Show 3 slides: previous, active, next */}
                  {[prevIndex, activeSlide, nextIndex].map((videoIdx, pos) => {
                    const video = videos[videoIdx];
                    const isCenter = pos === 1;
                    return (
                      <div
                        key={`${video.id}-${pos}`}
                        className={`confuse-slider-item ${isCenter ? 'is-selected' : ''}`}
                        onClick={() => {
                          if (isCenter) {
                            setModalVideoId(video.id);
                          } else if (pos === 0) {
                            goToSlide(prevIndex);
                          } else {
                            goToSlide(nextIndex);
                          }
                        }}
                        style={{ width: 340, flexShrink: 0, padding: '0 8px', cursor: 'pointer' }}
                      >
                        <div
                          className="video video-fit"
                          style={{
                            width: '100%', paddingTop: '120%',
                            position: 'relative',
                            background: '#111',
                            borderRadius: 16,
                            overflow: 'hidden',
                            boxShadow: isCenter
                              ? '0 16px 40px rgba(0,0,0,0.35)'
                              : '0 6px 20px rgba(0,0,0,0.18)',
                            transition: 'all 0.35s ease',
                          }}
                        >
                          {/* YouTube thumbnail background */}
                          <Image
                            src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                            alt={video.title}
                            fill
                            sizes="320px"
                            unoptimized
                            style={{
                              objectFit: 'cover',
                              objectPosition: 'center',
                            }}
                          />

                          {/* Top Bar Overlay */}
                          {isCenter ? (
                            /* Center card top channel header */
                            <div
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                padding: '12px 14px',
                                background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)',
                                zIndex: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  background: '#FFB500',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#005570',
                                  fontWeight: 800,
                                  fontSize: 11,
                                  flexShrink: 0,
                                }}
                              >
                                DC
                              </div>
                              <div style={{ overflow: 'hidden' }}>
                                <div
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: '#fff',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                                  }}
                                >
                                  {video.title}
                                </div>
                                <div
                                  style={{
                                    fontSize: 10,
                                    color: 'rgba(255,255,255,0.85)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  Doctor Check - Tầm Soát Bệnh Để Sống Thọ Hơn
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Side cards top-left Shorts badge */
                            <div
                              style={{
                                position: 'absolute',
                                top: 14,
                                left: 14,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                zIndex: 3,
                                color: '#fff',
                                fontSize: 13,
                                fontWeight: 700,
                                textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                              }}
                            >
                              <svg width="18" height="22" viewBox="0 0 24 24" fill="#ff0000">
                                <path d="M17.77 10.32l-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.94c-1.84.96-2.53 3.23-1.56 5.06s3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.07-2.04 2-3.49-.07-1.42-.93-2.67-2.24-3.25zM10 14.65v-5.3L15 12l-5 2.65z" />
                              </svg>
                              <span>Shorts</span>
                            </div>
                          )}

                          {/* YouTube Shorts Center Play Button */}
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 3,
                              pointerEvents: 'none',
                            }}
                          >
                            <div
                              style={{
                                width: isCenter ? 54 : 46,
                                height: isCenter ? 54 : 46,
                                borderRadius: 16,
                                backgroundColor: '#ff0000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.45)',
                                transition: 'transform 0.2s ease',
                              }}
                            >
                              <svg width={isCenter ? 24 : 20} height={isCenter ? 24 : 20} viewBox="0 0 24 24" fill="white">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>

                          {/* Bottom metadata overlay */}
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              padding: '24px 14px 12px',
                              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)',
                              color: '#fff',
                              zIndex: 3,
                            }}
                          >
                            {/* Channel row for side cards */}
                            {!isCenter && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                <div
                                  style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    background: '#ffb500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#005570',
                                    fontWeight: 800,
                                    fontSize: 9,
                                    flexShrink: 0,
                                  }}
                                >
                                  DC
                                </div>
                                <span
                                  style={{
                                    fontSize: 10.5,
                                    fontWeight: 500,
                                    color: 'rgba(255,255,255,0.9)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  Doctor Check - Tầm Soát Bệnh Để Sống Thọ Hơn
                                </span>
                              </div>
                            )}

                            {/* Title */}
                            <p
                              style={{
                                margin: 0,
                                fontSize: 11.5,
                                fontWeight: 600,
                                color: '#fff',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                marginBottom: isCenter ? 8 : 0,
                              }}
                            >
                              {video.title}
                            </p>

                            {/* Bottom Actions on Center Card (Share, Watch later, Watch on YouTube) */}
                            {isCenter && (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  paddingTop: 6,
                                  borderTop: '1px solid rgba(255,255,255,0.15)',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  {/* Share icon */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (typeof navigator !== 'undefined' && navigator.share) {
                                        navigator.share({
                                          title: video.title,
                                          url: `https://www.youtube.com/shorts/${video.id}`,
                                        }).catch(() => {});
                                      }
                                    }}
                                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
                                    aria-label="Chia sẻ"
                                  >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <circle cx="18" cy="5" r="3" />
                                      <circle cx="6" cy="12" r="3" />
                                      <circle cx="18" cy="19" r="3" />
                                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                                    </svg>
                                  </button>

                                  {/* Clock icon */}
                                  <span style={{ color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center' }}>
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <circle cx="12" cy="12" r="10" />
                                      <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                  </span>
                                </div>

                                {/* Watch on YouTube button */}
                                <a
                                  href={`https://www.youtube.com/shorts/${video.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    fontSize: 10,
                                    fontWeight: 600,
                                    color: '#fff',
                                    textDecoration: 'none',
                                    padding: '3px 8px',
                                    background: 'rgba(0,0,0,0.5)',
                                    borderRadius: 4,
                                    backdropFilter: 'blur(4px)',
                                  }}
                                >
                                  <span>Watch on</span>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontWeight: 700 }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff0000">
                                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                    </svg>
                                    YouTube
                                  </span>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pagination Dots */}
              <div className="confuse-slider-dots">
                {videos.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToSlide(i)}
                    className={activeSlide === i ? 'active' : ''}
                    aria-label={`Chuyển đến video ${i + 1}`}
                  />
                ))}
              </div>
            </div>
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
