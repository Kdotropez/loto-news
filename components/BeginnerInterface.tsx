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
import { ComplexityLevel } from '../lib/complexity-manager';

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
  const [includeSecondTirage, setIncludeSecondTirage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModeDetails, setShowModeDetails] = useState(false);
  const [showManualSelection, setShowManualSelection] = useState(false);
  const [selectionChoiceMade, setSelectionChoiceMade] = useState(false);
  const [selectedMainNumbers, setSelectedMainNumbers] = useState<number[]>([]);
  const [selectedComplementaryNumbers, setSelectedComplementaryNumbers] = useState<number[]>([]);
  
  // State for grid generation
  const [showGridGeneration, setShowGridGeneration] = useState(false);
  const [gridOptions, setGridOptions] = useState({
    numberOfGrids: 1,
    gridType: 'simple', // 'simple' ou 'multiple'
    secondDraw: false
  });
  const [generatedGrids, setGeneratedGrids] = useState<Array<{
    id: number;
    numbers: number[];
    complementary: number;
    cost: number;
  }>>([]);
  const [showGeneratedGrids, setShowGeneratedGrids] = useState(false);

  // Fonctions de sélection
  const handleMainNumberClick = (number: number) => {
    if (selectedMainNumbers.includes(number)) {
      // Désélectionner
      setSelectedMainNumbers(prev => prev.filter(n => n !== number));
    } else {
      // Sélectionner (pas de limite, on peut choisir autant qu'on veut)
      setSelectedMainNumbers(prev => [...prev, number]);
    }
  };

  const handleComplementaryNumberClick = (number: number) => {
    if (selectedComplementaryNumbers.includes(number)) {
      // Désélectionner
      setSelectedComplementaryNumbers(prev => prev.filter(n => n !== number));
    } else {
      // Sélectionner (pas de limite, on peut choisir autant qu'on veut)
      setSelectedComplementaryNumbers(prev => [...prev, number]);
    }
  };

  const isMainNumberSelected = (number: number) => selectedMainNumbers.includes(number);
  const isComplementaryNumberSelected = (number: number) => selectedComplementaryNumbers.includes(number);

  // Fonction de génération de grilles
  const generateGrids = () => {
    const grids = [];
    const baseCost = gridOptions.gridType === 'simple' ? 2.20 : 2.20; // Prix de base
    const secondDrawCost = gridOptions.secondDraw ? 0.80 : 0;
    const totalCostPerGrid = baseCost + secondDrawCost;

    for (let i = 0; i < gridOptions.numberOfGrids; i++) {
      let gridNumbers: number[] = [];
      
      if (gridOptions.gridType === 'simple') {
        // Grilles simples : sélection aléatoire de 5 numéros parmi les sélectionnés
        if (selectedMainNumbers.length === 5) {
          gridNumbers = [...selectedMainNumbers];
        } else {
          // Mélanger et prendre 5 numéros
          const shuffled = [...selectedMainNumbers].sort(() => Math.random() - 0.5);
          gridNumbers = shuffled.slice(0, 5);
        }
      } else {
        // Grilles multiples : utiliser tous les numéros sélectionnés
        gridNumbers = [...selectedMainNumbers];
      }

      // Sélectionner un numéro complémentaire aléatoire
      const randomComplementary = selectedComplementaryNumbers[Math.floor(Math.random() * selectedComplementaryNumbers.length)];

      grids.push({
        id: i + 1,
        numbers: gridNumbers.sort((a, b) => a - b),
        complementary: randomComplementary,
        cost: totalCostPerGrid
      });
    }

    setGeneratedGrids(grids);
    setShowGeneratedGrids(true);
  };

  // Calcul du prix total
  const getTotalCost = () => {
    if (generatedGrids.length === 0) return 0;
    return generatedGrids.reduce((sum, grid) => sum + grid.cost, 0);
  };

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

  // Handler pour changer de mode de sélection
  const handleSwitchSelection = () => {
    setShowManualSelection(!showManualSelection);
  };


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* En-tête Mode Débutant - Loto de Rêve */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="container-pastel-teal relative overflow-hidden rounded-3xl p-8 cursor-pointer shadow-2xl hover:shadow-3xl transition-all duration-500"
        onClick={() => setShowModeDetails(true)}
        whileHover={{ scale: 1.02, rotateX: 5 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Boules de loto flottantes en arrière-plan */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl opacity-20"
              style={{
                left: `${10 + i * 6}%`,
                top: `${15 + (i % 4) * 20}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 360],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 4 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            >
              {i % 5 === 0 ? '🎱' : i % 5 === 1 ? '🟢' : i % 5 === 2 ? '🔵' : i % 5 === 3 ? '🟡' : '🔴'}
            </motion.div>
          ))}
        </div>

        {/* Étoiles filantes */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute text-2xl text-teal-400"
              style={{
                left: `${20 + i * 10}%`,
                top: `${10 + (i % 3) * 30}%`,
              }}
              animate={{
                x: [0, 100, -50, 0],
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1.5, 1, 0.5]
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            >
              ⭐
            </motion.div>
          ))}
        </div>

        {/* Aura magique tournante */}
        <motion.div
          className="absolute inset-0 bg-gradient-conic from-teal-200/30 via-transparent to-teal-300/30"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Contenu principal */}
        <div className="relative z-10 text-center">
          {/* Icône centrale animée */}
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
              y: [0, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-7xl mb-6 filter drop-shadow-2xl"
          >
            🎰
          </motion.div>

          {/* Titre avec effet de brillance */}
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4 text-teal-800 relative"
            animate={{
              textShadow: [
                "0 0 20px rgba(20, 184, 166, 0.5)",
                "0 0 40px rgba(20, 184, 166, 0.8)",
                "0 0 20px rgba(20, 184, 166, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✨ Mode Débutant ✨
          </motion.h1>

          {/* Sous-titre magique */}
          <motion.p 
            className="text-xl text-teal-700 font-semibold mb-4"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            🍀 Votre Premier Pas vers la Fortune 🍀
          </motion.p>

          {/* Badge interactif */}
          <motion.div 
            className="inline-flex items-center gap-2 bg-teal-100/80 backdrop-blur rounded-full px-6 py-3 text-teal-800 font-bold shadow-lg"
            whileHover={{ scale: 1.05 }}
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(20, 184, 166, 0.3)",
                "0 0 40px rgba(20, 184, 166, 0.6)",
                "0 0 20px rgba(20, 184, 166, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Settings className="w-5 h-5" />
            Cliquez pour découvrir la magie
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎪
            </motion.div>
          </motion.div>
        </div>

        {/* Particules flottantes */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute text-sm text-teal-300"
              style={{
                left: `${5 + i * 8}%`,
                top: `${5 + (i % 5) * 18}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 5 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            >
              {i % 6 === 0 ? '💫' : i % 6 === 1 ? '✨' : i % 6 === 2 ? '🌟' : i % 6 === 3 ? '⭐' : i % 6 === 4 ? '💎' : '🎯'}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Barre de progression - seulement après choix */}
      {selectionChoiceMade && (
        <DreamyProgressBar 
          currentStep={currentStep}
          onReset={resetToStart}
          isManualSelection={showManualSelection}
          onSwitchSelection={handleSwitchSelection}
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

      {/* Interface d'analyse IA - Machine à Sous Magique */}
      {currentStep === 'select' && !showManualSelection && selectionChoiceMade && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="container-pastel-pink relative overflow-hidden rounded-3xl p-6 md:p-8 shadow-2xl border-3"
        >
          {/* Casino Background avec lumières clignotantes */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Projecteurs rotatifs */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`spotlight-${i}`}
                className="absolute w-2 bg-gradient-to-t from-transparent via-pink-300/40 to-transparent"
                style={{
                  left: `${12.5 * i}%`,
                  top: '0',
                  height: '100%',
                  transformOrigin: 'top',
                  transform: `rotate(${i * 45}deg)`,
                }}
                animate={{
                  opacity: [0.2, 0.8, 0.2],
                  scaleY: [0.5, 1.2, 0.5]
                }}
                transition={{
                  duration: 3 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
              />
            ))}

            {/* Pluie de pièces d'or */}
            {[...Array(25)].map((_, i) => (
              <motion.div
                key={`coin-${i}`}
                className="absolute text-2xl opacity-30"
                style={{
                  left: `${4 + i * 3.5}%`,
                  top: '-10%',
                }}
                animate={{
                  y: [0, 500],
                  rotate: [0, 720],
                  scale: [1, 0.5],
                  opacity: [0.3, 0.8, 0]
                }}
                transition={{
                  duration: 6 + i * 0.2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
              >
                {i % 5 === 0 ? '🪙' : i % 5 === 1 ? '💰' : i % 5 === 2 ? '💎' : i % 5 === 3 ? '🎰' : '⭐'}
              </motion.div>
            ))}
          </div>

          {/* Header de Casino Magique */}
          <div className="relative z-10 text-center mb-8">
            {/* Enseigne lumineuse */}
            <motion.div
              className="relative inline-block"
              animate={{
                textShadow: [
                  "0 0 20px rgba(236, 72, 153, 0.8)",
                  "0 0 40px rgba(236, 72, 153, 1)",
                  "0 0 60px rgba(236, 72, 153, 0.8)",
                  "0 0 20px rgba(236, 72, 153, 0.8)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-pink-800 mb-2">
                🎰 CASINO IA 🎰
              </h1>
            </motion.div>

            {/* Sous-titre clignotant */}
            <motion.p 
              className="text-xl md:text-2xl text-pink-700 font-bold mb-4"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ✨ Machine Prophétique des Numéros Chanceux ✨
            </motion.p>

            {/* Compteur de jackpot */}
            <motion.div
              className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-2xl shadow-xl border-4 border-yellow-300"
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 20px rgba(251, 191, 36, 0.5)",
                  "0 0 40px rgba(251, 191, 36, 0.8)",
                  "0 0 20px rgba(251, 191, 36, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-sm font-bold">💰 JACKPOT ANALYSIS 💰</div>
              <div className="text-lg font-black">49 ANS DE DONNÉES</div>
            </motion.div>
          </div>

          {/* Machine à sous centrale */}
          <div className="relative z-10 mb-8">
            <motion.div
              className="bg-gradient-to-b from-pink-600 to-pink-800 rounded-3xl p-6 shadow-2xl border-4 border-pink-300 mx-auto max-w-2xl"
              animate={{ 
                y: [0, -5, 0],
                boxShadow: [
                  "0 10px 30px rgba(236, 72, 153, 0.3)",
                  "0 20px 50px rgba(236, 72, 153, 0.5)",
                  "0 10px 30px rgba(236, 72, 153, 0.3)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {/* Écran de la machine */}
              <div className="bg-black rounded-2xl p-4 mb-4 border-4 border-yellow-400">
                <div className="text-center">
                  <motion.div
                    className="text-green-400 text-xl font-mono font-bold mb-2"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {'>'} ANALYSE EN COURS...
                  </motion.div>
                  
                  {/* Rouleaux de numéros qui tournent */}
                  <div className="flex justify-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={`reel-${i}`}
                        className="bg-yellow-400 text-black w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold border-2 border-yellow-600"
                        animate={{ 
                          rotateX: [0, 360],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 0.5 + i * 0.1, 
                          repeat: Infinity,
                          delay: i * 0.2 
                        }}
                      >
                        {Math.floor(Math.random() * 49) + 1}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Levier de la machine */}
              <div className="flex justify-end">
                <motion.div
                  className="bg-red-500 w-6 h-16 rounded-full border-4 border-red-700 shadow-lg relative"
                  animate={{ 
                    rotateZ: [0, -30, 0],
                    x: [0, 5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-600 rounded-full border-2 border-red-800"></div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Interface d'analyse intégrée */}
          <div className="relative z-10">
            <SimpleUnifiedAnalysis 
              analysisPeriod={globalAnalysisPeriod}
              onNumberSelection={handleNumberSelection}
            />
          </div>

          {/* Effets de particules sur les bords */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`border-sparkle-${i}`}
                className="absolute text-pink-300 text-lg"
                style={{
                  left: i < 8 ? '2%' : '98%',
                  top: `${10 + (i % 8) * 10}%`,
                }}
                animate={{
                  scale: [0, 1.5, 0],
                  rotate: [0, 360],
                  opacity: [0, 1, 0],
                  x: i < 8 ? [0, 20, 0] : [0, -20, 0]
                }}
                transition={{
                  duration: 2 + i * 0.2,
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
              >
                ✨
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Interface de Génération de Grilles */}
      {showGridGeneration && (
        <div className="fixed inset-0 bg-gradient-to-br from-amber-300/80 via-orange-300/70 to-yellow-400/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          {/* Particules magiques flottantes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
          
          <motion.div
            className="container-pastel-amber rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            {/* Header Magique */}
            <div className="text-center mb-6 md:mb-8">
              <motion.div
                className="inline-block"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="text-4xl md:text-6xl mb-2">🎰</div>
              </motion.div>
              
                  <h2 className="text-2xl md:text-3xl font-bold text-amber-800 mb-2">
                    ✨ GÉNÉRATION DE GRILLES ✨
                  </h2>
                  <p className="text-amber-600 text-sm md:text-base">
                    🎪 Configurez vos grilles magiques 🎪
                  </p>
            </div>

            {/* Résumé de la sélection */}
            <div className="bg-white/30 backdrop-blur rounded-xl p-4 mb-6">
              <h3 className="text-amber-800 font-bold text-lg mb-3">🎯 Votre Sélection :</h3>
              <div className="flex flex-wrap gap-2">
                {selectedMainNumbers.map(num => (
                  <span key={num} className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {num}
                  </span>
                ))}
                {selectedComplementaryNumbers.length > 0 && (
                  <>
                    <span className="text-amber-800 font-bold">+</span>
                    {selectedComplementaryNumbers.map(num => (
                      <span key={num} className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {num}
                      </span>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Options de génération */}
            <div className="space-y-6">
               {/* Nombre de grilles */}
               <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                 <h3 className="text-amber-800 font-bold text-lg mb-4">🎲 Nombre de grilles :</h3>
                 
                 {/* Sélection rapide */}
                 <div className="mb-4">
                   <p className="text-amber-700 text-sm mb-2">💡 Sélection rapide (recommandé) :</p>
                   <div className="flex flex-wrap gap-2">
                     {[1, 2, 3, 5, 10, 20].map(num => (
                       <motion.button
                         key={num}
                         className={`px-4 py-2 rounded-lg font-bold text-sm md:text-base ${
                               gridOptions.numberOfGrids === num
                                 ? 'bg-gray-600 text-white shadow-lg'
                                 : 'bg-white/80 text-gray-700 hover:bg-gray-200'
                         }`}
                         onClick={() => setGridOptions(prev => ({ ...prev, numberOfGrids: num }))}
                         whileHover={{ scale: 1.05 }}
                         whileTap={{ scale: 0.95 }}
                       >
                         {num} grille{num > 1 ? 's' : ''}
                       </motion.button>
                     ))}
                   </div>
                 </div>
                 
                 {/* Sélection libre */}
                 <div className="flex items-center gap-3">
                   <label className="text-amber-700 font-semibold">🎯 Ou choisissez librement :</label>
                   <input
                     type="number"
                     min="1"
                     max="100"
                     value={gridOptions.numberOfGrids}
                     onChange={(e) => setGridOptions(prev => ({ ...prev, numberOfGrids: Math.max(1, parseInt(e.target.value) || 1) }))}
                     className="w-20 px-3 py-2 rounded-lg border-2 border-amber-300 bg-white/90 text-center font-bold text-amber-800"
                   />
                   <span className="text-amber-600 text-sm">grilles</span>
                 </div>
                 
                 {/* Conseils */}
                 <div className="mt-3 p-3 bg-amber-100/50 rounded-lg">
                   <p className="text-amber-700 text-xs">
                     💡 <strong>Conseils :</strong> 1-3 grilles (débutant), 5-10 grilles (équilibré), 20+ grilles (expert)
                   </p>
                 </div>
               </div>

              {/* Type de génération */}
              <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                <h3 className="text-amber-800 font-bold text-lg mb-4">🎪 Type de génération :</h3>
                
                {/* Case à cocher Grilles Simples */}
                <div className="flex items-center justify-between p-4 bg-green-50/80 rounded-xl border-2 border-green-200 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🎯</div>
                    <div>
                      <div className="font-bold text-green-800">Grilles Simples</div>
                      <div className="text-sm text-green-600">
                        {selectedMainNumbers.length === 5 && selectedComplementaryNumbers.length === 1 ? '2,20 € par grille' : 'Sélection aléatoire'}
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gridOptions.gridType === 'simple'}
                      onChange={(e) => setGridOptions(prev => ({ ...prev, gridType: e.target.checked ? 'simple' : 'multiple' }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                {/* Case à cocher Grilles Multiples */}
                <div className={`flex items-center justify-between p-4 rounded-xl border-2 mb-4 ${
                  selectedMainNumbers.length >= 6 
                    ? 'bg-blue-50/80 border-blue-200' 
                    : 'bg-gray-50/80 border-gray-200 opacity-60'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🎰</div>
                    <div>
                      <div className={`font-bold ${selectedMainNumbers.length >= 6 ? 'text-blue-800' : 'text-gray-600'}`}>
                        Grilles Multiples
                      </div>
                      <div className={`text-sm ${selectedMainNumbers.length >= 6 ? 'text-blue-600' : 'text-gray-500'}`}>
                        {selectedMainNumbers.length >= 6 
                          ? `${selectedMainNumbers.length} n° → 31 formats possibles` 
                          : 'Minimum 6 numéros requis'}
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gridOptions.gridType === 'multiple'}
                      disabled={selectedMainNumbers.length < 6}
                      onChange={(e) => setGridOptions(prev => ({ ...prev, gridType: e.target.checked ? 'multiple' : 'simple' }))}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 ${
                      selectedMainNumbers.length >= 6 ? 'bg-gray-200' : 'bg-gray-300 cursor-not-allowed'
                    }`}></div>
                  </label>
                </div>
              </div>

              {/* Second tirage */}
              <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                <h3 className="text-amber-800 font-bold text-lg mb-4">🌟 Second tirage :</h3>
                
                <div className="flex items-center justify-between p-4 bg-orange-50/80 rounded-xl border-2 border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🎲</div>
                    <div>
                      <div className="font-bold text-orange-800">Second Tirage</div>
                      <div className="text-sm text-orange-600">
                        Doublez vos chances pour + 0,80 € par grille
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gridOptions.secondDraw}
                      onChange={(e) => setGridOptions(prev => ({ ...prev, secondDraw: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <motion.button
                className={`flex-1 py-4 rounded-xl font-bold text-lg shadow-lg ${
                  selectedMainNumbers.length >= 5 && selectedComplementaryNumbers.length >= 1
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-xl'
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
                 onClick={() => {
                   if (selectedMainNumbers.length >= 5 && selectedComplementaryNumbers.length >= 1) {
                     generateGrids();
                   }
                 }}
                disabled={selectedMainNumbers.length < 5 || selectedComplementaryNumbers.length < 1}
                whileHover={{ scale: selectedMainNumbers.length >= 5 && selectedComplementaryNumbers.length >= 1 ? 1.02 : 1 }}
                whileTap={{ scale: selectedMainNumbers.length >= 5 && selectedComplementaryNumbers.length >= 1 ? 0.98 : 1 }}
              >
                🎰 GÉNÉRER LES GRILLES 🎰
              </motion.button>
              
              <motion.button
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg"
                onClick={() => setShowGridGeneration(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🔙 RETOUR
              </motion.button>
            </div>
          </motion.div>
        </div>
       )}

       {/* Interface d'affichage des grilles générées */}
       {showGeneratedGrids && generatedGrids.length > 0 && (
         <div className="fixed inset-0 bg-gradient-to-br from-green-300/80 via-emerald-300/70 to-teal-400/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           {/* Particules magiques flottantes */}
           <div className="absolute inset-0 overflow-hidden pointer-events-none">
             {[...Array(25)].map((_, i) => (
               <motion.div
                 key={i}
                 className="absolute w-2 h-2 bg-white/40 rounded-full"
                 style={{
                   left: `${Math.random() * 100}%`,
                   top: `${Math.random() * 100}%`,
                 }}
                 animate={{
                   y: [0, -30, 0],
                   opacity: [0.3, 0.8, 0.3],
                   scale: [0.5, 1, 0.5],
                 }}
                 transition={{
                   duration: 3 + Math.random() * 2,
                   repeat: Infinity,
                   delay: Math.random() * 2,
                 }}
               />
             ))}
           </div>
           
           <motion.div
             className="bg-white/95 backdrop-blur rounded-3xl p-6 md:p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
             initial={{ opacity: 0, scale: 0.8, y: 50 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.8, y: 50 }}
             transition={{ duration: 0.5, type: "spring" }}
           >
             {/* Header */}
             <div className="text-center mb-6">
               <motion.div
                 className="inline-block"
                 animate={{ rotate: [0, 5, -5, 0] }}
                 transition={{ duration: 4, repeat: Infinity }}
               >
                 <div className="text-4xl md:text-6xl mb-2">🎰</div>
               </motion.div>
               
               <h2 className="text-2xl md:text-3xl font-bold text-green-800 mb-2">
                 ✨ VOS GRILLES GÉNÉRÉES ✨
               </h2>
               <p className="text-green-600 text-sm md:text-base">
                 🎪 Prêtes pour le tirage ! 🎪
               </p>
             </div>

             {/* Résumé du prix */}
             <div className="bg-green-100 rounded-xl p-4 mb-6 text-center">
               <div className="text-green-800 font-bold text-lg">
                 💰 Prix Total : {getTotalCost().toFixed(2)} €
               </div>
               <div className="text-green-600 text-sm">
                 {generatedGrids.length} grille{generatedGrids.length > 1 ? 's' : ''} • 
                 {gridOptions.secondDraw ? ' Avec second tirage' : ' Tirage unique'}
               </div>
             </div>

             {/* Grilles */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
               {generatedGrids.map((grid) => (
                 <motion.div
                   key={grid.id}
                   className="bg-gradient-to-br from-white to-green-50 rounded-xl p-3 border-2 border-green-200 shadow-lg"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: grid.id * 0.1 }}
                 >
                   {/* En-tête de la grille */}
                   <div className="text-center mb-2">
                     <div className="text-sm font-bold text-green-800">Grille #{grid.id}</div>
                     <div className="text-xs text-green-600">{grid.cost.toFixed(2)} €</div>
                   </div>

                   {/* Numéros principaux et complémentaire en ligne */}
                   <div className="text-center">
                     <div className="text-xs font-semibold text-green-700 mb-2">Numéros</div>
                     <div className="flex flex-wrap justify-center gap-1">
                       {/* Numéros principaux */}
                       {grid.numbers.map((number, index) => (
                         <motion.div
                           key={index}
                           className="w-8 h-8 rounded-full border-2 border-green-300 flex items-center justify-center text-black text-sm font-bold shadow-md"
                           style={{
                             background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(34,197,94,0.9), #16a34a)`
                           }}
                           animate={{ scale: [1, 1.05, 1] }}
                           transition={{ delay: index * 0.05, duration: 0.2 }}
                         >
                           {number}
                         </motion.div>
                       ))}
                       
                       {/* Séparateur */}
                       <div className="w-2 h-8 flex items-center justify-center">
                         <span className="text-gray-500 text-xs">+</span>
                       </div>
                       
                       {/* Numéro complémentaire */}
                       <motion.div
                         className="w-8 h-8 rounded-full border-2 border-blue-300 flex items-center justify-center text-black text-sm font-bold shadow-md"
                         style={{
                           background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(59,130,246,0.9), #2563eb)`
                         }}
                         animate={{ scale: [1, 1.05, 1] }}
                         transition={{ delay: 0.3, duration: 0.2 }}
                       >
                         {grid.complementary}
                       </motion.div>
                     </div>
                   </div>
                 </motion.div>
               ))}
             </div>

             {/* Information sur la sauvegarde */}
             <div className="bg-blue-50 rounded-xl p-4 mb-4 text-center">
               <div className="text-blue-800 font-semibold mb-2">💾 Où va la sauvegarde ?</div>
               <div className="text-blue-600 text-sm">
                 📱 <strong>LocalStorage du navigateur</strong> - Vos grilles sont sauvegardées dans votre téléphone/ordinateur<br/>
                 🔄 <strong>Persistance</strong> - Accessibles même après fermeture de l'app<br/>
                 📋 <strong>Vérification</strong> - Consultez vos grilles après le tirage officiel
               </div>
             </div>

             {/* Boutons d'action */}
             <div className="flex flex-col md:flex-row gap-4 justify-center">
               <motion.button
                 className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg"
                 onClick={() => {
                   // Sauvegarder les grilles
                   const sessionName = `Grilles Loto - ${new Date().toLocaleDateString()}`;
                   const gameDate = getNextGameDate();
                   
                   const savedGrids = generatedGrids.map(grid => ({
                     id: `grid_${grid.id}`,
                     numbers: grid.numbers,
                     complementary: grid.complementary,
                     cost: grid.cost,
                     type: (gridOptions.gridType === 'simple' ? 'simple' : 'multiple') as 'simple' | 'multiple',
                     strategy: 'Mode Débutant'
                   }));
                   
                   try {
                     savedGridsManager.saveGameSession(
                       sessionName,
                       gameDate,
                       selectedMainNumbers,
                       savedGrids,
                       'Mode Débutant'
                     );
                     
                     alert(`✅ ${generatedGrids.length} grilles sauvegardées pour le ${gameDate} !\n\n💾 Sauvegardé dans le navigateur\n📱 Accessible même hors ligne\n🔍 Vérifiez après le tirage officiel`);
                     
                     // Réinitialiser
                     setShowGeneratedGrids(false);
                     setShowGridGeneration(false);
                     setSelectedMainNumbers([]);
                     setSelectedComplementaryNumbers([]);
                     
                   } catch (error) {
                     console.error('Erreur sauvegarde:', error);
                     alert('❌ Erreur lors de la sauvegarde');
                   }
                 }}
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
               >
                 💾 SAUVEGARDER
               </motion.button>
               
               <motion.button
                 className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-bold shadow-lg"
                 onClick={() => setShowGeneratedGrids(false)}
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
               >
                 🔙 RETOUR
               </motion.button>
             </div>
           </motion.div>
         </div>
       )}

       {/* Interface de sélection manuelle - Salle de Bingo Magique */}
      {currentStep === 'select' && showManualSelection && !showGridGeneration && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="container-pastel-amber relative overflow-hidden rounded-3xl p-6 md:p-8 shadow-2xl border-3"
        >
          {/* Ambiance de Bingo Hall */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Guirlandes lumineuses */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`light-${i}`}
                className="absolute w-4 h-4 rounded-full"
                style={{
                  left: `${8.33 * i}%`,
                  top: i % 2 === 0 ? '5%' : '10%',
                  background: `hsl(${i * 30}, 80%, 60%)`
                }}
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.6, 1, 0.6],
                  boxShadow: [
                    `0 0 10px hsl(${i * 30}, 80%, 60%)`,
                    `0 0 20px hsl(${i * 30}, 80%, 60%)`,
                    `0 0 10px hsl(${i * 30}, 80%, 60%)`
                  ]
                }}
                transition={{
                  duration: 1.5 + i * 0.1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}

            {/* Boules de bingo flottantes */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`bingo-ball-${i}`}
                className="absolute text-3xl opacity-25"
                style={{
                  left: `${5 + i * 4.5}%`,
                  top: `${15 + (i % 6) * 12}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 360],
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                  duration: 5 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              >
                {i % 6 === 0 ? '🔴' : i % 6 === 1 ? '🟡' : i % 6 === 2 ? '🟢' : i % 6 === 3 ? '🔵' : i % 6 === 4 ? '🟣' : '⚪'}
              </motion.div>
            ))}
          </div>

          {/* Header de Bingo Hall - Compact Mobile */}
          <div className="relative z-10 text-center mb-4 md:mb-8">
            {/* Enseigne vintage - Réduite sur mobile */}
            <motion.div
              className="relative inline-block"
              animate={{
                textShadow: [
                  "0 0 15px rgba(245, 158, 11, 0.6)",
                  "0 0 25px rgba(245, 158, 11, 0.8)",
                  "0 0 15px rgba(245, 158, 11, 0.6)"
                ]
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <h1 className="text-2xl md:text-5xl font-bold text-amber-800 mb-1 md:mb-2">
                🎪 BINGO MAGIQUE 🎪
              </h1>
            </motion.div>

            {/* Sous-titre - Masqué sur mobile */}
            <motion.p 
              className="hidden md:block text-xl md:text-2xl text-amber-700 font-bold mb-4"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨ Salle des Numéros Porte-Bonheur ✨
            </motion.p>

            {/* Panneau d'instruction - Compact mobile */}
            <motion.div
              className="inline-block bg-gradient-to-r from-red-500 to-orange-600 text-white px-3 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl shadow-xl border-2 md:border-4 border-red-300"
              animate={{ 
                scale: [1, 1.02, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="text-xs md:text-sm font-bold">🎯 CHOISISSEZ VOS NUMÉROS 🎯</div>
            </motion.div>
          </div>

          {/* Cage à boules centrale - Ultra-compact mobile */}
          <div className="relative z-10 mb-4 md:mb-8">
            <motion.div
              className="bg-gradient-to-b from-rose-500 to-pink-600 rounded-2xl md:rounded-3xl p-3 md:p-6 shadow-2xl border-2 md:border-4 border-rose-300 mx-auto max-w-sm md:max-w-3xl"
              animate={{ 
                y: [0, -2, 0],
                boxShadow: [
                  "0 5px 20px rgba(245, 158, 11, 0.3)",
                  "0 10px 30px rgba(245, 158, 11, 0.5)",
                  "0 5px 20px rgba(245, 158, 11, 0.3)"
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              {/* Grille interactive - Compacte */}
              <div className="bg-gradient-to-b from-transparent to-rose-100/30 rounded-xl md:rounded-2xl p-3 md:p-6 mb-2 md:mb-4 border-2 md:border-4 border-rose-400">
                {/* Titre compact mobile */}
                <div className="text-center mb-3 md:mb-6">
                  <motion.div
                    className="text-amber-100 text-lg md:text-2xl font-bold mb-1 md:mb-2"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    🎰 GRILLE 🎰
                  </motion.div>
                </div>

                {/* Conteneur de sélection - EN HAUT */}
                <div className="max-w-2xl mx-auto mb-4">
                  <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl p-3 border-3 border-rose-300 shadow-xl">
                    <div className="text-center mb-3">
                      <h3 className="text-white text-sm font-bold">🎯 SÉLECTION ({selectedMainNumbers.length} numéros + {selectedComplementaryNumbers.length} complémentaires)</h3>
                    </div>
                    
                    {/* Affichage compact */}
                    <div className="flex flex-wrap justify-center gap-1">
                      {/* Numéros principaux */}
                      {selectedMainNumbers.map((number, i) => (
                        <motion.div
                          key={`main-${number}`}
                          className="w-8 h-8 rounded-full border border-rose-200 flex items-center justify-center text-white text-sm font-bold shadow-lg"
                          style={{
                            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(251,146,60,0.9), #ea580c)`
                          }}
                          animate={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {number}
                        </motion.div>
                      ))}
                      
                      {/* Séparateur */}
                      <div className="w-2 h-6 flex items-center justify-center">
                        <span className="text-white text-xs">+</span>
                      </div>
                      
                      {/* Numéros complémentaires */}
                      {selectedComplementaryNumbers.map((number, i) => (
                        <motion.div
                          key={`comp-${number}`}
                          className="w-8 h-8 rounded-full border border-rose-200 flex items-center justify-center text-white text-sm font-bold shadow-lg"
                          style={{
                            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(34,197,94,0.9), #16a34a)`
                          }}
                          animate={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {number}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Grille de numéros 1-49 - Colonnes par dizaines */}
                <div className="max-w-4xl mx-auto mb-6">
                  <div className="grid grid-cols-5 gap-3 md:gap-4">
                    {/* Colonne 1: 1-10 - ROUGE */}
                    <div className="space-y-2 md:space-y-2">
                      <div className="text-center text-amber-100 font-bold text-sm mb-2">1-10</div>
                      {[...Array(10)].map((_, i) => {
                        const number = i + 1;
                        return (
                        <motion.button
                          key={number}
                          className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-10 md:h-10 rounded-full font-bold text-sm shadow-lg cursor-pointer mx-auto"
                          style={{
                            background: isMainNumberSelected(number)
                              ? 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), rgba(0,0,0,0.9), #000000)'
                              : `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(59,130,246,0.9), #2563eb)`,
                            color: 'white',
                            border: isMainNumberSelected(number) ? '3px solid #ffffff' : '2px solid #1d4ed8',
                            boxShadow: isMainNumberSelected(number)
                              ? 'inset -2px -2px 4px rgba(0,0,0,0.3), 0 6px 12px rgba(0,0,0,0.6), 0 0 20px rgba(255,215,0,0.8)'
                              : 'inset -2px -2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.4)'
                          }}
                          whileHover={{ 
                            scale: 1.1, 
                            zIndex: 10,
                            boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.3), 0 6px 12px rgba(0,0,0,0.5)'
                          }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleMainNumberClick(number)}
                        >
                          <span className="relative z-10 text-shadow-lg">{number}</span>
                        </motion.button>
                        );
                      })}
                    </div>

                    {/* Colonne 2: 11-20 - ORANGE */}
                    <div className="space-y-2 md:space-y-2">
                      <div className="text-center text-amber-100 font-bold text-sm mb-2">11-20</div>
                      {[...Array(10)].map((_, i) => {
                        const number = i + 11;
                        return (
                          <motion.button
                            key={number}
                            className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-10 md:h-10 rounded-full font-bold text-sm shadow-lg cursor-pointer mx-auto"
                           style={{
                             background: isMainNumberSelected(number)
                               ? 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), rgba(0,0,0,0.9), #000000)'
                               : `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(249,115,22,0.9), #ea580c)`,
                             color: 'white',
                             border: isMainNumberSelected(number) ? '3px solid #ffffff' : '2px solid #c2410c',
                             boxShadow: isMainNumberSelected(number)
                               ? 'inset -2px -2px 4px rgba(0,0,0,0.3), 0 6px 12px rgba(0,0,0,0.6), 0 0 20px rgba(255,215,0,0.8)'
                               : 'inset -2px -2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.4)',
                             transform: isMainNumberSelected(number) ? 'scale(1.2)' : 'scale(1)',
                             zIndex: isMainNumberSelected(number) ? 20 : 1,
                             fontSize: isMainNumberSelected(number) ? '16px' : '14px'
                           }}
                            whileHover={{ 
                              scale: 1.1, 
                              zIndex: 10,
                              boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.3), 0 6px 12px rgba(0,0,0,0.5)'
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleMainNumberClick(number)}
                          >
                            <span className="relative z-10 text-shadow-lg">{number}</span>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Colonne 3: 21-30 - JAUNE */}
                    <div className="space-y-2 md:space-y-2">
                      <div className="text-center text-amber-100 font-bold text-sm mb-2">21-30</div>
                      {[...Array(10)].map((_, i) => {
                        const number = i + 21;
                        return (
                          <motion.button
                            key={number}
                            className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-10 md:h-10 rounded-full font-bold text-sm shadow-lg cursor-pointer mx-auto"
                           style={{
                             background: isMainNumberSelected(number)
                               ? 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), rgba(0,0,0,0.9), #000000)'
                               : `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(234,179,8,0.9), #ca8a04)`,
                             color: 'white',
                             border: isMainNumberSelected(number) ? '3px solid #ffffff' : '2px solid #a16207',
                             boxShadow: isMainNumberSelected(number)
                               ? 'inset -2px -2px 4px rgba(0,0,0,0.3), 0 6px 12px rgba(0,0,0,0.6), 0 0 20px rgba(255,215,0,0.8)'
                               : 'inset -2px -2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.4)',
                             transform: isMainNumberSelected(number) ? 'scale(1.2)' : 'scale(1)',
                             zIndex: isMainNumberSelected(number) ? 20 : 1,
                             fontSize: isMainNumberSelected(number) ? '16px' : '14px'
                           }}
                            whileHover={{ 
                              scale: 1.1, 
                              zIndex: 10,
                              boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.3), 0 6px 12px rgba(0,0,0,0.5)'
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleMainNumberClick(number)}
                          >
                            <span className="relative z-10 text-shadow-lg">{number}</span>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Colonne 4: 31-40 - VERT */}
                    <div className="space-y-2 md:space-y-2">
                      <div className="text-center text-amber-100 font-bold text-sm mb-2">31-40</div>
                      {[...Array(10)].map((_, i) => {
                        const number = i + 31;
                        return (
                          <motion.button
                            key={number}
                            className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-10 md:h-10 rounded-full font-bold text-sm shadow-lg cursor-pointer mx-auto"
                           style={{
                             background: isMainNumberSelected(number)
                               ? 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), rgba(0,0,0,0.9), #000000)'
                               : `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(34,197,94,0.9), #16a34a)`,
                             color: 'white',
                             border: isMainNumberSelected(number) ? '3px solid #ffffff' : '2px solid #15803d',
                             boxShadow: isMainNumberSelected(number)
                               ? 'inset -2px -2px 4px rgba(0,0,0,0.3), 0 6px 12px rgba(0,0,0,0.6), 0 0 20px rgba(255,215,0,0.8)'
                               : 'inset -2px -2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.4)',
                             transform: isMainNumberSelected(number) ? 'scale(1.2)' : 'scale(1)',
                             zIndex: isMainNumberSelected(number) ? 20 : 1,
                             fontSize: isMainNumberSelected(number) ? '16px' : '14px'
                           }}
                            whileHover={{ 
                              scale: 1.1, 
                              zIndex: 10,
                              boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.3), 0 6px 12px rgba(0,0,0,0.5)'
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleMainNumberClick(number)}
                          >
                            <span className="relative z-10 text-shadow-lg">{number}</span>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Colonne 5: 41-49 - BLEU */}
                    <div className="space-y-2 md:space-y-2">
                      <div className="text-center text-amber-100 font-bold text-sm mb-2">41-49</div>
                      {[...Array(9)].map((_, i) => {
                        const number = i + 41;
                        return (
                          <motion.button
                            key={number}
                            className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-10 md:h-10 rounded-full font-bold text-sm shadow-lg cursor-pointer mx-auto"
                          style={{
                            background: isMainNumberSelected(number)
                              ? 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), rgba(0,0,0,0.9), #000000)'
                              : `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(239,68,68,0.9), #dc2626)`,
                            color: 'white',
                            border: isMainNumberSelected(number) ? '3px solid #ffffff' : '2px solid #991b1b',
                            boxShadow: isMainNumberSelected(number)
                              ? 'inset -2px -2px 4px rgba(0,0,0,0.3), 0 6px 12px rgba(0,0,0,0.6), 0 0 20px rgba(255,215,0,0.8)'
                              : 'inset -2px -2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.4)',
                            transform: isMainNumberSelected(number) ? 'scale(1.2)' : 'scale(1)',
                            zIndex: isMainNumberSelected(number) ? 20 : 1,
                            fontSize: isMainNumberSelected(number) ? '16px' : '14px'
                          }}
                            whileHover={{ 
                              scale: 1.1, 
                              zIndex: 10,
                              boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.3), 0 6px 12px rgba(0,0,0,0.5)'
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleMainNumberClick(number)}
                          >
                            <span className="relative z-10 text-shadow-lg">{number}</span>
                          </motion.button>
                        );
                      })}
                      {/* Case vide pour la 50ème position */}
                      <div className="w-full h-10 rounded-full border-3 border-transparent" />
                    </div>
                  </div>
                </div>


                {/* Numéros complémentaires */}
                <div className="max-w-4xl mx-auto mb-6">
                  <div className="text-center mb-4">
                    <h3 className="text-amber-100 text-xl font-bold mb-2">🎯 NUMÉROS COMPLÉMENTAIRES</h3>
                     <p className="text-amber-200 text-sm">Sélectionnez vos numéros complémentaires (1-10)</p>
                  </div>
                  
                  {/* Grille des complémentaires */}
                  <div className="grid grid-cols-10 gap-2 md:gap-2">
                    {[...Array(10)].map((_, i) => {
                      const number = i + 1;
                      return (
                        <motion.button
                          key={`complementary-${number}`}
                          className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-8 md:h-8 rounded-full font-bold text-xs shadow-lg cursor-pointer"
                          style={{
                            background: isComplementaryNumberSelected(number)
                              ? `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(34,197,94,0.9), #16a34a)`
                              : `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(59,130,246,0.9), #2563eb)`,
                            color: 'white',
                            border: isComplementaryNumberSelected(number) ? '2px solid #15803d' : '2px solid #1d4ed8',
                            boxShadow: isComplementaryNumberSelected(number)
                              ? 'inset -2px -2px 4px rgba(0,0,0,0.3), 0 6px 12px rgba(0,0,0,0.6)'
                              : 'inset -2px -2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.4)',
                            transform: isComplementaryNumberSelected(number) ? 'scale(1.1)' : 'scale(1)',
                            zIndex: isComplementaryNumberSelected(number) ? 20 : 1,
                            fontSize: isComplementaryNumberSelected(number) ? '14px' : '12px'
                          }}
                          whileHover={{ 
                            scale: 1.1, 
                            zIndex: 10,
                            boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.3), 0 6px 12px rgba(0,0,0,0.5)'
                          }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleComplementaryNumberClick(number)}
                        >
                          <span className="relative z-10 text-shadow-lg">{number}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

         {/* Bouton de validation - Style Loto Magique */}
         <div className="max-w-2xl mx-auto mb-6">
           <div className="text-center">
             <motion.div
               className="relative"
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
             >
               {/* Aura dorée */}
               <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 rounded-2xl blur-lg opacity-60"></div>
               
               <motion.button
                 className="relative bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 text-black px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl border-3 border-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
                 style={{
                   background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)',
                   boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 8px 16px rgba(0,0,0,0.3)',
                   border: '3px solid #fbbf24'
                 }}
                  disabled={selectedMainNumbers.length < 5 || selectedComplementaryNumbers.length < 1}
                  onClick={() => {
                    // Valider la sélection et passer à la génération de grilles
                    console.log('Numéros sélectionnés:', selectedMainNumbers, selectedComplementaryNumbers);
                    setShowGridGeneration(true);
                  }}
               >
                 ✨ VALIDER MA SÉLECTION ✨
               </motion.button>
               
               {/* Particules dorées */}
               <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-300 rounded-full animate-pulse"></div>
               <div className="absolute -top-1 -right-3 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
               <div className="absolute -bottom-2 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
             </motion.div>
           </div>
         </div>

                {/* Compteur centré */}
                <div className="flex justify-center">
                  {/* Compteur de sélection - Style Magique */}
                  <motion.div
                    className="relative flex-shrink-0"
                    animate={{ 
                      scale: [1, 1.05, 1],
                      y: [0, -2, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {/* Aura turquoise */}
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 rounded-xl blur-md opacity-60"></div>
                    
                    <div
                      className="relative bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-2xl border-2 border-teal-300"
                      style={{
                        background: 'linear-gradient(135deg, #14b8a6, #06b6d4, #0d9488)',
                        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), 0 6px 12px rgba(20,184,166,0.4)'
                      }}
                    >
                       🎪 {selectedMainNumbers.length} numéros + {selectedComplementaryNumbers.length} complémentaires 🎪
                    </div>
                    
                    {/* Particules turquoise */}
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-teal-300 rounded-full animate-pulse"></div>
                  </motion.div>

                </div>
              </div>
            </motion.div>
          </div>


          {/* Instructions magiques - Masquées sur mobile */}
          <motion.div
            className="hidden md:block relative z-10 text-center"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="bg-amber-100/80 backdrop-blur rounded-2xl p-4 border-2 border-amber-300 max-w-md mx-auto">
              <h3 className="text-amber-800 font-bold text-lg mb-2">🎯 Comment jouer :</h3>
              <div className="text-amber-700 text-sm space-y-1">
                <p>• Cliquez sur 5 numéros porte-bonheur</p>
                <p>• Suivez votre intuition magique</p>
                <p>• Les couleurs guident votre chance</p>
                <p>• Validez votre sélection divine !</p>
              </div>
            </div>
          </motion.div>

          {/* Particules de chance - Réduites sur mobile */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`luck-particle-${i}`}
                className="absolute text-amber-400 text-lg md:text-xl"
                style={{
                  left: i < 3 ? '2%' : '98%',
                  top: `${20 + (i % 3) * 20}%`,
                }}
                animate={{
                  scale: [0, 1.5, 0],
                  rotate: [0, 360],
                  opacity: [0, 0.8, 0],
                  x: i < 3 ? [0, 20, 0] : [0, -20, 0]
                }}
                transition={{
                  duration: 3 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              >
                {i % 2 === 0 ? '🍀' : '✨'}
              </motion.div>
            ))}
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
            <div className="bg-orange-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-orange-800 mb-3">
                ✅ Vos {selectedNumbers.numbers.length} Numéros Sélectionnés
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {selectedNumbers.numbers.map((num, index) => (
                  <div key={index} className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
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
                    <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                      #{grid.id}
                    </div>
                    <div className="flex gap-2">
                      {grid.numbers.map((num, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 bg-orange-100 text-orange-800 rounded-full flex items-center justify-center text-sm font-bold"
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
            <div className="bg-orange-50 rounded-lg p-4 mb-6">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-orange-600 font-semibold">Grilles</div>
                  <div className="text-2xl font-bold text-orange-800">{generatedGrids.length}</div>
                </div>
                <div>
                  <div className="text-orange-600 font-semibold">Coût Total</div>
                  <div className="text-2xl font-bold text-orange-800">
                    {generatedGrids.reduce((sum, g) => sum + g.cost, 0).toFixed(2)}€
                  </div>
                </div>
                <div>
                  <div className="text-orange-600 font-semibold">Prochaine Session</div>
                  <div className="text-lg font-bold text-orange-800">
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


      {/* Modale Détails du Mode Débutant */}
      {showModeDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl max-w-lg w-full p-8 shadow-2xl border-4 border-emerald-200"
          >
            {/* Header magique */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-3xl"
                >
                  🌱
                </motion.div>
                <h3 className="text-2xl font-bold text-emerald-800">Mode Débutant</h3>
              </div>
              <button
                onClick={() => setShowModeDetails(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Description */}
              <div className="text-center">
                <p className="text-gray-700 text-lg">
                  ✨ Interface complète et magique pour maîtriser le loto ✨
                </p>
              </div>
              
              {/* Fonctionnalités */}
              <div className="bg-emerald-50 rounded-xl p-5 border-2 border-emerald-200">
                <h4 className="font-bold text-emerald-800 mb-4 text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Fonctionnalités disponibles :
                </h4>
                <div className="grid grid-cols-1 gap-2 text-sm text-emerald-700">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">🤖</span>
                    <span><strong>Sélection IA ou manuelle</strong> - Analyse intelligente ou Bingo interactif</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">🎰</span>
                    <span><strong>Grilles simples et multiples</strong> - Tous les formats de jeu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">🎪</span>
                    <span><strong>Bingo magique interactif</strong> - Sélection ludique des numéros</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">💾</span>
                    <span><strong>Sauvegarde intelligente</strong> - LocalStorage persistant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">🎲</span>
                    <span><strong>Second tirage</strong> - Option +0,80€ par grille</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">🎯</span>
                    <span><strong>Sélection flexible</strong> - 5+ numéros + complémentaires multiples</span>
                  </div>
                </div>
              </div>
              
              {/* Processus */}
              <div className="bg-orange-50 rounded-xl p-5 border-2 border-orange-200">
                <h4 className="font-bold text-orange-800 mb-4 text-lg flex items-center gap-2">
                  <ArrowRight className="w-5 h-5" />
                  Processus en 4 étapes :
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                    <div>
                      <div className="font-semibold text-orange-800">Sélectionner</div>
                      <div className="text-orange-600">IA automatique (Casino magique) ou Bingo manuel interactif</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                    <div>
                      <div className="font-semibold text-orange-800">Configurer</div>
                      <div className="text-orange-600">Nombre de grilles (libre), type simple/multiple, second tirage</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                    <div>
                      <div className="font-semibold text-orange-800">Générer</div>
                      <div className="text-orange-600">Création des grilles au format loto (boules colorées)</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                    <div>
                      <div className="font-semibold text-orange-800">Sauvegarder</div>
                      <div className="text-orange-600">Sauvegarde locale pour vérification après tirage officiel</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Avantages */}
              <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200">
                <h4 className="font-bold text-blue-800 mb-3 text-lg flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Pourquoi choisir le Mode Débutant ?
                </h4>
                <div className="text-sm text-blue-700 space-y-2">
                  <div>🎯 <strong>Interface intuitive</strong> - Design "Loto de Rêve" magique</div>
                  <div>🎪 <strong>Expérience ludique</strong> - Bingo interactif avec boules 3D</div>
                  <div>🤖 <strong>IA intégrée</strong> - Analyse de 49 ans de données</div>
                  <div>💰 <strong>Gestion des coûts</strong> - Calcul automatique des prix</div>
                  <div>📱 <strong>Mobile-first</strong> - Optimisé pour tous les appareils</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
