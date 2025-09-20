import { UnifiedCombination } from './combination-hub';

/**
 * Interface pour la persistance des combinaisons
 */
export interface StoredCombination extends UnifiedCombination {
  version: string;
  lastModified: Date;
  tags: string[];
  isFavorite: boolean;
  notes?: string;
}

/**
 * Interface pour les métadonnées de stockage
 */
export interface StorageMetadata {
  version: string;
  lastBackup: Date;
  totalCombinations: number;
  totalTests: number;
  lastCleanup: Date;
}

/**
 * Gestionnaire de stockage centralisé pour toutes les combinaisons
 */
export class CombinationStorage {
  private storageKey = 'kdo-loto-combinations';
  private metadataKey = 'kdo-loto-metadata';
  private maxStorageSize = 10000; // Maximum 10k combinaisons
  private cleanupThreshold = 0.8; // Nettoyer à 80% de capacité

  /**
   * Sauvegarde une combinaison
   */
  saveCombination(combination: UnifiedCombination, tags: string[] = [], notes?: string): void {
    try {
      const stored: StoredCombination = {
        ...combination,
        version: '1.0',
        lastModified: new Date(),
        tags,
        isFavorite: false,
        notes
      };

      const existing = this.loadAllCombinations();
      
      // Vérifier si la combinaison existe déjà
      const existingIndex = existing.findIndex(c => c.id === combination.id);
      if (existingIndex >= 0) {
        existing[existingIndex] = stored;
      } else {
        existing.push(stored);
      }

      // Nettoyer si nécessaire
      if (existing.length > this.maxStorageSize * this.cleanupThreshold) {
        this.cleanupOldCombinations(existing);
      }

      this.saveToStorage(existing);
      this.updateMetadata(existing);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la combinaison:', error);
    }
  }

  /**
   * Sauvegarde plusieurs combinaisons
   */
  saveCombinations(combinations: UnifiedCombination[], tags: string[] = []): void {
    combinations.forEach(combo => {
      this.saveCombination(combo, tags);
    });
  }

  /**
   * Charge toutes les combinaisons
   */
  loadAllCombinations(): StoredCombination[] {
    try {
      // Vérifier si localStorage est disponible (côté client)
      if (typeof window === 'undefined' || !window.localStorage) {
        return [];
      }
      
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        lastModified: new Date(item.lastModified),
        testResults: item.testResults ? {
          ...item.testResults,
          lastTested: new Date(item.testResults.lastTested)
        } : undefined
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des combinaisons:', error);
      return [];
    }
  }

  /**
   * Charge une combinaison par ID
   */
  loadCombination(id: string): StoredCombination | undefined {
    const all = this.loadAllCombinations();
    return all.find(c => c.id === id);
  }

  /**
   * Charge les combinaisons par catégorie
   */
  loadCombinationsByCategory(category: string): StoredCombination[] {
    const all = this.loadAllCombinations();
    return all.filter(c => c.category === category);
  }

  /**
   * Charge les combinaisons testées
   */
  loadTestedCombinations(): StoredCombination[] {
    const all = this.loadAllCombinations();
    return all.filter(c => c.testResults);
  }

  /**
   * Charge les combinaisons favorites
   */
  loadFavoriteCombinations(): StoredCombination[] {
    const all = this.loadAllCombinations();
    return all.filter(c => c.isFavorite);
  }

  /**
   * Charge les combinaisons par tags
   */
  loadCombinationsByTags(tags: string[]): StoredCombination[] {
    const all = this.loadAllCombinations();
    return all.filter(c => tags.some(tag => c.tags.includes(tag)));
  }

  /**
   * Marque une combinaison comme favorite
   */
  toggleFavorite(id: string): boolean {
    const all = this.loadAllCombinations();
    const index = all.findIndex(c => c.id === id);
    
    if (index >= 0) {
      all[index].isFavorite = !all[index].isFavorite;
      all[index].lastModified = new Date();
      this.saveToStorage(all);
      return all[index].isFavorite;
    }
    
    return false;
  }

  /**
   * Ajoute des tags à une combinaison
   */
  addTags(id: string, tags: string[]): void {
    const all = this.loadAllCombinations();
    const index = all.findIndex(c => c.id === id);
    
    if (index >= 0) {
      const existingTags = all[index].tags;
      const newTags = Array.from(new Set([...existingTags, ...tags]));
      all[index].tags = newTags;
      all[index].lastModified = new Date();
      this.saveToStorage(all);
    }
  }

  /**
   * Supprime des tags d'une combinaison
   */
  removeTags(id: string, tags: string[]): void {
    const all = this.loadAllCombinations();
    const index = all.findIndex(c => c.id === id);
    
    if (index >= 0) {
      all[index].tags = all[index].tags.filter(tag => !tags.includes(tag));
      all[index].lastModified = new Date();
      this.saveToStorage(all);
    }
  }

  /**
   * Met à jour les notes d'une combinaison
   */
  updateNotes(id: string, notes: string): void {
    const all = this.loadAllCombinations();
    const index = all.findIndex(c => c.id === id);
    
    if (index >= 0) {
      all[index].notes = notes;
      all[index].lastModified = new Date();
      this.saveToStorage(all);
    }
  }

  /**
   * Supprime une combinaison
   */
  deleteCombination(id: string): boolean {
    const all = this.loadAllCombinations();
    const index = all.findIndex(c => c.id === id);
    
    if (index >= 0) {
      all.splice(index, 1);
      this.saveToStorage(all);
      this.updateMetadata(all);
      return true;
    }
    
    return false;
  }

  /**
   * Supprime toutes les combinaisons
   */
  deleteAllCombinations(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.metadataKey);
    }
  }

  /**
   * Exporte toutes les combinaisons
   */
  exportCombinations(): string {
    const all = this.loadAllCombinations();
    const metadata = this.loadMetadata();
    
    const exportData = {
      metadata,
      combinations: all,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Importe des combinaisons
   */
  importCombinations(jsonData: string): { success: boolean; imported: number; errors: string[] } {
    try {
      const data = JSON.parse(jsonData);
      const errors: string[] = [];
      let imported = 0;
      
      if (!data.combinations || !Array.isArray(data.combinations)) {
        return { success: false, imported: 0, errors: ['Format de données invalide'] };
      }
      
      const existing = this.loadAllCombinations();
      const existingIds = new Set(existing.map(c => c.id));
      
      data.combinations.forEach((combo: any, index: number) => {
        try {
          // Générer un nouvel ID si collision
          let newId = combo.id;
          if (existingIds.has(newId)) {
            newId = `${combo.id}-imported-${Date.now()}-${index}`;
          }
          
          const importedCombo: StoredCombination = {
            ...combo,
            id: newId,
            createdAt: new Date(combo.createdAt),
            lastModified: new Date(),
            version: '1.0',
            tags: combo.tags || [],
            isFavorite: combo.isFavorite || false,
            testResults: combo.testResults ? {
              ...combo.testResults,
              lastTested: new Date(combo.testResults.lastTested)
            } : undefined
          };
          
          existing.push(importedCombo);
          existingIds.add(newId);
          imported++;
        } catch (error) {
          errors.push(`Erreur ligne ${index + 1}: ${error}`);
        }
      });
      
      this.saveToStorage(existing);
      this.updateMetadata(existing);
      
      return { success: true, imported, errors };
    } catch (error) {
      return { success: false, imported: 0, errors: [`Erreur de parsing: ${error}`] };
    }
  }

  /**
   * Sauvegarde dans le localStorage
   */
  private saveToStorage(combinations: StoredCombination[]): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.storageKey, JSON.stringify(combinations));
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      // Si le localStorage est plein, nettoyer les anciennes combinaisons
      if (typeof window !== 'undefined' && window.localStorage) {
        this.cleanupOldCombinations(combinations);
        localStorage.setItem(this.storageKey, JSON.stringify(combinations));
      }
    }
  }

  /**
   * Nettoie les anciennes combinaisons
   */
  private cleanupOldCombinations(combinations: StoredCombination[]): void {
    // Garder les favorites et les récentes
    const sorted = combinations.sort((a, b) => {
      // Favorites en premier
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      
      // Puis par date de modification
      return b.lastModified.getTime() - a.lastModified.getTime();
    });
    
    // Garder seulement les plus récentes
    const toKeep = Math.floor(this.maxStorageSize * 0.7);
    combinations.splice(0, combinations.length, ...sorted.slice(0, toKeep));
  }

  /**
   * Charge les métadonnées
   */
  private loadMetadata(): StorageMetadata {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return {
          version: '1.0',
          lastBackup: new Date(),
          totalCombinations: 0,
          totalTests: 0,
          lastCleanup: new Date()
        };
      }
      
      const stored = localStorage.getItem(this.metadataKey);
      if (!stored) {
        return {
          version: '1.0',
          lastBackup: new Date(),
          totalCombinations: 0,
          totalTests: 0,
          lastCleanup: new Date()
        };
      }
      
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        lastBackup: new Date(parsed.lastBackup),
        lastCleanup: new Date(parsed.lastCleanup)
      };
    } catch (error) {
      console.error('Erreur lors du chargement des métadonnées:', error);
      return {
        version: '1.0',
        lastBackup: new Date(),
        totalCombinations: 0,
        totalTests: 0,
        lastCleanup: new Date()
      };
    }
  }

  /**
   * Met à jour les métadonnées
   */
  private updateMetadata(combinations: StoredCombination[]): void {
    const metadata: StorageMetadata = {
      version: '1.0',
      lastBackup: new Date(),
      totalCombinations: combinations.length,
      totalTests: combinations.filter(c => c.testResults).length,
      lastCleanup: new Date()
    };
    
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.metadataKey, JSON.stringify(metadata));
    }
  }

  /**
   * Obtient les statistiques de stockage
   */
  getStorageStats(): {
    totalCombinations: number;
    testedCombinations: number;
    favoriteCombinations: number;
    categories: Record<string, number>;
    tags: Record<string, number>;
    storageSize: number;
    lastBackup: Date;
  } {
    const all = this.loadAllCombinations();
    const metadata = this.loadMetadata();
    
    const categories: Record<string, number> = {};
    const tags: Record<string, number> = {};
    
    all.forEach(combo => {
      categories[combo.category] = (categories[combo.category] || 0) + 1;
      combo.tags.forEach(tag => {
        tags[tag] = (tags[tag] || 0) + 1;
      });
    });
    
    return {
      totalCombinations: all.length,
      testedCombinations: all.filter(c => c.testResults).length,
      favoriteCombinations: all.filter(c => c.isFavorite).length,
      categories,
      tags,
      storageSize: JSON.stringify(all).length,
      lastBackup: metadata.lastBackup
    };
  }
}

// Instance singleton
export const combinationStorage = new CombinationStorage();

