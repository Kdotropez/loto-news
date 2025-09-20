/**
 * GESTIONNAIRE DES GRILLES SAUVEGARDÉES
 * Permet de sauvegarder, gérer et contrôler les grilles jouées
 */

export interface SavedGrid {
  id: string;
  numbers: number[];
  complementary?: number;
  cost: number;
  type: 'simple' | 'multiple';
  strategy: string; // "Solution LB1", "Solution LB2", etc.
}

export interface SavedGameSession {
  id: string;
  name: string;
  createdAt: string;
  gameDate: string; // Date du tirage visé (YYYY-MM-DD)
  selectedNumbers: number[]; // Numéros de base sélectionnés
  grids: SavedGrid[];
  totalCost: number;
  status: 'pending' | 'checked' | 'won' | 'lost';
  results?: GameResult;
}

export interface GameResult {
  checkedAt: string;
  tirageDate: string;
  winningNumbers: number[];
  winningComplementary: number;
  gridResults: GridResult[];
  totalGains: number;
  netResult: number; // Gains - Coût
}

export interface GridResult {
  gridId: string;
  matchedNumbers: number[];
  matchedComplementary: boolean;
  rank: number; // 0 = perdant, 1-7 = rangs gagnants
  gain: number;
}

export class SavedGridsManager {
  private readonly STORAGE_KEY = 'loto_saved_games';

  /**
   * Sauvegarde une session de jeu
   */
  public saveGameSession(
    name: string,
    gameDate: string,
    selectedNumbers: number[],
    grids: SavedGrid[],
    strategy: string
  ): SavedGameSession {
    const session: SavedGameSession = {
      id: this.generateId(),
      name,
      createdAt: new Date().toISOString(),
      gameDate,
      selectedNumbers,
      grids,
      totalCost: grids.reduce((sum, g) => sum + g.cost, 0),
      status: 'pending'
    };

    const sessions = this.getAllSessions();
    sessions.push(session);
    this.saveSessions(sessions);

    console.log(`💾 Session sauvegardée: ${name} (${grids.length} grilles, ${session.totalCost.toFixed(2)}€)`);
    
    return session;
  }

  /**
   * Récupère toutes les sessions sauvegardées
   */
  public getAllSessions(): SavedGameSession[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
      return [];
    }
  }

  /**
   * Récupère une session par ID
   */
  public getSession(id: string): SavedGameSession | null {
    const sessions = this.getAllSessions();
    return sessions.find(s => s.id === id) || null;
  }

  /**
   * Met à jour le statut d'une session
   */
  public updateSessionStatus(id: string, status: SavedGameSession['status'], results?: GameResult): void {
    const sessions = this.getAllSessions();
    const sessionIndex = sessions.findIndex(s => s.id === id);
    
    if (sessionIndex !== -1) {
      sessions[sessionIndex].status = status;
      if (results) {
        sessions[sessionIndex].results = results;
      }
      this.saveSessions(sessions);
      
      console.log(`✅ Session ${id} mise à jour: ${status}`);
    }
  }

  /**
   * Supprime une session
   */
  public deleteSession(id: string): void {
    const sessions = this.getAllSessions();
    const filteredSessions = sessions.filter(s => s.id !== id);
    this.saveSessions(filteredSessions);
    
    console.log(`🗑️ Session ${id} supprimée`);
  }

  /**
   * Contrôle une session avec un tirage donné
   */
  public checkSessionWithTirage(
    sessionId: string,
    winningNumbers: number[],
    winningComplementary: number,
    tirageDate: string
  ): GameResult {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} non trouvée`);
    }

    console.log(`🔍 Contrôle de la session: ${session.name}`);
    console.log(`🎯 Tirage: ${winningNumbers.join(', ')} + ${winningComplementary}`);

    const gridResults: GridResult[] = [];
    let totalGains = 0;

    // Contrôler chaque grille
    for (const grid of session.grids) {
      const result = this.checkGrid(grid, winningNumbers, winningComplementary);
      gridResults.push(result);
      totalGains += result.gain;
      
      if (result.rank > 0) {
        console.log(`🏆 Grille ${grid.id}: Rang ${result.rank} - ${result.gain}€`);
      }
    }

    const gameResult: GameResult = {
      checkedAt: new Date().toISOString(),
      tirageDate,
      winningNumbers,
      winningComplementary,
      gridResults,
      totalGains,
      netResult: totalGains - session.totalCost
    };

    // Déterminer le statut final
    const finalStatus: SavedGameSession['status'] = totalGains > 0 ? 'won' : 'lost';
    this.updateSessionStatus(sessionId, finalStatus, gameResult);

    console.log(`💰 Résultat final: ${totalGains.toFixed(2)}€ de gains, ${gameResult.netResult.toFixed(2)}€ net`);

    return gameResult;
  }

  /**
   * Contrôle une grille individuelle
   */
  private checkGrid(
    grid: SavedGrid,
    winningNumbers: number[],
    winningComplementary: number
  ): GridResult {
    const matchedNumbers = grid.numbers.filter(n => winningNumbers.includes(n));
    const matchedComplementary = grid.complementary === winningComplementary;
    
    const rank = this.determineRank(matchedNumbers.length, matchedComplementary);
    const gain = this.calculateGain(rank);

    return {
      gridId: grid.id,
      matchedNumbers,
      matchedComplementary,
      rank,
      gain
    };
  }

  /**
   * Détermine le rang selon les règles du Loto
   */
  private determineRank(matchedNumbers: number, matchedComplementary: boolean): number {
    if (matchedNumbers === 5 && matchedComplementary) return 1; // Jackpot
    if (matchedNumbers === 5) return 2;
    if (matchedNumbers === 4 && matchedComplementary) return 3;
    if (matchedNumbers === 4) return 4;
    if (matchedNumbers === 3 && matchedComplementary) return 5;
    if (matchedNumbers === 3) return 6;
    if (matchedNumbers === 2 && matchedComplementary) return 7;
    return 0; // Perdant
  }

  /**
   * Calcule le gain selon le rang (moyennes approximatives)
   */
  private calculateGain(rank: number): number {
    const gains: Record<number, number> = {
      1: 2000000,  // Jackpot moyen
      2: 100000,   // 5 numéros
      3: 1000,     // 4 + complémentaire
      4: 500,      // 4 numéros
      5: 50,       // 3 + complémentaire
      6: 20,       // 3 numéros
      7: 5         // 2 + complémentaire
    };
    
    return gains[rank] || 0;
  }

  /**
   * Récupère les sessions en attente de contrôle
   */
  public getPendingSessions(): SavedGameSession[] {
    return this.getAllSessions().filter(s => s.status === 'pending');
  }

  /**
   * Récupère l'historique des sessions contrôlées
   */
  public getCheckedSessions(): SavedGameSession[] {
    return this.getAllSessions().filter(s => s.status !== 'pending');
  }

  /**
   * Statistiques globales
   */
  public getStats(): {
    totalSessions: number;
    totalCost: number;
    totalGains: number;
    netResult: number;
    winRate: number;
  } {
    const sessions = this.getAllSessions();
    const checkedSessions = sessions.filter(s => s.results);
    
    const totalCost = checkedSessions.reduce((sum, s) => sum + s.totalCost, 0);
    const totalGains = checkedSessions.reduce((sum, s) => sum + (s.results?.totalGains || 0), 0);
    const wonSessions = checkedSessions.filter(s => s.status === 'won').length;
    
    return {
      totalSessions: sessions.length,
      totalCost,
      totalGains,
      netResult: totalGains - totalCost,
      winRate: checkedSessions.length > 0 ? (wonSessions / checkedSessions.length) * 100 : 0
    };
  }

  /**
   * Fonctions utilitaires privées
   */
  private saveSessions(sessions: SavedGameSession[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }

  private generateId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Instance singleton
export const savedGridsManager = new SavedGridsManager();
