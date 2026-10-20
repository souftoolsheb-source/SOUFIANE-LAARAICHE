import { NextResponse } from 'next/server';
import { getAppState, addSystemLog } from '@/lib/server/state';

export async function POST() {
  const state = getAppState();
  // Keep active, clear completed/failed/cancelled
  state.downloads = state.downloads.filter(
    (d) => d.status === 'downloading' || d.status === 'queued'
  );
  addSystemLog('info', 'downloader', 'تم تفريغ أرشيف وسجل التنزيلات السابقة.');
  return NextResponse.json({ success: true });
}
