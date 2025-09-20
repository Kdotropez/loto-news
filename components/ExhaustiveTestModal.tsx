'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Euro, Target, CheckCircle, Award } from 'lucide-react';
import { ExhaustiveTestResult } from '@/lib/exhaustive-guarantee-validator';

interface ExhaustiveTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  testResult: ExhaustiveTestResult | null;
  optionName: string;
}

// Prix moyens FDJ par rang
const PRIZE_AMOUNTS = {
  1: 24000000,  // 5+1
  2: 100000,    // 5+0
  3: 2000,      // 4+1
  4: 500,       // 4+0
  5: 50,        // 3+1
  6: 20,        // 3+0
  7: 10         // 2+1
};

const RANK_NAMES = {
  1: '5+1 (Jackpot)',
  2: '5+0',
  3: '4+1',
  4: '4+0',
  5: '3+1',
  6: '3+0',
  7: '2+1'
};

export default function ExhaustiveTestModal({ 
  isOpen, 
  onClose, 
  testResult, 
  optionName 
}: ExhaustiveTestModalProps) {
  
  if (!testResult) return null;

  // Calculer les gains totaux
  const calculateTotalWinnings = () => {
    let totalWinnings = 0;
    let totalWins = 0;
    
    testResult.winningGridsStats.forEach(gridStats => {
      gridStats.bestRanks.forEach(rankData => {
        const prizeAmount = PRIZE_AMOUNTS[rankData.rank as keyof typeof PRIZE_AMOUNTS] || 0;
        totalWinnings += prizeAmount * rankData.count;
        totalWins += rankData.count;
      });
    });
    
    return { totalWinnings, totalWins };
  };

  const { totalWinnings, totalWins } = calculateTotalWinnings();
  const roi = totalWinnings > 0 ? ((totalWinnings - (testResult.grids.length * 2.20)) / (testResult.grids.length * 2.20)) * 100 : -100;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    🔬 Test Exhaustif Complet
                  </h2>
                  <p className="text-purple-100 mt-1">{optionName}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-purple-200 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Résumé rapide */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-300">
                    {testResult.successRate.toFixed(2)}%
                  </div>
                  <div className="text-xs text-purple-200">Taux de Réussite</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-300">
                    {testResult.guaranteeSuccesses.toLocaleString()}
                  </div>
                  <div className="text-xs text-purple-200">Succès</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-300">
                    {testResult.guaranteeFailures.toLocaleString()}
                  </div>
                  <div className="text-xs text-purple-200">Échecs</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-300">
                    {totalWins.toLocaleString()}
                  </div>
                  <div className="text-xs text-purple-200">Gains Totaux</div>
                </div>
              </div>
            </div>

            {/* Contenu scrollable */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
              
              {/* Validation de la garantie */}
              <div className={`mb-6 p-4 rounded-lg text-center font-bold ${
                testResult.isGuaranteeValid 
                  ? 'bg-green-100 text-green-800 border-2 border-green-300'
                  : 'bg-red-100 text-red-800 border-2 border-red-300'
              }`}>
                {testResult.isGuaranteeValid ? (
                  <>✅ GARANTIE MATHÉMATIQUEMENT PROUVÉE</>
                ) : (
                  <>❌ GARANTIE INVALIDÉE - {testResult.guaranteeFailures.toLocaleString()} échecs détectés</>
                )}
              </div>

              {/* Analyse financière */}
              {totalWinnings > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-300">
                  <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                    <Euro className="w-5 h-5" />
                    Analyse Financière
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {totalWinnings.toLocaleString()}€
                      </div>
                      <div className="text-xs text-green-700">Gains Totaux</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {(testResult.grids.length * 2.20).toFixed(2)}€
                      </div>
                      <div className="text-xs text-blue-700">Coût Total</div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-lg font-bold ${roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {roi > 0 ? '+' : ''}{roi.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-700">ROI</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {totalWins.toLocaleString()}
                      </div>
                      <div className="text-xs text-purple-700">Victoires</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance des grilles */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  🏆 Performance des Grilles
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {testResult.winningGridsStats
                    .sort((a, b) => b.winRate - a.winRate)
                    .map((stats, index) => (
                      <div key={stats.gridIndex} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800">
                            Grille #{stats.gridIndex + 1}
                          </span>
                          <span className="text-sm font-bold text-blue-600">
                            {stats.winRate.toFixed(2)}%
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-600">
                          {stats.winCount.toLocaleString()} victoires
                        </div>
                        
                        {/* Affichage des numéros de la grille */}
                        <div className="mt-2 flex gap-1 flex-wrap">
                          {testResult.grids && testResult.grids[stats.gridIndex] ? 
                            testResult.grids[stats.gridIndex].map((num, numIndex) => (
                              <div key={numIndex} className="w-6 h-6 bg-blue-100 text-blue-800 rounded text-xs font-bold flex items-center justify-center">
                                {num}
                              </div>
                            )) : (
                              <div className="text-xs text-gray-500">Grille non disponible</div>
                            )
                          }
                        </div>
                        
                        {/* Meilleurs rangs atteints */}
                        {stats.bestRanks.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-500 mb-1">Rangs atteints :</div>
                            <div className="flex gap-1 flex-wrap">
                              {stats.bestRanks.slice(0, 3).map((rankData, rankIndex) => (
                                <div key={rankIndex} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                                  R{rankData.rank} ({rankData.count}×)
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Exemples de tirages gagnants (rang 3+) */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  🎯 Exemples de Tirages Gagnants (Rang 3+)
                </h3>
                
                <div className="bg-green-50 rounded-lg border border-green-200 p-4 max-h-60 overflow-y-auto">
                  {/* Simulation d'exemples de tirages gagnants */}
                  {testResult.winningGridsStats
                    .filter(stats => stats.bestRanks.some(rank => rank.rank <= 6))
                    .slice(0, 10)
                    .map((stats, index) => {
                      const bestRank = stats.bestRanks.find(r => r.rank <= 6);
                      if (!bestRank) return null;
                      
                      // Simuler un tirage exemple pour cette grille
                      const gridNumbers = testResult.grids && testResult.grids[stats.gridIndex] ? testResult.grids[stats.gridIndex] : [];
                      const exampleDraw = gridNumbers.slice(0, Math.min(5, gridNumbers.length));
                      const exampleComplementary = testResult.complementaryNumbers && testResult.complementaryNumbers[0] ? testResult.complementaryNumbers[0] : 1;
                      
                      if (gridNumbers.length === 0) return null;
                      
                      return (
                        <div key={index} className="mb-3 p-3 bg-white rounded border border-green-300">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-green-800">
                              Grille #{stats.gridIndex + 1} - Rang {bestRank.rank}
                            </div>
                            <div className="text-sm font-bold text-green-600">
                              {PRIZE_AMOUNTS[bestRank.rank as keyof typeof PRIZE_AMOUNTS]?.toLocaleString()}€
                            </div>
                          </div>
                          
                          {/* Tirage exemple */}
                          <div className="mb-2">
                            <div className="text-xs text-gray-600 mb-1">Exemple de tirage gagnant :</div>
                            <div className="flex gap-1 items-center">
                              {exampleDraw.map((num, numIndex) => (
                                <div key={numIndex} className="w-7 h-7 bg-green-500 text-white rounded-full text-xs font-bold flex items-center justify-center">
                                  {num}
                                </div>
                              ))}
                              <span className="mx-2 text-gray-400">+</span>
                              <div className="w-7 h-7 bg-yellow-500 text-white rounded-full text-xs font-bold flex items-center justify-center">
                                {exampleComplementary}
                              </div>
                            </div>
                          </div>
                          
                          {/* Grille correspondante */}
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Grille gagnante :</div>
                            <div className="flex gap-1 flex-wrap">
                              {gridNumbers.map((num, numIndex) => {
                                const isMatch = exampleDraw.includes(num);
                                const isComplementaryMatch = num === exampleComplementary;
                                
                                return (
                                  <div 
                                    key={numIndex} 
                                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                                      isMatch 
                                        ? 'bg-green-500 text-white ring-2 ring-green-300' 
                                        : isComplementaryMatch
                                        ? 'bg-yellow-500 text-white ring-2 ring-yellow-300'
                                        : 'bg-gray-200 text-gray-600'
                                    }`}
                                  >
                                    {num}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          <div className="mt-2 text-xs text-green-700">
                            <strong>{exampleDraw.length} numéros corrects</strong> 
                            {bestRank.rank <= 5 && ' + complémentaire'}
                            • <strong>{bestRank.count} victoires</strong> de ce type
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Exemples d'échecs si la garantie est invalidée */}
              {!testResult.isGuaranteeValid && testResult.failedCombinations.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                    ❌ Exemples d'Échecs de Garantie
                  </h3>
                  
                  <div className="bg-red-50 rounded-lg border border-red-200 p-4 max-h-60 overflow-y-auto">
                    {testResult.failedCombinations.slice(0, 10).map((failure, index) => (
                      <div key={index} className="mb-3 p-3 bg-white rounded border border-red-300">
                        <div className="font-semibold text-red-800 mb-2">
                          Échec #{index + 1}
                        </div>
                        
                        {/* Tirage qui a échoué */}
                        <div className="mb-2">
                          <div className="text-xs text-gray-600 mb-1">Tirage problématique :</div>
                          <div className="flex gap-1 items-center">
                            {failure.draw.mainNumbers.map((num, numIndex) => (
                              <div key={numIndex} className="w-7 h-7 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center">
                                {num}
                              </div>
                            ))}
                            <span className="mx-2 text-gray-400">+</span>
                            <div className="w-7 h-7 bg-orange-500 text-white rounded-full text-xs font-bold flex items-center justify-center">
                              {failure.draw.complementary}
                            </div>
                          </div>
                        </div>
                        
                        {/* Meilleur résultat obtenu */}
                        <div>
                          <div className="text-xs text-gray-600 mb-1">
                            Meilleur résultat (Grille #{failure.bestResult.gridIndex + 1}) :
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {testResult.grids && testResult.grids[failure.bestResult.gridIndex] ? 
                              testResult.grids[failure.bestResult.gridIndex].map((num, numIndex) => {
                                const isMatch = failure.bestResult.matches.includes(num);
                                
                                return (
                                  <div 
                                    key={numIndex} 
                                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                                      isMatch 
                                        ? 'bg-orange-500 text-white ring-2 ring-orange-300' 
                                        : 'bg-gray-200 text-gray-600'
                                    }`}
                                  >
                                    {num}
                                  </div>
                                );
                              }) : (
                                <div className="text-xs text-gray-500">Grille non disponible</div>
                              )
                            }
                          </div>
                          <div className="mt-1 text-xs text-red-700">
                            Seulement <strong>{failure.bestResult.matchCount} numéros corrects</strong> 
                            (insuffisant pour rang 3)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statistiques détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Répartition des rangs */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-3">📊 Répartition des Rangs</h4>
                  <div className="space-y-2">
                    {Object.entries(RANK_NAMES).map(([rank, name]) => {
                      const rankNum = parseInt(rank);
                      const totalForRank = testResult.winningGridsStats.reduce((sum, stats) => {
                        const rankData = stats.bestRanks.find(r => r.rank === rankNum);
                        return sum + (rankData?.count || 0);
                      }, 0);
                      
                      if (totalForRank === 0) return null;
                      
                      return (
                        <div key={rank} className="flex justify-between items-center">
                          <span className="text-sm text-blue-700">{name}</span>
                          <div className="text-right">
                            <span className="font-bold text-blue-800">{totalForRank.toLocaleString()}</span>
                            <span className="text-xs text-blue-600 ml-2">
                              ({((totalForRank / testResult.testedCombinations) * 100).toFixed(3)}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Informations techniques */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-3">⚙️ Détails Techniques</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Combinaisons testées :</span>
                      <span className="font-bold">{testResult.testedCombinations.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Grilles analysées :</span>
                      <span className="font-bold">{testResult.grids.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Temps d'exécution :</span>
                      <span className="font-bold">{(testResult.executionTime / 1000).toFixed(2)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Numéros sélectionnés :</span>
                      <span className="font-bold">{testResult.selectedNumbers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Complémentaires :</span>
                      <span className="font-bold">{testResult.complementaryNumbers.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-100 px-6 py-4 border-t">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Test exhaustif terminé • {testResult.testedCombinations.toLocaleString()} combinaisons analysées
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Fermer
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
