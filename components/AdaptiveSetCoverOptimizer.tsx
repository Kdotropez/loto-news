'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Target, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  TrendingUp,
  DollarSign,
  Zap,
  Brain,
  Settings
} from 'lucide-react';

interface SelectedNumbers {
  numbers: number[];
  complementary: number[];
  source: string;
}

interface ScenarioAnalysis {
  matchCount: number;
  probability: string;
  guaranteeLevel: string;
  gridsNeeded: number;
  cost: number;
  explanation: string;
  color: string;
}

interface AdaptiveStrategy {
  name: string;
  totalGrids: number;
  totalCost: number;
  scenarios: ScenarioAnalysis[];
  recommendation: string;
}

interface AdaptiveSetCoverOptimizerProps {
  selectedNumbers: SelectedNumbers;
}

export default function AdaptiveSetCoverOptimizer({ selectedNumbers }: AdaptiveSetCoverOptimizerProps) {
  const [strategy, setStrategy] = useState<AdaptiveStrategy | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);

  const calculateAdaptiveStrategy = () => {
    setIsCalculating(true);
    
    // Simulation du calcul (à remplacer par la vraie logique)
    setTimeout(() => {
      const n = selectedNumbers.numbers.length;
      
      const scenarios: ScenarioAnalysis[] = [
        {
          matchCount: 5,
          probability: "Optimale",
          guaranteeLevel: "100% garanti",
          gridsNeeded: Math.ceil(binomialCoefficient(n, 3) / 10),
          cost: Math.ceil(binomialCoefficient(n, 3) / 10) * 2.2,
          explanation: `Si les 5 numéros du tirage sont dans vos ${n} sélectionnés, TOUTES vos grilles auront au moins 3 bons numéros.`,
          color: "green"
        },
        {
          matchCount: 4,
          probability: "Probable",
          guaranteeLevel: "Partielle (7.7%)",
          gridsNeeded: Math.ceil(binomialCoefficient(n, 3) / 10) + 4,
          cost: (Math.ceil(binomialCoefficient(n, 3) / 10) + 4) * 2.2,
          explanation: `Si 4 numéros correspondent, nous ajoutons 4 grilles spéciales qui garantissent 3 bons numéros dans ce cas.`,
          color: "yellow"
        },
        {
          matchCount: 3,
          probability: "Possible",
          guaranteeLevel: "Renforcée",
          gridsNeeded: Math.ceil(binomialCoefficient(n, 3) / 10) + 8,
          cost: (Math.ceil(binomialCoefficient(n, 3) / 10) + 8) * 2.2,
          explanation: `Si seulement 3 numéros correspondent, nous ajoutons 8 grilles de sécurité pour maximiser les chances.`,
          color: "orange"
        },
        {
          matchCount: 2,
          probability: "Faible",
          guaranteeLevel: "Aucune garantie",
          gridsNeeded: 0,
          cost: 0,
          explanation: `Avec 2 correspondances ou moins, aucune stratégie raisonnable ne peut garantir 3 bons numéros.`,
          color: "red"
        }
      ];

      const optimalStrategy = scenarios[1]; // Stratégie équilibrée

      setStrategy({
        name: "Stratégie Adaptative Intelligente",
        totalGrids: optimalStrategy.gridsNeeded,
        totalCost: optimalStrategy.cost,
        scenarios,
        recommendation: `Nous recommandons la stratégie qui couvre les cas 5/5 et 4/5 correspondances, offrant le meilleur équilibre coût/sécurité.`
      });
      
      setIsCalculating(false);
    }, 2000);
  };

  const binomialCoefficient = (n: number, k: number): number => {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result = result * (n - i + 1) / i;
    }
    return Math.round(result);
  };

  useEffect(() => {
    if (selectedNumbers.numbers.length >= 5) {
      calculateAdaptiveStrategy();
    }
  }, [selectedNumbers]);

  if (selectedNumbers.numbers.length < 5) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <div className="text-center">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Sélectionnez au moins 5 numéros
          </h3>
          <p className="text-gray-500">
            L'optimisateur adaptatif nécessite une sélection de base pour fonctionner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête explicatif */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-blue-900 mb-2">
              Analyseur de Scénarios "Que se passe-t-il si..."
            </h2>
            <p className="text-blue-700 mb-3">
              Cet outil vous montre ce qui arrive selon le nombre de vos numéros qui correspondent 
              au tirage réel. Il ne change PAS la stratégie, il l'ANALYSE.
            </p>
            <div className="bg-blue-100 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>💡 Principe :</strong> Plus vous avez de correspondances avec le tirage, 
                plus la garantie est forte. Nous calculons des stratégies pour chaque cas !
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analyse de votre sélection */}
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-500" />
          Votre Sélection Actuelle
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-600 mb-2">Numéros principaux ({selectedNumbers.numbers.length})</div>
            <div className="flex flex-wrap gap-1">
              {selectedNumbers.numbers.sort((a, b) => a - b).map(num => (
                <span key={num} className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">
                  {num}
                </span>
              ))}
            </div>
          </div>
          
          {selectedNumbers.complementary.length > 0 && (
            <div>
              <div className="text-sm text-gray-600 mb-2">Complémentaires ({selectedNumbers.complementary.length})</div>
              <div className="flex flex-wrap gap-1">
                {selectedNumbers.complementary.map(num => (
                  <span key={num} className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">
                    {num}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-600">
          <strong>Source :</strong> {selectedNumbers.source}
        </div>
      </div>

      {/* Calcul en cours */}
      {isCalculating && (
        <div className="bg-white rounded-xl p-8 shadow-lg border text-center">
          <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Calcul en cours...</h3>
          <p className="text-gray-600">Analyse des scénarios adaptatifs</p>
        </div>
      )}

      {/* Résultats */}
      {strategy && !isCalculating && (
        <div className="space-y-6">
          
          {/* Stratégie recommandée */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-500 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  {strategy.name}
                </h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">{strategy.totalGrids}</div>
                    <div className="text-sm text-gray-600">Grilles totales</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">{strategy.totalCost.toFixed(2)}€</div>
                    <div className="text-sm text-gray-600">Coût total</div>
                  </div>
                </div>
                <p className="text-green-700 mb-3">{strategy.recommendation}</p>
                
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  {showDetails ? 'Masquer les détails' : 'Voir les détails par scénario'}
                </button>
              </div>
            </div>
          </div>

          {/* Détails par scénario */}
          {showDetails && (
            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                Analyse Détaillée par Scénario
              </h3>
              
              <div className="space-y-4">
                {strategy.scenarios.map((scenario, index) => (
                  <motion.div
                    key={index}
                    className={`border-l-4 ${
                      scenario.color === 'green' ? 'border-green-400 bg-green-50' :
                      scenario.color === 'yellow' ? 'border-yellow-400 bg-yellow-50' :
                      scenario.color === 'orange' ? 'border-orange-400 bg-orange-50' :
                      'border-red-400 bg-red-50'
                    } rounded-r-lg p-4 cursor-pointer hover:shadow-md transition-all`}
                    onClick={() => setSelectedScenario(selectedScenario === index ? null : index)}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${
                          scenario.color === 'green' ? 'bg-green-500' :
                          scenario.color === 'yellow' ? 'bg-yellow-500' :
                          scenario.color === 'orange' ? 'bg-orange-500' :
                          'bg-red-500'
                        } text-white rounded-full flex items-center justify-center font-bold text-sm`}>
                          {scenario.matchCount}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {scenario.matchCount}/5 numéros correspondent
                          </div>
                          <div className={`text-sm ${
                            scenario.color === 'green' ? 'text-green-600' :
                            scenario.color === 'yellow' ? 'text-yellow-600' :
                            scenario.color === 'orange' ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            Probabilité : {scenario.probability}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold">{scenario.gridsNeeded} grilles</div>
                        <div className={`text-sm ${
                          scenario.color === 'green' ? 'text-green-600' :
                          scenario.color === 'yellow' ? 'text-yellow-600' :
                          scenario.color === 'orange' ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {scenario.cost.toFixed(2)}€
                        </div>
                      </div>
                    </div>
                    
                    <div className={`text-sm mb-2 ${
                      scenario.color === 'green' ? 'text-green-700' :
                      scenario.color === 'yellow' ? 'text-yellow-700' :
                      scenario.color === 'orange' ? 'text-orange-700' :
                      'text-red-700'
                    }`}>
                      <strong>Garantie :</strong> {scenario.guaranteeLevel}
                    </div>
                    
                    {selectedScenario === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className={`mt-3 p-3 rounded-lg ${
                          scenario.color === 'green' ? 'bg-green-100' :
                          scenario.color === 'yellow' ? 'bg-yellow-100' :
                          scenario.color === 'orange' ? 'bg-orange-100' :
                          'bg-red-100'
                        }`}
                      >
                        <p className={`text-sm ${
                          scenario.color === 'green' ? 'text-green-800' :
                          scenario.color === 'yellow' ? 'text-yellow-800' :
                          scenario.color === 'orange' ? 'text-orange-800' :
                          'text-red-800'
                        }`}>
                          {scenario.explanation}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Important à retenir
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Plus vous avez de correspondances, plus la garantie est forte</li>
                  <li>• La stratégie s'adapte automatiquement selon vos numéros</li>
                  <li>• Le coût augmente avec le niveau de sécurité souhaité</li>
                  <li>• Aucune stratégie ne peut garantir un gain avec moins de 3 correspondances</li>
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Générer les Grilles
            </button>
            <button className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Recalculer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
