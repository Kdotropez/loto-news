'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  Zap, 
  Target, 
  Brain, 
  TrendingUp,
  Info,
  Star,
  Shield,
  RefreshCw
} from 'lucide-react';

interface StrategyCoherencePanelProps {
  config: {
    includeHotNumbers: boolean;
    includeColdNumbers: boolean;
    includeHotColdHybrid: boolean;
    includeEcartsRetard?: boolean;
    includePatterns: boolean;
    includeTemporalPatterns: boolean;
    includeMathematical: boolean;
    includeRules: boolean;
    includeAdvanced: boolean;
    selectedPatterns: string[];
  };
  hotNumbers: number[];
  coldNumbers: number[];
  onRecommendationApply?: (recommendations: string[]) => void;
}

export default function StrategyCoherencePanel({ 
  config, 
  hotNumbers, 
  coldNumbers, 
  onRecommendationApply 
}: StrategyCoherencePanelProps) {
  const [coherenceAnalysis, setCoherenceAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    analyzeCoherence();
  }, [config, hotNumbers, coldNumbers]);

  const analyzeCoherence = async () => {
    setIsLoading(true);
    try {
      // Simuler l'analyse de cohérence
      // En réalité, on appellerait l'API avec le moteur de cohérence
      const mockAnalysis = {
        conflitsDetectes: detectConflicts(),
        synergiesDetectees: detectSynergies(),
        scoreGlobalCoherence: calculateGlobalScore(),
        recommandationsOptimisation: generateRecommendations()
      };
      
      setCoherenceAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Erreur analyse cohérence:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const detectConflicts = () => {
    const conflits = [];

    // Conflit majeur : Chauds + Froids sans hybride
    if (config.includeHotNumbers && config.includeColdNumbers && !config.includeHotColdHybrid) {
      conflits.push({
        type: 'majeur',
        strategies: ['Numéros Chauds', 'Numéros Froids'],
        description: 'Stratégies contradictoires activées simultanément',
        resolution: 'Activez Hot-Cold Hybride ou désactivez une stratégie'
      });
    }

    // Conflit mineur : Trop de patterns
    if (config.includePatterns && config.selectedPatterns.length > 4) {
      conflits.push({
        type: 'mineur',
        strategies: ['Patterns Historiques'],
        description: `${config.selectedPatterns.length} patterns sélectionnés (risque de sur-contrainte)`,
        resolution: 'Réduisez à 3-4 patterns maximum pour plus de flexibilité'
      });
    }

    // Conflit mineur : Écarts + Chauds
    if (config.includeEcartsRetard && config.includeHotNumbers) {
      conflits.push({
        type: 'mineur',
        strategies: ['Écarts de Sortie', 'Numéros Chauds'],
        description: 'Possible contradiction entre retard et fréquence',
        resolution: 'Priorisation automatique selon les scores individuels'
      });
    }

    return conflits;
  };

  const detectSynergies = () => {
    const synergies = [];

    // Synergie : Écarts + Hot-Cold Hybride
    if (config.includeEcartsRetard && config.includeHotColdHybrid) {
      synergies.push({
        strategies: ['Écarts de Sortie', 'Hot-Cold Hybride'],
        description: 'Combinaison optimale timing + équilibre',
        bonus: 15
      });
    }

    // Synergie : Patterns + Mathématiques
    if (config.includePatterns && config.includeMathematical) {
      synergies.push({
        strategies: ['Patterns', 'Mathématiques'],
        description: 'Double validation historique + logique',
        bonus: 10
      });
    }

    // Synergie : Écarts + Patterns temporels
    if (config.includeEcartsRetard && config.includeTemporalPatterns) {
      synergies.push({
        strategies: ['Écarts', 'Patterns Temporels'],
        description: 'Analyse temporelle complète',
        bonus: 12
      });
    }

    return synergies;
  };

  const calculateGlobalScore = () => {
    const conflits = detectConflicts();
    const synergies = detectSynergies();
    
    let score = 100;
    score -= conflits.filter(c => c.type === 'majeur').length * 25;
    score -= conflits.filter(c => c.type === 'mineur').length * 10;
    score += synergies.reduce((sum, s) => sum + s.bonus, 0);
    
    return Math.max(0, Math.min(100, score));
  };

  const generateRecommendations = () => {
    const conflits = detectConflicts();
    const recommandations = [];

    if (conflits.some(c => c.type === 'majeur')) {
      recommandations.push('🚨 Résolvez les conflits majeurs pour optimiser les résultats');
    }

    if (config.includeEcartsRetard && !config.includeHotColdHybrid) {
      recommandations.push('💡 Activez Hot-Cold Hybride pour une synergie optimale');
    }

    if (!config.includePatterns && !config.includeMathematical) {
      recommandations.push('📊 Ajoutez des patterns ou stratégies mathématiques pour plus de précision');
    }

    if (recommandations.length === 0) {
      recommandations.push('✅ Configuration optimale détectée !');
    }

    return recommandations;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5" />;
    if (score >= 60) return <Info className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Analyse de cohérence...</span>
        </div>
      </div>
    );
  }

  if (!coherenceAnalysis) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
    >
      {/* En-tête avec score global */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${getScoreColor(coherenceAnalysis.scoreGlobalCoherence)}`}>
            {getScoreIcon(coherenceAnalysis.scoreGlobalCoherence)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Cohérence des Stratégies</h3>
            <p className="text-sm text-gray-600">Score global : {coherenceAnalysis.scoreGlobalCoherence}/100</p>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {showDetails ? 'Masquer' : 'Détails'}
        </button>
      </div>

      {/* Résumé rapide */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{coherenceAnalysis.conflitsDetectes.length}</div>
          <div className="text-xs text-red-600">Conflits</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{coherenceAnalysis.synergiesDetectees.length}</div>
          <div className="text-xs text-green-600">Synergies</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{coherenceAnalysis.scoreGlobalCoherence}</div>
          <div className="text-xs text-blue-600">Score/100</div>
        </div>
      </div>

      {/* Recommandations principales */}
      <div className="space-y-2">
        {coherenceAnalysis.recommandationsOptimisation.slice(0, 2).map((rec: string, index: number) => (
          <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-sm">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <span className="text-blue-800">{rec}</span>
          </div>
        ))}
      </div>

      {/* Détails étendus */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-gray-200 space-y-4"
        >
          {/* Conflits détaillés */}
          {coherenceAnalysis.conflitsDetectes.length > 0 && (
            <div>
              <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Conflits Détectés
              </h4>
              {coherenceAnalysis.conflitsDetectes.map((conflit: any, index: number) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  conflit.type === 'majeur' ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'
                }`}>
                  <div className="font-medium text-gray-900">{conflit.description}</div>
                  <div className="text-sm text-gray-600 mt-1">💡 {conflit.resolution}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Stratégies : {conflit.strategies.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Synergies détaillées */}
          {coherenceAnalysis.synergiesDetectees.length > 0 && (
            <div>
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Synergies Actives
              </h4>
              {coherenceAnalysis.synergiesDetectees.map((synergie: any, index: number) => (
                <div key={index} className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <div className="font-medium text-gray-900">{synergie.description}</div>
                  <div className="text-sm text-green-600 mt-1">
                    +{synergie.bonus} points de bonus
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Stratégies : {synergie.strategies.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Toutes les recommandations */}
          <div>
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Recommandations d'Optimisation
            </h4>
            {coherenceAnalysis.recommandationsOptimisation.map((rec: string, index: number) => (
              <div key={index} className="p-2 bg-blue-50 rounded text-sm text-blue-800">
                {rec}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

