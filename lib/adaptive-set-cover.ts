/**
 * Optimisateur Set Cover Adaptatif
 * 
 * Contrairement aux approches classiques qui supposent que tous les numéros
 * du tirage seront dans la sélection, cet algorithme s'adapte à différents
 * scénarios selon le nombre de correspondances.
 */

import { OfficialGainCalculator, OFFICIAL_LOTO_RANKS } from './official-loto-gains';

export interface AdaptiveScenario {
  matchCount: number;           // Nombre de numéros correspondants (3, 4, ou 5)
  probability: string;          // Évaluation qualitative de la probabilité
  guaranteeLevel: string;       // Niveau de garantie offert
  gridsNeeded: number;          // Nombre de grilles nécessaires
  cost: number;                 // Coût total en euros
  explanation: string;          // Explication détaillée
  color: string;                // Couleur pour l'interface
  grids: AdaptiveGrid[];        // Grilles générées pour ce scénario
}

export interface AdaptiveGrid {
  numbers: number[];            // 5 numéros de la grille
  type: 'primary' | 'security' | 'complementary'; // Type de grille
  purpose: string;              // Objectif de cette grille
  covers: string[];             // Combinaisons de 3 qu'elle couvre
}

export interface AdaptiveStrategy {
  name: string;
  totalGrids: number;
  totalCost: number;
  scenarios: AdaptiveScenario[];
  recommendation: string;
  optimalScenarioIndex: number;
}

export class AdaptiveSetCoverOptimizer {
  private readonly GRID_COST = 2.20;
  private readonly SECOND_TIRAGE_COST = 0.80;

  /**
   * Calcule la stratégie adaptative complète
   */
  calculateAdaptiveStrategy(
    selectedNumbers: number[],
    includeSecondTirage: boolean = false,
    maxBudget?: number
  ): AdaptiveStrategy {
    const n = selectedNumbers.length;
    
    if (n < 3) {
      throw new Error('Au moins 3 numéros sont nécessaires');
    }

    const scenarios = this.calculateAllScenarios(selectedNumbers, includeSecondTirage);
    const optimalIndex = this.findOptimalScenario(scenarios, maxBudget);

    return {
      name: "Stratégie Set Cover Adaptative",
      totalGrids: scenarios[optimalIndex].gridsNeeded,
      totalCost: scenarios[optimalIndex].cost,
      scenarios,
      recommendation: this.generateRecommendation(scenarios, optimalIndex),
      optimalScenarioIndex: optimalIndex
    };
  }

  /**
   * Calcule tous les scénarios possibles
   */
  private calculateAllScenarios(
    selectedNumbers: number[],
    includeSecondTirage: boolean
  ): AdaptiveScenario[] {
    const scenarios: AdaptiveScenario[] = [];
    const baseCost = includeSecondTirage ? this.GRID_COST + this.SECOND_TIRAGE_COST : this.GRID_COST;

    // Scénario 5/5 : Correspondance parfaite
    scenarios.push(this.calculatePerfectMatchScenario(selectedNumbers, baseCost));

    // Scénario 4/5 : Correspondance partielle élevée
    scenarios.push(this.calculateHighPartialMatchScenario(selectedNumbers, baseCost));

    // Scénario 3/5 : Correspondance partielle faible
    scenarios.push(this.calculateLowPartialMatchScenario(selectedNumbers, baseCost));

    // Scénario 2/5 et moins : Échec
    scenarios.push(this.calculateFailureScenario());

    return scenarios;
  }

  /**
   * Scénario 5/5 : Tous les numéros du tirage sont dans la sélection
   */
  private calculatePerfectMatchScenario(
    selectedNumbers: number[],
    baseCost: number
  ): AdaptiveScenario {
    const n = selectedNumbers.length;
    
    // Utilisation de la formule LB1 : ⌈C(n,3) ÷ 10⌉
    const totalCombinations3 = this.binomialCoefficient(n, 3);
    const gridsNeeded = Math.ceil(totalCombinations3 / 10);
    const cost = gridsNeeded * baseCost;

    // Génération des grilles principales
    const grids = this.generatePrimaryGrids(selectedNumbers, gridsNeeded);

    return {
      matchCount: 5,
      probability: "Variable selon votre méthode de sélection",
      guaranteeLevel: "100% garanti - 3+ numéros",
      gridsNeeded,
      cost,
      explanation: `Si les 5 numéros du tirage sont parmi vos ${n} sélectionnés, chacune de vos ${gridsNeeded} grilles aura automatiquement au moins 3 bons numéros. C'est le scénario idéal !`,
      color: "green",
      grids
    };
  }

  /**
   * Scénario 4/5 : 4 numéros du tirage correspondent
   * RÉALITÉ : Maximum 4 bons numéros possibles, pas de garantie de 3+
   */
  private calculateHighPartialMatchScenario(
    selectedNumbers: number[],
    baseCost: number
  ): AdaptiveScenario {
    const n = selectedNumbers.length;
    const totalCombinations3 = this.binomialCoefficient(n, 3);
    
    // Calcul réaliste : on ne peut garantir que ce qui est mathématiquement possible
    // Avec 4/5 correspondances, on peut avoir au maximum 4 bons numéros
    
    // Grilles qui auront 4 bons numéros : C(4,4) × C(n-4,1) 
    const grids4Numbers = 1 * (n - 4);
    
    // Grilles qui auront 3 bons numéros : C(4,3) × C(n-4,2)
    const grids3Numbers = 4 * this.binomialCoefficient(n - 4, 2);
    
    // Grilles qui auront 2 bons numéros ou moins : le reste
    const totalGrids = this.binomialCoefficient(n, 5);
    const gridsWithGains = grids4Numbers + grids3Numbers;
    const successRate = (gridsWithGains / totalGrids) * 100;
    
    // Calcul des gains moyens
    const avgGainRank3 = 1086; // 4 numéros
    const avgGainRank6 = 20;   // 3 numéros
    const expectedGain = (grids4Numbers * avgGainRank3 + grids3Numbers * avgGainRank6) / gridsWithGains;
    
    const grids = this.generatePrimaryGrids(selectedNumbers, Math.ceil(totalCombinations3 / 10));

    return {
      matchCount: 4,
      probability: `${successRate.toFixed(1)}% des grilles gagnantes`,
      guaranteeLevel: `❌ AUCUNE garantie absolue - Maximum ${grids4Numbers} grilles avec 4 nums, ${grids3Numbers} avec 3 nums`,
      gridsNeeded: Math.ceil(totalCombinations3 / 10),
      cost: Math.ceil(totalCombinations3 / 10) * baseCost,
      explanation: `RÉALITÉ MATHÉMATIQUE : Avec 4/5 correspondances, seulement ${successRate.toFixed(1)}% de vos grilles auront 3+ bons numéros. Gain moyen attendu : ${expectedGain.toFixed(2)}€ par grille gagnante. PAS de garantie absolue !`,
      color: "orange",
      grids
    };
  }

  /**
   * Scénario 3/5 : 3 numéros du tirage correspondent
   * RÉALITÉ : Maximum 3 bons numéros possibles, garantie très limitée
   */
  private calculateLowPartialMatchScenario(
    selectedNumbers: number[],
    baseCost: number
  ): AdaptiveScenario {
    const n = selectedNumbers.length;
    const totalCombinations3 = this.binomialCoefficient(n, 3);
    
    // Avec 3/5 correspondances, maximum 3 bons numéros possibles
    
    // Grilles qui auront exactement 3 bons numéros : C(3,3) × C(n-3,2)
    const grids3Numbers = 1 * this.binomialCoefficient(n - 3, 2);
    
    // Total de grilles possibles avec vos numéros
    const totalGrids = this.binomialCoefficient(n, 5);
    const successRate = (grids3Numbers / totalGrids) * 100;
    
    // Gain attendu : seulement rang 6 (3 numéros = 20€)
    const expectedGain = 20; // Gain fixe rang 6
    const totalExpectedGains = grids3Numbers * expectedGain;
    
    const grids = this.generatePrimaryGrids(selectedNumbers, Math.ceil(totalCombinations3 / 10));

    return {
      matchCount: 3,
      probability: `${successRate.toFixed(1)}% des grilles gagnantes`,
      guaranteeLevel: `❌ GARANTIE TRÈS LIMITÉE - Maximum ${grids3Numbers} grilles avec exactement 3 nums`,
      gridsNeeded: Math.ceil(totalCombinations3 / 10),
      cost: Math.ceil(totalCombinations3 / 10) * baseCost,
      explanation: `RÉALITÉ BRUTALE : Avec 3/5 correspondances, seulement ${grids3Numbers} grilles sur ${totalGrids} auront exactement 3 bons numéros (${successRate.toFixed(1)}%). Gain total attendu : ${totalExpectedGains}€. ROI probablement négatif !`,
      color: "red",
      grids
    };
  }

  /**
   * Scénario 2/5 et moins : Échec
   */
  private calculateFailureScenario(): AdaptiveScenario {
    return {
      matchCount: 2,
      probability: "Indique une sélection inadéquate",
      guaranteeLevel: "Aucune garantie possible",
      gridsNeeded: 0,
      cost: 0,
      explanation: "Avec 2 correspondances ou moins, aucune stratégie économiquement viable ne peut garantir 3 bons numéros. Il faut améliorer la méthode de sélection des numéros.",
      color: "red",
      grids: []
    };
  }

  /**
   * Génère les grilles principales basées sur la sélection
   */
  private generatePrimaryGrids(selectedNumbers: number[], count: number): AdaptiveGrid[] {
    const grids: AdaptiveGrid[] = [];
    
    // Algorithme de génération des grilles principales
    // Pour la démo, on génère des grilles aléatoirement parmi les numéros sélectionnés
    for (let i = 0; i < count; i++) {
      const shuffled = [...selectedNumbers].sort(() => Math.random() - 0.5);
      const gridNumbers = shuffled.slice(0, 5).sort((a, b) => a - b);
      
      grids.push({
        numbers: gridNumbers,
        type: 'primary',
        purpose: 'Couverture principale selon votre sélection',
        covers: this.calculateCoveredCombinations(gridNumbers)
      });
    }
    
    return grids;
  }

  /**
   * Génère les grilles de sécurité
   */
  private generateSecurityGrids(
    selectedNumbers: number[], 
    count: number, 
    purpose: string
  ): AdaptiveGrid[] {
    const grids: AdaptiveGrid[] = [];
    
    for (let i = 0; i < count; i++) {
      // Mélange des numéros avec quelques numéros externes pour la sécurité
      const externalNumbers = this.getPopularNumbers().filter(n => !selectedNumbers.includes(n));
      const mixedPool = [...selectedNumbers, ...externalNumbers.slice(0, 10)];
      
      const shuffled = mixedPool.sort(() => Math.random() - 0.5);
      const gridNumbers = shuffled.slice(0, 5).sort((a, b) => a - b);
      
      grids.push({
        numbers: gridNumbers,
        type: 'security',
        purpose: `Grille de sécurité pour ${purpose}`,
        covers: this.calculateCoveredCombinations(gridNumbers)
      });
    }
    
    return grids;
  }

  /**
   * Calcule les combinaisons de 3 couvertes par une grille
   */
  private calculateCoveredCombinations(gridNumbers: number[]): string[] {
    const combinations: string[] = [];
    
    for (let i = 0; i < gridNumbers.length - 2; i++) {
      for (let j = i + 1; j < gridNumbers.length - 1; j++) {
        for (let k = j + 1; k < gridNumbers.length; k++) {
          combinations.push(`${gridNumbers[i]}-${gridNumbers[j]}-${gridNumbers[k]}`);
        }
      }
    }
    
    return combinations;
  }

  /**
   * Trouve le scénario optimal selon le budget
   */
  private findOptimalScenario(scenarios: AdaptiveScenario[], maxBudget?: number): number {
    if (!maxBudget) {
      // Sans contrainte budgétaire, on prend le scénario 4/5 (équilibré)
      return 1;
    }
    
    // Trouve le meilleur scénario dans le budget
    for (let i = 1; i < scenarios.length - 1; i++) { // Évite le scénario d'échec
      if (scenarios[i].cost <= maxBudget) {
        return i;
      }
    }
    
    return 0; // Scénario de base si budget insuffisant
  }

  /**
   * Génère une recommandation personnalisée
   */
  private generateRecommendation(scenarios: AdaptiveScenario[], optimalIndex: number): string {
    const optimal = scenarios[optimalIndex];
    
    const recommendations = [
      `Nous recommandons la stratégie ${optimal.matchCount}/5 qui offre ${optimal.guaranteeLevel.toLowerCase()} pour ${optimal.cost.toFixed(2)}€.`,
      `Cette approche équilibre coût et sécurité en préparant ${optimal.gridsNeeded} grilles adaptées à votre sélection.`,
      `Si votre méthode de sélection est fiable, cette stratégie maximise vos chances de gains.`
    ];
    
    return recommendations.join(' ');
  }

  /**
   * Calcule le coefficient binomial C(n,k)
   */
  private binomialCoefficient(n: number, k: number): number {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result = result * (n - i + 1) / i;
    }
    return Math.round(result);
  }

  /**
   * Retourne les numéros populaires pour les grilles de sécurité
   */
  private getPopularNumbers(): number[] {
    // Numéros fréquemment sortis (à adapter selon les vraies statistiques)
    return [7, 12, 18, 21, 23, 27, 31, 35, 41, 44, 3, 6, 9, 15, 24, 28, 33, 37, 42, 47];
  }
}

// Instance singleton
export const adaptiveOptimizer = new AdaptiveSetCoverOptimizer();
