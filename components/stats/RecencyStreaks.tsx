"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { t } from '@/lib/i18n';

type Period = 'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100' | '10y' | '20y';

interface DrawItem {
  date: string;
  numero1?: number;
  numero2?: number;
  numero3?: number;
  numero4?: number;
  numero5?: number;
}

interface RecencyItem {
  numero: number;
  lastAppearance: string | null;
  currentAbsence: number; // nombre de tirages depuis la dernière apparition
  currentPresence: number; // nombre de tirages consécutifs au début de la période
  maxAbsence: number; // plus longue série d'absence dans la fenêtre
}

export default function RecencyStreaks({ period }: { period: Period }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draws, setDraws] = useState<DrawItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/statistics?type=list&window=${encodeURIComponent(period)}`);
        const json = await res.json();
        if (!json.success) throw new Error('Erreur chargement tirages');
        if (!cancelled) {
          setDraws(json.data || []);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Erreur chargement');
          setLoading(false);
        }
      }
    };
    run();
    return () => { cancelled = true; };
  }, [period]);

  const stats = useMemo(() => computeRecency(draws), [draws]);

  if (loading) return <div className="rounded-xl border p-4 text-sm text-slate-600">{t('rec.loading')}</div>;
  if (error) return <div className="rounded-xl border p-4 text-sm text-rose-600" role="alert">{error}</div>;

  const topAbsence = [...stats].sort((a, b) => b.currentAbsence - a.currentAbsence).slice(0, 12);
  const topPresence = [...stats].sort((a, b) => b.currentPresence - a.currentPresence).slice(0, 12);

  return (
    <section aria-labelledby="recency-title" className="card">
      <div className="section-header">
        <div>
          <h3 id="recency-title" className="section-title">{t('rec.title')}</h3>
          <p className="section-subtitle">⏱️ Présences / absences consécutives par numéro</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="pill pill-info">{t('common.period')}: {period}</span>
          <span className="pill pill-muted">{t('common.draws')}: {draws.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold mb-2">{t('rec.big_absence')}</h4>
          <ul className="space-y-1 text-sm">
            {topAbsence.map(item => (
              <li key={`abs-${item.numero}`} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">#{item.numero}</span>
                  <span className="text-slate-500">{t('rec.last')}: {item.lastAppearance ? new Date(item.lastAppearance).toLocaleDateString('fr-FR') : t('rec.never')}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-600">{t('rec.absence')}</span>
                  <span className="ml-2 font-bold">{item.currentAbsence}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">{t('rec.presences')}</h4>
          <ul className="space-y-1 text-sm">
            {topPresence.map(item => (
              <li key={`pre-${item.numero}`} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">#{item.numero}</span>
                  <span className="text-slate-500">{t('rec.max_abs')}: {item.maxAbsence}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-600">{t('rec.presence')}</span>
                  <span className="ml-2 font-bold">{item.currentPresence}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function computeRecency(draws: DrawItem[]): RecencyItem[] {
  // draws: récents -> anciens
  const result: RecencyItem[] = [];
  for (let n = 1; n <= 49; n++) {
    let lastAppearanceIndex: number | null = null;
    let currentAbsence = 0;
    let currentPresence = 0;
    let maxAbsence = 0;
    let continuousAbsence = 0;

    // présence/absence au début de la période
    const isPresentAt = (i: number) => {
      const d = draws[i];
      if (!d) return false;
      const arr = [d.numero1, d.numero2, d.numero3, d.numero4, d.numero5];
      return arr.includes(n);
    };

    // Compter la présence consécutive depuis le début
    for (let i = 0; i < draws.length; i++) {
      if (isPresentAt(i)) currentPresence++; else break;
    }

    // Parcourir pour lastAppearance et maxAbsence
    for (let i = 0; i < draws.length; i++) {
      if (isPresentAt(i)) {
        lastAppearanceIndex = lastAppearanceIndex == null ? i : lastAppearanceIndex;
        // reset absence streak
        if (continuousAbsence > maxAbsence) maxAbsence = continuousAbsence;
        continuousAbsence = 0;
      } else {
        continuousAbsence++;
      }
    }
    if (continuousAbsence > maxAbsence) maxAbsence = continuousAbsence;

    // Absence en tête
    if (draws.length > 0) {
      let i = 0;
      while (i < draws.length && !isPresentAt(i)) { currentAbsence++; i++; }
    }

    const lastAppearance = lastAppearanceIndex != null ? draws[lastAppearanceIndex]?.date || null : null;

    result.push({
      numero: n,
      lastAppearance,
      currentAbsence,
      currentPresence,
      maxAbsence
    });
  }
  return result;
}


