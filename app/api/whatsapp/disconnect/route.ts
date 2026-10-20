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
  state.whatsapp = {
    status: 'disconnected',
    phoneNumber: undefined,
    pairingCode: undefined,
    pairingCodeExpiresAt: undefined,
    connectedAt: undefined,
    deviceInfo: undefined,
    reconnectAttempts: 0,
  };

  addSystemLog(
    'warn',
    'whatsapp_socket',
    'قام المشرف بإنهاء الجلسة وفصل الحساب وتطهير مفاتيح المصادقة.'
  );

  return NextResponse.json({
    success: true,
    session: state.whatsapp,
  });
}
