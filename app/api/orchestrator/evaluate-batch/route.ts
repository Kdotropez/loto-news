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

function extractMain(d: Draw): number[] {
  const arr = [d.numero1, d.numero2, d.numero3, d.numero4, d.numero5, d.boule_1, d.boule_2, d.boule_3, d.boule_4, d.boule_5]
    .filter((n: any) => typeof n === 'number') as number[];
  return Array.from(new Set(arr)).filter(n => n>=1 && n<=49).slice(0,5);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { k = 10, patternIds = [], from = 0, to = 0 } = body || {};

    const tirages = dataStorage.getAllTirages() as Draw[];
    if (!Array.isArray(tirages) || tirages.length === 0) {
      return NextResponse.json({ success: false, error: 'Aucun tirage' }, { status: 404 });
    }

    const start = Math.max(0, Math.min(from, tirages.length-1));
    const end = Math.max(start+1, Math.min(to || tirages.length, tirages.length));
    const slice = tirages.slice(start, end);

    // Fréquences locales pour sélectionner S_k (approche simple et déterministe)
    const freq: Record<number, number> = {}; for (let i=1;i<=49;i++) freq[i]=0;
    slice.forEach(d => extractMain(d).forEach(n => { freq[n]++; }));
    const S = Object.entries(freq).sort((a,b)=> b[1]-a[1]).slice(0, Math.min(k,49)).map(([n]) => parseInt(n,10));
    const Sset = new Set(S);

    // Évaluer hits/EV sur le batch
    let hit3 = 0, hit4 = 0, hit5 = 0; const gains = {1:2000000,2:100000,3:1000,4:50,5:10};
    let totalEV = 0;
    slice.forEach(d => {
      const m = extractMain(d);
      const inter = m.filter(n => Sset.has(n)).length;
      if (inter === 5) hit5++; else if (inter === 4) hit4++; else if (inter === 3) hit3++;
      // EV approximative (sans complémentaire)
      let g = 0; if (inter === 5) g = gains[2]; else if (inter === 4) g = gains[3]; else if (inter === 3) g = gains[5];
      totalEV += g;
    });
    const N = slice.length || 1;
    const ev = Math.round((totalEV / N) * 100) / 100;
    const grids = Math.max(50, Math.floor(k * 5 + patternIds.length * 10 + (end - start) / 20));

    return NextResponse.json({ success: true, data: { hit3: hit3/N, hit4: hit4/N, hit5: hit5/N, ev, grids, S } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Erreur' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: true, info: 'POST {k, patternIds, from, to}' });
}


