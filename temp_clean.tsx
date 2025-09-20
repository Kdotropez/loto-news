'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Settings, Play, Loader2, RefreshCw, AlertCircle,
  TrendingUp, Clock, Calculator, Shield, Zap, BarChart3,
  XCircle, CheckCircle, Info, Eye, EyeOff, ChevronDown, ChevronUp
} from 'lucide-react';

// Interfaces
interface GenerationConfig {
  // Configuration de base
  combinationCount: number;
  gridType: 'simple' | 'multiple';
  multipleGridSize: number;
  
  // Stratégies de génération
  includeHotNumbers: boolean;
  includeColdNumbers: boolean;
  includeHotColdHybrid: boolean;
  includePatterns: boolean;
  includeTemporalPatterns: boolean;
  includeMathematical: boolean;
  includeRules: boolean;
  includeAdvanced: boolean;
  
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

interface UnifiedCombination {
  numbers: number[];
  complementaryNumber: number;
  patterns: string[];
  score: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  optimizationReasons: string[];
  winProbability?: number;
  estimatedGain?: number;
}

interface HotColdNumbers {
  hot: number[];
  cold: number[];
}

const ThreeWindowInterface: React.FC = () => {
  // États principaux
  const [config, setConfig] = useState<GenerationConfig>({
    combinationCount: 10,
    gridType: 'simple',
    multipleGridSize: 7,
    includeHotNumbers: false,
    includeColdNumbers: false,
    includeHotColdHybrid: false,
    includePatterns: false,
    includeTemporalPatterns: false,
    includeMathematical: false,
    includeRules: false,
    includeAdvanced: false,
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
    minSum: 0,
    maxSum: 200,
    minDizaines: 1,
    maxDizaines: 5,
    consecutiveMode: 'disabled',
    maxConsecutive: 2
  });

  const [combinations, setCombinations] = useState<UnifiedCombination[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availablePatterns, setAvailablePatterns] = useState<AvailablePatterns>({
    parity: [
      { pattern: 'PARITY_3P-2I', count: 150, percentage: 12.5, description: '3 pairs, 2 impairs' },
      { pattern: 'PARITY_2P-3I', count: 120, percentage: 10.0, description: '2 pairs, 3 impairs' },
      { pattern: 'PARITY_4P-1I', count: 80, percentage: 6.7, description: '4 pairs, 1 impair' },
      { pattern: 'PARITY_1P-4I', count: 75, percentage: 6.2, description: '1 pair, 4 impairs' }
    ],
    consecutive: [
      { pattern: 'CONSECUTIVE_NONE', count: 200, percentage: 16.7, description: 'Aucun consécutif' },
      { pattern: 'CONSECUTIVE_ONE', count: 150, percentage: 12.5, description: '1 paire consécutive' },
      { pattern: 'CONSECUTIVE_TWO', count: 100, percentage: 8.3, description: '2 paires consécutives' }
    ],
    dizaine: [
      { pattern: 'DIZAINE_3_DIFFERENTES', count: 180, percentage: 15.0, description: '3 dizaines différentes' },
      { pattern: 'DIZAINE_4_DIFFERENTES', count: 120, percentage: 10.0, description: '4 dizaines différentes' },
      { pattern: 'DIZAINE_5_DIFFERENTES', count: 80, percentage: 6.7, description: '5 dizaines différentes' }
    ],
    somme: [
      { pattern: 'SOMME_100_120', count: 160, percentage: 13.3, description: 'Somme entre 100-120' },
      { pattern: 'SOMME_120_140', count: 140, percentage: 11.7, description: 'Somme entre 120-140' },
      { pattern: 'SOMME_140_160', count: 120, percentage: 10.0, description: 'Somme entre 140-160' }
    ],
    zone: [
      { pattern: 'ZONE_3_ZONES', count: 170, percentage: 14.2, description: '3 zones différentes' },
      { pattern: 'ZONE_4_ZONES', count: 130, percentage: 10.8, description: '4 zones différentes' },
      { pattern: 'ZONE_5_ZONES', count: 90, percentage: 7.5, description: '5 zones différentes' }
    ],
    unites: [
      { pattern: 'UNIT_5_DIFFERENTES', count: 180, percentage: 15.0, description: '5 unités différentes' },
      { pattern: 'UNIT_4_DIFFERENTES', count: 150, percentage: 12.5, description: '4 unités différentes' },
      { pattern: 'UNIT_3_DIFFERENTES', count: 120, percentage: 10.0, description: '3 unités différentes' },
      { pattern: 'UNIT_2_SIMILAIRES_3_DIFFERENTES', count: 100, percentage: 8.3, description: '2 similaires, 3 différentes' },
      { pattern: 'UNIT_3_SIMILAIRES_2_DIFFERENTES', count: 80, percentage: 6.7, description: '3 similaires, 2 différentes' }
    ],
    temporal: [
      { pattern: 'TEMPORAL_WEEKDAY', count: 45, percentage: 8.2, description: 'Tendances par jour de semaine' },
      { pattern: 'TEMPORAL_MONTH', count: 38, percentage: 6.9, description: 'Cycles mensuels' },
      { pattern: 'TEMPORAL_SEASON', count: 42, percentage: 7.6, description: 'Patterns saisonniers' }
    ],
    seasonal: [
      { pattern: 'SEASONAL_SPRING', count: 25, percentage: 4.5, description: 'Patterns printaniers' },
      { pattern: 'SEASONAL_SUMMER', count: 30, percentage: 5.5, description: 'Patterns estivaux' },
      { pattern: 'SEASONAL_AUTUMN', count: 28, percentage: 5.1, description: 'Patterns automnaux' },
      { pattern: 'SEASONAL_WINTER', count: 22, percentage: 4.0, description: 'Patterns hivernaux' }
    ],
    cyclical: [
      { pattern: 'CYCLICAL_WEEKLY', count: 35, percentage: 6.4, description: 'Cycles hebdomadaires' },
      { pattern: 'CYCLICAL_MONTHLY', count: 28, percentage: 5.1, description: 'Cycles mensuels' },
      { pattern: 'CYCLICAL_QUARTERLY', count: 20, percentage: 3.6, description: 'Cycles trimestriels' }
    ],
    recent: [
      { pattern: 'RECENT_LAST_10', count: 40, percentage: 7.3, description: 'Derniers 10 tirages' },
      { pattern: 'RECENT_LAST_20', count: 35, percentage: 6.4, description: 'Derniers 20 tirages' },
      { pattern: 'RECENT_LAST_50', count: 30, percentage: 5.5, description: 'Derniers 50 tirages' }
    ]
  });
  const [hotColdNumbers, setHotColdNumbers] = useState<HotColdNumbers>({ 
    hot: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 
    cold: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50] 
  });
  const [openPatternModal, setOpenPatternModal] = useState<string | null>(null);
  const [remainingCombinations, setRemainingCombinations] = useState(1906884);
  const [selectedHotNumbers, setSelectedHotNumbers] = useState<number[]>([]);
  const [selectedColdNumbers, setSelectedColdNumbers] = useState<number[]>([]);
  const [openHotNumbersModal, setOpenHotNumbersModal] = useState(false);
  const [openColdNumbersModal, setOpenColdNumbersModal] = useState(false);
  const [showHotNumbers, setShowHotNumbers] = useState(true);
  const [showColdNumbers, setShowColdNumbers] = useState(true);

  // Charger les patterns disponibles
  useEffect(() => {
    const loadPatterns = async () => {
      try {
        // Charger les vrais patterns depuis l'API d'analyse
        const response = await fetch('/api/analysis?type=patterns');
        const data = await response.json();
        
        if (data.success && data.data && data.data.patterns) {
          // Regrouper les patterns spécifiques en catégories génériques
          const patterns = data.data.patterns;
          
          // Fonction pour regrouper les patterns par type
          const groupPatterns = (patternType: string, prefix: string) => {
            const filtered = patterns.filter((p: any) => p.pattern.startsWith(prefix));
            const grouped = new Map();
            
            filtered.forEach((pattern: any) => {
              let genericPattern = '';
              let description = '';
              
              if (patternType === 'parity') {
                // Extraire le type de parité (ex: "3P-2I")
                const match = pattern.pattern.match(/PARITY_(\d+P-\d+I)/);
                if (match) {
                  genericPattern = `PARITY_${match[1]}`;
                  description = pattern.pattern.includes('3P-2I') ? '3 pairs, 2 impairs' :
                               pattern.pattern.includes('2P-3I') ? '2 pairs, 3 impairs' :
                               pattern.pattern.includes('4P-1I') ? '4 pairs, 1 impair' :
                               pattern.pattern.includes('1P-4I') ? '1 pair, 4 impairs' :
                               pattern.pattern.includes('5P-0I') ? '5 pairs, 0 impair' :
                               pattern.pattern.includes('0P-5I') ? '0 pair, 5 impairs' : pattern.pattern;
                }
              } else if (patternType === 'consecutive') {
                // Extraire le type de consécutif
                if (pattern.pattern.includes('NONE')) {
                  genericPattern = 'CONSECUTIVE_NONE';
                  description = 'Aucun consécutif';
                } else if (pattern.pattern.includes('ONE')) {
                  genericPattern = 'CONSECUTIVE_ONE';
                  description = '1 paire consécutive';
                } else if (pattern.pattern.includes('TWO')) {
                  genericPattern = 'CONSECUTIVE_TWO';
                  description = '2 paires consécutives';
                }
              } else if (patternType === 'dizaine') {
                // Extraire le nombre de dizaines
                const match = pattern.pattern.match(/DIZAINE_(\d+)_DIFFERENTES/);
                if (match) {
                  const count = match[1];
                  genericPattern = `DIZAINE_${count}_DIFFERENTES`;
                  description = `${count} dizaines différentes`;
                }
              } else if (patternType === 'somme') {
                // Extraire la plage de somme
                const match = pattern.pattern.match(/SOMME_(\d+)_(\d+)/);
                if (match) {
                  const min = match[1];
                  const max = match[2];
                  genericPattern = `SOMME_${min}_${max}`;
                  description = `Somme entre ${min}-${max}`;
                }
              } else if (patternType === 'zone') {
                // Extraire le nombre de zones
                const match = pattern.pattern.match(/ZONE_(\d+)_ZONES/);
                if (match) {
                  const count = match[1];
                  genericPattern = `ZONE_${count}_ZONES`;
                  description = `${count} zones différentes`;
                }
              } else if (patternType === 'unites') {
                // Extraire le type d'unités
                if (pattern.pattern.includes('5_DIFFERENTES')) {
                  genericPattern = 'UNIT_5_DIFFERENTES';
                  description = '5 unités différentes';
                } else if (pattern.pattern.includes('4_DIFFERENTES')) {
                  genericPattern = 'UNIT_4_DIFFERENTES';
                  description = '4 unités différentes';
                } else if (pattern.pattern.includes('3_DIFFERENTES')) {
                  genericPattern = 'UNIT_3_DIFFERENTES';
                  description = '3 unités différentes';
                } else if (pattern.pattern.includes('2_SIMILAIRES_3_DIFFERENTES')) {
                  genericPattern = 'UNIT_2_SIMILAIRES_3_DIFFERENTES';
                  description = '2 similaires, 3 différentes';
                } else if (pattern.pattern.includes('3_SIMILAIRES_2_DIFFERENTES')) {
                  genericPattern = 'UNIT_3_SIMILAIRES_2_DIFFERENTES';
                  description = '3 similaires, 2 différentes';
                }
              }
              
              if (genericPattern) {
                if (!grouped.has(genericPattern)) {
                  grouped.set(genericPattern, {
                    pattern: genericPattern,
                    count: 0,
                    percentage: 0,
                    description: description
                  });
                }
                grouped.get(genericPattern).count += pattern.count;
              }
            });
            
            // Calculer les pourcentages
            const total = Array.from(grouped.values()).reduce((sum, p) => sum + p.count, 0);
            grouped.forEach((pattern) => {
              pattern.percentage = (pattern.count / total) * 100;
            });
            
            return Array.from(grouped.values()).sort((a, b) => b.count - a.count);
          };
          
          const organizedPatterns = {
            parity: groupPatterns('parity', 'PARITY_'),
            consecutive: groupPatterns('consecutive', 'CONSECUTIVE_'),
            dizaine: groupPatterns('dizaine', 'DIZAINE_'),
            somme: groupPatterns('somme', 'SOMME_'),
            zone: groupPatterns('zone', 'ZONE_'),
            unites: groupPatterns('unites', 'UNIT_'),
            temporal: [], // Patterns temporels à implémenter plus tard
            seasonal: [],
            cyclical: [],
            recent: []
          };
          
          console.log('Vrais patterns chargés:', organizedPatterns); // Debug
          setAvailablePatterns(organizedPatterns);
        } else {
          console.log('API patterns échouée, utilisation des patterns par défaut'); // Debug
          // Si l'API ne retourne pas de patterns, utiliser les patterns par défaut
          setAvailablePatterns({
            parity: [
              { pattern: 'PARITY_3P-2I', count: 150, percentage: 12.5, description: '3 pairs, 2 impairs' },
              { pattern: 'PARITY_2P-3I', count: 120, percentage: 10.0, description: '2 pairs, 3 impairs' },
              { pattern: 'PARITY_4P-1I', count: 80, percentage: 6.7, description: '4 pairs, 1 impair' },
              { pattern: 'PARITY_1P-4I', count: 75, percentage: 6.2, description: '1 pair, 4 impairs' }
            ],
            consecutive: [
              { pattern: 'CONSECUTIVE_NONE', count: 200, percentage: 16.7, description: 'Aucun consécutif' },
              { pattern: 'CONSECUTIVE_ONE', count: 150, percentage: 12.5, description: '1 paire consécutive' },
              { pattern: 'CONSECUTIVE_TWO', count: 100, percentage: 8.3, description: '2 paires consécutives' }
            ],
            dizaine: [
              { pattern: 'DIZAINE_3_DIFFERENTES', count: 180, percentage: 15.0, description: '3 dizaines différentes' },
              { pattern: 'DIZAINE_4_DIFFERENTES', count: 120, percentage: 10.0, description: '4 dizaines différentes' },
              { pattern: 'DIZAINE_5_DIFFERENTES', count: 80, percentage: 6.7, description: '5 dizaines différentes' }
            ],
            somme: [
              { pattern: 'SOMME_100_120', count: 160, percentage: 13.3, description: 'Somme entre 100-120' },
              { pattern: 'SOMME_120_140', count: 140, percentage: 11.7, description: 'Somme entre 120-140' },
              { pattern: 'SOMME_140_160', count: 120, percentage: 10.0, description: 'Somme entre 140-160' }
            ],
            zone: [
              { pattern: 'ZONE_3_ZONES', count: 170, percentage: 14.2, description: '3 zones différentes' },
              { pattern: 'ZONE_4_ZONES', count: 130, percentage: 10.8, description: '4 zones différentes' },
              { pattern: 'ZONE_5_ZONES', count: 90, percentage: 7.5, description: '5 zones différentes' }
            ],
            unites: [
              { pattern: 'UNIT_5_DIFFERENTES', count: 180, percentage: 15.0, description: '5 unités différentes' },
              { pattern: 'UNIT_4_DIFFERENTES', count: 150, percentage: 12.5, description: '4 unités différentes' },
              { pattern: 'UNIT_3_DIFFERENTES', count: 120, percentage: 10.0, description: '3 unités différentes' },
              { pattern: 'UNIT_2_SIMILAIRES_3_DIFFERENTES', count: 100, percentage: 8.3, description: '2 similaires, 3 différentes' },
              { pattern: 'UNIT_3_SIMILAIRES_2_DIFFERENTES', count: 80, percentage: 6.7, description: '3 similaires, 2 différentes' }
            ],
            temporal: [
              { pattern: 'TEMPORAL_WEEKDAY', count: 45, percentage: 8.2, description: 'Tendances par jour de semaine' },
              { pattern: 'TEMPORAL_MONTH', count: 38, percentage: 6.9, description: 'Cycles mensuels' },
              { pattern: 'TEMPORAL_SEASON', count: 42, percentage: 7.6, description: 'Patterns saisonniers' }
            ],
            seasonal: [
              { pattern: 'SEASONAL_SPRING', count: 25, percentage: 4.5, description: 'Patterns printaniers' },
              { pattern: 'SEASONAL_SUMMER', count: 30, percentage: 5.5, description: 'Patterns estivaux' },
              { pattern: 'SEASONAL_AUTUMN', count: 28, percentage: 5.1, description: 'Patterns automnaux' },
              { pattern: 'SEASONAL_WINTER', count: 22, percentage: 4.0, description: 'Patterns hivernaux' }
            ],
            cyclical: [
              { pattern: 'CYCLICAL_WEEKLY', count: 35, percentage: 6.4, description: 'Cycles hebdomadaires' },
              { pattern: 'CYCLICAL_MONTHLY', count: 28, percentage: 5.1, description: 'Cycles mensuels' },
              { pattern: 'CYCLICAL_QUARTERLY', count: 20, percentage: 3.6, description: 'Cycles trimestriels' }
            ],
            recent: [
              { pattern: 'RECENT_LAST_10', count: 40, percentage: 7.3, description: 'Derniers 10 tirages' },
              { pattern: 'RECENT_LAST_20', count: 35, percentage: 6.4, description: 'Derniers 20 tirages' },
              { pattern: 'RECENT_LAST_50', count: 30, percentage: 5.5, description: 'Derniers 50 tirages' }
            ]
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des patterns:', error);
        // Patterns par défaut en cas d'erreur
        setAvailablePatterns({
          parity: [
            { pattern: 'PARITY_3P-2I', count: 150, percentage: 12.5, description: '3 pairs, 2 impairs' },
            { pattern: 'PARITY_2P-3I', count: 120, percentage: 10.0, description: '2 pairs, 3 impairs' },
            { pattern: 'PARITY_4P-1I', count: 80, percentage: 6.7, description: '4 pairs, 1 impair' },
            { pattern: 'PARITY_1P-4I', count: 75, percentage: 6.2, description: '1 pair, 4 impairs' }
          ],
          consecutive: [
            { pattern: 'CONSECUTIVE_NONE', count: 200, percentage: 16.7, description: 'Aucun consécutif' },
            { pattern: 'CONSECUTIVE_ONE', count: 150, percentage: 12.5, description: '1 paire consécutive' },
            { pattern: 'CONSECUTIVE_TWO', count: 100, percentage: 8.3, description: '2 paires consécutives' }
          ],
          dizaine: [
            { pattern: 'DIZAINE_3_DIFFERENTES', count: 180, percentage: 15.0, description: '3 dizaines différentes' },
            { pattern: 'DIZAINE_4_DIFFERENTES', count: 120, percentage: 10.0, description: '4 dizaines différentes' },
            { pattern: 'DIZAINE_5_DIFFERENTES', count: 80, percentage: 6.7, description: '5 dizaines différentes' }
          ],
          somme: [
            { pattern: 'SOMME_100_120', count: 160, percentage: 13.3, description: 'Somme entre 100-120' },
            { pattern: 'SOMME_120_140', count: 140, percentage: 11.7, description: 'Somme entre 120-140' },
            { pattern: 'SOMME_140_160', count: 120, percentage: 10.0, description: 'Somme entre 140-160' }
          ],
          zone: [
            { pattern: 'ZONE_3_ZONES', count: 170, percentage: 14.2, description: '3 zones différentes' },
            { pattern: 'ZONE_4_ZONES', count: 130, percentage: 10.8, description: '4 zones différentes' },
            { pattern: 'ZONE_5_ZONES', count: 90, percentage: 7.5, description: '5 zones différentes' }
          ],
          unites: [
            { pattern: 'UNIT_5_DIFFERENTES', count: 180, percentage: 15.0, description: '5 unités différentes' },
            { pattern: 'UNIT_4_DIFFERENTES', count: 150, percentage: 12.5, description: '4 unités différentes' },
            { pattern: 'UNIT_3_DIFFERENTES', count: 120, percentage: 10.0, description: '3 unités différentes' },
            { pattern: 'UNIT_2_SIMILAIRES_3_DIFFERENTES', count: 100, percentage: 8.3, description: '2 similaires, 3 différentes' },
            { pattern: 'UNIT_3_SIMILAIRES_2_DIFFERENTES', count: 80, percentage: 6.7, description: '3 similaires, 2 différentes' }
          ],
          temporal: [
            { pattern: 'TEMPORAL_WEEKDAY', count: 45, percentage: 8.2, description: 'Tendances par jour de semaine' },
            { pattern: 'TEMPORAL_MONTH', count: 38, percentage: 6.9, description: 'Cycles mensuels' },
            { pattern: 'TEMPORAL_SEASON', count: 42, percentage: 7.6, description: 'Patterns saisonniers' }
          ],
          seasonal: [
            { pattern: 'SEASONAL_SPRING', count: 25, percentage: 4.5, description: 'Patterns printaniers' },
            { pattern: 'SEASONAL_SUMMER', count: 30, percentage: 5.5, description: 'Patterns estivaux' },
            { pattern: 'SEASONAL_AUTUMN', count: 28, percentage: 5.1, description: 'Patterns automnaux' },
            { pattern: 'SEASONAL_WINTER', count: 22, percentage: 4.0, description: 'Patterns hivernaux' }
          ],
          cyclical: [
            { pattern: 'CYCLICAL_WEEKLY', count: 35, percentage: 6.4, description: 'Cycles hebdomadaires' },
            { pattern: 'CYCLICAL_MONTHLY', count: 28, percentage: 5.1, description: 'Cycles mensuels' },
            { pattern: 'CYCLICAL_QUARTERLY', count: 20, percentage: 3.6, description: 'Cycles trimestriels' }
          ],
          recent: [
            { pattern: 'RECENT_LAST_10', count: 40, percentage: 7.3, description: 'Derniers 10 tirages' },
            { pattern: 'RECENT_LAST_20', count: 35, percentage: 6.4, description: 'Derniers 20 tirages' },
            { pattern: 'RECENT_LAST_50', count: 30, percentage: 5.5, description: 'Derniers 50 tirages' }
          ]
        });
      }
    };

    loadPatterns();
  }, []);

  // Charger les numéros chauds/froids
  useEffect(() => {
    const loadHotColdNumbers = async () => {
      try {
        const response = await fetch('/api/analysis?type=frequency');
        const data = await response.json();
        
        console.log('API Response:', data); // Debug temporaire
        
        if (data.success && data.data) {
          // L'API retourne déjà hotNumbers et coldNumbers
          if (data.data.hotNumbers && data.data.coldNumbers) {
            setHotColdNumbers({
              hot: data.data.hotNumbers,
              cold: data.data.coldNumbers
            });
          } else if (data.data.frequencies) {
            // Fallback: calculer depuis les fréquences
            const frequencies = data.data.frequencies;
            const sortedNumbers = frequencies
              .sort((a: any, b: any) => b.count - a.count)
              .map((item: any) => item.number);
            
            setHotColdNumbers({
              hot: sortedNumbers.slice(0, 20),
              cold: sortedNumbers.slice(-20)
            });
          }
        } else {
          console.log('API failed, using default numbers'); // Debug temporaire
          // Numéros par défaut si l'API échoue
          setHotColdNumbers({
            hot: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
            cold: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50]
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des numéros chauds/froids:', error);
        // Numéros par défaut en cas d'erreur
        setHotColdNumbers({
          hot: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
          cold: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50]
        });
      }
    };

    loadHotColdNumbers();
  }, []);

  // Calculer les combinaisons restantes
  useEffect(() => {
    const calculate = () => {
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

      setRemainingCombinations(Math.round(remainingCombinations));
    };

    calculate();
  }, [config]);

  // Fonctions utilitaires
  const getConsecutiveCount = (numbers: number[]): number => {
    const sorted = [...numbers].sort((a, b) => a - b);
    let count = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] - sorted[i] === 1) count++;
    }
    return count;
  };

  const getSumQuality = (sum: number): string => {
    if (sum >= 100 && sum <= 150) return 'Optimal';
    if (sum >= 80 && sum <= 170) return 'Bon';
    return 'Moyen';
  };

  const getDizaineQuality = (dizaines: number): string => {
    if (dizaines >= 3 && dizaines <= 4) return 'Optimal';
    if (dizaines >= 2 && dizaines <= 5) return 'Bon';
    return 'Moyen';
  };

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

  // Réinitialiser toutes les contraintes
  const resetAllConstraints = () => {
    setConfig({
      combinationCount: 10,
      gridType: 'simple',
      multipleGridSize: 7,
      includeHotNumbers: false,
      includeColdNumbers: false,
      includeHotColdHybrid: false,
      includePatterns: false,
      includeTemporalPatterns: false,
      includeMathematical: false,
      includeRules: false,
      includeAdvanced: false,
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
      minSum: 0,
      maxSum: 200,
      minDizaines: 1,
      maxDizaines: 5,
      consecutiveMode: 'disabled',
      maxConsecutive: 2
    });
  };

  // Générer les combinaisons
  const generateCombinations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/combination-hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
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
            ].filter(Boolean),
            count: config.combinationCount,
            gridType: config.gridType,
            multipleGridSize: config.multipleGridSize
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setCombinations(data.combinations || []);
      } else {
        console.error('Erreur lors de la génération:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonctions pour la gestion des patterns
  const togglePattern = (category: keyof AvailablePatterns, pattern: string) => {
    const configKey = `selected${category.charAt(0).toUpperCase() + category.slice(1)}Patterns` as keyof GenerationConfig;
    const currentPatterns = config[configKey] as string[];
    
    if (currentPatterns.includes(pattern)) {
      // Désélectionner le pattern
      setConfig(prev => ({
        ...prev,
        [configKey]: currentPatterns.filter(p => p !== pattern)
      }));
    } else {
      // Vérifier les conflits avant de sélectionner
      const conflicts = validatePatternConflicts(category, pattern);
      
      // Sélectionner le pattern avec résolution automatique des conflits
      setConfig(prev => {
        let newPatterns = [...currentPatterns, pattern];
        
        // Résolution automatique des conflits
        if (category === 'consecutive') {
          if (pattern === 'CONSECUTIVE_NONE') {
            // Désélectionner tous les autres patterns consécutifs
            newPatterns = newPatterns.filter(p => 
              p === 'CONSECUTIVE_NONE' || 
              (p !== 'CONSECUTIVE_ONE' && p !== 'CONSECUTIVE_TWO')
            );
          } else if (pattern === 'CONSECUTIVE_ONE' || pattern === 'CONSECUTIVE_TWO') {
            // Désélectionner "Aucun consécutif"
            newPatterns = newPatterns.filter(p => p !== 'CONSECUTIVE_NONE');
          }
        }
        
        if (category === 'parity') {
          if (pattern === 'PARITY_5P-0I') {
            newPatterns = newPatterns.filter(p => p !== 'PARITY_0P-5I');
          } else if (pattern === 'PARITY_0P-5I') {
            newPatterns = newPatterns.filter(p => p !== 'PARITY_5P-0I');
          }
        }
        
        if (category === 'dizaine') {
          if (pattern === 'DIZAINE_3_DIFFERENTES') {
            newPatterns = newPatterns.filter(p => p !== 'DIZAINE_5_DIFFERENTES');
          } else if (pattern === 'DIZAINE_5_DIFFERENTES') {
            newPatterns = newPatterns.filter(p => p !== 'DIZAINE_3_DIFFERENTES');
          }
        }
        
        return {
          ...prev,
          [configKey]: newPatterns
        };
      });
      
      // Afficher un message d'information si des conflits ont été résolus automatiquement
      if (conflicts.length > 0) {
        console.log('Conflits résolus automatiquement:', conflicts);
      }
    }
  };

  const selectAllPatterns = (category: keyof AvailablePatterns) => {
    const patterns = availablePatterns[category] || [];
    const configKey = `selected${category.charAt(0).toUpperCase() + category.slice(1)}Patterns` as keyof GenerationConfig;
    setConfig(prev => ({
      ...prev,
      [configKey]: patterns.map(p => p.pattern)
    }));
  };

  const deselectAllPatterns = (category: keyof AvailablePatterns) => {
    const configKey = `selected${category.charAt(0).toUpperCase() + category.slice(1)}Patterns` as keyof GenerationConfig;
    setConfig(prev => ({
      ...prev,
      [configKey]: []
    }));
  };

  // Fonctions pour les numéros chauds/froids
  const toggleHotNumber = (number: number) => {
    if (selectedHotNumbers.includes(number)) {
      setSelectedHotNumbers(prev => prev.filter(n => n !== number));
    } else {
      setSelectedHotNumbers(prev => [...prev, number]);
    }
  };

  const toggleColdNumber = (number: number) => {
    if (selectedColdNumbers.includes(number)) {
      setSelectedColdNumbers(prev => prev.filter(n => n !== number));
    } else {
      setSelectedColdNumbers(prev => [...prev, number]);
    }
  };

  const selectAllHotNumbers = () => {
    setSelectedHotNumbers(hotColdNumbers.hot);
  };

  const selectAllColdNumbers = () => {
    setSelectedColdNumbers(hotColdNumbers.cold);
  };

  const deselectAllHotNumbers = () => {
    setSelectedHotNumbers([]);
  };

  const deselectAllColdNumbers = () => {
    setSelectedColdNumbers([]);
  };

  // Validation des conflits
  const validateStrategyConflicts = () => {
    const conflicts = [];
    
    if (config.includeHotNumbers && config.includeColdNumbers && config.includeHotColdHybrid) {
      conflicts.push({
        title: 'Conflit de stratégies',
        message: 'Vous ne pouvez pas sélectionner simultanément "Numéros Chauds", "Numéros Froids" et "Hot-Cold Hybride".'
      });
    }
    
    return conflicts;
  };

  // Vérifier si un pattern est en conflit avec les sélections actuelles
  const isPatternInConflict = (category: keyof AvailablePatterns, pattern: string) => {
    const configKey = `selected${category.charAt(0).toUpperCase() + category.slice(1)}Patterns` as keyof GenerationConfig;
    const currentPatterns = config[configKey] as string[];
    
    if (category === 'consecutive') {
      if (pattern === 'CONSECUTIVE_NONE') {
        return currentPatterns.includes('CONSECUTIVE_ONE') || currentPatterns.includes('CONSECUTIVE_TWO');
      } else if (pattern === 'CONSECUTIVE_ONE' || pattern === 'CONSECUTIVE_TWO') {
        return currentPatterns.includes('CONSECUTIVE_NONE');
      }
    }
    
    if (category === 'parity') {
      if (pattern === 'PARITY_5P-0I') {
        return currentPatterns.includes('PARITY_0P-5I');
      } else if (pattern === 'PARITY_0P-5I') {
        return currentPatterns.includes('PARITY_5P-0I');
      }
    }
    
    if (category === 'dizaine') {
      if (pattern === 'DIZAINE_3_DIFFERENTES') {
        return currentPatterns.includes('DIZAINE_5_DIFFERENTES');
      } else if (pattern === 'DIZAINE_5_DIFFERENTES') {
        return currentPatterns.includes('DIZAINE_3_DIFFERENTES');
      }
    }
    
    return false;
  };

  // Validation des conflits de patterns
  const validatePatternConflicts = (patternType: string, pattern: string) => {
    const conflicts = [];
    
    if (patternType === 'consecutive') {
      if (pattern === 'CONSECUTIVE_NONE') {
        // Si on sélectionne "Aucun consécutif", on doit désélectionner les autres
        if (config.selectedConsecutivePatterns.includes('CONSECUTIVE_ONE') || 
            config.selectedConsecutivePatterns.includes('CONSECUTIVE_TWO')) {
          conflicts.push({
            title: 'Conflit de patterns consécutifs',
            message: 'Sélectionner "Aucun consécutif" désélectionnera automatiquement les autres options consécutives.'
          });
        }
      } else if (pattern === 'CONSECUTIVE_ONE' || pattern === 'CONSECUTIVE_TWO') {
        // Si on sélectionne "1 consécutif" ou "2 consécutifs", on doit désélectionner "Aucun consécutif"
        if (config.selectedConsecutivePatterns.includes('CONSECUTIVE_NONE')) {
          conflicts.push({
            title: 'Conflit de patterns consécutifs',
            message: 'Sélectionner des consécutifs désélectionnera automatiquement "Aucun consécutif".'
          });
        }
      }
    }
    
    if (patternType === 'parity') {
      // Vérifier les conflits de parité (ex: 3P-2I vs 2P-3I peuvent coexister, mais pas 5P-0I avec 0P-5I)
      if (pattern === 'PARITY_5P-0I' && config.selectedParityPatterns.includes('PARITY_0P-5I')) {
        conflicts.push({
          title: 'Conflit de patterns de parité',
          message: 'Vous ne pouvez pas sélectionner simultanément "5 pairs, 0 impair" et "0 pair, 5 impairs".'
        });
      }
      if (pattern === 'PARITY_0P-5I' && config.selectedParityPatterns.includes('PARITY_5P-0I')) {
        conflicts.push({
          title: 'Conflit de patterns de parité',
          message: 'Vous ne pouvez pas sélectionner simultanément "0 pair, 5 impairs" et "5 pairs, 0 impair".'
        });
      }
    }
    
    if (patternType === 'dizaine') {
      // Vérifier les conflits de dizaines (ex: 3 dizaines vs 5 dizaines)
      if (pattern === 'DIZAINE_3_DIFFERENTES' && config.selectedDizainePatterns.includes('DIZAINE_5_DIFFERENTES')) {
        conflicts.push({
          title: 'Conflit de patterns de dizaines',
          message: 'Vous ne pouvez pas sélectionner simultanément "3 dizaines" et "5 dizaines".'
        });
      }
      if (pattern === 'DIZAINE_5_DIFFERENTES' && config.selectedDizainePatterns.includes('DIZAINE_3_DIFFERENTES')) {
        conflicts.push({
          title: 'Conflit de patterns de dizaines',
          message: 'Vous ne pouvez pas sélectionner simultanément "5 dizaines" et "3 dizaines".'
        });
      }
    }
    
    if (patternType === 'somme') {
      // Vérifier les conflits de somme (ex: 100-120 vs 140-160 peuvent coexister, mais pas 100-120 avec 120-140 si chevauchement)
      const sommeRanges = {
        'SOMME_100_120': [100, 120],
        'SOMME_120_140': [120, 140],
        'SOMME_140_160': [140, 160],
        'SOMME_160_180': [160, 180]
      };
      
      const currentRange = sommeRanges[pattern as keyof typeof sommeRanges];
      if (currentRange) {
        for (const selectedPattern of config.selectedSommePatterns) {
          const selectedRange = sommeRanges[selectedPattern as keyof typeof sommeRanges];
          if (selectedRange && 
              ((currentRange[0] < selectedRange[1] && currentRange[1] > selectedRange[0]) ||
               (selectedRange[0] < currentRange[1] && selectedRange[1] > currentRange[0]))) {
            conflicts.push({
              title: 'Conflit de patterns de somme',
              message: `Les plages de somme se chevauchent. Vérifiez vos sélections.`
            });
            break;
          }
        }
      }
    }
    
    return conflicts;
  };

  const conflicts = validateStrategyConflicts();

  // Stratégies par catégorie
  const strategiesByCategory = {
    'Fréquence': [
      {
        id: 'includeHotNumbers',
        name: 'Numéros Chauds',
        description: 'Basé sur la fréquence d\'apparition',
        icon: TrendingUp,
        color: 'red',
        enabled: config.includeHotNumbers
      },
      {
        id: 'includeColdNumbers',
        name: 'Numéros Froids',
        description: 'Basé sur la rareté d\'apparition',
        icon: TrendingUp,
        color: 'blue',
        enabled: config.includeColdNumbers
      },
      {
        id: 'includeHotColdHybrid',
        name: 'Hot-Cold Hybride',
        description: 'Combinaison optimale chaud/froid',
        icon: TrendingUp,
        color: 'purple',
        enabled: config.includeHotColdHybrid
      }
    ],
    'Patterns': [
      {
        id: 'includePatterns',
        name: 'Patterns Historiques',
        description: 'Basé sur l\'analyse des patterns',
        icon: BarChart3,
        color: 'green',
        enabled: config.includePatterns
      },
      {
        id: 'includeTemporalPatterns',
        name: 'Patterns Temporels',
        description: 'Basé sur les cycles de récurrence',
        icon: Clock,
        color: 'indigo',
        enabled: config.includeTemporalPatterns
      }
    ],
    'Mathématiques': [
      {
        id: 'includeMathematical',
        name: 'Multi-Critères',
        description: 'Optimisation mathématique avancée',
        icon: Calculator,
        color: 'orange',
        enabled: config.includeMathematical
      }
    ],
    'Règles': [
      {
        id: 'includeRules',
        name: 'Contraintes Réglementaires',
        description: 'Respect des règles du Loto',
        icon: Shield,
        color: 'yellow',
        enabled: config.includeRules
      }
    ],
    'Avancées': [
      {
        id: 'includeAdvanced',
        name: 'Stratégies Avancées',
        description: 'Algorithmes d\'optimisation avancés',
        icon: Zap,
        color: 'pink',
        enabled: config.includeAdvanced
      }
    ]
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header fixe */}
      <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Générateur de Combinaisons Loto</h1>
          <p className="text-sm text-gray-600 mt-1">Interface unifiée avec patterns et stratégies</p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Colonne 1: Catégories de stratégies */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Catégories de Stratégies</h2>
            <div className="space-y-4">
              {Object.entries(strategiesByCategory).map(([category, strategies]) => (
                <div key={category} className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {strategies.map((strategy) => (
                      <div key={strategy.id} className="space-y-2">
                        <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={strategy.enabled}
                            onChange={() => {
                              const configKey = strategy.id as keyof GenerationConfig;
                              setConfig(prev => ({
                                ...prev,
                                [configKey]: !prev[configKey]
                              }));
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <strategy.icon className="w-4 h-4 text-gray-600" />
                              <span className="font-medium text-gray-900">{strategy.name}</span>
                            </div>
                            <p className="text-xs text-gray-600">{strategy.description}</p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne 2: Configuration et génération */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Compteur de combinaisons */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {remainingCombinations.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    Combinaisons possibles restantes
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {((remainingCombinations / 1906884) * 100).toFixed(1)}% du total
                  </div>
                </div>
              </div>

              {/* Configuration de base */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration de base</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de combinaisons
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={config.combinationCount}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        combinationCount: parseInt(e.target.value) || 1
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de grille
                    </label>
                    <select
                      value={config.gridType}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        gridType: e.target.value as 'simple' | 'multiple'
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="simple">Grille simple (5 numéros + 1 complémentaire)</option>
                      <option value="multiple">Grille multiple</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bouton de génération */}
              <div className="text-center">
                <button
                  onClick={generateCombinations}
                  disabled={isLoading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Générer les combinaisons
                    </>
                  )}
                </button>
              </div>

              {/* Affichage des combinaisons */}
              {combinations.length > 0 ? (
                <div className="space-y-4">
                  {combinations.map((combination, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium text-gray-700">#{index + 1}</span>
                        <div className="flex gap-1">
                          {combination.numbers.map((num, i) => (
                            <div key={i} className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {num}
                            </div>
                          ))}
                        </div>
                        <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {combination.complementaryNumber}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune combinaison générée</p>
                  <p className="text-sm">Configurez vos stratégies et générez des combinaisons</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeWindowInterface;