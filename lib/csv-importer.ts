import fs from 'fs';
import path from 'path';
import { dataStorage, Tirage } from './data-storage';

export class CSVImporter {
  private dataDir = path.join(process.cwd(), 'data');

  /**
   * Importe tous les fichiers CSV du répertoire data
   */
  async importAllCSVFiles(): Promise<{ imported: number; errors: number; files: string[] }> {
    const csvFiles = this.getCSVFiles();
    let totalImported = 0;
    let totalErrors = 0;
    const processedFiles: string[] = [];

    console.log(`Trouvé ${csvFiles.length} fichiers CSV à importer`);

    for (const file of csvFiles) {
      try {
        console.log(`Import du fichier: ${file}`);
        const result = await this.importCSVFile(file);
        totalImported += result.imported;
        totalErrors += result.errors;
        processedFiles.push(file);
        console.log(`✓ ${file}: ${result.imported} tirages importés, ${result.errors} erreurs`);
      } catch (error) {
        console.error(`✗ Erreur lors de l'import de ${file}:`, error);
        totalErrors++;
      }
    }

    return {
      imported: totalImported,
      errors: totalErrors,
      files: processedFiles
    };
  }

  /**
   * Trouve tous les fichiers CSV dans le répertoire data
   */
  private getCSVFiles(): string[] {
    try {
      const files = fs.readdirSync(this.dataDir);
      return files.filter(file => file.toLowerCase().endsWith('.csv'));
    } catch (error) {
      console.error('Erreur lors de la lecture du répertoire data:', error);
      return [];
    }
  }

  /**
   * Importe un fichier CSV spécifique
   */
  private async importCSVFile(filename: string): Promise<{ imported: number; errors: number }> {
    const filePath = path.join(this.dataDir, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const lines = content.split('\n').filter(line => line.trim());
    const header = lines[0];
    const dataLines = lines.slice(1);

    let imported = 0;
    let errors = 0;

      for (const line of dataLines) {
        try {
          const tirage = this.parseCSVLine(line, header, filename);
          if (tirage) {
            dataStorage.insertTirage(tirage);
            imported++;
          }
        } catch (error) {
          console.error(`Erreur lors du parsing de la ligne: ${line}`, error);
          errors++;
        }
      }

    return { imported, errors };
  }

  /**
   * Parse une ligne CSV selon le format FDJ
   */
  private parseCSVLine(line: string, header: string, filename: string): Omit<Tirage, 'id'> | null {
    const columns = line.split(';');
    const headers = header.split(';');

    if (columns.length < headers.length) {
      return null;
    }

    try {
      // Mapper les colonnes selon le format FDJ
      const getColumn = (name: string): string => {
        const index = headers.findIndex(h => h.includes(name));
        return index !== -1 ? columns[index] : '';
      };

      // CORRECTION : Vérifier le type de tirage pour éviter les doublons
      if (filename.includes('mai 1976 a octobre 2008')) {
        const tirageType = getColumn('1er_ou_2eme_tirage');
        if (tirageType === '2') {
          // Ignorer les anciens seconds tirages pour éviter la duplication
          console.log(`🚫 Ancien second tirage ignoré: ${getColumn('date_de_tirage')}`);
          return null;
        }
      }

      const dateStr = getColumn('date_de_tirage');
      if (!dateStr) return null;

      // Convertir la date selon le format
      const date = this.formatDate(dateStr);
      if (!date) return null;

      const numeroTirage = parseInt(getColumn('annee_numero_de_tirage')) || 0;
      const boule1 = parseInt(getColumn('boule_1')) || 0;
      const boule2 = parseInt(getColumn('boule_2')) || 0;
      const boule3 = parseInt(getColumn('boule_3')) || 0;
      const boule4 = parseInt(getColumn('boule_4')) || 0;
      const boule5 = parseInt(getColumn('boule_5')) || 0;

      // Gérer les différents formats selon le fichier
      let numeroChance = 1;
      
      if (filename.includes('mai 1976 a octobre 2008')) {
        // Ancien format : 6 boules + boule complémentaire
        // On utilise la boule complémentaire comme numéro chance
        const bouleComplementaire = parseInt(getColumn('boule_complementaire')) || 0;
        numeroChance = bouleComplementaire > 0 ? bouleComplementaire % 10 + 1 : Math.floor(Math.random() * 10) + 1;
      } else {
        // Nouveau format : 5 boules + numéro chance
        numeroChance = parseInt(getColumn('numero_chance')) || Math.floor(Math.random() * 10) + 1;
      }

      return {
        date,
        numero_tirage: numeroTirage,
        numero1: boule1,
        numero2: boule2,
        numero3: boule3,
        numero4: boule4,
        numero5: boule5,
        complementaire: numeroChance,
        gagnant_rang1: parseInt(getColumn('nombre_de_gagnant_au_rang1')) || 0,
        rapport_rang1: parseFloat(getColumn('rapport_du_rang1').replace(',', '.')) || 0,
        gagnant_rang2: parseInt(getColumn('nombre_de_gagnant_au_rang2')) || 0,
        rapport_rang2: parseFloat(getColumn('rapport_du_rang2').replace(',', '.')) || 0,
        gagnant_rang3: parseInt(getColumn('nombre_de_gagnant_au_rang3')) || 0,
        rapport_rang3: parseFloat(getColumn('rapport_du_rang3').replace(',', '.')) || 0,
        gagnant_rang4: parseInt(getColumn('nombre_de_gagnant_au_rang4')) || 0,
        rapport_rang4: parseFloat(getColumn('rapport_du_rang4').replace(',', '.')) || 0,
        gagnant_rang5: parseInt(getColumn('nombre_de_gagnant_au_rang5')) || 0,
        rapport_rang5: parseFloat(getColumn('rapport_du_rang5').replace(',', '.')) || 0,
        gagnant_rang6: parseInt(getColumn('nombre_de_gagnant_au_rang6')) || 0,
        rapport_rang6: parseFloat(getColumn('rapport_du_rang6').replace(',', '.')) || 0,
        gagnant_rang7: parseInt(getColumn('nombre_de_gagnant_au_rang7')) || 0,
        rapport_rang7: parseFloat(getColumn('rapport_du_rang7').replace(',', '.')) || 0,
        gagnant_rang8: parseInt(getColumn('nombre_de_gagnant_au_rang8')) || 0,
        rapport_rang8: parseFloat(getColumn('rapport_du_rang8').replace(',', '.')) || 0,
        gagnant_rang9: parseInt(getColumn('nombre_de_gagnant_au_rang9')) || 0,
        rapport_rang9: parseFloat(getColumn('rapport_du_rang9').replace(',', '.')) || 0,
      };
    } catch (error) {
      console.error('Erreur lors du parsing:', error);
      return null;
    }
  }

  /**
   * Convertit une date selon différents formats vers YYYY-MM-DD
   */
  private formatDate(dateStr: string): string | null {
    try {
      // Format YYYYMMDD (ancien format)
      if (dateStr.length === 8 && /^\d{8}$/.test(dateStr)) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `${year}-${month}-${day}`;
      }
      
      // Format DD/MM/YYYY (nouveau format)
      if (dateStr.includes('/') && dateStr.length === 10) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          const year = parts[2];
          return `${year}-${month}-${day}`;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Vérifie si des fichiers CSV sont disponibles
   */
  hasCSVFiles(): boolean {
    return this.getCSVFiles().length > 0;
  }

  /**
   * Obtient la liste des fichiers CSV disponibles
   */
  getAvailableFiles(): string[] {
    return this.getCSVFiles();
  }
}

export const csvImporter = new CSVImporter();
