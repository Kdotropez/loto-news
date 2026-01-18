import { NextRequest, NextResponse } from 'next/server';
import { dataStorage } from '@/lib/data-storage';

export const dynamic = 'force-dynamic';

// Cache mémoire simple par type+fenêtre (utile pour 10y/20y/all)
const CACHE_TTL_MS = 60_000; // 60s
const cacheStore: Map<string, { ts: number; data: any }> = new Map();

function getCache(key: string) {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cacheStore.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: any) {
  cacheStore.set(key, { ts: Date.now(), data });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type');
    const windowParam = searchParams.get('window') || undefined;
    const periodParam = searchParams.get('period') || windowParam || 'last20';

    let result;

    switch (type) {
      case 'numeros': {
        const window = searchParams.get('window') || undefined;
        const isCachedWin = window && (window === '10y' || window === '20y' || window === 'all');
        const cacheKey = isCachedWin ? `numeros:${window}` : null;
        if (cacheKey) {
          const cached = getCache(cacheKey);
          if (cached) {
            result = cached;
            break;
          }
        }
        result = dataStorage.getStatistiquesNumeros(window);
        if (cacheKey) setCache(cacheKey, result);
        break;
      }
      
      case 'advanced': {
        const tirages = dataStorage.getTiragesForPeriod(periodParam);
        const totalTirages = tirages.length;
        const statsNumeros = dataStorage.getStatistiquesNumeros(periodParam);

        const hotNumbers = statsNumeros.slice(0, 10).map(n => ({
          numero: n.numero,
          frequency: n.frequence,
          lastAppearance: n.derniere_sortie || null
        }));
        const coldNumbers = [...statsNumeros].slice(-10).map(n => ({
          numero: n.numero,
          frequency: n.frequence,
          lastAppearance: n.derniere_sortie || null
        }));

        const frequencyData = statsNumeros.slice(0, 12).map(n => ({
          numero: n.numero,
          frequency: n.frequence
        }));

        const sumBuckets = { faible: 0, optimale: 0, elevee: 0 };
        tirages.forEach(t => {
          const nums = [t.numero1, t.numero2, t.numero3, t.numero4, t.numero5].filter(n => typeof n === 'number') as number[];
          const sum = nums.reduce((acc, v) => acc + v, 0);
          if (sum < 100) sumBuckets.faible += 1;
          else if (sum <= 150) sumBuckets.optimale += 1;
          else sumBuckets.elevee += 1;
        });

        const patternDistribution = [
          { name: 'Somme faible', value: sumBuckets.faible },
          { name: 'Somme optimale', value: sumBuckets.optimale },
          { name: 'Somme élevée', value: sumBuckets.elevee }
        ];

        const patterns = patternDistribution.map(p => ({
          name: p.name,
          frequency: p.value,
          percentage: totalTirages > 0 ? (p.value / totalTirages) * 100 : 0
        }));

        result = {
          totalTirages,
          hotNumbers,
          coldNumbers,
          patterns,
          frequencyData,
          patternDistribution
        };
        break;
      }
      
      case 'summary':
        try {
          const isCachedWin = windowParam && (windowParam === '10y' || windowParam === '20y' || windowParam === 'all');
          const cacheKey = isCachedWin ? `summary:${windowParam}` : null;
          if (cacheKey) {
            const cached = getCache(cacheKey);
            if (cached) {
              result = cached;
              break;
            }
          }

          const tirages = dataStorage.getTiragesForPeriod(windowParam);
          const totalTirages = tirages.length;
          const latestTirage = tirages.length > 0 ? tirages[0] : dataStorage.getLatestTirage();
          
          if (totalTirages === 0) {
            result = {
              totalTirages: 0,
              derniereMiseAJour: null,
              premierTirage: null,
              numerosChauds: [],
              numerosFroids: [],
              moyenneTiragesParMois: 0
            };
            if (cacheKey) setCache(cacheKey, result);
            break;
          }
          
          // Calculer les statistiques globales
          const numerosFrequence = new Map<number, number>();
          tirages.forEach(tirage => {
            const boules = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5]
              .filter(n => n != null);
            boules.forEach(numero => {
              if (numero != null) {
                numerosFrequence.set(numero, (numerosFrequence.get(numero) || 0) + 1);
              }
            });
          });

          const numerosChauds = Array.from(numerosFrequence.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([numero, freq]) => ({ numero, frequence: freq }));

          const numerosFroids = Array.from(numerosFrequence.entries())
            .sort((a, b) => a[1] - b[1])
            .slice(0, 10)
            .map(([numero, freq]) => ({ numero, frequence: freq }));

          // Calculer la période réelle des données
          const premierTirage = tirages[tirages.length - 1];
          const dernierTirage = tirages[0];
          
          const dateDebut = new Date(premierTirage?.date || '1976-05-19');
          const dateFin = new Date(dernierTirage?.date || new Date().toISOString().split('T')[0]);
          const moisEcoules = Math.max(1, Math.floor((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24 * 30)));

          result = {
            totalTirages,
            derniereMiseAJour: dernierTirage?.date || null,
            premierTirage: premierTirage?.date || null,
            numerosChauds,
            numerosFroids,
            moyenneTiragesParMois: Math.round(totalTirages / moisEcoules)
          };
          if (cacheKey) setCache(cacheKey, result);
        } catch (error) {
          console.error('Erreur dans le calcul des statistiques:', error);
          result = {
            totalTirages: 0,
            derniereMiseAJour: null,
            premierTirage: null,
            numerosChauds: [],
            numerosFroids: [],
            moyenneTiragesParMois: 0
          };
        }
        break;

      case 'patterns': {
        try {
          // Analyse sur une fenêtre récente pour des stats réalistes
          const windowSize = 500;
          const tirages = dataStorage.getAllTirages().slice(0, windowSize);
          const numbers: number[][] = tirages.map(t => [t.numero1, t.numero2, t.numero3, t.numero4, t.numero5]);

          // Parité
          let evens = 0, odds = 0;
          numbers.flat().forEach(n => { if (typeof n === 'number') (n % 2 === 0 ? evens++ : odds++); });

          // Somme
          const sums = numbers.map(arr => arr.reduce((a, b) => a + (b || 0), 0));
          const avgSum = sums.length ? Math.round(sums.reduce((a, b) => a + b, 0) / sums.length) : 0;
          const lastSum = sums[0] || 0;

          // Espacements (différences entre numéros triés)
          const spacings: number[] = [];
          numbers.forEach(arr => {
            const s = [...arr].filter(Boolean).sort((a, b) => a - b);
            for (let i = 1; i < s.length; i++) spacings.push(s[i] - s[i - 1]);
          });
          const spacingMedian = spacings.length ? spacings.sort((a, b) => a - b)[Math.floor(spacings.length / 2)] : 0;

          // Répartition par déciles 1..49 (10 bacs)
          const bins = new Array(10).fill(0);
          numbers.flat().forEach(n => {
            if (typeof n !== 'number') return;
            const idx = Math.min(9, Math.floor((n - 1) / 5));
            bins[idx]++;
          });
          const expected = (numbers.length * 5) / 10; // 5 numéros par tirage répartis sur 10 bacs
          let chi2 = 0;
          for (let i = 0; i < 10; i++) {
            const diff = bins[i] - expected;
            chi2 += expected > 0 ? (diff * diff) / expected : 0;
          }

          // Tendance récente (20 derniers tirages)
          const recent = numbers.slice(0, 20).flat();
          const recentBins = new Array(3).fill(0); // 1-16, 17-32, 33-49
          recent.forEach(n => {
            if (typeof n !== 'number') return;
            if (n <= 16) recentBins[0]++; else if (n <= 32) recentBins[1]++; else recentBins[2]++;
          });
          const recentZone = recentBins.indexOf(Math.max(...recentBins));
          const zoneLabel = recentZone === 0 ? '1-16' : recentZone === 1 ? '17-32' : '33-49';

          result = {
            evens,
            odds,
            parityRatio: evens + odds > 0 ? (evens / (evens + odds)).toFixed(2) : '0.00',
            avgSum,
            lastSum,
            spacingMedian,
            chi2: Number(chi2.toFixed(2)),
            decileBins: bins,
            recentBias: { zone: zoneLabel, counts: recentBins }
          };
        } catch (error) {
          console.error('Erreur patterns:', error);
          result = {
            evens: 0,
            odds: 0,
            parityRatio: '0.00',
            avgSum: 0,
            lastSum: 0,
            spacingMedian: 0,
            chi2: 0,
            decileBins: new Array(10).fill(0),
            recentBias: { zone: '17-32', counts: [0, 0, 0] }
          };
        }
        break;
      }
      
      case 'list': {
        const window = searchParams.get('window') || undefined;
        const tirages = dataStorage.getTiragesForPeriod(window as any);
        result = tirages.map(t => ({
          id: t.id,
          date: t.date,
          numero1: (t as any).numero1 ?? (t as any).boule_1,
          numero2: (t as any).numero2 ?? (t as any).boule_2,
          numero3: (t as any).numero3 ?? (t as any).boule_3,
          numero4: (t as any).numero4 ?? (t as any).boule_4,
          numero5: (t as any).numero5 ?? (t as any).boule_5,
          complementaire: (t as any).complementaire ?? (t as any).numero_chance ?? null,
        }));
        break;
      }
      
      case 'sync': {
        try {
          const { openDataSoftSync } = await import('@/lib/opendatasoft-sync');
          const res = await openDataSoftSync.syncWithLocalDatabase();
          result = res;
        } catch (e: any) {
          return NextResponse.json({ success: false, error: e?.message || 'sync error' }, { status: 500 });
        }
        break;
      }
      
      default:
        return NextResponse.json(
          { success: false, error: 'Type de statistique non reconnu' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
