'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  Settings,
  Info,
  CheckCircle,
  X,
  BarChart3,
  Calculator,
  Database
} from 'lucide-react';

interface EcartsStrategieSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  config: {
    includeEcartsRetard: boolean;
    ecartsNiveauUrgence: ('critique' | 'eleve' | 'moyen' | 'faible' | 'melange-optimal')[];
  ecartsSeuilCritique: number;
  ecartsSeuilEleve: number;
  ecartsSeuilMoyen: number;
  ecartsSeuilFaible: number;
    ecartsConsidererHistorique: boolean;
    ecartsNombreNumerosMax: number;
  };
  onConfigChange: (newConfig: any) => void;
  analysisPeriod: string;
}

interface EcartData {
  numero: number;
  ecartActuel: number;
  ecartMoyen: number;
  ecartMaximum: number;
  niveauUrgence: 'critique' | 'eleve' | 'moyen' | 'faible' | 'melange-optimal';
  derniereSortie: string;
  prochaineEstimee: string;
}

export default function EcartsStrategieSelector({
  isOpen,
  onClose,
  config,
  onConfigChange,
  analysisPeriod
}: EcartsStrategieSelectorProps) {
  const [ecartsData, setEcartsData] = useState<EcartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [numerosSelectionnes, setNumerosSelectionnes] = useState<number[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showAllThresholds, setShowAllThresholds] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadEcartsData();
      // Ajuster les seuils selon la période d'analyse
      adjustSeuilsForPeriod();
    }
  }, [isOpen, analysisPeriod]);

  // Configuration centralisée des seuils
  const getPeriodSettings = () => ({
    'week': { critique: 5, eleve: 3, moyen: 2, faible: 1 },        // Sur 7 jours
    'month': { critique: 15, eleve: 10, moyen: 6, faible: 3 },     // Sur ~30 tirages  
    'year': { critique: 50, eleve: 30, moyen: 15, faible: 8 },     // Sur ~100 tirages
    'all': { critique: 200, eleve: 120, moyen: 60, faible: 30 },   // Sur ~12000 tirages
    'last20': { critique: 12, eleve: 8, moyen: 4, faible: 2 },     // Sur 20 tirages
    'last50': { critique: 25, eleve: 15, moyen: 8, faible: 4 },    // Sur 50 tirages
    'last100': { critique: 40, eleve: 25, moyen: 12, faible: 6 }   // Sur 100 tirages
  });

  const adjustSeuilsForPeriod = () => {
    const periodSettings = getPeriodSettings();
    const settings = periodSettings[analysisPeriod as keyof typeof periodSettings] || periodSettings.last20;

    const newConfig = {
      ...config,
      ecartsSeuilCritique: settings.critique,
      ecartsSeuilEleve: settings.eleve,
      ecartsSeuilMoyen: settings.moyen,
      ecartsSeuilFaible: settings.faible
    };

    onConfigChange(newConfig);
  };

  useEffect(() => {
    // Recalculer les numéros sélectionnés quand la config change
    updateSelectedNumbers();
  }, [config, ecartsData]);

  const loadEcartsData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analysis?type=ecarts-sortie&period=${analysisPeriod}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setEcartsData(data.data);
      }
    } catch (error) {
      console.error('Erreur chargement écarts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSelectedNumbers = async () => {
    if (!ecartsData.length) return;

    // Si le mélange optimal est activé, utiliser l'API pour obtenir les recommandations
    if (config.ecartsNiveauUrgence.includes('melange-optimal')) {
      try {
        const response = await fetch(`/api/melange-optimal?period=${analysisPeriod}&seuilCritique=${config.ecartsSeuilCritique}&seuilEleve=${config.ecartsSeuilEleve}&seuilMoyen=${config.ecartsSeuilMoyen}`);
        const data = await response.json();
        
        if (data.success && data.data.recommandations) {
          // Prendre les meilleurs numéros selon l'analyse de mélange optimal
          const numerosOptimaux = data.data.recommandations
            .sort((a: any, b: any) => b.scoreOptimal - a.scoreOptimal)
            .slice(0, config.ecartsNombreNumerosMax)
            .map((r: any) => r.numero);
          
          setNumerosSelectionnes(numerosOptimaux);
          return;
        }
      } catch (error) {
        console.error('Erreur chargement mélange optimal:', error);
        // Fallback sur la logique normale
      }
    }

    // Logique normale pour les autres niveaux
    const filteredNumbers = ecartsData
      .filter(ecart => {
        // Filtrer par niveaux d'urgence sélectionnés (exclure mélange-optimal ici)
        const niveauxNormaux = config.ecartsNiveauUrgence.filter(n => n !== 'melange-optimal') as ('critique' | 'eleve' | 'moyen' | 'faible')[];
        if (ecart.niveauUrgence !== 'melange-optimal' && !niveauxNormaux.includes(ecart.niveauUrgence as 'critique' | 'eleve' | 'moyen' | 'faible')) {
          return false;
        }

        // Filtrer par seuils personnalisés
        if (ecart.niveauUrgence === 'critique' && ecart.ecartActuel < config.ecartsSeuilCritique) {
          return false;
        }
        if (ecart.niveauUrgence === 'eleve' && ecart.ecartActuel < config.ecartsSeuilEleve) {
          return false;
        }
        if (ecart.niveauUrgence === 'moyen' && ecart.ecartActuel < config.ecartsSeuilMoyen) {
          return false;
        }
        if (ecart.niveauUrgence === 'faible' && ecart.ecartActuel < config.ecartsSeuilFaible) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.ecartActuel - a.ecartActuel) // Trier par écart décroissant
      .slice(0, config.ecartsNombreNumerosMax) // Limiter le nombre
      .map(ecart => ecart.numero);

    setNumerosSelectionnes(filteredNumbers);
  };

  const handleNiveauUrgenceToggle = (niveau: 'critique' | 'eleve' | 'moyen' | 'faible' | 'melange-optimal') => {
    const newNiveaux = config.ecartsNiveauUrgence.includes(niveau)
      ? config.ecartsNiveauUrgence.filter(n => n !== niveau)
      : [...config.ecartsNiveauUrgence, niveau];

    onConfigChange({
      ...config,
      ecartsNiveauUrgence: newNiveaux
    });
  };

  const handleSeuilChange = (type: 'critique' | 'eleve' | 'moyen' | 'faible', value: number) => {
    onConfigChange({
      ...config,
      [`ecartsSeui${type.charAt(0).toUpperCase() + type.slice(1)}`]: value
    });
  };

  const handleNombreMaxChange = (value: number) => {
    onConfigChange({
      ...config,
      ecartsNombreNumerosMax: Math.max(5, Math.min(25, value))
    });
  };

  const getNiveauColor = (niveau: 'critique' | 'eleve' | 'moyen' | 'faible' | 'melange-optimal') => {
    switch (niveau) {
      case 'critique': return 'bg-red-100 text-red-800 border-red-300';
      case 'eleve': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'moyen': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'faible': return 'bg-green-100 text-green-800 border-green-300';
      case 'melange-optimal': return 'bg-purple-100 text-purple-800 border-purple-300';
    }
  };

  const getNiveauIcon = (niveau: 'critique' | 'eleve' | 'moyen' | 'faible' | 'melange-optimal') => {
    switch (niveau) {
      case 'critique': return '🚨';
      case 'eleve': return '⚠️';
      case 'moyen': return '⏰';
      case 'faible': return '✅';
      case 'melange-optimal': return '🎯';
    }
  };

  const calculateCombinations = () => {
    if (numerosSelectionnes.length < 5) return 0;
    
    // Calcul C(n,5) × 10
    const n = numerosSelectionnes.length;
    const combinations = (n * (n-1) * (n-2) * (n-3) * (n-4)) / (5 * 4 * 3 * 2 * 1);
    return combinations * 10;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* En-tête */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Configuration Écarts de Sortie</h2>
                <p className="text-orange-100">Personnalisez la stratégie des numéros en retard</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Panneau de configuration */}
          <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
            <div className="space-y-6">
              
              {/* Activation générale */}
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Settings className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Activation de la Stratégie</h3>
                </div>
                
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={config.includeEcartsRetard}
                    onChange={(e) => onConfigChange({
                      ...config,
                      includeEcartsRetard: e.target.checked
                    })}
                    className="w-5 h-5 text-orange-600 rounded"
                  />
                  <div>
                    <div className="font-medium">Activer les Écarts de Sortie</div>
                    <div className="text-sm text-gray-600">
                      Privilégier les numéros en retard selon leur historique
                    </div>
                  </div>
                </label>
              </div>

              {/* Niveaux d'urgence */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  Niveaux d'Urgence à Inclure
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {(['critique', 'eleve', 'moyen', 'faible', 'melange-optimal'] as const).map(niveau => (
                    <label
                      key={niveau}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        config.ecartsNiveauUrgence.includes(niveau)
                          ? getNiveauColor(niveau)
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={config.ecartsNiveauUrgence.includes(niveau)}
                        onChange={() => handleNiveauUrgenceToggle(niveau)}
                        className="w-4 h-4 rounded"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getNiveauIcon(niveau)}</span>
                        <span className="font-medium">
                          {niveau === 'melange-optimal' ? 'Mélange Optimal' : niveau.charAt(0).toUpperCase() + niveau.slice(1)}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
                
                {/* Description du Mélange Optimal */}
                {config.ecartsNiveauUrgence.includes('melange-optimal') && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🎯</span>
                      <span className="font-semibold text-purple-800">Mélange Optimal Activé</span>
                    </div>
                    <p className="text-sm text-purple-700">
                      Sélection intelligente basée sur l'analyse statistique des sorties combinées. 
                      Privilégie les numéros selon les patterns de sortie observés historiquement 
                      entre différents niveaux d'écart.
                    </p>
                  </div>
                )}
              </div>

              {/* Seuils personnalisés */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Seuils d'Écart Personnalisés
                </h3>
                
                {/* Indicateur d'adaptation automatique */}
                <div className="mb-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Seuils Adaptatifs Intelligents</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Période : <strong>{analysisPeriod}</strong> → Seuils ajustés selon la taille de l'historique
                  </p>
                  <div className="text-xs text-blue-600 mt-1">
                    {analysisPeriod === 'all' && '📊 Historique complet : seuils élevés pour détecter les vrais retards'}
                    {analysisPeriod === 'last20' && '⚡ 20 derniers : seuils bas pour les tendances récentes'}
                    {analysisPeriod === 'last100' && '📈 100 derniers : seuils moyens pour l\'équilibre'}
                    {analysisPeriod === 'year' && '📅 Dernière année : seuils modérés sur 12 mois'}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🚨 Seuil Critique (tirages)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={config.ecartsSeuilCritique}
                      onChange={(e) => handleSeuilChange('critique', parseInt(e.target.value) || 15)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ⚠️ Seuil Élevé (tirages)
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="50"
                      value={config.ecartsSeuilEleve}
                      onChange={(e) => handleSeuilChange('eleve', parseInt(e.target.value) || 10)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ⏰ Seuil Moyen (tirages)
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="30"
                      value={config.ecartsSeuilMoyen}
                      onChange={(e) => handleSeuilChange('moyen', parseInt(e.target.value) || 5)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ✅ Seuil Faible (tirages)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={config.ecartsSeuilFaible}
                      onChange={(e) => handleSeuilChange('faible', parseInt(e.target.value) || 2)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Tableau complet des seuils pour toutes les périodes */}
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-600" />
                    Tableau des Seuils par Période
                  </h3>
                  <button
                    onClick={() => setShowAllThresholds(!showAllThresholds)}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    {showAllThresholds ? 'Masquer' : 'Afficher'}
                  </button>
                </div>
                
                {showAllThresholds && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-purple-200">
                          <th className="text-left p-2 font-medium text-purple-800">Période</th>
                          <th className="text-center p-2 font-medium text-red-700">🚨 Critique</th>
                          <th className="text-center p-2 font-medium text-orange-700">⚠️ Élevé</th>
                          <th className="text-center p-2 font-medium text-yellow-700">⏰ Moyen</th>
                          <th className="text-center p-2 font-medium text-green-700">✅ Faible</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(getPeriodSettings()).map(([period, settings]) => (
                          <tr key={period} className={`border-b border-purple-100 ${
                            period === analysisPeriod ? 'bg-purple-100' : 'hover:bg-purple-50'
                          }`}>
                            <td className="p-2 font-medium">
                              {period === analysisPeriod && '👉 '}
                              {period === 'week' && 'Semaine'}
                              {period === 'month' && 'Mois'}  
                              {period === 'year' && 'Année'}
                              {period === 'all' && 'Historique Complet'}
                              {period === 'last20' && '20 Derniers'}
                              {period === 'last50' && '50 Derniers'}
                              {period === 'last100' && '100 Derniers'}
                            </td>
                            <td className="text-center p-2 font-mono text-red-600">{settings.critique}</td>
                            <td className="text-center p-2 font-mono text-orange-600">{settings.eleve}</td>
                            <td className="text-center p-2 font-mono text-yellow-600">{settings.moyen}</td>
                            <td className="text-center p-2 font-mono text-green-600">{settings.faible}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    <div className="mt-3 p-3 bg-purple-100 rounded-lg">
                      <div className="text-xs text-purple-700">
                        <strong>Explication :</strong> Un numéro est considéré en retard "Critique" s'il n'est pas sorti depuis le nombre de tirages indiqué.
                        <br />
                        <strong>Période actuelle :</strong> {analysisPeriod} → Les seuils sont automatiquement adaptés à la taille de votre période d'analyse.
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={adjustSeuilsForPeriod}
                          className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                        >
                          🔄 Réappliquer les seuils automatiques
                        </button>
                        <button
                          onClick={() => {
                            // Seuils conservateurs pour toutes les périodes
                            const conservativeSettings = {
                              critique: Math.round(config.ecartsSeuilCritique * 0.7),
                              eleve: Math.round(config.ecartsSeuilEleve * 0.7),
                              moyen: Math.round(config.ecartsSeuilMoyen * 0.7),
                              faible: Math.round(config.ecartsSeuilFaible * 0.7)
                            };
                            onConfigChange({
                              ...config,
                              ecartsSeuilCritique: conservativeSettings.critique,
                              ecartsSeuilEleve: conservativeSettings.eleve,
                              ecartsSeuilMoyen: conservativeSettings.moyen,
                              ecartsSeuilFaible: conservativeSettings.faible
                            });
                          }}
                          className="px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
                        >
                          📉 Réduire les seuils (-30%)
                        </button>
                        <button
                          onClick={() => {
                            // Seuils plus élevés
                            const higherSettings = {
                              critique: Math.round(config.ecartsSeuilCritique * 1.5),
                              eleve: Math.round(config.ecartsSeuilEleve * 1.5),
                              moyen: Math.round(config.ecartsSeuilMoyen * 1.5),
                              faible: Math.round(config.ecartsSeuilFaible * 1.5)
                            };
                            onConfigChange({
                              ...config,
                              ecartsSeuilCritique: higherSettings.critique,
                              ecartsSeuilEleve: higherSettings.eleve,
                              ecartsSeuilMoyen: higherSettings.moyen,
                              ecartsSeuilFaible: higherSettings.faible
                            });
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          📈 Augmenter les seuils (+50%)
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Nombre maximum de numéros */}
              <div className="bg-green-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Limitation des Numéros
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre maximum de numéros sélectionnés
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="5"
                      max="25"
                      value={config.ecartsNombreNumerosMax}
                      onChange={(e) => handleNombreMaxChange(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <div className="bg-white px-3 py-1 rounded border font-mono text-lg">
                      {config.ecartsNombreNumerosMax}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Plus le nombre est élevé, plus vous avez de combinaisons possibles
                  </p>
                </div>
              </div>

              {/* Options avancées */}
              <div className="bg-purple-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Options Avancées
                </h3>
                
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={config.ecartsConsidererHistorique}
                    onChange={(e) => onConfigChange({
                      ...config,
                      ecartsConsidererHistorique: e.target.checked
                    })}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <div>
                    <div className="font-medium">Considérer l'historique complet</div>
                    <div className="text-sm text-gray-600">
                      Utiliser tout l'historique pour calculer les écarts moyens
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Panneau de prévisualisation */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <div className="space-y-6">
              
              {/* Impact sur les combinaisons */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Impact sur les Combinaisons
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {numerosSelectionnes.length}
                    </div>
                    <div className="text-sm text-gray-600">Numéros sélectionnés</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {calculateCombinations().toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Combinaisons possibles</div>
                  </div>
                </div>
                
                <div className="mt-3 p-2 bg-white/50 rounded text-sm text-center">
                  {numerosSelectionnes.length >= 5 ? (
                    <span className="text-green-700">
                      ✅ Configuration valide pour génération
                    </span>
                  ) : (
                    <span className="text-red-700">
                      ❌ Au moins 5 numéros requis
                    </span>
                  )}
                </div>
              </div>

              {/* Numéros sélectionnés */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Numéros Sélectionnés ({numerosSelectionnes.length})
                </h3>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-600">Chargement des données...</p>
                  </div>
                ) : numerosSelectionnes.length > 0 ? (
                  <div className="grid grid-cols-5 gap-2">
                    {numerosSelectionnes.map(numero => {
                      const ecartInfo = ecartsData.find(e => e.numero === numero);
                      return (
                        <div
                          key={numero}
                          className={`p-3 rounded-lg text-center border-2 ${
                            ecartInfo ? getNiveauColor(ecartInfo.niveauUrgence) : 'bg-gray-100 border-gray-300'
                          }`}
                        >
                          <div className="font-bold text-lg">{numero}</div>
                          {ecartInfo && (
                            <div className="text-xs mt-1">
                              {ecartInfo.ecartActuel} tirages
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Aucun numéro sélectionné avec la configuration actuelle
                  </div>
                )}
              </div>

              {/* Répartition par niveau */}
              {numerosSelectionnes.length > 0 && (
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Répartition par Niveau</h3>
                  
                  <div className="space-y-3">
                    {(['critique', 'eleve', 'moyen', 'faible', 'melange-optimal'] as const).map(niveau => {
                      const count = numerosSelectionnes.filter(num => 
                        ecartsData.find(e => e.numero === num)?.niveauUrgence === niveau
                      ).length;
                      
                      if (count === 0) return null;
                      
                      return (
                        <div key={niveau} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getNiveauIcon(niveau)}</span>
                            <span className="font-medium">
                              {niveau === 'melange-optimal' ? 'Mélange Optimal' : niveau.charAt(0).toUpperCase() + niveau.slice(1)}
                            </span>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getNiveauColor(niveau)}`}>
                            {count} numéro{count > 1 ? 's' : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            <span>Période d'analyse : {analysisPeriod} • {ecartsData.length} numéros analysés</span>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Annuler
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
            >
              Appliquer
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
