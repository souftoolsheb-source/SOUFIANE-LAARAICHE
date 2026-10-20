import { NextRequest, NextResponse } from 'next/server';
import { getAppState } from '@/lib/server/state';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get('level');
  const state = getAppState();

  let logs = state.logs;
  if (level && level !== 'all') {
    logs = logs.filter((l) => l.level === level);
  }

  return NextResponse.json({
    logs: logs.slice(0, 100),
    totalCount: state.logs.length,
  });
}

export async function DELETE() {
  const state = getAppState();
  state.logs = [];
  return NextResponse.json({ success: true });
}
