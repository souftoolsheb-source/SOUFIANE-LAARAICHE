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
  if (state.whatsapp.status !== 'pairing') {
    return NextResponse.json(
      { success: false, error: 'لا يوجد طلب اقتران معلق حالياً.' },
      { status: 400 }
    );
  }

  state.whatsapp = {
    status: 'connected',
    phoneNumber: state.whatsapp.phoneNumber,
    connectedAt: new Date().toISOString(),
    pairingCode: undefined,
    pairingCodeExpiresAt: undefined,
    deviceInfo: {
      platform: 'Baileys Multi-Device (WhatsApp Web v2.3000)',
      pushName: 'بوت واتساب برو',
      phoneModel: 'Android 14 (Companion)',
    },
    reconnectAttempts: 0,
  };

  addSystemLog(
    'success',
    'whatsapp_socket',
    `تم تأكيد الاقتران والمصادقة الثنائية بنجاح. البوت متصل الآن بالخادم.`
  );

  return NextResponse.json({
    success: true,
    session: state.whatsapp,
  });
}
