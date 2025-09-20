'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Clock, Calculator, Shield, Zap, BarChart3, Target
} from 'lucide-react';

// Import des nouveaux composants
import StrategySelector from './StrategySelector';
import CombinationCounter from './CombinationCounter';
import BaseConfiguration from './BaseConfiguration';
import CombinationDisplay from './CombinationDisplay';
import HistoricalPatternsSelector from './HistoricalPatternsSelector';
import StrategyCoherencePanel from './StrategyCoherencePanel';
import EcartsStrategieSelector from './EcartsStrategieSelector';

// Interfaces
interface ThreeWindowInterfaceProps {
  globalAnalysisPeriod?: 'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100';
  mode?: 'strategy-generator' | 'game-generation';
  onCombinationsChange?: (combinations: number) => void;
}

interface GenerationConfig {
  // Configuration de base
  combinationCount: number;
  gridType: 'simple' | 'multiple';
  multipleGridSize: number;
  
  // Stratégies de génération
  includeHotNumbers: boolean;
  includeColdNumbers: boolean;
  includeHotColdHybrid: boolean;
  includeEcartsRetard: boolean;
  ecartsNiveauUrgence: ('critique' | 'eleve' | 'moyen' | 'faible' | 'melange-optimal')[];
  ecartsSeuilCritique: number;
  ecartsSeuilEleve: number;
  ecartsSeuilMoyen: number;
  ecartsSeuilFaible: number;
  ecartsConsidererHistorique: boolean;
  ecartsNombreNumerosMax: number;
  includePatterns: boolean;
  includeTemporalPatterns: boolean;
  includeMathematical: boolean;
  includeRules: boolean;
  includeAdvanced: boolean;
  
  // Configuration des périodes pour hot/cold
  hotColdPeriod: 'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100';
  
  // Patterns sélectionnés
  selectedParityPatterns: string[];
  selectedConsecutivePatterns: string[];
  selectedDizainePatterns: string[];
  selectedSommePatterns: string[];
  selectedZonePatterns: string[];
  selectedUnitesPatterns: string[];
  selectedTemporalPatterns: string[];
  selectedSeasonalPatterns: string[];
  selectedCyclicalPatterns: string[];
  selectedRecentPatterns: string[];
  
  // Contraintes spécifiques
  minSum: number;
  maxSum: number;
  minDizaines: number;
  maxDizaines: number;
  consecutiveMode: 'none' | 'optional' | 'required' | 'disabled';
  maxConsecutive: number;
}

interface Combination {
  numbers: number[];
  complementaryNumber: number;
  score?: number;
  confidence?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  strategy?: string;
  details?: any;
}

export default function ThreeWindowInterface({ globalAnalysisPeriod = 'last20', mode = 'game-generation', onCombinationsChange }: ThreeWindowInterfaceProps) {
  // État principal
  const [config, setConfig] = useState<GenerationConfig>({
    combinationCount: 10,
    gridType: 'simple',
    multipleGridSize: 7,
    includeHotNumbers: false,
    includeColdNumbers: false,
    includeHotColdHybrid: false,
    includeEcartsRetard: false,
    ecartsNiveauUrgence: ['critique', 'eleve', 'moyen', 'melange-optimal'],
    ecartsSeuilCritique: 12,
    ecartsSeuilEleve: 8,
    ecartsSeuilMoyen: 4,
    ecartsSeuilFaible: 2,
    ecartsConsidererHistorique: true,
    ecartsNombreNumerosMax: 18,
    includePatterns: false,
    includeTemporalPatterns: false,
    includeMathematical: false,
    includeRules: false,
    includeAdvanced: false,
    hotColdPeriod: globalAnalysisPeriod,
    selectedParityPatterns: [],
    selectedConsecutivePatterns: [],
    selectedDizainePatterns: [],
    selectedSommePatterns: [],
    selectedZonePatterns: [],
    selectedUnitesPatterns: [],
    selectedTemporalPatterns: [],
    selectedSeasonalPatterns: [],
    selectedCyclicalPatterns: [],
    selectedRecentPatterns: [],
    minSum: 100,
    maxSum: 150,
    minDizaines: 3,
    maxDizaines: 4,
    consecutiveMode: 'none',
    maxConsecutive: 1
  });

  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [remainingCombinations, setRemainingCombinations] = useState(1906884);
  const [hotNumbers, setHotNumbers] = useState<number[]>([]);
  const [coldNumbers, setColdNumbers] = useState<number[]>([]);
  const [isLoadingHotCold, setIsLoadingHotCold] = useState(false);
  const [hotColdPeriodInfo, setHotColdPeriodInfo] = useState<string>('');
  const [isPatternsModalOpen, setIsPatternsModalOpen] = useState(false);
  const [isEcartsModalOpen, setIsEcartsModalOpen] = useState(false);
  const [previewNumbers, setPreviewNumbers] = useState<{
    selected: number[];
    complementary: number[];
    sources: string[];
  }>({ selected: [], complementary: [], sources: [] });

  // Charger les numéros chauds et froids
  useEffect(() => {
    const loadHotColdNumbers = async () => {
      setIsLoadingHotCold(true);
      try {
        const response = await fetch(`/api/analysis?type=frequency&period=${config.hotColdPeriod}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setHotNumbers(data.data.hotNumbers || []);
          setColdNumbers(data.data.coldNumbers || []);
          
          // Mettre à jour les informations de période
          const periodLabels = {
            'last20': '20 derniers tirages',
            'last50': '50 derniers tirages', 
            'last100': '100 derniers tirages',
            'week': 'Cette semaine',
            'month': 'Ce mois',
            'year': 'Cette année',
            'all': 'Depuis le début'
          };
          
          setHotColdPeriodInfo(`${periodLabels[config.hotColdPeriod]} (${data.data.totalTirages || 0} tirages analysés)`);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des numéros chauds/froids:', error);
        setHotColdPeriodInfo('Erreur de chargement');
      } finally {
        setIsLoadingHotCold(false);
      }
    };

    loadHotColdNumbers();
  }, [config.hotColdPeriod]);

  // Synchroniser avec la période globale
  useEffect(() => {
    if (globalAnalysisPeriod !== config.hotColdPeriod) {
      setConfig(prev => ({
        ...prev,
        hotColdPeriod: globalAnalysisPeriod
      }));
    }
  }, [globalAnalysisPeriod]);

  // Calculer les combinaisons restantes de manière réaliste
  useEffect(() => {
    const calculateRealisticCombinations = (): number => {
      const TOTAL_COMBINATIONS = 1906884; // C(49,5) × 10 = 1,906,884 combinaisons possibles
      
      // Si aucune stratégie n'est activée, toutes les combinaisons sont possibles
      const activeStrategies = [
        config.includeHotNumbers,
        config.includeColdNumbers,
        config.includeHotColdHybrid,
        config.includeEcartsRetard,
        config.includePatterns,
        config.includeTemporalPatterns,
        config.includeMathematical,
        config.includeRules,
        config.includeAdvanced
      ].filter(Boolean).length;

      if (activeStrategies === 0) {
        return TOTAL_COMBINATIONS;
      }

      // Calcul basé sur les contraintes réelles et logiques
      let combinations = TOTAL_COMBINATIONS;

      // Stratégies de fréquence (calcul exact)
      if (config.includeHotNumbers && config.includeColdNumbers) {
        // Si les deux sont activés, on prend l'union : C(20,5) + C(20,5) = 2 × 155,040 = 310,080
        combinations = 310080;
      } else if (config.includeHotNumbers) {
        // Exactement C(20,5) × 10 = 155,040 combinaisons
        combinations = 155040;
      } else if (config.includeColdNumbers) {
        // Exactement C(20,5) × 10 = 155,040 combinaisons
        combinations = 155040;
      } else if (config.includeEcartsRetard) {
        // Numéros en retard (environ 15-20 numéros selon la période)
        // C(18,5) × 10 ≈ 85,680 combinaisons
        combinations = 85680;
      }

      // Hot-Cold Hybride (mélange intelligent)
      if (config.includeHotColdHybrid) {
        // C(10,5) × C(10,0) + C(10,4) × C(10,1) + C(10,3) × C(10,2) + C(10,2) × C(10,3) + C(10,1) × C(10,4) + C(10,0) × C(10,5)
        // = 252 + 2100 + 5400 + 5400 + 2100 + 252 = 15,504 combinaisons × 10 = 155,040
        // Mais c'est plus flexible, donc on prend une approximation
        combinations = Math.min(combinations, 155040);
      }

      // Patterns (très restrictifs)
      if (config.includePatterns) {
        const selectedPatternsCount = [
          ...config.selectedParityPatterns,
          ...config.selectedConsecutivePatterns,
          ...config.selectedDizainePatterns,
          ...config.selectedSommePatterns,
          ...config.selectedZonePatterns,
          ...config.selectedUnitesPatterns
        ].length;

        if (selectedPatternsCount > 0) {
          // Chaque pattern supplémentaire réduit drastiquement les possibilités
          // Estimation basée sur la probabilité de chaque pattern
          const patternReduction = Math.pow(0.1, selectedPatternsCount);
          combinations = Math.floor(combinations * patternReduction);
        }
      }

      // Patterns temporels (modérément restrictifs)
      if (config.includeTemporalPatterns) {
        combinations = Math.floor(combinations * 0.2);
      }

      // Mathématiques (très restrictifs)
      if (config.includeMathematical) {
        combinations = Math.floor(combinations * 0.05);
      }

      // Avancées (modérément restrictives)
      if (config.includeAdvanced) {
        combinations = Math.floor(combinations * 0.3);
      }

      // S'assurer qu'on ne descend pas en dessous d'un minimum raisonnable
      combinations = Math.max(combinations, 1);

      return combinations;
    };

    const newCombinations = calculateRealisticCombinations();
    setRemainingCombinations(newCombinations);
    onCombinationsChange?.(newCombinations);
  }, [config, onCombinationsChange]);

  // Mettre à jour la prévisualisation quand la config change
  useEffect(() => {
    updatePreviewNumbers();
  }, [config, hotNumbers, coldNumbers]);

  // Fonctions de gestion des modales (définies avant strategiesByCategory)
  const openEcartsModal = () => {
    setIsEcartsModalOpen(true);
  };

  const closeEcartsModal = () => {
    setIsEcartsModalOpen(false);
  };

  // Calculer les numéros sélectionnés en temps réel
  const updatePreviewNumbers = () => {
    const selected: number[] = [];
    const complementary: number[] = [];
    const sources: string[] = [];

    // Numéros chauds
    if (config.includeHotNumbers && hotNumbers.length > 0) {
      selected.push(...hotNumbers.slice(0, 10));
      sources.push('Numéros Chauds');
    }

    // Numéros froids
    if (config.includeColdNumbers && coldNumbers.length > 0) {
      selected.push(...coldNumbers.slice(0, 10));
      sources.push('Numéros Froids');
    }

    // Hot-Cold Hybride
    if (config.includeHotColdHybrid && hotNumbers.length > 0 && coldNumbers.length > 0) {
      selected.push(...hotNumbers.slice(0, 5), ...coldNumbers.slice(0, 5));
      sources.push('Hot-Cold Hybride');
    }

    // Écarts de sortie (simulation - à connecter avec vraies données)
    if (config.includeEcartsRetard) {
      const ecartsNumbers = [35, 11, 46, 16, 3, 13, 37, 48, 43, 19]; // Simulation
      selected.push(...ecartsNumbers.slice(0, 8));
      sources.push('Écarts de Sortie');
    }

    // Patterns (simulation)
    if (config.includePatterns) {
      const patternNumbers = [7, 14, 21, 28, 35, 42]; // Simulation
      selected.push(...patternNumbers);
      sources.push('Patterns Historiques');
    }

    // Supprimer les doublons et limiter
    const uniqueSelected = Array.from(new Set(selected)).slice(0, 15);
    
    // Complémentaires par défaut (à améliorer)
    const defaultComplementary = [1, 5, 8];

    setPreviewNumbers({
      selected: uniqueSelected,
      complementary: defaultComplementary,
      sources: Array.from(new Set(sources))
    });
  };

  // Sauvegarder la sélection pour le générateur
  const saveSelectionForGenerator = () => {
    const selectionData = {
      numbers: previewNumbers.selected,
      complementary: previewNumbers.complementary,
      source: `Configuration Stratégies (${previewNumbers.sources.join(', ')})`,
      timestamp: new Date().toISOString(),
      period: config.hotColdPeriod,
      strategies: previewNumbers.sources
    };
    
    localStorage.setItem('strategyNumbers', JSON.stringify(selectionData));
    
    // Notification visuelle
    alert(`✅ ${previewNumbers.selected.length} numéros + ${previewNumbers.complementary.length} complémentaires sauvegardés pour le générateur !`);
  };

  // Stratégies par catégorie
  const strategiesByCategory = {
    'Fréquence': [
      {
        id: 'includeHotNumbers',
        name: 'Numéros Chauds',
        description: 'Basé sur la fréquence d\'apparition des 20 derniers tirages',
        icon: TrendingUp,
        color: 'red',
        enabled: config.includeHotNumbers,
        frequency: '1 fois sur 3',
        details: 'Sélectionne les numéros les plus fréquemment tirés'
      },
      {
        id: 'includeColdNumbers',
        name: 'Numéros Froids',
        description: 'Basé sur la rareté d\'apparition des 20 derniers tirages',
        icon: TrendingUp,
        color: 'blue',
        enabled: config.includeColdNumbers,
        frequency: '1 fois sur 4',
        details: 'Sélectionne les numéros les moins fréquemment tirés'
      },
      {
        id: 'includeHotColdHybrid',
        name: 'Hot-Cold Hybride',
        description: 'Combinaison optimale entre numéros chauds et froids',
        icon: TrendingUp,
        color: 'purple',
        enabled: config.includeHotColdHybrid,
        frequency: '1 fois sur 5',
        details: 'Mélange intelligent de numéros chauds et froids'
      },
      {
        id: 'includeEcartsRetard',
        name: 'Écarts de Sortie',
        description: 'Basé sur les intervalles entre les sorties des numéros',
        icon: Clock,
        color: 'orange',
        enabled: config.includeEcartsRetard,
        frequency: '1 fois sur 4',
        details: 'Privilégie les numéros en retard selon leur historique habituel',
        hasConfig: true,
        configAction: openEcartsModal,
        configSummary: `${config.ecartsNiveauUrgence.length}/5 niveaux • Max ${config.ecartsNombreNumerosMax} numéros`
      }
    ],
    'Patterns': [
      {
        id: 'includePatterns',
        name: 'Patterns Historiques',
        description: 'Basé sur l\'analyse des patterns de parité, consécutifs, dizaines, etc.',
        icon: BarChart3,
        color: 'green',
        enabled: config.includePatterns,
        frequency: '1 fois sur 2',
        details: 'Analyse des patterns de parité, consécutifs, dizaines, unités, somme et zones'
      },
      {
        id: 'includeTemporalPatterns',
        name: 'Patterns Temporels',
        description: 'Basé sur les tendances temporelles (jours, mois, saisons)',
        icon: Clock,
        color: 'indigo',
        enabled: config.includeTemporalPatterns,
        frequency: '1 fois sur 3',
        details: 'Analyse des patterns selon les jours de la semaine, mois, saisons et cycles'
      }
    ],
    'Mathématiques': [
      {
        id: 'includeMathematical',
        name: 'Stratégies Mathématiques',
        description: 'Nombres premiers, Fibonacci, progressions arithmétiques',
        icon: Calculator,
        color: 'yellow',
        enabled: config.includeMathematical,
        frequency: '1 fois sur 6',
        details: 'Analyse des nombres premiers, suites de Fibonacci, progressions arithmétiques et carrés parfaits'
      }
    ],
    'Réglementaires': [
      {
        id: 'includeRules',
        name: 'Contraintes Réglementaires',
        description: 'Respect des règles FDJ et contraintes de validité',
        icon: Shield,
        color: 'gray',
        enabled: config.includeRules,
        frequency: 'Toujours',
        details: 'Respect des règles FDJ : 5 numéros de 1 à 49, 1 complémentaire de 1 à 10'
      }
    ],
    'Avancées': [
      {
        id: 'includeAdvanced',
        name: 'Stratégies Avancées',
        description: 'Algorithmes d\'optimisation avancés et intelligence artificielle',
        icon: Zap,
        color: 'pink',
        enabled: config.includeAdvanced,
        frequency: '1 fois sur 8',
        details: 'Algorithmes d\'optimisation avancés, analyse de corrélations et prédictions IA'
      }
    ]
  };

  // Gestionnaires d'événements
  const handleStrategyToggle = (strategyId: string) => {
    const configKey = strategyId as keyof GenerationConfig;
    setConfig(prev => ({
      ...prev,
      [configKey]: !prev[configKey]
    }));
  };

  const handleCombinationCountChange = (count: number) => {
    setConfig(prev => ({ ...prev, combinationCount: count }));
  };

  const handleGridTypeChange = (type: 'simple' | 'multiple') => {
    setConfig(prev => ({ ...prev, gridType: type }));
  };

  const handleMultipleGridSizeChange = (size: number) => {
    setConfig(prev => ({ ...prev, multipleGridSize: size }));
  };

  const handleHotColdPeriodChange = (period: 'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100') => {
    setConfig(prev => ({ ...prev, hotColdPeriod: period }));
  };

  // Gestionnaires pour les patterns historiques
  const handlePatternToggle = (patternId: string) => {
    setConfig(prev => {
      // Extraire la catégorie de l'ID (ex: "Parité_3P-2I" -> "Parité")
      const category = patternId.split('_')[0];
      
      // Mapper les noms de catégories aux clés de configuration
      const categoryMapping: Record<string, keyof GenerationConfig> = {
        'Parité': 'selectedParityPatterns',
        'Consécutifs': 'selectedConsecutivePatterns',
        'Dizaines': 'selectedDizainePatterns',
        'Somme': 'selectedSommePatterns',
        'Zone': 'selectedZonePatterns',
        'Unités': 'selectedUnitesPatterns'
      };
      
      const categoryKey = categoryMapping[category];
      if (!categoryKey) {
        console.error('Catégorie non reconnue:', category);
        return prev;
      }
      
      const currentPatterns = (prev[categoryKey] as string[]) || [];
      
      if (currentPatterns.includes(patternId)) {
        // Décocher le pattern
        return {
          ...prev,
          [categoryKey]: currentPatterns.filter(id => id !== patternId)
        };
      } else {
        // Cocher le pattern - vérifier les conflits
        const conflicts = getPatternConflicts(patternId, currentPatterns);
        
        if (conflicts.length > 0) {
          // Supprimer les patterns en conflit et ajouter le nouveau
          const filteredPatterns = currentPatterns.filter(id => !conflicts.includes(id));
          return {
            ...prev,
            [categoryKey]: [...filteredPatterns, patternId]
          };
        } else {
          // Aucun conflit, ajouter simplement
          return {
            ...prev,
            [categoryKey]: [...currentPatterns, patternId]
          };
        }
      }
    });
  };

  // Fonction pour détecter les conflits entre patterns
  const getPatternConflicts = (newPatternId: string, currentPatterns: string[]): string[] => {
    const conflicts: string[] = [];
    
    // Extraire la catégorie du nouveau pattern
    const newCategory = newPatternId.split('_')[0];
    
    // Conflits UNIQUEMENT au sein de la même catégorie
    if (newCategory === 'Consécutifs') {
      if (newPatternId.includes('CONSECUTIF') && !newPatternId.includes('NON-CONSECUTIF')) {
        // Si on coche "CONSECUTIF", décocher "NON-CONSECUTIF" (même catégorie)
        conflicts.push(...currentPatterns.filter(id => 
          id.startsWith('Consécutifs_') && id.includes('NON-CONSECUTIF')
        ));
      } else if (newPatternId.includes('NON-CONSECUTIF')) {
        // Si on coche "NON-CONSECUTIF", décocher "CONSECUTIF" (même catégorie)
        conflicts.push(...currentPatterns.filter(id => 
          id.startsWith('Consécutifs_') && id.includes('CONSECUTIF') && !id.includes('NON-CONSECUTIF')
        ));
      }
    }
    
    // Conflits pour les patterns de parité (même catégorie uniquement)
    if (newCategory === 'Parité') {
      conflicts.push(...currentPatterns.filter(id => 
        id.startsWith('Parité_') && id !== newPatternId
      ));
    }
    
    // Conflits pour les patterns de somme (même catégorie uniquement)
    if (newCategory === 'Somme') {
      conflicts.push(...currentPatterns.filter(id => 
        id.startsWith('Somme_') && id !== newPatternId
      ));
    }
    
    // Conflits pour les patterns de dizaines (même catégorie uniquement)
    if (newCategory === 'Dizaines') {
      conflicts.push(...currentPatterns.filter(id => 
        id.startsWith('Dizaines_') && id !== newPatternId
      ));
    }
    
    // Conflits pour les patterns de zones (même catégorie uniquement)
    if (newCategory === 'Zone') {
      conflicts.push(...currentPatterns.filter(id => 
        id.startsWith('Zone_') && id !== newPatternId
      ));
    }
    
    // Conflits pour les patterns d'unités (même catégorie uniquement)
    if (newCategory === 'Unités') {
      conflicts.push(...currentPatterns.filter(id => 
        id.startsWith('Unités_') && id !== newPatternId
      ));
    }
    
    // Vérifier les conflits inter-catégories complexes
    const complexConflicts = getComplexConflicts([...currentPatterns, newPatternId]);
    conflicts.push(...complexConflicts);
    
    return conflicts;
  };

  // Fonction pour détecter les conflits complexes inter-catégories
  const getComplexConflicts = (allSelectedPatterns: string[]): string[] => {
    const conflicts: string[] = [];
    
    // Extraire les patterns par catégorie
    const parityPattern = allSelectedPatterns.find(p => p.startsWith('Parité_'));
    const consecutivePattern = allSelectedPatterns.find(p => p.startsWith('Consécutifs_'));
    const sommePattern = allSelectedPatterns.find(p => p.startsWith('Somme_'));
    const dizainePattern = allSelectedPatterns.find(p => p.startsWith('Dizaines_'));
    const unitePattern = allSelectedPatterns.find(p => p.startsWith('Unités_'));
    
    // Conflit 1: Parité extrême + Consécutifs
    if (parityPattern && consecutivePattern) {
      if (parityPattern.includes('5P-0I') && consecutivePattern.includes('NON-CONSECUTIF')) {
        // 5 pairs sans consécutifs est impossible
        conflicts.push(parityPattern, consecutivePattern);
      }
      if (parityPattern.includes('0P-5I') && consecutivePattern.includes('NON-CONSECUTIF')) {
        // 5 impairs sans consécutifs est impossible
        conflicts.push(parityPattern, consecutivePattern);
      }
    }
    
    // Conflit 2: Parité extrême + Somme
    if (parityPattern && sommePattern) {
      if (parityPattern.includes('0P-5I') && sommePattern.includes('SOMME_ELEVEE')) {
        // 5 impairs ne peuvent pas donner une somme élevée
        conflicts.push(parityPattern, sommePattern);
      }
      if (parityPattern.includes('5P-0I') && sommePattern.includes('SOMME_FAIBLE')) {
        // 5 pairs ne peuvent pas donner une somme faible
        conflicts.push(parityPattern, sommePattern);
      }
    }
    
    // Conflit 3: Dizaines + Unités
    if (dizainePattern && unitePattern) {
      if (dizainePattern.includes('DIZ1') && unitePattern.includes('UNIT_5_DIFFERENTES')) {
        // 1 dizaine ne peut pas avoir 5 unités différentes
        conflicts.push(dizainePattern, unitePattern);
      }
    }
    
    // Conflit 4: Somme + Parité (ranges impossibles)
    if (sommePattern && parityPattern) {
      if (sommePattern.includes('SOMME_FAIBLE') && parityPattern.includes('4P-1I')) {
        // 4 pairs + 1 impair ne peuvent pas donner une somme faible
        conflicts.push(sommePattern, parityPattern);
      }
      if (sommePattern.includes('SOMME_ELEVEE') && parityPattern.includes('1P-4I')) {
        // 1 pair + 4 impairs ne peuvent pas donner une somme élevée
        conflicts.push(sommePattern, parityPattern);
      }
    }
    
    return conflicts;
  };

  const handleSelectAllPatterns = (category: string) => {
    // Cette fonction sera implémentée quand on aura accès aux patterns disponibles
    console.log(`Sélectionner tous les patterns de la catégorie: ${category}`);
  };

  const handleDeselectAllPatterns = (category: string) => {
    setConfig(prev => {
      // Mapper les noms de catégories aux clés de configuration
      const categoryMapping: Record<string, keyof GenerationConfig> = {
        'Parité': 'selectedParityPatterns',
        'Consécutifs': 'selectedConsecutivePatterns',
        'Dizaines': 'selectedDizainePatterns',
        'Somme': 'selectedSommePatterns',
        'Zone': 'selectedZonePatterns',
        'Unités': 'selectedUnitesPatterns'
      };
      
      const categoryKey = categoryMapping[category];
      if (!categoryKey) {
        console.error('Catégorie non reconnue:', category);
        return prev;
      }
      
      return {
        ...prev,
        [categoryKey]: []
      };
    });
  };

  const openPatternsModal = () => {
    setIsPatternsModalOpen(true);
  };

  const closePatternsModal = () => {
    setIsPatternsModalOpen(false);
  };

  const generateCombinations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/combination-hub', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            ...config,
            strategies: [
              config.includeHotNumbers && 'hot',
              config.includeColdNumbers && 'cold',
              config.includeHotColdHybrid && 'hybrid',
              config.includePatterns && 'patterns',
              config.includeTemporalPatterns && 'temporal',
              config.includeMathematical && 'mathematical',
              config.includeRules && 'rules',
              config.includeAdvanced && 'advanced'
            ].filter(Boolean)
          }
        }),
      });

      const data = await response.json();
      if (data.success && data.combinations) {
        setCombinations(data.combinations);
      }
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Contenu principal */}
      <div className="flex-1 flex overflow-auto">
        {/* Mode Générateur de Stratégies - Sélecteur en pleine largeur */}
        {mode === 'strategy-generator' ? (
          /* Mode Configuration des Stratégies - Sélecteur + Prévisualisation */
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Colonne 1: Sélecteur de stratégies */}
            <div className="w-full lg:w-2/3 overflow-y-auto max-h-screen">
              <StrategySelector 
                strategiesByCategory={strategiesByCategory}
                onStrategyToggle={handleStrategyToggle}
                hotNumbers={hotNumbers}
                coldNumbers={coldNumbers}
                isLoadingHotCold={isLoadingHotCold}
                hotColdPeriodInfo={hotColdPeriodInfo}
                onOpenPatternsModal={openPatternsModal}
                selectedPatternsCount={
                  config.selectedParityPatterns.length +
                  config.selectedConsecutivePatterns.length +
                  config.selectedDizainePatterns.length +
                  config.selectedSommePatterns.length +
                  config.selectedZonePatterns.length +
                  config.selectedUnitesPatterns.length
                }
                remainingCombinations={remainingCombinations}
                fullWidth={false}
              />
            </div>

            {/* Colonne 2: Prévisualisation des numéros sélectionnés */}
            <div className="w-full lg:w-1/3 bg-white rounded-xl p-6 shadow-lg border border-gray-200 h-fit max-h-screen overflow-y-auto">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800">Numéros Sélectionnés</h3>
              </div>

              {/* Résumé des stratégies actives */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-800 mb-2">Stratégies Actives :</div>
                {previewNumbers.sources.length > 0 ? (
                  <div className="space-y-1">
                    {previewNumbers.sources.map((source, index) => (
                      <div key={index} className="text-xs text-blue-700 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {source}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic">Aucune stratégie sélectionnée</div>
                )}
              </div>

              {/* Numéros principaux */}
              {previewNumbers.selected.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Numéros Principaux ({previewNumbers.selected.length})
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {previewNumbers.selected.map((numero, index) => (
                      <div
                        key={numero}
                        className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-sm"
                      >
                        {numero}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Numéros complémentaires */}
              {previewNumbers.complementary.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Complémentaires ({previewNumbers.complementary.length})
                  </h4>
                  <div className="flex gap-2">
                    {previewNumbers.complementary.map((numero, index) => (
                      <div
                        key={numero}
                        className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-sm border-2 border-purple-300"
                      >
                        {numero}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bouton d'export vers le générateur */}
              {previewNumbers.selected.length >= 5 && (
                <button
                  onClick={saveSelectionForGenerator}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-bold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Exporter vers Générateur
                </button>
              )}

              {previewNumbers.selected.length < 5 && (
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-yellow-800 text-sm">
                    Sélectionnez au moins une stratégie pour voir les numéros
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Mode Génération de Jeux - Interface complète avec deux colonnes */
          <>
            {/* Colonne 1: Sélecteur de stratégies */}
            <StrategySelector 
              strategiesByCategory={strategiesByCategory}
              onStrategyToggle={handleStrategyToggle}
              hotNumbers={hotNumbers}
              coldNumbers={coldNumbers}
              isLoadingHotCold={isLoadingHotCold}
              hotColdPeriodInfo={hotColdPeriodInfo}
              onOpenPatternsModal={openPatternsModal}
              selectedPatternsCount={
                config.selectedParityPatterns.length +
                config.selectedConsecutivePatterns.length +
                config.selectedDizainePatterns.length +
                config.selectedSommePatterns.length +
                config.selectedZonePatterns.length +
                config.selectedUnitesPatterns.length
              }
              remainingCombinations={remainingCombinations}
            />

            {/* Interface de génération ludique et onirique */}
            <div className="flex-1 bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 overflow-y-auto">
              <div className="p-6">
                <div className="max-w-7xl mx-auto">
                  {/* Header onirique */}
                  <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🎰✨🎲</div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                      Machine à Rêves Loto
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Créez vos combinaisons magiques et réalisez vos rêves ! 🌟
                    </p>
                  </div>

                  {/* Grille en 3 colonnes */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Colonne 1: Configuration magique */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-purple-200">
                      <div className="text-center mb-6">
                        <div className="text-4xl mb-2">⚙️</div>
                        <h3 className="text-xl font-bold text-purple-800">Configuration Magique</h3>
                        <p className="text-sm text-gray-600">Paramétrez votre machine à rêves</p>
                      </div>
                      
                      <BaseConfiguration
                        combinationCount={config.combinationCount}
                        gridType={config.gridType}
                        multipleGridSize={config.multipleGridSize}
                        onCombinationCountChange={handleCombinationCountChange}
                        onGridTypeChange={handleGridTypeChange}
                        onMultipleGridSizeChange={handleMultipleGridSizeChange}
                      />
                    </div>

                    {/* Colonne 2: Statistiques oniriques */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-pink-200">
                      <div className="text-center mb-6">
                        <div className="text-4xl mb-2">📊</div>
                        <h3 className="text-xl font-bold text-pink-800">Statistiques Oniriques</h3>
                        <p className="text-sm text-gray-600">Vos chances de réaliser vos rêves</p>
                      </div>
                      
                      <CombinationCounter 
                        remainingCombinations={remainingCombinations}
                      />
                      
                      {/* Panneau de cohérence des stratégies */}
                      <div className="mt-6">
                        <StrategyCoherencePanel
                          config={{
                            includeHotNumbers: config.includeHotNumbers,
                            includeColdNumbers: config.includeColdNumbers,
                            includeHotColdHybrid: config.includeHotColdHybrid,
                            includeEcartsRetard: config.includeEcartsRetard,
                            includePatterns: config.includePatterns,
                            includeTemporalPatterns: config.includeTemporalPatterns,
                            includeMathematical: config.includeMathematical,
                            includeRules: config.includeRules,
                            includeAdvanced: config.includeAdvanced,
                            selectedPatterns: [
                              ...config.selectedParityPatterns,
                              ...config.selectedConsecutivePatterns,
                              ...config.selectedDizainePatterns,
                              ...config.selectedSommePatterns,
                              ...config.selectedZonePatterns,
                              ...config.selectedUnitesPatterns
                            ]
                          }}
                          hotNumbers={hotNumbers}
                          coldNumbers={coldNumbers}
                        />
                      </div>
                      
                    </div>

                    {/* Colonne 3: Génération de rêves */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-yellow-200">
                      <div className="text-center mb-6">
                        <div className="text-4xl mb-2">🎯</div>
                        <h3 className="text-xl font-bold text-yellow-800">Génération de Rêves</h3>
                        <p className="text-sm text-gray-600">Créez vos combinaisons gagnantes</p>
                      </div>
                      
                      <CombinationDisplay
                        combinations={combinations}
                        isLoading={isLoading}
                        onGenerate={generateCombinations}
                      />
                    </div>
                  </div>

                  {/* Section bonus - Conseils magiques */}
                  <div className="mt-8 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-6 border border-indigo-200">
                    <div className="text-center mb-4">
                      <div className="text-3xl mb-2">🔮</div>
                      <h3 className="text-lg font-bold text-indigo-800">Conseils de la Machine à Rêves</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-white/50 rounded-lg">
                        <div className="text-2xl mb-1">🎲</div>
                        <div className="font-medium text-indigo-700">Diversifiez</div>
                        <div className="text-gray-600">Mélangez chauds et froids</div>
                      </div>
                      <div className="text-center p-3 bg-white/50 rounded-lg">
                        <div className="text-2xl mb-1">🌈</div>
                        <div className="font-medium text-indigo-700">Équilibrez</div>
                        <div className="text-gray-600">Pairs et impairs harmonieux</div>
                      </div>
                      <div className="text-center p-3 bg-white/50 rounded-lg">
                        <div className="text-2xl mb-1">⭐</div>
                        <div className="font-medium text-indigo-700">Croyez</div>
                        <div className="text-gray-600">La chance sourit aux audacieux</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de sélection des patterns historiques */}
      <HistoricalPatternsSelector
        isOpen={isPatternsModalOpen}
        onClose={closePatternsModal}
        selectedPatterns={[
          ...config.selectedParityPatterns,
          ...config.selectedConsecutivePatterns,
          ...config.selectedDizainePatterns,
          ...config.selectedSommePatterns,
          ...config.selectedZonePatterns,
          ...config.selectedUnitesPatterns
        ]}
        onPatternToggle={handlePatternToggle}
        onSelectAll={handleSelectAllPatterns}
        onDeselectAll={handleDeselectAllPatterns}
      />

      <EcartsStrategieSelector
        isOpen={isEcartsModalOpen}
        onClose={closeEcartsModal}
        config={{
          includeEcartsRetard: config.includeEcartsRetard,
          ecartsNiveauUrgence: config.ecartsNiveauUrgence,
          ecartsSeuilCritique: config.ecartsSeuilCritique,
          ecartsSeuilEleve: config.ecartsSeuilEleve,
          ecartsSeuilMoyen: config.ecartsSeuilMoyen,
          ecartsSeuilFaible: config.ecartsSeuilFaible,
          ecartsConsidererHistorique: config.ecartsConsidererHistorique,
          ecartsNombreNumerosMax: config.ecartsNombreNumerosMax
        }}
        onConfigChange={(newConfig) => setConfig(prev => ({ ...prev, ...newConfig }))}
        analysisPeriod={config.hotColdPeriod}
      />
    </div>
  );
}