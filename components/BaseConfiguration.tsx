'use client';

import React from 'react';

interface BaseConfigurationProps {
  combinationCount: number;
  gridType: 'simple' | 'multiple';
  multipleGridSize: number;
  onCombinationCountChange: (count: number) => void;
  onGridTypeChange: (type: 'simple' | 'multiple') => void;
  onMultipleGridSizeChange: (size: number) => void;
}

export default function BaseConfiguration({
  combinationCount,
  gridType,
  multipleGridSize,
  onCombinationCountChange,
  onGridTypeChange,
  onMultipleGridSizeChange
}: BaseConfigurationProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration de base</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de combinaisons
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={combinationCount}
            onChange={(e) => onCombinationCountChange(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de grille
          </label>
          <select
            value={gridType}
            onChange={(e) => onGridTypeChange(e.target.value as 'simple' | 'multiple')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="simple">Grille simple (5 numéros + 1 complémentaire)</option>
            <option value="multiple">Grille multiple</option>
          </select>
        </div>
        {gridType === 'multiple' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taille de la grille multiple
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={multipleGridSize}
              onChange={(e) => onMultipleGridSizeChange(parseInt(e.target.value) || 2)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}


