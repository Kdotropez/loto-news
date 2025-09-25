export type JobStatus = 'pending' | 'running' | 'done' | 'error';

export type Job = {
  id: string;                // unique id: k + patterns + batch range
  k: number;                 // taille de S
  patternIds: string[];      // combinaisons de patterns
  batchFrom: number;         // index début (inclu)
  batchTo: number;           // index fin (exclu)
  status: JobStatus;
  stats?: { hit3: number; hit4: number; hit5: number; ev: number; grids: number };
};

export type QueueManifest = {
  space: {
    kMin: number; kMax: number; patterns: number; Lmax: number; historySize: number; batchSize: number;
  };
  counts: { total: number; done: number; pending: number };
  lastUpdate: string;
};

// Génère toutes les combinaisons de 1..Lmax patterns (déterministe)
export function patternCombos(allIds: string[], Lmax: number): string[][] {
  const res: string[][] = [];
  const ids = [...allIds].sort();
  for (let r = 1; r <= Lmax; r++) {
    if (r > ids.length) break;
    const idx = Array.from({ length: r }, (_, i) => i);
    const n = ids.length;
    const current = () => idx.map(i => ids[i]);
    res.push(current());
    while (true) {
      let i = r - 1;
      while (i >= 0 && idx[i] === i + n - r) i--;
      if (i < 0) break;
      idx[i]++;
      for (let j = i + 1; j < r; j++) idx[j] = idx[j - 1] + 1;
      res.push(current());
    }
  }
  return res;
}

export function buildJobQueue(
  patternIds: string[], Lmax: number,
  kMin: number, kMax: number,
  historySize: number, batchSize: number
): Job[] {
  const combos = patternCombos(patternIds, Lmax);
  const queue: Job[] = [];
  let idCounter = 0;
  for (let k = kMin; k <= kMax; k++) {
    for (const pats of combos) {
      for (let from = 0; from < historySize; from += batchSize) {
        const to = Math.min(from + batchSize, historySize);
        queue.push({
          id: `J${idCounter++}_${k}_${pats.join('+')}_${from}-${to}`,
          k, patternIds: pats, batchFrom: from, batchTo: to, status: 'pending'
        });
      }
    }
  }
  return queue;
}

// Persistance locale (IndexedDB recommandé; fallback localStorage)
const LS_KEY = 'loto_orchestrator_queue_v1';

export function saveQueue(queue: Job[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(queue)); } catch {}
}

export function loadQueue(): Job[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr as Job[];
  } catch {}
  return [];
}

export function queueManifest(queue: Job[], space: QueueManifest['space']): QueueManifest {
  const total = queue.length;
  const done = queue.filter(j => j.status === 'done').length;
  const pending = queue.filter(j => j.status !== 'done').length;
  return {
    space,
    counts: { total, done, pending },
    lastUpdate: new Date().toISOString()
  };
}

export function exportManifest(queue: Job[], space: QueueManifest['space']): string {
  const manifest = queueManifest(queue, space);
  return JSON.stringify(manifest, null, 2);
}


