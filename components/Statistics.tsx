'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, BarChart3, TrendingUp, Calendar, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

interface StatisticsData {
  totalTirages: number;
  derniereMiseAJour: string;
  numerosChauds: Array<{ numero: number; frequence: number }>;
  numerosFroids: Array<{ numero: number; frequence: number }>;
  moyenneTiragesParMois: number;
}

interface NumerosStats {
  numero: number;
  frequence: number;
  derniere_sortie: string;
  ecart_moyen: number;
  ecart_actuel: number;
}

interface StatisticsProps {
  analysisPeriod?: 'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100';
}

export default function Statistics({ analysisPeriod = 'last20' }: StatisticsProps) {
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(null);
  const [numerosStats, setNumerosStats] = useState<NumerosStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [analysisPeriod]);

  const loadStatistics = async () => {
    setIsLoading(true);
    try {
      // Charger les statistiques générales
      const summaryResponse = await fetch('/api/statistics?type=summary');
      const summaryResult = await summaryResponse.json();

      // Charger les statistiques détaillées des numéros
      const numerosResponse = await fetch(`/api/statistics?type=numeros&period=${analysisPeriod}`);
      const numerosResult = await numerosResponse.json();

      if (summaryResult.success && numerosResult.success) {
        setStatisticsData(summaryResult.data);
        setNumerosStats(numerosResult.data);
      } else {
        toast.error('Erreur lors du chargement des statistiques');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const exportStatistics = () => {
    if (!statisticsData || !numerosStats.length) return;

    const csvContent = [
      ['Statistique', 'Valeur'],
      ['Total des tirages', statisticsData.totalTirages],
      ['Dernière mise à jour', statisticsData.derniereMiseAJour],
      ['Moyenne par mois', statisticsData.moyenneTiragesParMois.toFixed(2)],
      [''],
      ['Numéro', 'Fréquence', 'Dernière sortie', 'Écart moyen', 'Écart actuel'],
      ...numerosStats.map(item => [
        item.numero,
        item.frequence,
        item.derniere_sortie,
        item.ecart_moyen.toFixed(1),
        item.ecart_actuel
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statistiques-loto-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Statistiques exportées avec succès');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (!statisticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Impossible de charger les statistiques</p>
      </div>
    );
  }

  // Préparer les données pour les graphiques
  const topNumbers = numerosStats.slice(0, 15);
  const chartData = topNumbers.map(item => ({
    numero: item.numero,
    frequence: item.frequence,
    ecart: item.ecart_actuel
  }));

  const pieData = [
    { name: 'Chauds', value: statisticsData.numerosChauds.length, color: '#e11d48' },
    { name: 'Froids', value: statisticsData.numerosFroids.length, color: '#1e40af' },
    { name: 'Autres', value: 49 - statisticsData.numerosChauds.length - statisticsData.numerosFroids.length, color: '#059669' }
  ];

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    subtitle?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="stat-card"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Statistiques complètes - Kdo Loto Gagnant
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble des données du Loto National
        </p>
      </motion.div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total des tirages"
          value={statisticsData.totalTirages.toLocaleString()}
          icon={BarChart3}
          color="bg-primary-500"
          subtitle="Depuis 2020"
        />
        <StatCard
          title="Dernière mise à jour"
          value={statisticsData.derniereMiseAJour ? new Date(statisticsData.derniereMiseAJour).toLocaleDateString('fr-FR') : 'N/A'}
          icon={Calendar}
          color="bg-green-500"
        />
        <StatCard
          title="Moyenne par mois"
          value={Math.round(statisticsData.moyenneTiragesParMois)}
          icon={TrendingUp}
          color="bg-blue-500"
          subtitle="Tirages"
        />
        <StatCard
          title="Numéros analysés"
          value="49"
          icon={Trophy}
          color="bg-purple-500"
          subtitle="Boules principales"
        />
      </div>

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
            Top 15 des numéros les plus fréquents
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="numero" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  name === 'frequence' ? `${value} fois` : `${value} jours`,
                  name === 'frequence' ? 'Fréquence' : 'Écart actuel'
                ]}
              />
              <Bar dataKey="frequence" fill="#0ea5e9" />
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
            <Trophy className="w-5 h-5 text-primary-600" />
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

      {/* Numéros chauds et froids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-loto-red" />
            Numéros les plus fréquents
          </h3>
          <div className="space-y-3">
            {statisticsData.numerosChauds.slice(0, 10).map((item, index) => (
              <div key={item.numero} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="numero-boule numero-chaud">
                    {item.numero}
                  </div>
                  <span className="font-medium text-gray-900">#{index + 1}</span>
                </div>
                <span className="text-sm text-gray-600">{item.frequence} fois</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-loto-blue" />
            Numéros les moins fréquents
          </h3>
          <div className="space-y-3">
            {statisticsData.numerosFroids.slice(0, 10).map((item, index) => (
              <div key={item.numero} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="numero-boule numero-froid">
                    {item.numero}
                  </div>
                  <span className="font-medium text-gray-900">#{index + 1}</span>
                </div>
                <span className="text-sm text-gray-600">{item.frequence} fois</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tableau complet des numéros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary-600" />
            Statistiques détaillées de tous les numéros
          </h3>
          <button
            onClick={exportStatistics}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Numéro</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Fréquence</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Dernière sortie</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Écart moyen</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Écart actuel</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
              </tr>
            </thead>
            <tbody>
              {numerosStats.map((item) => (
                <tr key={item.numero} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className={`numero-boule ${
                      item.frequence > 50 ? 'numero-chaud' : 
                      item.frequence < 30 ? 'numero-froid' : 'numero-equilibre'
                    }`}>
                      {item.numero}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {item.frequence} fois
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {item.derniere_sortie ? new Date(item.derniere_sortie).toLocaleDateString('fr-FR') : 'Jamais'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {item.ecart_moyen.toFixed(1)} jours
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {item.ecart_actuel} jours
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.frequence > 50 ? 'text-red-600 bg-red-50' :
                      item.frequence < 30 ? 'text-blue-600 bg-blue-50' :
                      'text-green-600 bg-green-50'
                    }`}>
                      {item.frequence > 50 ? 'Chaud' : item.frequence < 30 ? 'Froid' : 'Équilibré'}
                    </span>
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
