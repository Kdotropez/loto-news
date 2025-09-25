import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let closed = false;
      let int: any = null;
      const safeEnqueue = (chunk: Uint8Array) => {
        if (closed) return;
        try { controller.enqueue(chunk); } catch { /* stream closed */ }
      };
      const send = (type: string, data: any) => {
        if (closed) return;
        safeEnqueue(encoder.encode(`event: ${type}\n`));
        safeEnqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send('phase', { name: 'start' });
      let pct = 0;
      let best = 0;
      int = setInterval(() => {
        if (closed) return;
        pct = Math.min(100, pct + 5);
        best = Math.max(best, Math.round((Math.random() * 0.01 + 0.001 + best) * 1000) / 1000);
        send('progress', { pct });
        send('bestObjective', { val: best });
        send('note', { msg: `construction équipes • progression ${pct}%` });
        if (pct >= 100 && !closed) {
          send('phase', { name: 'done' });
          if (int) clearInterval(int);
          closed = true;
          try { controller.close(); } catch {}
        }
      }, 500);
    },
    cancel(reason) {
      // client closed connection: cleanup
      // Note: 'start' closure variables are not directly accessible here in type terms,
      // but in this runtime they are; otherwise we guard by capturing via outer scope
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  });
}


