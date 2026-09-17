'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import './about-us.css';

/* eslint-disable @next/next/no-img-element */

interface GalleryItem {
  id: string;
  imgId: string;
  group: number; // 0: phong-kham, 1: phong-noi-soi, 2: quay-le-tan
  alt: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  // Group 0: Phòng khám / tư vấn (6 items)
  { id: 'slide01', imgId: '184853f7-2445-4969-a0bb-4d48b7dd0000', group: 0, alt: 'Phòng khám và tư vấn Doctor Check 1' },
  { id: 'slide02', imgId: 'd5723fe9-1437-42ef-00a9-fc06d50aeb00', group: 0, alt: 'Phòng khám và tư vấn Doctor Check 2' },
  { id: 'slide03', imgId: '9cfe2c25-832c-4a64-3da6-c0a0fbd38c00', group: 0, alt: 'Phòng khám và tư vấn Doctor Check 3' },
  { id: 'slide04', imgId: '54201bfd-ebaf-4214-8ce1-12165e359700', group: 0, alt: 'Phòng khám và tư vấn Doctor Check 4' },
  { id: 'slide05', imgId: '6a1e3d54-eae9-45de-e4de-6d8594c35f00', group: 0, alt: 'Phòng khám và tư vấn Doctor Check 5' },
  { id: 'slide06', imgId: '077c82c2-351e-404a-9df2-6e2c8d2cf400', group: 0, alt: 'Phòng khám và tư vấn Doctor Check 6' },

  // Group 1: Phòng tầm soát nội soi (4 items)
  { id: 'slide07', imgId: '21b74629-09ea-4bcb-6245-3bb36b202300', group: 1, alt: 'Phòng tầm soát nội soi tiêu hóa 1' },
  { id: 'slide08', imgId: '558b0b3e-bc6a-4ca4-084b-42c409d52900', group: 1, alt: 'Phòng tầm soát nội soi tiêu hóa 2' },
  { id: 'slide09', imgId: '1f3e46fa-70d8-4248-dba2-4b7c5e23cd00', group: 1, alt: 'Phòng tầm soát nội soi tiêu hóa 3' },
  { id: 'slide10', imgId: 'a56e5cd0-fd4b-42e8-d331-880d222b9600', group: 1, alt: 'Phòng tầm soát nội soi tiêu hóa 4' },

  // Group 2: Quầy lễ tân đón khách (5 items)
  { id: 'slide11', imgId: '26854b67-c37f-4aec-f253-98ff9b676600', group: 2, alt: 'Quầy lễ tân đón tiếp khách hàng 1' },
  { id: 'slide12', imgId: 'a8848c6f-c6bd-4066-a428-81d98713ca00', group: 2, alt: 'Quầy lễ tân đón tiếp khách hàng 2' },
  { id: 'slide13', imgId: '0e12e4c6-cbe7-421c-c794-b298c6da6a00', group: 2, alt: 'Quầy lễ tân đón tiếp khách hàng 3' },
  { id: 'slide14', imgId: 'daa6eca1-809b-4b8e-76c6-b094a4431600', group: 2, alt: 'Quầy lễ tân đón tiếp khách hàng 4' },
  { id: 'slide15', imgId: 'fde434e3-c826-4776-ec3d-d363701beb00', group: 2, alt: 'Quầy lễ tân đón tiếp khách hàng 5' },
];

export function AboutUsPage() {
  const [selectedTab, setSelectedTab] = useState<'all' | 'group-0' | 'group-1' | 'group-2'>('all');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Filtered gallery items based on selected tab
  const displayedGallery = GALLERY_ITEMS.filter((item) => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'group-0') return item.group === 0;
    if (selectedTab === 'group-1') return item.group === 1;
    if (selectedTab === 'group-2') return item.group === 2;
    return true;
  });

  // Current active slide
  const currentSlide = displayedGallery[activeSlideIndex] || displayedGallery[0];

  // Booking Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_year: '',
    customer_phone: '',
    services_list: '',
    date_booking: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleTabChange = (tab: 'all' | 'group-0' | 'group-1' | 'group-2') => {
    setSelectedTab(tab);
    setActiveSlideIndex(0);
  };

  const handlePrevSlide = () => {
    setActiveSlideIndex((prev) => (prev === 0 ? displayedGallery.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveSlideIndex((prev) => (prev === displayedGallery.length - 1 ? 0 : prev + 1));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.customer_phone) {
      setSubmitError('Vui lòng điền họ tên và số điện thoại.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.customer_name,
          birthYear: formData.customer_year ? parseInt(formData.customer_year) : undefined,
          phone: formData.customer_phone,
          service: formData.services_list || 'Tư vấn tổng quát',
          appointmentDate: formData.date_booking,
          source: 've-chung-toi',
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setIsBookingModalOpen(false);
          setSubmitSuccess(false);
          setFormData({
            customer_name: '',
            customer_year: '',
            customer_phone: '',
            services_list: '',
            date_booking: '',
          });
        }, 3000);
      } else {
        setSubmitError('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại hoặc gọi hotline!');
      }
    } catch {
      setSubmitError('Lỗi kết nối máy chủ. Vui lòng gọi trực tiếp hotline 028 5678 9999!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="content" role="main" className="content-area about-us-page">
      {/* SECTION 1: Banner About (#section_2050065749) */}
      <section className="section section-banner-about" id="section_2050065749">
        <div className="section-bg fill"></div>
        <div className="section-content relative">
          <div id="gap-723823570" className="gap-element clearfix" style={{ display: 'block', height: 'auto' }}>
            <style>{`#gap-723823570 { padding-top: 30px; }`}</style>
          </div>

          <div className="row align-middle" id="row-62336422">
            <div id="col-1531572175" className="col circle-blur medium-6 small-12 large-6">
              <div className="col-inner">
                <h1 className="about-main-title">Doctor Check – Trung Tâm Tầm Soát Bệnh Chuyên Sâu</h1>
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(true)}
                  className="button secondary btn-appointment hide-for-small"
                  style={{ borderRadius: '99px' }}
                >
                  <span>Tư vấn ngay</span>
                  <i className="icon-angle-right" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </i>
                </button>
              </div>
            </div>

            <div id="col-2088518509" className="col medium-6 small-12 large-6">
              <div className="col-inner text-right">
                <div className="img has-hover x md-x lg-x y md-y lg-y" id="image_525124898">
                  <div className="img-inner dark">
                    <img
                      decoding="async"
                      width="1020"
                      height="782"
                      src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/01ebd28e-a8b4-4b4a-5d02-2013559f3000/w=1020,h=782"
                      className="attachment-large size-large"
                      alt="Doctor Check – Trung Tâm Tầm Soát Bệnh Chuyên Sâu"
                    />
                  </div>
                  <style>{`#image_525124898 { width: 90%; }`}</style>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(true)}
                  className="button secondary btn-appointment show-for-small"
                  style={{ borderRadius: '99px' }}
                >
                  <span>Tư vấn ngay</span>
                  <i className="icon-angle-right" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          #section_2050065749 {
            padding-top: 0px;
            padding-bottom: 0px;
          }
        `}</style>
      </section>

      {/* SECTION 2: Achievement (#section_922965840) */}
      <section className="section section-achivement" id="section_922965840">
        <div className="section-bg fill"></div>
        <div className="section-content relative">
          <div className="row align-middle" id="row-1174397728">
            <div id="col-1590481363" className="col medium-6 small-12 large-6">
              <div className="col-inner">
                <div className="img has-hover x md-x lg-x y md-y lg-y" id="image_169293345">
                  <div className="img-inner dark">
                    <img
                      decoding="async"
                      width="1200"
                      height="834"
                      src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/d3484c22-3e95-4571-eeb0-b54941a00700/w=1200,h=834"
                      className="attachment-original size-original"
                      alt="Giấy phép hoạt động của Sở Y Tế cấp cho Doctor Check"
                    />
                  </div>
                  <style>{`#image_169293345 { width: 100%; }`}</style>
                </div>
              </div>
            </div>

            <div id="col-76874271" className="col medium-6 small-12 large-6">
              <div className="col-inner">
                <h2>Phòng Khám Doctor Check Được Cấp Phép Hoạt Động Bởi Sở Y Tế TP.HCM</h2>
                <p>
                  Thấu hiểu SỨC KHỎE LÀ VÀNG – nền tảng của cuộc sống trọn vẹn và hạnh phúc, Doctor Check được thành lập giúp bạn bắt đầu hành trình bảo vệ sức khỏe toàn diện với lộ trình tầm soát bệnh định kỳ và xây dựng giải pháp SỐNG KHỎE – SỐNG THỌ.
                </p>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          #section_922965840 {
            padding-top: 30px;
            padding-bottom: 30px;
          }
        `}</style>
      </section>

      {/* Gap separator */}
      <div id="gap-493322467" className="gap-element clearfix" style={{ display: 'block', height: 'auto' }}>
        <style>{`#gap-493322467 { padding-top: 175px; }`}</style>
      </div>

      {/* SECTION 3: Vision & Mission (#section_1650923643) */}
      <section className="section section-vision" id="section_1650923643">
        <div className="section-bg fill"></div>

        {/* Decorative Inverted Triangle Shape Divider */}
        <div className="ux-shape-divider ux-shape-divider--bottom ux-shape-divider--style-triangle-invert ux-shape-divider--to-front">
          <svg viewBox="0 0 1000 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path className="ux-shape-fill" d="M500 95.6L0 0V100H1000V0L500 95.6Z"></path>
          </svg>
        </div>

        <div className="section-content relative">
          <div className="row row-vision" id="row-763967989">
            <div id="col-1529369699" className="col medium-6 small-12 large-6">
              <div className="col-inner">
                <div className="icon-box featured-box icon-box-top text-left">
                  <div className="icon-box-img" style={{ width: '60px' }}>
                    <div className="icon">
                      <div className="icon-inner">
                        <img
                          decoding="async"
                          width="60"
                          height="60"
                          src="/sites/doctorcheck-vn/root/images/vision.svg"
                          className="attachment-medium size-medium"
                          alt="Tầm nhìn Doctor Check"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="icon-box-text last-reset">
                    <h2>Tầm nhìn</h2>
                    <p>Trở thành chuỗi phòng khám hàng đầu thế giới trong việc nâng cao sức khỏe và tuổi thọ con người.</p>
                  </div>
                </div>
              </div>
            </div>

            <div id="col-1577784972" className="col medium-6 small-12 large-6">
              <div className="col-inner">
                <div className="icon-box featured-box icon-box-top text-left">
                  <div className="icon-box-img" style={{ width: '60px' }}>
                    <div className="icon">
                      <div className="icon-inner">
                        <img
                          decoding="async"
                          width="60"
                          height="60"
                          src="/sites/doctorcheck-vn/root/images/mission.svg"
                          className="attachment-medium size-medium"
                          alt="Sứ mệnh Doctor Check"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="icon-box-text last-reset">
                    <h2>Sứ mệnh</h2>
                    <p>Giúp bạn sống thọ hơn thông qua tầm soát bệnh định kỳ hàng năm và tư vấn lối sống khoa học.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row row-collapse" id="row-893675001">
            <div id="col-464698195" className="col small-12 large-12">
              <div className="col-inner">
                <div className="img has-hover x md-x lg-x y md-y lg-y" id="image_887520188">
                  <div className="img-inner dark">
                    <img
                      decoding="async"
                      width="1782"
                      height="563"
                      src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/038abea1-71ec-4078-e008-5e573da8ef00/w=1782,h=563"
                      className="attachment-original size-original"
                      alt="Đội ngũ nhân sự y bác sĩ Doctor Check"
                    />
                  </div>
                  <style>{`#image_887520188 { width: 100%; }`}</style>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          #section_1650923643 {
            padding-top: 0px;
            padding-bottom: 0px;
            background-color: rgb(238, 247, 250);
          }
          #section_1650923643 .ux-shape-divider--bottom svg {
            height: 45px;
            --divider-width: 100%;
          }
          #section_1650923643 .ux-shape-divider--bottom .ux-shape-fill {
            fill: rgb(255, 255, 255);
          }
          @media (min-width: 550px) {
            #section_1650923643 .ux-shape-divider--bottom svg {
              height: 122px;
            }
          }
        `}</style>
      </section>

      {/* Gap separator */}
      <div id="gap-46743503" className="gap-element clearfix" style={{ display: 'block', height: 'auto' }}>
        <style>{`
          #gap-46743503 {
            padding-top: 110px;
          }
          @media (min-width: 550px) {
            #gap-46743503 {
              padding-top: 150px;
            }
          }
        `}</style>
      </div>

      {/* SECTION 4: Commitments (#section_345862875) */}
      <section className="section section-commit" id="section_345862875">
        <div className="section-bg fill">
          <img
            decoding="async"
            width="2160"
            height="1281"
            src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/537ff6d1-0475-4a94-7287-9d25b39fd000/w=2160,h=1281"
            className="bg attachment-original size-original"
            alt="Cam kết từ Doctor Check"
          />
        </div>

        <div className="section-content relative">
          <div className="img has-hover tag-heading x md-x lg-x y md-y lg-y" id="image_481707472">
            <div className="img-inner dark">
              <img
                decoding="async"
                width="86"
                height="87"
                src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/a67915b2-e409-4b83-2b31-fd951c9ca300/w=86,h=87"
                className="attachment-original size-original"
                alt="Logo biểu tượng Doctor Check"
              />
            </div>
            <style>{`#image_481707472 { width: 6%; min-width: 48px; margin: 0 auto; display: block; }`}</style>
          </div>

          <div className="row row-collapse" id="row-545300085">
            <div id="col-1948447277" className="col heading small-12 large-12">
              <div className="col-inner">
                <div id="text-2480890306" className="text heading">
                  <h2>Cam Kết Từ Doctor Check Giúp Bạn An Tâm Tầm Soát Bệnh</h2>
                  <style>{`#text-2480890306 { text-align: center; }`}</style>
                </div>
              </div>
              <style>{`
                #col-1948447277 > .col-inner {
                  margin: 20px 0px 0px 0px;
                }
                @media (min-width: 550px) {
                  #col-1948447277 > .col-inner {
                    margin: 75px 0px 0px 0px;
                  }
                }
              `}</style>
            </div>
          </div>

          <div className="row row-commit" id="row-1105690158">
            {/* Card 1 */}
            <div id="col-500839997" className="col medium-4 small-12 large-4">
              <div className="col-inner">
                <div className="icon-box featured-box icon-box-center text-center">
                  <div className="icon-box-img" style={{ width: '80px' }}>
                    <div className="icon">
                      <div className="icon-inner">
                        <img
                          decoding="async"
                          width="80"
                          height="80"
                          src="/sites/doctorcheck-vn/root/images/center-dc.svg"
                          className="attachment-medium size-medium"
                          alt="Trung tâm đầu tiên chuyên sâu"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="icon-box-text last-reset">
                    <div id="text-1839629188" className="text">
                      <h3 className="center">Trung Tâm Đầu Tiên Chuyên Sâu Tầm Soát Bệnh</h3>
                      <p>
                        Tập trung chuyên sâu vào 01 chuyên khoa Nội tổng quát, Doctor Check quy tụ các bác sĩ giàu kinh nghiệm đến từ nhiều bệnh viện lớn ở TP.HCM. Qua đó mang đến các giải pháp tầm soát chuyên sâu, giúp khách hàng sớm phát hiện các vấn đề tiềm ẩn để chăm sóc sức khỏe đúng cách.
                      </p>
                      <style>{`#text-1839629188 { text-align: left; }`}</style>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div id="col-766002316" className="col medium-4 small-12 large-4">
              <div className="col-inner">
                <div className="icon-box featured-box icon-box-center text-center">
                  <div className="icon-box-img" style={{ width: '80px' }}>
                    <div className="icon">
                      <div className="icon-inner">
                        <img
                          decoding="async"
                          width="80"
                          height="80"
                          src="/sites/doctorcheck-vn/root/images/center-dc.svg"
                          className="attachment-medium size-medium"
                          alt="Tư vấn trung thực"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="icon-box-text last-reset">
                    <div id="text-3577912054" className="text">
                      <h3 className="center">Tư Vấn Trung Thực, Dựa Vào Y Học Chứng Cứ 100%</h3>
                      <p>
                        Doctor Check đảm bảo mọi chẩn đoán cho khách hàng đều dựa trên 100% chỉ số xét nghiệm và Y học chứng cứ. Bác sĩ khoanh vùng chỉ số bất thường để giải thích cặn kẽ và tư vấn trung thực, chỉ định ĐÚNG – ĐỦ các hạng mục thật sự cần thiết với tình trạng sức khỏe của bạn.
                      </p>
                      <style>{`#text-3577912054 { text-align: left; }`}</style>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div id="col-528857879" className="col medium-4 small-12 large-4">
              <div className="col-inner">
                <div className="icon-box featured-box icon-box-center text-center">
                  <div className="icon-box-img" style={{ width: '80px' }}>
                    <div className="icon">
                      <div className="icon-inner">
                        <img
                          decoding="async"
                          width="80"
                          height="80"
                          src="/sites/doctorcheck-vn/root/images/center-dc.svg"
                          className="attachment-medium size-medium"
                          alt="Quy trình tầm soát nhanh chóng"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="icon-box-text last-reset">
                    <div id="text-3253495481" className="text">
                      <h3 className="center">Quy Trình Tầm Soát Nhanh Chóng, Trong 60-90 Phút</h3>
                      <p>
                        Nhờ trang bị hệ thống máy móc xét nghiệm, nội soi hiện đại giúp quy trình tầm soát rút ngắn đáng kể, CHỈ 60 – 90 PHÚT bạn có thể hoàn tất các hạng mục. Chưa kể bạn có thể đặt hẹn ngay tại nhà trên ứng dụng Doctor Check Member, không phải chờ đợi bốc số mất thời gian.
                      </p>
                      <style>{`#text-3253495481 { text-align: left; }`}</style>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div id="col-1752375708" className="col medium-4 small-12 large-4">
              <div className="col-inner">
                <div className="icon-box featured-box icon-box-center text-center">
                  <div className="icon-box-img" style={{ width: '80px' }}>
                    <div className="icon">
                      <div className="icon-inner">
                        <img
                          decoding="async"
                          width="80"
                          height="80"
                          src="/sites/doctorcheck-vn/root/images/center-dc.svg"
                          className="attachment-medium size-medium"
                          alt="Kết nối với chuyên gia bác sĩ"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="icon-box-text last-reset">
                    <div id="text-2307299083" className="text">
                      <h3 className="center">Kết Nối Bạn Với Chuyên Gia Bác Sĩ Hàng Đầu</h3>
                      <p>
                        Doctor Check hiện đang liên kết với nhiều bệnh viện lớn tại Việt Nam. Trường hợp kết quả khám phát hiện bất thường, trung tâm sẽ hỗ trợ bạn kết nối với đội ngũ chuyên gia bác sĩ hàng đầu, giúp quá trình điều trị bệnh đạt hiệu quả cao và nhanh chóng hồi phục sức khỏe.
                      </p>
                      <style>{`#text-2307299083 { text-align: left; }`}</style>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5 */}
            <div id="col-874552664" className="col medium-4 small-12 large-4">
              <div className="col-inner">
                <div className="icon-box featured-box icon-box-center text-center">
                  <div className="icon-box-img" style={{ width: '80px' }}>
                    <div className="icon">
                      <div className="icon-inner">
                        <img
                          decoding="async"
                          width="80"
                          height="80"
                          src="/sites/doctorcheck-vn/root/images/center-dc.svg"
                          className="attachment-medium size-medium"
                          alt="Tư vấn sống khỏe sống thọ"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="icon-box-text last-reset">
                    <div id="text-2050244767" className="text">
                      <h3 className="center">Tư Vấn Cách Để Bạn Sống Khỏe, Sống Thọ</h3>
                      <p>
                        Ngoài thăm khám, bác sĩ còn tư vấn và đưa lời khuyên về ăn uống, nghỉ ngơi, tập luyện,… cho bạn trở thành Bác sĩ của chính mình. Đặc biệt bạn dễ dàng trao đổi &amp; nhận tư vấn miễn phí từ bác sĩ ngay trên ứng dụng Doctor Check Member, từ đó chủ động chăm sóc sức khỏe mỗi ngày!
                      </p>
                      <style>{`#text-2050244767 { text-align: left; }`}</style>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          #section_345862875 {
            padding-top: 30px;
            padding-bottom: 30px;
          }
          #section_345862875 .section-bg img {
            object-position: top;
          }
        `}</style>
      </section>

      {/* SECTION 5: Gallery (#section_1753705268) */}
      <section className="section section-gallery about" id="section_1753705268">
        <div className="section-bg fill"></div>
        <div className="section-content relative">
          <div className="row" id="row-29717823">
            <div id="col-2037639663" className="col small-12 large-12">
              <div className="col-inner">
                <div id="text-1455218183" className="text">
                  <h2>Khám Phá Không Gian Phòng Khám Doctor Check</h2>
                  <p>
                    Doctor Check đầu tư, xây dựng cơ sở vật chất khang trang, vô khuẩn nghiêm ngặt theo tiêu chuẩn Bộ Y tế,
                    <br />
                    mang đến trải nghiệm thăm khám Thoái mái – An Tâm – Chuẩn 5 sao cho khách hàng:
                  </p>
                  <style>{`#text-1455218183 { text-align: center; }`}</style>
                </div>
              </div>
            </div>
          </div>

          <div className="dc-gallery-wrapper row row-collapse">
            {/* Accordion / Tab Buttons */}
            <div className="dc-accordion col large-4 medium-4 small-12">
              <button
                type="button"
                className={`accordion-btn ${selectedTab === 'all' ? 'active' : ''}`}
                onClick={() => handleTabChange('all')}
              >
                <span>Tất cả hình ảnh ({GALLERY_ITEMS.length})</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              <button
                type="button"
                className={`accordion-btn ${selectedTab === 'group-0' ? 'active' : ''}`}
                onClick={() => handleTabChange('group-0')}
              >
                <span>Phòng khám / tư vấn (6)</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              <button
                type="button"
                className={`accordion-btn ${selectedTab === 'group-1' ? 'active' : ''}`}
                onClick={() => handleTabChange('group-1')}
              >
                <span>Phòng tầm soát nội soi (4)</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              <button
                type="button"
                className={`accordion-btn ${selectedTab === 'group-2' ? 'active' : ''}`}
                onClick={() => handleTabChange('group-2')}
              >
                <span>Quầy lễ tân đón khách (5)</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>

            {/* Gallery Carousel Display */}
            <div className="dc-carousel-container col large-8 medium-8 small-12">
              <div className="relative overflow-hidden rounded-2xl bg-gray-100 shadow-md">
                {/* Main Large Slide */}
                <div className="relative aspect-[1680/1120] w-full bg-black/5">
                  {currentSlide && (
                    <img
                      decoding="async"
                      width="1680"
                      height="1120"
                      src={`https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/${currentSlide.imgId}/w=1680,h=1120`}
                      className="w-full h-full object-cover transition-opacity duration-300"
                      alt={currentSlide.alt}
                    />
                  )}

                  {/* Navigation Arrows */}
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    className="gallery-nav-btn prev-btn"
                    aria-label="Hình ảnh trước"
                  >
                    <svg viewBox="0 0 40 40" width="24" height="24" fill="currentColor">
                      <path d="M25.5 30.932 11 16.332 25.5 1.832 29.8 6.232 19.8 16.332 29.8 26.532Z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    className="gallery-nav-btn next-btn"
                    aria-label="Hình ảnh tiếp theo"
                  >
                    <svg viewBox="0 0 40 40" width="24" height="24" fill="currentColor">
                      <path d="M14.5 0.932 29 15.532 14.5 30.032 10.2 25.632 20.2 15.532 10.2 5.332Z" />
                    </svg>
                  </button>

                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {activeSlideIndex + 1} / {displayedGallery.length}
                  </div>
                </div>

                {/* Thumbnails Filmstrip */}
                <div className="p-3 bg-white border-t border-gray-100 overflow-x-auto">
                  <div className="flex gap-2.5 min-w-max">
                    {displayedGallery.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveSlideIndex(index)}
                        className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                          activeSlideIndex === index
                            ? 'border-[#00475B] scale-105 shadow-md'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          decoding="async"
                          width="280"
                          height="280"
                          src={`https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/${item.imgId}/w=280,h=280,fit=crop`}
                          className="w-full h-full object-cover"
                          alt={item.alt}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          #section_1753705268 {
            padding-top: 30px;
            padding-bottom: 30px;
          }
        `}</style>
      </section>

      {/* SECTION 6: Facilities / Equipment (#section_1667685864) */}
      <section className="section section-facilities about" id="section_1667685864">
        <div className="section-bg fill"></div>
        <div className="section-content relative">
          <div className="row row-collapse" id="row-1810861643">
            <div id="col-603412031" className="col heading small-12 large-12">
              <div className="col-inner">
                <div id="text-1993858298" className="text">
                  <h2>Trang Bị Hệ Thống Máy Móc Hiện Đại</h2>
                  <style>{`
                    #text-1993858298 {
                      font-size: 1.3rem;
                      text-align: center;
                    }
                  `}</style>
                </div>
                <div id="text-1576168549" className="text">
                  <p>
                    Nhằm mang đến trải nghiệm tầm soát sức khỏe thoải mái, đảm bảo kết quả chuẩn xác, Doctor Check chú trọng đầu tư hệ thống máy móc xét nghiệm, chẩn đoán hình ảnh, nội soi hiện đại chuẩn quốc tế. Các trang thiết bị đều đến từ những hãng nổi tiếng như Fujifilm, Olympus, Abbott, Roche,…
                  </p>
                  <style>{`
                    #text-1576168549 {
                      text-align: center;
                    }
                  `}</style>
                </div>
              </div>
            </div>
          </div>

          <div className="row row-collapse align-equal row-facilities" id="row-302981111">
            {/* Box 1 */}
            <div id="col-432620694" className="col medium-4 small-12 large-4">
              <div className="col-inner">
                <div className="box has-hover box-overlay dark box-text-bottom">
                  <div className="box-image">
                    <div className="image-overlay-add">
                      <img
                        decoding="async"
                        width="874"
                        height="582"
                        src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/78304e55-5a75-4c92-4e70-284df81aa800/w=874,h=582"
                        alt="Hệ thống máy nội soi Olympus & Fujifilm"
                      />
                      <div className="overlay" style={{ backgroundColor: 'rgba(0, 71, 91, 0.4)' }}></div>
                    </div>
                  </div>
                  <div className="box-text text-center">
                    <div className="box-text-inner">
                      <div id="text-1165384415" className="text">
                        <h3 className="capitalize">Hệ thống máy nội soi</h3>
                        <p>
                          Máy nội soi Olympus EVIS-X1 CV-1500 &amp; Máy nội soi Fujifilm EP-7000 tích hợp nhiều công nghệ tiên tiến, cho hình ảnh rõ nét, giúp Bác Sĩ đánh giá chính xác tổn thương.
                        </p>
                        <style>{`#text-1165384415 { font-size: 1.1rem; }`}</style>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2 */}
            <div id="col-9020959" className="col medium-4 small-12 large-4">
              <div className="col-inner">
                <div className="box has-hover box-overlay dark box-text-bottom">
                  <div className="box-image">
                    <div className="image-overlay-add">
                      <img
                        decoding="async"
                        width="874"
                        height="582"
                        src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/703a1139-9dab-4e78-b6e3-2c43858c6400/w=874,h=582"
                        alt="Hệ thống máy xét nghiệm tự động"
                      />
                      <div className="overlay" style={{ backgroundColor: 'rgba(0, 71, 91, 0.4)' }}></div>
                    </div>
                  </div>
                  <div className="box-text text-center">
                    <div className="box-text-inner">
                      <div id="text-3843227644" className="text">
                        <h3 className="capitalize">Hệ thống máy xét nghiệm</h3>
                        <p>
                          Các máy xét nghiệm đến từ hãng: Abbott, Roche, Olympus, Cobas,... phân tích các mẫu hoàn toàn tự động, giúp chẩn đoán bệnh lý tiêu hóa – gan mật và tầm soát ung thư hệ tiêu hóa.
                        </p>
                        <style>{`#text-3843227644 { font-size: 1.1rem; }`}</style>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 3 */}
            <div id="col-2072686716" className="col medium-4 small-12 large-4">
              <div className="col-inner">
                <div className="box has-hover box-overlay dark box-text-bottom">
                  <div className="box-image">
                    <div className="image-overlay-add">
                      <img
                        decoding="async"
                        width="874"
                        height="582"
                        src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/4a217bbc-bd4a-4234-c715-bea676e88b00/w=874,h=582"
                        alt="Hệ thống máy siêu âm màu ACUSON Juniper"
                      />
                      <div className="overlay" style={{ backgroundColor: 'rgba(0, 71, 91, 0.4)' }}></div>
                    </div>
                  </div>
                  <div className="box-text text-center">
                    <div className="box-text-inner">
                      <div id="text-1117898589" className="text">
                        <h3 className="capitalize">Hệ thống máy siêu âm màu</h3>
                        <p>
                          ACUSON Juniper từ hãng Siemens (Mỹ) cao cấp có thiết kế nhỏ gọn, màn hình cảm ứng lớn, hệ thống đầu đò đa dạng, giúp thu được hình ảnh chất lượng cao trong siêu âm cận lâm sàng tiêu hóa.
                        </p>
                        <style>{`#text-1117898589 { font-size: 1.1rem; }`}</style>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 4 */}
            <div id="col-1573737573" className="col medium-4 small-12 large-4">
              <div className="col-inner">
                <div className="box has-hover box-overlay dark box-text-bottom">
                  <div className="box-image">
                    <div className="image-overlay-add">
                      <img
                        decoding="async"
                        width="874"
                        height="582"
                        src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/d0946de2-a6a8-4c32-82c6-f2da3e64a300/w=874,h=582"
                        alt="Máy chụp X-quang Vikomed"
                      />
                      <div className="overlay" style={{ backgroundColor: 'rgba(0, 71, 91, 0.4)' }}></div>
                    </div>
                  </div>
                  <div className="box-text text-center">
                    <div className="box-text-inner">
                      <div id="text-1091460360" className="text">
                        <h3 className="capitalize">Máy chụp X-quang</h3>
                        <p>
                          Hệ thống máy chụp X quang từ hãng Vikomed (Liên doanh Việt - Hàn) có thể thu nhận hình ảnh cả tư thế đứng &amp; nằm, được sử dụng để khảo sát các bệnh lý bụng ngoại khoa, liệt ruột, tắc ruột,....
                        </p>
                        <style>{`#text-1091460360 { font-size: 1.1rem; }`}</style>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 5 */}
            <div id="col-2051872659" className="col medium-4 small-12 large-4">
              <div className="col-inner">
                <div className="box has-hover box-overlay dark box-text-bottom">
                  <div className="box-image">
                    <div className="image-overlay-add">
                      <img
                        decoding="async"
                        width="874"
                        height="582"
                        src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/5635de35-86cf-437c-07a6-91b577176c00/w=874,h=582"
                        alt="Máy đo điện tim Fukuda FX 8100"
                      />
                      <div className="overlay" style={{ backgroundColor: 'rgba(0, 71, 91, 0.4)' }}></div>
                    </div>
                  </div>
                  <div className="box-text text-center">
                    <div className="box-text-inner">
                      <div id="text-3104017917" className="text">
                        <h3 className="capitalize">Máy đo điện tim 3 kênh</h3>
                        <p>
                          Máy FX 8100 từ hãng Fukuda (Nhật Bản) có màn hình màu LCD 7” giúp quan sát rõ dạng sóng ECG, sóng lâm sàng và nhịp tim. Kết quả in được ở nhiều định dạng, cho người dùng dễ đọc dữ liệu.
                        </p>
                        <style>{`#text-3104017917 { font-size: 1.1rem; }`}</style>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 6 */}
            <div id="col-28170877" className="col medium-4 small-12 large-4">
              <div className="col-inner">
                <div className="box has-hover box-overlay dark box-text-bottom">
                  <div className="box-image">
                    <div className="image-overlay-add">
                      <img
                        decoding="async"
                        width="874"
                        height="582"
                        src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/878ede28-24d7-4976-be0d-f183342b3600/w=874,h=582"
                        alt="Máy Đo vi khuẩn H. pylori qua hơi thở"
                      />
                      <div className="overlay" style={{ backgroundColor: 'rgba(0, 71, 91, 0.4)' }}></div>
                    </div>
                  </div>
                  <div className="box-text text-center">
                    <div className="box-text-inner">
                      <div id="text-3568759124" className="text">
                        <h3>Máy Đo H. pylori</h3>
                        <p>
                          Máy FanHp từ hãng Fisher (Đức) được sử dụng để phân tích urease nhanh thông qua hơi thở, giúp sớm phát hiện nguy cơ mắc vi khuẩn Helicobacter pylori (HP) gây các bệnh lý trong dạ dày.
                        </p>
                        <style>{`#text-3568759124 { font-size: 1.1rem; }`}</style>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="gap-1008381652" className="gap-element clearfix" style={{ display: 'block', height: 'auto' }}>
            <style>{`#gap-1008381652 { padding-top: 30px; }`}</style>
          </div>

          {/* Customer Reviews & Video Section */}
          <div className="row align-middle row-check" id="row-1065450447">
            <div id="col-1893134767" className="col medium-6 small-12 large-6">
              <div className="col-inner">
                <h2>Kiểm Chứng Ngay Qua Những Chia Sẻ Từ Khách Hàng</h2>
                <Link
                  href="/lien-he"
                  className="button secondary button-gradient-secondary"
                  style={{ borderRadius: '99px' }}
                >
                  <span>Liên hệ DoctorCheck để được tư vấn ngay hôm nay</span>
                  <i className="icon-angle-right" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </i>
                </Link>
              </div>
            </div>

            <div id="col-1764750540" className="col medium-6 small-12 large-6">
              <div className="col-inner">
                <div className="banner has-hover" id="banner-1117352747">
                  <div className="banner-inner fill relative overflow-hidden rounded-2xl">
                    <div className="banner-bg fill">
                      <img
                        decoding="async"
                        width="887"
                        height="504"
                        src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/8dfc2229-daef-4844-ff61-aace3ff32e00/w=887,h=504"
                        className="bg attachment-large size-large w-full h-full object-cover"
                        alt="Video chia sẻ từ khách hàng Doctor Check"
                      />
                    </div>

                    <div className="banner-layers container absolute inset-0 flex items-center justify-center">
                      <div className="video-button-wrapper" style={{ fontSize: '183%' }}>
                        <button
                          type="button"
                          onClick={() => setIsVideoModalOpen(true)}
                          className="button open-video icon circle is-outline is-xlarge flex items-center justify-center w-16 h-16 rounded-full bg-white/90 text-[#00475B] hover:bg-[#FFB500] hover:scale-110 transition-all shadow-xl"
                          aria-label="Phát video chia sẻ khách hàng"
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          #section_1667685864 {
            padding-top: 30px;
            padding-bottom: 30px;
          }
        `}</style>
      </section>

      {/* SECTION 7: Banner CTA (#section_1378931973) */}
      <section className="section section-banner-cta" id="section_1378931973">
        <div className="section-bg fill"></div>
        <div className="section-content relative">
          <div className="row" id="row-516770334">
            <div id="col-106708251" className="col small-12 large-12">
              <div className="col-inner">
                {/* Desktop Banner */}
                <div className="banner has-hover hide-for-small relative rounded-2xl overflow-hidden shadow-lg" id="banner-315037503">
                  <div className="banner-inner fill">
                    <div className="banner-bg fill">
                      <img
                        decoding="async"
                        width="1709"
                        height="795"
                        src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/4c785467-130c-4cdf-cf32-c3e216d74200/w=1709,h=795"
                        className="bg attachment-original size-original w-full h-full object-cover"
                        alt="Đặt lịch tầm soát bệnh Doctor Check"
                      />
                    </div>

                    <div className="banner-layers container absolute inset-0 flex items-center justify-end pr-12">
                      <div id="text-box-1560754516" className="text-box banner-layer text-center max-w-md bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/40">
                        <div className="text-box-content text">
                          <div className="text-inner text-center">
                            <div id="text-731616056" className="text dc-title yellow mb-3">
                              <h2 className="text-2xl font-bold text-[#00475B] leading-snug">
                                <span className="text-[#FFB500]">Doctor Check</span><br />
                                Tầm Soát Bệnh Để Sống Thọ Hơn
                              </h2>
                            </div>

                            <div id="text-906975906" className="text mb-4 text-xs font-semibold text-gray-700">
                              <div className="footer-cta-content space-y-1">
                                <p className="font-bold text-[#00475B]">Thời gian làm việc</p>
                                <p>Thứ 2 - Thứ 7: 6h - 15h</p>
                                <p>Chủ nhật: 7h - 12h</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setIsBookingModalOpen(true)}
                              className="button secondary lowercase btn-appointment px-6 py-2.5 rounded-full bg-[#FFB500] text-[#00475B] font-bold text-xs uppercase tracking-wider hover:bg-[#e0a000] shadow-md transition-all"
                            >
                              <span>Đặt hẹn ngay</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Banner */}
                <div className="banner has-hover show-for-small relative rounded-2xl overflow-hidden shadow-md" id="banner-1878632260">
                  <div className="banner-inner fill">
                    <div className="banner-bg fill">
                      <img
                        decoding="async"
                        width="545"
                        height="963"
                        src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/2ffefde0-bef2-422f-4060-a4654ffb5b00/w=545,h=963"
                        className="bg attachment-original size-original w-full h-full object-cover"
                        alt="Đặt lịch tầm soát bệnh Doctor Check"
                      />
                    </div>

                    <div className="banner-layers container absolute inset-0 flex items-center justify-center p-4">
                      <div id="text-box-1553581033" className="text-box banner-layer text-center bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl w-full">
                        <div className="text-box-content text">
                          <div className="text-inner text-center">
                            <div id="text-2672332172" className="text dc-title yellow mb-3">
                              <h2 className="text-xl font-bold text-[#00475B]">
                                <span className="text-[#FFB500]">Doctor Check</span><br />
                                Tầm Soát Bệnh Để Sống Thọ Hơn
                              </h2>
                            </div>

                            <div id="text-3339408212" className="text mb-4 text-xs font-semibold text-gray-700">
                              <div className="footer-cta-content space-y-0.5">
                                <p className="font-bold text-[#00475B]">Thời gian làm việc</p>
                                <p>Thứ 2 - Thứ 7: 6h - 15h</p>
                                <p>Chủ nhật: 7h - 12h</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setIsBookingModalOpen(true)}
                              className="button secondary lowercase btn-appointment w-full py-3 rounded-full bg-[#FFB500] text-[#00475B] font-bold text-xs uppercase shadow-md"
                            >
                              <span>Đặt hẹn ngay</span>
                            </button>
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

        <style>{`
          #section_1378931973 {
            padding-top: 30px;
            padding-bottom: 30px;
          }
        `}</style>
      </section>

      {/* Video Modal Popup */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
            <button
              type="button"
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-[#FFB500] hover:text-[#00475B] transition-colors"
              aria-label="Đóng video"
            >
              ✕
            </button>
            <iframe
              src="https://www.youtube.com/embed/vxO37WAgwSc?autoplay=1"
              title="Chia sẻ từ khách hàng Doctor Check"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Appointment Popup Modal (#appointment-popup) */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-lg p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-4 right-4 text-2xl font-bold text-gray-400 hover:text-gray-800 transition-colors"
              aria-label="Đóng cửa sổ"
            >
              ×
            </button>

            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#00475B]">Đăng ký tư vấn</h2>
              <p className="text-xs text-gray-500 mt-1">
                Bác sĩ Chuyên khoa Doctor Check sẽ liên hệ tư vấn trong 15 phút
              </p>
            </div>

            {submitSuccess ? (
              <div className="p-6 bg-[#EEF7FA] rounded-2xl text-center border border-[#87E3DB]">
                <div className="w-12 h-12 rounded-full bg-[#00A896] text-white flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  ✓
                </div>
                <h3 className="font-bold text-[#00475B] text-base mb-1">Đăng ký thành công!</h3>
                <p className="text-xs text-gray-600">
                  Doctor Check đã nhận được thông tin và sẽ gọi hỗ trợ Quý khách sớm nhất.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-3.5">
                {submitError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Tên của Bạn *</label>
                    <input
                      type="text"
                      required
                      placeholder="Họ và tên"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#00475B]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Năm sinh</label>
                    <input
                      type="number"
                      placeholder="VD: 1985"
                      value={formData.customer_year}
                      onChange={(e) => setFormData({ ...formData, customer_year: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#00475B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Số điện thoại liên hệ"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#00475B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Gói dịch vụ quan tâm</label>
                  <select
                    value={formData.services_list}
                    onChange={(e) => setFormData({ ...formData, services_list: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#00475B] bg-white"
                  >
                    <option value="">Chọn gói dịch vụ</option>
                    <option value="Gói Khuyến Cáo">Gói Khuyến Cáo</option>
                    <option value="Gói Chuyên Sâu">Gói Chuyên Sâu</option>
                    <option value="Gói Sống Thọ">Gói Sống Thọ</option>
                    <option value="Nội soi tiêu hóa">Nội soi tiêu hóa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Ngày mong muốn khám</label>
                  <input
                    type="date"
                    value={formData.date_booking}
                    onChange={(e) => setFormData({ ...formData, date_booking: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#00475B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 rounded-xl bg-[#00475B] hover:bg-[#003848] text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-md"
                >
                  {isSubmitting ? 'Đang gửi thông tin...' : 'Đặt lịch ngay →'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}


    </div>
  );
}
