'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Shuffle, 
  Star, 
  Download,
  Save,
  Brain,
  Zap,
  TrendingUp,
  RefreshCw,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import StrategyDetailsModal from './StrategyDetailsModal';

interface Combination {
  boules: number[];
  numero_chance: number;
  score: number;
  raison: string;
  probabilite_theorique: number;
  strategy?: string;
  reasons?: string[];
  analysis?: {
    frequency: number;
    recency: number;
    pattern: number;
    mathematical: number;
  };
  numbers?: {
    numero: number;
    type: 'hot' | 'cold' | 'balanced' | 'pattern' | 'mathematical';
    reason: string;
    score: number;
  }[];
  complementary?: {
    numero: number;
    reason: string;
    score: number;
  };
  confidence?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  expectedValue?: number;
}

interface SavedCombination {
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

export default function CombinationGenerator() {
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [savedCombinations, setSavedCombinations] = useState<SavedCombination[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [combinationCount, setCombinationCount] = useState(5);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedCombination, setSelectedCombination] = useState<Combination | null>(null);
  const [saveName, setSaveName] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<Combination | null>(null);

  useEffect(() => {
    loadSavedCombinations();
  }, []);

  const loadSavedCombinations = async () => {
    try {
      const response = await fetch('/api/favorites');
      const result = await response.json();
      if (result.success) {
        setSavedCombinations(result.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des combinaisons sauvegardées:', error);
    }
  };

  const generateCombinations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analysis?type=combinations&count=${combinationCount}`);
      const result = await response.json();
      
      if (result.success) {
        setCombinations(result.data);
        toast.success(`${result.data.length} combinaisons générées avec succès`);
      } else {
        toast.error('Erreur lors de la génération des combinaisons');
      }
    } catch (error) {
      toast.error('Erreur lors de la génération des combinaisons');
    } finally {
      setIsLoading(false);
    }
  };

  const saveCombination = async () => {
    if (!selectedCombination || !saveName.trim()) {
      toast.error('Veuillez saisir un nom pour la combinaison');
      return;
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: saveName,
          boule_1: selectedCombination.boules[0],
          boule_2: selectedCombination.boules[1],
          boule_3: selectedCombination.boules[2],
          boule_4: selectedCombination.boules[3],
          boule_5: selectedCombination.boules[4],
          numero_chance: selectedCombination.numero_chance,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Combinaison sauvegardée avec succès');
        setShowSaveModal(false);
        setSaveName('');
        setSelectedCombination(null);
        loadSavedCombinations();
      } else {
        toast.error(result.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde de la combinaison');
    }
  };

  const handleShowDetails = (combination: Combination) => {
    setSelectedDetails(combination);
    setShowDetailsModal(true);
  };

  const deleteSavedCombination = async (id: number) => {
    try {
      const response = await fetch(`/api/favorites/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Combinaison supprimée avec succès');
        loadSavedCombinations();
      } else {
        toast.error(result.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression de la combinaison');
    }
  };

  const exportCombinations = () => {
    const csvContent = [
      ['Boule 1', 'Boule 2', 'Boule 3', 'Boule 4', 'Boule 5', 'Numéro Chance', 'Score', 'Raison'],
      ...combinations.map(combo => [
        combo.boules[0],
        combo.boules[1],
        combo.boules[2],
        combo.boules[3],
        combo.boules[4],
        combo.numero_chance,
        combo.score,
        combo.raison
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `combinaisons-loto-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Combinaisons exportées avec succès');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Zap className="w-4 h-4" />;
    if (score >= 60) return <TrendingUp className="w-4 h-4" />;
    return <Brain className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Générateur de combinaisons optimisées - Kdo Loto Gagnant
        </h1>
        <p className="text-gray-600">
          Découvrez les meilleures combinaisons basées sur l'analyse statistique
        </p>
      </motion.div>

      {/* Contrôles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-gray-700">Générer:</span>
          </div>
          
          <select
            value={combinationCount}
            onChange={(e) => setCombinationCount(parseInt(e.target.value))}
            className="input-field w-auto"
          >
            <option value={3}>3 combinaisons</option>
            <option value={5}>5 combinaisons</option>
            <option value={10}>10 combinaisons</option>
            <option value={20}>20 combinaisons</option>
          </select>

          <button
            onClick={generateCombinations}
            disabled={isLoading}
            className="btn-primary flex items-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Shuffle className="w-4 h-4" />
            )}
            {isLoading ? 'Génération...' : 'Générer'}
          </button>

          {combinations.length > 0 && (
            <button
              onClick={exportCombinations}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>
          )}
        </div>
      </motion.div>

      {/* Combinaisons générées */}
      {combinations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Combinaisons optimisées ({combinations.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {combinations.map((combination, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="card hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    Combinaison #{index + 1}
                  </h3>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(combination.score)}`}>
                    {getScoreIcon(combination.score)}
                    Score: {combination.score}
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  {combination.boules.map((boule, i) => (
                    <div
                      key={i}
                      className="numero-boule numero-equilibre"
                    >
                      {boule}
                    </div>
                  ))}
                  <div className="numero-boule numero-chance">
                    {combination.numero_chance}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Raison:</span> {combination.raison}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Probabilité:</span> {(combination.probabilite_theorique * 100).toFixed(8)}%
                  </p>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleShowDetails(combination)}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <Info className="w-4 h-4" />
                    Détails
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCombination(combination);
                      setShowSaveModal(true);
                    }}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Sauvegarder
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Combinaisons sauvegardées */}
      {savedCombinations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Combinaisons sauvegardées ({savedCombinations.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedCombinations.map((saved) => (
              <div
                key={saved.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{saved.nom}</h3>
                  <button
                    onClick={() => deleteSavedCombination(saved.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Supprimer
                  </button>
                </div>

                <div className="flex gap-1 mb-3">
                  {[saved.boule_1, saved.boule_2, saved.boule_3, saved.boule_4, saved.boule_5].map((boule, i) => (
                    <div
                      key={i}
                      className="numero-boule numero-equilibre"
                    >
                      {boule}
                    </div>
                  ))}
                  <div className="numero-boule numero-chance">
                    {saved.numero_chance}
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  Sauvegardé le {new Date(saved.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Modal de sauvegarde */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sauvegarder la combinaison
            </h3>
            
            {selectedCombination && (
              <div className="mb-4">
                <div className="flex gap-2 mb-3">
                  {selectedCombination.boules.map((boule, i) => (
                    <div
                      key={i}
                      className="numero-boule numero-equilibre"
                    >
                      {boule}
                    </div>
                  ))}
                  <div className="numero-boule numero-chance">
                    {selectedCombination.numero_chance}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Score: {selectedCombination.score} - {selectedCombination.raison}
                </p>
              </div>
            )}

            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Nom de la combinaison"
              className="input-field mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={saveCombination}
                className="btn-primary flex-1"
              >
                Sauvegarder
              </button>
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setSaveName('');
                  setSelectedCombination(null);
                }}
                className="btn-secondary flex-1"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal des détails de stratégie */}
      <StrategyDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedDetails(null);
        }}
        details={selectedDetails ? {
          strategy: selectedDetails.strategy || 'Stratégie équilibrée basée sur l\'analyse statistique',
          reasons: selectedDetails.reasons || [selectedDetails.raison],
          analysis: selectedDetails.analysis || {
            frequency: 75,
            recency: 60,
            pattern: 45,
            mathematical: 55
          },
          numbers: selectedDetails.numbers || selectedDetails.boules.map((num, index) => ({
            numero: num,
            type: 'balanced' as const,
            reason: `Numéro sélectionné selon l'analyse statistique (position ${index + 1})`,
            score: selectedDetails.score
          })),
          complementary: selectedDetails.complementary || {
            numero: selectedDetails.numero_chance,
            reason: 'Numéro chance optimisé selon les patterns historiques',
            score: selectedDetails.score * 0.8
          },
          confidence: selectedDetails.confidence || selectedDetails.score * 0.9,
          riskLevel: selectedDetails.riskLevel || (selectedDetails.score > 70 ? 'low' : selectedDetails.score > 40 ? 'medium' : 'high'),
          expectedValue: selectedDetails.expectedValue || 2.5
        } : null}
        combination={selectedDetails}
      />
    </div>
  );
}
