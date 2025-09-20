'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target,
  Zap,
  Save,
  Star,
  ArrowRight,
  CheckCircle,
  Calendar,
  DollarSign,
  Settings,
  X
} from 'lucide-react';
import SimpleUnifiedAnalysis from './SimpleUnifiedAnalysis';
import DreamyProgressBar from './DreamyProgressBar';
import ActionButtons from './ActionButtons';
import { savedGridsManager } from '../lib/saved-grids-manager';

interface BeginnerInterfaceProps {
  globalAnalysisPeriod: string;
}

interface SelectedNumbers {
  numbers: number[];
  complementary: number[];
  source: string;
}

interface SimpleGrid {
  id: number;
  numbers: number[];
  cost: number;
}

export default function BeginnerInterface({ globalAnalysisPeriod }: BeginnerInterfaceProps) {
  const [currentStep, setCurrentStep] = useState<'select' | 'generate' | 'save'>('select');
  const [selectedNumbers, setSelectedNumbers] = useState<SelectedNumbers | null>(null);
  const [generatedGrids, setGeneratedGrids] = useState<SimpleGrid[]>([]);
  const [includeSecondTirage, setIncludeSecondTirage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModeDetails, setShowModeDetails] = useState(false);
  const [showManualSelection, setShowManualSelection] = useState(false);
  const [selectionChoiceMade, setSelectionChoiceMade] = useState(false);

  // Charger les numéros sélectionnés
  useEffect(() => {
    const saved = localStorage.getItem('selectedNumbers');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setSelectedNumbers(data);
        if (data.numbers.length >= 5) {
          setCurrentStep('generate');
        }
      } catch (error) {
        console.error('Erreur chargement numéros:', error);
      }
    }
  }, []);

  const handleNumberSelection = (numbers: number[], complementary: number[], source: string) => {
    const selection = { numbers, complementary, source };
    setSelectedNumbers(selection);
    setCurrentStep('generate');
    
    // Sauvegarder pour les autres composants
    localStorage.setItem('selectedNumbers', JSON.stringify({
      numbers,
      complementary,
      source,
      timestamp: new Date().toISOString(),
      period: globalAnalysisPeriod
    }));
  };

  const generateSimpleGrids = async () => {
    if (!selectedNumbers || selectedNumbers.numbers.length < 5) return;
    
    setIsGenerating(true);
    
    try {
      // Simuler la génération avec un délai
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const grids: SimpleGrid[] = [];
      const numbers = selectedNumbers.numbers;
      
      // Générer 5 grilles simples optimisées
      for (let i = 0; i < 5; i++) {
        // Algorithme simple : prendre 5 numéros de manière équilibrée
        const gridNumbers: number[] = [];
        const step = Math.floor(numbers.length / 5);
        
        for (let j = 0; j < 5; j++) {
          const index = (i + j * step + Math.floor(Math.random() * 2)) % numbers.length;
          if (!gridNumbers.includes(numbers[index])) {
            gridNumbers.push(numbers[index]);
          }
        }
        
        // Compléter si nécessaire
        while (gridNumbers.length < 5) {
          const randomNum = numbers[Math.floor(Math.random() * numbers.length)];
          if (!gridNumbers.includes(randomNum)) {
            gridNumbers.push(randomNum);
          }
        }
        
        grids.push({
          id: i + 1,
          numbers: gridNumbers.sort((a, b) => a - b),
          cost: includeSecondTirage ? 3.00 : 2.20
        });
      }
      
      setGeneratedGrids(grids);
      setCurrentStep('save');
      
    } catch (error) {
      console.error('Erreur génération:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveGrids = () => {
    if (!selectedNumbers || generatedGrids.length === 0) return;
    
    const sessionName = `Grilles Débutant - ${new Date().toLocaleDateString()}`;
    const gameDate = getNextGameDate();
    
    const savedGrids = generatedGrids.map(grid => ({
      id: `grid_${grid.id}`,
      numbers: grid.numbers,
      complementary: selectedNumbers.complementary[0],
      cost: grid.cost,
      type: 'simple' as const,
      strategy: 'Mode Débutant'
    }));
    
    try {
      savedGridsManager.saveGameSession(
        sessionName,
        gameDate,
        selectedNumbers.numbers,
        savedGrids,
        'Mode Débutant'
      );
      
      alert(`✅ ${generatedGrids.length} grilles sauvegardées pour le ${gameDate} !`);
      
      // Réinitialiser pour une nouvelle session
      setCurrentStep('select');
      setGeneratedGrids([]);
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
    }
  };

  const getNextGameDate = (): string => {
    const today = new Date();
    const nextWednesday = new Date(today);
    const daysUntilWednesday = (3 - today.getDay() + 7) % 7;
    if (daysUntilWednesday === 0 && today.getHours() >= 20) {
      nextWednesday.setDate(today.getDate() + 7);
    } else {
      nextWednesday.setDate(today.getDate() + daysUntilWednesday);
    }
    return nextWednesday.toISOString().split('T')[0];
  };

  const resetToStart = () => {
    setCurrentStep('select');
    setSelectedNumbers(null);
    setGeneratedGrids([]);
    setShowManualSelection(false);
    setSelectionChoiceMade(false);
    localStorage.removeItem('selectedNumbers');
  };

  // Handler pour sélection IA (existante)
  const handleSelectAI = () => {
    // L'interface IA existante s'affichera
    setShowManualSelection(false);
    setSelectionChoiceMade(true);
  };

  // Handler pour sélection manuelle
  const handleSelectManual = () => {
    setShowManualSelection(true);
    setSelectionChoiceMade(true);
  };

  // Handler pour génération
  const handleGenerate = async () => {
    if (!selectedNumbers) return;
    
    setCurrentStep('generate');
    await generateSimpleGrids();
  };

  // Handler pour sauvegarde
  const handleSave = () => {
    if (generatedGrids.length === 0) return;
    
    setCurrentStep('save');
    // La logique de sauvegarde existante s'exécutera
  };

  const handleComplexityChange = (newLevel: ComplexityLevel) => {
    setShowComplexitySelector(false);
    // Recharger la page pour appliquer le nouveau niveau
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* En-tête Mode Débutant - Cliquable */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="beginner-header"
        onClick={() => setShowModeDetails(true)}
      >
        <div className="text-4xl mb-4">🌱</div>
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          Mode Débutant
          <Settings className="w-6 h-6 opacity-70" />
        </h1>
      </motion.div>

      {/* Barre de progression - seulement après choix */}
      {selectionChoiceMade && (
        <DreamyProgressBar 
          currentStep={currentStep}
          onReset={resetToStart}
        />
      )}

      {/* Boutons d'action - seulement si pas encore de choix */}
      {!selectionChoiceMade && (
        <ActionButtons
          currentStep={currentStep}
          onSelectAI={handleSelectAI}
          onSelectManual={handleSelectManual}
          onGenerate={handleGenerate}
          onSave={handleSave}
          hasSelection={selectedNumbers !== null}
          hasGenerated={generatedGrids.length > 0}
        />
      )}

      {/* Interface d'analyse IA - seulement après avoir choisi IA */}
      {currentStep === 'select' && !showManualSelection && selectionChoiceMade && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <Target className="w-8 h-8 text-purple-600" />
              🤖 Analyse IA en Cours...
            </h2>
            <p className="text-gray-600 mb-6">
              L'intelligence artificielle analyse 49 ans d'historique pour vous proposer les meilleurs numéros.
            </p>
          </div>
          
          <SimpleUnifiedAnalysis 
            analysisPeriod={globalAnalysisPeriod}
            onNumberSelection={handleNumberSelection}
          />
        </motion.div>
      )}

      {/* Interface de sélection manuelle */}
      {currentStep === 'select' && showManualSelection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200"
        >
          <h3 className="text-2xl font-bold text-emerald-800 mb-4 text-center">
            🎲 Choisissez Vos Numéros Chanceux
          </h3>
          <p className="text-emerald-600 text-center mb-6">
            Sélectionnez 5 numéros entre 1 et 49, puis 1 numéro chance entre 1 et 10
          </p>
          
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <p className="text-gray-600 text-center">
              🚧 Interface de sélection manuelle ludique en cours de développement...
            </p>
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowManualSelection(false)}
                className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Retour à la sélection IA
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {currentStep === 'generate' && selectedNumbers && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <Zap className="w-8 h-8 text-emerald-600" />
              Étape 2 : Générez vos Grilles
            </h2>
            
            {/* Vos numéros sélectionnés */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-3">
                ✅ Vos {selectedNumbers.numbers.length} Numéros Sélectionnés
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {selectedNumbers.numbers.map((num, index) => (
                  <div key={index} className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    {num}
                  </div>
                ))}
              </div>
            </div>

            {/* Option Second Tirage */}
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-green-800">🎯 Option Second Tirage</h4>
                  <p className="text-sm text-green-700">Doublez vos chances pour +0.80€ par grille</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSecondTirage}
                    onChange={(e) => setIncludeSecondTirage(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>

            {/* Génération */}
            <div className="text-center">
              <button
                onClick={generateSimpleGrids}
                disabled={isGenerating}
                className={`px-8 py-4 rounded-xl text-white font-bold text-lg transition-all ${
                  isGenerating 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg hover:shadow-xl'
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Génération en cours...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="w-6 h-6" />
                    Générer 5 Grilles Optimisées
                  </div>
                )}
              </button>
              
              <p className="text-sm text-gray-500 mt-2">
                Coût total: {(5 * (includeSecondTirage ? 3.00 : 2.20)).toFixed(2)}€
                {includeSecondTirage && ' (avec second tirage)'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {currentStep === 'save' && generatedGrids.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <Save className="w-8 h-8 text-green-600" />
              Étape 3 : Vos Grilles Prêtes !
            </h2>
            
            {/* Grilles générées */}
            <div className="space-y-4 mb-6">
              {generatedGrids.map((grid) => (
                <div
                  key={grid.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      #{grid.id}
                    </div>
                    <div className="flex gap-2">
                      {grid.numbers.map((num, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">{grid.cost.toFixed(2)}€</div>
                    {includeSecondTirage && (
                      <div className="text-xs text-green-600">+ Second Tirage</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Résumé */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-blue-600 font-semibold">Grilles</div>
                  <div className="text-2xl font-bold text-blue-800">{generatedGrids.length}</div>
                </div>
                <div>
                  <div className="text-blue-600 font-semibold">Coût Total</div>
                  <div className="text-2xl font-bold text-blue-800">
                    {generatedGrids.reduce((sum, g) => sum + g.cost, 0).toFixed(2)}€
                  </div>
                </div>
                <div>
                  <div className="text-blue-600 font-semibold">Prochaine Session</div>
                  <div className="text-lg font-bold text-blue-800">
                    {new Date(getNextGameDate()).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setCurrentStep('generate')}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
              >
                ← Modifier les Grilles
              </button>
              <button
                onClick={saveGrids}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Sauvegarder pour Jouer
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Aide contextuelle */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-amber-600">💡</div>
          <span className="font-semibold text-amber-800">Aide</span>
        </div>
        <p className="text-amber-700 text-sm">
          {currentStep === 'select' && "Cliquez sur 'Lancer l'Analyse Intelligente' pour que l'IA sélectionne automatiquement les meilleurs numéros."}
          {currentStep === 'generate' && "L'IA va créer 5 grilles optimisées basées sur vos numéros sélectionnés. Vous pouvez activer le Second Tirage pour plus de chances."}
          {currentStep === 'save' && "Sauvegardez vos grilles pour pouvoir les contrôler automatiquement après le tirage officiel."}
        </p>
      </div>

      {/* Modale Détails du Mode Débutant */}
      {showModeDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">🌱 Mode Débutant</h3>
              <button
                onClick={() => setShowModeDetails(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Interface simple et guidée pour débuter avec l'analyse du loto.
              </p>
              
              <div className="bg-emerald-50 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-800 mb-2">Fonctionnalités disponibles :</h4>
                <ul className="space-y-1 text-sm text-emerald-700">
                  <li>• Analyse intelligente automatique</li>
                  <li>• Génération de grilles simples</li>
                  <li>• Interface guidée étape par étape</li>
                  <li>• Sauvegarde basique des grilles</li>
                  <li>• Option Second Tirage</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Processus en 3 étapes :</h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <div><strong>1. Sélectionner</strong> : L'IA choisit automatiquement les meilleurs numéros</div>
                  <div><strong>2. Générer</strong> : Création de 5 grilles optimisées</div>
                  <div><strong>3. Sauvegarder</strong> : Sauvegarde pour contrôle après tirage</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
