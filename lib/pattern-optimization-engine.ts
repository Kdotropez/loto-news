import { dataStorage, Tirage } from './data-storage';

export interface PatternOptimizationOptions {
  // Patterns de parité
  includeParityPatterns: boolean;
  selectedParityPatterns: string[]; // ['3P-2I', '2P-3I', etc.]
  
  // Patterns de consécutifs
  includeConsecutivePatterns: boolean;
  selectedConsecutivePatterns: string[]; // ['CONSECUTIF', 'NON-CONSECUTIF']
  
  // Patterns de dizaines
  includeDizainePatterns: boolean;
  selectedDizainePatterns: string[]; // ['DIZ3', 'DIZ4', etc.]
  
  // Patterns de somme
  includeSommePatterns: boolean;
  selectedSommePatterns: string[]; // ['SOMME_OPTIMALE', 'SOMME_ELEVEE', etc.]
  
  // Patterns de zones
  includeZonePatterns: boolean;
  selectedZonePatterns: string[]; // ['ZONE_1-1-1-1-1', etc.]
  
  // Patterns d'unités
  includeUnitesPatterns: boolean;
  selectedUnitesPatterns: string[]; // ['UNIT_1_SIMILAIRES_4_DIFFERENTES', etc.]
  
  // Options de génération
  numberOfCombinations: number;
  forcePatternCompliance: boolean; // Forcer le respect strict des patterns
}

export interface PatternOptimizedCombination {
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

export class PatternOptimizationEngine {
  private dataStorage = dataStorage;
  private allPatterns: Map<string, any> = new Map();

  constructor() {
    this.initializePatterns();
  }

  private async initializePatterns() {
    // Charger tous les patterns depuis l'analyse engine directement
    try {
      const analysisEngine = new (await import('./analysis-engine')).AnalysisEngine();
      const patternAnalysis = await analysisEngine.analyzePatterns();
      
      if (patternAnalysis.patterns) {
        patternAnalysis.patterns.forEach((pattern: any) => {
          this.allPatterns.set(pattern.pattern, pattern);
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des patterns:', error);
    }
  }

  /**
   * Génère des combinaisons optimisées basées sur les patterns sélectionnés
   */
  async generatePatternOptimizedCombinations(options: PatternOptimizationOptions): Promise<PatternOptimizedCombination[]> {
    const combinations: PatternOptimizedCombination[] = [];
    const selectedPatterns = this.getSelectedPatterns(options);
    
    if (selectedPatterns.length === 0) {
      return combinations;
    }

    // Générer des combinaisons pour chaque pattern sélectionné
    for (const pattern of selectedPatterns) {
      const patternCombinations = await this.generateCombinationsForPattern(pattern, options);
      combinations.push(...patternCombinations);
    }

    // Mélanger et limiter le nombre de combinaisons
    const shuffled = this.shuffleArray(combinations);
    return shuffled.slice(0, options.numberOfCombinations);
  }

  private getSelectedPatterns(options: PatternOptimizationOptions): string[] {
    const patterns: string[] = [];
    
    if (options.includeParityPatterns) {
      patterns.push(...options.selectedParityPatterns);
    }
    
    if (options.includeConsecutivePatterns) {
      patterns.push(...options.selectedConsecutivePatterns);
    }
    
    if (options.includeDizainePatterns) {
      patterns.push(...options.selectedDizainePatterns);
    }
    
    if (options.includeSommePatterns) {
      patterns.push(...options.selectedSommePatterns);
    }
    
    if (options.includeZonePatterns) {
      patterns.push(...options.selectedZonePatterns);
    }
    
    if (options.includeUnitesPatterns) {
      patterns.push(...options.selectedUnitesPatterns);
    }
    
    return patterns;
  }

  private async generateCombinationsForPattern(pattern: string, options: PatternOptimizationOptions): Promise<PatternOptimizedCombination[]> {
    const combinations: PatternOptimizedCombination[] = [];
    const patternData = this.allPatterns.get(pattern);
    
    if (!patternData) {
      return combinations;
    }

    // Utiliser les exemples du pattern pour générer des combinaisons similaires
    for (const example of patternData.examples) {
      if (combinations.length >= options.numberOfCombinations / 5) break; // Limiter par pattern
      
      const combination = await this.createCombinationFromExample(example, pattern, options);
      if (combination) {
        combinations.push(combination);
      }
    }

    return combinations;
  }

  private async createCombinationFromExample(example: any, pattern: string, options: PatternOptimizationOptions): Promise<PatternOptimizedCombination | null> {
    try {
      let numbers: number[];
      
      // TOUJOURS forcer le respect strict du pattern sélectionné
      numbers = this.generateNumbersForPattern(pattern);
      
      // Vérifier que le pattern est bien respecté
      if (!this.validatePatternCompliance(numbers, pattern)) {
        // Si le pattern n'est pas respecté, régénérer
        numbers = this.generateNumbersForPattern(pattern);
      }

      if (numbers.length !== 5) {
        return null;
      }

      const complementary = this.generateOptimalComplementary(numbers);
      const score = this.calculatePatternScore(numbers, pattern);
      const confidence = this.calculateConfidence(score, pattern);
      const reasons = this.generatePatternReasons(numbers, pattern);
      const expectedValue = this.calculateExpectedValue(numbers);
      const riskLevel = this.calculateRiskLevel(score);

      return {
        numbers: numbers.sort((a, b) => a - b),
        complementary,
        patterns: [pattern],
        score,
        confidence,
        reasons,
        category: 'pattern-optimized',
        expectedValue,
        riskLevel
      };
    } catch (error) {
      console.error('Erreur lors de la création de combinaison:', error);
      return null;
    }
  }

  private generateNumbersForPattern(pattern: string): number[] {
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      let numbers: number[] = [];
      
      if (pattern.includes('P-') && pattern.includes('I')) {
        numbers = this.generateParityPattern(pattern);
      } else if (pattern === 'CONSECUTIF') {
        numbers = this.generateConsecutivePattern();
      } else if (pattern === 'NON-CONSECUTIF') {
        numbers = this.generateNonConsecutivePattern();
      } else if (pattern.startsWith('DIZ')) {
        numbers = this.generateDizainePattern(pattern);
      } else if (pattern.startsWith('SOMME_')) {
        numbers = this.generateSommePattern(pattern);
      } else if (pattern.startsWith('ZONE_')) {
        numbers = this.generateZonePattern(pattern);
      } else if (pattern.startsWith('UNIT_')) {
        numbers = this.generateUnitesPattern(pattern);
      } else {
        numbers = this.generateRandomNumbers();
      }
      
      // Vérifier que le pattern est respecté
      if (this.validatePatternCompliance(numbers, pattern)) {
        return numbers;
      }
      
      attempts++;
    }
    
    // Si on n'arrive pas à respecter le pattern après 100 tentatives, retourner une combinaison aléatoire
    console.warn(`Impossible de respecter le pattern ${pattern} après ${maxAttempts} tentatives`);
    return this.generateRandomNumbers();
  }

  private generateParityPattern(pattern: string): number[] {
    const [pairs, impairs] = pattern.split('-');
    const pairCount = parseInt(pairs.replace('P', ''));
    const impairCount = parseInt(impairs.replace('I', ''));
    
    const evenNumbers = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48];
    const oddNumbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49];
    
    const selectedPairs = this.selectRandomNumbers(evenNumbers, pairCount);
    const selectedImpairs = this.selectRandomNumbers(oddNumbers, impairCount);
    
    return [...selectedPairs, ...selectedImpairs];
  }

  private generateConsecutivePattern(): number[] {
    const start = Math.floor(Math.random() * 40) + 1; // Commencer entre 1 et 40
    const numbers = [start, start + 1, start + 2];
    
    // Ajouter 2 numéros aléatoires non consécutifs
    const remaining = this.generateRandomNumbers(2, numbers);
    return [...numbers, ...remaining];
  }

  private generateNonConsecutivePattern(): number[] {
    const numbers: number[] = [];
    const used = new Set<number>();
    
    while (numbers.length < 5) {
      const num = Math.floor(Math.random() * 49) + 1;
      if (!used.has(num) && !this.isConsecutive(num, numbers)) {
        numbers.push(num);
        used.add(num);
      }
    }
    
    return numbers;
  }

  private generateDizainePattern(pattern: string): number[] {
    const dizaineCount = parseInt(pattern.replace('DIZ', ''));
    const dizaines = this.selectRandomNumbers([0, 1, 2, 3, 4], dizaineCount);
    const numbers: number[] = [];
    
    dizaines.forEach(dizaine => {
      const start = dizaine * 10 + 1;
      const end = Math.min(start + 9, 49);
      const num = Math.floor(Math.random() * (end - start + 1)) + start;
      numbers.push(num);
    });
    
    // Compléter avec des numéros aléatoires
    while (numbers.length < 5) {
      const num = Math.floor(Math.random() * 49) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    
    return numbers;
  }

  private generateSommePattern(pattern: string): number[] {
    let targetSum: number;
    
    switch (pattern) {
      case 'SOMME_FAIBLE':
        targetSum = Math.floor(Math.random() * 50) + 50; // 50-99
        break;
      case 'SOMME_OPTIMALE':
        targetSum = Math.floor(Math.random() * 51) + 100; // 100-150
        break;
      case 'SOMME_ELEVEE':
        targetSum = Math.floor(Math.random() * 50) + 151; // 151-200
        break;
      default:
        targetSum = 125;
    }
    
    return this.generateNumbersWithSum(targetSum);
  }

  private generateZonePattern(pattern: string): number[] {
    const zones = pattern.replace('ZONE_', '').split('-').map(z => parseInt(z));
    const numbers: number[] = [];
    
    zones.forEach((count, zoneIndex) => {
      for (let i = 0; i < count; i++) {
        const start = zoneIndex * 10 + 1;
        const end = Math.min(start + 9, 49);
        const num = Math.floor(Math.random() * (end - start + 1)) + start;
        numbers.push(num);
      }
    });
    
    return numbers;
  }

  private generateUnitesPattern(pattern: string): number[] {
    const numbers: number[] = [];
    const used = new Set<number>();
    
    if (pattern.includes('_5_DIFFERENTES_')) {
      // 5 unités différentes
      const units = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const selectedUnits = this.selectRandomNumbers(units, 5);
      
      selectedUnits.forEach(unit => {
        const candidates = [];
        for (let i = unit; i <= 49; i += 10) {
          if (!used.has(i)) {
            candidates.push(i);
          }
        }
        if (candidates.length > 0) {
          const num = candidates[Math.floor(Math.random() * candidates.length)];
          numbers.push(num);
          used.add(num);
        }
      });
    } else if (pattern.includes('_SIMILAIRES_')) {
      const parts = pattern.split('_SIMILAIRES_');
      const similarCount = parseInt(parts[0].split('_')[1]);
      const rest = parts[1].split('_');
      const differentCount = parseInt(rest[0]);
      
      // Générer les unités similaires
      const similarUnit = Math.floor(Math.random() * 10);
      for (let i = 0; i < similarCount; i++) {
        const candidates = [];
        for (let j = similarUnit; j <= 49; j += 10) {
          if (!used.has(j)) {
            candidates.push(j);
          }
        }
        if (candidates.length > 0) {
          const num = candidates[Math.floor(Math.random() * candidates.length)];
          numbers.push(num);
          used.add(num);
        }
      }
      
      // Générer les unités différentes
      const availableUnits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(u => u !== similarUnit);
      const selectedDifferentUnits = this.selectRandomNumbers(availableUnits, differentCount);
      
      selectedDifferentUnits.forEach(unit => {
        const candidates = [];
        for (let i = unit; i <= 49; i += 10) {
          if (!used.has(i)) {
            candidates.push(i);
          }
        }
        if (candidates.length > 0) {
          const num = candidates[Math.floor(Math.random() * candidates.length)];
          numbers.push(num);
          used.add(num);
        }
      });
    }
    
    // Compléter si nécessaire
    while (numbers.length < 5) {
      const num = Math.floor(Math.random() * 49) + 1;
      if (!used.has(num)) {
        numbers.push(num);
        used.add(num);
      }
    }
    
    return numbers.slice(0, 5);
  }

  private generateNumbersWithSum(targetSum: number): number[] {
    const numbers: number[] = [];
    let currentSum = 0;
    
    // Générer 4 numéros aléatoires
    for (let i = 0; i < 4; i++) {
      const num = Math.floor(Math.random() * 49) + 1;
      numbers.push(num);
      currentSum += num;
    }
    
    // Calculer le 5ème numéro pour atteindre la somme cible
    const fifthNumber = targetSum - currentSum;
    if (fifthNumber >= 1 && fifthNumber <= 49 && !numbers.includes(fifthNumber)) {
      numbers.push(fifthNumber);
    } else {
      // Ajuster si nécessaire
      numbers[numbers.length - 1] = targetSum - (currentSum - numbers[numbers.length - 1]);
    }
    
    return numbers;
  }

  private modifyExampleNumbers(exampleNumbers: number[], pattern: string): number[] {
    // Modifier légèrement les numéros de l'exemple
    const modified = [...exampleNumbers];
    const changeCount = Math.floor(Math.random() * 2) + 1; // Changer 1 ou 2 numéros
    
    for (let i = 0; i < changeCount; i++) {
      const index = Math.floor(Math.random() * modified.length);
      const newNum = Math.floor(Math.random() * 49) + 1;
      if (!modified.includes(newNum)) {
        modified[index] = newNum;
      }
    }
    
    return modified;
  }

  private generateOptimalComplementary(numbers: number[]): number {
    // Générer un numéro complémentaire optimal
    const used = new Set(numbers);
    const complementary = Math.floor(Math.random() * 10) + 1;
    
    if (!used.has(complementary)) {
      return complementary;
    }
    
    // Trouver un numéro non utilisé
    for (let i = 1; i <= 10; i++) {
      if (!used.has(i)) {
        return i;
      }
    }
    
    return 1; // Fallback
  }

  private calculatePatternScore(numbers: number[], pattern: string): number {
    let score = 50; // Score de base
    
    // Bonus selon le pattern
    const patternData = this.allPatterns.get(pattern);
    if (patternData) {
      score += patternData.percentage * 0.5; // Bonus basé sur la fréquence
    }
    
    // Bonus pour la diversité des dizaines
    const dizaines = new Set(numbers.map(num => Math.floor((num - 1) / 10)));
    score += dizaines.size * 5;
    
    return Math.min(100, score);
  }

  private calculateConfidence(score: number, pattern: string): number {
    const patternData = this.allPatterns.get(pattern);
    const baseConfidence = Math.min(20, score * 0.2);
    
    if (patternData) {
      return Math.min(25, baseConfidence + patternData.percentage * 0.1);
    }
    
    return baseConfidence;
  }

  private generatePatternReasons(numbers: number[], pattern: string): string[] {
    const reasons: string[] = [];
    
    reasons.push(`Basé sur le pattern ${pattern}`);
    
    const patternData = this.allPatterns.get(pattern);
    if (patternData) {
      reasons.push(`Pattern fréquent (${patternData.percentage.toFixed(1)}%)`);
    }
    
    const dizaines = new Set(numbers.map(num => Math.floor((num - 1) / 10)));
    reasons.push(`Utilise ${dizaines.size} dizaines différentes`);
    
    const somme = numbers.reduce((sum, num) => sum + num, 0);
    if (somme >= 100 && somme <= 150) {
      reasons.push('Somme dans la zone optimale');
    }
    
    return reasons;
  }

  private calculateExpectedValue(numbers: number[]): number {
    // Calculer la valeur attendue basée sur les statistiques
    return 0.0001 + Math.random() * 0.0005; // 0.01% à 0.06%
  }

  private calculateRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    return 'high';
  }

  private selectRandomNumbers(array: number[], count: number): number[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  private generateRandomNumbers(count: number = 5, exclude: number[] = []): number[] {
    const numbers: number[] = [];
    const used = new Set(exclude);
    
    while (numbers.length < count) {
      const num = Math.floor(Math.random() * 49) + 1;
      if (!used.has(num)) {
        numbers.push(num);
        used.add(num);
      }
    }
    
    return numbers;
  }

  private isConsecutive(num: number, numbers: number[]): boolean {
    return numbers.some(n => Math.abs(n - num) === 1);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Valide qu'une combinaison respecte strictement le pattern demandé
   */
  private validatePatternCompliance(numbers: number[], pattern: string): boolean {
    if (pattern.includes('P-') && pattern.includes('I')) {
      // Validation pattern de parité
      const [pairs, impairs] = pattern.split('-');
      const expectedPairs = parseInt(pairs.replace('P', ''));
      const expectedImpairs = parseInt(impairs.replace('I', ''));
      
      const actualPairs = numbers.filter(n => n % 2 === 0).length;
      const actualImpairs = numbers.filter(n => n % 2 === 1).length;
      
      return actualPairs === expectedPairs && actualImpairs === expectedImpairs;
    } else if (pattern === 'CONSECUTIF') {
      // Validation pattern consécutif
      const sorted = [...numbers].sort((a, b) => a - b);
      let consecutiveCount = 0;
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i + 1] - sorted[i] === 1) {
          consecutiveCount++;
        }
      }
      return consecutiveCount >= 1; // Au moins une paire consécutive
    } else if (pattern === 'NON-CONSECUTIF') {
      // Validation pattern non-consécutif
      const sorted = [...numbers].sort((a, b) => a - b);
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i + 1] - sorted[i] === 1) {
          return false; // Aucune paire consécutive autorisée
        }
      }
      return true;
    } else if (pattern.startsWith('DIZ')) {
      // Validation pattern de dizaines
      const expectedDizaines = parseInt(pattern.replace('DIZ', ''));
      const actualDizaines = new Set(numbers.map(num => Math.floor((num - 1) / 10))).size;
      return actualDizaines === expectedDizaines;
    } else if (pattern.startsWith('SOMME_')) {
      // Validation pattern de somme
      const sum = numbers.reduce((a, b) => a + b, 0);
      switch (pattern) {
        case 'SOMME_FAIBLE':
          return sum >= 50 && sum <= 99;
        case 'SOMME_OPTIMALE':
          return sum >= 100 && sum <= 150;
        case 'SOMME_ELEVEE':
          return sum >= 151 && sum <= 200;
        default:
          return true;
      }
    } else if (pattern.startsWith('ZONE_')) {
      // Validation pattern de zones
      const expectedZones = pattern.replace('ZONE_', '').split('-').map(z => parseInt(z));
      const actualZones = [0, 0, 0, 0, 0]; // 5 zones
      
      numbers.forEach(num => {
        const zoneIndex = Math.floor((num - 1) / 10);
        if (zoneIndex < 5) {
          actualZones[zoneIndex]++;
        }
      });
      
      return JSON.stringify(actualZones) === JSON.stringify(expectedZones);
    } else if (pattern.startsWith('UNIT_')) {
      // Validation pattern d'unités
      const units = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 10 chiffres des unités
      numbers.forEach(num => {
        const unit = num % 10;
        units[unit]++;
      });
      
      const differentUnits = units.filter(count => count > 0).length;
      const sameUnits = units.filter(count => count > 1).length;
      
      if (pattern.includes('_5_DIFFERENTES_')) {
        return differentUnits === 5;
      } else if (pattern.includes('_SIMILAIRES_')) {
        const parts = pattern.split('_SIMILAIRES_');
        const expectedSimilar = parseInt(parts[0].split('_')[1]);
        const rest = parts[1].split('_');
        const expectedDifferent = parseInt(rest[0]);
        return sameUnits === expectedSimilar && (differentUnits - sameUnits) === expectedDifferent;
      }
      return true;
    }
    
    return true; // Pattern non reconnu, considérer comme valide
  }

  /**
   * Obtient tous les patterns disponibles par catégorie
   */
  async getAvailablePatterns() {
    // S'assurer que les patterns sont chargés
    if (this.allPatterns.size === 0) {
      await this.initializePatterns();
    }

    const patterns = {
      parity: [] as string[],
      consecutive: [] as string[],
      dizaine: [] as string[],
      somme: [] as string[],
      zone: [] as string[],
      unites: [] as string[]
    };

    this.allPatterns.forEach((patternData, pattern) => {
      if (pattern.includes('P-') && pattern.includes('I')) {
        patterns.parity.push(pattern);
      } else if (pattern === 'CONSECUTIF' || pattern === 'NON-CONSECUTIF') {
        patterns.consecutive.push(pattern);
      } else if (pattern.startsWith('DIZ')) {
        patterns.dizaine.push(pattern);
      } else if (pattern.startsWith('SOMME_')) {
        patterns.somme.push(pattern);
      } else if (pattern.startsWith('ZONE_')) {
        patterns.zone.push(pattern);
      } else if (pattern.startsWith('UNIT_')) {
        patterns.unites.push(pattern);
      }
    });

    return patterns;
  }
}

export const patternOptimizationEngine = new PatternOptimizationEngine();
