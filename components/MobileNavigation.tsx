'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  BarChart3, 
  Target, 
  Zap, 
  Settings,
  TestTube,
  TrendingUp,
  Calculator,
  Brain,
  Layers,
  ChevronRight
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  complexityLevel: 'beginner' | 'intermediate' | 'expert';
}

const navigationItems: Record<string, NavigationItem[]> = {
  beginner: [
    {
      id: 'dashboard',
      label: 'Accueil',
      icon: Home,
      color: 'bg-blue-500',
      description: 'Vue d\'ensemble'
    },
    {
      id: 'generator',
      label: 'Générateur',
      icon: Zap,
      color: 'bg-green-500',
      description: 'Créer des grilles'
    },
    {
      id: 'tester',
      label: 'Testeur',
      icon: TestTube,
      color: 'bg-purple-500',
      description: 'Tester vos numéros'
    }
  ],
  intermediate: [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: Home,
      color: 'bg-blue-500',
      description: 'Vue d\'ensemble'
    },
    {
      id: 'analysis',
      label: 'Analyses',
      icon: BarChart3,
      color: 'bg-indigo-500',
      description: 'Statistiques détaillées'
    },
    {
      id: 'generator',
      label: 'Générateur',
      icon: Zap,
      color: 'bg-green-500',
      description: 'Grilles optimisées'
    },
    {
      id: 'tester',
      label: 'Testeur',
      icon: TestTube,
      color: 'bg-purple-500',
      description: 'Tests avancés'
    },
    {
      id: 'patterns',
      label: 'Patterns',
      icon: Target,
      color: 'bg-orange-500',
      description: 'Détection de motifs'
    }
  ],
  expert: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      color: 'bg-blue-500',
      description: 'Vue complète'
    },
    {
      id: 'analysis',
      label: 'Analyses',
      icon: BarChart3,
      color: 'bg-indigo-500',
      description: 'Statistiques expertes'
    },
    {
      id: 'intelligent',
      label: 'IA',
      icon: Brain,
      color: 'bg-cyan-500',
      description: 'Analyse intelligente'
    },
    {
      id: 'generator',
      label: 'Générateur',
      icon: Zap,
      color: 'bg-green-500',
      description: 'Multi-stratégies'
    },
    {
      id: 'optimizer',
      label: 'Optimiseur',
      icon: Calculator,
      color: 'bg-red-500',
      description: 'Garanties mathématiques'
    },
    {
      id: 'tester',
      label: 'Testeur',
      icon: TestTube,
      color: 'bg-purple-500',
      description: 'Tests ultra-rapides'
    },
    {
      id: 'advanced',
      label: 'Avancé',
      icon: Layers,
      color: 'bg-gray-600',
      description: 'Outils experts'
    },
    {
      id: 'trends',
      label: 'Tendances',
      icon: TrendingUp,
      color: 'bg-pink-500',
      description: 'Prédictions'
    }
  ]
};

export default function MobileNavigation({ 
  activeTab, 
  onTabChange, 
  complexityLevel 
}: MobileNavigationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const items = navigationItems[complexityLevel] || navigationItems.beginner;

  return (
    <>
      {/* Navigation Bottom Bar - Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 gap-1 p-2">
          {items.slice(0, 3).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium truncate">{item.label}</span>
              </button>
            );
          })}
          
          {/* Bouton "Plus" */}
          <button
            onClick={() => setIsExpanded(true)}
            className="flex flex-col items-center justify-center p-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Plus</span>
          </button>
        </div>
      </div>

      {/* Menu Étendu - Modal */}
      {isExpanded && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setIsExpanded(false)}>
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header du modal */}
            <div className="sticky top-0 bg-white border-b p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Navigation</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Liste complète des options */}
            <div className="p-4 space-y-2">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setIsExpanded(false);
                    }}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${
                      isActive 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${item.color} text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                        {item.label}
                      </div>
                      <div className={`text-sm ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                        {item.description}
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  </button>
                );
              })}
            </div>

            {/* Niveau de complexité */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Mode: {complexityLevel === 'beginner' ? 'Débutant' : 
                        complexityLevel === 'intermediate' ? 'Intermédiaire' : 'Expert'}
                </span>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  complexityLevel === 'beginner' ? 'bg-green-100 text-green-700' :
                  complexityLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {items.length} fonctions
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Spacer pour le bottom navigation */}
      <div className="md:hidden h-20"></div>
    </>
  );
}
