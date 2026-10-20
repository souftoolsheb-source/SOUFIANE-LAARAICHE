import { NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/server/auth';
import { addSystemLog } from '@/lib/server/state';

export async function POST() {
  await clearAdminSession();
  addSystemLog('info', 'auth', 'تم تسجيل خروج المشرف وإبطال الجلسة.');
  return NextResponse.json({ success: true });
}
