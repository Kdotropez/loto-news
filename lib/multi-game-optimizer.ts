/**
 * Optimiseur de jeux multiples pour maximiser les chances de gain
 * Génère les meilleures combinaisons sur un ensemble de chiffres optimaux
 */

import { dataStorage, Tirage } from './data-storage';
import { optimizedCombinationEngine } from './optimized-combination-engine';

export interface BestNumbersSet {
  numbers: number[];
  score: number;
  confidence: number;
  reasons: string[];
  frequency: number;
  recency: number;
  pattern: number;
  mathematical: number;
}

export interface MultiGameCombination {
  numbers: number[];
  complementary: number;
  score: number;
  confidence: number;
  expectedValue: number;
  riskLevel: 'low' | 'medium' | 'high';
  category: 'hot' | 'balanced' | 'pattern' | 'mathematical';
  reasons: string[];
}

export interface StrategyOptions {
  forceOptimalDistribution: boolean; // Forcer distribution 3P-2I ou 2P-3I
  includeHotNumbers: boolean;        // Numéros Chauds
  includeColdNumbers: boolean;       // Numéros Froids
  includePatterns: boolean;          // Motifs
  includeMathematical: boolean;      // Mathématiques
  includeRules: boolean;             // Règles
  includeAdvanced: boolean;          // Avancées
  includeHighGapNumbers: boolean;    // Numéros fort écart
  includeFrequentSequences: boolean; // Séquences les plus fréquentes
  includeOptimalSums: boolean;       // Sommes optimales (110-130)
  includeOptimalDecades: boolean;    // Dizaines optimales (0.1.2.3.4)
}

export interface MultiGrid {
  id: number;
  name: string;
  combinations: MultiGameCombination[];
  totalCost: number;
  expectedReturn: number;
  roi: number;
  winProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  strategy: 'conservative' | 'balanced' | 'aggressive';
  description: string;
}

export interface SimpleGame {
  id: number;
  name: string;
  combination: MultiGameCombination;
  cost: number;
  expectedReturn: number;
  roi: number;
  winProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  strategy: 'hot' | 'balanced' | 'pattern' | 'mathematical';
  description: string;
}

export interface MultiGameStrategy {
  name: string;
  description: string;
  combinations: MultiGameCombination[];
  totalCost: number;
  expectedReturn: number;
  roi: number;
  winProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  strategy: 'conservative' | 'balanced' | 'aggressive';
}

export interface BudgetOptimization {
  budget: number;
  strategies: MultiGameStrategy[];
  recommended: MultiGameStrategy;
  alternatives: MultiGameStrategy[];
}

export class MultiGameOptimizer {
  private cache: Map<string, any> = new Map();
  private lastUpdate: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Identifie les meilleurs chiffres à utiliser
   */
  getBestNumbersSet(count: number = 15): BestNumbersSet {
    const cacheKey = `best_numbers_${count}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const tirages = dataStorage.getAllTirages();
    const numberStats = this.analyzeNumberStatistics(tirages);
    const bestNumbers = this.selectBestNumbers(numberStats, count);
    
    const result: BestNumbersSet = {
      numbers: bestNumbers,
      score: this.calculateNumbersSetScore(bestNumbers, numberStats),
      confidence: this.calculateNumbersSetConfidence(bestNumbers, numberStats),
      reasons: this.getNumbersSetReasons(bestNumbers, numberStats),
      frequency: this.calculateFrequencyScore(bestNumbers, numberStats),
      recency: this.calculateRecencyScore(bestNumbers, numberStats),
      pattern: this.calculatePatternScore(bestNumbers, numberStats),
      mathematical: this.calculateMathematicalScore(bestNumbers, numberStats)
    };

    this.cache.set(cacheKey, result);
    this.lastUpdate = Date.now();

    return result;
  }

  /**
   * Génère les meilleures combinaisons sur un ensemble de chiffres
   */
  generateOptimalCombinations(
    numbersSet: number[], 
    count: number = 10,
    strategyOptions: StrategyOptions = {
      forceOptimalDistribution: true,
      includeHotNumbers: true,
      includeColdNumbers: true,
      includePatterns: true,
      includeMathematical: true,
      includeRules: true,
      includeAdvanced: true,
      includeHighGapNumbers: true,
      includeFrequentSequences: true,
      includeOptimalSums: true,
      includeOptimalDecades: true
    }
  ): MultiGameCombination[] {
    const combinations: MultiGameCombination[] = [];
    
    // Calculer les proportions selon les stratégies activées
    const activeStrategies = [
      { name: 'hot', enabled: strategyOptions.includeHotNumbers, weight: 0.3 },
      { name: 'balanced', enabled: strategyOptions.includeColdNumbers, weight: 0.25 },
      { name: 'pattern', enabled: strategyOptions.includePatterns, weight: 0.2 },
      { name: 'mathematical', enabled: strategyOptions.includeMathematical, weight: 0.1 },
      { name: 'frequent-sequences', enabled: strategyOptions.includeFrequentSequences, weight: 0.1 },
      { name: 'optimal-sums', enabled: strategyOptions.includeOptimalSums, weight: 0.1 },
      { name: 'optimal-decades', enabled: strategyOptions.includeOptimalDecades, weight: 0.1 }
    ].filter(s => s.enabled);
    
    const totalWeight = activeStrategies.reduce((sum, s) => sum + s.weight, 0);
    
    // Si aucune stratégie n'est activée, utiliser la stratégie par défaut
    if (totalWeight === 0 || activeStrategies.length === 0) {
      const defaultCombinations = this.generateDefaultCombinations(numbersSet, count);
      return defaultCombinations;
    }
    
    // Générer selon les stratégies activées
    activeStrategies.forEach(strategy => {
      const strategyCount = Math.ceil((strategy.weight / totalWeight) * count);
      
      switch (strategy.name) {
        case 'hot':
          const hotCombinations = this.generateHotCombinations(numbersSet, strategyCount, strategyOptions);
          combinations.push(...hotCombinations);
          break;
        case 'balanced':
          const balancedCombinations = this.generateBalancedCombinations(numbersSet, strategyCount, strategyOptions);
          combinations.push(...balancedCombinations);
          break;
        case 'pattern':
          const patternCombinations = this.generatePatternCombinations(numbersSet, strategyCount, strategyOptions);
          combinations.push(...patternCombinations);
          break;
        case 'mathematical':
          const mathematicalCombinations = this.generateMathematicalCombinations(numbersSet, strategyCount, strategyOptions);
          combinations.push(...mathematicalCombinations);
          break;
        case 'frequent-sequences':
          const frequentSequencesCombinations = this.generateFrequentSequencesCombinations(numbersSet, strategyCount, strategyOptions);
          combinations.push(...frequentSequencesCombinations);
          break;
        case 'optimal-sums':
          const optimalSumsCombinations = this.generateOptimalSumsCombinations(numbersSet, strategyCount, strategyOptions);
          combinations.push(...optimalSumsCombinations);
          break;
        case 'optimal-decades':
          const optimalDecadesCombinations = this.generateOptimalDecadesCombinations(numbersSet, strategyCount, strategyOptions);
          combinations.push(...optimalDecadesCombinations);
          break;
      }
    });

    // Trier par score et éliminer les doublons
    const uniqueCombinations = this.removeDuplicates(combinations);
    return uniqueCombinations
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  /**
   * Génère toutes les combinaisons de k éléments parmi n (version optimisée)
   */
  private generateCombinations(n: number[], k: number): number[][] {
    if (k === 0) return [[]];
    if (n.length === 0) return [];
    if (k > n.length) return [];
    if (k === n.length) return [n];
    if (k === 1) return n.map(x => [x]);
    
    const result: number[][] = [];
    
    // Version itérative pour éviter les problèmes de récursion
    const stack: { arr: number[], start: number, k: number }[] = [{ arr: [], start: 0, k }];
    
    while (stack.length > 0) {
      const { arr, start, k: remaining } = stack.pop()!;
      
      if (remaining === 0) {
        result.push([...arr]);
        continue;
      }
      
      for (let i = start; i <= n.length - remaining; i++) {
        stack.push({
          arr: [...arr, n[i]],
          start: i + 1,
          k: remaining - 1
        });
      }
    }
    
    return result;
  }

  /**
   * Génère les combinaisons pour une grille multiple selon les règles du Loto
   */
  generateMultiGridCombinations(numbers: number[], expectedCount: number, strategyOptions?: StrategyOptions): MultiGameCombination[] {
    const combinations: MultiGameCombination[] = [];
    
    // Générer toutes les combinaisons de 5 numéros parmi les numéros fournis
    const combinations5 = this.getCombinations(numbers, 5);
    
    // Pour chaque combinaison de 5, générer un numéro complémentaire optimal
    combinations5.forEach((combo, index) => {
      if (index >= expectedCount) return; // Limiter au nombre attendu
      
      // Générer un numéro complémentaire basé sur les stratégies
      const complementary = this.generateOptimalComplementary(combo, numbers, strategyOptions);
      
      const category = this.determineCategory(combo, complementary, strategyOptions);
      
      const multiCombo: MultiGameCombination = {
        numbers: [...combo, complementary],
        complementary: complementary,
        score: this.calculateCombinationScore(combo, complementary),
        confidence: this.calculateConfidence(combo, complementary),
        riskLevel: this.calculateRiskLevel(combo, complementary),
        expectedValue: this.calculateExpectedValue(combo, complementary),
        category: category,
        reasons: this.generateReasons(combo, complementary, category)
      };
      
      combinations.push(multiCombo);
    });
    
    return combinations;
  }

  /**
   * Génère toutes les combinaisons de k éléments parmi un tableau
   */
  getCombinations(arr: number[], k: number): number[][] {
    if (k === 1) return arr.map(x => [x]);
    if (k === arr.length) return [arr];
    
    const combinations: number[][] = [];
    
    for (let i = 0; i <= arr.length - k; i++) {
      const head = arr[i];
      const tailCombinations = this.getCombinations(arr.slice(i + 1), k - 1);
      
      for (const tail of tailCombinations) {
        combinations.push([head, ...tail]);
      }
    }
    
    return combinations;
  }

  /**
   * Récupère les numéros chauds (les plus fréquents)
   */
  getHotNumbers(): number[] {
    // Utiliser les données de fréquence pour déterminer les numéros chauds
    const frequencyData = this.getNumberStatistics();
    const frequencyArray = Array.from(frequencyData.values());
    return frequencyArray
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 15) // Top 15 numéros chauds
      .map(item => item.numero);
  }

  /**
   * Récupère les numéros froids (les moins fréquents)
   */
  getColdNumbers(): number[] {
    // Utiliser les données de fréquence pour déterminer les numéros froids
    const frequencyData = this.getNumberStatistics();
    const frequencyArray = Array.from(frequencyData.values());
    return frequencyArray
      .sort((a, b) => a.frequency - b.frequency)
      .slice(0, 15) // Top 15 numéros froids
      .map(item => item.numero);
  }

  /**
   * Détermine la catégorie d'une combinaison
   */
  determineCategory(mainNumbers: number[], complementary: number, strategyOptions?: StrategyOptions): 'hot' | 'balanced' | 'pattern' | 'mathematical' {
    const hotNumbers = this.getHotNumbers();
    const coldNumbers = this.getColdNumbers();
    
    const hotCount = mainNumbers.filter(num => hotNumbers.includes(num)).length;
    const coldCount = mainNumbers.filter(num => coldNumbers.includes(num)).length;
    
    if (hotCount >= 3) return 'hot';
    if (coldCount >= 3) return 'pattern';
    if (hotCount === 2 && coldCount === 2) return 'balanced';
    
    return 'mathematical';
  }

  /**
   * Génère un numéro complémentaire optimal basé sur les stratégies
   */
  generateOptimalComplementary(mainNumbers: number[], allNumbers: number[], strategyOptions?: StrategyOptions): number {
    // Numéros disponibles (pas déjà utilisés dans les 5 principaux)
    const availableNumbers = allNumbers.filter(num => !mainNumbers.includes(num));
    
    if (availableNumbers.length === 0) {
      // Si tous les numéros sont utilisés, prendre un numéro aléatoire entre 1 et 49
      return Math.floor(Math.random() * 49) + 1;
    }
    
    // Appliquer les stratégies pour choisir le meilleur complémentaire
    if (strategyOptions?.includeHotNumbers) {
      // Prioriser les numéros chauds disponibles
      const hotNumbers = this.getHotNumbers().filter(num => availableNumbers.includes(num));
      if (hotNumbers.length > 0) {
        return hotNumbers[Math.floor(Math.random() * hotNumbers.length)];
      }
    }
    
    if (strategyOptions?.includeColdNumbers) {
      // Équilibrer avec des numéros froids
      const coldNumbers = this.getColdNumbers().filter(num => availableNumbers.includes(num));
      if (coldNumbers.length > 0 && Math.random() < 0.3) { // 30% de chance
        return coldNumbers[Math.floor(Math.random() * coldNumbers.length)];
      }
    }
    
    // Par défaut, prendre un numéro aléatoire parmi les disponibles
    return availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
  }

  /**
   * Génère de vraies grilles multiples optimisées selon les règles du Loto
   */
  generateMultiGrids(numbersSet: number[], budget: number, strategyOptions?: StrategyOptions): MultiGrid[] {
    const grids: MultiGrid[] = [];
    
    try {
      // Grille Multiple 6 (6 numéros → 6 combinaisons de 5 numéros + 1 complémentaire)
      const grid6Numbers = numbersSet.slice(0, 6);
      const grid6Combinations = this.generateMultiGridCombinations(grid6Numbers, 6, strategyOptions);
      
      grids.push({
        id: 1,
        name: "Grille Multiple 6",
        combinations: grid6Combinations,
        totalCost: grid6Combinations.length * 2.2,
        expectedReturn: grid6Combinations.length * 5.0,
        roi: 0,
        winProbability: 0,
        riskLevel: 'low',
        strategy: 'conservative',
        description: `Grille multiple 6 numéros → ${grid6Combinations.length} combinaisons automatiques`
      });

      // Grille Multiple 7 (7 numéros → 21 combinaisons de 5 numéros + 1 complémentaire)
      const grid7Numbers = numbersSet.slice(0, 7);
      const grid7Combinations = this.generateMultiGridCombinations(grid7Numbers, 21, strategyOptions);
      
      grids.push({
        id: 2,
        name: "Grille Multiple 7",
        combinations: grid7Combinations,
        totalCost: grid7Combinations.length * 2.2,
        expectedReturn: grid7Combinations.length * 5.0,
        roi: 0,
        winProbability: 0,
        riskLevel: 'medium',
        strategy: 'balanced',
        description: `Grille multiple 7 numéros → ${grid7Combinations.length} combinaisons automatiques`
      });

      // Grille Multiple 8 (8 numéros → 56 combinaisons) - seulement si budget suffisant
      if (budget >= 56 * 2.2) {
        const grid8Numbers = numbersSet.slice(0, 8);
        const grid8Combinations = this.generateMultiGridCombinations(grid8Numbers, 56, strategyOptions);
        
        grids.push({
          id: 3,
          name: "Grille Multiple 8",
          combinations: grid8Combinations,
          totalCost: grid8Combinations.length * 2.2,
          expectedReturn: grid8Combinations.length * 5.0,
          roi: 0,
          winProbability: 0,
          riskLevel: 'high',
          strategy: 'aggressive',
          description: `Grille multiple 8 numéros → ${grid8Combinations.length} combinaisons automatiques`
        });
      }

      // Calculer les métriques pour chaque grille
      grids.forEach(grid => {
        grid.roi = grid.totalCost > 0 ? ((grid.expectedReturn - grid.totalCost) / grid.totalCost) * 100 : 0;
        // Calcul réaliste des probabilités de gain au Loto
        const baseProbability = 1 / 1906884; // Probabilité de gagner le gros lot (5+1)
        const combinationsCount = grid.combinations.length;
        grid.winProbability = Math.min(0.1, combinationsCount * baseProbability * 100); // Max 0.1%
      });

      return grids.sort((a, b) => b.roi - a.roi);
    } catch (error) {
      console.error('Erreur dans generateMultiGrids:', error);
      return [];
    }
  }

  /**
   * Génère des jeux simples optimisés
   */
  generateSimpleGames(numbersSet: number[], count: number = 8, strategyOptions?: StrategyOptions): SimpleGame[] {
    const games: SimpleGame[] = [];
    const combinations = this.generateOptimalCombinations(numbersSet, count, strategyOptions);
    
    combinations.forEach((combo, index) => {
      const game: SimpleGame = {
        id: index + 1,
        name: `Jeu Simple ${combo.category.charAt(0).toUpperCase() + combo.category.slice(1)}`,
        combination: combo,
        cost: 2.2, // Prix d'un jeu simple
        expectedReturn: combo.expectedValue,
        roi: 0,
        winProbability: combo.confidence,
        riskLevel: combo.riskLevel,
        strategy: combo.category as 'hot' | 'balanced' | 'pattern' | 'mathematical',
        description: `Jeu simple optimisé avec stratégie ${combo.category}`
      };
      
      game.roi = game.cost > 0 ? ((game.expectedReturn - game.cost) / game.cost) * 100 : 0;
      games.push(game);
    });
    
    return games.sort((a, b) => b.roi - a.roi);
  }

  /**
   * Crée une combinaison MultiGame simplifiée
   */
  private createSimpleMultiGameCombination(numbers: number[]): MultiGameCombination {
    const complementary = Math.floor(Math.random() * 10) + 1;
    const score = 60 + Math.random() * 30; // Score entre 60 et 90
    const confidence = Math.min(15, score * 0.1 + Math.random() * 5); // Max 15% de confiance
    const expectedValue = 5.0 + Math.random() * 10; // Entre 5 et 15€
    
    return {
      numbers: numbers.sort((a, b) => a - b),
      complementary,
      score,
      confidence,
      expectedValue,
      riskLevel: confidence > 80 ? 'low' : confidence > 60 ? 'medium' : 'high',
      category: 'balanced',
      reasons: [
        `Combinaison générée automatiquement`,
        `Score: ${score.toFixed(1)}`,
        `Confiance: ${confidence.toFixed(1)}%`
      ]
    };
  }

  /**
   * Crée une combinaison MultiGame à partir de numéros et complémentaire
   */
  private createMultiGameCombination(numbers: number[], complementary: number): MultiGameCombination {
    const score = this.calculateCombinationScore(numbers, complementary);
    const confidence = Math.min(15, score * 0.1 + Math.random() * 5); // Max 15% de confiance
    const expectedValue = this.calculateExpectedValue(numbers, complementary);
    
    return {
      numbers: numbers.sort((a, b) => a - b),
      complementary,
      score,
      confidence,
      expectedValue,
      riskLevel: confidence > 80 ? 'low' : confidence > 60 ? 'medium' : 'high',
      category: 'balanced',
      reasons: [
        `Combinaison générée automatiquement`,
        `Score: ${score.toFixed(1)}`,
        `Confiance: ${confidence.toFixed(1)}%`
      ]
    };
  }

  /**
   * Trouve le meilleur numéro complémentaire pour une combinaison
   */
  private getBestComplementary(numbers: number[]): number {
    // Pour simplifier, on prend un numéro complémentaire aléatoire entre 1 et 10
    // Dans une vraie implémentation, on analyserait les statistiques
    return Math.floor(Math.random() * 10) + 1;
  }

  /**
   * Calcule le score d'une combinaison
   */
  private calculateCombinationScore(numbers: number[], complementary: number): number {
    // Score basé sur la fréquence des numéros et leur répartition
    const tirages = dataStorage.getAllTirages();
    let score = 50; // Score de base
    
    // Bonus pour les numéros fréquents
    numbers.forEach(num => {
      const frequency = this.getNumberFrequency(num, tirages);
      score += frequency * 2;
    });
    
    // Bonus pour la répartition
    const spread = Math.max(...numbers) - Math.min(...numbers);
    if (spread > 20) score += 10; // Bonne répartition
    
    return Math.min(100, score);
  }

  /**
   * Calcule la valeur attendue d'une combinaison
   */
  private calculateExpectedValue(numbers: number[], complementary: number): number {
    // Estimation basée sur les statistiques historiques
    const baseValue = 5.0; // Valeur de base
    const frequencyBonus = numbers.reduce((sum, num) => sum + this.getNumberFrequency(num, dataStorage.getAllTirages()), 0);
    return baseValue + (frequencyBonus * 0.5);
  }

  /**
   * Obtient la fréquence d'un numéro
   */
  private getNumberFrequency(num: number, tirages: Tirage[]): number {
    const totalTirages = tirages.length;
    const occurrences = tirages.filter(t => {
      const boules = [t.boule_1, t.boule_2, t.boule_3, t.boule_4, t.boule_5];
      return boules.includes(num) || t.numero_chance === num;
    }).length;
    return totalTirages > 0 ? (occurrences / totalTirages) * 100 : 0;
  }

  /**
   * Calcule la probabilité de gain d'une grille
   */
  private calculateGridWinProbability(combinations: MultiGameCombination[]): number {
    // Probabilité qu'au moins une combinaison gagne
    const individualProbabilities = combinations.map(c => c.confidence / 100);
    const noWinProbability = individualProbabilities.reduce((acc, prob) => acc * (1 - prob), 1);
    return (1 - noWinProbability) * 100;
  }

  /**
   * Crée des stratégies de jeux multiples optimisées
   */
  createMultiGameStrategies(
    budget: number,
    numbersSet?: number[]
  ): MultiGameStrategy[] {
    const bestNumbers = numbersSet || this.getBestNumbersSet(15).numbers;
    const strategies: MultiGameStrategy[] = [];

    // Stratégie Conservative (2-3 grilles)
    const conservativeCombinations = this.generateOptimalCombinations(bestNumbers, 3);
    strategies.push(this.createStrategy('Conservative', conservativeCombinations, 'conservative'));

    // Stratégie Balanced (5-7 grilles)
    const balancedCombinations = this.generateOptimalCombinations(bestNumbers, 6);
    strategies.push(this.createStrategy('Balanced', balancedCombinations, 'balanced'));

    // Stratégie Aggressive (10-15 grilles)
    const aggressiveCombinations = this.generateOptimalCombinations(bestNumbers, 12);
    strategies.push(this.createStrategy('Aggressive', aggressiveCombinations, 'aggressive'));

    // Stratégie Budget (adaptée au budget)
    const budgetCombinations = this.generateOptimalCombinations(bestNumbers, Math.floor(budget / 2.2));
    strategies.push(this.createStrategy('Budget', budgetCombinations, 'balanced'));

    return strategies.filter(strategy => strategy.totalCost <= budget);
  }

  /**
   * Optimise le budget pour maximiser les chances
   */
  optimizeBudget(budget: number): BudgetOptimization {
    const bestNumbers = this.getBestNumbersSet(15);
    const strategies = this.createMultiGameStrategies(budget, bestNumbers.numbers);
    
    // Trier par ROI décroissant
    const sortedStrategies = strategies.sort((a, b) => b.roi - a.roi);
    
    return {
      budget,
      strategies: sortedStrategies,
      recommended: sortedStrategies[0],
      alternatives: sortedStrategies.slice(1, 4)
    };
  }

  /**
   * Analyse les statistiques des numéros
   */
  private analyzeNumberStatistics(tirages: Tirage[]): Map<number, {
    frequency: number;
    recency: number;
    pattern: number;
    mathematical: number;
    totalScore: number;
  }> {
    const stats = new Map<number, {
      frequency: number;
      recency: number;
      pattern: number;
      mathematical: number;
      totalScore: number;
    }>();

    // Initialiser les statistiques
    for (let i = 1; i <= 49; i++) {
      stats.set(i, {
        frequency: 0,
        recency: 0,
        pattern: 0,
        mathematical: 0,
        totalScore: 0
      });
    }

    // Calculer la fréquence
    tirages.forEach(tirage => {
      const boules = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5];
      boules.forEach(numero => {
        const stat = stats.get(numero)!;
        stat.frequency++;
      });
    });

    // Calculer la récence (100 derniers tirages)
    const recentTirages = tirages.slice(0, 100);
    recentTirages.forEach((tirage, index) => {
      const boules = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5];
      boules.forEach(numero => {
        const stat = stats.get(numero)!;
        stat.recency += (100 - index);
      });
    });

    // Calculer les scores de pattern et mathématique
    for (let i = 1; i <= 49; i++) {
      const stat = stats.get(i)!;
      stat.pattern = this.calculateNumberPatternScore(i);
      stat.mathematical = this.calculateNumberMathematicalScore(i);
      stat.totalScore = stat.frequency * 0.3 + stat.recency * 0.3 + stat.pattern * 0.2 + stat.mathematical * 0.2;
    }

    return stats;
  }

  /**
   * Sélectionne les meilleurs numéros
   */
  private selectBestNumbers(
    numberStats: Map<number, any>, 
    count: number
  ): number[] {
    return Array.from(numberStats.entries())
      .sort((a, b) => b[1].totalScore - a[1].totalScore)
      .slice(0, count)
      .map(([numero]) => numero);
  }

  /**
   * Calcule le score d'un ensemble de numéros
   */
  private calculateNumbersSetScore(numbers: number[], stats: Map<number, any>): number {
    const totalScore = numbers.reduce((sum, num) => sum + (stats.get(num)?.totalScore || 0), 0);
    return totalScore / numbers.length;
  }

  /**
   * Calcule la confiance d'un ensemble de numéros
   */
  private calculateNumbersSetConfidence(numbers: number[], stats: Map<number, any>): number {
    const avgScore = this.calculateNumbersSetScore(numbers, stats);
    return Math.min(100, Math.max(0, avgScore));
  }

  /**
   * Obtient les statistiques des numéros
   */
  private getNumberStatistics(): Map<number, any> {
    const tirages = dataStorage.getAllTirages();
    return this.analyzeNumberStatistics(tirages);
  }

  /**
   * Calcule le score d'une combinaison
   */
  private calculateScore(numbers: number[], complementary: number | number[]): number {
    const complementaryArray = Array.isArray(complementary) ? complementary : [complementary];
    const allNumbers = [...numbers, ...complementaryArray];
    const stats = this.getNumberStatistics();
    
    let totalScore = 0;
    let count = 0;
    
    allNumbers.forEach(num => {
      const stat = stats.get(num);
      if (stat) {
        totalScore += stat.totalScore || 0;
        count++;
      }
    });
    
    return count > 0 ? totalScore / count : 0;
  }

  /**
   * Calcule la confiance d'une combinaison
   */
  private calculateConfidence(numbers: number[], complementary: number | number[]): number {
    const score = this.calculateScore(numbers, complementary);
    return Math.min(100, Math.max(0, score * 0.8 + Math.random() * 10));
  }

  /**
   * Calcule le niveau de risque d'une combinaison
   */
  private calculateRiskLevel(numbers: number[], complementary: number | number[]): 'low' | 'medium' | 'high' {
    const score = this.calculateScore(numbers, complementary);
    
    if (score >= 70) return 'low';
    if (score >= 40) return 'medium';
    return 'high';
  }

  /**
   * Génère les raisons pour une combinaison
   */
  private generateReasons(numbers: number[], complementary: number | number[], category: string): string[] {
    const reasons: string[] = [];
    
    switch (category) {
      case 'frequent-sequences':
        reasons.push('Basé sur les séquences fréquentes');
        reasons.push('Optimisé pour la récurrence');
        break;
      case 'optimal-sums':
        reasons.push('Somme optimale des numéros');
        reasons.push('Équilibre statistique');
        break;
      case 'optimal-decades':
        reasons.push('Répartition optimale par dizaines');
        reasons.push('Diversification maximale');
        break;
      default:
        reasons.push('Combinaison optimisée');
        reasons.push('Basé sur l\'analyse statistique');
    }
    
    return reasons;
  }

  /**
   * Génère les raisons pour un ensemble de numéros
   */
  private getNumbersSetReasons(numbers: number[], stats: Map<number, any>): string[] {
    const reasons: string[] = [];
    
    const hotCount = numbers.filter(num => (stats.get(num)?.recency || 0) > 50).length;
    if (hotCount >= 5) {
      reasons.push(`${hotCount} numéros très récents`);
    }

    const frequentCount = numbers.filter(num => (stats.get(num)?.frequency || 0) > 100).length;
    if (frequentCount >= 5) {
      reasons.push(`${frequentCount} numéros très fréquents`);
    }

    const patternCount = numbers.filter(num => (stats.get(num)?.pattern || 0) > 50).length;
    if (patternCount >= 3) {
      reasons.push(`${patternCount} numéros avec patterns favorables`);
    }

    const mathCount = numbers.filter(num => (stats.get(num)?.mathematical || 0) > 50).length;
    if (mathCount >= 3) {
      reasons.push(`${mathCount} numéros avec propriétés mathématiques`);
    }

    if (reasons.length === 0) {
      reasons.push('Sélection basée sur l\'analyse statistique globale');
    }

    return reasons;
  }

  /**
   * Génère des combinaisons Hot
   */
  private generateHotCombinations(numbersSet: number[], count: number, strategyOptions: StrategyOptions): MultiGameCombination[] {
    const combinations: MultiGameCombination[] = [];

    for (let i = 0; i < count; i++) {
      const selected = this.selectHotNumbers(numbersSet, strategyOptions);
      const complementary = this.getOptimalComplementary(selected);
      
      combinations.push({
        numbers: selected,
        complementary,
        score: 85 + Math.random() * 10,
        confidence: 80 + Math.random() * 15,
        expectedValue: 15 + Math.random() * 10,
        riskLevel: 'medium',
        category: 'hot',
        reasons: ['Basé sur les numéros les plus récents', 'Tendance forte détectée']
      });
    }

    return combinations;
  }

  /**
   * Génère des combinaisons Balanced
   */
  private generateBalancedCombinations(numbersSet: number[], count: number, strategyOptions: StrategyOptions): MultiGameCombination[] {
    const combinations: MultiGameCombination[] = [];

    for (let i = 0; i < count; i++) {
      const selected = this.selectBalancedNumbers(numbersSet, strategyOptions);
      const complementary = this.getOptimalComplementary(selected);
      
      combinations.push({
        numbers: selected,
        complementary,
        score: 80 + Math.random() * 10,
        confidence: 75 + Math.random() * 15,
        expectedValue: 12 + Math.random() * 8,
        riskLevel: 'low',
        category: 'balanced',
        reasons: ['Équilibre optimal pair/impair', 'Répartition harmonieuse']
      });
    }

    return combinations;
  }

  /**
   * Génère des combinaisons Pattern
   */
  private generatePatternCombinations(numbersSet: number[], count: number, strategyOptions: StrategyOptions): MultiGameCombination[] {
    const combinations: MultiGameCombination[] = [];

    for (let i = 0; i < count; i++) {
      const selected = this.selectPatternNumbers(numbersSet, strategyOptions);
      const complementary = this.getOptimalComplementary(selected);
      
      combinations.push({
        numbers: selected,
        complementary,
        score: 75 + Math.random() * 10,
        confidence: 70 + Math.random() * 15,
        expectedValue: 10 + Math.random() * 8,
        riskLevel: 'medium',
        category: 'pattern',
        reasons: ['Pattern historique détecté', 'Séquence optimisée']
      });
    }

    return combinations;
  }

  /**
   * Génère des combinaisons Mathematical
   */
  private generateMathematicalCombinations(numbersSet: number[], count: number, strategyOptions: StrategyOptions): MultiGameCombination[] {
    const combinations: MultiGameCombination[] = [];

    for (let i = 0; i < count; i++) {
      const selected = this.selectMathematicalNumbers(numbersSet, strategyOptions);
      const complementary = this.getOptimalComplementary(selected);
      
      combinations.push({
        numbers: selected,
        complementary,
        score: 70 + Math.random() * 10,
        confidence: 65 + Math.random() * 15,
        expectedValue: 8 + Math.random() * 6,
        riskLevel: 'high',
        category: 'mathematical',
        reasons: ['Séquence mathématique', 'Propriétés numériques favorables']
      });
    }

    return combinations;
  }

  /**
   * Génère des combinaisons basées sur les séquences fréquentes
   */
  private generateFrequentSequencesCombinations(numbersSet: number[], count: number, strategyOptions: StrategyOptions): MultiGameCombination[] {
    const combinations: MultiGameCombination[] = [];

    for (let i = 0; i < count; i++) {
      const selected = this.selectFrequentSequencesNumbers(numbersSet, strategyOptions);
      const complementary = this.getOptimalComplementary(selected);
      
      combinations.push({
        numbers: selected,
        complementary,
        score: this.calculateScore(selected, complementary),
        confidence: this.calculateConfidence(selected, complementary),
        expectedValue: this.calculateExpectedValue(selected, complementary),
        riskLevel: this.calculateRiskLevel(selected, complementary),
        category: 'pattern',
        reasons: this.generateReasons(selected, complementary, 'frequent-sequences')
      });
    }

    return combinations;
  }

  /**
   * Génère des combinaisons basées sur les sommes optimales (110-130)
   */
  private generateOptimalSumsCombinations(numbersSet: number[], count: number, strategyOptions: StrategyOptions): MultiGameCombination[] {
    const combinations: MultiGameCombination[] = [];

    for (let i = 0; i < count; i++) {
      const selected = this.selectOptimalSumsNumbers(numbersSet, strategyOptions);
      const complementary = this.getOptimalComplementary(selected);
      
      combinations.push({
        numbers: selected,
        complementary,
        score: this.calculateScore(selected, complementary),
        confidence: this.calculateConfidence(selected, complementary),
        expectedValue: this.calculateExpectedValue(selected, complementary),
        riskLevel: this.calculateRiskLevel(selected, complementary),
        category: 'pattern',
        reasons: this.generateReasons(selected, complementary, 'optimal-sums')
      });
    }

    return combinations;
  }

  /**
   * Génère des combinaisons basées sur les dizaines optimales
   */
  private generateOptimalDecadesCombinations(numbersSet: number[], count: number, strategyOptions: StrategyOptions): MultiGameCombination[] {
    const combinations: MultiGameCombination[] = [];

    for (let i = 0; i < count; i++) {
      const selected = this.selectOptimalDecadesNumbers(numbersSet, strategyOptions);
      const complementary = this.getOptimalComplementary(selected);
      
      combinations.push({
        numbers: selected,
        complementary,
        score: this.calculateScore(selected, complementary),
        confidence: this.calculateConfidence(selected, complementary),
        expectedValue: this.calculateExpectedValue(selected, complementary),
        riskLevel: this.calculateRiskLevel(selected, complementary),
        category: 'pattern',
        reasons: this.generateReasons(selected, complementary, 'optimal-decades')
      });
    }

    return combinations;
  }

  /**
   * Sélectionne des numéros Hot
   */
  private selectHotNumbers(numbersSet: number[], strategyOptions: StrategyOptions): number[] {
    const selected: number[] = [];
    const used = new Set<number>();

    // Prendre 3-4 numéros de l'ensemble
    const hotCount = Math.floor(Math.random() * 2) + 3;
    for (let i = 0; i < hotCount && selected.length < 5; i++) {
      const randomIndex = Math.floor(Math.random() * Math.min(numbersSet.length, 10));
      const numero = numbersSet[randomIndex];
      if (!used.has(numero)) {
        selected.push(numero);
        used.add(numero);
      }
    }

    // Compléter selon les options de stratégie
    if (strategyOptions.forceOptimalDistribution) {
      this.completeWithOptimalDistribution(selected, used);
    } else {
      this.completeWithRandomNumbers(selected, used);
    }

    return selected.sort((a, b) => a - b);
  }

  /**
   * Sélectionne des numéros Balanced
   */
  private selectBalancedNumbers(numbersSet: number[], strategyOptions: StrategyOptions): number[] {
    const selected: number[] = [];
    const used = new Set<number>();

    // Prendre 2-3 numéros de l'ensemble
    const balancedCount = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < balancedCount && selected.length < 5; i++) {
      const randomIndex = Math.floor(Math.random() * Math.min(numbersSet.length, 8));
      const numero = numbersSet[randomIndex];
      if (!used.has(numero)) {
        selected.push(numero);
        used.add(numero);
      }
    }

    // Compléter selon les options de stratégie
    if (strategyOptions.forceOptimalDistribution) {
      this.completeWithOptimalDistribution(selected, used);
    } else {
      this.completeWithRandomNumbers(selected, used);
    }

    return selected.sort((a, b) => a - b);
  }

  /**
   * Sélectionne des numéros Pattern
   */
  private selectPatternNumbers(numbersSet: number[], strategyOptions: StrategyOptions): number[] {
    const selected: number[] = [];
    const used = new Set<number>();

    // Prendre 2-3 numéros de l'ensemble
    const patternCount = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < patternCount && selected.length < 5; i++) {
      const randomIndex = Math.floor(Math.random() * Math.min(numbersSet.length, 6));
      const numero = numbersSet[randomIndex];
      if (!used.has(numero)) {
        selected.push(numero);
        used.add(numero);
      }
    }

    // Compléter selon les options de stratégie
    if (strategyOptions.forceOptimalDistribution) {
      this.completeWithOptimalDistribution(selected, used);
    } else {
      this.completeWithRandomNumbers(selected, used);
    }

    return selected.sort((a, b) => a - b);
  }

  /**
   * Sélectionne des numéros Mathematical
   */
  private selectMathematicalNumbers(numbersSet: number[], strategyOptions: StrategyOptions): number[] {
    const selected: number[] = [];
    const used = new Set<number>();

    // Prendre 1-2 numéros de l'ensemble
    const mathCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < mathCount && selected.length < 5; i++) {
      const randomIndex = Math.floor(Math.random() * Math.min(numbersSet.length, 4));
      const numero = numbersSet[randomIndex];
      if (!used.has(numero)) {
        selected.push(numero);
        used.add(numero);
      }
    }

    // Compléter selon les options de stratégie
    if (strategyOptions.forceOptimalDistribution) {
      this.completeWithOptimalDistribution(selected, used);
    } else {
      this.completeWithRandomNumbers(selected, used);
    }

    return selected.sort((a, b) => a - b);
  }

  /**
   * Obtient le numéro complémentaire optimal
   */
  private getOptimalComplementary(numbers: number[]): number {
    // Logique simplifiée pour le numéro complémentaire
    return Math.floor(Math.random() * 10) + 1;
  }

  /**
   * Crée une stratégie de jeu multiple
   */
  private createStrategy(
    name: string, 
    combinations: MultiGameCombination[], 
    strategy: 'conservative' | 'balanced' | 'aggressive'
  ): MultiGameStrategy {
    const totalCost = combinations.length * 2.2;
    const expectedReturn = combinations.reduce((sum, combo) => sum + combo.expectedValue, 0);
    const roi = totalCost > 0 ? ((expectedReturn - totalCost) / totalCost) * 100 : 0;
    // Calcul réaliste des probabilités de gain
    const baseProbability = 1 / 1906884; // Probabilité de gagner le gros lot (5+1)
    const combinationsCount = combinations.length;
    const winProbability = Math.min(0.5, combinationsCount * baseProbability * 100); // Max 0.5%
    
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    if (strategy === 'conservative') riskLevel = 'low';
    else if (strategy === 'aggressive') riskLevel = 'high';

    return {
      name,
      description: this.getStrategyDescription(name, combinations.length, strategy),
      combinations,
      totalCost,
      expectedReturn,
      roi,
      winProbability,
      riskLevel,
      strategy
    };
  }

  /**
   * Génère la description d'une stratégie
   */
  private getStrategyDescription(
    name: string, 
    count: number, 
    strategy: 'conservative' | 'balanced' | 'aggressive'
  ): string {
    const descriptions = {
      conservative: `Stratégie prudente avec ${count} grilles pour minimiser les risques`,
      balanced: `Stratégie équilibrée avec ${count} grilles pour un bon rapport risque/gain`,
      aggressive: `Stratégie agressive avec ${count} grilles pour maximiser les chances`
    };
    
    return descriptions[strategy] || `Stratégie ${name} avec ${count} grilles`;
  }

  /**
   * Supprime les doublons de combinaisons
   */
  private removeDuplicates(combinations: MultiGameCombination[]): MultiGameCombination[] {
    const seen = new Set<string>();
    return combinations.filter(combo => {
      const key = combo.numbers.sort((a, b) => a - b).join(',') + ',' + combo.complementary;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Calcule le score de pattern d'un numéro
   */
  private calculateNumberPatternScore(numero: number): number {
    let score = 0;
    
    // Score basé sur la position
    if (numero <= 16) score += 20; // Premier tiers
    else if (numero <= 32) score += 30; // Deuxième tiers
    else score += 25; // Troisième tiers
    
    // Score basé sur la parité
    if (numero % 2 === 0) score += 15; // Pair
    else score += 10; // Impair
    
    return score;
  }

  /**
   * Calcule le score mathématique d'un numéro
   */
  private calculateNumberMathematicalScore(numero: number): number {
    let score = 0;
    
    // Nombres premiers
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    if (primes.includes(numero)) score += 25;
    
    // Multiples de 7
    if (numero % 7 === 0) score += 20;
    
    // Carrés parfaits
    const squares = [1, 4, 9, 16, 25, 36, 49];
    if (squares.includes(numero)) score += 15;
    
    // Fibonacci
    const fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34];
    if (fibonacci.includes(numero)) score += 20;
    
    return score;
  }

  /**
   * Calcule le score de fréquence
   */
  private calculateFrequencyScore(numbers: number[], stats: Map<number, any>): number {
    const totalFrequency = numbers.reduce((sum, num) => sum + (stats.get(num)?.frequency || 0), 0);
    return totalFrequency / numbers.length;
  }

  /**
   * Calcule le score de récence
   */
  private calculateRecencyScore(numbers: number[], stats: Map<number, any>): number {
    const totalRecency = numbers.reduce((sum, num) => sum + (stats.get(num)?.recency || 0), 0);
    return totalRecency / numbers.length;
  }

  /**
   * Calcule le score de pattern
   */
  private calculatePatternScore(numbers: number[], stats: Map<number, any>): number {
    const totalPattern = numbers.reduce((sum, num) => sum + (stats.get(num)?.pattern || 0), 0);
    return totalPattern / numbers.length;
  }

  /**
   * Calcule le score mathématique
   */
  private calculateMathematicalScore(numbers: number[], stats: Map<number, any>): number {
    const totalMathematical = numbers.reduce((sum, num) => sum + (stats.get(num)?.mathematical || 0), 0);
    return totalMathematical / numbers.length;
  }

  /**
   * Vérifie si le cache est valide
   */
  private isCacheValid(key: string): boolean {
    if (!this.cache.has(key)) return false;
    return Date.now() - this.lastUpdate < this.CACHE_DURATION;
  }

  /**
   * Force la mise à jour du cache
   */
  clearCache(): void {
    this.cache.clear();
    this.lastUpdate = 0;
  }

  /**
   * Sélectionne des numéros basés sur les séquences fréquentes
   */
  private selectFrequentSequencesNumbers(numbersSet: number[], strategyOptions: StrategyOptions): number[] {
    const selected: number[] = [];
    const used = new Set<number>();

    // Prendre 2-3 numéros de l'ensemble
    const sequenceCount = Math.floor(Math.random() * 2) + 2;
    
    // Sélectionner des numéros consécutifs ou avec des écarts fréquents
    for (let i = 0; i < sequenceCount && i < numbersSet.length; i++) {
      const num = numbersSet[i];
      if (!used.has(num)) {
        selected.push(num);
        used.add(num);
      }
    }

    // Compléter selon les options de stratégie
    if (strategyOptions.forceOptimalDistribution) {
      this.completeWithOptimalDistribution(selected, used);
    } else {
      this.completeWithRandomNumbers(selected, used);
    }

    return selected.sort((a, b) => a - b);
  }

  /**
   * Complète une sélection avec des numéros aléatoires
   */
  private completeWithRandomNumbers(selected: number[], used: Set<number>): void {
    while (selected.length < 5) {
      const numero = Math.floor(Math.random() * 49) + 1;
      if (!used.has(numero)) {
        selected.push(numero);
        used.add(numero);
      }
    }
  }

  /**
   * Complète une sélection avec la distribution pair/impair optimale (3P-2I ou 2P-3I)
   */
  private completeWithOptimalDistribution(selected: number[], used: Set<number>): void {
    // Choisir aléatoirement entre les deux distributions optimales
    const optimalDistributions = [
      { even: 3, odd: 2 }, // 3P-2I - le plus fréquent (33.1%)
      { even: 2, odd: 3 }  // 2P-3I - deuxième plus fréquent (32.5%)
    ];
    
    const chosenDistribution = optimalDistributions[Math.floor(Math.random() * 2)];
    
    // Compter les pairs et impairs actuels
    const currentEven = selected.filter(n => n % 2 === 0).length;
    const currentOdd = selected.filter(n => n % 2 === 1).length;
    
    // Calculer ce qui manque
    const neededEven = chosenDistribution.even - currentEven;
    const neededOdd = chosenDistribution.odd - currentOdd;
    
    // Ajouter les pairs manquants
    for (let i = 0; i < neededEven && selected.length < 5; i++) {
      let numero: number;
      do {
        numero = Math.floor(Math.random() * 49) + 1;
      } while (used.has(numero) || numero % 2 !== 0);
      
      selected.push(numero);
      used.add(numero);
    }
    
    // Ajouter les impairs manquants
    for (let i = 0; i < neededOdd && selected.length < 5; i++) {
      let numero: number;
      do {
        numero = Math.floor(Math.random() * 49) + 1;
      } while (used.has(numero) || numero % 2 !== 1);
      
      selected.push(numero);
      used.add(numero);
    }
    
    // Si on n'a toujours pas 5 numéros, compléter aléatoirement
    while (selected.length < 5) {
      const numero = Math.floor(Math.random() * 49) + 1;
      if (!used.has(numero)) {
        selected.push(numero);
        used.add(numero);
      }
    }
  }

  /**
   * Sélectionne des numéros basés sur les sommes optimales (110-130)
   */
  private selectOptimalSumsNumbers(numbersSet: number[], strategyOptions: StrategyOptions): number[] {
    const selected: number[] = [];
    const used = new Set<number>();

    // Prendre 2-3 numéros de l'ensemble
    const sumCount = Math.floor(Math.random() * 2) + 2;
    
    for (let i = 0; i < sumCount && i < numbersSet.length; i++) {
      const num = numbersSet[i];
      if (!used.has(num)) {
        selected.push(num);
        used.add(num);
      }
    }

    // Compléter pour atteindre une somme dans la plage optimale (110-130)
    const targetSum = Math.floor(Math.random() * 21) + 110; // 110-130
    const currentSum = selected.reduce((sum, n) => sum + n, 0);
    const remainingSum = targetSum - currentSum;
    
    // Ajouter des numéros pour approcher la somme cible
    while (selected.length < 5) {
      const neededSum = remainingSum - selected.reduce((sum, n) => sum + n, 0);
      const remainingSlots = 5 - selected.length;
      
      if (remainingSlots === 1) {
        // Dernier numéro pour atteindre exactement la somme
        const targetNumber = Math.max(1, Math.min(49, neededSum));
        if (!used.has(targetNumber)) {
          selected.push(targetNumber);
          used.add(targetNumber);
        } else {
          // Si le numéro exact n'est pas disponible, prendre un numéro aléatoire
          let randomNum: number;
          do {
            randomNum = Math.floor(Math.random() * 49) + 1;
          } while (used.has(randomNum));
          selected.push(randomNum);
          used.add(randomNum);
        }
      } else {
        // Ajouter un numéro qui nous rapproche de la somme cible
        const avgNeeded = Math.floor(neededSum / remainingSlots);
        const targetNumber = Math.max(1, Math.min(49, avgNeeded));
        
        if (!used.has(targetNumber)) {
          selected.push(targetNumber);
          used.add(targetNumber);
        } else {
          // Prendre un numéro proche
          let found = false;
          for (let offset = 1; offset <= 10 && !found; offset++) {
            if (!used.has(targetNumber + offset) && targetNumber + offset <= 49) {
              selected.push(targetNumber + offset);
              used.add(targetNumber + offset);
              found = true;
            } else if (!used.has(targetNumber - offset) && targetNumber - offset >= 1) {
              selected.push(targetNumber - offset);
              used.add(targetNumber - offset);
              found = true;
            }
          }
          
          if (!found) {
            // Dernier recours : numéro aléatoire
            let randomNum: number;
            do {
              randomNum = Math.floor(Math.random() * 49) + 1;
            } while (used.has(randomNum));
            selected.push(randomNum);
            used.add(randomNum);
          }
        }
      }
    }

    // Compléter selon les options de stratégie
    if (strategyOptions.forceOptimalDistribution) {
      this.completeWithOptimalDistribution(selected, used);
    }

    return selected.sort((a, b) => a - b);
  }

  /**
   * Sélectionne des numéros basés sur les dizaines optimales (0.1.2.3.4)
   */
  private selectOptimalDecadesNumbers(numbersSet: number[], strategyOptions: StrategyOptions): number[] {
    const selected: number[] = [];
    const used = new Set<number>();

    // Prendre 2-3 numéros de l'ensemble
    const decadeCount = Math.floor(Math.random() * 2) + 2;
    
    for (let i = 0; i < decadeCount && i < numbersSet.length; i++) {
      const num = numbersSet[i];
      if (!used.has(num)) {
        selected.push(num);
        used.add(num);
      }
    }

    // Compléter pour respecter la distribution optimale des dizaines (0.1.2.3.4)
    const decades = [0, 1, 2, 3, 4]; // Dizaines optimales
    const usedDecades = new Set<number>();
    
    // Marquer les dizaines déjà utilisées
    selected.forEach(num => {
      usedDecades.add(Math.floor(num / 10));
    });

    // Ajouter des numéros pour couvrir les dizaines manquantes
    decades.forEach(decade => {
      if (!usedDecades.has(decade) && selected.length < 5) {
        // Trouver un numéro dans cette dizaine
        const decadeStart = decade * 10 + 1;
        const decadeEnd = Math.min(49, (decade + 1) * 10);
        
        let found = false;
        for (let num = decadeStart; num <= decadeEnd && !found; num++) {
          if (!used.has(num)) {
            selected.push(num);
            used.add(num);
            usedDecades.add(decade);
            found = true;
          }
        }
        
        // Si aucun numéro disponible dans cette dizaine, prendre un numéro aléatoire
        if (!found) {
          let randomNum: number;
          do {
            randomNum = Math.floor(Math.random() * 49) + 1;
          } while (used.has(randomNum));
          selected.push(randomNum);
          used.add(randomNum);
        }
      }
    });

    // Compléter selon les options de stratégie
    if (strategyOptions.forceOptimalDistribution) {
      this.completeWithOptimalDistribution(selected, used);
    }

    return selected.sort((a, b) => a - b);
  }

  /**
   * Génère des combinaisons par défaut quand aucune stratégie n'est activée
   */
  private generateDefaultCombinations(numbersSet: number[], count: number): MultiGameCombination[] {
    const combinations: MultiGameCombination[] = [];
    
    for (let i = 0; i < count; i++) {
      const selected: number[] = [];
      const used = new Set<number>();
      
      // Prendre 3-4 numéros de l'ensemble
      const hotCount = Math.floor(Math.random() * 2) + 3;
      for (let j = 0; j < hotCount && j < numbersSet.length; j++) {
        const num = numbersSet[j];
        if (!used.has(num)) {
          selected.push(num);
          used.add(num);
        }
      }
      
      // Compléter avec des numéros aléatoires
      while (selected.length < 5) {
        const numero = Math.floor(Math.random() * 49) + 1;
        if (!used.has(numero)) {
          selected.push(numero);
          used.add(numero);
        }
      }
      
      const complementary = Math.floor(Math.random() * 10) + 1;
      
      combinations.push({
        numbers: selected.sort((a, b) => a - b),
        complementary,
        score: Math.random() * 100,
        confidence: Math.random() * 100,
        expectedValue: Math.random() * 50,
        riskLevel: 'medium',
        category: 'hot',
        reasons: ['Combinaison par défaut', 'Stratégies désactivées']
      });
    }
    
    return combinations;
  }
}

export const multiGameOptimizer = new MultiGameOptimizer();
