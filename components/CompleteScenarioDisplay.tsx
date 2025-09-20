'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Target,
  DollarSign,
  Percent,
  Info
} from 'lucide-react';
import { completeAnalyzer, CompleteAnalysis } from '@/lib/complete-scenario-analyzer';

interface SelectedNumbers {
  numbers: number[];
  complementary: number[];
  source: string;
}

interface CompleteScenarioDisplayProps {
  selectedNumbers: SelectedNumbers;
}

export default function CompleteScenarioDisplay({ selectedNumbers }: CompleteScenarioDisplayProps) {
  const [analysis, setAnalysis] = useState<CompleteAnalysis | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);
  const [showAllDetails, setShowAllDetails] = useState(false);

  useEffect(() => {
    if (selectedNumbers.numbers.length >= 5) {
      const result = completeAnalyzer.analyzeAllScenarios(selectedNumbers.numbers);
      setAnalysis(result);
    }
  }, [selectedNumbers]);

  if (!analysis) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <div className="text-center">
          <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Sélectionnez au moins 5 numéros
          </h3>
        </div>
      </div>
    );
  }

  const getScenarioIcon = (correspondances: number) => {
    switch (correspondances) {
      case 5: return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 4: return <Target className="w-5 h-5 text-blue-600" />;
      case 3: return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 2: return <XCircle className="w-5 h-5 text-orange-600" />;
      case 1: return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getScenarioColor = (correspondances: number) => {
    switch (correspondances) {
      case 5: return 'green';
      case 4: return 'blue';
      case 3: return 'yellow';
      case 2: return 'orange';
      case 1: return 'red';
      default: return 'gray';
    }
  };

  const getRankDetails = (correspondances: number) => {
    switch (correspondances) {
      case 5:
        return [
          { rank: "Rang 1-2", count: "1", gain: "2M€-5.7M€", description: "5 bons nums" },
          { rank: "Rang 3-4", count: "~11", gain: "500€-1,086€", description: "4 bons nums" },
          { rank: "Rang 5-6", count: "~220", gain: "20€-50€", description: "3 bons nums" },
          { rank: "Rang 7-10", count: "Autres", gain: "2€-20€", description: "1-2 bons nums" }
        ];
      case 4:
        return [
          { rank: "Rang 3-4", count: "11", gain: "500€-1,086€", description: "4 bons nums MAX" },
          { rank: "Rang 5-6", count: "220", gain: "20€-50€", description: "3 bons nums" },
          { rank: "Rang 7-8", count: "~800", gain: "5€-20€", description: "2 bons nums" },
          { rank: "Aucun gain", count: "~1,970", gain: "0€", description: "0-1 bon num" }
        ];
      case 3:
        return [
          { rank: "Rang 5-6", count: "66", gain: "20€-50€", description: "3 bons nums MAX" },
          { rank: "Rang 7-8", count: "~400", gain: "5€-20€", description: "2 bons nums" },
          { rank: "Rang 9", count: "~600", gain: "2€-5€", description: "1 bon num" },
          { rank: "Aucun gain", count: "~1,937", gain: "0€", description: "0 bon num" }
        ];
      case 2:
        return [
          { rank: "Rang 7-8", count: "~286", gain: "5€-20€", description: "2 bons nums MAX" },
          { rank: "Rang 9", count: "~1,000", gain: "2€-5€", description: "1 bon num" },
          { rank: "Aucun gain", count: "~1,717", gain: "0€", description: "0 bon num" }
        ];
      case 1:
        return [
          { rank: "Rang 9", count: "~1,001", gain: "2€-5€", description: "1 bon num MAX" },
          { rank: "Aucun gain", count: "~2,002", gain: "0€", description: "0 bon num" }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Stratégie de Base */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h2 className="text-xl font-bold text-blue-900 mb-4">
          📊 Analyse Complète - Tous les Scénarios Possibles
        </h2>
        
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{analysis.totalGrids}</div>
            <div className="text-sm text-gray-600">Grilles (LB1)</div>
            <div className="text-xs text-gray-500">⌈C({analysis.selectedNumbers},3) ÷ 10⌉</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{analysis.baseCost.toFixed(2)}€</div>
            <div className="text-sm text-gray-600">Coût total</div>
            <div className="text-xs text-gray-500">{analysis.totalGrids} × 2.20€</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${analysis.expectedROI > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analysis.expectedROI.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">ROI attendu</div>
            <div className="text-xs text-gray-500">Selon probabilités</div>
          </div>
        </div>

        <div className="bg-blue-100 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>💡 Principe :</strong> {analysis.recommendation}
          </p>
        </div>
      </div>

      {/* Analyse par Scénario */}
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">🎯 Analyse par Nombre de Correspondances</h3>
          <button
            onClick={() => setShowAllDetails(!showAllDetails)}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
          >
            {showAllDetails ? 'Masquer détails' : 'Voir tous les rangs'}
          </button>
        </div>

        <div className="space-y-4">
          {analysis.scenarios.map((scenario, index) => {
            const color = getScenarioColor(scenario.correspondances);
            const rankDetails = getRankDetails(scenario.correspondances);
            
            return (
              <motion.div
                key={index}
                className={`border-l-4 border-${color}-400 bg-${color}-50 rounded-r-lg p-4 cursor-pointer hover:shadow-md transition-all`}
                onClick={() => setSelectedScenario(selectedScenario === index ? null : index)}
                whileHover={{ scale: 1.005 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getScenarioIcon(scenario.correspondances)}
                    <div>
                      <div className="font-semibold">
                        {scenario.correspondances}/5 numéros correspondent
                      </div>
                      <div className="text-sm text-gray-600">
                        {scenario.gridsWithExactMatch} grilles gagnantes sur {analysis.totalGrids}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-lg">{scenario.guaranteedGains.toLocaleString()}€</div>
                    <div className="text-sm text-gray-600">Gains garantis</div>
                  </div>
                </div>

                <div className="text-sm text-gray-700 mb-2">
                  <strong>Meilleur rang possible :</strong> Rang {scenario.maxPossibleRank}
                </div>

                {(showAllDetails || selectedScenario === index) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-3"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
                      {rankDetails.map((rank, rankIndex) => (
                        <div key={rankIndex} className={`bg-${color}-100 p-2 rounded text-center`}>
                          <div className="font-bold text-xs">{rank.count} grilles</div>
                          <div className="text-xs">{rank.rank}</div>
                          <div className="text-xs text-gray-600">{rank.description}</div>
                          <div className={`text-xs font-semibold text-${color}-700`}>{rank.gain}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className={`p-3 bg-${color}-100 rounded border-l-4 border-${color}-500`}>
                      <p className="text-sm">{scenario.explanation}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
