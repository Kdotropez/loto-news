'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  RefreshCw, 
  Settings, 
  Target, 
  Zap,
  Star,
  Trophy,
  AlertTriangle,
  CheckCircle,
  Upload,
  Grid3X3,
  Shuffle,
  Save
} from 'lucide-react';

interface SelectedNumbers {
  numbers: number[];
  complementary: number[];
  source: string;
  timestamp: string;
  period: string;
}

interface AvailableSources {
  'analyse-intelligente': SelectedNumbers | null;
  'configuration-strategies': SelectedNumbers | null;
  'selection-manuelle': SelectedNumbers | null;
}

interface GeneratedGrid {
  id: string;
  numbers: number[];
  complementary: number;
  score: number;
  method: string;
  timestamp: string;
}

interface PureGenerationInterfaceProps {
  globalAnalysisPeriod: string;
}

export default function PureGenerationInterface({ globalAnalysisPeriod }: PureGenerationInterfaceProps) {
  const [availableSources, setAvailableSources] = useState<AvailableSources>({
    'analyse-intelligente': null,
    'configuration-strategies': null,
    'selection-manuelle': null
  });
  const [activeSource, setActiveSource] = useState<keyof AvailableSources>('analyse-intelligente');
  const [generatedGrids, setGeneratedGrids] = useState<GeneratedGrid[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [gridCount, setGridCount] = useState(5);
  const [generationMethod, setGenerationMethod] = useState<'optimal' | 'diversified' | 'random'>('optimal');
  const [gridType, setGridType] = useState<'simple' | 'multiple'>('simple');
  const [multipleGridConfig, setMultipleGridConfig] = useState<{
    numbersToSelect: number;
    complementaryToSelect: number;
  }>({ numbersToSelect: 8, complementaryToSelect: 2 });

  useEffect(() => {
    loadSelectedNumbers();
  }, []);

  const loadSelectedNumbers = () => {
    try {
      // Charger depuis toutes les sources possibles
      const sources = {
        'analyse-intelligente': localStorage.getItem('selectedNumbers'),
        'configuration-strategies': localStorage.getItem('strategyNumbers'),
        'selection-manuelle': localStorage.getItem('manualNumbers')
      };

      const loadedSources: AvailableSources = {
        'analyse-intelligente': null,
        'configuration-strategies': null,
        'selection-manuelle': null
      };

      Object.entries(sources).forEach(([key, value]) => {
        if (value) {
          try {
            loadedSources[key as keyof AvailableSources] = JSON.parse(value);
          } catch (e) {
            console.error(`Erreur parsing ${key}:`, e);
          }
        }
      });

      setAvailableSources(loadedSources);

      // Définir la source active (prioriser analyse intelligente, puis configuration, puis manuelle)
      if (loadedSources['analyse-intelligente']) {
        setActiveSource('analyse-intelligente');
      } else if (loadedSources['configuration-strategies']) {
        setActiveSource('configuration-strategies');
      } else if (loadedSources['selection-manuelle']) {
        setActiveSource('selection-manuelle');
      }

    } catch (error) {
      console.error('Erreur chargement numéros sélectionnés:', error);
    }
  };

  const generateGrids = async () => {
    const currentSelection = availableSources[activeSource];
    if (!currentSelection || currentSelection.numbers.length < 5) {
      alert('Veuillez d\'abord sélectionner des numéros depuis une source valide');
      return;
    }

    setIsGenerating(true);
    try {
      const grids: GeneratedGrid[] = [];
      
      if (gridType === 'simple') {
        // GRILLES SIMPLES : Générer plusieurs grilles de 5 numéros
        for (let i = 0; i < gridCount; i++) {
          const grid = generateSingleGrid(i);
          grids.push(grid);
        }
      } else {
        // GRILLES MULTIPLES : Générer une grille avec plus de numéros
        const multipleGrid = generateMultipleGrid();
        grids.push(multipleGrid);
      }
      
      setGeneratedGrids(grids);
    } catch (error) {
      console.error('Erreur génération:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMultipleGrid = (): GeneratedGrid => {
    const currentSelection = availableSources[activeSource]!;
    
    // Sélectionner le nombre de numéros demandé
    const numbersToUse = Math.min(multipleGridConfig.numbersToSelect, currentSelection.numbers.length);
    const complementaryToUse = Math.min(multipleGridConfig.complementaryToSelect, currentSelection.complementary.length);
    
    const selectedNumbers = currentSelection.numbers.slice(0, numbersToUse);
    const selectedComplementary = currentSelection.complementary.slice(0, complementaryToUse);
    
    // Calculer le nombre de combinaisons
    const combinations = calculateCombinations(numbersToUse, 5);
    const totalGrids = combinations * complementaryToUse;
    const cost = totalGrids * 2.20;
    
    return {
      id: `multiple-${Date.now()}`,
      numbers: selectedNumbers, // Tous les numéros de la grille multiple
      complementary: selectedComplementary[0], // Premier complémentaire pour l'affichage
      score: 90,
      method: `Grille Multiple (${numbersToUse} numéros, ${complementaryToUse} complémentaires, ${totalGrids.toLocaleString()} combinaisons, ${cost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`,
      timestamp: new Date().toLocaleTimeString()
    };
  };

  // Fonction utilitaire pour calculer les combinaisons
  const calculateCombinations = (n: number, k: number): number => {
    if (k > n || k < 0) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result = result * (n - i + 1) / i;
    }
    return Math.round(result);
  };

  const generateSingleGrid = (seed: number): GeneratedGrid => {
    const currentSelection = availableSources[activeSource]!;
    const availableNumbers = [...currentSelection.numbers];
    const availableComplementary = [...currentSelection.complementary];
    
    let selectedNums: number[] = [];
    let selectedComp: number;
    let method: string;
    let score: number;

    switch (generationMethod) {
      case 'optimal':
        // Prendre les 5 premiers mais avec rotation selon le seed
        const startIndex = seed % Math.max(1, availableNumbers.length - 4);
        selectedNums = availableNumbers.slice(startIndex, startIndex + 5);
        if (selectedNums.length < 5) {
          selectedNums.push(...availableNumbers.slice(0, 5 - selectedNums.length));
        }
        selectedNums.sort((a, b) => a - b);
        selectedComp = availableComplementary[seed % availableComplementary.length] || 1;
        method = 'Sélection optimale';
        score = 95 - seed * 2; // Varier le score
        break;
        
      case 'diversified':
        // Mélanger pour diversifier
        selectedNums = [];
        const pool = [...availableNumbers];
        for (let i = 0; i < 5; i++) {
          const index = (seed + i * 3) % pool.length;
          selectedNums.push(pool.splice(index, 1)[0]);
        }
        selectedNums.sort((a, b) => a - b);
        selectedComp = availableComplementary[seed % availableComplementary.length] || 1;
        method = 'Sélection diversifiée';
        score = 80;
        break;
        
      case 'random':
        // Sélection aléatoire dans la liste
        selectedNums = [];
        const randomPool = [...availableNumbers];
        for (let i = 0; i < 5; i++) {
          const randomIndex = Math.floor(Math.random() * randomPool.length);
          selectedNums.push(randomPool.splice(randomIndex, 1)[0]);
        }
        selectedNums.sort((a, b) => a - b);
        selectedComp = availableComplementary[Math.floor(Math.random() * availableComplementary.length)] || 1;
        method = 'Sélection aléatoire';
        score = 60;
        break;
        
      default:
        selectedNums = availableNumbers.slice(0, 5);
        selectedComp = availableComplementary[0] || 1;
        method = 'Défaut';
        score = 70;
    }

    return {
      id: `grid-${Date.now()}-${seed}`,
      numbers: selectedNums,
      complementary: selectedComp,
      score,
      method,
      timestamp: new Date().toISOString()
    };
  };

  const exportGrids = () => {
    if (generatedGrids.length === 0) return;
    
    const currentSelection = availableSources[activeSource];
    const exportData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        period: globalAnalysisPeriod,
        source: currentSelection?.source || 'Inconnu',
        method: generationMethod,
        totalGrids: generatedGrids.length
      },
      selectedNumbers: currentSelection,
      grids: generatedGrids.map(grid => ({
        numbers: grid.numbers,
        complementary: grid.complementary,
        method: grid.method,
        score: grid.score
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grilles-loto-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'optimal': return 'border-green-300 bg-green-50';
      case 'diversified': return 'border-blue-300 bg-blue-50';
      case 'random': return 'border-purple-300 bg-purple-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="space-y-8">
      {/* En-tête moderne */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto">
            🎲
          </div>
          <h1 className="text-4xl font-bold mb-3">Générateur de Grilles</h1>
          <p className="text-xl text-emerald-100">
            Créez vos grilles de jeu à partir des numéros sélectionnés
          </p>
        </div>
      </motion.div>

      {/* Sélecteur de source */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
          <Target className="w-6 h-6 text-blue-600" />
          Choisissez votre Source de Numéros
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(availableSources).map(([sourceKey, sourceData]) => {
            const isActive = activeSource === sourceKey;
            const hasData = sourceData !== null;
            
            return (
              <button
                key={sourceKey}
                onClick={() => hasData && setActiveSource(sourceKey as keyof AvailableSources)}
                disabled={!hasData}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  isActive && hasData
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : hasData
                    ? 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                    : 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    hasData ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <h3 className="font-semibold">
                    {sourceKey === 'analyse-intelligente' && '🎯 Analyse Intelligente'}
                    {sourceKey === 'configuration-strategies' && '⚙️ Configuration Stratégies'}
                    {sourceKey === 'selection-manuelle' && '✋ Sélection Manuelle'}
                  </h3>
                </div>
                
                {hasData ? (
                  <div className="text-sm text-gray-600">
                    {sourceData!.numbers.length} numéros + {sourceData!.complementary.length} complémentaires
                    <br />
                    <span className="text-xs text-gray-500">
                      Source: {sourceData!.source}
                    </span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">
                    Aucune sélection disponible
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* État des numéros sélectionnés */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-xl p-6 border-2 shadow-lg ${
          availableSources[activeSource] 
            ? 'bg-green-50 border-green-300' 
            : 'bg-red-50 border-red-300'
        }`}
      >
        <div className="flex items-center gap-4 mb-4">
          {availableSources[activeSource] ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-red-600" />
          )}
          <div>
            <h2 className={`text-2xl font-bold ${
              availableSources[activeSource] ? 'text-green-800' : 'text-red-800'
            }`}>
              {availableSources[activeSource] ? 'Numéros Chargés' : 'Aucune Sélection'}
            </h2>
            <p className={`${
              availableSources[activeSource] ? 'text-green-600' : 'text-red-600'
            }`}>
              {availableSources[activeSource] 
                ? `${availableSources[activeSource]!.numbers.length} numéros + ${availableSources[activeSource]!.complementary.length} complémentaires depuis "${availableSources[activeSource]!.source}"`
                : 'Sélectionnez une source avec des données disponibles'
              }
            </p>
          </div>
        </div>

        {availableSources[activeSource] && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Numéros principaux */}
            <div>
              <h3 className="font-semibold text-green-800 mb-3">Numéros Principaux ({availableSources[activeSource]!.numbers.length})</h3>
              <div className="grid grid-cols-5 gap-2">
                {availableSources[activeSource]!.numbers.map(numero => (
                  <div key={numero} className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                    {numero}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Numéros complémentaires */}
            <div>
              <h3 className="font-semibold text-green-800 mb-3">Complémentaires ({availableSources[activeSource]!.complementary.length})</h3>
              <div className="flex gap-2">
                {availableSources[activeSource]!.complementary.map(numero => (
                  <div key={numero} className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold border-2 border-purple-300">
                    {numero}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!availableSources[activeSource] && (
          <div className="text-center">
            <button
              onClick={() => {
                // Rediriger vers l'analyse intelligente
                window.location.hash = 'analysis';
              }}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              🎯 Aller à l'Analyse Intelligente
            </button>
          </div>
        )}
      </motion.div>

      {/* Configuration de génération */}
      {availableSources[activeSource] && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600" />
            Configuration de Génération
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Nombre de grilles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de grilles à générer
              </label>
              <select
                value={gridCount}
                onChange={(e) => setGridCount(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 grille</option>
                <option value={3}>3 grilles</option>
                <option value={5}>5 grilles</option>
                <option value={10}>10 grilles</option>
                <option value={20}>20 grilles</option>
              </select>
            </div>

            {/* Méthode de génération */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Méthode de génération
              </label>
              <select
                value={generationMethod}
                onChange={(e) => setGenerationMethod(e.target.value as 'optimal' | 'diversified' | 'random')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="optimal">🎯 Optimale (meilleurs scores)</option>
                <option value="diversified">🔄 Diversifiée (variété)</option>
                <option value="random">🎲 Aléatoire (dans la sélection)</option>
              </select>
            </div>

            {/* Actions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actions
              </label>
              <button
                onClick={generateGrids}
                disabled={isGenerating}
                className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:scale-105 disabled:opacity-50"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Génération...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    Générer {gridCount} Grille{gridCount > 1 ? 's' : ''}
                  </div>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Grilles générées */}
      {generatedGrids.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Grid3X3 className="w-6 h-6 text-green-600" />
              Grilles Générées ({generatedGrids.length})
            </h2>
            
            <div className="flex gap-3">
              <button
                onClick={() => setGeneratedGrids([])}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                🗑️ Effacer
              </button>
              <button
                onClick={exportGrids}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedGrids.map((grid, index) => (
              <motion.div
                key={grid.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-xl border-2 shadow-md hover:shadow-lg transition-all ${getMethodColor(grid.method)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800">Grille {index + 1}</h3>
                  <div className="text-sm text-gray-600">Score: {grid.score}/100</div>
                </div>

                {/* Numéros principaux */}
                <div className="mb-3">
                  <div className="text-xs text-gray-600 mb-2">Numéros principaux :</div>
                  <div className="flex gap-1">
                    {grid.numbers.map(numero => (
                      <div
                        key={numero}
                        className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-md"
                      >
                        {numero}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Numéro complémentaire */}
                <div className="mb-3">
                  <div className="text-xs text-gray-600 mb-2">Complémentaire :</div>
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-md border-2 border-emerald-400">
                    {grid.complementary}
                  </div>
                </div>

                <div className="text-xs text-gray-500 border-t pt-2">
                  {grid.method} • {new Date(grid.timestamp).toLocaleTimeString('fr-FR')}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Résumé et conseils */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800">Conseils d'Utilisation</h3>
            </div>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>Grilles Optimales</strong> : Utilisent les numéros avec les meilleurs scores</p>
              <p>• <strong>Grilles Diversifiées</strong> : Mélangent la sélection pour plus de variété</p>
              <p>• <strong>Grilles Aléatoires</strong> : Sélection hasardeuse dans vos numéros choisis</p>
              <p>• <strong>Recommandation</strong> : Testez plusieurs méthodes pour maximiser vos chances</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Message si pas de numéros */}
      {!availableSources[activeSource] && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-12 text-center border border-gray-200"
        >
          <div className="text-6xl mb-6">🎯</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Commencez par l'Analyse</h2>
          <p className="text-lg text-gray-600 mb-6">
            Pour générer des grilles, vous devez d'abord sélectionner vos numéros depuis l'Analyse Intelligente
          </p>
          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              Workflow recommandé :
            </div>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="bg-blue-100 px-4 py-2 rounded-lg text-blue-800">
                1. 🎯 Analyse Intelligente
              </div>
              <div className="text-gray-400">→</div>
              <div className="bg-yellow-100 px-4 py-2 rounded-lg text-yellow-800">
                2. ⚙️ Configuration (optionnel)
              </div>
              <div className="text-gray-400">→</div>
              <div className="bg-green-100 px-4 py-2 rounded-lg text-green-800">
                3. 🎲 Génération (ici)
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
