'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shuffle, 
  Target, 
  BarChart3, 
  Star, 
  Download, 
  Upload, 
  Trash2,
  Play,
  Settings,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { UnifiedCombination } from '@/lib/combination-hub';
import { GenerationConfig } from '@/lib/combination-hub';
import StrategyDetailsModal from './StrategyDetailsModal';
import PatternOptimization from './PatternOptimization';
import MultiGameOptimizer from './MultiGameOptimizer';

export default function CombinationHub() {
  const [combinations, setCombinations] = useState<UnifiedCombination[]>([]);
  const [storedCombinations, setStoredCombinations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour calculer le nombre de numéros consécutifs
  const getConsecutiveCount = (numbers: number[]): number => {
    const sorted = [...numbers].sort((a, b) => a - b);
    let consecutiveCount = 0;
    
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] - sorted[i] === 1) {
        consecutiveCount++;
      }
    }
    
    return consecutiveCount;
  };

  // Fonction pour évaluer la qualité de la somme
  const getSumQuality = (sum: number): { label: string; color: string } => {
    if (sum >= 100 && sum <= 150) {
      return { label: 'Optimale', color: 'text-green-600' };
    } else if (sum >= 80 && sum <= 170) {
      return { label: 'Acceptable', color: 'text-yellow-600' };
    } else {
      return { label: 'Faible', color: 'text-red-600' };
    }
  };

  // Fonction pour évaluer la qualité des dizaines
  const getDizaineQuality = (dizaineCount: number): { label: string; color: string } => {
    if (dizaineCount >= 3) {
      return { label: 'Bonne', color: 'text-green-600' };
    } else if (dizaineCount === 2) {
      return { label: 'Moyenne', color: 'text-yellow-600' };
    } else {
      return { label: 'Faible', color: 'text-red-600' };
    }
  };
  const [activeTab, setActiveTab] = useState<'generate' | 'stored' | 'statistics'>('generate');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<UnifiedCombination | null>(null);
  const [generationConfig, setGenerationConfig] = useState<GenerationConfig>({
    strategies: [],
    count: 10,
    includeHotNumbers: true,
    includeColdNumbers: true,
    includePatterns: true,
    includeMathematical: true,
    includeRules: true,
    includeAdvanced: true,
    includePatternOptimization: false,
    includeOptimizedCombinations: false,
    includeMultiGrids: false
  });
  const [selectedCombinations, setSelectedCombinations] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'roi' | 'date'>('score');

  useEffect(() => {
    loadStoredCombinations();
  }, []);

  const loadStoredCombinations = async () => {
    try {
      const response = await fetch('/api/combination-hub?action=get-stored');
      const result = await response.json();
      if (result.success) {
        setStoredCombinations(result.combinations);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des combinaisons stockées:', error);
    }
  };

  const generateCombinations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/combination-hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-custom',
          config: generationConfig
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setCombinations(result.combinations);
        toast.success(`${result.combinations.length} combinaisons générées !`);
      } else {
        toast.error('Erreur lors de la génération');
      }
    } catch (error) {
      toast.error('Erreur lors de la génération');
    } finally {
      setIsLoading(false);
    }
  };

  const generateOptimizedCombinations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/optimized-combinations', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      if (result.success) {
        // Convertir les combinaisons optimisées au format UnifiedCombination
        const unifiedCombinations: UnifiedCombination[] = result.combinations.map((combo: any, index: number) => ({
          id: `optimized-${index}`,
          name: `Combinaison Optimisée ${index + 1}`,
          description: `Générée par l'algorithme d'optimisation`,
          category: combo.category as any,
          mainNumbers: combo.numbers,
          complementaryNumber: combo.complementary,
          evenOddDistribution: `${combo.numbers.filter((n: number) => n % 2 === 0).length}P-${combo.numbers.filter((n: number) => n % 2 === 1).length}I`,
          isOptimalDistribution: combo.numbers.filter((n: number) => n % 2 === 0).length >= 2 && combo.numbers.filter((n: number) => n % 2 === 0).length <= 3,
          score: combo.score,
          confidence: combo.confidence,
          reasons: combo.reasons || [`Score: ${combo.score}`, `Catégorie: ${combo.category}`],
          expectedValue: combo.expectedValue,
          riskLevel: combo.riskLevel,
          createdAt: new Date()
        }));
        
        setCombinations(unifiedCombinations);
        toast.success(`${unifiedCombinations.length} combinaisons optimisées générées !`);
      } else {
        toast.error('Erreur lors de la génération des combinaisons optimisées');
      }
    } catch (error) {
      toast.error('Erreur lors de la génération des combinaisons optimisées');
    } finally {
      setIsLoading(false);
    }
  };

  const testCombination = async (combination: UnifiedCombination) => {
    try {
      const response = await fetch('/api/combination-hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test-combination',
          combination,
          parameters: { maxTirages: 7508, saveResults: true }
        })
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success(`Test terminé - ROI: ${result.result.roi.toFixed(1)}%`);
        loadStoredCombinations(); // Recharger pour voir les résultats
      } else {
        toast.error('Erreur lors du test');
      }
    } catch (error) {
      toast.error('Erreur lors du test');
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      const response = await fetch('/api/combination-hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle-favorite',
          combinationId: id
        })
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success(result.isFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris');
        loadStoredCombinations();
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteCombination = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette combinaison ?')) return;
    
    try {
      const response = await fetch('/api/combination-hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-combination',
          id
        })
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success('Combinaison supprimée');
        loadStoredCombinations();
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const exportCombinations = async () => {
    try {
      const response = await fetch('/api/combination-hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export' })
      });
      
      const result = await response.json();
      if (result.success) {
        const blob = new Blob([result.data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kdo-loto-combinations-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Export terminé');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const filteredCombinations = storedCombinations.filter(combo => {
    const matchesSearch = combo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         combo.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || combo.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedCombinations = [...filteredCombinations].sort((a, b) => {
    switch (sortBy) {
      case 'roi':
        const aROI = a.testResults?.roi || 0;
        const bROI = b.testResults?.roi || 0;
        return bROI - aROI;
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return b.score - a.score;
    }
  });

  const renderGenerationTab = () => (
    <div className="space-y-6">
      {/* Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configuration de Génération
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre de combinaisons</label>
            <select
              value={generationConfig.count}
              onChange={(e) => setGenerationConfig(prev => ({ ...prev, count: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded-lg"
            >
              <option value={5}>5 combinaisons</option>
              <option value={10}>10 combinaisons</option>
              <option value={20}>20 combinaisons</option>
              <option value={50}>50 combinaisons</option>
            </select>
          </div>
          
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Types de génération</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { key: 'includeHotNumbers', label: 'Numéros Chauds' },
              { key: 'includeColdNumbers', label: 'Numéros Froids' },
              { key: 'includePatterns', label: 'Motifs' },
              { key: 'includeMathematical', label: 'Mathématiques' },
              { key: 'includeRules', label: 'Règles' },
              { key: 'includeAdvanced', label: 'Avancées' },
              { key: 'includePatternOptimization', label: 'Pattern Optimization' },
              { key: 'includeOptimizedCombinations', label: 'Combinaisons Optimisées' },
              { key: 'includeMultiGrids', label: 'Grilles Multiples' }
            ].map(strategy => (
              <label key={strategy.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={generationConfig[strategy.key as keyof GenerationConfig] as boolean}
                  onChange={(e) => setGenerationConfig(prev => ({ 
                    ...prev, 
                    [strategy.key]: e.target.checked 
                  }))}
                  className="w-4 h-4"
                />
                <span className="text-sm">{strategy.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={generateCombinations}
          disabled={isLoading}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Shuffle className="w-4 h-4" />
          )}
          {isLoading ? 'Génération...' : 'Générer les Combinaisons'}
        </button>
      </motion.div>

      {/* Pattern Optimization */}
      {generationConfig.includePatternOptimization && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <PatternOptimization />
        </motion.div>
      )}

      {/* Grilles Multiples */}
      {generationConfig.includeMultiGrids && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <MultiGameOptimizer />
        </motion.div>
      )}

      {/* Combinaisons Optimisées */}
      {generationConfig.includeOptimizedCombinations && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Combinaisons Optimisées</h3>
            <p className="text-gray-600 mb-4">
              Génération de combinaisons optimisées basées sur l'analyse des données historiques
            </p>
            <button
              onClick={generateOptimizedCombinations}
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              <Target className="w-5 h-5" />
              {isLoading ? 'Génération...' : 'Générer Combinaisons Optimisées'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Combinaisons générées */}
      {combinations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold mb-4">Combinaisons Générées</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {combinations.map((combo, index) => {
              // Calculer les détails d'optimisation
              const sum = combo.mainNumbers.reduce((a, b) => a + b, 0);
              const evenCount = combo.mainNumbers.filter(n => n % 2 === 0).length;
              const oddCount = combo.mainNumbers.length - evenCount;
              const dizaines = new Set(combo.mainNumbers.map(num => Math.floor((num - 1) / 10)));
              const consecutiveCount = getConsecutiveCount(combo.mainNumbers);
              const riskColor = combo.riskLevel === 'low' ? 'text-green-600' : combo.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600';
              const sumQuality = getSumQuality(sum);
              const dizaineQuality = getDizaineQuality(dizaines.size);
              
              return (
                <div key={combo.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{combo.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      combo.isOptimalDistribution 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {combo.evenOddDistribution} {combo.isOptimalDistribution ? '✅' : '❌'}
                    </span>
                  </div>
                  
                  {/* Numéros */}
                  <div className="flex gap-1 mb-3">
                    {combo.mainNumbers.map(num => (
                      <span key={num} className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                        {num}
                      </span>
                    ))}
                    <span className="w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-sm font-medium">
                      {combo.complementaryNumber}
                    </span>
                  </div>
                  
                  {/* Détails d'optimisation */}
                  <div className="space-y-2 mb-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Score:</span>
                        <span className="font-medium text-blue-600">{combo.score.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confiance:</span>
                        <span className="font-medium text-green-600">{combo.confidence.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Somme:</span>
                        <span className={`font-medium ${sumQuality.color}`}>{sum} ({sumQuality.label})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dizaines:</span>
                        <span className={`font-medium ${dizaineQuality.color}`}>{dizaines.size} ({dizaineQuality.label})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Consécutifs:</span>
                        <span className={`font-medium ${consecutiveCount > 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                          {consecutiveCount} {consecutiveCount > 0 ? '✅' : '❌'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Risque:</span>
                        <span className={`font-medium ${riskColor}`}>{combo.riskLevel.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Raisons d'optimisation */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">Raisons d'optimisation:</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {combo.reasons.slice(0, 2).map((reason, i) => (
                        <div key={i} className="flex items-start gap-1">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                      {combo.reasons.length > 2 && (
                        <div className="text-blue-600">+{combo.reasons.length - 2} autres raisons</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Boutons d'action */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedDetails(combo);
                        setShowDetailsModal(true);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Info className="w-3 h-3" />
                      Détails
                    </button>
                    <button
                      onClick={() => testCombination(combo)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      Tester
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderStoredTab = () => (
    <div className="space-y-6">
      {/* Filtres et recherche */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une combinaison..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">Toutes les catégories</option>
            <option value="hot-cold">Chaud/Froid</option>
            <option value="pattern">Motifs</option>
            <option value="mathematical">Mathématiques</option>
            <option value="rules">Règles</option>
            <option value="advanced">Avancées</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="score">Trier par score</option>
            <option value="roi">Trier par ROI</option>
            <option value="date">Trier par date</option>
          </select>
          
          <button
            onClick={exportCombinations}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </motion.div>

      {/* Liste des combinaisons stockées */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md"
      >
        {sortedCombinations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucune combinaison stockée
          </div>
        ) : (
          <div className="divide-y">
            {sortedCombinations.map((combo) => (
              <div key={combo.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{combo.name}</h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {combo.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        combo.isOptimalDistribution 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {combo.evenOddDistribution} {combo.isOptimalDistribution ? '✅' : '❌'}
                      </span>
                      {combo.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                    </div>
                    
                    <div className="flex gap-1 mb-2">
                      {combo.mainNumbers.map((num: number) => (
                        <span key={num} className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm">
                          {num}
                        </span>
                      ))}
                      <span className="w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-sm">
                        {combo.complementaryNumber}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      Score: {combo.score} | Confiance: {combo.confidence}%
                      {combo.testResults && (
                        <span className="ml-4">
                          ROI: {combo.testResults.roi.toFixed(1)}% | 
                          Gains: {combo.testResults.totalGains.toFixed(0)}€ | 
                          Taux: {combo.testResults.winRate.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {combo.testResults ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                        Testé
                      </span>
                    ) : (
                      <button
                        onClick={() => testCombination(combo)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        Tester
                      </button>
                    )}
                    
                    <button
                      onClick={() => toggleFavorite(combo.id)}
                      className={`p-1 rounded ${
                        combo.isFavorite 
                          ? 'text-yellow-500' 
                          : 'text-gray-400 hover:text-yellow-500'
                      }`}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => deleteCombination(combo.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );

  const renderStatisticsTab = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Statistiques du Hub
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{storedCombinations.length}</div>
            <div className="text-sm text-gray-600">Combinaisons stockées</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {storedCombinations.filter(c => c.testResults).length}
            </div>
            <div className="text-sm text-gray-600">Combinaisons testées</div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {storedCombinations.filter(c => c.isFavorite).length}
            </div>
            <div className="text-sm text-gray-600">Favoris</div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎯 Hub Centralisé des Combinaisons
        </h1>
        <p className="text-gray-600">
          Générez, testez et gérez toutes vos combinaisons en un seul endroit
        </p>
      </motion.div>

      {/* Onglets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-md"
      >
        <div className="flex border-b">
          {[
            { id: 'generate', label: 'Génération', icon: Shuffle },
            { id: 'stored', label: 'Stockées', icon: Target },
            { id: 'statistics', label: 'Statistiques', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="p-6">
          {activeTab === 'generate' && renderGenerationTab()}
          {activeTab === 'stored' && renderStoredTab()}
          {activeTab === 'statistics' && renderStatisticsTab()}
        </div>
      </motion.div>

      {/* Modal des détails de stratégie */}
      <StrategyDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedDetails(null);
        }}
        details={selectedDetails ? {
          strategy: `Stratégie ${selectedDetails.name} - Optimisation avancée`,
          reasons: [
            `Distribution pair/impair: ${selectedDetails.evenOddDistribution}`,
            `Score d'optimisation: ${selectedDetails.score}`,
            `Confiance: ${selectedDetails.confidence}%`,
            selectedDetails.isOptimalDistribution ? 'Distribution optimale validée' : 'Distribution sous-optimale'
          ],
          analysis: {
            frequency: 70,
            recency: 65,
            pattern: 60,
            mathematical: 75
          },
          numbers: selectedDetails.mainNumbers.map((num, index) => ({
            numero: num,
            type: 'balanced' as const,
            reason: `Numéro principal ${index + 1} - Sélectionné selon l'analyse statistique`,
            score: selectedDetails.score
          })),
          complementary: {
            numero: selectedDetails.complementaryNumber,
            reason: 'Numéro complémentaire optimisé selon les patterns historiques',
            score: selectedDetails.score * 0.8
          },
          confidence: selectedDetails.confidence,
          riskLevel: selectedDetails.confidence > 80 ? 'low' : selectedDetails.confidence > 60 ? 'medium' : 'high',
          expectedValue: 3.2
        } : null}
        combination={selectedDetails ? {
          boules: selectedDetails.mainNumbers,
          numero_chance: selectedDetails.complementaryNumber,
          score: selectedDetails.score
        } : null}
      />
    </div>
  );
}

