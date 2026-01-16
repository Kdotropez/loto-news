"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { t } from '@/lib/i18n';

type Period = 'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100' | '10y' | '20y';

interface NumeroFreq {
  numero: number;
  frequence: number;
  derniere_sortie?: string;
  ecart_actuel?: number;
}

interface FrequencyTrendsProps {
  period: Period;
}

export default function FrequencyTrends({ period }: FrequencyTrendsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainFreq, setMainFreq] = useState<NumeroFreq[]>([]);
  const [totalDraws, setTotalDraws] = useState<number>(0);
  const [chanceFreq, setChanceFreq] = useState<Array<{ numero: number; frequence: number }>>([]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fréquences des numéros principaux 1..49 via API dédiée
        const resMain = await fetch(`/api/statistics?type=numeros&window=${encodeURIComponent(period)}`);
        const jsonMain = await resMain.json();
        if (!jsonMain.success) throw new Error('Erreur statistiques numéros');
        const main: NumeroFreq[] = (jsonMain.data as any[]) || [];

        // Liste des tirages pour compter le complémentaire
        const resList = await fetch(`/api/statistics?type=list&window=${encodeURIComponent(period)}`);
        const jsonList = await resList.json();
        if (!jsonList.success) throw new Error('Erreur liste tirages');
        const draws: Array<{ complementaire: number | null }> = jsonList.data || [];

        const total = draws.length;
        const chanceCounts = new Array(10).fill(0);
        for (const d of draws) {
          const c = d.complementaire;
          if (typeof c === 'number' && c >= 1 && c <= 10) chanceCounts[c - 1]++;
        }
        const chance = chanceCounts.map((cnt, idx) => ({ numero: idx + 1, frequence: cnt }));

        if (!cancelled) {
          setMainFreq(main);
          setChanceFreq(chance);
          setTotalDraws(total);
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
    return () => {
      cancelled = true;
    };
  }, [period]);

  const expectedMain = useMemo(() => (totalDraws > 0 ? (totalDraws * 5) / 49 : 0), [totalDraws]);
  const expectedChance = useMemo(() => (totalDraws > 0 ? totalDraws / 10 : 0), [totalDraws]);

  if (loading) {
    return (
      <div className="rounded-xl border p-4 text-sm text-slate-600">{t('freq.loading')}</div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border p-4 text-sm text-rose-600" role="alert">{error}</div>
    );
  }

  return (
    <div className="space-y-8">
      <section aria-labelledby="freq-title" className="rounded-2xl border-2 bg-white p-4 shadow">
        <div className="flex items-end justify-between gap-4 mb-3">
          <div>
            <h3 id="freq-title" className="text-lg font-bold text-slate-900">{t('freq.title_main')}</h3>
            <p className="text-xs text-slate-600">{t('common.period')}: {period} • {t('common.draws')}: {totalDraws} • {t('freq.expected', { value: expectedMain.toFixed(1) })}</p>
          </div>
          <div className="text-xs text-slate-500">{t('freq.legend')}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BarChart
            data={mainFreq.map(d => ({ label: d.numero.toString(), value: d.frequence }))}
            expected={expectedMain}
            maxBars={49}
          />
          <TopLists main={mainFreq} />
        </div>
      </section>

      <section aria-labelledby="chance-title" className="rounded-2xl border-2 bg-white p-4 shadow">
        <div className="flex items-end justify-between gap-4 mb-3">
          <div>
            <h3 id="chance-title" className="text-lg font-bold text-slate-900">{t('freq.title_chance')}</h3>
            <p className="text-xs text-slate-600">{t('common.period')}: {period} • {t('common.draws')}: {totalDraws} • {t('freq.expected', { value: expectedChance.toFixed(1) })}</p>
          </div>
        </div>
        <BarChart
          data={chanceFreq.map(d => ({ label: d.numero.toString(), value: d.frequence }))}
          expected={expectedChance}
          maxBars={10}
        />
      </section>
    </div>
  );
}

function BarChart({ data, expected, maxBars }: { data: Array<{ label: string; value: number }>; expected: number; maxBars: number }) {
  const maxValue = Math.max(1, ...data.map(d => d.value), expected);
  return (
    <div className="w-full">
      <div className="relative h-48 w-full border rounded-md p-2 overflow-hidden" role="img" aria-label={t('freq.title_main')}>
        {/* Ligne attendu */}
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-sky-400"
          style={{ top: `${100 - (expected / maxValue) * 100}%` }}
          aria-hidden
        />
        {/* Barres */}
        <div className="absolute inset-0 flex items-end gap-1 p-2">
          {data.slice(0, maxBars).map((d) => (
            <div key={d.label} className="flex-1 min-w-[4px]" aria-label={`#${d.label}: ${d.value}`}>
              <div
                className="bg-emerald-500 hover:bg-emerald-600 transition-all rounded-sm"
                style={{ height: `${(d.value / maxValue) * 100}%` }}
                title={`#${d.label}: ${d.value}`}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Légende simplifiée */}
      <div className="mt-2 grid grid-cols-12 gap-1 text-[10px] text-slate-600">{
        data.slice(0, maxBars).map(d => (
          <div key={`lab-${d.label}`} className="text-center">{d.label}</div>
        ))
      }</div>
    </div>
  );
}

function TopLists({ main }: { main: NumeroFreq[] }) {
  const topHot = useMemo(() => main.slice(0, 10), [main]);
  const topCold = useMemo(() => [...main].reverse().slice(0, 10), [main]);
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-lg border p-3">
        <h4 className="text-sm font-semibold mb-2">Top 10 chauds</h4>
        <ul className="space-y-1 text-sm">
          {topHot.map(i => (
            <li key={`hot-${i.numero}`} className="flex items-center justify-between">
              <span>#{i.numero}</span>
              <span className="font-semibold">{i.frequence}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg border p-3">
        <h4 className="text-sm font-semibold mb-2">Top 10 froids</h4>
        <ul className="space-y-1 text-sm">
          {topCold.map(i => (
            <li key={`cold-${i.numero}`} className="flex items-center justify-between">
              <span>#{i.numero}</span>
              <span className="font-semibold">{i.frequence}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


