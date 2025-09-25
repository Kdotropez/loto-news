import { NextRequest, NextResponse } from 'next/server';
import { dataStorage } from '@/lib/data-storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Draw = {
  date: string;
  numero1?: number; numero2?: number; numero3?: number; numero4?: number; numero5?: number;
  boule_1?: number; boule_2?: number; boule_3?: number; boule_4?: number; boule_5?: number;
  complementaire?: number; numero_chance?: number;
};

function uniqueSorted(arr: number[]) {
  return Array.from(new Set(arr.filter(n => typeof n === 'number'))).sort((a,b)=>a-b);
}

function capBasePool(basePool?: number[]) {
  if (!Array.isArray(basePool)) return undefined;
  const clean = uniqueSorted(basePool.filter(n => n >= 1 && n <= 49)).slice(0, 20);
  return clean.length ? clean : undefined;
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (h >>> 0);
}

function pickFiveFromPool(pool: number[], seed: number): number[] {
  if (pool.length <= 5) return uniqueSorted(pool);
  const selected: number[] = [];
  const used = new Set<number>();
  const step = Math.max(1, Math.floor(pool.length / 5));
  let idx = seed % pool.length;
  while (selected.length < 5) {
    idx = (idx + step + 17) % pool.length;
    const n = pool[idx];
    if (!used.has(n)) { used.add(n); selected.push(n); }
  }
  return uniqueSorted(selected);
}

function pickComplementary(seed: number): number { return (seed % 10) + 1; }

function loadMergedPatterns(): Array<{ id: string; label?: string; description?: string }> {
  try {
    const fs = require('fs');
    const path = require('path');
    const primary = path.join(process.cwd(), 'data', 'loto_patterns_catalog_v2.json');
    const fallback = path.join(process.cwd(), 'data', 'loto_patterns_catalog.json');
    const readJson = (p: string) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };
    const jsonV2 = fs.existsSync(primary) ? readJson(primary) : null;
    const jsonV1 = fs.existsSync(fallback) ? readJson(fallback) : null;
    const p2 = Array.isArray(jsonV2?.patterns) ? jsonV2.patterns : [];
    const p1 = Array.isArray(jsonV1?.patterns) ? jsonV1.patterns : [];
    const map: Record<string, any> = {};
    for (const p of p1) { if (p && p.id) map[p.id] = p; }
    for (const p of p2) { if (p && p.id) map[p.id] = { ...map[p.id], ...p }; }
    return Object.values(map);
  } catch {
    return [];
  }
}

function generateCombinationsFromPatterns(basePool?: number[], maxGenerated: number = 300) {
  const base = capBasePool(basePool) || Array.from({ length: 49 }, (_, i) => i + 1).slice(0, 20);
  const patterns = loadMergedPatterns();
  const combos: Array<{ id: string; name: string; strategies: string[]; combination: { mainNumbers: number[]; complementaryNumber: number } }> = [];

  const addCombo = (strategies: string[]) => {
    if (combos.length >= maxGenerated) return;
    const id = strategies.join('+');
    const seed = hashString(id);
    const main = pickFiveFromPool(base, seed);
    const comp = pickComplementary(seed >>> 3);
    combos.push({ id: `pat-${id}`, name: strategies.join(' + '), strategies, combination: { mainNumbers: main, complementaryNumber: comp } });
  };

  // Solos
  for (const p of patterns) { addCombo([p.id]); if (combos.length >= maxGenerated) break; }
  if (combos.length < maxGenerated) {
    // Paires
    for (let i = 0; i < patterns.length && combos.length < maxGenerated; i++) {
      for (let j = i + 1; j < patterns.length && combos.length < maxGenerated; j++) {
        addCombo([patterns[i].id, patterns[j].id]);
      }
    }
  }
  if (combos.length < maxGenerated) {
    // Triplets
    for (let i = 0; i < patterns.length && combos.length < maxGenerated; i++) {
      for (let j = i + 1; j < patterns.length && combos.length < maxGenerated; j++) {
        for (let k = j + 1; k < patterns.length && combos.length < maxGenerated; k++) {
          addCombo([patterns[i].id, patterns[j].id, patterns[k].id]);
        }
      }
    }
  }

  // Fallback si catalogue vide
  if (combos.length === 0) {
    for (let s = 0; s < Math.min(50, maxGenerated); s++) {
      const main = pickFiveFromPool(base, 1319 + s * 37);
      const comp = pickComplementary(9917 + s);
      combos.push({ id: `auto-${s}`, name: 'auto', strategies: [], combination: { mainNumbers: main, complementaryNumber: comp } });
    }
  }
  return combos;
}

function extractDrawNumbers(d: Draw): { main: number[]; comp: number } {
  const main = [d.numero1, d.numero2, d.numero3, d.numero4, d.numero5, d.boule_1, d.boule_2, d.boule_3, d.boule_4, d.boule_5]
    .filter((n: any) => typeof n === 'number') as number[];
  const arr = uniqueSorted(main).slice(0, 5);
  const comp = (typeof d.complementaire === 'number' ? d.complementaire : d.numero_chance) || 1;
  return { main: arr, comp };
}

function scoreComboVsDraw(combo: { mainNumbers: number[]; complementaryNumber: number }, draw: { main: number[]; comp: number }) {
  const exactMain = combo.mainNumbers.filter(n => draw.main.includes(n)).length;
  const hasChance = combo.complementaryNumber === draw.comp;
  const pct = ((exactMain + (hasChance ? 1 : 0)) / 6) * 100;
  // Estimation gains (approx.)
  let rank = 0;
  if (exactMain === 5 && hasChance) rank = 1; else if (exactMain === 5) rank = 2; else if (exactMain === 4 && hasChance) rank = 3; else if (exactMain === 4) rank = 4; else if (exactMain === 3) rank = 5;
  const rankGain = rank === 1 ? 2000000 : rank === 2 ? 100000 : rank === 3 ? 1000 : rank === 4 ? 50 : rank === 5 ? 10 : 0;
  return { pct, rank, rankGain, exactMain, hasChance };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      periodCount = 100,
      scoreWeight = 0.7,
      gainWeight = 0.3,
      basePool,
      maxGenerated = 300,
      // nouveaux paramètres (facultatifs)
      period = 200,
      beam = { depth: 3, width: [300,200,120], deltaMin: 0.002 },
      budget = { maxTeams: Math.max(50, maxGenerated), maxGrids: 1000 },
      objective = { mixScore: 0.7, mixEV: 0.3, focusRank: [3,4,5] },
      catalogVersion = 'v2'
    } = body || {};

    const tirages = dataStorage.getAllTirages() as Draw[];
    if (!Array.isArray(tirages) || tirages.length === 0) {
      return NextResponse.json({ success: false, error: 'Aucun tirage disponible' }, { status: 404 });
    }

    const sorted = [...tirages].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recent = sorted.slice(0, Math.max(1, Math.min(periodCount, sorted.length)));
    const draws = recent.map(extractDrawNumbers);

    const combos = generateCombinationsFromPatterns(basePool, Math.max(50, Math.min(2000, (budget?.maxTeams ?? maxGenerated))));

    // Évaluer toutes les combinaisons sur l’historique
    const teamStats: Array<{ id: string; strategies: string[]; name: string; avgPct: number; avgGain: number; objective: number }>
      = combos.map(c => {
        let sumPct = 0; let sumGain = 0;
        for (const d of draws) {
          const { pct, rankGain } = scoreComboVsDraw(c.combination, d);
          sumPct += pct;
          sumGain += rankGain;
        }
        const avgPct = sumPct / draws.length;
        const avgGain = sumGain / draws.length;
        // Normalisation du gain sur 0..100 (log-échelle)
        const gainScore = Math.min(100, Math.log10(Math.max(1, avgGain)) * 20);
        const obj = (objective?.mixScore ?? scoreWeight) * avgPct + (objective?.mixEV ?? gainWeight) * gainScore;
        return { id: c.id, strategies: c.strategies, name: c.name, avgPct: Math.round(avgPct * 10) / 10, avgGain: Math.round(avgGain), objective: Math.round(obj * 10) / 10 };
      });

    teamStats.sort((a, b) => b.objective - a.objective);
    const topTeams = teamStats.slice(0, 50);

    // Suggérer S (k optimal entre 12..24) à partir des équipes
    const numberWeight: Record<number, number> = {};
    for (let i = 1; i <= 49; i++) numberWeight[i] = 0;
    for (const team of topTeams) {
      const seed = hashString(team.id);
      const base = capBasePool(basePool) || Array.from({ length: 49 }, (_, i) => i + 1).slice(0, 20);
      const numbers = pickFiveFromPool(base, seed);
      numbers.forEach(n => { numberWeight[n] += team.objective; });
    }
    const ranked = Object.entries(numberWeight).map(([n, w]) => ({ n: parseInt(n, 10), w })).sort((a, b) => b.w - a.w);

    const candidates = ranked.map(r => r.n);

    // Choisir k en maximisant l’intersection moyenne avec l’historique
    let bestK = 20; let bestScore = -1; let bestS: number[] = candidates.slice(0, 20);
    for (let k = 12; k <= 24; k++) {
      const S = new Set(candidates.slice(0, k));
      let sum = 0;
      for (const d of draws) {
        const inter = d.main.filter(n => S.has(n)).length; // 0..5
        sum += inter;
      }
      const avgInter = sum / draws.length; // 0..5
      if (avgInter > bestScore) { bestScore = avgInter; bestK = k; bestS = candidates.slice(0, k); }
    }

    const bestObjective = Math.round(((topTeams[0]?.objective ?? 0)/100) * 1000)/1000;
    const summary = {
      bestObjective,
      bestEV: 0,
      bestRecipeId: `recipe_${catalogVersion}_${new Date().toISOString().slice(0,10)}`
    };

    return NextResponse.json({
      success: true,
      data: {
        topTeams,
        suggestedS: uniqueSorted(bestS),
        kOptimal: bestK,
        avgIntersection: Math.round(bestScore * 100) / 100,
        usedDrawCount: draws.length
      },
      weights: { scoreWeight: (objective?.mixScore ?? scoreWeight), gainWeight: (objective?.mixEV ?? gainWeight) },
      summary,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur apprentissage:', error);
    return NextResponse.json({ success: false, error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ success: true, info: 'POST periodCount, scoreWeight, gainWeight, basePool? to train' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erreur' }, { status: 500 });
  }
}


