'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/* eslint-disable @next/next/no-img-element */

export function Header() {
  const router = useRouter();
  const [isSticky, setIsSticky] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const [openMobileAccordion, setOpenMobileAccordion] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (key: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpenSubMenu(key);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setOpenSubMenu(null);
    }, 120);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/kien-thuc-y-khoa?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const toggleMobileAccordion = (key: string) => {
    setOpenMobileAccordion(openMobileAccordion === key ? null : key);
  };

  return (
    <>
      <header
        id="header"
        className={`header has-sticky sticky-jump ${isSticky ? 'stuck is-sticky' : ''}`}
      >
        <div className={`header-wrapper ${isSticky ? 'stuck' : ''}`}>
          <div id="masthead" className="header-main has-sticky-logo">
            <div
              className="header-inner flex-row container logo-left medium-logo-left"
              role="navigation"
            >
              {/* Logo (width: 60px, margin-right: 30px) */}
              {/* Logo exact dimensions (48x48px) */}
              <div id="logo" className="flex-col logo">
                <Link
                  href="/"
                  title="Doctor Check - Tầm Soát Bệnh Để Sống Thọ Hơn"
                  rel="home"
                  className="logo-link"
                >
                  <img
                    width="48"
                    height="48"
                    src="/sites/doctorcheck-vn/root/images/logo-sticky.webp"
                    className="header-logo-sticky"
                    alt="Doctor Check"
                  />
                  <img
                    width="48"
                    height="48"
                    src="/sites/doctorcheck-vn/root/images/logo-header.webp"
                    className="header_logo header-logo"
                    alt="Doctor Check"
                  />
                  <img
                    width="48"
                    height="48"
                    src="/sites/doctorcheck-vn/root/images/logo-sticky.webp"
                    className="header-logo-dark"
                    alt="Doctor Check"
                  />
                </Link>
              </div>

              {/* Mobile Left Elements */}
              <div className="flex-col show-for-medium flex-left">
                <ul className="mobile-nav nav nav-left"></ul>
              </div>

              {/* Left Elements (Desktop Navigation) */}
              <div className="flex-col hide-for-medium flex-left flex-grow">
                <ul className="header-nav header-nav-main nav nav-left nav-size-medium nav-spacing-small">
                  {/* Item 1: Về Doctor Check */}
                  <li
                    id="menu-item-1501"
                    className={`menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children menu-item-1501 menu-item-design-default has-dropdown ${
                      openSubMenu === 'about' ? 'is-open' : ''
                    }`}
                    onMouseEnter={() => handleMouseEnter('about')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href="/ve-chung-toi/"
                      className="nav-top-link"
                      aria-expanded={openSubMenu === 'about'}
                      aria-haspopup="menu"
                    >
                      <div className="nav-label-wrap">
                        <span className="nav-title-text">Về<br /> Doctor Check</span>
                        <i className="icon-angle-down">
                          <svg width="7" height="4" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </i>
                      </div>
                    </Link>
                    <ul className="sub-menu nav-dropdown nav-dropdown-default">
                      <li id="menu-item-1511" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-1511">
                        <Link href="/cac-yeu-to-cua-mot-dia-chi-tam-soat-benh-trong-mo/">6 Tiêu Chí Của Một Trung Tâm Tầm Soát</Link>
                      </li>
                      <li id="menu-item-1512" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-1512">
                        <Link href="/loi-ich-khi-kham-tong-quat-tai-doctor-check/">Lợi Ích Trước &amp; Sau Khi Tầm Soát Bệnh</Link>
                      </li>
                      <li id="menu-item-1510" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-1510">
                        <Link href="/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/">Bảng Giá Mới Nhất 2026</Link>
                      </li>
                    </ul>
                  </li>

                  {/* Item 2: Tầm Soát Bệnh Nữ */}
                  <li
                    id="menu-item-1522"
                    className={`menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-1522 menu-item-design-default has-dropdown ${
                      openSubMenu === 'women' ? 'is-open' : ''
                    }`}
                    onMouseEnter={() => handleMouseEnter('women')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href="/goi-tam-soat-nu/"
                      className="nav-top-link"
                      aria-expanded={openSubMenu === 'women'}
                      aria-haspopup="menu"
                    >
                      <div className="nav-label-wrap">
                        <span className="nav-title-text">Tầm Soát Bệnh <br /> Nữ</span>
                        <i className="icon-angle-down">
                          <svg width="7" height="4" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </i>
                      </div>
                    </Link>
                    <ul className="sub-menu nav-dropdown nav-dropdown-default">
                      <li id="menu-item-1495" className="menu-item menu-item-type-post_type menu-item-object-product menu-item-1495">
                        <Link href="/goi-khuyen-cao-danh-cho-nu/">Gói Khuyến Cáo</Link>
                      </li>
                      <li id="menu-item-1499" className="menu-item menu-item-type-post_type menu-item-object-product menu-item-1499">
                        <Link href="/goi-tam-soat-chuyen-sau-danh-cho-nu/">Gói Chuyên Sâu</Link>
                      </li>
                      <li id="menu-item-1500" className="label-vip menu-item menu-item-type-post_type menu-item-object-product menu-item-1500">
                        <Link href="/goi-kham-song-tho-danh-cho-nu/">
                          <span>Gói Sống Thọ</span>
                          <span className="badge-vip">VIP</span>
                        </Link>
                      </li>
                      <li id="menu-item-3437" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-3437">
                        <Link href="/so-sanh-3-goi-kham-nu/">So Sánh 3 Gói</Link>
                      </li>
                    </ul>
                  </li>

                  {/* Item 3: Tầm Soát Bệnh Nam */}
                  <li
                    id="menu-item-1521"
                    className={`menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-1521 menu-item-design-default has-dropdown ${
                      openSubMenu === 'men' ? 'is-open' : ''
                    }`}
                    onMouseEnter={() => handleMouseEnter('men')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href="/goi-tam-soat-nam/"
                      className="nav-top-link"
                      aria-expanded={openSubMenu === 'men'}
                      aria-haspopup="menu"
                    >
                      <div className="nav-label-wrap">
                        <span className="nav-title-text">Tầm Soát Bệnh <br /> Nam</span>
                        <i className="icon-angle-down">
                          <svg width="7" height="4" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </i>
                      </div>
                    </Link>
                    <ul className="sub-menu nav-dropdown nav-dropdown-default">
                      <li id="menu-item-1496" className="menu-item menu-item-type-post_type menu-item-object-product menu-item-1496">
                        <Link href="/goi-khuyen-cao-danh-cho-nam/">Gói Khuyến Cáo</Link>
                      </li>
                      <li id="menu-item-1497" className="menu-item menu-item-type-post_type menu-item-object-product menu-item-1497">
                        <Link href="/goi-chuyen-sau-danh-cho-nam/">Gói Chuyên Sâu</Link>
                      </li>
                      <li id="menu-item-1498" className="label-vip menu-item menu-item-type-post_type menu-item-object-product menu-item-1498">
                        <Link href="/goi-song-tho-danh-cho-nam/">
                          <span>Gói Sống Thọ</span>
                          <span className="badge-vip">VIP</span>
                        </Link>
                      </li>
                      <li id="menu-item-3438" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-3438">
                        <Link href="/so-sanh-3-goi-kham-nam/">So Sánh 3 Gói</Link>
                      </li>
                    </ul>
                  </li>

                  {/* Item 4: 6 Thói Quen Sống Thọ */}
                  <li
                    id="menu-item-1846"
                    className={`menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-1846 menu-item-design-default has-dropdown ${
                      openSubMenu === 'habits' ? 'is-open' : ''
                    }`}
                    onMouseEnter={() => handleMouseEnter('habits')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <span className="nav-top-link cursor-pointer" aria-expanded={openSubMenu === 'habits'} aria-haspopup="menu">
                      <div className="nav-label-wrap">
                        <span className="nav-title-text">5 Thói Quen<br /> Sống Thọ</span>
                        <i className="icon-angle-down">
                          <svg width="7" height="4" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </i>
                      </div>
                    </span>
                    <ul className="sub-menu nav-dropdown nav-dropdown-default">
                      <li id="menu-item-1867" className="menu-item menu-item-type-post_type menu-item-object-post menu-item-1867">
                        <Link href="/kiem-soat-can-nang-va-bmi/">Kiểm Soát Cân Nặng Và BMI</Link>
                      </li>
                      <li id="menu-item-1866" className="menu-item menu-item-type-post_type menu-item-object-post menu-item-1866">
                        <Link href="/dinh-duong-song-tho/">Dinh Dưỡng Sống Thọ</Link>
                      </li>
                      <li id="menu-item-1863" className="menu-item menu-item-type-post_type menu-item-object-post menu-item-1863">
                        <Link href="/giac-ngu-song-tho/">Giấc Ngủ Sống Thọ</Link>
                      </li>
                      <li id="menu-item-1865" className="menu-item menu-item-type-post_type menu-item-object-post menu-item-1865">
                        <Link href="/van-dong-song-tho/">Vận Động Sống Thọ</Link>
                      </li>
                      <li id="menu-item-1864" className="menu-item menu-item-type-post_type menu-item-object-post menu-item-1864">
                        <Link href="/kiem-soat-stress-nong-gian/">Kiểm Soát Stress, Nóng Giận</Link>
                      </li>
                      <li id="menu-item-1862" className="menu-item menu-item-type-post_type menu-item-object-post menu-item-1862">
                        <Link href="/kiem-soat-hoi-tho-de-song-tho/">Kiểm Soát Hơi Thở Để Sống Thọ</Link>
                      </li>
                    </ul>
                  </li>

                  {/* Item 5: Trung Tâm Nội Soi Tiêu Hóa (Mega Menu + VIP Badge) */}
                  <li
                    id="menu-item-1651"
                    className={`label-vip premium menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-1651 menu-item-design-default has-dropdown ${
                      openSubMenu === 'endoscopy' ? 'is-open' : ''
                    }`}
                    onMouseEnter={() => handleMouseEnter('endoscopy')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href="/trung-tam-noi-soi-tieu-hoa-doctor-check/"
                      className="nav-top-link"
                      aria-expanded={openSubMenu === 'endoscopy'}
                      aria-haspopup="menu"
                    >
                      <div className="nav-label-wrap">
                        <span className="nav-title-text">Trung Tâm <br />Nội Soi Tiêu Hóa</span>
                        <i className="icon-angle-down">
                          <svg width="7" height="4" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </i>
                      </div>
                      <span className="badge-vip">VIP</span>
                    </Link>

                    {/* Mega Dropdown Multi-Column */}
                    <div className="sub-menu nav-dropdown nav-dropdown-mega">
                      <div className="mega-grid">
                        {/* Col 1: Chuyên khoa dạ dày */}
                        <div className="mega-col">
                          <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-da-day/" className="mega-col-title">
                            Chuyên Khoa Dạ Dày
                          </Link>

                          <div className="mega-subgroup">
                            <div className="mega-subgroup-title">Bệnh lý dạ dày:</div>
                            <ul>
                              <li><Link href="/viem-loet-da-day-ta-trang/">Viêm loét dạ dày – tá tràng</Link></li>
                              <li><Link href="/viem-thuc-quan/">Viêm thực quản</Link></li>
                              <li><Link href="/benh-ung-thu-da-day/">Ung thư dạ dày</Link></li>
                              <li><Link href="/ung-thu-thuc-quan/">Ung thư thực quản</Link></li>
                              <li><Link href="/nhiem-khuan-h-pylori/">Nhiễm khuẩn H. pylori</Link></li>
                              <li><Link href="/trao-nguoc-da-day-thuc-quan/">Trào ngược dạ dày – thực quản</Link></li>
                              <li><Link href="/kho-tieu-chuc-nang/">Khó tiêu chức năng</Link></li>
                            </ul>
                          </div>

                          <div className="mega-subgroup">
                            <div className="mega-subgroup-title">Triệu chứng dạ dày:</div>
                            <ul>
                              <li><Link href="/dau-thuong-vi/">Đau thượng vị</Link></li>
                              <li><Link href="/kho-tieu/">Khó tiêu</Link></li>
                              <li><Link href="/an-nhanh-no/">Ăn nhanh no</Link></li>
                              <li><Link href="/chuong-bung-day-hoi/">Chướng bụng, đầy hơi</Link></li>
                              <li><Link href="/buon-non-non/">Buồn nôn, nôn</Link></li>
                            </ul>
                          </div>

                          <div className="mt-2">
                            <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-da-day/noi-soi-da-day-chan-doan-benh-ly/" className="mega-highlight-link">
                              → Nội soi dạ dày chẩn đoán bệnh lý
                            </Link>
                          </div>
                        </div>

                        {/* Col 2: Chuyên khoa đại tràng */}
                        <div className="mega-col">
                          <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-dai-trang/" className="mega-col-title">
                            Chuyên Khoa Đại Tràng
                          </Link>

                          <div className="mega-subgroup">
                            <div className="mega-subgroup-title">Bệnh lý đại tràng:</div>
                            <ul>
                              <li><Link href="/tao-bon/">Táo bón</Link></li>
                              <li><Link href="/viem-dai-trang/">Viêm đại tràng</Link></li>
                              <li><Link href="/hoi-chung-ruot-kich-thich/">Hội chứng ruột kích thích</Link></li>
                              <li><Link href="/benh-crohn/">Bệnh Crohn</Link></li>
                              <li><Link href="/tieu-chay-2/">Tiêu chảy</Link></li>
                              <li><Link href="/roi-loan-tieu-hoa/">Rối loạn tiêu hoá</Link></li>
                              <li><Link href="/polyp-dai-trang/">Polyp đại tràng</Link></li>
                            </ul>
                          </div>

                          <div className="mega-subgroup">
                            <div className="mega-subgroup-title">Triệu chứng đại tràng:</div>
                            <ul>
                              <li><Link href="/dau-bung-am-i/">Đau bụng âm ỉ</Link></li>
                              <li><Link href="/tieu-phan-nhay-nhot/">Tiêu phân nhầy nhớt</Link></li>
                              <li><Link href="/tieu-chay/">Tiêu chảy</Link></li>
                              <li><Link href="/di-ngoai-ra-mau/">Đi ngoài ra máu</Link></li>
                              <li><Link href="/tao-bon-keo-dai/">Táo bón kéo dài</Link></li>
                            </ul>
                          </div>

                          <div className="mt-2">
                            <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-dai-trang/noi-soi-dai-trang-chan-doan-benh-ly/" className="mega-highlight-link">
                              → Nội soi đại tràng chẩn đoán bệnh lý
                            </Link>
                          </div>
                        </div>

                        {/* Col 3: Tầm soát ung thư tiêu hóa */}
                        <div className="mega-col">
                          <div className="mega-col-title">Tầm Soát Ung Thư</div>

                          <div className="mega-subgroup">
                            <div className="mega-subgroup-title">Tầm soát ung thư dạ dày:</div>
                            <ul>
                              <li><Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-da-day-tai-doctor-check/quy-trinh-noi-soi-da-day/">Quy trình nội soi dạ dày</Link></li>
                              <li><Link href="/ung-thu-thuc-quan-2/">Ung thư thực quản</Link></li>
                              <li><Link href="/ung-thu-da-day/">Ung thư dạ dày</Link></li>
                              <li><Link href="/ung-thu-ta-trang/">Ung thư tá tràng</Link></li>
                            </ul>
                          </div>

                          <div className="mega-subgroup">
                            <div className="mega-subgroup-title">Tầm soát ung thư đại tràng:</div>
                            <ul>
                              <li><Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-dai-trang-tai-doctor-check/quy-trinh-noi-soi-dai-trang/">Quy trình nội soi đại tràng</Link></li>
                              <li><Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-dai-trang-tai-doctor-check/kien-thuc-ung-thu-dai-trang/">Kiến thức ung thư đại tràng</Link></li>
                            </ul>
                          </div>
                        </div>

                        {/* Col 4: Dịch vụ & Chính sách */}
                        <div className="mega-col flex flex-col justify-between">
                          <div>
                            <div className="mega-col-title">Tiêu Chuẩn &amp; Bảng Giá</div>
                            <ul className="space-y-2">
                              <li>
                                <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/10-tieu-chuan-vang/" className="font-bold text-[#005570] hover:text-[#FFB500] flex items-center gap-1.5 py-1">
                                  <span>10 Tiêu Chuẩn Vàng</span>
                                </Link>
                              </li>
                              <li className="label-new">
                                <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/bang-gia-2026/" className="font-bold text-[#005570] hover:text-[#FFB500] flex items-center justify-between py-1">
                                  <span>Bảng Giá 2026</span>
                                  <span className="badge-new">MỚI</span>
                                </Link>
                              </li>
                              <li>
                                <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/quyen-loi-bhyt-bhtn/" className="font-semibold text-gray-700 hover:text-[#005570] block py-1">
                                  Quyền Lợi Bảo Hiểm Y Tế &amp; Bảo Hiểm Tư Nhân
                                </Link>
                              </li>
                              <li>
                                <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/bao-chi-dua-tin/" className="font-semibold text-gray-700 hover:text-[#005570] block py-1">
                                  Báo chí đưa tin
                                </Link>
                              </li>
                            </ul>
                          </div>

                          <div className="mt-4 p-3.5 bg-[#EEF7FA] rounded-xl border border-[#D0EBF1]">
                            <div className="text-xs font-bold text-[#005570] mb-1">NỘI SOI TIÊU HÓA KHÔNG ĐAU</div>
                            <div className="text-[11px] text-gray-600 leading-relaxed mb-2.5">
                              Hệ thống nội soi phóng đại AI Olympus EVIS X1 &amp; Fujifilm 7000 Nhật Bản.
                            </div>
                            <a
                              href="#booking"
                              className="inline-block w-full text-center py-2 px-3 rounded-lg bg-[#FFB500] text-[#005570] text-xs font-bold hover:bg-[#e0a000] transition-colors shadow-sm"
                            >
                              ĐẶT LỊCH NỘI SOI NGAY
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>

                  {/* Item 6: Khám Sức Khỏe Doanh Nghiệp (dc-hide) */}
                  <li
                    id="menu-item-5685"
                    className={`label-minh-bach dc-hide menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-5685 menu-item-design-default has-dropdown ${
                      openSubMenu === 'b2b' ? 'is-open' : ''
                    }`}
                    onMouseEnter={() => handleMouseEnter('b2b')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <a
                      href="https://khamdoanhnghiep.doctorcheck.vn/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nav-top-link"
                      aria-expanded={openSubMenu === 'b2b'}
                      aria-haspopup="menu"
                    >
                      <span>Khám Sức Khỏe <br />Doanh Nghiệp</span>
                      <i className="icon-angle-down">
                        <svg width="9" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </i>
                    </a>
                    <ul className="sub-menu nav-dropdown nav-dropdown-default">
                      <li id="menu-item-5707" className="menu-item menu-item-type-custom menu-item-object-custom menu-item-5707">
                        <a href="https://khamdoanhnghiep.doctorcheck.vn/#solution" target="_blank" rel="noopener noreferrer">Về Doctor Check</a>
                      </li>
                      <li id="menu-item-5708" className="menu-item menu-item-type-custom menu-item-object-custom menu-item-5708">
                        <a href="https://khamdoanhnghiep.doctorcheck.vn/#process" target="_blank" rel="noopener noreferrer">Quy Trình Khám</a>
                      </li>
                      <li id="menu-item-5709" className="menu-item menu-item-type-custom menu-item-object-custom menu-item-5709">
                        <a href="https://khamdoanhnghiep.doctorcheck.vn/#packages" target="_blank" rel="noopener noreferrer">Các Gói Khám</a>
                      </li>
                      <li id="menu-item-5710" className="menu-item menu-item-type-custom menu-item-object-custom menu-item-5710">
                        <a href="https://khamdoanhnghiep.doctorcheck.vn/#form-section" target="_blank" rel="noopener noreferrer">Liên Hệ</a>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>

              {/* Right Elements: Search Form & Icon */}
              <div className="flex-col hide-for-medium flex-right">
                <ul className="header-nav header-nav-main nav nav-right nav-size-medium nav-spacing-small">
                  <li className={`header-search header-search-dropdown has-icon has-dropdown menu-item-has-children ${searchOpen ? 'is-open' : ''}`}>
                    <a
                      href="#search"
                      onClick={(e) => {
                        e.preventDefault();
                        setSearchOpen(!searchOpen);
                      }}
                      aria-label="Tìm kiếm"
                      className="search-toggle-btn is-small"
                    >
                      <i className="icon-search">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                      </i>
                    </a>

                    <div className={`nav-dropdown nav-dropdown-default search-dropdown-box ${searchOpen ? 'is-open' : ''}`}>
                      <div className="header-search-form-wrapper">
                        <form
                          role="search"
                          method="get"
                          className="searchform"
                          action="/kien-thuc-y-khoa"
                          onSubmit={handleSearchSubmit}
                        >
                          <div className="flex-row relative flex items-center">
                            <div className="flex-col flex-grow">
                              <label className="screen-reader-text" htmlFor="header-search-input">Tìm kiếm:</label>
                              <input
                                id="header-search-input"
                                ref={searchInputRef}
                                type="search"
                                className="search-field mb-0"
                                placeholder="Tìm kiếm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                name="s"
                              />
                            </div>
                            <div className="flex-col">
                              <button
                                type="submit"
                                value="Tìm kiếm"
                                className="ux-search-submit submit-button secondary button icon mb-0"
                                aria-label="Gửi"
                              >
                                <i className="icon-search">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                  </svg>
                                </i>
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Mobile Right Elements: Hamburger */}
              <div className="flex-col show-for-medium flex-right">
                <ul className="mobile-nav nav nav-right">
                  <li className="nav-icon has-icon">
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(true)}
                      className="mobile-menu-trigger p-2 text-[#2a2f38] hover:text-[#005570] transition-colors"
                      aria-label="Menu"
                      aria-controls="main-menu"
                      aria-expanded={mobileMenuOpen}
                    >
                      <i className="icon-menu">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <line x1="3" y1="12" x2="21" y2="12" />
                          <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                      </i>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="header-bg-container fill">
            <div className="header-bg-image fill"></div>
            <div className="header-bg-color fill"></div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer (#main-menu) */}
      {mobileMenuOpen && (
        <>
          <div
            className="mobile-overlay"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            id="main-menu"
            className="mobile-nav-drawer is-open"
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng chính"
          >
            {/* Header of Drawer */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <img
                  src="/sites/doctorcheck-vn/root/images/logo-header.webp"
                  alt="Doctor Check"
                  className="h-10 w-auto"
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-gray-500 hover:text-[#005570]"
                aria-label="Đóng menu"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Mobile Search */}
            <div className="p-4 pb-2 border-b border-gray-100">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="search"
                  placeholder="Tìm kiếm"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#005570]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-[#005570] text-white text-xs font-bold rounded-lg hover:bg-[#ffb500] hover:text-[#005570] transition-colors"
                >
                  Tìm
                </button>
              </form>
            </div>

            {/* Navigation List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 text-sm font-semibold text-[#005570]">
              {/* Section 1: Về Doctor Check */}
              <div className="border-b border-gray-100 pb-2">
                <div className="flex items-center justify-between py-2">
                  <Link href="/ve-chung-toi/" onClick={() => setMobileMenuOpen(false)}>
                    Về Doctor Check
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleMobileAccordion('about')}
                    className="p-1 text-gray-400 hover:text-[#005570]"
                    aria-label="Chuyển đổi menu Về Doctor Check"
                  >
                    <svg className={`w-4 h-4 transition-transform ${openMobileAccordion === 'about' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
                {openMobileAccordion === 'about' && (
                  <div className="pl-3 pb-2 space-y-1.5 text-xs text-gray-600 font-normal">
                    <Link href="/cac-yeu-to-cua-mot-dia-chi-tam-soat-benh-trong-mo/" onClick={() => setMobileMenuOpen(false)} className="block py-1">6 Tiêu Chí Của Một Trung Tâm Tầm Soát</Link>
                    <Link href="/loi-ich-khi-kham-tong-quat-tai-doctor-check/" onClick={() => setMobileMenuOpen(false)} className="block py-1">Lợi Ích Trước &amp; Sau Khi Tầm Soát Bệnh</Link>
                    <Link href="/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/" onClick={() => setMobileMenuOpen(false)} className="block py-1 font-bold text-[#005570]">Bảng Giá Mới Nhất 2026</Link>
                  </div>
                )}
              </div>

              {/* Section 2: Tầm Soát Bệnh Nữ */}
              <div className="border-b border-gray-100 pb-2">
                <div className="flex items-center justify-between py-2">
                  <Link href="/goi-tam-soat-nu" onClick={() => setMobileMenuOpen(false)}>
                    Tầm Soát Bệnh Nữ
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleMobileAccordion('women')}
                    className="p-1 text-gray-400 hover:text-[#005570]"
                    aria-label="Chuyển đổi menu Tầm Soát Bệnh Nữ"
                  >
                    <svg className={`w-4 h-4 transition-transform ${openMobileAccordion === 'women' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
                {openMobileAccordion === 'women' && (
                  <div className="pl-3 pb-2 space-y-1.5 text-xs text-gray-600 font-normal">
                    <Link href="/goi-khuyen-cao-danh-cho-nu/" onClick={() => setMobileMenuOpen(false)} className="block py-1">Gói Khuyến Cáo</Link>
                    <Link href="/goi-tam-soat-chuyen-sau-danh-cho-nu/" onClick={() => setMobileMenuOpen(false)} className="block py-1">Gói Chuyên Sâu</Link>
                    <Link href="/goi-kham-song-tho-danh-cho-nu/" onClick={() => setMobileMenuOpen(false)} className="block py-1 font-bold text-[#005570] flex items-center justify-between">
                      <span>Gói Sống Thọ</span>
                      <span className="badge-vip">VIP</span>
                    </Link>
                    <Link href="/so-sanh-3-goi-kham-nu/" onClick={() => setMobileMenuOpen(false)} className="block py-1">So Sánh 3 Gói</Link>
                  </div>
                )}
              </div>

              {/* Section 3: Tầm Soát Bệnh Nam */}
              <div className="border-b border-gray-100 pb-2">
                <div className="flex items-center justify-between py-2">
                  <Link href="/goi-tam-soat-nam" onClick={() => setMobileMenuOpen(false)}>
                    Tầm Soát Bệnh Nam
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleMobileAccordion('men')}
                    className="p-1 text-gray-400 hover:text-[#005570]"
                    aria-label="Chuyển đổi menu Tầm Soát Bệnh Nam"
                  >
                    <svg className={`w-4 h-4 transition-transform ${openMobileAccordion === 'men' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
                {openMobileAccordion === 'men' && (
                  <div className="pl-3 pb-2 space-y-1.5 text-xs text-gray-600 font-normal">
                    <Link href="/goi-khuyen-cao-danh-cho-nam/" onClick={() => setMobileMenuOpen(false)} className="block py-1">Gói Khuyến Cáo</Link>
                    <Link href="/goi-chuyen-sau-danh-cho-nam/" onClick={() => setMobileMenuOpen(false)} className="block py-1">Gói Chuyên Sâu</Link>
                    <Link href="/goi-song-tho-danh-cho-nam/" onClick={() => setMobileMenuOpen(false)} className="block py-1 font-bold text-[#005570] flex items-center justify-between">
                      <span>Gói Sống Thọ</span>
                      <span className="badge-vip">VIP</span>
                    </Link>
                    <Link href="/so-sanh-3-goi-kham-nam/" onClick={() => setMobileMenuOpen(false)} className="block py-1">So Sánh 3 Gói</Link>
                  </div>
                )}
              </div>

              {/* Section 4: 6 Thói Quen Sống Thọ */}
              <div className="border-b border-gray-100 pb-2">
                <div className="flex items-center justify-between py-2">
                  <span>6 Thói Quen Sống Thọ</span>
                  <button
                    type="button"
                    onClick={() => toggleMobileAccordion('habits')}
                    className="p-1 text-gray-400 hover:text-[#005570]"
                    aria-label="Chuyển đổi menu 6 Thói Quen Sống Thọ"
                  >
                    <svg className={`w-4 h-4 transition-transform ${openMobileAccordion === 'habits' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
                {openMobileAccordion === 'habits' && (
                  <div className="pl-3 pb-2 space-y-1.5 text-xs text-gray-600 font-normal">
                    <Link href="/kiem-soat-can-nang-va-bmi/" onClick={() => setMobileMenuOpen(false)} className="block py-1">Kiểm Soát Cân Nặng Và BMI</Link>
                    <Link href="/dinh-duong-song-tho/" onClick={() => setMobileMenuOpen(false)} className="block py-1">Dinh Dưỡng Sống Thọ</Link>
                    <Link href="/giac-ngu-song-tho/" onClick={() => setMobileMenuOpen(false)} className="block py-1">Giấc Ngủ Sống Thọ</Link>
                    <Link href="/van-dong-song-tho/" onClick={() => setMobileMenuOpen(false)} className="block py-1">Vận Động Sống Thọ</Link>
                    <Link href="/kiem-soat-stress-nong-gian/" onClick={() => setMobileMenuOpen(false)} className="block py-1">Kiểm Soát Stress, Nóng Giận</Link>
                    <Link href="/kiem-soat-hoi-tho-de-song-tho/" onClick={() => setMobileMenuOpen(false)} className="block py-1">Kiểm Soát Hơi Thở Để Sống Thọ</Link>
                  </div>
                )}
              </div>

              {/* Section 5: Trung Tâm Nội Soi Tiêu Hóa */}
              <div className="border-b border-gray-100 pb-2">
                <div className="flex items-center justify-between py-2">
                  <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/" onClick={() => setMobileMenuOpen(false)} className="font-bold text-[#005570] flex items-center gap-1.5">
                    <span>Trung Tâm Nội Soi Tiêu Hóa</span>
                    <span className="badge-vip">VIP</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleMobileAccordion('endoscopy')}
                    className="p-1 text-gray-400 hover:text-[#005570]"
                    aria-label="Chuyển đổi menu Trung Tâm Nội Soi Tiêu Hóa"
                  >
                    <svg className={`w-4 h-4 transition-transform ${openMobileAccordion === 'endoscopy' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
                {openMobileAccordion === 'endoscopy' && (
                  <div className="pl-3 pb-2 space-y-1.5 text-xs text-gray-600 font-normal">
                    <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/10-tieu-chuan-vang/" onClick={() => setMobileMenuOpen(false)} className="block py-1 font-bold text-[#005570]">10 Tiêu Chuẩn Vàng</Link>
                    <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/bang-gia-2026/" onClick={() => setMobileMenuOpen(false)} className="block py-1 font-bold text-[#005570] flex items-center justify-between">
                      <span>Bảng Giá 2026</span>
                      <span className="badge-new">MỚI</span>
                    </Link>
                    <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-da-day/" onClick={() => setMobileMenuOpen(false)} className="block py-1">Chuyên khoa dạ dày</Link>
                    <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-dai-trang/" onClick={() => setMobileMenuOpen(false)} className="block py-1">Chuyên khoa đại tràng</Link>
                    <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-da-day-tai-doctor-check/" onClick={() => setMobileMenuOpen(false)} className="block py-1">Tầm soát ung thư dạ dày</Link>
                    <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-dai-trang-tai-doctor-check/" onClick={() => setMobileMenuOpen(false)} className="block py-1">Tầm soát ung thư đại tràng</Link>
                    <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/quyen-loi-bhyt-bhtn/" onClick={() => setMobileMenuOpen(false)} className="block py-1">Quyền Lợi BHYT &amp; BHTN</Link>
                  </div>
                )}
              </div>

              {/* Section 6: Khám Sức Khỏe Doanh Nghiệp (dc-hide) */}
              <div className="dc-hide border-b border-gray-100 pb-2">
                <a
                  href="https://khamdoanhnghiep.doctorcheck.vn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-2 text-[#005570]"
                >
                  Khám Sức Khỏe Doanh Nghiệp ↗
                </a>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-100 space-y-2">
              <a
                href="#booking"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-3 text-center bg-[#FFB500] text-[#005570] font-bold text-sm rounded-xl shadow-md hover:bg-[#e0a000] transition-colors"
              >
                ĐẶT HẸN TẦM SOÁT NGAY
              </a>
              <a
                href="tel:02856789999"
                className="block w-full py-2.5 text-center border border-[#005570] text-[#005570] font-bold text-xs rounded-xl hover:bg-[#EEF7FA] transition-colors"
              >
                Hotline: 028 5678 9999
              </a>
            </div>
          </div>
        </>
      )}

      </>
  );
}
