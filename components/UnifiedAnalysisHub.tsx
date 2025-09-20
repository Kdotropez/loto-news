'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  BarChart3,
  Clock,
  Zap,
  Star,
  AlertTriangle,
  Trophy,
  Calculator,
  RefreshCw,
  Download,
  Eye,
  Settings
} from 'lucide-react';

interface UnifiedAnalysisHubProps {
  analysisPeriod: string;
  onNumberSelection: (numbers: number[], complementary: number[], source: string) => void;
}

interface AnalysisResult {
  source: string;
  title: string;
  icon: any;
  color: string;
  numbers: Array<{
    numero: number;
    score: number;
    reason: string;
    urgency?: 'critique' | 'eleve' | 'moyen' | 'faible';
  }>;
  complementary: Array<{
    numero: number;
    score: number;
    reason: string;
  }>;
  summary: string;
  confidence: number;
}

export default function UnifiedAnalysisHub({ analysisPeriod, onNumberSelection }: UnifiedAnalysisHubProps) {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [finalSelection, setFinalSelection] = useState<{
    numbers: number[];
    complementary: number[];
    sources: string[];
  }>({ numbers: [], complementary: [], sources: [] });

  useEffect(() => {
    loadAllAnalyses();
  }, [analysisPeriod]);

  const loadAllAnalyses = async () => {
    setIsLoading(true);
    try {
      // Charger toutes les analyses en parallèle
      const [
        frequencyResponse,
        ecartsResponse,
        patternsResponse,
        probabilisticResponse
      ] = await Promise.all([
        fetch(`/api/analysis?type=frequency&period=${analysisPeriod}`),
        fetch(`/api/analysis?type=ecarts-sortie&period=${analysisPeriod}`),
        fetch(`/api/analysis?type=patterns&period=${analysisPeriod}`),
        fetch(`/api/probabilistic-strategy?maxNumbers=10`)
      ]);

      const results: AnalysisResult[] = [];

      // 1. Analyse de fréquence
      if (frequencyResponse.ok) {
        const freqData = await frequencyResponse.json();
        if (freqData.success) {
          results.push({
            source: 'frequency',
            title: 'Numéros Chauds/Froids',
            icon: TrendingUp,
            color: 'red',
            numbers: [
              ...freqData.data.hot.slice(0, 10).map((n: any) => ({
                numero: n.numero,
                score: n.frequence,
                reason: `Chaud: ${n.frequence} sorties`,
                urgency: 'eleve' as const
              })),
              ...freqData.data.cold.slice(0, 5).map((n: any) => ({
                numero: n.numero,
                score: 100 - n.frequence,
                reason: `Froid: ${n.frequence} sorties`,
                urgency: 'moyen' as const
              }))
            ],
            complementary: [], // À implémenter si nécessaire
            summary: `${freqData.data.hot.length} numéros chauds, ${freqData.data.cold.length} numéros froids identifiés`,
            confidence: 75
          });
        }
      }

      // 2. Analyse des écarts
      if (ecartsResponse.ok) {
        const ecartsData = await ecartsResponse.json();
        if (ecartsData.success && Array.isArray(ecartsData.data)) {
          results.push({
            source: 'ecarts',
            title: 'Écarts de Sortie',
            icon: Clock,
            color: 'orange',
            numbers: ecartsData.data.slice(0, 15).map((e: any) => ({
              numero: e.numero,
              score: e.urgenceScore || 50,
              reason: `Écart: ${e.ecartActuel} tirages`,
              urgency: e.niveauUrgence
            })),
            complementary: [],
            summary: `${ecartsData.data.filter((e: any) => e.niveauUrgence === 'critique').length} numéros en retard critique`,
            confidence: 85
          });
        }
      }

      // 3. Stratégie probabiliste
      if (probabilisticResponse.ok) {
        const probData = await probabilisticResponse.json();
        if (probData.success) {
          results.push({
            source: 'probabilistic',
            title: 'Stratégie Probabiliste',
            icon: Brain,
            color: 'purple',
            numbers: probData.data.strategy.recommendedNumbers.slice(0, 10).map((n: any) => ({
              numero: n.numero,
              score: n.score,
              reason: `Prob: ${Math.round(n.returnProbability * 100)}%`,
              urgency: n.urgencyLevel
            })),
            complementary: probData.data.strategy.recommendedComplementary?.slice(0, 3).map((c: any) => ({
              numero: c.numero,
              score: c.score,
              reason: `Écart: ${c.currentGap} tirages`
            })) || [],
            summary: `${probData.data.analysis.criticalNumbers} numéros critiques avec patterns de retour`,
            confidence: probData.data.strategy.confidenceLevel
          });
        }
      }

      setAnalysisResults(results);
      
      // Générer une sélection unifiée automatiquement
      generateUnifiedSelection(results);

    } catch (error) {
      console.error('Erreur chargement analyses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateUnifiedSelection = (results: AnalysisResult[]) => {
    // Combiner tous les numéros avec pondération par source
    const allNumbers = new Map<number, { totalScore: number, sources: string[], reasons: string[] }>();
    const allComplementary = new Map<number, { totalScore: number, sources: string[], reasons: string[] }>();

    // Pondération par source
    const sourceWeights = {
      'frequency': 0.3,
      'ecarts': 0.4,
      'probabilistic': 0.3
    };

    results.forEach(result => {
      const weight = sourceWeights[result.source as keyof typeof sourceWeights] || 0.2;
      
      // Traiter les numéros principaux
      result.numbers.forEach(num => {
        if (!allNumbers.has(num.numero)) {
          allNumbers.set(num.numero, { totalScore: 0, sources: [], reasons: [] });
        }
        const existing = allNumbers.get(num.numero)!;
        existing.totalScore += num.score * weight;
        existing.sources.push(result.source);
        existing.reasons.push(num.reason);
      });

      // Traiter les complémentaires
      result.complementary.forEach(comp => {
        if (!allComplementary.has(comp.numero)) {
          allComplementary.set(comp.numero, { totalScore: 0, sources: [], reasons: [] });
        }
        const existing = allComplementary.get(comp.numero)!;
        existing.totalScore += comp.score * weight;
        existing.sources.push(result.source);
        existing.reasons.push(comp.reason);
      });
    });

    // Sélectionner les meilleurs
    const topNumbers = Array.from(allNumbers.entries())
      .sort(([,a], [,b]) => b.totalScore - a.totalScore)
      .slice(0, 12)
      .map(([numero]) => numero);

    const topComplementary = Array.from(allComplementary.entries())
      .sort(([,a], [,b]) => b.totalScore - a.totalScore)
      .slice(0, 3)
      .map(([numero]) => numero);

    setFinalSelection({
      numbers: topNumbers,
      complementary: topComplementary,
      sources: Array.from(new Set(results.map(r => r.source)))
    });
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'frequency': return 'border-red-300 bg-red-50';
      case 'ecarts': return 'border-orange-300 bg-orange-50';
      case 'probabilistic': return 'border-purple-300 bg-purple-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'critique': return 'bg-red-100 text-red-800';
      case 'eleve': return 'bg-orange-100 text-orange-800';
      case 'moyen': return 'bg-yellow-100 text-yellow-800';
      case 'faible': return 'bg-green-100 text-green-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Unification de toutes les analyses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête moderne et épuré */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white rounded-2xl p-8 shadow-2xl border border-slate-600"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto shadow-lg">
            🎯
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Analyse Intelligente Unifiée
          </h1>
          <p className="text-xl text-slate-300 mb-6">
            Toutes vos analyses combinées pour une sélection optimale
          </p>
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <TrendingUp className="w-4 h-4 text-red-400" />
              <span>Fréquences</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>Écarts</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Probabilités</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sélection finale unifiée */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border-2 border-green-300 shadow-xl"
      >
        <div className="text-center mb-6">
          <Target className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-green-800">Sélection Unifiée Recommandée</h2>
          <p className="text-green-600">Synthèse de toutes les analyses pour une sélection optimale</p>
        </div>

        {/* Numéros principaux unifiés */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-green-800 mb-4 text-center">
            🎯 Top {finalSelection.numbers.length} Numéros Recommandés
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {finalSelection.numbers.map((numero, index) => (
              <motion.div
                key={numero}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg p-4 text-center border border-green-200 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2">
                  {numero}
                </div>
                <div className="text-xs text-gray-600">#{index + 1}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Numéros complémentaires unifiés */}
        {finalSelection.complementary.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-green-800 mb-4 text-center">
              🎲 Complémentaires Recommandés
            </h3>
            <div className="flex justify-center gap-3">
              {finalSelection.complementary.map((numero, index) => (
                <motion.div
                  key={numero}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-4 text-center border border-purple-200"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2">
                    {numero}
                  </div>
                  <div className="text-xs text-gray-600">Comp. {index + 1}</div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Bouton d'utilisation */}
        <div className="text-center">
          <button
            onClick={() => onNumberSelection(finalSelection.numbers, finalSelection.complementary, finalSelection.sources.join(', '))}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-bold text-lg shadow-lg transition-all transform hover:scale-105"
          >
            🚀 Utiliser Cette Sélection dans le Générateur
          </button>
          <p className="text-sm text-green-600 mt-2">
            Sources: {finalSelection.sources.join(' + ')}
          </p>
        </div>
      </motion.div>

      {/* Résultats par source */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {analysisResults.map((result, index) => {
          const Icon = result.icon;
          return (
            <motion.div
              key={result.source}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl p-6 shadow-lg border-2 ${getSourceColor(result.source)}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-full bg-${result.color}-100`}>
                  <Icon className={`w-6 h-6 text-${result.color}-600`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{result.title}</h3>
                  <div className="text-sm text-gray-600">Confiance: {result.confidence}%</div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{result.summary}</p>

              {/* Top 5 numéros de cette source */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 text-sm">Top 5 Recommandations:</h4>
                {result.numbers.slice(0, 5).map((num, idx) => (
                  <div key={num.numero} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center text-sm font-bold">
                        {num.numero}
                      </div>
                      <div className="text-xs text-gray-600">{num.reason}</div>
                    </div>
                    {num.urgency && (
                      <span className={`px-2 py-1 rounded-full text-xs ${getUrgencyColor(num.urgency)}`}>
                        {num.urgency}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => onNumberSelection(
                  result.numbers.slice(0, 10).map(n => n.numero),
                  result.complementary.map(c => c.numero),
                  result.title
                )}
                className={`w-full mt-4 px-4 py-2 bg-${result.color}-600 text-white rounded-lg hover:bg-${result.color}-700 transition-colors text-sm`}
              >
                Utiliser cette analyse
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Actions globales */}
      <div className="flex justify-center gap-4">
        <button
          onClick={loadAllAnalyses}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          Actualiser Toutes les Analyses
        </button>
        
        <button
          onClick={() => {
            // Export des résultats
            const exportData = {
              period: analysisPeriod,
              timestamp: new Date().toISOString(),
              finalSelection,
              analysisResults: analysisResults.map(r => ({
                source: r.source,
                title: r.title,
                confidence: r.confidence,
                topNumbers: r.numbers.slice(0, 5)
              }))
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analyse-unifiee-${analysisPeriod}-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          Exporter l'Analyse
        </button>
      </div>
    </div>
  );
}
