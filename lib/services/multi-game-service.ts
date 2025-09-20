/**
 * MULTI-GAME SERVICE
 * Service métier centralisé pour les fonctionnalités multi-jeux
 */

import type { 
  BestNumbersSet, 
  MultiGameCombination, 
  MultiGameStrategy, 
  BudgetOptimization,
  MultiGrid,
  SimpleGame,
  StrategyOptions 
} from '@/types/multi-game';

export class MultiGameService {
  private apiBaseUrl = '/api/multi-game';

  /**
   * Récupère les meilleurs numéros
   */
  async getBestNumbers(count: number = 15): Promise<BestNumbersSet> {
    const response = await fetch(`${this.apiBaseUrl}?action=get-best-numbers&count=${count}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors du chargement des meilleurs numéros');
    }
    
    return result.data;
  }

  /**
   * Génère des combinaisons optimisées
   */
  async generateOptimizedCombinations(
    numbersSet: number[], 
    count: number = 10,
    strategyOptions: StrategyOptions
  ): Promise<MultiGameCombination[]> {
    const response = await fetch(this.apiBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate-combinations',
        numbersSet,
        count,
        strategyOptions
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la génération des combinaisons');
    }
    
    return result.data;
  }

  /**
   * Génère des jeux simples optimisés
   */
  async generateSimpleGames(
    numbersSet: number[], 
    count: number = 8,
    strategyOptions: StrategyOptions
  ): Promise<SimpleGame[]> {
    const response = await fetch(this.apiBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate-simple-games',
        numbersSet,
        count,
        strategyOptions
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la génération des jeux simples');
    }
    
    return result.data;
  }

  /**
   * Génère des grilles multiples
   */
  async generateMultiGrids(
    numbersSet: number[], 
    budget: number,
    strategyOptions: StrategyOptions
  ): Promise<MultiGrid[]> {
    const response = await fetch(this.apiBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate-multi-grids',
        numbersSet,
        budget,
        strategyOptions
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la génération des grilles multiples');
    }
    
    return result.data;
  }

  /**
   * Génère des stratégies multiples
   */
  async generateStrategies(
    budget: number, 
    numbersSet: number[]
  ): Promise<MultiGameStrategy[]> {
    const response = await fetch(this.apiBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate-strategies',
        budget,
        numbersSet
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la génération des stratégies');
    }
    
    return result.data;
  }

  /**
   * Optimise un budget donné
   */
  async optimizeBudget(budget: number): Promise<BudgetOptimization> {
    const response = await fetch(this.apiBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'optimize-budget',
        budget
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de l\'optimisation budgétaire');
    }
    
    return result.data;
  }

  /**
   * Génère des combinaisons simples via l'API d'analyse
   */
  async generateSimpleCombinations(count: number): Promise<any[]> {
    const response = await fetch(`/api/analysis?type=combinations&count=${count}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la génération des combinaisons simples');
    }
    
    return result.data;
  }

  /**
   * Efface le cache du service
   */
  async clearCache(): Promise<void> {
    const response = await fetch(this.apiBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'clear-cache'
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors du nettoyage du cache');
    }
  }

  /**
   * Valide des options de stratégie
   */
  validateStrategyOptions(options: StrategyOptions): string[] {
    const errors: string[] = [];
    
    // Vérifier qu'au moins une stratégie est activée
    const hasActiveStrategy = Object.values(options).some(value => value === true);
    if (!hasActiveStrategy) {
      errors.push('Au moins une stratégie doit être activée');
    }
    
    return errors;
  }

  /**
   * Calcule le score d'une combinaison
   */
  calculateCombinationScore(combination: MultiGameCombination): number {
    let score = combination.score;
    
    // Bonus pour la confiance élevée
    if (combination.confidence > 80) {
      score += 10;
    }
    
    // Bonus pour les stratégies équilibrées
    if (combination.strategy === 'balanced') {
      score += 5;
    }
    
    // Malus pour les coûts élevés
    if (combination.cost > 50) {
      score -= 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Filtre les combinaisons par critères
   */
  filterCombinations(
    combinations: MultiGameCombination[],
    filters: {
      minScore?: number;
      maxCost?: number;
      strategies?: string[];
      minConfidence?: number;
    }
  ): MultiGameCombination[] {
    return combinations.filter(combination => {
      if (filters.minScore && combination.score < filters.minScore) return false;
      if (filters.maxCost && combination.cost > filters.maxCost) return false;
      if (filters.strategies && !filters.strategies.includes(combination.strategy)) return false;
      if (filters.minConfidence && combination.confidence < filters.minConfidence) return false;
      return true;
    });
  }

  /**
   * Trie les combinaisons par critère
   */
  sortCombinations(
    combinations: MultiGameCombination[],
    sortBy: 'score' | 'confidence' | 'cost' | 'expectedReturn',
    order: 'asc' | 'desc' = 'desc'
  ): MultiGameCombination[] {
    return [...combinations].sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];
      
      if (order === 'desc') {
        return valueB - valueA;
      } else {
        return valueA - valueB;
      }
    });
  }
}

// Instance singleton
export const multiGameService = new MultiGameService();



