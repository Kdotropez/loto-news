/**
 * Moteur d'analyse des règles officielles du Loto
 * Basé sur le règlement officiel de la FDJ
 */

export interface LotoRules {
  // Règles de base
  totalNumbers: number; // 49
  numbersToChoose: number; // 5
  complementaryNumber: boolean; // true
  complementaryNumberRange: [number, number]; // [1, 10]
  
  // Règles de tirage
  drawFrequency: string; // "3 fois par semaine"
  drawDays: string[]; // ["lundi", "mercredi", "samedi"]
  drawTime: string; // "20h30"
  
  // Règles de gains
  prizeCategories: PrizeCategory[];
  
  // Règles de validation
  validationRules: ValidationRule[];
  
  // Règles statistiques
  statisticalRules: StatisticalRule[];
}

export interface PrizeCategory {
  name: string;
  description: string;
  requiredNumbers: number;
  requiredComplementary: boolean;
  probability: number;
  averagePrize: number;
}

export interface ValidationRule {
  name: string;
  description: string;
  validator: (numbers: number[], complementary?: number) => boolean;
}

export interface StatisticalRule {
  name: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
}

export class LotoRulesEngine {
  private rules: LotoRules;

  constructor() {
    this.rules = this.initializeOfficialRules();
  }

  private initializeOfficialRules(): LotoRules {
    return {
      totalNumbers: 49,
      numbersToChoose: 5,
      complementaryNumber: true,
      complementaryNumberRange: [1, 10],
      
      drawFrequency: "3 fois par semaine",
      drawDays: ["lundi", "mercredi", "samedi"],
      drawTime: "20h30",
      
      prizeCategories: [
        {
          name: "Rang 1 - 5 numéros + numéro complémentaire",
          description: "5 numéros gagnants + numéro complémentaire",
          requiredNumbers: 5,
          requiredComplementary: true,
          probability: 1 / 1906884, // 1 chance sur 1 906 884
          averagePrize: 2000000 // 2 millions d'euros en moyenne
        },
        {
          name: "Rang 2 - 5 numéros",
          description: "5 numéros gagnants sans le numéro complémentaire",
          requiredNumbers: 5,
          requiredComplementary: false,
          probability: 1 / 190688, // 1 chance sur 190 688
          averagePrize: 100000 // 100 000 euros en moyenne
        },
        {
          name: "Rang 3 - 4 numéros + numéro complémentaire",
          description: "4 numéros gagnants + numéro complémentaire",
          requiredNumbers: 4,
          requiredComplementary: true,
          probability: 1 / 21188, // 1 chance sur 21 188
          averagePrize: 1000 // 1 000 euros en moyenne
        },
        {
          name: "Rang 4 - 4 numéros",
          description: "4 numéros gagnants sans le numéro complémentaire",
          requiredNumbers: 4,
          requiredComplementary: false,
          probability: 1 / 2119, // 1 chance sur 2 119
          averagePrize: 500 // 500 euros en moyenne
        },
        {
          name: "Rang 5 - 3 numéros + numéro complémentaire",
          description: "3 numéros gagnants + numéro complémentaire",
          requiredNumbers: 3,
          requiredComplementary: true,
          probability: 1 / 425, // 1 chance sur 425
          averagePrize: 50 // 50 euros en moyenne
        },
        {
          name: "Rang 6 - 3 numéros",
          description: "3 numéros gagnants sans le numéro complémentaire",
          requiredNumbers: 3,
          requiredComplementary: false,
          probability: 1 / 42, // 1 chance sur 42
          averagePrize: 20 // 20 euros en moyenne
        },
        {
          name: "Rang 7 - 2 numéros + numéro complémentaire",
          description: "2 numéros gagnants + numéro complémentaire",
          requiredNumbers: 2,
          requiredComplementary: true,
          probability: 1 / 15, // 1 chance sur 15
          averagePrize: 5 // 5 euros en moyenne
        }
      ],
      
      validationRules: [
        {
          name: "Nombre de numéros",
          description: "Exactement 5 numéros doivent être choisis",
          validator: (numbers: number[]) => numbers.length === 5
        },
        {
          name: "Plage de numéros",
          description: "Les numéros doivent être entre 1 et 49",
          validator: (numbers: number[]) => numbers.every(n => n >= 1 && n <= 49)
        },
        {
          name: "Numéros uniques",
          description: "Tous les numéros doivent être différents",
          validator: (numbers: number[]) => new Set(numbers).size === numbers.length
        },
        {
          name: "Numéro complémentaire",
          description: "Le numéro complémentaire doit être entre 1 et 10",
          validator: (numbers: number[], complementary?: number) => 
            complementary === undefined || (complementary >= 1 && complementary <= 10)
        }
      ],
      
      statisticalRules: [
        {
          name: "Équilibre pair/impair",
          description: "Les combinaisons équilibrées (2-3 ou 3-2) sont plus fréquentes",
          impact: 'positive',
          weight: 0.3
        },
        {
          name: "Répartition par tiers",
          description: "Les numéros répartis sur les 3 tiers (1-16, 17-32, 33-49) sont plus probables",
          impact: 'positive',
          weight: 0.25
        },
        {
          name: "Somme des numéros",
          description: "Les sommes entre 100 et 200 sont plus fréquentes",
          impact: 'positive',
          weight: 0.2
        },
        {
          name: "Numéros consécutifs",
          description: "Éviter plus de 2 numéros consécutifs",
          impact: 'negative',
          weight: 0.15
        },
        {
          name: "Numéros de la même dizaine",
          description: "Éviter plus de 2 numéros de la même dizaine",
          impact: 'negative',
          weight: 0.1
        }
      ]
    };
  }

  /**
   * Valide une combinaison selon les règles officielles
   */
  validateCombination(numbers: number[], complementary?: number): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validation des règles de base
    this.rules.validationRules.forEach(rule => {
      if (!rule.validator(numbers, complementary)) {
        errors.push(rule.description);
      }
    });

    // Vérifications statistiques
    this.rules.statisticalRules.forEach(rule => {
      const result = this.checkStatisticalRule(numbers, rule);
      if (result === 'warning') {
        warnings.push(rule.description);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Vérifie une règle statistique
   */
  private checkStatisticalRule(numbers: number[], rule: StatisticalRule): 'ok' | 'warning' {
    switch (rule.name) {
      case 'Équilibre pair/impair':
        const evenCount = numbers.filter(n => n % 2 === 0).length;
        const oddCount = numbers.length - evenCount;
        const isBalanced = (evenCount === 2 && oddCount === 3) || (evenCount === 3 && oddCount === 2);
        return isBalanced ? 'ok' : 'warning';

      case 'Répartition par tiers':
        const tier1 = numbers.filter(n => n >= 1 && n <= 16).length;
        const tier2 = numbers.filter(n => n >= 17 && n <= 32).length;
        const tier3 = numbers.filter(n => n >= 33 && n <= 49).length;
        const hasAllTiers = tier1 > 0 && tier2 > 0 && tier3 > 0;
        return hasAllTiers ? 'ok' : 'warning';

      case 'Somme des numéros':
        const sum = numbers.reduce((acc, n) => acc + n, 0);
        const isGoodSum = sum >= 100 && sum <= 200;
        return isGoodSum ? 'ok' : 'warning';

      case 'Numéros consécutifs':
        const sorted = [...numbers].sort((a, b) => a - b);
        let consecutiveCount = 0;
        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i] === sorted[i-1] + 1) {
            consecutiveCount++;
          }
        }
        return consecutiveCount <= 2 ? 'ok' : 'warning';

      case 'Numéros de la même dizaine':
        const decades = new Map<number, number>();
        numbers.forEach(n => {
          const decade = Math.floor(n / 10);
          decades.set(decade, (decades.get(decade) || 0) + 1);
        });
        const maxInDecade = Math.max(...Array.from(decades.values()));
        return maxInDecade <= 2 ? 'ok' : 'warning';

      default:
        return 'ok';
    }
  }

  /**
   * Calcule le score de conformité d'une combinaison
   */
  calculateComplianceScore(numbers: number[], complementary?: number): {
    score: number;
    maxScore: number;
    details: Array<{
      rule: string;
      weight: number;
      passed: boolean;
      impact: string;
    }>;
  } {
    let score = 0;
    let maxScore = 0;
    const details: Array<{
      rule: string;
      weight: number;
      passed: boolean;
      impact: string;
    }> = [];

    // Validation de base (obligatoire)
    const validation = this.validateCombination(numbers, complementary);
    if (validation.isValid) {
      score += 50; // Score de base pour une combinaison valide
    }
    maxScore += 50;

    details.push({
      rule: 'Validation de base',
      weight: 50,
      passed: validation.isValid,
      impact: 'obligatoire'
    });

    // Règles statistiques
    this.rules.statisticalRules.forEach(rule => {
      const result = this.checkStatisticalRule(numbers, rule);
      const ruleScore = rule.weight * 100;
      
      if (result === 'ok') {
        score += ruleScore;
      }
      
      maxScore += ruleScore;
      
      details.push({
        rule: rule.name,
        weight: rule.weight * 100,
        passed: result === 'ok',
        impact: rule.impact
      });
    });

    return {
      score: Math.round(score),
      maxScore: Math.round(maxScore),
      details
    };
  }

  /**
   * Génère des combinaisons conformes aux règles
   */
  generateCompliantCombinations(count: number = 10): Array<{
    numbers: number[];
    complementary: number;
    score: number;
    details: any;
  }> {
    const combinations: Array<{
      numbers: number[];
      complementary: number;
      score: number;
      details: any;
    }> = [];

    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let bestCombination: any = null;
      let bestScore = 0;

      // Essayer plusieurs combinaisons aléatoires
      while (attempts < 1000) {
        const numbers = this.generateRandomNumbers();
        const complementary = Math.floor(Math.random() * 10) + 1;
        
        const compliance = this.calculateComplianceScore(numbers, complementary);
        
        if (compliance.score > bestScore) {
          bestScore = compliance.score;
          bestCombination = {
            numbers,
            complementary,
            score: compliance.score,
            details: compliance
          };
        }
        
        attempts++;
      }

      if (bestCombination) {
        combinations.push(bestCombination);
      }
    }

    return combinations.sort((a, b) => b.score - a.score);
  }

  /**
   * Génère des numéros aléatoires respectant certaines contraintes
   */
  private generateRandomNumbers(): number[] {
    const numbers: number[] = [];
    const used = new Set<number>();

    while (numbers.length < 5) {
      const num = Math.floor(Math.random() * 49) + 1;
      if (!used.has(num)) {
        numbers.push(num);
        used.add(num);
      }
    }

    return numbers.sort((a, b) => a - b);
  }

  /**
   * Analyse la probabilité de gain d'une combinaison
   */
  analyzeWinProbability(numbers: number[], complementary?: number): {
    totalProbability: number;
    categoryProbabilities: Array<{
      category: string;
      probability: number;
      expectedValue: number;
    }>;
    recommendations: string[];
  } {
    const categoryProbabilities = this.rules.prizeCategories.map(category => {
      // Calcul simplifié de la probabilité
      let probability = category.probability;
      
      // Ajustements basés sur les règles statistiques
      const compliance = this.calculateComplianceScore(numbers, complementary);
      const complianceFactor = compliance.score / compliance.maxScore;
      
      // Les combinaisons conformes ont légèrement plus de chances
      probability *= (0.8 + 0.4 * complianceFactor);
      
      return {
        category: category.name,
        probability,
        expectedValue: probability * category.averagePrize
      };
    });

    const totalProbability = categoryProbabilities.reduce((sum, cat) => sum + cat.probability, 0);
    const totalExpectedValue = categoryProbabilities.reduce((sum, cat) => sum + cat.expectedValue, 0);

    const recommendations: string[] = [];
    
    if (totalExpectedValue > 0.1) {
      recommendations.push("Cette combinaison a un bon potentiel de gain");
    }
    
    const validation = this.validateCombination(numbers, complementary);
    if (validation.warnings.length === 0) {
      recommendations.push("Combinaison parfaitement conforme aux règles statistiques");
    } else {
      recommendations.push("Considérez ajuster la combinaison pour améliorer la conformité");
    }

    return {
      totalProbability,
      categoryProbabilities,
      recommendations
    };
  }

  /**
   * Obtient les règles officielles
   */
  getRules(): LotoRules {
    return this.rules;
  }

  /**
   * Obtient les catégories de gains
   */
  getPrizeCategories(): PrizeCategory[] {
    return this.rules.prizeCategories;
  }

  /**
   * Obtient les règles de validation
   */
  getValidationRules(): ValidationRule[] {
    return this.rules.validationRules;
  }

  /**
   * Obtient les règles statistiques
   */
  getStatisticalRules(): StatisticalRule[] {
    return this.rules.statisticalRules;
  }
}

export const lotoRulesEngine = new LotoRulesEngine();

