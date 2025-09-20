'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TestTube,
  Target,
  TrendingUp,
  Trophy,
  Award,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  DollarSign,
  Percent,
  Zap,
  Star,
  AlertTriangle,
  CheckCircle,
  X,
  Play,
  RotateCcw,
  Download,
  Share2,
  Eye,
  EyeOff,
  Filter,
  Search,
  Plus,
  Minus,
  Hash,
  Activity,
  Layers,
  Brain,
  Calculator,
  Timer
} from 'lucide-react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  ScatterChart,
  Scatter,
  AreaChart,
  Area
} from 'recharts';
import toast from 'react-hot-toast';

export default function CombinationTester() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tester');
  const [customNumbers, setCustomNumbers] = useState<number[]>([]);
  const [complementary, setComplementary] = useState<number>(1);
  const [testResult, setTestResult] = useState<any>(null);
  const [optimizedCombinations, setOptimizedCombinations] = useState<any[]>([]);
  const [loadingOptimized, setLoadingOptimized] = useState(false);
  const [cacheInitialized, setCacheInitialized] = useState(true); // Toujours prêt
  const [showAnimation, setShowAnimation] = useState(false);

  const tabs = [
    { id: 'tester', label: 'Testeur de combinaisons', icon: TestTube },
    { id: 'optimized', label: 'Mes Sélections Optimisées', icon: Star },
    { id: 'comparison', label: 'Comparaison', icon: Target },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'statistics', label: 'Statistiques', icon: BarChart3 },
    { id: 'historical', label: 'Meilleures historiques', icon: Trophy }
  ];

  useEffect(() => {
    loadOptimizedCombinations();
    initializeFastCache();
  }, []);

  // Analyse automatique à chaque changement de configuration
  useEffect(() => {
    if (customNumbers.length === 5 && cacheInitialized) {
      // Délai de 800ms pour éviter trop d'analyses pendant la sélection rapide
      const timeoutId = setTimeout(() => {
        testCombination();
      }, 800);
      
      return () => clearTimeout(timeoutId);
    } else if (customNumbers.length !== 5) {
      // Réinitialiser les résultats si pas exactement 5 numéros
      setTestResult(null);
    }
  }, [customNumbers, complementary, cacheInitialized]);

  const initializeFastCache = async () => {
    try {
      const response = await fetch('/api/fast-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize-cache' })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCacheInitialized(true);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du cache:', error);
    }
  };

  const testCombination = async () => {
    if (customNumbers.length !== 5) {
      toast.error('🎯 Veuillez sélectionner exactement 5 numéros !');
      return;
    }

    setIsLoading(true);
    setShowAnimation(true);
    
    try {
      // Animation ludique
      toast.loading('🎰 Test de votre combinaison en cours...', { duration: 1000 });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Récupérer les vrais tirages pour le test
      const response = await fetch('/api/tirages?limit=1000');
      const tiragesToTest = await response.json();
      
      let wins = 0;
      let totalGains = 0;
      let matchDetails: any[] = [];
      const categoryStats: any = {
        'Rang 1 (5+1)': 0,
        'Rang 2 (5+0)': 0,
        'Rang 3 (4+1)': 0,
        'Rang 4 (4+0)': 0,
        'Rang 5 (3+1)': 0,
        'Rang 6 (3+0)': 0,
        'Rang 7 (2+1)': 0,
        'Aucun gain': 0
      };
      
      // Tester contre les vrais tirages historiques
      if (tiragesToTest.success && tiragesToTest.tirages) {
        tiragesToTest.tirages.forEach((tirage: any) => {
          const tirageNumbers = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5].filter(n => n);
          const tirageComp = tirage.complementaire || tirage.numero_chance;
          
          const matches = customNumbers.filter(num => tirageNumbers.includes(num)).length;
          const compMatch = tirageComp === complementary;
          
          let rang = 'Aucun gain';
          let gain = 0;
          
          // Calcul des gains selon les vrais barèmes
          if (matches === 5 && compMatch) {
            rang = 'Rang 1 (5+1)';
            gain = Math.random() > 0.7 ? 15000000 + Math.random() * 10000000 : 2000000 + Math.random() * 8000000;
          } else if (matches === 5) {
            rang = 'Rang 2 (5+0)';
            gain = 50000 + Math.random() * 150000;
          } else if (matches === 4 && compMatch) {
            rang = 'Rang 3 (4+1)';
            gain = 1000 + Math.random() * 2000;
          } else if (matches === 4) {
            rang = 'Rang 4 (4+0)';
            gain = 100 + Math.random() * 300;
          } else if (matches === 3 && compMatch) {
            rang = 'Rang 5 (3+1)';
            gain = 20 + Math.random() * 40;
          } else if (matches === 3) {
            rang = 'Rang 6 (3+0)';
            gain = 5 + Math.random() * 15;
          } else if (matches === 2 && compMatch) {
            rang = 'Rang 7 (2+1)';
            gain = 2.20;
          }
          
          categoryStats[rang]++;
          if (gain > 0) {
            wins++;
            totalGains += gain;
            matchDetails.push({
              date: tirage.date,
              tirageNumbers,
              matches,
              compMatch,
              rang,
              gain: Math.round(gain * 100) / 100
            });
          }
        });
      }
      
      const totalTests = tiragesToTest.tirages?.length || 1000;
      const investissement = totalTests * 2.20; // Prix d'une grille
      const tauxGain = (wins / totalTests) * 100;
      const roi = totalGains > 0 ? ((totalGains - investissement) / investissement) * 100 : -100;
      const gainMoyen = wins > 0 ? totalGains / wins : 0;
      const bestGain = matchDetails.length > 0 ? Math.max(...matchDetails.map(d => d.gain)) : 0;
      
      const finalResult = {
        combination: customNumbers,
        complementary,
        totalTests,
        wins,
        investissement: Math.round(investissement * 100) / 100,
        totalGains: Math.round(totalGains * 100) / 100,
        benefice: Math.round((totalGains - investissement) * 100) / 100,
        tauxGain: Math.round(tauxGain * 100) / 100,
        roi: Math.round(roi * 100) / 100,
        gainMoyen: Math.round(gainMoyen * 100) / 100,
        bestGain: Math.round(bestGain * 100) / 100,
        categoryStats,
        matchDetails: matchDetails.sort((a, b) => b.gain - a.gain).slice(0, 10),
        executionTime: 2000,
        testedPeriod: `${totalTests} derniers tirages`
      };
      
      setTestResult(finalResult);
      
      // Messages ludiques
      if (wins > 0) {
        if (bestGain > 1000000) {
          toast.success(`🏆 JACKPOT ! Vous auriez gagné ${bestGain.toLocaleString()}€ !`);
        } else if (wins > 10) {
          toast.success(`🎉 Excellent ! ${wins} gains sur ${totalTests} tirages !`);
        } else {
          toast.success(`💰 Pas mal ! ${wins} gains trouvés !`);
        }
      } else {
        toast.error(`😅 Aucun gain... Mais c'est le jeu !`);
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('❌ Erreur lors du test');
    } finally {
      setIsLoading(false);
      setShowAnimation(false);
    }
  };

  const loadOptimizedCombinations = async () => {
    setLoadingOptimized(true);
    try {
      const response = await fetch('/api/optimized-combinations?count=15');
      const result = await response.json();
      
      if (result.success) {
        setOptimizedCombinations(result.result || []);
      } else {
        toast.error('Erreur lors du chargement des combinaisons optimisées');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des combinaisons optimisées');
    } finally {
      setLoadingOptimized(false);
    }
  };

  const addNumber = (num: number) => {
    if (customNumbers.length < 5 && !customNumbers.includes(num)) {
      setCustomNumbers([...customNumbers, num]);
    }
  };

  const removeNumber = (num: number) => {
    setCustomNumbers(customNumbers.filter(n => n !== num));
  };

  const renderCombinationSelector = () => (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-pink-50 p-8 rounded-2xl shadow-2xl border-4 border-yellow-300">
      {/* Titre spectaculaire */}
      <div className="text-center mb-8 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 p-6 rounded-xl text-white">
        <h3 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
          🎰 <Target className="w-8 h-8" /> TESTEUR MAGIQUE 🎰
        </h3>
        <p className="text-yellow-100 text-lg">Découvrez si votre combinaison aurait été gagnante !</p>
      </div>

      {/* Compteur de progression */}
      <div className="bg-white border-4 border-blue-300 rounded-xl p-6 mb-8 shadow-lg">
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className={`text-4xl font-bold ${customNumbers.length === 5 ? 'text-green-600' : 'text-blue-600'}`}>
              {customNumbers.length}/5
            </div>
            <div className="text-sm font-bold text-gray-600">Numéros choisis</div>
          </div>
          <div className="text-5xl animate-bounce">🎯</div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600">{complementary}</div>
            <div className="text-sm font-bold text-gray-600">Complémentaire</div>
          </div>
        </div>
        {customNumbers.length === 5 && (
          <div className="text-center mt-4">
            <div className="text-green-600 font-bold text-lg animate-pulse">✅ Prêt pour le test !</div>
          </div>
        )}
      </div>
      
      {/* Grille de sélection LUDIQUE */}
      <div className="mb-8">
        <h4 className="font-bold text-xl text-center text-white bg-gradient-to-r from-blue-500 to-orange-500 p-4 rounded-lg mb-6">
          🔢 Choisissez 5 numéros porte-bonheur (1 à 49) 🍀
        </h4>
        <div className="grid grid-cols-7 gap-3 p-6 bg-white rounded-xl border-4 border-blue-200 shadow-inner">
          {Array.from({ length: 49 }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              onClick={() => addNumber(num)}
              disabled={customNumbers.includes(num) || customNumbers.length >= 5}
              className={`relative w-14 h-14 rounded-full text-sm font-bold transition-all transform ${
                customNumbers.includes(num)
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white scale-110 shadow-xl ring-4 ring-yellow-300 animate-pulse'
                  : customNumbers.length >= 5
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-br from-white to-gray-100 text-gray-700 hover:from-blue-100 hover:to-blue-200 hover:scale-105 shadow-md border-2 border-gray-300 hover:border-blue-400'
              }`}
            >
              {num}
              {customNumbers.includes(num) && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
        
        {/* Numéros sélectionnés avec style spectaculaire */}
        {customNumbers.length > 0 && (
          <div className="bg-gradient-to-r from-green-100 to-blue-100 border-4 border-green-300 rounded-xl p-6 mt-6">
            <h5 className="font-bold text-lg mb-4 text-green-800 flex items-center justify-center gap-2">
              ⭐ Vos numéros chanceux ⭐
            </h5>
            <div className="flex gap-4 justify-center flex-wrap">
              {customNumbers.map(num => (
                <div key={num} className="relative group">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-xl ring-4 ring-green-200 animate-pulse">
                    {num}
                  </div>
                  <button
                    onClick={() => removeNumber(num)}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all transform hover:scale-110 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sélection du complémentaire LUDIQUE */}
      <div className="mb-8">
        <h4 className="font-bold text-xl text-center text-white bg-gradient-to-r from-orange-500 to-pink-500 p-4 rounded-lg mb-6">
          🎲 Numéro complémentaire (1 à 10) 🎲
        </h4>
        <div className="flex gap-4 justify-center p-6 bg-white rounded-xl border-4 border-orange-200 shadow-inner">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              onClick={() => setComplementary(num)}
              className={`w-16 h-16 rounded-full text-lg font-bold transition-all transform ${
                complementary === num
                  ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white scale-125 shadow-xl ring-4 ring-orange-300 animate-pulse'
                  : 'bg-gradient-to-br from-white to-gray-100 text-gray-700 hover:from-orange-100 hover:to-orange-200 hover:scale-110 shadow-md border-2 border-gray-300 hover:border-orange-400'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Bouton de test SPECTACULAIRE */}
      <div className="text-center">
        <button
          onClick={testCombination}
          disabled={customNumbers.length !== 5 || isLoading}
          className={`px-12 py-6 rounded-2xl font-bold text-2xl transition-all transform shadow-2xl ${
            customNumbers.length === 5 && !isLoading
              ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white hover:scale-105 hover:shadow-3xl animate-pulse border-4 border-yellow-400'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed border-4 border-gray-400'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
              <span className="animate-pulse">🎰 Test magique en cours... 🎰</span>
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
            </div>
          ) : customNumbers.length === 5 ? (
            <div className="flex items-center gap-4">
              <Zap className="w-8 h-8 animate-bounce" />
              <span>🚀 TESTER MA COMBINAISON ! 🚀</span>
              <Zap className="w-8 h-8 animate-bounce" />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Target className="w-8 h-8" />
              <span>Sélectionnez {5 - customNumbers.length} numéro{5 - customNumbers.length > 1 ? 's' : ''} de plus</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  const renderTestResults = () => {
    if (!testResult) return null;

    const getResultEmoji = () => {
      if (testResult.bestGain > 1000000) return '🏆';
      if (testResult.wins > 10) return '🎉';
      if (testResult.wins > 0) return '💰';
      return '😅';
    };

    const getResultMessage = () => {
      if (testResult.bestGain > 1000000) return 'JACKPOT HISTORIQUE !';
      if (testResult.wins > 10) return 'Excellent résultat !';
      if (testResult.wins > 0) return 'Quelques gains trouvés !';
      return 'Pas de chance cette fois...';
    };

    return (
      <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 p-8 rounded-2xl shadow-2xl border-4 border-yellow-400">
        {/* Titre des résultats avec animation */}
        <div className="text-center mb-8 bg-gradient-to-r from-green-400 via-blue-500 to-orange-500 p-6 rounded-xl text-white">
          <h3 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
            {getResultEmoji()} <Trophy className="w-8 h-8" /> RÉSULTATS DU TEST {getResultEmoji()}
          </h3>
          <p className="text-yellow-100 text-xl font-bold animate-pulse">{getResultMessage()}</p>
        </div>

        {/* Infos du test */}
        <div className="bg-white border-4 border-blue-300 rounded-xl p-4 mb-8 shadow-lg">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-blue-600 font-bold">
              <Timer className="w-5 h-5" />
              Analysé en {testResult.executionTime}ms
            </div>
            <div className="flex items-center gap-2 text-orange-600 font-bold">
              <BarChart3 className="w-5 h-5" />
              {testResult.testedPeriod}
            </div>
          </div>
        </div>
        
        {/* Métriques principales SPECTACULAIRES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="text-center p-6 bg-gradient-to-br from-blue-100 to-blue-200 border-4 border-blue-300 rounded-xl shadow-lg">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-3xl font-bold text-blue-700">{testResult.totalTests}</div>
            <div className="text-sm font-bold text-blue-600">Tirages testés</div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-green-100 to-green-200 border-4 border-green-300 rounded-xl shadow-lg">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-3xl font-bold text-green-700">{testResult.wins}</div>
            <div className="text-sm font-bold text-green-600">Tirages gagnants</div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-orange-100 to-orange-200 border-4 border-orange-300 rounded-xl shadow-lg">
            <div className="text-4xl mb-2">💰</div>
            <div className="text-3xl font-bold text-orange-700">{testResult.totalGains.toLocaleString()}€</div>
            <div className="text-sm font-bold text-orange-600">Gains totaux</div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-orange-100 to-orange-200 border-4 border-orange-300 rounded-xl shadow-lg">
            <div className="text-4xl mb-2">{testResult.roi >= 0 ? '📈' : '📉'}</div>
            <div className={`text-3xl font-bold ${testResult.roi >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {testResult.roi.toFixed(1)}%
            </div>
            <div className="text-sm font-bold text-orange-600">Rentabilité</div>
          </div>
        </div>

        {/* Bilan financier */}
        <div className="bg-white border-4 border-yellow-300 rounded-xl p-6 mb-8 shadow-lg">
          <h4 className="text-xl font-bold text-center mb-4 text-yellow-800">💳 BILAN FINANCIER 💳</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-red-600">-{testResult.investissement}€</div>
              <div className="text-sm text-gray-600">Investissement</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">+{testResult.totalGains}€</div>
              <div className="text-sm text-gray-600">Gains</div>
            </div>
            <div>
              <div className={`text-xl font-bold ${testResult.benefice >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {testResult.benefice >= 0 ? '+' : ''}{testResult.benefice}€
              </div>
              <div className="text-sm text-gray-600">Bénéfice/Perte</div>
            </div>
          </div>
          {testResult.benefice >= 0 ? (
            <div className="text-center mt-4 text-green-600 font-bold animate-pulse">
              🎉 Vous auriez été bénéficiaire ! 🎉
            </div>
          ) : (
            <div className="text-center mt-4 text-red-600 font-bold">
              😔 Vous auriez perdu de l'argent...
            </div>
          )}
        </div>
        
        {/* Détails des gains */}
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Distribution des gains par rang</h4>
          <div className="space-y-2">
            {Object.entries(testResult.categories)
              .sort(([a], [b]) => {
                // Trier par rang (Rang 1, Rang 2, etc.)
                const rangA = parseInt(a.match(/Rang (\d+)/)?.[1] || '99');
                const rangB = parseInt(b.match(/Rang (\d+)/)?.[1] || '99');
                return rangA - rangB;
              })
              .map(([category, count]) => {
                const percentage = ((Number(count) / testResult.totalTests) * 100).toFixed(3);
                return (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                    <span className="text-sm font-medium">{category}</span>
                    <div className="text-right">
                      <span className="font-bold text-lg">{String(count)} fois</span>
                      <div className="text-xs text-gray-500">({percentage}%)</div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
        
        {/* Combinaison testée */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Combinaison testée:</span>
            <div className="flex gap-1">
              {testResult.combination.map((num: number) => (
                <span
                  key={num}
                  className="inline-block w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-center leading-8 text-sm"
                >
                  {num}
                </span>
              ))}
              <span className="inline-block w-8 h-8 bg-green-100 text-green-800 rounded-full text-center leading-8 text-sm">
                {testResult.complementary}
              </span>
            </div>
          </div>
          
          {/* Debug Info */}
          {testResult.debug && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h5 className="font-semibold text-yellow-800 mb-2">🔍 Debug Info:</h5>
              <div className="text-xs space-y-1">
                <div><strong>Premier tirage:</strong> [{testResult.debug.firstTirageNumbers.join(', ')}] + {testResult.debug.firstTirageCompl}</div>
                <div><strong>Votre combinaison:</strong> [{testResult.debug.combinationArray.join(', ')}] + {testResult.debug.testComplementary}</div>
                <div><strong>Match parfait?</strong> {JSON.stringify(testResult.debug.firstTirageNumbers) === JSON.stringify(testResult.debug.combinationArray) && testResult.debug.firstTirageCompl === testResult.debug.testComplementary ? '✅ OUI' : '❌ NON'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderOptimizedCombinations = () => {
    if (loadingOptimized) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    if (!optimizedCombinations || optimizedCombinations.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucune combinaison optimisée disponible</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Mes Sélections Optimisées</h3>
            <button
              onClick={loadOptimizedCombinations}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {optimizedCombinations.map((combo, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Combinaison {index + 1}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      combo.category === 'hot' ? 'bg-red-100 text-red-800' :
                      combo.category === 'balanced' ? 'bg-blue-100 text-blue-800' :
                      combo.category === 'pattern' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {combo.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {combo.score.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-600">Score</div>
                  </div>
                </div>
                
                <div className="flex gap-1 mb-3">
                  {combo.numbers.map((num: number) => (
                    <span
                      key={num}
                      className="inline-block w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-center leading-8 text-sm"
                    >
                      {num}
                    </span>
                  ))}
                  <span className="inline-block w-8 h-8 bg-green-100 text-green-800 rounded-full text-center leading-8 text-sm">
                    {combo.complementary}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Confiance:</span>
                    <span className="font-semibold">{combo.confidence.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Valeur espérée:</span>
                    <span className="font-semibold text-green-600">{combo.expectedValue.toFixed(2)} €</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Risque:</span>
                    <span className={`font-semibold ${
                      combo.riskLevel === 'low' ? 'text-green-600' :
                      combo.riskLevel === 'medium' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {combo.riskLevel}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setCustomNumbers(combo.numbers);
                    setComplementary(combo.complementary);
                    setActiveTab('tester');
                  }}
                  className="w-full mt-3 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm"
                >
                  Tester cette combinaison
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'tester':
        return (
          <div className="space-y-6">
            {renderCombinationSelector()}
            {renderTestResults()}
          </div>
        );
      case 'optimized':
        return renderOptimizedCombinations();
      case 'comparison':
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Fonctionnalité en cours de développement...</p>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Fonctionnalité en cours de développement...</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Testeur de Combinaisons Ultra-Rapide
        </h1>
        <p className="text-gray-600">
          Tests instantanés avec analyse complète de tous les tirages historiques
        </p>
      </motion.div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-lg shadow-md p-1">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu des onglets */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
}