import React from 'react';
import Image from 'next/image';
import { Calendar } from 'lucide-react';

export function BannerCtaSection() {
  return (
    <section
      className="section section-banner-cta relative bg-white py-6 md:py-8"
      id="section_514095607"
    >
      <div className="container max-w-[1080px] mx-auto px-4">
        {/* Desktop Banner (hide-for-small) */}
        <div
          className="banner has-hover hide-for-small relative w-full aspect-[1709/795]"
          id="banner-1487577125"
        >
          <div className="banner-inner fill absolute inset-0">
            {/* Background image: dark teal card with nurse cutout protruding into top white space */}
            <div className="banner-bg fill absolute inset-0">
              <Image
                src="/sites/doctorcheck-vn/root/images/banner-cta-desktop.webp"
                alt="Doctor Check - Tầm Soát Bệnh Để Sống Thọ Hơn"
                fill
                priority
                sizes="(max-width: 1080px) 100vw, 1080px"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Banner layers overlay: 12-column grid matching Flatsome (5 cols left / 7 cols right) */}
            <div className="banner-layers container absolute inset-0 flex items-center justify-center pointer-events-none">
              <a
                href="#tu-van"
                className="fill banner-link absolute inset-0 pointer-events-auto"
                aria-label="Doctor Check - Tầm Soát Bệnh Để Sống Thọ Hơn"
              />

              <div className="w-full h-full flex items-center relative z-10">
                {/* Column 5/12 (~42%): Left space reserved for the nurse cutout */}
                <div className="w-[42%] h-full flex-shrink-0" />

                {/* Column 7/12 (~58%): Right space with centered content */}
                <div className="w-[58%] flex flex-col items-center justify-center text-center px-4 pt-[10%] pointer-events-auto">
                  {/* Brand Title */}
                  <div className="dc-title mb-2">
                    <span className="text-[#FFB500] font-bold text-lg md:text-[20px] lg:text-[22px] block tracking-wide">
                      Doctor Check
                    </span>
                    <h2 className="text-xl md:text-[24px] lg:text-[27px] font-bold text-white leading-tight mt-1 whitespace-nowrap">
                      Tầm Soát Bệnh Để Sống Thọ Hơn
                    </h2>
                  </div>

                  {/* Authentic DoctorCheck Yellow Pill + Dot Divider */}
                  <div className="flex items-center justify-center gap-1.5 my-2.5 md:my-3">
                    <span className="w-7 h-[5px] bg-[#FFB500] rounded-full inline-block" />
                    <span className="w-[5px] h-[5px] bg-[#FFB500] rounded-full inline-block" />
                  </div>

                  {/* Working hours */}
                  <div className="footer-cta-content text-white space-y-0.5 mb-3.5 md:mb-4">
                    <p className="font-bold text-white text-[14px] md:text-[15.5px]">
                      Thời gian làm việc
                    </p>
                    <p className="text-[13px] md:text-[14px] font-normal text-white">
                      Thứ 2 – Thứ 7: 6h – 15h
                    </p>
                    <p className="text-[13px] md:text-[14px] font-normal text-white">
                      Chủ nhật: 7h – 12h
                    </p>
                  </div>

                  {/* Action button */}
                  <a
                    href="#tu-van"
                    className="inline-flex items-center gap-2 px-6 md:px-7 py-2 md:py-2.5 rounded-full bg-[#FFB500] hover:bg-[#FFA800] text-white font-bold text-xs md:text-[14px] shadow transition-all duration-200"
                  >
                    <span>Đặt hẹn ngay</span>
                    <Calendar className="w-4 h-4 stroke-[2.2] text-white" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Banner (show-for-small) */}
        <div
          className="banner has-hover show-for-small relative w-full aspect-[545/963] rounded-[18px] overflow-hidden shadow-sm"
          id="banner-1858166176"
        >
          <div className="banner-inner fill absolute inset-0">
            <div className="banner-bg fill absolute inset-0">
              <Image
                src="/sites/doctorcheck-vn/root/images/banner-cta-mobile.webp"
                alt="Doctor Check - Tầm Soát Bệnh Để Sống Thọ Hơn"
                fill
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>

            <div className="banner-layers fill absolute inset-0 flex flex-col justify-start items-center pt-8 px-6 z-10">
              <div className="text-box text-center text-white w-full">
                <div className="dc-title mb-1.5">
                  <span className="text-[#FFB500] font-bold text-lg block">
                    Doctor Check
                  </span>
                  <h2 className="text-xl font-bold text-white leading-tight mt-1">
                    Tầm Soát Bệnh Để Sống Thọ Hơn
                  </h2>
                </div>

                {/* Yellow Pill + Dot Divider */}
                <div className="flex items-center justify-center gap-1.5 my-2.5">
                  <span className="w-6 h-1 bg-[#FFB500] rounded-full inline-block" />
                  <span className="w-1 h-1 bg-[#FFB500] rounded-full inline-block" />
                </div>

                <div className="footer-cta-content text-xs text-white space-y-0.5 mb-4">
                  <p className="font-bold text-white text-sm">Thời gian làm việc</p>
                  <p>Thứ 2 – Thứ 7: 6h – 15h</p>
                  <p>Chủ nhật: 7h – 12h</p>
                </div>

                <a
                  href="#tu-van"
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#FFB500] hover:bg-[#FFA800] text-white font-bold text-sm shadow transition-all duration-200"
                >
                  <span>Đặt hẹn ngay</span>
                  <Calendar className="w-4 h-4 stroke-[2.2] text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 549px) {
          #banner-1487577125 { display: none !important; }
          #banner-1858166176 { display: block !important; }
        }
        @media (min-width: 550px) {
          #banner-1858166176 { display: none !important; }
          #banner-1487577125 { display: block !important; }
        }
      `}</style>
    </section>
  );
}
