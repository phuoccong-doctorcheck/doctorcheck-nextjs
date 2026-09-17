'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { CLINIC_INFO } from '@/lib/data/clinic';

export function BookingSection() {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_year: '',
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

    // Extract UTM attribution parameters directly at submission time
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
      setErrorMessage(`Không thể kết nối máy chủ, vui lòng gọi hotline ${CLINIC_INFO.hotlineFormatted}`);
    }
  };

  return (
    <section className="section section-cta dark relative overflow-hidden py-10 md:py-16 text-white" id="section_1178718493">
      {/* Background Image */}
      <div className="section-bg fill absolute inset-0 z-0">
        <Image
          src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/8d532359-b30c-430c-907e-a6b16e54b400/w=1440,h=643"
          alt="Tầm Soát Bệnh Để Sống Khỏe & Sống Thọ Hơn"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#005570]/85" />
      </div>

      <div className="section-content relative container max-w-[1250px] mx-auto px-[15px] z-10">
        {/* Section Heading */}
        <div id="text-3571881848" className="text text-center mb-6">
          <h2 className="text-white font-bold text-2xl sm:text-3xl md:text-[1.7rem] leading-tight" style={{ textAlign: 'center' }}>
            Tầm Soát Bệnh Để Sống Khỏe &amp;<br />
            Sống Thọ Hơn
          </h2>
        </div>

        {/* Anchor for Smooth Scrolling */}
        <span id="tu-van" className="scroll-to block -mt-20 pt-20" />

        {/* Subtitle */}
        <div className="row row-collapse mb-6" id="row-172685516">
          <div className="col small-12 large-12 text-center">
            <div id="text-828373150" className="text">
              <p className="text-base sm:text-lg text-gray-100 font-bold">
                Doctor Check sẵn sàng tư vấn, giúp khách hàng giải quyết nỗi lo về sức khỏe!
              </p>
            </div>
          </div>
        </div>

        {/* Two Columns: Left Image + Right CF7 Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-[1100px] mx-auto" id="row-1478222956">
          {/* Left Column: Doctor Team Image */}
          <div id="col-1278166771" className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[500px] aspect-[566/510] rounded-xl overflow-hidden shadow-2xl">
              <Image
                src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/0b7df4e6-60fa-42b4-f53b-0adb11d32900/w=566,h=510"
                alt="Đội ngũ Bác sĩ Doctor Check sẵn sàng tư vấn"
                fill
                sizes="(max-width: 1024px) 100vw, 500px"
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* Right Column: Authentic Contact Form */}
          <div id="col-988383888" className="lg:col-span-6">
            <div className="bg-white/95 rounded-2xl p-6 sm:p-8 text-[#2A2F38] shadow-2xl backdrop-blur-xs border border-white/20">
              {status === 'success' ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-[#005570]">
                    Đăng Ký Tư Vấn Thành Công!
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4D5565] max-w-sm mx-auto leading-relaxed">
                    Mã tiếp nhận: <strong className="text-[#005570] font-mono">{bookingId}</strong>. Bác sĩ chuyên khoa Doctor Check sẽ liên hệ tư vấn trong thời gian sớm nhất.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-4 px-6 py-2.5 rounded-full bg-[#005570] hover:bg-[#00475B] text-white text-xs font-bold transition-all"
                  >
                    Đăng ký lịch khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="dc_form footer_form flex flex-col gap-3.5">
                  {status === 'error' && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Customer Name */}
                  <div className="dc_input">
                    <input
                      type="text"
                      name="customer_name"
                      required
                      placeholder="Tên của Bạn"
                      value={formData.customer_name}
                      onChange={handleChange}
                      className="w-full h-11 px-4 rounded-lg border border-gray-300 text-sm focus:border-[#005570] focus:ring-1 focus:ring-[#005570] outline-none text-[#2A2F38]"
                    />
                  </div>

                  {/* Customer Phone */}
                  <div className="dc_input">
                    <input
                      type="tel"
                      name="customer_phone"
                      required
                      placeholder="Số điện thoại"
                      value={formData.customer_phone}
                      onChange={handleChange}
                      className="w-full h-11 px-4 rounded-lg border border-gray-300 text-sm focus:border-[#005570] focus:ring-1 focus:ring-[#005570] outline-none text-[#2A2F38]"
                    />
                  </div>

                  {/* Service Package Selection */}
                  <div className="dc_input">
                    <select
                      name="services_list"
                      value={formData.services_list}
                      onChange={handleChange}
                      className="w-full h-11 px-4 rounded-lg border border-gray-300 text-sm focus:border-[#005570] focus:ring-1 focus:ring-[#005570] outline-none text-[#2A2F38] bg-white"
                    >
                      <option value="Chọn gói dịch vụ">Chọn gói dịch vụ</option>
                      <option value="Gói Khuyến Cáo">Gói Khuyến Cáo</option>
                      <option value="Gói Chuyên Sâu">Gói Chuyên Sâu</option>
                      <option value="Gói Sống Thọ">Gói Sống Thọ</option>
                      <option value="Tầm soát ung thư dạ dày">Tầm soát ung thư dạ dày</option>
                      <option value="Tầm soát ung thư đại tràng">Tầm soát ung thư đại tràng</option>
                    </select>
                  </div>

                  {/* Booking Date */}
                  <div className="dc_input">
                    <input
                      type="text"
                      name="date_booking"
                      placeholder="Chọn ngày khám (VD: 25/12/2026)"
                      value={formData.date_booking}
                      onChange={handleChange}
                      className="w-full h-11 px-4 rounded-lg border border-gray-300 text-sm focus:border-[#005570] focus:ring-1 focus:ring-[#005570] outline-none text-[#2A2F38]"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="dc_submit pt-1">
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full h-12 rounded-lg bg-[#FFB500] hover:bg-[#e0a000] text-[#005570] font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      {status === 'submitting' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang gửi thông tin...</span>
                        </>
                      ) : (
                        <>
                          <span>Gửi yêu cầu</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Authentic Schedule Box */}
                  <div className="box-info pt-2">
                    <div className="box-bottom p-3.5 rounded-lg bg-[#EEF7FA] border border-[#005570]/10 text-xs text-[#2A2F38]">
                      <p className="font-bold text-[#005570] mb-1.5">
                        Khung giờ tầm soát
                      </p>
                      <ul className="space-y-1 pl-4 list-disc marker:text-[#005570]">
                        <li>Thứ 2 - Thứ 7: 6h - 15h</li>
                        <li>Chủ Nhật: 7h - 12h</li>
                        <li>Địa chỉ: 429 Tô Hiến Thành, P14, Q10, Thành phố Hồ Chí Minh</li>
                      </ul>
                    </div>
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
