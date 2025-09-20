/**
 * MULTI-GAME CARD
 * Composant réutilisable pour afficher une combinaison/stratégie
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Eye, Star, TrendingUp, DollarSign, 
  Target, Award, TestTube, Loader2 
} from 'lucide-react';

// Types
import type { MultiGameCombination, TestResult } from '@/types/multi-game';

// Utilitaires
import { 
  formatCurrency, 
  formatPercentage, 
  calculateCombinationSum,
  evaluateSumQuality,
  countConsecutiveNumbers,
  analyzeDizainesDistribution
} from '@/lib/utils/multi-game-utils';

interface MultiGameCardProps {
  combination: MultiGameCombination;
  index: number;
  testResult?: TestResult;
  isTesting?: boolean;
  onTest?: (combination: MultiGameCombination, index: number) => void;
  onViewDetails?: (combination: MultiGameCombination) => void;
  showAdvancedStats?: boolean;
}

export default function MultiGameCard({
  combination,
  index,
  testResult,
  isTesting = false,
  onTest,
  onViewDetails,
  showAdvancedStats = true
}: MultiGameCardProps) {
  
  // Calculs dérivés
  const sum = calculateCombinationSum(combination.numbers);
  const sumQuality = evaluateSumQuality(sum);
  const consecutiveCount = countConsecutiveNumbers(combination.numbers);
  const dizainesDistribution = analyzeDizainesDistribution(combination.numbers);

  /**
   * Rendu d'un numéro avec style
   */
  const NumberBadge = ({ number }: { number: number }) => (
    <span className="inline-flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-800 text-xs font-bold rounded-full border border-primary-200">
      {number}
    </span>
  );

  /**
   * Badge de stratégie avec couleur
   */
  const StrategyBadge = () => {
    const colors = {
      hot: 'bg-red-100 text-red-800 border-red-200',
      balanced: 'bg-green-100 text-green-800 border-green-200',
      pattern: 'bg-blue-100 text-blue-800 border-blue-200',
      mathematical: 'bg-orange-100 text-orange-800 border-orange-200'
    };

    const labels = {
      hot: '🔥 Chaud',
      balanced: '⚖️ Équilibré',
      pattern: '🎯 Pattern',
      mathematical: '🔢 Math'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colors[combination.strategy]}`}>
        {labels[combination.strategy]}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      {/* En-tête avec stratégie et score */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
          <StrategyBadge />
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold text-gray-900">
              {combination.score.toFixed(1)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Confiance: {formatPercentage(combination.confidence)}
          </div>
        </div>
      </div>

      {/* Numéros */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {combination.numbers.map((number) => (
          <NumberBadge key={number} number={number} />
        ))}
        <div className="mx-2 text-gray-400">+</div>
        <span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full border border-yellow-200">
          {combination.complementary}
        </span>
      </div>

      {/* Statistiques avancées */}
      {showAdvancedStats && (
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div className="bg-gray-50 rounded p-2">
            <div className="text-gray-600">Somme</div>
            <div className={`font-semibold ${sumQuality.color}`}>
              {sum} ({sumQuality.label})
            </div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-gray-600">Consécutifs</div>
            <div className="font-semibold text-gray-900">
              {consecutiveCount}
            </div>
          </div>
        </div>
      )}

      {/* Coût et retour attendu */}
      <div className="flex justify-between items-center mb-4 text-sm">
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="text-gray-600">Coût:</span>
          <span className="font-semibold">{formatCurrency(combination.cost)}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="text-gray-600">ROI:</span>
          <span className="font-semibold">{formatCurrency(combination.expectedReturn)}</span>
        </div>
      </div>

      {/* Résultats de test */}
      {testResult && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-green-50 border border-green-200 rounded p-3 mb-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-800">Résultats de test</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-green-600">Gains:</span>
              <span className="font-semibold ml-1">{testResult.wins}/{testResult.totalTests}</span>
            </div>
            <div>
              <span className="text-green-600">Taux:</span>
              <span className="font-semibold ml-1">{formatPercentage(testResult.winRate)}</span>
            </div>
            <div>
              <span className="text-green-600">Total:</span>
              <span className="font-semibold ml-1">{formatCurrency(testResult.totalGains)}</span>
            </div>
            <div>
              <span className="text-green-600">ROI:</span>
              <span className="font-semibold ml-1">{formatPercentage(testResult.roi)}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {onTest && (
          <button
            onClick={() => onTest(combination, index)}
            disabled={isTesting}
            className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Test...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4" />
                Tester
              </>
            )}
          </button>
        )}
        
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(combination)}
            className="flex-1 btn-outline flex items-center justify-center gap-2 text-sm"
          >
            <Eye className="w-4 h-4" />
            Détails
          </button>
        )}
      </div>

      {/* Raisons (si disponibles) */}
      {combination.reasons && combination.reasons.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-600">
            <strong>Raisons:</strong> {combination.reasons.slice(0, 2).join(', ')}
            {combination.reasons.length > 2 && '...'}
          </div>
        </div>
      )}
    </motion.div>
  );
}



