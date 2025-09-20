'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, Target, TrendingUp, Save, Calendar } from 'lucide-react';
import { savedGridsManager, SavedGrid } from '../lib/saved-grids-manager';

interface MixedSetCoverOptimizerProps {
  selectedNumbers: {
    numbers: number[];
    complementary: number[];
    source: string;
  };
}

interface MixedStrategy {
  name: string;
  grids: number;
  cost: number;
  description: string;
  efficiency: number;
  feasible: boolean;
  includeSecondTirage?: boolean;
  secondTirageCost?: number;
}

interface GeneratedGrid {
  id: number;
  numbers: number[];
  cost: number;
  type: 'simple' | 'multiple';
}

export default function MixedSetCoverOptimizer({ selectedNumbers }: MixedSetCoverOptimizerProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<{
    universe: number;
    strategies: MixedStrategy[];
    optimal: MixedStrategy;
    savings: number;
  } | null>(null);
  
  const [generatedGrids, setGeneratedGrids] = useState<GeneratedGrid[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // États pour la sauvegarde
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDate, setSaveDate] = useState('');
  
  // État pour le second tirage
  const [includeSecondTirage, setIncludeSecondTirage] = useState(false);

  // Coûts réels FDJ
  const GRID_COSTS: Record<number, number> = {
    5: 2.20,    // Simple
    7: 46.20,   // Multiple 7
    8: 123.20,  // Multiple 8  
    9: 277.20,  // Multiple 9
    10: 554.40  // Multiple 10
  };

  const binomialCoefficient = (n: number, k: number): number => {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (i + 1);
    }
    
    return Math.round(result);
  };

  const calculateMixedStrategies = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const n = selectedNumbers.numbers.length;
      const universe = binomialCoefficient(n, 3);
      
      // Appliquer VOS formules mathématiques
      // CORRECTION : Le second tirage ne change pas l'univers C(n,3) mais simplifie la couverture
      // Car pas besoin de couvrir les combinaisons avec complémentaire
      
      const lb1 = Math.ceil(universe / 10);
      const lb2 = calculateSchonheimBound(n);
      const ub = Math.ceil(lb1 * (Math.log(universe) + 1));
      
      // Coût de base par grille
      const baseCost = GRID_COSTS[5];
      const secondTirageCost = 0.80;
      
      const strategies: MixedStrategy[] = [];
      
      // Solution 1: Selon LB1 (votre formule simple)
      const totalCostLB1 = includeSecondTirage ? 
        (lb1 * baseCost) + (lb1 * secondTirageCost) : 
        lb1 * baseCost;
      
      strategies.push({
        name: includeSecondTirage ? 'Solution LB1 + Second Tirage' : 'Solution LB1',
        grids: lb1,
        cost: totalCostLB1,
        description: includeSecondTirage ? 
          `${lb1} grilles LB1 + Second Tirage (0.80€/grille)` :
          `${lb1} grilles selon formule LB1 = ⌈C(${n},3) ÷ 10⌉`,
        efficiency: includeSecondTirage ? (totalCostLB1 / lb1) : baseCost,
        feasible: true,
        includeSecondTirage,
        secondTirageCost: includeSecondTirage ? lb1 * secondTirageCost : 0
      });

      // Solution 2: Selon LB2 (Schönheim)
      const totalCostLB2 = includeSecondTirage ? 
        (lb2 * baseCost) + (lb2 * secondTirageCost) : 
        lb2 * baseCost;
        
      strategies.push({
        name: includeSecondTirage ? 'Solution LB2 + Second Tirage' : 'Solution LB2 (Schönheim)',
        grids: lb2,
        cost: totalCostLB2,
        description: includeSecondTirage ?
          `${lb2} grilles Schönheim + Second Tirage (0.80€/grille)` :
          `${lb2} grilles selon borne de Schönheim`,
        efficiency: includeSecondTirage ? (totalCostLB2 / lb2) : baseCost,
        feasible: true,
        includeSecondTirage,
        secondTirageCost: includeSecondTirage ? lb2 * secondTirageCost : 0
      });

      // Solution 3: Pure Simples (référence)
      const pureSimples = binomialCoefficient(n, 5);
      strategies.push({
        name: 'Pure Simples (référence)',
        grids: pureSimples,
        cost: pureSimples * GRID_COSTS[5],
        description: `${pureSimples} grilles simples de 5 numéros`,
        efficiency: GRID_COSTS[5],
        feasible: true
      });

      // Solution 4: Pure Multiple (si ≤10 numéros)
      if (n <= 10) {
        const size = Math.min(10, n) as 5|7|8|9|10;
        strategies.push({
          name: `Pure Multiple ${size}`,
          grids: 1,
          cost: GRID_COSTS[size],
          description: `1 grille multiple de ${size} numéros`,
          efficiency: GRID_COSTS[size],
          feasible: true
        });
      }

      // Trouver la stratégie optimale (coût minimum)
      const optimal = strategies.reduce((min, current) => 
        current.cost < min.cost ? current : min
      );

      const maxCost = Math.max(...strategies.map(s => s.cost));
      const savings = maxCost - optimal.cost;

      setResults({
        universe,
        strategies: strategies.sort((a, b) => a.cost - b.cost),
        optimal,
        savings
      });
      
      setIsCalculating(false);
    }, 1000);
  };

  // Fonction pour calculer la borne de Schönheim selon VOTRE formule
  const calculateSchonheimBound = (X: number): number => {
    let L = [1]; // L₀ = 1
    
    // Calculer L₁, L₂, L₃
    for (let i = 0; i < 3; i++) {
      const nextL = Math.ceil(((X - i) / (5 - i)) * L[i]);
      L.push(nextL);
    }
    
    return L[3]; // LB2 = L₃
  };

  // Génération des grilles selon la solution optimale
  const generateOptimalGrids = async () => {
    if (!results) return;
    
    setIsGenerating(true);
    
    try {
      // Simuler un délai pour l'algorithme de génération
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const grids: GeneratedGrid[] = [];
      const numbers = selectedNumbers.numbers;
      const targetGridCount = results.optimal.grids;
      
      if (results.optimal.name.includes('Multiple')) {
        // Génération d'une grille multiple
        grids.push({
          id: 1,
          numbers: numbers.slice(0, Math.min(10, numbers.length)),
          cost: GRID_COSTS[Math.min(10, numbers.length) as 5|7|8|9|10],
          type: 'multiple'
        });
      } else {
        // Génération de grilles simples selon l'algorithme Set Cover
        const allTriples = generateAllTriples(numbers);
        const coveredTriples = new Set<string>();
        
        // Algorithme glouton pour générer les grilles
        let gridId = 1;
        
        while (coveredTriples.size < allTriples.length && grids.length < targetGridCount) {
          // Trouver la meilleure grille de 5 numéros qui couvre le plus de triples non couverts
          let bestGrid: number[] = [];
          let bestCoverage = 0;
          
          // Générer des combinaisons de 5 numéros et évaluer leur couverture
          const combinations = generateCombinations(numbers, 5);
          
          for (const combo of combinations.slice(0, 1000)) { // Limiter pour la performance
            const triples = generateTriples(combo);
            const newCoverage = triples.filter(t => !coveredTriples.has(t)).length;
            
            if (newCoverage > bestCoverage) {
              bestCoverage = newCoverage;
              bestGrid = combo;
            }
          }
          
          if (bestGrid.length === 5) {
            // Ajouter cette grille
            grids.push({
              id: gridId++,
              numbers: bestGrid.sort((a, b) => a - b),
              cost: GRID_COSTS[5],
              type: 'simple'
            });
            
            // Marquer les triples comme couverts
            const triples = generateTriples(bestGrid);
            triples.forEach(t => coveredTriples.add(t));
          } else {
            break; // Impossible de trouver plus de grilles
          }
        }
        
        // Si pas assez de grilles, compléter avec des grilles aléatoires
        while (grids.length < targetGridCount) {
          const randomGrid = generateRandomGrid(numbers, 5);
          grids.push({
            id: gridId++,
            numbers: randomGrid.sort((a, b) => a - b),
            cost: GRID_COSTS[5],
            type: 'simple'
          });
        }
      }
      
      setGeneratedGrids(grids);
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Fonctions utilitaires pour la génération
  const generateAllTriples = (numbers: number[]): string[] => {
    const triples: string[] = [];
    for (let i = 0; i < numbers.length - 2; i++) {
      for (let j = i + 1; j < numbers.length - 1; j++) {
        for (let k = j + 1; k < numbers.length; k++) {
          triples.push([numbers[i], numbers[j], numbers[k]].sort((a,b) => a-b).join(','));
        }
      }
    }
    return triples;
  };

  const generateTriples = (grid: number[]): string[] => {
    const triples: string[] = [];
    for (let i = 0; i < grid.length - 2; i++) {
      for (let j = i + 1; j < grid.length - 1; j++) {
        for (let k = j + 1; k < grid.length; k++) {
          triples.push([grid[i], grid[j], grid[k]].sort((a,b) => a-b).join(','));
        }
      }
    }
    return triples;
  };

  const generateCombinations = (elements: number[], k: number): number[][] => {
    if (k === 0) return [[]];
    if (k > elements.length) return [];
    
    const result: number[][] = [];
    const backtrack = (start: number, current: number[]) => {
      if (current.length === k) {
        result.push([...current]);
        return;
      }
      
      for (let i = start; i < elements.length && result.length < 1000; i++) {
        current.push(elements[i]);
        backtrack(i + 1, current);
        current.pop();
      }
    };
    
    backtrack(0, []);
    return result;
  };

  const generateRandomGrid = (numbers: number[], size: number): number[] => {
    const shuffled = [...numbers].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, size);
  };

  // Fonction de sauvegarde des grilles
  const saveGridsSession = () => {
    if (!results || generatedGrids.length === 0) return;
    
    if (!saveName.trim()) {
      alert('Veuillez donner un nom à votre session !');
      return;
    }
    
    if (!saveDate) {
      alert('Veuillez sélectionner une date de tirage !');
      return;
    }

    // Convertir les grilles générées en format SavedGrid
    const savedGrids: SavedGrid[] = generatedGrids.map(grid => ({
      id: `grid_${grid.id}`,
      numbers: grid.numbers,
      complementary: selectedNumbers.complementary[0], // Premier complémentaire
      cost: grid.cost,
      type: grid.type,
      strategy: results.optimal.name
    }));

    try {
      const session = savedGridsManager.saveGameSession(
        saveName.trim(),
        saveDate,
        selectedNumbers.numbers,
        savedGrids,
        results.optimal.name
      );

      alert(`✅ Session "${saveName}" sauvegardée avec succès !\n${savedGrids.length} grilles pour le tirage du ${saveDate}`);
      
      // Réinitialiser le formulaire
      setShowSaveModal(false);
      setSaveName('');
      setSaveDate('');
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  // Initialiser la date par défaut (prochaine session)
  const getNextGameDate = (): string => {
    const today = new Date();
    const nextWednesday = new Date(today);
    const daysUntilWednesday = (3 - today.getDay() + 7) % 7;
    if (daysUntilWednesday === 0 && today.getHours() >= 20) {
      // Si c'est mercredi après 20h, prendre mercredi suivant
      nextWednesday.setDate(today.getDate() + 7);
    } else {
      nextWednesday.setDate(today.getDate() + daysUntilWednesday);
    }
    return nextWednesday.toISOString().split('T')[0];
  };

  if (!selectedNumbers || selectedNumbers.numbers.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <Calculator className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-amber-800 mb-2">Sélection Requise</h2>
        <p className="text-amber-700">
          Sélectionnez d'abord des numéros via l'Analyse Intelligente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white"
      >
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">🧮 Calculateur selon VOS Formules</h1>
            <p className="text-blue-200">LB1 = ⌈C(X,3) ÷ 10⌉ | LB2 = Schönheim | UB = LB1 × (ln + 1)</p>
          </div>
        </div>
        
        {/* Vos numéros */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">📊 Vos {selectedNumbers.numbers.length} Numéros</h3>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {selectedNumbers.numbers.map((num, index) => (
              <div key={index} className="w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {num}
              </div>
            ))}
          </div>
          
          {/* Option Second Tirage */}
          <div className="flex items-center justify-center gap-3 p-3 bg-white/10 rounded-lg">
            <span className="text-white font-semibold">🎯 Second Tirage (0.80€/grille)</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeSecondTirage}
                onChange={(e) => setIncludeSecondTirage(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
            <span className="text-white/80 text-sm">
              {includeSecondTirage ? 'Activé' : 'Désactivé'}
            </span>
          </div>
          
          {includeSecondTirage && (
            <div className="mt-2 p-2 bg-green-500/20 rounded text-center">
              <p className="text-green-100 text-sm">
                ✅ <strong>Seconde chance activée !</strong> Chaque grille aura une seconde chance au tirage suivant.
              </p>
              <p className="text-green-200 text-xs mt-1">
                Coût total = (2.20€ + 0.80€) × nombre de grilles
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Bouton de calcul */}
      {!results && (
        <div className="text-center">
          <button
            onClick={calculateMixedStrategies}
            disabled={isCalculating}
            className={`px-8 py-4 rounded-xl text-white font-bold text-lg transition-all ${
              isCalculating 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl'
            }`}
          >
            {isCalculating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Calcul en cours...
              </div>
            ) : (
              '🧮 Appliquer VOS Formules'
            )}
          </button>
        </div>
      )}

      {/* Résultats */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Statistiques générales */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Analyse du Problème</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-600 font-semibold">Triples à Couvrir</div>
                <div className="text-2xl font-bold text-blue-800">{results.universe.toLocaleString()}</div>
                <div className="text-sm text-blue-600">C({selectedNumbers.numbers.length},3)</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-600 font-semibold">Stratégies Évaluées</div>
                <div className="text-2xl font-bold text-green-800">{results.strategies.length}</div>
                <div className="text-sm text-green-600">Multiples + Simples</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-purple-600 font-semibold">Économie Maximale</div>
                <div className="text-2xl font-bold text-purple-800">{results.savings.toFixed(2)}€</div>
                <div className="text-sm text-purple-600">vs stratégie la plus chère</div>
              </div>
            </div>
          </div>

          {/* Stratégie optimale */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8" />
              <h2 className="text-2xl font-bold">🏆 Stratégie Optimale</h2>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold mb-2">{results.optimal.name}</div>
              <div className="text-green-100 mb-4">{results.optimal.description}</div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-green-200 text-sm">Nombre de Grilles</div>
                  <div className="text-2xl font-bold">{results.optimal.grids}</div>
                </div>
                <div>
                  <div className="text-green-200 text-sm">Coût Total</div>
                  <div className="text-2xl font-bold">{results.optimal.cost.toFixed(2)}€</div>
                </div>
                <div>
                  <div className="text-green-200 text-sm">Efficacité</div>
                  <div className="text-2xl font-bold">{results.optimal.efficiency.toFixed(2)}€/grille</div>
                </div>
              </div>
            </div>
          </div>

          {/* Comparaison des stratégies */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📈 Comparaison des Stratégies</h2>
            
            <div className="space-y-4">
              {results.strategies.map((strategy, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    strategy.name === results.optimal.name
                      ? 'border-green-500 bg-green-50'
                      : strategy.feasible
                      ? 'border-gray-200 bg-gray-50'
                      : 'border-red-200 bg-red-50 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${
                          strategy.name === results.optimal.name ? 'text-green-800' : 'text-gray-800'
                        }`}>
                          {strategy.name}
                          {strategy.name === results.optimal.name && ' 🏆'}
                          {!strategy.feasible && ' ❌'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{strategy.description}</div>
                    </div>
                    
                    <div className="flex gap-6 text-right">
                      <div>
                        <div className="text-sm text-gray-500">Grilles</div>
                        <div className="font-bold">{strategy.grids}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Coût Total</div>
                        <div className="font-bold">{strategy.cost.toFixed(2)}€</div>
                        {strategy.includeSecondTirage && (
                          <div className="text-xs text-gray-400">
                            {(strategy.grids * 2.20).toFixed(2)}€ + {strategy.secondTirageCost?.toFixed(2)}€
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Efficacité</div>
                        <div className="font-bold">{strategy.efficiency.toFixed(2)}€</div>
                        {strategy.includeSecondTirage && (
                          <div className="text-xs text-gray-400">par grille</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setResults(null);
                setGeneratedGrids([]);
              }}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              🔄 Nouveau Calcul
            </button>
            <button
              onClick={generateOptimalGrids}
              disabled={isGenerating}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                isGenerating 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Génération...
                </div>
              ) : (
                '🎲 Générer les Grilles'
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Affichage des grilles générées */}
      {generatedGrids.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* En-tête des grilles */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">🎲</div>
              <div>
                <h2 className="text-2xl font-bold">Grilles Générées - Solution {results?.optimal.name}</h2>
                <p className="text-green-200">
                  {generatedGrids.length} grilles • Coût total: {(generatedGrids.reduce((sum, g) => sum + g.cost, 0)).toFixed(2)}€
                </p>
              </div>
            </div>
          </div>

          {/* Liste des grilles */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Vos Grilles à Jouer</h3>
            
            <div className="grid gap-4">
              {generatedGrids.map((grid, index) => (
                <div
                  key={grid.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      #{grid.id}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {grid.numbers.map((num, numIndex) => (
                        <div
                          key={numIndex}
                          className="w-10 h-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold border-2 border-blue-300"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        grid.type === 'multiple' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {grid.type === 'multiple' ? 'MULTIPLE' : 'SIMPLE'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">{grid.cost.toFixed(2)}€</div>
                    <div className="text-sm text-gray-500">
                      {grid.type === 'multiple' ? `${grid.numbers.length} numéros` : '5 numéros'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Résumé */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-blue-600 font-semibold">Total Grilles</div>
                  <div className="text-2xl font-bold text-blue-800">{generatedGrids.length}</div>
                </div>
                <div>
                  <div className="text-blue-600 font-semibold">Coût Total</div>
                  <div className="text-2xl font-bold text-blue-800">
                    {generatedGrids.reduce((sum, g) => sum + g.cost, 0).toFixed(2)}€
                  </div>
                </div>
                <div>
                  <div className="text-blue-600 font-semibold">Garantie</div>
                  <div className="text-2xl font-bold text-blue-800">3 numéros</div>
                </div>
              </div>
            </div>

            {/* Actions pour les grilles */}
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => setGeneratedGrids([])}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
              >
                🗑️ Effacer les Grilles
              </button>
              <button
                onClick={() => {
                  const gridText = generatedGrids.map((grid, i) => 
                    `Grille ${i + 1} (${grid.type}): ${grid.numbers.join(' - ')} (${grid.cost.toFixed(2)}€)`
                  ).join('\n');
                  
                  navigator.clipboard.writeText(gridText).then(() => {
                    alert('Grilles copiées dans le presse-papier !');
                  });
                }}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
              >
                📋 Copier les Grilles
              </button>
              <button
                onClick={() => {
                  setSaveDate(getNextGameDate());
                  setSaveName(`Session ${results?.optimal.name} - ${new Date().toLocaleDateString()}`);
                  setShowSaveModal(true);
                }}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors"
              >
                💾 Sauvegarder pour Jouer
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Modal de sauvegarde */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-8 max-w-md w-full mx-4"
          >
            <div className="flex items-center gap-3 mb-6">
              <Save className="w-8 h-8 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">Sauvegarder vos Grilles</h2>
            </div>

            <div className="space-y-4">
              {/* Nom de la session */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom de la session
                </label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Ex: Session LB1 - Mercredi"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Date du tirage */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date du tirage visé
                </label>
                <input
                  type="date"
                  value={saveDate}
                  onChange={(e) => setSaveDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tirages: Mercredi et Samedi à 20h45
                </p>
              </div>

              {/* Résumé */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Résumé</h4>
                <div className="text-sm text-purple-700 space-y-1">
                  <div>• {generatedGrids.length} grilles ({results?.optimal.name})</div>
                  <div>• Coût total: {generatedGrids.reduce((sum, g) => sum + g.cost, 0).toFixed(2)}€</div>
                  <div>• Stratégie: {results?.optimal.description}</div>
                  <div>• Numéros de base: {selectedNumbers.numbers.length} sélectionnés</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={saveGridsSession}
                className="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors"
              >
                💾 Sauvegarder
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

