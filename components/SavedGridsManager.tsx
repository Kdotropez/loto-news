'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  CheckCircle, 
  Clock, 
  Trophy, 
  Calendar,
  Eye,
  Trash2,
  Search,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { savedGridsManager, SavedGameSession, GameResult } from '../lib/saved-grids-manager';
import { dataStorage } from '@/lib/data-storage';
import { OfficialGainCalculator } from '@/lib/official-loto-gains';

export default function SavedGridsManager() {
  const [sessions, setSessions] = useState<SavedGameSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SavedGameSession | null>(null);
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [checkData, setCheckData] = useState({
    winningNumbers: '',
    winningComplementary: '',
    tirageDate: ''
  });
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalCost: 0,
    totalGains: 0,
    netResult: 0,
    winRate: 0
  });
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());
  const [showBacktestModal, setShowBacktestModal] = useState(false);
  const [backtestSession, setBacktestSession] = useState<SavedGameSession | null>(null);
  const [backtestPeriod, setBacktestPeriod] = useState<'last1' | 'last20' | 'last50' | 'year' | 'all'>('last50');
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [backtestResults, setBacktestResults] = useState<Array<{
    date: string;
    numbers: number[];
    complementary: number | null;
    winners: number;
    topRank: number;
    estimatedGains: number;
    winsByRank: Record<number, number>;
    gainsByRank: Record<number, number>;
  }>>([]);
  const [expandedBacktestRows, setExpandedBacktestRows] = useState<Set<number>>(new Set());
  const [backtestSummary, setBacktestSummary] = useState<{
    drawsTested: number;
    totalWinners: number;
    winsByRank: Record<number, number>;
    totalGains: number;
    totalInvestment: number;
    netResult: number;
    roiPct: number;
  }>({ drawsTested: 0, totalWinners: 0, winsByRank: {1:0,2:0,3:0,4:0,5:0,6:0,7:0}, totalGains: 0, totalInvestment: 0, netResult: 0, roiPct: 0 });
  const [topLimit, setTopLimit] = useState<10 | 20 | 50 | 100>(20);
  const [sortKey, setSortKey] = useState<'gains' | 'date' | 'rank'>('gains');
  const defaultSummary = { drawsTested: 0, totalWinners: 0, winsByRank: {1:0,2:0,3:0,4:0,5:0,6:0,7:0} as Record<number, number>, totalGains: 0, totalInvestment: 0, netResult: 0, roiPct: 0 };

  const sortedBacktestResults = useMemo(() => {
    const arr = [...backtestResults];
    arr.sort((a, b) => {
      if (sortKey === 'gains') return b.estimatedGains - a.estimatedGains;
      if (sortKey === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (a.topRank === b.topRank) return b.estimatedGains - a.estimatedGains;
      if (a.topRank === 0) return 1;
      if (b.topRank === 0) return -1;
      return a.topRank - b.topRank;
    });
    return arr.slice(0, topLimit);
  }, [backtestResults, sortKey, topLimit]);

  const exportWinnersCSV = (session: SavedGameSession) => {
    if (!session?.results?.gridResults) {
      alert('Aucun résultat disponible pour cette session. Contrôlez d\'abord la session.');
      return;
    }
    const winners = session.results.gridResults.filter((g: any) => (g?.rank ?? 0) > 0);
    if (winners.length === 0) {
      alert('Aucune grille gagnante à exporter.');
      return;
    }
    const rows: string[][] = [["#","numbers","chance","matches","rank","estimated_gain_eur"]];
    winners.forEach((g: any, idx: number) => {
      const nums = extractNumbers(g);
      const chance = extractChance(g);
      const gain = computeEstimatedGain(g);
      const mMain = g?.matchesMain ?? g?.matches ?? 0;
      const mChance = g?.matchesChance ?? (typeof g?.matchChance === 'boolean' ? (g.matchChance ? 1 : 0) : 0);
      rows.push([
        String(idx + 1),
        nums.join('-'),
        chance ? String(chance) : '',
        mMain + (mChance ? ' + chance' : ''),
        String(g?.rank ?? ''),
        gain.toFixed(2)
      ]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `winners_${session.id}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // Charger les sessions au montage
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    const allSessions = savedGridsManager.getAllSessions();
    setSessions(allSessions);
    
    const globalStats = savedGridsManager.getStats();
    setStats(globalStats);
  };

  const handleCheckSession = (session: SavedGameSession) => {
    setSelectedSession(session);
    setCheckData({
      winningNumbers: '',
      winningComplementary: '',
      tirageDate: session.gameDate
    });
    setShowCheckModal(true);
  };

  const executeCheck = () => {
    if (!selectedSession) return;

    const numbersArray = checkData.winningNumbers
      .split(/[,\s]+/)
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n >= 1 && n <= 49);

    const complementary = parseInt(checkData.winningComplementary);

    if (numbersArray.length !== 5) {
      alert('Veuillez saisir exactement 5 numéros gagnants !');
      return;
    }

    if (isNaN(complementary) || complementary < 1 || complementary > 10) {
      alert('Le numéro complémentaire doit être entre 1 et 10 !');
      return;
    }

    try {
      const result = savedGridsManager.checkSessionWithTirage(
        selectedSession.id,
        numbersArray,
        complementary,
        checkData.tirageDate
      );

      alert(`🎯 Contrôle terminé !\n\nGains: ${result.totalGains.toFixed(2)}€\nRésultat net: ${result.netResult.toFixed(2)}€\n\nGrilles gagnantes: ${result.gridResults.filter(g => g.rank > 0).length}/${result.gridResults.length}`);

      setShowCheckModal(false);
      loadSessions(); // Recharger pour mettre à jour
    } catch (error) {
      console.error('Erreur lors du contrôle:', error);
      alert('❌ Erreur lors du contrôle. Veuillez vérifier les données.');
    }
  };

  const deleteSession = (sessionId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      savedGridsManager.deleteSession(sessionId);
      loadSessions();
    }
  };

  const buildPrintableHTML = (session: SavedGameSession) => {
    const styles = `
      <style>
        body { font-family: Arial, sans-serif; color: #111827; }
        h1 { font-size: 18px; margin: 0 0 8px 0; }
        h2 { font-size: 14px; margin: 16px 0 8px 0; }
        .meta { font-size: 12px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; }
        th { background: #f3f4f6; }
        .chip { display:inline-block; border:1px solid #d1d5db; border-radius:9999px; padding:2px 6px; margin-right:4px; }
        @media print { @page { margin: 14mm; } }
      </style>
    `;
    const rows = session.grids.map(g => `
      <tr>
        <td>${g.id}</td>
        <td>${g.numbers.map(n => `<span class="chip">${n}</span>`).join(' ')}${typeof g.complementary === 'number' ? ` + <span class="chip">${g.complementary}</span>` : ''}</td>
        <td>${g.type}</td>
        <td>${g.cost.toFixed(2)}€</td>
      </tr>
    `).join('');
    const html = `
      <!doctype html><html><head><meta charset="utf-8">${styles}</head><body>
      <h1>Session: ${session.name}</h1>
      <div class="meta">Date tirage: ${session.gameDate} • Grilles: ${session.grids.length} • Coût total: ${session.totalCost.toFixed(2)}€</div>
      <div class="meta">Sélection: ${session.selectedNumbers.map(n => `<span class="chip">${n}</span>`).join(' ')}</div>
      <h2>Grilles</h2>
      <table>
        <thead><tr><th>#</th><th>Numéros</th><th>Type</th><th>Coût</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      </body></html>
    `;
    return html;
  };

  const exportSessionDownload = (session: SavedGameSession) => {
    const html = buildPrintableHTML(session);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session_${session.id}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportSessionPDF = (session: SavedGameSession) => {
    const html = buildPrintableHTML(session);
    // Impression sans pop-up: iframe caché + print
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.src = url;
    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } finally {
          URL.revokeObjectURL(url);
          setTimeout(() => iframe.remove(), 500);
        }
      }, 50);
    };
    document.body.appendChild(iframe);
  };

  // Helpers d'affichage
  const extractNumbers = (gr: any): number[] => {
    if (Array.isArray(gr?.numbers)) return gr.numbers;
    if (Array.isArray(gr?.grid?.numbers)) return gr.grid.numbers;
    if (Array.isArray(gr?.combination)) return gr.combination;
    if (Array.isArray(gr?.combo)) return gr.combo;
    return [];
  };
  const extractChance = (gr: any): number | null => {
    if (typeof gr?.complementary === 'number') return gr.complementary;
    if (typeof gr?.grid?.complementary === 'number') return gr.grid.complementary;
    if (typeof gr?.chance === 'number') return gr.chance;
    return null;
  };
  const computeEstimatedGain = (gr: any): number => {
    if (typeof gr?.gain === 'number') return gr.gain;
    if (typeof gr?.estimatedGain === 'number') return gr.estimatedGain;
    // Si on a les matches, on calcule via les gains officiels
    const matchedMain = Array.isArray(gr?.matchedNumbers) ? gr.matchedNumbers.length : (gr?.matchesMain ?? gr?.matches);
    const hasChance = typeof gr?.matchedComplementary === 'boolean' ? gr.matchedComplementary : (gr?.matchesChance ? true : false);
    if (typeof matchedMain === 'number') {
      return OfficialGainCalculator.calculateGain(matchedMain, !!hasChance);
    }
    // Fallback par rang si aucune info
    const r = gr?.rank ?? 0;
    switch (r) {
      case 1: return OfficialGainCalculator.calculateGain(5, true);
      case 2: return OfficialGainCalculator.calculateGain(5, false);
      case 3: return OfficialGainCalculator.calculateGain(4, true);
      case 4: return OfficialGainCalculator.calculateGain(4, false);
      case 5: return OfficialGainCalculator.calculateGain(3, true);
      case 6: return OfficialGainCalculator.calculateGain(3, false);
      case 7: return OfficialGainCalculator.calculateGain(2, true);
      default: return 0;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: SavedGameSession['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'won': return <Trophy className="w-5 h-5 text-green-500" />;
      case 'lost': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'checked': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: SavedGameSession['status']) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'won': return 'Gagnant';
      case 'lost': return 'Perdant';
      case 'checked': return 'Contrôlé';
      default: return 'Inconnu';
    }
  };

  const rankToLabel = (rank: number): string => {
    switch (rank) {
      case 1: return '5 bons + chance';
      case 2: return '5 bons';
      case 3: return '4 bons + chance';
      case 4: return '4 bons';
      case 5: return '3 bons + chance';
      case 6: return '3 bons';
      case 7: return '2 bons + chance';
      default: return '-';
    }
  };

  // Backtest helpers
  const determineRankLocal = (matchedMain: number, matchedComplementary: boolean): number => {
    if (matchedMain === 5 && matchedComplementary) return 1;
    if (matchedMain === 5) return 2;
    if (matchedMain === 4 && matchedComplementary) return 3;
    if (matchedMain === 4) return 4;
    if (matchedMain === 3 && matchedComplementary) return 5;
    if (matchedMain === 3) return 6;
    if (matchedMain === 2 && matchedComplementary) return 7;
    return 0;
  };
  const runBacktest = async () => {
    if (!backtestSession) return;
    setIsBacktesting(true);
    try {
      const res = await fetch(`/api/statistics?type=list&window=${backtestPeriod}`);
      const json = await res.json();
      const draws: Array<{ date: string; numero1?: number; numero2?: number; numero3?: number; numero4?: number; numero5?: number; complementaire?: number | null; }> = json?.data || [];
      const results: Array<{ date: string; numbers: number[]; complementary: number | null; winners: number; topRank: number; estimatedGains: number; winsByRank: Record<number, number>; gainsByRank: Record<number, number>; }> = [];
      let totalGains = 0;
      let totalWinners = 0;
      const winsByRank: Record<number, number> = {1:0,2:0,3:0,4:0,5:0,6:0,7:0};
      for (const d of draws) {
        const drawNums = [d.numero1, d.numero2, d.numero3, d.numero4, d.numero5].filter((n): n is number => typeof n === 'number');
        const comp = typeof d.complementaire === 'number' ? d.complementaire : null;
        let winners = 0;
        let topRank = 0;
        let gains = 0;
        const winsByRankLocal: Record<number, number> = {1:0,2:0,3:0,4:0,5:0,6:0,7:0};
        const gainsByRankLocal: Record<number, number> = {1:0,2:0,3:0,4:0,5:0,6:0,7:0};
        for (const g of backtestSession.grids) {
          const matchedMain = g.numbers.filter(n => drawNums.includes(n)).length;
          const matchedCompl = typeof g.complementary === 'number' ? (g.complementary === comp) : false;
          const r = determineRankLocal(matchedMain, matchedCompl);
          if (r > 0) {
            winners++;
            totalWinners++;
            winsByRank[r] = (winsByRank[r] || 0) + 1;
            winsByRankLocal[r] = (winsByRankLocal[r] || 0) + 1;
            topRank = topRank === 0 ? r : Math.min(topRank, r);
            const gain = OfficialGainCalculator.calculateGain(matchedMain, matchedCompl);
            gains += gain;
            totalGains += gain;
            gainsByRankLocal[r] = (gainsByRankLocal[r] || 0) + gain;
          }
        }
        if (winners > 0) {
          results.push({ date: d.date, numbers: drawNums, complementary: comp, winners, topRank, estimatedGains: gains, winsByRank: winsByRankLocal, gainsByRank: gainsByRankLocal });
        }
      }
      setBacktestResults(results);
      const drawsTested = draws.length;
      const totalInvestment = (backtestSession.totalCost || 0) * drawsTested;
      const netResult = totalGains - totalInvestment;
      const roiPct = totalInvestment > 0 ? (netResult / totalInvestment) * 100 : 0;
      setBacktestSummary({ drawsTested, totalWinners, winsByRank, totalGains, totalInvestment, netResult, roiPct });
    } finally {
      setIsBacktesting(false);
    }
  };

  useEffect(() => {
    if (showBacktestModal && backtestSession) {
      // Réinitialiser les données visibles pendant le recalcul
      setBacktestResults([]);
      setBacktestSummary(defaultSummary);
      runBacktest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backtestPeriod]);

  const printTopGains = () => {
    if (!backtestSession || backtestResults.length === 0) return;
    const sortedAll = [...backtestResults].sort((a, b) => {
      if (sortKey === 'gains') return b.estimatedGains - a.estimatedGains;
      if (sortKey === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      // rank: meilleur rang d'abord (1 meilleur), puis gains desc
      if (a.topRank === b.topRank) return b.estimatedGains - a.estimatedGains;
      if (a.topRank === 0) return 1; // 0 = aucun rang, envoyer après
      if (b.topRank === 0) return -1;
      return a.topRank - b.topRank;
    });
    const sorted = sortedAll.slice(0, topLimit);
    const styles = `
      <style>
        body { font-family: Arial, sans-serif; color: #111827; }
        h1 { font-size: 18px; margin: 0 0 12px 0; }
        .meta { font-size: 12px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; }
        th { background: #f3f4f6; }
        .chip { display:inline-block; border:1px solid #d1d5db; border-radius:9999px; padding:2px 6px; margin-right:4px; }
        @media print { @page { margin: 14mm; } }
      </style>
    `;
    const rows = sorted.map((r, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${r.date}</td>
        <td>${r.numbers.map(n => `<span class=\"chip\">${n}</span>`).join(' ')}${typeof r.complementary === 'number' ? ` + <span class=\"chip\">${r.complementary}</span>` : ''}</td>
        <td>${r.winners}</td>
        <td>${rankToLabel(r.topRank)}</td>
        <td>${r.estimatedGains.toFixed(2)}€</td>
      </tr>
    `).join('');
    const html = `
      <!doctype html><html><head><meta charset=\"utf-8\">${styles}</head><body>
      <h1>Top ${topLimit} — ${backtestSession.name}</h1>
      <div class=\"meta\">Tri: ${sortKey} • Période: ${backtestPeriod} • Tirages testés: ${backtestSummary.drawsTested} • Gains totaux: ${backtestSummary.totalGains.toFixed(2)}€</div>
      <table>
        <thead><tr><th>#</th><th>Date</th><th>Tirage</th><th>Gagnantes</th><th>Meilleur résultat</th><th>Gains</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      </body></html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.src = url;
    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } finally {
          URL.revokeObjectURL(url);
          setTimeout(() => iframe.remove(), 500);
        }
      }, 50);
    };
    document.body.appendChild(iframe);
  };

  const exportBacktestCSV = () => {
    if (!backtestSession || backtestResults.length === 0) return;
    const header = [
      'session', 'periode', 'tri', 'tirages_testes', 'gagnantes_total', 'gains_total_eur', 'investissement_eur', 'net_eur', 'roi_pct',
      'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7'
    ];
    const lines: string[] = [];
    lines.push(header.join(','));
    lines.push([
      JSON.stringify(backtestSession.name), backtestPeriod, sortKey,
      String(backtestSummary.drawsTested), String(backtestSummary.totalWinners), backtestSummary.totalGains.toFixed(2),
      backtestSummary.totalInvestment.toFixed(2), backtestSummary.netResult.toFixed(2), backtestSummary.roiPct.toFixed(2),
      String(backtestSummary.winsByRank[1] || 0), String(backtestSummary.winsByRank[2] || 0), String(backtestSummary.winsByRank[3] || 0),
      String(backtestSummary.winsByRank[4] || 0), String(backtestSummary.winsByRank[5] || 0), String(backtestSummary.winsByRank[6] || 0), String(backtestSummary.winsByRank[7] || 0)
    ].join(','));
    lines.push('');
    const detailHeader = [
      'date', 'tirage', 'gagnantes', 'meilleur_resultat', 'gains_eur',
      'r1_count','r1_gains','r2_count','r2_gains','r3_count','r3_gains','r4_count','r4_gains','r5_count','r5_gains','r6_count','r6_gains','r7_count','r7_gains'
    ];
    lines.push(detailHeader.join(','));
    const sorted = sortedBacktestResults; // respecte Top & Tri
    sorted.forEach(r => {
      const tirage = r.numbers.join('-') + (typeof r.complementary === 'number' ? `+${r.complementary}` : '');
      const row = [
        r.date,
        tirage,
        String(r.winners),
        JSON.stringify(rankToLabel(r.topRank)),
        r.estimatedGains.toFixed(2),
        String(r.winsByRank[1] || 0), (r.gainsByRank[1] || 0).toFixed(2),
        String(r.winsByRank[2] || 0), (r.gainsByRank[2] || 0).toFixed(2),
        String(r.winsByRank[3] || 0), (r.gainsByRank[3] || 0).toFixed(2),
        String(r.winsByRank[4] || 0), (r.gainsByRank[4] || 0).toFixed(2),
        String(r.winsByRank[5] || 0), (r.gainsByRank[5] || 0).toFixed(2),
        String(r.winsByRank[6] || 0), (r.gainsByRank[6] || 0).toFixed(2),
        String(r.winsByRank[7] || 0), (r.gainsByRank[7] || 0).toFixed(2)
      ];
      lines.push(row.join(','));
    });
    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backtest_${backtestSession.id}_top${topLimit}_${sortKey}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportBacktestExcel = async () => {
    if (!backtestSession || backtestResults.length === 0) return;
    if (typeof window === 'undefined') return; // sécurité SSR
    const ExcelModule: any = await import('exceljs');
    const WorkbookCtor = ExcelModule.Workbook || (ExcelModule.default && ExcelModule.default.Workbook);
    const wb = new WorkbookCtor();
    wb.created = new Date();
    wb.properties.date1904 = true;

    // Styles utiles
    const currencyFmt = '€#,##0.00;[Red]-€#,##0.00';
    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
    const headerBorder = { top: {style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} } as any;

    // Feuille Résumé
    const ws1 = wb.addWorksheet('Résumé');
    ws1.columns = [
      { header: 'Session', key: 'session', width: 32 },
      { header: 'Période', key: 'periode', width: 14 },
      { header: 'Tri', key: 'tri', width: 16 },
      { header: 'Tirages testés', key: 'draws', width: 16 },
      { header: 'Grilles gagnantes', key: 'wins', width: 18 },
      { header: 'Gains totaux', key: 'gains', width: 16, style: { numFmt: currencyFmt } },
      { header: 'Investissement', key: 'invest', width: 16, style: { numFmt: currencyFmt } },
      { header: 'Résultat net', key: 'net', width: 16, style: { numFmt: currencyFmt } },
      { header: 'ROI %', key: 'roi', width: 10 }
    ];
    ws1.addRow({ session: backtestSession.name, periode: backtestPeriod, tri: sortKey, draws: backtestSummary.drawsTested, wins: backtestSummary.totalWinners, gains: backtestSummary.totalGains, invest: backtestSummary.totalInvestment, net: backtestSummary.netResult, roi: backtestSummary.roiPct });
    ws1.getRow(1).eachCell(c => { c.fill = headerFill; c.border = headerBorder; c.font = { bold: true }; });
    ws1.getRow(2).eachCell(c => { c.border = headerBorder; });

    // Répartition
    const ws1b = wb.addWorksheet('Répartition');
    ws1b.columns = [
      { header: 'Résultat', key: 'label', width: 22 },
      { header: 'Nombre', key: 'count', width: 12 },
    ];
    ws1b.getRow(1).eachCell(c => { c.fill = headerFill; c.border = headerBorder; c.font = { bold: true }; });
    [1,2,3,4,5,6,7].forEach(r => {
      ws1b.addRow({ label: rankToLabel(r), count: backtestSummary.winsByRank[r] || 0 });
    });
    ws1b.eachRow((row, idx) => { if (idx>1) row.eachCell(c => c.border = headerBorder); });

    // Feuille Détails
    const ws2 = wb.addWorksheet('Détails');
    ws2.columns = [
      { header: '#', key: '#', width: 6 },
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Tirage', key: 'tirage', width: 28 },
      { header: 'Gagnantes', key: 'wins', width: 12 },
      { header: 'Meilleur résultat', key: 'best', width: 22 },
      { header: 'Gains', key: 'gain', width: 14, style: { numFmt: currencyFmt } },
      { header: '3 bons + chance', key: 'r5', width: 16 },
      { header: '3 bons', key: 'r6', width: 12 },
      { header: '4 bons', key: 'r4', width: 12 },
      { header: '4 bons + chance', key: 'r3', width: 16 },
      { header: '2 bons + chance', key: 'r7', width: 16 },
      { header: '5 bons', key: 'r2', width: 10 },
      { header: '5 bons + chance', key: 'r1', width: 16 },
    ];
    ws2.getRow(1).eachCell(c => { c.fill = headerFill; c.border = headerBorder; c.font = { bold: true }; });
    sortedBacktestResults.forEach((r, idx) => {
      const tirage = r.numbers.join('-') + (typeof r.complementary === 'number' ? `+${r.complementary}` : '');
      ws2.addRow({
        '#': idx + 1,
        date: r.date,
        tirage,
        wins: r.winners,
        best: rankToLabel(r.topRank),
        gain: r.estimatedGains,
        r5: r.winsByRank[5] || 0,
        r6: r.winsByRank[6] || 0,
        r4: r.winsByRank[4] || 0,
        r3: r.winsByRank[3] || 0,
        r7: r.winsByRank[7] || 0,
        r2: r.winsByRank[2] || 0,
        r1: r.winsByRank[1] || 0,
      });
    });
    ws2.eachRow((row, idx) => { if (idx>1) row.eachCell(c => c.border = headerBorder); });

    // Générer et télécharger
    const blob = new Blob([await wb.xlsx.writeBuffer()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backtest_${backtestSession.id}_top${topLimit}_${sortKey}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white"
      >
        <div className="flex items-center gap-3 mb-4">
          <History className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">💾 Gestionnaire de Grilles</h1>
            <p className="text-purple-200">Sauvegardez, contrôlez et suivez vos sessions de jeu</p>
          </div>
        </div>
      </motion.div>

      {/* Statistiques globales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Statistiques Globales</h2>
        <div className="grid md:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-blue-600 font-semibold">Sessions</div>
            <div className="text-2xl font-bold text-blue-800">{stats.totalSessions}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-red-600 font-semibold">Coût Total</div>
            <div className="text-2xl font-bold text-red-800">{stats.totalCost.toFixed(2)}€</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-green-600 font-semibold">Gains Total</div>
            <div className="text-2xl font-bold text-green-800">{stats.totalGains.toFixed(2)}€</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${stats.netResult >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className={`font-semibold ${stats.netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Résultat Net
            </div>
            <div className={`text-2xl font-bold ${stats.netResult >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              {stats.netResult >= 0 ? '+' : ''}{stats.netResult.toFixed(2)}€
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-purple-600 font-semibold">Taux de Gain</div>
            <div className="text-2xl font-bold text-purple-800">{stats.winRate.toFixed(1)}%</div>
          </div>
        </div>
      </motion.div>

      {/* Liste des sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">🎲 Vos Sessions Sauvegardées</h2>
        
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Aucune session sauvegardée</p>
            <p className="text-sm">Générez et sauvegardez des grilles pour les voir ici</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(session.status)}
                      <h3 className="text-lg font-semibold text-gray-800">{session.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        session.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        session.status === 'won' ? 'bg-green-100 text-green-800' :
                        session.status === 'lost' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {getStatusText(session.status)}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {formatDate(session.gameDate)}
                      </div>
                      <div>
                        <Eye className="w-4 h-4 inline mr-1" />
                        {session.grids.length} grilles
                      </div>
                      <div>
                        <span className="inline mr-1 font-medium text-gray-700">Coût</span>
                        {session.totalCost.toFixed(2)}€
                      </div>
                      <div>
                        <TrendingUp className="w-4 h-4 inline mr-1" />
                        {session.selectedNumbers.length} numéros
                      </div>
                    </div>

                    {session.results && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Résultat: {session.results.gridResults.filter((g: any) => (g?.rank ?? 0) > 0).length} grilles gagnantes
                          </span>
                          <div className="flex items-center gap-3">
                            <button
                              className="text-blue-600 underline"
                              onClick={() => {
                                setExpandedDetails(prev => {
                                  const next = new Set(prev);
                                  if (next.has(session.id)) next.delete(session.id); else next.add(session.id);
                                  return next;
                                });
                              }}
                            >
                              {expandedDetails.has(session.id) ? 'Masquer détails' : 'Voir détails'}
                            </button>
                            <span className={`font-bold ${session.results.netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {session.results.netResult >= 0 ? '+' : ''}{session.results.netResult.toFixed(2)}€
                            </span>
                          </div>
                        </div>

                        {expandedDetails.has(session.id) && (
                          <div className="mt-3 overflow-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="text-left px-2 py-1">#</th>
                                  <th className="text-left px-2 py-1">Grille</th>
                                  <th className="text-left px-2 py-1">Matches</th>
                                  <th className="text-left px-2 py-1">Rang</th>
                                  <th className="text-left px-2 py-1">Gain estimé</th>
                                </tr>
                              </thead>
                              <tbody>
                                {session.results.gridResults
                                  .filter((g: any) => (g?.rank ?? 0) > 0)
                                  .map((g: any, idx: number) => {
                                    const gridDef = session.grids.find(x => x.id === g.gridId);
                                    const nums = gridDef ? gridDef.numbers : [];
                                    const chance = gridDef && typeof gridDef.complementary === 'number' ? gridDef.complementary : null;
                                    const gain = computeEstimatedGain(g);
                                    const mMain = Array.isArray(g?.matchedNumbers) ? g.matchedNumbers.length : (g?.matchesMain ?? g?.matches ?? 0);
                                    const hasChance = typeof g?.matchedComplementary === 'boolean' ? g.matchedComplementary : (g?.matchesChance ? true : false);
                                    const rank = g?.rank ?? '-';
                                    return (
                                      <tr key={idx} className="border-t">
                                        <td className="px-2 py-1">{idx + 1}</td>
                                        <td className="px-2 py-1">
                                          <div className="flex flex-wrap items-center gap-1">
                                            {nums.map((n: number) => (
                                              <span key={n} className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white border text-gray-800 font-semibold">{n}</span>
                                            ))}
                                            {chance ? (
                                              <>
                                                <span className="text-gray-400 mx-1">+</span>
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white border text-blue-700 font-semibold">{chance}</span>
                                              </>
                                            ) : null}
                                          </div>
                                        </td>
                                        <td className="px-2 py-1">{mMain}{hasChance ? ' + chance' : ''}</td>
                                        <td className="px-2 py-1">{rank}</td>
                                        <td className="px-2 py-1 font-semibold text-green-700">{gain.toFixed(2)}€</td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCheckSession(session)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        🔍 Re‑contrôler
                      </button>
                      <button
                        onClick={() => deleteSession(session.id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => exportSessionPDF(session)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors">🖨️ Imprimer (PDF)</button>
                      <button onClick={() => { setBacktestSession(session); setShowBacktestModal(true); }} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors">📅 Backtester</button>
                    </div>
                  </div>
                            <div className="mt-3 text-right">
                              {/* Bouton d'export retiré à la demande de l'utilisateur */}
                            </div>
                          </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal de contrôle */}
      {showCheckModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-8 max-w-md w-full mx-4"
          >
            <div className="flex items-center gap-3 mb-6">
              <Search className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">Contrôler la Session</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">{selectedSession.name}</h4>
                <div className="text-sm text-blue-700">
                  • {selectedSession.grids.length} grilles à contrôler
                  • Date prévue: {formatDate(selectedSession.gameDate)}
                </div>
              </div>

              {/* Numéros gagnants */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Numéros gagnants (5 numéros)
                </label>
                <input
                  type="text"
                  value={checkData.winningNumbers}
                  onChange={(e) => setCheckData({...checkData, winningNumbers: e.target.value})}
                  placeholder="Ex: 1, 15, 23, 34, 42"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Numéro complémentaire */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Numéro complémentaire
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={checkData.winningComplementary}
                  onChange={(e) => setCheckData({...checkData, winningComplementary: e.target.value})}
                  placeholder="1-10"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Date du tirage */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date du tirage
                </label>
                <input
                  type="date"
                  value={checkData.tirageDate}
                  onChange={(e) => setCheckData({...checkData, tirageDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCheckModal(false)}
                className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={executeCheck}
                className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
              >
                🔍 Contrôler
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de backtest */}
      {showBacktestModal && backtestSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Backtest de la session: {backtestSession.name}</h3>
              <button onClick={() => { setShowBacktestModal(false); setBacktestResults([]); }} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">Fermer</button>
            </div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <label className="text-sm font-semibold">Période</label>
              <select value={backtestPeriod} onChange={(e) => setBacktestPeriod(e.target.value as any)} className="px-3 py-2 border rounded">
                <option value="last1">Dernier tirage</option>
                <option value="last20">Derniers 20</option>
                <option value="last50">Derniers 50</option>
                <option value="year">Année</option>
                <option value="all">Tous</option>
              </select>
              <label className="text-sm font-semibold">Top</label>
              <select value={topLimit} onChange={(e) => setTopLimit(Number(e.target.value) as any)} className="px-3 py-2 border rounded">
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <label className="text-sm font-semibold">Tri</label>
              <select value={sortKey} onChange={(e) => setSortKey(e.target.value as any)} className="px-3 py-2 border rounded">
                <option value="gains">Gains décroissants</option>
                <option value="date">Date décroissante</option>
                <option value="rank">Meilleur résultat</option>
              </select>
              <button onClick={runBacktest} disabled={isBacktesting} className={`px-4 py-2 rounded text-white ${isBacktesting ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'}`}>{isBacktesting ? 'Calcul...' : 'Lancer le backtest'}</button>
              {backtestResults.length > 0 && (
                <>
                  <button onClick={printTopGains} className="px-4 py-2 rounded text-white bg-emerald-600 hover:bg-emerald-700">🖨️ Imprimer Top {topLimit}</button>
                  <button onClick={exportBacktestCSV} className="px-4 py-2 rounded text-white bg-gray-700 hover:bg-gray-800">⬇️ Exporter CSV</button>
                  <button onClick={exportBacktestExcel} className="px-4 py-2 rounded text-white bg-indigo-600 hover:bg-indigo-700">📊 Exporter Excel</button>
                </>
              )}
            </div>
            {backtestSummary.drawsTested > 0 && (
              <div className="mb-4">
                <div className="grid md:grid-cols-4 gap-3 mb-3 text-sm">
                  <div className="p-3 rounded border bg-gray-50">
                    <div className="text-gray-600">Tirages testés</div>
                    <div className="text-lg font-bold">{backtestSummary.drawsTested}</div>
                  </div>
                  <div className="p-3 rounded border bg-gray-50">
                    <div className="text-gray-600">Gains totaux</div>
                    <div className="text-lg font-bold">{backtestSummary.totalGains.toFixed(2)}€</div>
                  </div>
                  <div className="p-3 rounded border bg-gray-50">
                    <div className="text-gray-600">Investissement</div>
                    <div className="text-lg font-bold">{backtestSummary.totalInvestment.toFixed(2)}€</div>
                  </div>
                  <div className={`p-3 rounded border ${backtestSummary.netResult >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className={backtestSummary.netResult >= 0 ? 'text-green-700' : 'text-red-700'}>Résultat net</div>
                    <div className={`text-lg font-bold ${backtestSummary.netResult >= 0 ? 'text-green-800' : 'text-red-800'}`}>{backtestSummary.netResult >= 0 ? '+' : ''}{backtestSummary.netResult.toFixed(2)}€ ({backtestSummary.roiPct.toFixed(1)}%)</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold mr-1">Répartition:</span>
                  {[1,2,3,4,5,6,7].map(r => (
                    <span key={r} className="px-2 py-1 rounded-full border bg-white">{rankToLabel(r)}: {backtestSummary.winsByRank[r] || 0}</span>
                  ))}
                  <span className="ml-auto text-gray-600">Grilles gagnantes: {backtestSummary.totalWinners}</span>
                </div>
              </div>
            )}
            {backtestResults.length > 0 ? (
              <div className="overflow-auto max-h-[60vh] border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-2 py-1">Date</th>
                      <th className="text-left px-2 py-1">Tirage</th>
                      <th className="text-left px-2 py-1">Grilles gagnantes</th>
                      <th className="text-left px-2 py-1">Meilleur résultat</th>
                      <th className="text-left px-2 py-1">Gains estimés</th>
                      <th className="text-left px-2 py-1">Détail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBacktestResults.map((r, idx) => (
                      <React.Fragment key={idx}>
                        <tr className="border-t">
                          <td className="px-2 py-1">{r.date}</td>
                          <td className="px-2 py-1">
                            <div className="flex items-center gap-1">
                              {r.numbers.map((n, i) => <span key={i} className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white border text-gray-800 text-xs font-semibold">{n}</span>)}
                              {typeof r.complementary === 'number' && (
                                <>
                                  <span className="text-gray-400 mx-1">+</span>
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white border text-blue-700 text-xs font-semibold">{r.complementary}</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-1">{r.winners}</td>
                          <td className="px-2 py-1">{rankToLabel(r.topRank)}</td>
                          <td className="px-2 py-1">{r.estimatedGains.toFixed(2)}€</td>
                          <td className="px-2 py-1">
                            <button
                              onClick={() => setExpandedBacktestRows(prev => { const next = new Set(prev); next.has(idx) ? next.delete(idx) : next.add(idx); return next; })}
                              className="px-2 py-1 text-xs rounded border bg-white hover:bg-gray-50"
                            >
                              {expandedBacktestRows.has(idx) ? 'Masquer' : 'Détail'}
                            </button>
                          </td>
                        </tr>
                        {expandedBacktestRows.has(idx) && (
                          <tr className="bg-gray-50">
                            <td className="px-2 py-2 text-xs text-gray-700" colSpan={6}>
                              <div className="flex flex-wrap items-center gap-2">
                                {[1,2,3,4,5,6,7].map(rank => {
                                  const count = r.winsByRank[rank] || 0;
                                  const total = r.gainsByRank[rank] || 0;
                                  if (count === 0) return null;
                                  return (
                                    <span key={rank} className="px-2 py-1 rounded-full border bg-white">
                                      {rankToLabel(rank)}: {count} → {total.toFixed(2)}€
                                    </span>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-gray-600">Aucun résultat (lancez un backtest).</div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
