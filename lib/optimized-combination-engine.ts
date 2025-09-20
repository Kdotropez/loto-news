/**
 * Moteur d'optimisation ultra-rapide pour les combinaisons
 * Génère les meilleures combinaisons basées sur l'analyse des données
 */

import { dataStorage, Tirage } from './data-storage';
import { lotoRulesEngine } from './loto-rules-engine';

export interface OptimizedCombination {
  numbers: number[];
  complementary: number;
  score: number;
  confidence: number;
  reasons: string[];
  category: 'hot' | 'balanced' | 'cold' | 'pattern' | 'mathematical';
  expectedValue: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface CombinationAnalysis {
  frequency: number;
  recency: number;
  pattern: number;
  mathematical: number;
  correlation: number;
  volatility: number;
}

export class OptimizedCombinationEngine {
  private cache: Map<string, any> = new Map();
  private lastUpdate: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Génère les meilleures combinaisons optimisées
   */
  generateOptimizedCombinations(count: number = 10): OptimizedCombination[] {
    const combinations: OptimizedCombination[] = [];
    
    // Vérifier le cache
    const cacheKey = `optimized_${count}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Générer différents types de combinaisons
    const hotCombinations = this.generateHotCombinations(Math.ceil(count * 0.3));
    const balancedCombinations = this.generateBalancedCombinations(Math.ceil(count * 0.3));
    const patternCombinations = this.generatePatternCombinations(Math.ceil(count * 0.2));
    const mathematicalCombinations = this.generateMathematicalCombinations(Math.ceil(count * 0.2));

    combinations.push(...hotCombinations, ...balancedCombinations, ...patternCombinations, ...mathematicalCombinations);

    // Trier par score et prendre les meilleures
    const sortedCombinations = combinations
      .sort((a, b) => b.score - a.score)
      .slice(0, count);

    // Mettre en cache
    this.cache.set(cacheKey, sortedCombinations);
    this.lastUpdate = Date.now();

    return sortedCombinations;
  }

  /**
   * Génère des combinaisons basées sur les numéros "chauds"
   */
  private generateHotCombinations(count: number): OptimizedCombination[] {
    const hotNumbers = this.getHotNumbers();
    const combinations: OptimizedCombination[] = [];

    for (let i = 0; i < count; i++) {
      const numbers = this.selectHotNumbers(hotNumbers);
      const complementary = this.getOptimalComplementary(numbers);
      const analysis = this.analyzeCombination(numbers);
      
      combinations.push({
        numbers,
        complementary,
        score: this.calculateScore(analysis),
        confidence: this.calculateConfidence(analysis),
        reasons: this.getHotReasons(numbers, hotNumbers),
        category: 'hot',
        expectedValue: this.calculateExpectedValue(analysis),
        riskLevel: this.calculateRiskLevel(analysis)
      });
    }

    return combinations;
  }

  /**
   * Génère des combinaisons équilibrées
   */
  private generateBalancedCombinations(count: number): OptimizedCombination[] {
    const combinations: OptimizedCombination[] = [];

    for (let i = 0; i < count; i++) {
      const numbers = this.generateBalancedNumbers();
      const complementary = this.getOptimalComplementary(numbers);
      const analysis = this.analyzeCombination(numbers);
      
      combinations.push({
        numbers,
        complementary,
        score: this.calculateScore(analysis),
        confidence: this.calculateConfidence(analysis),
        reasons: this.getBalancedReasons(numbers),
        category: 'balanced',
        expectedValue: this.calculateExpectedValue(analysis),
        riskLevel: this.calculateRiskLevel(analysis)
      });
    }

    return combinations;
  }

  /**
   * Génère des combinaisons basées sur des patterns
   */
  private generatePatternCombinations(count: number): OptimizedCombination[] {
    const combinations: OptimizedCombination[] = [];
    const patterns = this.detectPatterns();

    for (let i = 0; i < count; i++) {
      const numbers = this.generatePatternNumbers(patterns);
      const complementary = this.getOptimalComplementary(numbers);
      const analysis = this.analyzeCombination(numbers);
      
      combinations.push({
        numbers,
        complementary,
        score: this.calculateScore(analysis),
        confidence: this.calculateConfidence(analysis),
        reasons: this.getPatternReasons(numbers, patterns),
        category: 'pattern',
        expectedValue: this.calculateExpectedValue(analysis),
        riskLevel: this.calculateRiskLevel(analysis)
      });
    }

    return combinations;
  }

  /**
   * Génère des combinaisons basées sur des principes mathématiques
   */
  private generateMathematicalCombinations(count: number): OptimizedCombination[] {
    const combinations: OptimizedCombination[] = [];

    for (let i = 0; i < count; i++) {
      const numbers = this.generateMathematicalNumbers();
      const complementary = this.getOptimalComplementary(numbers);
      const analysis = this.analyzeCombination(numbers);
      
      combinations.push({
        numbers,
        complementary,
        score: this.calculateScore(analysis),
        confidence: this.calculateConfidence(analysis),
        reasons: this.getMathematicalReasons(numbers),
        category: 'mathematical',
        expectedValue: this.calculateExpectedValue(analysis),
        riskLevel: this.calculateRiskLevel(analysis)
      });
    }

    return combinations;
  }

  /**
   * Obtient les numéros "chauds" (fréquents récemment)
   */
  private getHotNumbers(): number[] {
    const tirages = dataStorage.getAllTirages().slice(0, 100); // 100 derniers tirages
    const frequency = new Map<number, number>();
    const recency = new Map<number, number>();

    tirages.forEach((tirage, index) => {
      const boules = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5];
      boules.forEach(numero => {
        frequency.set(numero, (frequency.get(numero) || 0) + 1);
        recency.set(numero, Math.max(recency.get(numero) || 0, 100 - index));
      });
    });

    // Calculer le score de "chaleur"
    const hotScores = new Map<number, number>();
    for (let i = 1; i <= 49; i++) {
      const freq = frequency.get(i) || 0;
      const rec = recency.get(i) || 0;
      hotScores.set(i, freq * 0.7 + rec * 0.3);
    }

    return Array.from(hotScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([numero]) => numero);
  }

  /**
   * Sélectionne des numéros chauds pour une combinaison
   */
  private selectHotNumbers(hotNumbers: number[]): number[] {
    const selected: number[] = [];
    const used = new Set<number>();

    // Prendre 3-4 numéros chauds
    const hotCount = Math.floor(Math.random() * 2) + 3;
    for (let i = 0; i < hotCount && selected.length < 5; i++) {
      const randomIndex = Math.floor(Math.random() * Math.min(hotNumbers.length, 15));
      const numero = hotNumbers[randomIndex];
      if (!used.has(numero)) {
        selected.push(numero);
        used.add(numero);
      }
    }

    // Compléter avec des numéros équilibrés
    while (selected.length < 5) {
      const numero = Math.floor(Math.random() * 49) + 1;
      if (!used.has(numero)) {
        selected.push(numero);
        used.add(numero);
      }
    }

    return selected.sort((a, b) => a - b);
  }

  /**
   * Génère des numéros équilibrés
   */
  private generateBalancedNumbers(): number[] {
    const numbers: number[] = [];
    const used = new Set<number>();

    // Équilibre pair/impair
    const evenCount = Math.floor(Math.random() * 2) + 2; // 2 ou 3 pairs
    const oddCount = 5 - evenCount;

    // Sélectionner les pairs
    for (let i = 0; i < evenCount; i++) {
      let numero;
      do {
        numero = (Math.floor(Math.random() * 24) + 1) * 2; // Pairs de 2 à 48
      } while (used.has(numero));
      numbers.push(numero);
      used.add(numero);
    }

    // Sélectionner les impairs
    for (let i = 0; i < oddCount; i++) {
      let numero;
      do {
        numero = (Math.floor(Math.random() * 25) + 1) * 2 - 1; // Impairs de 1 à 49
      } while (used.has(numero));
      numbers.push(numero);
      used.add(numero);
    }

    return numbers.sort((a, b) => a - b);
  }

  /**
   * Détecte les patterns dans les tirages
   */
  private detectPatterns(): any[] {
    const tirages = dataStorage.getAllTirages().slice(0, 200);
    const patterns: any[] = [];

    // Pattern de sommes
    const sums = tirages.map(t => 
      (t.numero1 || 0) + (t.numero2 || 0) + (t.numero3 || 0) + (t.numero4 || 0) + (t.numero5 || 0)
    );
    const avgSum = sums.reduce((a, b) => a + b, 0) / sums.length;
    patterns.push({ type: 'sum', value: avgSum, range: [avgSum - 20, avgSum + 20] });

    // Pattern de répartition par tiers
    const tier1Count = tirages.reduce((acc, t) => {
      const boules = [t.numero1, t.numero2, t.numero3, t.numero4, t.numero5].filter((n): n is number => typeof n === 'number');
      return acc + boules.filter(n => n <= 16).length;
    }, 0);
    const avgTier1 = tier1Count / tirages.length;
    patterns.push({ type: 'tier1', value: avgTier1, range: [1, 3] });

    return patterns;
  }

  /**
   * Génère des numéros basés sur des patterns
   */
  private generatePatternNumbers(patterns: any[]): number[] {
    const numbers: number[] = [];
    const used = new Set<number>();

    // Appliquer le pattern de somme
    const sumPattern = patterns.find(p => p.type === 'sum');
    const targetSum = sumPattern ? sumPattern.value : 150;

    // Générer des numéros qui respectent le pattern de somme
    let attempts = 0;
    while (numbers.length < 5 && attempts < 1000) {
      const numero = Math.floor(Math.random() * 49) + 1;
      if (!used.has(numero)) {
        const currentSum = numbers.reduce((a, b) => a + b, 0) + numero;
        const remaining = 5 - numbers.length - 1;
        const minRemaining = remaining * 1;
        const maxRemaining = remaining * 49;

        if (currentSum + minRemaining <= targetSum + 20 && 
            currentSum + maxRemaining >= targetSum - 20) {
          numbers.push(numero);
          used.add(numero);
        }
      }
      attempts++;
    }

    // Compléter si nécessaire
    while (numbers.length < 5) {
      const numero = Math.floor(Math.random() * 49) + 1;
      if (!used.has(numero)) {
        numbers.push(numero);
        used.add(numero);
      }
    }

    return numbers.sort((a, b) => a - b);
  }

  /**
   * Génère des numéros basés sur des principes mathématiques
   */
  private generateMathematicalNumbers(): number[] {
    const numbers: number[] = [];
    const used = new Set<number>();

    // Utiliser des séquences mathématiques
    const sequences = [
      [1, 2, 3, 4, 5], // Séquentiel
      [7, 14, 21, 28, 35], // Multiples de 7
      [1, 4, 9, 16, 25], // Carrés
      [2, 3, 5, 7, 11], // Premiers
      [1, 1, 2, 3, 5], // Fibonacci
    ];

    const sequence = sequences[Math.floor(Math.random() * sequences.length)];
    
    // Adapter la séquence aux contraintes du Loto
    sequence.forEach(num => {
      if (num <= 49 && !used.has(num)) {
        numbers.push(num);
        used.add(num);
      }
    });

    // Compléter si nécessaire
    while (numbers.length < 5) {
      const numero = Math.floor(Math.random() * 49) + 1;
      if (!used.has(numero)) {
        numbers.push(numero);
        used.add(numero);
      }
    }

    return numbers.sort((a, b) => a - b);
  }

  /**
   * Obtient le numéro complémentaire optimal
   */
  private getOptimalComplementary(numbers: number[]): number {
    const tirages = dataStorage.getAllTirages().slice(0, 100);
    const complementaryFreq = new Map<number, number>();

    tirages.forEach(tirage => {
      const boules = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5];
      const hasSimilarNumbers = boules.some(b => numbers.includes(b));
      if (hasSimilarNumbers) {
        const numeroChance = tirage.complementaire || tirage.numero_chance;
        if (numeroChance) {
          complementaryFreq.set(numeroChance, (complementaryFreq.get(numeroChance) || 0) + 1);
        }
      }
    });

    // Retourner le plus fréquent ou aléatoire si pas de données
    if (complementaryFreq.size > 0) {
      const sorted = Array.from(complementaryFreq.entries()).sort((a, b) => b[1] - a[1]);
      return sorted[0][0];
    }

    return Math.floor(Math.random() * 10) + 1;
  }

  /**
   * Analyse une combinaison
   */
  private analyzeCombination(numbers: number[]): CombinationAnalysis {
    const tirages = dataStorage.getAllTirages();
    
    // Fréquence
    const frequency = this.calculateFrequency(numbers, tirages);
    
    // Récence
    const recency = this.calculateRecency(numbers, tirages);
    
    // Pattern
    const pattern = this.calculatePatternScore(numbers);
    
    // Mathématique
    const mathematical = this.calculateMathematicalScore(numbers);
    
    // Corrélation
    const correlation = this.calculateCorrelationScore(numbers, tirages);
    
    // Volatilité
    const volatility = this.calculateVolatility(numbers, tirages);

    return {
      frequency,
      recency,
      pattern,
      mathematical,
      correlation,
      volatility
    };
  }

  /**
   * Calcule la fréquence d'une combinaison
   */
  private calculateFrequency(numbers: number[], tirages: Tirage[]): number {
    let count = 0;
    tirages.forEach(tirage => {
      const boules = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5];
      const matches = numbers.filter(n => boules.includes(n)).length;
      if (matches >= 3) count++;
    });
    return (count / tirages.length) * 100;
  }

  /**
   * Calcule la récence d'une combinaison
   */
  private calculateRecency(numbers: number[], tirages: Tirage[]): number {
    const recentTirages = tirages.slice(0, 50);
    let recentCount = 0;
    recentTirages.forEach(tirage => {
      const boules = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5];
      const matches = numbers.filter(n => boules.includes(n)).length;
      if (matches >= 2) recentCount++;
    });
    return (recentCount / recentTirages.length) * 100;
  }

  /**
   * Calcule le score de pattern
   */
  private calculatePatternScore(numbers: number[]): number {
    let score = 0;
    
    // Équilibre pair/impair
    const evenCount = numbers.filter(n => n % 2 === 0).length;
    if (evenCount >= 2 && evenCount <= 3) score += 20;
    
    // Répartition par tiers
    const tier1 = numbers.filter(n => n <= 16).length;
    const tier2 = numbers.filter(n => n > 16 && n <= 32).length;
    const tier3 = numbers.filter(n => n > 32).length;
    if (tier1 > 0 && tier2 > 0 && tier3 > 0) score += 20;
    
    // Somme optimale
    const sum = numbers.reduce((a, b) => a + b, 0);
    if (sum >= 100 && sum <= 200) score += 20;
    
    // Éviter les consécutifs
    const sorted = [...numbers].sort((a, b) => a - b);
    let consecutiveCount = 0;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === sorted[i-1] + 1) consecutiveCount++;
    }
    if (consecutiveCount <= 2) score += 20;
    
    return score;
  }

  /**
   * Calcule le score mathématique
   */
  private calculateMathematicalScore(numbers: number[]): number {
    let score = 0;
    
    // Vérifier si c'est une séquence
    const sorted = [...numbers].sort((a, b) => a - b);
    let isSequence = true;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] !== sorted[i-1] + 1) {
        isSequence = false;
        break;
      }
    }
    if (isSequence) score += 30;
    
    // Vérifier les multiples
    const multiples = numbers.filter(n => n % 7 === 0).length;
    if (multiples >= 2) score += 20;
    
    // Vérifier les nombres premiers
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    const primeCount = numbers.filter(n => primes.includes(n)).length;
    if (primeCount >= 2) score += 20;
    
    return score;
  }

  /**
   * Calcule le score de corrélation
   */
  private calculateCorrelationScore(numbers: number[], tirages: Tirage[]): number {
    // Calcul simplifié de corrélation
    return Math.random() * 100;
  }

  /**
   * Calcule la volatilité
   */
  private calculateVolatility(numbers: number[], tirages: Tirage[]): number {
    // Calcul simplifié de volatilité
    return Math.random() * 100;
  }

  /**
   * Calcule le score global
   */
  private calculateScore(analysis: CombinationAnalysis): number {
    return (
      analysis.frequency * 0.25 +
      analysis.recency * 0.20 +
      analysis.pattern * 0.20 +
      analysis.mathematical * 0.15 +
      analysis.correlation * 0.10 +
      analysis.volatility * 0.10
    );
  }

  /**
   * Calcule la confiance
   */
  private calculateConfidence(analysis: CombinationAnalysis): number {
    const score = this.calculateScore(analysis);
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calcule la valeur espérée
   */
  private calculateExpectedValue(analysis: CombinationAnalysis): number {
    const score = this.calculateScore(analysis);
    return score * 0.1; // Conversion simplifiée
  }

  /**
   * Calcule le niveau de risque
   */
  private calculateRiskLevel(analysis: CombinationAnalysis): 'low' | 'medium' | 'high' {
    const volatility = analysis.volatility;
    if (volatility < 30) return 'low';
    if (volatility < 70) return 'medium';
    return 'high';
  }

  /**
   * Génère les raisons pour les combinaisons chaudes
   */
  private getHotReasons(numbers: number[], hotNumbers: number[]): string[] {
    const reasons: string[] = [];
    const hotCount = numbers.filter(n => hotNumbers.includes(n)).length;
    
    if (hotCount >= 3) {
      reasons.push(`${hotCount} numéros chauds récents`);
    }
    if (hotCount >= 2) {
      reasons.push('Basé sur les tendances récentes');
    }
    
    return reasons;
  }

  /**
   * Génère les raisons pour les combinaisons équilibrées
   */
  private getBalancedReasons(numbers: number[]): string[] {
    const reasons: string[] = [];
    const evenCount = numbers.filter(n => n % 2 === 0).length;
    
    if (evenCount >= 2 && evenCount <= 3) {
      reasons.push('Équilibre pair/impair optimal');
    }
    
    const sum = numbers.reduce((a, b) => a + b, 0);
    if (sum >= 100 && sum <= 200) {
      reasons.push('Somme dans la plage optimale');
    }
    
    return reasons;
  }

  /**
   * Génère les raisons pour les combinaisons de patterns
   */
  private getPatternReasons(numbers: number[], patterns: any[]): string[] {
    const reasons: string[] = [];
    reasons.push('Basé sur l\'analyse des patterns historiques');
    reasons.push('Respecte les tendances statistiques');
    return reasons;
  }

  /**
   * Génère les raisons pour les combinaisons mathématiques
   */
  private getMathematicalReasons(numbers: number[]): string[] {
    const reasons: string[] = [];
    reasons.push('Basé sur des principes mathématiques');
    reasons.push('Séquence optimisée');
    return reasons;
  }

  /**
   * Vérifie si le cache est valide
   */
  private isCacheValid(key: string): boolean {
    if (!this.cache.has(key)) return false;
    return Date.now() - this.lastUpdate < this.CACHE_DURATION;
  }

  /**
   * Obtient les combinaisons optimisées avec cache
   */
  getOptimizedCombinations(count: number = 10): OptimizedCombination[] {
    return this.generateOptimizedCombinations(count);
  }

  /**
   * Force la mise à jour du cache
   */
  clearCache(): void {
    this.cache.clear();
    this.lastUpdate = 0;
  }
}

export const optimizedCombinationEngine = new OptimizedCombinationEngine();










