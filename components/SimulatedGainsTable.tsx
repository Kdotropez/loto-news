'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

interface SelectedNumbers {
  numbers: number[];
  complementary: number[];
  source: string;
}

interface SimulatedScenario {
  correspondances: string;
  description: string;
  gridsWithRank: { [rank: string]: number };
  totalCost: number;
  estimatedGains: number;
  benefit: number;
  roi: number;
  probability: string;
  color: string;
}

interface SimulatedGainsTableProps {
  selectedNumbers: SelectedNumbers;
}

export default function SimulatedGainsTable({ selectedNumbers }: SimulatedGainsTableProps) {
  const [scenarios, setScenarios] = useState<SimulatedScenario[]>([]);
  const [baseGrids, setBaseGrids] = useState(0);
  const [baseCost, setBaseCost] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);

  const binomialCoefficient = (n: number, k: number): number => {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result = result * (n - i + 1) / i;
    }
    return Math.round(result);
  };

  const calculateSimulatedScenarios = () => {
    const n = selectedNumbers.numbers.length;
    if (n < 5) return;

    // Stratégie de base LB1
    const combinations3 = binomialCoefficient(n, 3);
    const grids = Math.ceil(combinations3 / 10);
    const cost = grids * 2.20;
    
    setBaseGrids(grids);
    setBaseCost(cost);

    const totalGridsPossible = binomialCoefficient(n, 5);
    const newScenarios: SimulatedScenario[] = [];

    // CAS 5/5 : Correspondance parfaite
    const scenario5 = {
      correspondances: "5/5",
      description: `Les 5 numéros du tirage sont dans vos ${n} sélectionnés`,
      gridsWithRank: {
        "Rang 1-2 (5 nums)": 1,
        "Rang 3-4 (4 nums)": Math.round((binomialCoefficient(n, 4) * 5) / totalGridsPossible * grids),
        "Rang 5-6 (3 nums)": Math.round((binomialCoefficient(n, 3) * 10) / totalGridsPossible * grids),
        "Rang 7-10 (1-2 nums)": grids - 1 - Math.round((binomialCoefficient(n, 4) * 5) / totalGridsPossible * grids) - Math.round((binomialCoefficient(n, 3) * 10) / totalGridsPossible * grids)
      },
      totalCost: cost,
      estimatedGains: 1 * 5701258 + Math.round((binomialCoefficient(n, 4) * 5) / totalGridsPossible * grids) * 1086 + Math.round((binomialCoefficient(n, 3) * 10) / totalGridsPossible * grids) * 35 + (grids - 1 - Math.round((binomialCoefficient(n, 4) * 5) / totalGridsPossible * grids) - Math.round((binomialCoefficient(n, 3) * 10) / totalGridsPossible * grids)) * 10,
      benefit: 0,
      roi: 0,
      probability: "Dépend de votre méthode de sélection",
      color: "green"
    };
    scenario5.benefit = scenario5.estimatedGains - scenario5.totalCost;
    scenario5.roi = (scenario5.benefit / scenario5.totalCost) * 100;

    // CAS 4/5 : 4 correspondances
    const grids4 = 1 * (n - 4);
    const grids3_4case = 4 * binomialCoefficient(n - 4, 2);
    const grids2_4case = 6 * binomialCoefficient(n - 4, 3);
    
    const scenario4 = {
      correspondances: "4/5",
      description: `4 numéros du tirage sont dans vos ${n} sélectionnés`,
      gridsWithRank: {
        "Rang 3-4 (4 nums MAX)": grids4,
        "Rang 5-6 (3 nums)": grids3_4case,
        "Rang 7-8 (2 nums)": grids2_4case,
        "Aucun gain (0-1 num)": grids - grids4 - grids3_4case - grids2_4case
      },
      totalCost: cost,
      estimatedGains: grids4 * 1086 + grids3_4case * 35 + grids2_4case * 12.5,
      benefit: 0,
      roi: 0,
      probability: "Probable avec bonne analyse",
      color: "blue"
    };
    scenario4.benefit = scenario4.estimatedGains - scenario4.totalCost;
    scenario4.roi = (scenario4.benefit / scenario4.totalCost) * 100;

    // CAS 3/5 : 3 correspondances
    const grids3_3case = 1 * binomialCoefficient(n - 3, 2);
    const grids2_3case = 3 * binomialCoefficient(n - 3, 3);
    const grids1_3case = 3 * binomialCoefficient(n - 3, 4);
    
    const scenario3 = {
      correspondances: "3/5",
      description: `3 numéros du tirage sont dans vos ${n} sélectionnés`,
      gridsWithRank: {
        "Rang 5-6 (3 nums MAX)": grids3_3case,
        "Rang 7-8 (2 nums)": grids2_3case,
        "Rang 9 (1 num)": grids1_3case,
        "Aucun gain (0 num)": grids - grids3_3case - grids2_3case - grids1_3case
      },
      totalCost: cost,
      estimatedGains: grids3_3case * 35 + grids2_3case * 12.5 + grids1_3case * 2.5,
      benefit: 0,
      roi: 0,
      probability: "Possible mais risqué",
      color: "yellow"
    };
    scenario3.benefit = scenario3.estimatedGains - scenario3.totalCost;
    scenario3.roi = (scenario3.benefit / scenario3.totalCost) * 100;

    // CAS 2/5 : 2 correspondances
    const grids2_2case = 1 * binomialCoefficient(n - 2, 3);
    const grids1_2case = 2 * binomialCoefficient(n - 2, 4);
    
    const scenario2 = {
      correspondances: "2/5",
      description: `2 numéros du tirage sont dans vos ${n} sélectionnés`,
      gridsWithRank: {
        "Rang 7-8 (2 nums MAX)": grids2_2case,
        "Rang 9 (1 num)": grids1_2case,
        "Aucun gain (0 num)": grids - grids2_2case - grids1_2case
      },
      totalCost: cost,
      estimatedGains: grids2_2case * 12.5 + grids1_2case * 2.5,
      benefit: 0,
      roi: 0,
      probability: "Échec probable de l'analyse",
      color: "orange"
    };
    scenario2.benefit = scenario2.estimatedGains - scenario2.totalCost;
    scenario2.roi = (scenario2.benefit / scenario2.totalCost) * 100;

    // CAS 1/5 : 1 correspondance
    const grids1_1case = 1 * binomialCoefficient(n - 1, 4);
    
    const scenario1 = {
      correspondances: "1/5",
      description: `1 numéro du tirage est dans vos ${n} sélectionnés`,
      gridsWithRank: {
        "Rang 9 (1 num MAX)": grids1_1case,
        "Aucun gain (0 num)": grids - grids1_1case
      },
      totalCost: cost,
      estimatedGains: grids1_1case * 2.5,
      benefit: 0,
      roi: 0,
      probability: "Échec total de l'analyse",
      color: "red"
    };
    scenario1.benefit = scenario1.estimatedGains - scenario1.totalCost;
    scenario1.roi = (scenario1.benefit / scenario1.totalCost) * 100;

    setScenarios([scenario5, scenario4, scenario3, scenario2, scenario1]);
  };

  useEffect(() => {
    calculateSimulatedScenarios();
  }, [selectedNumbers]);

  const getScenarioIcon = (correspondances: string) => {
    switch (correspondances) {
      case '5/5': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case '4/5': return <Target className="w-5 h-5 text-blue-600" />;
      case '3/5': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case '2/5': return <XCircle className="w-5 h-5 text-orange-600" />;
      case '1/5': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      green: 'border-green-400 bg-green-50',
      blue: 'border-blue-400 bg-blue-50',
      yellow: 'border-yellow-400 bg-yellow-50',
      orange: 'border-orange-400 bg-orange-50',
      red: 'border-red-400 bg-red-50'
    };
    return colorMap[color as keyof typeof colorMap] || 'border-gray-400 bg-gray-50';
  };

  if (selectedNumbers.numbers.length < 5) {
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

  return (
    <div className="space-y-6">
      
      {/* En-tête avec stratégie de base */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <h2 className="text-xl font-bold text-purple-900 mb-3 flex items-center gap-2">
          <Calculator className="w-6 h-6" />
          Simulation de Gains selon Vos Grilles
        </h2>
        
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{baseGrids}</div>
            <div className="text-sm text-gray-600">Grilles LB1</div>
            <div className="text-xs text-gray-500">⌈C({selectedNumbers.numbers.length},3) ÷ 10⌉</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{baseCost.toFixed(2)}€</div>
            <div className="text-sm text-gray-600">Coût total</div>
            <div className="text-xs text-gray-500">{baseGrids} × 2.20€</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{selectedNumbers.numbers.length}</div>
            <div className="text-sm text-gray-600">Numéros sélectionnés</div>
            <div className="text-xs text-gray-500">Votre présélection</div>
          </div>
        </div>
        
        <div className="bg-purple-100 rounded-lg p-4">
          <p className="text-purple-800 text-sm">
            <strong>💡 Simulation :</strong> Ce tableau montre les gains estimés de vos {baseGrids} grilles 
            selon le nombre de vos numéros qui correspondent au tirage réel.
          </p>
        </div>
      </div>

      {/* Tableau de Simulation */}
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <div className="bg-gray-50 p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Tableau de Simulation des Gains
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Gains moyens estimés selon l'historique FDJ (06/10/08 à 10/05/16)
          </p>
        </div>

        {/* Version Desktop - Tableau */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Scénario</th>
                <th className="px-4 py-3 text-center font-semibold">Rang 1-2</th>
                <th className="px-4 py-3 text-center font-semibold">Rang 3-4</th>
                <th className="px-4 py-3 text-center font-semibold">Rang 5-6</th>
                <th className="px-4 py-3 text-center font-semibold">Rang 7-10</th>
                <th className="px-4 py-3 text-center font-semibold">Coût</th>
                <th className="px-4 py-3 text-center font-semibold">Gains Estimés</th>
                <th className="px-4 py-3 text-center font-semibold">Bénéfice</th>
                <th className="px-4 py-3 text-center font-semibold">ROI</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario, index) => (
                <tr 
                  key={index}
                  className={`border-b cursor-pointer transition-colors hover:${getColorClasses(scenario.color).split(' ')[1]}`}
                  onClick={() => setSelectedScenario(selectedScenario === index ? null : index)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getScenarioIcon(scenario.correspondances)}
                      <div>
                        <div className="font-semibold">{scenario.correspondances}</div>
                        <div className="text-xs text-gray-500">{scenario.probability}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="font-bold">{scenario.gridsWithRank["Rang 1-2 (5 nums)"] || 0}</div>
                    <div className="text-xs text-gray-500">5.7M€ moy</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="font-bold">{scenario.gridsWithRank["Rang 3-4 (4 nums)"] || scenario.gridsWithRank["Rang 3-4 (4 nums MAX)"] || 0}</div>
                    <div className="text-xs text-gray-500">1,086€ moy</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="font-bold">{scenario.gridsWithRank["Rang 5-6 (3 nums)"] || scenario.gridsWithRank["Rang 5-6 (3 nums MAX)"] || 0}</div>
                    <div className="text-xs text-gray-500">35€ moy</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="font-bold">{scenario.gridsWithRank["Rang 7-10 (1-2 nums)"] || scenario.gridsWithRank["Rang 7-8 (2 nums)"] || scenario.gridsWithRank["Rang 9 (1 num)"] || 0}</div>
                    <div className="text-xs text-gray-500">2-20€ moy</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="font-bold">{scenario.totalCost.toFixed(2)}€</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="font-bold text-green-600">{scenario.estimatedGains.toLocaleString()}€</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className={`font-bold ${scenario.benefit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {scenario.benefit > 0 ? '+' : ''}{scenario.benefit.toLocaleString()}€
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className={`font-bold ${scenario.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {scenario.roi > 0 ? '+' : ''}{scenario.roi.toFixed(1)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Version Mobile - Cartes */}
        <div className="md:hidden space-y-4 p-4">
          {scenarios.map((scenario, index) => (
            <motion.div
              key={index}
              className={`border-l-4 rounded-r-lg p-4 cursor-pointer ${getColorClasses(scenario.color)}`}
              onClick={() => setSelectedScenario(selectedScenario === index ? null : index)}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getScenarioIcon(scenario.correspondances)}
                  <div>
                    <div className="font-semibold">Cas {scenario.correspondances}</div>
                    <div className="text-xs text-gray-600">{scenario.probability}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${scenario.benefit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {scenario.benefit > 0 ? '+' : ''}{scenario.benefit.toLocaleString()}€
                  </div>
                  <div className="text-xs text-gray-500">Bénéfice</div>
                </div>
              </div>

              {selectedScenario === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="space-y-3"
                >
                  <div className="text-sm text-gray-700 mb-3">{scenario.description}</div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(scenario.gridsWithRank).map(([rank, count]) => (
                      <div key={rank} className="bg-white p-2 rounded">
                        <div className="font-bold">{count} grilles</div>
                        <div className="text-gray-600">{rank}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t">
                    <div className="text-center">
                      <div className="font-bold">{scenario.totalCost.toFixed(2)}€</div>
                      <div className="text-gray-500">Coût</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">{scenario.estimatedGains.toLocaleString()}€</div>
                      <div className="text-gray-500">Gains</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-bold ${scenario.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {scenario.roi.toFixed(1)}%
                      </div>
                      <div className="text-gray-500">ROI</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Légende */}
      <div className="bg-gray-50 rounded-xl p-4 border">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-gray-600" />
          Légende et Notes Importantes
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <div className="font-medium mb-2">📊 Gains Moyens :</div>
            <ul className="space-y-1 text-xs">
              <li>• <strong>Rang 1-2 :</strong> 5.7M€ / 102K€ (moyennes historiques)</li>
              <li>• <strong>Rang 3-4 :</strong> 1,086€ (avec/sans chance)</li>
              <li>• <strong>Rang 5-6 :</strong> 50€ / 20€ (3 bons nums)</li>
              <li>• <strong>Rang 7-10 :</strong> 2€ à 20€ (1-2 bons nums)</li>
            </ul>
          </div>
          <div>
            <div className="font-medium mb-2">⚠️ Avertissements :</div>
            <ul className="space-y-1 text-xs">
              <li>• Les gains peuvent varier selon la cagnotte</li>
              <li>• Plus de gagnants = gains divisés</li>
              <li>• Probabilités basées sur l'historique officiel</li>
              <li>• ROI négatif = perte d'argent probable</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
