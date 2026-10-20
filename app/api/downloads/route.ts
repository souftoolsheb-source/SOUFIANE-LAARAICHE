import { NextResponse } from 'next/server';
import { getAppState } from '@/lib/server/state';

export async function GET() {
  const state = getAppState();

  // Sort: active first, then by date descending
  const sorted = [...state.downloads].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const active = sorted.filter(
    (d) => d.status === 'downloading' || d.status === 'queued'
  );
  const history = sorted.filter(
    (d) =>
      d.status === 'completed' || d.status === 'failed' || d.status === 'cancelled'
  );

  return NextResponse.json({
    active,
    history,
    all: sorted,
    metrics: {
      activeCount: active.length,
      historyCount: history.length,
    },
  });
}
