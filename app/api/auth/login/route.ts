import { NextRequest, NextResponse } from 'next/server';
import { createAdminSession } from '@/lib/server/auth';
import { addSystemLog } from '@/lib/server/state';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور مطلوبة' },
        { status: 400 }
      );
    }

    const result = await createAdminSession(password);
    if (!result.success) {
      addSystemLog('warn', 'auth', 'محاولة تسجيل دخول فاشلة للمشرف.');
      return NextResponse.json(
        { success: false, error: 'كلمة المرور غير صحيحة.' },
        { status: 401 }
      );
    }

    addSystemLog('success', 'auth', 'تم تسجيل دخول المشرف بنجاح إلى لوحة التحكم.');
    return NextResponse.json({ success: true, token: result.token });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في معالجة طلب الدخول.' },
      { status: 500 }
    );
  }
}
