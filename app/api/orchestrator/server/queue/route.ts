import { NextResponse } from 'next/server';
import { buildJobQueue, Job } from '@/lib/orchestrator';
import { getQueue, setQueue, loadQueueFromDisk, saveQueueToDisk } from '@/lib/serverOrchestrator';

export const runtime = 'nodejs';

export async function GET() {
	loadQueueFromDisk();
	return NextResponse.json({ success: true, data: getQueue() });
}

export async function POST(req: Request) {
	const body = await req.json().catch(()=>({}));
	const { patternIds, Lmax, kMin, kMax, historySize, batchSize } = body || {};
	if (!Array.isArray(patternIds) || !Lmax || !kMin || !kMax || !historySize || !batchSize) {
		return NextResponse.json({ success: false, error: 'params invalid' }, { status: 400 });
	}
	const q = buildJobQueue(patternIds, Number(Lmax), Number(kMin), Number(kMax), Number(historySize), Number(batchSize));
	setQueue(q, { resetStatus: true });
	saveQueueToDisk(q);
	return NextResponse.json({ success: true, data: { total: q.length } });
}

export async function PUT(req: Request) {
	const body = await req.json().catch(()=>({}));
	const q = (body?.queue ?? []) as Job[];
	if (!Array.isArray(q)) return NextResponse.json({ success: false, error: 'queue invalid' }, { status: 400 });
	setQueue(q, { resetStatus: false });
	saveQueueToDisk(q);
	return NextResponse.json({ success: true });
}
