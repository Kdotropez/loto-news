'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Calendar,
  Hash,
  Plus,
  Minus,
  Divide,
  Equal,
  ArrowRight,
  Zap,
  Brain,
  Activity,
  Clock,
  Calendar as CalendarIcon,
  BarChart,
  PieChart,
  LineChart,
  AlertTriangle,
  Search,
  Calculator,
  Layers,
  Compass
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
  Scatter
} from 'recharts';
import toast from 'react-hot-toast';

interface UltraAdvancedStatisticsData {
  recurrence_cycles: Array<{
    numero: number;
    average_cycle: number;
    min_cycle: number;
    max_cycle: number;
    current_cycle: number;
    cycle_variance: number;
    last_appearance: string;
    next_predicted: string;
    cycle_stability: 'stable' | 'variable' | 'irregular';
  }>;
  temporal_patterns: {
    day_of_week: { [key: string]: any };
    month_pattern: { [key: string]: any };
    season_pattern: { [key: string]: any };
    year_pattern: { [key: string]: any };
  };
  correlations: {
    pair_correlations: Array<{
      numero1: number;
      numero2: number;
      correlation_strength: number;
      co_occurrence_frequency: number;
      expected_frequency: number;
      significance: 'high' | 'medium' | 'low';
    }>;
    trio_correlations: Array<{
      numeros: number[];
      correlation_strength: number;
      co_occurrence_frequency: number;
      significance: 'high' | 'medium' | 'low';
    }>;
    anti_correlations: Array<{
      numero1: number;
      numero2: number;
      avoidance_strength: number;
      significance: 'high' | 'medium' | 'low';
    }>;
  };
  conditional_probabilities: Array<{
    numero: number;
    conditional_probabilities: Array<{
      given_number: number;
      probability: number;
      confidence: number;
      sample_size: number;
    }>;
    most_likely_companions: Array<{
      numero: number;
      probability: number;
    }>;
    least_likely_companions: Array<{
      numero: number;
      probability: number;
    }>;
  }>;
  mathematical_patterns: {
    fibonacci_sequences: Array<{
      sequence: number[];
      frequency: number;
      examples: Array<{
        date: string;
        numbers: number[];
      }>;
    }>;
    arithmetic_sequences: Array<{
      sequence: number[];
      difference: number;
      frequency: number;
    }>;
    geometric_sequences: Array<{
      sequence: number[];
      ratio: number;
      frequency: number;
    }>;
    prime_numbers: {
      frequency: number;
      percentage: number;
      most_common_primes: number[];
    };
    perfect_squares: {
      frequency: number;
      percentage: number;
      most_common_squares: number[];
    };
  };
  anomaly_detection: {
    outliers: Array<{
      date: string;
      numbers: number[];
      anomaly_type: 'extreme_sum' | 'unusual_pattern' | 'rare_combination';
      deviation_score: number;
      description: string;
    }>;
    unusual_patterns: Array<{
      pattern: string;
      frequency: number;
      expected_frequency: number;
      deviation: number;
      examples: Array<{
        date: string;
        numbers: number[];
      }>;
    }>;
    rare_events: Array<{
      event: string;
      frequency: number;
      last_occurrence: string;
      probability: number;
    }>;
  };
  geometric_patterns: {
    linear_patterns: Array<{
      pattern: string;
      frequency: number;
      examples: Array<{
        date: string;
        numbers: number[];
        coordinates: Array<{x: number, y: number}>;
      }>;
    }>;
    triangular_patterns: Array<{
      pattern: string;
      frequency: number;
      examples: Array<{
        date: string;
        numbers: number[];
      }>;
    }>;
    circular_patterns: Array<{
      pattern: string;
      frequency: number;
      radius: number;
      examples: Array<{
        date: string;
        numbers: number[];
      }>;
    }>;
  };
  complexity_analysis: {
    entropy_scores: Array<{
      date: string;
      numbers: number[];
      entropy: number;
      complexity_level: 'low' | 'medium' | 'high';
    }>;
    information_content: {
      average_entropy: number;
      max_entropy: number;
      min_entropy: number;
      entropy_distribution: Array<{
        entropy_range: string;
        frequency: number;
      }>;
    };
    pattern_diversity: {
      unique_patterns: number;
      pattern_frequency_distribution: Array<{
        pattern_type: string;
        frequency: number;
      }>;
    };
  };
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ffff00'];

interface UltraAdvancedStatisticsProps {
  analysisPeriod?: 'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100';
}

export default function UltraAdvancedStatistics({ analysisPeriod = 'last20' }: UltraAdvancedStatisticsProps) {
  const [data, setData] = useState<UltraAdvancedStatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cycles');

  useEffect(() => {
    fetchUltraAdvancedStatistics();
  }, [analysisPeriod]);

  const fetchUltraAdvancedStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analysis?type=ultra-advanced&period=${analysisPeriod}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data || null);
      } else {
        toast.error('Erreur lors du chargement des statistiques ultra-avancées');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des statistiques ultra-avancées');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'cycles', label: 'Cycles de récurrence', icon: Clock },
    { id: 'temporal', label: 'Patterns temporels', icon: CalendarIcon },
    { id: 'correlations', label: 'Corrélations', icon: Target },
    { id: 'conditional', label: 'Probabilités conditionnelles', icon: Calculator },
    { id: 'mathematical', label: 'Patterns mathématiques', icon: Brain },
    { id: 'anomalies', label: 'Détection d\'anomalies', icon: AlertTriangle },
    { id: 'geometric', label: 'Patterns géométriques', icon: Compass },
    { id: 'complexity', label: 'Analyse de complexité', icon: Layers }
  ];

  const renderRecurrenceCycles = () => {
    if (!data || !data.recurrence_cycles || !Array.isArray(data.recurrence_cycles)) return null;

    const stableCycles = data.recurrence_cycles.filter(c => c.cycle_stability === 'stable');
    const variableCycles = data.recurrence_cycles.filter(c => c.cycle_stability === 'variable');
    const irregularCycles = data.recurrence_cycles.filter(c => c.cycle_stability === 'irregular');

    const cycleData = data.recurrence_cycles.slice(0, 20).map(cycle => ({
      numero: cycle.numero,
      cycle: cycle.average_cycle,
      variance: cycle.cycle_variance,
      stability: cycle.cycle_stability
    }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold">Cycles stables</h3>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stableCycles?.length || 0}
            </div>
            <div className="text-sm text-gray-600">
              Numéros avec cycles prévisibles
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-semibold">Cycles variables</h3>
            </div>
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {variableCycles?.length || 0}
            </div>
            <div className="text-sm text-gray-600">
              Numéros avec cycles modérés
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold">Cycles irréguliers</h3>
            </div>
            <div className="text-3xl font-bold text-red-600 mb-2">
              {irregularCycles?.length || 0}
            </div>
            <div className="text-sm text-gray-600">
              Numéros imprévisibles
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Distribution des cycles</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RechartsBarChart data={cycleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="numero" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cycle" fill="#8884d8" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Cycles les plus stables</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Numéro</th>
                  <th className="text-left p-2">Cycle moyen</th>
                  <th className="text-left p-2">Variance</th>
                  <th className="text-left p-2">Stabilité</th>
                  <th className="text-left p-2">Dernière apparition</th>
                  <th className="text-left p-2">Prochaine prédite</th>
                </tr>
              </thead>
              <tbody>
                {stableCycles.slice(0, 10).map((cycle, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      <span className="inline-block w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-center leading-8">
                        {cycle.numero}
                      </span>
                    </td>
                    <td className="p-2 font-semibold">{cycle.average_cycle} jours</td>
                    <td className="p-2">{cycle.cycle_variance}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        cycle.cycle_stability === 'stable' ? 'bg-green-100 text-green-800' :
                        cycle.cycle_stability === 'variable' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {cycle.cycle_stability}
                      </span>
                    </td>
                    <td className="p-2">{new Date(cycle.last_appearance).toLocaleDateString('fr-FR')}</td>
                    <td className="p-2">{new Date(cycle.next_predicted).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderTemporalPatterns = () => {
    if (!data || !data.temporal_patterns) return null;

    const { temporal_patterns } = data;
    
    // Vérification sécurisée pour day_of_week
    const dayData = temporal_patterns.day_of_week && typeof temporal_patterns.day_of_week === 'object' 
      ? Object.entries(temporal_patterns.day_of_week).map(([day, stats]) => ({
          name: day,
          frequency: stats?.frequency || 0,
          percentage: stats?.percentage || 0
        }))
      : [];

    // Vérification sécurisée pour month_pattern
    const monthData = temporal_patterns.month_pattern && typeof temporal_patterns.month_pattern === 'object'
      ? Object.entries(temporal_patterns.month_pattern).map(([month, stats]) => ({
          name: month,
          frequency: stats?.frequency || 0,
          percentage: stats?.percentage || 0,
          average_sum: stats?.average_sum || 0
        }))
      : [];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Fréquence par jour de la semaine</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={dayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="frequency" fill="#82ca9d" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Fréquence par mois</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="frequency" fill="#ffc658" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Détails par jour de la semaine</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {temporal_patterns.day_of_week && typeof temporal_patterns.day_of_week === 'object' 
              ? Object.entries(temporal_patterns.day_of_week).map(([day, stats], index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarIcon className="w-5 h-5 text-blue-500" />
                  <h4 className="font-semibold">{day}</h4>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {stats?.frequency || 0}
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {(stats?.percentage || 0).toFixed(1)}% des tirages
                </div>
                <div className="text-sm">
                  <div className="font-semibold mb-2">Numéros chauds :</div>
                  <div className="flex flex-wrap gap-1">
                    {stats.hot_numbers.slice(0, 3).map((num: number) => (
                      <span key={num} className="inline-block w-6 h-6 bg-red-100 text-red-800 rounded-full text-center leading-6 text-xs">
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
              : <div className="col-span-full text-center text-gray-500 py-8">Aucune donnée disponible</div>
            }
          </div>
        </div>
      </div>
    );
  };

  const renderCorrelations = () => {
    if (!data || !data.correlations) return null;

    const { correlations } = data;
    
    // Vérification sécurisée pour pair_correlations
    const correlationData = correlations.pair_correlations && Array.isArray(correlations.pair_correlations)
      ? correlations.pair_correlations.slice(0, 15).map(corr => ({
          pair: `${corr.numero1}-${corr.numero2}`,
          strength: corr.correlation_strength || 0,
          significance: corr.significance || 0
        }))
      : [];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold">Corrélations positives</h3>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {correlations.pair_correlations?.length || 0}
            </div>
            <div className="text-sm text-gray-600">
              Paires de numéros corrélés
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Minus className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold">Anti-corrélations</h3>
            </div>
            <div className="text-3xl font-bold text-red-600 mb-2">
              {correlations.anti_correlations?.length || 0}
            </div>
            <div className="text-sm text-gray-600">
              Paires qui s'évitent
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-purple-500" />
              <h3 className="text-lg font-semibold">Trios corrélés</h3>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {correlations.trio_correlations?.length || 0}
            </div>
            <div className="text-sm text-gray-600">
              Groupes de 3 numéros
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Corrélations les plus fortes</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RechartsBarChart data={correlationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="pair" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="strength" fill="#8884d8" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Détails des corrélations</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Paire</th>
                  <th className="text-left p-2">Force de corrélation</th>
                  <th className="text-left p-2">Co-occurrences</th>
                  <th className="text-left p-2">Significance</th>
                </tr>
              </thead>
              <tbody>
                {correlations.pair_correlations && Array.isArray(correlations.pair_correlations)
                  ? correlations.pair_correlations.slice(0, 10).map((corr, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      <div className="flex gap-1">
                        <span className="inline-block w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-center leading-8">
                          {corr.numero1}
                        </span>
                        <span className="inline-block w-8 h-8 bg-green-100 text-green-800 rounded-full text-center leading-8">
                          {corr.numero2}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 font-semibold">{(corr.correlation_strength || 0).toFixed(2)}</td>
                    <td className="p-2">{corr.co_occurrence_frequency || 0}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        corr.significance === 'high' ? 'bg-red-100 text-red-800' :
                        corr.significance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {corr.significance}
                      </span>
                    </td>
                  </tr>
                ))
                  : <tr><td colSpan={4} className="text-center text-gray-500 py-4">Aucune donnée disponible</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderMathematicalPatterns = () => {
    if (!data || !data.mathematical_patterns) return null;

    const { mathematical_patterns } = data;
    
    // Vérification sécurisée pour fibonacci_sequences
    const fibData = mathematical_patterns.fibonacci_sequences && Array.isArray(mathematical_patterns.fibonacci_sequences)
      ? mathematical_patterns.fibonacci_sequences.slice(0, 10).map(seq => ({
          sequence: seq.sequence?.join('-') || '',
          frequency: seq.frequency || 0
        }))
      : [];

    // Vérification sécurisée pour arithmetic_sequences
    const arithData = mathematical_patterns.arithmetic_sequences && Array.isArray(mathematical_patterns.arithmetic_sequences)
      ? mathematical_patterns.arithmetic_sequences.slice(0, 10).map(seq => ({
          sequence: seq.sequence?.join('-') || '',
          frequency: seq.frequency || 0,
          difference: seq.difference || 0
        }))
      : [];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-purple-500" />
              <h3 className="text-lg font-semibold">Nombres premiers</h3>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {mathematical_patterns.prime_numbers?.frequency || 0}
            </div>
            <div className="text-sm text-gray-600 mb-3">
              {(mathematical_patterns.prime_numbers?.percentage || 0).toFixed(1)}% des numéros
            </div>
            <div className="text-sm">
              <div className="font-semibold mb-2">Plus fréquents :</div>
              <div className="flex flex-wrap gap-1">
                {mathematical_patterns.prime_numbers?.most_common_primes && Array.isArray(mathematical_patterns.prime_numbers.most_common_primes)
                  ? mathematical_patterns.prime_numbers.most_common_primes.map(num => (
                  <span key={num} className="inline-block w-6 h-6 bg-purple-100 text-purple-800 rounded-full text-center leading-6 text-xs">
                    {num}
                  </span>
                ))
                  : <span className="text-gray-500">Aucune donnée</span>
                }
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Calculator className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold">Carrés parfaits</h3>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {mathematical_patterns.perfect_squares?.frequency || 0}
            </div>
            <div className="text-sm text-gray-600 mb-3">
              {(mathematical_patterns.perfect_squares?.percentage || 0).toFixed(1)}% des numéros
            </div>
            <div className="text-sm">
              <div className="font-semibold mb-2">Plus fréquents :</div>
              <div className="flex flex-wrap gap-1">
                {mathematical_patterns.perfect_squares?.most_common_squares && Array.isArray(mathematical_patterns.perfect_squares.most_common_squares)
                  ? mathematical_patterns.perfect_squares.most_common_squares.map(num => (
                  <span key={num} className="inline-block w-6 h-6 bg-green-100 text-green-800 rounded-full text-center leading-6 text-xs">
                    {num}
                  </span>
                ))
                  : <span className="text-gray-500">Aucune donnée</span>
                }
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Séquences de Fibonacci</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={fibData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sequence" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="frequency" fill="#ffc658" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Séquences arithmétiques</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={arithData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sequence" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="frequency" fill="#82ca9d" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderAnomalyDetection = () => {
    if (!data) return null;

    const { anomaly_detection } = data;
    const outliers = anomaly_detection.outliers;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold">Anomalies détectées</h3>
          </div>
          <div className="text-3xl font-bold text-red-600 mb-2">
            {outliers?.length || 0}
          </div>
          <div className="text-sm text-gray-600">
            Tirages avec des caractéristiques exceptionnelles
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Détails des anomalies</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Numéros</th>
                  <th className="text-left p-2">Type d'anomalie</th>
                  <th className="text-left p-2">Score de déviation</th>
                  <th className="text-left p-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {outliers && Array.isArray(outliers)
                  ? outliers.slice(0, 15).map((outlier, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{new Date(outlier.date).toLocaleDateString('fr-FR')}</td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        {outlier.numbers && Array.isArray(outlier.numbers)
                          ? outlier.numbers.map(num => (
                          <span key={num} className="inline-block w-6 h-6 bg-red-100 text-red-800 rounded-full text-center leading-6 text-xs">
                            {num}
                          </span>
                        ))
                          : <span className="text-gray-500">Aucun numéro</span>
                        }
                      </div>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        outlier.anomaly_type === 'extreme_sum' ? 'bg-red-100 text-red-800' :
                        outlier.anomaly_type === 'unusual_pattern' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {outlier.anomaly_type}
                      </span>
                    </td>
                    <td className="p-2 font-semibold">{(outlier.deviation_score || 0).toFixed(2)}</td>
                    <td className="p-2 text-gray-600">{outlier.description}</td>
                  </tr>
                ))
                  : <tr><td colSpan={5} className="text-center text-gray-500 py-4">Aucune donnée disponible</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderComplexityAnalysis = () => {
    if (!data) return null;

    const { complexity_analysis } = data;
    const entropyData = complexity_analysis.information_content?.entropy_distribution || [];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Layers className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold">Entropie moyenne</h3>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {(complexity_analysis.information_content?.average_entropy || 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              Niveau de complexité moyen
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold">Entropie maximale</h3>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {(complexity_analysis.information_content?.max_entropy || 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              Complexité maximale observée
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-purple-500" />
              <h3 className="text-lg font-semibold">Patterns uniques</h3>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {complexity_analysis.pattern_diversity?.unique_patterns || 0}
            </div>
            <div className="text-sm text-gray-600">
              Types de patterns différents
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Distribution de l'entropie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={entropyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="entropy_range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="frequency" fill="#8884d8" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'cycles':
        return renderRecurrenceCycles();
      case 'temporal':
        return renderTemporalPatterns();
      case 'correlations':
        return renderCorrelations();
      case 'mathematical':
        return renderMathematicalPatterns();
      case 'anomalies':
        return renderAnomalyDetection();
      case 'complexity':
        return renderComplexityAnalysis();
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Analyse en cours de développement...</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Statistiques Ultra-Avancées - Kdo Loto Gagnant
        </h1>
        <p className="text-gray-600">
          Analyses sophistiquées de niveau professionnel avec IA et mathématiques avancées
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

