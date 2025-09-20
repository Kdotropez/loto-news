'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target,
  Search,
  Trophy,
  BarChart3,
  TrendingUp,
  Star,
  CheckCircle,
  AlertCircle,
  Download,
  Copy
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DrawResult {
  mainNumbers: number[];
  complementaryNumber: number;
  date?: string;
}

interface ProximityMatch {
  combinationId: string;
  combinationName: string;
  strategies: string[];
  combination: {
    mainNumbers: number[];
    complementaryNumber: number;
  };
  proximityScore: number;
  matches: {
    mainNumbers: number[];
    complementaryMatch: boolean;
    exactMatches: number;
    proximityDetails: {
      exactMainMatches: number;
      complementaryMatch: boolean;
      totalScore: number;
    };
  };
  rank: number;
}

interface ProximityAnalysis {
  drawResult: DrawResult;
  totalCombinationsAnalyzed: number;
  bestMatches: ProximityMatch[];
  statistics: {
    exactMatches: number;
    nearMatches: number;
    complementaryMatches: number;
    averageProximityScore: number;
  };
  analyzedAt: string;
}

export default function DrawProximityAnalyzer() {
  const [drawResult, setDrawResult] = useState<DrawResult>({
    mainNumbers: [7, 14, 21, 28, 35],
    complementaryNumber: 8
  });
  const [analysis, setAnalysis] = useState<ProximityAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailedReport, setDetailedReport] = useState<string>('');

  const analyzeProximity = async () => {
    setLoading(true);
    
    try {
      toast.loading('Analyse de proximité en cours...', { id: 'proximity-analysis' });

      const response = await fetch('/api/analyze-draw-proximity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drawResult: {
            ...drawResult,
            date: drawResult.date || new Date().toISOString()
          },
          limit: 20
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse');
      }

      const result = await response.json();
      
      if (result.success) {
        setAnalysis(result.analysis);
        setDetailedReport(result.detailedReport);
        
        toast.success(`Analyse terminée ! ${result.analysis.bestMatches.length} combinaisons analysées`, { 
          id: 'proximity-analysis',
          duration: 4000
        });
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { 
        id: 'proximity-analysis' 
      });
    } finally {
      setLoading(false);
    }
  };

  const copyReport = () => {
    navigator.clipboard.writeText(detailedReport);
    toast.success('Rapport copié dans le presse-papiers !');
  };

  const downloadReport = () => {
    const blob = new Blob([detailedReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-proximite-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Rapport téléchargé !');
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 20) return 'text-green-600 bg-green-100';
    if (score >= 15) return 'text-blue-600 bg-blue-100';
    if (score >= 10) return 'text-yellow-600 bg-yellow-100';
    if (score >= 5) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getPerformanceIcon = (score: number) => {
    if (score >= 20) return '🏆';
    if (score >= 15) return '🥈';
    if (score >= 10) return '🥉';
    if (score >= 5) return '⭐';
    return '📊';
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg"
      >
        <h1 className="text-3xl font-bold mb-2">🎯 Analyseur de Proximité des Tirages</h1>
        <p className="text-green-100">
          Analysez les résultats d'un tirage et trouvez les combinaisons les plus proches !
        </p>
      </motion.div>

      {/* Saisie du tirage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Target className="mr-2 text-green-600" />
          Saisie du Tirage
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Numéros principaux */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéros principaux (5 numéros de 1 à 49)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map(index => (
                <input
                  key={index}
                  type="number"
                  min="1"
                  max="49"
                  value={drawResult.mainNumbers[index] || ''}
                  onChange={(e) => {
                    const newNumbers = [...drawResult.mainNumbers];
                    newNumbers[index] = parseInt(e.target.value) || 0;
                    setDrawResult({ ...drawResult, mainNumbers: newNumbers });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center"
                  placeholder={`N°${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Numéro complémentaire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro complémentaire (1 à 10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={drawResult.complementaryNumber}
              onChange={(e) => setDrawResult({ 
                ...drawResult, 
                complementaryNumber: parseInt(e.target.value) || 1 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center"
              placeholder="Complémentaire"
            />
          </div>
        </div>

        {/* Date du tirage */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date du tirage (optionnel)
          </label>
          <input
            type="datetime-local"
            value={drawResult.date ? new Date(drawResult.date).toISOString().slice(0, 16) : ''}
            onChange={(e) => setDrawResult({ 
              ...drawResult, 
              date: e.target.value ? new Date(e.target.value).toISOString() : undefined 
            })}
            className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Bouton d'analyse */}
        <div className="mt-6">
          <button
            onClick={analyzeProximity}
            disabled={loading || drawResult.mainNumbers.some(num => num < 1 || num > 49) || 
                     drawResult.complementaryNumber < 1 || drawResult.complementaryNumber > 10}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Search className="w-5 h-5 mr-2" />
            )}
            {loading ? 'Analyse en cours...' : 'Analyser la Proximité'}
          </button>
        </div>
      </motion.div>

      {/* Résultats de l'analyse */}
      {analysis && (
        <>
          {/* Statistiques globales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BarChart3 className="mr-2 text-blue-600" />
              Statistiques de l'Analyse
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analysis.totalCombinationsAnalyzed}</div>
                <div className="text-sm text-gray-600">Combinaisons analysées</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analysis.statistics.exactMatches}</div>
                <div className="text-sm text-gray-600">Correspondances exactes</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{analysis.statistics.nearMatches}</div>
                <div className="text-sm text-gray-600">Correspondances proches</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{analysis.statistics.averageProximityScore.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Score moyen</div>
              </div>
            </div>
          </motion.div>

          {/* Top des meilleures combinaisons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Trophy className="mr-2 text-yellow-600" />
                🏆 Meilleures Combinaisons
              </h2>
              
              <div className="flex gap-2">
                <button
                  onClick={copyReport}
                  className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 flex items-center text-sm"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copier
                </button>
                <button
                  onClick={downloadReport}
                  className="px-3 py-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 flex items-center text-sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Télécharger
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {analysis.bestMatches.map((match, index) => (
                <div key={match.combinationId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">
                        {getPerformanceIcon(match.proximityScore)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">
                          #{match.rank} - {match.combinationName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Stratégies: {match.strategies.join(', ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold px-3 py-1 rounded-full ${getPerformanceColor(match.proximityScore)}`}>
                        Score: {match.proximityScore}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {match.matches.exactMatches} correspondance{match.matches.exactMatches > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Combinaison analysée:</div>
                      <div className="flex gap-1">
                        {match.combination.mainNumbers.map((num, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                            {num}
                          </span>
                        ))}
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                          {match.combination.complementaryNumber}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Correspondances trouvées:</div>
                      <div className="flex gap-1">
                        {match.matches.mainNumbers.map((num, idx) => (
                          <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                            {num}
                          </span>
                        ))}
                        {match.matches.complementaryMatch && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                            + Complémentaire
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {match.matches.exactMatches >= 4 && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="flex items-center text-yellow-700">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">
                          🎯 Excellente correspondance ! {match.matches.exactMatches} numéros exacts
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}










