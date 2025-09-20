import { OptimizationStrategy } from '../types/optimization';

export interface StrategyCombination {
  id: string;
  strategies: OptimizationStrategy[];
  name: string;
  description: string;
  combination: {
    mainNumbers: number[];
    complementaryNumber: number;
  };
  testResults?: {
    totalGains: number;
    wins: number;
    totalTests: number;
    winRate: number;
    roi: number;
    averageGain: number;
    categories: Record<string, number>;
  };
}

export class StrategyCombinationEngine {
  private allCombinations: StrategyCombination[] = [];
  private testedCombinations: Map<string, StrategyCombination> = new Map();

  constructor(private strategies: OptimizationStrategy[]) {}

  /**
   * Génère toutes les combinaisons possibles de stratégies
   */
  generateAllStrategyCombinations(): StrategyCombination[] {
    const combinations: StrategyCombination[] = [];
    
    // Génère toutes les combinaisons de 1 à 5 stratégies
    for (let r = 1; r <= Math.min(5, this.strategies.length); r++) {
      const strategyCombinations = this.getCombinations(this.strategies, r);
      
      strategyCombinations.forEach((strategyGroup, index) => {
        const combination = this.createStrategyCombination(strategyGroup, r, index);
        combinations.push(combination);
      });
    }

    this.allCombinations = combinations;
    return combinations;
  }

  /**
   * Génère les combinaisons C(n,r) d'un tableau
   */
  private getCombinations<T>(arr: T[], r: number): T[][] {
    if (r === 1) return arr.map(item => [item]);
    if (r === arr.length) return [arr];
    
    const combinations: T[][] = [];
    
    for (let i = 0; i <= arr.length - r; i++) {
      const head = arr[i];
      const tailCombinations = this.getCombinations(arr.slice(i + 1), r - 1);
      
      tailCombinations.forEach(tail => {
        combinations.push([head, ...tail]);
      });
    }
    
    return combinations;
  }

  /**
   * Crée une combinaison de stratégies avec des numéros générés
   * FORCE la distribution pair/impair optimale (3P-2I ou 2P-3I)
   */
  private createStrategyCombination(
    strategies: OptimizationStrategy[], 
    groupSize: number, 
    index: number
  ): StrategyCombination {
    const id = `combo_${groupSize}_${index}_${strategies.map(s => s.id).join('_')}`;
    const name = this.generateCombinationName(strategies);
    const description = this.generateCombinationDescription(strategies);
    
    // Génère une combinaison de numéros basée sur les stratégies
    // avec contrainte pair/impair optimale
    const combination = this.generateNumbersFromStrategiesWithConstraint(strategies);

    return {
      id,
      strategies,
      name,
      description,
      combination
    };
  }

  /**
   * Génère un nom pour la combinaison de stratégies
   */
  private generateCombinationName(strategies: OptimizationStrategy[]): string {
    if (strategies.length === 1) {
      return strategies[0].name;
    }
    
    const strategyNames = strategies.map(s => s.name);
    
    // Noms spéciaux pour certaines combinaisons
    const specialNames: Record<string, string> = {
      'hot-cold-hybrid,correlations': 'Hot-Cold Corrélé',
      'astrological,numerology': 'Astro-Numérologie',
      'quantum,neural-network': 'IA Quantique',
      'chaos-theory,fibonacci': 'Chaos Fibonacci',
      'mathematical-patterns,golden-ratio': 'Mathématiques d\'Or',
      'temporal-patterns,lunar-cycles': 'Cycles Temporels Lunaires',
      'volatility-optimized,anti-correlations': 'Anti-Volatilité',
      'geometric,string-theory': 'Géométrie des Cordes',
      'consciousness,collective-unconscious': 'Conscience Collective',
      'big-bang,parallel-universes': 'Multivers Originel'
    };

    const key = strategies.map(s => s.id).sort().join(',');
    if (specialNames[key]) {
      return specialNames[key];
    }

    // Nom générique basé sur les stratégies
    if (strategies.length === 2) {
      return `${strategyNames[0]} + ${strategyNames[1]}`;
    } else if (strategies.length === 3) {
      return `${strategyNames[0]} + ${strategyNames[1]} + ${strategyNames[2]}`;
    } else {
      return `${strategyNames[0]} + ${strategyNames.slice(1).join(', ')}`;
    }
  }

  /**
   * Génère une description pour la combinaison
   */
  private generateCombinationDescription(strategies: OptimizationStrategy[]): string {
    const descriptions = strategies.map(s => s.description);
    
    if (strategies.length === 1) {
      return descriptions[0];
    }
    
    return `Combinaison de ${strategies.length} stratégies : ${descriptions.join(' | ')}`;
  }

  /**
   * Génère des numéros basés sur les stratégies sélectionnées
   */
  private generateNumbersFromStrategies(strategies: OptimizationStrategy[]): {
    mainNumbers: number[];
    complementaryNumber: number;
  } {
    const mainNumbers: number[] = [];
    const usedNumbers = new Set<number>();

    // Génère 5 numéros principaux basés sur les stratégies
    strategies.forEach((strategy, index) => {
      const numbers = this.getNumbersForStrategy(strategy, index);
      
      numbers.forEach(num => {
        if (mainNumbers.length < 5 && !usedNumbers.has(num)) {
          mainNumbers.push(num);
          usedNumbers.add(num);
        }
      });
    });

    // Complète avec des numéros aléatoires si nécessaire
    while (mainNumbers.length < 5) {
      const randomNum = Math.floor(Math.random() * 49) + 1;
      if (!usedNumbers.has(randomNum)) {
        mainNumbers.push(randomNum);
        usedNumbers.add(randomNum);
      }
    }

    // Génère le numéro complémentaire
    let complementaryNumber: number;
    do {
      complementaryNumber = Math.floor(Math.random() * 10) + 1;
    } while (usedNumbers.has(complementaryNumber));

    return {
      mainNumbers: mainNumbers.sort((a, b) => a - b),
      complementaryNumber
    };
  }

  /**
   * Génère des numéros basés sur les stratégies avec contrainte pair/impair optimale
   * FORCE les distributions 3P-2I (33.1%) ou 2P-3I (32.5%)
   */
  private generateNumbersFromStrategiesWithConstraint(strategies: OptimizationStrategy[]): {
    mainNumbers: number[];
    complementaryNumber: number;
  } {
    // Choisir aléatoirement entre les deux distributions optimales
    const optimalDistributions = [
      { even: 3, odd: 2 }, // 3P-2I - le plus fréquent (33.1%)
      { even: 2, odd: 3 }  // 2P-3I - deuxième plus fréquent (32.5%)
    ];
    
    const chosenDistribution = optimalDistributions[Math.floor(Math.random() * 2)];
    
    const mainNumbers: number[] = [];
    const usedNumbers = new Set<number>();
    const evenNumbers: number[] = [];
    const oddNumbers: number[] = [];

    // Génère d'abord tous les numéros possibles basés sur les stratégies
    strategies.forEach((strategy, index) => {
      const numbers = this.getNumbersForStrategy(strategy, index);
      
      numbers.forEach(num => {
        if (!usedNumbers.has(num)) {
          usedNumbers.add(num);
          
          // Séparer pairs et impairs
          if (num % 2 === 0) {
            evenNumbers.push(num);
          } else {
            oddNumbers.push(num);
          }
        }
      });
    });
    
    // Complète avec des numéros aléatoires si nécessaire
    while (evenNumbers.length + oddNumbers.length < 10) {
      const randomNum = Math.floor(Math.random() * 49) + 1;
      if (!usedNumbers.has(randomNum)) {
        usedNumbers.add(randomNum);
        
        if (randomNum % 2 === 0) {
          evenNumbers.push(randomNum);
        } else {
          oddNumbers.push(randomNum);
        }
      }
    }
    
    // Sélectionner selon la distribution optimale
    const finalNumbers: number[] = [];
    
    // Ajouter les pairs nécessaires
    for (let i = 0; i < chosenDistribution.even && i < evenNumbers.length; i++) {
      finalNumbers.push(evenNumbers[i]);
    }
    
    // Ajouter les impairs nécessaires
    for (let i = 0; i < chosenDistribution.odd && i < oddNumbers.length; i++) {
      finalNumbers.push(oddNumbers[i]);
    }
    
    // Si on n'a pas assez de numéros, compléter avec des numéros aléatoires
    while (finalNumbers.length < 5) {
      let number: number;
      do {
        number = Math.floor(Math.random() * 49) + 1;
      } while (finalNumbers.includes(number));
      
      // Vérifier si on peut l'ajouter selon la distribution
      const currentEven = finalNumbers.filter(n => n % 2 === 0).length;
      const currentOdd = finalNumbers.filter(n => n % 2 === 1).length;
      
      if (number % 2 === 0 && currentEven < chosenDistribution.even) {
        finalNumbers.push(number);
      } else if (number % 2 === 1 && currentOdd < chosenDistribution.odd) {
        finalNumbers.push(number);
      }
    }
    
    // Génère le numéro complémentaire
    let complementaryNumber: number;
    do {
      complementaryNumber = Math.floor(Math.random() * 10) + 1;
    } while (usedNumbers.has(complementaryNumber));
    
    return {
      mainNumbers: finalNumbers.slice(0, 5).sort((a, b) => a - b),
      complementaryNumber
    };
  }

  /**
   * Retourne des numéros spécifiques pour chaque stratégie
   */
  private getNumbersForStrategy(strategy: OptimizationStrategy, index: number): number[] {
    const strategyNumbers: Record<string, number[]> = {
      'hot-cold-hybrid': [7, 14, 21, 28, 35],
      'correlations': [3, 12, 18, 27, 33],
      'anti-correlations': [5, 15, 25, 35, 45],
      'temporal-patterns': [2, 8, 16, 24, 32],
      'mathematical-patterns': [1, 4, 9, 16, 25],
      'volatility-optimized': [6, 13, 20, 29, 36],
      'astrological': [1, 7, 13, 19, 25],
      'numerology': [3, 6, 9, 12, 15],
      'geometric': [1, 2, 3, 5, 8],
      'chaos-theory': [11, 22, 33, 44, 1],
      'quantum': [2, 4, 8, 16, 32],
      'neural-network': [5, 10, 15, 20, 25],
      'weather-patterns': [4, 8, 12, 16, 20],
      'economic-indicators': [7, 14, 21, 28, 35],
      'social-media': [1, 11, 21, 31, 41],
      'sports-events': [9, 18, 27, 36, 45],
      'news-sentiment': [6, 12, 18, 24, 30],
      'lunar-cycles': [1, 8, 15, 22, 29],
      'prime-numbers': [2, 3, 5, 7, 11],
      'fibonacci': [1, 1, 2, 3, 5],
      'golden-ratio': [1, 2, 3, 5, 8],
      'binary-patterns': [1, 2, 4, 8, 16],
      'color-theory': [1, 3, 5, 7, 9],
      'music-harmony': [2, 4, 6, 8, 10],
      'feng-shui': [1, 5, 9, 13, 17],
      'tarot-cards': [1, 7, 13, 19, 25],
      'chakra-balance': [1, 2, 3, 4, 5],
      'crystal-healing': [3, 6, 9, 12, 15],
      'aromatherapy': [4, 8, 12, 16, 20],
      'biorhythms': [7, 14, 21, 28, 35],
      'dream-analysis': [1, 11, 21, 31, 41],
      'synchronicity': [11, 22, 33, 44, 1],
      'collective-unconscious': [1, 7, 13, 19, 25],
      'string-theory': [2, 4, 8, 16, 32],
      'dark-matter': [13, 26, 39, 1, 14],
      'time-dilation': [1, 2, 4, 8, 16],
      'parallel-universes': [3, 6, 12, 24, 48],
      'wormholes': [5, 10, 20, 40, 1],
      'black-holes': [7, 14, 28, 1, 15],
      'big-bang': [1, 1, 2, 3, 5],
      'consciousness': [1, 2, 3, 4, 5]
    };

    return strategyNumbers[strategy.id] || [
      Math.floor(Math.random() * 49) + 1,
      Math.floor(Math.random() * 49) + 1,
      Math.floor(Math.random() * 49) + 1
    ];
  }

  /**
   * Sauvegarde les résultats de test pour une combinaison
   */
  saveTestResults(combinationId: string, results: any): void {
    const combination = this.allCombinations.find(c => c.id === combinationId);
    if (combination) {
      combination.testResults = results;
      this.testedCombinations.set(combinationId, combination);
    }
  }

  /**
   * Récupère toutes les combinaisons générées
   */
  getAllCombinations(): StrategyCombination[] {
    return this.allCombinations;
  }

  /**
   * Récupère les combinaisons testées
   */
  getTestedCombinations(): StrategyCombination[] {
    return Array.from(this.testedCombinations.values());
  }

  /**
   * Récupère les meilleures combinaisons par ROI
   */
  getBestCombinations(limit: number = 10): StrategyCombination[] {
    return this.getTestedCombinations()
      .filter(c => c.testResults)
      .sort((a, b) => (b.testResults?.roi || 0) - (a.testResults?.roi || 0))
      .slice(0, limit);
  }

  /**
   * Récupère les statistiques globales
   */
  getGlobalStats(): {
    totalCombinations: number;
    testedCombinations: number;
    averageROI: number;
    bestROI: number;
    worstROI: number;
    totalGains: number;
  } {
    const tested = this.getTestedCombinations().filter(c => c.testResults);
    
    if (tested.length === 0) {
      return {
        totalCombinations: this.allCombinations.length,
        testedCombinations: 0,
        averageROI: 0,
        bestROI: 0,
        worstROI: 0,
        totalGains: 0
      };
    }

    const rois = tested.map(c => c.testResults!.roi);
    const totalGains = tested.reduce((sum, c) => sum + (c.testResults!.totalGains || 0), 0);

    return {
      totalCombinations: this.allCombinations.length,
      testedCombinations: tested.length,
      averageROI: rois.reduce((sum, roi) => sum + roi, 0) / rois.length,
      bestROI: Math.max(...rois),
      worstROI: Math.min(...rois),
      totalGains
    };
  }
}
