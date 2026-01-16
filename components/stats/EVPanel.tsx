"use client";
import React, { useMemo, useState } from 'react';
import { OfficialGainCalculator } from '@/lib/official-loto-gains';
import { t } from '@/lib/i18n';

export default function EVPanel() {
  const [gridCost, setGridCost] = useState(2.2);
  const analysis = useMemo(() => OfficialGainCalculator.analyzeAllPossibleGains(), []);
  const expectedValue = analysis.expectedValue;
  const breakEven = expectedValue > 0 ? (gridCost / expectedValue) * 100 : Infinity;

  return (
    <section aria-labelledby="ev-title" className="rounded-2xl border-2 bg-white p-4 shadow">
      <div className="flex items-end justify-between gap-4 mb-3">
        <div>
          <h3 id="ev-title" className="text-lg font-bold text-slate-900">{t('ev.title')}</h3>
          <p className="text-xs text-slate-600">{t('ev.subtitle')}</p>
        </div>
        <div className="text-xs text-slate-500">{t('ev.hint')}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg border p-3">
          <div className="text-sm text-slate-600">{t('ev.ev_per_grid')}</div>
          <div className="text-2xl font-bold">{expectedValue.toFixed(2)} €</div>
          <div className="text-xs text-slate-500 mt-1">Somme des gains moyens × probabilités</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-sm text-slate-600">{t('ev.win_prob')}</div>
          <div className="text-2xl font-bold">{analysis.totalProbabilityWin.toFixed(2)}%</div>
          <div className="text-xs text-slate-500 mt-1">Inclut tous les rangs rémunérés</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-sm text-slate-600">{t('ev.break_even')}</div>
          <div className="text-2xl font-bold">{isFinite(breakEven) ? breakEven.toFixed(2) + '%' : '—'}</div>
          <div className="text-xs text-slate-500 mt-1">{t('ev.for_bet', { value: gridCost.toFixed(2) })}</div>
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-500">{t('ev.disclaimer')}</div>
    </section>
  );
}


