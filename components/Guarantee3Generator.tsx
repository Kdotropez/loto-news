"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { savedGridsManager } from '@/lib/saved-grids-manager';

type NumberChip = {
  value: number;
  selected: boolean;
};

type GeneratedGrid = {
  id: number;
  numbers: number[];
  cost: number;
};

const GRID_COST_EUR = 2.20;
const DEFAULT_MAX_COMBOS_SCANNED = 2000; // valeur par défaut pour la recherche gloutonne

function generateCombinations(numbers: number[], k: number): number[][] {
  const result: number[][] = [];
  const combo: number[] = [];
  const n = numbers.length;
  const backtrack = (start: number, depth: number) => {
    if (depth === k) {
      result.push(combo.slice());
      return;
    }
    for (let i = start; i <= n - (k - depth); i++) {
      combo.push(numbers[i]);
      backtrack(i + 1, depth + 1);
      combo.pop();
    }
  };
  backtrack(0, 0);
  return result;
}

function generateTriples(numbers: number[]): string[] {
  return generateCombinations(numbers, 3).map(t => t.join('-'));
}

function generateAllTriples(numbers: number[]): string[] {
  return generateTriples(numbers);
}

export default function Guarantee3Generator({ initialNumbers }: { initialNumbers?: number[] }) {
  const [baseSelection, setBaseSelection] = useState<number[]>([]);
  const [chips, setChips] = useState<NumberChip[]>([]);
  const [isComputing, setIsComputing] = useState(false);
  const [grids, setGrids] = useState<GeneratedGrid[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'strict' | 'dynamic'>('strict');
  const [maxSelectionSize, setMaxSelectionSize] = useState<number>(18);
  const [maxGridsCap, setMaxGridsCap] = useState<number>(1000);
  const [maxCombosScanned, setMaxCombosScanned] = useState<number>(DEFAULT_MAX_COMBOS_SCANNED);

  // Charger une sélection existante depuis le stockage local
  useEffect(() => {
    try {
      let best: number[] = Array.isArray(initialNumbers) ? initialNumbers : [];
      if (!best || best.length === 0) {
        const sources = ['selectedNumbers', 'strategyNumbers', 'manualNumbers'];
        sources.forEach(key => {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const data = JSON.parse(raw);
              const arr: number[] = Array.isArray(data?.numbers) ? data.numbers.filter((x: any) => typeof x === 'number') : [];
              if (arr.length > best.length) best = arr;
            } catch {}
          }
        });
      }
      // fallback si aucune sélection
      if (best.length === 0) best = Array.from({ length: 12 }, (_, i) => i + 1);
      best = Array.from(new Set(best)).filter(n => n >= 1 && n <= 49).sort((a, b) => a - b);
      setBaseSelection(best);
      setChips(best.map(n => ({ value: n, selected: true })));
    } catch {}
  }, []);

  const selectedNumbers = useMemo(() => chips.filter(c => c.selected).map(c => c.value), [chips]);

  const toggleChip = (value: number) => {
    setChips(prev => prev.map(c => (c.value === value ? { ...c, selected: !c.selected } : c)));
  };

  const selectAll = (flag: boolean) => {
    setChips(prev => prev.map(c => ({ ...c, selected: flag })));
  };

  const computeGrids = async () => {
    setError(null);
    setGrids(null);
    const numbers = selectedNumbers;
    if (numbers.length < 5) {
      setError('Sélectionnez au moins 5 numéros.');
      return;
    }
    if (mode === 'strict' && numbers.length > maxSelectionSize) {
      setError(`Votre sélection (${numbers.length}) dépasse la limite (${maxSelectionSize}). Réduisez la sélection ou passez en mode dynamique.`);
      return;
    }

    setIsComputing(true);
    try {
      // Univers: tous les triples C(n,3) à couvrir pour garantir 3/5
      const allTriples = generateAllTriples(numbers);
      const uncovered = new Set<string>(allTriples);

      const generated: GeneratedGrid[] = [];
      let gridId = 1;

      // Pré-calculer et limiter les combinaisons 5 pour performance
      const allK5 = generateCombinations(numbers, 5);
      const scanCap = Math.max(1, Math.min(maxCombosScanned, allK5.length));
      const scanList = allK5.slice(0, scanCap);

      // Glouton: ajouter la grille couvrant le plus de triples non couverts
      while (uncovered.size > 0) {
        let best: number[] = [];
        let bestCoverage = 0;

        for (const combo of scanList) {
          const triples = generateTriples(combo);
          let newCover = 0;
          for (const t of triples) if (uncovered.has(t)) newCover++;
          if (newCover > bestCoverage) {
            bestCoverage = newCover;
            best = combo;
          }
        }

        if (best.length === 0 || bestCoverage === 0) {
          // fallback: ajouter une grille simple en parcourant allK5 non scannés
          const fallback = allK5.find(arr => generateTriples(arr).some(t => uncovered.has(t)));
          if (!fallback) break;
          best = fallback;
        }

        generated.push({ id: gridId++, numbers: best.slice().sort((a, b) => a - b), cost: GRID_COST_EUR });
        // Marquer couverts
        generateTriples(best).forEach(t => uncovered.delete(t));
        // Éviter boucle infinie pour grands n
        if (generated.length >= maxGridsCap) break;
      }

      setGrids(generated);
    } catch (e: any) {
      setError(e?.message || 'Erreur lors de la génération.');
    } finally {
      setIsComputing(false);
    }
  };

  const totalCost = useMemo(() => (grids ? grids.reduce((s, g) => s + g.cost, 0) : 0), [grids]);
  const isStrict = mode === 'strict';

  const exportCSV = () => {
    if (!grids || grids.length === 0) return;
    const header = 'id;n1;n2;n3;n4;n5;cost\n';
    const rows = grids
      .map(g => [g.id, ...g.numbers, g.cost.toFixed(2)].join(';'))
      .join('\n');
    const csv = header + rows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grilles_garantie_3_sur_5.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-2xl border-2 bg-white p-4 shadow token-card">
      <div className="mb-3">
        <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-sora, inherit)' }}>
          Garantie 3/5 sur votre sélection
        </h3>
        <p className="text-xs text-slate-600">
          Génère un ensemble minimal de grilles de 5 garantissant au moins 3 bons numéros si le tirage contient
          au moins 3 numéros parmi votre sélection.
        </p>
      </div>

      {/* Réglages de performance */}
      <div className="mb-4 rounded border p-3 bg-slate-50">
        <div className="text-sm font-semibold mb-2">Mode de calcul</div>
        <div className="flex flex-wrap items-center gap-4 mb-2 text-sm">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="radio" name="mode" checked={mode === 'strict'} onChange={() => setMode('strict')} />
            <span>Strict (limite sélection)</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="radio" name="mode" checked={mode === 'dynamic'} onChange={() => setMode('dynamic')} />
            <span>Dynamique (sélection illimitée)</span>
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <label className="flex items-center justify-between gap-2">
            <span className="text-slate-700">Taille max sélection</span>
            <input type="number" min={5} max={30} value={maxSelectionSize} onChange={(e) => setMaxSelectionSize(parseInt(e.target.value || '0', 10) || 18)} className="w-20 px-2 py-1 border rounded" />
          </label>
          <label className={`flex items-center justify-between gap-2 ${isStrict ? 'opacity-50' : ''}`} title={isStrict ? 'Désactivé en mode Strict' : ''}>
            <span className="text-slate-700">Cap grilles</span>
            <input type="number" min={10} max={5000} value={maxGridsCap} onChange={(e) => setMaxGridsCap(parseInt(e.target.value || '0', 10) || 1000)} className="w-24 px-2 py-1 border rounded" disabled={isStrict} aria-disabled={isStrict} />
          </label>
          <label className={`flex items-center justify-between gap-2 ${isStrict ? 'opacity-50' : ''}`} title={isStrict ? 'Désactivé en mode Strict' : ''}>
            <span className="text-slate-700">Cap combinaisons scannées</span>
            <input type="number" min={100} max={20000} step={100} value={maxCombosScanned} onChange={(e) => setMaxCombosScanned(parseInt(e.target.value || '0', 10) || DEFAULT_MAX_COMBOS_SCANNED)} className="w-28 px-2 py-1 border rounded" disabled={isStrict} aria-disabled={isStrict} />
          </label>
        </div>
      </div>

      {baseSelection.length === 0 ? (
        <div className="text-sm text-slate-600">Aucune sélection trouvée. Commencez par choisir des numéros.</div>
      ) : (
        <>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm text-slate-700">{selectedNumbers.length} sélectionnés / {baseSelection.length}</div>
            <div className="flex gap-2">
              <button onClick={() => selectAll(true)} className="px-2 py-1 border rounded token-focusable">Tout</button>
              <button onClick={() => selectAll(false)} className="px-2 py-1 border rounded token-focusable">Aucun</button>
            </div>
          </div>
          <div className="grid grid-cols-6 md:grid-cols-10 gap-2 mb-4">
            {chips.map(chip => (
              <button
                key={chip.value}
                onClick={() => toggleChip(chip.value)}
                className={`px-2 py-1 rounded text-sm border token-focusable ${chip.selected ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-300'}`}
                aria-pressed={chip.selected}
              >
                {chip.value}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={computeGrids}
              disabled={isComputing}
              className={`px-4 py-2 rounded text-white font-semibold token-focusable ${isComputing ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {isComputing ? 'Calcul…' : 'Générer grilles garanties (3/5)'}
            </button>
            {grids && grids.length > 0 && (
              <button
                onClick={exportCSV}
                className="px-3 py-2 rounded border font-semibold token-focusable hover:bg-slate-50"
                title="Exporter en CSV"
              >
                Export CSV
              </button>
            )}
            {grids && (
              <div className="text-sm text-slate-700">
                {grids.length} grilles • Coût total ≈ {totalCost.toFixed(2)} €
              </div>
            )}
          </div>

          {error && <div className="mt-3 text-sm text-rose-600" role="alert">{error}</div>}

          {grids && grids.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Grilles générées</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {grids.map(g => (
                  <div key={g.id} className="border rounded p-2 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">#{g.id}</span>
                      <span className="text-slate-500">{g.cost.toFixed(2)} €</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {g.numbers.map(n => (
                        <span key={n} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">{n}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => {
                    try {
                      const session = savedGridsManager.saveGameSession(
                        'Garantie 3 sur 5',
                        new Date().toISOString().split('T')[0],
                        selectedNumbers,
                        grids.map(g => ({ id: String(g.id), numbers: g.numbers, cost: g.cost, type: 'simple', strategy: 'garantie_3_sur_5' })),
                        'garantie_3_sur_5'
                      );
                      alert(`✅ ${grids.length} grilles envoyées aux sauvegardes (session ${session.id}).`);
                    } catch (e) {
                      alert('❌ Impossible de sauvegarder les grilles');
                    }
                  }}
                  className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold token-focusable"
                >
                  Envoyer vers Sauvegardes
                </button>
                <span className="text-xs text-slate-600">Retrouvez-les dans vos sessions sauvegardées.</span>
              </div>
              <p className="mt-3 text-xs text-slate-600">
                Garantie: si le tirage contient au moins 3 numéros choisis ci‑dessus, au moins une de ces grilles contiendra ces 3 numéros.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}


