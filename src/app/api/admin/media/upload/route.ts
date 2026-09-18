import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/services/auth.service';
import { Permission, hasPermission } from '@/lib/auth/rbac';
import { mediaService } from '@/services/media.service';

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication Check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn.' },
        { status: 401 }
      );
    }

    // 2. Authorization Check (media.upload)
    const isAuthorized = hasPermission(user.roles, user.permissions, Permission.MEDIA_UPLOAD);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền tải lên media (Yêu cầu quyền media.upload).' },
        { status: 403 }
      );
    }

    // 3. Parse Multipart Form Data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const altText = (formData.get('altText') as string) || '';
    const caption = (formData.get('caption') as string) || null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy tệp tải lên trong yêu cầu.' },
        { status: 400 }
      );
    }

    // Read bytes into Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract client IP and user agent
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // 4. Process upload through MediaService
    const result = await mediaService.uploadMedia(buffer, file.name, file.type, {
      altText,
      caption,
      userId: user.id,
      userEmail: user.email,
      ipAddress,
      userAgent,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, media: result.data }, { status: 201 });
  } catch (err: unknown) {
    console.error('API_UPLOAD_ERROR:', err);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ nội bộ trong quá trình tải lên.' },
      { status: 500 }
    );
  }
}
