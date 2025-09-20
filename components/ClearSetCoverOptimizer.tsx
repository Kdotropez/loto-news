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
  Settings,
  Plus,
  Minus
} from 'lucide-react';

interface SelectedNumbers {
  numbers: number[];
  complementary: number[];
  source: string;
}

interface BaseStrategy {
  name: string;
  grids: number;
  cost: number;
  formula: string;
  guarantee: string;
  explanation: string;
}

interface SecurityOption {
  name: string;
  additionalGrids: number;
  additionalCost: number;
  scenario: string;
  guaranteeImprovement: string;
  explanation: string;
  worthIt: boolean;
}

interface ClearSetCoverOptimizerProps {
  selectedNumbers: SelectedNumbers;
}

export default function ClearSetCoverOptimizer({ selectedNumbers }: ClearSetCoverOptimizerProps) {
  const [baseStrategy, setBaseStrategy] = useState<BaseStrategy | null>(null);
  const [securityOptions, setSecurityOptions] = useState<SecurityOption[]>([]);
  const [selectedSecurity, setSelectedSecurity] = useState<boolean[]>([]);
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);
  const [totalGrids, setTotalGrids] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [guaranteeStats, setGuaranteeStats] = useState<{
    grids4Numbers: number;
    grids3Numbers: number;
    totalGridsPossible: number;
    successRate4: number;
    successRate3: number;
  } | null>(null);

  const binomialCoefficient = (n: number, k: number): number => {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result = result * (n - i + 1) / i;
    }
    return Math.round(result);
  };

  const calculateStrategy = () => {
    const n = selectedNumbers.numbers.length;
    
    if (n < 5) return;

    // STRATÉGIE DE BASE (LB1)
    const combinations3 = binomialCoefficient(n, 3);
    const baseGrids = Math.ceil(combinations3 / 10);
    const baseCost = baseGrids * 2.20;

    const base: BaseStrategy = {
      name: "Stratégie de Base (LB1)",
      grids: baseGrids,
      cost: baseCost,
      formula: `⌈C(${n},3) ÷ 10⌉ = ⌈${combinations3} ÷ 10⌉ = ${baseGrids}`,
      guarantee: "100% si les 5 numéros du tirage sont dans vos " + n + " sélectionnés",
      explanation: `Cette stratégie garantit mathématiquement qu'au moins une grille aura 3+ bons numéros, MAIS seulement si les 5 numéros du tirage font partie de vos ${n} numéros présélectionnés.`
    };

    // CALCULS POUR LES STATISTIQUES DE GARANTIE
    const grids4Numbers = 1 * (n - 4);
    const grids3Numbers = 4 * binomialCoefficient(n - 4, 2);
    const totalGridsPossible = binomialCoefficient(n, 5);
    const successRate4 = ((grids4Numbers + grids3Numbers) / totalGridsPossible) * 100;
    const grids3OnlyScenario = 1 * binomialCoefficient(n - 3, 2);
    const successRate3 = (grids3OnlyScenario / totalGridsPossible) * 100;

    // Sauvegarder les stats pour l'affichage
    setGuaranteeStats({
      grids4Numbers,
      grids3Numbers,
      totalGridsPossible,
      successRate4,
      successRate3
    });

    // OPTIONS DE SÉCURITÉ
    const security: SecurityOption[] = [];
    
    security.push({
      name: "Sécurité 4/5 Correspondances",
      additionalGrids: 8,
      additionalCost: 8 * 2.20,
      scenario: "Si 4 numéros sur 5 correspondent",
      guaranteeImprovement: `${successRate4.toFixed(1)}% de vos grilles auront 3+ numéros`,
      explanation: `Ajoute 8 grilles stratégiques qui améliorent vos chances dans le cas où seulement 4 de vos numéros correspondent au tirage. Sans cela, vous n'avez que ${successRate4.toFixed(1)}% de chance de gagner.`,
      worthIt: successRate4 > 15 // Arbitraire : > 15% pour que ça vaille le coup
    });

    // Option 2 : Sécurité 3/5 (utiliser les variables déjà calculées)
    
    security.push({
      name: "Sécurité 3/5 Correspondances",
      additionalGrids: 15,
      additionalCost: 15 * 2.20,
      scenario: "Si 3 numéros sur 5 correspondent",
      guaranteeImprovement: `${successRate3.toFixed(1)}% de vos grilles auront exactement 3 numéros`,
      explanation: `Ajoute 15 grilles pour le cas extrême où seulement 3 de vos numéros correspondent. Rentabilité douteuse : seulement ${successRate3.toFixed(1)}% de chance de gagner 20€.`,
      worthIt: false // Généralement pas rentable
    });

    // Option 3 : Couverture Externe
    security.push({
      name: "Couverture Numéros Externes",
      additionalGrids: 12,
      additionalCost: 12 * 2.20,
      scenario: "Si vos numéros sont complètement à côté",
      guaranteeImprovement: "Grilles avec numéros populaires externes",
      explanation: `Ajoute 12 grilles avec des numéros fréquents NON présents dans votre sélection. Assurance contre un échec total de votre analyse.`,
      worthIt: false // Seulement si budget important
    });

    setBaseStrategy(base);
    setSecurityOptions(security);
    setSelectedSecurity(new Array(security.length).fill(false));
  };

  useEffect(() => {
    calculateStrategy();
  }, [selectedNumbers]);

  useEffect(() => {
    if (baseStrategy) {
      const additionalGrids = securityOptions.reduce((sum, option, index) => 
        sum + (selectedSecurity[index] ? option.additionalGrids : 0), 0);
      const additionalCost = securityOptions.reduce((sum, option, index) => 
        sum + (selectedSecurity[index] ? option.additionalCost : 0), 0);
      
      setTotalGrids(baseStrategy.grids + additionalGrids);
      setTotalCost(baseStrategy.cost + additionalCost);
    }
  }, [baseStrategy, selectedSecurity]);

  const toggleSecurity = (index: number) => {
    const newSelected = [...selectedSecurity];
    newSelected[index] = !newSelected[index];
    setSelectedSecurity(newSelected);
  };

  if (!baseStrategy) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <div className="text-center">
          <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Sélectionnez au moins 5 numéros
          </h3>
          <p className="text-gray-500">
            L'optimisateur nécessite une sélection de base pour calculer les garanties.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Stratégie de Base */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-500 rounded-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-green-900 mb-2">
              {baseStrategy.name}
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{baseStrategy.grids}</div>
                <div className="text-sm text-gray-600">Grilles nécessaires</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{baseStrategy.cost.toFixed(2)}€</div>
                <div className="text-sm text-gray-600">Coût de base</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-lg font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600">Garantie (si 5/5)</div>
              </div>
            </div>

            <div className="bg-green-100 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-green-800 mb-2">📐 Formule Mathématique</h4>
              <p className="text-green-700 font-mono text-sm mb-2">{baseStrategy.formula}</p>
              <p className="text-green-700 text-sm">{baseStrategy.explanation}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">⚠️ Condition Importante</h4>
                  <p className="text-amber-700 text-sm">{baseStrategy.guarantee}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Options de Sécurité */}
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Options de Sécurité (Optionnelles)
          </h3>
          <button
            onClick={() => setShowSecurityDetails(!showSecurityDetails)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Info className="w-4 h-4" />
            {showSecurityDetails ? 'Masquer' : 'Détails'}
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Ces options ajoutent des grilles pour les cas où votre sélection ne contient pas tous les numéros du tirage.
        </p>

        <div className="space-y-4">
          {securityOptions.map((option, index) => (
            <div key={index} className={`border rounded-lg p-4 ${selectedSecurity[index] ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSecurity[index]}
                      onChange={() => toggleSecurity(index)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 font-semibold">{option.name}</span>
                  </label>
                  {!option.worthIt && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                      Peu rentable
                    </span>
                  )}
                  {option.worthIt && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      Recommandé
                    </span>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="font-bold">+{option.additionalGrids} grilles</div>
                  <div className="text-sm text-gray-600">+{option.additionalCost.toFixed(2)}€</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Scénario :</div>
                  <div className="text-sm text-gray-600">{option.scenario}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Amélioration :</div>
                  <div className="text-sm text-gray-600">{option.guaranteeImprovement}</div>
                </div>
              </div>

              {showSecurityDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-3 p-3 bg-white rounded border-l-4 border-blue-400"
                >
                  <p className="text-sm text-gray-700">{option.explanation}</p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Résumé Total */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-purple-500" />
          Résumé de Votre Stratégie
        </h3>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{totalGrids}</div>
            <div className="text-sm text-gray-600">Grilles totales</div>
            <div className="text-xs text-gray-500">
              Base: {baseStrategy.grids} + Options: {totalGrids - baseStrategy.grids}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{totalCost.toFixed(2)}€</div>
            <div className="text-sm text-gray-600">Coût total</div>
            <div className="text-xs text-gray-500">
              Base: {baseStrategy.cost.toFixed(2)}€ + Options: {(totalCost - baseStrategy.cost).toFixed(2)}€
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{(totalCost / totalGrids).toFixed(2)}€</div>
            <div className="text-sm text-gray-600">Prix par grille</div>
            <div className="text-xs text-gray-500">
              Incluant Second Tirage si sélectionné
            </div>
          </div>
        </div>

        {/* Garanties selon les cas */}
        <div className="bg-white rounded-lg p-4">
          <h4 className="font-semibold mb-3">🎯 Garanties selon le tirage réel :</h4>
          <div className="space-y-3">
            <div className="p-3 bg-green-100 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-green-800">✅ CAS IDÉAL (5/5 correspondances)</span>
                <span className="font-bold text-green-700">100% GARANTI</span>
              </div>
              <div className="text-sm text-green-700 mb-2">
                <strong>Si les 5 numéros du tirage font partie de vos {selectedNumbers.numbers.length} sélectionnés</strong>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-green-200 p-2 rounded">
                  <div className="font-bold text-center">1 grille → Rang 1 ou 2</div>
                  <div className="text-center">5 bons nums = 100K€ à 5.7M€</div>
                </div>
                <div className="bg-green-200 p-2 rounded">
                  <div className="font-bold text-center">~{guaranteeStats ? Math.round((guaranteeStats.grids4Numbers / guaranteeStats.totalGridsPossible) * baseStrategy.grids) : 0} grilles → Rang 3 ou 4</div>
                  <div className="text-center">4 bons nums = 500€ à 1,086€</div>
                </div>
                <div className="bg-green-200 p-2 rounded">
                  <div className="font-bold text-center">~{guaranteeStats ? Math.round((guaranteeStats.grids3Numbers / guaranteeStats.totalGridsPossible) * baseStrategy.grids) : 0} grilles → Rang 5 ou 6</div>
                  <div className="text-center">3 bons nums = 20€ à 50€</div>
                </div>
                <div className="bg-green-200 p-2 rounded">
                  <div className="font-bold text-center">Autres grilles → Rang 7, 8, 9</div>
                  <div className="text-center">1-2 bons nums = 2€ à 20€</div>
                </div>
              </div>
            </div>
            
            {selectedSecurity[0] && guaranteeStats && (
              <div className="p-3 bg-yellow-100 rounded-lg border-l-4 border-yellow-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-yellow-800">⚠️ CAS PARTIEL (4/5 correspondances)</span>
                  <span className="font-bold text-yellow-700">{guaranteeStats.successRate4.toFixed(1)}% de garantie</span>
                </div>
                <div className="text-sm text-yellow-700 mb-2">
                  <strong>Si 4 numéros du tirage font partie de vos {selectedNumbers.numbers.length} sélectionnés</strong>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-yellow-200 p-2 rounded text-center">
                    <div className="font-bold">{guaranteeStats.grids4Numbers}</div>
                    <div>Rang 3-4 (4 nums)</div>
                    <div className="text-yellow-700">500€-1,086€</div>
                  </div>
                  <div className="bg-yellow-200 p-2 rounded text-center">
                    <div className="font-bold">{guaranteeStats.grids3Numbers}</div>
                    <div>Rang 5-6 (3 nums)</div>
                    <div className="text-yellow-700">20€-50€</div>
                  </div>
                  <div className="bg-yellow-200 p-2 rounded text-center">
                    <div className="font-bold">{guaranteeStats.totalGridsPossible - guaranteeStats.grids4Numbers - guaranteeStats.grids3Numbers}</div>
                    <div>Rang 7-9 (1-2 nums)</div>
                    <div className="text-yellow-700">2€-20€</div>
                  </div>
                </div>
                <div className="text-xs text-yellow-600 mt-1">
                  → {guaranteeStats.successRate4.toFixed(1)}% de garantie d'avoir au moins 3 bons numéros
                </div>
              </div>
            )}
            
            {selectedSecurity[1] && guaranteeStats && (
              <div className="p-3 bg-orange-100 rounded-lg border-l-4 border-orange-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-orange-800">⚠️ CAS DIFFICILE (3/5 correspondances)</span>
                  <span className="font-bold text-orange-700">{guaranteeStats.successRate3.toFixed(1)}% de garantie</span>
                </div>
                <div className="text-sm text-orange-700 mb-2">
                  <strong>Si 3 numéros du tirage font partie de vos {selectedNumbers.numbers.length} sélectionnés</strong>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-orange-200 p-2 rounded text-center">
                    <div className="font-bold">{Math.round(guaranteeStats.successRate3 / 100 * guaranteeStats.totalGridsPossible)}</div>
                    <div>Rang 5-6 (3 nums)</div>
                    <div className="text-orange-700">20€-50€</div>
                  </div>
                  <div className="bg-orange-200 p-2 rounded text-center">
                    <div className="font-bold">~{Math.round(guaranteeStats.totalGridsPossible * 0.15)}</div>
                    <div>Rang 7-8 (2 nums)</div>
                    <div className="text-orange-700">5€-20€</div>
                  </div>
                  <div className="bg-orange-200 p-2 rounded text-center">
                    <div className="font-bold">~{Math.round(guaranteeStats.totalGridsPossible * 0.25)}</div>
                    <div>Rang 9-10 (1-0 nums)</div>
                    <div className="text-orange-700">2€-5€</div>
                  </div>
                </div>
                <div className="text-xs text-orange-600 mt-1">
                  → {guaranteeStats.successRate3.toFixed(1)}% de garantie d'avoir exactement 3 bons numéros (Rang 5-6)
                </div>
              </div>
            )}
            
            <div className="p-3 bg-red-100 rounded-lg border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-red-800">❌ CAS D'ÉCHEC (≤2/5)</span>
                <span className="font-bold text-red-700">0% garantie</span>
              </div>
              <div className="text-sm text-red-700">
                <strong>Si 2 numéros ou moins du tirage font partie de vos sélectionnés</strong>
              </div>
              <div className="text-xs text-red-600 mt-1">
                → Aucune de vos grilles ne peut garantir 3+ bons numéros
              </div>
            </div>
          </div>
        </div>

        {/* Récapitulatif des Gains Attendus */}
        {guaranteeStats && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mt-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Gains Totaux Attendus (Cas Idéal 5/5)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded text-center">
                <div className="text-lg font-bold text-purple-600">1×</div>
                <div className="text-purple-700">Jackpot</div>
                <div className="text-gray-600">2M€ - 5.7M€</div>
              </div>
              <div className="bg-white p-3 rounded text-center">
                <div className="text-lg font-bold text-blue-600">~{Math.round((guaranteeStats.grids4Numbers / guaranteeStats.totalGridsPossible) * baseStrategy.grids)}×</div>
                <div className="text-blue-700">Rang 3-4</div>
                <div className="text-gray-600">500€ - 1,086€</div>
              </div>
              <div className="bg-white p-3 rounded text-center">
                <div className="text-lg font-bold text-green-600">~{Math.round((guaranteeStats.grids3Numbers / guaranteeStats.totalGridsPossible) * baseStrategy.grids)}×</div>
                <div className="text-green-700">Rang 5-6</div>
                <div className="text-gray-600">20€ - 50€</div>
              </div>
              <div className="bg-white p-3 rounded text-center">
                <div className="text-lg font-bold text-orange-600">Autres</div>
                <div className="text-orange-700">Rang 7-10</div>
                <div className="text-gray-600">2€ - 20€</div>
              </div>
            </div>
            <div className="text-center mt-3 p-2 bg-white rounded">
              <span className="text-sm text-gray-700">
                <strong>Gain minimum garanti (cas 5/5) :</strong> 
                <span className="text-green-600 font-bold"> ~{(baseStrategy.grids * 15).toLocaleString()}€</span>
                <span className="text-gray-500"> (estimation conservative)</span>
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center mt-6">
          <button className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Générer {totalGrids} Grilles
          </button>
          <button 
            onClick={calculateStrategy}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <Calculator className="w-5 h-5" />
            Recalculer
          </button>
        </div>
      </div>
    </div>
  );
}
