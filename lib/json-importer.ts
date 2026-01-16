import fs from 'fs';
import path from 'path';
import { dataStorage, Tirage } from './data-storage';

export interface JSONTirageData {
  annee_numero_de_tirage: number;
  '1er_ou_2eme_tirage': number;
  jour_de_tirage: string;
  date_de_tirage: number;
  date_de_forclusion: number | null;
  boule_1: number;
  boule_2: number;
  boule_3: number;
  boule_4: number;
  boule_5: number;
  boule_6: number | null;
  boule_complementaire: number | null;
  combinaison_gagnante_en_ordre_croissant: string;
  numero_joker: number | null;
  nombre_de_gagnant_au_rang1: number;
  rapport_du_rang1: string;
  nombre_de_gagnant_au_rang2: number;
  rapport_du_rang2: string;
  nombre_de_gagnant_au_rang3: number;
  rapport_du_rang3: string;
  nombre_de_gagnant_au_rang4: number;
  rapport_du_rang4: string;
  nombre_de_gagnant_au_rang5: number;
  rapport_du_rang5: string;
  nombre_de_gagnant_au_rang6: number;
  rapport_du_rang6: string;
  nombre_de_gagnant_au_rang7: number;
  rapport_du_rang7: string;
  nombre_de_gagnant_au_rang8: number | null;
  rapport_du_rang8: string | null;
  nombre_de_gagnant_au_rang9: number | null;
  rapport_du_rang9: string | null;
  numero_jokerplus: number | null;
  devise: string;
  source_file: string;
  numero_chance: number | null;
}

export class JSONImporter {
  private dataDir = path.join(process.cwd(), 'data');
  private jsonFileName = 'Tirages_Loto_1976_2025_COMPLET.json';

  /**
   * Importe le fichier JSON complet
   */
  async importJSONFile(): Promise<{ imported: number; errors: number }> {
    try {
      console.log('Import du fichier JSON complet...');
      
      const filePath = path.join(this.dataDir, this.jsonFileName);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`Fichier JSON non trouvé: ${filePath}`);
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const jsonData: JSONTirageData[] = JSON.parse(content);
      
      console.log(`Fichier JSON chargé: ${jsonData.length} tirages trouvés`);

      let imported = 0;
      let errors = 0;

      for (const tirageData of jsonData) {
        try {
          const tirage = this.convertJSONToTirage(tirageData);
          if (tirage) {
            dataStorage.insertTirage(tirage);
            imported++;
          }
        } catch (error) {
          console.error(`Erreur lors de l'import du tirage ${tirageData.annee_numero_de_tirage}:`, error);
          errors++;
        }
      }

      console.log(`Import JSON terminé: ${imported} tirages importés, ${errors} erreurs`);
      return { imported, errors };
    } catch (error) {
      console.error('Erreur lors de l\'import du fichier JSON:', error);
      throw error;
    }
  }

  /**
   * Convertit les données JSON vers le format Tirage
   */
  private convertJSONToTirage(jsonData: JSONTirageData): Omit<Tirage, 'id'> | null {
    try {
      // Convertir la date (timestamp en millisecondes)
      const date = new Date(jsonData.date_de_tirage);
      const dateStr = date.toISOString().split('T')[0]; // Format YYYY-MM-DD

      // Déterminer le numéro chance selon la période
      let numeroChance = 1;
      
      if (jsonData.numero_chance && jsonData.numero_chance > 0) {
        // Format moderne (après 2008)
        numeroChance = jsonData.numero_chance;
      } else if (jsonData.boule_complementaire && jsonData.boule_complementaire > 0) {
        // Format ancien (avant 2008) - utiliser la boule complémentaire
        numeroChance = jsonData.boule_complementaire % 10 + 1;
      } else {
        // Fallback
        numeroChance = Math.floor(Math.random() * 10) + 1;
      }

      return {
        date: dateStr,
        numero_tirage: jsonData.annee_numero_de_tirage,
        numero1: jsonData.boule_1,
        numero2: jsonData.boule_2,
        numero3: jsonData.boule_3,
        numero4: jsonData.boule_4,
        numero5: jsonData.boule_5,
        complementaire: numeroChance,
        gagnant_rang1: jsonData.nombre_de_gagnant_au_rang1 || 0,
        rapport_rang1: parseFloat(jsonData.rapport_du_rang1.replace(',', '.')) || 0,
        gagnant_rang2: jsonData.nombre_de_gagnant_au_rang2 || 0,
        rapport_rang2: parseFloat(jsonData.rapport_du_rang2.replace(',', '.')) || 0,
        gagnant_rang3: jsonData.nombre_de_gagnant_au_rang3 || 0,
        rapport_rang3: parseFloat(jsonData.rapport_du_rang3.replace(',', '.')) || 0,
        gagnant_rang4: jsonData.nombre_de_gagnant_au_rang4 || 0,
        rapport_rang4: parseFloat(jsonData.rapport_du_rang4.replace(',', '.')) || 0,
        gagnant_rang5: jsonData.nombre_de_gagnant_au_rang5 || 0,
        rapport_rang5: parseFloat(jsonData.rapport_du_rang5.replace(',', '.')) || 0,
        gagnant_rang6: jsonData.nombre_de_gagnant_au_rang6 || 0,
        rapport_rang6: parseFloat(jsonData.rapport_du_rang6.replace(',', '.')) || 0,
        gagnant_rang7: jsonData.nombre_de_gagnant_au_rang7 || 0,
        rapport_rang7: parseFloat(jsonData.rapport_du_rang7.replace(',', '.')) || 0,
        gagnant_rang8: jsonData.nombre_de_gagnant_au_rang8 || 0,
        rapport_rang8: parseFloat(jsonData.rapport_du_rang8?.replace(',', '.') || '0') || 0,
        gagnant_rang9: jsonData.nombre_de_gagnant_au_rang9 || 0,
        rapport_rang9: parseFloat(jsonData.rapport_du_rang9?.replace(',', '.') || '0') || 0,
      };
    } catch (error) {
      console.error('Erreur lors de la conversion JSON:', error);
      return null;
    }
  }

  /**
   * Vérifie si le fichier JSON est disponible
   */
  hasJSONFile(): boolean {
    const filePath = path.join(this.dataDir, this.jsonFileName);
    return fs.existsSync(filePath);
  }

  /**
   * Obtient les statistiques du fichier JSON
   */
  getJSONStats(): { totalTirages: number; dateDebut: string; dateFin: string } | null {
    try {
      const filePath = path.join(this.dataDir, this.jsonFileName);
      
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const jsonData: JSONTirageData[] = JSON.parse(content);
      
      if (jsonData.length === 0) {
        return { totalTirages: 0, dateDebut: '', dateFin: '' };
      }

      // Trier par date pour obtenir la première et dernière
      const sortedData = jsonData.sort((a, b) => a.date_de_tirage - b.date_de_tirage);
      const premiereDate = new Date(sortedData[0].date_de_tirage).toISOString().split('T')[0];
      const derniereDate = new Date(sortedData[sortedData.length - 1].date_de_tirage).toISOString().split('T')[0];

      return {
        totalTirages: jsonData.length,
        dateDebut: premiereDate,
        dateFin: derniereDate
      };
    } catch (error) {
      console.error('Erreur lors de la lecture des statistiques JSON:', error);
      return null;
    }
  }
}

export const jsonImporter = new JSONImporter();




