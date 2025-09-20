/**
 * HOOK STRATEGY TESTING
 * Gestion des tests de stratégies et combinaisons
 */

import { useState, useCallback } from 'react';
import type { MultiGameCombination, MultiGrid, TestResult, MultiGridTestResult } from '@/types/multi-game';
import { calculateGridGlobalStats } from '@/lib/utils/multi-game-utils';
import toast from 'react-hot-toast';

export const useStrategyTesting = () => {
  // États des tests
  const [testingCombination, setTestingCombination] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<{[key: number]: TestResult}>({});
  const [testingMultiGrid, setTestingMultiGrid] = useState<string | null>(null);
  const [multiGridTestResults, setMultiGridTestResults] = useState<Record<string, MultiGridTestResult>>({});

  /**
   * Teste une combinaison individuelle
   */
  const testCombination = useCallback(async (combination: MultiGameCombination, index: number) => {
    setTestingCombination(index);
    
    try {
      const response = await fetch('/api/test-combination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          combination: combination.numbers,
          complementary: combination.complementary,
          maxTirages: 1000
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setTestResults(prev => ({
          ...prev,
          [index]: {
            combination,
            totalTests: result.data.totalTests,
            wins: result.data.wins,
            totalGains: result.data.totalGains,
            categories: result.data.categories,
            roi: result.data.roi,
            winRate: result.data.winRate
          }
        }));
        
        toast.success(`Test terminé: ${result.data.wins} gains sur ${result.data.totalTests} tirages`);
      } else {
        toast.error('Erreur lors du test de la combinaison');
        console.error('Erreur test combinaison:', result.error);
      }
    } catch (error) {
      toast.error('Erreur lors du test de la combinaison');
      console.error('Erreur test combinaison:', error);
    } finally {
      setTestingCombination(null);
    }
  }, []);

  /**
   * Teste une grille multiple complète
   */
  const testMultiGrid = useCallback(async (grid: MultiGrid) => {
    const gridId = `grid-${grid.id}`;
    setTestingMultiGrid(gridId);
    
    try {
      // Tester chaque combinaison de la grille
      const gridResults: TestResult[] = [];
      
      for (let i = 0; i < grid.combinations.length; i++) {
        const combination = grid.combinations[i];
        
        const response = await fetch('/api/test-combination', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            combination: combination.numbers,
            complementary: combination.complementary,
            maxTirages: 1000
          })
        });

        const result = await response.json();
        
        if (result.success) {
          gridResults.push({
            combination,
            totalTests: result.data.totalTests,
            wins: result.data.wins,
            totalGains: result.data.totalGains,
            categories: result.data.categories,
            roi: result.data.roi,
            winRate: result.data.winRate
          });
        }
      }
      
      // Calculer les statistiques globales
      const globalStats = calculateGridGlobalStats(gridResults, grid);
      
      setMultiGridTestResults(prev => ({
        ...prev,
        [gridId]: {
          grid,
          results: gridResults,
          globalStats
        }
      }));
      
      toast.success(`Test de grille terminé: ${globalStats.totalGainsCount} gains au total`);
      
    } catch (error) {
      toast.error('Erreur lors du test de la grille');
      console.error('Erreur test grille:', error);
    } finally {
      setTestingMultiGrid(null);
    }
  }, []);

  /**
   * Teste toutes les combinaisons d'une liste
   */
  const testAllCombinations = useCallback(async (combinations: MultiGameCombination[]) => {
    for (let i = 0; i < combinations.length; i++) {
      await testCombination(combinations[i], i);
      // Petite pause pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }, [testCombination]);

  /**
   * Efface les résultats de test
   */
  const clearTestResults = useCallback(() => {
    setTestResults({});
    setMultiGridTestResults({});
  }, []);

  /**
   * Efface les résultats de test pour une combinaison spécifique
   */
  const clearCombinationTestResult = useCallback((index: number) => {
    setTestResults(prev => {
      const newResults = { ...prev };
      delete newResults[index];
      return newResults;
    });
  }, []);

  /**
   * Efface les résultats de test pour une grille spécifique
   */
  const clearGridTestResult = useCallback((gridId: string) => {
    setMultiGridTestResults(prev => {
      const newResults = { ...prev };
      delete newResults[gridId];
      return newResults;
    });
  }, []);

  return {
    // États
    testingCombination,
    testResults,
    testingMultiGrid,
    multiGridTestResults,
    
    // Actions
    testCombination,
    testMultiGrid,
    testAllCombinations,
    clearTestResults,
    clearCombinationTestResult,
    clearGridTestResult,
    
    // Helpers
    isTestingCombination: (index: number) => testingCombination === index,
    isTestingGrid: (gridId: string) => testingMultiGrid === gridId,
    hasTestResult: (index: number) => index in testResults,
    hasGridTestResult: (gridId: string) => gridId in multiGridTestResults
  };
};



