import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const startTime = parseInt(process.env['CAMPUSOS_START_TIME'] || '0', 10);
  return NextResponse.json({
    status: 'ok',
    version: '0.1.0',
    uptime: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0,
    timestamp: new Date().toISOString(),
  });
}
