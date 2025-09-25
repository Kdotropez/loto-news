"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

type WindowKey = 'last20' | 'week' | 'month' | 'quarter' | 'semester' | 'year' | '10y' | '20y' | 'all';

interface Props {
	selectedWindow: WindowKey;
	onNumberSelection?: (mains: number[], comps: number[]) => void;
}

interface Summary {
	totalTirages: number;
	premierTirage: string | null;
	derniereMiseAJour: string | null;
	moyenneTiragesParMois: number;
	numerosChauds: Array<{ numero: number; frequence: number }>;
	numerosFroids: Array<{ numero: number; frequence: number }>;
}

interface NumeroStat { numero: number; frequence: number; }

interface TirageRow { id: number; date: string; numero1: number; numero2: number; numero3: number; numero4: number; numero5: number; complementaire?: number | null; }

const periodLabels: Record<WindowKey, string> = {
	week: 'Semaine',
	month: 'Mois',
	quarter: 'Trimestre',
	semester: 'Semestre',
	year: 'Année',
	'10y': '10 ans',
	'20y': '20 ans',
	all: 'Tous',
	last20: 'Derniers 20',
};

function formatDateHuman(raw: string | null | undefined): string {
	if (!raw) return '—';
	try {
		let s = String(raw);
		// Corriger jour/mois '00'
		const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
		if (m) {
			let [_, y, mo, d] = m;
			let year = Math.max(1976, Math.min(2099, parseInt(y, 10)));
			let month = Math.min(12, Math.max(1, parseInt(mo === '00' ? '01' : mo, 10)));
			let day = Math.min(28, Math.max(1, parseInt(d === '00' ? '01' : d, 10))); // éviter invalides
			const dt = new Date(Date.UTC(year, month - 1, day));
			if (isNaN(dt.getTime())) return '—';
			return dt.toLocaleDateString('fr-FR', { timeZone: 'UTC' });
		}
		// Tentative générique
		const dt = new Date(s);
		if (isNaN(dt.getTime())) return '—';
		return dt.toLocaleDateString('fr-FR');
	} catch {
		return '—';
	}
}

export default function AnalysisCenter({ selectedWindow, onNumberSelection }: Props) {
	const [loading, setLoading] = useState(true);
	const [summary, setSummary] = useState<Summary | null>(null);
	const [numeros, setNumeros] = useState<NumeroStat[]>([]);
	const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<TirageRow[]>([]);
	// personnalisation légère pour éviter des tickets identiques entre utilisateurs
	const [seedOffset, setSeedOffset] = useState<number>(0);
	const [userSeed, setUserSeed] = useState<string>('0');
	const [progress, setProgress] = useState<number>(0);
	const [processedDraws, setProcessedDraws] = useState<number>(0);
	const [processedNumbers, setProcessedNumbers] = useState<number>(0);

  // Génération d'une autre série (rotation contrôlée du seed)
  const regenerateSeries = () => {
    try {
      const key = 'loto_user_seed';
      const current = Number(localStorage.getItem(key) || '1');
      const next = (current + 1) % 997 || 1;
      localStorage.setItem(key, String(next));
      setUserSeed(String(next));
      setSeedOffset(next % 5);
    } catch {}
  };

	// état d'étape de l'analyse (progression UI)
	type AnalysisStep = 'idle' | 'frequencies' | 'tendances' | 'patterns' | 'predictions' | 'complete';
	const [analysisStep, setAnalysisStep] = useState<AnalysisStep>('idle');

	useEffect(() => {
		if (typeof window === 'undefined') return;
		try {
			const key = 'loto_user_seed';
			let seed = localStorage.getItem(key);
			if (!seed) {
				seed = String(1 + Math.floor(Math.random() * 997));
				localStorage.setItem(key, seed);
			}
			const off = Number(seed) % 5; // 0..4
			setSeedOffset(isNaN(off) ? 0 : off);
			setUserSeed(seed);
		} catch {}
	}, []);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				setLoading(true);
				setError(null);
				setAnalysisStep('idle');
				setProgress(0);
				setProcessedDraws(0);
				setProcessedNumbers(0);
				const [sRes, nRes] = await Promise.all([
					fetch(`/api/statistics?type=summary&window=${selectedWindow}`),
					fetch(`/api/statistics?type=numeros&window=${selectedWindow}`),
				]);
				const sJson = await sRes.json();
				const nJson = await nRes.json();
				if (!cancelled) {
					setSummary(sJson?.data || null);
					setNumeros(Array.isArray(nJson?.data) ? nJson.data as NumeroStat[] : []);
					setAnalysisStep('frequencies');
				}
			} catch (e: any) {
				if (!cancelled) setError(e?.message || 'Erreur chargement');
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => { cancelled = true; };
	}, [selectedWindow]);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const listAll = await fetch(`/api/statistics?type=list&window=all`);
				const jsonAll = await listAll.json();
				let allRows: TirageRow[] = Array.isArray(jsonAll?.data) ? jsonAll.data as TirageRow[] : [];
				// Tri décroissant par date côté client (sécurité)
				allRows = [...allRows].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
				let filtered: TirageRow[] = allRows;
				const latest = allRows[0]?.date ? new Date(allRows[0].date) : new Date();
				const withinDays = (d: number) => {
					const start = new Date(latest);
					start.setDate(start.getDate() - d);
					const s = start.toISOString().split('T')[0];
					return allRows.filter(r => r.date >= s);
				};
				switch (selectedWindow) {
					case 'last20': filtered = allRows.slice(0, 20); break;
					case 'week': filtered = withinDays(7); break;
					case 'month': filtered = withinDays(30); break;
					case 'quarter': filtered = withinDays(90); break;
					case 'semester': filtered = withinDays(182); break;
					case 'year': filtered = withinDays(365); break;
					case '10y': filtered = withinDays(3650); break;
					case '20y': filtered = withinDays(7300); break;
					case 'all': default: filtered = allRows; break;
				}
				if (!cancelled) setRows(filtered);
			} catch {}
		})();
		return () => { cancelled = true; };
	}, [selectedWindow]);

	// Animation de progression réaliste basée sur le total réel
	useEffect(() => {
		if (!summary) return;
		let timer: any;
		if (analysisStep === 'frequencies') {
			const targetDraws = Math.max(1, summary.totalTirages);
			const targetNums = 49;
			setProgress(0);
			timer = setInterval(() => {
				setProcessedDraws(prev => {
					const next = Math.min(targetDraws, prev + Math.max(1, Math.floor(targetDraws / 40)));
					return next;
				});
				setProcessedNumbers(prev => Math.min(targetNums, prev + 2));
				setProgress(p => {
					const np = Math.min(100, p + 4);
					if (np >= 100) {
						clearInterval(timer);
						setAnalysisStep('tendances');
					}
					return np;
				});
			}, 120);
		}
		return () => { if (timer) clearInterval(timer); };
	}, [analysisStep, summary]);

	useEffect(() => {
		let timer: any;
		if (analysisStep === 'tendances') {
			setProcessedNumbers(49);
			setProgress(0);
			timer = setInterval(() => {
				setProgress(p => {
					const np = Math.min(100, p + 8);
					if (np >= 100) {
						clearInterval(timer);
						setAnalysisStep('patterns');
					}
					return np;
				});
			}, 140);
		}
		return () => { if (timer) clearInterval(timer); };
	}, [analysisStep]);

	useEffect(() => {
		let timer: any;
		if (analysisStep === 'patterns') {
			setProgress(0);
			timer = setInterval(() => {
				setProgress(p => {
					const np = Math.min(100, p + 10);
					if (np >= 100) {
						clearInterval(timer);
						setAnalysisStep('predictions');
					}
					return np;
				});
			}, 160);
		}
		return () => { if (timer) clearInterval(timer); };
	}, [analysisStep]);

	useEffect(() => {
		let timer: any;
		if (analysisStep === 'predictions') {
			setProgress(0);
			timer = setInterval(() => {
				setProgress(p => {
					const np = Math.min(100, p + 20);
					if (np >= 100) {
						clearInterval(timer);
						setAnalysisStep('complete');
					}
					return np;
				});
			}, 180);
		}
		return () => { if (timer) clearInterval(timer); };
	}, [analysisStep]);

	// Son subtil en fin d'analyse
	useEffect(() => {
		if (analysisStep !== 'complete') return;
		try {
			const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
			if (!AudioCtx) return;
			const ctx = new AudioCtx();
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = 'sine';
			osc.frequency.setValueAtTime(880, ctx.currentTime);
			osc.connect(gain);
			gain.connect(ctx.destination);
			gain.gain.setValueAtTime(0.0001, ctx.currentTime);
			gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
			osc.start();
			gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
			osc.stop(ctx.currentTime + 0.38);
		} catch {}
	}, [analysisStep]);

	// hachage simple pour épsilon déterministe
	const hashCode = (s: string) => {
		let h = 0;
		for (let i = 0; i < s.length; i++) {
			h = ((h << 5) - h) + s.charCodeAt(i);
			h |= 0;
		}
		return Math.abs(h);
	};

	const epsilonFor = (num: number) => {
		const basis = `${userSeed}|${selectedWindow}|${summary?.derniereMiseAJour || ''}|${num}`;
		const h = hashCode(basis);
		return (h % 1000) / 1000 * 0.2; // 0..0.2 épsilon
	};

	const hotNumbers = useMemo(() => {
		if (!numeros || numeros.length === 0) return [] as number[];
		// score ajusté = fréquence + épsilon utilisateur pour tiebreak doux
		const scored = numeros.map(n => ({ numero: n.numero, score: (n.frequence || 0) + epsilonFor(n.numero) }));
		return scored.sort((a, b) => b.score - a.score).slice(0, 15).map(x => x.numero);
	}, [numeros, userSeed, selectedWindow, summary?.derniereMiseAJour]);

const bestChance = useMemo(() => {
    const counts = new Array(10).fill(0);
    rows.forEach(r => {
        const c = r.complementaire as number | undefined;
        if (typeof c === 'number' && c >= 1 && c <= 10) counts[c - 1]++;
    });
    let idx = 0;
    for (let i = 1; i < 10; i++) if (counts[i] > counts[idx]) idx = i;
    return idx + 1;
}, [rows]);

	// helpers indicateurs
	const freqMap = useMemo(() => {
		const m = new Map<number, number>();
		numeros.forEach(n => m.set(n.numero, n.frequence));
		return m;
	}, [numeros]);

	const rotateWithSeed = (arr: number[], offset: number) => {
		if (!arr.length) return arr;
		const o = ((offset % arr.length) + arr.length) % arr.length;
		return [...arr.slice(o), ...arr.slice(0, o)];
	};

	const baseSelection = useMemo(() => {
		const rotated = rotateWithSeed(hotNumbers, seedOffset);
		return rotated.slice(0, 5);
	}, [hotNumbers, seedOffset]);

	const indicators = useMemo(() => {
		const sel = baseSelection;
		if (sel.length === 0) return null;
		const even = sel.filter(n => n % 2 === 0).length;
		const odd = sel.length - even;
		const sum = sel.reduce((a, b) => a + b, 0);
		const min = Math.min(...sel);
		const max = Math.max(...sel);
		const spread = max - min;
		const avgFreq = sel.reduce((a, b) => a + (freqMap.get(b) || 0), 0) / sel.length;
		// Score simple 0-100 basé sur fréquence relative + équilibre parité + dispersion
		const maxFreq = Math.max(...numeros.map(n => n.frequence), 1);
		const freqScore = Math.min(100, Math.round((avgFreq / maxFreq) * 70));
		const parityScore = Math.round((1 - Math.abs(even - odd) / sel.length) * 20);
		const spreadScore = Math.round(((spread / 48) * 10));
		const totalScore = Math.min(100, freqScore + parityScore + spreadScore);
		return { even, odd, sum, spread, avgFreq: Math.round(avgFreq), score: totalScore };
	}, [baseSelection, freqMap, numeros]);

	// variantes
	const variants = useMemo(() => {
		const top = rotateWithSeed(hotNumbers, seedOffset);
		const prudent = top.slice(0, 5);
		const equilibré = [...top.slice(0, 3), ...top.slice(6, 8)];
		const coldAsc = [...numeros].sort((a, b) => a.frequence - b.frequence).map(n => n.numero).filter(n => !top.slice(0, 3).includes(n));
		const aggressif = [...top.slice(0, 3), ...coldAsc.slice(0, 2)];
		const comp = bestChance ?? 7;
		const mk = (name: string, nums: number[]) => ({ name, nums, comp });
		return [mk('Prudent', prudent), mk('Équilibré', equilibré), mk('Agressif', aggressif)];
	}, [hotNumbers, seedOffset, numeros, bestChance]);

  // Rapport IA (fenêtre courante)
  const report = useMemo(() => {
    if (!rows || rows.length === 0) return null;
    const numsByRow = rows.map(r => [r.numero1, r.numero2, r.numero3, r.numero4, r.numero5]);
    // Parité
    let evens = 0, odds = 0;
    numsByRow.flat().forEach(n => { if (typeof n === 'number') (n % 2 === 0 ? evens++ : odds++); });
    // Sommes
    const sums = numsByRow.map(arr => arr.reduce((a, b) => a + (b || 0), 0));
    const avgSum = sums.length ? Math.round(sums.reduce((a, b) => a + b, 0) / sums.length) : 0;
    const lastSum = sums[0] || 0;
    // Espacements
    const spacings: number[] = [];
    numsByRow.forEach(arr => {
      const s = [...arr].filter(Boolean).sort((a, b) => a - b);
      for (let i = 1; i < s.length; i++) spacings.push(s[i] - s[i - 1]);
    });
    spacings.sort((a, b) => a - b);
    const spacingMedian = spacings.length ? spacings[Math.floor(spacings.length / 2)] : 0;
    // Déciles 1..49
    const bins = new Array(10).fill(0);
    numsByRow.flat().forEach(n => {
      if (typeof n !== 'number') return;
      const idx = Math.min(9, Math.floor((n - 1) / 5));
      bins[idx]++;
    });
    // Top 10 chauds / froids (à partir de numeros)
    const hot10 = [...numeros].sort((a, b) => b.frequence - a.frequence).slice(0, 10);
    const cold10 = [...numeros].sort((a, b) => a.frequence - b.frequence).slice(0, 10);

    // Interprétations simples
    const totalNums = evens + odds || 1;
    const parityRatio = evens / totalNums; // proche de 0.5 idéal
    const parityLabel = parityRatio > 0.55 ? 'plutôt pairs' : parityRatio < 0.45 ? 'plutôt impairs' : 'équilibré';
    const idealSum = 125; // ~ moyenne théorique de 5 numéros uniformes 1..49
    const sumDiff = avgSum - idealSum;
    const sumLabel = Math.abs(sumDiff) <= 10 ? 'proche de la moyenne' : sumDiff > 10 ? 'élevée' : 'faible';
    const dispersionLabel = spacingMedian >= 7 ? 'bien étalée' : spacingMedian <= 4 ? 'resserrée' : 'modérée';
    // Zone la plus chargée (1-16 / 17-32 / 33-49)
    const zoneCounts = [0, 0, 0];
    numsByRow.flat().forEach(n => {
      if (typeof n !== 'number') return;
      if (n <= 16) zoneCounts[0]++; else if (n <= 32) zoneCounts[1]++; else zoneCounts[2]++;
    });
    const zoneIdx = zoneCounts.indexOf(Math.max(...zoneCounts));
    const zoneLabel = zoneIdx === 0 ? '1–16' : zoneIdx === 1 ? '17–32' : '33–49';
    const zoneTotal = zoneCounts.reduce((a,b)=>a+b,0) || 1;
    const zonePercents = zoneCounts.map(c => Math.round((c/zoneTotal)*100));

    // Chances (1–10) pour pourcentage
    const chanceCounts = new Array(10).fill(0);
    let chanceTotal = 0;
    rows.forEach(r => {
      const c = r.complementaire as number | undefined;
      if (typeof c === 'number' && c >= 1 && c <= 10) { chanceCounts[c-1]++; chanceTotal++; }
    });
    const bestChanceIdx = chanceCounts.indexOf(Math.max(...chanceCounts));
    const bestChancePct = chanceTotal ? Math.round((chanceCounts[bestChanceIdx]/chanceTotal)*100) : 0;

    // Couverture Top15 (≥1 et ≥2)
    const top15 = new Set(hotNumbers);
    let coverAny = 0, coverTwo = 0;
    numsByRow.forEach(arr => {
      const m = arr.filter(n => top15.has(n)).length;
      if (m >= 1) coverAny++;
      if (m >= 2) coverTwo++;
    });
    const coverAnyPct = Math.round((coverAny / (rows.length || 1)) * 100);
    const coverTwoPct = Math.round((coverTwo / (rows.length || 1)) * 100);

    // Retours probables: top 5 numéros avec grand "gap" + proba retour sur 10 tirages
    const countMap = new Map<number, number>();
    const lastSeen = new Map<number, number>();
    numsByRow.forEach((arr, idx) => {
      arr.forEach(n => {
        if (typeof n !== 'number') return;
        countMap.set(n, (countMap.get(n) || 0) + 1);
        if (!lastSeen.has(n)) lastSeen.set(n, idx); // premier passage = tirage le plus récent
      });
    });
    const gaps: { numero: number; gap: number; p10: number }[] = [];
    for (let numero = 1; numero <= 49; numero++) {
      const seenAt = lastSeen.get(numero);
      const gap = typeof seenAt === 'number' ? seenAt : rows.length; // si jamais vu, gap = fenêtre entière
      const count = countMap.get(numero) || 0;
      const p = (count / (rows.length || 1)); // proba empirique d'apparition par tirage
      const p10 = 1 - Math.pow(1 - Math.min(1, p), 10);
      gaps.push({ numero, gap, p10: Math.round(p10 * 100) / 100 });
    }
    const topReturns = gaps.sort((a,b) => b.gap - a.gap).slice(0,5);

    // Indice de confiance (0–100) basé sur équilibre parité, dispersion et couverture
    const parityScore = Math.max(0, Math.min(1, 1 - Math.abs(parityRatio - 0.5) / 0.5));
    // cible dispersion ~6 (entre 4 et 8 acceptable)
    const dispTarget = 6;
    const dispScore = Math.max(0, 1 - Math.min(1, Math.abs(spacingMedian - dispTarget) / 6));
    const coverScore = coverAnyPct / 100;
    // Poids (normalisés pour toujours sommer à 1)
    const weights = { parity: 0.35, disp: 0.25, cover: 0.40 };
    const sumW = weights.parity + weights.disp + weights.cover || 1;
    const nParity = weights.parity / sumW;
    const nDisp = weights.disp / sumW;
    const nCover = weights.cover / sumW;
    const confidence = Math.round((parityScore * nParity + dispScore * nDisp + coverScore * nCover) * 100);

    return { evens, odds, avgSum, lastSum, spacingMedian, bins, hot10, cold10, parityLabel, sumLabel, dispersionLabel, zoneLabel, zonePercents, bestChancePct, coverAnyPct, coverTwoPct, topReturns, confidence, weights: { parity: Math.round(nParity*100), disp: Math.round(nDisp*100), cover: Math.round(nCover*100) } };
  }, [rows, numeros]);

  // Etat UI avancé et bande de chaleur
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const heat = useMemo(() => {
    const maxF = Math.max(1, ...numeros.map(n => n.frequence || 0));
    const map = new Map<number, number>();
    numeros.forEach(n => map.set(n.numero, (n.frequence || 0) / maxF));
    return Array.from({ length: 49 }, (_, i) => ({ num: i + 1, v: map.get(i + 1) || 0 }));
  }, [numeros]);

  // Couleurs lisibles (bleu froid → rouge chaud) + contraste texte et bordure
  const heatStyled = useMemo(() => {
    // Calcul de l'absence (nombre de tirages depuis la dernière apparition) dans la fenêtre
    const lastSeenIdx = new Map<number, number>();
    rows.forEach((r, idx) => {
      [r.numero1, r.numero2, r.numero3, r.numero4, r.numero5].forEach(n => {
        if (typeof n !== 'number') return;
        if (!lastSeenIdx.has(n)) lastSeenIdx.set(n, idx); // idx=0 est le plus récent
      });
    });
    const windowSize = rows.length;

    return heat.map(h => {
      const hue = Math.round(220 - 220 * h.v); // 220 (bleu) → 0 (rouge)
      const light = Math.round(62 - 30 * h.v); // plus chaud → plus sombre
      const color = `hsl(${hue}, 85%, ${light}%)`;
      const text = h.v > 0.55 ? '#ffffff' : '#111827';
      const border = `rgba(0,0,0,${0.15 + 0.35 * h.v})`;
      const gap = lastSeenIdx.has(h.num) ? lastSeenIdx.get(h.num)! : windowSize; // si jamais vu, absence = taille fenêtre
      return { ...h, color, text, border, gap };
    });
  }, [heat, rows]);

  // Tri de la chaleur des numéros
  const [heatSort, setHeatSort] = useState<'num' | 'gap' | 'heat'>(() => {
    if (typeof window !== 'undefined') {
      const v = localStorage.getItem('loto_heat_sort');
      if (v === 'gap' || v === 'heat' || v === 'num') return v;
    }
    return 'gap';
  });
  const sortedHeat = useMemo(() => {
    const arr = [...heatStyled];
    if (heatSort === 'gap') arr.sort((a, b) => b.gap - a.gap || a.num - b.num);
    else if (heatSort === 'heat') arr.sort((a, b) => b.v - a.v || a.num - b.num);
    else arr.sort((a, b) => a.num - b.num);
    return arr;
  }, [heatStyled, heatSort]);

	return (
		<div className="relative z-10">
			{/* Badge provisoire d'identification */}
			<div className="absolute -top-3 left-0 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-white/90 shadow">
				Centre d'Analyse IA
			</div>
			{/* Panneau de progression + animations "Loto" */}
			<div className="bg-slate-900 rounded-xl p-5 mb-6 relative overflow-hidden">
				<div className="absolute -top-3 left-0 text-[10px] px-2 py-0.5 rounded bg-slate-700 text-white/90 shadow">Progression & Machine</div>
				{/* halos flashy */}
				<div className="absolute -top-10 -left-8 w-28 h-28 bg-pink-500 rounded-full blur-3xl opacity-30"></div>
				<div className="absolute -bottom-10 -right-10 w-32 h-32 bg-fuchsia-500 rounded-full blur-3xl opacity-30"></div>
				<div className="text-center mb-3">
					<div className="text-fuchsia-300 text-sm font-mono">
						{analysisStep === 'frequencies' && 'Calcul des fréquences réelles…'}
						{analysisStep === 'tendances' && 'Analyse des tendances temporelles…'}
						{analysisStep === 'patterns' && 'Détection des patterns statistiques…'}
						{analysisStep === 'predictions' && 'Génération de la sélection optimale…'}
						{analysisStep === 'complete' && '✓ Analyse terminée'}
					</div>
				</div>
				<div className="h-2 bg-slate-700 rounded overflow-hidden">
					<div className="h-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500" style={{ width: `${progress}%` }}></div>
				</div>
				<div className="mt-3 grid grid-cols-2 gap-4 text-xs text-slate-300">
					<div>• Tirages parcourus: {Math.min(processedDraws, summary?.totalTirages || 0).toLocaleString()}/{summary?.totalTirages?.toLocaleString?.() || '—'}</div>
					<div>• Numéros traités: {Math.min(processedNumbers, 49)}/49</div>
				</div>
				<div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
					<div className={`text-center p-2 rounded ${analysisStep !== 'idle' ? 'bg-pink-600' : 'bg-slate-700'}`}>
						<div className="text-pink-100 text-xs">Fréquences</div>
						<div className="text-white text-sm">{analysisStep === 'frequencies' ? `${progress}%` : analysisStep !== 'idle' ? '✓' : '—'}</div>
					</div>
					<div className={`text-center p-2 rounded ${['tendances','patterns','predictions','complete'].includes(analysisStep) ? 'bg-fuchsia-600' : 'bg-slate-700'}`}>
						<div className="text-fuchsia-100 text-xs">Tendances</div>
						<div className="text-white text-sm">{analysisStep === 'tendances' ? `${progress}%` : ['patterns','predictions','complete'].includes(analysisStep) ? '✓' : '—'}</div>
					</div>
					<div className={`text-center p-2 rounded ${['patterns','predictions','complete'].includes(analysisStep) ? 'bg-violet-600' : 'bg-slate-700'}`}>
						<div className="text-violet-100 text-xs">Patterns</div>
						<div className="text-white text-sm">{analysisStep === 'patterns' ? `${progress}%` : ['predictions','complete'].includes(analysisStep) ? '✓' : '—'}</div>
					</div>
					<div className={`text-center p-2 rounded ${['predictions','complete'].includes(analysisStep) ? 'bg-rose-600' : 'bg-slate-700'}`}>
						<div className="text-rose-100 text-xs">Prédictions</div>
						<div className="text-white text-sm">{analysisStep === 'predictions' ? `${progress}%` : analysisStep === 'complete' ? '✓' : '—'}</div>
					</div>
				</div>

				{/* Machine à boules flashy (visible tant que non terminé) */}
				{analysisStep !== 'complete' && (
					<div className="relative mt-6 h-40 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-fuchsia-500/30 overflow-hidden">
						{/* cuve */}
						<div className="absolute inset-2 rounded-xl border border-pink-400/30"></div>
						{/* boules animées */}
						{[...Array(9)].map((_, i) => (
							<motion.div
								key={i}
								className="absolute w-8 h-8 rounded-full text-white text-sm font-bold flex items-center justify-center shadow-lg"
								style={{
									left: `${10 + (i % 3) * 30}%`,
									top: `${10 + Math.floor(i / 3) * 25}%`,
									background: 'linear-gradient(135deg,#ec4899,#8b5cf6)'
								}}
								animate={{
									y: [0, -10, 0],
									rotate: [0, 10, -10, 0],
									scale: [1, 1.05, 1]
								}}
								transition={{ duration: 2 + i * 0.15, repeat: Infinity }}
							>
								{(i * 5 + 7) % 49 + 1}
							</motion.div>
						))}
					</div>
				)}

				{/* Ticket qui s'imprime à la fin */}
				{analysisStep === 'complete' && (
		  <div className="relative mt-6 flex flex-col items-center gap-6">
					<div className="absolute -top-3 left-0 text-[10px] px-2 py-0.5 rounded bg-rose-700 text-white/90 shadow">Ticket imprimé</div>
						<div className="relative w-full max-w-md">
							<div className="absolute inset-x-0 -top-2 h-2 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 rounded-t"></div>
							<motion.div
								initial={{ y: -200, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ type: 'spring', stiffness: 120, damping: 14 }}
								className="bg-white rounded-xl shadow-2xl border-2 border-fuchsia-300 overflow-hidden"
							>
								<div className="px-5 py-4 bg-gradient-to-r from-pink-50 to-violet-50 border-b border-fuchsia-200">
									<div className="text-xs font-semibold text-fuchsia-600">TICKET LOTO</div>
									<div className="text-slate-600 text-xs">Sélection IA imprimée</div>
								</div>
								<div className="p-5">
									<div className="text-slate-700 text-sm mb-2">Numéros</div>
									<div className="flex flex-wrap gap-2 mb-3">
										{baseSelection.map((n, idx) => (
											<span key={idx} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white font-bold">
												{n}
											</span>
										))}
									<span className="mx-1 text-slate-500">+</span>
									<span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold">
										{bestChance}
									</span>
									</div>
									{/* Indicateurs */}
									{indicators && (
										<div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 mb-2">
											<div>Score: <span className="font-semibold text-slate-800">{indicators.score}/100</span></div>
											<div>Parité: <span className="font-semibold text-slate-800">{indicators.even}/{indicators.odd}</span></div>
											<div>Somme: <span className="font-semibold text-slate-800">{indicators.sum}</span></div>
											<div>Dispersion: <span className="font-semibold text-slate-800">{indicators.spread}</span></div>
											<div>Fréq. moy.: <span className="font-semibold text-slate-800">{indicators.avgFreq}</span></div>
											<div>Période: <span className="font-semibold text-slate-800">{periodLabels[selectedWindow]}</span></div>
										</div>
									)}
								</div>
							</motion.div>
						</div>

						{/* Variantes */}
						<div className="w-full max-w-3xl relative">
							<div className="absolute -top-3 left-0 text-[10px] px-2 py-0.5 rounded bg-emerald-700 text-white/90 shadow">Variantes</div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-slate-200 text-sm">Variantes proposées</div>
                <div className="flex items-center gap-3">
                  <button
                    className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white font-semibold hover:opacity-95"
                    onClick={regenerateSeries}
                  >
                    🎲 Générer une autre série
                  </button>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 mb-3">
                Explication: ce bouton sert à départager les tirages entre différents utilisateurs d’un même programme.
                La pertinence statistique reste identique (mêmes fréquences et période), seule la variante de ticket affichée change.
              </div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{variants.map(v => (
									<div key={v.name} className="bg-white rounded-xl border border-slate-200 p-3 shadow">
										<div className="text-xs font-semibold text-slate-500 mb-2">{v.name}</div>
										<div className="flex flex-wrap gap-1 mb-2">
											{v.nums.map((n, i) => (
												<span key={i} className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-xs font-bold">{n}</span>
											))}
											<span className="mx-1 text-slate-500 text-xs">+</span>
											<span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-bold">{v.comp}</span>
										</div>
										<button
											className="w-full text-xs py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:opacity-95"
											onClick={() => onNumberSelection?.(v.nums, [v.comp])}
										>
											Utiliser cette variante
										</button>
									</div>
								))}
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Ticker lumineux des derniers tirages */}
			<div className="relative mb-4">
				<div className="absolute -top-3 left-0 text-[10px] px-2 py-0.5 rounded bg-indigo-700 text-white/90 shadow">Ticker tirages</div>
				<div className="ticker rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 text-white shadow">
					<div className="ticker__track px-6 py-2 font-semibold">
						{rows.slice(0, 12).map((r, i) => (
							<span key={i} className="mr-8">
								{formatDateHuman(r.date)} • {r.numero1}-{r.numero2}-{r.numero3}-{r.numero4}-{r.numero5}{r.complementaire ? ` + ${r.complementaire}` : ''}
							</span>
						))}
					</div>
				</div>
				<style jsx>{`
				.ticker { overflow: hidden; white-space: nowrap; }
				.ticker__track { display: inline-block; padding-left: 100%; animation: ticker 25s linear infinite; }
				@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
				`}</style>
			</div>

			{/* Tableau temps réel des tirages de la fenêtre */}
			<div className="bg-white rounded-2xl p-5 shadow-xl border border-slate-200 mb-6 relative">
				<div className="absolute -top-3 left-0 text-[10px] px-2 py-0.5 rounded bg-slate-700 text-white/90 shadow">Tirages de la période</div>
				<div className="flex items-center justify-between mb-3">
					<h3 className="text-lg font-bold text-slate-800">🗂️ Tirages de la période ({rows.length})</h3>
					<div className="text-xs text-slate-500">{periodLabels[selectedWindow]}</div>
				</div>
				<div className="max-h-64 overflow-auto rounded-xl border border-slate-100">
					<table className="min-w-full text-sm">
						<thead className="bg-slate-50 text-slate-600">
							<tr>
								<th className="px-3 py-2 text-left">Date</th>
								<th className="px-3 py-2 text-left">Numéros</th>
								<th className="px-3 py-2 text-left">Compl.</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((r, idx) => (
								<tr key={`${r.id}-${idx}`} className={idx % 2 ? 'bg-white' : 'bg-slate-50'}>
									<td className="px-3 py-2">{formatDateHuman(r.date)}</td>
									<td className="px-3 py-2">
										<div className="flex gap-1">
											{[r.numero1, r.numero2, r.numero3, r.numero4, r.numero5].map((n, i) => (
												<span key={i} className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold">{n}</span>
											))}
										</div>
									</td>
									<td className="px-3 py-2">
										{r.complementaire ? (
											<span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold">{r.complementaire}</span>
										) : '—'}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Héros thématique Loto */}
			<div className="text-center mb-6 relative">
				<div className="absolute -top-3 left-0 text-[10px] px-2 py-0.5 rounded bg-indigo-700 text-white/90 shadow">Laboratoire</div>
				<div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow-lg border border-slate-200">
					<div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
						<span className="text-white text-lg">🎰</span>
					</div>
					<div className="text-left">
						<h2 className="text-2xl md:text-3xl font-bold text-slate-800">Laboratoire de Numéros</h2>
						<p className="text-sm text-slate-600">Période: {periodLabels[selectedWindow]}</p>
					</div>
				</div>
			</div>

			{/* KPIs */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 relative">
				<div className="absolute -top-3 left-0 text-[10px] px-2 py-0.5 rounded bg-slate-700 text-white/90 shadow">KPIs</div>
				<div className="bg-white rounded-xl p-4 shadow border">
					<div className="text-xs text-slate-500">Tirages analysés</div>
					<div className="text-2xl font-bold text-slate-800">{summary?.totalTirages?.toLocaleString?.() || '—'}</div>
				</div>
				<div className="bg-white rounded-xl p-4 shadow border">
					<div className="text-xs text-slate-500">Premier tirage</div>
					<div className="text-sm font-semibold text-slate-800">{formatDateHuman(summary?.premierTirage)}</div>
				</div>
				<div className="bg-white rounded-xl p-4 shadow border">
					<div className="text-xs text-slate-500">Dernier tirage</div>
					<div className="text-sm font-semibold text-slate-800">{formatDateHuman(summary?.derniereMiseAJour)}</div>
				</div>
				<div className="bg-white rounded-xl p-4 shadow border">
					<div className="text-xs text-slate-500">Moyenne/mois</div>
					<div className="text-2xl font-bold text-slate-800">{summary?.moyenneTiragesParMois ?? '—'}</div>
				</div>
			</div>

			{/* Fréquences et sélection IA */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-xl border border-slate-200 relative">
					<div className="absolute -top-3 left-0 text-[10px] px-2 py-0.5 rounded bg-blue-700 text-white/90 shadow">Fréquences réelles</div>
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><span>📊</span> Fréquences réelles</h3>
						<div className="text-xs text-slate-500">{periodLabels[selectedWindow]}</div>
					</div>
					{loading ? (
						<div className="text-slate-500 text-sm">Chargement…</div>
					) : error ? (
						<div className="text-red-600 text-sm">{error}</div>
					) : (
						<div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
							{[...numeros]
								.sort((a, b) => b.frequence - a.frequence)
								.slice(0, 30)
								.map((n) => (
									<div key={n.numero} className="text-center">
										<div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
											{n.numero}
										</div>
										<div className="text-[10px] text-slate-500 mt-1">{n.frequence}</div>
									</div>
								))}
						</div>
					)}
				</div>

				<div className="bg-gradient-to-b from-emerald-50 to-emerald-100 rounded-2xl p-5 shadow-xl border border-emerald-200 relative">
					<div className="absolute -top-3 left-0 text-[10px] px-2 py-0.5 rounded bg-emerald-700 text-white/90 shadow">Sélection IA</div>
					<h3 className="text-lg font-bold text-emerald-800 mb-3">🎯 Sélection IA</h3>
					<div className="text-emerald-700 text-sm mb-2">Top 15 numéros (fenêtre {periodLabels[selectedWindow]})</div>
					<div className="flex flex-wrap gap-2 mb-3">
						{hotNumbers.map(n => (
							<span key={n} className="bg-emerald-500 text-white px-2 py-1 rounded-full text-sm font-bold">{n}</span>
						))}
					</div>
          <div className="text-emerald-700 text-sm mb-2">Complémentaire (1–10)</div>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold">{bestChance}</span>
            <span className="text-[11px] text-slate-500">Basé sur les tirages de la période</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <button
              className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow hover:opacity-95"
              onClick={() => onNumberSelection?.(hotNumbers.slice(0, 5), [bestChance])}
            >
              Utiliser Top 5
            </button>
            <button
              className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold shadow hover:opacity-95"
              onClick={() => onNumberSelection?.(hotNumbers.slice(0, 15), [bestChance])}
            >
              Utiliser Top 15
            </button>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Info: “Utiliser Top 5/15” pré-remplit l’écran Génération de grilles avec ce groupe.
            Les grilles seront construites à partir de ces numéros (mélanges/combinaisons), avec le numéro chance proposé.
          </div>
				</div>
			</div>

      {/* Rapport d’analyse IA — refonte simplifiée */}
    {report && (
      <div className="mt-6 rounded-2xl overflow-hidden shadow-xl border border-slate-200">
        <div className="px-5 py-4 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧠</span>
            <span className="font-bold">Rapport d’Analyse IA</span>
          </div>
          <div className="text-[11px] px-2 py-1 rounded-full bg-white/15 border border-white/20">
            Période: {periodLabels[selectedWindow]} • Tirages: {rows.length}
          </div>
        </div>
        <div className="p-5 bg-white">
          {/* Jauge + 3 cartes clés */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center justify-center md:justify-start">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-24 h-24">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="url(#g)" strokeWidth="2" strokeDasharray={`${report.confidence}, 100`} />
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ec4899"/>
                      <stop offset="100%" stopColor="#8b5cf6"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700">{report.confidence}/100</div>
              </div>
            </div>
            <div className="rounded-xl p-4 bg-emerald-50 border border-emerald-200">
              <div className="text-emerald-700 text-xs mb-1">Couverture Top 15</div>
              <div className="text-slate-800 text-sm font-semibold">≥1: {report.coverAnyPct}% · ≥2: {report.coverTwoPct}%</div>
              <div className="text-[11px] text-emerald-700 mt-1">Votre Top 15 couvre bien la période</div>
            </div>
            <div className="rounded-xl p-4 bg-amber-50 border border-amber-200">
              <div className="text-amber-700 text-xs mb-1">Numéro Chance</div>
              <div className="text-slate-800 text-sm font-semibold"># {bestChance} le plus vu récemment</div>
            </div>
            <div className="rounded-xl p-4 bg-indigo-50 border border-indigo-200">
              <div className="text-indigo-700 text-xs mb-1">Parité & Dispersion</div>
              <div className="text-slate-800 text-sm font-semibold">{report.evens}/{report.odds} · {report.dispersionLabel}</div>
            </div>
          </div>

          {/* Ce qu’il faut retenir */}
          <div className="mb-6 rounded-xl border border-slate-200 p-4 bg-slate-50">
            <div className="text-slate-700 text-sm font-semibold mb-2">Ce qu’il faut retenir</div>
            <ul className="text-[13px] text-slate-700 list-disc pl-5 space-y-1">
              <li>Parité {report.parityLabel}.</li>
              <li>Somme {report.sumLabel}.</li>
              <li>Zone la plus active: {report.zoneLabel}.</li>
            </ul>
          </div>

          {/* Chaleur des numéros (1..49) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-slate-700 text-sm font-semibold">Chaleur des numéros</div>
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <span>Trier par</span>
                <select className="border rounded px-2 py-1"
                        value={heatSort}
                        onChange={(e)=> { setHeatSort(e.target.value as any); try { localStorage.setItem('loto_heat_sort', e.target.value); } catch {} }}>
                  <option value="num">Numéro</option>
                  <option value="gap">Absence (desc)</option>
                  <option value="heat">Chaleur (desc)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-1 text-[10px]">
              {sortedHeat.map(h => (
                <div
                  key={h.num}
                  className="rounded h-8 flex items-center justify-between border px-2"
                  style={{ background: h.color, color: h.text, borderColor: h.border }}
                  title={`n°${h.num} — absence: ${h.gap} tirages`}
                >
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full font-bold shadow-sm"
                    style={{ background: 'rgba(255,255,255,0.9)', color: '#111827', border: `1px solid ${h.border}` }}
                  >
                    {h.num}
                  </span>
                  <span className="opacity-90">abs: {h.gap}</span>
                </div>
              ))}
            </div>
            <div className="mt-1 text-[10px] text-slate-500">Froid (bleu) → Chaud (rouge) • “abs” = tirages depuis la dernière apparition</div>
          </div>

          {/* Surveillance (retours probables) – simplifiée */}
          <div className="mb-2">
            <div className="text-slate-700 text-sm font-semibold mb-2">Surveillance (retours probables)</div>
            <div className="flex flex-wrap gap-2 text-[12px]">
              {report.topReturns.slice(0,5).map((r:any) => (
                <span key={r.numero} className="px-2 py-1 rounded-full border text-slate-700 border-slate-200">n° {r.numero} — absent: {r.gap}</span>
              ))}
            </div>
          </div>

          {/* Conseil du Labo */}
          <div className="mt-4 rounded-xl border border-emerald-200 p-4 bg-emerald-50 text-emerald-800 text-sm">
            <strong>Conseil du Labo:</strong> panachez 2 chauds + 2 équilibrés + 1 audacieux, puis testez 2 variantes.
          </div>

          {/* Détails avancés repliables */}
          <div className="mt-4">
            <button className="text-xs px-3 py-1.5 rounded bg-slate-100 border" onClick={()=> setShowAdvanced(v => !v)}>
              {showAdvanced ? 'Masquer les détails' : 'Voir les détails (avancé)'}
            </button>
            {showAdvanced && (
              <div className="mt-3 space-y-4 text-[12px] text-slate-700">
                <div>
                  <div className="font-semibold mb-1">Déciles (1–49)</div>
                  <div className="grid grid-cols-10 gap-2 items-end h-24">
                    {report.bins.map((v: number, i: number) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className="w-5 bg-indigo-500/30 rounded" style={{ height: `${Math.min(100, v)}%` }}></div>
                        <div className="text-[10px] text-slate-500">{i*5+1}-{i*5+5}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Retours probables (sur 10 tirages)</div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    {report.topReturns.map((r: any) => (
                      <div key={r.numero} className="rounded-lg border border-slate-200 p-2 text-center">
                        <div className="font-bold text-slate-800">{r.numero}</div>
                        <div className="text-slate-500">Absence du numéro: {r.gap} tirages</div>
                        <div className="text-emerald-700 font-semibold">
                          {Math.round(r.p10*100) === 0 ? 'Jamais observé dans la période' : `${Math.round(r.p10*100)}% estimé`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

      {/* Résumé d'analyse et statistiques (footer) */}
		{report && summary && (
			<div className="mt-6 bg-white rounded-2xl p-5 shadow border border-slate-200 relative">
				<div className="absolute -top-3 left-0 text-[10px] px-2 py-0.5 rounded bg-slate-700 text-white/90 shadow">Synthèse rapide</div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-slate-800 font-bold flex items-center gap-2"><span>📋</span> Synthèse rapide</h4>
            <span className="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{periodLabels[selectedWindow]}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[13px] text-slate-700">
            <div>• Parité: <span className="font-semibold text-slate-900">{Math.round((report.evens/(report.evens+report.odds||1))*100)}% paires</span> / {Math.round((report.odds/(report.evens+report.odds||1))*100)}% impaires</div>
            <div>• Zones: <span className="font-semibold text-slate-900">{report.zonePercents[0]}%</span> (1–16) / <span className="font-semibold text-slate-900">{report.zonePercents[1]}%</span> (17–32) / <span className="font-semibold text-slate-900">{report.zonePercents[2]}%</span> (33–49)</div>
            <div>• Chance #{bestChance}: <span className="font-semibold text-amber-600">{report.bestChancePct}%</span> des tirages</div>
          </div>
        </div>
      )}

      {/* Rapport d'Analyse IA (supprimé pour niveau Débutant) */}
		</div>
	);
}
