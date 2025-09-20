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
  Save,
  Calculator,
  Euro,
  BarChart3,
  Info
} from 'lucide-react';
import OptimisateurGrillesGaranties from './OptimisateurGrillesGaranties';

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
  type: 'simple' | 'multiple';
  numbers: number[];
  complementary: number | number[];
  score: number;
  method: string;
  timestamp: string;
  cost?: number;
  combinations?: number;
}

interface EnhancedGridGeneratorProps {
  globalAnalysisPeriod: string;
}

export default function EnhancedGridGenerator({ globalAnalysisPeriod }: EnhancedGridGeneratorProps) {
  const [availableSources, setAvailableSources] = useState<AvailableSources>({
    'analyse-intelligente': null,
    'configuration-strategies': null,
    'selection-manuelle': null
  });
  const [activeSource, setActiveSource] = useState<keyof AvailableSources>('analyse-intelligente');
  const [generatedGrids, setGeneratedGrids] = useState<GeneratedGrid[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [gridType, setGridType] = useState<'simple' | 'multiple'>('simple');
  const [activeTab, setActiveTab] = useState<'generator' | 'optimizer'>('generator');
  
  // Option Second Tirage
  const [includeSecondTirage, setIncludeSecondTirage] = useState(false);
  
  // Configuration grilles simples
  const [simpleConfig, setSimpleConfig] = useState({
    gridCount: 5,
    generationMethod: 'optimal' as 'optimal' | 'diversified' | 'random'
  });
  
  // Configuration grilles multiples
  const [multipleConfig, setMultipleConfig] = useState({
    numbersToSelect: 8,
    complementaryToSelect: 2
  });

  useEffect(() => {
    loadSelectedNumbers();
  }, []);

  const loadSelectedNumbers = () => {
    try {
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

      Object.entries(sources).forEach(([key, data]) => {
        if (data) {
          try {
            loadedSources[key as keyof AvailableSources] = JSON.parse(data);
          } catch (e) {
            console.warn(`Erreur parsing ${key}:`, e);
          }
        }
      });

      setAvailableSources(loadedSources);

      // Sélectionner automatiquement la première source disponible
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
        for (let i = 0; i < simpleConfig.gridCount; i++) {
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

  const generateSingleGrid = (seed: number): GeneratedGrid => {
    const currentSelection = availableSources[activeSource]!;
    const availableNumbers = [...currentSelection.numbers];
    const availableComplementary = [...currentSelection.complementary];
    
    let selectedNums: number[] = [];
    let selectedComp: number;
    let method: string;
    let score: number;

    switch (simpleConfig.generationMethod) {
      case 'optimal':
        // Prendre les 5 premiers mais avec rotation selon le seed
        const startIndex = seed % Math.max(1, availableNumbers.length - 4);
        selectedNums = availableNumbers.slice(startIndex, startIndex + 5);
        if (selectedNums.length < 5) {
          selectedNums = [...selectedNums, ...availableNumbers.slice(0, 5 - selectedNums.length)];
        }
        selectedComp = availableComplementary[seed % availableComplementary.length] || 1;
        method = 'Grille simple optimale';
        score = 95 - (seed * 2);
        break;
        
      case 'diversified':
        // Mélanger la sélection pour plus de variété
        const shuffledNumbers = [...availableNumbers].sort(() => Math.random() - 0.5);
        selectedNums = shuffledNumbers.slice(0, 5);
        selectedComp = availableComplementary[Math.floor(Math.random() * availableComplementary.length)] || 1;
        method = 'Grille simple diversifiée';
        score = 85;
        break;
        
      case 'random':
        // Sélection hasardeuse dans les numéros choisis
        const randomNumbers = [];
        const tempNumbers = [...availableNumbers];
        for (let j = 0; j < 5; j++) {
          const randomIndex = Math.floor(Math.random() * tempNumbers.length);
          randomNumbers.push(tempNumbers.splice(randomIndex, 1)[0]);
        }
        selectedNums = randomNumbers.sort((a, b) => a - b);
        selectedComp = availableComplementary[Math.floor(Math.random() * availableComplementary.length)] || 1;
        method = 'Grille simple hasardeuse';
        score = 75;
        break;
    }
    
    score += Math.floor(Math.random() * 10) - 5;
    
    return {
      id: `simple-${Date.now()}-${seed}`,
      type: 'simple',
      numbers: selectedNums,
      complementary: selectedComp,
      score: Math.max(65, Math.min(100, score)),
      method,
      timestamp: new Date().toLocaleTimeString(),
      cost: includeSecondTirage ? 3.00 : 2.20,
      combinations: 1
    };
  };

  const generateMultipleGrid = (): GeneratedGrid => {
    const currentSelection = availableSources[activeSource]!;
    
    // Sélectionner le nombre de numéros demandé
    const numbersToUse = Math.min(multipleConfig.numbersToSelect, currentSelection.numbers.length);
    const complementaryToUse = Math.min(multipleConfig.complementaryToSelect, currentSelection.complementary.length);
    
    const selectedNumbers = currentSelection.numbers.slice(0, numbersToUse);
    const selectedComplementary = currentSelection.complementary.slice(0, complementaryToUse);
    
    // Calculer le nombre de combinaisons et le coût
    const combinations = calculateCombinations(numbersToUse, 5);
    const totalGrids = combinations * complementaryToUse;
    const cost = totalGrids * (includeSecondTirage ? 3.00 : 2.20);
    
    return {
      id: `multiple-${Date.now()}`,
      type: 'multiple',
      numbers: selectedNumbers,
      complementary: selectedComplementary,
      score: 90,
      method: `Grille Multiple`,
      timestamp: new Date().toLocaleTimeString(),
      cost,
      combinations: totalGrids
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

  const clearGrids = () => {
    setGeneratedGrids([]);
  };

  const exportGrids = () => {
    if (generatedGrids.length === 0) {
      alert('Aucune grille à exporter');
      return;
    }

    const csvContent = [
      ['Type', 'Numéros', 'Complémentaire(s)', 'Score', 'Méthode', 'Coût', 'Combinaisons', 'Heure'].join(','),
      ...generatedGrids.map(grid => [
        grid.type,
        Array.isArray(grid.numbers) ? grid.numbers.join('-') : '',
        Array.isArray(grid.complementary) ? grid.complementary.join('-') : grid.complementary,
        grid.score,
        grid.method,
        grid.cost?.toFixed(2) || '2.20',
        grid.combinations || 1,
        grid.timestamp
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grilles-${gridType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentNumbers = availableSources[activeSource];

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto shadow-lg">
            🎲
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Générateur de Grilles Avancé
          </h1>
          <p className="text-xl text-slate-300 mb-4">
            Créez des grilles simples ou multiples à partir de vos numéros sélectionnés
          </p>
          <div className="text-sm text-slate-400">
            Grilles simples • Grilles multiples • Calculs de coûts • Optimisation financière
          </div>
        </div>
      </motion.div>

      {/* Navigation par onglets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      >
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
              activeTab === 'generator'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Grid3X3 className="w-5 h-5" />
            Générateur Standard
          </button>
          
          <button
            onClick={() => setActiveTab('optimizer')}
            className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
              activeTab === 'optimizer'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Target className="w-5 h-5" />
            Optimisateur de Garanties
          </button>
        </div>
      </motion.div>

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'optimizer' ? (
        <OptimisateurGrillesGaranties selectedNumbers={{
          numbers: availableSources[activeSource]?.numbers || [],
          complementary: availableSources[activeSource]?.complementary || [],
          source: activeSource
        }} />
      ) : (
        <>
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
                  <div className="text-sm text-gray-500">
                    Aucune sélection disponible
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Numéros chargés */}
        {currentNumbers && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">
              Numéros Chargés
            </h4>
            <div className="text-sm text-green-700">
              {currentNumbers.numbers.length} numéros + {currentNumbers.complementary.length} complémentaires depuis "{currentNumbers.source}"
            </div>
            <div className="mt-3">
              <div className="mb-2">
                <strong>Numéros Principaux ({currentNumbers.numbers.length})</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentNumbers.numbers.map(num => (
                    <span key={num} className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                      {num}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <strong>Complémentaires ({currentNumbers.complementary.length})</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentNumbers.complementary.map(num => (
                    <span key={num} className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold">
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Configuration de génération */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
          <Settings className="w-6 h-6 text-blue-500" />
          Configuration de Génération
        </h3>
        
        {/* Type de grille */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Type de grille
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setGridType('simple')}
              className={`p-4 rounded-lg border-2 transition-all ${
                gridType === 'simple' 
                  ? 'border-blue-500 bg-blue-50 text-blue-800' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-bold">Grilles Simples</div>
                <div className="text-sm opacity-75">Plusieurs grilles de 5 numéros + 1 complémentaire</div>
                <div className="text-xs text-blue-600 mt-1">2,20€ par grille</div>
              </div>
            </button>
            <button
              onClick={() => setGridType('multiple')}
              className={`p-4 rounded-lg border-2 transition-all ${
                gridType === 'multiple' 
                  ? 'border-purple-500 bg-purple-50 text-purple-800' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🎲</div>
                <div className="font-bold">Grille Multiple</div>
                <div className="text-sm opacity-75">Une grille avec plus de numéros et complémentaires</div>
                <div className="text-xs text-purple-600 mt-1">Coût variable selon sélection</div>
              </div>
            </button>
          </div>
        </div>
        
        {/* Option Second Tirage */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-green-800 mb-1">🎯 Second Tirage</h4>
              <p className="text-sm text-green-700">Ajoutez une seconde chance à vos grilles pour 0.80€ supplémentaire par grille</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeSecondTirage}
                onChange={(e) => setIncludeSecondTirage(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>
          
          {includeSecondTirage && (
            <div className="mt-3 p-3 bg-green-100 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ <strong>Seconde chance activée !</strong> Chaque grille participera au second tirage (5 numéros, sans complémentaire).
              </p>
              <p className="text-xs text-green-700 mt-1">
                Coût par grille: 2.20€ (tirage principal) + 0.80€ (second tirage) = <strong>3.00€</strong>
              </p>
            </div>
          )}
        </div>
        
        {/* Configuration spécifique */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gridType === 'simple' ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de grilles à générer
                </label>
                <select
                  value={simpleConfig.gridCount}
                  onChange={(e) => setSimpleConfig(prev => ({ ...prev, gridCount: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>1 grille</option>
                  <option value={3}>3 grilles</option>
                  <option value={5}>5 grilles</option>
                  <option value={10}>10 grilles</option>
                  <option value={20}>20 grilles</option>
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  Coût total: {(simpleConfig.gridCount * (includeSecondTirage ? 3.00 : 2.20)).toFixed(2)}€
                  {includeSecondTirage && (
                    <span className="text-green-600 ml-1">
                      (inc. second tirage)
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Méthode de génération
                </label>
                <select
                  value={simpleConfig.generationMethod}
                  onChange={(e) => setSimpleConfig(prev => ({ ...prev, generationMethod: e.target.value as 'optimal' | 'diversified' | 'random' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="optimal">🎯 Optimale (meilleurs scores)</option>
                  <option value="diversified">🔄 Diversifiée (mélange équilibré)</option>
                  <option value="random">🎲 Aléatoire (sélection hasardeuse)</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Numéros à inclure
                </label>
                <select
                  value={multipleConfig.numbersToSelect}
                  onChange={(e) => setMultipleConfig(prev => ({ ...prev, numbersToSelect: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value={6}>6 numéros (20 combinaisons)</option>
                  <option value={7}>7 numéros (21 combinaisons)</option>
                  <option value={8}>8 numéros (56 combinaisons)</option>
                  <option value={9}>9 numéros (126 combinaisons)</option>
                  <option value={10}>10 numéros (252 combinaisons)</option>
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  {calculateCombinations(multipleConfig.numbersToSelect, 5).toLocaleString()} combinaisons de 5
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Complémentaires à inclure
                </label>
                <select
                  value={multipleConfig.complementaryToSelect}
                  onChange={(e) => setMultipleConfig(prev => ({ ...prev, complementaryToSelect: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value={1}>1 complémentaire (standard)</option>
                  <option value={2}>2 complémentaires</option>
                  <option value={3}>3 complémentaires</option>
                </select>
                <div className="text-xs text-purple-600 mt-1 font-semibold">
                  Coût total: {(calculateCombinations(multipleConfig.numbersToSelect, 5) * multipleConfig.complementaryToSelect * (includeSecondTirage ? 3.00 : 2.20)).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  {includeSecondTirage && (
                    <span className="text-green-600 ml-1">
                      (inc. second tirage)
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Informations sur la configuration */}
        {gridType === 'multiple' && currentNumbers && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">📊 Aperçu de la Grille Multiple</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{multipleConfig.numbersToSelect}</div>
                <div className="text-purple-700">Numéros</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{multipleConfig.complementaryToSelect}</div>
                <div className="text-purple-700">Complémentaires</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {(calculateCombinations(multipleConfig.numbersToSelect, 5) * multipleConfig.complementaryToSelect).toLocaleString()}
                </div>
                <div className="text-purple-700">Combinaisons</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {((multipleConfig.numbersToSelect / currentNumbers.numbers.length) * 100).toFixed(1)}%
                </div>
                <div className="text-purple-700">Couverture</div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">Actions</h3>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={generateGrids}
            disabled={!currentNumbers || isGenerating}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-bold text-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-3 disabled:opacity-50"
          >
            {isGenerating ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
            {isGenerating ? 'Génération...' : `Générer ${gridType === 'simple' ? `${simpleConfig.gridCount} Grilles` : 'Grille Multiple'}`}
          </button>
          
          {generatedGrids.length > 0 && (
            <>
              <button
                onClick={clearGrids}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                🗑️ Effacer
              </button>
              
              <button
                onClick={exportGrids}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exporter
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Grilles générées */}
      {generatedGrids.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <Grid3X3 className="w-6 h-6 text-green-500" />
            Grilles Générées ({generatedGrids.length})
          </h3>
          
          {/* Résumé financier */}
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              <Euro className="w-5 h-5" />
              Résumé Financier
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">
                  {generatedGrids.reduce((acc, grid) => acc + (grid.cost || 2.20), 0).toFixed(2)}€
                </div>
                <div className="text-yellow-700">Coût Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">
                  {generatedGrids.reduce((acc, grid) => acc + (grid.combinations || 1), 0).toLocaleString()}
                </div>
                <div className="text-yellow-700">Combinaisons</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">
                  {gridType === 'simple' ? simpleConfig.gridCount : 1}
                </div>
                <div className="text-yellow-700">Grilles</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">
                  {generatedGrids.length > 0 ? (generatedGrids.reduce((acc, grid) => acc + grid.score, 0) / generatedGrids.length).toFixed(1) : 0}%
                </div>
                <div className="text-yellow-700">Score Moyen</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {generatedGrids.map((grid, index) => (
              <motion.div
                key={grid.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 ${
                  grid.type === 'simple' ? 'border-blue-200 bg-blue-50' : 'border-purple-200 bg-purple-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`font-bold ${grid.type === 'simple' ? 'text-blue-800' : 'text-purple-800'}`}>
                    {grid.type === 'simple' ? `🎯 Grille Simple ${index + 1}` : '🎲 Grille Multiple'}
                  </h4>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      grid.score >= 80 ? 'bg-green-500 text-white' :
                      grid.score >= 60 ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      Score: {grid.score}/100
                    </span>
                    <span className="text-xs text-gray-500">{grid.timestamp}</span>
                  </div>
                </div>
                
                {grid.type === 'simple' ? (
                  <div className="flex items-center gap-4">
                    <div>
                      <strong>Numéros principaux :</strong>
                      <div className="flex gap-1 mt-1">
                        {grid.numbers.map(num => (
                          <div key={num} className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {num}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <strong>Complémentaire :</strong>
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm mt-1">
                        {grid.complementary}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div><strong>Coût:</strong> {grid.cost?.toFixed(2)}€</div>
                      <div><strong>Méthode:</strong> {grid.method}</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <strong>Numéros inclus ({(grid.numbers as number[]).length}) :</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(grid.numbers as number[]).map(num => (
                          <div key={num} className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                            {num}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <strong>Complémentaires inclus ({(grid.complementary as number[]).length}) :</strong>
                      <div className="flex gap-1 mt-1">
                        {(grid.complementary as number[]).map(num => (
                          <div key={num} className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                            {num}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-purple-700">
                      <div><strong>Combinaisons:</strong> {grid.combinations?.toLocaleString()}</div>
                      <div><strong>Coût total:</strong> {grid.cost?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
                      <div><strong>Couverture:</strong> {grid.combinations ? ((grid.combinations / 13983816) * 100).toFixed(6) : 0}%</div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
        </>
      )}

      {/* Conseils d'utilisation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 rounded-xl p-6 border border-blue-200"
      >
        <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-3">
          <Info className="w-6 h-6" />
          Conseils d'Utilisation
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">🎯 Grilles Simples</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Avantages :</strong> Coût prévisible, flexibilité maximale</li>
              <li>• <strong>Idéal pour :</strong> Budgets limités, tests de stratégies</li>
              <li>• <strong>Recommandé :</strong> 3-5 grilles pour commencer</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">🎲 Grilles Multiples</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Avantages :</strong> Couverture maximale, une seule grille</li>
              <li>• <strong>Idéal pour :</strong> Budgets importants, couverture complète</li>
              <li>• <strong>Attention :</strong> Coût exponentiel avec le nombre de numéros</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>💡 Conseil IA :</strong> Pour {currentNumbers?.numbers.length || 0} numéros, 
            {(currentNumbers?.numbers.length || 0) <= 8 ? ' les grilles multiples sont économiques' : 
             (currentNumbers?.numbers.length || 0) <= 12 ? ' considérez un mix grilles simples/multiples' : 
             ' privilégiez les grilles simples ou réduisez la sélection'}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
