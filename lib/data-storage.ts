import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
// Priorité au fichier JSON complet, fallback vers l'ancien
const tiragesFileComplet = path.join(dataDir, 'Tirages_Loto_1976_2025_COMPLET.json');
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
      const toNumber = (value: any): number => {
        if (value == null) return 0;
        if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
        const parsed = parseFloat(String(value).replace(',', '.'));
        return Number.isFinite(parsed) ? parsed : 0;
      };

      const toIsoDate = (raw: any): string => {
        try {
          const todayIso = new Date().toISOString().split('T')[0];
          const minIso = '1976-05-19';
          if (raw == null) return minIso;
          if (typeof raw === 'string') {
            if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
            const digits = raw.replace(/\D/g, '');
            if (digits.length >= 12) {
              const y = digits.slice(0, 4);
              let m = digits.slice(4, 6);
              let d = digits.slice(6, 8);
              const yearNum = Number(y);
              if (yearNum >= 1900 && yearNum <= 2100) {
                if (m === '00' || Number(m) < 1 || Number(m) > 12) m = '01';
                if (d === '00' || Number(d) < 1 || Number(d) > 31) d = '01';
                let iso = `${y}-${m}-${d}`;
                if (iso < minIso) iso = minIso;
                if (iso > todayIso) iso = todayIso;
                return iso;
              }
            }
            if (digits.length >= 8) {
              const y = digits.slice(0, 4);
              let m = digits.slice(4, 6);
              let d = digits.slice(6, 8);
              const yearNum = Number(y);
              if (yearNum >= 1900 && yearNum <= 2100) {
                if (m === '00' || Number(m) < 1 || Number(m) > 12) m = '01';
                if (d === '00' || Number(d) < 1 || Number(d) > 31) d = '01';
                let iso = `${y}-${m}-${d}`;
                if (iso < minIso) iso = minIso;
                if (iso > todayIso) iso = todayIso;
                return iso;
              }
            }
            const dt = new Date(raw);
            if (Number.isFinite(dt.getTime())) {
              let iso = dt.toISOString().split('T')[0];
              if (iso < minIso) iso = minIso;
              if (iso > todayIso) iso = todayIso;
              return iso;
            }
            return minIso;
          }
          if (typeof raw === 'number') {
            const s = String(raw);
            if (s.length >= 12) {
              const y = s.slice(0, 4);
              let m = s.slice(4, 6);
              let d = s.slice(6, 8);
              const yearNum = Number(y);
              if (yearNum >= 1900 && yearNum <= 2100) {
                if (m === '00' || Number(m) < 1 || Number(m) > 12) m = '01';
                if (d === '00' || Number(d) < 1 || Number(d) > 31) d = '01';
                let iso = `${y}-${m}-${d}`;
                if (iso < minIso) iso = minIso;
                if (iso > todayIso) iso = todayIso;
                return iso;
              }
            }
            if (s.length >= 8) {
              const y = s.slice(0, 4);
              let m = s.slice(4, 6);
              let d = s.slice(6, 8);
              const yearNum = Number(y);
              if (yearNum >= 1900 && yearNum <= 2100) {
                if (m === '00' || Number(m) < 1 || Number(m) > 12) m = '01';
                if (d === '00' || Number(d) < 1 || Number(d) > 31) d = '01';
                let iso = `${y}-${m}-${d}`;
                if (iso < minIso) iso = minIso;
                if (iso > todayIso) iso = todayIso;
                return iso;
              }
            }
            if (raw > 1e11) {
              const dt = new Date(raw);
              if (Number.isFinite(dt.getTime())) {
                let iso = dt.toISOString().split('T')[0];
                if (iso < minIso) iso = minIso;
                if (iso > todayIso) iso = todayIso;
                return iso;
              }
            }
            const dt = new Date(raw);
            if (Number.isFinite(dt.getTime())) {
              let iso = dt.toISOString().split('T')[0];
              if (iso < minIso) iso = minIso;
              if (iso > todayIso) iso = todayIso;
              return iso;
            }
            return minIso;
          }
          return minIso;
        } catch {
          return '1976-05-19';
        }
      };

      // Lire UNIQUEMENT le fichier canonique tirages.json si disponible
      if (fs.existsSync(tiragesFile)) {
        const data = fs.readFileSync(tiragesFile, 'utf8');
        const arr: any[] = JSON.parse(data);
        this.tirages = arr.map((t: any) => ({
          id: t.id || t.numero_tirage || undefined,
          annee_numero: t.annee_numero || (t.numero_tirage ? String(t.numero_tirage) : undefined),
          date: toIsoDate(t.date),
          numero1: t.numero1 ?? t.boule_1,
          numero2: t.numero2 ?? t.boule_2,
          numero3: t.numero3 ?? t.boule_3,
          numero4: t.numero4 ?? t.boule_4,
          numero5: t.numero5 ?? t.boule_5,
          complementaire: t.complementaire ?? t.numero_chance,
          source: t.source || 'Canonical',
          gagnant_rang1: toNumber(t.gagnant_rang1),
          rapport_rang1: toNumber(t.rapport_rang1),
          gagnant_rang2: toNumber(t.gagnant_rang2),
          rapport_rang2: toNumber(t.rapport_rang2),
          gagnant_rang3: toNumber(t.gagnant_rang3),
          rapport_rang3: toNumber(t.rapport_rang3),
          gagnant_rang4: toNumber(t.gagnant_rang4),
          rapport_rang4: toNumber(t.rapport_rang4),
          gagnant_rang5: toNumber(t.gagnant_rang5),
          rapport_rang5: toNumber(t.rapport_rang5),
          gagnant_rang6: toNumber(t.gagnant_rang6),
          rapport_rang6: toNumber(t.rapport_rang6),
          gagnant_rang7: toNumber(t.gagnant_rang7),
          rapport_rang7: toNumber(t.rapport_rang7),
          gagnant_rang8: toNumber(t.gagnant_rang8),
          rapport_rang8: toNumber(t.rapport_rang8),
          gagnant_rang9: toNumber(t.gagnant_rang9),
          rapport_rang9: toNumber(t.rapport_rang9),
        }))
        .filter((t: Tirage) => t.date <= new Date().toISOString().split('T')[0])
        .sort((a: Tirage, b: Tirage) => new Date(b.date).getTime() - new Date(a.date).getTime());
        console.log(`📊 ${this.tirages.length} tirages chargés depuis le fichier canonique tirages.json`);
      } else if (fs.existsSync(tiragesFileComplet)) {
        // Fallback: historique seul
        const data = fs.readFileSync(tiragesFileComplet, 'utf8');
        const jsonData = JSON.parse(data);
        this.tirages = jsonData.map((t: any) => ({
          id: t.annee_numero_de_tirage,
          annee_numero: t.annee_numero_de_tirage.toString(),
          date: toIsoDate(t.date_de_tirage),
          numero1: t.boule_1,
          numero2: t.boule_2,
          numero3: t.boule_3,
          numero4: t.boule_4,
          numero5: t.boule_5,
          complementaire: t.numero_chance || (t.boule_complementaire % 10 + 1),
          source: t.source_file || 'JSON_Complet',
          gagnant_rang1: t.nombre_de_gagnant_au_rang1 || 0,
          rapport_rang1: toNumber(t.rapport_du_rang1),
          gagnant_rang2: t.nombre_de_gagnant_au_rang2 || 0,
          rapport_rang2: toNumber(t.rapport_du_rang2),
          gagnant_rang3: t.nombre_de_gagnant_au_rang3 || 0,
          rapport_rang3: toNumber(t.rapport_du_rang3),
          gagnant_rang4: t.nombre_de_gagnant_au_rang4 || 0,
          rapport_rang4: toNumber(t.rapport_du_rang4),
          gagnant_rang5: t.nombre_de_gagnant_au_rang5 || 0,
          rapport_rang5: toNumber(t.rapport_du_rang5),
          gagnant_rang6: t.nombre_de_gagnant_au_rang6 || 0,
          rapport_rang6: toNumber(t.rapport_du_rang6),
          gagnant_rang7: t.nombre_de_gagnant_au_rang7 || 0,
          rapport_rang7: toNumber(t.rapport_du_rang7),
          gagnant_rang8: t.nombre_de_gagnant_au_rang8 || 0,
          rapport_rang8: toNumber(t.rapport_du_rang8),
          gagnant_rang9: t.nombre_de_gagnant_au_rang9 || 0,
          rapport_rang9: toNumber(t.rapport_du_rang9),
        }))
        .filter((t: Tirage) => t.date <= new Date().toISOString().split('T')[0])
        .sort((a: Tirage, b: Tirage) => new Date(b.date).getTime() - new Date(a.date).getTime());
        console.log(`📊 ${this.tirages.length} tirages chargés depuis l'historique (fallback)`);
      } else {
        this.tirages = [];
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
    const todayIso = new Date().toISOString().split('T')[0];
    return [...this.tirages]
      .filter(t => t.date <= todayIso)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getTiragesForPeriod(period?: string): Tirage[] {
    const all = this.getAllTirages();
    if (!period) return all;
    const latest = all[0]?.date ? new Date(all[0].date) : new Date();
    const byDays = (d: number) => {
      const start = new Date(latest);
      start.setDate(start.getDate() - d);
      const startStr = start.toISOString().split('T')[0];
      return all.filter(t => t.date >= startStr);
    };
    switch (period) {
      case 'last1':
        return all.slice(0, 1);
      case 'last20':
        return all.slice(0, 20);
      case 'last50':
        return all.slice(0, 50);
      case 'week':
        return byDays(7);
      case 'month':
        return byDays(30);
      case 'quarter':
        return byDays(90);
      case 'semester':
        return byDays(182);
      case 'year':
        return byDays(365);
      case '10y':
        return byDays(3650);
      case '20y':
        return byDays(7300);
      case 'all':
      default:
        return all;
    }
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
  getStatistiquesNumeros(period?: string) {
    const source = this.getTiragesForPeriod(period);
    const numerosFrequence = new Map<number, { count: number; lastDate: string }>();

    // Compter les occurrences de chaque numéro
    source.forEach(tirage => {
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
    const latestDate = source[0]?.date || new Date().toISOString().split('T')[0];
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
        const boules = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5];
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
