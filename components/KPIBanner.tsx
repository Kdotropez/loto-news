"use client";
import React from 'react';
import { useNextDraw } from '@/hooks/useNextDraw';
import { CountdownCalculator } from '@/lib/countdown-calculator';
import { t } from '@/lib/i18n';

interface KPIBannerProps {
  totalTirages?: number;
  lastUpdate?: string | null;
  averagePerMonth?: number;
}

export default function KPIBanner({ totalTirages, lastUpdate, averagePerMonth }: KPIBannerProps) {
  const info = useNextDraw();
  const calc = new CountdownCalculator();
  const countdown = calc.formatTimeRemaining(info.timeRemaining);
  const context = calc.getContextMessage(info);
  const freshness = (() => {
    if (!lastUpdate) {
      return { label: 'Données inconnues', cls: 'text-rose-700 bg-rose-50' };
    }
    const now = new Date();
    const last = new Date(lastUpdate);
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 4) {
      return { label: `Données OK (J-${diffDays})`, cls: 'text-emerald-700 bg-emerald-50' };
    }
    return { label: `Données a actualiser (J-${diffDays})`, cls: 'text-amber-700 bg-amber-50' };
  })();

  return (
    <div className="w-full rounded-2xl p-4 border-2 bg-white shadow-lg flex items-center justify-between gap-4" aria-label={t('kpi.next_draw')}>
      <div className="flex items-center gap-3">
        <div className="text-2xl" title={t('kpi.next_draw')}>⏰</div>
        <div>
          <div className="text-sm text-slate-600">{context}</div>
          <div className="text-lg font-bold text-slate-900">{countdown}</div>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6">
        <div className="text-center">
          <div className="text-xs text-slate-600">{t('kpi.total_draws')}</div>
          <div className="text-base font-semibold">{totalTirages ?? '—'}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-600">{t('kpi.last_update')}</div>
          <div className="text-base font-semibold">{lastUpdate ? new Date(lastUpdate).toLocaleDateString('fr-FR') : '—'}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-600">Fraicheur</div>
          <div className={`text-xs font-semibold px-2 py-1 rounded-full ${freshness.cls}`}>
            {freshness.label}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-600">{t('kpi.draws_per_month')}</div>
          <div className="text-base font-semibold">{averagePerMonth ?? '—'}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-600">{t('kpi.space_main')}</div>
          <div className="text-base font-semibold">19 068 840</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-600">{t('kpi.space_second')}</div>
          <div className="text-base font-semibold">1 906 884</div>
        </div>
      </div>
    </div>
  );
}


