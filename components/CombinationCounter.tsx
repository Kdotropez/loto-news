'use client';

import React from 'react';
import { Info, AlertTriangle } from 'lucide-react';

interface CombinationCounterProps {
  remainingCombinations: number;
  totalCombinations?: number;
}

export default function CombinationCounter({ 
  remainingCombinations, 
  totalCombinations = 1906884 
}: CombinationCounterProps) {
  const percentage = ((remainingCombinations / totalCombinations) * 100).toFixed(1);
  const isLowCombinations = remainingCombinations < 1000;
  const isVeryLowCombinations = remainingCombinations < 100;
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="text-center">
        <div className={`text-3xl font-bold mb-2 ${
          isVeryLowCombinations ? 'text-red-600' : 
          isLowCombinations ? 'text-orange-600' : 'text-blue-600'
        }`}>
          {remainingCombinations.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600">
          Combinaisons possibles restantes
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {percentage}% du total ({totalCombinations.toLocaleString()})
        </div>
        <div className="text-xs text-blue-600 mt-1 font-medium">
          (5 numéros + 1 complémentaire)
        </div>
        
        {/* Avertissement si très peu de combinaisons */}
        {isVeryLowCombinations && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>Très peu de combinaisons possibles</span>
            </div>
          </div>
        )}
        
        {/* Information sur la précision */}
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700 text-xs">
            <Info className="w-4 h-4" />
            <span>Calcul exact : C(20,5) × 10 = 155,040 combinaisons</span>
          </div>
        </div>
      </div>
    </div>
  );
}
