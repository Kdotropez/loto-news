"use client";
import React, { useEffect, useState } from 'react';
import { t } from '@/lib/i18n';

type Period = 'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100' | '10y' | '20y';

interface PatternsData {
  evens: number;
  odds: number;
  parityRatio: string; // "0.52"
  avgSum: number;
  lastSum: number;
  spacingMedian: number;
  chi2: number;
  decileBins: number[]; // 10 bins
  recentBias: { zone: string; counts: number[] };
}

export default function PatternsOverview({ period }: { period: Period }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PatternsData | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/statistics?type=patterns&window=${encodeURIComponent(period)}`);
        const json = await res.json();
        if (!json.success) throw new Error('Erreur patterns');
        if (!cancelled) {
          setData(json.data);
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

  if (loading) return <div className="rounded-xl border p-4 text-sm text-slate-600">{t('pat.loading')}</div>;
  if (error) return <div className="rounded-xl border p-4 text-sm text-rose-600" role="alert">{error}</div>;
  if (!data) return null;

  const ratio = Number(data.parityRatio || '0');
  const totalParity = data.evens + data.odds;
  const evenPct = totalParity > 0 ? Math.round((data.evens / totalParity) * 100) : 0;
  const oddPct = 100 - evenPct;

  const maxBin = Math.max(1, ...data.decileBins);

  return (
    <section aria-labelledby="patterns-title" className="card">
      <div className="section-header">
        <div>
          <h3 id="patterns-title" className="section-title">{t('pat.title')}</h3>
          <p className="section-subtitle">✨ Répartition par parité, somme et zones</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="pill pill-info">{t('common.period')}: {period}</span>
          <span className="pill pill-muted">{t('pat.hint')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Parité */}
        <div className="rounded-lg border p-3">
          <h4 className="text-sm font-semibold mb-2">{t('pat.parity')}</h4>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-2 bg-slate-200 rounded overflow-hidden">
                <div className="h-2 bg-sky-500" style={{ width: `${evenPct}%` }} />
              </div>
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>Pairs {evenPct}%</span>
                <span>Impairs {oddPct}%</span>
              </div>
            </div>
            <div className="text-xs text-slate-600">{t('pat.ratio')}: {ratio}</div>
          </div>
        </div>

        {/* Sommes */}
        <div className="rounded-lg border p-3">
          <h4 className="text-sm font-semibold mb-2">{t('pat.sums')}</h4>
          <div className="text-sm text-slate-700">{t('pat.avg')}: <span className="font-semibold">{data.avgSum}</span></div>
          <div className="text-sm text-slate-700">{t('pat.last')}: <span className="font-semibold">{data.lastSum}</span></div>
          <div className="text-xs text-slate-500 mt-1">{t('pat.spacing')}: {data.spacingMedian} • χ²={data.chi2}</div>
        </div>

        {/* Biais récent */}
        <div className="rounded-lg border p-3">
          <h4 className="text-sm font-semibold mb-2">{t('pat.recent_bias')}</h4>
          <div className="text-sm text-slate-700">{t('pat.dominant_zone')}: <span className="font-semibold">{data.recentBias.zone}</span></div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-600">
            {data.recentBias.counts.map((c, i) => (
              <div key={`rb-${i}`} className="rounded border p-2 text-center">
                <div className="font-semibold">{c}</div>
                <div>{i === 0 ? t('pat.zone1') : i === 1 ? t('pat.zone2') : t('pat.zone3')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Répartition déciles */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold mb-2">{t('pat.deciles')}</h4>
        <div className="relative h-32 w-full border rounded-md p-2 overflow-hidden">
          <div className="absolute inset-0 flex items-end gap-2 p-2">
            {data.decileBins.map((v, idx) => (
              <div key={`bin-${idx}`} className="flex-1 min-w-[6px]">
                <div
                  className="bg-emerald-500 hover:bg-emerald-600 transition-all rounded-sm"
                  style={{ height: `${(v / maxBin) * 100}%` }}
                  title={`Décile ${idx + 1}: ${v}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


