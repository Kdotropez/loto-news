import { NextRequest, NextResponse } from 'next/server';
import { DrawProximityAnalyzer } from '@/lib/draw-proximity-analyzer';

export const dynamic = 'force-dynamic';

// Utilitaires
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

function pickComplementary(seed: number): number {
  return (seed % 10) + 1; // 1..10
}

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

  // Fallback si catalogue vide: quelques combinaisons neutres depuis base
  if (combos.length === 0) {
    for (let s = 0; s < Math.min(50, maxGenerated); s++) {
      const main = pickFiveFromPool(base, 1319 + s * 37);
      const comp = pickComplementary(9917 + s);
      combos.push({ id: `auto-${s}`, name: 'auto', strategies: [], combination: { mainNumbers: main, complementaryNumber: comp } });
    }
  }

  return combos;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      drawResult,
      limit = 10,
      basePool
    } = body;

    // Validation des données
    if (!drawResult || !drawResult.mainNumbers || !Array.isArray(drawResult.mainNumbers) || 
        drawResult.mainNumbers.length !== 5 || !drawResult.complementaryNumber) {
      return NextResponse.json(
        { success: false, error: 'Format de tirage invalide. Attendu: { mainNumbers: [5 numéros], complementaryNumber: number, date?: string }' },
        { status: 400 }
      );
    }

    // Validation des numéros
    const mainNumbers = drawResult.mainNumbers;
    const complementaryNumber = drawResult.complementaryNumber;

    if (mainNumbers.some((num: number) => num < 1 || num > 49) || 
        complementaryNumber < 1 || complementaryNumber > 10) {
      return NextResponse.json(
        { success: false, error: 'Numéros invalides. Principaux: 1-49, Complémentaire: 1-10' },
        { status: 400 }
      );
    }

    // Génère des combinaisons basées sur le catalogue de patterns fusionné (v2 prioritaire) et le basePool fourni
    const combinations = generateCombinationsFromPatterns(basePool, Math.max(50, Math.min(500, limit * 10)));

    // Initialise l'analyseur
    const analyzer = new DrawProximityAnalyzer();
    analyzer.initialize(combinations);

    // Analyse la proximité
    const analysis = analyzer.analyzeDrawProximity({
      date: drawResult.date || new Date().toISOString(),
      mainNumbers,
      complementaryNumber
    });

    // Génère le rapport détaillé
    const detailedReport = analyzer.generateDetailedReport({
      date: drawResult.date || new Date().toISOString(),
      mainNumbers,
      complementaryNumber
    });

    // Analyse la performance des stratégies
    const strategyPerformance = analyzer.analyzeStrategyPerformance({
      date: drawResult.date || new Date().toISOString(),
      mainNumbers,
      complementaryNumber
    });

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        bestMatches: analysis.bestMatches.slice(0, limit)
      },
      strategyPerformance: strategyPerformance.slice(0, 10),
      detailedReport,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de l\'analyse de proximité:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const action = searchParams.get('action');

    switch (action) {
      case 'example':
        // Retourne un exemple de format de tirage
        return NextResponse.json({
          success: true,
          example: {
            mainNumbers: [7, 14, 21, 28, 35],
            complementaryNumber: 8,
            date: new Date().toISOString()
          },
          description: 'Format attendu pour l\'analyse de proximité'
        });

      case 'stats':
        // Retourne les statistiques des combinaisons disponibles
        // Pour l'instant, retournons des statistiques de base
        return NextResponse.json({
          success: true,
          stats: {
            totalCombinations: 19068840, // Total des combinaisons possibles
            testedCombinations: 0,
            estimatedCombinations: 19068840,
            lastUpdated: new Date().toISOString()
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Action non reconnue' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Erreur lors de la requête GET:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
