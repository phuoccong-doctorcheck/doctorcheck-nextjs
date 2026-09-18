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
  const [openMobileAccordion, setOpenMobileAccordion] = useState<string | null>('about'); // 'about' open by default to match screenshot Image 3
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
              {/* Logo */}
              <div id="logo" className="flex-col logo">
                <Link
                  href="/"
                  title="Doctor Check - Tầm Soát Bệnh Để Sống Thọ Hơn"
                  rel="home"
                  className="logo-link"
                >
                  <img
                    width="51"
                    height="51"
                    src="/sites/doctorcheck-vn/root/images/logo-sticky.webp"
                    className="header-logo-sticky"
                    alt="Doctor Check"
                  />
                  <img
                    width="51"
                    height="51"
                    src="/sites/doctorcheck-vn/root/images/logo-header.webp"
                    className="header_logo header-logo"
                    alt="Doctor Check"
                  />
                  <img
                    width="51"
                    height="51"
                    src="/sites/doctorcheck-vn/root/images/logo-sticky.webp"
                    className="header-logo-dark"
                    alt="Doctor Check"
                  />
                </Link>
              </div>

              {/* Desktop Navigation (Centered cluster) */}
              <div className="flex-col hide-for-medium flex-left flex-grow">
                <ul className="header-nav header-nav-main nav nav-left nav-size-medium">
                  
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
                        <span className="nav-title-text">
                          Về<br />Doctor Check
                          <i className="icon-angle-down">
                            <svg width="8" height="5" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </i>
                        </span>
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
                        <span className="nav-title-text">
                          Tầm Soát Bệnh<br />Nữ
                          <i className="icon-angle-down">
                            <svg width="8" height="5" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </i>
                        </span>
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
                        <span className="nav-title-text">
                          Tầm Soát Bệnh<br />Nam
                          <i className="icon-angle-down">
                            <svg width="8" height="5" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </i>
                        </span>
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
                        <span className="nav-title-text">
                          6 Thói Quen<br />Sống Thọ
                          <i className="icon-angle-down">
                            <svg width="8" height="5" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </i>
                        </span>
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

                  {/* Item 5: Trung Tâm Nội Soi Tiêu Hóa (with VIP badge) */}
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
                      <div className="nav-label-wrap relative">
                        <span className="nav-title-text">
                          Trung Tâm<br />Nội Soi Tiêu Hóa
                          <i className="icon-angle-down">
                            <svg width="8" height="5" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </i>
                        </span>
                        <span className="badge-vip-desktop">VIP</span>
                      </div>
                    </Link>

                    {/* Standard Dropdown Menu (Matching Image 2) */}
                    <ul className="sub-menu nav-dropdown nav-dropdown-default">
                      <li className="menu-item menu-item-type-post_type menu-item-object-page">
                        <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/10-tieu-chuan-vang/">
                          10 Tiêu Chuẩn Vàng
                        </Link>
                      </li>
                      <li className="menu-item menu-item-type-post_type menu-item-object-page">
                        <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-da-day/">
                          Chuyên khoa dạ dày
                        </Link>
                      </li>
                      <li className="menu-item menu-item-type-post_type menu-item-object-page">
                        <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-dai-trang/">
                          Chuyên khoa đại tràng
                        </Link>
                      </li>
                      <li className="menu-item menu-item-type-post_type menu-item-object-page">
                        <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-da-day-tai-doctor-check/">
                          Tầm soát ung thư dạ dày
                        </Link>
                      </li>
                      <li className="menu-item menu-item-type-post_type menu-item-object-page">
                        <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-dai-trang-tai-doctor-check/">
                          Tầm soát ung thư đại tràng
                        </Link>
                      </li>
                      <li className="menu-item menu-item-type-post_type menu-item-object-page label-new">
                        <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/bang-gia-2026/">
                          <span>Bảng Giá 2026</span>
                          <span className="badge-new">Mới</span>
                        </Link>
                      </li>
                      <li className="menu-item menu-item-type-post_type menu-item-object-page">
                        <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/quyen-loi-bhyt-bhtn/">
                          Quyền Lợi Bảo Hiểm Y Tế &amp; Bảo Hiểm Tư Nhân
                        </Link>
                      </li>
                      <li className="menu-item menu-item-type-post_type menu-item-object-page">
                        <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/bao-chi-dua-tin/">
                          Báo chí đưa tin
                        </Link>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>

              {/* Right Elements: Search Toggle */}
              <div className="flex-col hide-for-medium flex-right">
                <ul className="header-nav header-nav-main nav nav-right nav-size-medium">
                  <li className={`header-search header-search-dropdown has-icon has-dropdown menu-item-has-children ${searchOpen ? 'is-open' : ''}`}>
                    <a
                      href="#search"
                      onClick={(e) => {
                        e.preventDefault();
                        setSearchOpen(!searchOpen);
                      }}
                      aria-label="Tìm kiếm"
                      className="search-toggle-btn"
                    >
                      <i className="icon-search">
                        <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#2A2F38" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

              {/* Mobile Right Elements: Hamburger (Matching Image 2) */}
              <div className="flex-col show-for-medium flex-right">
                <ul className="mobile-nav nav nav-right">
                  <li className="nav-icon has-icon">
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(true)}
                      className="mobile-menu-trigger p-1 text-[#2a2f38] hover:text-[#005570] transition-colors"
                      aria-label="Menu"
                      aria-controls="main-menu"
                      aria-expanded={mobileMenuOpen}
                    >
                      <i className="icon-menu">
                        <svg width="24" height="18" viewBox="0 0 24 18" fill="none" stroke="#2A2F38" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <line x1="0" y1="2" x2="24" y2="2" />
                          <line x1="0" y1="9" x2="24" y2="9" />
                          <line x1="0" y1="16" x2="24" y2="16" />
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

      {/* Mobile Menu Drawer (#main-menu) — Full Screen Expand with Bold Clear Typography */}
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
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              maxWidth: '100vw',
              height: '100dvh',
              backgroundColor: '#FDFDF6',
              zIndex: 1100,
              display: 'flex',
              flexDirection: 'column',
              fontFamily: "'SVN-Sofia Pro', 'Sofia Pro', sans-serif",
              overflowY: 'auto',
              padding: '28px 24px 44px 24px',
            }}
          >
            {/* Top Close Button (Clean X at top-right) */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '28px' }}>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  color: '#2A2F38',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Đóng menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2A2F38" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Navigation List Full Width */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
              
              {/* Item 1: Về Doctor Check */}
              <div>
                <div
                  onClick={() => toggleMobileAccordion('about')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#2A2F38' }}>
                    Về Doctor Check
                  </span>
                  <span style={{ color: '#2A2F38', display: 'flex', alignItems: 'center' }}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transform: openMobileAccordion === 'about' ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>

                {/* Sub-items for Về Doctor Check */}
                {openMobileAccordion === 'about' && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      paddingTop: '18px',
                      paddingLeft: '16px',
                    }}
                  >
                    <Link
                      href="/cac-yeu-to-cua-mot-dia-chi-tam-soat-benh-trong-mo/"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        fontSize: '15.5px',
                        fontWeight: 600,
                        color: '#2A2F38',
                        textDecoration: 'none',
                        lineHeight: '1.4',
                      }}
                    >
                      6 Tiêu Chí Của Một Trung Tâm Tầm Soát
                    </Link>
                    <Link
                      href="/loi-ich-khi-kham-tong-quat-tai-doctor-check/"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        fontSize: '15.5px',
                        fontWeight: 600,
                        color: '#2A2F38',
                        textDecoration: 'none',
                        lineHeight: '1.4',
                      }}
                    >
                      Lợi Ích Trước &amp; Sau Khi Tầm Soát Bệnh
                    </Link>
                    <Link
                      href="/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        fontSize: '15.5px',
                        fontWeight: 600,
                        color: '#2A2F38',
                        textDecoration: 'none',
                        lineHeight: '1.4',
                      }}
                    >
                      Bảng Giá Mới Nhất 2026
                    </Link>
                  </div>
                )}
              </div>

              {/* Item 2: Tầm Soát Bệnh Nữ */}
              <div>
                <div
                  onClick={() => toggleMobileAccordion('women')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#2A2F38' }}>
                    Tầm Soát Bệnh Nữ
                  </span>
                  <span style={{ color: '#2A2F38', display: 'flex', alignItems: 'center' }}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transform: openMobileAccordion === 'women' ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>

                {openMobileAccordion === 'women' && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      paddingTop: '18px',
                      paddingLeft: '16px',
                    }}
                  >
                    <Link href="/goi-khuyen-cao-danh-cho-nu/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15.5px', fontWeight: 600, color: '#2A2F38', textDecoration: 'none' }}>
                      Gói Khuyến Cáo
                    </Link>
                    <Link href="/goi-tam-soat-chuyen-sau-danh-cho-nu/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15.5px', fontWeight: 600, color: '#2A2F38', textDecoration: 'none' }}>
                      Gói Chuyên Sâu
                    </Link>
                    <Link href="/goi-kham-song-tho-danh-cho-nu/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15.5px', fontWeight: 600, color: '#2A2F38', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Gói Sống Thọ</span>
                      <span className="badge-vip" style={{ position: 'static', marginLeft: '8px' }}>VIP</span>
                    </Link>
                    <Link href="/so-sanh-3-goi-kham-nu/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15.5px', fontWeight: 600, color: '#2A2F38', textDecoration: 'none' }}>
                      So Sánh 3 Gói
                    </Link>
                  </div>
                )}
              </div>

              {/* Item 3: Tầm Soát Bệnh Nam */}
              <div>
                <div
                  onClick={() => toggleMobileAccordion('men')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#2A2F38' }}>
                    Tầm Soát Bệnh Nam
                  </span>
                  <span style={{ color: '#2A2F38', display: 'flex', alignItems: 'center' }}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transform: openMobileAccordion === 'men' ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>

                {openMobileAccordion === 'men' && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      paddingTop: '18px',
                      paddingLeft: '16px',
                    }}
                  >
                    <Link href="/goi-khuyen-cao-danh-cho-nam/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15.5px', fontWeight: 600, color: '#2A2F38', textDecoration: 'none' }}>
                      Gói Khuyến Cáo
                    </Link>
                    <Link href="/goi-chuyen-sau-danh-cho-nam/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15.5px', fontWeight: 600, color: '#2A2F38', textDecoration: 'none' }}>
                      Gói Chuyên Sâu
                    </Link>
                    <Link href="/goi-song-tho-danh-cho-nam/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15.5px', fontWeight: 600, color: '#2A2F38', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Gói Sống Thọ</span>
                      <span className="badge-vip" style={{ position: 'static', marginLeft: '8px' }}>VIP</span>
                    </Link>
                    <Link href="/so-sanh-3-goi-kham-nam/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15.5px', fontWeight: 600, color: '#2A2F38', textDecoration: 'none' }}>
                      So Sánh 3 Gói
                    </Link>
                  </div>
                )}
              </div>

              {/* Item 4: 6 Thói Quen Sống Thọ */}
              <div>
                <div
                  onClick={() => toggleMobileAccordion('habits')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#2A2F38' }}>
                    6 Thói Quen Sống Thọ
                  </span>
                  <span style={{ color: '#2A2F38', display: 'flex', alignItems: 'center' }}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transform: openMobileAccordion === 'habits' ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>

                {openMobileAccordion === 'habits' && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      paddingTop: '18px',
                      paddingLeft: '16px',
                    }}
                  >
                    <Link href="/kiem-soat-can-nang-va-bmi/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15.5px', fontWeight: 600, color: '#2A2F38', textDecoration: 'none' }}>
                      Kiểm Soát Cân Nặng Và BMI
                    </Link>
                    <Link href="/dinh-duong-song-tho/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15.5px', fontWeight: 600, color: '#2A2F38', textDecoration: 'none' }}>
                      Dinh Dưỡng Sống Thọ
                    </Link>
                    <Link href="/giac-ngu-song-tho/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15.5px', fontWeight: 600, color: '#2A2F38', textDecoration: 'none' }}>
                      Giấc Ngủ Sống Thọ
                    </Link>
                    <Link href="/van-dong-song-tho/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15.5px', fontWeight: 600, color: '#2A2F38', textDecoration: 'none' }}>
                      Vận Động Sống Thọ
                    </Link>
                    <Link href="/kiem-soat-stress-nong-gian/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15.5px', fontWeight: 600, color: '#2A2F38', textDecoration: 'none' }}>
                      Kiểm Soát Stress, Nóng Giận
                    </Link>
                    <Link href="/kiem-soat-hoi-tho-de-song-tho/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15.5px', fontWeight: 600, color: '#2A2F38', textDecoration: 'none' }}>
                      Kiểm Soát Hơi Thở Để Sống Thọ
                    </Link>
                  </div>
                )}
              </div>

              {/* Item 5: Trung Tâm Nội Soi Tiêu Hóa (with red VIP badge) */}
              <div>
                <div
                  onClick={() => toggleMobileAccordion('endoscopy')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#2A2F38' }}>
                      Trung Tâm Nội Soi Tiêu Hóa
                    </span>
                    <span
                      style={{
                        backgroundColor: '#CD0000',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2.5px 6px',
                        borderRadius: '0 8px 0 8px',
                        lineHeight: 1,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      VIP
                    </span>
                  </div>
                  <span style={{ color: '#2A2F38', display: 'flex', alignItems: 'center' }}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transform: openMobileAccordion === 'endoscopy' ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>

                {openMobileAccordion === 'endoscopy' && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      paddingTop: '18px',
                      paddingLeft: '16px',
                    }}
                  >
                    <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/10-tieu-chuan-vang/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15.5px', fontWeight: 600, color: '#2A2F38', textDecoration: 'none' }}>
                      10 Tiêu Chuẩn Vàng
                    </Link>
                    <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/bang-gia-2026/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15.5px', fontWeight: 600, color: '#2A2F38', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Bảng Giá 2026</span>
                      <span className="badge-new" style={{ position: 'static', marginLeft: '8px' }}>MỚI</span>
                    </Link>
                    <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-da-day/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15.5px', fontWeight: 600, color: '#2A2F38', textDecoration: 'none' }}>
                      Chuyên khoa dạ dày
                    </Link>
                    <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-dai-trang/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15.5px', fontWeight: 600, color: '#2A2F38', textDecoration: 'none' }}>
                      Chuyên khoa đại tràng
                    </Link>
                    <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-da-day-tai-doctor-check/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15.5px', fontWeight: 600, color: '#2A2F38', textDecoration: 'none' }}>
                      Tầm soát ung thư dạ dày
                    </Link>
                    <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-dai-trang-tai-doctor-check/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15.5px', fontWeight: 600, color: '#2A2F38', textDecoration: 'none' }}>
                      Tầm soát ung thư đại tràng
                    </Link>
                    <Link href="/trung-tam-noi-soi-tieu-hoa-doctor-check/quyen-loi-bhyt-bhtn/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15.5px', fontWeight: 600, color: '#2A2F38', textDecoration: 'none' }}>
                      Quyền Lợi BHYT &amp; BHTN
                    </Link>
                  </div>
                )}
              </div>

            </div>
          </div>
        </>
      )}
    </>
  );
}
