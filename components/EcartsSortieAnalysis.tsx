'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, BarChart3, AlertTriangle, Target, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';

interface EcartsSortieAnalysisProps {
  analysisPeriod?: 'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100';
}

interface EcartData {
  numero: number;
  ecartActuel: number;
  ecartPrecedent: number;
  ecartMoyen: number;
  ecartMaximum: number;
  derniereSortie: string;
  prochaineSortieEstimee: string;
  niveauUrgence: 'faible' | 'moyen' | 'eleve' | 'critique';
}

export default function EcartsSortieAnalysis({ analysisPeriod = 'last20' }: EcartsSortieAnalysisProps) {
  const [ecartsData, setEcartsData] = useState<EcartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'actuel' | 'moyen' | 'maximum'>('actuel');

  useEffect(() => {
    loadEcartsData();
  }, [analysisPeriod]);

  const loadEcartsData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analysis?type=ecarts-sortie&period=${analysisPeriod}`);
      const result = await response.json();
      
      if (result.success) {
        setEcartsData(result.data);
      } else {
        toast.error('Erreur lors du chargement des écarts de sortie');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNiveauUrgenceColor = (niveau: string) => {
    switch (niveau) {
      case 'faible': return 'text-green-600 bg-green-100';
      case 'moyen': return 'text-yellow-600 bg-yellow-100';
      case 'eleve': return 'text-orange-600 bg-orange-100';
      case 'critique': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getNiveauUrgenceIcon = (niveau: string) => {
    switch (niveau) {
      case 'faible': return '🟢';
      case 'moyen': return '🟡';
      case 'eleve': return '🟠';
      case 'critique': return '🔴';
      default: return '⚪';
    }
  };

  const prepareChartData = () => {
    return ecartsData.map(item => ({
      numero: item.numero,
      actuel: item.ecartActuel,
      moyen: item.ecartMoyen,
      maximum: item.ecartMaximum,
      precedent: item.ecartPrecedent
    }));
  };

  const getTopNumerosUrgents = () => {
    return ecartsData
      .filter(item => item.niveauUrgence === 'critique' || item.niveauUrgence === 'eleve')
      .sort((a, b) => b.ecartActuel - a.ecartActuel)
      .slice(0, 10);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">Analyse des écarts de sortie en cours...</p>
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
        <div className="text-6xl mb-4">⏰📊🎯</div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Analyse des Écarts de Sortie
        </h1>
        <p className="text-gray-600 text-lg mb-4">
          Découvrez les intervalles entre les sorties de chaque numéro et identifiez ceux en retard
        </p>
        
        {/* Indicateur de période active */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          <Clock className="w-4 h-4" />
          <span>Période d'analyse : </span>
          <span className="font-bold">
            {analysisPeriod === 'last20' && '20 derniers tirages'}
            {analysisPeriod === 'last50' && '50 derniers tirages'}
            {analysisPeriod === 'last100' && '100 derniers tirages'}
            {analysisPeriod === 'week' && 'Dernière semaine'}
            {analysisPeriod === 'month' && 'Dernier mois'}
            {analysisPeriod === 'year' && 'Dernière année'}
            {analysisPeriod === 'all' && 'Tous les tirages'}
          </span>
        </div>
      </motion.div>

      {/* Contrôles de visualisation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center gap-4"
      >
        {[
          { key: 'actuel', label: 'Écart Actuel', icon: Clock, color: 'from-blue-500 to-cyan-500' },
          { key: 'moyen', label: 'Écart Moyen', icon: BarChart3, color: 'from-green-500 to-emerald-500' },
          { key: 'maximum', label: 'Écart Maximum', icon: TrendingUp, color: 'from-red-500 to-pink-500' }
        ].map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setSelectedView(key as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              selectedView === key
                ? `bg-gradient-to-r ${color} text-white shadow-lg transform scale-105`
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-purple-300'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </motion.div>

      {/* Graphique principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-xl border border-purple-200"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            📊 Analyse des Écarts - {selectedView === 'actuel' ? 'Actuel' : selectedView === 'moyen' ? 'Moyen' : 'Maximum'}
          </h2>
          <p className="text-gray-600 mb-2">
            Visualisation des intervalles entre les sorties pour chaque numéro
          </p>
          <div className="text-sm text-blue-600 bg-blue-50 rounded-lg p-3 inline-block">
            💡 <strong>Astuce :</strong> Changez la période d'analyse dans le Tableau de Bord pour voir l'évolution des écarts sur différentes durées
          </div>
        </div>
        
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={prepareChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="numero" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                label={{ value: 'Nombre de tirages', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any, name: string) => [
                  `${value} tirages`,
                  name === 'actuel' ? 'Écart Actuel' : 
                  name === 'moyen' ? 'Écart Moyen' : 
                  name === 'maximum' ? 'Écart Maximum' : 'Écart Précédent'
                ]}
              />
              <Bar 
                dataKey={selectedView} 
                fill={`url(#gradient-${selectedView})`}
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="gradient-actuel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="gradient-moyen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="gradient-maximum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Numéros urgents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 shadow-xl border-2 border-red-200"
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🚨</div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">
            Numéros en Retard Important
          </h2>
          <p className="text-red-600">
            Ces numéros n'ont pas été tirés depuis longtemps selon leur historique habituel
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getTopNumerosUrgents().map((item, index) => (
            <motion.div
              key={item.numero}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 shadow-lg border border-red-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {item.numero}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Numéro {item.numero}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${getNiveauUrgenceColor(item.niveauUrgence)}`}>
                      {getNiveauUrgenceIcon(item.niveauUrgence)} {item.niveauUrgence.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Écart actuel:</span>
                  <span className="font-bold text-red-600">{item.ecartActuel} tirages</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Écart moyen:</span>
                  <span className="font-medium">{item.ecartMoyen} tirages</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dernière sortie:</span>
                  <span className="font-medium">{item.derniereSortie}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prochaine estimée:</span>
                  <span className="font-bold text-green-600">{item.prochaineSortieEstimee}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tableau détaillé */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-xl border border-purple-200"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            📋 Tableau Détaillé des Écarts
          </h2>
          <p className="text-gray-600">
            Vue complète de tous les numéros avec leurs statistiques d'écarts
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-100 to-pink-100">
                <th className="px-4 py-3 text-left font-bold text-gray-900">Numéro</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Écart Actuel</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Écart Précédent</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Écart Moyen</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Écart Maximum</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Dernière Sortie</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Niveau</th>
              </tr>
            </thead>
            <tbody>
              {ecartsData.map((item, index) => (
                <motion.tr
                  key={item.numero}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    item.niveauUrgence === 'critique' ? 'bg-red-50' :
                    item.niveauUrgence === 'eleve' ? 'bg-orange-50' :
                    item.niveauUrgence === 'moyen' ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                      {item.numero}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-blue-600">{item.ecartActuel}</td>
                  <td className="px-4 py-3 text-gray-700">{item.ecartPrecedent}</td>
                  <td className="px-4 py-3 text-gray-700">{item.ecartMoyen}</td>
                  <td className="px-4 py-3 text-gray-700">{item.ecartMaximum}</td>
                  <td className="px-4 py-3 text-gray-700">{item.derniereSortie}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNiveauUrgenceColor(item.niveauUrgence)}`}>
                      {getNiveauUrgenceIcon(item.niveauUrgence)} {item.niveauUrgence}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
