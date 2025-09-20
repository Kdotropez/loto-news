'use client';

import React, { useState } from 'react';
import { Calendar, Clock, TrendingUp, ChevronDown } from 'lucide-react';

interface HotColdPeriodSelectorProps {
  period: 'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100';
  onPeriodChange: (period: 'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100') => void;
}

const periodOptions = [
  {
    value: 'last20' as const,
    label: '20 derniers tirages',
    description: 'Analyse sur les 20 tirages les plus récents',
    icon: Clock,
    color: 'blue'
  },
  {
    value: 'last50' as const,
    label: '50 derniers tirages',
    description: 'Analyse sur les 50 tirages les plus récents',
    icon: Clock,
    color: 'blue'
  },
  {
    value: 'last100' as const,
    label: '100 derniers tirages',
    description: 'Analyse sur les 100 tirages les plus récents',
    icon: Clock,
    color: 'blue'
  },
  {
    value: 'week' as const,
    label: 'Cette semaine',
    description: 'Analyse sur les tirages de cette semaine',
    icon: Calendar,
    color: 'green'
  },
  {
    value: 'month' as const,
    label: 'Ce mois',
    description: 'Analyse sur les tirages de ce mois',
    icon: Calendar,
    color: 'green'
  },
  {
    value: 'year' as const,
    label: 'Cette année',
    description: 'Analyse sur les tirages de cette année',
    icon: Calendar,
    color: 'green'
  },
  {
    value: 'all' as const,
    label: 'Depuis le début',
    description: 'Analyse sur tous les tirages disponibles',
    icon: TrendingUp,
    color: 'purple'
  }
];

export default function HotColdPeriodSelector({ period, onPeriodChange }: HotColdPeriodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = periodOptions.find(option => option.value === period);

  const handlePeriodSelect = (selectedPeriod: typeof period) => {
    onPeriodChange(selectedPeriod);
    setIsOpen(false); // Ferme automatiquement après sélection
  };

  return (
    <div className="relative">
      {/* Bouton principal - Plus imposant et visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg border-2 border-blue-400 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:scale-105 transition-all duration-300 text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-white mb-1">Période d'analyse</div>
              {currentOption && (
                <div className="text-blue-100 text-lg">{currentOption.label}</div>
              )}
              <div className="text-blue-200 text-sm mt-1">
                Choisissez la période pour analyser les données
              </div>
            </div>
          </div>
          <div className="bg-white/20 p-2 rounded-full">
            <ChevronDown className={`w-6 h-6 text-white transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} />
          </div>
        </div>
      </button>

      {/* Menu déroulant - Plus visible */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-xl shadow-2xl border-2 border-blue-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Choisir la période d'analyse</h3>
              <p className="text-sm text-gray-600">Cette période sera utilisée pour toutes les analyses</p>
            </div>
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePeriodSelect(option.value)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all duration-200 ${
                  period === option.value
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'hover:bg-gray-50 border-2 border-transparent'
                }`}
              >
                <option.icon className={`w-5 h-5 mt-0.5 ${
                  option.color === 'blue' ? 'text-blue-600' :
                  option.color === 'green' ? 'text-green-600' : 'text-purple-600'
                }`} />
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
                {period === option.value && (
                  <div className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded">
                    Actuel
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay pour fermer en cliquant à l'extérieur */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
