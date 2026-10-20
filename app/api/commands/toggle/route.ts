import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/server/auth';
import { getAppState, addSystemLog } from '@/lib/server/state';

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdminSession(req);
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'غير مصرح.' }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    const state = getAppState();
    const cmd = state.commands.find((c) => c.id === id);

    if (!cmd) {
      return NextResponse.json({ success: false, error: 'الأمر غير موجود.' }, { status: 404 });
    }

    cmd.enabled = !cmd.enabled;
    addSystemLog(
      'info',
      'system',
      `قام المشرف بـ ${cmd.enabled ? 'تفعيل' : 'تعطيل'} الأمر (${cmd.trigger}).`
    );

    return NextResponse.json({ success: true, command: cmd });
  } catch {
    return NextResponse.json({ success: false, error: 'حدث خطأ.' }, { status: 500 });
  }
}
