import { dataStorage } from './data-storage';
import { UnifiedCombination } from './combination-hub';

export interface TestResult {
  combinationId: string;
  totalGains: number;
  wins: number;
  totalTests: number;
  winRate: number;
  roi: number;
  investment: number;
  profit: number;
  testedAt: Date;
}

export class CombinationTester {
  async testCombination(combination: UnifiedCombination): Promise<TestResult> {
    const tirages = dataStorage.getAllTirages();
    let totalGains = 0;
    let wins = 0;

    for (const tirage of tirages) {
      const mainMatches = combination.mainNumbers.filter(num => 
        [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5].includes(num)
      ).length;
      
      const complementaryMatch = combination.complementaryNumber === tirage.numero_chance;
      
      if (mainMatches >= 3) {
        wins++;
        const gain = this.getGainForMatches(mainMatches, complementaryMatch);
        totalGains += gain;
      }
    }

    const investment = tirages.length * 2.20;
    const profit = totalGains - investment;
    const roi = investment > 0 ? ((profit / investment) * 100) : 0;
    const winRate = tirages.length > 0 ? (wins / tirages.length) * 100 : 0;

    return {
      combinationId: combination.id,
      totalGains,
      wins,
      totalTests: tirages.length,
      winRate,
      roi,
      investment,
      profit,
      testedAt: new Date()
    };
  }

  private getGainForMatches(mainMatches: number, complementaryMatch: boolean): number {
    if (mainMatches === 5 && complementaryMatch) return 2000000;
    if (mainMatches === 5) return 100000;
    if (mainMatches === 4 && complementaryMatch) return 1000;
    if (mainMatches === 4) return 500;
    if (mainMatches === 3 && complementaryMatch) return 50;
    if (mainMatches === 3) return 20;
    return 0;
  }
}

export const combinationTester = new CombinationTester();