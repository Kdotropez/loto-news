import { StrategyCombination } from './strategy-combination-engine';

export interface TestResult {
  totalGains: number;
  wins: number;
  totalTests: number;
  winRate: number;
  roi: number;
  averageGain: number;
  categories: Record<string, number>;
  testedAt: string;
  testDuration: number; // en millisecondes
}

export interface StrategyRanking {
  id: string;
  name: string;
  strategies: string[];
  combination: {
    mainNumbers: number[];
    complementaryNumber: number;
  };
  testResult?: TestResult;
  estimatedROI: number;
  isTested: boolean;
  rank: number;
  performance: 'excellent' | 'good' | 'average' | 'poor' | 'very-poor';
}

export interface RankingData {
  lastUpdated: string;
  totalCombinations: number;
  testedCombinations: number;
  rankings: StrategyRanking[];
  globalStats: {
    averageROI: number;
    averageEstimatedROI: number;
    bestROI: number;
    worstROI: number;
    totalGains: number;
    totalTests: number;
  };
}

export class StrategyResultsManager {
  private static instance: StrategyResultsManager;
  private rankings: StrategyRanking[] = [];
  private testResults: Map<string, TestResult> = new Map();
  private dataFile = 'data/strategy-rankings.json';

  private constructor() {
    this.loadData();
  }

  public static getInstance(): StrategyResultsManager {
    if (!StrategyResultsManager.instance) {
      StrategyResultsManager.instance = new StrategyResultsManager();
    }
    return StrategyResultsManager.instance;
  }

  /**
   * Charge les données depuis le fichier JSON (côté serveur uniquement)
   */
  private async loadData(): Promise<void> {
    // Vérifie si on est côté serveur
    if (typeof window !== 'undefined') {
      // Côté client, utilise localStorage
      try {
        const savedData = localStorage.getItem('strategy-rankings');
        if (savedData) {
          const rankingData: RankingData = JSON.parse(savedData);
          this.rankings = rankingData.rankings || [];
          this.testResults = new Map();
          
          // Restaure les résultats de test
          this.rankings.forEach(ranking => {
            if (ranking.testResult) {
              this.testResults.set(ranking.id, ranking.testResult);
            }
          });
          
          console.log(`📊 ${this.rankings.length} classements chargés depuis localStorage`);
        }
      } catch (error) {
        console.log('📊 Aucun classement en localStorage, création d\'un nouveau');
        this.rankings = [];
        this.testResults = new Map();
      }
      return;
    }

    // Côté serveur, utilise le système de fichiers
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const filePath = path.join(process.cwd(), this.dataFile);
      const data = await fs.readFile(filePath, 'utf-8');
      const rankingData: RankingData = JSON.parse(data);
      
      this.rankings = rankingData.rankings || [];
      this.testResults = new Map();
      
      // Restaure les résultats de test
      this.rankings.forEach(ranking => {
        if (ranking.testResult) {
          this.testResults.set(ranking.id, ranking.testResult);
        }
      });
      
      console.log(`📊 ${this.rankings.length} classements chargés depuis ${this.dataFile}`);
    } catch (error) {
      console.log('📊 Aucun fichier de classement existant, création d\'un nouveau');
      this.rankings = [];
      this.testResults = new Map();
    }
  }

  /**
   * Sauvegarde les données (localStorage côté client, fichier côté serveur)
   */
  private async saveData(): Promise<void> {
    const rankingData: RankingData = {
      lastUpdated: new Date().toISOString(),
      totalCombinations: this.rankings.length,
      testedCombinations: this.rankings.filter(r => r.isTested).length,
      rankings: this.rankings,
      globalStats: this.getGlobalStats()
    };

    // Côté client, utilise localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('strategy-rankings', JSON.stringify(rankingData));
        console.log(`💾 Classements sauvegardés dans localStorage`);
      } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde localStorage:', error);
      }
      return;
    }

    // Côté serveur, utilise le système de fichiers
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Crée le dossier data s'il n'existe pas
      const dataDir = path.join(process.cwd(), 'data');
      try {
        await fs.mkdir(dataDir, { recursive: true });
      } catch (error) {
        // Le dossier existe déjà
      }
      
      const filePath = path.join(process.cwd(), this.dataFile);
      await fs.writeFile(filePath, JSON.stringify(rankingData, null, 2));
      
      console.log(`💾 Classements sauvegardés dans ${this.dataFile}`);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
    }
  }

  /**
   * Met à jour le classement avec de nouvelles combinaisons
   */
  public async updateRankings(combinations: StrategyCombination[]): Promise<void> {
    // Fonction d'estimation du ROI (identique à celle du composant)
    const estimateROI = (combination: StrategyCombination): number => {
      const strategyScores: Record<string, number> = {
        'hot-cold-hybrid': 15,
        'correlations': 12,
        'anti-correlations': 8,
        'temporal-patterns': 10,
        'mathematical-patterns': 14,
        'volatility-optimized': 11,
        'astrological': 5,
        'numerology': 6,
        'geometric': 9,
        'chaos-theory': 4,
        'quantum': 3,
        'neural-network': 13,
        'fibonacci': 7,
        'golden-ratio': 8,
        'prime-numbers': 6
      };

      const baseScore = combination.strategies.reduce((sum, strategy) => {
        return sum + (strategyScores[strategy.id] || 5);
      }, 0);

      const synergyBonus = combination.strategies.length > 1 ? 
        (combination.strategies.length - 1) * 2 : 0;

      const estimatedROI = (baseScore + synergyBonus) - 50;
      return Math.max(-95, Math.min(estimatedROI, 200));
    };

    // Crée les classements
    const newRankings: StrategyRanking[] = combinations.map(combination => {
      const existingRanking = this.rankings.find(r => r.id === combination.id);
      const testResult = this.testResults.get(combination.id);
      const estimatedROI = estimateROI(combination);
      const isTested = !!testResult;
      
      // Détermine la performance
      const roi = isTested ? testResult.roi : estimatedROI;
      let performance: StrategyRanking['performance'];
      if (roi >= 50) performance = 'excellent';
      else if (roi >= 0) performance = 'good';
      else if (roi >= -20) performance = 'average';
      else if (roi >= -50) performance = 'poor';
      else performance = 'very-poor';

      return {
        id: combination.id,
        name: combination.name,
        strategies: combination.strategies.map(s => s.id),
        combination: combination.combination,
        testResult: testResult,
        estimatedROI,
        isTested,
        rank: 0, // Sera calculé après le tri
        performance
      };
    });

    // Trie par ROI (réel ou estimé)
    newRankings.sort((a, b) => {
      const aROI = a.isTested ? a.testResult!.roi : a.estimatedROI;
      const bROI = b.isTested ? b.testResult!.roi : b.estimatedROI;
      return bROI - aROI;
    });

    // Assigne les rangs
    newRankings.forEach((ranking, index) => {
      ranking.rank = index + 1;
    });

    this.rankings = newRankings;
    await this.saveData();
  }

  /**
   * Sauvegarde un résultat de test
   */
  public async saveTestResult(combinationId: string, result: Omit<TestResult, 'testedAt' | 'testDuration'>): Promise<void> {
    const testResult: TestResult = {
      ...result,
      testedAt: new Date().toISOString(),
      testDuration: 0 // Sera calculé par le composant
    };

    this.testResults.set(combinationId, testResult);
    
    // Met à jour le classement
    const ranking = this.rankings.find(r => r.id === combinationId);
    if (ranking) {
      ranking.testResult = testResult;
      ranking.isTested = true;
      ranking.performance = this.getPerformanceCategory(result.roi);
      
      // Recalcule le classement
      await this.updateRankings([]);
    }
    
    await this.saveData();
  }

  /**
   * Détermine la catégorie de performance
   */
  private getPerformanceCategory(roi: number): StrategyRanking['performance'] {
    if (roi >= 50) return 'excellent';
    if (roi >= 0) return 'good';
    if (roi >= -20) return 'average';
    if (roi >= -50) return 'poor';
    return 'very-poor';
  }

  /**
   * Récupère le classement complet
   */
  public getRankings(): StrategyRanking[] {
    return this.rankings;
  }

  /**
   * Récupère le top N des meilleures combinaisons
   */
  public getTopRankings(limit: number = 10): StrategyRanking[] {
    return this.rankings.slice(0, limit);
  }

  /**
   * Récupère les statistiques globales
   */
  public getGlobalStats() {
    const testedRankings = this.rankings.filter(r => r.isTested);
    const allROIs = this.rankings.map(r => r.isTested ? r.testResult!.roi : r.estimatedROI);
    
    return {
      averageROI: testedRankings.length > 0 ? 
        testedRankings.reduce((sum, r) => sum + r.testResult!.roi, 0) / testedRankings.length : 0,
      averageEstimatedROI: allROIs.length > 0 ? 
        allROIs.reduce((sum, roi) => sum + roi, 0) / allROIs.length : 0,
      bestROI: allROIs.length > 0 ? Math.max(...allROIs) : 0,
      worstROI: allROIs.length > 0 ? Math.min(...allROIs) : 0,
      totalGains: testedRankings.reduce((sum, r) => sum + (r.testResult?.totalGains || 0), 0),
      totalTests: testedRankings.reduce((sum, r) => sum + (r.testResult?.totalTests || 0), 0)
    };
  }

  /**
   * Récupère les résultats de test
   */
  public getTestResults(): Map<string, TestResult> {
    return this.testResults;
  }

  /**
   * Récupère les combinaisons par catégorie de performance
   */
  public getRankingsByPerformance(): Record<StrategyRanking['performance'], StrategyRanking[]> {
    const result: Record<StrategyRanking['performance'], StrategyRanking[]> = {
      'excellent': [],
      'good': [],
      'average': [],
      'poor': [],
      'very-poor': []
    };

    this.rankings.forEach(ranking => {
      result[ranking.performance].push(ranking);
    });

    return result;
  }

  /**
   * Exporte les données en JSON
   */
  public async exportData(): Promise<string> {
    const rankingData: RankingData = {
      lastUpdated: new Date().toISOString(),
      totalCombinations: this.rankings.length,
      testedCombinations: this.rankings.filter(r => r.isTested).length,
      rankings: this.rankings,
      globalStats: this.getGlobalStats()
    };

    return JSON.stringify(rankingData, null, 2);
  }

  /**
   * Importe des données depuis JSON
   */
  public async importData(jsonData: string): Promise<void> {
    try {
      const rankingData: RankingData = JSON.parse(jsonData);
      this.rankings = rankingData.rankings || [];
      this.testResults = new Map();
      
      // Restaure les résultats de test
      this.rankings.forEach(ranking => {
        if (ranking.testResult) {
          this.testResults.set(ranking.id, ranking.testResult);
        }
      });
      
      await this.saveData();
      console.log('📊 Données importées avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'import:', error);
      throw error;
    }
  }
}
