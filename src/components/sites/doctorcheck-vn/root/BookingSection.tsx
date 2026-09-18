'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { CLINIC_INFO } from '@/lib/data/clinic';
import type { SectionsMetaConfig } from '@/lib/data/homepage';
import type { ClinicInfo } from '@/types/doctorcheck';

interface BookingSectionProps {
  header?: SectionsMetaConfig['bookingHeader'];
  clinicInfo?: ClinicInfo;
}

export function BookingSection({ header, clinicInfo }: BookingSectionProps = {}) {
  const title = header?.title || 'Tầm Soát Bệnh Để Sống Khỏe &\nSống Thọ Hơn';
  const formTitle = header?.formTitle || 'Doctor Check sẵn sàng tư vấn, giúp khách hàng\ngiải quyết nỗi lo về sức khỏe!';
  const hotlineFormatted = clinicInfo?.hotline || CLINIC_INFO.hotlineFormatted;
  const addressShort = clinicInfo?.address?.district ? `${clinicInfo.address.street}, ${clinicInfo.address.district}, ${clinicInfo.address.city}` : CLINIC_INFO.address.short;
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    services_list: 'Chọn gói dịch vụ',
    date_booking: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [bookingId, setBookingId] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const utmParams: Record<string, string> = {};
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'].forEach((key) => {
        const val = params.get(key);
        if (val) utmParams[key] = val;
      });
      utmParams.current_url = window.location.href;
    }

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, ...utmParams }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setBookingId(data.bookingId || 'DC-SUCCESS');
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Có lỗi xảy ra, vui lòng thử lại');
      }
    } catch {
      setStatus('error');
      setErrorMessage(`Không thể kết nối máy chủ, vui lòng gọi hotline ${hotlineFormatted}`);
    }
  };

  return (
    <section
      className="section section-cta relative overflow-hidden py-12 md:py-16 text-white bg-[#005060]"
      id="section_1178718493"
    >
      <div className="section-content relative container max-w-[1240px] mx-auto px-4 md:px-6 z-10">
        {/* Top Section Heading matching 1:1 on 2 lines */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-white font-bold text-[26px] sm:text-[30px] md:text-[34px] leading-[1.3] text-center drop-shadow-sm" style={{ whiteSpace: 'pre-line' }}>
            {title}
          </h2>
        </div>

        {/* Anchor for Smooth Scrolling */}
        <span id="tu-van" className="scroll-to block -mt-20 pt-20" />

        {/* Main Floating White Card Container matching Image 2 */}
        <div className="max-w-[1040px] mx-auto bg-white rounded-[20px] p-6 sm:p-8 md:p-9 shadow-[0_14px_40px_rgba(0,0,0,0.16)] text-[#2A2F38]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left Column: Doctor Diagnostic Graphic with Rounded Corners */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full aspect-[566/460] rounded-[16px] overflow-hidden shadow-sm">
                <Image
                  src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/0b7df4e6-60fa-42b4-f53b-0adb11d32900/w=566,h=510"
                  alt="Đội ngũ Bác sĩ Doctor Check sẵn sàng tư vấn"
                  fill
                  sizes="(max-width: 1024px) 100vw, 440px"
                  className="object-cover object-center rounded-[16px]"
                />
              </div>
            </div>

            {/* Right Column: Title + Form + Info Box */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              {/* Form Title */}
              <h3 className="text-[#1F2937] font-bold text-[18.5px] sm:text-[19.5px] md:text-[20.5px] leading-[1.4] text-center mb-4 sm:mb-5" style={{ whiteSpace: 'pre-line' }}>
                {formTitle}
              </h3>

              {status === 'success' ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-[#005570]">
                    Đăng Ký Tư Vấn Thành Công!
                  </h4>
                  <p className="text-sm text-[#4D5565] max-w-sm mx-auto leading-relaxed">
                    Mã tiếp nhận: <strong className="text-[#005570] font-mono">{bookingId}</strong>. Bác sĩ chuyên khoa Doctor Check sẽ liên hệ tư vấn trong thời gian sớm nhất.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-4 px-6 py-2.5 rounded-full bg-[#005570] hover:bg-[#00475B] text-white text-sm font-bold transition-all"
                  >
                    Đăng ký lịch khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="w-full flex flex-col">
                  {status === 'error' && (
                    <div className="p-3 mb-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* 2x2 Form Inputs Grid (Desktop) / 1 Column (Mobile) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3.5">
                    {/* Input 1: Customer Name */}
                    <div>
                      <input
                        type="text"
                        name="customer_name"
                        required
                        placeholder="Tên của Bạn"
                        value={formData.customer_name}
                        onChange={handleChange}
                        className="w-full h-11 px-3.5 rounded-[8px] border border-[#E2E8F0] text-[14.5px] focus:border-[#005570] focus:ring-1 focus:ring-[#005570] outline-none text-[#2A2F38] placeholder:text-[#94A3B8] bg-white transition-colors"
                      />
                    </div>

                    {/* Input 2: Customer Phone */}
                    <div>
                      <input
                        type="tel"
                        name="customer_phone"
                        required
                        placeholder="Số điện thoại"
                        value={formData.customer_phone}
                        onChange={handleChange}
                        className="w-full h-11 px-3.5 rounded-[8px] border border-[#E2E8F0] text-[14.5px] focus:border-[#005570] focus:ring-1 focus:ring-[#005570] outline-none text-[#2A2F38] placeholder:text-[#94A3B8] bg-white transition-colors"
                      />
                    </div>

                    {/* Select 3: Service Package Selection */}
                    <div>
                      <select
                        name="services_list"
                        value={formData.services_list}
                        onChange={handleChange}
                        className="w-full h-11 px-3.5 rounded-[8px] border border-[#E2E8F0] text-[14.5px] focus:border-[#005570] focus:ring-1 focus:ring-[#005570] outline-none text-[#2A2F38] bg-white cursor-pointer transition-colors"
                      >
                        <option value="Chọn gói dịch vụ">Chọn gói dịch vụ</option>
                        <option value="Gói Khuyến Cáo">Gói Khuyến Cáo</option>
                        <option value="Gói Chuyên Sâu">Gói Chuyên Sâu</option>
                        <option value="Gói Sống Thọ">Gói Sống Thọ</option>
                        <option value="Tầm soát ung thư dạ dày">Tầm soát ung thư dạ dày</option>
                        <option value="Tầm soát ung thư đại tràng">Tầm soát ung thư đại tràng</option>
                      </select>
                    </div>

                    {/* Input 4: Booking Date */}
                    <div>
                      <input
                        type="text"
                        name="date_booking"
                        placeholder="Chọn ngày khám"
                        value={formData.date_booking}
                        onChange={handleChange}
                        className="w-full h-11 px-3.5 rounded-[8px] border border-[#E2E8F0] text-[14.5px] focus:border-[#005570] focus:ring-1 focus:ring-[#005570] outline-none text-[#2A2F38] placeholder:text-[#94A3B8] bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Centered Submit Button: GỬI YÊU CẦU → */}
                  <div className="flex justify-center mb-3.5">
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-full bg-[#005060] hover:bg-[#003848] text-white font-bold text-[14.5px] tracking-wide shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      {status === 'submitting' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang gửi thông tin...</span>
                        </>
                      ) : (
                        <>
                          <span>GỬI YÊU CẦU</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Light Blue Schedule & Location Info Box */}
                  <div className="p-3.5 sm:p-4 rounded-[10px] bg-[#F0F7F9] border border-[#005570]/8 text-left">
                    <p className="font-bold text-[#005060] text-[15px] mb-1.5">
                      Khung giờ tầm soát
                    </p>
                    <ul className="space-y-1 text-[13.5px] sm:text-[14px] text-[#334155] leading-[1.5]">
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#005060] font-bold">•</span>
                        <span>Thứ 2 – Thứ 7: 6h – 15h</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#005060] font-bold">•</span>
                        <span>Chủ Nhật: 7h – 12h</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#005060] font-bold">•</span>
                        <span>Địa chỉ: {addressShort}</span>
                      </li>
                    </ul>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
