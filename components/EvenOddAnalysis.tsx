'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Target,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface EvenOddData {
  totalTirages: number;
  distributions: Array<{
    pattern: string;
    count: number;
    percentage: number;
    description: string;
  }>;
  optimalDistribution: {
    recommended: string;
    frequency: number;
    percentage: number;
  };
  statistics: {
    averageEven: number;
    averageOdd: number;
    mostCommon: string;
    leastCommon: string;
  };
}

export default function EvenOddAnalysis() {
  const [data, setData] = useState<EvenOddData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/analysis?type=even-odd-distribution');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données pair/impair:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">Chargement de l'analyse pair/impair...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Impossible de charger les données pair/impair</p>
      </div>
    );
  }

  // Préparer les données pour les graphiques
  const chartData = data.distributions.map(item => ({
    pattern: item.pattern,
    count: item.count,
    percentage: item.percentage,
    description: item.description
  }));

  const pieData = data.distributions.map(item => ({
    name: item.description,
    value: item.percentage,
    count: item.count
  }));

  const COLORS = ['#e11d48', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'];

  const getPatternColor = (pattern: string) => {
    const colors: Record<string, string> = {
      '5P-0I': '#e11d48', // Tous pairs - Rouge
      '4P-1I': '#f59e0b', // 4 pairs, 1 impair - Orange
      '3P-2I': '#10b981', // 3 pairs, 2 impairs - Vert
      '2P-3I': '#3b82f6', // 2 pairs, 3 impairs - Bleu
      '1P-4I': '#8b5cf6', // 1 pair, 4 impairs - Violet
      '0P-5I': '#ef4444', // Tous impairs - Rouge foncé
    };
    return colors[pattern] || '#6b7280';
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg"
      >
        <h1 className="text-3xl font-bold mb-2">📊 Analyse Pair/Impair</h1>
        <p className="text-purple-100">
          Répartition des numéros pairs et impairs dans les tirages historiques
        </p>
      </motion.div>

      {/* Statistiques principales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{data.statistics.averageEven.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Moyenne pairs par tirage</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">{data.statistics.averageOdd.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Moyenne impairs par tirage</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{data.optimalDistribution.percentage.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Distribution optimale</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">{data.totalTirages.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Tirages analysés</div>
        </div>
      </motion.div>

      {/* Recommandation stratégique */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-600" />
          🎯 Recommandation Stratégique
        </h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-800">
                Distribution optimale : {data.optimalDistribution.recommended}
              </h4>
              <p className="text-green-700 text-sm">
                Cette répartition apparaît dans {data.optimalDistribution.frequency} tirages 
                ({data.optimalDistribution.percentage.toFixed(1)}% des cas)
              </p>
            </div>
          </div>
          <div className="mt-3 text-sm text-green-700">
            <strong>Stratégie recommandée :</strong> Privilégiez les combinaisons avec cette répartition 
            pair/impair pour maximiser vos chances de correspondance avec les tirages futurs.
          </div>
        </div>
      </motion.div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graphique en barres */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Répartition des Distributions
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="pattern" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={10}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  name === 'count' ? `${value} tirages` : `${value.toFixed(1)}%`,
                  name === 'count' ? 'Nombre' : 'Pourcentage'
                ]}
                labelFormatter={(label) => `Pattern ${label}`}
              />
              <Bar 
                dataKey="count" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Graphique en secteurs */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-purple-600" />
            Distribution en Pourcentages
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${typeof value === 'number' ? value.toFixed(1) : '0'}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: string) => [
                  `${value.toFixed(1)}%`,
                  'Pourcentage'
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Tableau détaillé */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-gray-600" />
          📋 Détail des Distributions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold">Pattern</th>
                <th className="text-left py-3 px-4 font-semibold">Description</th>
                <th className="text-right py-3 px-4 font-semibold">Occurrences</th>
                <th className="text-right py-3 px-4 font-semibold">Pourcentage</th>
                <th className="text-center py-3 px-4 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {data.distributions.map((item, index) => (
                <tr key={item.pattern} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span 
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: getPatternColor(item.pattern) }}
                    ></span>
                    <span className="font-mono font-semibold">{item.pattern}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{item.description}</td>
                  <td className="py-3 px-4 text-right font-semibold">{item.count.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.percentage > 15 ? 'bg-green-100 text-green-800' :
                      item.percentage > 10 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.percentage.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {index === 0 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Optimal
                      </span>
                    ) : item.percentage < 5 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Rare
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Normal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Conseils stratégiques */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          💡 Conseils Stratégiques
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">🎯 Stratégie Optimale</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Privilégiez la distribution {data.optimalDistribution.recommended}</li>
              <li>• Évitez les distributions trop rares (&lt;5%)</li>
              <li>• Équilibrez vos combinaisons selon les statistiques</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">📈 Analyse des Tendances</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Moyenne de {data.statistics.averageEven.toFixed(1)} pairs par tirage</li>
              <li>• Moyenne de {data.statistics.averageOdd.toFixed(1)} impairs par tirage</li>
              <li>• Distribution la plus rare : {data.statistics.leastCommon}</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

