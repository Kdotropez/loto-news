interface TirageData {
  date: string;
  numero1?: number;
  numero2?: number;
  numero3?: number;
  numero4?: number;
  numero5?: number;
  complementaire?: number;
  joker?: string | null;
  boule_1?: number;
  boule_2?: number;
  boule_3?: number;
  boule_4?: number;
  boule_5?: number;
  numero_chance?: number;
}

interface GridConfiguration {
  gridType: 'simple' | 'multiple';
  numbersSelected: number[];
  complementarySelected: number[];
  totalGridsNeeded: number;
  costPerGrid: number;
  totalCost: number;
  winProbabilities: {
    rank1: { probability: number; expectedGain: number; roi: number };
    rank2: { probability: number; expectedGain: number; roi: number };
    rank3: { probability: number; expectedGain: number; roi: number };
    rank4: { probability: number; expectedGain: number; roi: number };
    rank5: { probability: number; expectedGain: number; roi: number };
  };
  expectedReturn: number;
  breakEvenProbability: number;
}

interface StrategyFinancialAnalysis {
  strategyName: string;
  numbersSelected: number[];
  complementarySelected: number[];
  totalNumbersCount: number;
  
  // Configurations de jeu possibles
  simpleGrids: GridConfiguration;
  multipleGrids: GridConfiguration;
  hybridApproach: GridConfiguration;
  
  // Analyse comparative
  bestApproach: {
    type: 'simple' | 'multiple' | 'hybrid';
    reasoning: string;
    expectedROI: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  
  // Optimisations de mélange
  optimalMixing: {
    recommendedSubsets: Array<{
      numbers: number[];
      complementary: number[];
      cost: number;
      expectedReturn: number;
      roi: number;
      winProbability: number;
      reasoning: string;
    }>;
    budgetStrategies: Array<{
      budget: number;
      strategy: string;
      gridsCount: number;
      expectedReturn: number;
      riskProfile: string;
    }>;
  };
  
  // Métriques de performance
  performanceMetrics: {
    costEfficiency: number; // Gain potentiel / Coût
    riskAdjustedReturn: number;
    probabilityWeightedROI: number;
    sharpeRatio: number; // (Return - RiskFreeRate) / Volatility
  };
}

interface LotoPrizes {
  rank1: number; // 5 + complémentaire
  rank2: number; // 5 numéros
  rank3: number; // 4 + complémentaire
  rank4: number; // 4 numéros
  rank5: number; // 3 numéros
}

export class FinancialStrategyAnalyzer {
  private readonly SIMPLE_GRID_COST = 2.20; // €
  private readonly MULTIPLE_GRID_BASE_COST = 2.20; // €
  
  // Prix moyens Loto (approximatifs)
  private readonly AVERAGE_PRIZES: LotoPrizes = {
    rank1: 4000000, // 4M€ en moyenne
    rank2: 100000,  // 100k€ en moyenne
    rank3: 1000,    // 1k€ en moyenne
    rank4: 50,      // 50€ en moyenne
    rank5: 10       // 10€ en moyenne
  };

  constructor() {}

  /**
   * Analyse financière complète d'une stratégie
   */
  public analyzeStrategyFinancials(
    strategyName: string,
    numbersSelected: number[],
    complementarySelected: number[] = [1, 2, 3, 4, 5]
  ): StrategyFinancialAnalysis {
    console.log(`💰 Analyse financière: ${strategyName} (${numbersSelected.length} numéros, ${complementarySelected.length} complémentaires)`);
    
    // Calculer les configurations de grilles
    const simpleGrids = this.calculateSimpleGridConfiguration(numbersSelected, complementarySelected);
    const multipleGrids = this.calculateMultipleGridConfiguration(numbersSelected, complementarySelected);
    const hybridApproach = this.calculateHybridConfiguration(numbersSelected, complementarySelected);
    
    // Déterminer la meilleure approche
    const bestApproach = this.determineBestApproach(simpleGrids, multipleGrids, hybridApproach);
    
    // Calculer les optimisations de mélange
    const optimalMixing = this.calculateOptimalMixing(numbersSelected, complementarySelected);
    
    // Calculer les métriques de performance
    const performanceMetrics = this.calculatePerformanceMetrics(simpleGrids, multipleGrids, hybridApproach);
    
    return {
      strategyName,
      numbersSelected,
      complementarySelected,
      totalNumbersCount: numbersSelected.length,
      simpleGrids,
      multipleGrids,
      hybridApproach,
      bestApproach,
      optimalMixing,
      performanceMetrics
    };
  }

  /**
   * Calcule la configuration pour grilles simples
   */
  private calculateSimpleGridConfiguration(numbersSelected: number[], complementarySelected: number[]): GridConfiguration {
    // Pour jouer tous les numéros en grilles simples
    const totalCombinations = this.calculateCombinations(numbersSelected.length, 5);
    const totalGridsNeeded = totalCombinations * complementarySelected.length;
    const totalCost = totalGridsNeeded * this.SIMPLE_GRID_COST;
    
    // Calculer les probabilités de gain
    const winProbabilities = this.calculateWinProbabilities(numbersSelected.length, complementarySelected.length, 'simple');
    
    // Calculer le retour attendu
    const expectedReturn = this.calculateExpectedReturn(winProbabilities);
    
    return {
      gridType: 'simple',
      numbersSelected,
      complementarySelected,
      totalGridsNeeded,
      costPerGrid: this.SIMPLE_GRID_COST,
      totalCost,
      winProbabilities,
      expectedReturn,
      breakEvenProbability: (totalCost / this.AVERAGE_PRIZES.rank5) / totalGridsNeeded
    };
  }

  /**
   * Calcule la configuration pour grilles multiples
   */
  private calculateMultipleGridConfiguration(numbersSelected: number[], complementarySelected: number[]): GridConfiguration {
    // Coût d'une grille multiple = coût des combinaisons couvertes
    const combinations = this.calculateCombinations(numbersSelected.length, 5);
    const totalGridsNeeded = 1; // Une seule grille multiple
    const costPerGrid = combinations * complementarySelected.length * this.MULTIPLE_GRID_BASE_COST;
    const totalCost = costPerGrid;
    
    // Probabilités identiques aux grilles simples mais grille unique
    const winProbabilities = this.calculateWinProbabilities(numbersSelected.length, complementarySelected.length, 'multiple');
    
    const expectedReturn = this.calculateExpectedReturn(winProbabilities);
    
    return {
      gridType: 'multiple',
      numbersSelected,
      complementarySelected,
      totalGridsNeeded,
      costPerGrid,
      totalCost,
      winProbabilities,
      expectedReturn,
      breakEvenProbability: (totalCost / this.AVERAGE_PRIZES.rank5)
    };
  }

  /**
   * Calcule une approche hybride optimisée
   */
  private calculateHybridConfiguration(numbersSelected: number[], complementarySelected: number[]): GridConfiguration {
    // Approche hybride : sélectionner les meilleurs sous-ensembles
    const optimalSubsetSize = Math.min(12, numbersSelected.length); // Limite intelligente
    const bestNumbers = numbersSelected.slice(0, optimalSubsetSize); // Prendre les meilleurs
    const bestComplementary = complementarySelected.slice(0, 3); // Top 3 complémentaires
    
    const combinations = this.calculateCombinations(optimalSubsetSize, 5);
    const totalGridsNeeded = Math.min(combinations * bestComplementary.length, 1000); // Limite raisonnable
    const totalCost = totalGridsNeeded * this.SIMPLE_GRID_COST;
    
    const winProbabilities = this.calculateWinProbabilities(optimalSubsetSize, bestComplementary.length, 'hybrid');
    const expectedReturn = this.calculateExpectedReturn(winProbabilities);
    
    return {
      gridType: 'simple', // Techniquement des grilles simples mais optimisées
      numbersSelected: bestNumbers,
      complementarySelected: bestComplementary,
      totalGridsNeeded,
      costPerGrid: this.SIMPLE_GRID_COST,
      totalCost,
      winProbabilities,
      expectedReturn,
      breakEvenProbability: (totalCost / this.AVERAGE_PRIZES.rank5) / totalGridsNeeded
    };
  }

  /**
   * Détermine la meilleure approche financière
   */
  private determineBestApproach(
    simple: GridConfiguration, 
    multiple: GridConfiguration, 
    hybrid: GridConfiguration
  ): StrategyFinancialAnalysis['bestApproach'] {
    const approaches = [
      { type: 'simple' as const, config: simple, roi: (simple.expectedReturn - simple.totalCost) / simple.totalCost },
      { type: 'multiple' as const, config: multiple, roi: (multiple.expectedReturn - multiple.totalCost) / multiple.totalCost },
      { type: 'hybrid' as const, config: hybrid, roi: (hybrid.expectedReturn - hybrid.totalCost) / hybrid.totalCost }
    ];
    
    // Trier par ROI
    const bestByROI = approaches.sort((a, b) => b.roi - a.roi)[0];
    
    let reasoning = '';
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    
    if (bestByROI.type === 'simple') {
      reasoning = `Grilles simples recommandées : coût élevé (${simple.totalCost.toFixed(2)}€) mais probabilités maximales`;
      riskLevel = simple.totalCost > 1000 ? 'high' : simple.totalCost > 100 ? 'medium' : 'low';
    } else if (bestByROI.type === 'multiple') {
      reasoning = `Grille multiple recommandée : coût modéré (${multiple.totalCost.toFixed(2)}€) avec couverture complète`;
      riskLevel = multiple.totalCost > 500 ? 'high' : 'medium';
    } else {
      reasoning = `Approche hybride recommandée : meilleur équilibre coût/efficacité (${hybrid.totalCost.toFixed(2)}€)`;
      riskLevel = hybrid.totalCost > 200 ? 'medium' : 'low';
    }
    
    return {
      type: bestByROI.type,
      reasoning,
      expectedROI: bestByROI.roi * 100,
      riskLevel
    };
  }


  /**
   * Calcule les probabilités de gain par rang
   */
  private calculateWinProbabilities(numbersCount: number, complementaryCount: number, gridType: string): GridConfiguration['winProbabilities'] {
    // Probabilités théoriques Loto
    const totalNumbers = 49;
    const totalComplementary = 10;
    
    // Probabilité d'avoir exactement k numéros corrects parmi les 5
    const probabilities = {
      rank1: this.calculateHypergeometric(5, 5, numbersCount, totalNumbers) * (complementaryCount / totalComplementary),
      rank2: this.calculateHypergeometric(5, 5, numbersCount, totalNumbers) * (1 - complementaryCount / totalComplementary),
      rank3: this.calculateHypergeometric(5, 4, numbersCount, totalNumbers) * (complementaryCount / totalComplementary),
      rank4: this.calculateHypergeometric(5, 4, numbersCount, totalNumbers) * (1 - complementaryCount / totalComplementary),
      rank5: this.calculateHypergeometric(5, 3, numbersCount, totalNumbers)
    };
    
    return {
      rank1: {
        probability: probabilities.rank1,
        expectedGain: probabilities.rank1 * this.AVERAGE_PRIZES.rank1,
        roi: ((probabilities.rank1 * this.AVERAGE_PRIZES.rank1) / this.SIMPLE_GRID_COST - 1) * 100
      },
      rank2: {
        probability: probabilities.rank2,
        expectedGain: probabilities.rank2 * this.AVERAGE_PRIZES.rank2,
        roi: ((probabilities.rank2 * this.AVERAGE_PRIZES.rank2) / this.SIMPLE_GRID_COST - 1) * 100
      },
      rank3: {
        probability: probabilities.rank3,
        expectedGain: probabilities.rank3 * this.AVERAGE_PRIZES.rank3,
        roi: ((probabilities.rank3 * this.AVERAGE_PRIZES.rank3) / this.SIMPLE_GRID_COST - 1) * 100
      },
      rank4: {
        probability: probabilities.rank4,
        expectedGain: probabilities.rank4 * this.AVERAGE_PRIZES.rank4,
        roi: ((probabilities.rank4 * this.AVERAGE_PRIZES.rank4) / this.SIMPLE_GRID_COST - 1) * 100
      },
      rank5: {
        probability: probabilities.rank5,
        expectedGain: probabilities.rank5 * this.AVERAGE_PRIZES.rank5,
        roi: ((probabilities.rank5 * this.AVERAGE_PRIZES.rank5) / this.SIMPLE_GRID_COST - 1) * 100
      }
    };
  }

  /**
   * Calcule le nombre de combinaisons C(n,k)
   */
  private calculateCombinations(n: number, k: number): number {
    if (k > n || k < 0) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result = result * (n - i + 1) / i;
    }
    return Math.round(result);
  }

  /**
   * Calcule la probabilité hypergéométrique
   */
  private calculateHypergeometric(drawSize: number, successes: number, sampleSize: number, populationSize: number): number {
    const successInSample = Math.min(successes, sampleSize);
    const failureInSample = drawSize - successInSample;
    const failures = populationSize - sampleSize;
    
    if (failureInSample > failures || successInSample < 0) return 0;
    
    const numerator = this.calculateCombinations(sampleSize, successInSample) * 
                     this.calculateCombinations(failures, failureInSample);
    const denominator = this.calculateCombinations(populationSize, drawSize);
    
    return denominator > 0 ? numerator / denominator : 0;
  }

  /**
   * Calcule le retour attendu
   */
  private calculateExpectedReturn(winProbabilities: GridConfiguration['winProbabilities']): number {
    return winProbabilities.rank1.expectedGain +
           winProbabilities.rank2.expectedGain +
           winProbabilities.rank3.expectedGain +
           winProbabilities.rank4.expectedGain +
           winProbabilities.rank5.expectedGain;
  }

  /**
   * Calcule les métriques de performance
   */
  private calculatePerformanceMetrics(
    simple: GridConfiguration, 
    multiple: GridConfiguration, 
    hybrid: GridConfiguration
  ): StrategyFinancialAnalysis['performanceMetrics'] {
    
    const configs = [simple, multiple, hybrid];
    
    // Efficacité coût
    const costEfficiencies = configs.map(config => config.expectedReturn / config.totalCost);
    const avgCostEfficiency = costEfficiencies.reduce((a, b) => a + b, 0) / costEfficiencies.length;
    
    // ROI ajusté au risque
    const riskAdjustedReturns = configs.map(config => {
      const roi = (config.expectedReturn - config.totalCost) / config.totalCost;
      const riskPenalty = config.totalCost > 1000 ? 0.8 : config.totalCost > 100 ? 0.9 : 1.0;
      return roi * riskPenalty;
    });
    const avgRiskAdjustedReturn = riskAdjustedReturns.reduce((a, b) => a + b, 0) / riskAdjustedReturns.length;
    
    // ROI pondéré par probabilité
    const probabilityWeightedROIs = configs.map(config => {
      const totalWinProb = Object.values(config.winProbabilities).reduce((acc, rank) => acc + rank.probability, 0);
      const roi = (config.expectedReturn - config.totalCost) / config.totalCost;
      return roi * totalWinProb * 1000; // Multiplié par 1000 pour avoir des valeurs lisibles
    });
    const avgProbabilityWeightedROI = probabilityWeightedROIs.reduce((a, b) => a + b, 0) / probabilityWeightedROIs.length;
    
    // Ratio de Sharpe simplifié
    const returns = configs.map(config => (config.expectedReturn - config.totalCost) / config.totalCost);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);
    const sharpeRatio = volatility > 0 ? avgReturn / volatility : 0;
    
    return {
      costEfficiency: Math.round(avgCostEfficiency * 1000) / 1000,
      riskAdjustedReturn: Math.round(avgRiskAdjustedReturn * 100 * 100) / 100,
      probabilityWeightedROI: Math.round(avgProbabilityWeightedROI * 100) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100
    };
  }

  /**
   * Trouve les mélanges optimaux pour différents budgets
   */
  private calculateOptimalMixing(numbersSelected: number[], complementarySelected: number[]): StrategyFinancialAnalysis['optimalMixing'] {
    const subsets = [];
    const budgetStrategies = [];
    
    // Générer des sous-ensembles de différentes tailles
    for (let size = 6; size <= Math.min(15, numbersSelected.length); size += 2) {
      const subset = numbersSelected.slice(0, size);
      const topComp = complementarySelected.slice(0, 2);
      
      const combinations = this.calculateCombinations(size, 5);
      const cost = combinations * topComp.length * this.SIMPLE_GRID_COST;
      
      if (cost <= 2000) { // Limite raisonnable
        const winProb = this.calculateWinProbabilities(size, topComp.length, 'simple');
        const expectedReturn = this.calculateExpectedReturn(winProb);
        const roi = ((expectedReturn - cost) / cost) * 100;
        const winProbability = Object.values(winProb).reduce((acc, rank) => acc + rank.probability, 0) * 100;
        
        subsets.push({
          numbers: subset,
          complementary: topComp,
          cost: Math.round(cost * 100) / 100,
          expectedReturn: Math.round(expectedReturn * 100) / 100,
          roi: Math.round(roi * 10) / 10,
          winProbability: Math.round(winProbability * 1000) / 1000,
          reasoning: `${size} numéros → ${combinations} grilles → Coût: ${cost.toFixed(0)}€ → Efficacité: ${((5/size) * 100).toFixed(1)}%`
        });
      }
    }
    
    // Stratégies par budget
    const budgets = [50, 100, 200, 500];
    
    for (const budget of budgets) {
      const maxGrids = Math.floor(budget / this.SIMPLE_GRID_COST);
      
      // Trouver la configuration optimale pour ce budget
      let bestForBudget = null;
      let bestROI = -100;
      
      for (const subset of subsets) {
        const gridsNeeded = Math.ceil(subset.cost / this.SIMPLE_GRID_COST);
        if (subset.cost <= budget) {
          if (subset.roi > bestROI) {
            bestROI = subset.roi;
            bestForBudget = subset;
          }
        }
      }
      
      if (bestForBudget) {
        budgetStrategies.push({
          budget,
          strategy: `${bestForBudget.numbers.length} numéros sélectionnés`,
          gridsCount: Math.ceil(bestForBudget.cost / this.SIMPLE_GRID_COST),
          expectedReturn: bestForBudget.expectedReturn,
          riskProfile: this.getRiskProfile(budget, bestForBudget.cost)
        });
      }
    }
    
    return {
      recommendedSubsets: subsets.sort((a, b) => b.roi - a.roi).slice(0, 5),
      budgetStrategies
    };
  }

  private getRiskProfile(budget: number, cost: number): string {
    const ratio = cost / budget;
    if (ratio > 0.8) return 'Agressif (>80% du budget)';
    if (ratio > 0.5) return 'Modéré (50-80% du budget)';
    return 'Conservateur (<50% du budget)';
  }

  /**
   * Analyse comparative rapide
   */
  public quickFinancialComparison(strategies: Array<{
    name: string;
    numbersCount: number;
    efficiency: number;
  }>): Array<{
    strategy: string;
    numbersCount: number;
    efficiency: number;
    estimatedCost: number;
    estimatedROI: number;
    recommendation: string;
  }> {
    return strategies.map(strategy => {
      const combinations = this.calculateCombinations(strategy.numbersCount, 5);
      const estimatedCost = combinations * 3 * this.SIMPLE_GRID_COST; // 3 complémentaires
      const estimatedROI = (strategy.efficiency / 100) * 50 - 100; // Estimation simplifiée
      
      let recommendation = '';
      if (strategy.efficiency > 50) {
        recommendation = '🎯 Excellent rapport efficacité/coût';
      } else if (strategy.efficiency > 30) {
        recommendation = '⚖️ Équilibré, acceptable';
      } else if (strategy.efficiency > 15) {
        recommendation = '⚠️ Coût élevé pour l\'efficacité';
      } else {
        recommendation = '❌ Inefficace, trop de numéros';
      }
      
      return {
        strategy: strategy.name,
        numbersCount: strategy.numbersCount,
        efficiency: strategy.efficiency,
        estimatedCost: Math.round(estimatedCost * 100) / 100,
        estimatedROI: Math.round(estimatedROI * 10) / 10,
        recommendation
      };
    });
  }
}
