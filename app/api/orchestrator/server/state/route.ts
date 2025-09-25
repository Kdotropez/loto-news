import { NextResponse } from 'next/server';
import { getState, startRunner, stopRunner, setBaseUrl, loadQueueFromDisk } from '@/lib/serverOrchestrator';

export const runtime = 'nodejs';

export async function GET() {
	loadQueueFromDisk();
	return NextResponse.json({ success: true, data: getState() });
}

export async function POST(req: Request) {
	const body = await req.json().catch(()=>({}));
	const { action, baseUrl, intervalMs, slice } = body || {};
	if (action === 'start') { startRunner({ base: baseUrl, intervalMs, slice }); return NextResponse.json({ success: true, data: getState() }); }
	if (action === 'stop') { stopRunner(); return NextResponse.json({ success: true, data: getState() }); }
	if (action === 'base' && typeof baseUrl === 'string') { setBaseUrl(baseUrl); return NextResponse.json({ success: true, data: getState() }); }
	return NextResponse.json({ success: false, error: 'unknown action' }, { status: 400 });
}
