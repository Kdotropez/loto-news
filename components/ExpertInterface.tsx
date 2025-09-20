'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain,
  Target,
  Zap,
  BarChart3,
  Trophy,
  Save,
  RefreshCw,
  Settings,
  Calculator,
  TrendingUp,
  Search,
  Clock,
  FlaskConical,
  Layers,
  Eye,
  X
} from 'lucide-react';

// Import de tous les composants avancés
import SimpleUnifiedAnalysis from './SimpleUnifiedAnalysis';
import ThreeWindowInterface from './ThreeWindowInterface';
import EnhancedGridGenerator from './EnhancedGridGenerator';
import RetroactiveAnalysis from './RetroactiveAnalysis';
import SavedGridsManager from './SavedGridsManager';
import OpenDataSoftSync from './OpenDataSoftSync';
import CombinationTester from './CombinationTester';
import FrequencyAnalysis from './FrequencyAnalysis';
import PatternAnalysis from './PatternAnalysis';
import TrendAnalysis from './TrendAnalysis';
import AdvancedStatistics from './AdvancedStatistics';
import UltraAdvancedStatistics from './UltraAdvancedStatistics';
import OfficialRulesAnalysis from './OfficialRulesAnalysis';
import DrawProximityAnalyzer from './DrawProximityAnalyzer';
import EvenOddAnalysis from './EvenOddAnalysis';

interface ExpertInterfaceProps {
  globalAnalysisPeriod: string;
  onAnalysisPeriodChange: (period: any) => void;
  onCombinationsChange: (count: number) => void;
}

type ExpertCategory = 'analysis' | 'generation' | 'testing' | 'statistics' | 'management';

type ExpertTab = 
  | 'intelligent-analysis' | 'strategy-config' 
  | 'simple-generation' | 'advanced-generation'
  | 'combination-tester' | 'retroactive-analysis'
  | 'frequency' | 'patterns' | 'trends' | 'advanced-stats' | 'ultra-stats' | 'rules' | 'proximity' | 'even-odd'
  | 'saved-grids' | 'auto-sync';

export default function ExpertInterface({ 
  globalAnalysisPeriod,
  onAnalysisPeriodChange,
  onCombinationsChange 
}: ExpertInterfaceProps) {
  const [activeCategory, setActiveCategory] = useState<ExpertCategory>('analysis');
  const [activeTab, setActiveTab] = useState<ExpertTab>('intelligent-analysis');
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [showModeDetails, setShowModeDetails] = useState(false);

  const categories = [
    {
      id: 'analysis' as ExpertCategory,
      label: '🧠 Analyse Avancée',
      icon: Brain,
      tabs: [
        { id: 'intelligent-analysis' as ExpertTab, label: '🎯 IA Intelligente', icon: Target },
        { id: 'strategy-config' as ExpertTab, label: '⚙️ Config Stratégies', icon: Settings }
      ]
    },
    {
      id: 'generation' as ExpertCategory,
      label: '🎲 Génération Expert',
      icon: Zap,
      tabs: [
        { id: 'simple-generation' as ExpertTab, label: '🎯 Grilles Simples', icon: Target },
        { id: 'advanced-generation' as ExpertTab, label: '🚀 Optimisateur', icon: Calculator }
      ]
    },
    {
      id: 'testing' as ExpertCategory,
      label: '🧪 Tests & Validation',
      icon: FlaskConical,
      tabs: [
        { id: 'combination-tester' as ExpertTab, label: '🧪 Testeur', icon: FlaskConical },
        { id: 'retroactive-analysis' as ExpertTab, label: '🔄 Rétroactif', icon: RefreshCw }
      ]
    },
    {
      id: 'statistics' as ExpertCategory,
      label: '📊 Statistiques Expert',
      icon: BarChart3,
      tabs: [
        { id: 'frequency' as ExpertTab, label: '📈 Fréquences', icon: TrendingUp },
        { id: 'patterns' as ExpertTab, label: '🔍 Patterns', icon: Search },
        { id: 'trends' as ExpertTab, label: '📊 Tendances', icon: BarChart3 },
        { id: 'advanced-stats' as ExpertTab, label: '🎯 Stats Avancées', icon: Target },
        { id: 'ultra-stats' as ExpertTab, label: '🚀 Ultra Stats', icon: Brain },
        { id: 'rules' as ExpertTab, label: '📋 Règles', icon: Trophy },
        { id: 'proximity' as ExpertTab, label: '🎯 Proximité', icon: Target },
        { id: 'even-odd' as ExpertTab, label: '⚖️ Pair/Impair', icon: Calculator }
      ]
    },
    {
      id: 'management' as ExpertCategory,
      label: '💾 Gestion Expert',
      icon: Save,
      tabs: [
        { id: 'saved-grids' as ExpertTab, label: '💾 Grilles', icon: Save },
        { id: 'auto-sync' as ExpertTab, label: '🔄 Sync Auto', icon: RefreshCw }
      ]
    }
  ];

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
      case 'strategy-config':
        return (
          <ThreeWindowInterface
            globalAnalysisPeriod={globalAnalysisPeriod as 'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100'}
            mode="strategy-generator"
            onCombinationsChange={onCombinationsChange}
          />
        );
        
      // Génération
      case 'simple-generation':
        return <EnhancedGridGenerator globalAnalysisPeriod={globalAnalysisPeriod} />;
      case 'advanced-generation':
        return <EnhancedGridGenerator globalAnalysisPeriod={globalAnalysisPeriod} />;
        
      // Tests
      case 'combination-tester':
        return <CombinationTester />;
      case 'retroactive-analysis':
        return <RetroactiveAnalysis analysisPeriod={globalAnalysisPeriod} />;
        
      // Statistiques
      case 'frequency':
        return <FrequencyAnalysis analysisPeriod={globalAnalysisPeriod as any} />;
      case 'patterns':
        return <PatternAnalysis analysisPeriod={globalAnalysisPeriod as any} />;
      case 'trends':
        return <TrendAnalysis />;
      case 'advanced-stats':
        return <AdvancedStatistics analysisPeriod={globalAnalysisPeriod as any} />;
      case 'ultra-stats':
        return <UltraAdvancedStatistics analysisPeriod={globalAnalysisPeriod as any} />;
      case 'rules':
        return <OfficialRulesAnalysis />;
      case 'proximity':
        return <DrawProximityAnalyzer />;
      case 'even-odd':
        return <EvenOddAnalysis />;
        
      // Gestion
      case 'saved-grids':
        return <SavedGridsManager />;
      case 'auto-sync':
        return <OpenDataSoftSync />;
        
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🎯</div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Mode Expert
                <Settings className="w-6 h-6 opacity-70" />
              </h1>
              <p className="text-red-100 text-lg">
                Accès complet à toutes les fonctionnalités avancées
              </p>
            </div>
          </div>
          
          {/* Contrôles Expert */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPerformanceMetrics(!showPerformanceMetrics)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm">Métriques</span>
            </button>
            <button
              onClick={() => setCompactMode(!compactMode)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Layers className="w-4 h-4" />
              <span className="text-sm">Compact</span>
            </button>
          </div>
        </div>
        
        {/* Métriques de performance */}
        {showPerformanceMetrics && (
          <div className="mt-4 grid md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">12,272</div>
              <div className="text-xs text-red-200">Tirages Historiques</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">49 ans</div>
              <div className="text-xs text-red-200">Période Couverte</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">47</div>
              <div className="text-xs text-red-200">Composants Actifs</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">8</div>
              <div className="text-xs text-red-200">APIs Fonctionnelles</div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation par catégories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">Catégories Expertes</h2>
        
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
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className={compactMode ? 'hidden' : ''}>{category.label}</span>
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
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className={compactMode ? 'hidden' : ''}>{tab.label}</span>
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
        className={compactMode ? 'space-y-4' : 'space-y-6'}
      >
        {renderTabContent()}
      </motion.div>

      {/* Panneau d'informations expert */}
      {!compactMode && (
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-orange-600">🎯</div>
            <span className="font-semibold text-gray-800">Mode Expert Actif</span>
          </div>
          <p className="text-gray-700 text-sm">
            Vous avez accès à toutes les fonctionnalités avancées : analyses mathématiques, optimisations Set Cover, 
            bornes théoriques, et tous les outils de validation. Utilisez les métriques de performance pour 
            surveiller les calculs complexes.
          </p>
        </div>
      )}

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
                  <li>• Toutes les fonctionnalités précédentes</li>
                  <li>• Optimisateur de garanties</li>
                  <li>• Analyse rétroactive complète</li>
                  <li>• Formules mathématiques</li>
                  <li>• Bornes théoriques</li>
                  <li>• Synchronisation automatique</li>
                </ul>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">4 catégories d'outils :</h4>
                <div className="space-y-1 text-sm text-red-700">
                  <div>• <strong>Analyse Avancée</strong> : IA + Config stratégies</div>
                  <div>• <strong>Génération Expert</strong> : Grilles + Optimisateur</div>
                  <div>• <strong>Tests & Validation</strong> : Testeur + Rétroactif</div>
                  <div>• <strong>Statistiques</strong> : Toutes les analyses</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
