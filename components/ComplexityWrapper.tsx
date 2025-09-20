'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Eye, EyeOff } from 'lucide-react';
import { complexityManager, ComplexityLevel, ComplexityConfig } from '../lib/complexity-manager';
import ComplexitySelector from './ComplexitySelector';

interface ComplexityWrapperProps {
  children: React.ReactNode;
  feature?: keyof ComplexityConfig['features'];
  fallback?: React.ReactNode;
  showModeIndicator?: boolean;
}

export default function ComplexityWrapper({ 
  children, 
  feature, 
  fallback,
  showModeIndicator = false 
}: ComplexityWrapperProps) {
  const [currentLevel, setCurrentLevel] = useState<ComplexityLevel>('beginner');
  const [showSelector, setShowSelector] = useState(false);
  const [config, setConfig] = useState<ComplexityConfig>(complexityManager.getConfig('beginner'));

  useEffect(() => {
    updateComplexityState();
  }, []);

  const updateComplexityState = () => {
    const level = complexityManager.getCurrentLevel();
    const newConfig = complexityManager.getConfig(level);
    setCurrentLevel(level);
    setConfig(newConfig);
  };

  const handleLevelChange = (newLevel: ComplexityLevel) => {
    updateComplexityState();
    setShowSelector(false);
    
    // Recharger la page pour appliquer les changements
    window.location.reload();
  };

  // Si une fonctionnalité spécifique est requise et n'est pas disponible
  if (feature && !config.features[feature]) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
        <div className="text-amber-600 mb-2">⚠️</div>
        <h3 className="text-lg font-semibold text-amber-800 mb-2">
          Fonctionnalité Avancée
        </h3>
        <p className="text-amber-700 mb-4">
          Cette fonctionnalité est disponible en mode Intermédiaire ou Expert.
        </p>
        <button
          onClick={() => setShowSelector(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors"
        >
          Changer de Mode
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Indicateur de mode */}
      {showModeIndicator && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-20 right-4 z-40"
        >
          <div className={`px-3 py-2 rounded-lg shadow-lg border ${
            config.color === 'green' ? 'bg-green-500 border-green-600' :
            config.color === 'yellow' ? 'bg-yellow-500 border-yellow-600' :
            'bg-red-500 border-red-600'
          } text-white`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{config.icon}</span>
              <div className="text-xs">
                <div className="font-semibold">Mode {config.level}</div>
                <div className="opacity-80">{Object.values(config.features).filter(Boolean).length} fonctions</div>
              </div>
              <button
                onClick={() => setShowSelector(true)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Contenu adapté */}
      <div className={`complexity-wrapper complexity-${currentLevel}`}>
        {children}
      </div>

      {/* Sélecteur de complexité */}
      {showSelector && (
        <ComplexitySelector
          showAsModal={true}
          onLevelChange={handleLevelChange}
          onClose={() => setShowSelector(false)}
        />
      )}
    </div>
  );
}

/**
 * Hook pour vérifier si une fonctionnalité est disponible
 */
export function useComplexityFeature(feature: keyof ComplexityConfig['features']): boolean {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const enabled = complexityManager.isFeatureEnabled(feature);
    setIsEnabled(enabled);
  }, [feature]);

  return isEnabled;
}

/**
 * Hook pour obtenir la configuration actuelle
 */
export function useComplexityConfig(): ComplexityConfig {
  const [config, setConfig] = useState<ComplexityConfig>(complexityManager.getConfig('beginner'));

  useEffect(() => {
    const currentConfig = complexityManager.getCurrentConfig();
    setConfig(currentConfig);
  }, []);

  return config;
}
