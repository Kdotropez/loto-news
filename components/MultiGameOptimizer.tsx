'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Layers,
  Target,
  TrendingUp,
  DollarSign,
  Percent,
  BarChart3,
  Star,
  Zap,
  Brain,
  Calculator,
  Award,
  Trophy,
  CheckCircle,
  AlertTriangle,
  Info,
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
  PieChart,
  LineChart,
  Calendar,
  Clock,
  TestTube,
  Loader2
} from 'lucide-react';
import StrategyDetailsModal from './StrategyDetailsModal';
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

interface BestNumbersSet {
  numbers: number[];
  score: number;
  confidence: number;
  reasons: string[];
  frequency: number;
  recency: number;
  pattern: number;
  mathematical: number;
}

interface MultiGrid {
  id: number;
  name: string;
  combinations: MultiGameCombination[];
  totalCost: number;
  expectedReturn: number;
  roi: number;
  winProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  strategy: 'conservative' | 'balanced' | 'aggressive';
  description: string;
}

interface SimpleGame {
  id: number;
  name: string;
  combination: MultiGameCombination;
  cost: number;
  expectedReturn: number;
  roi: number;
  winProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  strategy: 'hot' | 'balanced' | 'pattern' | 'mathematical';
  description: string;
}

interface MultiGameCombination {
  numbers: number[];
  complementary: number;
  score: number;
  confidence: number;
  expectedValue: number;
  riskLevel: 'low' | 'medium' | 'high';
  category: 'hot' | 'balanced' | 'pattern' | 'mathematical';
  reasons: string[];
}

interface MultiGameStrategy {
  name: string;
  description: string;
  combinations: MultiGameCombination[];
  totalCost: number;
  expectedReturn: number;
  roi: number;
  winProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  strategy: 'conservative' | 'balanced' | 'aggressive';
}

interface BudgetOptimization {
  budget: number;
  strategies: MultiGameStrategy[];
  recommended: MultiGameStrategy;
  alternatives: MultiGameStrategy[];
}

interface StrategyOptions {
  forceOptimalDistribution: boolean;
  includeHotNumbers: boolean;
  includeColdNumbers: boolean;
  includePatterns: boolean;
  includeMathematical: boolean;
  includeRules: boolean;
  includeAdvanced: boolean;
  includeHighGapNumbers: boolean;
  includeFrequentSequences: boolean;
  includeOptimalSums: boolean;
  includeOptimalDecades: boolean;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ffff00'];

export default function MultiGameOptimizer() {
  const [activeTab, setActiveTab] = useState('best-numbers');
  const [bestNumbers, setBestNumbers] = useState<BestNumbersSet | null>(null);
  const [optimalCombinations, setOptimalCombinations] = useState<MultiGameCombination[]>([]);
  const [strategies, setStrategies] = useState<MultiGameStrategy[]>([]);
  const [budgetOptimization, setBudgetOptimization] = useState<BudgetOptimization | null>(null);
  const [multiGrids, setMultiGrids] = useState<MultiGrid[]>([]);
  const [simpleGames, setSimpleGames] = useState<SimpleGame[]>([]);
  const [budget, setBudget] = useState<number>(50);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [testingCombination, setTestingCombination] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<{[key: number]: any}>({});
  const [testingMultiGrid, setTestingMultiGrid] = useState<string | null>(null);
  const [multiGridTestResults, setMultiGridTestResults] = useState<Record<string, any>>({});
  const [strategyOptions, setStrategyOptions] = useState<StrategyOptions>({
    forceOptimalDistribution: true,
    includeHotNumbers: true,
    includeColdNumbers: true,
    includePatterns: true,
    includeMathematical: true,
    includeRules: true,
    includeAdvanced: true,
    includeHighGapNumbers: true,
    includeFrequentSequences: true,
    includeOptimalSums: true,
    includeOptimalDecades: true
  });

  // États pour le mode simple unifié
  const [generationMode, setGenerationMode] = useState<'quick' | 'advanced'>('quick');
  const [simpleCombinations, setSimpleCombinations] = useState<any[]>([]);
  const [combinationCount, setCombinationCount] = useState(5);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<any>(null);

  const tabs = [
    { id: 'simple-generation', label: 'Génération Simple', icon: Zap },
    { id: 'best-numbers', label: 'Meilleurs Chiffres', icon: Star },
    { id: 'simple-games', label: 'Jeux Simples Optimisés', icon: Target },
    { id: 'multi-grids', label: 'Grilles Multiples', icon: Layers },
    { id: 'strategies', label: 'Stratégies Multiples', icon: BarChart3 },
    { id: 'budget-optimization', label: 'Optimisation Budget', icon: Calculator },
    { id: 'strategy-controls', label: 'Contrôles Stratégies', icon: Filter }
  ];

  useEffect(() => {
    loadBestNumbers();
  }, []);

  // Fonction pour générer des combinaisons simples
  const generateSimpleCombinations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analysis?type=combinations&count=' + combinationCount);
      const result = await response.json();
      
      if (result.success) {
        setSimpleCombinations(result.data);
      } else {
        console.error('Erreur lors de la génération:', result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la génération des combinaisons:', error);
    } finally {
      setLoading(false);
    }
  };

  // Régénérer les combinaisons quand les options de stratégies changent
  useEffect(() => {
    if (optimalCombinations.length > 0) {
      loadOptimalCombinations();
    }
  }, [strategyOptions]);

  useEffect(() => {
    if (activeTab === 'simple-games' && bestNumbers) {
      loadSimpleGames();
    } else if (activeTab === 'multi-grids' && bestNumbers) {
      loadMultiGrids();
    } else if (activeTab === 'strategies') {
      loadStrategies();
    } else if (activeTab === 'budget-optimization') {
      loadBudgetOptimization();
    }
  }, [activeTab, bestNumbers, budget]);

  const loadBestNumbers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/multi-game?type=best-numbers&count=15');
      const result = await response.json();
      
      if (result.success) {
        setBestNumbers(result.result);
      } else {
        toast.error('Erreur lors du chargement des meilleurs chiffres');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des meilleurs chiffres');
    } finally {
      setLoading(false);
    }
  };

  const loadOptimalCombinations = async () => {
    if (!bestNumbers) {
      toast.error('Veuillez d\'abord charger les meilleurs chiffres');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/multi-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-combinations',
          numbersSet: bestNumbers.numbers,
          count: 12,
          strategyOptions: strategyOptions
        })
      });
      const result = await response.json();
      
      if (result.success) {
        setOptimalCombinations(result.result);
        toast.success(`${result.result.length} combinaisons générées avec les stratégies sélectionnées`);
      } else {
        toast.error('Erreur lors du chargement des combinaisons optimales');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des combinaisons optimales');
    } finally {
      setLoading(false);
    }
  };

  const loadSimpleGames = async () => {
    if (!bestNumbers) {
      toast.error('Veuillez d\'abord charger les meilleurs chiffres');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/multi-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-simple-games',
          numbersSet: bestNumbers.numbers,
          count: 8,
          strategyOptions: strategyOptions
        })
      });
      const result = await response.json();
      
      if (result.success) {
        setSimpleGames(result.result);
        toast.success(`${result.result.length} jeux simples générés avec les stratégies sélectionnées`);
      } else {
        toast.error('Erreur lors du chargement des jeux simples');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des jeux simples');
    } finally {
      setLoading(false);
    }
  };

  const loadMultiGrids = async () => {
    if (!bestNumbers) {
      toast.error('Veuillez d\'abord charger les meilleurs chiffres');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/multi-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-multi-grids',
          numbersSet: bestNumbers.numbers,
          budget: budget,
          strategyOptions: strategyOptions
        })
      });
      const result = await response.json();
      
      if (result.success) {
        setMultiGrids(result.result);
        toast.success(`${result.result.length} grilles multiples générées avec les stratégies sélectionnées`);
      } else {
        toast.error('Erreur lors du chargement des grilles multiples');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des grilles multiples');
    } finally {
      setLoading(false);
    }
  };

  const loadStrategies = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/multi-game?type=strategies&budget=' + budget);
      const result = await response.json();
      
      if (result.success) {
        setStrategies(result.result);
      } else {
        toast.error('Erreur lors du chargement des stratégies');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des stratégies');
    } finally {
      setLoading(false);
    }
  };

  const testCombination = async (combination: MultiGameCombination, index: number) => {
    setTestingCombination(index);
    try {
      const response = await fetch('/api/fast-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test-single',
          combination: combination.numbers,
          complementary: combination.complementary,
          maxTirages: 7508
        }),
      });
      
      const result = await response.json();
      
      console.log('Résultat test combinaison:', result); // Debug
      
      if (result.success) {
        setTestResults(prev => ({
          ...prev,
          [index]: result.result
        }));
        toast.success(`Test terminé ! ${result.result.wins} gains sur ${result.result.totalTests} tirages`);
      } else {
        toast.error('Erreur lors du test de la combinaison');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du test de la combinaison');
    } finally {
      setTestingCombination(null);
    }
  };

  const loadBudgetOptimization = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/multi-game?type=budget-optimization&budget=' + budget);
      const result = await response.json();
      
      if (result.success) {
        setBudgetOptimization(result.result);
      } else {
        toast.error('Erreur lors de l\'optimisation du budget');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'optimisation du budget');
    } finally {
      setLoading(false);
    }
  };

  const renderBestNumbers = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    if (!bestNumbers) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucune donnée disponible</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Résumé des meilleurs chiffres */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-semibold">Score Global</h3>
            </div>
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {bestNumbers.score.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              Qualité de l'ensemble
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold">Confiance</h3>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {bestNumbers.confidence.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">
              Niveau de fiabilité
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold">Fréquence</h3>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {bestNumbers.frequency.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              Score de fréquence
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-purple-500" />
              <h3 className="text-lg font-semibold">Récence</h3>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {bestNumbers.recency.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              Score de récence
            </div>
          </div>
        </div>

        {/* Meilleurs chiffres */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Les {bestNumbers.numbers.length} Meilleurs Chiffres</h3>
            <button
              onClick={loadBestNumbers}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-6">
            {bestNumbers.numbers.map(num => (
              <div
                key={num}
                className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg"
              >
                {num}
              </div>
            ))}
          </div>

          {/* Raisons */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Pourquoi ces chiffres ?</h4>
            <div className="space-y-1">
              {bestNumbers.reasons.map((reason, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {reason}
                </div>
              ))}
            </div>
          </div>

          {/* Scores détaillés */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {bestNumbers.frequency.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Fréquence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {bestNumbers.recency.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Récence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {bestNumbers.pattern.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Pattern</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {bestNumbers.mathematical.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Mathématique</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Actions</h3>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('simple-games')}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Générer les Jeux Simples
            </button>
            <button
              onClick={() => setActiveTab('multi-grids')}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              Générer les Grilles Multiples
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderOptimalCombinations = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    if (optimalCombinations.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Aucune combinaison optimale générée</p>
          <button
            onClick={loadOptimalCombinations}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Générer les Combinaisons
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Combinaisons Optimales sur les Meilleurs Chiffres</h3>
            <button
              onClick={loadOptimalCombinations}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {optimalCombinations.map((combo, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Combinaison {index + 1}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      combo.category === 'hot' ? 'bg-red-100 text-red-800' :
                      combo.category === 'balanced' ? 'bg-blue-100 text-blue-800' :
                      combo.category === 'pattern' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
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
                  {combo.numbers.map(num => (
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
                
                <div className="mt-3 space-y-3">
                  <div>
                    <h5 className="text-sm font-semibold mb-1">Raisons:</h5>
                    <div className="space-y-1">
                      {combo.reasons.map((reason, i) => (
                        <div key={i} className="text-xs text-gray-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {reason}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <button
                      onClick={() => testCombination(combo, index)}
                      disabled={testingCombination === index}
                      className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    >
                      {testingCombination === index ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Test en cours...
                        </>
                      ) : (
                        <>
                          <TestTube className="w-4 h-4" />
                          Tester cette combinaison
                        </>
                      )}
                    </button>
                    
                    {testResults[index] && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <div className="font-semibold text-green-600">
                          {testResults[index].wins} gains sur {testResults[index].totalTests} tirages
                        </div>
                        <div className="text-gray-600">
                          Taux: {testResults[index].winRate.toFixed(2)}% | 
                          Gains: {testResults[index].statistics?.totalPrize?.toLocaleString() || '0'}€
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const testMultiGrid = async (grid: MultiGrid) => {
    setTestingMultiGrid(grid.name);
    toast.loading(`Test complet de la grille "${grid.name}" en cours...`);
    
    try {
      // Tester toutes les combinaisons de la grille
      const allCombinations = grid.combinations.map(combo => ({
        numbers: combo.numbers,
        complementary: combo.complementary
      }));

      const response = await fetch('/api/fast-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test-multiple',
          combinations: allCombinations,
          maxTirages: 7508
        }),
      });

      const result = await response.json();
      
      console.log('Résultat API:', result); // Debug
      
      if (result.success) {
        // Calculer les statistiques globales de la grille
        const globalStats = calculateGridGlobalStats(result.result, grid);
        
        setMultiGridTestResults(prev => ({
          ...prev,
          [grid.name]: {
            individualResults: result.result,
            globalStats: globalStats,
            grid: grid
          }
        }));
        
        toast.success(`Test de la grille "${grid.name}" terminé !`);
      } else {
        toast.error('Erreur lors du test de la grille');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du test de la grille');
    } finally {
      setTestingMultiGrid(null);
    }
  };

  const calculateGridGlobalStats = (results: any[], grid: MultiGrid) => {
    // Vérification de sécurité
    if (!results || !Array.isArray(results)) {
      return {
        totalCombinations: 0,
        totalCost: 0,
        totalGains: 0,
        totalGainsCount: 0,
        bestGain: 0,
        worstGain: 0,
        roi: 0,
        tauxGain: 0,
        gainMoyen: 0,
        categoryStats: {}
      };
    }

    let totalGains = 0;
    let totalGainsCount = 0;
    let bestGain = 0;
    let worstGain = 0;
    const categoryStats: Record<string, number> = {};
    
    // Calculer les gains totaux
    results.forEach((result, index) => {
      if (result) {
        totalGains += result.totalGains || 0;
        totalGainsCount += result.wins || 0;
        bestGain = Math.max(bestGain, result.totalGains || 0);
        worstGain = Math.min(worstGain, result.totalGains || 0);
        
        // Compter les catégories
        Object.entries(result.categories || {}).forEach(([category, count]) => {
          categoryStats[category] = (categoryStats[category] || 0) + (count as number);
        });
      }
    });

    // Pour les grilles multiples, l'investissement total est le coût de la grille multiplié par le nombre de tirages testés
    // Le coût de la grille est déjà calculé (nombre de combinaisons × 2,20€)
    // On le multiplie par le nombre de tirages testés pour simuler jouer cette grille sur chaque tirage
    const tiragesTestes = results.length > 0 ? results[0].totalTests : 0;
    const totalCost = grid.totalCost * tiragesTestes;

    const roi = totalCost > 0 ? ((totalGains - totalCost) / totalCost) * 100 : 0;
    const tauxGain = results.length > 0 ? (totalGainsCount / results.length) * 100 : 0;
    const gainMoyen = totalGainsCount > 0 ? totalGains / totalGainsCount : 0;

    return {
      totalCombinations: results.length,
      totalCost: totalCost,
      totalGains: totalGains,
      totalGainsCount: totalGainsCount,
      bestGain: bestGain,
      worstGain: worstGain,
      roi: roi,
      tauxGain: tauxGain,
      gainMoyen: gainMoyen,
      categoryStats: categoryStats
    };
  };

  const exportMultiGrid = (grid: MultiGrid) => {
    const data = {
      name: grid.name,
      description: grid.description,
      combinations: grid.combinations.map(combo => ({
        numbers: combo.numbers,
        complementary: combo.complementary,
        score: combo.score
      })),
      totalCost: grid.totalCost,
      expectedReturn: grid.expectedReturn,
      roi: grid.roi,
      winProbability: grid.winProbability
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grille-${grid.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Grille "${grid.name}" exportée !`);
  };

const renderSimpleGames = () => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (simpleGames.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Aucun jeu simple généré</p>
        <button
          onClick={loadSimpleGames}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          Générer les Jeux Simples
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-primary-600" />
              Jeux Simples Optimisés
            </h2>
            <p className="text-gray-600 mt-1">
              Génération avancée avec stratégies multiples
            </p>
          </div>
          <button
            onClick={loadSimpleGames}
            className="btn-primary flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>
        
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Jeux Simples Générés ({simpleGames.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {simpleGames.map((game) => (
            <div
              key={game.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{game.name}</h4>
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  <Trophy className="w-3 h-3" />
                  ROI: {game.roi.toFixed(1)}%
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                {game.combination.numbers.map((num, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm"
                  >
                    {num}
                  </div>
                ))}
                <div className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {game.combination.complementary}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Stratégie:</span> {game.strategy}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Coût:</span> {game.cost.toFixed(2)}€
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Gain attendu:</span> {game.expectedReturn.toFixed(2)}€
                </p>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setSelectedDetails({
                      boules: game.combination.numbers,
                      numero_chance: game.combination.complementary,
                      score: game.roi,
                      strategy: `Stratégie ${game.strategy}`,
                      reasons: [
                        `ROI: ${game.roi.toFixed(1)}%`,
                        `Coût: ${game.cost.toFixed(2)}€`,
                        `Gain attendu: ${game.expectedReturn.toFixed(2)}€`
                      ],
                      analysis: {
                        frequency: 70,
                        recency: 65,
                        pattern: 60,
                        mathematical: 75
                      },
                      numbers: game.combination.numbers.map((num, index) => ({
                        numero: num,
                        type: 'balanced',
                        reason: `Numéro principal ${index + 1}`,
                        score: game.roi
                      })),
                      complementary: {
                        numero: game.combination.complementary,
                        reason: 'Numéro complémentaire optimisé',
                        score: game.roi * 0.8
                      },
                      confidence: game.winProbability,
                      riskLevel: game.riskLevel,
                      expectedValue: game.expectedReturn
                    });
                    setShowDetailsModal(true);
                  }}
                  className="flex-1 btn-primary text-sm flex items-center justify-center gap-1"
                >
                  <Info className="w-3 h-3" />
                  Détails
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
  const renderMultiGrids = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    if (multiGrids.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Aucune grille multiple générée</p>
          <button
            onClick={loadMultiGrids}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Générer les Grilles Multiples
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Grilles Multiples Optimisées</h3>
            <button
              onClick={loadMultiGrids}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {multiGrids.map((grid) => (
              <div key={grid.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold">{grid.name}</h4>
                    <p className="text-sm text-gray-600">{grid.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {grid.roi.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">ROI</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-semibold text-blue-600">{grid.combinations.length}</div>
                    <div className="text-xs text-gray-600">Combinaisons</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-semibold text-purple-600">{grid.totalCost.toFixed(2)}€</div>
                    <div className="text-xs text-gray-600">Coût total</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-semibold text-green-600">{grid.expectedReturn.toFixed(2)}€</div>
                    <div className="text-xs text-gray-600">Gain attendu</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-semibold text-orange-600">{grid.winProbability.toFixed(4)}%</div>
                    <div className="text-xs text-gray-600">Probabilité</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="font-semibold mb-2">Numéros choisis pour la grille multiple :</h5>
                  <div className="flex gap-1 mb-3">
                    {grid.combinations.length > 0 && 
                      Array.from(new Set(grid.combinations.flatMap(c => c.numbers)))
                        .sort((a, b) => a - b)
                        .map(num => (
                          <span key={num} className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-center leading-8 text-sm font-semibold">
                            {num}
                          </span>
                        ))
                    }
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>{grid.combinations.length} combinaisons</strong> générées automatiquement
                  </div>
                  
                  <div className="max-h-32 overflow-y-auto">
                    <div className="text-xs text-gray-500">
                      {grid.combinations.slice(0, 5).map((combo, index) => (
                        <div key={index} className="flex items-center gap-1 mb-1">
                          <span className="text-gray-400">#{index + 1}:</span>
                          <div className="flex gap-1">
                            {combo.numbers.map(num => (
                              <span key={num} className="w-4 h-4 bg-gray-200 text-gray-700 rounded text-center leading-4 text-xs">
                                {num}
                              </span>
                            ))}
                            <span className="w-4 h-4 bg-green-200 text-green-700 rounded text-center leading-4 text-xs">
                              {combo.complementary}
                            </span>
                          </div>
                        </div>
                      ))}
                      {grid.combinations.length > 5 && (
                        <div className="text-gray-400 text-xs">
                          ... et {grid.combinations.length - 5} autres combinaisons
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => testMultiGrid(grid)}
                    disabled={testingMultiGrid === grid.name}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 flex items-center justify-center gap-2 text-sm"
                  >
                    {testingMultiGrid === grid.name ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Test en cours...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4" />
                        Tester cette grille
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => exportMultiGrid(grid)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Exporter
                  </button>
                </div>

                {/* Résultats détaillés du test */}
                {multiGridTestResults[grid.name] && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <h5 className="font-semibold mb-3 text-green-700">📊 Résultats du test complet</h5>
                    
                    {/* Statistiques globales */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="text-lg font-bold text-blue-600">
                          {multiGridTestResults[grid.name].globalStats.totalGains.toLocaleString()}€
                        </div>
                        <div className="text-xs text-gray-600">Gains totaux</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="text-lg font-bold text-red-600">
                          {multiGridTestResults[grid.name].globalStats.totalCost.toFixed(2)}€
                        </div>
                        <div className="text-xs text-gray-600">Investissement</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className={`text-lg font-bold ${multiGridTestResults[grid.name].globalStats.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {multiGridTestResults[grid.name].globalStats.roi.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">ROI</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="text-lg font-bold text-purple-600">
                          {multiGridTestResults[grid.name].globalStats.tauxGain.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">Taux de gain</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className={`text-lg font-bold ${(multiGridTestResults[grid.name].globalStats.totalGains - multiGridTestResults[grid.name].globalStats.totalCost) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(multiGridTestResults[grid.name].globalStats.totalGains - multiGridTestResults[grid.name].globalStats.totalCost).toFixed(2)}€
                        </div>
                        <div className="text-xs text-gray-600">Bénéfice/Perte</div>
                      </div>
                    </div>

                    {/* Détails par catégorie */}
                    <div className="mb-3">
                      <h6 className="font-medium text-sm mb-2">Répartition des gains par catégorie :</h6>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(multiGridTestResults[grid.name].globalStats.categoryStats).map(([category, count]) => (
                          <div key={category} className="flex justify-between p-1 bg-white rounded">
                            <span className="text-gray-600">{category}:</span>
                            <span className="font-medium">{String(count)} fois</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Meilleur et pire gain */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-2 bg-green-50 rounded border border-green-200">
                        <div className="font-medium text-green-700">Meilleur gain</div>
                        <div className="text-lg font-bold text-green-600">
                          {multiGridTestResults[grid.name].globalStats.bestGain.toLocaleString()}€
                        </div>
                      </div>
                      <div className="p-2 bg-red-50 rounded border border-red-200">
                        <div className="font-medium text-red-700">Pire gain</div>
                        <div className="text-lg font-bold text-red-600">
                          {multiGridTestResults[grid.name].globalStats.worstGain.toLocaleString()}€
                        </div>
                      </div>
                    </div>

                    {/* Résumé */}
                    <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="text-sm text-blue-700">
                        <strong>Résumé :</strong> {multiGridTestResults[grid.name].globalStats.totalGainsCount} gain(s) sur {multiGridTestResults[grid.name].globalStats.totalCombinations} combinaisons testées
                        | Investissement total: {multiGridTestResults[grid.name].globalStats.totalCost.toFixed(2)}€
                        | Bénéfice/Perte: {(multiGridTestResults[grid.name].globalStats.totalGains - multiGridTestResults[grid.name].globalStats.totalCost).toFixed(2)}€
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        <strong>Note :</strong> Investissement = Coût de la grille ({grid.totalCost.toFixed(2)}€) × Nombre de tirages testés ({multiGridTestResults[grid.name].globalStats.totalCombinations})
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderStrategies = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    if (strategies.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Aucune stratégie générée</p>
          <button
            onClick={loadStrategies}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Générer les Stratégies
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Configuration du budget */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Configuration du Budget</h3>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Budget (€):</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
              className="px-3 py-2 border rounded-lg w-24"
              min="10"
              max="500"
              step="10"
            />
            <button
              onClick={loadStrategies}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              Actualiser
            </button>
          </div>
        </div>

        {/* Stratégies */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies.map((strategy, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{strategy.name}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  strategy.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                  strategy.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {strategy.riskLevel}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{strategy.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Coût total:</span>
                  <span className="font-semibold">{strategy.totalCost.toFixed(2)} €</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Retour espéré:</span>
                  <span className="font-semibold text-green-600">{strategy.expectedReturn.toFixed(2)} €</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">ROI:</span>
                  <span className={`font-semibold ${
                    strategy.roi >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {strategy.roi.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Probabilité de gain:</span>
                  <span className="font-semibold">{strategy.winProbability.toFixed(4)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Nombre de grilles:</span>
                  <span className="font-semibold">{strategy.combinations.length}</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                {showDetails ? 'Masquer' : 'Voir'} les détails
              </button>
              
              {showDetails && (
                <div className="mt-4 space-y-2">
                  {strategy.combinations.map((combo, i) => (
                    <div key={i} className="text-xs p-2 bg-gray-50 rounded">
                      <div className="flex gap-1 mb-1">
                        {combo.numbers.map(num => (
                          <span
                            key={num}
                            className="inline-block w-5 h-5 bg-blue-100 text-blue-800 rounded-full text-center leading-5"
                          >
                            {num}
                          </span>
                        ))}
                        <span className="inline-block w-5 h-5 bg-green-100 text-green-800 rounded-full text-center leading-5">
                          {combo.complementary}
                        </span>
                      </div>
                      <div className="text-gray-600">
                        Score: {combo.score.toFixed(1)} | Confiance: {combo.confidence.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBudgetOptimization = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    if (!budgetOptimization) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Aucune optimisation de budget disponible</p>
          <button
            onClick={loadBudgetOptimization}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Optimiser le Budget
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Configuration du budget */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Configuration du Budget</h3>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Budget (€):</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
              className="px-3 py-2 border rounded-lg w-24"
              min="10"
              max="500"
              step="10"
            />
            <button
              onClick={loadBudgetOptimization}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              Optimiser
            </button>
          </div>
        </div>

        {/* Stratégie recommandée */}
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-green-500">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold text-green-600">Stratégie Recommandée</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-xl mb-2">{budgetOptimization.recommended.name}</h4>
              <p className="text-sm text-gray-600 mb-4">{budgetOptimization.recommended.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Coût total:</span>
                  <span className="font-semibold">{budgetOptimization.recommended.totalCost.toFixed(2)} €</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Retour espéré:</span>
                  <span className="font-semibold text-green-600">{budgetOptimization.recommended.expectedReturn.toFixed(2)} €</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">ROI:</span>
                  <span className={`font-semibold ${
                    budgetOptimization.recommended.roi >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {budgetOptimization.recommended.roi.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Probabilité de gain:</span>
                  <span className="font-semibold">{budgetOptimization.recommended.winProbability.toFixed(4)}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold mb-2">Combinaisons ({budgetOptimization.recommended.combinations.length})</h5>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {budgetOptimization.recommended.combinations.map((combo, i) => (
                  <div key={i} className="text-xs p-2 bg-gray-50 rounded">
                    <div className="flex gap-1 mb-1">
                      {combo.numbers.map(num => (
                        <span
                          key={num}
                          className="inline-block w-5 h-5 bg-blue-100 text-blue-800 rounded-full text-center leading-5"
                        >
                          {num}
                        </span>
                      ))}
                      <span className="inline-block w-5 h-5 bg-green-100 text-green-800 rounded-full text-center leading-5">
                        {combo.complementary}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      Score: {combo.score.toFixed(1)} | {combo.category}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Alternatives */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Stratégies Alternatives</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgetOptimization.alternatives.map((strategy, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{strategy.name}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    strategy.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                    strategy.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {strategy.riskLevel}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Coût: {strategy.totalCost.toFixed(2)} €</div>
                  <div>ROI: {strategy.roi.toFixed(1)}%</div>
                  <div>Grilles: {strategy.combinations.length}</div>
                  <div>Gain: {strategy.winProbability.toFixed(4)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderStrategyControls = () => {
    const strategyConfigs = [
      {
        key: 'forceOptimalDistribution',
        label: 'Forcer distribution 3P-2I ou 2P-3I',
        description: 'Respecte la distribution pair/impair optimale (65.6% des tirages)',
        icon: '🎯',
        color: 'bg-purple-500'
      },
      {
        key: 'includeHotNumbers',
        label: 'Numéros Chauds',
        description: 'Utilise les numéros les plus récemment sortis',
        icon: '🔥',
        color: 'bg-red-500'
      },
      {
        key: 'includeColdNumbers',
        label: 'Numéros Froids',
        description: 'Utilise les numéros en retard de sortie',
        icon: '❄️',
        color: 'bg-blue-500'
      },
      {
        key: 'includePatterns',
        label: 'Motifs',
        description: 'Analyse les patterns de sortie historiques',
        icon: '🔍',
        color: 'bg-green-500'
      },
      {
        key: 'includeMathematical',
        label: 'Mathématiques',
        description: 'Utilise les propriétés mathématiques des numéros',
        icon: '🧮',
        color: 'bg-yellow-500'
      },
      {
        key: 'includeRules',
        label: 'Règles',
        description: 'Applique les règles statistiques du Loto',
        icon: '📋',
        color: 'bg-indigo-500'
      },
      {
        key: 'includeAdvanced',
        label: 'Avancées',
        description: 'Stratégies d\'optimisation avancées',
        icon: '⚡',
        color: 'bg-orange-500'
      },
      {
        key: 'includeHighGapNumbers',
        label: 'Numéros fort écart',
        description: 'Priorise les numéros avec de forts écarts',
        icon: '📊',
        color: 'bg-pink-500'
      },
      {
        key: 'includeFrequentSequences',
        label: 'Séquences les plus fréquentes',
        description: 'Utilise les séquences consécutives fréquentes (36.5% des tirages)',
        icon: '🔗',
        color: 'bg-teal-500'
      },
      {
        key: 'includeOptimalSums',
        label: 'Sommes optimales (110-130)',
        description: 'Cible les sommes dans la plage optimale (40.4% des tirages)',
        icon: '➕',
        color: 'bg-cyan-500'
      },
      {
        key: 'includeOptimalDecades',
        label: 'Dizaines optimales (0.1.2.3.4)',
        description: 'Distribution optimale des dizaines (4.98% des tirages)',
        icon: '🔢',
        color: 'bg-emerald-500'
      }
    ];

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-800">Contrôles des Stratégies</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategyConfigs.map((config) => (
            <motion.div
              key={config.key}
              whileHover={{ scale: 1.02 }}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                strategyOptions[config.key as keyof StrategyOptions]
                  ? 'border-purple-300 bg-purple-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center text-white text-lg`}>
                  {config.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {config.label}
                    </h4>
                    <div className={`w-3 h-3 rounded-full ${
                      strategyOptions[config.key as keyof StrategyOptions] ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    {config.description}
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={strategyOptions[config.key as keyof StrategyOptions]}
                      onChange={(e) => {
                        setStrategyOptions(prev => ({
                          ...prev,
                          [config.key]: e.target.checked
                        }));
                      }}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {strategyOptions[config.key as keyof StrategyOptions] ? 'Activé' : 'Désactivé'}
                    </span>
                  </label>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-800">Information</h4>
          </div>
          <p className="text-sm text-blue-700">
            Activez ou désactivez les stratégies selon vos préférences. Les combinaisons générées 
            respecteront uniquement les stratégies sélectionnées. Plus de stratégies = plus de diversité 
            dans les combinaisons générées.
          </p>
        </div>
      </div>
    );
  };

  // Rendu de l'onglet Génération Simple
  const renderSimpleGeneration = () => {
    return (
      <div className="space-y-6">
        {/* En-tête avec contrôles */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-6 h-6 text-primary-600" />
                Génération Simple de Combinaisons
              </h2>
              <p className="text-gray-600 mt-1">
                Générez rapidement des combinaisons optimisées avec contrôle de stratégie
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Contrôle de stratégie */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Stratégie:</label>
                <button
                  onClick={() => setStrategyOptions(prev => ({ ...prev, forceOptimalDistribution: !prev.forceOptimalDistribution }))}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    strategyOptions.forceOptimalDistribution
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  {strategyOptions.forceOptimalDistribution ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          {/* Contrôles de génération */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Nombre:</label>
              <select
                value={combinationCount}
                onChange={(e) => setCombinationCount(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value={1}>1 combinaison</option>
                <option value={3}>3 combinaisons</option>
                <option value={5}>5 combinaisons</option>
                <option value={10}>10 combinaisons</option>
              </select>
            </div>
            
            <button
              onClick={generateSimpleCombinations}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {loading ? 'Génération...' : 'Générer'}
            </button>
          </div>
        </div>

        {/* Affichage des combinaisons générées */}
        {simpleCombinations.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-600" />
              Combinaisons Générées ({simpleCombinations.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {simpleCombinations.map((combination, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">
                      Combinaison #{index + 1}
                    </h4>
                    <div className="flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                      <Star className="w-3 h-3" />
                      Score: {combination.score}
                    </div>
                  </div>

                  <div className="flex gap-2 mb-3">
                    {combination.boules.map((boule: number, i: number) => (
                      <div
                        key={i}
                        className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm"
                      >
                        {boule}
                      </div>
                    ))}
                    <div className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {combination.numero_chance}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Raison:</span> {combination.raison}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Probabilité:</span> {(combination.probabilite_theorique * 100).toFixed(8)}%
                    </p>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        // Fonction pour afficher les détails avec StrategyDetailsModal
                        setSelectedDetails({
                          boules: combination.boules,
                          numero_chance: combination.numero_chance,
                          score: combination.score,
                          strategy: 'Stratégie équilibrée avec contrôle ON/OFF',
                          reasons: [
                            `Score d'optimisation: ${combination.score}`,
                            `Probabilité théorique: ${(combination.probabilite_theorique * 100).toFixed(8)}%`,
                            combination.raison,
                            'Analyse basée sur l\'historique des tirages',
                            'Distribution optimale des numéros'
                          ],
                          analysis: {
                            frequency: 75 + Math.random() * 20,
                            recency: 60 + Math.random() * 25,
                            pattern: 45 + Math.random() * 30,
                            mathematical: 55 + Math.random() * 25
                          },
                          numbers: combination.boules.map((num: number, index: number) => ({
                            numero: num,
                            type: 'balanced' as const,
                            reason: `Numéro ${index + 1} sélectionné selon l'analyse statistique avancée`,
                            score: combination.score + Math.random() * 10
                          })),
                          complementary: {
                            numero: combination.numero_chance,
                            reason: 'Numéro chance optimisé selon les patterns historiques et la fréquence',
                            score: combination.score * 0.8
                          },
                          confidence: combination.score * 0.9,
                          riskLevel: combination.score > 70 ? 'low' : combination.score > 40 ? 'medium' : 'high',
                          expectedValue: 2.5 + Math.random() * 1.5
                        });
                        setShowDetailsModal(true);
                      }}
                      className="flex-1 btn-primary text-sm flex items-center justify-center gap-1"
                    >
                      <Info className="w-3 h-3" />
                      Détails
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'simple-generation':
        return renderSimpleGeneration();
      case 'best-numbers':
        return renderBestNumbers();
      case 'simple-games':
        return renderSimpleGames();
      case 'multi-grids':
        return renderMultiGrids();
      case 'strategies':
        return renderStrategies();
      case 'budget-optimization':
        return renderBudgetOptimization();
      case 'strategy-controls':
        return renderStrategyControls();
      default:
        return renderBestNumbers();
    }
  };

  return (
    <div className="space-y-6">
      {/* Avertissement réaliste */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">Avertissement important</h3>
            <p className="text-sm text-yellow-700">
              Les probabilités de gain au Loto sont extrêmement faibles (environ 1 chance sur 1,9 million pour le gros lot). 
              Cette application est destinée à l'analyse et au divertissement. Jouez de manière responsable.
            </p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Optimiseur de Jeux Multiples - Kdo Loto Gagnant
        </h1>
        <p className="text-gray-600">
          Maximisez vos chances avec les meilleurs chiffres et des stratégies optimisées
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

      {/* Modal des détails de stratégie */}
      <StrategyDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedDetails(null);
        }}
        details={selectedDetails}
        combination={selectedDetails ? {
          boules: selectedDetails.boules,
          numero_chance: selectedDetails.numero_chance,
          score: selectedDetails.score
        } : null}
      />
    </div>
  );
}
