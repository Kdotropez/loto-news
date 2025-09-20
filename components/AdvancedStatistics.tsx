'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BarChart3, 
  Activity,
  Zap,
  Star,
  Award
} from 'lucide-react';

interface AdvancedStatisticsProps {
  data?: any;
  analysisPeriod?: 'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100';
}

const AdvancedStatistics: React.FC<AdvancedStatisticsProps> = ({ data, analysisPeriod = 'last20' }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadAdvancedStatistics();
  }, [analysisPeriod]);

  const loadAdvancedStatistics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/statistics?type=advanced&period=${analysisPeriod}`);
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques avancées:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucune donnée statistique disponible</p>
        <button
          onClick={loadAdvancedStatistics}
          className="mt-4 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          Charger les Statistiques
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary-600" />
              Statistiques Avancées
            </h2>
            <p className="text-gray-600 mt-1">
              Analyses approfondies des patterns et tendances
            </p>
          </div>
        </div>

        {/* Résumé des statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Tirages</p>
                <p className="text-3xl font-bold">{stats.totalTirages || 0}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Numéros Chauds</p>
                <p className="text-3xl font-bold">{stats.hotNumbers?.length || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Numéros Froids</p>
                <p className="text-3xl font-bold">{stats.coldNumbers?.length || 0}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Patterns Détectés</p>
                <p className="text-3xl font-bold">{stats.patterns?.length || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-600" />
              Fréquence des Numéros
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.frequencyData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="numero" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="frequency" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-primary-600" />
              Distribution des Patterns
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.patternDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(stats.patternDistribution || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedStatistics;