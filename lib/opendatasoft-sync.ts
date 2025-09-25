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
  // Données de gains disponibles dans l'API
  rapport_du_rang1: number;
  nombre_de_gagnant_au_rang1: number;
  rapport_du_rang2: number;
  nombre_de_gagnant_au_rang2: number;
  rapport_du_rang3: number;
  nombre_de_gagnant_au_rang3: number;
  rapport_du_rang4: number;
  nombre_de_gagnant_au_rang4: number;
  rapport_du_rang5: number;
  nombre_de_gagnant_au_rang5: number;
  rapport_du_rang6: number;
  nombre_de_gagnant_au_rang6: number;
  rapport_du_rang7: number;
  nombre_de_gagnant_au_rang7: number;
  // Distinguo 1er/2e tirage
  '1er_ou_2eme_tirage': number;
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
  async fetchLatestTirages(sinceDate?: string, limit: number = 3000): Promise<OpenDataSoftTirage[]> {
    try {
      // Récupère une grande page triée DESC, puis filtre côté client
      let url = `${this.API_BASE}?limit=${limit}&order_by=date_de_tirage%20desc`;
      console.log(`🔍 Récupération depuis: ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      const results: OpenDataSoftTirage[] = data.results || [];

      if (!sinceDate) return results;

      const since = new Date(String(sinceDate).slice(0,10));
      const filtered = results.filter(r => {
        const d = new Date(String(r.date_de_tirage).slice(0,10));
        return d.getTime() > since.getTime();
      });
      console.log(`📊 ${filtered.length} tirages filtrés après ${sinceDate} (sur ${results.length})`);
      return filtered;

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
      date: (typeof tirage.date_de_tirage === 'string' ? tirage.date_de_tirage.slice(0, 10) : String(tirage.date_de_tirage).slice(0, 10)),
      numero_tirage: parseInt(tirage.annee_numero_de_tirage) || 0,
      numero1: tirage.boule_1,
      numero2: tirage.boule_2,
      numero3: tirage.boule_3,
      numero4: tirage.boule_4,
      numero5: tirage.boule_5,
      complementaire: tirage.numero_chance,
      // DONNÉES DE GAINS RÉCUPÉRÉES DEPUIS L'API OPENDATASOFT
      gagnant_rang1: tirage.nombre_de_gagnant_au_rang1 || 0,
      rapport_rang1: tirage.rapport_du_rang1 || 0,
      gagnant_rang2: tirage.nombre_de_gagnant_au_rang2 || 0,
      rapport_rang2: tirage.rapport_du_rang2 || 0,
      gagnant_rang3: tirage.nombre_de_gagnant_au_rang3 || 0,
      rapport_rang3: tirage.rapport_du_rang3 || 0,
      gagnant_rang4: tirage.nombre_de_gagnant_au_rang4 || 0,
      rapport_rang4: tirage.rapport_du_rang4 || 0,
      gagnant_rang5: tirage.nombre_de_gagnant_au_rang5 || 0,
      rapport_rang5: tirage.rapport_du_rang5 || 0,
      gagnant_rang6: tirage.nombre_de_gagnant_au_rang6 || 0,
      rapport_rang6: tirage.rapport_du_rang6 || 0,
      gagnant_rang7: tirage.nombre_de_gagnant_au_rang7 || 0,
      rapport_rang7: tirage.rapport_du_rang7 || 0,
      // Rangs 8 et 9 non disponibles dans l'API OpenDataSoft
      gagnant_rang8: 0,
      rapport_rang8: 0,
      gagnant_rang9: 0,
      rapport_rang9: 0,
      // Métadonnées d'import
      source: 'OpenDataSoft',
      imported_at: new Date().toISOString(),
      // Distinguo 1er/2e tirage
      tirage_type: tirage['1er_ou_2eme_tirage'] || 1
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
      if (typeof window === 'undefined') {
        const fs = require('fs');
        const path = require('path');
        
        const jsonCompletPath = path.join(process.cwd(), 'data', 'Tirages_Loto_1976_2025_COMPLET.json');
        const tiragesPath = path.join(process.cwd(), 'data', 'tirages.json');
        const toIso = (raw: any): string => {
          try {
            if (!raw) return '1976-05-19';
            const s = String(raw);
            if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
            const d = new Date(raw);
            if (Number.isFinite(d.getTime())) return d.toISOString().split('T')[0];
            const digits = s.replace(/\D/g, '');
            if (digits.length >= 8) return `${digits.slice(0,4)}-${digits.slice(4,6)}-${digits.slice(6,8)}`;
            return '1976-05-19';
          } catch { return '1976-05-19'; }
        };

        const dates: string[] = [];
        if (fs.existsSync(tiragesPath)) {
          const fileContent = fs.readFileSync(tiragesPath, 'utf8');
          const arr = JSON.parse(fileContent);
          for (const t of arr) dates.push(toIso(t.date));
        }
        if (dates.length === 0 && fs.existsSync(jsonCompletPath)) {
          const fileContent = fs.readFileSync(jsonCompletPath, 'utf8');
          const jsonData = JSON.parse(fileContent);
          for (const t of jsonData) dates.push(toIso(t.date_de_tirage));
        }
        if (dates.length > 0) {
          dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
          return dates[0];
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
        const fs = require('fs');
        const path = require('path');
        
        const tiragesPath = path.join(process.cwd(), 'data', 'tirages.json');
        
        // Lire uniquement le fichier de récents
        let existingTirages: any[] = [];
        const targetPath = tiragesPath;
        if (fs.existsSync(tiragesPath)) {
          const fileContent = fs.readFileSync(tiragesPath, 'utf8');
          existingTirages = JSON.parse(fileContent);
        }
        
        // Éviter les doublons par (date + type)
        const keyOf = (t: any) => `${(t.date || '').slice(0,10)}|${t.tirage_type || 1}`;
        const existingKeys = new Set(existingTirages.map((t: any) => keyOf(t)));
        const uniqueNewTirages = newTirages.filter(t => !existingKeys.has(keyOf(t)));
        
        if (uniqueNewTirages.length === 0) {
          console.log('ℹ️ Aucun nouveau tirage unique à ajouter');
          return 0;
        }
        
        // Fusionner et trier
        const allTirages = [...existingTirages, ...uniqueNewTirages];
        allTirages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        // Sauvegarder dans le fichier de récents
        fs.writeFileSync(targetPath, JSON.stringify(allTirages, null, 2));
        
        console.log(`💾 ${uniqueNewTirages.length} nouveaux tirages sauvegardés dans ${targetPath}`);
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
