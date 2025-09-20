/**
 * BEST NUMBERS TAB
 * Onglet d'affichage des meilleurs numéros
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, TrendingUp, Brain, Target, RefreshCw, 
  BarChart3, Award, Percent 
} from 'lucide-react';

// Types
import type { BestNumbersSet } from '@/types/multi-game';

// Utilitaires
import { formatPercentage } from '@/lib/utils/multi-game-utils';

interface BestNumbersTabProps {
  bestNumbers: BestNumbersSet | null;
  loading: boolean;
  loadBestNumbers: () => void;
}

export default function BestNumbersTab({ 
  bestNumbers, 
  loading, 
  loadBestNumbers 
}: BestNumbersTabProps) {
  
  /**
   * Rendu d'une carte de score
   */
  const ScoreCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = 'blue' 
  }: {
    title: string;
    value: number;
    icon: React.ElementType;
    color?: string;
  }) => (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-${color}-600 text-sm font-medium`}>{title}</p>
          <p className={`text-2xl font-bold text-${color}-900`}>
            {formatPercentage(value)}
          </p>
        </div>
        <Icon className={`w-8 h-8 text-${color}-500`} />
      </div>
    </div>
  );

  /**
   * Rendu des numéros avec couleurs
   */
  const NumberBadge = ({ number }: { number: number }) => (
    <span className="inline-flex items-center justify-center w-10 h-10 bg-primary-100 text-primary-800 text-sm font-bold rounded-full border-2 border-primary-200 hover:bg-primary-200 transition-colors">
      {number}
    </span>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-600">Analyse des meilleurs numéros en cours...</p>
      </div>
    );
  }

  if (!bestNumbers) {
    return (
      <div className="text-center py-12">
        <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Aucune analyse disponible
        </h3>
        <p className="text-gray-600 mb-6">
          Lancez l'analyse pour découvrir les meilleurs numéros
        </p>
        <button
          onClick={loadBestNumbers}
          className="btn-primary flex items-center gap-2"
        >
          <Brain className="w-4 h-4" />
          Analyser les meilleurs numéros
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            🌟 Meilleurs Numéros Identifiés
          </h3>
          <p className="text-gray-600">
            Analyse basée sur {bestNumbers.numbers.length} numéros optimaux
          </p>
        </div>
        <button
          onClick={loadBestNumbers}
          disabled={loading}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Scores principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard
          title="Score Global"
          value={bestNumbers.score}
          icon={Award}
          color="blue"
        />
        <ScoreCard
          title="Confiance"
          value={bestNumbers.confidence}
          icon={Target}
          color="green"
        />
        <ScoreCard
          title="Fréquence"
          value={bestNumbers.frequency}
          icon={BarChart3}
          color="purple"
        />
        <ScoreCard
          title="Récence"
          value={bestNumbers.recency}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Numéros sélectionnés */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Numéros Recommandés ({bestNumbers.numbers.length})
        </h4>
        
        <div className="flex flex-wrap gap-3 mb-6">
          {bestNumbers.numbers.map((number) => (
            <NumberBadge key={number} number={number} />
          ))}
        </div>

        {/* Raisons de sélection */}
        {bestNumbers.reasons.length > 0 && (
          <div>
            <h5 className="font-medium text-gray-800 mb-2">
              📋 Critères de sélection:
            </h5>
            <ul className="space-y-1">
              {bestNumbers.reasons.map((reason, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>

      {/* Détails techniques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analyse par pattern */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analyse Pattern
          </h5>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Score Pattern:</span>
              <span className="font-medium">{formatPercentage(bestNumbers.pattern)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Score Mathématique:</span>
              <span className="font-medium">{formatPercentage(bestNumbers.mathematical)}</span>
            </div>
          </div>
        </div>

        {/* Recommandations d'usage */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h5 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Recommandations
          </h5>
          <div className="space-y-2 text-sm text-blue-700">
            <p>• Utilisez ces numéros pour générer des combinaisons optimisées</p>
            <p>• Combinez avec d'autres stratégies pour diversifier</p>
            <p>• Score de confiance élevé = recommandation forte</p>
          </div>
        </div>
      </div>
    </div>
  );
}



