'use client';

import React from 'react';
import { Target } from 'lucide-react';

interface Combination {
  numbers: number[];
  complementaryNumber: number;
  score?: number;
  confidence?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  strategy?: string;
  details?: any;
}

interface CombinationDisplayProps {
  combinations: Combination[];
  isLoading: boolean;
  onGenerate: () => void;
}

export default function CombinationDisplay({ 
  combinations, 
  isLoading, 
  onGenerate 
}: CombinationDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Bouton de génération */}
      <div className="text-center">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <div className="w-5 h-5">▶</div>
              Générer les combinaisons
            </>
          )}
        </button>
      </div>

      {/* Affichage des combinaisons */}
      {combinations.length > 0 ? (
        <div className="space-y-4">
          {combinations.map((combination, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700">#{index + 1}</span>
                <div className="flex gap-1">
                  {combination.numbers.map((num, i) => (
                    <div key={i} className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {num}
                    </div>
                  ))}
                </div>
                <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {combination.complementaryNumber}
                </div>
              </div>
              
              {/* Métriques optionnelles */}
              {(combination.score || combination.confidence || combination.riskLevel) && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {combination.score && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Score:</span>
                      <span className="font-medium">{combination.score.toFixed(1)}</span>
                    </div>
                  )}
                  {combination.confidence && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confiance:</span>
                      <span className="font-medium">{(combination.confidence * 100).toFixed(1)}%</span>
                    </div>
                  )}
                  {combination.riskLevel && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Risque:</span>
                      <span className={`font-medium ${
                        combination.riskLevel === 'low' ? 'text-green-600' :
                        combination.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {combination.riskLevel === 'low' ? 'Faible' :
                         combination.riskLevel === 'medium' ? 'Moyen' : 'Élevé'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucune combinaison générée</p>
          <p className="text-sm">Configurez vos stratégies et générez des combinaisons</p>
        </div>
      )}
    </div>
  );
}


