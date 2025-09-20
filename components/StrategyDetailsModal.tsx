'use client';

import { motion } from 'framer-motion';
import { X, Brain, Target, TrendingUp, BarChart3, Info, CheckCircle } from 'lucide-react';

interface StrategyDetails {
  strategy: string;
  reasons: string[];
  analysis: {
    frequency: number;
    recency: number;
    pattern: number;
    mathematical: number;
  };
  numbers: {
    numero: number;
    type: 'hot' | 'cold' | 'balanced' | 'pattern' | 'mathematical';
    reason: string;
    score: number;
  }[];
  complementary: {
    numero: number;
    reason: string;
    score: number;
  };
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  expectedValue: number;
}

interface StrategyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: StrategyDetails | null;
  combination: {
    boules: number[];
    numero_chance: number;
    score: number;
  } | null;
}

export default function StrategyDetailsModal({ isOpen, onClose, details, combination }: StrategyDetailsModalProps) {
  if (!isOpen || !details || !combination) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hot': return 'bg-red-100 text-red-800 border-red-200';
      case 'cold': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'balanced': return 'bg-green-100 text-green-800 border-green-200';
      case 'pattern': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'mathematical': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'hot': return 'Numéro Chaud';
      case 'cold': return 'Numéro Froid';
      case 'balanced': return 'Numéro Équilibré';
      case 'pattern': return 'Pattern';
      case 'mathematical': return 'Mathématique';
      default: return 'Standard';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Brain className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Détails de la Stratégie</h2>
                <p className="text-gray-600">Analyse complète de la combinaison générée</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Combinaison */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-600" />
              Combinaison Générée
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {combination.boules.map((numero, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg"
                  >
                    {numero}
                  </div>
                ))}
              </div>
              <div className="text-2xl text-gray-400">+</div>
              <div className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {combination.numero_chance}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                Score: {combination.score.toFixed(1)}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Confiance: {details.confidence.toFixed(1)}%
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(details.riskLevel)}`}>
                Risque: {details.riskLevel === 'low' ? 'Faible' : details.riskLevel === 'medium' ? 'Moyen' : 'Élevé'}
              </span>
            </div>
          </div>

          {/* Stratégie */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              Stratégie Appliquée
            </h3>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <p className="text-gray-800 font-medium">{details.strategy}</p>
            </div>
          </div>

          {/* Raisons */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Raisons de la Sélection
            </h3>
            <ul className="space-y-2">
              {details.reasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-800">{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Analyse des Numéros */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Analyse Détaillée des Numéros
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {details.numbers.map((num, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                      {num.numero}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(num.type)}`}>
                      {getTypeLabel(num.type)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{num.reason}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Score:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, num.score)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-700">{num.score.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Numéro Chance */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-yellow-600" />
              Numéro Chance
            </h3>
            <div className="bg-white rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                  {details.complementary.numero}
                </div>
                <div>
                  <p className="text-gray-800 font-medium">{details.complementary.reason}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">Score:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-32">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, details.complementary.score)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-700">{details.complementary.score.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Métriques de Performance */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-gray-600" />
              Métriques de Performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                <div className="text-2xl font-bold text-blue-600">{details.analysis.frequency.toFixed(1)}</div>
                <div className="text-xs text-gray-600">Fréquence</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                <div className="text-2xl font-bold text-green-600">{details.analysis.recency.toFixed(1)}</div>
                <div className="text-xs text-gray-600">Récence</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                <div className="text-2xl font-bold text-purple-600">{details.analysis.pattern.toFixed(1)}</div>
                <div className="text-xs text-gray-600">Pattern</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                <div className="text-2xl font-bold text-yellow-600">{details.analysis.mathematical.toFixed(1)}</div>
                <div className="text-xs text-gray-600">Mathématique</div>
              </div>
            </div>
            <div className="mt-4 bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Valeur Attendue:</span>
                <span className="text-lg font-bold text-primary-600">{details.expectedValue.toFixed(2)}€</span>
              </div>
            </div>
          </div>

          {/* Note de Transparence */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Transparence de l'Analyse</h4>
                <p className="text-sm text-blue-800">
                  Cette combinaison a été générée en utilisant une analyse statistique avancée basée sur l'historique des tirages du Loto National français. 
                  Chaque numéro a été sélectionné selon des critères objectifs et mesurables, garantissant une approche scientifique plutôt qu'aléatoire.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

