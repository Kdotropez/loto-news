'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  XCircle, 
  Clock, 
  Calculator, 
  Activity,
  Zap,
  BarChart3,
  Brain,
  Settings,
  Play,
  Loader2,
  RefreshCw,
  Smartphone,
  Tablet,
  Monitor,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Interfaces
interface GenerationStrategy {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  category: 'frequency' | 'pattern' | 'mathematical' | 'advanced' | 'constraint';
  enabled: boolean;
  details?: string;
}

interface PatternInfo {
  pattern: string;
  count: number;
  percentage: number;
  description: string;
}

interface AvailablePatterns {
  parity: PatternInfo[];
  consecutive: PatternInfo[];
  dizaine: PatternInfo[];
  somme: PatternInfo[];
  zone: PatternInfo[];
  unites: PatternInfo[];
  temporal: PatternInfo[];
  seasonal: PatternInfo[];
  cyclical: PatternInfo[];
  recent: PatternInfo[];
}

interface GenerationConfig {
  // Configuration de base
  combinationCount: number;
  gridType: 'simple' | 'multiple';
  multipleGridSize: number;
  
  // Stratégies de génération
  includeHotNumbers: boolean;
  includeColdNumbers: boolean;
  includePatterns: boolean;
  includeMathematical: boolean;
  includeRules: boolean;
  includeAdvanced: boolean;
  
  // Stratégies avancées (de l'Optimiseur Unifié)
  includeHotColdHybrid: boolean;
  includeCorrelations: boolean;
  includeAntiCorrelations: boolean;
  includeTemporalPatterns: boolean;
  includeMathematicalPatterns: boolean;
  includeVolatilityOptimized: boolean;
  
  // Patterns spécifiques
  selectedParityPatterns: string[];
  selectedConsecutivePatterns: string[];
  selectedDizainePatterns: string[];
  selectedSommePatterns: string[];
  selectedZonePatterns: string[];
  selectedUnitesPatterns: string[];
  
  // Patterns temporels sélectionnés
  selectedTemporalPatterns: string[];
  selectedSeasonalPatterns: string[];
  selectedCyclicalPatterns: string[];
  selectedRecentPatterns: string[];
  
  // Contraintes spécifiques
  minSum: number;
  maxSum: number;
  minDizaines: number;
  maxDizaines: number;
  consecutiveMode: 'disabled' | 'none' | 'optional' | 'required';
  maxConsecutive: number;
}

interface UnifiedCombination {
  numbers: number[];
  complementary: number;
  score: number;
  confidence: number;
  expectedValue: number;
  riskLevel: 'low' | 'medium' | 'high';
  reasons: string[];
  strategy: string;
  gameType: 'simple' | 'multiple';
  cost: number;
  expectedReturn: number;
  winProbability: number;
}

export default function UnifiedGeneratorInterface() {
  // États
  const [combinations, setCombinations] = useState<UnifiedCombination[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availablePatterns, setAvailablePatterns] = useState<AvailablePatterns>({
    parity: [],
    consecutive: [],
    dizaine: [],
    somme: [],
    zone: [],
    unites: [],
    temporal: [],
    seasonal: [],
    cyclical: [],
    recent: []
  });
  const [hotColdNumbers, setHotColdNumbers] = useState<{ hot: number[]; cold: number[] } | null>(null);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [activeCategory, setActiveCategory] = useState<string>('frequency');
  const [openPatternModal, setOpenPatternModal] = useState<string | null>(null);
  const [openHotNumbersModal, setOpenHotNumbersModal] = useState(false);
  const [openColdNumbersModal, setOpenColdNumbersModal] = useState(false);
  const [selectedHotNumbers, setSelectedHotNumbers] = useState<number[]>([]);
  const [selectedColdNumbers, setSelectedColdNumbers] = useState<number[]>([]);

  // Configuration de génération
  const [config, setConfig] = useState<GenerationConfig>({
    combinationCount: 10,
    gridType: 'simple',
    multipleGridSize: 7,
    includeHotNumbers: false,
    includeColdNumbers: false,
    includePatterns: false,
    includeMathematical: false,
    includeRules: false,
    includeAdvanced: false,
    includeHotColdHybrid: false,
    includeCorrelations: false,
    includeAntiCorrelations: false,
    includeTemporalPatterns: false,
    includeMathematicalPatterns: false,
    includeVolatilityOptimized: false,
    selectedParityPatterns: [],
    selectedConsecutivePatterns: [],
    selectedDizainePatterns: [],
    selectedSommePatterns: [],
    selectedZonePatterns: [],
    selectedUnitesPatterns: [],
    
    // Patterns temporels sélectionnés
    selectedTemporalPatterns: [],
    selectedSeasonalPatterns: [],
    selectedCyclicalPatterns: [],
    selectedRecentPatterns: [],
    
    minSum: 0,
    maxSum: 200,
    minDizaines: 1,
    maxDizaines: 5,
    consecutiveMode: 'disabled',
    maxConsecutive: 1
  });

  // Toutes les stratégies disponibles
  const allStrategies: GenerationStrategy[] = [
    // Stratégies de fréquence
    {
      id: 'includeHotNumbers',
      name: 'Numéros Chauds',
      description: 'Utilise les 20 numéros les plus fréquents',
      icon: Zap,
      color: 'red',
      category: 'frequency',
      enabled: config.includeHotNumbers,
      details: 'Sélectionne parmi les numéros les plus sortis historiquement'
    },
    {
      id: 'includeColdNumbers',
      name: 'Numéros Froids',
      description: 'Utilise les 20 numéros les moins fréquents',
      icon: XCircle,
      color: 'blue',
      category: 'frequency',
      enabled: config.includeColdNumbers,
      details: 'Sélectionne parmi les numéros les moins sortis historiquement'
    },
    {
      id: 'includeHotColdHybrid',
      name: 'Hot-Cold Hybride',
      description: 'Mélange optimal entre numéros chauds et froids',
      icon: Target,
      color: 'purple',
      category: 'frequency',
      enabled: config.includeHotColdHybrid,
      details: 'Algorithme intelligent pour équilibrer chauds et froids'
    },

    // Stratégies de patterns
    {
      id: 'includePatterns',
      name: 'Patterns Historiques',
      description: 'Utilise les patterns les plus fréquents',
      icon: BarChart3,
      color: 'green',
      category: 'pattern',
      enabled: config.includePatterns,
      details: 'Basé sur l\'analyse des patterns de parité, consécutifs, etc.'
    },
    {
      id: 'includeTemporalPatterns',
      name: 'Patterns Temporels',
      description: 'Basé sur les cycles de récurrence et tendances',
      icon: Clock,
      color: 'indigo',
      category: 'pattern',
      enabled: config.includeTemporalPatterns,
      details: 'Analyse les cycles temporels et tendances d\'apparition'
    },

    // Stratégies mathématiques
    {
      id: 'includeMathematical',
      name: 'Multi-Critères',
      description: 'Optimisation mathématique avancée',
      icon: Calculator,
      color: 'orange',
      category: 'mathematical',
      enabled: config.includeMathematical,
      details: 'Algorithme multi-critères (somme, dizaines, distribution)'
    },
    {
      id: 'includeMathematicalPatterns',
      name: 'Patterns Mathématiques',
      description: 'Utilise des structures mathématiques',
      icon: Brain,
      color: 'pink',
      category: 'mathematical',
      enabled: config.includeMathematicalPatterns,
      details: 'Structures mathématiques (Fibonacci, progressions, etc.)'
    },

    // Stratégies avancées
    {
      id: 'includeAdvanced',
      name: 'Stratégies Avancées',
      description: 'Combinaison de plusieurs techniques',
      icon: Settings,
      color: 'gray',
      category: 'advanced',
      enabled: config.includeAdvanced,
      details: 'Mélange intelligent de toutes les techniques disponibles'
    },
    {
      id: 'includeCorrelations',
      name: 'Corrélations Fortes',
      description: 'Utilise les corrélations statistiques les plus fortes',
      icon: TrendingUp,
      color: 'emerald',
      category: 'advanced',
      enabled: config.includeCorrelations,
      details: 'Exploite les corrélations entre numéros et patterns'
    },
    {
      id: 'includeAntiCorrelations',
      name: 'Anti-Corrélations',
      description: 'Évite les combinaisons qui ont mal performé',
      icon: XCircle,
      color: 'rose',
      category: 'advanced',
      enabled: config.includeAntiCorrelations,
      details: 'Évite les patterns qui ont historiquement mal performé'
    },
    {
      id: 'includeVolatilityOptimized',
      name: 'Volatilité Optimisée',
      description: 'Équilibre stabilité et opportunité',
      icon: Activity,
      color: 'yellow',
      category: 'advanced',
      enabled: config.includeVolatilityOptimized,
      details: 'Optimise le ratio risque/rendement'
    },

    // Contraintes réglementaires
    {
      id: 'includeRules',
      name: 'Contraintes Réglementaires',
      description: 'Respect des règles officielles du Loto',
      icon: CheckCircle,
      color: 'blue',
      category: 'constraint',
      enabled: config.includeRules,
      details: 'Applique les contraintes officielles (somme, dizaines, etc.)'
    }
  ];

  // Détection du type d'appareil
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  // Charger les patterns disponibles
  useEffect(() => {
    const loadAvailablePatterns = async () => {
      try {
        const response = await fetch('/api/pattern-optimization');
        const result = await response.json();
        if (result.success && result.patterns) {
          setAvailablePatterns(result.patterns);
        } else {
          // Patterns par défaut si l'API ne fonctionne pas
          console.warn('Patterns non disponibles, utilisation des patterns par défaut');
          setAvailablePatterns({
            parity: [
              { pattern: '3P-2I', count: 4079, percentage: 33.25, description: 'Distribution 3 Pairs - 2 Impairs' },
              { pattern: '2P-3I', count: 3982, percentage: 32.46, description: 'Distribution 2 Pairs - 3 Impairs' },
              { pattern: '4P-1I', count: 1669, percentage: 13.60, description: 'Distribution 4 Pairs - 1 Impair' },
              { pattern: '1P-4I', count: 1932, percentage: 15.75, description: 'Distribution 1 Pair - 4 Impairs' },
              { pattern: '5P-0I', count: 281, percentage: 2.29, description: 'Distribution 5 Pairs - 0 Impair' },
              { pattern: '0P-5I', count: 326, percentage: 2.66, description: 'Distribution 0 Pair - 5 Impairs' }
            ],
            consecutive: [
              { pattern: 'NON-CONSECUTIF', count: 8500, percentage: 69.3, description: 'Aucun numéro consécutif' },
              { pattern: 'CONSECUTIF', count: 3769, percentage: 30.7, description: 'Numéros consécutifs présents' }
            ],
            dizaine: [
              { pattern: 'DIZ3', count: 4500, percentage: 36.7, description: '3 dizaines différentes' },
              { pattern: 'DIZ4', count: 4200, percentage: 34.2, description: '4 dizaines différentes' },
              { pattern: 'DIZ5', count: 2100, percentage: 17.1, description: '5 dizaines différentes' },
              { pattern: 'DIZ2', count: 1200, percentage: 9.8, description: '2 dizaines différentes' },
              { pattern: 'DIZ1', count: 300, percentage: 2.4, description: '1 dizaine seulement' }
            ],
            somme: [
              { pattern: 'SOMME_100_120', count: 3200, percentage: 26.1, description: 'Somme entre 100 et 120' },
              { pattern: 'SOMME_120_140', count: 2800, percentage: 22.8, description: 'Somme entre 120 et 140' },
              { pattern: 'SOMME_80_100', count: 2500, percentage: 20.4, description: 'Somme entre 80 et 100' },
              { pattern: 'SOMME_140_160', count: 2000, percentage: 16.3, description: 'Somme entre 140 et 160' },
              { pattern: 'SOMME_60_80', count: 1200, percentage: 9.8, description: 'Somme entre 60 et 80' },
              { pattern: 'SOMME_160_200', count: 600, percentage: 4.9, description: 'Somme entre 160 et 200' }
            ],
            zone: [
              { pattern: 'ZONE_1_10', count: 1800, percentage: 14.7, description: 'Zone 1-10 dominante' },
              { pattern: 'ZONE_11_20', count: 1900, percentage: 15.5, description: 'Zone 11-20 dominante' },
              { pattern: 'ZONE_21_30', count: 2000, percentage: 16.3, description: 'Zone 21-30 dominante' },
              { pattern: 'ZONE_31_40', count: 2100, percentage: 17.1, description: 'Zone 31-40 dominante' },
              { pattern: 'ZONE_41_49', count: 2200, percentage: 17.9, description: 'Zone 41-49 dominante' },
              { pattern: 'ZONE_EQUILIBREE', count: 2200, percentage: 17.9, description: 'Distribution équilibrée' }
            ],
            unites: [
              { pattern: 'UNIT_5_DIFFERENTES', count: 3500, percentage: 28.5, description: '5 unités différentes' },
              { pattern: 'UNIT_4_DIFFERENTES', count: 2800, percentage: 22.8, description: '4 unités différentes' },
              { pattern: 'UNIT_3_DIFFERENTES', count: 2000, percentage: 16.3, description: '3 unités différentes' },
              { pattern: 'UNIT_1_SIMILAIRES_4_DIFFERENTES', count: 1500, percentage: 12.2, description: '1 similaires, 4 différentes' },
              { pattern: 'UNIT_2_SIMILAIRES_3_DIFFERENTES', count: 1200, percentage: 9.8, description: '2 similaires, 3 différentes' },
              { pattern: 'UNIT_3_SIMILAIRES_2_DIFFERENTES', count: 800, percentage: 6.5, description: '3 similaires, 2 différentes' },
              { pattern: 'UNIT_4_SIMILAIRES_1_DIFFERENTE', count: 400, percentage: 3.3, description: '4 similaires, 1 différente' }
            ],
            temporal: [
              { pattern: 'TEMPORAL_CROISSANT', count: 3200, percentage: 17.0, description: 'Tendance croissante' },
              { pattern: 'TEMPORAL_DECROISSANT', count: 2800, percentage: 14.9, description: 'Tendance décroissante' },
              { pattern: 'TEMPORAL_STABLE', count: 4500, percentage: 23.9, description: 'Tendance stable' },
              { pattern: 'TEMPORAL_VOLATILE', count: 1800, percentage: 9.6, description: 'Tendance volatile' }
            ],
            seasonal: [
              { pattern: 'SEASONAL_PRINTEMPS', count: 4800, percentage: 25.5, description: 'Pattern printemps' },
              { pattern: 'SEASONAL_ETE', count: 4200, percentage: 22.3, description: 'Pattern été' },
              { pattern: 'SEASONAL_AUTOMNE', count: 3800, percentage: 20.2, description: 'Pattern automne' },
              { pattern: 'SEASONAL_HIVER', count: 4000, percentage: 21.3, description: 'Pattern hiver' }
            ],
            cyclical: [
              { pattern: 'CYCLICAL_SEMAINE', count: 3500, percentage: 18.6, description: 'Cycle hebdomadaire' },
              { pattern: 'CYCLICAL_MOIS', count: 2800, percentage: 14.9, description: 'Cycle mensuel' },
              { pattern: 'CYCLICAL_ANNEE', count: 2200, percentage: 11.7, description: 'Cycle annuel' },
              { pattern: 'CYCLICAL_IRREGULIER', count: 4200, percentage: 22.3, description: 'Cycle irrégulier' }
            ],
            recent: [
              { pattern: 'RECENT_7J', count: 1800, percentage: 9.6, description: 'Derniers 7 jours' },
              { pattern: 'RECENT_30J', count: 3200, percentage: 17.0, description: 'Derniers 30 jours' },
              { pattern: 'RECENT_90J', count: 2800, percentage: 14.9, description: 'Derniers 90 jours' },
              { pattern: 'RECENT_ANNEE', count: 1500, percentage: 8.0, description: 'Dernière année' }
            ]
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des patterns:', error);
        // Utiliser les patterns par défaut en cas d'erreur
        setAvailablePatterns({
          parity: [
            { pattern: '3P-2I', count: 4079, percentage: 33.25, description: 'Distribution 3 Pairs - 2 Impairs' },
            { pattern: '2P-3I', count: 3982, percentage: 32.46, description: 'Distribution 2 Pairs - 3 Impairs' },
            { pattern: '4P-1I', count: 1669, percentage: 13.60, description: 'Distribution 4 Pairs - 1 Impair' },
            { pattern: '1P-4I', count: 1932, percentage: 15.75, description: 'Distribution 1 Pair - 4 Impairs' },
            { pattern: '5P-0I', count: 281, percentage: 2.29, description: 'Distribution 5 Pairs - 0 Impair' },
            { pattern: '0P-5I', count: 326, percentage: 2.66, description: 'Distribution 0 Pair - 5 Impairs' }
          ],
          consecutive: [
            { pattern: 'NON-CONSECUTIF', count: 8500, percentage: 69.3, description: 'Aucun numéro consécutif' },
            { pattern: 'CONSECUTIF', count: 3769, percentage: 30.7, description: 'Numéros consécutifs présents' }
          ],
          dizaine: [
            { pattern: 'DIZ3', count: 4500, percentage: 36.7, description: '3 dizaines différentes' },
            { pattern: 'DIZ4', count: 4200, percentage: 34.2, description: '4 dizaines différentes' },
            { pattern: 'DIZ5', count: 2100, percentage: 17.1, description: '5 dizaines différentes' },
            { pattern: 'DIZ2', count: 1200, percentage: 9.8, description: '2 dizaines différentes' },
            { pattern: 'DIZ1', count: 300, percentage: 2.4, description: '1 dizaine seulement' }
          ],
          somme: [
            { pattern: 'SOMME_100_120', count: 3200, percentage: 26.1, description: 'Somme entre 100 et 120' },
            { pattern: 'SOMME_120_140', count: 2800, percentage: 22.8, description: 'Somme entre 120 et 140' },
            { pattern: 'SOMME_80_100', count: 2500, percentage: 20.4, description: 'Somme entre 80 et 100' },
            { pattern: 'SOMME_140_160', count: 2000, percentage: 16.3, description: 'Somme entre 140 et 160' },
            { pattern: 'SOMME_60_80', count: 1200, percentage: 9.8, description: 'Somme entre 60 et 80' },
            { pattern: 'SOMME_160_200', count: 600, percentage: 4.9, description: 'Somme entre 160 et 200' }
          ],
          zone: [
            { pattern: 'ZONE_1_10', count: 1800, percentage: 14.7, description: 'Zone 1-10 dominante' },
            { pattern: 'ZONE_11_20', count: 1900, percentage: 15.5, description: 'Zone 11-20 dominante' },
            { pattern: 'ZONE_21_30', count: 2000, percentage: 16.3, description: 'Zone 21-30 dominante' },
            { pattern: 'ZONE_31_40', count: 2100, percentage: 17.1, description: 'Zone 31-40 dominante' },
            { pattern: 'ZONE_41_49', count: 2200, percentage: 17.9, description: 'Zone 41-49 dominante' },
            { pattern: 'ZONE_EQUILIBREE', count: 2200, percentage: 17.9, description: 'Distribution équilibrée' }
          ],
          unites: [
            { pattern: 'UNIT_5_DIFFERENTES', count: 3500, percentage: 28.5, description: '5 unités différentes' },
            { pattern: 'UNIT_4_DIFFERENTES', count: 2800, percentage: 22.8, description: '4 unités différentes' },
            { pattern: 'UNIT_3_DIFFERENTES', count: 2000, percentage: 16.3, description: '3 unités différentes' },
            { pattern: 'UNIT_1_SIMILAIRES_4_DIFFERENTES', count: 1500, percentage: 12.2, description: '1 similaires, 4 différentes' },
            { pattern: 'UNIT_2_SIMILAIRES_3_DIFFERENTES', count: 1200, percentage: 9.8, description: '2 similaires, 3 différentes' },
            { pattern: 'UNIT_3_SIMILAIRES_2_DIFFERENTES', count: 800, percentage: 6.5, description: '3 similaires, 2 différentes' },
            { pattern: 'UNIT_4_SIMILAIRES_1_DIFFERENTE', count: 400, percentage: 3.3, description: '4 similaires, 1 différente' }
          ],
          temporal: [
            { pattern: 'LUNDI_FAVORISE', count: 1500, percentage: 12.2, description: 'Pattern favorable le lundi' },
            { pattern: 'MERCREDI_FAVORISE', count: 1800, percentage: 14.7, description: 'Pattern favorable le mercredi' },
            { pattern: 'SAMEDI_FAVORISE', count: 2000, percentage: 16.3, description: 'Pattern favorable le samedi' }
          ],
          seasonal: [
            { pattern: 'ETE_ACTIF', count: 2500, percentage: 20.4, description: 'Pattern actif en été' },
            { pattern: 'HIVER_ACTIF', count: 2200, percentage: 17.9, description: 'Pattern actif en hiver' }
          ],
          cyclical: [
            { pattern: 'CYCLE_7_JOURS', count: 1800, percentage: 14.7, description: 'Cycle de 7 jours' },
            { pattern: 'CYCLE_14_JOURS', count: 1500, percentage: 12.2, description: 'Cycle de 14 jours' }
          ],
          recent: [
            { pattern: 'RECENT_ACTIF', count: 3000, percentage: 24.5, description: 'Pattern récemment actif' },
            { pattern: 'RECENT_DORMANT', count: 2000, percentage: 16.3, description: 'Pattern récemment dormant' }
          ]
        });
      }
    };

    loadAvailablePatterns();
  }, []);

  // Charger les numéros chauds/froids
  useEffect(() => {
    const loadHotColdNumbers = async () => {
      try {
        const response = await fetch('/api/analysis?type=frequency');
        if (response.ok) {
          const data = await response.json();
          const frequencies = data.data?.frequencies || data.frequencies || data;
          
          if (frequencies && frequencies.length > 0) {
            const sortedFrequencies = frequencies.sort((a: any, b: any) => b.frequency - a.frequency);
            const hotNumbers = sortedFrequencies.slice(0, 20).map((item: any) => item.numero);
            const coldNumbers = sortedFrequencies.slice(-20).map((item: any) => item.numero);
            setHotColdNumbers({ hot: hotNumbers, cold: coldNumbers });
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des numéros chauds/froids:', error);
      }
    };

    loadHotColdNumbers();
  }, []);

  // Fonction pour convertir un pourcentage en format lisible
  const formatFrequency = (percentage: number): string => {
    if (percentage >= 50) return "Très fréquent";
    if (percentage >= 25) return "Fréquent";
    if (percentage >= 10) return "Occasionnel";
    if (percentage >= 5) return "Rare";
    if (percentage >= 1) return "Très rare";
    
    const ratio = Math.round(100 / percentage);
    if (ratio <= 2) return "1 fois sur 2";
    if (ratio <= 5) return `1 fois sur ${ratio}`;
    if (ratio <= 10) return `1 fois sur ${ratio}`;
    if (ratio <= 20) return `1 fois sur ${ratio}`;
    return `1 fois sur ${ratio}`;
  };

  // Grouper les stratégies par catégorie
  const strategiesByCategory = allStrategies.reduce((acc, strategy) => {
    if (!acc[strategy.category]) {
      acc[strategy.category] = [];
    }
    acc[strategy.category].push(strategy);
    return acc;
  }, {} as Record<string, GenerationStrategy[]>);

  // Calculer le nombre de combinaisons possibles
  const calculateRemainingCombinations = (): number => {
    let remainingCombinations = 1906884; // Total des combinaisons possibles
    
    const activeStrategies = Object.values(config).filter(value => 
      typeof value === 'boolean' && value === true
    ).length;

    // Impact des stratégies principales
    if (activeStrategies > 0) {
      if (config.includeHotNumbers && config.includeColdNumbers) {
        remainingCombinations = 216600; // C(20,3) × C(20,2)
      } else if (config.includeHotNumbers || config.includeColdNumbers) {
        remainingCombinations = 15504; // C(20,5)
      } else {
        remainingCombinations *= Math.pow(0.8, activeStrategies);
      }
    }

    // Impact des patterns sélectionnés
    const totalSelectedPatterns = 
      config.selectedParityPatterns.length +
      config.selectedConsecutivePatterns.length +
      config.selectedDizainePatterns.length +
      config.selectedSommePatterns.length +
      config.selectedZonePatterns.length +
      config.selectedUnitesPatterns.length;

    if (totalSelectedPatterns > 0) {
      // Réduction basée sur le nombre de patterns sélectionnés
      const patternReduction = Math.pow(0.7, totalSelectedPatterns);
      remainingCombinations *= patternReduction;
    }

    // Impact des contraintes spécifiques
    if (config.minSum > 0 || config.maxSum < 200) {
      remainingCombinations *= 0.8; // Réduction pour contraintes de somme
    }

    if (config.minDizaines > 1 || config.maxDizaines < 5) {
      remainingCombinations *= 0.9; // Réduction pour contraintes de dizaines
    }

    if (config.consecutiveMode !== 'disabled') {
      if (config.consecutiveMode === 'none') {
        remainingCombinations *= 0.7; // Réduction pour "aucun consécutif"
      } else if (config.consecutiveMode === 'required') {
        remainingCombinations *= 0.3; // Réduction pour "consécutifs obligatoires"
      } else {
        remainingCombinations *= 0.5; // Réduction pour "consécutifs optionnels"
      }
    }

    return Math.round(remainingCombinations);
  };

  // Générer les combinaisons
  const generateCombinations = async () => {
    // Vérifier les conflits critiques
    if (conflicts.length > 0) {
      toast.error('Veuillez résoudre les conflits avant de générer des combinaisons');
      return;
    }

    setIsLoading(true);
    try {
      // Déterminer la stratégie à utiliser en cas de conflit
      let effectiveStrategy = 'Unifié';
      let strategyReasons = ['Optimisation multi-critères', 'Analyse statistique avancée'];

      if (config.includeHotColdHybrid) {
        effectiveStrategy = 'Hot-Cold Hybride';
        strategyReasons = ['Mélange intelligent chauds/froids', 'Équilibre optimal des fréquences'];
      } else if (config.includeHotNumbers && config.includeColdNumbers) {
        effectiveStrategy = 'Hot + Cold';
        strategyReasons = ['Numéros chauds et froids', 'Mélange 3 chauds + 2 froids'];
      } else if (config.includeHotNumbers) {
        effectiveStrategy = 'Numéros Chauds';
        strategyReasons = ['Sélection parmi les 20 numéros les plus fréquents'];
      } else if (config.includeColdNumbers) {
        effectiveStrategy = 'Numéros Froids';
        strategyReasons = ['Sélection parmi les 20 numéros les moins fréquents'];
      }

      // Simuler la génération (à remplacer par l'appel API réel)
      const generatedCombinations: UnifiedCombination[] = [];
      
      for (let i = 0; i < config.combinationCount; i++) {
        const numbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 49) + 1);
        const complementary = Math.floor(Math.random() * 10) + 1;
        
        generatedCombinations.push({
          numbers,
          complementary,
          score: Math.random() * 100,
          confidence: 0.6 + Math.random() * 0.3,
          expectedValue: 2 + Math.random() * 10,
          riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
          reasons: strategyReasons,
          strategy: effectiveStrategy,
          gameType: config.gridType,
          cost: config.gridType === 'simple' ? 2.2 : 2.2 * config.multipleGridSize,
          expectedReturn: 2 + Math.random() * 15,
          winProbability: 0.0001 + Math.random() * 0.0005
        });
      }

      setCombinations(generatedCombinations);
      toast.success(`${generatedCombinations.length} combinaisons générées avec la stratégie "${effectiveStrategy}" !`);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la génération des combinaisons');
    } finally {
      setIsLoading(false);
    }
  };

  // Réinitialiser toutes les contraintes
  const resetAllConstraints = () => {
    setConfig(prev => ({
      ...prev,
      includeHotNumbers: false,
      includeColdNumbers: false,
      includePatterns: false,
      includeMathematical: false,
      includeRules: false,
      includeAdvanced: false,
      includeHotColdHybrid: false,
      includeCorrelations: false,
      includeAntiCorrelations: false,
      includeTemporalPatterns: false,
      includeMathematicalPatterns: false,
      includeVolatilityOptimized: false,
      selectedParityPatterns: [],
      selectedConsecutivePatterns: [],
      selectedDizainePatterns: [],
      selectedSommePatterns: [],
      selectedZonePatterns: [],
      selectedUnitesPatterns: [],
      
      // Patterns temporels sélectionnés
      selectedTemporalPatterns: [],
      selectedSeasonalPatterns: [],
      selectedCyclicalPatterns: [],
      selectedRecentPatterns: [],
      
      minSum: 0,
      maxSum: 200,
      minDizaines: 1,
      maxDizaines: 5,
      consecutiveMode: 'disabled',
      maxConsecutive: 1
    }));
    toast.success('Toutes les contraintes ont été réinitialisées');
  };

  const remainingCombinations = calculateRemainingCombinations();
  const activeStrategiesCount = Object.values(config).filter(value => 
    typeof value === 'boolean' && value === true
  ).length;

  // Validation des conflits de stratégies
  const validateStrategyConflicts = () => {
    const conflicts = [];
    const warnings = [];

    // Conflit : Hot + Cold + Hybride
    if (config.includeHotNumbers && config.includeColdNumbers && config.includeHotColdHybrid) {
      conflicts.push("Conflit détecté : 'Numéros chauds' + 'Numéros froids' + 'Hot-Cold Hybride' sont tous sélectionnés. Le Hybride remplace les deux autres.");
    }

    // Conflit : Hot + Hybride
    if (config.includeHotNumbers && config.includeHotColdHybrid && !config.includeColdNumbers) {
      warnings.push("Redondance : 'Numéros chauds' + 'Hot-Cold Hybride'. Le Hybride inclut déjà les numéros chauds.");
    }

    // Conflit : Cold + Hybride
    if (config.includeColdNumbers && config.includeHotColdHybrid && !config.includeHotNumbers) {
      warnings.push("Redondance : 'Numéros froids' + 'Hot-Cold Hybride'. Le Hybride inclut déjà les numéros froids.");
    }

    return { conflicts, warnings };
  };

  const { conflicts, warnings } = validateStrategyConflicts();

  // Helper pour créer les inputs de patterns
  const createPatternInput = (
    patternInfo: PatternInfo,
    selectedPatterns: string[],
    updateFunction: (patterns: string[]) => void
  ) => (
    <input
      type="checkbox"
      checked={selectedPatterns.includes(patternInfo.pattern)}
      disabled={!config.includePatterns}
      onChange={(e) => {
        if (e.target.checked) {
          updateFunction([...selectedPatterns, patternInfo.pattern]);
        } else {
          updateFunction(selectedPatterns.filter(p => p !== patternInfo.pattern));
        }
      }}
      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header avec indicateur de combinaisons */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Générateur Unifié</h1>
                <p className="text-sm text-gray-600">Toutes les stratégies en un seul endroit</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {remainingCombinations.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Combinaisons possibles</div>
                {remainingCombinations < 1906884 && (
                  <div className="text-xs text-orange-600 mt-1">
                    Réduction: {((1906884 - remainingCombinations) / 1906884 * 100).toFixed(1)}%
                  </div>
                )}
              </div>
              
              <button
                onClick={resetAllConstraints}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Affichage des conflits et avertissements */}
      {(conflicts.length > 0 || warnings.length > 0) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="space-y-3">
            {conflicts.map((conflict, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 font-medium">Conflit détecté</span>
                </div>
                <p className="text-red-700 text-sm mt-1">{conflict}</p>
              </motion.div>
            ))}
            
            {warnings.map((warning, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-800 font-medium">Avertissement</span>
                </div>
                <p className="text-yellow-700 text-sm mt-1">{warning}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section de génération en haut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-blue-600" />
            Génération de Combinaisons
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Nombre de combinaisons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de combinaisons
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={config.combinationCount}
                onChange={(e) => setConfig(prev => ({ ...prev, combinationCount: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Type de grille */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de grille
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gridType"
                    value="simple"
                    checked={config.gridType === 'simple'}
                    onChange={(e) => setConfig(prev => ({ ...prev, gridType: e.target.value as 'simple' | 'multiple' }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Grille simple (5 numéros)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gridType"
                    value="multiple"
                    checked={config.gridType === 'multiple'}
                    onChange={(e) => setConfig(prev => ({ ...prev, gridType: e.target.value as 'simple' | 'multiple' }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Grille multiple</span>
                </label>
              </div>
            </div>

            {/* Taille de grille multiple */}
            {config.gridType === 'multiple' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taille de la grille
                </label>
                <select
                  value={config.multipleGridSize}
                  onChange={(e) => setConfig(prev => ({ ...prev, multipleGridSize: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={7}>7 numéros</option>
                  <option value={8}>8 numéros</option>
                  <option value={9}>9 numéros</option>
                </select>
              </div>
            )}
          </div>

          {/* Bouton de génération */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={generateCombinations}
              disabled={isLoading || conflicts.length > 0}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Générer les Combinaisons
                </>
              )}
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration */}
          <div className="lg:col-span-2 space-y-6">

            {/* Stratégies par catégorie */}
            {Object.entries(strategiesByCategory).map(([category, strategies]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  {category === 'frequency' && <Zap className="w-5 h-5 text-red-600" />}
                  {category === 'pattern' && <BarChart3 className="w-5 h-5 text-green-600" />}
                  {category === 'mathematical' && <Calculator className="w-5 h-5 text-orange-600" />}
                  {category === 'advanced' && <Brain className="w-5 h-5 text-purple-600" />}
                  {category === 'constraint' && <CheckCircle className="w-5 h-5 text-blue-600" />}
                  {category === 'frequency' && 'Stratégies de Fréquence'}
                  {category === 'pattern' && 'Stratégies de Patterns'}
                  {category === 'mathematical' && 'Stratégies Mathématiques'}
                  {category === 'advanced' && 'Stratégies Avancées'}
                  {category === 'constraint' && 'Contraintes Réglementaires'}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {strategies.map((strategy) => {
                    const Icon = strategy.icon;
                    const isEnabled = config[strategy.id as keyof GenerationConfig] as boolean;
                    
                    return (
                      <div
                        key={strategy.id}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          isEnabled 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => setConfig(prev => ({ 
                          ...prev, 
                          [strategy.id]: !isEnabled 
                        }))}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            isEnabled ? 'bg-blue-500' : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              isEnabled ? 'text-white' : 'text-gray-600'
                            }`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900">{strategy.name}</h3>
                              {isEnabled && <CheckCircle className="w-4 h-4 text-green-500" />}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
                            {strategy.details && (
                              <p className="text-xs text-gray-500">{strategy.details}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Bouton pour sélectionner les numéros chauds */}
                        {strategy.id === 'includeHotNumbers' && isEnabled && (
                          <div className="mt-3">
                            <button
                              onClick={() => setOpenHotNumbersModal(true)}
                              className="w-full p-3 bg-red-50 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-100 transition-all text-left"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                  <span className="font-medium text-red-800 text-sm">🔥 Numéros chauds</span>
                                </div>
                                <div className="text-xs text-red-600">
                                  {selectedHotNumbers.length > 0 
                                    ? `${selectedHotNumbers.length} sélectionné(s)` 
                                    : 'Cliquez pour sélectionner'
                                  }
                                </div>
                              </div>
                            </button>
                            
                            {/* Affichage des numéros sélectionnés */}
                            {selectedHotNumbers.length > 0 && (
                              <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded-lg">
                                <div className="text-xs text-red-700 mb-1">Numéros sélectionnés :</div>
                                <div className="flex flex-wrap gap-1">
                                  {selectedHotNumbers.map((number) => (
                                    <span
                                      key={number}
                                      className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full border border-red-400"
                                    >
                                      {number}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Bouton pour sélectionner les numéros froids */}
                        {strategy.id === 'includeColdNumbers' && isEnabled && (
                          <div className="mt-3">
                            <button
                              onClick={() => setOpenColdNumbersModal(true)}
                              className="w-full p-3 bg-blue-50 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-100 transition-all text-left"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                  <span className="font-medium text-blue-800 text-sm">❄️ Numéros froids</span>
                                </div>
                                <div className="text-xs text-blue-600">
                                  {selectedColdNumbers.length > 0 
                                    ? `${selectedColdNumbers.length} sélectionné(s)` 
                                    : 'Cliquez pour sélectionner'
                                  }
                                </div>
                              </div>
                            </button>
                            
                            {/* Affichage des numéros sélectionnés */}
                            {selectedColdNumbers.length > 0 && (
                              <div className="mt-2 p-2 bg-blue-100 border border-blue-300 rounded-lg">
                                <div className="text-xs text-blue-700 mb-1">Numéros sélectionnés :</div>
                                <div className="flex flex-wrap gap-1">
                                  {selectedColdNumbers.map((number) => (
                                    <span
                                      key={number}
                                      className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full border border-blue-400"
                                    >
                                      {number}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Bouton pour sélectionner le mélange hybride */}
                        {strategy.id === 'includeHotColdHybrid' && isEnabled && (
                          <div className="mt-3">
                            <button
                              onClick={() => {
                                setOpenHotNumbersModal(true);
                                setOpenColdNumbersModal(true);
                              }}
                              className="w-full p-3 bg-purple-50 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-100 transition-all text-left"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                  <span className="font-medium text-purple-800 text-sm">🎯 Mélange Hybride</span>
                                </div>
                                <div className="text-xs text-purple-600">
                                  {(selectedHotNumbers.length + selectedColdNumbers.length) > 0 
                                    ? `${selectedHotNumbers.length + selectedColdNumbers.length} sélectionné(s)` 
                                    : 'Cliquez pour sélectionner'
                                  }
                                </div>
                              </div>
                              <div className="text-xs text-purple-600 mt-1">
                                Mélange optimal entre chauds et froids
                              </div>
                            </button>
                            
                            {/* Affichage des numéros sélectionnés pour le mélange hybride */}
                            {(selectedHotNumbers.length > 0 || selectedColdNumbers.length > 0) && (
                              <div className="mt-2 p-2 bg-purple-100 border border-purple-300 rounded-lg">
                                <div className="text-xs text-purple-700 mb-1">Numéros sélectionnés :</div>
                                <div className="space-y-1">
                                  {selectedHotNumbers.length > 0 && (
                                    <div>
                                      <div className="text-xs text-red-700 mb-1">🔥 Chauds :</div>
                                      <div className="flex flex-wrap gap-1">
                                        {selectedHotNumbers.map((number) => (
                                          <span
                                            key={`hot-${number}`}
                                            className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full border border-red-400"
                                          >
                                            {number}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {selectedColdNumbers.length > 0 && (
                                    <div>
                                      <div className="text-xs text-blue-700 mb-1">❄️ Froids :</div>
                                      <div className="flex flex-wrap gap-1">
                                        {selectedColdNumbers.map((number) => (
                                          <span
                                            key={`cold-${number}`}
                                            className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full border border-blue-400"
                                          >
                                            {number}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Sélection des patterns directement dans la carte Patterns Historiques */}
                        {strategy.id === 'includePatterns' && (isEnabled || 
                          config.selectedParityPatterns.length > 0 || 
                          config.selectedConsecutivePatterns.length > 0 || 
                          config.selectedDizainePatterns.length > 0 || 
                          config.selectedSommePatterns.length > 0 || 
                          config.selectedZonePatterns.length > 0 || 
                          config.selectedUnitesPatterns.length > 0) && (
                          <div className="mt-3">
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="text-sm font-medium text-green-800 mb-3">📊 Sélection des Patterns :</div>
                              
                              {/* Boutons pour chaque type de pattern */}
                              <div className="grid grid-cols-2 gap-2 mb-3">
                                <button
                                  onClick={() => setOpenPatternModal('parity')}
                                  className="p-2 text-xs bg-white border border-green-300 rounded hover:bg-green-100 transition-colors"
                                >
                                  <div className="font-medium text-green-800">Parité</div>
                                  <div className="text-green-600">{config.selectedParityPatterns.length} sélectionné(s)</div>
                                </button>
                                
                                <button
                                  onClick={() => setOpenPatternModal('consecutive')}
                                  className="p-2 text-xs bg-white border border-green-300 rounded hover:bg-green-100 transition-colors"
                                >
                                  <div className="font-medium text-green-800">Consécutifs</div>
                                  <div className="text-green-600">{config.selectedConsecutivePatterns.length} sélectionné(s)</div>
                                </button>
                                
                                <button
                                  onClick={() => setOpenPatternModal('dizaine')}
                                  className="p-2 text-xs bg-white border border-green-300 rounded hover:bg-green-100 transition-colors"
                                >
                                  <div className="font-medium text-green-800">Dizaines</div>
                                  <div className="text-green-600">{config.selectedDizainePatterns.length} sélectionné(s)</div>
                                </button>
                                
                                <button
                                  onClick={() => setOpenPatternModal('somme')}
                                  className="p-2 text-xs bg-white border border-green-300 rounded hover:bg-green-100 transition-colors"
                                >
                                  <div className="font-medium text-green-800">Somme</div>
                                  <div className="text-green-600">{config.selectedSommePatterns.length} sélectionné(s)</div>
                                </button>
                                
                                <button
                                  onClick={() => setOpenPatternModal('zone')}
                                  className="p-2 text-xs bg-white border border-green-300 rounded hover:bg-green-100 transition-colors"
                                >
                                  <div className="font-medium text-green-800">Zones</div>
                                  <div className="text-green-600">{config.selectedZonePatterns.length} sélectionné(s)</div>
                                </button>
                                
                                <button
                                  onClick={() => setOpenPatternModal('unites')}
                                  className="p-2 text-xs bg-white border border-green-300 rounded hover:bg-green-100 transition-colors"
                                >
                                  <div className="font-medium text-green-800">Unités</div>
                                  <div className="text-green-600">{config.selectedUnitesPatterns.length} sélectionné(s)</div>
                                </button>
                              </div>
                              
                              {/* Affichage détaillé des patterns sélectionnés */}
                              {(config.selectedParityPatterns.length > 0 || 
                                config.selectedConsecutivePatterns.length > 0 || 
                                config.selectedDizainePatterns.length > 0 || 
                                config.selectedSommePatterns.length > 0 || 
                                config.selectedZonePatterns.length > 0 || 
                                config.selectedUnitesPatterns.length > 0) && (
                                <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded">
                                  <div className="text-xs text-green-700 mb-2 font-medium">Patterns sélectionnés :</div>
                                  <div className="space-y-2">
                                    {config.selectedParityPatterns.length > 0 && (
                                      <div>
                                        <div className="text-xs text-green-700 font-medium mb-1">Parité ({config.selectedParityPatterns.length}) :</div>
                                        <div className="flex flex-wrap gap-1">
                                          {config.selectedParityPatterns.map((pattern) => {
                                            const patternInfo = availablePatterns.parity.find(p => p.pattern === pattern);
                                            return (
                                              <span
                                                key={pattern}
                                                className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full border border-green-400"
                                                title={patternInfo?.description}
                                              >
                                                {patternInfo?.description || pattern}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                    {config.selectedConsecutivePatterns.length > 0 && (
                                      <div>
                                        <div className="text-xs text-green-700 font-medium mb-1">Consécutifs ({config.selectedConsecutivePatterns.length}) :</div>
                                        <div className="flex flex-wrap gap-1">
                                          {config.selectedConsecutivePatterns.map((pattern) => {
                                            const patternInfo = availablePatterns.consecutive.find(p => p.pattern === pattern);
                                            return (
                                              <span
                                                key={pattern}
                                                className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full border border-green-400"
                                                title={patternInfo?.description}
                                              >
                                                {patternInfo?.description || pattern}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                    {config.selectedDizainePatterns.length > 0 && (
                                      <div>
                                        <div className="text-xs text-green-700 font-medium mb-1">Dizaines ({config.selectedDizainePatterns.length}) :</div>
                                        <div className="flex flex-wrap gap-1">
                                          {config.selectedDizainePatterns.map((pattern) => {
                                            const patternInfo = availablePatterns.dizaine.find(p => p.pattern === pattern);
                                            return (
                                              <span
                                                key={pattern}
                                                className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full border border-green-400"
                                                title={patternInfo?.description}
                                              >
                                                {patternInfo?.description || pattern}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                    {config.selectedSommePatterns.length > 0 && (
                                      <div>
                                        <div className="text-xs text-green-700 font-medium mb-1">Somme ({config.selectedSommePatterns.length}) :</div>
                                        <div className="flex flex-wrap gap-1">
                                          {config.selectedSommePatterns.map((pattern) => {
                                            const patternInfo = availablePatterns.somme.find(p => p.pattern === pattern);
                                            return (
                                              <span
                                                key={pattern}
                                                className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full border border-green-400"
                                                title={patternInfo?.description}
                                              >
                                                {patternInfo?.description || pattern}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                    {config.selectedZonePatterns.length > 0 && (
                                      <div>
                                        <div className="text-xs text-green-700 font-medium mb-1">Zones ({config.selectedZonePatterns.length}) :</div>
                                        <div className="flex flex-wrap gap-1">
                                          {config.selectedZonePatterns.map((pattern) => {
                                            const patternInfo = availablePatterns.zone.find(p => p.pattern === pattern);
                                            return (
                                              <span
                                                key={pattern}
                                                className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full border border-green-400"
                                                title={patternInfo?.description}
                                              >
                                                {patternInfo?.description || pattern}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                    {config.selectedUnitesPatterns.length > 0 && (
                                      <div>
                                        <div className="text-xs text-green-700 font-medium mb-1">Unités ({config.selectedUnitesPatterns.length}) :</div>
                                        <div className="flex flex-wrap gap-1">
                                          {config.selectedUnitesPatterns.map((pattern) => {
                                            const patternInfo = availablePatterns.unites.find(p => p.pattern === pattern);
                                            return (
                                              <span
                                                key={pattern}
                                                className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full border border-green-400"
                                                title={patternInfo?.description}
                                              >
                                                {patternInfo?.description || pattern}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Sélection des patterns temporels directement dans la carte Patterns Temporels */}
                        {strategy.id === 'includeTemporalPatterns' && (isEnabled || 
                          config.selectedTemporalPatterns && config.selectedTemporalPatterns.length > 0) && (
                          <div className="mt-3">
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <div className="text-sm font-medium text-orange-800 mb-3">⏰ Sélection des Patterns Temporels :</div>
                              
                              {/* Boutons pour chaque type de pattern temporel */}
                              <div className="grid grid-cols-2 gap-2 mb-3">
                                <button
                                  onClick={() => setOpenPatternModal('temporal')}
                                  className="p-2 text-xs bg-white border border-orange-300 rounded hover:bg-orange-100 transition-colors"
                                >
                                  <div className="font-medium text-orange-800">Tendances</div>
                                  <div className="text-orange-600">
                                    {config.selectedTemporalPatterns ? config.selectedTemporalPatterns.length : 0} sélectionné(s)
                                  </div>
                                </button>
                                
                                <button
                                  onClick={() => setOpenPatternModal('seasonal')}
                                  className="p-2 text-xs bg-white border border-orange-300 rounded hover:bg-orange-100 transition-colors"
                                >
                                  <div className="font-medium text-orange-800">Saisonniers</div>
                                  <div className="text-orange-600">
                                    {config.selectedSeasonalPatterns ? config.selectedSeasonalPatterns.length : 0} sélectionné(s)
                                  </div>
                                </button>
                                
                                <button
                                  onClick={() => setOpenPatternModal('cyclical')}
                                  className="p-2 text-xs bg-white border border-orange-300 rounded hover:bg-orange-100 transition-colors"
                                >
                                  <div className="font-medium text-orange-800">Cycliques</div>
                                  <div className="text-orange-600">
                                    {config.selectedCyclicalPatterns ? config.selectedCyclicalPatterns.length : 0} sélectionné(s)
                                  </div>
                                </button>
                                
                                <button
                                  onClick={() => setOpenPatternModal('recent')}
                                  className="p-2 text-xs bg-white border border-orange-300 rounded hover:bg-orange-100 transition-colors"
                                >
                                  <div className="font-medium text-orange-800">Récents</div>
                                  <div className="text-orange-600">
                                    {config.selectedRecentPatterns ? config.selectedRecentPatterns.length : 0} sélectionné(s)
                                  </div>
                                </button>
                              </div>
                              
                              {/* Affichage détaillé des patterns temporels sélectionnés */}
                              {((config.selectedTemporalPatterns && config.selectedTemporalPatterns.length > 0) || 
                                (config.selectedSeasonalPatterns && config.selectedSeasonalPatterns.length > 0) || 
                                (config.selectedCyclicalPatterns && config.selectedCyclicalPatterns.length > 0) || 
                                (config.selectedRecentPatterns && config.selectedRecentPatterns.length > 0)) && (
                                <div className="mt-2 p-2 bg-orange-100 border border-orange-300 rounded">
                                  <div className="text-xs text-orange-700 mb-2 font-medium">Patterns temporels sélectionnés :</div>
                                  <div className="space-y-2">
                                    {config.selectedTemporalPatterns && config.selectedTemporalPatterns.length > 0 && (
                                      <div>
                                        <div className="text-xs text-orange-700 font-medium mb-1">Tendances ({config.selectedTemporalPatterns.length}) :</div>
                                        <div className="flex flex-wrap gap-1">
                                          {config.selectedTemporalPatterns.map((pattern) => (
                                            <span
                                              key={pattern}
                                              className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full border border-orange-400"
                                            >
                                              {pattern}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {config.selectedSeasonalPatterns && config.selectedSeasonalPatterns.length > 0 && (
                                      <div>
                                        <div className="text-xs text-orange-700 font-medium mb-1">Saisonniers ({config.selectedSeasonalPatterns.length}) :</div>
                                        <div className="flex flex-wrap gap-1">
                                          {config.selectedSeasonalPatterns.map((pattern) => (
                                            <span
                                              key={pattern}
                                              className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full border border-orange-400"
                                            >
                                              {pattern}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {config.selectedCyclicalPatterns && config.selectedCyclicalPatterns.length > 0 && (
                                      <div>
                                        <div className="text-xs text-orange-700 font-medium mb-1">Cycliques ({config.selectedCyclicalPatterns.length}) :</div>
                                        <div className="flex flex-wrap gap-1">
                                          {config.selectedCyclicalPatterns.map((pattern) => (
                                            <span
                                              key={pattern}
                                              className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full border border-orange-400"
                                            >
                                              {pattern}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {config.selectedRecentPatterns && config.selectedRecentPatterns.length > 0 && (
                                      <div>
                                        <div className="text-xs text-orange-700 font-medium mb-1">Récents ({config.selectedRecentPatterns.length}) :</div>
                                        <div className="flex flex-wrap gap-1">
                                          {config.selectedRecentPatterns.map((pattern) => (
                                            <span
                                              key={pattern}
                                              className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full border border-orange-400"
                                            >
                                              {pattern}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}


            {/* Contraintes spécifiques */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-600" />
                Contraintes Spécifiques
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Contraintes de somme */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Somme des numéros</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Somme minimum</label>
                      <input
                        type="number"
                        min="15"
                        max="200"
                        value={config.minSum}
                        onChange={(e) => setConfig(prev => ({ ...prev, minSum: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Somme maximum</label>
                      <input
                        type="number"
                        min="15"
                        max="200"
                        value={config.maxSum}
                        onChange={(e) => setConfig(prev => ({ ...prev, maxSum: parseInt(e.target.value) || 200 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Contraintes de dizaines */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Nombre de dizaines</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Minimum</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={config.minDizaines}
                        onChange={(e) => setConfig(prev => ({ ...prev, minDizaines: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Maximum</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={config.maxDizaines}
                        onChange={(e) => setConfig(prev => ({ ...prev, maxDizaines: parseInt(e.target.value) || 5 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Contrôle des consécutifs */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Numéros consécutifs</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={config.consecutiveMode === 'disabled'}
                          onChange={(e) => setConfig(prev => ({ 
                            ...prev, 
                            consecutiveMode: e.target.checked ? 'disabled' : 'none' 
                          }))}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Désactiver le contrôle</span>
                      </label>
                    </div>
                    
                    {config.consecutiveMode !== 'disabled' && (
                      <>
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">Mode</label>
                          <select
                            value={config.consecutiveMode}
                            onChange={(e) => setConfig(prev => ({ 
                              ...prev, 
                              consecutiveMode: e.target.value as 'none' | 'optional' | 'required' 
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="none">Aucun consécutif</option>
                            <option value="optional">Consécutifs optionnels</option>
                            <option value="required">Consécutifs obligatoires</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Maximum de consécutifs</label>
                          <input
                            type="number"
                            min="1"
                            max="4"
                            value={config.maxConsecutive}
                            onChange={(e) => setConfig(prev => ({ ...prev, maxConsecutive: parseInt(e.target.value) || 1 }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bouton de génération */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <button
                onClick={generateCombinations}
                disabled={isLoading || activeStrategiesCount === 0}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center gap-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6" />
                    Générer les Combinaisons
                  </>
                )}
              </button>
            </motion.div>
          </div>

          {/* Résultats */}
          <div className="space-y-6">
            {combinations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Combinaisons générées ({combinations.length})
                </h2>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {combinations.map((combo, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-1">
                          {combo.numbers.map((num, i) => (
                            <span key={i} className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {num}
                            </span>
                          ))}
                          <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {combo.complementary}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            Score: {combo.score.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-600">
                            Confiance: {(combo.confidence * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        {combo.reasons.join(' • ')}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Modale de sélection des numéros chauds */}
      <AnimatePresence>
        {openHotNumbersModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setOpenHotNumbersModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header de la modale */}
              <div className="p-6 border-b border-gray-200 bg-red-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">🔥</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Numéros Chauds</h2>
                      <p className="text-sm text-gray-600">Les 20 numéros les plus fréquents</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpenHotNumbersModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Contenu de la modale */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {/* Boutons d'action */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setSelectedHotNumbers(hotColdNumbers?.hot || [])}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    onClick={() => setSelectedHotNumbers([])}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Tout désélectionner
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-3">
                  {hotColdNumbers?.hot.map((number) => (
                    <label key={number} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-red-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedHotNumbers.includes(number)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedHotNumbers(prev => [...prev, number]);
                          } else {
                            setSelectedHotNumbers(prev => prev.filter(n => n !== number));
                          }
                        }}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="font-medium text-gray-900">{number}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Footer de la modale */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {selectedHotNumbers.length} numéro(s) sélectionné(s)
                  </div>
                  <button
                    onClick={() => setOpenHotNumbersModal(false)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modale de sélection des numéros froids */}
      <AnimatePresence>
        {openColdNumbersModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setOpenColdNumbersModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header de la modale */}
              <div className="p-6 border-b border-gray-200 bg-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">❄️</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Numéros Froids</h2>
                      <p className="text-sm text-gray-600">Les 20 numéros les moins fréquents</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpenColdNumbersModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Contenu de la modale */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {/* Boutons d'action */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setSelectedColdNumbers(hotColdNumbers?.cold || [])}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    onClick={() => setSelectedColdNumbers([])}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Tout désélectionner
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-3">
                  {hotColdNumbers?.cold.map((number) => (
                    <label key={number} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedColdNumbers.includes(number)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedColdNumbers(prev => [...prev, number]);
                          } else {
                            setSelectedColdNumbers(prev => prev.filter(n => n !== number));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="font-medium text-gray-900">{number}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Footer de la modale */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {selectedColdNumbers.length} numéro(s) sélectionné(s)
                  </div>
                  <button
                    onClick={() => setOpenColdNumbersModal(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modale de sélection des patterns */}
      <AnimatePresence>
        {openPatternModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setOpenPatternModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header de la modale */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {openPatternModal === 'parity' && 'Patterns de Parité'}
                    {openPatternModal === 'consecutive' && 'Patterns Consécutifs'}
                    {openPatternModal === 'dizaine' && 'Patterns de Dizaines'}
                    {openPatternModal === 'somme' && 'Patterns de Somme'}
                    {openPatternModal === 'zone' && 'Patterns de Zones'}
                    {openPatternModal === 'unites' && 'Patterns d\'Unités'}
                    {openPatternModal === 'temporal' && 'Patterns Temporels - Tendances'}
                    {openPatternModal === 'seasonal' && 'Patterns Temporels - Saisonniers'}
                    {openPatternModal === 'cyclical' && 'Patterns Temporels - Cycliques'}
                    {openPatternModal === 'recent' && 'Patterns Temporels - Récents'}
                  </h2>
                  <button
                    onClick={() => setOpenPatternModal(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Sélectionnez les patterns que vous souhaitez utiliser pour la génération de combinaisons.
                </p>
              </div>

              {/* Contenu de la modale */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {/* Boutons d'action */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => {
                      // Sélectionner tous les patterns du type actuel
                      if (openPatternModal === 'parity') {
                        setConfig(prev => ({
                          ...prev,
                          selectedParityPatterns: availablePatterns.parity.map(p => p.pattern)
                        }));
                      } else if (openPatternModal === 'consecutive') {
                        setConfig(prev => ({
                          ...prev,
                          selectedConsecutivePatterns: availablePatterns.consecutive.map(p => p.pattern)
                        }));
                      } else if (openPatternModal === 'dizaine') {
                        setConfig(prev => ({
                          ...prev,
                          selectedDizainePatterns: availablePatterns.dizaine.map(p => p.pattern)
                        }));
                      } else if (openPatternModal === 'somme') {
                        setConfig(prev => ({
                          ...prev,
                          selectedSommePatterns: availablePatterns.somme.map(p => p.pattern)
                        }));
                      } else if (openPatternModal === 'zone') {
                        setConfig(prev => ({
                          ...prev,
                          selectedZonePatterns: availablePatterns.zone.map(p => p.pattern)
                        }));
                      } else if (openPatternModal === 'unites') {
                        setConfig(prev => ({
                          ...prev,
                          selectedUnitesPatterns: availablePatterns.unites.map(p => p.pattern)
                        }));
                      } else if (openPatternModal === 'temporal') {
                        setConfig(prev => ({
                          ...prev,
                          selectedTemporalPatterns: availablePatterns.temporal ? availablePatterns.temporal.map(p => p.pattern) : []
                        }));
                      } else if (openPatternModal === 'seasonal') {
                        setConfig(prev => ({
                          ...prev,
                          selectedSeasonalPatterns: availablePatterns.seasonal ? availablePatterns.seasonal.map(p => p.pattern) : []
                        }));
                      } else if (openPatternModal === 'cyclical') {
                        setConfig(prev => ({
                          ...prev,
                          selectedCyclicalPatterns: availablePatterns.cyclical ? availablePatterns.cyclical.map(p => p.pattern) : []
                        }));
                      } else if (openPatternModal === 'recent') {
                        setConfig(prev => ({
                          ...prev,
                          selectedRecentPatterns: availablePatterns.recent ? availablePatterns.recent.map(p => p.pattern) : []
                        }));
                      }
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    onClick={() => {
                      // Désélectionner tous les patterns du type actuel
                      if (openPatternModal === 'parity') {
                        setConfig(prev => ({ ...prev, selectedParityPatterns: [] }));
                      } else if (openPatternModal === 'consecutive') {
                        setConfig(prev => ({ ...prev, selectedConsecutivePatterns: [] }));
                      } else if (openPatternModal === 'dizaine') {
                        setConfig(prev => ({ ...prev, selectedDizainePatterns: [] }));
                      } else if (openPatternModal === 'somme') {
                        setConfig(prev => ({ ...prev, selectedSommePatterns: [] }));
                      } else if (openPatternModal === 'zone') {
                        setConfig(prev => ({ ...prev, selectedZonePatterns: [] }));
                      } else if (openPatternModal === 'unites') {
                        setConfig(prev => ({ ...prev, selectedUnitesPatterns: [] }));
                      } else if (openPatternModal === 'temporal') {
                        setConfig(prev => ({ ...prev, selectedTemporalPatterns: [] }));
                      } else if (openPatternModal === 'seasonal') {
                        setConfig(prev => ({ ...prev, selectedSeasonalPatterns: [] }));
                      } else if (openPatternModal === 'cyclical') {
                        setConfig(prev => ({ ...prev, selectedCyclicalPatterns: [] }));
                      } else if (openPatternModal === 'recent') {
                        setConfig(prev => ({ ...prev, selectedRecentPatterns: [] }));
                      }
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Tout désélectionner
                  </button>
                </div>

                <div className="space-y-3">
                  {openPatternModal === 'parity' && availablePatterns.parity.map((patternInfo) => (
                    <label key={patternInfo.pattern} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.selectedParityPatterns.includes(patternInfo.pattern)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig(prev => ({
                              ...prev,
                              selectedParityPatterns: [...prev.selectedParityPatterns, patternInfo.pattern]
                            }));
                          } else {
                            setConfig(prev => ({
                              ...prev,
                              selectedParityPatterns: prev.selectedParityPatterns.filter(p => p !== patternInfo.pattern)
                            }));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{patternInfo.description}</div>
                        <div className="text-xs text-gray-600">
                          {formatFrequency(patternInfo.percentage)} • {patternInfo.count} fois observé
                        </div>
                      </div>
                    </label>
                  ))}

                  {openPatternModal === 'consecutive' && availablePatterns.consecutive.map((patternInfo) => (
                    <label key={patternInfo.pattern} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.selectedConsecutivePatterns.includes(patternInfo.pattern)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig(prev => ({
                              ...prev,
                              selectedConsecutivePatterns: [...prev.selectedConsecutivePatterns, patternInfo.pattern]
                            }));
                          } else {
                            setConfig(prev => ({
                              ...prev,
                              selectedConsecutivePatterns: prev.selectedConsecutivePatterns.filter(p => p !== patternInfo.pattern)
                            }));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{patternInfo.description}</div>
                        <div className="text-xs text-gray-600">
                          {formatFrequency(patternInfo.percentage)} • {patternInfo.count} fois observé
                        </div>
                      </div>
                    </label>
                  ))}

                  {openPatternModal === 'dizaine' && availablePatterns.dizaine.map((patternInfo) => (
                    <label key={patternInfo.pattern} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.selectedDizainePatterns.includes(patternInfo.pattern)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig(prev => ({
                              ...prev,
                              selectedDizainePatterns: [...prev.selectedDizainePatterns, patternInfo.pattern]
                            }));
                          } else {
                            setConfig(prev => ({
                              ...prev,
                              selectedDizainePatterns: prev.selectedDizainePatterns.filter(p => p !== patternInfo.pattern)
                            }));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{patternInfo.description}</div>
                        <div className="text-xs text-gray-600">
                          {formatFrequency(patternInfo.percentage)} • {patternInfo.count} fois observé
                        </div>
                      </div>
                    </label>
                  ))}

                  {openPatternModal === 'somme' && availablePatterns.somme.map((patternInfo) => (
                    <label key={patternInfo.pattern} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.selectedSommePatterns.includes(patternInfo.pattern)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig(prev => ({
                              ...prev,
                              selectedSommePatterns: [...prev.selectedSommePatterns, patternInfo.pattern]
                            }));
                          } else {
                            setConfig(prev => ({
                              ...prev,
                              selectedSommePatterns: prev.selectedSommePatterns.filter(p => p !== patternInfo.pattern)
                            }));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{patternInfo.description}</div>
                        <div className="text-xs text-gray-600">
                          {formatFrequency(patternInfo.percentage)} • {patternInfo.count} fois observé
                        </div>
                      </div>
                    </label>
                  ))}

                  {openPatternModal === 'zone' && availablePatterns.zone.map((patternInfo) => (
                    <label key={patternInfo.pattern} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.selectedZonePatterns.includes(patternInfo.pattern)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig(prev => ({
                              ...prev,
                              selectedZonePatterns: [...prev.selectedZonePatterns, patternInfo.pattern]
                            }));
                          } else {
                            setConfig(prev => ({
                              ...prev,
                              selectedZonePatterns: prev.selectedZonePatterns.filter(p => p !== patternInfo.pattern)
                            }));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{patternInfo.description}</div>
                        <div className="text-xs text-gray-600">
                          {formatFrequency(patternInfo.percentage)} • {patternInfo.count} fois observé
                        </div>
                      </div>
                    </label>
                  ))}

                  {openPatternModal === 'unites' && availablePatterns.unites.map((patternInfo) => (
                    <label key={patternInfo.pattern} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.selectedUnitesPatterns.includes(patternInfo.pattern)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig(prev => ({
                              ...prev,
                              selectedUnitesPatterns: [...prev.selectedUnitesPatterns, patternInfo.pattern]
                            }));
                          } else {
                            setConfig(prev => ({
                              ...prev,
                              selectedUnitesPatterns: prev.selectedUnitesPatterns.filter(p => p !== patternInfo.pattern)
                            }));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{patternInfo.description}</div>
                        <div className="text-xs text-gray-600">
                          {formatFrequency(patternInfo.percentage)} • {patternInfo.count} fois observé
                        </div>
                      </div>
                    </label>
                  ))}

                  {openPatternModal === 'temporal' && availablePatterns.temporal && availablePatterns.temporal.map((patternInfo) => (
                    <label key={patternInfo.pattern} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.selectedTemporalPatterns.includes(patternInfo.pattern)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig(prev => ({
                              ...prev,
                              selectedTemporalPatterns: [...prev.selectedTemporalPatterns, patternInfo.pattern]
                            }));
                          } else {
                            setConfig(prev => ({
                              ...prev,
                              selectedTemporalPatterns: prev.selectedTemporalPatterns.filter(p => p !== patternInfo.pattern)
                            }));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{patternInfo.description}</div>
                        <div className="text-xs text-gray-600">
                          {formatFrequency(patternInfo.percentage)} • {patternInfo.count} fois observé
                        </div>
                      </div>
                    </label>
                  ))}

                  {openPatternModal === 'seasonal' && availablePatterns.seasonal && availablePatterns.seasonal.map((patternInfo) => (
                    <label key={patternInfo.pattern} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.selectedSeasonalPatterns.includes(patternInfo.pattern)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig(prev => ({
                              ...prev,
                              selectedSeasonalPatterns: [...prev.selectedSeasonalPatterns, patternInfo.pattern]
                            }));
                          } else {
                            setConfig(prev => ({
                              ...prev,
                              selectedSeasonalPatterns: prev.selectedSeasonalPatterns.filter(p => p !== patternInfo.pattern)
                            }));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{patternInfo.description}</div>
                        <div className="text-xs text-gray-600">
                          {formatFrequency(patternInfo.percentage)} • {patternInfo.count} fois observé
                        </div>
                      </div>
                    </label>
                  ))}

                  {openPatternModal === 'cyclical' && availablePatterns.cyclical && availablePatterns.cyclical.map((patternInfo) => (
                    <label key={patternInfo.pattern} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.selectedCyclicalPatterns.includes(patternInfo.pattern)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig(prev => ({
                              ...prev,
                              selectedCyclicalPatterns: [...prev.selectedCyclicalPatterns, patternInfo.pattern]
                            }));
                          } else {
                            setConfig(prev => ({
                              ...prev,
                              selectedCyclicalPatterns: prev.selectedCyclicalPatterns.filter(p => p !== patternInfo.pattern)
                            }));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{patternInfo.description}</div>
                        <div className="text-xs text-gray-600">
                          {formatFrequency(patternInfo.percentage)} • {patternInfo.count} fois observé
                        </div>
                      </div>
                    </label>
                  ))}

                  {openPatternModal === 'recent' && availablePatterns.recent && availablePatterns.recent.map((patternInfo) => (
                    <label key={patternInfo.pattern} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.selectedRecentPatterns.includes(patternInfo.pattern)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig(prev => ({
                              ...prev,
                              selectedRecentPatterns: [...prev.selectedRecentPatterns, patternInfo.pattern]
                            }));
                          } else {
                            setConfig(prev => ({
                              ...prev,
                              selectedRecentPatterns: prev.selectedRecentPatterns.filter(p => p !== patternInfo.pattern)
                            }));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{patternInfo.description}</div>
                        <div className="text-xs text-gray-600">
                          {formatFrequency(patternInfo.percentage)} • {patternInfo.count} fois observé
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Footer de la modale */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {openPatternModal === 'parity' && `${config.selectedParityPatterns.length} pattern(s) sélectionné(s)`}
                    {openPatternModal === 'consecutive' && `${config.selectedConsecutivePatterns.length} pattern(s) sélectionné(s)`}
                    {openPatternModal === 'dizaine' && `${config.selectedDizainePatterns.length} pattern(s) sélectionné(s)`}
                    {openPatternModal === 'somme' && `${config.selectedSommePatterns.length} pattern(s) sélectionné(s)`}
                    {openPatternModal === 'zone' && `${config.selectedZonePatterns.length} pattern(s) sélectionné(s)`}
                    {openPatternModal === 'unites' && `${config.selectedUnitesPatterns.length} pattern(s) sélectionné(s)`}
                    {openPatternModal === 'temporal' && `${config.selectedTemporalPatterns.length} pattern(s) sélectionné(s)`}
                    {openPatternModal === 'seasonal' && `${config.selectedSeasonalPatterns.length} pattern(s) sélectionné(s)`}
                    {openPatternModal === 'cyclical' && `${config.selectedCyclicalPatterns.length} pattern(s) sélectionné(s)`}
                    {openPatternModal === 'recent' && `${config.selectedRecentPatterns.length} pattern(s) sélectionné(s)`}
                  </div>
                  <button
                    onClick={() => setOpenPatternModal(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
