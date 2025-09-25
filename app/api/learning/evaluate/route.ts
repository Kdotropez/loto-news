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
  const clean = uniqueSorted(basePool.filter(n => n >= 1 && n <= 49)).slice(0, 49);
  return clean.length ? clean : undefined;
}

function extractDrawNumbers(d: Draw): { main: number[]; comp: number } {
  const main = [d.numero1, d.numero2, d.numero3, d.numero4, d.numero5, d.boule_1, d.boule_2, d.boule_3, d.boule_4, d.boule_5]
    .filter((n: any) => typeof n === 'number') as number[];
  const arr = uniqueSorted(main).slice(0, 5);
  const comp = (typeof d.complementaire === 'number' ? d.complementaire : d.numero_chance) || 1;
  return { main: arr, comp };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      period = 200,
      basePool,
      kCandidates,
      objective = { mixScore: 0.7, mixEV: 0.3, focusRank: [3,4,5] },
      decay = { lambda: 0 }
    } = body || {};

    const tirages = dataStorage.getAllTirages() as Draw[];
    if (!Array.isArray(tirages) || tirages.length === 0) {
      return NextResponse.json({ success: false, error: 'Aucun tirage disponible' }, { status: 404 });
    }

    const sorted = [...tirages].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recent = sorted.slice(0, Math.max(1, Math.min(period, sorted.length)));
    const draws = recent.map(extractDrawNumbers);

    const base = capBasePool(basePool) || Array.from({ length: 49 }, (_, i) => i + 1);
    const kList: number[] = Array.isArray(kCandidates) && kCandidates.length
      ? kCandidates
      : [8,10,12,14,16,18,20,22,24];

    // Barème simple (peut être rendu configurable)
    const gains: Record<number, number> = { 1: 2000000, 2: 100000, 3: 1000, 4: 50, 5: 10 };
    const gridCost = 2.2; // coût par grille (indicatif)

    // Décroissance exponentielle (pondération des tirages récents)
    const lambda = typeof decay?.lambda === 'number' ? decay.lambda : 0;
    const weights = draws.map((_, i) => Math.exp(-lambda * i)).reverse();
    const wSum = weights.reduce((a,b)=>a+b,0) || 1;

    const curve: Array<{ k: number; score: number; ev: number; evAdj: number }> = [];

    // byRank global calculé sur le meilleur k (mis à jour plus bas)
    let best = { k: kList[0], score: 0, ev: 0, evAdj: 0 };

    for (const k of kList) {
      const S = new Set(base.slice(0, Math.min(k, base.length)));
      let wScore = 0; // score moyen pondéré (0..1)
      const gainsPerDraw: number[] = [];

      // Comptes ranks pour EV (approx. sans complémentaire)
      let hit2 = 0, hit3 = 0, hit5 = 0; // 5, 4, 3 bons (approx rangs 2,3/4,5)

      for (let idx=0; idx<draws.length; idx++) {
        const d = draws[idx];
        const w = weights[idx] / wSum;
        let inter = 0;
        for (const n of d.main) if (S.has(n)) inter++;
        // Score% ~ (inter + chance?0)/6
        const sc = (inter / 6);
        wScore += w * sc;

        // Approx EV par tirage: map inter → gain moyen par rang (ignorer complémentaire)
        let gain = 0;
        if (inter === 5) { gain = gains[2]; hit2++; }
        else if (inter === 4) { gain = gains[3]; hit3++; }
        else if (inter === 3) { gain = gains[5]; hit5++; }
        gainsPerDraw.push(gain - gridCost);
      }

      const ev = gainsPerDraw.reduce((a,b)=>a+b,0) / gainsPerDraw.length;
      const mu = ev;
      const variance = gainsPerDraw.reduce((a,b)=> a + Math.pow(b - mu, 2), 0) / gainsPerDraw.length;
      const sigma = Math.sqrt(variance);
      const alpha = 0.2; // pénalité de risque
      const evAdj = ev - alpha * sigma;

      curve.push({ k, score: Math.round(wScore*1000)/1000, ev: Math.round(ev*100)/100, evAdj: Math.round(evAdj*100)/100 });

      // Calcul de l'objectif mixte pour choisir le meilleur k
      const obj = (objective.mixScore ?? 0.7) * wScore + (objective.mixEV ?? 0.3) * (evAdj / (gains[2] || 1));
      if (obj > ((objective.mixScore ?? 0.7) * best.score + (objective.mixEV ?? 0.3) * (best.evAdj / (gains[2] || 1)))) {
        best = { k, score: Math.round(wScore*1000)/1000, ev: Math.round(ev*100)/100, evAdj: Math.round(evAdj*100)/100 };
      }
    }

    // byRank basé sur le meilleur k, recalcul rapide
    const Sbest = new Set(base.slice(0, Math.min(best.k, base.length)));
    let r1 = 0, r2 = 0, r3 = 0, r4 = 0, r5 = 0;
    for (let idx=0; idx<draws.length; idx++) {
      const d = draws[idx];
      let inter = 0; for (const n of d.main) if (Sbest.has(n)) inter++;
      if (inter === 5) r2++; else if (inter === 4) r3++; else if (inter === 3) r5++;
    }
    const N = draws.length || 1;
    const byRank = { hit1: 0, hit2: r2/N, hit3: r3/N, hit4: 0, hit5: r5/N };

    return NextResponse.json({ success: true, curve, best, byRank });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Erreur interne' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: true, info: 'POST { periodCount, basePool? }' });
}


