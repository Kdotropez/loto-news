'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target,
  Zap,
  BarChart3,
  Save,
  CheckCircle
} from 'lucide-react';
import SimpleUnifiedAnalysis from './SimpleUnifiedAnalysis';
import EnhancedGridGenerator from './EnhancedGridGenerator';
import SavedGridsManager from './SavedGridsManager';
import FrequencyAnalysis from './FrequencyAnalysis';
import PatternAnalysis from './PatternAnalysis';

interface IntermediateInterfaceProps {
  globalAnalysisPeriod: string;
  onAnalysisPeriodChange: (period: any) => void;
}

type IntermediateTab = 'analysis' | 'generation' | 'statistics' | 'management';

export default function IntermediateInterface({ 
  globalAnalysisPeriod,
  onAnalysisPeriodChange 
}: IntermediateInterfaceProps) {
  const [activeTab, setActiveTab] = useState<IntermediateTab>('analysis');
  const [selectedNumbers, setSelectedNumbers] = useState<any>(null);
  const [showModeDetails, setShowModeDetails] = useState(false);

  const tabs = [
    {
      id: 'analysis' as IntermediateTab,
      label: 'Analyse',
      icon: Target,
      description: 'Sélection automatique des meilleurs numéros'
    },
    {
      id: 'generation' as IntermediateTab,
      label: 'Génération',
      icon: Zap,
      description: 'Créer des grilles simples et multiples'
    },
    {
      id: 'statistics' as IntermediateTab,
      label: 'Statistiques',
      icon: BarChart3,
      description: 'Analyses et tendances'
    },
    {
      id: 'management' as IntermediateTab,
      label: 'Gestion',
      icon: Save,
      description: 'Grilles sauvegardées'
    }
  ];

  const tabTheme: Record<IntermediateTab, string> = {
    analysis: 'theme-analysis',
    generation: 'theme-generation',
    statistics: 'theme-statistics',
    management: 'theme-management'
  };

  useEffect(() => {
    // Charger les numéros sélectionnés
    const saved = localStorage.getItem('selectedNumbers');
    if (saved) {
      try {
        setSelectedNumbers(JSON.parse(saved));
      } catch (error) {
        console.error('Erreur chargement numéros:', error);
      }
    }
  }, []);

  const handleNumberSelection = (numbers: number[], complementary: number[], source: string) => {
    const selection = { numbers, complementary, source };
    setSelectedNumbers(selection);
    
    // Sauvegarder
    localStorage.setItem('selectedNumbers', JSON.stringify({
      numbers,
      complementary,
      source,
      timestamp: new Date().toISOString(),
      period: globalAnalysisPeriod
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analysis':
        return (
          <SimpleUnifiedAnalysis 
            analysisPeriod={globalAnalysisPeriod}
            onNumberSelection={handleNumberSelection}
          />
        );
        
      case 'generation':
        return (
          <EnhancedGridGenerator 
            globalAnalysisPeriod={globalAnalysisPeriod}
          />
        );
      case 'statistics':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FrequencyAnalysis analysisPeriod={globalAnalysisPeriod as any} />
              <PatternAnalysis analysisPeriod={globalAnalysisPeriod as any} />
            </div>
          </div>
        );
        
      case 'management':
        return <SavedGridsManager />;
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête Mode Intermédiaire - Cliquable */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="intermediate-header"
        onClick={() => setShowModeDetails(true)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-4xl">⚖️</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Mode Intermédiaire
              </h1>
              <p className="text-yellow-100 text-lg">
                Plus d'options et d'analyses pour optimiser vos stratégies
              </p>
              <div className="mt-2 text-sm text-white/80">Cliquez pour voir les détails du mode</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="pill theme-analysis">Analyse</span>
            <span className="pill theme-generation">Génération</span>
            <span className="pill theme-statistics">Statistiques</span>
            <span className="pill theme-management">Gestion</span>
          </div>
        </div>
        
        {/* Indicateur de progression */}
        {selectedNumbers && (
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span className="font-semibold">
                {selectedNumbers.numbers.length} numéros sélectionnés depuis "{selectedNumbers.source}"
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation par onglets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="section-header">
          <div>
            <h2 className="section-title">Navigation Intermédiaire</h2>
            <p className="section-subtitle">4 onglets essentiels, sans surcharge</p>
          </div>
          <span className="pill pill-info">Mode Intermédiaire</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
                  isActive
                    ? `${tabTheme[tab.id]} shadow-lg`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Description de l'onglet actif */}
        <div className="bg-orange-50 rounded-lg p-3">
          <p className="text-orange-700 text-sm">
            {tabs.find(t => t.id === activeTab)?.description}
          </p>
        </div>
      </motion.div>

      {/* Contenu de l'onglet */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.div>

      {/* Aide contextuelle */}
      <div className="card">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-orange-600">💡</div>
          <span className="font-semibold text-gray-800">Conseil</span>
        </div>
        <p className="text-gray-700 text-sm">
          {activeTab === 'analysis' && "Analyse intelligente pour une sélection optimisée selon la période."}
          {activeTab === 'generation' && "Générez des grilles simples ou multiples rapidement."}
          {activeTab === 'statistics' && "Fréquences, patterns et tendances basées sur les tirages réels."}
          {activeTab === 'management' && "Sauvegardez et retrouvez vos grilles."}
        </p>
      </div>

      {/* Modale Détails du Mode Intermédiaire */}
      {showModeDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">⚖️ Mode Intermédiaire</h3>
              <button
                onClick={() => setShowModeDetails(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Plus d'options et d'analyses pour optimiser vos stratégies de jeu.
              </p>
              
              <div className="bg-amber-50 rounded-lg p-4">
                <h4 className="font-semibold text-amber-800 mb-2">Fonctionnalités disponibles :</h4>
                <ul className="space-y-1 text-sm text-amber-700">
                  <li>• Toutes les fonctionnalités débutant</li>
                  <li>• Statistiques avancées</li>
                  <li>• Analyse des patterns</li>
                  <li>• Gestion des grilles sauvegardées</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-2">4 onglets disponibles :</h4>
                <div className="space-y-1 text-sm text-orange-700">
                  <div>• <strong>Analyse</strong> : Sélection intelligente</div>
                  <div>• <strong>Génération</strong> : Grilles simples et multiples</div>
                  <div>• <strong>Statistiques</strong> : Fréquences et patterns</div>
                  <div>• <strong>Gestion</strong> : Sauvegarde avancée</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
