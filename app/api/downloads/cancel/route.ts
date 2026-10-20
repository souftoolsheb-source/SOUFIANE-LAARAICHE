import { NextRequest, NextResponse } from 'next/server';
import { getAppState, addSystemLog } from '@/lib/server/state';

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    const state = getAppState();
    const item = state.downloads.find((d) => d.id === id);

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'المهمة غير موجودة.' },
        { status: 404 }
      );
    }

    item.status = 'cancelled';
    item.progressPercent = 0;
    addSystemLog('warn', 'downloader', `تم إلغاء مهمة التنزيل (${item.title}).`);

    return NextResponse.json({ success: true, item });
  } catch {
    return NextResponse.json(
      { success: false, error: 'تعذر إلغاء المهمة.' },
      { status: 500 }
    );
  }
}
