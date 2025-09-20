/**
 * GESTIONNAIRE DE NIVEAUX DE COMPLEXITÉ
 * Gère les modes Débutant, Intermédiaire et Expert
 */

export type ComplexityLevel = 'beginner' | 'intermediate' | 'expert';

export interface ComplexityConfig {
  level: ComplexityLevel;
  label: string;
  description: string;
  icon: string;
  color: string;
  features: {
    // Fonctionnalités d'analyse
    intelligentAnalysis: boolean;
    manualSelection: boolean;
    advancedStatistics: boolean;
    patternAnalysis: boolean;
    retroactiveAnalysis: boolean;
    
    // Fonctionnalités de génération
    simpleGrids: boolean;
    multipleGrids: boolean;
    guaranteeOptimizer: boolean;
    setBounds: boolean;
    secondTirage: boolean;
    
    // Fonctionnalités de gestion
    savedGrids: boolean;
    autoSync: boolean;
    combinationTester: boolean;
    financialAnalysis: boolean;
    
    // Interface
    showTechnicalDetails: boolean;
    showAdvancedControls: boolean;
    showMathFormulas: boolean;
    showPerformanceMetrics: boolean;
  };
}

export class ComplexityManager {
  private readonly STORAGE_KEY = 'user_complexity_level';
  private readonly configs: Record<ComplexityLevel, ComplexityConfig> = {
    
    beginner: {
      level: 'beginner',
      label: '🟢 Débutant',
      description: 'Interface simple, fonctions essentielles',
      icon: '🌱',
      color: 'green',
      features: {
        // Analyse basique
        intelligentAnalysis: true,
        manualSelection: false,
        advancedStatistics: false,
        patternAnalysis: false,
        retroactiveAnalysis: false,
        
        // Génération simple
        simpleGrids: true,
        multipleGrids: false,
        guaranteeOptimizer: false,
        setBounds: false,
        secondTirage: true,
        
        // Gestion basique
        savedGrids: true,
        autoSync: true,
        combinationTester: false,
        financialAnalysis: false,
        
        // Interface épurée
        showTechnicalDetails: false,
        showAdvancedControls: false,
        showMathFormulas: false,
        showPerformanceMetrics: false
      }
    },
    
    intermediate: {
      level: 'intermediate',
      label: '🟡 Intermédiaire',
      description: 'Plus d\'options, analyses moyennes',
      icon: '⚖️',
      color: 'yellow',
      features: {
        // Analyse intermédiaire
        intelligentAnalysis: true,
        manualSelection: true,
        advancedStatistics: true,
        patternAnalysis: true,
        retroactiveAnalysis: false,
        
        // Génération avancée
        simpleGrids: true,
        multipleGrids: true,
        guaranteeOptimizer: true,
        setBounds: false,
        secondTirage: true,
        
        // Gestion complète
        savedGrids: true,
        autoSync: true,
        combinationTester: true,
        financialAnalysis: true,
        
        // Interface équilibrée
        showTechnicalDetails: true,
        showAdvancedControls: true,
        showMathFormulas: false,
        showPerformanceMetrics: true
      }
    },
    
    expert: {
      level: 'expert',
      label: '🔴 Expert',
      description: 'Toutes les fonctionnalités avancées',
      icon: '🎯',
      color: 'red',
      features: {
        // Analyse complète
        intelligentAnalysis: true,
        manualSelection: true,
        advancedStatistics: true,
        patternAnalysis: true,
        retroactiveAnalysis: true,
        
        // Génération experte
        simpleGrids: true,
        multipleGrids: true,
        guaranteeOptimizer: true,
        setBounds: true,
        secondTirage: true,
        
        // Gestion experte
        savedGrids: true,
        autoSync: true,
        combinationTester: true,
        financialAnalysis: true,
        
        // Interface complète
        showTechnicalDetails: true,
        showAdvancedControls: true,
        showMathFormulas: true,
        showPerformanceMetrics: true
      }
    }
  };
  
  /**
   * Récupère le niveau de complexité actuel
   */
  getCurrentLevel(): ComplexityLevel {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved && this.isValidLevel(saved)) {
        return saved as ComplexityLevel;
      }
    } catch (error) {
      console.warn('Erreur lecture niveau complexité:', error);
    }
    
    return 'beginner'; // Par défaut
  }
  
  /**
   * Définit le niveau de complexité
   */
  setLevel(level: ComplexityLevel): void {
    if (!this.isValidLevel(level)) {
      throw new Error(`Niveau invalide: ${level}`);
    }
    
    try {
      localStorage.setItem(this.STORAGE_KEY, level);
      console.log(`🎯 Niveau de complexité défini: ${level}`);
    } catch (error) {
      console.error('Erreur sauvegarde niveau:', error);
    }
  }
  
  /**
   * Récupère la configuration du niveau actuel
   */
  getCurrentConfig(): ComplexityConfig {
    const level = this.getCurrentLevel();
    return this.configs[level];
  }
  
  /**
   * Récupère la configuration d'un niveau spécifique
   */
  getConfig(level: ComplexityLevel): ComplexityConfig {
    return this.configs[level];
  }
  
  /**
   * Récupère toutes les configurations disponibles
   */
  getAllConfigs(): ComplexityConfig[] {
    return Object.values(this.configs);
  }
  
  /**
   * Vérifie si une fonctionnalité est disponible au niveau actuel
   */
  isFeatureEnabled(feature: keyof ComplexityConfig['features']): boolean {
    const config = this.getCurrentConfig();
    return config.features[feature];
  }
  
  /**
   * Vérifie si un niveau est valide
   */
  private isValidLevel(level: string): boolean {
    return ['beginner', 'intermediate', 'expert'].includes(level);
  }
  
  /**
   * Recommande un niveau basé sur l'expérience utilisateur
   */
  recommendLevel(): {
    recommended: ComplexityLevel;
    reason: string;
  } {
    try {
      // Analyser l'usage de l'utilisateur
      const hasUsedAdvanced = localStorage.getItem('has_used_advanced_features');
      const sessionCount = localStorage.getItem('session_count');
      const hasGeneratedGrids = localStorage.getItem('selectedNumbers');
      
      if (hasUsedAdvanced && sessionCount && parseInt(sessionCount) > 10) {
        return {
          recommended: 'expert',
          reason: 'Vous utilisez déjà des fonctionnalités avancées'
        };
      }
      
      if (hasGeneratedGrids && sessionCount && parseInt(sessionCount) > 3) {
        return {
          recommended: 'intermediate',
          reason: 'Vous avez de l\'expérience avec l\'application'
        };
      }
      
      return {
        recommended: 'beginner',
        reason: 'Première utilisation ou peu d\'expérience'
      };
      
    } catch (error) {
      return {
        recommended: 'beginner',
        reason: 'Mode par défaut recommandé'
      };
    }
  }
}

// Instance singleton
export const complexityManager = new ComplexityManager();
