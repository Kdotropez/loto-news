/**
 * HOOK MULTI-GAME DATA
 * Gestion centralisée des données du MultiGameOptimizer
 */

import { useState, useEffect, useCallback } from 'react';
import type { 
  BestNumbersSet, 
  MultiGameCombination, 
  MultiGameStrategy, 
  BudgetOptimization,
  MultiGrid,
  SimpleGame,
  StrategyOptions
} from '@/types/multi-game';
import { DEFAULT_STRATEGY_OPTIONS, DEFAULT_CONFIG } from '@/lib/constants/multi-game-constants';

export const useMultiGameData = () => {
  // États principaux
  const [bestNumbers, setBestNumbers] = useState<BestNumbersSet | null>(null);
  const [optimalCombinations, setOptimalCombinations] = useState<MultiGameCombination[]>([]);
  const [strategies, setStrategies] = useState<MultiGameStrategy[]>([]);
  const [budgetOptimization, setBudgetOptimization] = useState<BudgetOptimization | null>(null);
  const [multiGrids, setMultiGrids] = useState<MultiGrid[]>([]);
  const [simpleGames, setSimpleGames] = useState<SimpleGame[]>([]);
  const [simpleCombinations, setSimpleCombinations] = useState<any[]>([]);
  
  // Configuration
  const [budget, setBudget] = useState<number>(DEFAULT_CONFIG.BUDGET);
  const [combinationCount, setCombinationCount] = useState(DEFAULT_CONFIG.COMBINATION_COUNT);
  const [strategyOptions, setStrategyOptions] = useState<StrategyOptions>(DEFAULT_STRATEGY_OPTIONS);
  
  // États de chargement
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Charge les meilleurs numéros depuis l'API
   */
  const loadBestNumbers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/multi-game?action=get-best-numbers&count=15');
      const result = await response.json();
      
      if (result.success) {
        setBestNumbers(result.data);
      } else {
        throw new Error(result.error || 'Erreur lors du chargement des meilleurs numéros');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur loadBestNumbers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Génère des combinaisons simples
   */
  const generateSimpleCombinations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analysis?type=combinations&count=${combinationCount}`);
      const result = await response.json();
      
      if (result.success) {
        setSimpleCombinations(result.data);
      } else {
        throw new Error(result.error || 'Erreur lors de la génération');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur generateSimpleCombinations:', err);
    } finally {
      setLoading(false);
    }
  }, [combinationCount]);

  /**
   * Charge les combinaisons optimales
   */
  const loadOptimalCombinations = useCallback(async () => {
    if (!bestNumbers) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/multi-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-combinations',
          numbersSet: bestNumbers.numbers,
          count: 10,
          strategyOptions
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setOptimalCombinations(result.data);
      } else {
        throw new Error(result.error || 'Erreur lors du chargement des combinaisons optimales');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur loadOptimalCombinations:', err);
    } finally {
      setLoading(false);
    }
  }, [bestNumbers, strategyOptions]);

  /**
   * Charge les jeux simples
   */
  const loadSimpleGames = useCallback(async () => {
    if (!bestNumbers) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/multi-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-simple-games',
          numbersSet: bestNumbers.numbers,
          count: 8,
          strategyOptions
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSimpleGames(result.data);
      } else {
        throw new Error(result.error || 'Erreur lors du chargement des jeux simples');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur loadSimpleGames:', err);
    } finally {
      setLoading(false);
    }
  }, [bestNumbers, strategyOptions]);

  /**
   * Charge les grilles multiples
   */
  const loadMultiGrids = useCallback(async () => {
    if (!bestNumbers) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/multi-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-multi-grids',
          numbersSet: bestNumbers.numbers,
          budget,
          strategyOptions
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMultiGrids(result.data);
      } else {
        throw new Error(result.error || 'Erreur lors du chargement des grilles multiples');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur loadMultiGrids:', err);
    } finally {
      setLoading(false);
    }
  }, [bestNumbers, budget, strategyOptions]);

  /**
   * Charge les stratégies
   */
  const loadStrategies = useCallback(async () => {
    if (!bestNumbers) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/multi-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-strategies',
          budget,
          numbersSet: bestNumbers.numbers
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStrategies(result.data);
      } else {
        throw new Error(result.error || 'Erreur lors du chargement des stratégies');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur loadStrategies:', err);
    } finally {
      setLoading(false);
    }
  }, [bestNumbers, budget]);

  /**
   * Charge l'optimisation budgétaire
   */
  const loadBudgetOptimization = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/multi-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'optimize-budget',
          budget
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setBudgetOptimization(result.data);
      } else {
        throw new Error(result.error || 'Erreur lors de l\'optimisation budgétaire');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur loadBudgetOptimization:', err);
    } finally {
      setLoading(false);
    }
  }, [budget]);

  /**
   * Initialisation
   */
  useEffect(() => {
    loadBestNumbers();
  }, [loadBestNumbers]);

  /**
   * Régénération des combinaisons quand les options changent
   */
  useEffect(() => {
    if (optimalCombinations.length > 0) {
      loadOptimalCombinations();
    }
  }, [strategyOptions, loadOptimalCombinations]);

  return {
    // Données
    bestNumbers,
    optimalCombinations,
    strategies,
    budgetOptimization,
    multiGrids,
    simpleGames,
    simpleCombinations,
    
    // Configuration
    budget,
    combinationCount,
    strategyOptions,
    
    // États
    loading,
    error,
    
    // Actions
    setBudget,
    setCombinationCount,
    setStrategyOptions,
    
    // Fonctions de chargement
    loadBestNumbers,
    generateSimpleCombinations,
    loadOptimalCombinations,
    loadSimpleGames,
    loadMultiGrids,
    loadStrategies,
    loadBudgetOptimization,
    
    // Fonction de nettoyage d'erreur
    clearError: () => setError(null)
  };
};



