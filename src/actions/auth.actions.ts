'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { z } from 'zod';
import { login, logout } from '@/services/auth.service';
import { sanitizeReturnTo } from '@/lib/auth/redirect';

const loginInputSchema = z.object({
  email: z.string().trim().email('Email không đúng định dạng.').min(1, 'Vui lòng nhập email.'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.'),
  returnTo: z.string().nullish(),
});

export interface LoginActionState {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
    returnTo?: string[];
  };
}

/**
 * Server Action for Administrator Login
 */
export async function loginAction(
  _prevState: LoginActionState | null,
  formData: FormData
): Promise<LoginActionState> {
  const rawReturnTo = formData.get('returnTo');
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
    returnTo: typeof rawReturnTo === 'string' ? rawReturnTo : undefined,
  };

  const parsed = loginInputSchema.safeParse(rawData);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstErrorMessage =
      fieldErrors.email?.[0] || fieldErrors.password?.[0] || 'Dữ liệu không hợp lệ.';
    return {
      success: false,
      error: firstErrorMessage,
      fieldErrors,
    };
  }

  const headerStore = await headers();
  const ipAddress =
    headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerStore.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = headerStore.get('user-agent') || 'Unknown';

  const result = await login(
    { email: parsed.data.email, password: parsed.data.password },
    { ipAddress, userAgent }
  );

  if (!result.success) {
    return {
      success: false,
      error: result.error || 'Đăng nhập không thành công.',
    };
  }

  const safeReturnTo = sanitizeReturnTo(parsed.data.returnTo);
  redirect(safeReturnTo);
}

/**
 * Server Action for Administrator Logout
 */
export async function logoutAction(): Promise<void> {
  const headerStore = await headers();
  const ipAddress =
    headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerStore.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = headerStore.get('user-agent') || 'Unknown';

  await logout({ ipAddress, userAgent });
  redirect('/admin/login/');
}
