'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Settings, Target, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface PatternOptimizationOptions {
  includeParityPatterns: boolean;
  selectedParityPatterns: string[];
  includeConsecutivePatterns: boolean;
  selectedConsecutivePatterns: string[];
  includeDizainePatterns: boolean;
  selectedDizainePatterns: string[];
  includeSommePatterns: boolean;
  selectedSommePatterns: string[];
  includeZonePatterns: boolean;
  selectedZonePatterns: string[];
  numberOfCombinations: number;
  forcePatternCompliance: boolean;
}

interface PatternOptimizedCombination {
  numbers: number[];
  complementary: number;
  patterns: string[];
  score: number;
  confidence: number;
  reasons: string[];
  category: 'pattern-optimized';
  expectedValue: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface AvailablePatterns {
  parity: string[];
  consecutive: string[];
  dizaine: string[];
  somme: string[];
  zone: string[];
}

export default function PatternOptimization() {
  const [availablePatterns, setAvailablePatterns] = useState<AvailablePatterns>({
    parity: [],
    consecutive: [],
    dizaine: [],
    somme: [],
    zone: []
  });
  
  const [options, setOptions] = useState<PatternOptimizationOptions>({
    includeParityPatterns: true,
    selectedParityPatterns: ['3P-2I', '2P-3I'],
    includeConsecutivePatterns: false,
    selectedConsecutivePatterns: [],
    includeDizainePatterns: false,
    selectedDizainePatterns: [],
    includeSommePatterns: true,
    selectedSommePatterns: ['SOMME_OPTIMALE'],
    includeZonePatterns: false,
    selectedZonePatterns: [],
    numberOfCombinations: 10,
    forcePatternCompliance: true
  });

  const [combinations, setCombinations] = useState<PatternOptimizedCombination[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAvailablePatterns();
  }, []);

  const loadAvailablePatterns = async () => {
    try {
      const response = await fetch('/api/pattern-optimization');
      const result = await response.json();
      
      if (result.success) {
        setAvailablePatterns(result.data.patterns);
      } else {
        toast.error('Erreur lors du chargement des patterns');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des patterns');
    }
  };

  const generateCombinations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/pattern-optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ options }),
      });

      const result = await response.json();
      
      if (result.success) {
        setCombinations(result.data.combinations);
        toast.success(`${result.data.totalGenerated} combinaisons générées avec succès`);
      } else {
        toast.error(result.error || 'Erreur lors de la génération');
      }
    } catch (error) {
      toast.error('Erreur lors de la génération des combinaisons');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePatternSelection = (category: keyof AvailablePatterns, pattern: string) => {
    const categoryKey = `selected${category.charAt(0).toUpperCase() + category.slice(1)}Patterns` as keyof PatternOptimizationOptions;
    const currentSelection = options[categoryKey] as string[];
    
    if (currentSelection.includes(pattern)) {
      setOptions(prev => ({
        ...prev,
        [categoryKey]: currentSelection.filter(p => p !== pattern)
      }));
    } else {
      setOptions(prev => ({
        ...prev,
        [categoryKey]: [...currentSelection, pattern]
      }));
    }
  };

  const getPatternLabel = (pattern: string) => {
    if (pattern.includes('P-') && pattern.includes('I')) {
      const [pairs, impairs] = pattern.split('-');
      return `Distribution ${pairs} Pairs - ${impairs}`;
    } else if (pattern === 'CONSECUTIF') {
      return 'Numéros consécutifs présents';
    } else if (pattern === 'NON-CONSECUTIF') {
      return 'Aucun numéro consécutif';
    } else if (pattern.startsWith('DIZ')) {
      const count = pattern.replace('DIZ', '');
      return `Utilise ${count} dizaines différentes`;
    } else if (pattern === 'SOMME_FAIBLE') {
      return 'Somme faible (< 100)';
    } else if (pattern === 'SOMME_OPTIMALE') {
      return 'Somme optimale (100-150)';
    } else if (pattern === 'SOMME_ELEVEE') {
      return 'Somme élevée (> 150)';
    } else if (pattern.startsWith('ZONE_')) {
      const zones = pattern.replace('ZONE_', '').split('-');
      return `Répartition par zones: ${zones.join('-')}`;
    }
    return pattern;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-primary-600" />
          Pattern Optimization
        </h1>
        <p className="text-gray-600">
          Générez des combinaisons optimisées basées sur les patterns les plus fréquents
        </p>
      </motion.div>

      {/* Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Configuration des Patterns</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patterns de parité */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="parity"
                checked={options.includeParityPatterns}
                onChange={(e) => setOptions(prev => ({ ...prev, includeParityPatterns: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="parity" className="font-medium text-gray-700">Patterns de Parité</label>
            </div>
            {options.includeParityPatterns && (
              <div className="ml-6 space-y-2">
                {availablePatterns.parity.map(pattern => (
                  <div key={pattern} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`parity-${pattern}`}
                      checked={options.selectedParityPatterns.includes(pattern)}
                      onChange={() => togglePatternSelection('parity', pattern)}
                      className="rounded"
                    />
                    <label htmlFor={`parity-${pattern}`} className="text-sm text-gray-600">
                      {getPatternLabel(pattern)}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Patterns de consécutifs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="consecutive"
                checked={options.includeConsecutivePatterns}
                onChange={(e) => setOptions(prev => ({ ...prev, includeConsecutivePatterns: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="consecutive" className="font-medium text-gray-700">Patterns de Consécutifs</label>
            </div>
            {options.includeConsecutivePatterns && (
              <div className="ml-6 space-y-2">
                {availablePatterns.consecutive.map(pattern => (
                  <div key={pattern} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`consecutive-${pattern}`}
                      checked={options.selectedConsecutivePatterns.includes(pattern)}
                      onChange={() => togglePatternSelection('consecutive', pattern)}
                      className="rounded"
                    />
                    <label htmlFor={`consecutive-${pattern}`} className="text-sm text-gray-600">
                      {getPatternLabel(pattern)}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Patterns de dizaines */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="dizaine"
                checked={options.includeDizainePatterns}
                onChange={(e) => setOptions(prev => ({ ...prev, includeDizainePatterns: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="dizaine" className="font-medium text-gray-700">Patterns de Dizaines</label>
            </div>
            {options.includeDizainePatterns && (
              <div className="ml-6 space-y-2">
                {availablePatterns.dizaine.map(pattern => (
                  <div key={pattern} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`dizaine-${pattern}`}
                      checked={options.selectedDizainePatterns.includes(pattern)}
                      onChange={() => togglePatternSelection('dizaine', pattern)}
                      className="rounded"
                    />
                    <label htmlFor={`dizaine-${pattern}`} className="text-sm text-gray-600">
                      {getPatternLabel(pattern)}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Patterns de somme */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="somme"
                checked={options.includeSommePatterns}
                onChange={(e) => setOptions(prev => ({ ...prev, includeSommePatterns: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="somme" className="font-medium text-gray-700">Patterns de Somme</label>
            </div>
            {options.includeSommePatterns && (
              <div className="ml-6 space-y-2">
                {availablePatterns.somme.map(pattern => (
                  <div key={pattern} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`somme-${pattern}`}
                      checked={options.selectedSommePatterns.includes(pattern)}
                      onChange={() => togglePatternSelection('somme', pattern)}
                      className="rounded"
                    />
                    <label htmlFor={`somme-${pattern}`} className="text-sm text-gray-600">
                      {getPatternLabel(pattern)}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Options de génération */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de combinaisons
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={options.numberOfCombinations}
                onChange={(e) => setOptions(prev => ({ ...prev, numberOfCombinations: parseInt(e.target.value) || 10 }))}
                className="input-field"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="forceCompliance"
                checked={options.forcePatternCompliance}
                onChange={(e) => setOptions(prev => ({ ...prev, forcePatternCompliance: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="forceCompliance" className="text-sm font-medium text-gray-700">
                Forcer le respect strict des patterns
              </label>
            </div>
          </div>
        </div>

        {/* Bouton de génération */}
        <div className="mt-6">
          <button
            onClick={generateCombinations}
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Target className="w-5 h-5" />
            {isLoading ? 'Génération en cours...' : 'Générer les Combinaisons Optimisées'}
          </button>
        </div>
      </motion.div>

      {/* Résultats */}
      {combinations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Combinaisons Optimisées ({combinations.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {combinations.map((combination, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">Combinaison #{index + 1}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(combination.riskLevel)}`}>
                    {combination.riskLevel.toUpperCase()}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="flex gap-1 mb-2">
                    {combination.numbers.map((num, i) => (
                      <span key={i} className="w-8 h-8 bg-primary-100 text-primary-800 rounded-full flex items-center justify-center text-sm font-medium">
                        {num}
                      </span>
                    ))}
                    <span className="w-8 h-8 bg-secondary-100 text-secondary-800 rounded-full flex items-center justify-center text-sm font-medium">
                      {combination.complementary}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Score:</span>
                    <span className="font-medium">{combination.score.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confiance:</span>
                    <span className="font-medium">{combination.confidence.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Probabilité:</span>
                    <span className="font-medium">{(combination.expectedValue * 100).toFixed(4)}%</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Patterns:</div>
                  <div className="flex flex-wrap gap-1">
                    {combination.patterns.map((pattern, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {pattern}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Raisons:</div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {combination.reasons.slice(0, 2).map((reason, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-primary-600 mt-0.5">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
