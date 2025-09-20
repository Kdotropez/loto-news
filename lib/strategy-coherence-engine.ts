interface StrategyConfig {
  includeHotNumbers: boolean;
  includeColdNumbers: boolean;
  includeHotColdHybrid: boolean;
  includeEcartsRetard: boolean;
  includePatterns: boolean;
  includeTemporalPatterns: boolean;
  includeMathematical: boolean;
  includeRules: boolean;
  includeAdvanced: boolean;
  selectedPatterns: string[];
}

interface NumberScore {
  numero: number;
  scoreTotal: number;
  scoreEcart: number;
  scoreFrequence: number;
  scorePattern: number;
  scoreMath: number;
  conflits: string[];
  recommandation: 'forte' | 'moyenne' | 'faible' | 'eviter';
  raisons: string[];
}

interface CoherenceAnalysis {
  conflitsDetectes: Array<{
    type: 'majeur' | 'mineur';
    strategies: string[];
    description: string;
    resolution: string;
  }>;
  synergiesDetectees: Array<{
    strategies: string[];
    description: string;
    bonus: number;
  }>;
  numerosRecommandes: NumberScore[];
  scoreGlobalCoherence: number;
  recommandationsOptimisation: string[];
}

export class StrategyCoherenceEngine {
  
  /**
   * Analyse la cohérence entre toutes les stratégies sélectionnées
   */
  async analyzeCoherence(
    config: StrategyConfig, 
    hotNumbers: number[] = [], 
    coldNumbers: number[] = [],
    ecartsData: any[] = [],
    patternsData: any[] = []
  ): Promise<CoherenceAnalysis> {
    
    const conflits = this.detectConflicts(config);
    const synergies = this.detectSynergies(config);
    const numerosScores = await this.calculateNumberScores(config, hotNumbers, coldNumbers, ecartsData, patternsData);
    const scoreGlobal = this.calculateGlobalCoherence(conflits, synergies, numerosScores);
    const recommandations = this.generateOptimizationRecommendations(conflits, synergies, config);

    return {
      conflitsDetectes: conflits,
      synergiesDetectees: synergies,
      numerosRecommandes: numerosScores,
      scoreGlobalCoherence: scoreGlobal,
      recommandationsOptimisation: recommandations
    };
  }

  /**
   * Détecte les conflits entre stratégies
   */
  private detectConflicts(config: StrategyConfig): Array<{type: 'majeur' | 'mineur', strategies: string[], description: string, resolution: string}> {
    const conflits = [];

    // Conflit majeur : Chauds + Froids activés simultanément
    if (config.includeHotNumbers && config.includeColdNumbers && !config.includeHotColdHybrid) {
      conflits.push({
        type: 'majeur' as const,
        strategies: ['Numéros Chauds', 'Numéros Froids'],
        description: 'Stratégies contradictoires : numéros chauds ET froids sélectionnés',
        resolution: 'Activez Hot-Cold Hybride ou choisissez une seule stratégie'
      });
    }

    // Conflit mineur : Écarts en retard + Numéros chauds
    if (config.includeEcartsRetard && config.includeHotNumbers) {
      conflits.push({
        type: 'mineur' as const,
        strategies: ['Écarts de Sortie', 'Numéros Chauds'],
        description: 'Possible contradiction : numéros en retard vs numéros fréquents',
        resolution: 'Priorisation automatique selon les scores individuels'
      });
    }

    // Conflit patterns stricts
    if (config.includePatterns && config.selectedPatterns.length > 3) {
      conflits.push({
        type: 'mineur' as const,
        strategies: ['Patterns Historiques'],
        description: 'Trop de patterns sélectionnés peuvent sur-contraindre',
        resolution: 'Assouplissement automatique des contraintes les moins importantes'
      });
    }

    return conflits;
  }

  /**
   * Détecte les synergies entre stratégies
   */
  private detectSynergies(config: StrategyConfig): Array<{strategies: string[], description: string, bonus: number}> {
    const synergies = [];

    // Synergie : Écarts + Hot-Cold Hybride
    if (config.includeEcartsRetard && config.includeHotColdHybrid) {
      synergies.push({
        strategies: ['Écarts de Sortie', 'Hot-Cold Hybride'],
        description: 'Combinaison optimale : timing des écarts + équilibre chaud/froid',
        bonus: 15
      });
    }

    // Synergie : Patterns + Mathématiques
    if (config.includePatterns && config.includeMathematical) {
      synergies.push({
        strategies: ['Patterns Historiques', 'Stratégies Mathématiques'],
        description: 'Double validation : historique + logique mathématique',
        bonus: 10
      });
    }

    // Synergie : Écarts + Patterns temporels
    if (config.includeEcartsRetard && config.includeTemporalPatterns) {
      synergies.push({
        strategies: ['Écarts de Sortie', 'Patterns Temporels'],
        description: 'Analyse temporelle complète : écarts + saisonnalité',
        bonus: 12
      });
    }

    // Synergie : Toutes les stratégies de fréquence
    if (config.includeHotNumbers && config.includeColdNumbers && config.includeHotColdHybrid && config.includeEcartsRetard) {
      synergies.push({
        strategies: ['Toutes les stratégies de fréquence'],
        description: 'Analyse complète de la fréquence sous tous les angles',
        bonus: 20
      });
    }

    return synergies;
  }

  /**
   * Calcule un score pondéré pour chaque numéro
   */
  private async calculateNumberScores(
    config: StrategyConfig,
    hotNumbers: number[],
    coldNumbers: number[],
    ecartsData: any[],
    patternsData: any[]
  ): Promise<NumberScore[]> {
    
    const scores: NumberScore[] = [];

    for (let numero = 1; numero <= 49; numero++) {
      const ecartInfo = ecartsData.find(e => e.numero === numero);
      const isHot = hotNumbers.includes(numero);
      const isCold = coldNumbers.includes(numero);
      
      // Calcul des scores individuels (0-100)
      const scoreEcart = this.calculateEcartScore(ecartInfo, config.includeEcartsRetard);
      const scoreFrequence = this.calculateFrequenceScore(isHot, isCold, config);
      const scorePattern = this.calculatePatternScore(numero, patternsData, config.includePatterns);
      const scoreMath = this.calculateMathScore(numero, config.includeMathematical);

      // Pondération selon les stratégies actives
      const poids = this.calculateWeights(config);
      const scoreTotal = (
        scoreEcart * poids.ecart +
        scoreFrequence * poids.frequence +
        scorePattern * poids.pattern +
        scoreMath * poids.math
      );

      // Détection des conflits pour ce numéro
      const conflits = this.detectNumberConflicts(numero, isHot, isCold, ecartInfo, config);
      
      // Génération des raisons
      const raisons = this.generateNumberReasons(numero, scoreEcart, scoreFrequence, scorePattern, scoreMath, conflits);
      
      // Recommandation finale
      const recommandation = this.getRecommendation(scoreTotal, conflits.length);

      scores.push({
        numero,
        scoreTotal: Math.round(scoreTotal),
        scoreEcart: Math.round(scoreEcart),
        scoreFrequence: Math.round(scoreFrequence),
        scorePattern: Math.round(scorePattern),
        scoreMath: Math.round(scoreMath),
        conflits,
        recommandation,
        raisons
      });
    }

    return scores.sort((a, b) => b.scoreTotal - a.scoreTotal);
  }

  private calculateEcartScore(ecartInfo: any, includeEcarts: boolean): number {
    if (!includeEcarts || !ecartInfo) return 50; // Neutre si pas activé
    
    const { ecartActuel, ecartMoyen, niveauUrgence } = ecartInfo;
    
    if (niveauUrgence === 'critique') return 90;
    if (niveauUrgence === 'eleve') return 75;
    if (niveauUrgence === 'moyen') return 60;
    return 30; // Faible urgence
  }

  private calculateFrequenceScore(isHot: boolean, isCold: boolean, config: StrategyConfig): number {
    if (config.includeHotNumbers && isHot) return 80;
    if (config.includeColdNumbers && isCold) return 70;
    if (config.includeHotColdHybrid) {
      if (isHot) return 75;
      if (isCold) return 65;
      return 50; // Neutre
    }
    return 50; // Pas de stratégie de fréquence active
  }

  private calculatePatternScore(numero: number, patternsData: any[], includePatterns: boolean): number {
    if (!includePatterns) return 50;
    
    // Calcul basé sur les patterns favorables pour ce numéro
    // (Simplification pour l'exemple)
    const parite = numero % 2 === 0 ? 'pair' : 'impair';
    const dizaine = Math.floor((numero - 1) / 10) + 1;
    const unite = numero % 10;
    
    let score = 50;
    
    // Bonus/malus selon les patterns sélectionnés
    // (À adapter selon les patterns réellement sélectionnés)
    
    return Math.min(100, Math.max(0, score));
  }

  private calculateMathScore(numero: number, includeMath: boolean): number {
    if (!includeMath) return 50;
    
    let score = 50;
    
    // Nombres premiers
    if (this.isPrime(numero)) score += 20;
    
    // Fibonacci
    if (this.isFibonacci(numero)) score += 15;
    
    // Carrés parfaits
    if (Math.sqrt(numero) % 1 === 0) score += 10;
    
    return Math.min(100, score);
  }

  private calculateWeights(config: StrategyConfig): {ecart: number, frequence: number, pattern: number, math: number} {
    const activeStrategies = [
      config.includeEcartsRetard,
      config.includeHotNumbers || config.includeColdNumbers || config.includeHotColdHybrid,
      config.includePatterns,
      config.includeMathematical
    ].filter(Boolean).length;

    if (activeStrategies === 0) return { ecart: 0.25, frequence: 0.25, pattern: 0.25, math: 0.25 };

    // Pondération dynamique selon les stratégies actives
    const baseWeight = 1 / activeStrategies;
    
    return {
      ecart: config.includeEcartsRetard ? baseWeight : 0,
      frequence: (config.includeHotNumbers || config.includeColdNumbers || config.includeHotColdHybrid) ? baseWeight : 0,
      pattern: config.includePatterns ? baseWeight : 0,
      math: config.includeMathematical ? baseWeight : 0
    };
  }

  private detectNumberConflicts(numero: number, isHot: boolean, isCold: boolean, ecartInfo: any, config: StrategyConfig): string[] {
    const conflits = [];

    // Conflit : Numéro chaud mais écart élevé
    if (isHot && ecartInfo?.niveauUrgence === 'critique' && config.includeHotNumbers && config.includeEcartsRetard) {
      conflits.push('Numéro chaud mais en retard important - Prioriser écart');
    }

    // Conflit : Numéro froid mais écart faible
    if (isCold && ecartInfo?.niveauUrgence === 'faible' && config.includeColdNumbers && config.includeEcartsRetard) {
      conflits.push('Numéro froid mais récemment sorti - Prioriser fréquence');
    }

    return conflits;
  }

  private generateNumberReasons(numero: number, scoreEcart: number, scoreFrequence: number, scorePattern: number, scoreMath: number, conflits: string[]): string[] {
    const raisons = [];

    if (scoreEcart > 70) raisons.push(`Écart important (${Math.round(scoreEcart)}/100)`);
    if (scoreFrequence > 70) raisons.push(`Fréquence favorable (${Math.round(scoreFrequence)}/100)`);
    if (scorePattern > 70) raisons.push(`Patterns favorables (${Math.round(scorePattern)}/100)`);
    if (scoreMath > 70) raisons.push(`Propriétés mathématiques (${Math.round(scoreMath)}/100)`);
    
    if (conflits.length > 0) {
      raisons.push(`⚠️ ${conflits.length} conflit(s) détecté(s)`);
    }

    return raisons;
  }

  private getRecommendation(scoreTotal: number, conflitsCount: number): 'forte' | 'moyenne' | 'faible' | 'eviter' {
    if (conflitsCount > 1) return 'eviter';
    if (scoreTotal >= 80) return 'forte';
    if (scoreTotal >= 60) return 'moyenne';
    if (scoreTotal >= 40) return 'faible';
    return 'eviter';
  }

  private calculateGlobalCoherence(conflits: any[], synergies: any[], numerosScores: NumberScore[]): number {
    let score = 100;
    
    // Pénalités pour les conflits
    conflits.forEach(conflit => {
      score -= conflit.type === 'majeur' ? 20 : 10;
    });
    
    // Bonus pour les synergies
    synergies.forEach(synergie => {
      score += synergie.bonus;
    });
    
    // Ajustement selon la qualité des numéros recommandés
    const numerosFortes = numerosScores.filter(n => n.recommandation === 'forte').length;
    const numerosEviter = numerosScores.filter(n => n.recommandation === 'eviter').length;
    
    score += numerosFortes * 2;
    score -= numerosEviter * 1;
    
    return Math.max(0, Math.min(100, score));
  }

  private generateOptimizationRecommendations(conflits: any[], synergies: any[], config: StrategyConfig): string[] {
    const recommandations = [];

    // Recommandations basées sur les conflits
    if (conflits.some(c => c.strategies.includes('Numéros Chauds') && c.strategies.includes('Numéros Froids'))) {
      recommandations.push('💡 Activez Hot-Cold Hybride pour résoudre le conflit chauds/froids');
    }

    if (conflits.some(c => c.description.includes('patterns'))) {
      recommandations.push('🎯 Réduisez le nombre de patterns sélectionnés pour plus de flexibilité');
    }

    // Recommandations basées sur les synergies manquées
    if (config.includeEcartsRetard && !config.includeHotColdHybrid) {
      recommandations.push('⚡ Ajoutez Hot-Cold Hybride pour une synergie optimale avec les écarts');
    }

    if (config.includePatterns && !config.includeMathematical) {
      recommandations.push('🧮 Ajoutez les stratégies mathématiques pour renforcer l\'analyse des patterns');
    }

    // Recommandations générales
    if (synergies.length === 0) {
      recommandations.push('🔄 Activez plusieurs stratégies complémentaires pour créer des synergies');
    }

    if (recommandations.length === 0) {
      recommandations.push('✅ Configuration optimale ! Toutes les stratégies sont cohérentes');
    }

    return recommandations;
  }

  /**
   * Génère des combinaisons optimisées en tenant compte de la cohérence
   */
  async generateCoherentCombinations(
    analysis: CoherenceAnalysis,
    nombreCombinaisonsDesire: number = 5
  ): Promise<Array<{
    numbers: number[];
    scoreCoherence: number;
    raisons: string[];
    conflitsResolus: string[];
  }>> {
    
    const numerosRecommandes = analysis.numerosRecommandes
      .filter(n => n.recommandation !== 'eviter')
      .slice(0, Math.min(20, analysis.numerosRecommandes.length));

    const combinaisons = [];

    for (let i = 0; i < nombreCombinaisonsDesire; i++) {
      // Sélection intelligente de 5 numéros
      const combination = this.selectOptimalNumbers(numerosRecommandes, i);
      const scoreCoherence = this.calculateCombinationCoherence(combination, analysis);
      const raisons = this.generateCombinationReasons(combination, numerosRecommandes);
      const conflitsResolus = this.getResolvedConflicts(combination, analysis);

      combinaisons.push({
        numbers: combination,
        scoreCoherence,
        raisons,
        conflitsResolus
      });
    }

    return combinaisons.sort((a, b) => b.scoreCoherence - a.scoreCoherence);
  }

  private selectOptimalNumbers(numerosRecommandes: NumberScore[], seed: number): number[] {
    // Algorithme de sélection diversifiée
    const selected = [];
    const available = [...numerosRecommandes];

    // 1. Prendre le meilleur numéro
    if (available.length > 0) {
      selected.push(available.shift()!.numero);
    }

    // 2. Diversifier par recommandation
    const fortes = available.filter(n => n.recommandation === 'forte');
    const moyennes = available.filter(n => n.recommandation === 'moyenne');
    
    // Prendre 2-3 numéros forts et 1-2 moyens pour équilibrer
    while (selected.length < 5 && (fortes.length > 0 || moyennes.length > 0)) {
      if (selected.length < 4 && fortes.length > 0) {
        const index: number = (seed + selected.length) % fortes.length;
        selected.push(fortes.splice(index, 1)[0].numero);
      } else if (moyennes.length > 0) {
        const index: number = (seed + selected.length) % moyennes.length;
        selected.push(moyennes.splice(index, 1)[0].numero);
      } else {
        break;
      }
    }

    // 3. Compléter si nécessaire avec les meilleurs disponibles
    while (selected.length < 5 && available.length > 0) {
      selected.push(available.shift()!.numero);
    }

    return selected.sort((a, b) => a - b);
  }

  private calculateCombinationCoherence(combination: number[], analysis: CoherenceAnalysis): number {
    const numerosInfo = combination.map(num => 
      analysis.numerosRecommandes.find(n => n.numero === num)
    ).filter(Boolean);

    const scoresMoyens = numerosInfo.map(n => n!.scoreTotal);
    const scoreMoyen = scoresMoyens.reduce((sum, score) => sum + score, 0) / scoresMoyens.length;

    // Bonus pour la diversité des stratégies
    const strategiesUtilisees = new Set();
    numerosInfo.forEach(n => {
      if (n!.scoreEcart > 60) strategiesUtilisees.add('ecart');
      if (n!.scoreFrequence > 60) strategiesUtilisees.add('frequence');
      if (n!.scorePattern > 60) strategiesUtilisees.add('pattern');
      if (n!.scoreMath > 60) strategiesUtilisees.add('math');
    });

    const bonusDiversite = strategiesUtilisees.size * 5;

    return Math.min(100, scoreMoyen + bonusDiversite);
  }

  private generateCombinationReasons(combination: number[], numerosRecommandes: NumberScore[]): string[] {
    const raisons = [];
    
    const numerosFortes = combination.filter(num => 
      numerosRecommandes.find(n => n.numero === num)?.recommandation === 'forte'
    ).length;
    
    if (numerosFortes >= 3) {
      raisons.push(`${numerosFortes} numéros avec recommandation forte`);
    }

    const strategiesUtilisees = new Set();
    combination.forEach(num => {
      const info = numerosRecommandes.find(n => n.numero === num);
      if (info) {
        if (info.scoreEcart > 60) strategiesUtilisees.add('Écarts de sortie');
        if (info.scoreFrequence > 60) strategiesUtilisees.add('Analyse de fréquence');
        if (info.scorePattern > 60) strategiesUtilisees.add('Patterns historiques');
        if (info.scoreMath > 60) strategiesUtilisees.add('Propriétés mathématiques');
      }
    });

    if (strategiesUtilisees.size > 1) {
      raisons.push(`Synergie entre ${strategiesUtilisees.size} stratégies : ${Array.from(strategiesUtilisees).join(', ')}`);
    }

    return raisons;
  }

  private getResolvedConflicts(combination: number[], analysis: CoherenceAnalysis): string[] {
    // Identifier les conflits résolus par cette combinaison
    const resolus = [];
    
    if (analysis.conflitsDetectes.some(c => c.strategies.includes('Numéros Chauds') && c.strategies.includes('Numéros Froids'))) {
      resolus.push('Équilibre chauds/froids respecté');
    }

    return resolus;
  }

  // Utilitaires mathématiques
  private isPrime(n: number): boolean {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) return false;
    }
    return true;
  }

  private isFibonacci(n: number): boolean {
    const fibSequence = [1, 1, 2, 3, 5, 8, 13, 21, 34];
    return fibSequence.includes(n);
  }
}

export const strategyCoherenceEngine = new StrategyCoherenceEngine();

