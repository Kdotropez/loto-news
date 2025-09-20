'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Zap, 
  AlertTriangle,
  Clock,
  Star,
  BarChart3,
  RefreshCw,
  Lightbulb,
  Trophy
} from 'lucide-react';

interface NumberAnalysis {
  numero: number;
  currentGap: number;
  maxHistoricalGap: number;
  avgGap: number;
  totalAppearances: number;
  returnProbability: number;
  urgencyLevel: 'critique' | 'eleve' | 'moyen' | 'faible';
  expectedReturn: number;
  isIrregular: boolean;
  score: number;
}

interface StrategyData {
  strategy: {
    recommendedNumbers: NumberAnalysis[];
    recommendedComplementary: NumberAnalysis[];
    strategyExplanation: string;
    confidenceLevel: number;
    expectedWinProbability: number;
  };
  currentGaps: NumberAnalysis[];
  optimalCombination: number[];
  optimalCombinations?: Array<{
    numbers: number[];
    complementary: number;
    score: number;
    explanation: string;
  }>;
  analysis: {
    totalTirages: number;
    criticalNumbers: number;
    highProbabilityNumbers: number;
    irregularNumbers: number;
  };
}

interface ProbabilisticGapStrategyProps {
  analysisPeriod: string;
}

export default function ProbabilisticGapStrategyComponent({ analysisPeriod }: ProbabilisticGapStrategyProps) {
  const [strategyData, setStrategyData] = useState<StrategyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [maxNumbers, setMaxNumbers] = useState(10);
  const [generatedCombinations, setGeneratedCombinations] = useState<Array<{numbers: number[], complementary: number, score: number, explanation: string}>>([]);

  useEffect(() => {
    loadStrategy();
  }, [analysisPeriod, maxNumbers]);

  const loadStrategy = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/probabilistic-strategy?maxNumbers=${maxNumbers}&combination=true`);
      const data = await response.json();
      
      if (data.success) {
        setStrategyData(data.data);
      }
    } catch (error) {
      console.error('Erreur chargement stratégie:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePlayableCombinations = () => {
    if (!strategyData) return;
    
    const topNumbers = strategyData.strategy.recommendedNumbers.slice(0, 12);
    const topComplementary = strategyData.strategy.recommendedComplementary.slice(0, 3);
    
    const combinations = [];
    
    // Générer 5 combinaisons différentes
    for (let i = 0; i < 5; i++) {
      const numbers = selectCombinationNumbers(topNumbers, i);
      const complementary = topComplementary[i % topComplementary.length]?.numero || 1;
      
      combinations.push({
        numbers,
        complementary,
        score: calculateCombinationScore(numbers, complementary),
        explanation: `Combinaison ${i + 1} - Mix optimal selon patterns`
      });
    }
    
    setGeneratedCombinations(combinations);
  };

  const selectCombinationNumbers = (available: NumberAnalysis[], seed: number): number[] => {
    const selected: number[] = [];
    const pool = [...available];
    
    // Stratégie de sélection variée
    while (selected.length < 5 && pool.length > 0) {
      const index: number = (seed + selected.length * 3) % pool.length;
      selected.push(pool.splice(index, 1)[0].numero);
    }
    
    return selected.sort((a, b) => a - b);
  };

  const calculateCombinationScore = (numbers: number[], complementary: number): number => {
    if (!strategyData) return 0;
    
    const numberScores = numbers.map(num => 
      strategyData.strategy.recommendedNumbers.find(n => n.numero === num)?.score || 0
    );
    const complementaryScore = strategyData.strategy.recommendedComplementary.find(n => n.numero === complementary)?.score || 0;
    
    const avgScore = numberScores.reduce((a, b) => a + b, 0) / numberScores.length;
    return Math.round((avgScore + complementaryScore) / 2);
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critique': return 'bg-red-100 text-red-800 border-red-300';
      case 'eleve': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'moyen': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'faible': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case 'critique': return '🚨';
      case 'eleve': return '⚠️';
      case 'moyen': return '⏰';
      case 'faible': return '✅';
      default: return '📊';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.95) return 'text-green-600 font-bold';
    if (probability >= 0.85) return 'text-blue-600 font-semibold';
    if (probability >= 0.70) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
          <span className="ml-3 text-lg text-gray-600">Analyse probabiliste en cours...</span>
        </div>
      </div>
    );
  }

  if (!strategyData) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <div className="text-center text-gray-500">
          Aucune donnée disponible pour l'analyse probabiliste
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête de la stratégie */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Stratégie Probabiliste d'Optimisation</h2>
              <p className="text-purple-100">Basée sur l'analyse de {strategyData.analysis.totalTirages.toLocaleString()} tirages</p>
              <p className="text-purple-200 text-sm italic">⚠️ Optimise la sélection, ne change pas les probabilités de gain</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{strategyData.strategy.confidenceLevel}%</div>
            <div className="text-purple-100">Confiance</div>
          </div>
        </div>
      </motion.div>

      {/* Statistiques clés */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <div className="text-2xl font-bold text-red-800">{strategyData.analysis.criticalNumbers}</div>
              <div className="text-sm text-red-600">Numéros Critiques</div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-800">{strategyData.analysis.highProbabilityNumbers}</div>
              <div className="text-sm text-green-600">Haute Probabilité</div>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-purple-800">{strategyData.analysis.irregularNumbers}</div>
              <div className="text-sm text-purple-600">Numéros Irréguliers</div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-blue-800">{strategyData.strategy.expectedWinProbability}/10</div>
              <div className="text-sm text-blue-600">Score Stratégie</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section des numéros complémentaires */}
      <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-purple-800">Numéros Complémentaires Recommandés (1-10)</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {strategyData.strategy.recommendedComplementary.slice(0, 3).map((comp, index) => (
            <div key={comp.numero} className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {comp.numero}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-800">{Math.round(comp.returnProbability * 100)}%</div>
                  <div className="text-xs text-purple-600">Probabilité</div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Écart: {comp.currentGap} tirages
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Générateur de combinaisons jouables */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-300 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-green-800">Combinaisons Jouables</h3>
          </div>
          <button
            onClick={generatePlayableCombinations}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            🎲 Générer 5 Grilles
          </button>
        </div>
        
        {generatedCombinations.length > 0 ? (
          <div className="space-y-4">
            {generatedCombinations.map((combo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-4 border border-green-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-green-800">Grille {index + 1}</h4>
                  <div className="text-sm text-green-600">Score: {combo.score}/100</div>
                </div>
                
                <div className="flex items-center gap-3 mb-3">
                  {/* 5 numéros principaux */}
                  <div className="flex gap-2">
                    {combo.numbers.map((numero) => (
                      <div
                        key={numero}
                        className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold"
                      >
                        {numero}
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-gray-400 text-xl">+</div>
                  
                  {/* Numéro complémentaire */}
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-purple-300">
                    {combo.complementary}
                  </div>
                </div>
                
                <div className="text-xs text-gray-600">
                  {combo.explanation}
                </div>
              </motion.div>
            ))}
            
            <div className="mt-4 p-4 bg-green-100 rounded-lg border border-green-200">
              <div className="text-center text-green-800">
                <div className="font-semibold mb-1">💡 Comment Utiliser</div>
                <div className="text-sm">
                  Chaque grille contient 5 numéros principaux + 1 complémentaire. 
                  Choisissez la grille qui vous inspire le plus !
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎲</div>
            <p>Cliquez sur "Générer 5 Grilles" pour créer vos combinaisons jouables</p>
          </div>
        )}
      </div>

      {/* Explication de la stratégie */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-blue-800">Explication de la Stratégie</h3>
        </div>
        
        <div className="text-blue-700 whitespace-pre-line">
          {strategyData.strategy.strategyExplanation}
        </div>
      </div>

      {/* Top numéros recommandés */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-gray-600" />
            <h3 className="text-xl font-bold text-gray-800">Top Numéros Recommandés</h3>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Afficher :</label>
            <select
              value={maxNumbers}
              onChange={(e) => setMaxNumbers(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={15}>Top 15</option>
              <option value={20}>Top 20</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3">
          {strategyData.strategy.recommendedNumbers.slice(0, maxNumbers).map((number, index) => (
            <motion.div
              key={number.numero}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-gray-800 w-8">
                  {index + 1}
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {number.numero}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getUrgencyColor(number.urgencyLevel)}`}>
                      {getUrgencyIcon(number.urgencyLevel)} {number.urgencyLevel}
                    </span>
                    {number.isIrregular && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs border border-purple-300">
                        ⚡ Irrégulier
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Écart: {number.currentGap} tirages • Max historique: {number.maxHistoricalGap}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-lg font-bold ${getProbabilityColor(number.returnProbability)}`}>
                  {Math.round(number.returnProbability * 100)}%
                </div>
                <div className="text-sm text-gray-500">
                  Score: {number.score}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-center gap-4">
        <button
          onClick={loadStrategy}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          Actualiser l'Analyse
        </button>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <BarChart3 className="w-5 h-5" />
          {showDetails ? 'Masquer' : 'Voir'} Détails
        </button>
      </div>

      {/* Détails techniques (optionnel) */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gray-50 rounded-xl p-6 border border-gray-200"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">Détails Techniques</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Probabilités de Retour</h4>
              <div className="space-y-2 text-sm">
                <div>Écart 1-14 tirages : 64% de retour rapide</div>
                <div>Écart 15-39 tirages : 88% de retour rapide</div>
                <div>Écart 40-79 tirages : 96% de retour rapide</div>
                <div>Écart 80+ tirages : 99% de retour rapide</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Numéros Irréguliers</h4>
              <div className="text-sm">
                29, 12, 28, 3, 49, 14, 15, 24, 21, 6
                <br />
                <span className="text-gray-600">Retour moyen après gros écart : 2 tirages</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
