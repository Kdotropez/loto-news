'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Save, 
  Download, 
  Info, 
  Settings, 
  Target,
  Zap,
  Brain,
  Calculator,
  Shield,
  Star,
  TrendingUp,
  Layers,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { UnifiedCombination } from '@/lib/combination-hub';
import StrategyDetailsModal from './StrategyDetailsModal';

interface GenerationConfig {
  // Configuration de base
  count: number;
  
  // Stratégies de génération
  includeHotNumbers: boolean;
  includeColdNumbers: boolean;
  includePatterns: boolean;
  includeMathematical: boolean;
  includeRules: boolean;
  includeAdvanced: boolean;
  
  // Options avancées
  includePatternOptimization: boolean;
  includeOptimizedCombinations: boolean;
  
  // Type de grille
  gridType: 'simple' | 'multiple';
  multipleGridSize: 7 | 8 | 9;
  
  // Sélection de patterns spécifiques
  selectedParityPatterns: string[];
  selectedConsecutivePatterns: string[];
  selectedDizainePatterns: string[];
  selectedSommePatterns: string[];
  selectedZonePatterns: string[];
  selectedUnitesPatterns: string[];
  
  // Contraintes spécifiques
  minSum: number;
  maxSum: number;
  minDizaines: number;
  maxDizaines: number;
  consecutiveMode: 'none' | 'optional' | 'required' | 'disabled';
  maxConsecutive: number;
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
}

export default function UnifiedCombinationGenerator() {
  const [combinations, setCombinations] = useState<UnifiedCombination[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<UnifiedCombination | null>(null);
  const [availablePatterns, setAvailablePatterns] = useState<AvailablePatterns>({
    parity: [],
    consecutive: [],
    dizaine: [],
    somme: [],
    zone: [],
    unites: []
  });
  const [hotColdNumbers, setHotColdNumbers] = useState<{hot: number[], cold: number[]} | null>(null);
  
  const [config, setConfig] = useState<GenerationConfig>({
    count: 10,
    includeHotNumbers: true,
    includeColdNumbers: true,
    includePatterns: true,
    includeMathematical: true,
    includeRules: true,
    includeAdvanced: true,
    includePatternOptimization: false,
    includeOptimizedCombinations: false,
    gridType: 'simple',
    multipleGridSize: 7,
    selectedParityPatterns: [],
    selectedConsecutivePatterns: [],
    selectedDizainePatterns: [],
    selectedSommePatterns: [],
    selectedZonePatterns: [],
    selectedUnitesPatterns: [],
    minSum: 0,
    maxSum: 200,
    minDizaines: 1,
    maxDizaines: 5,
    consecutiveMode: 'disabled',
    maxConsecutive: 1
  });

  // Charger les patterns disponibles au montage
  useEffect(() => {
    const loadAvailablePatterns = async () => {
      try {
        const response = await fetch('/api/pattern-optimization');
        const result = await response.json();
        if (result.success && result.patterns) {
          setAvailablePatterns(result.patterns);
        } else {
          console.warn('Patterns non disponibles, utilisation des patterns par défaut');
          // Patterns par défaut si l'API ne fonctionne pas
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
              { pattern: 'DIZ1', count: 300, percentage: 2.4, description: '1 dizaine différente' }
            ],
            somme: [
              { pattern: 'SOMME_OPTIMALE', count: 7500, percentage: 61.1, description: 'Somme optimale (100-150)' },
              { pattern: 'SOMME_ELEVEE', count: 3200, percentage: 26.1, description: 'Somme élevée (> 150)' },
              { pattern: 'SOMME_FAIBLE', count: 1569, percentage: 12.8, description: 'Somme faible (< 100)' }
            ],
            zone: [
              { pattern: 'ZONE_1-1-1-1-1', count: 2500, percentage: 20.4, description: 'Répartition équilibrée' },
              { pattern: 'ZONE_2-1-1-1-0', count: 1800, percentage: 14.7, description: '2-1-1-1-0' },
              { pattern: 'ZONE_1-2-1-1-0', count: 1600, percentage: 13.0, description: '1-2-1-1-0' }
            ],
            unites: [
              { pattern: 'UNIT_1_SIMILAIRES_4_DIFFERENTES', count: 5931, percentage: 48.34, description: '1 similaire, 4 différentes' },
              { pattern: 'UNIT_5_DIFFERENTES', count: 4653, percentage: 37.92, description: '5 unités différentes' },
              { pattern: 'UNIT_2_SIMILAIRES_3_DIFFERENTES', count: 1071, percentage: 8.73, description: '2 similaires, 3 différentes' },
              { pattern: 'UNIT_3_SIMILAIRES_2_DIFFERENTES', count: 450, percentage: 3.67, description: '3 similaires, 2 différentes' },
              { pattern: 'UNIT_4_SIMILAIRES_1_DIFFERENTE', count: 95, percentage: 0.77, description: '4 similaires, 1 différente' }
            ]
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des patterns:', error);
        // Patterns par défaut en cas d'erreur
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
            { pattern: 'DIZ1', count: 300, percentage: 2.4, description: '1 dizaine différente' }
          ],
          somme: [
            { pattern: 'SOMME_OPTIMALE', count: 7500, percentage: 61.1, description: 'Somme optimale (100-150)' },
            { pattern: 'SOMME_ELEVEE', count: 3200, percentage: 26.1, description: 'Somme élevée (> 150)' },
            { pattern: 'SOMME_FAIBLE', count: 1569, percentage: 12.8, description: 'Somme faible (< 100)' }
          ],
          zone: [
            { pattern: 'ZONE_1-1-1-1-1', count: 2500, percentage: 20.4, description: 'Répartition équilibrée' },
            { pattern: 'ZONE_2-1-1-1-0', count: 1800, percentage: 14.7, description: '2-1-1-1-0' },
            { pattern: 'ZONE_1-2-1-1-0', count: 1600, percentage: 13.0, description: '1-2-1-1-0' }
          ],
          unites: [
            { pattern: 'UNIT_1_SIMILAIRES_4_DIFFERENTES', count: 5931, percentage: 48.34, description: '1 similaire, 4 différentes' },
            { pattern: 'UNIT_5_DIFFERENTES', count: 4653, percentage: 37.92, description: '5 unités différentes' },
            { pattern: 'UNIT_2_SIMILAIRES_3_DIFFERENTES', count: 1071, percentage: 8.73, description: '2 similaires, 3 différentes' },
            { pattern: 'UNIT_3_SIMILAIRES_2_DIFFERENTES', count: 450, percentage: 3.67, description: '3 similaires, 2 différentes' },
            { pattern: 'UNIT_4_SIMILAIRES_1_DIFFERENTE', count: 95, percentage: 0.77, description: '4 similaires, 1 différente' }
          ]
        });
      }
    };

    loadAvailablePatterns();
  }, []);

  // Charger les numéros chauds et froids
  useEffect(() => {
    const loadHotColdNumbers = async () => {
      try {
        const response = await fetch('/api/analysis?type=frequency');
        if (response.ok) {
          const data = await response.json();
          console.log('Données reçues de l\'API:', data);
          const frequencies = data.data?.frequencies || data.frequencies || data;
          console.log('Fréquences extraites:', frequencies);
          
          if (frequencies && frequencies.length > 0) {
            // Trier par fréquence et prendre les 20 premiers (chauds) et 20 derniers (froids)
            const sortedFrequencies = frequencies.sort((a: any, b: any) => b.frequency - a.frequency);
            const hotNumbers = sortedFrequencies.slice(0, 20).map((item: any) => item.numero);
            const coldNumbers = sortedFrequencies.slice(-20).map((item: any) => item.numero);
            
            console.log('Numéros chauds:', hotNumbers);
            console.log('Numéros froids:', coldNumbers);
            setHotColdNumbers({ hot: hotNumbers, cold: coldNumbers });
          } else {
            console.log('Aucune fréquence trouvée');
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des numéros chauds/froids:', error);
      }
    };

    loadHotColdNumbers();
  }, []);

  // Fonction pour calculer le nombre de numéros consécutifs
  const getConsecutiveCount = (numbers: number[]): number => {
    const sorted = [...numbers].sort((a, b) => a - b);
    let consecutiveCount = 0;
    
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] - sorted[i] === 1) {
        consecutiveCount++;
      }
    }
    
    return consecutiveCount;
  };

  // Fonction pour convertir un pourcentage en format "1 fois sur X"
  const formatFrequency = (percentage: number): string => {
    if (percentage >= 50) return "Très fréquent";
    if (percentage >= 25) return "Fréquent";
    if (percentage >= 10) return "Occasionnel";
    if (percentage >= 5) return "Rare";
    if (percentage >= 1) return "Très rare";
    
    // Calculer "1 fois sur X"
    const ratio = Math.round(100 / percentage);
    if (ratio <= 2) return "1 fois sur 2";
    if (ratio <= 5) return `1 fois sur ${ratio}`;
    if (ratio <= 10) return `1 fois sur ${ratio}`;
    if (ratio <= 20) return `1 fois sur ${ratio}`;
    return `1 fois sur ${ratio}`;
  };

  // Fonction pour évaluer la qualité de la somme
  const getSumQuality = (sum: number): { label: string; color: string } => {
    if (sum >= config.minSum && sum <= config.maxSum) {
      return { label: 'Optimale', color: 'text-green-600' };
    } else if (sum >= config.minSum - 20 && sum <= config.maxSum + 20) {
      return { label: 'Acceptable', color: 'text-yellow-600' };
    } else {
      return { label: 'Faible', color: 'text-red-600' };
    }
  };

  // Fonction pour évaluer la qualité des dizaines
  const getDizaineQuality = (dizaineCount: number): { label: string; color: string } => {
    if (dizaineCount >= config.minDizaines && dizaineCount <= config.maxDizaines) {
      return { label: 'Bonne', color: 'text-green-600' };
    } else if (dizaineCount >= config.minDizaines - 1 && dizaineCount <= config.maxDizaines + 1) {
      return { label: 'Moyenne', color: 'text-yellow-600' };
    } else {
      return { label: 'Faible', color: 'text-red-600' };
    }
  };

  // Calcul du nombre total de patterns sélectionnés (pour l'affichage)
  const totalSelectedPatterns = 
    config.selectedParityPatterns.length +
    config.selectedDizainePatterns.length +
    config.selectedSommePatterns.length +
    config.selectedUnitesPatterns.length +
    config.selectedZonePatterns.length +
    config.selectedConsecutivePatterns.length;

  // Validation des contraintes contradictoires
  const validateConstraints = () => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Vérifier les contraintes de somme
    if (config.minSum > config.maxSum) {
      errors.push("La somme minimum ne peut pas être supérieure à la somme maximum");
    }

    // 2. Vérifier les contraintes de dizaines
    if (config.minDizaines > config.maxDizaines) {
      errors.push("Le nombre minimum de dizaines ne peut pas être supérieur au maximum");
    }

    // 3. Vérifier les patterns de parité contradictoires
    if (config.selectedParityPatterns.includes('3P-2I') && config.selectedParityPatterns.includes('2P-3I')) {
      warnings.push("Sélectionner '3P-2I' ET '2P-3I' peut créer des conflits");
    }

    // 4. Vérifier les patterns consécutifs contradictoires
    if (config.consecutiveMode === 'none' && config.selectedConsecutivePatterns.some(p => p.includes('CONSECUTIVE_1') || p.includes('CONSECUTIVE_2'))) {
      errors.push("Impossible d'avoir 'Aucun consécutif' ET des patterns avec consécutifs");
    }

    if (config.consecutiveMode === 'required' && config.selectedConsecutivePatterns.includes('CONSECUTIVE_0')) {
      errors.push("Impossible d'avoir 'Consécutifs obligatoires' ET le pattern 'Aucun consécutif'");
    }

    // 5. Vérifier la logique chauds + froids
    if (config.includeHotNumbers && config.includeColdNumbers) {
      warnings.push("Numéros chauds + froids : les combinaisons seront mixtes (3 chauds + 2 froids)");
    }

    return { errors, warnings };
  };

  const constraintValidation = validateConstraints();

  // Calculer le nombre de combinaisons possibles restantes
  const calculateRemainingCombinations = (): number => {
    const totalCombinations = 1906884; // C(49,5) = 1,906,884 combinaisons possibles
    let remainingCombinations = totalCombinations;
    
    
    // Réduction par stratégies de génération
    const activeStrategies = [
      config.includeHotNumbers,
      config.includeColdNumbers,
      config.includePatterns,
      config.includeMathematical,
      config.includeRules,
      config.includeAdvanced
    ].filter(Boolean).length;
    
    // Impact des stratégies sur les combinaisons possibles
    if (activeStrategies > 0) {
      // Logique corrigée pour les stratégies
      if (config.includeHotNumbers && config.includeColdNumbers) {
        // Combinaisons mixtes : 3 chauds + 2 froids
        // C(20,3) × C(20,2) = 1,140 × 190 = 216,600 combinaisons
        remainingCombinations = 216600;
      } else if (config.includeHotNumbers) {
        // Seulement numéros chauds : C(20,5) = 15,504 combinaisons
        remainingCombinations = 15504;
      } else if (config.includeColdNumbers) {
        // Seulement numéros froids : C(20,5) = 15,504 combinaisons
        remainingCombinations = 15504;
      } else {
        // Autres stratégies avec réduction progressive
        if (config.includeMathematical) {
          remainingCombinations *= 0.6; // Mathématiques = 40% de réduction
        }
        if (config.includeRules) {
          remainingCombinations *= 0.5; // Règles = 50% de réduction
        }
        if (config.includeAdvanced) {
          remainingCombinations *= 0.4; // Avancées = 60% de réduction
        }
      }
    }
    // Si aucune stratégie n'est activée (activeStrategies === 0), aucune réduction n'est appliquée
    
    // Impact des patterns (plus de patterns dans la MÊME catégorie = moins de réduction)
    // Si aucun pattern n'est sélectionné, on garde toutes les combinaisons possibles
    
    if (totalSelectedPatterns > 0) {
      // Au moins un pattern est sélectionné, on applique les réductions
      if (config.selectedParityPatterns.length > 0) {
        // Plus de patterns de parité = moins de réduction (plus d'options acceptées)
        const parityReduction = Math.max(0.1, 1 - (config.selectedParityPatterns.length * 0.1)); // 10% de réduction par pattern
        remainingCombinations *= parityReduction;
      }
      
      if (config.selectedDizainePatterns.length > 0) {
        const dizaineReduction = Math.max(0.1, 1 - (config.selectedDizainePatterns.length * 0.15));
        remainingCombinations *= dizaineReduction;
      }
      
      if (config.selectedSommePatterns.length > 0) {
        const sommeReduction = Math.max(0.1, 1 - (config.selectedSommePatterns.length * 0.2));
        remainingCombinations *= sommeReduction;
      }
      
      if (config.selectedUnitesPatterns.length > 0) {
        const unitesReduction = Math.max(0.1, 1 - (config.selectedUnitesPatterns.length * 0.25));
        remainingCombinations *= unitesReduction;
      }
      
      if (config.selectedZonePatterns.length > 0) {
        const zoneReduction = Math.max(0.1, 1 - (config.selectedZonePatterns.length * 0.3));
        remainingCombinations *= zoneReduction;
      }
      
      if (config.selectedConsecutivePatterns.length > 0) {
        const consecutiveReduction = Math.max(0.1, 1 - (config.selectedConsecutivePatterns.length * 0.2));
        remainingCombinations *= consecutiveReduction;
      }
    }
    // Si totalSelectedPatterns === 0, on ne modifie pas remainingCombinations (toutes les combinaisons sont possibles)
    
    // Réduction par contraintes spécifiques (seulement si elles sont activées)
    // Contraintes de somme : seulement si min > 0 OU max < 200 (valeurs par défaut : min=0, max=200)
    if (config.minSum > 0 || config.maxSum < 200) {
      remainingCombinations *= 0.7; // ~70% des combinaisons respectent une contrainte de somme
    }
    
    // Contraintes de dizaines : seulement si min > 1 OU max < 5 (valeurs par défaut : min=1, max=5)
    if (config.minDizaines > 1 || config.maxDizaines < 5) {
      remainingCombinations *= 0.8; // ~80% des combinaisons respectent une contrainte de dizaines
    }
    
    // Contraintes de consécutifs : seulement si mode n'est pas 'disabled'
    if (config.consecutiveMode === 'required') {
      remainingCombinations *= 0.3; // ~30% des combinaisons ont des consécutifs
    } else if (config.consecutiveMode === 'none') {
      remainingCombinations *= 0.4; // ~40% des combinaisons n'ont pas de consécutifs
    }
    // Si consecutiveMode === 'disabled', aucune réduction n'est appliquée
    
    return Math.round(remainingCombinations);
  };

  const remainingCombinations = calculateRemainingCombinations();
  const reductionPercentage = Math.round(((1906884 - remainingCombinations) / 1906884) * 100);
  
  // Calculer le nombre de stratégies actives pour l'affichage
  const activeStrategiesCount = [
    config.includeHotNumbers,
    config.includeColdNumbers,
    config.includePatterns,
    config.includeMathematical,
    config.includeRules,
    config.includeAdvanced
  ].filter(Boolean).length;

  const generateCombinations = async () => {
    setIsLoading(true);
    try {
      // Si grille multiple, utiliser l'API multi-game
      if (config.gridType === 'multiple') {
        const response = await fetch('/api/multi-game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gridSize: config.multipleGridSize,
            numberOfGrids: config.count,
            strategies: {
              includeHotNumbers: config.includeHotNumbers,
              includeColdNumbers: config.includeColdNumbers,
              includePatterns: config.includePatterns,
              includeMathematical: config.includeMathematical,
              includeRules: config.includeRules,
              includeAdvanced: config.includeAdvanced
            },
            consecutiveMode: config.consecutiveMode,
            maxConsecutive: config.maxConsecutive
          })
        });
        
        const result = await response.json();
        if (result.success) {
          // Convertir les grilles multiples au format UnifiedCombination
          const unifiedCombinations: UnifiedCombination[] = result.grids.map((grid: any, index: number) => ({
            id: `multi-grid-${index}-${Date.now()}`,
            name: `Grille Multiple ${index + 1} (${config.multipleGridSize} numéros)`,
            description: `Grille multiple avec ${config.multipleGridSize} numéros`,
            category: 'advanced' as any,
            mainNumbers: grid.numbers,
            complementaryNumber: grid.complementary || 1,
            evenOddDistribution: `${grid.numbers.filter((n: number) => n % 2 === 0).length}P-${grid.numbers.filter((n: number) => n % 2 === 1).length}I`,
            isOptimalDistribution: false, // Les grilles multiples ont des distributions différentes
            score: grid.score || 75,
            confidence: grid.confidence || 70,
            reasons: [
              `Grille multiple de ${config.multipleGridSize} numéros`,
              `Génère ${grid.combinationsCount || (config.multipleGridSize === 7 ? 21 : config.multipleGridSize === 8 ? 56 : 126)} combinaisons`,
              `Probabilité de gain: ${(grid.winProbability || 0.1).toFixed(2)}%`
            ],
            expectedValue: grid.expectedReturn || 15,
            riskLevel: 'medium' as any,
            createdAt: new Date()
          }));
          
          setCombinations(unifiedCombinations);
          toast.success(`${unifiedCombinations.length} grilles multiples générées !`);
        } else {
          toast.error('Erreur lors de la génération des grilles multiples');
        }
        return;
      }

      // Si des patterns spécifiques sont sélectionnés, utiliser l'API pattern-optimization
      const hasSelectedPatterns = config.selectedParityPatterns.length > 0 || 
                                 config.selectedConsecutivePatterns.length > 0 ||
                                 config.selectedDizainePatterns.length > 0 ||
                                 config.selectedSommePatterns.length > 0 ||
                                 config.selectedZonePatterns.length > 0 ||
                                 config.selectedUnitesPatterns.length > 0;

      if (hasSelectedPatterns) {
        const response = await fetch('/api/pattern-optimization', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedParityPatterns: config.selectedParityPatterns,
            selectedConsecutivePatterns: config.selectedConsecutivePatterns,
            selectedDizainePatterns: config.selectedDizainePatterns,
            selectedSommePatterns: config.selectedSommePatterns,
            selectedZonePatterns: config.selectedZonePatterns,
            selectedUnitesPatterns: config.selectedUnitesPatterns,
            numberOfCombinations: config.count,
            forcePatternCompliance: true
          })
        });
        
        const result = await response.json();
        if (result.success) {
          // Convertir les combinaisons au format UnifiedCombination
          const unifiedCombinations: UnifiedCombination[] = result.data.combinations.map((combo: any, index: number) => ({
            id: `pattern-${index}-${Date.now()}`,
            name: `Combinaison Pattern ${index + 1}`,
            description: `Basée sur les patterns sélectionnés`,
            category: 'pattern' as any,
            mainNumbers: combo.numbers,
            complementaryNumber: combo.complementary,
            evenOddDistribution: `${combo.numbers.filter((n: number) => n % 2 === 0).length}P-${combo.numbers.filter((n: number) => n % 2 === 1).length}I`,
            isOptimalDistribution: (combo.numbers.filter((n: number) => n % 2 === 0).length === 3 && combo.numbers.filter((n: number) => n % 2 === 1).length === 2) || 
                                 (combo.numbers.filter((n: number) => n % 2 === 0).length === 2 && combo.numbers.filter((n: number) => n % 2 === 1).length === 3),
            score: combo.score,
            confidence: combo.confidence,
            reasons: combo.reasons,
            expectedValue: combo.expectedValue,
            riskLevel: combo.riskLevel,
            createdAt: new Date()
          }));
          
          setCombinations(unifiedCombinations);
          toast.success(`${unifiedCombinations.length} combinaisons générées avec patterns !`);
        } else {
          toast.error('Erreur lors de la génération avec patterns');
        }
      } else {
        // Utiliser l'API standard
        const response = await fetch('/api/combination-hub', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate-custom',
            config: {
              ...config,
              consecutiveMode: config.consecutiveMode,
              maxConsecutive: config.maxConsecutive
            }
          })
        });
        
        const result = await response.json();
        if (result.success) {
          setCombinations(result.combinations);
          toast.success(`${result.combinations.length} combinaisons générées !`);
        } else {
          toast.error('Erreur lors de la génération');
        }
      }
    } catch (error) {
      toast.error('Erreur lors de la génération');
    } finally {
      setIsLoading(false);
    }
  };

  const testCombination = async (combo: UnifiedCombination) => {
    try {
      const response = await fetch('/api/test-combination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          combination: {
            mainNumbers: combo.mainNumbers,
            complementaryNumber: combo.complementaryNumber
          }
        })
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success('Test effectué avec succès !');
      }
    } catch (error) {
      toast.error('Erreur lors du test');
    }
  };

  const exportCombinations = () => {
    const csvContent = [
      ['Nom', 'Numéros', 'Complémentaire', 'Distribution', 'Score', 'Confiance', 'Somme', 'Dizaines', 'Consécutifs', 'Risque'].join(','),
      ...combinations.map(combo => {
        const sum = combo.mainNumbers.reduce((a, b) => a + b, 0);
        const dizaines = new Set(combo.mainNumbers.map(num => Math.floor((num - 1) / 10)));
        const consecutiveCount = getConsecutiveCount(combo.mainNumbers);
        
        return [
          combo.name,
          combo.mainNumbers.join('-'),
          combo.complementaryNumber,
          combo.evenOddDistribution,
          combo.score.toFixed(1),
          combo.confidence.toFixed(1),
          sum,
          dizaines.size,
          consecutiveCount,
          combo.riskLevel
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `combinaisons_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Combinaisons exportées !');
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Configuration de Génération</h2>
        </div>

        {/* Indicateur de combinaisons possibles - Sticky */}
        <div className="sticky top-4 z-10 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-lg backdrop-blur-sm bg-opacity-95">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Combinaisons possibles restantes</h3>
                <p className="text-xs text-gray-600">
                  {[
                    config.includeHotNumbers && 'Chauds',
                    config.includeColdNumbers && 'Froids', 
                    config.includePatterns && 'Patterns',
                    config.includeMathematical && 'Math',
                    config.includeRules && 'Règles',
                    config.includeAdvanced && 'Avancées'
                  ].filter(Boolean).join(', ') || 'Toutes stratégies'}
                  {[
                    config.selectedParityPatterns.length > 0 && `${config.selectedParityPatterns.length} parité`,
                    config.selectedDizainePatterns.length > 0 && `${config.selectedDizainePatterns.length} dizaines`,
                    config.selectedSommePatterns.length > 0 && `${config.selectedSommePatterns.length} somme`,
                    config.selectedUnitesPatterns.length > 0 && `${config.selectedUnitesPatterns.length} unités`,
                    config.selectedZonePatterns.length > 0 && `${config.selectedZonePatterns.length} zones`,
                    config.selectedConsecutivePatterns.length > 0 && `${config.selectedConsecutivePatterns.length} consécutifs`
                  ].filter(Boolean).length > 0 && (
                    <span className="text-blue-600 font-medium">
                      {' • ' + [
                        config.selectedParityPatterns.length > 0 && `${config.selectedParityPatterns.length} parité`,
                        config.selectedDizainePatterns.length > 0 && `${config.selectedDizainePatterns.length} dizaines`,
                        config.selectedSommePatterns.length > 0 && `${config.selectedSommePatterns.length} somme`,
                        config.selectedUnitesPatterns.length > 0 && `${config.selectedUnitesPatterns.length} unités`,
                        config.selectedZonePatterns.length > 0 && `${config.selectedZonePatterns.length} zones`,
                        config.selectedConsecutivePatterns.length > 0 && `${config.selectedConsecutivePatterns.length} consécutifs`
                      ].filter(Boolean).join(', ')}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {remainingCombinations.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                sur 1,906,884 total
              </div>
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="mt-3">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-gray-600 mb-2">
              <span>Réduction: <span className="font-semibold text-red-600">{reductionPercentage}%</span></span>
              <span>{((1906884 - remainingCombinations) / 1000).toFixed(0)}K combinaisons éliminées</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.max(2, (remainingCombinations / 1906884) * 100)}%` }}
              ></div>
            </div>
          </div>
          
          {/* Message d'alerte si trop restrictif */}
          {remainingCombinations < 1000 && (
            <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
              ⚠️ <strong>Attention :</strong> Vos critères sont très restrictifs. Il pourrait être difficile de générer le nombre de combinaisons demandé.
            </div>
          )}
          
          {/* Message d'information sur la sélection multiple */}
          {[
            config.selectedParityPatterns.length > 1,
            config.selectedDizainePatterns.length > 1,
            config.selectedSommePatterns.length > 1,
            config.selectedUnitesPatterns.length > 1,
            config.selectedZonePatterns.length > 1,
            config.selectedConsecutivePatterns.length > 1
          ].some(Boolean) && (
            <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded text-xs text-green-800">
              💡 <strong>Astuce :</strong> Vous avez sélectionné plusieurs patterns dans la même catégorie. Cela réduit moins les possibilités car vous acceptez plus d'options dans cette catégorie !
            </div>
          )}
          
          {/* Message d'information quand aucun pattern n'est sélectionné */}
          {totalSelectedPatterns === 0 && (
            <div className="mt-3 p-2 bg-blue-100 border border-blue-300 rounded text-xs text-blue-800">
              🎯 <strong>Mode libre :</strong> Aucun pattern sélectionné. Toutes les combinaisons possibles sont disponibles !
            </div>
          )}
          
          {/* Messages d'erreur pour les contraintes contradictoires */}
          {constraintValidation.errors.length > 0 && (
            <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded text-sm">
              <div className="font-bold text-red-800 mb-2">🚨 Erreurs de configuration :</div>
              {constraintValidation.errors.map((error, index) => (
                <div key={index} className="text-red-700 text-xs">• {error}</div>
              ))}
            </div>
          )}

          {/* Messages d'avertissement */}
          {constraintValidation.warnings.length > 0 && (
            <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded text-sm">
              <div className="font-bold text-yellow-800 mb-2">⚠️ Avertissements :</div>
              {constraintValidation.warnings.map((warning, index) => (
                <div key={index} className="text-yellow-700 text-xs">• {warning}</div>
              ))}
            </div>
          )}

          {/* Message d'information sur l'impact des stratégies */}
          {activeStrategiesCount > 0 && (
            <div className="mt-3 p-2 bg-blue-100 border border-blue-300 rounded text-xs text-blue-800">
              📊 <strong>Impact des stratégies :</strong> {activeStrategiesCount} stratégie{activeStrategiesCount > 1 ? 's' : ''} activée{activeStrategiesCount > 1 ? 's' : ''} 
              {activeStrategiesCount > 1 && ' (plus de stratégies = plus de contraintes = moins de combinaisons)'}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Configuration de base */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Configuration de base
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de combinaisons
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={config.count}
                onChange={(e) => setConfig({...config, count: parseInt(e.target.value) || 1})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de grille
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="grid-simple"
                    name="gridType"
                    value="simple"
                    checked={config.gridType === 'simple'}
                    onChange={(e) => setConfig({...config, gridType: e.target.value as 'simple' | 'multiple'})}
                    className="rounded"
                  />
                  <label htmlFor="grid-simple" className="text-sm text-gray-700">
                    Grille simple (5 numéros + 1 complémentaire)
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="grid-multiple"
                    name="gridType"
                    value="multiple"
                    checked={config.gridType === 'multiple'}
                    onChange={(e) => setConfig({...config, gridType: e.target.value as 'simple' | 'multiple'})}
                    className="rounded"
                  />
                  <label htmlFor="grid-multiple" className="text-sm text-gray-700">
                    Grille multiple
                  </label>
                </div>
              </div>
            </div>

            {config.gridType === 'multiple' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taille de la grille multiple
                </label>
                <select
                  value={config.multipleGridSize}
                  onChange={(e) => setConfig({...config, multipleGridSize: parseInt(e.target.value) as 7 | 8 | 9})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={7}>7 numéros (21 combinaisons)</option>
                  <option value={8}>8 numéros (56 combinaisons)</option>
                  <option value={9}>9 numéros (126 combinaisons)</option>
                </select>
              </div>
            )}

          </div>

          {/* Stratégies de génération */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Stratégies de génération
            </h3>
            <p className="text-xs text-gray-600">
              Chaque stratégie utilise une approche différente pour sélectionner les numéros
            </p>
            
            <div className="space-y-2">
              {[
                { key: 'includeHotNumbers', label: 'Numéros Chauds', icon: TrendingUp, description: 'Numéros les plus fréquents dans les tirages récents' },
                { key: 'includeColdNumbers', label: 'Numéros Froids', icon: TrendingUp, description: 'Numéros les moins fréquents (potentiel de retournement)' },
                { key: 'includePatterns', label: 'Patterns Historiques', icon: Layers, description: 'Reproduction de patterns fréquents (parité, consécutifs, dizaines, etc.)' },
                { key: 'includeMathematical', label: 'Mathématiques', icon: Calculator, description: 'Nombres premiers, Fibonacci, progressions arithmétiques' },
                { key: 'includeRules', label: 'Contraintes Réglementaires', icon: Shield, description: 'Respect des règles FDJ (éviter séquences, équilibrer zones)' },
                { key: 'includeAdvanced', label: 'Multi-Critères', icon: Brain, description: 'Optimisation combinée : écarts, distribution, complémentaire optimal' }
              ].map(({ key, label, icon: Icon, description }) => (
                <div key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={key}
                    checked={config[key as keyof GenerationConfig] as boolean}
                    onChange={(e) => setConfig({...config, [key]: e.target.checked})}
                    className="rounded"
                  />
                  <Icon className="w-4 h-4 text-gray-600" />
                  <div className="flex-1">
                    <label htmlFor={key} className="text-sm text-gray-700">
                      {label}
                    </label>
                    {description && (
                      <div className="text-xs text-gray-500">{description}</div>
                    )}
                    {/* Affichage des numéros chauds/froids - seulement si cochée */}
                    {key === 'includeHotNumbers' && config.includeHotNumbers && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="font-bold text-red-800 mb-2">🔥 20 numéros chauds (les plus fréquents) :</div>
                        {hotColdNumbers ? (
                          <>
                            <div className="text-red-700 text-sm grid grid-cols-5 gap-1">
                              {hotColdNumbers.hot.map((num, index) => (
                                <span key={num} className="bg-red-100 px-2 py-1 rounded text-center font-medium">
                                  {num}
                                </span>
                              ))}
                            </div>
                            <div className="text-red-600 text-xs mt-2">
                              Ces numéros seront utilisés pour générer vos combinaisons
                            </div>
                          </>
                        ) : (
                          <div className="text-red-600 text-sm">
                            Chargement des numéros chauds...
                          </div>
                        )}
                      </div>
                    )}
                    {key === 'includeColdNumbers' && config.includeColdNumbers && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="font-bold text-blue-800 mb-2">❄️ 20 numéros froids (les moins fréquents) :</div>
                        {hotColdNumbers ? (
                          <>
                            <div className="text-blue-700 text-sm grid grid-cols-5 gap-1">
                              {hotColdNumbers.cold.map((num, index) => (
                                <span key={num} className="bg-blue-100 px-2 py-1 rounded text-center font-medium">
                                  {num}
                                </span>
                              ))}
                            </div>
                            <div className="text-blue-600 text-xs mt-2">
                              Ces numéros seront utilisés pour générer vos combinaisons
                            </div>
                          </>
                        ) : (
                          <div className="text-blue-600 text-sm">
                            Chargement des numéros froids...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Contraintes spécifiques intégrées */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Contraintes de génération
              </h4>
              <p className="text-xs text-gray-600 mb-4">
                Paramètres fins pour contrôler la génération (somme, dizaines, consécutifs)
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Somme min</label>
                  <input
                    type="number"
                    value={config.minSum}
                    onChange={(e) => setConfig({...config, minSum: parseInt(e.target.value) || 0})}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Somme max</label>
                  <input
                    type="number"
                    value={config.maxSum}
                    onChange={(e) => setConfig({...config, maxSum: parseInt(e.target.value) || 200})}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Dizaines min</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={config.minDizaines}
                    onChange={(e) => setConfig({...config, minDizaines: parseInt(e.target.value) || 1})}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Dizaines max</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={config.maxDizaines}
                    onChange={(e) => setConfig({...config, maxDizaines: parseInt(e.target.value) || 5})}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contrôle des numéros consécutifs
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Définit si les combinaisons doivent contenir des numéros consécutifs
                </p>
                
                {/* Case à cocher pour désactiver le contrôle */}
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="disable-consecutive-control"
                    checked={config.consecutiveMode === 'disabled'}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setConfig({...config, consecutiveMode: 'disabled' as any});
                      } else {
                        setConfig({...config, consecutiveMode: 'none'});
                      }
                    }}
                    className="rounded w-4 h-4"
                  />
                  <label htmlFor="disable-consecutive-control" className="text-sm text-gray-700">
                    Désactiver le contrôle des consécutifs (aucune contrainte)
                  </label>
                </div>
                
                {/* Options de contrôle (désactivées si contrôle désactivé) */}
                <div className={`space-y-2 ${config.consecutiveMode === 'disabled' ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="consecutive-none"
                      name="consecutiveMode"
                      value="none"
                      checked={config.consecutiveMode === 'none'}
                      onChange={(e) => setConfig({...config, consecutiveMode: e.target.value as 'none' | 'optional' | 'required'})}
                      className="rounded"
                    />
                    <label htmlFor="consecutive-none" className="text-sm text-gray-700">
                      Aucun consécutif (optimal)
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="consecutive-optional"
                      name="consecutiveMode"
                      value="optional"
                      checked={config.consecutiveMode === 'optional'}
                      onChange={(e) => setConfig({...config, consecutiveMode: e.target.value as 'none' | 'optional' | 'required'})}
                      className="rounded"
                    />
                    <label htmlFor="consecutive-optional" className="text-sm text-gray-700">
                      Consécutifs optionnels (max {config.maxConsecutive})
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="consecutive-required"
                      name="consecutiveMode"
                      value="required"
                      checked={config.consecutiveMode === 'required'}
                      onChange={(e) => setConfig({...config, consecutiveMode: e.target.value as 'none' | 'optional' | 'required'})}
                      className="rounded"
                    />
                    <label htmlFor="consecutive-required" className="text-sm text-gray-700">
                      Consécutifs obligatoires (min 1, max {config.maxConsecutive})
                    </label>
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-xs text-gray-600 mb-1">Max consécutifs</label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={config.maxConsecutive}
                    onChange={(e) => setConfig({...config, maxConsecutive: parseInt(e.target.value) || 1})}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sélection des patterns spécifiques */}
          {config.includePatterns && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Patterns d'analyse sélectionnés
              </h3>
              <p className="text-xs text-gray-600">
                Patterns d'analyse historiques à reproduire dans les combinaisons générées
              </p>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Patterns de parité */}
                {availablePatterns && availablePatterns.parity && availablePatterns.parity.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Parité</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availablePatterns.parity.map(patternInfo => (
                        <div key={patternInfo.pattern} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            id={`parity-${patternInfo.pattern}`}
                            checked={config.selectedParityPatterns.includes(patternInfo.pattern)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setConfig({
                                  ...config,
                                  selectedParityPatterns: [...config.selectedParityPatterns, patternInfo.pattern]
                                });
                              } else {
                                setConfig({
                                  ...config,
                                  selectedParityPatterns: config.selectedParityPatterns.filter(p => p !== patternInfo.pattern)
                                });
                              }
                            }}
                            className="rounded mt-1 w-4 h-4"
                          />
                          <label htmlFor={`parity-${patternInfo.pattern}`} className="text-sm text-gray-700 flex-1 cursor-pointer">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                              <span className="font-medium">{patternInfo.pattern}</span>
                              <span className="text-blue-600 font-bold text-sm">{formatFrequency(patternInfo.percentage)}</span>
                            </div>
                            <div className="text-gray-500 text-xs mt-1">{patternInfo.count} fois observé</div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Patterns consécutifs */}
                {availablePatterns && availablePatterns.consecutive && availablePatterns.consecutive.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Consécutifs</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availablePatterns.consecutive.map(patternInfo => (
                        <div key={patternInfo.pattern} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            id={`consecutive-${patternInfo.pattern}`}
                            checked={config.selectedConsecutivePatterns.includes(patternInfo.pattern)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setConfig({
                                  ...config,
                                  selectedConsecutivePatterns: [...config.selectedConsecutivePatterns, patternInfo.pattern]
                                });
                              } else {
                                setConfig({
                                  ...config,
                                  selectedConsecutivePatterns: config.selectedConsecutivePatterns.filter(p => p !== patternInfo.pattern)
                                });
                              }
                            }}
                            className="rounded mt-1 w-4 h-4"
                          />
                          <label htmlFor={`consecutive-${patternInfo.pattern}`} className="text-sm text-gray-700 flex-1 cursor-pointer">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                              <span className="font-medium">{patternInfo.description}</span>
                              <span className="text-blue-600 font-bold text-sm">{formatFrequency(patternInfo.percentage)}</span>
                            </div>
                            <div className="text-gray-500 text-xs mt-1">{patternInfo.count} fois observé</div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Patterns de dizaines */}
                {availablePatterns && availablePatterns.dizaine && availablePatterns.dizaine.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Répartition par dizaines</h4>
                    <p className="text-xs text-gray-500">Nombre de dizaines différentes utilisées (1-10, 11-20, 21-30, 31-40, 41-49)</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availablePatterns.dizaine.map(patternInfo => (
                        <div key={patternInfo.pattern} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            id={`dizaine-${patternInfo.pattern}`}
                            checked={config.selectedDizainePatterns.includes(patternInfo.pattern)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setConfig({
                                  ...config,
                                  selectedDizainePatterns: [...config.selectedDizainePatterns, patternInfo.pattern]
                                });
                              } else {
                                setConfig({
                                  ...config,
                                  selectedDizainePatterns: config.selectedDizainePatterns.filter(p => p !== patternInfo.pattern)
                                });
                              }
                            }}
                            className="rounded mt-1 w-4 h-4"
                          />
                          <label htmlFor={`dizaine-${patternInfo.pattern}`} className="text-sm text-gray-700 flex-1 cursor-pointer">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                              <span className="font-medium">{patternInfo.description}</span>
                              <span className="text-blue-600 font-bold text-sm">{formatFrequency(patternInfo.percentage)}</span>
                            </div>
                            <div className="text-gray-500 text-xs mt-1">{patternInfo.count} fois observé</div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Patterns de somme */}
                {availablePatterns && availablePatterns.somme && availablePatterns.somme.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Somme</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availablePatterns.somme.map(patternInfo => (
                        <div key={patternInfo.pattern} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            id={`somme-${patternInfo.pattern}`}
                            checked={config.selectedSommePatterns.includes(patternInfo.pattern)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setConfig({
                                  ...config,
                                  selectedSommePatterns: [...config.selectedSommePatterns, patternInfo.pattern]
                                });
                              } else {
                                setConfig({
                                  ...config,
                                  selectedSommePatterns: config.selectedSommePatterns.filter(p => p !== patternInfo.pattern)
                                });
                              }
                            }}
                            className="rounded mt-1 w-4 h-4"
                          />
                          <label htmlFor={`somme-${patternInfo.pattern}`} className="text-sm text-gray-700 flex-1 cursor-pointer">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                              <span className="font-medium">{patternInfo.description}</span>
                              <span className="text-blue-600 font-bold text-sm">{formatFrequency(patternInfo.percentage)}</span>
                            </div>
                            <div className="text-gray-500 text-xs mt-1">{patternInfo.count} fois observé</div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Patterns de zones */}
                {availablePatterns && availablePatterns.zone && availablePatterns.zone.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Répartition par zones</h4>
                    <p className="text-xs text-gray-500">Distribution dans 5 zones égales (1-10, 11-20, 21-30, 31-40, 41-49)</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availablePatterns.zone.map(patternInfo => (
                        <div key={patternInfo.pattern} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            id={`zone-${patternInfo.pattern}`}
                            checked={config.selectedZonePatterns.includes(patternInfo.pattern)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setConfig({
                                  ...config,
                                  selectedZonePatterns: [...config.selectedZonePatterns, patternInfo.pattern]
                                });
                              } else {
                                setConfig({
                                  ...config,
                                  selectedZonePatterns: config.selectedZonePatterns.filter(p => p !== patternInfo.pattern)
                                });
                              }
                            }}
                            className="rounded mt-1 w-4 h-4"
                          />
                          <label htmlFor={`zone-${patternInfo.pattern}`} className="text-sm text-gray-700 flex-1 cursor-pointer">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                              <span className="font-medium">{patternInfo.description}</span>
                              <span className="text-blue-600 font-bold text-sm">{formatFrequency(patternInfo.percentage)}</span>
                            </div>
                            <div className="text-gray-500 text-xs mt-1">{patternInfo.count} fois observé</div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Patterns d'unités */}
                {availablePatterns && availablePatterns.unites && availablePatterns.unites.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Unités</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availablePatterns.unites.map(patternInfo => (
                        <div key={patternInfo.pattern} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            id={`unites-${patternInfo.pattern}`}
                            checked={config.selectedUnitesPatterns.includes(patternInfo.pattern)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setConfig({
                                  ...config,
                                  selectedUnitesPatterns: [...config.selectedUnitesPatterns, patternInfo.pattern]
                                });
                              } else {
                                setConfig({
                                  ...config,
                                  selectedUnitesPatterns: config.selectedUnitesPatterns.filter(p => p !== patternInfo.pattern)
                                });
                              }
                            }}
                            className="rounded mt-1 w-4 h-4"
                          />
                          <label htmlFor={`unites-${patternInfo.pattern}`} className="text-sm text-gray-700 flex-1 cursor-pointer">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                              <span className="font-medium">{patternInfo.description}</span>
                              <span className="text-blue-600 font-bold text-sm">{formatFrequency(patternInfo.percentage)}</span>
                            </div>
                            <div className="text-gray-500 text-xs mt-1">{patternInfo.count} fois observé</div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Message si aucun pattern disponible */}
              {(!availablePatterns || 
                (!availablePatterns.parity?.length && 
                 !availablePatterns.consecutive?.length && 
                 !availablePatterns.dizaine?.length && 
                 !availablePatterns.somme?.length && 
                 !availablePatterns.zone?.length &&
                 !availablePatterns.unites?.length)) && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Aucun pattern disponible pour le moment
                </div>
              )}
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={generateCombinations}
            disabled={isLoading || constraintValidation.errors.length > 0}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5" />
            {isLoading ? 'Génération...' : 'Générer les combinaisons'}
          </button>
          
          <button
            onClick={() => {
              setConfig({
                count: 10,
                includeHotNumbers: false,
                includeColdNumbers: false,
                includePatterns: false,
                includeMathematical: false,
                includeRules: false,
                includeAdvanced: false,
                includePatternOptimization: false,
                includeOptimizedCombinations: false,
                gridType: 'simple',
                multipleGridSize: 7,
                selectedParityPatterns: [],
                selectedConsecutivePatterns: [],
                selectedDizainePatterns: [],
                selectedSommePatterns: [],
                selectedZonePatterns: [],
                selectedUnitesPatterns: [],
                minSum: 0,
                maxSum: 200,
                minDizaines: 1,
                maxDizaines: 5,
                consecutiveMode: 'disabled',
                maxConsecutive: 1
              });
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <RefreshCw className="w-5 h-5" />
            Réinitialiser toutes les contraintes
          </button>

          {combinations.length > 0 && (
            <button
              onClick={exportCombinations}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-5 h-5" />
              Exporter CSV
            </button>
          )}
        </div>
      </motion.div>

      {/* Combinaisons générées */}
      {combinations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold mb-4">Combinaisons Générées ({combinations.length})</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {combinations.map((combo, index) => {
              // Calculer les détails d'optimisation
              const sum = combo.mainNumbers.reduce((a, b) => a + b, 0);
              const evenCount = combo.mainNumbers.filter(n => n % 2 === 0).length;
              const oddCount = combo.mainNumbers.length - evenCount;
              const dizaines = new Set(combo.mainNumbers.map(num => Math.floor((num - 1) / 10)));
              const consecutiveCount = getConsecutiveCount(combo.mainNumbers);
              const riskColor = combo.riskLevel === 'low' ? 'text-green-600' : combo.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600';
              const sumQuality = getSumQuality(sum);
              const dizaineQuality = getDizaineQuality(dizaines.size);
              
              return (
                <div key={combo.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{combo.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      combo.isOptimalDistribution 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {combo.evenOddDistribution} {combo.isOptimalDistribution ? '✅' : '❌'}
                    </span>
                  </div>
                  
                  {/* Numéros */}
                  <div className="flex gap-1 mb-3">
                    {combo.mainNumbers.map(num => (
                      <span key={num} className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                        {num}
                      </span>
                    ))}
                    <span className="w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-sm font-medium">
                      {combo.complementaryNumber}
                    </span>
                  </div>
                  
                  {/* Détails d'optimisation */}
                  <div className="space-y-2 mb-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Score:</span>
                        <span className="font-medium text-blue-600">{combo.score.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confiance:</span>
                        <span className="font-medium text-green-600">{combo.confidence.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Somme:</span>
                        <span className={`font-medium ${sumQuality.color}`}>{sum} ({sumQuality.label})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dizaines:</span>
                        <span className={`font-medium ${dizaineQuality.color}`}>{dizaines.size} ({dizaineQuality.label})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Consécutifs:</span>
                        <span className={`font-medium ${consecutiveCount > 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                          {consecutiveCount} {consecutiveCount > 0 ? '✅' : '❌'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Risque:</span>
                        <span className={`font-medium ${riskColor}`}>{combo.riskLevel.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Raisons d'optimisation */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">Raisons d'optimisation:</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {combo.reasons.slice(0, 2).map((reason, i) => (
                        <div key={i} className="flex items-start gap-1">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                      {combo.reasons.length > 2 && (
                        <div className="text-blue-600">+{combo.reasons.length - 2} autres raisons</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Boutons d'action */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => {
                        setSelectedDetails(combo);
                        setShowDetailsModal(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Info className="w-4 h-4" />
                      Détails
                    </button>
                    <button
                      onClick={() => testCombination(combo)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Tester
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Modal de détails */}
      {showDetailsModal && selectedDetails && (
        <StrategyDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          details={null}
          combination={{
            boules: selectedDetails.mainNumbers,
            numero_chance: selectedDetails.complementaryNumber,
            score: selectedDetails.score
          }}
        />
      )}
    </div>
  );
}
