'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Calendar, 
  CalendarDays, 
  CalendarRange,
  Database,
  Sparkles,
  TrendingUp,
  BarChart3,
  X
} from 'lucide-react';

interface PeriodSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPeriodSelect: (period: 'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100') => void;
  currentPeriod?: 'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100';
}

export default function PeriodSelectionModal({ 
  isOpen, 
  onClose, 
  onPeriodSelect, 
  currentPeriod = 'last20' 
}: PeriodSelectionModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100'>(currentPeriod);

  const periods = [
    {
      id: 'last20' as const,
      name: '20 Derniers Tirages',
      description: 'Analyse des tendances récentes',
      icon: TrendingUp,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
      recommended: true,
      stats: '~3 semaines de données'
    },
    {
      id: 'last50' as const,
      name: '50 Derniers Tirages',
      description: 'Équilibre entre récent et historique',
      icon: BarChart3,
      color: 'green',
      gradient: 'from-green-500 to-emerald-500',
      recommended: false,
      stats: '~2 mois de données'
    },
    {
      id: 'last100' as const,
      name: '100 Derniers Tirages',
      description: 'Vision élargie des patterns',
      icon: Calendar,
      color: 'purple',
      gradient: 'from-purple-500 to-violet-500',
      recommended: false,
      stats: '~4 mois de données'
    },
    {
      id: 'week' as const,
      name: 'Dernière Semaine',
      description: 'Tendances ultra-récentes',
      icon: Clock,
      color: 'orange',
      gradient: 'from-orange-500 to-red-500',
      recommended: false,
      stats: '~7 jours'
    },
    {
      id: 'month' as const,
      name: 'Dernier Mois',
      description: 'Analyse mensuelle',
      icon: CalendarDays,
      color: 'indigo',
      gradient: 'from-indigo-500 to-blue-500',
      recommended: false,
      stats: '~30 jours'
    },
    {
      id: 'year' as const,
      name: 'Dernière Année',
      description: 'Vision long terme',
      icon: CalendarRange,
      color: 'pink',
      gradient: 'from-pink-500 to-rose-500',
      recommended: false,
      stats: '~365 jours'
    },
    {
      id: 'all' as const,
      name: 'Tout l\'Historique',
      description: 'Analyse complète depuis le début',
      icon: Database,
      color: 'gray',
      gradient: 'from-gray-600 to-gray-800',
      recommended: false,
      stats: 'Toutes les données'
    }
  ];


  const getColorClasses = (period: typeof periods[0], isSelected: boolean) => {
    if (isSelected) {
      return {
        border: `border-${period.color}-400`,
        bg: `bg-gradient-to-br from-${period.color}-50 to-${period.color}-100`,
        text: `text-${period.color}-800`,
        shadow: `shadow-lg shadow-${period.color}-200`
      };
    }
    return {
      border: 'border-gray-200',
      bg: 'bg-white',
      text: 'text-gray-700',
      shadow: 'shadow-md hover:shadow-lg'
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Choisissez votre Période d'Analyse</h2>
                <p className="text-blue-100 text-lg">
                  Sélectionnez la période qui définira toutes vos analyses et stratégies
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-8">
          {/* Message d'introduction */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Bienvenue dans Kdo Loto Gagnant !
            </h3>
            <p className="text-gray-600 text-lg">
              Cette période d'analyse sera utilisée pour toutes les statistiques, 
              analyses de patterns, et stratégies de génération de combinaisons.
            </p>
          </div>

          {/* Grille des périodes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {periods.map((period) => {
              const isSelected = selectedPeriod === period.id;
              const Icon = period.icon;
              
              return (
                <motion.div
                  key={period.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 ${
                    isSelected 
                      ? `border-${period.color}-400 bg-gradient-to-br from-${period.color}-50 to-${period.color}-100 shadow-lg shadow-${period.color}-200` 
                      : 'border-gray-200 bg-white shadow-md hover:shadow-lg hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedPeriod(period.id);
                    // Petit délai pour voir la sélection puis fermer
                    setTimeout(() => {
                      onPeriodSelect(period.id);
                    }, 300);
                  }}
                >
                  {/* Badge recommandé */}
                  {period.recommended && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      ⭐ Recommandé
                    </div>
                  )}

                  {/* Sélection */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${period.gradient}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected 
                        ? `border-${period.color}-400 bg-${period.color}-400` 
                        : 'border-gray-300'
                    }`}>
                      {isSelected && <div className="w-3 h-3 bg-white rounded-full"></div>}
                    </div>
                  </div>

                  {/* Contenu */}
                  <div>
                    <h4 className={`font-bold text-lg mb-2 ${
                      isSelected ? `text-${period.color}-800` : 'text-gray-800'
                    }`}>
                      {period.name}
                    </h4>
                    <p className={`text-sm mb-3 ${
                      isSelected ? `text-${period.color}-600` : 'text-gray-600'
                    }`}>
                      {period.description}
                    </p>
                    <div className={`text-xs font-medium ${
                      isSelected ? `text-${period.color}-500` : 'text-gray-500'
                    }`}>
                      📊 {period.stats}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Information importante */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">ℹ️</div>
              <h4 className="font-bold text-blue-800">Information Importante</h4>
            </div>
            <div className="text-blue-700">
              <strong>Cliquez directement</strong> sur la période souhaitée pour la sélectionner et commencer !
            </div>
            <div className="text-sm text-blue-600 mt-2">
              Cette période sera appliquée à toutes les analyses : fréquences, écarts, patterns, et stratégies.
              Vous pourrez la modifier à tout moment depuis le sélecteur en haut de l'application.
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="bg-gray-50 px-8 py-4 flex items-center justify-center border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Cliquez sur une période ci-dessus pour commencer • Configuration modifiable à tout moment</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
