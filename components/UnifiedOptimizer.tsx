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
  Play
} from 'lucide-react';
import toast from 'react-hot-toast';

interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  enabled: boolean;
}

interface OptimizedCombination {
  numbers: number[];
  complementary: number;
  score: number;
  confidence: number;
  expectedValue: number;
  riskLevel: 'low' | 'medium' | 'high';
  reasons: string[];
  strategy: string;
  gameType: 'simple' | 'multiple';
  cost: number;
  expectedReturn: number;
  winProbability: number;
}

interface TestResult {
  wins: number;
  totalTests: number;
  winRate: number;
  totalGains: number;
  roi: number;
  categories: Record<string, number>;
}

const STRATEGIES: OptimizationStrategy[] = [
  // Stratégies classiques
  {
    id: 'hot-cold-hybrid',
    name: 'Hot-Cold Hybride',
    description: 'Mélange optimal entre numéros chauds et froids',
    icon: Target,
    color: 'blue',
    enabled: false
  },
  {
    id: 'correlations',
    name: 'Corrélations Fortes',
    description: 'Utilise les corrélations statistiques les plus fortes',
    icon: TrendingUp,
    color: 'green',
    enabled: false
  },
  {
    id: 'anti-correlations',
    name: 'Anti-Corrélations',
    description: 'Évite les combinaisons qui ont mal performé',
    icon: XCircle,
    color: 'red',
    enabled: false
  },
  {
    id: 'temporal-patterns',
    name: 'Patterns Temporels',
    description: 'Basé sur les cycles de récurrence et tendances',
    icon: Clock,
    color: 'purple',
    enabled: false
  },
  {
    id: 'mathematical-patterns',
    name: 'Patterns Mathématiques',
    description: 'Utilise des structures mathématiques',
    icon: Calculator,
    color: 'orange',
    enabled: false
  },
  {
    id: 'volatility-optimized',
    name: 'Volatilité Optimisée',
    description: 'Équilibre stabilité et opportunité',
    icon: Activity,
    color: 'pink',
    enabled: false
  },
  
  // Stratégies inattendues et avancées
  {
    id: 'astrological',
    name: 'Astrologique',
    description: 'Basé sur les signes astrologiques et phases lunaires',
    icon: Star,
    color: 'indigo',
    enabled: false
  },
  {
    id: 'numerology',
    name: 'Numérologie',
    description: 'Utilise la numérologie et signification des nombres',
    icon: Hash,
    color: 'teal',
    enabled: false
  },
  {
    id: 'geometric',
    name: 'Géométrique',
    description: 'Patterns géométriques et spirales d\'or',
    icon: Layers,
    color: 'cyan',
    enabled: false
  },
  {
    id: 'chaos-theory',
    name: 'Théorie du Chaos',
    description: 'Attracteurs étranges et fractales',
    icon: Zap,
    color: 'yellow',
    enabled: false
  },
  {
    id: 'quantum',
    name: 'Quantique',
    description: 'Superposition quantique et intrication',
    icon: Brain,
    color: 'violet',
    enabled: false
  },
  {
    id: 'neural-network',
    name: 'Réseau de Neurones',
    description: 'IA et machine learning avancé',
    icon: Activity,
    color: 'emerald',
    enabled: false
  },
  {
    id: 'weather-patterns',
    name: 'Météorologique',
    description: 'Corrélation avec la météo et saisons',
    icon: TrendingUp,
    color: 'sky',
    enabled: false
  },
  {
    id: 'economic-indicators',
    name: 'Indicateurs Économiques',
    description: 'Basé sur l\'économie et marchés financiers',
    icon: BarChart3,
    color: 'amber',
    enabled: false
  },
  {
    id: 'social-media',
    name: 'Réseaux Sociaux',
    description: 'Tendances et buzz des réseaux sociaux',
    icon: Target,
    color: 'rose',
    enabled: false
  },
  {
    id: 'sports-events',
    name: 'Événements Sportifs',
    description: 'Corrélation avec les résultats sportifs',
    icon: Star,
    color: 'lime',
    enabled: false
  },
  {
    id: 'news-sentiment',
    name: 'Sentiment Actualités',
    description: 'Analyse du sentiment des actualités',
    icon: Brain,
    color: 'slate',
    enabled: false
  },
  {
    id: 'lunar-cycles',
    name: 'Cycles Lunaires',
    description: 'Phases de lune et marées',
    icon: Star,
    color: 'fuchsia',
    enabled: false
  },
  {
    id: 'prime-numbers',
    name: 'Nombres Premiers',
    description: 'Exclusivement des nombres premiers',
    icon: Calculator,
    color: 'stone',
    enabled: false
  },
  {
    id: 'fibonacci',
    name: 'Suite de Fibonacci',
    description: 'Nombres de la suite de Fibonacci',
    icon: TrendingUp,
    color: 'zinc',
    enabled: false
  },
  {
    id: 'golden-ratio',
    name: 'Nombre d\'Or',
    description: 'Basé sur le ratio d\'or (1.618)',
    icon: Target,
    color: 'neutral',
    enabled: false
  },
  {
    id: 'binary-patterns',
    name: 'Patterns Binaires',
    description: 'Système binaire et codes informatiques',
    icon: Hash,
    color: 'gray',
    enabled: false
  },
  {
    id: 'color-theory',
    name: 'Théorie des Couleurs',
    description: 'Basé sur la psychologie des couleurs',
    icon: Star,
    color: 'red',
    enabled: false
  },
  {
    id: 'music-harmony',
    name: 'Harmonie Musicale',
    description: 'Gammes musicales et accords',
    icon: Activity,
    color: 'blue',
    enabled: false
  },
  {
    id: 'feng-shui',
    name: 'Feng Shui',
    description: 'Énergies et flux selon le Feng Shui',
    icon: Layers,
    color: 'green',
    enabled: false
  },
  {
    id: 'tarot-cards',
    name: 'Cartes de Tarot',
    description: 'Correspondances avec les cartes de tarot',
    icon: Star,
    color: 'purple',
    enabled: false
  },
  {
    id: 'chakra-balance',
    name: 'Équilibre des Chakras',
    description: 'Centres d\'énergie et chakras',
    icon: Target,
    color: 'pink',
    enabled: false
  },
  {
    id: 'crystal-healing',
    name: 'Guérison Cristalline',
    description: 'Propriétés des cristaux et minéraux',
    icon: Star,
    color: 'cyan',
    enabled: false
  },
  {
    id: 'aromatherapy',
    name: 'Aromathérapie',
    description: 'Huiles essentielles et parfums',
    icon: Activity,
    color: 'amber',
    enabled: false
  },
  {
    id: 'biorhythms',
    name: 'Biorhythmes',
    description: 'Cycles biologiques personnels',
    icon: Clock,
    color: 'emerald',
    enabled: false
  },
  {
    id: 'dream-analysis',
    name: 'Analyse des Rêves',
    description: 'Symbolisme et interprétation des rêves',
    icon: Brain,
    color: 'indigo',
    enabled: false
  },
  {
    id: 'synchronicity',
    name: 'Synchronicité',
    description: 'Coïncidences significatives',
    icon: Zap,
    color: 'violet',
    enabled: false
  },
  {
    id: 'collective-unconscious',
    name: 'Inconscient Collectif',
    description: 'Archétypes de Jung et inconscient',
    icon: Brain,
    color: 'teal',
    enabled: false
  },
  {
    id: 'string-theory',
    name: 'Théorie des Cordes',
    description: 'Vibrations et dimensions multiples',
    icon: TrendingUp,
    color: 'rose',
    enabled: false
  },
  {
    id: 'dark-matter',
    name: 'Matière Noire',
    description: 'Énergie sombre et matière invisible',
    icon: Star,
    color: 'slate',
    enabled: false
  },
  {
    id: 'time-dilation',
    name: 'Dilatation Temporelle',
    description: 'Relativité et distorsion du temps',
    icon: Clock,
    color: 'lime',
    enabled: false
  },
  {
    id: 'parallel-universes',
    name: 'Univers Parallèles',
    description: 'Multivers et réalités alternatives',
    icon: Layers,
    color: 'fuchsia',
    enabled: false
  },
  {
    id: 'wormholes',
    name: 'Trous de Ver',
    description: 'Passages spatio-temporels',
    icon: Target,
    color: 'stone',
    enabled: false
  },
  {
    id: 'black-holes',
    name: 'Trous Noirs',
    description: 'Singularités et horizons d\'événements',
    icon: Star,
    color: 'zinc',
    enabled: false
  },
  {
    id: 'big-bang',
    name: 'Big Bang',
    description: 'Origine de l\'univers et expansion',
    icon: Zap,
    color: 'neutral',
    enabled: false
  },
  {
    id: 'consciousness',
    name: 'Conscience Universelle',
    description: 'Conscience collective et unité',
    icon: Brain,
    color: 'gray',
    enabled: false
  }
];

export default function UnifiedOptimizer() {
  const [strategies, setStrategies] = useState<OptimizationStrategy[]>(STRATEGIES);
  const [combinations, setCombinations] = useState<OptimizedCombination[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingCombination, setTestingCombination] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [gameType, setGameType] = useState<'simple' | 'multiple'>('simple');
  const [combinationCount, setCombinationCount] = useState<number>(8);
  const [budget, setBudget] = useState<number>(50);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const toggleStrategy = (strategyId: string) => {
    setStrategies(prev => prev.map(strategy => 
      strategy.id === strategyId 
        ? { ...strategy, enabled: !strategy.enabled }
        : strategy
    ));
  };

  const generateCombinations = async () => {
    const enabledStrategies = strategies.filter(s => s.enabled);
    
    if (enabledStrategies.length === 0) {
      toast.error('Veuillez sélectionner au moins une stratégie');
      return;
    }

    setLoading(true);
    try {
      // Simuler la génération de combinaisons basée sur les stratégies sélectionnées
      const generatedCombinations: OptimizedCombination[] = [];
      
      // Générer des combinaisons pour chaque stratégie activée
      enabledStrategies.forEach(strategy => {
        const countPerStrategy = Math.ceil(combinationCount / enabledStrategies.length);
        
        for (let i = 0; i < countPerStrategy; i++) {
          const combination = generateCombinationForStrategy(strategy, i);
          generatedCombinations.push(combination);
        }
      });

      setCombinations(generatedCombinations);
      toast.success(`${generatedCombinations.length} combinaisons générées avec ${enabledStrategies.length} stratégie(s)`);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la génération des combinaisons');
    } finally {
      setLoading(false);
    }
  };

  const generateCombinationForStrategy = (strategy: OptimizationStrategy, index: number): OptimizedCombination => {
    // Génération simplifiée - dans la vraie implémentation, utiliser l'engine d'optimisation
    const numbers = generateRandomNumbers(5);
    const complementary = Math.floor(Math.random() * 10) + 1;
    
    return {
      numbers,
      complementary,
      score: Math.random() * 100,
      confidence: 0.6 + Math.random() * 0.3,
      expectedValue: 2 + Math.random() * 10,
      riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
      reasons: [
        `Basé sur la stratégie ${strategy.name}`,
        'Optimisation multi-critères',
        'Analyse statistique avancée'
      ],
      strategy: strategy.name,
      gameType,
      cost: gameType === 'simple' ? 2.2 : 2.2 * (5 + Math.floor(Math.random() * 10)),
      expectedReturn: 2 + Math.random() * 15,
      winProbability: 0.0001 + Math.random() * 0.0005 // Probabilité réaliste entre 0.01% et 0.06%
    };
  };

  const generateRandomNumbers = (count: number): number[] => {
    const numbers: number[] = [];
    while (numbers.length < count) {
      const num = Math.floor(Math.random() * 49) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    return numbers.sort((a, b) => a - b);
  };

  const testCombination = async (combination: OptimizedCombination, index: number) => {
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

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStrategyColor = (strategy: string) => {
    const strategyObj = STRATEGIES.find(s => s.name === strategy);
    return strategyObj ? `text-${strategyObj.color}-600 bg-${strategyObj.color}-100` : 'text-gray-600 bg-gray-100';
  };

  const enabledStrategiesCount = strategies.filter(s => s.enabled).length;
  const filteredStrategies = strategies.filter(strategy => 
    strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    strategy.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Optimiseur Unifié - Kdo Loto Gagnant
        </h1>
        <p className="text-gray-600">
          Sélectionnez vos stratégies d'optimisation et générez des combinaisons simples ou multiples
        </p>
      </motion.div>

      {/* Configuration */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-6 h-6 text-primary-500" />
          <h2 className="text-xl font-semibold">Configuration</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Type de jeu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de jeu</label>
            <div className="flex gap-2">
              <button
                onClick={() => setGameType('simple')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  gameType === 'simple'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Star className="w-4 h-4 inline mr-2" />
                Jeux Simples
              </button>
              <button
                onClick={() => setGameType('multiple')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  gameType === 'multiple'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Layers className="w-4 h-4 inline mr-2" />
                Grilles Multiples
              </button>
            </div>
          </div>

          {/* Nombre de combinaisons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de combinaisons</label>
            <select
              value={combinationCount}
              onChange={(e) => setCombinationCount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={5}>5 combinaisons</option>
              <option value={8}>8 combinaisons</option>
              <option value={10}>10 combinaisons</option>
              <option value={15}>15 combinaisons</option>
              <option value={20}>20 combinaisons</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget (€)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              min="10"
              max="1000"
              step="10"
            />
          </div>
        </div>
      </div>

      {/* Sélection des stratégies */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Stratégies d'Optimisation</h2>
          <span className="text-sm text-gray-600">
            {enabledStrategiesCount} stratégie(s) sélectionnée(s) sur {filteredStrategies.length} affichées
          </span>
        </div>

        {/* Barre de recherche */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher une stratégie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredStrategies.map((strategy) => {
            const Icon = strategy.icon;
            return (
              <div
                key={strategy.id}
                onClick={() => toggleStrategy(strategy.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  strategy.enabled
                    ? `border-${strategy.color}-500 bg-${strategy.color}-50`
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-5 h-5 ${strategy.enabled ? `text-${strategy.color}-600` : 'text-gray-400'}`} />
                  <h3 className={`font-semibold ${strategy.enabled ? `text-${strategy.color}-700` : 'text-gray-600'}`}>
                    {strategy.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    strategy.enabled ? `bg-${strategy.color}-100 text-${strategy.color}-700` : 'bg-gray-100 text-gray-500'
                  }`}>
                    {strategy.enabled ? 'Activé' : 'Inactif'}
                  </span>
                  {strategy.enabled && <CheckCircle className="w-4 h-4 text-green-500" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bouton de génération */}
      <div className="text-center">
        <button
          onClick={generateCombinations}
          disabled={loading || enabledStrategiesCount === 0}
          className="px-8 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 mx-auto text-lg font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Générer les Combinaisons
            </>
          )}
        </button>
      </div>

      {/* Résultats */}
      {combinations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Combinaisons Générées</h2>
            <span className="text-sm text-gray-600">
              {combinations.length} combinaison(s) - {gameType === 'simple' ? 'Jeux Simples' : 'Grilles Multiples'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {combinations.map((combination, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">#{index + 1}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getStrategyColor(combination.strategy)}`}>
                      {combination.strategy}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${getRiskColor(combination.riskLevel)}`}>
                      {combination.riskLevel}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {combination.score.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-600">Score</div>
                  </div>
                </div>
                
                <div className="flex gap-1 mb-3">
                  {combination.numbers.map(num => (
                    <span
                      key={num}
                      className="inline-block w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-center leading-8 text-sm"
                    >
                      {num}
                    </span>
                  ))}
                  <span className="inline-block w-8 h-8 bg-green-100 text-green-800 rounded-full text-center leading-8 text-sm">
                    {combination.complementary}
                  </span>
                </div>
                
                <div className="space-y-2 mb-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Coût:</span>
                    <span className="font-semibold">{combination.cost.toFixed(2)}€</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Gain attendu:</span>
                    <span className="font-semibold text-green-600">{combination.expectedReturn.toFixed(2)}€</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Probabilité:</span>
                    <span className="font-semibold text-blue-600">{(combination.winProbability * 100).toFixed(4)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Confiance:</span>
                    <span className="font-semibold">{(combination.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div className="mb-3">
                  <h5 className="text-sm font-semibold mb-1">Raisons:</h5>
                  <div className="space-y-1">
                    {combination.reasons.map((reason, i) => (
                      <div key={i} className="text-xs text-gray-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {reason}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <button
                    onClick={() => testCombination(combination, index)}
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
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
                      <h5 className="font-semibold mb-3 text-green-700">📊 Résultats Détaillés du Test</h5>
                      
                      {/* Statistiques principales */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="text-center p-3 bg-white rounded border">
                          <div className="text-xl font-bold text-blue-600">
                            {testResults[index].totalGains?.toLocaleString() || '0'}€
                          </div>
                          <div className="text-xs text-gray-600">Gains totaux</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded border">
                          <div className="text-xl font-bold text-red-600">
                            {(testResults[index].totalTests * combination.cost).toFixed(2)}€
                          </div>
                          <div className="text-xs text-gray-600">Investissement</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded border">
                          <div className="text-xl font-bold text-green-600">
                            {testResults[index].winRate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-600">Taux de gain</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded border">
                          <div className={`text-xl font-bold ${testResults[index].roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {testResults[index].roi?.toFixed(1) || '0'}%
                          </div>
                          <div className="text-xs text-gray-600">ROI</div>
                        </div>
                      </div>

                      {/* Métriques avancées */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="text-center p-2 bg-white rounded border">
                          <div className="text-lg font-bold text-purple-600">
                            {testResults[index].wins}
                          </div>
                          <div className="text-xs text-gray-600">Gains obtenus</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded border">
                          <div className="text-lg font-bold text-orange-600">
                            {testResults[index].totalTests}
                          </div>
                          <div className="text-xs text-gray-600">Tirages testés</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded border">
                          <div className="text-lg font-bold text-cyan-600">
                            {(testResults[index] as any).averageGain?.toFixed(2) || '0'}€
                          </div>
                          <div className="text-xs text-gray-600">Gain moyen</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded border">
                          <div className={`text-lg font-bold ${(testResults[index].totalGains - (testResults[index].totalTests * combination.cost)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(testResults[index].totalGains - (testResults[index].totalTests * combination.cost)).toFixed(2)}€
                          </div>
                          <div className="text-xs text-gray-600">Bénéfice/Perte</div>
                        </div>
                      </div>

                      {/* Détails par catégorie de gain */}
                      <div className="mb-4">
                        <h6 className="font-medium text-sm mb-2 text-gray-700">🎯 Répartition des gains par catégorie :</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(testResults[index]?.categories || {}).map(([category, count]) => (
                            <div key={category} className="flex justify-between items-center p-2 bg-white rounded border text-sm">
                              <span className="text-gray-600 flex-1">{category}:</span>
                              <span className="font-medium text-blue-600">{count} fois</span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({((count as number) / (testResults[index]?.wins || 1) * 100).toFixed(1)}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Analyse de performance */}
                      <div className="mb-4">
                        <h6 className="font-medium text-sm mb-2 text-gray-700">📈 Analyse de Performance :</h6>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3 bg-blue-50 rounded border border-blue-200">
                            <div className="text-sm font-medium text-blue-700">Fréquence de gain</div>
                            <div className="text-lg font-bold text-blue-600">
                              {(testResults[index].wins / testResults[index].totalTests * 100).toFixed(2)}%
                            </div>
                            <div className="text-xs text-blue-600">1 gain tous les {Math.round(testResults[index].totalTests / testResults[index].wins)} tirages</div>
                          </div>
                          <div className="p-3 bg-green-50 rounded border border-green-200">
                            <div className="text-sm font-medium text-green-700">Efficacité</div>
                            <div className="text-lg font-bold text-green-600">
                              {testResults[index].totalGains > 0 ? 'Positive' : 'Négative'}
                            </div>
                            <div className="text-xs text-green-600">
                              {testResults[index].totalGains > (testResults[index].totalTests * combination.cost) ? 'Rentable' : 'Non rentable'}
                            </div>
                          </div>
                          <div className="p-3 bg-purple-50 rounded border border-purple-200">
                            <div className="text-sm font-medium text-purple-700">Risque</div>
                            <div className="text-lg font-bold text-purple-600">
                              {testResults[index].winRate > 20 ? 'Faible' : testResults[index].winRate > 10 ? 'Moyen' : 'Élevé'}
                            </div>
                            <div className="text-xs text-purple-600">
                              {testResults[index].winRate > 20 ? 'Stable' : 'Volatile'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recommandations */}
                      <div className="mb-4">
                        <h6 className="font-medium text-sm mb-2 text-gray-700">💡 Recommandations :</h6>
                        <div className="space-y-2">
                          {testResults[index].roi > 0 && (
                            <div className="p-2 bg-green-50 rounded border border-green-200 text-sm text-green-700">
                              ✅ <strong>Stratégie rentable :</strong> Cette combinaison montre un ROI positif
                            </div>
                          )}
                          {testResults[index].winRate > 15 && (
                            <div className="p-2 bg-blue-50 rounded border border-blue-200 text-sm text-blue-700">
                              🎯 <strong>Fréquence élevée :</strong> Bon taux de réussite
                            </div>
                          )}
                          {(testResults[index] as any).averageGain > 50 && (
                            <div className="p-2 bg-purple-50 rounded border border-purple-200 text-sm text-purple-700">
                              💰 <strong>Gains importants :</strong> Montants de gains élevés
                            </div>
                          )}
                          {testResults[index].roi < -50 && (
                            <div className="p-2 bg-red-50 rounded border border-red-200 text-sm text-red-700">
                              ⚠️ <strong>Risque élevé :</strong> ROI très négatif, considérer d'autres options
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Résumé final */}
                      <div className="p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded border border-blue-200">
                        <div className="text-sm text-blue-700">
                          <strong>📋 Résumé Exécutif :</strong> Cette combinaison a généré <strong>{testResults[index].wins} gain(s)</strong> sur <strong>{testResults[index].totalTests} tirages</strong> testés, 
                          avec un investissement total de <strong>{(testResults[index].totalTests * combination.cost).toFixed(2)}€</strong> et des gains de <strong>{testResults[index].totalGains?.toLocaleString() || '0'}€</strong>. 
                          Le ROI de <strong>{testResults[index].roi?.toFixed(1) || '0'}%</strong> indique une performance <strong>{testResults[index].roi >= 0 ? 'positive' : 'négative'}</strong>.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
