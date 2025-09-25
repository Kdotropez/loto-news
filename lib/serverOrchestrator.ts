import fs from 'fs';
import path from 'path';
import { Job } from '@/lib/orchestrator';

const DATA_DIR = path.join(process.cwd(), 'data', 'orchestrator-server');
const QUEUE_FILE = path.join(DATA_DIR, 'queue.json');
const STATE_FILE = path.join(DATA_DIR, 'state.json');

function ensureDir() {
	try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
}

let queue: Job[] = [];
let running = false;
let runnerTimer: NodeJS.Timeout | null = null;
let lastUpdateTs = Date.now();
let baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

function loadFromDisk<T>(file: string, fallback: T): T {
	try {
		const raw = fs.readFileSync(file, 'utf-8');
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

function saveToDisk<T>(file: string, obj: T) {
	try { fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf-8'); } catch {}
}

export function loadQueueFromDisk(): Job[] {
	ensureDir();
	queue = loadFromDisk<Job[]>(QUEUE_FILE, []);
	return queue;
}

export function saveQueueToDisk(q?: Job[]) {
	ensureDir();
	if (q) queue = q;
	saveToDisk(QUEUE_FILE, queue);
	lastUpdateTs = Date.now();
}

export function setQueue(newQueue: Job[], options?: { resetStatus?: boolean }) {
	const reset = options?.resetStatus ?? false;
	queue = (newQueue || []).map(j => reset ? { ...j, status: 'pending' } : j);
	saveQueueToDisk(queue);
}

export function getQueue(): Job[] {
	return queue;
}

export function getCounts() {
	const total = queue.length;
	const done = queue.filter(j => j.status === 'done').length;
	const pending = total - done;
	return { total, done, pending, running, lastUpdateTs };
}

export function getState() {
	return { ...getCounts(), baseUrl };
}

async function evaluateJob(j: Job): Promise<Job> {
	try {
		const res = await fetch(`${baseUrl}/api/orchestrator/evaluate-batch`, {
			method: 'POST', headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ k: j.k, patternIds: j.patternIds, from: j.batchFrom, to: j.batchTo })
		} as any);
		const json = await res.json();
		if ((json as any)?.success && (json as any)?.data) {
			return { ...j, status: 'done', stats: (json as any).data } as Job;
		}
		return { ...j, status: 'error' as const };
	} catch {
		return { ...j, status: 'error' as const };
	}
}

async function processSlice(slice: number) {
	let updated = 0;
	for (let i = 0; i < queue.length && updated < slice; i++) {
		const j = queue[i];
		if (j.status === 'pending') {
			queue[i] = { ...j, status: 'running' } as Job;
			const done = await evaluateJob(queue[i]);
			queue[i] = done;
			updated++;
		}
	}
	if (updated > 0) saveQueueToDisk(queue);
}

export function startRunner(opts?: { base?: string; intervalMs?: number; slice?: number }) {
	if (running) return;
	running = true;
	if (opts?.base) baseUrl = opts.base;
	const intervalMs = Math.max(200, opts?.intervalMs ?? 500);
	const slice = Math.max(1, opts?.slice ?? 10);
	if (runnerTimer) clearInterval(runnerTimer);
	runnerTimer = setInterval(async () => {
		const hasPending = queue.some(j => j.status === 'pending');
		if (!running || !hasPending) return;
		await processSlice(slice);
		lastUpdateTs = Date.now();
	}, intervalMs);
	saveToDisk(STATE_FILE, getState());
}

export function stopRunner() {
	running = false;
	if (runnerTimer) { clearInterval(runnerTimer); runnerTimer = null; }
	saveToDisk(STATE_FILE, getState());
}

export function setBaseUrl(url: string) { baseUrl = url; saveToDisk(STATE_FILE, getState()); }

// Init au chargement
ensureDir();
loadQueueFromDisk();
try { const state = loadFromDisk<any>(STATE_FILE, null); if (state?.baseUrl) baseUrl = state.baseUrl; } catch {}
