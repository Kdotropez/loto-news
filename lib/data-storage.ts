import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const tiragesFile = path.join(dataDir, 'tirages.json');
const favoritesFile = path.join(dataDir, 'favorites.json');

// Créer le dossier data s'il n'existe pas
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export interface Tirage {
  id?: number;
  annee_numero?: string;
  date: string;
  numero1: number;
  numero2: number;
  numero3: number;
  numero4: number;
  numero5: number;
  complementaire: number;
  source?: string;
  imported_at?: string;
  // Anciens champs pour compatibilité
  numero_tirage?: number;
  boule_1?: number;
  boule_2?: number;
  boule_3?: number;
  boule_4?: number;
  boule_5?: number;
  numero_chance?: number;
  gagnant_rang1?: number;
  rapport_rang1?: number;
  gagnant_rang2?: number;
  rapport_rang2?: number;
  gagnant_rang3?: number;
  rapport_rang3?: number;
  gagnant_rang4?: number;
  rapport_rang4?: number;
  gagnant_rang5?: number;
  rapport_rang5?: number;
  gagnant_rang6?: number;
  rapport_rang6?: number;
  gagnant_rang7?: number;
  rapport_rang7?: number;
  gagnant_rang8?: number;
  rapport_rang8?: number;
  gagnant_rang9?: number;
  rapport_rang9?: number;
}

export interface Favorite {
  id: number;
  nom: string;
  boule_1: number;
  boule_2: number;
  boule_3: number;
  boule_4: number;
  boule_5: number;
  numero_chance: number;
  created_at: string;
}

class DataStorage {
  private tirages: Tirage[] = [];
  private favorites: Favorite[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      if (fs.existsSync(tiragesFile)) {
        const data = fs.readFileSync(tiragesFile, 'utf8');
        this.tirages = JSON.parse(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tirages:', error);
      this.tirages = [];
    }

    try {
      if (fs.existsSync(favoritesFile)) {
        const data = fs.readFileSync(favoritesFile, 'utf8');
        this.favorites = JSON.parse(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
      this.favorites = [];
    }
  }

  private saveTirages() {
    try {
      fs.writeFileSync(tiragesFile, JSON.stringify(this.tirages, null, 2));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des tirages:', error);
    }
  }

  private saveFavorites() {
    try {
      fs.writeFileSync(favoritesFile, JSON.stringify(this.favorites, null, 2));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des favoris:', error);
    }
  }

  // Méthodes pour les tirages
  insertTirage(tirage: Omit<Tirage, 'id'>) {
    const newTirage: Tirage = {
      ...tirage,
      id: this.tirages.length > 0 ? Math.max(...this.tirages.map(t => t.id || 0)) + 1 : 1
    };
    this.tirages.unshift(newTirage); // Ajouter au début
    this.saveTirages();
    return newTirage;
  }

  getAllTirages(): Tirage[] {
    return [...this.tirages].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getTiragesByDateRange(startDate: string, endDate: string): Tirage[] {
    return this.tirages.filter(tirage => 
      tirage.date >= startDate && tirage.date <= endDate
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getLatestTirage(): Tirage | null {
    return this.tirages.length > 0 ? this.tirages[0] : null;
  }

  getTirageByDate(date: string): Tirage | null {
    return this.tirages.find(tirage => tirage.date === date) || null;
  }

  // Méthodes pour les favoris
  getAllFavorites(): Favorite[] {
    return [...this.favorites];
  }

  addFavorite(favorite: Omit<Favorite, 'id' | 'created_at'>) {
    const newFavorite: Favorite = {
      ...favorite,
      id: this.favorites.length > 0 ? Math.max(...this.favorites.map(f => f.id)) + 1 : 1,
      created_at: new Date().toISOString()
    };
    this.favorites.unshift(newFavorite);
    this.saveFavorites();
    return newFavorite;
  }

  deleteFavorite(id: number) {
    const index = this.favorites.findIndex(f => f.id === id);
    if (index !== -1) {
      this.favorites.splice(index, 1);
      this.saveFavorites();
      return true;
    }
    return false;
  }

  // Méthodes pour les statistiques
  getStatistiquesNumeros() {
    const numerosFrequence = new Map<number, { count: number; lastDate: string }>();

    // Compter les occurrences de chaque numéro
    this.tirages.forEach(tirage => {
      const boules = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5];
      boules.forEach(numero => {
        if (typeof numero !== 'number') return;
        const current = numerosFrequence.get(numero) || { count: 0, lastDate: '' };
        numerosFrequence.set(numero, {
          count: current.count + 1,
          lastDate: tirage.date > current.lastDate ? tirage.date : current.lastDate
        });
      });
    });

    // Calculer les écarts actuels
    const latestDate = this.tirages[0]?.date || new Date().toISOString().split('T')[0];
    const ecartsActuels = this.calculateCurrentGaps(latestDate);

    const result = [];
    for (let numero = 1; numero <= 49; numero++) {
      const data = numerosFrequence.get(numero) || { count: 0, lastDate: '' };
      const ecartActuel = ecartsActuels.get(numero) || 0;

      result.push({
        numero,
        frequence: data.count,
        derniere_sortie: data.lastDate,
        ecart_moyen: 0, // Simplifié pour cette version
        ecart_actuel: ecartActuel
      });
    }

    return result.sort((a, b) => b.frequence - a.frequence);
  }

  private calculateCurrentGaps(latestDate: string): Map<number, number> {
    const gaps = new Map<number, number>();
    const latestDateObj = new Date(latestDate);

    for (let numero = 1; numero <= 49; numero++) {
      let lastOccurrence = '';
      
      for (const tirage of this.tirages) {
        const boules = [tirage.boule_1, tirage.boule_2, tirage.boule_3, tirage.boule_4, tirage.boule_5];
        if (boules.includes(numero)) {
          lastOccurrence = tirage.date;
        }
      }

      if (lastOccurrence) {
        const lastDateObj = new Date(lastOccurrence);
        const daysDiff = Math.floor((latestDateObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));
        gaps.set(numero, daysDiff);
      } else {
        gaps.set(numero, 9999); // Très grand nombre si jamais sorti
      }
    }

    return gaps;
  }
}

export const dataStorage = new DataStorage();
