/**
 * PAGE PRINCIPALE AVEC SÉLECTEUR
 * Permet de choisir entre l'interface actuelle et la nouvelle
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Smartphone, Tablet, ArrowRight, CheckCircle, RotateCcw, Database, Download, Clock, Trophy, Timer, Menu, Award, Clock3 } from 'lucide-react';
import toast from 'react-hot-toast';

// Import de vos composants Loto existants
import Header from '@/components/Header';
import MobileHeader from '@/components/MobileHeader';
import PhoneBanner from '@/components/PhoneBanner';
import TabletOptimizedWrapper from '@/components/TabletOptimizedWrapper';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';

// Composants de complexité
import ComplexitySelector from '@/components/ComplexitySelector';
import BeginnerInterface from '@/components/BeginnerInterface';
import IntermediateInterface from '@/components/IntermediateInterface';
import ExpertInterface from '@/components/ExpertInterface';
import LudicrousModeSelector from '@/components/LudicrousModeSelector';
import { complexityManager, ComplexityLevel } from '@/lib/complexity-manager';

export default function Home() {
  // Page d'accueil avec sélection des modes
  return <ModeSelectionInterface />;
}

// Interface de sélection des modes
function ModeSelectionInterface() {
  const [selectedMode, setSelectedMode] = useState<ComplexityLevel | null>(null);
  const [showCodePrompt, setShowCodePrompt] = useState<ComplexityLevel | null>(null);
  const [enteredCode, setEnteredCode] = useState('');

  // Si un mode est sélectionné, afficher l'interface correspondante
  if (selectedMode) {
    return <NewVersionInterface 
      initialMode={selectedMode} 
      onBackToModeSelection={() => setSelectedMode(null)}
    />;
  }

  // Fonction pour gérer la sélection des modes
  const handleModeSelection = (mode: ComplexityLevel) => {
    if (mode === 'beginner') {
      // Mode débutant : accès libre
      setSelectedMode(mode);
    } else {
      // Modes payants : demander le code
      setShowCodePrompt(mode);
      setEnteredCode('');
    }
  };

  // Vérifier le code d'accès
  const verifyCode = () => {
    if (enteredCode === '2025') {
      setSelectedMode(showCodePrompt);
      setShowCodePrompt(null);
      setEnteredCode('');
    } else {
      // Code incorrect - réinitialiser
      setEnteredCode('');
      // Pas de message d'erreur pour garder le code secret
    }
  };

  // Page de sélection des modes
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Particules flottantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-teal-300/30 rounded-full"
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

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-8xl mb-6"
          >
            🎰
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-teal-800 mb-4">
            ✨ Loto de Rêve ✨
          </h1>
          
          <p className="text-xl text-teal-600 mb-2">
            Choisissez votre niveau d'expérience
          </p>
          
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-teal-500"
          >
            🍀 Votre fortune vous attend 🍀
          </motion.div>
        </motion.div>

        {/* Sélection des modes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Mode Débutant */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative group cursor-pointer"
            onClick={() => handleModeSelection('beginner')}
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl p-8 shadow-2xl border-4 border-emerald-300 h-full">
              {/* Effet de brillance */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-3xl pointer-events-none"></div>
              
              <div className="relative z-10 text-center text-white">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🌱
                </motion.div>
                
                <h3 className="text-2xl font-bold mb-3">Mode Débutant</h3>
                <p className="text-emerald-100 mb-4 text-sm">
                  Interface simple et guidée pour découvrir le loto
                </p>
                
                <div className="bg-white/20 rounded-lg p-3 text-xs">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Sélection IA automatique</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Génération simple</span>
                  </div>
                </div>
                
                <motion.div
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 rounded-full py-2 px-4 text-sm font-bold transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  🚀 COMMENCER
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Mode Intermédiaire */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative group cursor-pointer"
            onClick={() => handleModeSelection('intermediate')}
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-8 shadow-2xl border-4 border-amber-300 h-full">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-3xl pointer-events-none"></div>
              
              <div className="relative z-10 text-center text-white">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  ⚡
                </motion.div>
                
                <h3 className="text-2xl font-bold mb-3">Mode Intermédiaire</h3>
                <p className="text-amber-100 mb-4 text-sm">
                  Plus d'options et d'analyses pour optimiser vos chances
                </p>
                
                <div className="bg-white/20 rounded-lg p-3 text-xs">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Analyses avancées</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Stratégies multiples</span>
                  </div>
                </div>
                
                <motion.div
                  className="mt-4 bg-amber-600 hover:bg-amber-700 rounded-full py-2 px-4 text-sm font-bold relative transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  ⚡ EXPLORER
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold">
                    💎
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Mode Expert */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative group cursor-pointer"
            onClick={() => handleModeSelection('expert')}
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="bg-gradient-to-br from-purple-400 to-indigo-500 rounded-3xl p-8 shadow-2xl border-4 border-purple-300 h-full">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-3xl pointer-events-none"></div>
              
              <div className="relative z-10 text-center text-white">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🎯
                </motion.div>
                
                <h3 className="text-2xl font-bold mb-3">Mode Expert</h3>
                <p className="text-purple-100 mb-4 text-sm">
                  Contrôle total avec analyses statistiques poussées
                </p>
                
                <div className="bg-white/20 rounded-lg p-3 text-xs">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Statistiques complètes</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Contrôle avancé</span>
                  </div>
                </div>
                
                <motion.div
                  className="mt-4 bg-purple-600 hover:bg-purple-700 rounded-full py-2 px-4 text-sm font-bold relative transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  🎯 MAÎTRISER
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold">
                    💎
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-16 text-teal-600"
        >
          <div className="bg-white/80 rounded-xl p-6 max-w-4xl mx-auto">
            <h4 className="font-bold text-teal-800 mb-4 text-lg">🎯 Processus en 4 étapes :</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-2">1️⃣</div>
                <div className="font-semibold text-teal-800">Sélectionner</div>
                <div className="text-teal-600">IA automatique ou Bingo manuel</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">2️⃣</div>
                <div className="font-semibold text-teal-800">Configurer</div>
                <div className="text-teal-600">Nombre de grilles et options</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">3️⃣</div>
                <div className="font-semibold text-teal-800">Générer</div>
                <div className="text-teal-600">Grilles simples ou multiples</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">4️⃣</div>
                <div className="font-semibold text-teal-800">Sauvegarder</div>
                <div className="text-teal-600">Contrôle après tirage officiel</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modale de saisie du code d'accès */}
      {showCodePrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">
                {showCodePrompt === 'intermediate' ? '⚡' : '🎯'}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {showCodePrompt === 'intermediate' ? 'Mode Intermédiaire' : 'Mode Expert'}
              </h3>
              
              <p className="text-gray-600 mb-6">
                Mode premium - Code d'accès requis
              </p>

              <div className="mb-6">
                <input
                  type="text"
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && verifyCode()}
                  placeholder="Entrez le code"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-lg font-mono tracking-widest focus:border-blue-500 focus:outline-none"
                  maxLength={4}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCodePrompt(null);
                    setEnteredCode('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
                
                <button
                  onClick={verifyCode}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Valider
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Fonction Home originale gardée pour référence
function OriginalHome() {
  const [selectedVersion, setSelectedVersion] = useState<'current' | 'new' | null>(null);
  const [showSelector, setShowSelector] = useState(true);

  // Vérifier s'il y a une préférence sauvegardée
  useEffect(() => {
    const saved = localStorage.getItem('selected_version') as 'current' | 'new';
    if (saved) {
      setSelectedVersion(saved);
      setShowSelector(false);
    }
  }, []);

  const handleVersionSelect = (version: 'current' | 'new') => {
    setSelectedVersion(version);
    localStorage.setItem('selected_version', version);
    setShowSelector(false);
  };

  const handleBackToSelector = () => {
    setShowSelector(true);
    setSelectedVersion(null);
    localStorage.removeItem('selected_version');
  };

  // Rendu du sélecteur
  if (showSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* En-tête */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              🚀 Choisissez votre interface
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Sélectionnez l'architecture responsive qui vous convient
            </p>
          </motion.div>

          {/* Sélecteur */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            
            {/* Version actuelle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all ${
                selectedVersion === 'current'
                  ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500 ring-opacity-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setSelectedVersion('current')}
            >
              {selectedVersion === 'current' && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                🔵 Interface Actuelle
              </h3>
              <p className="text-gray-600 mb-4">Architecture responsive classique</p>
              
              <div className="space-y-3 mb-8">
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="text-green-500">✅</span> Stable et testée
                </p>
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="text-green-500">✅</span> Fonctionnelle actuellement
                </p>
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="text-green-500">✅</span> Interface familière
                </p>
              </div>

              <button
                onClick={() => setSelectedVersion('current')}
                className={`w-full py-4 px-6 text-white font-semibold rounded-lg transition-colors ${
                  selectedVersion === 'current'
                    ? 'bg-sky-500 hover:bg-sky-600'
                    : 'bg-slate-400 hover:bg-slate-500'
                }`}
              >
                {selectedVersion === 'current' ? '✓ Sélectionnée' : 'Choisir cette version'}
              </button>
            </motion.div>

            {/* Nouvelle version */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all ${
                selectedVersion === 'new'
                  ? 'border-green-500 bg-green-50 ring-2 ring-green-500 ring-opacity-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setSelectedVersion('new')}
            >
              {selectedVersion === 'new' && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                🟢 Interface Moderne
              </h3>
              <p className="text-gray-600 mb-4">Architecture 3-en-1 optimisée</p>
              
              <div className="space-y-3 mb-8">
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="text-orange-500">🚀</span> 3 interfaces natives
                </p>
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="text-orange-500">📱</span> Mobile/Tablette/Desktop
                </p>
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="text-orange-500">⚡</span> Performance optimisée
                </p>
              </div>

              <button
                onClick={() => setSelectedVersion('new')}
                className={`w-full py-4 px-6 text-white font-semibold rounded-lg transition-colors ${
                  selectedVersion === 'new'
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : 'bg-slate-400 hover:bg-slate-500'
                }`}
              >
                {selectedVersion === 'new' ? '✓ Sélectionnée' : 'Choisir cette version'}
              </button>
            </motion.div>
          </div>

          {/* Bouton de confirmation avec couleurs pastels */}
          <div className="text-center mb-8">
            <button
              onClick={() => handleVersionSelect(selectedVersion || 'current')}
              disabled={!selectedVersion}
              className="px-12 py-4 bg-orange-500 text-white text-lg font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-3">
                Continuer avec la version {selectedVersion === 'current' ? 'actuelle' : selectedVersion === 'new' ? 'moderne' : '...'}
                <ArrowRight className="w-5 h-5" />
              </span>
            </button>
          </div>

          {/* Note */}
          <div className="text-center">
            <div className="inline-block bg-white/80 backdrop-blur-sm px-6 py-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">
                💡 Vous pourrez changer de version à tout moment
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interface sélectionnée
  return (
    <div className="min-h-screen relative">
      {/* Barre de contrôle en haut avec couleurs pastels */}
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Bouton pour revenir au sélecteur */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleBackToSelector}
              className="bg-slate-500 text-white px-4 py-2 rounded-lg shadow hover:bg-slate-600 transition-colors text-sm font-medium"
            >
              🔄 Changer de version
            </motion.button>

            {/* Titre centré */}
            <h1 className="text-xl font-bold text-slate-800">
              🎯 Kdo Loto Gagnant
            </h1>

            {/* Badge de version avec couleurs pastels */}
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              selectedVersion === 'current'
                ? 'bg-sky-500 text-white'
                : 'bg-emerald-500 text-white'
            }`}>
              {selectedVersion === 'current' ? '🔵 Actuelle' : '🟢 Moderne'}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu selon la version */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedVersion}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="min-h-screen"
        >
          {selectedVersion === 'current' ? (
            // Version actuelle - votre interface existante
            <CurrentVersionInterface />
          ) : (
            // Nouvelle version - interface 3-en-1
            <NewVersionInterface />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Interface actuelle (votre vraie interface Loto)
function CurrentVersionInterface() {
  // États principaux de votre app Loto
  const [isLoading, setIsLoading] = useState(false);
  const [globalAnalysisPeriod, setGlobalAnalysisPeriod] = useState<'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100'>('last20');
  const [globalRemainingCombinations, setGlobalRemainingCombinations] = useState<number>(19068840);
  const [globalRemainingCombinationsSecondTirage, setGlobalRemainingCombinationsSecondTirage] = useState<number>(1906884);
  const [chanceLevel, setChanceLevel] = useState<number>(0);
  const [lastDraw, setLastDraw] = useState<any>(null);
  
  // États pour le système de complexité
  const [complexityLevel, setComplexityLevel] = useState<ComplexityLevel>('beginner');
  const [showComplexitySelector, setShowComplexitySelector] = useState(false);
  
  // États pour la navigation mobile
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // État des données
  const [dataStatus, setDataStatus] = useState<{
    hasData: boolean;
    totalTirages: number;
    lastUpdate: string | null;
  }>({
    hasData: false,
    totalTirages: 0,
    lastUpdate: null
  });

  // Initialisation
  useEffect(() => {
    // Détection mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Note: Le niveau de complexité est maintenant géré par la sélection de mode
    
    // Charger les données
    checkDataStatus();
    fetchLastDraw();
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const checkDataStatus = async () => {
    try {
      const response = await fetch('/api/statistics?type=summary');
      const result = await response.json();
      
      if (result.success && result.data) {
        setDataStatus({
          hasData: true,
          totalTirages: result.data.totalTirages || 0,
          lastUpdate: result.data.derniereMiseAJour || null
        });
      } else {
        setDataStatus(prev => ({ ...prev, hasData: false }));
      }
    } catch (error) {
      console.error('Erreur vérification données:', error);
      setDataStatus(prev => ({ ...prev, hasData: false }));
    }
  };

  const fetchLastDraw = async () => {
    try {
      const response = await fetch('/api/tirages?limit=1&sort=recent');
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        const draw = result.data[0];
        const numbers = [
          draw.numero1 || draw.boule_1,
          draw.numero2 || draw.boule_2, 
          draw.numero3 || draw.boule_3,
          draw.numero4 || draw.boule_4,
          draw.numero5 || draw.boule_5
        ].filter(n => n && n > 0);
        
        const complementary = draw.complementaire || draw.numero_chance;
        
        setLastDraw({
          date: draw.date,
          numbers: numbers,
          complementary: complementary,
          joker: draw.joker || undefined
        });
      }
    } catch (error) {
      console.error('Erreur récupération dernier tirage:', error);
    }
  };

  const handleImportData = async () => {
    setIsLoading(true);
    try {
      // Essayer d'abord l'import distant (compatible Vercel)
      const response = await fetch('/api/import-remote-data', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        toast.success(`✅ ${result.imported} tirages importés avec succès !`);
        await checkDataStatus();
      } else {
        // Fallback vers l'import CSV local
        const csvResponse = await fetch('/api/import-csv', { method: 'POST' });
        const csvResult = await csvResponse.json();
        
        if (csvResult.success) {
          toast.success(`✅ ${csvResult.imported} tirages importés avec succès !`);
          await checkDataStatus();
        } else {
          toast.error('❌ Erreur lors de l\'import des données');
        }
      }
    } catch (error) {
      toast.error('❌ Erreur lors de l\'import des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplexityChange = (newLevel: ComplexityLevel) => {
    setComplexityLevel(newLevel);
    setShowComplexitySelector(false);
    localStorage.setItem('complexity_manually_set', 'true');
  };

  const renderContent = () => {
    // Vérifier d'abord les données
    if (!dataStatus.hasData) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[60vh] text-center"
        >
          <div className="card max-w-md mx-auto">
            <Database className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Aucune donnée disponible
            </h2>
            <p className="text-gray-600 mb-6">
              Pour commencer à analyser le Loto National, vous devez d'abord importer les données historiques.
            </p>
            <button
              onClick={handleImportData}
              disabled={isLoading}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-slate-400"
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {isLoading ? 'Import en cours...' : 'Importer les données'}
            </button>
          </div>
        </motion.div>
      );
    }

    // Rendu selon le niveau de complexité
    switch (complexityLevel) {
      case 'beginner':
        return (
          <BeginnerInterface 
            globalAnalysisPeriod={globalAnalysisPeriod}
          />
        );
        
      case 'intermediate':
        return (
          <IntermediateInterface 
            globalAnalysisPeriod={globalAnalysisPeriod}
            onAnalysisPeriodChange={setGlobalAnalysisPeriod}
          />
        );
        
      case 'expert':
        return (
          <ExpertInterface 
            globalAnalysisPeriod={globalAnalysisPeriod}
            onAnalysisPeriodChange={setGlobalAnalysisPeriod}
            onCombinationsChange={setGlobalRemainingCombinations}
          />
        );
        
      default:
        return (
          <BeginnerInterface 
            globalAnalysisPeriod={globalAnalysisPeriod}
          />
        );
    }
  };

  return (
    <TabletOptimizedWrapper>
      <div className="min-h-screen">
        {/* Header Desktop */}
        {!isMobile && (
          <Header 
            remainingCombinations={globalRemainingCombinations}
            remainingCombinationsSecondTirage={globalRemainingCombinationsSecondTirage}
            onDataUpdate={checkDataStatus}
            lastDraw={lastDraw}
            chanceLevel={chanceLevel}
          />
        )}
        
        {/* Bannière Mobile */}
        {isMobile && (
          <PhoneBanner
            onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            remainingCombinations={globalRemainingCombinations}
            lastDraw={lastDraw}
          />
        )}
        
        {/* Bouton de changement de mode - Repositionné avec couleurs pastels */}
        <div className="fixed bottom-20 right-4 z-40">
          <button
            onClick={() => setShowComplexitySelector(true)}
            className={`px-4 py-2 rounded-lg shadow-lg font-semibold transition-all ${
              complexityLevel === 'beginner' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' :
              complexityLevel === 'intermediate' ? 'bg-amber-500 hover:bg-amber-600 text-white' :
              'bg-rose-500 hover:bg-rose-600 text-white'
            }`}
          >
            {complexityLevel === 'beginner' && '🌱 Débutant'}
            {complexityLevel === 'intermediate' && '⚖️ Intermédiaire'}
            {complexityLevel === 'expert' && '🎯 Expert'}
          </button>
        </div>
        
        <main className={`container mx-auto px-4 ${isMobile ? 'py-4 pb-24' : 'py-8'}`}>
          {/* Indicateur de version */}
          <div className="bg-sky-100 border border-sky-300 rounded-lg p-4 text-center mb-6">
            <h2 className="text-xl font-bold text-sky-800 mb-2">
              🔵 Interface Actuelle - Responsive Classique
            </h2>
            <p className="text-sky-700">
              Votre architecture responsive avec wrappers et CSS adaptatif
            </p>
          </div>

          {/* Contenu principal selon le niveau de complexité */}
          {renderContent()}
        </main>

        {!isMobile && <Footer />}
        
      </div>

      {/* Modal de sélection de complexité */}
      {showComplexitySelector && (
        <ComplexitySelector
          showAsModal={true}
          onLevelChange={handleComplexityChange}
          onClose={() => setShowComplexitySelector(false)}
        />
      )}
    </TabletOptimizedWrapper>
  );
}

// Nouvelle interface 3-en-1 avec votre vraie app Loto
function NewVersionInterface({ 
  initialMode = 'beginner', 
  onBackToModeSelection 
}: { 
  initialMode?: ComplexityLevel;
  onBackToModeSelection?: () => void;
}) {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  // États principaux de votre app Loto (identiques à la version actuelle)
  const [isLoading, setIsLoading] = useState(false);
  const [globalAnalysisPeriod, setGlobalAnalysisPeriod] = useState<'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100'>('last20');
  const [globalRemainingCombinations, setGlobalRemainingCombinations] = useState<number>(19068840);
  const [globalRemainingCombinationsSecondTirage, setGlobalRemainingCombinationsSecondTirage] = useState<number>(1906884);
  const [chanceLevel, setChanceLevel] = useState<number>(0);
  const [lastDraw, setLastDraw] = useState<any>(null);
  const [complexityLevel, setComplexityLevel] = useState<ComplexityLevel>(initialMode);
  const [showComplexitySelector, setShowComplexitySelector] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showModeSelection, setShowModeSelection] = useState(false);
  
  const [dataStatus, setDataStatus] = useState<{
    hasData: boolean;
    totalTirages: number;
    lastUpdate: string | null;
  }>({
    hasData: false,
    totalTirages: 0,
    lastUpdate: null
  });

  // États pour les nouveaux boutons
  const [countdown, setCountdown] = useState<string>('Calcul...');
  const [showPreviousDraw, setShowPreviousDraw] = useState(false);
  const [showLudicrousSelector, setShowLudicrousSelector] = useState(false);

  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    
    // Initialiser votre app Loto
    // Note: Le niveau de complexité est maintenant géré par la sélection de mode
    checkDataStatus();
    fetchLastDraw();
    
    // Initialiser le compte à rebours immédiatement
    const initCountdown = () => {
      const now = new Date();
      let nextDraw = new Date();
      
      // Les tirages ont lieu le mercredi et samedi à 20h30
      const dayOfWeek = now.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Déterminer le prochain tirage
      if (dayOfWeek < 3) {
        // Lundi ou mardi → prochain mercredi
        nextDraw.setDate(now.getDate() + (3 - dayOfWeek));
      } else if (dayOfWeek === 3) {
        // Mercredi
        if (currentHour < 20 || (currentHour === 20 && currentMinute < 30)) {
          // Avant 20h30 → ce mercredi
          // nextDraw reste aujourd'hui
        } else {
          // Après 20h30 → samedi suivant
          nextDraw.setDate(now.getDate() + 3);
        }
      } else if (dayOfWeek < 6) {
        // Jeudi ou vendredi → samedi
        nextDraw.setDate(now.getDate() + (6 - dayOfWeek));
      } else if (dayOfWeek === 6) {
        // Samedi
        if (currentHour < 20 || (currentHour === 20 && currentMinute < 30)) {
          // Avant 20h30 → ce samedi
          // nextDraw reste aujourd'hui
        } else {
          // Après 20h30 → mercredi suivant
          nextDraw.setDate(now.getDate() + 4);
        }
      } else {
        // Dimanche → mercredi suivant
        nextDraw.setDate(now.getDate() + 3);
      }
      
      nextDraw.setHours(20, 30, 0, 0);
      
      const diff = nextDraw.getTime() - now.getTime();
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (days > 0) {
          setCountdown(`${days}j ${hours}h`);
        } else if (hours > 0) {
          setCountdown(`${hours}h ${minutes}m`);
        } else {
          setCountdown(`${minutes}m ${seconds}s`);
        }
      } else {
        setCountdown('En cours...');
      }
    };
    
    // Appeler immédiatement
    initCountdown();
    const countdownInterval = setInterval(initCountdown, 1000);
    
    return () => {
      window.removeEventListener('resize', updateDeviceType);
      clearInterval(countdownInterval);
    };
  }, []);

  // Fonctions de votre app Loto (identiques)
  const checkDataStatus = async () => {
    try {
      const response = await fetch('/api/statistics?type=summary');
      const result = await response.json();
      
      if (result.success && result.data) {
        setDataStatus({
          hasData: true,
          totalTirages: result.data.totalTirages || 0,
          lastUpdate: result.data.derniereMiseAJour || null
        });
      } else {
        setDataStatus(prev => ({ ...prev, hasData: false }));
      }
    } catch (error) {
      console.error('Erreur vérification données:', error);
      setDataStatus(prev => ({ ...prev, hasData: false }));
    }
  };

  const fetchLastDraw = async () => {
    try {
      const response = await fetch('/api/tirages?limit=1&sort=recent');
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        const draw = result.data[0];
        const numbers = [
          draw.numero1 || draw.boule_1,
          draw.numero2 || draw.boule_2, 
          draw.numero3 || draw.boule_3,
          draw.numero4 || draw.boule_4,
          draw.numero5 || draw.boule_5
        ].filter(n => n && n > 0);
        
        const complementary = draw.complementaire || draw.numero_chance;
        
        setLastDraw({
          date: draw.date,
          numbers: numbers,
          complementary: complementary,
          joker: draw.joker || undefined
        });
      }
    } catch (error) {
      console.error('Erreur récupération dernier tirage:', error);
    }
  };

  const handleImportData = async () => {
    setIsLoading(true);
    try {
      // Essayer d'abord l'import distant (compatible Vercel)
      const response = await fetch('/api/import-remote-data', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        toast.success(`✅ ${result.imported} tirages importés avec succès !`);
        await checkDataStatus();
      } else {
        // Fallback vers l'import CSV local
        const csvResponse = await fetch('/api/import-csv', { method: 'POST' });
        const csvResult = await csvResponse.json();
        
        if (csvResult.success) {
          toast.success(`✅ ${csvResult.imported} tirages importés avec succès !`);
          await checkDataStatus();
        } else {
          toast.error('❌ Erreur lors de l\'import des données');
        }
      }
    } catch (error) {
      toast.error('❌ Erreur lors de l\'import des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplexityChange = (newLevel: ComplexityLevel) => {
    setComplexityLevel(newLevel);
    setShowComplexitySelector(false);
    localStorage.setItem('complexity_manually_set', 'true');
  };


  // Handler pour afficher le tirage précédent
  const handleShowPreviousDraw = () => {
    if (lastDraw) {
      toast.success(`Dernier tirage : ${lastDraw.numbers.join('-')} + ${lastDraw.complementary}`, {
        duration: 4000,
      });
    } else {
      toast.error('Aucun tirage disponible');
    }
  };

  // Handler pour afficher les détails du countdown
  const handleShowCountdown = () => {
    toast(`Prochain tirage dans : ${countdown}`, {
      duration: 3000,
      icon: '⏰',
    });
  };

  const renderLotoContent = () => {
    // Vérifier d'abord les données
    if (!dataStatus.hasData) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[50vh] text-center"
        >
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <Database className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Aucune donnée disponible
            </h2>
            <p className="text-gray-600 mb-6">
              Pour commencer à analyser le Loto National, importez les données historiques.
            </p>
            <button
              onClick={handleImportData}
              disabled={isLoading}
              className="w-full bg-emerald-500 text-white py-3 px-4 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-400"
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {isLoading ? 'Import en cours...' : 'Importer les données'}
            </button>
          </div>
        </motion.div>
      );
    }

    // Rendu selon le niveau de complexité avec interface spécialisée
    switch (complexityLevel) {
      case 'beginner':
        return (
          <BeginnerInterface 
            globalAnalysisPeriod={globalAnalysisPeriod}
          />
        );
        
      case 'intermediate':
        return (
          <IntermediateInterface 
            globalAnalysisPeriod={globalAnalysisPeriod}
            onAnalysisPeriodChange={setGlobalAnalysisPeriod}
          />
        );
        
      case 'expert':
        return (
          <ExpertInterface 
            globalAnalysisPeriod={globalAnalysisPeriod}
            onAnalysisPeriodChange={setGlobalAnalysisPeriod}
            onCombinationsChange={setGlobalRemainingCombinations}
          />
        );
        
      default:
        return (
          <BeginnerInterface 
            globalAnalysisPeriod={globalAnalysisPeriod}
          />
        );
    }
  };

  const getDeviceColor = () => {
    switch (deviceType) {
      case 'mobile': return 'from-emerald-400 to-emerald-600';
      case 'tablet': return 'from-sky-400 to-sky-600';
      case 'desktop': return 'from-orange-400 to-orange-600';
    }
  };

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-12 h-12 text-white" />;
      case 'tablet': return <Tablet className="w-12 h-12 text-white" />;
      case 'desktop': return <Monitor className="w-12 h-12 text-white" />;
    }
  };

  // Rendu du header selon l'appareil
  const renderDeviceHeader = () => {
    switch (deviceType) {
      case 'mobile':
        return (
          <header className="bg-emerald-500 text-white shadow-lg">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Boutons de contrôle Mobile */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => onBackToModeSelection && onBackToModeSelection()}
                      className="banner-hamburger-mobile"
                      title="Retour sélection des modes"
                      style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: 'rgb(5, 150, 105)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div style={{
                        color: 'white',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        lineHeight: '1',
                        textAlign: 'center'
                      }}>
                        🏠
                      </div>
                    </button>
                    <div className="banner-button banner-draw-mobile">
                      <Award className="w-4 h-4" />
                      <div className="loto-numbers">
                        {lastDraw ? (
                          <>
                            {lastDraw.numbers.map((num: number, index: number) => (
                              <span key={index} className="loto-ball">{num}</span>
                            ))}
                            <span className="plus-sign">+</span>
                            <span className="loto-ball complementary">{lastDraw.complementary}</span>
                          </>
                        ) : (
                          <span style={{color: 'white', fontSize: '10px'}}>Aucun tirage</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // TODO: Implémenter la sélection IA automatique
                        toast.success('🤖 Sélection IA en cours de développement');
                      }}
                      className="banner-button banner-countdown-mobile"
                      title="Numéros sélectionnés par IA"
                      style={{
                        cursor: 'pointer',
                        border: 'none',
                        backgroundColor: 'transparent'
                      }}
                    >
                      <div style={{
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        lineHeight: '1',
                        textAlign: 'center'
                      }}>
                        🤖
                      </div>
                      <span style={{ fontSize: '10px' }}>IA</span>
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{(globalRemainingCombinations / 1000000).toFixed(1)}M</div>
                  <p className="text-xs opacity-90">Combinaisons</p>
                </div>
              </div>
            </div>
          </header>
        );
        
      case 'tablet':
        return (
          <header className="bg-sky-500 text-white shadow-lg">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Boutons de contrôle Tablet */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onBackToModeSelection && onBackToModeSelection()}
                      className="banner-hamburger-tablet"
                      title="Retour sélection des modes"
                      style={{
                        width: '56px',
                        height: '56px',
                        backgroundColor: 'rgb(2, 132, 199)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div style={{
                        color: 'white',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        lineHeight: '1',
                        textAlign: 'center'
                      }}>
                        🏠
                      </div>
                    </button>
                    <div className="banner-button banner-draw-tablet">
                      <Award className="w-5 h-5" />
                      <div className="loto-numbers">
                        {lastDraw ? (
                          <>
                            {lastDraw.numbers.map((num: number, index: number) => (
                              <span key={index} className="loto-ball">{num}</span>
                            ))}
                            <span className="plus-sign">+</span>
                            <span className="loto-ball complementary">{lastDraw.complementary}</span>
                          </>
                        ) : (
                          <span style={{color: 'white', fontSize: '12px'}}>Aucun tirage</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // TODO: Implémenter la sélection IA automatique
                        toast.success('🤖 Sélection IA en cours de développement');
                      }}
                      className="banner-button banner-countdown-tablet"
                      title="Numéros sélectionnés par IA"
                      style={{
                        cursor: 'pointer',
                        border: 'none',
                        backgroundColor: 'transparent'
                      }}
                    >
                      <div style={{
                        color: 'white',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        lineHeight: '1',
                        textAlign: 'center'
                      }}>
                        🤖
                      </div>
                      <span style={{ fontSize: '12px' }}>IA</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-lg font-bold">{(globalRemainingCombinations / 1000000).toFixed(1)}M</div>
                    <p className="text-xs opacity-90">Principal</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{(globalRemainingCombinationsSecondTirage / 1000000).toFixed(1)}M</div>
                    <p className="text-xs opacity-90">Second</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
        );
        
      case 'desktop':
        return (
          <header className="bg-orange-500 text-white shadow-lg">
            <div className="container mx-auto px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Boutons de contrôle Desktop */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => onBackToModeSelection && onBackToModeSelection()}
                      className="banner-hamburger-desktop"
                      title="Retour sélection des modes"
                      style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: 'rgb(234, 88, 12)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div style={{
                        color: 'white',
                        fontSize: '28px',
                        fontWeight: 'bold',
                        lineHeight: '1',
                        textAlign: 'center'
                      }}>
                        🏠
                      </div>
                    </button>
                    <div className="banner-button banner-draw-desktop">
                      <Award className="w-6 h-6" />
                      <div className="loto-numbers">
                        {lastDraw ? (
                          <>
                            {lastDraw.numbers.map((num: number, index: number) => (
                              <span key={index} className="loto-ball">{num}</span>
                            ))}
                            <span className="plus-sign">+</span>
                            <span className="loto-ball complementary">{lastDraw.complementary}</span>
                          </>
                        ) : (
                          <span style={{color: 'white', fontSize: '14px'}}>Aucun tirage</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // TODO: Implémenter la sélection IA automatique
                        toast.success('🤖 Sélection IA en cours de développement');
                      }}
                      className="banner-button banner-countdown-desktop"
                      title="Numéros sélectionnés par IA"
                      style={{
                        cursor: 'pointer',
                        border: 'none',
                        backgroundColor: 'transparent'
                      }}
                    >
                      <div style={{
                        color: 'white',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        lineHeight: '1',
                        textAlign: 'center'
                      }}>
                        🤖
                      </div>
                      <span style={{ fontSize: '14px' }}>IA</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-xl font-bold">{(globalRemainingCombinations / 1000000).toFixed(1)}M</div>
                    <p className="text-xs opacity-90">Combinaisons principales</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{(globalRemainingCombinationsSecondTirage / 1000000).toFixed(1)}M</div>
                    <p className="text-xs opacity-90">Second tirage</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{chanceLevel}%</div>
                    <p className="text-xs opacity-90">Niveau chance</p>
                  </div>
                  {lastDraw && (
                    <div className="flex items-center gap-1">
                      {lastDraw.numbers.slice(0, 3).map((num: number, index: number) => (
                        <span key={index} className="w-6 h-6 bg-white/20 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {num}
                        </span>
                      ))}
                      <span className="text-white/60 mx-1">...</span>
                      <span className="w-6 h-6 bg-amber-400 text-orange-900 text-xs font-bold rounded-full flex items-center justify-center">
                        {lastDraw.complementary}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header spécialisé selon l'appareil */}
      {renderDeviceHeader()}
      
      <main className={`container mx-auto px-4 ${
        deviceType === 'mobile' ? 'py-4' : 
        deviceType === 'tablet' ? 'py-6' : 
        'py-8'
      }`}>


        {/* Contenu principal de votre app Loto */}
        {renderLotoContent()}

      </main>

      {/* Note: Les sélecteurs de complexité ont été remplacés par la page d'accueil */}
    </div>
  );
}

// Fin de la fonction OriginalHome gardée pour référence