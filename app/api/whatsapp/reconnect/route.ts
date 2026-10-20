import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/server/auth';
import { getAppState, addSystemLog } from '@/lib/server/state';

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdminSession(req);
  if (!isAdmin) {
    return NextResponse.json(
      { success: false, error: 'غير مصرح بالوصول.' },
      { status: 401 }
    );
  }

  const state = getAppState();
  state.whatsapp.reconnectAttempts += 1;

  addSystemLog(
    'info',
    'whatsapp_socket',
    `بدء محاولة إعادة اتصال المقبس بالخادم (المحاولة ${state.whatsapp.reconnectAttempts}).`
  );

  return NextResponse.json({
    success: true,
    session: state.whatsapp,
  });
}
