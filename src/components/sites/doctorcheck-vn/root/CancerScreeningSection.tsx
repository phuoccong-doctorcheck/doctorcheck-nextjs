import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CancerScreeningBlockConfig } from '@/lib/data/homepage';

interface CancerScreeningSectionProps {
  config?: CancerScreeningBlockConfig;
}

export function CancerScreeningSection({ config }: CancerScreeningSectionProps = {}) {
  const title = config?.title || 'Thế giới khuyến cáo tầm\nsoát ung thư định kỳ';
  const description = config?.description || '80% Khách Hàng sau khi đăng ký tầm soát bệnh tại Doctor Check lựa chọn sử dụng thêm các dịch vụ tầm soát, bao gồm tầm soát ung thư thực quản – dạ dày – tá tràng, tầm soát ung thư đại – trực tràng, tầm soát chuyên sâu bệnh lý gan hay tầm soát yếu tố nguy cơ đột quỵ.';
  const ctaUrl = config?.ctaUrl || '/tam-soat-ung-thu/';
  const ctaLabel = config?.ctaLabel || 'Gói tầm soát ung thư khác';
  const card1 = config?.featuredCards?.[0] || {
    id: 'stomach',
    title: 'Tầm soát ung thư\nthực quản – dạ dày –\ntá tràng',
    price: '3.100.000đ',
    slug: '/tam-soat-ung-thu-da-day/',
  };
  const card2 = config?.featuredCards?.[1] || {
    id: 'colon',
    title: 'Tầm soát ung thư đại\ntràng – trực tràng',
    price: '4.100.000đ',
    slug: '/tam-soat-ung-thu-dai-trang/',
  };

  return (
    <section
      className="section section-suggest py-8 md:py-14 bg-[#FDFDF6] relative overflow-hidden"
      id="section_991765975"
    >
      <div className="container max-w-[1240px] mx-auto px-4 md:px-6">
        {/* Main Dark Teal Banner Container */}
        <div className="bg-[#005570] rounded-[20px] md:rounded-[24px] p-6 sm:p-8 md:p-10 lg:p-12 shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Heading, Description, and Desktop CTA */}
            <div className="lg:col-span-6 flex flex-col justify-center text-left">
              {/* Heading */}
              <h2 className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-[#FFB500] leading-[1.3] mb-4 text-center lg:text-left" style={{ whiteSpace: 'pre-line' }}>
                {title}
              </h2>

              {/* Description */}
              <p className="text-[15.5px] sm:text-[16.5px] md:text-[17.5px] text-white leading-[1.6] mb-6 md:mb-8 font-normal text-left">
                {description}
              </p>

              {/* Desktop CTA Button */}
              <div className="hidden lg:block">
                <Link
                  href={ctaUrl}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#005570] hover:bg-gray-100 font-bold text-[14.5px] rounded-full shadow-sm transition-all duration-200"
                >
                  <span>{ctaLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Column: 2 Specialized Package Cards with Overlapping Badges */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-6 pt-4 sm:pt-6">
                {/* Card 1: Dạ dày */}
                <div className="relative bg-white rounded-[16px] p-5 pt-8 md:pt-10 flex flex-col justify-between shadow-[0_8px_20px_rgba(0,0,0,0.12)] min-h-[220px] transition-transform duration-300 hover:-translate-y-1">
                  {/* Floating Circular Icon Badge */}
                  <div className="absolute -top-7 left-4 w-[68px] h-[68px] md:w-[74px] md:h-[74px] rounded-full bg-[#23748A] border-[6px] border-[#005570] flex items-center justify-center shadow-md z-10">
                    <svg
                      width="34"
                      height="36"
                      viewBox="0 0 55 59"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-white"
                    >
                      <path
                        d="M48.9486 37.9324C48.5273 37.6999 48.5489 37.5291 48.7078 37.1519C50.9457 31.8176 51.6835 26.3171 50.3685 20.6365C49.3051 16.0397 47.1598 12.0371 43.4819 8.97506C40.6437 6.61198 37.3655 5.28959 33.6537 5.09099C31.3452 4.96339 29.038 5.36467 26.9091 6.26407C26.3884 6.49288 25.8244 6.60705 25.2555 6.59881C24.6866 6.59058 24.1262 6.46013 23.6124 6.21634C20.3034 4.71229 17.1688 2.89879 14.3305 0.620382C13.1977 -0.287903 11.9877 -0.201691 11.02 0.891329C10.1968 1.8263 9.37986 2.76999 8.56907 3.72241C7.535 4.94166 7.6739 6.21172 8.94411 7.20468C10.0337 8.05549 11.1275 8.90117 12.2253 9.74172C13.8706 11.0041 15.5714 12.2049 16.8277 13.8983C19.5502 17.573 20.5226 21.6726 19.7601 26.1616C19.2971 28.8403 18.4205 31.3804 16.8169 33.6219C15.8801 34.932 14.7303 35.9819 13.1128 36.3929C11.6867 36.7516 10.2899 36.4145 8.89318 36.1512C7.802 35.9449 6.72472 35.5632 5.60114 35.6894C3.27526 35.9357 1.66088 37.2027 0.744112 39.321C-0.15568 41.4008 -0.104749 43.593 0.205471 45.7713C0.779609 49.8017 2.16865 53.5749 3.96207 57.2142C4.35717 58.0147 4.84643 58.6721 5.69529 59.0092H11.7006C12.1582 58.944 12.5775 58.718 12.8828 58.3719C13.5604 57.5837 13.6375 56.7123 13.2517 55.7887C12.4408 53.8368 11.8176 51.8126 11.3904 49.7432C11.2453 49.0489 11.1033 48.3577 11.0215 47.6464C10.9845 47.3262 11.0956 47.2539 11.3734 47.4017C11.4583 47.4463 11.5401 47.4971 11.6234 47.5448C16.0344 50.0172 20.788 51.2996 25.8225 51.5474C27.9575 51.6368 30.0956 51.4776 32.1936 51.0733C32.6844 50.9824 32.9329 51.084 33.0996 51.5721C33.7616 53.5735 35.002 55.335 36.6648 56.6354C38.344 57.9485 40.1714 58.9292 42.383 58.9446C42.5868 58.9723 42.8013 58.883 43.0004 59.0031H44.2706C44.3597 58.9568 44.4587 58.9326 44.5592 58.9326C44.6597 58.9326 44.7587 58.9568 44.8478 59.0031H45.0793C45.1133 58.9184 45.1889 58.9138 45.2661 58.9045C47.0256 58.7025 48.7073 58.0677 50.1602 57.0572C51.6731 56.0198 52.9053 54.6251 53.747 52.9976C53.9445 52.6235 53.9769 52.2664 53.7161 51.92C53.4969 51.6306 53.179 51.5659 52.8348 51.6259C52.4181 51.6983 52.2715 52.0431 52.0925 52.3618C51.1963 54.0055 49.8263 55.3431 48.1598 56.2019C46.4932 57.0606 44.6067 57.4009 42.7442 57.1788C37.4134 56.563 33.6382 51.6706 34.4593 46.4025C35.3992 40.3155 41.9154 36.7255 47.5642 39.1824C51.1772 40.7527 53.3658 44.2627 53.2516 48.3145C53.2315 49.0566 53.5047 49.4276 54.0834 49.4414C54.6236 49.4538 54.9817 49.0966 54.9956 48.4839C55.1005 43.7639 53.0926 40.2293 48.9486 37.9324Z"
                        fill="white"
                      />
                    </svg>
                  </div>

                  {/* Card Body */}
                  <div className="mb-4">
                    <h3 className="text-[#005570] font-bold text-[17.5px] sm:text-[18px] leading-snug mb-2" style={{ whiteSpace: 'pre-line' }}>
                      {card1.title}
                    </h3>
                    <p className="text-[#1F2937] font-bold text-[18px] sm:text-[19px]">
                      {card1.price}
                    </p>
                  </div>

                  {/* Card Action */}
                  <div>
                    <Link
                      href={card1.slug}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#D1D5DB] text-[#005570] hover:bg-[#005570] hover:text-white text-[13.5px] font-semibold transition-all duration-200"
                    >
                      <span>Xem chi tiết</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Card 2: Đại tràng */}
                <div className="relative bg-white rounded-[16px] p-5 pt-8 md:pt-10 flex flex-col justify-between shadow-[0_8px_20px_rgba(0,0,0,0.12)] min-h-[220px] transition-transform duration-300 hover:-translate-y-1">
                  {/* Floating Circular Icon Badge */}
                  <div className="absolute -top-7 left-4 w-[68px] h-[68px] md:w-[74px] md:h-[74px] rounded-full bg-[#23748A] border-[6px] border-[#005570] flex items-center justify-center shadow-md z-10">
                    <svg
                      width="34"
                      height="34"
                      viewBox="0 0 55 55"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-white"
                    >
                      <path
                        d="M54.7434 36.702C55.0831 35.003 55.1061 33.3054 54.6574 31.6193C54.5872 31.3434 54.5872 31.0543 54.6574 30.7784C55.1319 28.6682 55.2007 26.5752 54.3106 24.5396C54.251 24.4107 54.2202 24.2704 54.2202 24.1284C54.2202 23.9865 54.251 23.8462 54.3106 23.7173C54.6604 22.8977 54.8753 22.0269 54.947 21.1387C55.119 18.7721 54.8036 16.5345 53.29 14.6091C52.9317 14.1507 52.9288 13.7654 53.1352 13.2425C54.2389 10.4547 53.8519 7.8217 52.1993 5.35341C51.9976 5.05913 51.8234 4.74695 51.679 4.42082C50.9967 2.83641 49.9059 1.56861 48.3565 0.846604C45.7636 -0.361039 43.1692 -0.332392 40.7225 1.30788C40.314 1.5815 39.97 1.65886 39.4898 1.47979C37.0947 0.585877 34.7598 0.763515 32.6098 2.15309C31.7814 2.6903 31.2166 2.69316 30.3308 2.28345C28.1608 1.28066 25.9577 1.42392 23.8593 2.6201C23.544 2.79917 23.286 2.81779 22.9807 2.59002C20.6443 0.870955 18.1073 0.49133 15.3754 1.49125C15.1895 1.57481 14.9842 1.60564 14.782 1.58038C14.5797 1.55511 14.3883 1.47472 14.2287 1.348C13.2369 0.651776 12.1633 0.141785 10.9163 0.110269C9.73951 0.0787531 8.56274 0.0200198 7.42181 0.434028C6.09706 0.902051 4.94688 1.76321 4.12513 2.90231C3.27825 4.11543 2.54145 5.40173 1.92353 6.74586C0.811261 9.06946 0.875767 11.4446 1.9823 13.7783C2.0588 13.9085 2.09133 14.0599 2.07507 14.21C2.05881 14.3602 1.99462 14.5011 1.892 14.612C0.859999 15.9013 0.11466 17.3181 -0.0114738 19.0013V20.5012C0.031774 20.6029 0.0540692 20.7123 0.0540692 20.8228C0.0540692 20.9334 0.031774 21.0427 -0.0114738 21.1444V21.4653C0.0888598 22.2418 0.216427 23.0111 0.561861 23.723C0.594369 23.7875 0.611307 23.8586 0.611307 23.9308C0.611307 24.0029 0.594369 24.0741 0.561861 24.1385C0.210693 24.8548 0.0831264 25.6197 -0.0114738 26.3948V28.8602C0.0945931 29.4146 0.106063 29.9862 0.313896 30.5234C0.364029 30.6593 0.364029 30.8086 0.313896 30.9445C0.108929 31.5176 0.0988903 32.1278 -0.0143433 32.7166V34.4357C0.097457 34.6162 0.0157589 34.8139 0.041559 35.0087C0.0132642 35.4553 0.0617434 35.9035 0.184893 36.3338C1.00046 38.9396 2.66027 40.8177 5.18581 41.8592C5.91394 42.16 6.29378 42.564 6.47581 43.3247C6.87285 44.9812 7.63316 46.5289 8.70179 47.8558C9.27512 48.5907 9.96456 49.1451 10.9249 49.3314C13.2182 49.7611 15.308 47.7011 14.8551 45.4635C14.7032 44.7042 14.3004 44.0825 13.8604 43.4693C13.2168 42.574 13.3186 42.1041 14.266 41.577C15.2909 41.0174 16.1763 40.2339 16.856 39.2849C18.5101 36.9584 18.8283 34.4357 17.8594 31.7597C17.692 31.3462 17.692 30.8839 17.8594 30.4704C18.2363 29.5211 18.4208 28.5065 18.4021 27.4855C18.3834 26.4644 18.1619 25.4572 17.7504 24.5224C17.6612 24.3297 17.6159 24.1196 17.6179 23.9073C17.6199 23.6949 17.6691 23.4857 17.7619 23.2947C18.1942 22.3486 18.4031 21.3159 18.3725 20.2763C18.3567 19.8766 18.4829 19.7033 18.9086 19.6746C20.0165 19.5815 21.1073 19.3624 22.102 18.8366C22.5321 18.6074 22.8804 18.6317 23.2889 18.8996C24.5053 19.7028 25.9318 20.1294 27.3896 20.1259C28.9172 20.1387 30.4141 19.6969 31.6896 18.8567C31.9548 18.6848 32.2142 18.5544 32.5353 18.7234C33.6447 19.3093 34.8415 19.583 36.08 19.6904C36.3967 19.7176 36.5214 19.8637 36.51 20.1674C36.477 21.6114 36.8554 22.9566 37.4989 24.2359C37.5633 24.3449 37.596 24.4696 37.5935 24.5961C37.5909 24.7226 37.5533 24.8459 37.4846 24.9522C36.3738 26.7973 35.9538 28.7799 36.315 30.913C36.3795 31.2898 36.2648 31.4703 35.8735 31.5333C35.0928 31.6466 34.3375 31.8933 33.6404 32.2625C33.2333 32.4831 32.8908 32.4616 32.4851 32.2539C30.783 31.3731 28.8201 31.1356 26.9568 31.5849C20.8995 32.9659 18.1589 39.7948 21.6534 44.9492C21.9015 45.2952 22.0841 45.6836 22.1924 46.0952C22.5372 47.6101 23.4177 48.9495 24.672 49.8671C25.1966 50.2525 25.4489 50.6608 25.3572 51.2997C25.3427 51.4426 25.3427 51.5866 25.3572 51.7295C25.4489 53.4686 26.4107 54.6332 28.0805 55.0243H29.3705C29.7188 54.9011 30.1115 54.9685 30.4398 54.7378C31.317 54.1404 31.9462 53.3869 32.1139 52.3025C32.1857 51.8285 32.2159 51.3492 32.2042 50.8699C32.1909 50.7275 32.2171 50.5842 32.2801 50.4558C32.3431 50.3274 32.4403 50.2189 32.5611 50.1422C33.1938 49.7069 33.7543 49.1751 34.2223 48.5664C34.2964 48.4559 34.4058 48.3739 34.5327 48.3338C34.6595 48.2937 34.7962 48.2979 34.9204 48.3458C37.1664 48.9288 39.3451 48.7956 41.4191 47.6854C41.7545 47.5063 42.0484 47.5421 42.3809 47.7111C43.555 48.3298 44.8592 48.6612 46.1864 48.6781C49.5089 48.7025 52.0272 47.2742 53.806 44.5122C55.1591 42.4093 55.1476 40.0957 54.7305 37.7434C54.6642 37.399 54.6686 37.0447 54.7434 36.702Z"
                        fill="white"
                      />
                    </svg>
                  </div>

                  {/* Card Body */}
                  <div className="mb-4">
                    <h3 className="text-[#005570] font-bold text-[17.5px] sm:text-[18px] leading-snug mb-2" style={{ whiteSpace: 'pre-line' }}>
                      {card2.title}
                    </h3>
                    <p className="text-[#1F2937] font-bold text-[18px] sm:text-[19px]">
                      {card2.price}
                    </p>
                  </div>

                  {/* Card Action */}
                  <div>
                    <Link
                      href={card2.slug}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#D1D5DB] text-[#005570] hover:bg-[#005570] hover:text-white text-[13.5px] font-semibold transition-all duration-200"
                    >
                      <span>Xem chi tiết</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile CTA Button (Shown at bottom on mobile) */}
            <div className="block lg:hidden w-full text-center mt-2">
              <Link
                href={ctaUrl}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-[1.5px] border-white text-white hover:bg-white hover:text-[#005570] font-bold text-[15px] rounded-full w-full max-w-[320px] mx-auto transition-all duration-200 shadow-sm"
              >
                <span>{ctaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
