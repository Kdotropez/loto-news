'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Calendar,
  Users,
  Award,
  Zap,
  Brain
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';
import TiragesList from '@/components/TiragesList';
import HotColdPeriodSelector from '@/components/HotColdPeriodSelector';
import ManualTirageInput from '@/components/ManualTirageInput';

interface DashboardProps {
  dataStatus: {
    hasData: boolean;
    totalTirages: number;
    lastUpdate: string | null;
  };
  analysisPeriod: 'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100';
  onAnalysisPeriodChange: (period: 'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100') => void;
}

interface DashboardData {
  summary: {
    totalTirages: number;
    derniereMiseAJour: string;
    premierTirage: string;
    numerosChauds: Array<{ numero: number; frequence: number }>;
    numerosFroids: Array<{ numero: number; frequence: number }>;
    moyenneTiragesParMois: number;
  };
  frequencyData: {
    frequencies: Array<{
      numero: number;
      frequency: number;
      percentage: number;
      lastAppearance: string;
      averageGap: number;
    }>;
  };
  complementaryData: {
    frequencies: Array<{
      numero: number;
      frequency: number;
      percentage: number;
      lastAppearance: string;
      averageGap: number;
    }>;
  };
}

export default function Dashboard({ dataStatus, analysisPeriod, onAnalysisPeriodChange }: DashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [analysisPeriod]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Charger les données du résumé
      const summaryResponse = await fetch('/api/statistics?type=summary');
      const summaryResult = await summaryResponse.json();

      // Charger l'analyse de fréquence des numéros principaux avec la période sélectionnée
      const frequencyResponse = await fetch(`/api/analysis?type=frequency&period=${analysisPeriod}`);
      const frequencyResult = await frequencyResponse.json();

      // Charger l'analyse de fréquence des numéros complémentaires
      const complementaryResponse = await fetch('/api/analysis?type=complementary-frequency');
      const complementaryResult = await complementaryResponse.json();

      // Charger les données même si certaines APIs échouent
      setDashboardData({
        summary: summaryResult.success ? summaryResult.data : {
          totalTirages: 0,
          derniereMiseAJour: null,
          premierTirage: null,
          numerosChauds: [],
          numerosFroids: [],
          moyenneTiragesParMois: 0
        },
        frequencyData: frequencyResult.success ? frequencyResult.data : { frequencies: [] },
        complementaryData: complementaryResult.success ? complementaryResult.data : { frequencies: [] }
      });

      // Afficher un message d'erreur seulement si toutes les APIs échouent
      if (!summaryResult.success && !frequencyResult.success && !complementaryResult.success) {
        toast.error('Erreur lors du chargement des données');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement du tableau de bord');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Impossible de charger les données du tableau de bord</p>
      </div>
    );
  }

  const { summary, frequencyData, complementaryData } = dashboardData;

  // Préparer les données pour les graphiques - Top 49 des numéros principaux
  const frequencies = Array.isArray(frequencyData?.frequencies) ? frequencyData.frequencies : [];
  const topNumbers = frequencies.slice(0, 20);
  const chartData = topNumbers.map(item => ({
    numero: item.numero,
    frequence: item.frequency,
    pourcentage: item.percentage
  }));

  // Données pour les numéros complémentaires
  const complementaryFrequencies = Array.isArray(complementaryData?.frequencies) ? complementaryData.frequencies : [];
  const complementaryChartData = complementaryFrequencies.map(item => ({
    numero: item.numero,
    frequence: item.frequency,
    pourcentage: item.percentage
  }));

  const freshness = (() => {
    if (!summary.derniereMiseAJour) {
      return { label: 'Données inconnues', cls: 'text-rose-700 bg-rose-50' };
    }
    const now = new Date();
    const last = new Date(summary.derniereMiseAJour);
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 4) {
      return { label: `Données OK (J-${diffDays})`, cls: 'text-emerald-700 bg-emerald-50' };
    }
    return { label: `Données à actualiser (J-${diffDays})`, cls: 'text-amber-700 bg-amber-50' };
  })();

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
      {/* Titre */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tableau de bord Kdo Loto Gagnant
        </h1>
        <div className="flex flex-col items-center gap-2">
          <p className="text-gray-600">
            Analysez les tendances et optimisez vos chances de gain
          </p>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${freshness.cls}`}>
            {freshness.label}
          </span>
          <span className="pill pill-info">Fenêtre: {analysisPeriod}</span>
        </div>
      </motion.div>

      {/* Note : Le sélecteur de période a été déplacé en haut de l'interface */}

      {/* Section de saisie manuelle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                📝 Saisie manuelle des tirages
              </h2>
              <p className="text-gray-600">
                Ajoutez les tirages manquants si besoin
              </p>
            </div>
            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              {showManualInput ? 'Masquer' : 'Ajouter un tirage'}
            </button>
          </div>
          {showManualInput && (
            <div className="flex justify-center">
              <ManualTirageInput onTirageAdded={loadDashboardData} />
            </div>
          )}
        </div>
      </motion.div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total des tirages"
          value={summary.totalTirages.toLocaleString()}
          icon={BarChart3}
          color="bg-primary-500"
          subtitle={`Depuis ${summary.premierTirage ? new Date(summary.premierTirage).getFullYear() : '1976'}`}
        />
        <StatCard
          title="Dernière mise à jour"
          value={summary.derniereMiseAJour ? new Date(summary.derniereMiseAJour).toLocaleDateString('fr-FR') : 'N/A'}
          icon={Calendar}
          color="bg-green-500"
          subtitle={summary.derniereMiseAJour ? `Jusqu'en ${new Date(summary.derniereMiseAJour).getFullYear()}` : ''}
        />
        <StatCard
          title="Moyenne par mois"
          value={Math.round(summary.moyenneTiragesParMois)}
          icon={TrendingUp}
          color="bg-blue-500"
          subtitle="Tirages"
        />
        <StatCard
          title="Numéros analysés"
          value="49"
          icon={Target}
          color="bg-purple-500"
          subtitle="Boules principales"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 49 des numéros les plus fréquents */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-loto-red" />
            Top 20 des numéros les plus fréquents
          </h3>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="numero" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                fontSize={10}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  name === 'frequence' ? `${value} fois` : `${value.toFixed(1)}%`,
                  name === 'frequence' ? 'Fréquence' : 'Pourcentage'
                ]}
                labelFormatter={(label) => `Numéro ${label}`}
              />
              <Bar dataKey="frequence" fill="#e11d48" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top 10 des numéros complémentaires */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-loto-blue" />
            Top 10 des numéros complémentaires
          </h3>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={complementaryChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="numero" 
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  name === 'frequence' ? `${value} fois` : `${value.toFixed(1)}%`,
                  name === 'frequence' ? 'Fréquence' : 'Pourcentage'
                ]}
                labelFormatter={(label) => `Numéro complémentaire ${label}`}
              />
              <Bar dataKey="frequence" fill="#1e40af" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Tirages récents */}
      <TiragesList title="Derniers tirages" showControls={true} />


      {/* Top 49 des numéros principaux et Top 10 des numéros complémentaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-loto-red" />
            Top 49 des numéros principaux
          </h3>
          <div className="max-h-96 overflow-y-auto">
            <div className="grid grid-cols-7 gap-2">
              {frequencies.slice(0, 49).map((item, index) => (
                <div
                  key={item.numero}
                  className={`numero-boule text-center ${
                    index < 10 ? 'numero-chaud' : 
                    index < 20 ? 'numero-equilibre' : 
                    'numero-froid'
                  }`}
                  title={`#${index + 1} - ${item.frequency} occurrences (${item.percentage.toFixed(1)}%)`}
                >
                  {item.numero}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Top 10</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>11-20</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>21-49</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-loto-blue" />
            Top 10 des numéros complémentaires
          </h3>
          <div className="space-y-3">
            {complementaryFrequencies.slice(0, 10).map((item, index) => (
              <div key={item.numero} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`numero-boule numero-complementaire ${
                    index < 3 ? 'numero-chaud' : 
                    index < 6 ? 'numero-equilibre' : 
                    'numero-froid'
                  }`}>
                    {item.numero}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">#{index + 1}</span>
                    <div className="text-xs text-gray-500">
                      {item.frequency} fois ({item.percentage.toFixed(1)}%)
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    Écart: {item.averageGap}j
                  </div>
                  <div className={`text-xs ${
                    'text-gray-600'
                  }`}>
                    Stable
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Top 3</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>4-6</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>7-10</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
