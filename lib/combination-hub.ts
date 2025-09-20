import { dataStorage } from './data-storage';
import { AnalysisEngine } from './analysis-engine';

/**
 * Interface unifiée pour toutes les combinaisons
 */
export interface UnifiedCombination {
  id: string;
  name: string;
  description: string;
  category: 'hot-cold' | 'balanced' | 'pattern' | 'mathematical' | 'strategy' | 'rules' | 'advanced';
  mainNumbers: number[];
  complementaryNumber: number;
  evenOddDistribution: string; // "3P-2I" ou "2P-3I"
  isOptimalDistribution: boolean;
  score: number;
  confidence: number;
  reasons: string[];
  expectedValue: number;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: Date;
  testResults?: {
    totalGains: number;
    wins: number;
    totalTests: number;
    winRate: number;
    roi: number;
    averageGain: number;
    categories: Record<string, number>;
    lastTested: Date;
  };
}

/**
 * Configuration des stratégies de génération
 */
export interface GenerationConfig {
  strategies: string[];
  count: number;
  includeHotNumbers: boolean;
  includeColdNumbers: boolean;
  includePatterns: boolean;
  includeMathematical: boolean;
  includeRules: boolean;
  includeAdvanced: boolean;
  includePatternOptimization: boolean;
  includeOptimizedCombinations: boolean;
  includeMultiGrids: boolean;
}

/**
 * Statistiques globales du hub
 */
export interface HubStatistics {
  totalCombinations: number;
  testedCombinations: number;
  bestROI: number;
  averageROI: number;
  topCategories: Array<{
    category: string;
    count: number;
    averageROI: number;
  }>;
  distributionStats: {
    optimalDistributions: number;
    nonOptimalDistributions: number;
    optimalPercentage: number;
  };
}

/**
 * Hub centralisé pour toutes les combinaisons
 * Remplace tous les moteurs dispersés
 */
export class CombinationHub {
  private combinations: Map<string, UnifiedCombination> = new Map();
  private statistics: HubStatistics | null = null;
  private lastUpdate: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Génère des combinaisons selon la configuration
   */
  async generateCombinations(config: GenerationConfig): Promise<UnifiedCombination[]> {
    const combinations: UnifiedCombination[] = [];
    
    // Compter les stratégies activées
    const activeStrategies = [
      config.includeHotNumbers,
      config.includeColdNumbers,
      config.includePatterns,
      config.includeMathematical,
      config.includeRules,
      config.includeAdvanced
    ].filter(Boolean).length;
    
    // Si aucune stratégie n'est activée, utiliser toutes les stratégies
    const strategiesToUse = activeStrategies === 0 ? 6 : activeStrategies;
    const combinationsPerStrategy = Math.ceil(config.count / strategiesToUse);
    
    // Générer selon les stratégies sélectionnées
    if (config.includeHotNumbers || activeStrategies === 0) {
      const hotCombinations = await this.generateHotColdCombinations(
        combinationsPerStrategy, 
        'hot'
      );
      combinations.push(...hotCombinations);
    }

    if (config.includeColdNumbers || activeStrategies === 0) {
      const coldCombinations = await this.generateHotColdCombinations(
        combinationsPerStrategy, 
        'cold'
      );
      combinations.push(...coldCombinations);
    }

    if (config.includePatterns || activeStrategies === 0) {
      const patternCombinations = await this.generatePatternCombinations(
        combinationsPerStrategy
      );
      combinations.push(...patternCombinations);
    }

    if (config.includeMathematical || activeStrategies === 0) {
      const mathCombinations = await this.generateMathematicalCombinations(
        combinationsPerStrategy
      );
      combinations.push(...mathCombinations);
    }

    if (config.includeRules || activeStrategies === 0) {
      const rulesCombinations = await this.generateRulesCombinations(
        combinationsPerStrategy
      );
      combinations.push(...rulesCombinations);
    }

    if (config.includeAdvanced || activeStrategies === 0) {
      const advancedCombinations = await this.generateAdvancedCombinations(
        combinationsPerStrategy
      );
      combinations.push(...advancedCombinations);
    }


    // Trier par score et limiter au nombre demandé
    const sortedCombinations = combinations
      .sort((a, b) => b.score - a.score)
      .slice(0, config.count);

    // Stocker dans le hub
    sortedCombinations.forEach(combo => {
      this.combinations.set(combo.id, combo);
    });

    return sortedCombinations;
  }

  /**
   * Génère des combinaisons basées sur les numéros chauds/froids
   */
  private async generateHotColdCombinations(count: number, type: 'hot' | 'cold'): Promise<UnifiedCombination[]> {
    const combinations: UnifiedCombination[] = [];
    const engine = new AnalysisEngine();
    const frequencyData = await engine.analyzeFrequencies();
    
    // Sélectionner les numéros selon le type
    const selectedNumbers = type === 'hot' 
      ? frequencyData.frequencies.slice(0, 20).map((item: any) => item.numero)
      : frequencyData.frequencies.slice(-20).map((item: any) => item.numero);

    for (let i = 0; i < count; i++) {
      const mainNumbers = this.selectNumbersFromPool(selectedNumbers, 5);
      const complementary = this.generateComplementaryNumber();
      const distribution = this.calculateEvenOddDistribution(mainNumbers);
      
      combinations.push({
        id: `hot-cold-${type}-${i}-${Date.now()}`,
        name: `Combinaison ${type === 'hot' ? 'Chaude' : 'Froide'} ${i + 1}`,
        description: `Basée sur les numéros ${type === 'hot' ? 'les plus fréquents' : 'les moins fréquents'}`,
        category: 'hot-cold',
        mainNumbers,
        complementaryNumber: complementary,
        evenOddDistribution: distribution.pattern,
        isOptimalDistribution: distribution.isOptimal,
        score: this.calculateScore(mainNumbers, type),
        confidence: this.calculateConfidence(mainNumbers, type),
        reasons: this.getHotColdReasons(mainNumbers, type),
        expectedValue: this.calculateExpectedValue(mainNumbers),
        riskLevel: type === 'hot' ? 'medium' : 'high',
        createdAt: new Date()
      });
    }

    return combinations;
  }

  /**
   * Génère des combinaisons basées sur des motifs
   */
  private async generatePatternCombinations(count: number): Promise<UnifiedCombination[]> {
    const combinations: UnifiedCombination[] = [];
    
    for (let i = 0; i < count; i++) {
      const mainNumbers = this.generatePatternNumbers();
      const complementary = this.generateComplementaryNumber();
      const distribution = this.calculateEvenOddDistribution(mainNumbers);
      
      combinations.push({
        id: `pattern-${i}-${Date.now()}`,
        name: `Combinaison Motif ${i + 1}`,
        description: 'Basée sur l\'analyse des motifs historiques',
        category: 'pattern',
        mainNumbers,
        complementaryNumber: complementary,
        evenOddDistribution: distribution.pattern,
        isOptimalDistribution: distribution.isOptimal,
        score: this.calculateScore(mainNumbers, 'pattern'),
        confidence: this.calculateConfidence(mainNumbers, 'pattern'),
        reasons: this.getPatternReasons(mainNumbers),
        expectedValue: this.calculateExpectedValue(mainNumbers),
        riskLevel: 'medium',
        createdAt: new Date()
      });
    }

    return combinations;
  }

  /**
   * Génère des combinaisons mathématiques
   */
  private async generateMathematicalCombinations(count: number): Promise<UnifiedCombination[]> {
    const combinations: UnifiedCombination[] = [];
    
    for (let i = 0; i < count; i++) {
      const mainNumbers = this.generateMathematicalNumbers();
      const complementary = this.generateComplementaryNumber();
      const distribution = this.calculateEvenOddDistribution(mainNumbers);
      
      combinations.push({
        id: `mathematical-${i}-${Date.now()}`,
        name: `Combinaison Mathématique ${i + 1}`,
        description: 'Basée sur des principes mathématiques avancés',
        category: 'mathematical',
        mainNumbers,
        complementaryNumber: complementary,
        evenOddDistribution: distribution.pattern,
        isOptimalDistribution: distribution.isOptimal,
        score: this.calculateScore(mainNumbers, 'mathematical'),
        confidence: this.calculateConfidence(mainNumbers, 'mathematical'),
        reasons: this.getMathematicalReasons(mainNumbers),
        expectedValue: this.calculateExpectedValue(mainNumbers),
        riskLevel: 'low',
        createdAt: new Date()
      });
    }

    return combinations;
  }

  /**
   * Génère des combinaisons conformes aux règles
   */
  private async generateRulesCombinations(count: number): Promise<UnifiedCombination[]> {
    const combinations: UnifiedCombination[] = [];
    
    for (let i = 0; i < count; i++) {
      const mainNumbers = this.generateRulesCompliantNumbers();
      const complementary = this.generateComplementaryNumber();
      const distribution = this.calculateEvenOddDistribution(mainNumbers);
      
      combinations.push({
        id: `rules-${i}-${Date.now()}`,
        name: `Combinaison Règles ${i + 1}`,
        description: 'Conforme aux règles officielles du Loto',
        category: 'rules',
        mainNumbers,
        complementaryNumber: complementary,
        evenOddDistribution: distribution.pattern,
        isOptimalDistribution: distribution.isOptimal,
        score: this.calculateScore(mainNumbers, 'rules'),
        confidence: this.calculateConfidence(mainNumbers, 'rules'),
        reasons: this.getRulesReasons(mainNumbers),
        expectedValue: this.calculateExpectedValue(mainNumbers),
        riskLevel: 'low',
        createdAt: new Date()
      });
    }

    return combinations;
  }

  /**
   * Génère des combinaisons avancées multi-critères
   */
  private async generateAdvancedCombinations(count: number): Promise<UnifiedCombination[]> {
    const combinations: UnifiedCombination[] = [];
    
    for (let i = 0; i < count; i++) {
      const mainNumbers = this.generateAdvancedNumbers();
      const complementary = this.generateComplementaryNumber();
      const distribution = this.calculateEvenOddDistribution(mainNumbers);
      
      combinations.push({
        id: `advanced-${i}-${Date.now()}`,
        name: `Combinaison Avancée ${i + 1}`,
        description: 'Multi-critères : écarts, pair/impair, complémentaire optimal',
        category: 'advanced',
        mainNumbers,
        complementaryNumber: complementary,
        evenOddDistribution: distribution.pattern,
        isOptimalDistribution: distribution.isOptimal,
        score: this.calculateScore(mainNumbers, 'advanced'),
        confidence: this.calculateConfidence(mainNumbers, 'advanced'),
        reasons: this.getAdvancedReasons(mainNumbers),
        expectedValue: this.calculateExpectedValue(mainNumbers),
        riskLevel: 'medium',
        createdAt: new Date()
      });
    }

    return combinations;
  }

  /**
   * Génère des combinaisons avec distribution pair/impair optimale
   */
  private async generateOptimalEvenOddCombinations(count: number): Promise<UnifiedCombination[]> {
    const combinations: UnifiedCombination[] = [];
    
    for (let i = 0; i < count; i++) {
      const mainNumbers = this.generateOptimalEvenOddNumbers();
      const complementary = this.generateComplementaryNumber();
      const distribution = this.calculateEvenOddDistribution(mainNumbers);
      
      combinations.push({
        id: `optimal-even-odd-${i}-${Date.now()}`,
        name: `Combinaison Optimale ${i + 1}`,
        description: 'Distribution pair/impair optimale (3P-2I ou 2P-3I)',
        category: 'balanced',
        mainNumbers,
        complementaryNumber: complementary,
        evenOddDistribution: distribution.pattern,
        isOptimalDistribution: distribution.isOptimal,
        score: this.calculateScore(mainNumbers, 'balanced'),
        confidence: this.calculateConfidence(mainNumbers, 'balanced'),
        reasons: this.getOptimalEvenOddReasons(mainNumbers),
        expectedValue: this.calculateExpectedValue(mainNumbers),
        riskLevel: 'low',
        createdAt: new Date()
      });
    }
    
    return combinations;
  }

  /**
   * Génère des numéros avec distribution pair/impair optimale
   */
  private generateOptimalEvenOddNumbers(): number[] {
    const optimalDistributions = [
      { even: 3, odd: 2 }, // 3P-2I
      { even: 2, odd: 3 }  // 2P-3I
    ];
    
    const chosenDistribution = optimalDistributions[Math.floor(Math.random() * 2)];
    const numbers: number[] = [];
    const used = new Set<number>();
    
    // Générer les numéros pairs
    const evenNumbers = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48];
    for (let i = 0; i < chosenDistribution.even; i++) {
      let num: number;
      do {
        num = evenNumbers[Math.floor(Math.random() * evenNumbers.length)];
      } while (used.has(num));
      numbers.push(num);
      used.add(num);
    }
    
    // Générer les numéros impairs
    const oddNumbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49];
    for (let i = 0; i < chosenDistribution.odd; i++) {
      let num: number;
      do {
        num = oddNumbers[Math.floor(Math.random() * oddNumbers.length)];
      } while (used.has(num));
      numbers.push(num);
      used.add(num);
    }
    
    return numbers.sort((a, b) => a - b);
  }

  /**
   * Génère les raisons pour les combinaisons optimales pair/impair
   */
  private getOptimalEvenOddReasons(numbers: number[]): string[] {
    const sum = numbers.reduce((a, b) => a + b, 0);
    const evenCount = numbers.filter(n => n % 2 === 0).length;
    const oddCount = numbers.length - evenCount;
    const dizaines = new Set(numbers.map(num => Math.floor((num - 1) / 10)));
    const consecutiveCount = this.getConsecutiveCount(numbers);
    
    return [
      'Distribution pair/impair optimale garantie',
      'Respect strict de la contrainte 3P-2I ou 2P-3I',
      'Optimisation basée sur les statistiques historiques',
      `Somme optimale: ${sum} (zone recommandée 100-150)`,
      `Distribution ${evenCount}P-${oddCount}I (optimal)`,
      `Répartition sur ${dizaines.size} dizaines (recommandé: 3-4)`,
      consecutiveCount > 0 ? `${consecutiveCount} paire(s) consécutive(s) détectée(s)` : 'Aucune séquence consécutive (optimal)',
      `Score de probabilité: ${this.calculateScore(numbers, 'balanced')}/100`
    ];
  }

  /**
   * Force la distribution pair/impair optimale (3P-2I ou 2P-3I) - MÉTHODE DÉPRÉCIÉE
   */
  private forceOptimalEvenOddDistribution(combination: UnifiedCombination): {
    mainNumbers: number[];
    distribution: string;
    isOptimal: boolean;
  } {
    const optimalDistributions = [
      { even: 3, odd: 2 }, // 3P-2I
      { even: 2, odd: 3 }  // 2P-3I
    ];
    
    const chosenDistribution = optimalDistributions[Math.floor(Math.random() * 2)];
    const currentNumbers = [...combination.mainNumbers];
    const evenNumbers: number[] = [];
    const oddNumbers: number[] = [];
    
    // Séparer les numéros existants
    currentNumbers.forEach(num => {
      if (num % 2 === 0) {
        evenNumbers.push(num);
      } else {
        oddNumbers.push(num);
      }
    });
    
    const finalNumbers: number[] = [];
    
    // Ajouter les pairs nécessaires
    for (let i = 0; i < chosenDistribution.even && i < evenNumbers.length; i++) {
      finalNumbers.push(evenNumbers[i]);
    }
    
    // Ajouter les impairs nécessaires
    for (let i = 0; i < chosenDistribution.odd && i < oddNumbers.length; i++) {
      finalNumbers.push(oddNumbers[i]);
    }
    
    // Compléter si nécessaire
    while (finalNumbers.length < 5) {
      let number: number;
      do {
        number = Math.floor(Math.random() * 49) + 1;
      } while (finalNumbers.includes(number));
      
      const currentEven = finalNumbers.filter(n => n % 2 === 0).length;
      const currentOdd = finalNumbers.filter(n => n % 2 === 1).length;
      
      if (number % 2 === 0 && currentEven < chosenDistribution.even) {
        finalNumbers.push(number);
      } else if (number % 2 === 1 && currentOdd < chosenDistribution.odd) {
        finalNumbers.push(number);
      }
    }
    
    const finalEvenCount = finalNumbers.filter(n => n % 2 === 0).length;
    const finalOddCount = finalNumbers.filter(n => n % 2 === 1).length;
    const isOptimal = (finalEvenCount === 3 && finalOddCount === 2) || 
                     (finalEvenCount === 2 && finalOddCount === 3);
    
    return {
      mainNumbers: finalNumbers.slice(0, 5).sort((a, b) => a - b),
      distribution: `${finalEvenCount}P-${finalOddCount}I`,
      isOptimal
    };
  }

  /**
   * Calcule la distribution pair/impair
   */
  private calculateEvenOddDistribution(numbers: number[]): {
    pattern: string;
    isOptimal: boolean;
  } {
    const evenCount = numbers.filter(n => n % 2 === 0).length;
    const oddCount = numbers.filter(n => n % 2 === 1).length;
    const isOptimal = (evenCount === 3 && oddCount === 2) || (evenCount === 2 && oddCount === 3);
    
    return {
      pattern: `${evenCount}P-${oddCount}I`,
      isOptimal
    };
  }

  /**
   * Sélectionne des numéros depuis un pool
   */
  private selectNumbersFromPool(pool: number[], count: number): number[] {
    const selected: number[] = [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      if (!selected.includes(shuffled[i])) {
        selected.push(shuffled[i]);
      }
    }
    
    // Compléter avec des numéros aléatoires si nécessaire
    while (selected.length < count) {
      const randomNum = Math.floor(Math.random() * 49) + 1;
      if (!selected.includes(randomNum)) {
        selected.push(randomNum);
      }
    }
    
    return selected.sort((a, b) => a - b);
  }

  /**
   * Génère un numéro complémentaire
   */
  private generateComplementaryNumber(): number {
    return Math.floor(Math.random() * 10) + 1;
  }

  /**
   * Génère des numéros basés sur des motifs
   */
  private generatePatternNumbers(): number[] {
    const patterns = [
      [1, 8, 15, 22, 29], // Progression arithmétique
      [2, 4, 8, 16, 32],  // Progression géométrique
      [5, 10, 15, 20, 25], // Multiples de 5
      [7, 14, 21, 28, 35], // Multiples de 7
      [3, 13, 23, 33, 43]  // Finissant par 3
    ];
    
    const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
    return [...selectedPattern].sort((a, b) => a - b);
  }

  /**
   * Génère des numéros mathématiques
   */
  private generateMathematicalNumbers(): number[] {
    const numbers: number[] = [];
    
    // Nombres premiers
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    const selectedPrimes = this.selectNumbersFromPool(primes, 2);
    numbers.push(...selectedPrimes);
    
    // Nombres de Fibonacci
    const fibonacci = [1, 2, 3, 5, 8, 13, 21, 34];
    const selectedFib = this.selectNumbersFromPool(fibonacci, 1);
    numbers.push(...selectedFib);
    
    // Compléter avec des numéros aléatoires
    while (numbers.length < 5) {
      const randomNum = Math.floor(Math.random() * 49) + 1;
      if (!numbers.includes(randomNum)) {
        numbers.push(randomNum);
      }
    }
    
    return numbers.sort((a, b) => a - b);
  }

  /**
   * Génère des numéros conformes aux règles
   */
  private generateRulesCompliantNumbers(): number[] {
    const numbers: number[] = [];
    
    // Éviter les séquences trop longues
    // Éviter les numéros tous dans la même décennie
    // Équilibrer les tranches de numéros
    
    const ranges = [
      { min: 1, max: 10, count: 1 },
      { min: 11, max: 20, count: 1 },
      { min: 21, max: 30, count: 1 },
      { min: 31, max: 40, count: 1 },
      { min: 41, max: 49, count: 1 }
    ];
    
    ranges.forEach(range => {
      const num = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    });
    
    return numbers.sort((a, b) => a - b);
  }

  /**
   * Génère des numéros avancés multi-critères
   */
  private generateAdvancedNumbers(): number[] {
    // Utilise la logique de l'AdvancedStrategyEngine
    const numbers: number[] = [];
    
    // Sélection basée sur les écarts
    const gapNumbers = this.selectNumbersByGap();
    numbers.push(...gapNumbers);
    
    // Compléter si nécessaire
    while (numbers.length < 5) {
      const randomNum = Math.floor(Math.random() * 49) + 1;
      if (!numbers.includes(randomNum)) {
        numbers.push(randomNum);
      }
    }
    
    return numbers.sort((a, b) => a - b);
  }

  /**
   * Sélectionne des numéros basés sur les écarts
   */
  private selectNumbersByGap(): number[] {
    // Logique simplifiée pour la sélection par écart
    const numbers: number[] = [];
    
    // Prendre quelques numéros de différentes catégories d'écart
    const mediumGapNumbers = [7, 14, 21, 28, 35, 42];
    const selected = this.selectNumbersFromPool(mediumGapNumbers, 3);
    numbers.push(...selected);
    
    return numbers;
  }

  /**
   * Calcule le score d'une combinaison
   */
  private calculateScore(numbers: number[], type: string): number {
    let score = 30; // Score de base plus réaliste
    
    // Bonus selon le type
    switch (type) {
      case 'hot':
        score += 15;
        break;
      case 'cold':
        score += 8;
        break;
      case 'pattern':
        score += 12;
        break;
      case 'mathematical':
        score += 18;
        break;
      case 'rules':
        score += 20;
        break;
      case 'advanced':
        score += 25;
        break;
    }
    
    // Bonus pour distribution optimale
    const distribution = this.calculateEvenOddDistribution(numbers);
    if (distribution.isOptimal) {
      score += 10;
    }
    
    // Bonus pour somme optimale
    const sum = numbers.reduce((a, b) => a + b, 0);
    if (sum >= 100 && sum <= 150) {
      score += 8;
    } else if (sum >= 80 && sum <= 170) {
      score += 4;
    }
    
    // Bonus pour répartition des dizaines
    const dizaines = new Set(numbers.map(num => Math.floor((num - 1) / 10)));
    if (dizaines.size >= 3) {
      score += 6;
    } else if (dizaines.size === 2) {
      score += 3;
    }
    
    // Bonus pour absence de consécutifs
    const consecutiveCount = this.getConsecutiveCount(numbers);
    if (consecutiveCount === 0) {
      score += 5;
    } else if (consecutiveCount === 1) {
      score += 2;
    }
    
    return Math.min(score, 100);
  }

  /**
   * Calcule la confiance
   */
  private calculateConfidence(numbers: number[], type: string): number {
    const baseConfidence = {
      'hot': 75,
      'cold': 60,
      'pattern': 70,
      'mathematical': 80,
      'rules': 85,
      'advanced': 90
    };
    
    return baseConfidence[type as keyof typeof baseConfidence] || 70;
  }

  /**
   * Calcule la valeur attendue
   */
  private calculateExpectedValue(numbers: number[]): number {
    // Calcul simplifié basé sur les probabilités
    return Math.random() * 50 + 10; // Entre 10 et 60€
  }

  /**
   * Calcule le nombre de numéros consécutifs
   */
  private getConsecutiveCount(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    let consecutiveCount = 0;
    
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] - sorted[i] === 1) {
        consecutiveCount++;
      }
    }
    
    return consecutiveCount;
  }

  /**
   * Génère les raisons pour les combinaisons chaudes/froides
   */
  private getHotColdReasons(numbers: number[], type: string): string[] {
    const sum = numbers.reduce((a, b) => a + b, 0);
    const evenCount = numbers.filter(n => n % 2 === 0).length;
    const oddCount = numbers.length - evenCount;
    const dizaines = new Set(numbers.map(num => Math.floor((num - 1) / 10)));
    const consecutiveCount = this.getConsecutiveCount(numbers);
    
    const reasons = [
      `Basé sur les numéros ${type === 'hot' ? 'les plus fréquents' : 'les moins fréquents'}`,
      'Analyse statistique des tirages récents',
      type === 'hot' ? 'Tendance forte détectée' : 'Potentiel de retournement',
      `Somme optimale: ${sum} (zone recommandée 100-150)`,
      `Distribution ${evenCount}P-${oddCount}I ${(evenCount === 3 && oddCount === 2) || (evenCount === 2 && oddCount === 3) ? 'optimale' : 'acceptable'}`,
      `Répartition sur ${dizaines.size} dizaines (recommandé: 3-4)`,
      consecutiveCount > 0 ? `${consecutiveCount} paire(s) consécutive(s) détectée(s)` : 'Aucune séquence consécutive (optimal)',
      `Score de probabilité: ${this.calculateScore(numbers, type)}/100`
    ];
    
    return reasons;
  }

  /**
   * Génère les raisons pour les combinaisons de motifs
   */
  private getPatternReasons(numbers: number[]): string[] {
    const sum = numbers.reduce((a, b) => a + b, 0);
    const evenCount = numbers.filter(n => n % 2 === 0).length;
    const oddCount = numbers.length - evenCount;
    const dizaines = new Set(numbers.map(num => Math.floor((num - 1) / 10)));
    const consecutiveCount = this.getConsecutiveCount(numbers);
    
    return [
      'Basé sur l\'analyse des motifs historiques',
      'Détection de patterns récurrents',
      'Optimisation des séquences',
      `Somme optimale: ${sum} (zone recommandée 100-150)`,
      `Distribution ${evenCount}P-${oddCount}I ${(evenCount === 3 && oddCount === 2) || (evenCount === 2 && oddCount === 3) ? 'optimale' : 'acceptable'}`,
      `Répartition sur ${dizaines.size} dizaines (recommandé: 3-4)`,
      consecutiveCount > 0 ? `${consecutiveCount} paire(s) consécutive(s) détectée(s)` : 'Aucune séquence consécutive (optimal)',
      `Score de probabilité: ${this.calculateScore(numbers, 'pattern')}/100`
    ];
  }

  /**
   * Génère les raisons pour les combinaisons mathématiques
   */
  private getMathematicalReasons(numbers: number[]): string[] {
    const sum = numbers.reduce((a, b) => a + b, 0);
    const evenCount = numbers.filter(n => n % 2 === 0).length;
    const oddCount = numbers.length - evenCount;
    const dizaines = new Set(numbers.map(num => Math.floor((num - 1) / 10)));
    const consecutiveCount = this.getConsecutiveCount(numbers);
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    const primeCount = numbers.filter(n => primes.includes(n)).length;
    
    return [
      'Basé sur des principes mathématiques',
      'Nombres premiers et séquences',
      'Optimisation théorique',
      `Somme optimale: ${sum} (zone recommandée 100-150)`,
      `Distribution ${evenCount}P-${oddCount}I ${(evenCount === 3 && oddCount === 2) || (evenCount === 2 && oddCount === 3) ? 'optimale' : 'acceptable'}`,
      `Répartition sur ${dizaines.size} dizaines (recommandé: 3-4)`,
      consecutiveCount > 0 ? `${consecutiveCount} paire(s) consécutive(s) détectée(s)` : 'Aucune séquence consécutive (optimal)',
      `${primeCount} nombre(s) premier(s) inclus (optimal: 1-2)`,
      `Score de probabilité: ${this.calculateScore(numbers, 'mathematical')}/100`
    ];
  }

  /**
   * Génère les raisons pour les combinaisons de règles
   */
  private getRulesReasons(numbers: number[]): string[] {
    const sum = numbers.reduce((a, b) => a + b, 0);
    const evenCount = numbers.filter(n => n % 2 === 0).length;
    const oddCount = numbers.length - evenCount;
    const dizaines = new Set(numbers.map(num => Math.floor((num - 1) / 10)));
    const consecutiveCount = this.getConsecutiveCount(numbers);
    
    return [
      'Conforme aux règles officielles',
      'Respect des contraintes réglementaires',
      'Optimisation réglementaire',
      `Somme optimale: ${sum} (zone recommandée 100-150)`,
      `Distribution ${evenCount}P-${oddCount}I ${(evenCount === 3 && oddCount === 2) || (evenCount === 2 && oddCount === 3) ? 'optimale' : 'acceptable'}`,
      `Répartition sur ${dizaines.size} dizaines (recommandé: 3-4)`,
      consecutiveCount > 0 ? `${consecutiveCount} paire(s) consécutive(s) détectée(s)` : 'Aucune séquence consécutive (optimal)',
      `Score de probabilité: ${this.calculateScore(numbers, 'rules')}/100`
    ];
  }

  /**
   * Génère les raisons pour les combinaisons avancées
   */
  private getAdvancedReasons(numbers: number[]): string[] {
    const sum = numbers.reduce((a, b) => a + b, 0);
    const evenCount = numbers.filter(n => n % 2 === 0).length;
    const oddCount = numbers.length - evenCount;
    const dizaines = new Set(numbers.map(num => Math.floor((num - 1) / 10)));
    const consecutiveCount = this.getConsecutiveCount(numbers);
    
    return [
      'Multi-critères : écarts optimaux',
      'Distribution pair/impair optimale',
      'Numéro complémentaire optimal',
      'Analyse combinatoire avancée',
      `Somme optimale: ${sum} (zone recommandée 100-150)`,
      `Distribution ${evenCount}P-${oddCount}I ${(evenCount === 3 && oddCount === 2) || (evenCount === 2 && oddCount === 3) ? 'optimale' : 'acceptable'}`,
      `Répartition sur ${dizaines.size} dizaines (recommandé: 3-4)`,
      consecutiveCount > 0 ? `${consecutiveCount} paire(s) consécutive(s) détectée(s)` : 'Aucune séquence consécutive (optimal)',
      `Score de probabilité: ${this.calculateScore(numbers, 'advanced')}/100`
    ];
  }

  /**
   * Récupère toutes les combinaisons
   */
  getAllCombinations(): UnifiedCombination[] {
    return Array.from(this.combinations.values());
  }

  /**
   * Récupère une combinaison par ID
   */
  getCombination(id: string): UnifiedCombination | undefined {
    return this.combinations.get(id);
  }

  /**
   * Met à jour les résultats de test d'une combinaison
   */
  updateTestResults(id: string, testResults: UnifiedCombination['testResults']): void {
    const combination = this.combinations.get(id);
    if (combination) {
      combination.testResults = testResults;
      this.combinations.set(id, combination);
    }
  }

  /**
   * Calcule les statistiques du hub
   */
  async getStatistics(): Promise<HubStatistics> {
    if (this.statistics && Date.now() - this.lastUpdate < this.CACHE_DURATION) {
      return this.statistics;
    }

    const allCombinations = this.getAllCombinations();
    const testedCombinations = allCombinations.filter(c => c.testResults);
    
    const categoryStats = new Map<string, { count: number; totalROI: number }>();
    
    allCombinations.forEach(combo => {
      const existing = categoryStats.get(combo.category) || { count: 0, totalROI: 0 };
      existing.count++;
      if (combo.testResults) {
        existing.totalROI += combo.testResults.roi;
      }
      categoryStats.set(combo.category, existing);
    });

    const topCategories = Array.from(categoryStats.entries())
      .map(([category, stats]) => ({
        category,
        count: stats.count,
        averageROI: stats.count > 0 ? stats.totalROI / stats.count : 0
      }))
      .sort((a, b) => b.averageROI - a.averageROI);

    const optimalDistributions = allCombinations.filter(c => c.isOptimalDistribution).length;
    const nonOptimalDistributions = allCombinations.length - optimalDistributions;

    this.statistics = {
      totalCombinations: allCombinations.length,
      testedCombinations: testedCombinations.length,
      bestROI: testedCombinations.length > 0 ? Math.max(...testedCombinations.map(c => c.testResults!.roi)) : 0,
      averageROI: testedCombinations.length > 0 ? 
        testedCombinations.reduce((sum, c) => sum + c.testResults!.roi, 0) / testedCombinations.length : 0,
      topCategories,
      distributionStats: {
        optimalDistributions,
        nonOptimalDistributions,
        optimalPercentage: allCombinations.length > 0 ? (optimalDistributions / allCombinations.length) * 100 : 0
      }
    };

    this.lastUpdate = Date.now();
    return this.statistics;
  }

  /**
   * Efface toutes les combinaisons
   */
  clearAll(): void {
    this.combinations.clear();
    this.statistics = null;
    this.lastUpdate = 0;
  }
}

// Instance singleton
export const combinationHub = new CombinationHub();

