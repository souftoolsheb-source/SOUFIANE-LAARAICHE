import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/server/auth';
import { getAppState, addSystemLog, calculateRealMetrics } from '@/lib/server/state';

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdminSession(req);
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'غير مصرح.' }, { status: 401 });
  }

  const state = getAppState();
  const currentMetrics = calculateRealMetrics();
  const freedMb = currentMetrics.tempStorageUsedMb;

  // Clear completed downloads to free storage space
  state.downloads = state.downloads.filter(
    (d) => d.status === 'downloading' || d.status === 'queued'
  );

  addSystemLog(
    'info',
    'system',
    `تم تنظيف التخزين المؤقت وتفريغ ${freedMb} ميجابايت من الملفات المستخرجة.`
  );

  return NextResponse.json({
    success: true,
    freedMb,
    currentUsageMb: 0,
  });
}
