'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  BarChart3, 
  Brain,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Copy,
  TestTube
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AdvancedStrategyData {
  strategy: {
    name: string;
    description: string;
    confidence: number;
  };
  recommendedNumbers: {
    mainNumbers: number[];
    complementaryNumber: number;
    reasoning: string[];
  };
  analysis: {
    gapAnalysis: {
      highGapNumbers: Array<{ numero: number; gap: number; frequency: number }>;
      mediumGapNumbers: Array<{ numero: number; gap: number; frequency: number }>;
      lowGapNumbers: Array<{ numero: number; gap: number; frequency: number }>;
    };
    evenOddDistribution: {
      optimal: string;
      recommended: { even: number; odd: number };
      currentSelection: { even: number; odd: number };
    };
    complementaryAnalysis: {
      bestComplementary: number;
      frequency: number;
      gap: number;
    };
  };
  performance: {
    expectedWinRate: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendation: string;
  };
}

export default function AdvancedStrategy() {
  const [data, setData] = useState<AdvancedStrategyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testingCombination, setTestingCombination] = useState(false);

  useEffect(() => {
    generateStrategy();
  }, []);

  const generateStrategy = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/advanced-strategy?action=generate');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        toast.success('Stratégie avancée générée avec succès !');
      } else {
        toast.error('Erreur lors de la génération de la stratégie');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement de la stratégie');
    } finally {
      setIsLoading(false);
    }
  };

  const testCombination = async () => {
    if (!data) return;
    
    setTestingCombination(true);
    try {
      const response = await fetch('/api/fast-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test-single',
          combination: data.recommendedNumbers.mainNumbers,
          complementary: data.recommendedNumbers.complementaryNumber
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Test terminé ! ${result.result.wins} gain(s) sur ${result.result.totalTests} tirages`);
        // Ici vous pourriez afficher les résultats détaillés
      } else {
        toast.error('Erreur lors du test de la combinaison');
      }
    } catch (error) {
      toast.error('Erreur lors du test');
    } finally {
      setTestingCombination(false);
    }
  };

  const copyCombination = () => {
    if (!data) return;
    
    const combination = `${data.recommendedNumbers.mainNumbers.join(', ')} + ${data.recommendedNumbers.complementaryNumber}`;
    navigator.clipboard.writeText(combination);
    toast.success('Combinaison copiée dans le presse-papiers !');
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <Zap className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">Génération de la stratégie avancée...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Aucune stratégie générée</p>
        <button
          onClick={generateStrategy}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Générer une stratégie
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🎯 Stratégie Avancée Multi-Critères</h1>
            <p className="text-purple-100">
              {data.strategy.description}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={generateStrategy}
              disabled={isLoading}
              className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Régénérer
            </button>
          </div>
        </div>
      </motion.div>

      {/* Niveau de confiance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Niveau de Confiance</h3>
            <p className="text-gray-600">Fiabilité de cette stratégie</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{data.strategy.confidence}%</div>
            <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${data.strategy.confidence}%` }}
              ></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Combinaison recommandée */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-600" />
          🎯 Combinaison Recommandée
        </h3>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-green-800 text-lg">Numéros Principaux</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.recommendedNumbers.mainNumbers.map((num) => (
                  <div
                    key={num}
                    className="numero-boule numero-chaud"
                    title={`Numéro ${num}`}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-right">
              <h4 className="font-semibold text-green-800 text-lg">Numéro Complémentaire</h4>
              <div className="mt-2">
                <div
                  className="numero-boule numero-chance"
                  title={`Numéro complémentaire ${data.recommendedNumbers.complementaryNumber}`}
                >
                  {data.recommendedNumbers.complementaryNumber}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={copyCombination}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copier
            </button>
            <button
              onClick={testCombination}
              disabled={testingCombination}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {testingCombination ? 'Test en cours...' : 'Tester'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Analyse détaillée */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analyse des écarts */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-600" />
            📊 Analyse des Écarts
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Numéros à Fort Écart (&gt;50j)</h4>
              <div className="flex flex-wrap gap-1">
                {data.analysis.gapAnalysis.highGapNumbers.slice(0, 10).map((item) => (
                  <div
                    key={item.numero}
                    className="numero-boule numero-froid text-xs"
                    title={`Écart: ${item.gap} jours`}
                  >
                    {item.numero}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Numéros à Écart Moyen (20-50j)</h4>
              <div className="flex flex-wrap gap-1">
                {data.analysis.gapAnalysis.mediumGapNumbers.slice(0, 10).map((item) => (
                  <div
                    key={item.numero}
                    className="numero-boule numero-equilibre text-xs"
                    title={`Écart: ${item.gap} jours`}
                  >
                    {item.numero}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Distribution pair/impair */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            🧠 Distribution Pair/Impair
          </h3>
          
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-2">Distribution Optimale</h4>
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {data.analysis.evenOddDistribution.optimal}
              </div>
              <p className="text-sm text-purple-700">
                {data.analysis.evenOddDistribution.recommended.even} pairs, {data.analysis.evenOddDistribution.recommended.odd} impairs
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Sélection Actuelle</h4>
              <div className="text-lg font-semibold text-blue-600">
                {data.recommendedNumbers.mainNumbers.filter(n => n % 2 === 0).length} pairs, {data.recommendedNumbers.mainNumbers.filter(n => n % 2 === 1).length} impairs
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance attendue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          📈 Performance Attendue
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {data.performance.expectedWinRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Taux de gain attendu</div>
          </div>
          
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(data.performance.riskLevel)}`}>
              {getRiskIcon(data.performance.riskLevel)}
              <span className="ml-1 capitalize">{data.performance.riskLevel}</span>
            </div>
            <div className="text-sm text-gray-600 mt-2">Niveau de risque</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-700">
              {data.performance.recommendation}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Raisonnement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-gray-600" />
          💡 Raisonnement de la Stratégie
        </h3>
        
        <div className="space-y-2">
          {data.recommendedNumbers.reasoning.map((reason, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <p className="text-gray-700">{reason}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}










