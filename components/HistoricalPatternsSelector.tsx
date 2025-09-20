'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, X, Check, ChevronDown, ChevronUp, List } from 'lucide-react';

interface Pattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  percentage: number;
  category: string;
}

interface HistoricalPatternsSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPatterns: string[];
  onPatternToggle: (patternId: string) => void;
  onSelectAll: (category: string) => void;
  onDeselectAll: (category: string) => void;
}

// Fonction pour détecter les conflits entre patterns
const getPatternConflicts = (patternId: string, selectedPatterns: string[]): string[] => {
  const conflicts: string[] = [];
  
  // Extraire la catégorie du pattern
  const category = patternId.split('_')[0];
  
  // Conflits UNIQUEMENT au sein de la même catégorie
  if (category === 'Consécutifs') {
    if (patternId.includes('CONSECUTIF') && !patternId.includes('NON-CONSECUTIF')) {
      conflicts.push(...selectedPatterns.filter(id => 
        id.startsWith('Consécutifs_') && id.includes('NON-CONSECUTIF')
      ));
    } else if (patternId.includes('NON-CONSECUTIF')) {
      conflicts.push(...selectedPatterns.filter(id => 
        id.startsWith('Consécutifs_') && id.includes('CONSECUTIF') && !id.includes('NON-CONSECUTIF')
      ));
    }
  }
  
  // Conflits pour les patterns de parité (même catégorie uniquement)
  if (category === 'Parité') {
    conflicts.push(...selectedPatterns.filter(id => 
      id.startsWith('Parité_') && id !== patternId
    ));
  }
  
  // Conflits pour les patterns de somme (même catégorie uniquement)
  if (category === 'Somme') {
    conflicts.push(...selectedPatterns.filter(id => 
      id.startsWith('Somme_') && id !== patternId
    ));
  }
  
  // Conflits pour les patterns de dizaines (même catégorie uniquement)
  if (category === 'Dizaines') {
    conflicts.push(...selectedPatterns.filter(id => 
      id.startsWith('Dizaines_') && id !== patternId
    ));
  }
  
  // Conflits pour les patterns de zones (même catégorie uniquement)
  if (category === 'Zone') {
    conflicts.push(...selectedPatterns.filter(id => 
      id.startsWith('Zone_') && id !== patternId
    ));
  }
  
  // Conflits pour les patterns d'unités (même catégorie uniquement)
  if (category === 'Unités') {
    conflicts.push(...selectedPatterns.filter(id => 
      id.startsWith('Unités_') && id !== patternId
    ));
  }
  
  // Vérifier les conflits inter-catégories complexes
  const complexConflicts = getComplexConflicts([...selectedPatterns, patternId]);
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
      conflicts.push(parityPattern, consecutivePattern);
    }
    if (parityPattern.includes('0P-5I') && consecutivePattern.includes('NON-CONSECUTIF')) {
      conflicts.push(parityPattern, consecutivePattern);
    }
  }
  
  // Conflit 2: Parité extrême + Somme
  if (parityPattern && sommePattern) {
    if (parityPattern.includes('0P-5I') && sommePattern.includes('SOMME_ELEVEE')) {
      conflicts.push(parityPattern, sommePattern);
    }
    if (parityPattern.includes('5P-0I') && sommePattern.includes('SOMME_FAIBLE')) {
      conflicts.push(parityPattern, sommePattern);
    }
  }
  
  // Conflit 3: Dizaines + Unités
  if (dizainePattern && unitePattern) {
    if (dizainePattern.includes('DIZ1') && unitePattern.includes('UNIT_5_DIFFERENTES')) {
      conflicts.push(dizainePattern, unitePattern);
    }
  }
  
  // Conflit 4: Somme + Parité (ranges impossibles)
  if (sommePattern && parityPattern) {
    if (sommePattern.includes('SOMME_FAIBLE') && parityPattern.includes('4P-1I')) {
      conflicts.push(sommePattern, parityPattern);
    }
    if (sommePattern.includes('SOMME_ELEVEE') && parityPattern.includes('1P-4I')) {
      conflicts.push(sommePattern, parityPattern);
    }
  }
  
  return conflicts;
};

const patternCategories = {
  'Parité': {
    icon: '⚖️',
    description: 'Distribution des nombres pairs et impairs'
  },
  'Consécutifs': {
    icon: '🔗',
    description: 'Nombres consécutifs dans les combinaisons'
  },
  'Dizaines': {
    icon: '🔢',
    description: 'Répartition par dizaines (0-9, 10-19, etc.)'
  },
  'Unités': {
    icon: '🎯',
    description: 'Patterns des chiffres des unités'
  },
  'Somme': {
    icon: '➕',
    description: 'Somme totale des 5 numéros'
  },
  'Zone': {
    icon: '🗺️',
    description: 'Répartition géographique des numéros'
  }
};

export default function HistoricalPatternsSelector({
  isOpen,
  onClose,
  selectedPatterns,
  onPatternToggle,
  onSelectAll,
  onDeselectAll
}: HistoricalPatternsSelectorProps) {
  const [patterns, setPatterns] = useState<Record<string, Pattern[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Parité']));
  const [showSummary, setShowSummary] = useState(false);

  // Charger les patterns depuis l'API
  useEffect(() => {
    if (isOpen) {
      loadPatterns();
    }
  }, [isOpen]);

  const loadPatterns = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analysis?type=patterns');
      const data = await response.json();
      
      if (data.success && data.data && Object.keys(data.data).length > 0) {
        // Grouper les patterns par catégorie
        const groupedPatterns: Record<string, Pattern[]> = {};
        
        Object.entries(data.data).forEach(([category, categoryPatterns]: [string, any]) => {
          if (Array.isArray(categoryPatterns) && categoryPatterns.length > 0) {
            groupedPatterns[category] = categoryPatterns.map((pattern: any) => ({
              id: pattern.id || `${category}_${pattern.name || pattern.pattern}`,
              name: pattern.name || pattern.pattern,
              description: pattern.description || '',
              frequency: pattern.frequency || 0,
              percentage: pattern.percentage || 0,
              category: category
            }));
          }
        });
        
        setPatterns(groupedPatterns);
      } else {
        console.log('Aucune donnée de patterns reçue de l\'API');
        setPatterns({});
      }
    } catch (error) {
      console.error('Erreur lors du chargement des patterns:', error);
      setPatterns({});
    } finally {
      setIsLoading(false);
    }
  };


  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const formatFrequency = (frequency: number, percentage: number) => {
    if (frequency === 0) return 'Aucune donnée';
    const ratio = Math.round(100 / percentage);
    return `${frequency} fois observé`;
  };

  const getFrequencyLabel = (frequency: number, percentage: number) => {
    if (frequency === 0) return 'Aucune donnée';
    if (percentage >= 20) return 'Très fréquent';
    if (percentage >= 10) return 'Fréquent';
    if (percentage >= 5) return 'Occasionnel';
    return 'Rare';
  };

  const getFrequencyLabelColor = (frequency: number, percentage: number) => {
    if (frequency === 0) return 'bg-gray-100 text-gray-600';
    if (percentage >= 20) return 'bg-green-100 text-green-800';
    if (percentage >= 10) return 'bg-blue-100 text-blue-800';
    if (percentage >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getSelectedPatternsSummary = () => {
    const summary: Record<string, Pattern[]> = {};
    
    Object.entries(patterns).forEach(([category, categoryPatterns]) => {
      const selectedPatternsInCategory = categoryPatterns.filter(p => selectedPatterns.includes(p.id));
      if (selectedPatternsInCategory.length > 0) {
        summary[category] = selectedPatternsInCategory;
      }
    });
    
    return summary;
  };

  const handleClose = () => {
    const summary = getSelectedPatternsSummary();
    console.log('Résumé des sélections:', summary);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Sélection des Patterns Historiques</h2>
            {selectedPatterns.length > 0 && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                {selectedPatterns.length} sélectionné{selectedPatterns.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedPatterns.length > 0 && (
              <button
                onClick={() => setShowSummary(!showSummary)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <List className="w-4 h-4" />
                Résumé
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-600">Chargement des patterns...</span>
            </div>
          ) : showSummary ? (
            /* Résumé des sélections */
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <List className="w-5 h-5" />
                  Résumé de vos sélections
                </h3>
                {Object.keys(getSelectedPatternsSummary()).length === 0 ? (
                  <p className="text-green-700">Aucun pattern sélectionné</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(getSelectedPatternsSummary()).map(([category, selectedPatterns]) => (
                      <div key={category} className="bg-white rounded-lg p-3 border border-green-200">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <span className="text-lg">{patternCategories[category as keyof typeof patternCategories]?.icon}</span>
                          {category} ({selectedPatterns.length} pattern{selectedPatterns.length > 1 ? 's' : ''})
                        </h4>
                        <div className="space-y-1">
                          {selectedPatterns.map((pattern) => (
                            <div key={pattern.id} className="flex items-center justify-between text-sm group">
                              <span className="text-gray-700">{pattern.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">
                                  {pattern.frequency} fois ({pattern.percentage.toFixed(1)}%)
                                </span>
                                <button
                                  onClick={() => onPatternToggle(pattern.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-full transition-all duration-200"
                                  title="Supprimer cette sélection"
                                >
                                  <X className="w-3 h-3 text-red-500 hover:text-red-700" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowSummary(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retour à la sélection
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(patternCategories).map(([category, categoryInfo]) => {
                const categoryPatterns = patterns[category] || [];
                const isExpanded = expandedCategories.has(category);
                const selectedCount = categoryPatterns.filter(p => selectedPatterns.includes(p.id)).length;
                
                return (
                  <div key={category} className="border border-gray-200 rounded-lg">
                    {/* Category Header */}
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleCategory(category)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{categoryInfo.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{category}</h3>
                          <p className="text-sm text-gray-600">{categoryInfo.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          {selectedCount}/{categoryPatterns.length} sélectionnés
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Category Actions */}
                    {isExpanded && (
                      <div className="px-4 pb-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => onSelectAll(category)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            Tout sélectionner
                          </button>
                          <button
                            onClick={() => onDeselectAll(category)}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                          >
                            Tout désélectionner
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Patterns List */}
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <div className="space-y-2">
                          {categoryPatterns.length > 0 ? (
                            categoryPatterns.map((pattern) => {
                              const conflicts = getPatternConflicts(pattern.id, selectedPatterns);
                              const hasConflicts = conflicts.length > 0;
                              const isSelected = selectedPatterns.includes(pattern.id);
                              
                              return (
                                <label
                                  key={pattern.id}
                                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                    isSelected
                                      ? hasConflicts 
                                        ? 'border-red-500 bg-red-50' 
                                        : 'border-blue-500 bg-blue-50'
                                      : hasConflicts
                                        ? 'border-orange-300 bg-orange-50'
                                        : 'border-gray-200 hover:bg-gray-50'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => onPatternToggle(pattern.id)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <span className={`font-medium ${
                                        hasConflicts ? 'text-red-800' : 'text-gray-900'
                                      }`}>
                                        {pattern.name}
                                        {hasConflicts && !isSelected && (
                                          <span className="ml-2 text-xs text-red-600">
                                            (conflit avec sélection actuelle)
                                          </span>
                                        )}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFrequencyLabelColor(pattern.frequency, pattern.percentage)}`}>
                                          {getFrequencyLabel(pattern.frequency, pattern.percentage)}
                                        </span>
                                        {isSelected && (
                                          <Check className="w-4 h-4 text-blue-600" />
                                        )}
                                        {hasConflicts && (
                                          <span className="text-xs text-red-600 font-medium">
                                            ⚠️
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {formatFrequency(pattern.frequency, pattern.percentage)}
                                    </p>
                                    {hasConflicts && conflicts.length > 0 && (
                                      <p className="text-xs text-red-600 mt-1">
                                        Conflit avec: {conflicts.map(id => id.split('_')[1] || id).join(', ')}
                                      </p>
                                    )}
                                  </div>
                                </label>
                              );
                            })
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              Aucun pattern disponible pour cette catégorie
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedPatterns.length} pattern(s) sélectionné(s)
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Valider la sélection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
