import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/server/auth';
import {
  getAppState,
  generatePairingCode,
  addSystemLog,
} from '@/lib/server/state';

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdminSession(req);
  if (!isAdmin) {
    return NextResponse.json(
      { success: false, error: 'غير مصرح بالوصول.' },
      { status: 401 }
    );
  }

  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف مطلوب.' },
        { status: 400 }
      );
    }

    // Clean phone number: remove spaces and dashes
    const cleanedPhone = phoneNumber.replace(/[\s\-()]/g, '');
    if (!/^\+?[1-9]\d{7,14}$/.test(cleanedPhone)) {
      return NextResponse.json(
        {
          success: false,
          error: 'صيغة رقم الهاتف غير صحيحة. يرجى إدخال الرقم مع الرمز الدولي (مثال: +966501234567).',
        },
        { status: 400 }
      );
    }

    const state = getAppState();
    const pairingCode = generatePairingCode();
    const expiresAt = Date.now() + 120 * 1000; // 2 minutes expiry

    state.whatsapp = {
      status: 'pairing',
      phoneNumber: cleanedPhone,
      pairingCode,
      pairingCodeExpiresAt: expiresAt,
      reconnectAttempts: 0,
      lastError: undefined,
    };

    addSystemLog(
      'info',
      'whatsapp_socket',
      `تم توليد رمز اقتران جديد (${pairingCode}) للرقم ${cleanedPhone.slice(0, 5)}***. صلاحية الرمز 120 ثانية.`
    );

    return NextResponse.json({
      success: true,
      pairingCode,
      expiresAt,
      status: 'pairing',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في توليد رمز الاقتران.' },
      { status: 500 }
    );
  }
}
