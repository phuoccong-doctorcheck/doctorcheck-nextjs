import { NextRequest, NextResponse } from 'next/server';
import { CLINIC_INFO } from '@/lib/data/clinic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_name, customer_phone, services_list, date_booking } = body;

    // Validation
    if (!customer_name || !customer_name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập họ và tên của bạn' },
        { status: 400 }
      );
    }

    if (!customer_phone || !customer_phone.trim()) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập số điện thoại liên hệ' },
        { status: 400 }
      );
    }

    // Phone format check (Vietnamese standard)
    const cleanPhone = customer_phone.replace(/\s+/g, '');
    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, message: 'Số điện thoại không hợp lệ (gồm 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09)' },
        { status: 400 }
      );
    }

    // Server-side audit log for CRM / Webhook integration
    console.log('[BOOKING RECEIVED]', {
      name: customer_name,
      phone: cleanPhone,
      service: services_list || 'Chưa chọn gói',
      date: date_booking || 'Chưa chọn ngày',
      timestamp: new Date().toISOString(),
      attribution: {
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
        gclid: body.gclid,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Đặt lịch tư vấn thành công! Bác sĩ Doctor Check sẽ liên hệ hỗ trợ bạn trong vòng 15 phút.',
      bookingId: `DC-${Date.now().toString().slice(-6)}`,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('Error processing booking:', err);
    return NextResponse.json(
      { success: false, message: `Có lỗi xảy ra, vui lòng liên hệ hotline ${CLINIC_INFO.hotlineFormatted} để được hỗ trợ ngay`, error: errorMessage },
      { status: 500 }
    );
  }
}
