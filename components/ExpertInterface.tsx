'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain,
  Target,
  Zap,
  BarChart3,
  Save,
  X
} from 'lucide-react';

// Import de tous les composants avancés
import SimpleUnifiedAnalysis from './SimpleUnifiedAnalysis';
import EnhancedGridGenerator from './EnhancedGridGenerator';
import SavedGridsManager from './SavedGridsManager';
import FrequencyAnalysis from './FrequencyAnalysis';
import PatternAnalysis from './PatternAnalysis';

interface ExpertInterfaceProps {
  globalAnalysisPeriod: string;
  onAnalysisPeriodChange: (period: any) => void;
  onCombinationsChange: (count: number) => void;
}

type ExpertCategory = 'analysis' | 'generation' | 'statistics' | 'management';

type ExpertTab = 
  | 'intelligent-analysis'
  | 'simple-generation'
  | 'statistics-overview'
  | 'saved-grids';

export default function ExpertInterface({ 
  globalAnalysisPeriod,
  onAnalysisPeriodChange,
  onCombinationsChange 
}: ExpertInterfaceProps) {
  const [activeCategory, setActiveCategory] = useState<ExpertCategory>('analysis');
  const [activeTab, setActiveTab] = useState<ExpertTab>('intelligent-analysis');
  const [showModeDetails, setShowModeDetails] = useState(false);

  const categories = [
    {
      id: 'analysis' as ExpertCategory,
      label: 'Analyse',
      icon: Brain,
      tabs: [
        { id: 'intelligent-analysis' as ExpertTab, label: 'Analyse IA', icon: Target }
      ]
    },
    {
      id: 'generation' as ExpertCategory,
      label: 'Génération',
      icon: Zap,
      tabs: [
        { id: 'simple-generation' as ExpertTab, label: 'Grilles', icon: Target }
      ]
    },
    {
      id: 'statistics' as ExpertCategory,
      label: 'Statistiques',
      icon: BarChart3,
      tabs: [
        { id: 'statistics-overview' as ExpertTab, label: 'Vue d’ensemble', icon: BarChart3 }
      ]
    },
    {
      id: 'management' as ExpertCategory,
      label: 'Gestion',
      icon: Save,
      tabs: [
        { id: 'saved-grids' as ExpertTab, label: 'Grilles', icon: Save }
      ]
    }
  ];

  const categoryTheme: Record<ExpertCategory, string> = {
    analysis: 'theme-analysis',
    generation: 'theme-generation',
    statistics: 'theme-statistics',
    management: 'theme-management'
  };

  const categorySoft: Record<ExpertCategory, string> = {
    analysis: 'theme-analysis-soft',
    generation: 'theme-generation-soft',
    statistics: 'theme-statistics-soft',
    management: 'theme-management-soft'
  };

  const renderTabContent = () => {
    switch (activeTab) {
      // Analyse
      case 'intelligent-analysis':
        return (
          <SimpleUnifiedAnalysis 
            analysisPeriod={globalAnalysisPeriod}
            onNumberSelection={(numbers, complementary, source) => {
              localStorage.setItem('selectedNumbers', JSON.stringify({
                numbers, complementary, source,
                timestamp: new Date().toISOString(),
                period: globalAnalysisPeriod
              }));
            }}
          />
        );
      // Génération
      case 'simple-generation':
        return <EnhancedGridGenerator globalAnalysisPeriod={globalAnalysisPeriod} />;
        
      // Statistiques
      case 'statistics-overview':
        return (
          <div className="card">
            <div className="section-header">
              <div>
                <h3 className="section-title">📊 Statistiques clés</h3>
                <p className="section-subtitle">Fréquences et patterns sur la période choisie</p>
              </div>
              <span className="pill pill-info">Période: {globalAnalysisPeriod}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <FrequencyAnalysis analysisPeriod={globalAnalysisPeriod as any} />
              <PatternAnalysis analysisPeriod={globalAnalysisPeriod as any} />
            </div>
          </div>
        );
        
      // Gestion
      case 'saved-grids':
        return <SavedGridsManager />;
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête Mode Expert - Cliquable */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="expert-header"
        onClick={() => setShowModeDetails(true)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🎯</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Mode Expert
              </h1>
              <p className="text-red-100 text-lg">
                Accès complet aux outils avancés, avec résultats fiables
              </p>
              <div className="mt-2 text-sm text-white/80">
                Cliquez pour voir les détails du mode
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="pill theme-analysis">Analyse</span>
            <span className="pill theme-generation">Génération</span>
            <span className="pill theme-statistics">Statistiques</span>
            <span className="pill theme-management">Gestion</span>
          </div>
        </div>
      </motion.div>

      {/* Navigation par catégories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="section-header">
          <div>
            <h2 className="section-title">Navigation Expert</h2>
            <p className="section-subtitle">Tout l’essentiel, en 4 blocs clairs</p>
          </div>
          <span className="pill pill-info">Mode Expert</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  setActiveTab(category.tabs[0].id);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
                  isActive
                    ? `${categoryTheme[category.id]} shadow-lg`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sous-onglets */}
        {categories.find(c => c.id === activeCategory)?.tabs.length! > 1 && (
          <div className="flex flex-wrap gap-1 border-t pt-4">
            {categories.find(c => c.id === activeCategory)?.tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                    isActive
                      ? categorySoft[activeCategory]
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Contenu de l'onglet */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {renderTabContent()}
      </motion.div>

      {/* Panneau d'informations expert */}
      <div className="card">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-orange-600">🎯</div>
          <span className="font-semibold text-gray-800">Mode Expert Actif</span>
        </div>
        <p className="text-gray-700 text-sm">
          Analyse avancée, génération optimisée et statistiques fiables basées sur l'historique réel.
        </p>
      </div>

      {/* Modale Détails du Mode Expert */}
      {showModeDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">🎯 Mode Expert</h3>
              <button
                onClick={() => setShowModeDetails(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Accès complet à toutes les fonctionnalités avancées de l'application.
              </p>
              
              <div className="bg-rose-50 rounded-lg p-4">
                <h4 className="font-semibold text-rose-800 mb-2">Fonctionnalités disponibles :</h4>
                <ul className="space-y-1 text-sm text-rose-700">
                  <li>• Analyse IA sur données réelles</li>
                  <li>• Génération de grilles (simple & multiple)</li>
                  <li>• Statistiques fiables : fréquences + patterns</li>
                  <li>• Gestion des grilles sauvegardées</li>
                </ul>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">4 catégories d'outils :</h4>
                <div className="space-y-1 text-sm text-red-700">
                  <div>• <strong>Analyse</strong> : IA & sélection</div>
                  <div>• <strong>Génération</strong> : Grilles</div>
                  <div>• <strong>Statistiques</strong> : Fréquences & patterns</div>
                  <div>• <strong>Gestion</strong> : Sauvegardes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
