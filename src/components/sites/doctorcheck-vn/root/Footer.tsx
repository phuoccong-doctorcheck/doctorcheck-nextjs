import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUp } from 'lucide-react';

export function Footer() {
  return (
    <footer id="footer" className="footer-wrapper bg-[#F6FDFF] text-[#000000] border-t border-gray-100">
      {/* Main Footer Content */}
      <section className="section py-12 md:py-16" id="section_2064860503">
        <div className="container max-w-[1140px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-8 lg:gap-10">
            {/* Column 1: Clinic Brand, Contact Info, Socials, License (4 cols = 33.3%) */}
            <div id="col-1880671518" className="md:col-span-12 lg:col-span-4">
              <div className="space-y-4">
                {/* Full Brand Logo */}
                <div className="mb-5">
                  <Link href="/" aria-label="Trang chủ Doctor Check">
                    <Image
                      src="/sites/doctorcheck-vn/root/images/Group-55.svg"
                      alt="Trung Tâm Nội Soi Tiêu Hoá Doctor Check"
                      width={260}
                      height={52}
                      className="w-[230px] md:w-[260px] h-auto object-contain"
                      priority
                    />
                  </Link>
                </div>

                {/* Contact Info List - 18px text */}
                <div className="space-y-3.5 text-[17px] md:text-[18px] text-[#000000]">
                  {/* Address */}
                  <div className="flex items-start gap-3 leading-[1.4]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 text-[#6495A7] flex-shrink-0 mt-0.5"
                      viewBox="0 0 24 24"
                      strokeWidth="1.6"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                      <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" />
                    </svg>
                    <span>
                      429 Tô Hiến Thành, Phường Diên Hồng,<br />
                      Thành phố Hồ Chí Minh
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 text-[#6495A7] flex-shrink-0"
                      viewBox="0 0 24 24"
                      strokeWidth="1.6"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
                    </svg>
                    <a href="tel:0939010101" className="text-[#005570] font-bold text-[18px] md:text-[19px] hover:underline">
                      0939 01 01 01
                    </a>
                  </div>

                  {/* Tax Code */}
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-6 h-6 text-[#6495A7] flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14 2V8H20"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 13H8"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 17H8"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 9H8"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>0316546123</span>
                  </div>
                </div>

                {/* Social Icons (Round Outlines) */}
                <div className="flex items-center gap-3 pt-2">
                  <a
                    href="https://www.facebook.com/share/mNJubMjo3VQunfUA/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="w-9 h-9 rounded-full border border-[#005570] text-[#005570] flex items-center justify-center hover:bg-[#005570] hover:text-white transition-colors"
                    aria-label="Theo dõi Doctor Check trên Facebook"
                  >
                    <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                      <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.6 5H18V0h-3.8C10.5 0 9 1.487 9 4.4V8z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.tiktok.com/@doctorcheck.vn?_t=ZS-8skph2ssdVp&_r=1"
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="w-9 h-9 rounded-full border border-[#005570] text-[#005570] flex items-center justify-center hover:bg-[#005570] hover:text-white transition-colors"
                    aria-label="Theo dõi Doctor Check trên TikTok"
                  >
                    <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.3 6.3 0 0 0 1.87-4.47V8.62a8.27 8.27 0 0 0 4.84 1.55V6.69z" />
                    </svg>
                  </a>
                  <a
                    href="https://youtube.com/@doctorcheckvn"
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="w-9 h-9 rounded-full border border-[#005570] text-[#005570] flex items-center justify-center hover:bg-[#005570] hover:text-white transition-colors"
                    aria-label="Theo dõi Doctor Check trên YouTube"
                  >
                    <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                </div>

                {/* License Section */}
                <div className="pt-3">
                  <h5 className="font-bold text-[#000000] text-[18px] md:text-[19px] mb-3">
                    Được cấp phép bởi Sở Y tế
                  </h5>
                  <a
                    href="https://medinet.hochiminhcity.gov.vn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block hover:opacity-90 transition-opacity"
                  >
                    <Image
                      src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/f3f3b7f7-c4ce-43c8-af24-519104db2300/w=138,h=138,fit=crop"
                      alt="Được cấp phép bởi Sở Y tế"
                      width={90}
                      height={90}
                      className="w-[85px] h-[85px] object-contain"
                    />
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: Service & Info Links (large-5 in Flatsome) */}
            <div id="col-1386977273" className="md:col-span-6 lg:col-span-4 xl:col-span-3">
              <div className="space-y-7">
                {/* Dịch vụ */}
                <div>
                  <h4 className="font-bold text-[#000000] text-[21px] md:text-[22px] mb-3.5">
                    Dịch vụ
                  </h4>
                  <ul className="space-y-2 text-[17px] md:text-[18px] text-[#000000] leading-snug">
                    <li><Link href="/goi-kham-danh-cho-nam/" className="hover:text-[#005570] transition-colors">Khám sức khỏe tổng quát cho nam</Link></li>
                    <li><Link href="/goi-kham-danh-cho-nu/" className="hover:text-[#005570] transition-colors">Khám sức khỏe tổng quát cho nữ</Link></li>
                    <li><Link href="/tam-soat-ung-thu/" className="hover:text-[#005570] transition-colors">Tầm soát ung thư</Link></li>
                    <li><Link href="/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/" className="hover:text-[#005570] transition-colors">Bảng giá Gói tầm soát</Link></li>
                    <li><Link href="/bang-gia-dich-vu/" className="hover:text-[#005570] transition-colors">Bảng giá dịch vụ</Link></li>
                    <li><Link href="/thuoc-va-vat-tu-y-te/" className="hover:text-[#005570] transition-colors">Bảng giá Thuốc và Vật tư y tế</Link></li>
                    <li><a href="https://www.noisoidaday.doctorcheck.vn/" target="_blank" rel="noopener noreferrer" className="hover:text-[#005570] transition-colors">Nội soi dạ dày chính xác</a></li>
                    <li><a href="https://noisoidaitrang.doctorcheck.vn/" target="_blank" rel="noopener noreferrer" className="hover:text-[#005570] transition-colors">Nội soi đại tràng chính xác</a></li>
                  </ul>
                </div>

                {/* Tìm hiểu thêm */}
                <div>
                  <h4 className="font-bold text-[#000000] text-[21px] md:text-[22px] mb-3.5">
                    Tìm hiểu thêm
                  </h4>
                  <ul className="space-y-2 text-[17px] md:text-[18px] text-[#000000] leading-snug">
                    <li><Link href="/ve-chung-toi/" className="hover:text-[#005570] transition-colors">Về chúng tôi</Link></li>
                    <li><Link href="/doi-ngu-bac-si/" className="hover:text-[#005570] transition-colors">Đội ngũ Bác sĩ</Link></li>
                    <li><Link href="/cau-chuyen-khach-hang/" className="hover:text-[#005570] transition-colors">Câu chuyện khách hàng</Link></li>
                    <li><Link href="/bi-quyet-song-tho/" className="hover:text-[#005570] transition-colors">Kiến thức sống thọ</Link></li>
                    <li><a href="https://medinet.hochiminhcity.gov.vn/tin-tuc-su-kien-c1780.aspx" target="_blank" rel="noopener noreferrer" className="hover:text-[#005570] transition-colors">Tin tức y khoa</a></li>
                    <li className="pt-2"><Link href="/lien-he/" className="hover:text-[#005570] transition-colors">Liên hệ hỗ trợ</Link></li>
                    <li><Link href="/chinh-sach-quyen-rieng-tu/" className="hover:text-[#005570] transition-colors">Chính sách quyền riêng tư</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Column 3: App Download & Partners (large-7 in Flatsome) */}
            <div id="col-2020056232" className="md:col-span-6 lg:col-span-4 xl:col-span-5">
              <div className="space-y-7">
                {/* Tải ứng dụng Doctor Check */}
                <div>
                  <h4 className="font-bold text-[#000000] text-[21px] md:text-[22px] mb-3.5">
                    Tải ứng dụng Doctor Check
                  </h4>
                  <p className="text-[17px] md:text-[18px] text-[#000000] leading-relaxed mb-5">
                    Quét mã QR bên dưới để tải nhanh nhất. App Doctor Check Member giúp bạn đặt lịch nhanh chóng, lưu trữ hồ sơ sức khỏe &amp; để Doctor Check đồng hành cùng bạn trong suốt hành trình sống thọ.
                  </p>

                  <div className="flex items-center gap-5">
                    {/* QR Code */}
                    <div className="w-[125px] h-[125px] bg-white p-2 rounded-lg border border-gray-200 shadow-2xs flex-shrink-0">
                      <Image
                        src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/ace98b0d-bbca-4754-79ee-051f8d1eed00/w=130,h=129"
                        alt="QR Code Doctor Check App"
                        width={110}
                        height={110}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* App Store / Google Play badges */}
                    <div className="flex flex-col gap-3">
                      <a
                        href="https://play.google.com/store/apps/details?id=vn.doctorcheck.member"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-90 transition-opacity"
                      >
                        <Image
                          src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/3ed80f1d-e6dd-4655-a6a4-4cc2b94c7e00/w=240,h=80"
                          alt="Tải trên Google Play"
                          width={140}
                          height={46}
                          className="w-[140px] h-auto cursor-pointer"
                        />
                      </a>
                      <a
                        href="https://apps.apple.com/vn/app/doctor-check/id6475727986"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-90 transition-opacity"
                      >
                        <Image
                          src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/2b7b8fbd-e9bc-4bc2-f945-1f67511e3300/w=240,h=80"
                          alt="Tải trên App Store"
                          width={140}
                          height={46}
                          className="w-[140px] h-auto cursor-pointer"
                        />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Partners */}
                <div className="pt-2">
                  <h5 className="font-bold text-[#005570] text-[18px] md:text-[19px] mb-3.5">
                    Đối tác
                  </h5>
                  <div className="flex items-center gap-4">
                    <Image
                      src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/d96f4486-b723-40f6-c019-4acd309da200/w=616,h=293"
                      alt="BookingCare"
                      width={140}
                      height={60}
                      className="h-10 md:h-11 w-auto object-contain"
                    />
                    <Link href="https://www.noisoidaday.doctorcheck.vn/" target="_blank" rel="noopener noreferrer">
                      <Image
                        src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/ab016d59-2112-4dd3-aed0-fe9713f29500/w=271,h=271,fit=crop"
                        alt="Nội soi dạ dày Doctor Check"
                        width={48}
                        height={48}
                        className="h-11 w-11 md:h-12 md:w-12 rounded-full object-contain hover:scale-105 transition-transform"
                      />
                    </Link>
                    <Link href="https://noisoidaitrang.doctorcheck.vn/" target="_blank" rel="noopener noreferrer">
                      <Image
                        src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/32ae2686-3420-411b-6872-8a8ab6295300/w=1250,h=1250,fit=crop"
                        alt="Nội soi đại tràng Doctor Check"
                        width={48}
                        height={48}
                        className="h-11 w-11 md:h-12 md:w-12 rounded-full object-contain hover:scale-105 transition-transform"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Bottom Bar */}
      <section className="section footer-bottom dark py-4 bg-[#012934] text-white text-[15px] md:text-[16px] text-center" id="section_1263006414">
        <div className="container max-w-[1140px] mx-auto px-4">
          <p className="m-0 font-normal tracking-wide text-white/95">
            © 2024 Doctor Check. All rights reserved
          </p>
        </div>
      </section>

      {/* Back to top button */}
      <a
        href="#top"
        id="top-link"
        aria-label="Lên đầu trang"
        className="fixed bottom-6 right-6 z-40 w-9 h-9 rounded-full bg-[#007896] hover:bg-[#005570] text-white flex items-center justify-center shadow-md transition-all duration-200"
      >
        <ArrowUp className="w-4 h-4 stroke-[2.5]" />
      </a>
    </footer>
  );
}
