import { NextResponse } from 'next/server';
import { getState, getQueue, loadQueueFromDisk } from '@/lib/serverOrchestrator';

export const runtime = 'nodejs';

export async function GET() {
	try {
		loadQueueFromDisk();
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			start(controller) {
				const send = (event: string, data: any) => controller.enqueue(encoder.encode(`event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`));
				send('hello', { ok: true });
				const timer = setInterval(() => {
					const st = getState();
					const q = getQueue();
					send('progress', { ...st, queue: undefined });
					if (st.done >= st.total && st.total > 0) send('done', { ok: true });
				}, 1000);
				controller.enqueue(encoder.encode(': keep-alive\n\n'));
				return () => clearInterval(timer);
			}
		});
		return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' } });
	} catch (e: any) {
		return NextResponse.json({ success: false, error: String(e?.message||e) }, { status: 500 });
	}
}
