import { dataStorage, Tirage } from './data-storage';
import { csvImporter } from './csv-importer';

export interface FDJTirageData {
  date: string;
  numero_tirage: string;
  boule_1: string;
  boule_2: string;
  boule_3: string;
  boule_4: string;
  boule_5: string;
  numero_chance: string;
  gagnant_rang1: string;
  rapport_rang1: string;
  gagnant_rang2: string;
  rapport_rang2: string;
  gagnant_rang3: string;
  rapport_rang3: string;
  gagnant_rang4: string;
  rapport_rang4: string;
  gagnant_rang5: string;
  rapport_rang5: string;
  gagnant_rang6: string;
  rapport_rang6: string;
  gagnant_rang7: string;
  rapport_rang7: string;
  gagnant_rang8: string;
  rapport_rang8: string;
  gagnant_rang9: string;
  rapport_rang9: string;
}

export class DataCollector {
  private readonly FDJ_BASE_URL = 'https://www.fdj.fr';
  private readonly HISTORIQUE_URL = '/jeux-de-tirage/loto/historique';

  /**
   * Importe les données historiques depuis les fichiers CSV
   */
  async downloadHistoricalData(): Promise<FDJTirageData[]> {
    try {
      console.log('Import des données historiques depuis les fichiers CSV...');
      
      if (!csvImporter.hasCSVFiles()) {
        console.log('Aucun fichier CSV trouvé, génération de données de test...');
        return this.generateMockHistoricalData();
      }

      // Import des fichiers CSV réels
      const result = await csvImporter.importAllCSVFiles();
      console.log(`Import terminé: ${result.imported} tirages importés depuis ${result.files.length} fichiers`);
      
      // Retourner des données vides car l'import est déjà fait
      return [];
    } catch (error) {
      console.error('Erreur lors de l\'import des données:', error);
      throw new Error('Impossible d\'importer les données historiques');
    }
  }

  /**
   * Génère des données de test pour le développement
   * À remplacer par le vrai scraper FDJ
   */
  private generateMockHistoricalData(): FDJTirageData[] {
    const data: FDJTirageData[] = [];
    const startDate = new Date('2020-01-01');
    const endDate = new Date();
    
    let tirageNumber = 1;
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // Générer des tirages 2 fois par semaine (mercredi et samedi)
      if (currentDate.getDay() === 3 || currentDate.getDay() === 6) {
        const boules = this.generateRandomBoules();
        const numeroChance = Math.floor(Math.random() * 10) + 1;
        
        data.push({
          date: currentDate.toISOString().split('T')[0],
          numero_tirage: tirageNumber.toString(),
          boule_1: boules[0].toString(),
          boule_2: boules[1].toString(),
          boule_3: boules[2].toString(),
          boule_4: boules[3].toString(),
          boule_5: boules[4].toString(),
          numero_chance: numeroChance.toString(),
          gagnant_rang1: Math.floor(Math.random() * 5).toString(),
          rapport_rang1: (Math.random() * 1000000 + 100000).toFixed(2),
          gagnant_rang2: Math.floor(Math.random() * 20).toString(),
          rapport_rang2: (Math.random() * 50000 + 5000).toFixed(2),
          gagnant_rang3: Math.floor(Math.random() * 100).toString(),
          rapport_rang3: (Math.random() * 10000 + 1000).toFixed(2),
          gagnant_rang4: Math.floor(Math.random() * 500).toString(),
          rapport_rang4: (Math.random() * 1000 + 100).toFixed(2),
          gagnant_rang5: Math.floor(Math.random() * 2000).toString(),
          rapport_rang5: (Math.random() * 100 + 10).toFixed(2),
          gagnant_rang6: Math.floor(Math.random() * 5000).toString(),
          rapport_rang6: (Math.random() * 50 + 5).toFixed(2),
          gagnant_rang7: Math.floor(Math.random() * 10000).toString(),
          rapport_rang7: (Math.random() * 20 + 2).toFixed(2),
          gagnant_rang8: Math.floor(Math.random() * 20000).toString(),
          rapport_rang8: (Math.random() * 10 + 1).toFixed(2),
          gagnant_rang9: Math.floor(Math.random() * 50000).toString(),
          rapport_rang9: (Math.random() * 5 + 0.5).toFixed(2),
        });
        
        tirageNumber++;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  }

  /**
   * Génère 5 boules aléatoires entre 1 et 49 (sans doublons)
   */
  private generateRandomBoules(): number[] {
    const boules: number[] = [];
    while (boules.length < 5) {
      const num = Math.floor(Math.random() * 49) + 1;
      if (!boules.includes(num)) {
        boules.push(num);
      }
    }
    return boules.sort((a, b) => a - b);
  }

  /**
   * Convertit les données FDJ en format Tirage pour la base de données
   */
  private convertToTirage(fdjData: FDJTirageData): Omit<Tirage, 'id'> {
    return {
      date: fdjData.date,
      numero_tirage: parseInt(fdjData.numero_tirage),
      numero1: parseInt(fdjData.boule_1),
      numero2: parseInt(fdjData.boule_2),
      numero3: parseInt(fdjData.boule_3),
      numero4: parseInt(fdjData.boule_4),
      numero5: parseInt(fdjData.boule_5),
      complementaire: parseInt(fdjData.numero_chance),
      gagnant_rang1: parseInt(fdjData.gagnant_rang1) || 0,
      rapport_rang1: parseFloat(fdjData.rapport_rang1) || 0,
      gagnant_rang2: parseInt(fdjData.gagnant_rang2) || 0,
      rapport_rang2: parseFloat(fdjData.rapport_rang2) || 0,
      gagnant_rang3: parseInt(fdjData.gagnant_rang3) || 0,
      rapport_rang3: parseFloat(fdjData.rapport_rang3) || 0,
      gagnant_rang4: parseInt(fdjData.gagnant_rang4) || 0,
      rapport_rang4: parseFloat(fdjData.rapport_rang4) || 0,
      gagnant_rang5: parseInt(fdjData.gagnant_rang5) || 0,
      rapport_rang5: parseFloat(fdjData.rapport_rang5) || 0,
      gagnant_rang6: parseInt(fdjData.gagnant_rang6) || 0,
      rapport_rang6: parseFloat(fdjData.rapport_rang6) || 0,
      gagnant_rang7: parseInt(fdjData.gagnant_rang7) || 0,
      rapport_rang7: parseFloat(fdjData.rapport_rang7) || 0,
      gagnant_rang8: parseInt(fdjData.gagnant_rang8) || 0,
      rapport_rang8: parseFloat(fdjData.rapport_rang8) || 0,
      gagnant_rang9: parseInt(fdjData.gagnant_rang9) || 0,
      rapport_rang9: parseFloat(fdjData.rapport_rang9) || 0,
    };
  }

  /**
   * Importe les données dans la base de données
   */
  async importDataToDatabase(): Promise<{ imported: number; errors: number }> {
    try {
      if (csvImporter.hasCSVFiles()) {
        // Import direct des fichiers CSV
        const result = await csvImporter.importAllCSVFiles();
        console.log(`Import terminé: ${result.imported} tirages importés, ${result.errors} erreurs`);
        return { imported: result.imported, errors: result.errors };
      } else {
        // Génération de données de test
        const historicalData = await this.downloadHistoricalData();
        let imported = 0;
        let errors = 0;

        console.log(`Import de ${historicalData.length} tirages...`);

        for (const fdjData of historicalData) {
          try {
            const tirage = this.convertToTirage(fdjData);
            dataStorage.insertTirage(tirage);
            imported++;
          } catch (error) {
            console.error(`Erreur lors de l'import du tirage ${fdjData.numero_tirage}:`, error);
            errors++;
          }
        }

        console.log(`Import terminé: ${imported} tirages importés, ${errors} erreurs`);
        return { imported, errors };
      }
    } catch (error) {
      console.error('Erreur lors de l\'import des données:', error);
      throw error;
    }
  }

  /**
   * Vérifie si de nouveaux tirages sont disponibles
   */
  async checkForNewTirages(): Promise<boolean> {
    try {
      const latestTirage = dataStorage.getLatestTirage();
      if (!latestTirage) return true;

      // En réalité, vérifier sur le site FDJ
      // Pour l'instant, on simule
      const today = new Date();
      const lastTirageDate = new Date(latestTirage.date);
      const daysDiff = Math.floor((today.getTime() - lastTirageDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return daysDiff >= 3; // Nouveau tirage possible après 3 jours
    } catch (error) {
      console.error('Erreur lors de la vérification des nouveaux tirages:', error);
      return false;
    }
  }
}

export const dataCollector = new DataCollector();
