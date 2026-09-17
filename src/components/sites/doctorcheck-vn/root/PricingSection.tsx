'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface PackageCard {
  id: string;
  slug: string;
  name: string;
  price: string;
  sub: string;
  image: string;
}

export function PricingSection() {
  const [activeTab, setActiveTab] = useState<'male' | 'female'>('male');

  const malePackages: PackageCard[] = [
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

  const femalePackages: PackageCard[] = [
    {
      id: 'khuyen-cao-nu',
      slug: '/goi-khuyen-cao-danh-cho-nu/',
      name: 'Gói Khuyến cáo',
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
      name: 'Gói Sống thọ',
      price: '14,500,000đ',
      sub: '31 Nhóm bệnh & 10 loại ung thư',
      image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/f298c0dc-622c-4fc2-8f74-e4d83e1d5300/w=625,h=400',
    },
  ];

  const currentPackages = activeTab === 'male' ? malePackages : femalePackages;
  const moreUrl = activeTab === 'male' ? '/goi-tam-soat-nam/' : '/goi-tam-soat-nu/';

  return (
    <section className="section section-service circle-blur py-8 md:py-12 bg-[#FDFDF6] relative overflow-hidden" id="section_1936328654">
      <div className="section-bg fill" />

      <div className="section-content relative container max-w-[1250px] mx-auto px-[15px]">
        {/* Title */}
        <div className="row row-collapse mb-6" id="row-1533827202">
          <div id="col-1921520671" className="col small-12 large-12">
            <div className="col-inner">
              <div id="text-3123085160" className="text text-center">
                <h2 className="text-[#005570] font-bold text-xl sm:text-2xl md:text-[1.3rem]" style={{ textAlign: 'center', margin: 0 }}>
                  Bảng Giá Các Gói Khám Tổng Quát tại Doctor Check
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Content */}
        <div className="row row-collapse" id="row-361714631">
          <div id="col-185119712" className="col small-12 large-12">
            <div className="col-inner">
              <div className="tabbed-content">
                {/* Authentic Flatsome Tabs */}
                <ul className="nav nav-simple nav-normal nav-size-normal nav-center flex justify-center gap-8 border-b border-gray-200 mb-8 list-none p-0" role="tablist">
                  <li
                    id="tab-dành-cho-nam"
                    className={`tab cursor-pointer pb-2.5 transition-all ${
                      activeTab === 'male'
                        ? 'active border-b-2 border-[#005570]'
                        : 'hover:text-[#005570]'
                    }`}
                    role="presentation"
                    onClick={() => setActiveTab('male')}
                  >
                    <button type="button" className="bg-transparent border-none cursor-pointer p-0">
                      <h3 className={`text-base sm:text-lg font-bold ${activeTab === 'male' ? 'text-[#005570]' : 'text-gray-500'}`}>
                        Dành Cho Nam
                      </h3>
                    </button>
                  </li>
                  <li
                    id="tab-dành-cho-nữ"
                    className={`tab cursor-pointer pb-2.5 transition-all ${
                      activeTab === 'female'
                        ? 'active border-b-2 border-[#005570]'
                        : 'hover:text-[#005570]'
                    }`}
                    role="presentation"
                    onClick={() => setActiveTab('female')}
                  >
                    <button type="button" className="bg-transparent border-none cursor-pointer p-0">
                      <h3 className={`text-base sm:text-lg font-bold ${activeTab === 'female' ? 'text-[#005570]' : 'text-gray-500'}`}>
                        Dành Cho Nữ
                      </h3>
                    </button>
                  </li>
                </ul>

                {/* 3 Package Cards */}
                <div className="tab-panels">
                  <div className="panel active entry-content">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {currentPackages.map((pkg) => (
                        <div key={pkg.id} className="col-inner">
                          <div className="box has-hover box-text-bottom bg-white rounded-lg overflow-hidden border border-[#E0F2F7] shadow-sm hover:shadow-md transition-shadow">
                            {/* Card Image */}
                            <div className="box-image relative aspect-[625/400] w-full overflow-hidden">
                              <Link href={pkg.slug}>
                                <Image
                                  src={pkg.image}
                                  alt={pkg.name}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 380px"
                                  className="object-cover object-center hover:scale-103 transition-transform duration-300"
                                />
                              </Link>
                            </div>

                            {/* Card Text */}
                            <div className="box-text text-center p-5">
                              <div className="box-text-inner">
                                <Link
                                  className="button primary is-link lowercase inline-flex items-center gap-1 text-sm font-bold text-[#005570] hover:text-[#FFB500] mb-3 transition-colors"
                                  href={pkg.slug}
                                >
                                  <span>Xem chi tiết</span>
                                  <ChevronRight className="w-4 h-4" />
                                </Link>

                                <div className="box-service">
                                  <div className="box-content">
                                    <h3 className="text-lg font-bold text-[#005570] mb-1">
                                      {pkg.name}
                                    </h3>
                                    <p className="mb-2">
                                      <span className="woocommerce-Price-amount amount text-xl sm:text-2xl font-black text-[#005570]">
                                        <bdi>{pkg.price}</bdi>
                                      </span>
                                    </p>
                                  </div>
                                  <div className="box-sub text-xs sm:text-sm text-[#4D5565] border-t border-gray-100 pt-2">
                                    <p><strong>{pkg.sub}</strong></p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Find Out More Button */}
                    <div className="row row-collapse align-middle align-center mt-8">
                      <div className="col small-12 large-12 text-center">
                        <div className="col-inner text-center">
                          <Link
                            href={moreUrl}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-[#005570] hover:bg-[#00475B] text-white font-bold text-sm shadow-md transition-all"
                            style={{ borderRadius: '99px' }}
                          >
                            <span>Tìm hiểu thêm</span>
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
