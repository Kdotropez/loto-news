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

interface PairStat {
  a: number;
  b: number;
  count: number;
}

export default function CooccurrencePairs({ period, pageSize = 20 }: { period: Period; pageSize?: number }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draws, setDraws] = useState<DrawItem[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/statistics?type=list&window=${encodeURIComponent(period)}`);
        const json = await res.json();
        if (!json.success) throw new Error('Erreur liste tirages');
        if (!cancelled) {
          setDraws(json.data || []);
          setPage(1);
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

  const pairs = useMemo(() => computePairs(draws), [draws]);
  const totalPages = Math.max(1, Math.ceil(pairs.length / pageSize));
  const pageData = pairs.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <div className="rounded-xl border p-4 text-sm text-slate-600">{t('cooc.loading')}</div>;
  if (error) return <div className="rounded-xl border p-4 text-sm text-rose-600" role="alert">{error}</div>;

  return (
    <section aria-labelledby="cooc-title" className="rounded-2xl border-2 bg-white p-4 shadow">
      <div className="flex items-end justify-between gap-4 mb-3">
        <div>
          <h3 id="cooc-title" className="text-lg font-bold text-slate-900">{t('cooc.title')}</h3>
          <p className="text-xs text-slate-600">{t('common.period')}: {period} • {t('common.draws')}: {draws.length} • {t('cooc.distinct')}: {pairs.length}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button
            className="px-2 py-1 rounded border disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label={t('cooc.page_prev')}
          >
            ◀
          </button>
          <span className="text-slate-600">{t('cooc.page', { page, total: totalPages })}</span>
          <button
            className="px-2 py-1 rounded border disabled:opacity-50"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label={t('cooc.page_next')}
          >
            ▶
          </button>
        </div>
      </div>

      <div className="overflow-auto" role="region" aria-labelledby="cooc-title">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="text-left text-slate-600 border-b" role="row">
              <th className="py-2 pr-4" scope="col">{t('cooc.col.rank')}</th>
              <th className="py-2 pr-4" scope="col">{t('cooc.col.pair')}</th>
              <th className="py-2 pr-4" scope="col">{t('cooc.col.count')}</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((p, idx) => (
              <tr key={`${p.a}-${p.b}`} className="border-b last:border-b-0" role="row">
                <td className="py-2 pr-4 text-slate-500" role="cell">{(page - 1) * pageSize + idx + 1}</td>
                <td className="py-2 pr-4 font-semibold" role="cell">{p.a} – {p.b}</td>
                <td className="py-2 pr-4" role="cell">{p.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function computePairs(draws: DrawItem[]): PairStat[] {
  // Tirages supposés triés récents -> anciens via API
  const map = new Map<string, number>();
  for (const d of draws) {
    const nums = [d.numero1, d.numero2, d.numero3, d.numero4, d.numero5].filter((n): n is number => typeof n === 'number');
    // générer toutes les paires (a<b)
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const a = Math.min(nums[i], nums[j]);
        const b = Math.max(nums[i], nums[j]);
        const key = `${a}-${b}`;
        map.set(key, (map.get(key) || 0) + 1);
      }
    }
  }
  const arr: PairStat[] = Array.from(map.entries()).map(([k, count]) => {
    const [a, b] = k.split('-').map(x => parseInt(x, 10));
    return { a, b, count };
  });
  arr.sort((x, y) => y.count - x.count || x.a - y.a || x.b - y.b);
  return arr;
}


