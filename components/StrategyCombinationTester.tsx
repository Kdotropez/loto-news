'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain,
  TrendingUp,
  Target,
  Zap,
  BarChart3,
  Activity,
  Clock,
  Calculator,
  XCircle,
  CheckCircle,
  TestTube,
  Loader2,
  Star,
  Layers,
  Settings,
  Hash,
  Play,
  Trophy,
  Award,
  TrendingDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StrategyCombinationEngine, StrategyCombination } from '../lib/strategy-combination-engine';
import StrategyManager from './StrategyManager';
import { OptimizationStrategy } from '../types/optimization';

interface TestResult {
  totalGains: number;
  wins: number;
  totalTests: number;
  winRate: number;
  roi: number;
  averageGain: number;
  categories: Record<string, number>;
}

export default function StrategyCombinationTester() {
  const [engine, setEngine] = useState<StrategyCombinationEngine | null>(null);
  const [allCombinations, setAllCombinations] = useState<StrategyCombination[]>([]);
  const [testedCombinations, setTestedCombinations] = useState<StrategyCombination[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingCombination, setTestingCombination] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [showOnlyTested, setShowOnlyTested] = useState(false);
  const [sortBy, setSortBy] = useState<'roi' | 'gains' | 'winRate' | 'name'>('roi');
  const [filterStrategies, setFilterStrategies] = useState<string[]>([]);
  const [testProgress, setTestProgress] = useState<{ current: number; total: number } | null>(null);
  const [availableStrategies, setAvailableStrategies] = useState<OptimizationStrategy[]>([]);
  const [showStrategyManager, setShowStrategyManager] = useState(false);

  useEffect(() => {
    if (availableStrategies.length > 0) {
      const newEngine = new StrategyCombinationEngine(availableStrategies);
      const combinations = newEngine.generateAllStrategyCombinations();
      
      setEngine(newEngine);
      setAllCombinations(combinations);
      
      // Affiche le nombre total de combinaisons
      console.log(`🧪 ${combinations.length} combinaisons de stratégies générées !`);
    }
  }, [availableStrategies]);

  const testCombination = async (combination: StrategyCombination) => {
    if (!engine) return;

    setTestingCombination(combination.id);
    
    try {
      toast.loading(`Test de ${combination.name}...`, { id: combination.id });

      const response = await fetch('/api/fast-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test-single',
          combination: combination.combination.mainNumbers,
          complementary: combination.combination.complementaryNumber,
          maxTirages: 7508
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors du test');
      }

      const result = await response.json();
      
      if (result.success) {
        const testResult: TestResult = {
          totalGains: result.result.totalGains || 0,
          wins: result.result.wins || 0,
          totalTests: result.result.totalTests || 0,
          winRate: result.result.winRate || 0,
          roi: result.result.roi || 0,
          averageGain: result.result.averageGain || 0,
          categories: result.result.categories || {}
        };

        setTestResults(prev => ({
          ...prev,
          [combination.id]: testResult
        }));

        // Sauvegarde dans le moteur
        engine.saveTestResults(combination.id, testResult);
        
        // TODO: Sauvegarder dans le gestionnaire de résultats
        
        // Met à jour la liste des combinaisons testées
        setTestedCombinations(engine.getTestedCombinations());

        toast.success(`Test terminé: ${combination.name} - ROI: ${testResult.roi.toFixed(1)}%`, { 
          id: combination.id,
          duration: 4000
        });
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur lors du test:', error);
      toast.error(`Erreur lors du test de ${combination.name}`, { id: combination.id });
    } finally {
      setTestingCombination(null);
    }
  };

  const testAllCombinations = async () => {
    if (!engine) return;

    setLoading(true);
    const combinationsToTest = showOnlyTested ? testedCombinations : allCombinations;
    const untestedCombinations = combinationsToTest.filter(c => !testResults[c.id]);
    
    setTestProgress({ current: 0, total: untestedCombinations.length });
    
    for (let i = 0; i < untestedCombinations.length; i++) {
      const combination = untestedCombinations[i];
      setTestProgress({ current: i + 1, total: untestedCombinations.length });
      
      await testCombination(combination);
      // Pause entre les tests pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setLoading(false);
    setTestProgress(null);
    toast.success(`Tous les tests sont terminés ! ${untestedCombinations.length} combinaisons testées.`);
  };

  // Fonction pour estimer le ROI basé sur les stratégies
  const estimateROI = (combination: StrategyCombination): number => {
    if (testResults[combination.id]) {
      return testResults[combination.id].roi;
    }

    // Estimation basée sur les stratégies utilisées
    const strategyScores: Record<string, number> = {
      'hot-cold-hybrid': 15,
      'correlations': 12,
      'anti-correlations': 8,
      'temporal-patterns': 10,
      'mathematical-patterns': 14,
      'volatility-optimized': 11,
      'astrological': 5,
      'numerology': 6,
      'geometric': 9,
      'chaos-theory': 4,
      'quantum': 3,
      'neural-network': 13,
      'fibonacci': 7,
      'golden-ratio': 8,
      'prime-numbers': 6
    };

    const baseScore = combination.strategies.reduce((sum, strategy) => {
      return sum + (strategyScores[strategy.id] || 5);
    }, 0);

    // Bonus pour les combinaisons multiples (synergie)
    const synergyBonus = combination.strategies.length > 1 ? 
      (combination.strategies.length - 1) * 2 : 0;

    // Calcul du ROI estimé
    const estimatedROI = (baseScore + synergyBonus) - 50; // -50% comme base

    return Math.max(-95, Math.min(estimatedROI, 200)); // Limite entre -95% et 200%
  };

  const getFilteredCombinations = (): StrategyCombination[] => {
    let filtered = showOnlyTested ? testedCombinations : allCombinations;

    // Filtre par stratégies
    if (filterStrategies.length > 0) {
      filtered = filtered.filter(combo => 
        combo.strategies.some(strategy => filterStrategies.includes(strategy.id))
      );
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'roi':
          const aROI = estimateROI(a);
          const bROI = estimateROI(b);
          return bROI - aROI;
        case 'gains':
          const aGains = testResults[a.id]?.totalGains || 0;
          const bGains = testResults[b.id]?.totalGains || 0;
          return bGains - aGains;
        case 'winRate':
          const aWinRate = testResults[a.id]?.winRate || 0;
          const bWinRate = testResults[b.id]?.winRate || 0;
          return bWinRate - aWinRate;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getGlobalStats = () => {
    if (!engine) return null;
    return engine.getGlobalStats();
  };

  const getBestCombinations = () => {
    if (!engine) return [];
    
    // Combine les combinaisons testées avec les estimations
    const allWithROI = allCombinations.map(combo => ({
      ...combo,
      estimatedROI: estimateROI(combo),
      isTested: !!testResults[combo.id]
    }));
    
    // Trie par ROI (réel ou estimé) et prend les 5 meilleures
    return allWithROI
      .sort((a, b) => {
        const aROI = a.isTested ? testResults[a.id].roi : a.estimatedROI;
        const bROI = b.isTested ? testResults[b.id].roi : b.estimatedROI;
        return bROI - aROI;
      })
      .slice(0, 5);
  };

  const globalStats = getGlobalStats();
  const bestCombinations = getBestCombinations();
  const filteredCombinations = getFilteredCombinations();

  if (showStrategyManager) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">⚙️ Gestionnaire de Stratégies</h1>
          <button
            onClick={() => setShowStrategyManager(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour aux Tests
          </button>
        </div>
        <StrategyManager onStrategiesChange={setAvailableStrategies} />
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
        <h1 className="text-3xl font-bold mb-2">🧪 Testeur de Combinaisons de Stratégies</h1>
        <p className="text-purple-100">
          Testez toutes les associations possibles de stratégies d'optimisation et découvrez les meilleures combinaisons !
        </p>
        <div className="mt-3 p-3 bg-white bg-opacity-20 rounded-lg">
          <p className="text-sm text-purple-100">
            <strong>🎯 Contrainte Optimale :</strong> Toutes les combinaisons respectent la distribution pair/impair optimale 
            <strong> 3P-2I (33.1%)</strong> ou <strong>2P-3I (32.5%)</strong> basée sur l'analyse de 7,508 tirages historiques.
          </p>
        </div>
          </div>
          <button
            onClick={() => setShowStrategyManager(true)}
            className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 flex items-center"
          >
            <Settings className="w-4 h-4 mr-2" />
            Gérer les Stratégies
          </button>
        </div>
      </motion.div>

      {/* Message si aucune stratégie */}
      {availableStrategies.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center"
        >
          <div className="text-yellow-600 text-4xl mb-4">⚙️</div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Aucune stratégie configurée
          </h3>
          <p className="text-yellow-700 mb-4">
            Vous devez d'abord configurer les stratégies d'optimisation pour générer des combinaisons.
          </p>
          <button
            onClick={() => setShowStrategyManager(true)}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center mx-auto"
          >
            <Settings className="w-5 h-5 mr-2" />
            Configurer les Stratégies
          </button>
        </motion.div>
      )}

      {/* Statistiques globales */}
      {globalStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BarChart3 className="mr-2 text-blue-600" />
            Statistiques Globales
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{globalStats.totalCombinations}</div>
              <div className="text-sm text-gray-600">Combinaisons totales</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{globalStats.testedCombinations}</div>
              <div className="text-sm text-gray-600">Testées</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{globalStats.averageROI.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">ROI moyen testé</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{globalStats.totalGains.toLocaleString()}€</div>
              <div className="text-sm text-gray-600">Gains totaux</div>
            </div>
            <div className="text-center p-4 bg-cyan-50 rounded-lg">
              <div className="text-2xl font-bold text-cyan-600">
                {allCombinations.length > 0 ? 
                  (allCombinations.reduce((sum, combo) => sum + estimateROI(combo), 0) / allCombinations.length).toFixed(1) : 
                  '0'
                }%
              </div>
              <div className="text-sm text-gray-600">ROI moyen estimé</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Meilleures combinaisons */}
      {bestCombinations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Trophy className="mr-2 text-yellow-600" />
            🏆 Top 5 des Meilleures Combinaisons
          </h2>
          
          <div className="space-y-3">
            {bestCombinations.map((combo, index) => (
              <div key={combo.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{combo.name}</div>
                    <div className="text-sm text-gray-600">{combo.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {combo.strategies.map(s => s.name).join(' + ')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {combo.isTested ? (
                    // ROI réel après test
                    <>
                      <div className="text-lg font-bold text-green-600">
                        {combo.testResults?.roi.toFixed(1)}% ROI
                      </div>
                      <div className="text-sm text-gray-600">
                        {combo.testResults?.totalGains.toLocaleString()}€
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        ✓ Testé
                      </div>
                    </>
                  ) : (
                    // ROI estimé
                    <>
                      <div className="text-lg font-bold text-blue-600">
                        {combo.estimatedROI.toFixed(1)}% ROI
                      </div>
                      <div className="text-sm text-gray-500">
                        Estimé
                      </div>
                      <div className="text-xs text-orange-600 font-medium">
                        ⚡ Prédiction
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Contrôles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <h2 className="text-xl font-semibold mb-4">🎛️ Contrôles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Affichage</label>
            <select
              value={showOnlyTested ? 'tested' : 'all'}
              onChange={(e) => setShowOnlyTested(e.target.value === 'tested')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les combinaisons</option>
              <option value="tested">Seulement testées</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tri par</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="roi">ROI</option>
              <option value="gains">Gains totaux</option>
              <option value="winRate">Taux de gain</option>
              <option value="name">Nom</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={testAllCombinations}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Tester Tout
            </button>
          </div>
          
          {/* Barre de progression */}
          {testProgress && (
            <div className="col-span-full">
              <div className="bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(testProgress.current / testProgress.total) * 100}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600 text-center">
                Test {testProgress.current} sur {testProgress.total} combinaisons
                ({((testProgress.current / testProgress.total) * 100).toFixed(1)}%)
              </div>
            </div>
          )}
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setTestResults({});
                setTestedCombinations([]);
                if (engine) {
                  setEngine(new StrategyCombinationEngine(availableStrategies));
                }
              }}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              <XCircle className="w-4 h-4 mr-2 inline" />
              Reset
            </button>
          </div>
        </div>
      </motion.div>

      {/* Liste des combinaisons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            📋 Combinaisons de Stratégies ({filteredCombinations.length})
          </h2>
          
          {/* Résumé par nombre de stratégies */}
          <div className="flex gap-2 text-sm">
            {[1, 2, 3, 4, 5].map(count => {
              const countForStrategies = allCombinations.filter(c => c.strategies.length === count).length;
              return (
                <span key={count} className="px-2 py-1 bg-gray-100 rounded text-gray-600">
                  {count} stratégie{count > 1 ? 's' : ''}: {countForStrategies}
                </span>
              );
            })}
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredCombinations.map((combination) => {
            const result = testResults[combination.id];
            const isTesting = testingCombination === combination.id;
            
            return (
              <div key={combination.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">{combination.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{combination.description}</p>
                    
                    {/* Stratégies utilisées */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {combination.strategies.map((strategy) => {
                        const Icon = strategy.icon;
                        return (
                          <span
                            key={strategy.id}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${strategy.color}-100 text-${strategy.color}-800`}
                          >
                            <Icon className="w-3 h-3 mr-1" />
                            {strategy.name}
                          </span>
                        );
                      })}
                    </div>
                    
                    {/* Combinaison de numéros */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Combinaison:</span>
                      <div className="flex gap-1">
                        {combination.combination.mainNumbers.map((num, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                            {num}
                          </span>
                        ))}
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                          {combination.combination.complementaryNumber}
                        </span>
                      </div>
                      <div className="ml-2">
                        {(() => {
                          const evenCount = combination.combination.mainNumbers.filter(n => n % 2 === 0).length;
                          const oddCount = combination.combination.mainNumbers.filter(n => n % 2 === 1).length;
                          const isOptimal = (evenCount === 3 && oddCount === 2) || (evenCount === 2 && oddCount === 3);
                          return (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isOptimal 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {evenCount}P-{oddCount}I {isOptimal ? '✅' : '❌'}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* ROI - toujours affiché */}
                    <div className="text-right">
                      {result ? (
                        // ROI réel après test
                        <>
                          <div className={`text-lg font-bold ${result.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {result.roi.toFixed(1)}% ROI
                          </div>
                          <div className="text-sm text-gray-600">
                            {result.totalGains.toLocaleString()}€
                          </div>
                          <div className="text-xs text-green-600 font-medium">
                            ✓ Testé
                          </div>
                        </>
                      ) : (
                        // ROI estimé avant test
                        <>
                          <div className={`text-lg font-bold ${estimateROI(combination) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                            {estimateROI(combination).toFixed(1)}% ROI
                          </div>
                          <div className="text-sm text-gray-500">
                            Estimé
                          </div>
                          <div className="text-xs text-orange-600 font-medium">
                            ⚡ Prédiction
                          </div>
                        </>
                      )}
                    </div>
                    
                    <button
                      onClick={() => testCombination(combination)}
                      disabled={isTesting}
                      className={`px-4 py-2 rounded-lg text-white flex items-center ${
                        result 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      } disabled:opacity-50`}
                    >
                      {isTesting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : result ? (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      ) : (
                        <TestTube className="w-4 h-4 mr-2" />
                      )}
                      {isTesting ? 'Test...' : result ? 'Retester' : 'Tester'}
                    </button>
                  </div>
                </div>
                
                {/* Résultats détaillés */}
                {result && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-3">📊 Résultats Détaillés</h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{result.totalGains.toLocaleString()}€</div>
                        <div className="text-xs text-gray-600">Gains totaux</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{result.winRate.toFixed(1)}%</div>
                        <div className="text-xs text-gray-600">Taux de gain</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{result.wins}</div>
                        <div className="text-xs text-gray-600">Gains obtenus</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">{result.averageGain.toFixed(2)}€</div>
                        <div className="text-xs text-gray-600">Gain moyen</div>
                      </div>
                    </div>
                    
                    {/* Catégories de gains */}
                    {Object.keys(result.categories).length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium text-gray-700 mb-2">Répartition des gains:</div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(result.categories).map(([category, count]) => (
                            <span key={category} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {category}: {count} fois
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
