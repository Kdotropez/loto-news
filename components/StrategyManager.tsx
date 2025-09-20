'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  XCircle, 
  Clock, 
  Calculator, 
  Activity, 
  Layers, 
  Hash, 
  Star, 
  Zap, 
  Brain, 
  BarChart3,
  LucideIcon
} from 'lucide-react';

interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  enabled: boolean;
}

interface StrategyManagerProps {
  onStrategiesChange: (strategies: OptimizationStrategy[]) => void;
}

export default function StrategyManager({ onStrategiesChange }: StrategyManagerProps) {
  const [strategies, setStrategies] = useState<OptimizationStrategy[]>([
    // Stratégies sérieuses et mathématiques
    { id: 'hot-cold-hybrid', name: 'Hot-Cold Hybride', description: 'Mélange optimal entre numéros chauds et froids', icon: Target, color: 'blue', enabled: true },
    { id: 'correlations', name: 'Corrélations Fortes', description: 'Utilise les corrélations statistiques les plus fortes', icon: TrendingUp, color: 'green', enabled: true },
    { id: 'anti-correlations', name: 'Anti-Corrélations', description: 'Évite les combinaisons qui ont mal performé', icon: XCircle, color: 'red', enabled: true },
    { id: 'temporal-patterns', name: 'Patterns Temporels', description: 'Basé sur les cycles de récurrence et tendances', icon: Clock, color: 'purple', enabled: true },
    { id: 'mathematical-patterns', name: 'Patterns Mathématiques', description: 'Utilise des structures mathématiques', icon: Calculator, color: 'orange', enabled: true },
    { id: 'volatility-optimized', name: 'Volatilité Optimisée', description: 'Équilibre stabilité et opportunité', icon: Activity, color: 'pink', enabled: true },
    { id: 'neural-network', name: 'Réseau de Neurones', description: 'IA et machine learning avancé', icon: Brain, color: 'emerald', enabled: true },
    { id: 'fibonacci', name: 'Suite de Fibonacci', description: 'Nombres de la suite de Fibonacci', icon: TrendingUp, color: 'zinc', enabled: true },
    { id: 'golden-ratio', name: 'Nombre d\'Or', description: 'Basé sur le ratio d\'or (1.618)', icon: Target, color: 'neutral', enabled: true },
    { id: 'prime-numbers', name: 'Nombres Premiers', description: 'Exclusivement des nombres premiers', icon: Calculator, color: 'stone', enabled: true },
    
    // Stratégies avancées
    { id: 'geometric', name: 'Géométrique', description: 'Patterns géométriques et spirales d\'or', icon: Layers, color: 'cyan', enabled: false },
    { id: 'binary-patterns', name: 'Patterns Binaires', description: 'Système binaire et codes informatiques', icon: Hash, color: 'gray', enabled: false },
    
    // Stratégies expérimentales
    { id: 'astrological', name: 'Astrologique', description: 'Basé sur les signes astrologiques et phases lunaires', icon: Star, color: 'indigo', enabled: false },
    { id: 'numerology', name: 'Numérologie', description: 'Utilise la numérologie et signification des nombres', icon: Hash, color: 'teal', enabled: false },
    { id: 'chaos-theory', name: 'Théorie du Chaos', description: 'Attracteurs étranges et fractales', icon: Zap, color: 'yellow', enabled: false },
    { id: 'quantum', name: 'Quantique', description: 'Superposition quantique et intrication', icon: Brain, color: 'violet', enabled: false },
    { id: 'weather-patterns', name: 'Météorologique', description: 'Corrélation avec la météo et saisons', icon: TrendingUp, color: 'sky', enabled: false },
    { id: 'economic-indicators', name: 'Indicateurs Économiques', description: 'Basé sur l\'économie et marchés financiers', icon: BarChart3, color: 'amber', enabled: false },
    { id: 'social-media', name: 'Réseaux Sociaux', description: 'Tendances et buzz des réseaux sociaux', icon: Target, color: 'rose', enabled: false },
    { id: 'sports-events', name: 'Événements Sportifs', description: 'Corrélation avec les résultats sportifs', icon: Star, color: 'lime', enabled: false },
    { id: 'news-sentiment', name: 'Sentiment Actualités', description: 'Analyse du sentiment des actualités', icon: Brain, color: 'slate', enabled: false },
    { id: 'lunar-cycles', name: 'Cycles Lunaires', description: 'Phases de lune et marées', icon: Star, color: 'fuchsia', enabled: false },
    { id: 'color-theory', name: 'Théorie des Couleurs', description: 'Basé sur la psychologie des couleurs', icon: Star, color: 'red', enabled: false },
    { id: 'music-harmony', name: 'Harmonie Musicale', description: 'Gammes musicales et accords', icon: Activity, color: 'blue', enabled: false },
    { id: 'feng-shui', name: 'Feng Shui', description: 'Énergies et flux selon le Feng Shui', icon: Layers, color: 'green', enabled: false },
    { id: 'tarot-cards', name: 'Cartes de Tarot', description: 'Correspondances avec les cartes de tarot', icon: Star, color: 'purple', enabled: false },
    { id: 'chakra-balance', name: 'Équilibre des Chakras', description: 'Centres d\'énergie et chakras', icon: Target, color: 'pink', enabled: false },
    { id: 'crystal-healing', name: 'Guérison Cristalline', description: 'Propriétés des cristaux et minéraux', icon: Star, color: 'cyan', enabled: false },
    { id: 'aromatherapy', name: 'Aromathérapie', description: 'Huiles essentielles et parfums', icon: Activity, color: 'amber', enabled: false },
    { id: 'biorhythms', name: 'Biorhythmes', description: 'Cycles biologiques personnels', icon: Clock, color: 'emerald', enabled: false },
    { id: 'dream-analysis', name: 'Analyse des Rêves', description: 'Symbolisme et interprétation des rêves', icon: Brain, color: 'indigo', enabled: false },
    { id: 'synchronicity', name: 'Synchronicité', description: 'Coïncidences significatives', icon: Zap, color: 'violet', enabled: false },
    { id: 'collective-unconscious', name: 'Inconscient Collectif', description: 'Archétypes de Jung et inconscient', icon: Brain, color: 'teal', enabled: false },
    { id: 'string-theory', name: 'Théorie des Cordes', description: 'Vibrations et dimensions multiples', icon: TrendingUp, color: 'rose', enabled: false },
    { id: 'dark-matter', name: 'Matière Noire', description: 'Énergie sombre et matière invisible', icon: Star, color: 'slate', enabled: false },
    { id: 'time-dilation', name: 'Dilatation Temporelle', description: 'Relativité et distorsion du temps', icon: Clock, color: 'lime', enabled: false },
    { id: 'parallel-universes', name: 'Univers Parallèles', description: 'Multivers et réalités alternatives', icon: Layers, color: 'fuchsia', enabled: false },
    { id: 'wormholes', name: 'Trous de Ver', description: 'Passages spatio-temporels', icon: Target, color: 'stone', enabled: false },
    { id: 'black-holes', name: 'Trous Noirs', description: 'Singularités et horizons d\'événements', icon: Star, color: 'zinc', enabled: false },
    { id: 'big-bang', name: 'Big Bang', description: 'Origine de l\'univers et expansion', icon: Zap, color: 'neutral', enabled: false },
    { id: 'consciousness', name: 'Conscience Universelle', description: 'Conscience collective et unité', icon: Brain, color: 'gray', enabled: false }
  ]);

  useEffect(() => {
    onStrategiesChange(strategies);
  }, [strategies, onStrategiesChange]);

  const toggleStrategy = (id: string) => {
    setStrategies(prev => 
      prev.map(strategy => 
        strategy.id === id 
          ? { ...strategy, enabled: !strategy.enabled }
          : strategy
      )
    );
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      pink: 'bg-pink-100 text-pink-800 border-pink-200',
      emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      zinc: 'bg-zinc-100 text-zinc-800 border-zinc-200',
      neutral: 'bg-neutral-100 text-neutral-800 border-neutral-200',
      stone: 'bg-stone-100 text-stone-800 border-stone-200',
      cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      teal: 'bg-teal-100 text-teal-800 border-teal-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      violet: 'bg-violet-100 text-violet-800 border-violet-200',
      sky: 'bg-sky-100 text-sky-800 border-sky-200',
      amber: 'bg-amber-100 text-amber-800 border-amber-200',
      rose: 'bg-rose-100 text-rose-800 border-rose-200',
      lime: 'bg-lime-100 text-lime-800 border-lime-200',
      slate: 'bg-slate-100 text-slate-800 border-slate-200',
      fuchsia: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const enabledCount = strategies.filter(s => s.enabled).length;
  const totalCount = strategies.length;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-primary-600" />
              Gestionnaire de Stratégies
            </h2>
            <p className="text-gray-600 mt-1">
              Configurez les stratégies d'optimisation pour la génération de combinaisons
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">{enabledCount}</div>
            <div className="text-sm text-gray-500">sur {totalCount} stratégies</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((strategy) => {
            const IconComponent = strategy.icon;
            return (
              <motion.div
                key={strategy.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  strategy.enabled 
                    ? getColorClasses(strategy.color)
                    : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}
                onClick={() => toggleStrategy(strategy.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-5 h-5 ${strategy.enabled ? '' : 'text-gray-400'}`} />
                    <h3 className="font-semibold text-sm">{strategy.name}</h3>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    strategy.enabled 
                      ? 'bg-current border-current' 
                      : 'bg-transparent border-gray-300'
                  }`} />
                </div>
                <p className="text-xs opacity-75 leading-relaxed">
                  {strategy.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}