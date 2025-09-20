/**
 * MULTI-GAME OPTIMIZER - VERSION REFACTORISÉE
 * Composant principal orchestrateur (≤200 lignes)
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Star, Target, Layers, BarChart3, Calculator, Filter
} from 'lucide-react';

// Hooks personnalisés
import { useMultiGameData } from '@/hooks/useMultiGameData';
import { useStrategyTesting } from '@/hooks/useStrategyTesting';

// Composants enfants
import SimpleGenerationTab from './tabs/SimpleGenerationTab';
import BestNumbersTab from './tabs/BestNumbersTab';
import SimpleGamesTab from './tabs/SimpleGamesTab';
import MultiGridsTab from './tabs/MultiGridsTab';
import StrategiesTab from './tabs/StrategiesTab';
import BudgetOptimizationTab from './tabs/BudgetOptimizationTab';
import StrategyControlsTab from './tabs/StrategyControlsTab';

// Types et constantes
import type { MultiGameTab } from '@/types/multi-game';
import { MULTI_GAME_TABS } from '@/lib/constants/multi-game-constants';

const iconComponents = {
  Zap, Star, Target, Layers, BarChart3, Calculator, Filter
};

export default function MultiGameOptimizer() {
  // État de navigation
  const [activeTab, setActiveTab] = useState<MultiGameTab>('best-numbers');
  
  // Hooks personnalisés
  const multiGameData = useMultiGameData();
  const strategyTesting = useStrategyTesting();

  /**
   * Rendu du contenu selon l'onglet actif
   */
  const renderTabContent = () => {
    const commonProps = {
      ...multiGameData,
      ...strategyTesting
    };

    switch (activeTab) {
      case 'simple-generation':
        return <SimpleGenerationTab {...commonProps} />;
      
      case 'best-numbers':
        return <BestNumbersTab {...commonProps} />;
      
      case 'simple-games':
        return <SimpleGamesTab {...commonProps} />;
      
      case 'multi-grids':
        return <MultiGridsTab {...commonProps} />;
      
      case 'strategies':
        return <StrategiesTab {...commonProps} />;
      
      case 'budget-optimization':
        return <BudgetOptimizationTab {...commonProps} />;
      
      case 'strategy-controls':
        return <StrategyControlsTab {...commonProps} />;
      
      default:
        return <BestNumbersTab {...commonProps} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🎯 Optimisateur Multi-Jeux
        </h2>
        <p className="text-gray-600">
          Générez et optimisez vos stratégies de jeu avec des analyses avancées
        </p>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {MULTI_GAME_TABS.map((tab) => {
            const IconComponent = iconComponents[tab.icon as keyof typeof iconComponents];
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MultiGameTab)}
                className={`
                  whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                  transition-colors duration-200
                  ${isActive
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Indicateur de chargement global */}
      {multiGameData.loading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-primary-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <span>Chargement en cours...</span>
          </div>
        </div>
      )}

      {/* Affichage d'erreur global */}
      {multiGameData.error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
        >
          <div className="flex justify-between items-center">
            <span>{multiGameData.error}</span>
            <button
              onClick={multiGameData.clearError}
              className="text-red-500 hover:text-red-700 font-medium"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {/* Contenu principal */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="min-h-[400px]"
      >
        {renderTabContent()}
      </motion.div>

      {/* Footer avec statistiques rapides */}
      <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-600">
        <div className="flex justify-center items-center gap-6 flex-wrap">
          {multiGameData.bestNumbers && (
            <span>
              📊 Meilleurs numéros: {multiGameData.bestNumbers.numbers.length}
            </span>
          )}
          {multiGameData.optimalCombinations.length > 0 && (
            <span>
              🎯 Combinaisons: {multiGameData.optimalCombinations.length}
            </span>
          )}
          {multiGameData.strategies.length > 0 && (
            <span>
              🧠 Stratégies: {multiGameData.strategies.length}
            </span>
          )}
          {Object.keys(strategyTesting.testResults).length > 0 && (
            <span>
              ✅ Tests: {Object.keys(strategyTesting.testResults).length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}



