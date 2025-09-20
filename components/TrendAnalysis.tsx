'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Zap, Brain, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';

interface TrendData {
  periode: string;
  numeros_chauds: number[];
  numeros_froids: number[];
  numeros_equilibres: number[];
  evolution: {
    numero: number;
    evolution: number;
    tendance: 'hausse' | 'baisse' | 'stable';
  }[];
}

export default function TrendAnalysis() {
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTrendData();
  }, []);

  const loadTrendData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analysis?type=trends');
      const result = await response.json();
      
      if (result.success) {
        setTrendData(result.data);
      } else {
        toast.error('Erreur lors du chargement des données de tendances');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const getTendanceIcon = (tendance: string) => {
    switch (tendance) {
      case 'hausse':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'baisse':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTendanceColor = (tendance: string) => {
    switch (tendance) {
      case 'hausse':
        return 'text-green-600 bg-green-50';
      case 'baisse':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">Analyse des tendances en cours...</p>
        </div>
      </div>
    );
  }

  if (!trendData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Impossible de charger les données de tendances</p>
      </div>
    );
  }

  const { 
    numeros_chauds = [], 
    numeros_froids = [], 
    numeros_equilibres = [], 
    evolution = [] 
  } = trendData;

  // Préparer les données pour les graphiques avec vérification de sécurité
  const evolutionData = evolution.slice(0, 20).map(item => ({
    numero: item.numero,
    evolution: (item.evolution - 1) * 100, // Convertir en pourcentage
    tendance: item.tendance
  }));

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Analyse des tendances - Kdo Loto Gagnant
        </h1>
        <p className="text-gray-600">
          Découvrez l'évolution des numéros dans le temps
        </p>
      </motion.div>

      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Numéros chauds</p>
              <p className="text-2xl font-bold text-loto-red">{numeros_chauds.length}</p>
              <p className="text-xs text-gray-500">En hausse récente</p>
            </div>
            <div className="p-3 rounded-lg bg-loto-red">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Numéros froids</p>
              <p className="text-2xl font-bold text-loto-blue">{numeros_froids.length}</p>
              <p className="text-xs text-gray-500">En baisse récente</p>
            </div>
            <div className="p-3 rounded-lg bg-loto-blue">
              <Brain className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Numéros équilibrés</p>
              <p className="text-2xl font-bold text-loto-green">{numeros_equilibres.length}</p>
              <p className="text-xs text-gray-500">Stables</p>
            </div>
            <div className="p-3 rounded-lg bg-loto-green">
              <Minus className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Graphique d'évolution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          Évolution des numéros (Top 20)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={evolutionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="numero" />
            <YAxis label={{ value: 'Évolution (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value: any) => [`${value.toFixed(1)}%`, 'Évolution']}
              labelFormatter={(label) => `Numéro ${label}`}
            />
            <Bar 
              dataKey="evolution" 
              fill="#3b82f6"
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Numéros par catégorie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-loto-red" />
            Numéros chauds
          </h3>
          <div className="flex flex-wrap gap-2">
            {numeros_chauds.map((numero) => (
              <div
                key={numero}
                className="numero-boule numero-chaud"
                title="Numéro en hausse récente"
              >
                {numero}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Ces numéros ont une fréquence plus élevée dans la période récente
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-loto-blue" />
            Numéros froids
          </h3>
          <div className="flex flex-wrap gap-2">
            {numeros_froids.map((numero) => (
              <div
                key={numero}
                className="numero-boule numero-froid"
                title="Numéro en baisse récente"
              >
                {numero}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Ces numéros ont une fréquence plus faible dans la période récente
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Minus className="w-5 h-5 text-loto-green" />
            Numéros équilibrés
          </h3>
          <div className="flex flex-wrap gap-2">
            {numeros_equilibres.map((numero) => (
              <div
                key={numero}
                className="numero-boule numero-equilibre"
                title="Numéro stable"
              >
                {numero}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Ces numéros maintiennent une fréquence stable
          </p>
        </motion.div>
      </div>

      {/* Tableau d'évolution détaillé */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          Évolution détaillée des numéros
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Numéro</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Évolution</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Tendance</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
              </tr>
            </thead>
            <tbody>
              {evolution.slice(0, 30).map((item) => (
                <tr key={item.numero} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="numero-boule numero-equilibre">
                      {item.numero}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {((item.evolution - 1) * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4">
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getTendanceColor(item.tendance)}`}>
                      {getTendanceIcon(item.tendance)}
                      {item.tendance}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {item.evolution > 1.1 ? 'Chaud' : item.evolution < 0.9 ? 'Froid' : 'Équilibré'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
