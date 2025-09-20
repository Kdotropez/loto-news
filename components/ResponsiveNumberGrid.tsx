'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ResponsiveNumberGridProps {
  numbers: number[];
  selectedNumbers: number[];
  onNumberSelect: (number: number) => void;
  maxSelections?: number;
  className?: string;
  disabled?: boolean;
  colorScheme?: 'default' | 'hot' | 'cold' | 'balanced';
}

export default function ResponsiveNumberGrid({
  numbers,
  selectedNumbers,
  onNumberSelect,
  maxSelections = 5,
  className = '',
  disabled = false,
  colorScheme = 'default'
}: ResponsiveNumberGridProps) {
  const getNumberColor = (number: number, isSelected: boolean) => {
    if (disabled) {
      return 'bg-gray-200 text-gray-400 cursor-not-allowed';
    }
    
    if (isSelected) {
      switch (colorScheme) {
        case 'hot':
          return 'bg-red-500 text-white shadow-lg scale-110';
        case 'cold':
          return 'bg-blue-500 text-white shadow-lg scale-110';
        case 'balanced':
          return 'bg-green-500 text-white shadow-lg scale-110';
        default:
          return 'bg-primary-500 text-white shadow-lg scale-110';
      }
    }
    
    const canSelect = selectedNumbers.length < maxSelections || isSelected;
    if (!canSelect) {
      return 'bg-gray-100 text-gray-400 cursor-not-allowed';
    }
    
    switch (colorScheme) {
      case 'hot':
        return 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200';
      case 'cold':
        return 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200';
      case 'balanced':
        return 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200';
      default:
        return 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-primary-300';
    }
  };

  return (
    <div className={`responsive-number-grid ${className}`}>
      {/* Grille responsive - 5 colonnes mobile, plus sur desktop */}
      <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-2 sm:gap-3">
        {numbers.map((number) => {
          const isSelected = selectedNumbers.includes(number);
          const canSelect = selectedNumbers.length < maxSelections || isSelected;
          
          return (
            <motion.button
              key={number}
              onClick={() => !disabled && canSelect && onNumberSelect(number)}
              disabled={disabled || (!canSelect && !isSelected)}
              className={`
                numero-boule
                w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14
                rounded-full
                flex items-center justify-center
                font-bold text-sm sm:text-base
                transition-all duration-200
                transform hover:scale-105 active:scale-95
                ${getNumberColor(number, isSelected)}
                ${isSelected ? 'ring-2 ring-offset-2 ring-primary-400' : ''}
              `}
              whileHover={!disabled && canSelect ? { scale: 1.1 } : {}}
              whileTap={!disabled && canSelect ? { scale: 0.95 } : {}}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30,
                delay: number * 0.01 // Animation échelonnée
              }}
            >
              {number}
            </motion.button>
          );
        })}
      </div>
      
      {/* Indicateur de sélection */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>
          {selectedNumbers.length} / {maxSelections} sélectionnés
        </span>
        {selectedNumbers.length === maxSelections && (
          <span className="text-green-600 font-medium flex items-center gap-1">
            ✅ Sélection complète
          </span>
        )}
      </div>
      
      {/* Numéros sélectionnés - Affichage compact mobile */}
      {selectedNumbers.length > 0 && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-2">Numéros sélectionnés :</div>
          <div className="flex flex-wrap gap-1">
            {selectedNumbers.sort((a, b) => a - b).map((number) => (
              <span
                key={number}
                className="inline-flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-700 rounded text-xs font-bold"
              >
                {number}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Styles pour les différentes tailles d'écran
const styles = `
  @media (max-width: 640px) {
    .numero-boule {
      font-size: 0.75rem;
    }
  }
  
  @media (max-width: 480px) {
    .responsive-number-grid .grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.375rem;
    }
    
    .numero-boule {
      width: 2rem;
      height: 2rem;
      font-size: 0.7rem;
    }
  }
`;

// Injection des styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  if (!document.head.querySelector('style[data-component="ResponsiveNumberGrid"]')) {
    styleSheet.setAttribute('data-component', 'ResponsiveNumberGrid');
    document.head.appendChild(styleSheet);
  }
}
