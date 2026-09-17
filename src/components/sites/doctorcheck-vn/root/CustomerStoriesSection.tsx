'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Play } from 'lucide-react';
import { VideoModal } from './VideoModal';

interface CustomerStory {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  videoId?: string;
}

export function CustomerStoriesSection() {
  const [modalVideoId, setModalVideoId] = useState<string | null>(null);

  const stories: CustomerStory[] = [
    {
      id: 'co-lien',
      slug: '/co-nguoi-nha-bi-ung-thu-dai-trang-co-lien-quyet-dinh-den-doctor-check-de-tam-soat-ung-thu/',
      title: 'Có Người Nhà Bị Ung Thư Đại Tràng, Cô Liên Quyết Định Đến Doctor Check Để Tầm Soát Ung Thư',
      excerpt: 'Có Người Nhà Bị Ung Thư Đại Tràng, Cô Liên Quyết Định Đến Doctor Check Để Tầm Soát Ung Thư! Cô Ngọc Liên, hiện đang sinh sống tại thành phố…',
      image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/c8f18d38-0720-41fa-89f9-8b088f3dbe00/w=1020,h=536',
      videoId: 'zRRzaw3rpis',
    },
    {
      id: 'chu-hong-anh',
      slug: '/bi-tieu-duong-26-nam-nen-chu-hong-anh-muon-kiem-tra-suc-khoe-dinh-ky/',
      title: 'Bị Tiểu Đường 26 Năm Nên Chú Hồng Anh Muốn Kiểm Tra Sức Khỏe Định Kỳ',
      excerpt: 'Chú Hồng Anh, 72 Tuổi, Tại TPHCM có mắc bệnh nền bị tiểu đường. Thế nên, hôm nay chú quyết định đến phòng khám Doctor Check để kiểm tra sức…',
      image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/a1c13271-35cc-4174-e705-b03beb227e00/w=1020,h=536',
      videoId: 'EpCHV3c2Ppw',
    },
    {
      id: 'an-khong-ngon',
      slug: '/gan-mot-thang-toi-an-khong-ngon-ngu-cung-khong-yen/',
      title: 'Gần một tháng, tôi ăn không ngon, ngủ cũng không yên.',
      excerpt: 'Thời gian đó, tôi ăn uống rất khó chịu. Ăn vào là buồn nôn, có lúc ói ra ngay. Ngay cả khi không ăn, cảm giác này vẫn còn.…',
      image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/c2435d61-05c2-492e-be58-c88a81822e00/w=800,h=800,fit=crop',
    },
  ];

  return (
    <section className="section section-customer py-8 md:py-12 bg-[#FDFDF6] relative overflow-hidden" id="section_1899109699">
      <div className="section-bg fill" />

      <div className="section-content relative container max-w-[1250px] mx-auto px-[15px]">
        {/* Section Header */}
        <div className="row row-collapse mb-8" id="row-1486690642">
          <div id="col-1949358024" className="col small-12 large-12 text-center">
            <div className="col-inner">
              <div id="text-2190861841" className="text mb-2">
                <h2 className="capitalize font-bold text-[#005570] text-xl sm:text-2xl md:text-[1.4rem]">
                  Hơn 10.000+ Khách hàng đã trải nghiệm hài lòng
                </h2>
              </div>

              <div id="text-96104712" className="text text-sm sm:text-base text-[#4D5565]">
                <p>
                  Dịch vụ tầm soát bệnh tại Doctor Check Nhanh chóng – Minh bạch – Hiệu quả – Thoải mái tối đa.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Story Cards Grid */}
        <div className="feedback-swiper-wrap mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div key={story.id} className="col-inner bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 flex flex-col justify-between transition-all">
                {/* Banner Thumbnail with Play Button */}
                <div className="banner has-hover relative aspect-[1020/536] w-full overflow-hidden bg-gray-100">
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover object-center"
                  />

                  {story.videoId && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setModalVideoId(story.videoId || null)}
                        aria-label={`Phát video: ${story.title}`}
                        className="w-12 h-12 rounded-full border-2 border-white bg-white/40 hover:bg-white/70 backdrop-blur-xs flex items-center justify-center text-white hover:text-[#005570] shadow-lg transition-all cursor-pointer"
                      >
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Content Box */}
                <div className="box-content p-5 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-bold text-[#005570] text-sm sm:text-base line-clamp-2 mb-2 leading-snug">
                      {story.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4D5565] line-clamp-3 mb-4 leading-relaxed">
                      {story.excerpt}
                    </p>
                  </div>

                  <div>
                    <Link
                      href={story.slug}
                      className="button primary is-outline lowercase inline-flex items-center gap-1 text-xs font-bold text-[#005570] hover:text-[#FFB500] transition-colors border border-[#005570] hover:border-[#FFB500] px-4 py-1.5 rounded-full"
                    >
                      <span>Xem thêm</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="row row-collapse text-center" id="row-1610115044">
          <div id="col-126886311" className="col small-12 large-12 text-center">
            <div className="col-inner text-center">
              <Link
                href="/cau-chuyen-khach-hang/"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#005570] hover:bg-[#00475B] text-white font-bold text-sm shadow-md transition-all"
                style={{ borderRadius: '99px' }}
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={!!modalVideoId}
        videoId={modalVideoId}
        onClose={() => setModalVideoId(null)}
      />
    </section>
  );
}
