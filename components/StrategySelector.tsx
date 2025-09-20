'use client';

import React from 'react';
import { 
  TrendingUp, Clock, Calculator, Shield, Zap, BarChart3
} from 'lucide-react';

interface Strategy {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  enabled: boolean;
  frequency?: string;
  details?: string;
  hasConfig?: boolean;
  configAction?: () => void;
  configSummary?: string;
}

interface StrategySelectorProps {
  strategiesByCategory: Record<string, Strategy[]>;
  onStrategyToggle: (strategyId: string) => void;
  hotNumbers?: number[];
  coldNumbers?: number[];
  isLoadingHotCold?: boolean;
  hotColdPeriodInfo?: string;
  onOpenPatternsModal?: () => void;
  selectedPatternsCount?: number;
  remainingCombinations?: number;
  fullWidth?: boolean;
}

export default function StrategySelector({ 
  strategiesByCategory, 
  onStrategyToggle,
  hotNumbers = [],
  coldNumbers = [],
  isLoadingHotCold = false,
  hotColdPeriodInfo = '',
  onOpenPatternsModal,
  selectedPatternsCount = 0,
  remainingCombinations = 0,
  fullWidth = false
}: StrategySelectorProps) {
  return (
    <div className={`${fullWidth ? 'w-full' : 'w-full lg:w-[500px]'} bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 ${!fullWidth ? 'lg:border-r border-purple-300' : ''} overflow-y-auto max-h-screen`}>
      {/* Header onirique avec compteur de combinaisons intégré */}
      <div className="relative bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        
        {/* Titre principal */}
        <div className="relative p-4 text-center">
          <div className="text-3xl mb-1">🎰✨🎲</div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Machine à Rêves</h1>
          <p className="text-xs text-gray-700 font-medium">Configurez vos stratégies gagnantes</p>
        </div>
        
        {/* Compteur de combinaisons intégré dans l'en-tête */}
        <div className="relative p-4 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
          <div className="relative flex items-center justify-between">
            {/* Emojis animés */}
            <div className="flex items-center gap-2">
              <div className="text-2xl animate-bounce">🍀</div>
              <div className="text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>⭐</div>
              <div className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>💎</div>
            </div>
            
            {/* Compteur principal */}
            <div className="text-center flex-1">
              <div className="text-3xl font-black text-white drop-shadow-lg">
                {remainingCombinations.toLocaleString()}
              </div>
              <div className="text-emerald-100 text-sm font-bold">
                Combinaisons Magiques
              </div>
            </div>
            
            {/* Indicateur de chance */}
            <div className="text-right">
              <div className="text-xs text-emerald-200 font-medium">
                Vos chances
              </div>
              <div className="text-xs text-emerald-100">
                de réaliser vos rêves
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        
        {/* Titre des stratégies avec effet de brillance */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            <h2 className="text-2xl font-bold mb-2">🎯 Stratégies de Génie</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full"></div>
          </div>
        </div>
        
        {/* Indicateur de période avec style onirique */}
        {hotColdPeriodInfo && (
          <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-300/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl animate-spin">🌊</div>
              <span className="text-sm font-bold text-cyan-100">Période d'analyse magique</span>
              {isLoadingHotCold && (
                <div className="w-5 h-5 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <p className="text-xs text-cyan-200 font-medium">{hotColdPeriodInfo}</p>
          </div>
        )}
        
        <div className="space-y-6">
          {Object.entries(strategiesByCategory).map(([category, strategies]) => (
            <div key={category} className="space-y-4">
              {/* Titre de catégorie avec effet de brillance */}
              <div className="text-center">
                <h3 className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                  {category === 'Fréquence' && '🔥 Fréquence Magique'}
                  {category === 'Patterns' && '🎭 Patterns Mystiques'}
                  {category === 'Mathématiques' && '🧮 Mathématiques Divines'}
                  {category === 'Réglementaires' && '⚖️ Règles Sacrées'}
                  {category === 'Avancées' && '🚀 Technologies Futuristes'}
                </h3>
                <div className="w-16 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 mx-auto rounded-full"></div>
              </div>
              
              <div className="grid gap-4">
                {strategies.map((strategy) => (
                  <div key={strategy.id} className="group">
                    {/* Carte de stratégie onirique */}
                    <div className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                      strategy.enabled 
                        ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-400 shadow-emerald-500/25 shadow-lg' 
                        : 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-600 hover:border-gray-500'
                    }`}>
                      
                      {/* Effet de brillance pour les stratégies activées */}
                      {strategy.enabled && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                      )}
                      
                      <label className="relative block p-6 cursor-pointer">
                        <div className="flex items-start gap-4">
                          {/* Checkbox stylisé */}
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={strategy.enabled}
                              onChange={() => onStrategyToggle(strategy.id)}
                              className="sr-only"
                            />
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                              strategy.enabled 
                                ? 'bg-gradient-to-r from-emerald-400 to-teal-400 border-emerald-300 shadow-lg shadow-emerald-500/50' 
                                : 'bg-gray-700 border-gray-500 group-hover:border-gray-400'
                            }`}>
                              {strategy.enabled && (
                                <div className="text-white text-lg animate-bounce">✓</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            {/* En-tête de stratégie */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`text-3xl transition-transform duration-300 ${
                                strategy.enabled ? 'animate-bounce' : 'group-hover:scale-110'
                              }`}>
                                {strategy.id === 'includeHotNumbers' && '🔥'}
                                {strategy.id === 'includeColdNumbers' && '❄️'}
                                {strategy.id === 'includeHotColdHybrid' && '🌡️'}
                                {strategy.id === 'includeEcartsRetard' && '⏳'}
                                {strategy.id === 'includePatterns' && '🎭'}
                                {strategy.id === 'includeTemporalPatterns' && '⏰'}
                                {strategy.id === 'includeMathematical' && '🧮'}
                                {strategy.id === 'includeRules' && '⚖️'}
                                {strategy.id === 'includeAdvanced' && '🚀'}
                              </div>
                              <div>
                                <h4 className={`text-lg font-bold transition-colors duration-300 ${
                                  strategy.enabled ? 'text-emerald-100' : 'text-gray-300 group-hover:text-white'
                                }`}>
                                  {strategy.name}
                                </h4>
                                {strategy.frequency && (
                                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                    strategy.enabled 
                                      ? 'bg-emerald-400/30 text-emerald-100 border border-emerald-300' 
                                      : 'bg-gray-600/50 text-gray-300 border border-gray-500'
                                  }`}>
                                    {strategy.frequency}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Description */}
                            <p className={`text-sm mb-3 transition-colors duration-300 ${
                              strategy.enabled ? 'text-emerald-200' : 'text-gray-400 group-hover:text-gray-300'
                            }`}>
                              {strategy.description}
                            </p>
                            
                            {strategy.details && (
                              <p className={`text-xs italic transition-colors duration-300 ${
                                strategy.enabled ? 'text-emerald-300' : 'text-gray-500 group-hover:text-gray-400'
                              }`}>
                                {strategy.details}
                              </p>
                            )}
                            
                            {/* Bouton de configuration générique */}
                            {strategy.hasConfig && strategy.configAction && (
                              <div className="mt-4">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    strategy.configAction?.();
                                  }}
                                  className={`w-full px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 ${
                                    strategy.enabled 
                                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50 hover:shadow-orange-500/70' 
                                      : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:text-white'
                                  }`}
                                >
                                  <div className="text-xl">⚙️</div>
                                  <span>Configurer {strategy.name}</span>
                                  {strategy.configSummary && (
                                    <div className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold">
                                      {strategy.configSummary}
                                    </div>
                                  )}
                                </button>
                              </div>
                            )}
                            
                            {/* Bouton magique pour les patterns */}
                            {strategy.id === 'includePatterns' && onOpenPatternsModal && (
                              <div className="mt-4">
                                <button
                                  onClick={onOpenPatternsModal}
                                  className={`w-full px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 ${
                                    strategy.enabled 
                                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70' 
                                      : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:text-white'
                                  }`}
                                >
                                  <div className="text-xl">🎭</div>
                                  <span>Ouvrir la Boîte à Patterns</span>
                                  {selectedPatternsCount > 0 && (
                                    <div className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                                      {selectedPatternsCount} sélectionnés
                                    </div>
                                  )}
                                </button>
                              </div>
                            )}
                            
                            {/* Affichage des numéros chauds avec style onirique */}
                            {strategy.id === 'includeHotNumbers' && hotNumbers.length > 0 && (
                              <div className={`mt-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                                strategy.enabled 
                                  ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-400 shadow-lg shadow-red-500/25' 
                                  : 'bg-gray-800/50 border-gray-600'
                              }`}>
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="text-2xl animate-pulse">🔥</div>
                                  <p className={`text-sm font-bold ${
                                    strategy.enabled ? 'text-red-200' : 'text-gray-400'
                                  }`}>
                                    Numéros Brûlants ({hotNumbers.length})
                                  </p>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                  {hotNumbers.slice(0, 20).map((num) => (
                                    <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                      strategy.enabled 
                                        ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/50 animate-pulse' 
                                        : 'bg-gray-600 text-gray-400'
                                    }`}>
                                      {num}
                                    </div>
                                  ))}
                                </div>
                                {!strategy.enabled && (
                                  <p className="text-xs text-gray-500 mt-3 italic text-center">
                                    ✨ Activez cette stratégie pour réveiller ces numéros magiques
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {/* Affichage des numéros froids avec style onirique */}
                            {strategy.id === 'includeColdNumbers' && coldNumbers.length > 0 && (
                              <div className={`mt-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                                strategy.enabled 
                                  ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400 shadow-lg shadow-blue-500/25' 
                                  : 'bg-gray-800/50 border-gray-600'
                              }`}>
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="text-2xl animate-pulse">❄️</div>
                                  <p className={`text-sm font-bold ${
                                    strategy.enabled ? 'text-blue-200' : 'text-gray-400'
                                  }`}>
                                    Numéros Glacés ({coldNumbers.length})
                                  </p>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                  {coldNumbers.slice(0, 20).map((num) => (
                                    <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                      strategy.enabled 
                                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50 animate-pulse' 
                                        : 'bg-gray-600 text-gray-400'
                                    }`}>
                                      {num}
                                    </div>
                                  ))}
                                </div>
                                {!strategy.enabled && (
                                  <p className="text-xs text-gray-500 mt-3 italic text-center">
                                    ❄️ Activez cette stratégie pour libérer ces numéros endormis
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {/* Affichage hybride hot-cold avec style onirique */}
                            {strategy.id === 'includeHotColdHybrid' && (hotNumbers.length > 0 || coldNumbers.length > 0) && (
                              <div className={`mt-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                                strategy.enabled 
                                  ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400 shadow-lg shadow-purple-500/25' 
                                  : 'bg-gray-800/50 border-gray-600'
                              }`}>
                                <div className="flex items-center gap-2 mb-4">
                                  <div className="text-2xl animate-pulse">🌡️</div>
                                  <p className={`text-sm font-bold ${
                                    strategy.enabled ? 'text-purple-200' : 'text-gray-400'
                                  }`}>
                                    Mélange Tempéré Magique
                                  </p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  {/* Top 10 chauds */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="text-lg animate-bounce">🔥</div>
                                      <p className={`text-xs font-bold ${
                                        strategy.enabled ? 'text-red-200' : 'text-gray-400'
                                      }`}>
                                        Top 10 Brûlants
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-5 gap-1">
                                      {hotNumbers.slice(0, 10).map((num) => (
                                        <div key={num} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                          strategy.enabled 
                                            ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/50' 
                                            : 'bg-gray-600 text-gray-400'
                                        }`}>
                                          {num}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* Top 10 froids */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="text-lg animate-bounce">❄️</div>
                                      <p className={`text-xs font-bold ${
                                        strategy.enabled ? 'text-blue-200' : 'text-gray-400'
                                      }`}>
                                        Top 10 Glacés
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-5 gap-1">
                                      {coldNumbers.slice(0, 10).map((num) => (
                                        <div key={num} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                          strategy.enabled 
                                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50' 
                                            : 'bg-gray-600 text-gray-400'
                                        }`}>
                                          {num}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                
                                {!strategy.enabled && (
                                  <p className="text-xs text-gray-500 mt-4 italic text-center">
                                    🌡️ Activez cette stratégie pour créer l'équilibre parfait
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}