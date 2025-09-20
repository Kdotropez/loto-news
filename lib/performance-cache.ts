/**
 * Cache de performance pour accélérer les tests de combinaisons
 * Utilise des structures de données optimisées en mémoire
 */

import { dataStorage, Tirage } from './data-storage';

export interface OptimizedTirage {
  id: string;
  date: string;
  numbers: Set<number>; // Set pour O(1) lookup
  complementary: number;
  numbersArray: number[]; // Array pour l'affichage
  year: number;
  month: number;
  day: number;
  timestamp: number;
}

export interface PerformanceCache {
  tirages: OptimizedTirage[];
  tiragesByYear: Map<number, OptimizedTirage[]>;
  tiragesByMonth: Map<string, OptimizedTirage[]>;
  tiragesByDate: Map<string, OptimizedTirage>;
  totalTirages: number;
  dateRange: {
    start: string;
    end: string;
  };
  lastUpdate: number;
  cacheVersion: string;
}

export interface TestResult {
  combination: number[];
  complementary: number;
  totalTests: number;
  wins: number;
  winRate: number;
  totalGains: number;
  averageGain: number;
  roi: number;
  categories: Record<string, number>;
  executionTime: number;
  debug?: any;
}

export class PerformanceCacheManager {
  private cache: PerformanceCache | null = null;
  private readonly CACHE_VERSION = '1.0.0';
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  /**
   * Initialise le cache de performance
   */
  async initializeCache(): Promise<PerformanceCache> {
    // FORCE le rechargement pour debug
    console.log('🔄 FORCE Rechargement du cache de performance...');
    const startTime = Date.now();

    const tirages = dataStorage.getAllTirages();
    const optimizedTirages: OptimizedTirage[] = [];
    const tiragesByYear = new Map<number, OptimizedTirage[]>();
    const tiragesByMonth = new Map<string, OptimizedTirage[]>();
    const tiragesByDate = new Map<string, OptimizedTirage>();

    // Conversion optimisée des tirages - FORMAT FDJ UNIFIÉ
    console.log(`🔢 Premier tirage brut:`, tirages[0]);
    
    for (const tirage of tirages) {
      // Format FDJ unifié pour tous les tirages
      const numbers = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5];
      const numbersSet = new Set(numbers);
      const date = new Date(tirage.date);
      
      const optimizedTirage: OptimizedTirage = {
        id: String(tirage.id),
        date: tirage.date,
        numbers: numbersSet,
        complementary: tirage.complementaire || tirage.numero_chance || 0,
        numbersArray: numbers,
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        timestamp: date.getTime()
      };
      
      // Debug du premier tirage
      if (optimizedTirages.length === 0) {
        console.log(`🎯 Premier tirage optimisé:`, {
          date: optimizedTirage.date,
          numbers: Array.from(optimizedTirage.numbers),
          complementary: optimizedTirage.complementary
        });
      }

      optimizedTirages.push(optimizedTirage);

      // Indexation par année
      if (!tiragesByYear.has(optimizedTirage.year)) {
        tiragesByYear.set(optimizedTirage.year, []);
      }
      tiragesByYear.get(optimizedTirage.year)!.push(optimizedTirage);

      // Indexation par mois
      const monthKey = `${optimizedTirage.year}-${optimizedTirage.month}`;
      if (!tiragesByMonth.has(monthKey)) {
        tiragesByMonth.set(monthKey, []);
      }
      tiragesByMonth.get(monthKey)!.push(optimizedTirage);

      // Indexation par date
      tiragesByDate.set(tirage.date, optimizedTirage);
    }

    // Tri par date décroissante
    optimizedTirages.sort((a, b) => b.timestamp - a.timestamp);

    this.cache = {
      tirages: optimizedTirages,
      tiragesByYear,
      tiragesByMonth,
      tiragesByDate,
      totalTirages: optimizedTirages.length,
      dateRange: {
        start: optimizedTirages[optimizedTirages.length - 1]?.date || '',
        end: optimizedTirages[0]?.date || ''
      },
      lastUpdate: Date.now(),
      cacheVersion: this.CACHE_VERSION
    };

    const executionTime = Date.now() - startTime;
    console.log(`✅ Cache initialisé en ${executionTime}ms - ${optimizedTirages.length} tirages optimisés`);

    return this.cache;
  }

  /**
   * Teste une combinaison avec le cache optimisé
   */
  async testCombinationFast(
    combination: number[],
    complementary: number,
    maxTirages: number = 15000, // Utiliser TOUS les tirages disponibles par défaut
    startDate?: string,
    endDate?: string
  ): Promise<TestResult> {
    const startTime = Date.now();
    
    if (!this.cache) {
      await this.initializeCache();
    }

    const combinationSet = new Set(combination);
    let testTirages = this.cache!.tirages;

    // Filtrage par date si spécifié
    if (startDate || endDate) {
      testTirages = this.filterTiragesByDate(testTirages, startDate, endDate);
    }

    // Limitation du nombre de tirages pour la performance (optionnelle)
    if (maxTirages < testTirages.length) {
      testTirages = testTirages.slice(0, maxTirages);
    }

    let wins = 0;
    let totalGains = 0;
    const categories: Record<string, number> = {};

    // Test optimisé avec Set - DEBUG
    let debugCount = 0;
    for (const tirage of testTirages) {
      const matchedNumbers = this.countMatchedNumbers(combinationSet, tirage.numbers);
      const matchedComplementary = complementary === tirage.complementary;

      // Debug pour les 5 premiers tirages
      if (debugCount < 5) {
        console.log(`DEBUG Tirage ${tirage.date}:`, {
          tirageNumbers: Array.from(tirage.numbers),
          combination: Array.from(combinationSet),
          matchedNumbers,
          tirageComplementary: tirage.complementary,
          testComplementary: complementary,
          matchedComplementary
        });
        debugCount++;
      }

      if (matchedNumbers >= 2 || (matchedNumbers >= 1 && matchedComplementary)) {
        wins++;
        const category = this.determineCategory(matchedNumbers, matchedComplementary);
        const gain = this.calculateGain(category);
        
        totalGains += gain;
        categories[category] = (categories[category] || 0) + 1;
        
        // Debug pour les correspondances
        console.log(`MATCH ${tirage.date}: ${matchedNumbers} nums, compl: ${matchedComplementary}, catégorie: ${category}`);
      }
    }

    const executionTime = Date.now() - startTime;
    const winRate = (wins / testTirages.length) * 100;
    const averageGain = wins > 0 ? totalGains / wins : 0;
    const roi = ((totalGains - (testTirages.length * 2.2)) / (testTirages.length * 2.2)) * 100;

    return {
      combination,
      complementary,
      totalTests: testTirages.length,
      wins,
      winRate,
      totalGains,
      averageGain,
      roi,
      categories,
      executionTime,
      // DEBUG INFO
      debug: {
        firstTirageNumbers: testTirages[0]?.numbersArray || [],
        firstTirageCompl: testTirages[0]?.complementary,
        combinationArray: Array.from(combinationSet),
        testComplementary: complementary
      }
    };
  }

  /**
   * Teste plusieurs combinaisons en parallèle
   */
  async testMultipleCombinationsFast(
    combinations: Array<{ numbers: number[]; complementary: number }>,
    maxTirages: number = 15000 // Utiliser TOUS les tirages disponibles par défaut
  ): Promise<TestResult[]> {
    const startTime = Date.now();
    
    if (!this.cache) {
      await this.initializeCache();
    }

    console.log(`🚀 Test de ${combinations.length} combinaisons en parallèle...`);

    // Traitement par batch pour éviter la surcharge
    const batchSize = 10;
    const results: TestResult[] = [];

    for (let i = 0; i < combinations.length; i += batchSize) {
      const batch = combinations.slice(i, i + batchSize);
      const batchPromises = batch.map(combo => 
        this.testCombinationFast(combo.numbers, combo.complementary, maxTirages)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    const totalTime = Date.now() - startTime;
    console.log(`✅ ${combinations.length} combinaisons testées en ${totalTime}ms`);

    return results;
  }

  /**
   * Obtient les statistiques du cache
   */
  getCacheStats(): {
    totalTirages: number;
    dateRange: { start: string; end: string };
    lastUpdate: string;
    cacheVersion: string;
    memoryUsage: string;
  } {
    if (!this.cache) {
      return {
        totalTirages: 0,
        dateRange: { start: '', end: '' },
        lastUpdate: 'Non initialisé',
        cacheVersion: 'N/A',
        memoryUsage: 'N/A'
      };
    }

    const memoryUsage = this.estimateMemoryUsage();
    
    return {
      totalTirages: this.cache.totalTirages,
      dateRange: this.cache.dateRange,
      lastUpdate: new Date(this.cache.lastUpdate).toLocaleString('fr-FR'),
      cacheVersion: this.cache.cacheVersion,
      memoryUsage
    };
  }

  /**
   * Force la mise à jour du cache
   */
  async refreshCache(): Promise<void> {
    this.cache = null;
    await this.initializeCache();
  }

  /**
   * Vérifie si le cache est valide
   */
  private isCacheValid(): boolean {
    if (!this.cache) return false;
    return Date.now() - this.cache.lastUpdate < this.CACHE_DURATION;
  }

  /**
   * Filtre les tirages par date
   */
  private filterTiragesByDate(
    tirages: OptimizedTirage[],
    startDate?: string,
    endDate?: string
  ): OptimizedTirage[] {
    if (!startDate && !endDate) return tirages;

    return tirages.filter(tirage => {
      if (startDate && tirage.date < startDate) return false;
      if (endDate && tirage.date > endDate) return false;
      return true;
    });
  }

  /**
   * Compte les numéros correspondants (optimisé avec Set)
   */
  private countMatchedNumbers(combinationSet: Set<number>, tirageNumbers: Set<number>): number {
    let count = 0;
    for (const num of Array.from(combinationSet)) {
      if (tirageNumbers.has(num)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Détermine la catégorie de gain
   */
  private determineCategory(matchedNumbers: number, matchedComplementary: boolean): string {
    if (matchedNumbers === 5 && matchedComplementary) return 'Rang 1 - 5 numéros + numéro complémentaire';
    if (matchedNumbers === 5) return 'Rang 2 - 5 numéros';
    if (matchedNumbers === 4 && matchedComplementary) return 'Rang 3 - 4 numéros + numéro complémentaire';
    if (matchedNumbers === 4) return 'Rang 4 - 4 numéros';
    if (matchedNumbers === 3 && matchedComplementary) return 'Rang 5 - 3 numéros + numéro complémentaire';
    if (matchedNumbers === 3) return 'Rang 6 - 3 numéros';
    if (matchedNumbers === 2 && matchedComplementary) return 'Rang 7 - 2 numéros + numéro complémentaire';
    if (matchedNumbers === 2) return 'Rang 8 - 2 numéros';
    if (matchedNumbers === 1 && matchedComplementary) return 'Rang 9 - 1 numéro + numéro complémentaire';
    if (matchedNumbers === 1) return 'Rang 10 - 1 numéro';
    return 'Aucun gain';
  }

  /**
   * Calcule le gain pour une catégorie
   */
  private calculateGain(category: string): number {
    const gains: Record<string, number> = {
      'Rang 1 - 5 numéros + numéro complémentaire': 2000000,
      'Rang 2 - 5 numéros': 100000,
      'Rang 3 - 4 numéros + numéro complémentaire': 1000,
      'Rang 4 - 4 numéros': 500,
      'Rang 5 - 3 numéros + numéro complémentaire': 50,
      'Rang 6 - 3 numéros': 20,
      'Rang 7 - 2 numéros + numéro complémentaire': 20,
      'Rang 8 - 2 numéros': 5,
      'Rang 9 - 1 numéro + numéro complémentaire': 5,
      'Rang 10 - 1 numéro': 2.2
    };
    
    return gains[category] || 0;
  }

  /**
   * Estime l'utilisation mémoire
   */
  private estimateMemoryUsage(): string {
    if (!this.cache) return 'N/A';
    
    // Estimation approximative
    const bytesPerTirage = 200; // Estimation
    const totalBytes = this.cache.totalTirages * bytesPerTirage;
    
    if (totalBytes < 1024) return `${totalBytes} B`;
    if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`;
    return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Obtient les tirages récents pour l'analyse
   */
  getRecentTirages(count: number = 100): OptimizedTirage[] {
    if (!this.cache) return [];
    return this.cache.tirages.slice(0, count);
  }

  /**
   * Obtient les tirages par année
   */
  getTiragesByYear(year: number): OptimizedTirage[] {
    if (!this.cache) return [];
    return this.cache.tiragesByYear.get(year) || [];
  }

  /**
   * Obtient les tirages par mois
   */
  getTiragesByMonth(year: number, month: number): OptimizedTirage[] {
    if (!this.cache) return [];
    const monthKey = `${year}-${month}`;
    return this.cache.tiragesByMonth.get(monthKey) || [];
  }
}

// Instance singleton
export const performanceCache = new PerformanceCacheManager();
