'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Filter,
  Download,
  Calendar,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

interface FrequencyData {
  numero: number;
  frequency: number;
  percentage: number;
  lastAppearance: string;
  averageGap: number;
  tendance?: 'hausse' | 'baisse' | 'stable';
}

const COLORS = ['#e11d48', '#1e40af', '#059669', '#d97706', '#7c3aed'];

interface FrequencyAnalysisProps {
  analysisPeriod?: 'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100';
}

export default function FrequencyAnalysis({ analysisPeriod = 'last20' }: FrequencyAnalysisProps) {
  const [frequencyData, setFrequencyData] = useState<FrequencyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'chauds' | 'froids' | 'equilibres'>('all');
  const [sortBy, setSortBy] = useState<'frequency' | 'gap' | 'numero'>('frequency');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });

  useEffect(() => {
    loadFrequencyData();
  }, [dateRange, analysisPeriod]);

  const loadFrequencyData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      params.append('period', analysisPeriod);
      
      const response = await fetch(`/api/analysis?type=frequency&${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        const data = result.data?.frequencies || result.data || [];
        setFrequencyData(Array.isArray(data) ? data : []);
      } else {
        toast.error('Erreur lors du chargement des données de fréquence');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredData = () => {
    let filtered = [...frequencyData];

    // Appliquer le filtre
    switch (filter) {
      case 'chauds':
        filtered = filtered.filter(item => item.frequency > 50);
        break;
      case 'froids':
        filtered = filtered.filter(item => item.frequency < 30);
        break;
      case 'equilibres':
        filtered = filtered.filter(item => item.frequency >= 30 && item.frequency <= 50);
        break;
    }

    // Appliquer le tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'frequency':
          return b.frequency - a.frequency;
        case 'gap':
          return b.averageGap - a.averageGap;
        case 'numero':
          return a.numero - b.numero;
        default:
          return 0;
      }
    });

    return filtered;
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

  const getNumeroColor = (frequency: number) => {
    if (frequency > 50) return 'numero-chaud';
    if (frequency < 30) return 'numero-froid';
    return 'numero-equilibre';
  };

  const exportData = () => {
    const csvContent = [
      ['Numéro', 'Fréquence', 'Pourcentage', 'Dernière sortie', 'Écart actuel', 'Tendance'],
      ...getFilteredData().map(item => [
        item.numero,
        item.frequency,
        item.percentage.toFixed(2),
        item.lastAppearance,
        item.averageGap,
        item.tendance
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analyse-frequence-loto-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Données exportées avec succès');
  };

  const filteredData = getFilteredData();
  const chartData = filteredData.slice(0, 20).map(item => ({
    numero: item.numero,
    frequency: item.frequency,
    percentage: item.percentage
  }));

  const pieData = [
    { name: 'Chauds', value: filteredData.filter(item => item.frequency > 50).length, color: '#e11d48' },
    { name: 'Équilibrés', value: filteredData.filter(item => item.frequency >= 30 && item.frequency <= 50).length, color: '#059669' },
    { name: 'Froids', value: filteredData.filter(item => item.frequency < 30).length, color: '#1e40af' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">Analyse des fréquences en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Analyse des fréquences - Kdo Loto Gagnant
        </h1>
        <p className="text-gray-600">
          Découvrez quels numéros sortent le plus souvent
        </p>
      </motion.div>

      {/* Filtres et contrôles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filtres:</span>
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="input-field w-auto"
          >
            <option value="all">Tous les numéros</option>
            <option value="chauds">Numéros chauds</option>
            <option value="froids">Numéros froids</option>
            <option value="equilibres">Numéros équilibrés</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="input-field w-auto"
          >
            <option value="frequency">Trier par fréquence</option>
            <option value="gap">Trier par écart</option>
            <option value="numero">Trier par numéro</option>
          </select>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="input-field w-auto"
              placeholder="Date de début"
            />
            <span className="text-gray-500">à</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="input-field w-auto"
              placeholder="Date de fin"
            />
          </div>

          <button
            onClick={exportData}
            className="btn-secondary flex items-center gap-2 ml-auto"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </motion.div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            Top 20 des numéros les plus fréquents
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="numero" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  name === 'frequency' ? `${value} fois` : `${value.toFixed(1)}%`,
                  name === 'frequency' ? 'Fréquence' : 'Pourcentage'
                ]}
              />
              <Bar dataKey="frequency" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            Répartition des numéros
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${typeof value === 'number' ? value.toFixed(0) : '0'}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Tableau détaillé */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Analyse détaillée des fréquences
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Numéro</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Fréquence</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Pourcentage</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Dernière sortie</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Écart actuel</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Tendance</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.numero} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className={`numero-boule ${getNumeroColor(item.frequency)}`}>
                      {item.numero}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {item.frequency} fois
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {item.percentage.toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {item.lastAppearance ? new Date(item.lastAppearance).toLocaleDateString('fr-FR') : 'Jamais'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {item.averageGap} jours
                  </td>
                  <td className="py-3 px-4">
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getTendanceColor(item.tendance || 'stable')}`}>
                      {getTendanceIcon(item.tendance || 'stable')}
                      {item.tendance || 'stable'}
                    </div>
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
