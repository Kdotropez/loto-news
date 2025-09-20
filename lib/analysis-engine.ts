import { dataStorage, Tirage } from './data-storage';

export interface FrequencyAnalysis {
  totalTirages: number;
  frequencies: Array<{
  numero: number;
  frequency: number;
  percentage: number;
    lastAppearance: string;
    averageGap: number;
  }>;
  hotNumbers: number[];
  coldNumbers: number[];
  averageFrequency: number;
}

export interface TrendAnalysis {
  totalTirages: number;
  trends: Array<{
  numero: number;
    trend: 'hausse' | 'baisse' | 'stable';
    evolution: number;
    recentFrequency: number;
    historicalFrequency: number;
  }>;
  hotNumbers: number[];
  coldNumbers: number[];
  stableNumbers: number[];
}

export interface PatternAnalysis {
  totalTirages: number;
  patterns: Array<{
    pattern: string;
    count: number;
    percentage: number;
    description: string;
    examples: Array<{
      date: string;
      numbers: number[];
      consecutive_sequence: number[];
    }>;
  }>;
  mostCommonPattern: string;
  leastCommonPattern: string;
  averagePatterns: number;
}

export class AnalysisEngine {
  private dataStorage = dataStorage;

  async analyzeFrequencies(period: string = 'last20'): Promise<FrequencyAnalysis> {
    let tirages = dataStorage.getAllTirages();
    
    // Filtrer les tirages selon la période
    tirages = this.filterTiragesByPeriod(tirages, period);
    
    if (tirages.length === 0) {
        return {
        totalTirages: 0,
        frequencies: [],
        hotNumbers: [],
        coldNumbers: [],
        averageFrequency: 0
      };
    }

    const frequencyMap = new Map<number, number>();
    const lastAppearanceMap = new Map<number, string>();

    // Compter les fréquences
    for (const tirage of tirages) {
      const boules = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5].filter(n => n != null);
      for (const numero of boules) {
        if (numero != null) {
          frequencyMap.set(numero, (frequencyMap.get(numero) || 0) + 1);
          lastAppearanceMap.set(numero, tirage.date);
        }
      }
    }

    const totalTirages = tirages.length;
    const frequencies = Array.from(frequencyMap.entries()).map(([numero, count]) => ({
        numero,
      frequency: count,
          percentage: (count / totalTirages) * 100,
      lastAppearance: lastAppearanceMap.get(numero) || '',
      averageGap: totalTirages / count
    })).sort((a, b) => b.frequency - a.frequency);

    const averageFrequency = frequencies.reduce((sum, f) => sum + f.frequency, 0) / frequencies.length;
    const hotNumbers = frequencies.slice(0, 20).map(f => f.numero);
    const coldNumbers = frequencies.slice(-20).map(f => f.numero);
    
    return {
      totalTirages,
      frequencies,
      hotNumbers,
      coldNumbers,
      averageFrequency
    };
  }

  async analyzeTrends(): Promise<TrendAnalysis> {
    const tirages = dataStorage.getAllTirages();
    
    if (tirages.length === 0) {
        return {
        totalTirages: 0,
        trends: [],
        hotNumbers: [],
        coldNumbers: [],
        stableNumbers: []
      };
    }

    const recentTirages = tirages.slice(-50); // 50 derniers tirages
    const historicalTirages = tirages.slice(0, -50); // Tirages historiques

    const recentFreq = new Map<number, number>();
    const historicalFreq = new Map<number, number>();

    // Fréquences récentes
    for (const tirage of recentTirages) {
      const boules = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5].filter(n => n != null);
      for (const numero of boules) {
        if (numero != null) {
          recentFreq.set(numero, (recentFreq.get(numero) || 0) + 1);
        }
      }
    }

    // Fréquences historiques
    for (const tirage of historicalTirages) {
      const boules = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5].filter(n => n != null);
      for (const numero of boules) {
        if (numero != null) {
          historicalFreq.set(numero, (historicalFreq.get(numero) || 0) + 1);
        }
      }
    }

    const trends = Array.from(recentFreq.keys()).map(numero => {
      const recent = recentFreq.get(numero) || 0;
      const historical = historicalFreq.get(numero) || 0;
      const evolution = recent - historical;
      
      let trend: 'hausse' | 'baisse' | 'stable' = 'stable';
      if (evolution > 1) trend = 'hausse';
      else if (evolution < -1) trend = 'baisse';
        
        return {
        numero,
        trend,
        evolution,
        recentFrequency: recent,
        historicalFrequency: historical
      };
    }).sort((a, b) => b.evolution - a.evolution);

    const hotNumbers = trends.filter(t => t.trend === 'hausse').map(t => t.numero);
    const coldNumbers = trends.filter(t => t.trend === 'baisse').map(t => t.numero);
    const stableNumbers = trends.filter(t => t.trend === 'stable').map(t => t.numero);
    
    return {
      totalTirages: tirages.length,
      trends,
      hotNumbers,
      coldNumbers,
      stableNumbers
    };
  }

  async analyzePatterns(): Promise<PatternAnalysis> {
    const tirages = dataStorage.getAllTirages();
    
    if (tirages.length === 0) {
    return {
        totalTirages: 0,
        patterns: [],
        mostCommonPattern: '',
        leastCommonPattern: '',
        averagePatterns: 0
      };
    }

    const patternMap = new Map<string, { count: number; examples: any[] }>();
      
      for (const tirage of tirages) {
        const boules = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5];
      
      // Patterns de parité
      const evenCount = boules.filter((num): num is number => typeof num === 'number' && num % 2 === 0).length;
      const oddCount = boules.filter((num): num is number => typeof num === 'number' && num % 2 !== 0).length;
      const parityPattern = `${evenCount}P-${oddCount}I`;
      
      // Patterns de consécutifs
      const validBoules = boules.filter((num): num is number => typeof num === 'number');
      const consecutiveSequences = this.findConsecutiveSequences(validBoules);
      const consecutivePattern = consecutiveSequences.length > 0 ? 'CONSECUTIF' : 'NON-CONSECUTIF';
      
      // Patterns de dizaines
      const dizaines = new Set(validBoules.map(num => Math.floor((num - 1) / 10)));
      const dizainePattern = `DIZ${dizaines.size}`;
      
      // Patterns de somme
      const somme = validBoules.reduce((sum, num) => sum + num, 0);
      let sommePattern = 'SOMME_FAIBLE';
      if (somme >= 100 && somme <= 150) {
        sommePattern = 'SOMME_OPTIMALE';
      } else if (somme > 150) {
        sommePattern = 'SOMME_ELEVEE';
      }
      
      // Patterns de répartition (1-10, 11-20, 21-30, 31-40, 41-49)
      const zones = [0, 0, 0, 0, 0]; // 5 zones
      validBoules.forEach(num => {
        if (num <= 10) zones[0]++;
        else if (num <= 20) zones[1]++;
        else if (num <= 30) zones[2]++;
        else if (num <= 40) zones[3]++;
        else zones[4]++;
      });
      const zonePattern = `ZONE_${zones.map(z => z.toString()).join('-')}`;
      
      // Patterns des unités (chiffres des unités 0-9)
      const units = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 10 chiffres des unités
      validBoules.forEach(num => {
        const unit = num % 10;
        units[unit]++;
      });
      
      // Compter les unités différentes et similaires
      const differentUnits = units.filter(count => count > 0).length;
      const maxSameUnit = Math.max(...units);
      const sameUnits = units.filter(count => count > 1).length;
      
      // Identifier les unités spécifiques
      const similarUnits = [];
      const differentUnitsList = [];
      
      for (let i = 0; i < 10; i++) {
        if (units[i] > 1) {
          similarUnits.push(`${i}:${units[i]}`);
        } else if (units[i] === 1) {
          differentUnitsList.push(i.toString());
        }
      }
      
      let unitsPattern = '';
      if (differentUnits === 5) {
        unitsPattern = `UNIT_5_DIFFERENTES_${differentUnitsList.join('-')}`;
      } else if (sameUnits > 0) {
        const similarStr = similarUnits.join('_');
        const differentStr = differentUnitsList.join('-');
        unitsPattern = `UNIT_${sameUnits}_SIMILAIRES_${differentUnits - sameUnits}_DIFFERENTES_${similarStr}_${differentStr}`;
      } else {
        unitsPattern = `UNIT_${differentUnits}_DIFFERENTES_${differentUnitsList.join('-')}`;
      }
      
      // Ajouter tous les patterns
      const patterns = [parityPattern, consecutivePattern, dizainePattern, sommePattern, zonePattern, unitsPattern];
      
      patterns.forEach(pattern => {
        if (!patternMap.has(pattern)) {
          patternMap.set(pattern, { count: 0, examples: [] });
        }
        
        const patternData = patternMap.get(pattern)!;
        patternData.count++;
        
        if (patternData.examples.length < 3) {
          patternData.examples.push({
              date: tirage.date,
              numbers: boules,
            consecutive_sequence: consecutiveSequences
          });
        }
      });
    }
    
    const totalTirages = tirages.length;
    const patterns = Array.from(patternMap.entries()).map(([pattern, data]) => ({
        pattern,
      count: data.count,
      percentage: (data.count / totalTirages) * 100,
      description: this.getPatternDescription(pattern),
      examples: data.examples
    })).sort((a, b) => b.count - a.count);
    
    return {
      totalTirages,
      patterns,
      mostCommonPattern: patterns[0]?.pattern || '',
      leastCommonPattern: patterns[patterns.length - 1]?.pattern || '',
      averagePatterns: patterns.length
    };
  }

  private findConsecutiveSequences(numbers: number[]): number[] {
    const sorted = [...numbers].sort((a, b) => a - b);
    const sequences: number[] = [];
    
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] - sorted[i] === 1) {
        sequences.push(sorted[i]);
      }
    }
    
    return sequences;
  }

  private getPatternDescription(pattern: string): string {
    if (pattern.includes('P-') && pattern.includes('I')) {
      return `Distribution ${pattern}`;
    } else if (pattern === 'CONSECUTIF') {
      return 'Numéros consécutifs présents';
    } else if (pattern === 'NON-CONSECUTIF') {
      return 'Aucun numéro consécutif';
    } else if (pattern.startsWith('DIZ')) {
      const count = pattern.replace('DIZ', '');
      return `Utilise ${count} dizaines différentes`;
    } else if (pattern === 'SOMME_FAIBLE') {
      return 'Somme faible (< 100)';
    } else if (pattern === 'SOMME_OPTIMALE') {
      return 'Somme optimale (100-150)';
    } else if (pattern === 'SOMME_ELEVEE') {
      return 'Somme élevée (> 150)';
    } else if (pattern.startsWith('ZONE_')) {
      const zones = pattern.replace('ZONE_', '').split('-');
      return `Répartition par zones: ${zones.join('-')}`;
    } else if (pattern.startsWith('UNIT_')) {
      if (pattern.includes('_5_DIFFERENTES_')) {
        const units = pattern.split('_5_DIFFERENTES_')[1];
        return `5 unités différentes: ${units.split('-').join(', ')}`;
      } else if (pattern.includes('_SIMILAIRES_')) {
        const parts = pattern.split('_SIMILAIRES_');
        const similarCount = parts[0].split('_')[1];
        const rest = parts[1].split('_');
        const differentCount = rest[0];
        const similarDetails = rest[1];
        const differentDetails = rest[2];
        return `${similarCount} similaires (${similarDetails}), ${differentCount} différentes (${differentDetails.split('-').join(', ')})`;
      } else if (pattern.includes('_DIFFERENTES_')) {
        const parts = pattern.split('_DIFFERENTES_');
        const count = parts[0].split('_')[1];
        const units = parts[1];
        return `${count} unités différentes: ${units.split('-').join(', ')}`;
      }
      return pattern;
    }
    return pattern;
  }

  /**
   * Filtre les tirages selon la période spécifiée
   */
  private filterTiragesByPeriod(tirages: any[], period: string): any[] {
    const now = new Date();
    
    switch (period) {
      case 'last20':
        return tirages.slice(-20);
      
      case 'last50':
        return tirages.slice(-50);
      
      case 'last100':
        return tirages.slice(-100);
      
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return tirages.filter(tirage => new Date(tirage.date) >= weekAgo);
      
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return tirages.filter(tirage => new Date(tirage.date) >= monthAgo);
      
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return tirages.filter(tirage => new Date(tirage.date) >= yearAgo);
      
      case 'all':
      default:
        return tirages;
    }
  }

  async analyzeEcartsSortie(period: string = 'last20'): Promise<any> {
    const tirages = dataStorage.getAllTirages();
    const filteredTirages = this.filterTiragesByPeriod(tirages, period);
    
    // Créer un objet pour stocker les écarts pour chaque numéro
    const ecartsData: any[] = [];
    
    for (let numero = 1; numero <= 49; numero++) {
      // Trouver toutes les sorties de ce numéro
      const sorties: number[] = [];
      filteredTirages.forEach((tirage, index) => {
        // Format FDJ unifié
        const boules = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5];
        
        if (boules.includes(numero)) {
          sorties.push(index);
        }
      });
      
      if (sorties.length === 0) {
        // Numéro jamais sorti dans la période
        ecartsData.push({
          numero,
          ecartActuel: filteredTirages.length,
          ecartPrecedent: 0,
          ecartMoyen: 0,
          ecartMaximum: filteredTirages.length,
          derniereSortie: 'Jamais',
          prochaineSortieEstimee: 'Imprévisible',
          niveauUrgence: 'critique'
        });
        continue;
      }
      
      // Calculer les écarts
      const ecarts: number[] = [];
      for (let i = 1; i < sorties.length; i++) {
        ecarts.push(sorties[i] - sorties[i-1]);
      }
      
      // Écart actuel (depuis la dernière sortie)
      const derniereSortieIndex = sorties[sorties.length - 1];
      const ecartActuel = filteredTirages.length - 1 - derniereSortieIndex;
      
      // Écart précédent
      const ecartPrecedent = ecarts.length > 0 ? ecarts[ecarts.length - 1] : 0;
      
      // Écart moyen
      const ecartMoyen = ecarts.length > 0 ? Math.round(ecarts.reduce((sum, ecart) => sum + ecart, 0) / ecarts.length) : 0;
      
      // Écart maximum
      const ecartMaximum = ecarts.length > 0 ? Math.max(...ecarts) : 0;
      
      // Dernière sortie
      const derniereSortie = filteredTirages[derniereSortieIndex]?.date || 'Inconnue';
      
      // Estimation de la prochaine sortie
      const prochaineSortieEstimee = ecartActuel >= ecartMoyen ? 'Bientôt possible' : 'En attente';
      
      // Niveau d'urgence
      let niveauUrgence: 'faible' | 'moyen' | 'eleve' | 'critique' = 'faible';
      if (ecartActuel > ecartMaximum) {
        niveauUrgence = 'critique';
      } else if (ecartActuel > ecartMoyen * 1.5) {
        niveauUrgence = 'eleve';
      } else if (ecartActuel > ecartMoyen) {
        niveauUrgence = 'moyen';
      }
      
      ecartsData.push({
        numero,
        ecartActuel,
        ecartPrecedent,
        ecartMoyen,
        ecartMaximum,
        derniereSortie,
        prochaineSortieEstimee,
        niveauUrgence
      });
    }
    
    return ecartsData;
  }
}