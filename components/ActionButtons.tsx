'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Save, Brain, Hand } from 'lucide-react';

interface ActionButtonsProps {
  currentStep: 'select' | 'generate' | 'save';
  onSelectAI: () => void;
  onSelectManual: () => void;
  onGenerate: () => void;
  onSave: () => void;
  hasSelection: boolean;
  hasGenerated: boolean;
}

export default function ActionButtons({ 
  currentStep, 
  onSelectAI, 
  onSelectManual, 
  onGenerate, 
  onSave, 
  hasSelection,
  hasGenerated 
}: ActionButtonsProps) {

  const renderSelectButtons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* Sélection IA - Thème Galaxie */}
      <motion.button
        onClick={onSelectAI}
        className="action-button-ai text-white p-6 md:p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 group relative overflow-hidden border-2 border-white/20"
        whileHover={{ scale: 1.05, rotateY: 5 }}
        whileTap={{ scale: 0.95 }}
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)'
        }}
      >
        {/* Étoiles scintillantes */}
        <div className="absolute inset-0 opacity-40">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white text-xl"
              style={{
                left: `${10 + i * 8}%`,
                top: `${15 + (i % 3) * 25}%`,
              }}
              animate={{
                rotate: [0, 360],
                scale: [0.5, 1.5, 0.5],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 2 + i * 0.2,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            >
              {i % 3 === 0 ? '✨' : i % 3 === 1 ? '⭐' : '💫'}
            </motion.div>
          ))}
        </div>

        {/* Aura magique */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 text-center">
          <motion.div
            animate={{ 
              rotate: [0, 15, -15, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-6xl md:text-7xl mb-4 filter drop-shadow-lg"
          >
            🎰
          </motion.div>
          <h3 className="text-2xl md:text-3xl font-bold mb-3 drop-shadow-lg">
            Sélection Automatique
          </h3>
          <p className="text-lg md:text-xl opacity-95 mb-4 font-medium">
            L'IA analyse l'historique et choisit pour vous
          </p>
          <motion.div 
            className="bg-white/30 backdrop-blur rounded-xl px-4 py-2 text-sm md:text-base font-bold"
            animate={{ boxShadow: ["0 0 20px rgba(255,255,255,0.3)", "0 0 40px rgba(255,255,255,0.6)", "0 0 20px rgba(255,255,255,0.3)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎯 Analyse des Tendances
          </motion.div>
        </div>
      </motion.button>

      {/* Sélection Manuelle - Thème Trésor */}
      <motion.button
        onClick={onSelectManual}
        className="action-button-manual text-white p-6 md:p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 group relative overflow-hidden border-2 border-white/20"
        whileHover={{ scale: 1.05, rotateY: -5 }}
        whileTap={{ scale: 0.95 }}
        style={{
          backgroundImage: 'radial-gradient(circle at 30% 70%, rgba(255, 215, 0, 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255, 140, 0, 0.4) 0%, transparent 50%)'
        }}
      >
        {/* Pièces d'or flottantes */}
        <div className="absolute inset-0 opacity-50">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-yellow-200 text-2xl"
              style={{
                left: `${15 + i * 9}%`,
                top: `${20 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [0, -15, 0],
                rotate: [0, 180, 360],
                scale: [0.8, 1.3, 0.8]
              }}
              transition={{
                duration: 3 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            >
              {i % 4 === 0 ? '🪙' : i % 4 === 1 ? '💰' : i % 4 === 2 ? '🎯' : '💎'}
            </motion.div>
          ))}
        </div>

        {/* Effet de brillance dorée */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/20 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 text-center">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.15, 1],
              y: [0, -5, 0]
            }}
            transition={{ duration: 3.5, repeat: Infinity }}
            className="text-6xl md:text-7xl mb-4 filter drop-shadow-lg"
          >
            🎪
          </motion.div>
          <h3 className="text-2xl md:text-3xl font-bold mb-3 drop-shadow-lg">
            Sélection Manuelle
          </h3>
          <p className="text-lg md:text-xl opacity-95 mb-4 font-medium">
            Cliquez sur vos numéros préférés dans une grille
          </p>
          <motion.div 
            className="bg-white/30 backdrop-blur rounded-xl px-4 py-2 text-sm md:text-base font-bold"
            animate={{ boxShadow: ["0 0 20px rgba(255,215,0,0.4)", "0 0 40px rgba(255,215,0,0.7)", "0 0 20px rgba(255,215,0,0.4)"] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            👆 Grille Interactive
          </motion.div>
        </div>
      </motion.button>
    </div>
  );

  const renderGenerateButton = () => (
    <motion.button
      onClick={onGenerate}
      disabled={!hasSelection}
      className={`w-full p-6 rounded-2xl shadow-xl transition-all duration-300 relative overflow-hidden ${
        hasSelection 
          ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white hover:shadow-2xl' 
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
      whileHover={hasSelection ? { scale: 1.02 } : {}}
      whileTap={hasSelection ? { scale: 0.98 } : {}}
    >
      {hasSelection && (
        <div className="absolute inset-0 opacity-30">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-yellow-200 text-xl"
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + (i % 2) * 40}%`,
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 2 + i * 0.2,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            >
              ⚡
            </motion.div>
          ))}
        </div>
      )}

      <div className="relative z-10 text-center">
        <motion.div
          animate={hasSelection ? {
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-5xl mb-4"
        >
          {hasSelection ? '⚡' : '⏳'}
        </motion.div>
        <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Zap className="w-6 h-6" />
          Générer les Grilles
        </h3>
        <p className="opacity-90">
          {hasSelection ? 'Créez vos grilles gagnantes !' : 'Sélectionnez d\'abord vos numéros'}
        </p>
      </div>
    </motion.button>
  );

  const renderSaveButton = () => (
    <motion.button
      onClick={onSave}
      disabled={!hasGenerated}
      className={`w-full p-6 rounded-2xl shadow-xl transition-all duration-300 relative overflow-hidden ${
        hasGenerated 
          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:shadow-2xl' 
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
      whileHover={hasGenerated ? { scale: 1.02 } : {}}
      whileTap={hasGenerated ? { scale: 0.98 } : {}}
    >
      {hasGenerated && (
        <div className="absolute inset-0 opacity-20">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-cyan-200 text-xl"
              style={{
                left: `${15 + i * 15}%`,
                top: `${25 + (i % 2) * 35}%`,
              }}
              animate={{
                y: [0, -15, 0],
                rotate: [0, 180, 360],
                scale: [1, 1.3, 1]
              }}
              transition={{
                duration: 3 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            >
              💎
            </motion.div>
          ))}
        </div>
      )}

      <div className="relative z-10 text-center">
        <motion.div
          animate={hasGenerated ? {
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="text-5xl mb-4"
        >
          {hasGenerated ? '💎' : '💤'}
        </motion.div>
        <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Save className="w-6 h-6" />
          Sauvegarder
        </h3>
        <p className="opacity-90">
          {hasGenerated ? 'Conservez vos grilles précieuses !' : 'Générez d\'abord vos grilles'}
        </p>
      </div>
    </motion.button>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {currentStep === 'select' && renderSelectButtons()}
      {currentStep === 'generate' && renderGenerateButton()}
      {currentStep === 'save' && renderSaveButton()}
    </div>
  );
}
