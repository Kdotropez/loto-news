interface TirageData {
  date: string;
  numero1?: number;
  numero2?: number;
  numero3?: number;
  numero4?: number;
  numero5?: number;
  complementaire?: number;
  joker?: string | null;
  // Format alternatif
  boule_1?: number;
  boule_2?: number;
  boule_3?: number;
  boule_4?: number;
  boule_5?: number;
  numero_chance?: number;
}

interface ConfigurationAssociation {
  configurationName: string;
  patterns: string[];
  parameters: Record<string, any>;
  mainNumbers: number[];
  complementaryNumbers: number[];
  gridType: 'simple' | 'multiple';
  matchScore: {
    mainNumbers: number; // Score sur les 5 numéros principaux
    complementary: number; // Score sur le complémentaire
    total: number; // Score global
  };
  efficiency: {
    numbersGenerated: number;
    numbersMatched: number;
    complementaryGenerated: number;
    complementaryMatched: number;
    precision: number; // Précision = matches/generated
    recall: number; // Recall = matches/total_possible
  };
  contextualFactors: {
    periodUsed: string;
    seasonality: string;
    dayOfWeek: string;
    monthOfYear: string;
    trendDirection: string;
  };
}

interface LearningInsight {
  insightType: 'pattern_combination' | 'parameter_optimization' | 'contextual_rule' | 'complementary_strategy';
  title: string;
  description: string;
  confidence: number;
  applicability: {
    conditions: string[];
    expectedImprovement: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  implementation: {
    targetComponent: 'intelligent_analysis' | 'pattern_selector' | 'complementary_analyzer';
    changes: Record<string, any>;
    priority: 'high' | 'medium' | 'low';
  };
}

interface AILearningResult {
  targetDraw: {
    date: string;
    numbers: number[];
    complementary: number;
  };
  allPossibleConfigurations: ConfigurationAssociation[];
  bestConfigurations: {
    simple: ConfigurationAssociation[];
    multiple: ConfigurationAssociation[];
    hybrid: ConfigurationAssociation[];
  };
  complementaryAnalysis: {
    bestStrategies: Array<{
      strategy: string;
      predictedNumbers: number[];
      actualNumber: number;
      success: boolean;
      confidence: number;
    }>;
    patterns: Array<{
      pattern: string;
      frequency: number;
      effectiveness: number;
    }>;
  };
  learningInsights: LearningInsight[];
  optimizationRecommendations: {
    intelligentAnalysis: {
      weightAdjustments: Record<string, number>;
      newPatterns: string[];
      parameterTuning: Record<string, any>;
    };
    complementaryStrategy: {
      preferredMethods: string[];
      contextualRules: Array<{
        condition: string;
        action: string;
        confidence: number;
      }>;
    };
  };
  performanceMetrics: {
    totalConfigurationsTested: number;
    bestSimpleGridScore: number;
    bestMultipleGridScore: number;
    complementarySuccessRate: number;
    overallLearningScore: number;
  };
}

export class AILearningEngine {
  private tirages: TirageData[];
  private learningHistory: Map<string, AILearningResult> = new Map();
  private optimizationWeights: Record<string, number> = {
    frequency: 1.0,
    gaps: 1.0,
    trends: 1.0,
    patterns: 1.0,
    mathematical: 1.0,
    complementary: 1.0
  };

  constructor(tirages: TirageData[]) {
    this.tirages = tirages.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    this.loadLearningHistory();
  }

  /**
   * Analyse complète d'apprentissage sur un tirage spécifique
   */
  public async performCompleteLearningAnalysis(targetDraw: TirageData, previousDraws: TirageData[]): Promise<AILearningResult> {
    console.log(`🧠 IA - Analyse d'apprentissage pour ${targetDraw.date}`);
    
    const actualNumbers = this.extractNumbers(targetDraw);
    const actualComplementary = this.extractComplementary(targetDraw);
    
    // 1. Générer TOUTES les configurations possibles
    const allConfigurations = await this.generateAllPossibleConfigurations(previousDraws, actualNumbers, actualComplementary);
    
    // 2. Analyser spécifiquement le complémentaire
    const complementaryAnalysis = await this.analyzeComplementaryStrategies(previousDraws, actualComplementary);
    
    // 3. Classer les configurations par type de grille
    const bestConfigurations = this.classifyConfigurationsByGridType(allConfigurations);
    
    // 4. Extraire les insights d'apprentissage
    const learningInsights = this.extractLearningInsights(allConfigurations, complementaryAnalysis);
    
    // 5. Générer les recommandations d'optimisation
    const optimizationRecommendations = this.generateOptimizationRecommendations(learningInsights, allConfigurations);
    
    // 6. Calculer les métriques de performance
    const performanceMetrics = this.calculatePerformanceMetrics(allConfigurations, complementaryAnalysis);
    
    const result: AILearningResult = {
      targetDraw: {
        date: targetDraw.date,
        numbers: actualNumbers,
        complementary: actualComplementary
      },
      allPossibleConfigurations: allConfigurations,
      bestConfigurations,
      complementaryAnalysis,
      learningInsights,
      optimizationRecommendations,
      performanceMetrics
    };
    
    // 7. Sauvegarder pour l'apprentissage futur
    this.saveLearningResult(targetDraw.date, result);
    
    // 8. Mettre à jour les poids d'optimisation
    this.updateOptimizationWeights(result);
    
    console.log(`✅ IA - Apprentissage terminé: ${allConfigurations.length} configurations analysées`);
    
    return result;
  }

  /**
   * Génère toutes les configurations possibles
   */
  private async generateAllPossibleConfigurations(
    previousDraws: TirageData[], 
    actualNumbers: number[], 
    actualComplementary: number
  ): Promise<ConfigurationAssociation[]> {
    const configurations: ConfigurationAssociation[] = [];
    
    // Définir toutes les combinaisons possibles de patterns
    const patternCombinations = [
      // Configurations simples (1 pattern)
      { patterns: ['hot_numbers'], name: 'Numéros Chauds Purs' },
      { patterns: ['cold_numbers'], name: 'Numéros Froids Purs' },
      { patterns: ['moderate_gaps'], name: 'Écarts Modérés Purs' },
      { patterns: ['critical_gaps'], name: 'Retards Critiques Purs' },
      { patterns: ['parity_even'], name: 'Parité Pairs Purs' },
      { patterns: ['parity_odd'], name: 'Parité Impairs Purs' },
      { patterns: ['zones_left'], name: 'Zone Gauche Pure' },
      { patterns: ['zones_center'], name: 'Zone Centre Pure' },
      { patterns: ['zones_right'], name: 'Zone Droite Pure' },
      
      // Configurations doubles (2 patterns)
      { patterns: ['hot_numbers', 'moderate_gaps'], name: 'Chauds + Écarts Modérés' },
      { patterns: ['cold_numbers', 'critical_gaps'], name: 'Froids + Retards Critiques' },
      { patterns: ['hot_numbers', 'parity_even'], name: 'Chauds + Pairs' },
      { patterns: ['hot_numbers', 'parity_odd'], name: 'Chauds + Impairs' },
      { patterns: ['zones_center', 'moderate_gaps'], name: 'Centre + Écarts Modérés' },
      { patterns: ['parity_even', 'zones_left'], name: 'Pairs + Zone Gauche' },
      { patterns: ['parity_odd', 'zones_right'], name: 'Impairs + Zone Droite' },
      
      // Configurations triples (3 patterns)
      { patterns: ['hot_numbers', 'moderate_gaps', 'parity_even'], name: 'Chauds + Écarts + Pairs' },
      { patterns: ['cold_numbers', 'critical_gaps', 'parity_odd'], name: 'Froids + Retards + Impairs' },
      { patterns: ['zones_center', 'moderate_gaps', 'hot_numbers'], name: 'Centre + Écarts + Chauds' },
      { patterns: ['balanced_frequency', 'zones_center', 'moderate_gaps'], name: 'Équilibré + Centre + Écarts' },
      
      // Configurations complexes (4+ patterns)
      { patterns: ['hot_numbers', 'moderate_gaps', 'parity_even', 'zones_center'], name: 'Quadruple Optimisé' },
      { patterns: ['balanced_frequency', 'moderate_gaps', 'parity_mixed', 'zones_balanced'], name: 'Multi-Pattern Équilibré' },
      { patterns: ['hot_numbers', 'cold_numbers', 'moderate_gaps', 'critical_gaps', 'parity_mixed'], name: 'Configuration Complète' }
    ];
    
    // Tester chaque combinaison avec différents paramètres
    for (const combo of patternCombinations) {
      // Grille simple
      const simpleConfig = await this.testConfiguration(
        combo, 
        previousDraws, 
        actualNumbers, 
        actualComplementary, 
        'simple'
      );
      configurations.push(simpleConfig);
      
      // Grille multiple
      const multipleConfig = await this.testConfiguration(
        combo, 
        previousDraws, 
        actualNumbers, 
        actualComplementary, 
        'multiple'
      );
      configurations.push(multipleConfig);
    }
    
    return configurations;
  }

  /**
   * Teste une configuration spécifique
   */
  private async testConfiguration(
    combo: { patterns: string[]; name: string },
    previousDraws: TirageData[],
    actualNumbers: number[],
    actualComplementary: number,
    gridType: 'simple' | 'multiple'
  ): Promise<ConfigurationAssociation> {
    
    // Générer les numéros selon cette configuration
    const generatedNumbers = await this.generateNumbersFromPatterns(combo.patterns, previousDraws, gridType);
    const generatedComplementary = await this.generateComplementaryFromPatterns(combo.patterns, previousDraws);
    
    // Calculer les scores de correspondance
    const mainMatches = actualNumbers.filter(num => generatedNumbers.includes(num));
    const complementaryMatches = generatedComplementary.includes(actualComplementary) ? 1 : 0;
    
    const mainScore = (mainMatches.length / 5) * 100;
    const complementaryScore = complementaryMatches * 100;
    const totalScore = (mainScore * 0.8) + (complementaryScore * 0.2); // 80% main, 20% complementary
    
    // Calculer l'efficacité
    const precision = (mainMatches.length + complementaryMatches) / (generatedNumbers.length + generatedComplementary.length);
    const recall = (mainMatches.length + complementaryMatches) / 6; // 5 main + 1 complementary
    
    return {
      configurationName: `${combo.name} (${gridType})`,
      patterns: combo.patterns,
      parameters: this.getPatternParameters(combo.patterns),
      mainNumbers: generatedNumbers,
      complementaryNumbers: generatedComplementary,
      gridType,
      matchScore: {
        mainNumbers: mainScore,
        complementary: complementaryScore,
        total: totalScore
      },
      efficiency: {
        numbersGenerated: generatedNumbers.length,
        numbersMatched: mainMatches.length,
        complementaryGenerated: generatedComplementary.length,
        complementaryMatched: complementaryMatches,
        precision,
        recall
      },
      contextualFactors: this.extractContextualFactors(previousDraws)
    };
  }

  /**
   * Analyse spécifique des stratégies complémentaires
   */
  private async analyzeComplementaryStrategies(previousDraws: TirageData[], actualComplementary: number): Promise<AILearningResult['complementaryAnalysis']> {
    const complementaryStrategies = [
      { name: 'Fréquence Complémentaire', method: this.getComplementaryByFrequency },
      { name: 'Écarts Complémentaire', method: this.getComplementaryByGaps },
      { name: 'Parité Complémentaire', method: this.getComplementaryByParity },
      { name: 'Cycles Complémentaire', method: this.getComplementaryByCycles },
      { name: 'Tendances Complémentaire', method: this.getComplementaryByTrends },
      { name: 'Corrélation Principale', method: this.getComplementaryByCorrelation },
      { name: 'Patterns Temporels', method: this.getComplementaryByTemporal },
      { name: 'Analyse Statistique', method: this.getComplementaryByStatistics }
    ];
    
    const bestStrategies = [];
    const patterns = new Map<string, { frequency: number; effectiveness: number }>();
    
    for (const strategy of complementaryStrategies) {
      try {
        const predictedNumbers = await strategy.method.call(this, previousDraws);
        const success = predictedNumbers.includes(actualComplementary);
        const confidence = this.calculateComplementaryConfidence(strategy.name, previousDraws);
        
        bestStrategies.push({
          strategy: strategy.name,
          predictedNumbers: predictedNumbers.slice(0, 3), // Top 3 prédictions
          actualNumber: actualComplementary,
          success,
          confidence
        });
        
        // Analyser les patterns de cette stratégie
        const patternKey = `complementary_${strategy.name.toLowerCase().replace(' ', '_')}`;
        if (!patterns.has(patternKey)) {
          patterns.set(patternKey, { frequency: 0, effectiveness: 0 });
        }
        const pattern = patterns.get(patternKey)!;
        pattern.frequency++;
        if (success) pattern.effectiveness++;
        
      } catch (error) {
        console.warn(`Erreur stratégie complémentaire ${strategy.name}:`, error);
      }
    }
    
    // Trier par succès puis par confiance
    bestStrategies.sort((a, b) => {
      if (a.success !== b.success) return b.success ? 1 : -1;
      return b.confidence - a.confidence;
    });
    
    return {
      bestStrategies,
      patterns: Array.from(patterns.entries()).map(([pattern, data]) => ({
        pattern,
        frequency: data.frequency,
        effectiveness: data.frequency > 0 ? (data.effectiveness / data.frequency) * 100 : 0
      }))
    };
  }

  /**
   * Extrait les insights d'apprentissage
   */
  private extractLearningInsights(
    configurations: ConfigurationAssociation[], 
    complementaryAnalysis: AILearningResult['complementaryAnalysis']
  ): LearningInsight[] {
    const insights: LearningInsight[] = [];
    
    // Insight 1: Meilleure combinaison de patterns
    const bestConfig = configurations.sort((a, b) => b.matchScore.total - a.matchScore.total)[0];
    if (bestConfig && bestConfig.matchScore.total > 60) {
      insights.push({
        insightType: 'pattern_combination',
        title: 'Combinaison de Patterns Optimale Identifiée',
        description: `La combinaison "${bestConfig.configurationName}" a obtenu ${bestConfig.matchScore.total.toFixed(1)}% de correspondance. Patterns utilisés: ${bestConfig.patterns.join(', ')}.`,
        confidence: Math.min(95, bestConfig.matchScore.total + 20),
        applicability: {
          conditions: [`Contexte similaire: ${bestConfig.contextualFactors.periodUsed}`, `Type de grille: ${bestConfig.gridType}`],
          expectedImprovement: bestConfig.matchScore.total - 50, // Amélioration vs hasard
          riskLevel: bestConfig.matchScore.total > 80 ? 'low' : 'medium'
        },
        implementation: {
          targetComponent: 'intelligent_analysis',
          changes: {
            preferredPatterns: bestConfig.patterns,
            patternWeights: this.calculateOptimalWeights(bestConfig.patterns),
            gridTypePreference: bestConfig.gridType
          },
          priority: 'high'
        }
      });
    }
    
    // Insight 2: Optimisation des paramètres
    const highPrecisionConfigs = configurations.filter(c => c.efficiency.precision > 0.3);
    if (highPrecisionConfigs.length > 0) {
      const avgPrecision = highPrecisionConfigs.reduce((acc, c) => acc + c.efficiency.precision, 0) / highPrecisionConfigs.length;
      insights.push({
        insightType: 'parameter_optimization',
        title: 'Paramètres de Précision Optimisés',
        description: `${highPrecisionConfigs.length} configurations montrent une précision élevée (${(avgPrecision * 100).toFixed(1)}%). Optimisation des paramètres recommandée.`,
        confidence: 85,
        applicability: {
          conditions: ['Recherche de précision élevée', 'Minimisation du bruit'],
          expectedImprovement: (avgPrecision - 0.2) * 100,
          riskLevel: 'low'
        },
        implementation: {
          targetComponent: 'pattern_selector',
          changes: {
            precisionThreshold: avgPrecision,
            filterLowPrecision: true
          },
          priority: 'medium'
        }
      });
    }
    
    // Insight 3: Stratégie complémentaire
    const bestComplementaryStrategy = complementaryAnalysis.bestStrategies.find(s => s.success);
    if (bestComplementaryStrategy) {
      insights.push({
        insightType: 'complementary_strategy',
        title: 'Stratégie Complémentaire Efficace Identifiée',
        description: `La stratégie "${bestComplementaryStrategy.strategy}" a correctement prédit le complémentaire avec ${bestComplementaryStrategy.confidence}% de confiance.`,
        confidence: bestComplementaryStrategy.confidence,
        applicability: {
          conditions: ['Prédiction du numéro complémentaire', `Contexte de confiance > ${bestComplementaryStrategy.confidence - 10}%`],
          expectedImprovement: 20, // 20% d'amélioration sur le complémentaire
          riskLevel: bestComplementaryStrategy.confidence > 80 ? 'low' : 'medium'
        },
        implementation: {
          targetComponent: 'complementary_analyzer',
          changes: {
            preferredStrategy: bestComplementaryStrategy.strategy,
            confidenceThreshold: bestComplementaryStrategy.confidence - 10
          },
          priority: 'high'
        }
      });
    }
    
    // Insight 4: Règles contextuelles
    const contextualPatterns = this.identifyContextualPatterns(configurations);
    if (contextualPatterns.length > 0) {
      insights.push({
        insightType: 'contextual_rule',
        title: 'Règles Contextuelles Découvertes',
        description: `${contextualPatterns.length} règles contextuelles identifiées pour améliorer la prédiction selon le contexte.`,
        confidence: 75,
        applicability: {
          conditions: ['Application de règles contextuelles', 'Adaptation au contexte temporel'],
          expectedImprovement: 15,
          riskLevel: 'medium'
        },
        implementation: {
          targetComponent: 'intelligent_analysis',
          changes: {
            contextualRules: contextualPatterns
          },
          priority: 'medium'
        }
      });
    }
    
    return insights;
  }

  /**
   * Génère les recommandations d'optimisation
   */
  private generateOptimizationRecommendations(
    insights: LearningInsight[], 
    configurations: ConfigurationAssociation[]
  ): AILearningResult['optimizationRecommendations'] {
    
    // Analyser les poids optimaux
    const patternPerformance = new Map<string, number[]>();
    configurations.forEach(config => {
      config.patterns.forEach(pattern => {
        if (!patternPerformance.has(pattern)) {
          patternPerformance.set(pattern, []);
        }
        patternPerformance.get(pattern)!.push(config.matchScore.total);
      });
    });
    
    const weightAdjustments: Record<string, number> = {};
    patternPerformance.forEach((scores, pattern) => {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      weightAdjustments[pattern] = Math.max(0.5, Math.min(2.0, avgScore / 50)); // Normaliser entre 0.5 et 2.0
    });
    
    // Identifier les nouveaux patterns à ajouter
    const newPatterns = [];
    const highPerformingConfigs = configurations.filter(c => c.matchScore.total > 70);
    const uncommonPatterns = this.identifyUncommonPatterns(highPerformingConfigs);
    newPatterns.push(...uncommonPatterns);
    
    // Optimisation des paramètres
    const parameterTuning = this.analyzeParameterOptimization(configurations);
    
    // Stratégies complémentaires préférées
    const complementaryInsights = insights.filter(i => i.insightType === 'complementary_strategy');
    const preferredMethods = complementaryInsights.map(i => i.implementation.changes.preferredStrategy).filter(Boolean);
    
    // Règles contextuelles
    const contextualRules = insights
      .filter(i => i.insightType === 'contextual_rule')
      .flatMap(i => i.implementation.changes.contextualRules || []);
    
    return {
      intelligentAnalysis: {
        weightAdjustments,
        newPatterns,
        parameterTuning
      },
      complementaryStrategy: {
        preferredMethods,
        contextualRules
      }
    };
  }

  // MÉTHODES UTILITAIRES ET STRATÉGIES COMPLÉMENTAIRES

  private async generateNumbersFromPatterns(patterns: string[], previousDraws: TirageData[], gridType: 'simple' | 'multiple'): Promise<number[]> {
    const frequencies = this.calculateFrequencies(previousDraws);
    const gaps = this.calculateCurrentGaps(previousDraws);
    
    // LIMITE STRICTE : 20 numéros maximum pour toute association
    const maxNumbers = gridType === 'simple' ? 12 : 20;
    const numbersPerPattern = Math.floor(maxNumbers / patterns.length);
    
    const selectedNumbers = new Set<number>();
    
    for (const pattern of patterns) {
      let patternNumbers: number[] = [];
      
      switch (pattern) {
        case 'hot_numbers':
          patternNumbers = Object.entries(frequencies)
            .sort((a, b) => b[1] - a[1])
            .slice(0, numbersPerPattern)
            .map(([num]) => parseInt(num));
          break;
          
        case 'cold_numbers':
          patternNumbers = Object.entries(frequencies)
            .sort((a, b) => a[1] - b[1])
            .slice(0, numbersPerPattern)
            .map(([num]) => parseInt(num));
          break;
          
        case 'moderate_gaps':
          patternNumbers = Object.entries(gaps)
            .filter(([_, gap]) => gap >= 5 && gap <= 20)
            .sort((a, b) => b[1] - a[1])
            .slice(0, numbersPerPattern)
            .map(([num]) => parseInt(num));
          break;
          
        case 'critical_gaps':
          patternNumbers = Object.entries(gaps)
            .filter(([_, gap]) => gap >= 25)
            .sort((a, b) => b[1] - a[1])
            .slice(0, numbersPerPattern)
            .map(([num]) => parseInt(num));
          break;
          
        case 'parity_even':
          patternNumbers = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48]
            .slice(0, numbersPerPattern);
          break;
          
        case 'parity_odd':
          patternNumbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49]
            .slice(0, numbersPerPattern);
          break;
          
        case 'zones_left':
          patternNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
            .slice(0, numbersPerPattern);
          break;
          
        case 'zones_center':
          patternNumbers = [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33]
            .slice(0, numbersPerPattern);
          break;
          
        case 'zones_right':
          patternNumbers = [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49]
            .slice(0, numbersPerPattern);
          break;
          
        case 'balanced_frequency':
          const sorted = Object.entries(frequencies).sort((a, b) => b[1] - a[1]);
          const perGroup = Math.floor(numbersPerPattern / 3);
          patternNumbers = [
            ...sorted.slice(0, perGroup).map(([num]) => parseInt(num)), // Chauds
            ...sorted.slice(20, 20 + perGroup).map(([num]) => parseInt(num)), // Moyens
            ...sorted.slice(-perGroup).map(([num]) => parseInt(num)) // Froids
          ];
          break;
      }
      
      // Ajouter seulement le nombre alloué pour ce pattern
      patternNumbers.slice(0, numbersPerPattern).forEach(num => selectedNumbers.add(num));
    }
    
    // LIMITE ABSOLUE : jamais plus de 20 numéros
    const finalNumbers = Array.from(selectedNumbers).slice(0, maxNumbers);
    
    console.log(`📊 Pattern ${patterns.join('+')} → ${finalNumbers.length} numéros (limite: ${maxNumbers})`);
    
    return finalNumbers;
  }

  private async generateComplementaryFromPatterns(patterns: string[], previousDraws: TirageData[]): Promise<number[]> {
    const complementaryNumbers = new Set<number>();
    
    // Analyser les complémentaires historiques
    const complementaryFreq: Record<number, number> = {};
    for (let i = 1; i <= 10; i++) complementaryFreq[i] = 0;
    
    previousDraws.forEach(tirage => {
      const comp = this.extractComplementary(tirage);
      if (comp >= 1 && comp <= 10) {
        complementaryFreq[comp]++;
      }
    });
    
    // Stratégies selon les patterns
    if (patterns.includes('hot_numbers')) {
      // Complémentaires les plus fréquents
      const hotComp = Object.entries(complementaryFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([num]) => parseInt(num));
      hotComp.forEach(num => complementaryNumbers.add(num));
    }
    
    if (patterns.includes('cold_numbers')) {
      // Complémentaires les moins fréquents
      const coldComp = Object.entries(complementaryFreq)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 3)
        .map(([num]) => parseInt(num));
      coldComp.forEach(num => complementaryNumbers.add(num));
    }
    
    if (patterns.includes('parity_even')) {
      [2, 4, 6, 8, 10].forEach(num => complementaryNumbers.add(num));
    }
    
    if (patterns.includes('parity_odd')) {
      [1, 3, 5, 7, 9].forEach(num => complementaryNumbers.add(num));
    }
    
    // Si pas de pattern spécifique, utiliser les plus équilibrés
    if (complementaryNumbers.size === 0) {
      const balanced = Object.entries(complementaryFreq)
        .sort((a, b) => Math.abs(b[1] - (previousDraws.length / 10)) - Math.abs(a[1] - (previousDraws.length / 10)))
        .slice(0, 5)
        .map(([num]) => parseInt(num));
      balanced.forEach(num => complementaryNumbers.add(num));
    }
    
    return Array.from(complementaryNumbers).slice(0, 5);
  }

  // STRATÉGIES COMPLÉMENTAIRES SPÉCIALISÉES

  private async getComplementaryByFrequency(previousDraws: TirageData[]): Promise<number[]> {
    const freq: Record<number, number> = {};
    for (let i = 1; i <= 10; i++) freq[i] = 0;
    
    previousDraws.forEach(tirage => {
      const comp = this.extractComplementary(tirage);
      if (comp >= 1 && comp <= 10) freq[comp]++;
    });
    
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([num]) => parseInt(num));
  }

  private async getComplementaryByGaps(previousDraws: TirageData[]): Promise<number[]> {
    const lastAppearance: Record<number, number> = {};
    for (let i = 1; i <= 10; i++) lastAppearance[i] = -1;
    
    previousDraws.forEach((tirage, index) => {
      const comp = this.extractComplementary(tirage);
      if (comp >= 1 && comp <= 10) {
        lastAppearance[comp] = index;
      }
    });
    
    const gaps: Record<number, number> = {};
    for (let i = 1; i <= 10; i++) {
      gaps[i] = lastAppearance[i] >= 0 ? previousDraws.length - 1 - lastAppearance[i] : previousDraws.length;
    }
    
    return Object.entries(gaps)
      .filter(([_, gap]) => gap >= 5 && gap <= 15) // Écarts modérés
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([num]) => parseInt(num));
  }

  private async getComplementaryByParity(previousDraws: TirageData[]): Promise<number[]> {
    let evenCount = 0, oddCount = 0;
    
    previousDraws.forEach(tirage => {
      const comp = this.extractComplementary(tirage);
      if (comp % 2 === 0) evenCount++;
      else oddCount++;
    });
    
    return evenCount > oddCount ? [2, 4, 6] : [1, 3, 5];
  }

  private async getComplementaryByCycles(previousDraws: TirageData[]): Promise<number[]> {
    // Analyser les cycles de 7 (pattern temporel)
    return [7, 3, 1]; // Exemple de cycle
  }

  private async getComplementaryByTrends(previousDraws: TirageData[]): Promise<number[]> {
    const recent = previousDraws.slice(-10);
    return this.getComplementaryByFrequency(recent);
  }

  private async getComplementaryByCorrelation(previousDraws: TirageData[]): Promise<number[]> {
    // Analyser la corrélation avec les numéros principaux
    const correlations: Record<number, Record<number, number>> = {};
    
    previousDraws.forEach(tirage => {
      const numbers = this.extractNumbers(tirage);
      const comp = this.extractComplementary(tirage);
      
      numbers.forEach(num => {
        if (!correlations[num]) correlations[num] = {};
        if (!correlations[num][comp]) correlations[num][comp] = 0;
        correlations[num][comp]++;
      });
    });
    
    // Retourner les complémentaires les plus corrélés
    return [5, 8, 2]; // Exemple simplifié
  }

  private async getComplementaryByTemporal(previousDraws: TirageData[]): Promise<number[]> {
    const dayOfWeek = new Date().getDay();
    const temporalMap: Record<number, number[]> = {
      0: [7, 1, 4], // Dimanche
      1: [1, 8, 5], // Lundi
      2: [2, 9, 6], // Mardi
      3: [3, 10, 7], // Mercredi
      4: [4, 1, 8], // Jeudi
      5: [5, 2, 9], // Vendredi
      6: [6, 3, 10] // Samedi
    };
    
    return temporalMap[dayOfWeek] || [5, 2, 8];
  }

  private async getComplementaryByStatistics(previousDraws: TirageData[]): Promise<number[]> {
    // Analyse statistique avancée
    const freq = await this.getComplementaryByFrequency(previousDraws);
    const gaps = await this.getComplementaryByGaps(previousDraws);
    
    const combined = new Set([...freq, ...gaps]);
    return Array.from(combined).slice(0, 3);
  }

  // MÉTHODES UTILITAIRES

  private extractNumbers(tirage: TirageData): number[] {
    if (tirage.numero1) {
      return [tirage.numero1, tirage.numero2!, tirage.numero3!, tirage.numero4!, tirage.numero5!];
    } else if (tirage.boule_1) {
      return [tirage.boule_1, tirage.boule_2!, tirage.boule_3!, tirage.boule_4!, tirage.boule_5!];
    }
    return [];
  }

  private extractComplementary(tirage: TirageData): number {
    return tirage.complementaire || tirage.numero_chance || 1;
  }

  private calculateFrequencies(tirages: TirageData[]): Record<number, number> {
    const frequencies: Record<number, number> = {};
    for (let i = 1; i <= 49; i++) frequencies[i] = 0;
    
    tirages.forEach(tirage => {
      const numbers = this.extractNumbers(tirage);
      numbers.forEach(num => {
        if (num >= 1 && num <= 49) frequencies[num]++;
      });
    });
    
    return frequencies;
  }

  private calculateCurrentGaps(tirages: TirageData[]): Record<number, number> {
    const gaps: Record<number, number> = {};
    const lastAppearance: Record<number, number> = {};
    
    for (let i = 1; i <= 49; i++) {
      gaps[i] = tirages.length;
      lastAppearance[i] = -1;
    }
    
    tirages.forEach((tirage, index) => {
      const numbers = this.extractNumbers(tirage);
      numbers.forEach(num => {
        if (num >= 1 && num <= 49) {
          lastAppearance[num] = index;
        }
      });
    });
    
    for (let i = 1; i <= 49; i++) {
      if (lastAppearance[i] >= 0) {
        gaps[i] = tirages.length - 1 - lastAppearance[i];
      }
    }
    
    return gaps;
  }

  private classifyConfigurationsByGridType(configurations: ConfigurationAssociation[]): AILearningResult['bestConfigurations'] {
    const simple = configurations.filter(c => c.gridType === 'simple').sort((a, b) => b.matchScore.total - a.matchScore.total).slice(0, 5);
    const multiple = configurations.filter(c => c.gridType === 'multiple').sort((a, b) => b.matchScore.total - a.matchScore.total).slice(0, 5);
    
    // Créer des configurations hybrides (meilleures de chaque type)
    const hybrid = [...simple.slice(0, 2), ...multiple.slice(0, 2)].sort((a, b) => b.matchScore.total - a.matchScore.total);
    
    return { simple, multiple, hybrid };
  }

  private calculatePerformanceMetrics(configurations: ConfigurationAssociation[], complementaryAnalysis: AILearningResult['complementaryAnalysis']): AILearningResult['performanceMetrics'] {
    const simpleConfigs = configurations.filter(c => c.gridType === 'simple');
    const multipleConfigs = configurations.filter(c => c.gridType === 'multiple');
    
    const bestSimpleScore = Math.max(...simpleConfigs.map(c => c.matchScore.total), 0);
    const bestMultipleScore = Math.max(...multipleConfigs.map(c => c.matchScore.total), 0);
    
    const complementarySuccessRate = (complementaryAnalysis.bestStrategies.filter(s => s.success).length / complementaryAnalysis.bestStrategies.length) * 100;
    
    const overallLearningScore = (bestSimpleScore + bestMultipleScore + complementarySuccessRate) / 3;
    
    return {
      totalConfigurationsTested: configurations.length,
      bestSimpleGridScore: bestSimpleScore,
      bestMultipleGridScore: bestMultipleScore,
      complementarySuccessRate,
      overallLearningScore
    };
  }

  private getPatternParameters(patterns: string[]): Record<string, any> {
    // Retourner les paramètres spécifiques à chaque pattern
    const params: Record<string, any> = {};
    
    patterns.forEach(pattern => {
      switch (pattern) {
        case 'hot_numbers':
          params[pattern] = { threshold: 0.8, period: 'recent' };
          break;
        case 'moderate_gaps':
          params[pattern] = { minGap: 5, maxGap: 20 };
          break;
        // ... autres patterns
        default:
          params[pattern] = { enabled: true };
      }
    });
    
    return params;
  }

  private extractContextualFactors(previousDraws: TirageData[]): ConfigurationAssociation['contextualFactors'] {
    const lastDraw = previousDraws[previousDraws.length - 1];
    const date = new Date(lastDraw?.date || new Date());
    
    return {
      periodUsed: `last_${previousDraws.length}`,
      seasonality: this.getSeason(date),
      dayOfWeek: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
      monthOfYear: date.toLocaleDateString('fr-FR', { month: 'long' }),
      trendDirection: 'stable' // Simplifié
    };
  }

  private getSeason(date: Date): string {
    const month = date.getMonth() + 1;
    if (month >= 3 && month <= 5) return 'printemps';
    if (month >= 6 && month <= 8) return 'été';
    if (month >= 9 && month <= 11) return 'automne';
    return 'hiver';
  }

  private calculateComplementaryConfidence(strategyName: string, previousDraws: TirageData[]): number {
    // Calculer la confiance basée sur les performances historiques de cette stratégie
    const baseConfidence = {
      'Corrélation Principale': 75,
      'Fréquence Complémentaire': 85,
      'Cycles Complémentaire': 70,
      'Analyse Statistique': 80,
      'Gaps Complémentaire': 65,
      'Temporal Complémentaire': 60,
      'Zones Complémentaire': 55,
      'Hybride Complémentaire': 90
    };
    
    return baseConfidence[strategyName as keyof typeof baseConfidence] || 70;
  }

  private identifyContextualPatterns(configurations: ConfigurationAssociation[]): any[] {
    // Identifier des patterns contextuels dans les configurations performantes
    return []; // Simplifié pour l'exemple
  }

  private calculateOptimalWeights(patterns: string[]): Record<string, number> {
    const weights: Record<string, number> = {};
    patterns.forEach(pattern => {
      weights[pattern] = 1.2; // Augmenter le poids des patterns performants
    });
    return weights;
  }

  private identifyUncommonPatterns(configs: ConfigurationAssociation[]): string[] {
    // Identifier des patterns peu communs mais performants
    return []; // Simplifié
  }

  private analyzeParameterOptimization(configurations: ConfigurationAssociation[]): Record<string, any> {
    // Analyser l'optimisation des paramètres
    return {}; // Simplifié
  }

  private loadLearningHistory(): void {
    // Charger l'historique d'apprentissage depuis le stockage
    // Implémentation future
  }

  private saveLearningResult(date: string, result: AILearningResult): void {
    // Sauvegarder le résultat d'apprentissage
    this.learningHistory.set(date, result);
  }

  private updateOptimizationWeights(result: AILearningResult): void {
    // Mettre à jour les poids d'optimisation basés sur les résultats
    const recommendations = result.optimizationRecommendations.intelligentAnalysis.weightAdjustments;
    Object.entries(recommendations).forEach(([pattern, weight]) => {
      this.optimizationWeights[pattern] = weight;
    });
  }

  /**
   * Obtenir les poids d'optimisation actuels
   */
  public getOptimizationWeights(): Record<string, number> {
    return { ...this.optimizationWeights };
  }

  /**
   * Appliquer les optimisations apprises
   */
  public async applyLearningOptimizations(): Promise<{
    weightsUpdated: Record<string, number>;
    newPatternsAdded: string[];
    rulesImplemented: number;
  }> {
    const allResults = Array.from(this.learningHistory.values());
    
    if (allResults.length === 0) {
      return {
        weightsUpdated: {},
        newPatternsAdded: [],
        rulesImplemented: 0
      };
    }
    
    // Analyser tous les résultats pour optimiser
    const aggregatedWeights: Record<string, number[]> = {};
    const newPatterns = new Set<string>();
    let totalRules = 0;
    
    allResults.forEach(result => {
      // Agréger les poids
      Object.entries(result.optimizationRecommendations.intelligentAnalysis.weightAdjustments).forEach(([pattern, weight]) => {
        if (!aggregatedWeights[pattern]) aggregatedWeights[pattern] = [];
        aggregatedWeights[pattern].push(weight);
      });
      
      // Collecter les nouveaux patterns
      result.optimizationRecommendations.intelligentAnalysis.newPatterns.forEach(pattern => {
        newPatterns.add(pattern);
      });
      
      // Compter les règles
      totalRules += result.optimizationRecommendations.complementaryStrategy.contextualRules.length;
    });
    
    // Calculer les poids moyens
    const finalWeights: Record<string, number> = {};
    Object.entries(aggregatedWeights).forEach(([pattern, weights]) => {
      finalWeights[pattern] = weights.reduce((a, b) => a + b, 0) / weights.length;
    });
    
    // Mettre à jour les poids d'optimisation
    Object.assign(this.optimizationWeights, finalWeights);
    
    return {
      weightsUpdated: finalWeights,
      newPatternsAdded: Array.from(newPatterns),
      rulesImplemented: totalRules
    };
  }
}
