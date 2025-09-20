/**
 * SYNCHRONISATION AUTOMATIQUE AVEC L'API OPENDATASOFT
 * Récupère automatiquement les derniers tirages du Loto
 */

export interface OpenDataSoftTirage {
  annee_numero_de_tirage: string;
  date_de_tirage: string;
  boule_1: number;
  boule_2: number;
  boule_3: number;
  boule_4: number;
  boule_5: number;
  numero_chance: number;
}

export interface SyncResult {
  success: boolean;
  newTirages: number;
  latestDate: string;
  totalAvailable: number;
  error?: string;
}

export class OpenDataSoftSync {
  private readonly API_BASE = 'https://data.opendatasoft.com/api/explore/v2.1/catalog/datasets/resultats-loto-2019-a-aujourd-hui@agrall/records';
  
  /**
   * Récupère les derniers tirages depuis une date donnée
   */
  async fetchLatestTirages(sinceDate?: string, limit: number = 100): Promise<OpenDataSoftTirage[]> {
    try {
      let url = `${this.API_BASE}?limit=${limit}&order_by=date_de_tirage%20desc`;
      
      if (sinceDate) {
        // Filtrer par date si spécifiée
        url += `&where=date_de_tirage%20%3E%20%27${sinceDate}%27`;
      }
      
      console.log(`🔍 Récupération depuis: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`📊 ${data.results.length} tirages récupérés sur ${data.total_count} disponibles`);
      
      return data.results;
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération:', error);
      throw error;
    }
  }
  
  /**
   * Convertit les données OpenDataSoft vers notre format
   */
  convertToOurFormat(tirages: OpenDataSoftTirage[]): any[] {
    return tirages.map(tirage => ({
      // Format FDJ original pour compatibilité totale
      id: parseInt(tirage.annee_numero_de_tirage) || Date.now(),
      date: tirage.date_de_tirage,
      numero_tirage: parseInt(tirage.annee_numero_de_tirage) || 0,
      boule_1: tirage.boule_1,
      boule_2: tirage.boule_2,
      boule_3: tirage.boule_3,
      boule_4: tirage.boule_4,
      boule_5: tirage.boule_5,
      numero_chance: tirage.numero_chance,
      // Valeurs par défaut pour les gains (non disponibles dans OpenDataSoft)
      gagnant_rang1: 0,
      rapport_rang1: 0,
      gagnant_rang2: 0,
      rapport_rang2: 0,
      gagnant_rang3: 0,
      rapport_rang3: 0,
      gagnant_rang4: 0,
      rapport_rang4: 0,
      gagnant_rang5: 0,
      rapport_rang5: 0,
      gagnant_rang6: 0,
      rapport_rang6: 0,
      gagnant_rang7: 0,
      rapport_rang7: 0,
      gagnant_rang8: 0,
      rapport_rang8: 0,
      gagnant_rang9: 0,
      rapport_rang9: 0,
      // Métadonnées d'import
      source: 'OpenDataSoft',
      imported_at: new Date().toISOString()
    }));
  }
  
  /**
   * Synchronise avec notre base de données locale
   */
  async syncWithLocalDatabase(): Promise<SyncResult> {
    try {
      console.log('🔄 Début de la synchronisation...');
      
      // 1. Récupérer la date du dernier tirage dans notre base
      const lastLocalDate = this.getLastLocalTirageDate();
      console.log(`📅 Dernier tirage local: ${lastLocalDate || 'Aucun'}`);
      
      // 2. Récupérer les nouveaux tirages depuis cette date
      const newTirages = await this.fetchLatestTirages(lastLocalDate || undefined, 50);
      
      if (newTirages.length === 0) {
        console.log('✅ Base de données déjà à jour');
        return {
          success: true,
          newTirages: 0,
          latestDate: lastLocalDate || '',
          totalAvailable: 0
        };
      }
      
      // 3. Convertir au format local
      const convertedTirages = this.convertToOurFormat(newTirages);
      
      // 4. Sauvegarder dans notre base locale
      const saved = await this.saveToLocalDatabase(convertedTirages);
      
      console.log(`✅ Synchronisation terminée: ${saved} nouveaux tirages`);
      
      return {
        success: true,
        newTirages: saved,
        latestDate: newTirages[0].date_de_tirage,
        totalAvailable: newTirages.length
      };
      
    } catch (error) {
      console.error('❌ Erreur de synchronisation:', error);
      return {
        success: false,
        newTirages: 0,
        latestDate: '',
        totalAvailable: 0,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
  
  /**
   * Récupère la date du dernier tirage local
   */
  private getLastLocalTirageDate(): string | null {
    try {
      // Côté serveur, on utilise le fichier JSON existant
      if (typeof window === 'undefined') {
        // Côté serveur - utiliser le fichier data/tirages.json
        const fs = require('fs');
        const path = require('path');
        
        const tiragesPath = path.join(process.cwd(), 'data', 'tirages.json');
        
        if (fs.existsSync(tiragesPath)) {
          const fileContent = fs.readFileSync(tiragesPath, 'utf8');
          const tirages = JSON.parse(fileContent);
          
          if (tirages.length > 0) {
            // Trier par date et prendre le plus récent
            const sorted = tirages.sort((a: any, b: any) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            return sorted[0].date;
          }
        }
        
        return null;
      } else {
        // Côté client - utiliser localStorage
        const localData = localStorage.getItem('loto_tirages');
        if (localData) {
          const tirages = JSON.parse(localData);
          if (tirages.length > 0) {
            const sorted = tirages.sort((a: any, b: any) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            return sorted[0].date;
          }
        }
        
        return null;
      }
    } catch (error) {
      console.error('Erreur lecture date locale:', error);
      return null;
    }
  }
  
  /**
   * Sauvegarde les nouveaux tirages dans notre base locale
   */
  private async saveToLocalDatabase(newTirages: any[]): Promise<number> {
    try {
      if (typeof window === 'undefined') {
        // Côté serveur - utiliser le fichier JSON
        const fs = require('fs');
        const path = require('path');
        
        const tiragesPath = path.join(process.cwd(), 'data', 'tirages.json');
        
        // Lire les tirages existants
        let existingTirages: any[] = [];
        if (fs.existsSync(tiragesPath)) {
          const fileContent = fs.readFileSync(tiragesPath, 'utf8');
          existingTirages = JSON.parse(fileContent);
        }
        
        // Éviter les doublons par date
        const existingDates = new Set(existingTirages.map((t: any) => t.date));
        const uniqueNewTirages = newTirages.filter(t => !existingDates.has(t.date));
        
        if (uniqueNewTirages.length === 0) {
          console.log('ℹ️ Aucun nouveau tirage unique à ajouter');
          return 0;
        }
        
        // Fusionner et trier
        const allTirages = [...existingTirages, ...uniqueNewTirages];
        allTirages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        // Sauvegarder dans le fichier
        fs.writeFileSync(tiragesPath, JSON.stringify(allTirages, null, 2));
        
        console.log(`💾 ${uniqueNewTirages.length} nouveaux tirages sauvegardés dans ${tiragesPath}`);
        return uniqueNewTirages.length;
        
      } else {
        // Côté client - utiliser localStorage
        const existingData = localStorage.getItem('loto_tirages');
        const existingTirages = existingData ? JSON.parse(existingData) : [];
        
        // Éviter les doublons par date
        const existingDates = new Set(existingTirages.map((t: any) => t.date));
        const uniqueNewTirages = newTirages.filter(t => !existingDates.has(t.date));
        
        if (uniqueNewTirages.length === 0) {
          console.log('ℹ️ Aucun nouveau tirage unique à ajouter');
          return 0;
        }
        
        // Fusionner et trier
        const allTirages = [...existingTirages, ...uniqueNewTirages];
        allTirages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        // Sauvegarder
        localStorage.setItem('loto_tirages', JSON.stringify(allTirages));
        
        console.log(`💾 ${uniqueNewTirages.length} nouveaux tirages sauvegardés`);
        return uniqueNewTirages.length;
      }
      
    } catch (error) {
      console.error('Erreur sauvegarde locale:', error);
      throw error;
    }
  }
  
  /**
   * Test de connectivité à l'API
   */
  async testConnectivity(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}?limit=1`);
      return response.ok;
    } catch (error) {
      console.error('Test connectivité échoué:', error);
      return false;
    }
  }
  
  /**
   * Récupère les statistiques de l'API
   */
  async getAPIStats(): Promise<{
    totalTirages: number;
    dateRange: { from: string; to: string };
    lastUpdate: string;
  }> {
    try {
      // Récupérer le premier et dernier tirage
      const [latest, oldest] = await Promise.all([
        fetch(`${this.API_BASE}?limit=1&order_by=date_de_tirage%20desc`).then(r => r.json()),
        fetch(`${this.API_BASE}?limit=1&order_by=date_de_tirage%20asc`).then(r => r.json())
      ]);
      
      return {
        totalTirages: latest.total_count,
        dateRange: {
          from: oldest.results[0].date_de_tirage,
          to: latest.results[0].date_de_tirage
        },
        lastUpdate: latest.results[0].date_de_tirage
      };
      
    } catch (error) {
      console.error('Erreur récupération stats API:', error);
      throw error;
    }
  }
}

// Instance singleton
export const openDataSoftSync = new OpenDataSoftSync();
