/**
 * CONTENEUR DE CONFIGURATION PASTEL
 * Conteneur avec couleurs pastels lisibles pour remplacer les conteneurs violets
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PastelConfigContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  color?: 'violet' | 'blue' | 'green' | 'amber' | 'rose';
  className?: string;
}

export default function PastelConfigContainer({
  title,
  description,
  children,
  color = 'violet',
  className = ''
}: PastelConfigContainerProps) {
  
  const getColorClasses = () => {
    switch (color) {
      case 'violet':
        return {
          container: 'bg-violet-50 border-violet-200',
          title: 'text-violet-800',
          description: 'text-violet-700'
        };
      case 'blue':
        return {
          container: 'bg-sky-50 border-sky-200',
          title: 'text-sky-800',
          description: 'text-sky-700'
        };
      case 'green':
        return {
          container: 'bg-emerald-50 border-emerald-200',
          title: 'text-emerald-800',
          description: 'text-emerald-700'
        };
      case 'amber':
        return {
          container: 'bg-amber-50 border-amber-200',
          title: 'text-amber-800',
          description: 'text-amber-700'
        };
      case 'rose':
        return {
          container: 'bg-rose-50 border-rose-200',
          title: 'text-rose-800',
          description: 'text-rose-700'
        };
      default:
        return {
          container: 'bg-slate-50 border-slate-200',
          title: 'text-slate-800',
          description: 'text-slate-700'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${colors.container} border-2 rounded-xl p-6 shadow-sm ${className}`}
    >
      {/* Titre */}
      <h3 className={`text-lg font-bold ${colors.title} mb-2`}>
        {title}
      </h3>
      
      {/* Description optionnelle */}
      {description && (
        <p className={`text-sm ${colors.description} mb-4`}>
          {description}
        </p>
      )}
      
      {/* Contenu */}
      <div className="space-y-4">
        {children}
      </div>
    </motion.div>
  );
}

/**
 * COMPOSANT DE CONTRÔLE NUMÉRIQUE PASTEL
 * Remplace les contrôles + et - illisibles
 */
interface PastelNumberControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  helpText?: string;
  color?: 'violet' | 'blue' | 'green' | 'amber' | 'rose';
}

export function PastelNumberControl({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  helpText,
  color = 'violet'
}: PastelNumberControlProps) {
  
  const getButtonClasses = () => {
    switch (color) {
      case 'violet': return 'bg-violet-400 hover:bg-violet-500 text-white';
      case 'blue': return 'bg-sky-400 hover:bg-sky-500 text-white';
      case 'green': return 'bg-emerald-400 hover:bg-emerald-500 text-white';
      case 'amber': return 'bg-amber-400 hover:bg-amber-500 text-white';
      case 'rose': return 'bg-rose-400 hover:bg-rose-500 text-white';
      default: return 'bg-slate-400 hover:bg-slate-500 text-white';
    }
  };

  const buttonClasses = getButtonClasses();

  const handleDecrease = () => {
    if (value > min) {
      onChange(value - step);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + step);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-800">
        {label}
      </label>
      
      <div className="flex items-center gap-3">
        <button
          onClick={handleDecrease}
          disabled={value <= min}
          className={`w-10 h-10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses}`}
        >
          -
        </button>
        
        <div className="flex-1 text-center">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || min)}
            min={min}
            max={max}
            step={step}
            className="w-full text-center text-xl font-bold bg-white border-2 border-slate-300 rounded-lg py-2 px-4 focus:border-sky-500 focus:outline-none text-slate-800"
          />
        </div>
        
        <button
          onClick={handleIncrease}
          disabled={value >= max}
          className={`w-10 h-10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses}`}
        >
          +
        </button>
      </div>
      
      {helpText && (
        <p className="text-xs text-slate-600 text-center">
          {helpText}
        </p>
      )}
    </div>
  );
}
