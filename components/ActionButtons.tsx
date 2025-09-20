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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {/* Sélection IA - Thème Rose Magique */}
      <motion.div
        onClick={onSelectAI}
        className="container-pastel-pink relative overflow-hidden rounded-3xl p-8 md:p-10 cursor-pointer shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-pink-200"
        whileHover={{ scale: 1.03, rotateY: 8, z: 50 }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {/* Cascade de pétales de rose */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`petal-${i}`}
              className="absolute text-3xl opacity-30"
              style={{
                left: `${5 + i * 4.5}%`,
                top: `${-10 + (i % 6) * 15}%`,
              }}
              animate={{
                y: [0, 400],
                rotate: [0, 720],
                scale: [1, 0.3],
                opacity: [0.3, 0.8, 0]
              }}
              transition={{
                duration: 8 + i * 0.4,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
            >
              {i % 4 === 0 ? '🌸' : i % 4 === 1 ? '🌺' : i % 4 === 2 ? '🌹' : '💖'}
            </motion.div>
          ))}
        </div>

        {/* Orbes magiques flottants */}
        <div className="absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`orb-${i}`}
              className="absolute w-6 h-6 rounded-full bg-gradient-radial from-pink-300 to-pink-500 opacity-40"
              style={{
                left: `${15 + i * 7}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -30, 0],
                scale: [0.5, 1.5, 0.5],
                opacity: [0.2, 0.8, 0.2]
              }}
              transition={{
                duration: 3 + i * 0.4,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        {/* Aura rose tournante */}
        <motion.div
          className="absolute inset-0 bg-gradient-conic from-pink-200/40 via-transparent to-rose-300/40"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />

        {/* Contenu principal */}
        <div className="relative z-10 text-center">
          {/* Machine à sous magique */}
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.08, 1],
              y: [0, -8, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-8xl md:text-9xl mb-6 filter drop-shadow-2xl"
          >
            🎰
          </motion.div>

          {/* Titre enchanté */}
          <motion.h3 
            className="text-3xl md:text-4xl font-bold mb-4 text-pink-800 relative"
            animate={{
              textShadow: [
                "0 0 20px rgba(236, 72, 153, 0.5)",
                "0 0 40px rgba(236, 72, 153, 0.8)",
                "0 0 20px rgba(236, 72, 153, 0.5)"
              ]
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            ✨ Sélection Automatique ✨
          </motion.h3>

          {/* Badge magique */}
          <motion.div 
            className="inline-flex items-center gap-3 bg-pink-100/90 backdrop-blur rounded-2xl px-6 py-4 text-pink-800 font-bold shadow-xl"
            whileHover={{ scale: 1.05, rotate: 2 }}
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(236, 72, 153, 0.3)",
                "0 0 40px rgba(236, 72, 153, 0.7)",
                "0 0 20px rgba(236, 72, 153, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🔮
            </motion.div>
            <span className="text-lg">IA Prophétique</span>
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🌟
            </motion.div>
          </motion.div>
        </div>

        {/* Étincelles magiques */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute text-lg text-pink-400"
              style={{
                left: `${10 + i * 6}%`,
                top: `${10 + (i % 4) * 20}%`,
              }}
              animate={{
                scale: [0, 1.5, 0],
                rotate: [0, 180, 360],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Sélection Manuelle - Thème Or Étincelant */}
      <motion.div
        onClick={onSelectManual}
        className="container-pastel-amber relative overflow-hidden rounded-3xl p-8 md:p-10 cursor-pointer shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-yellow-200"
        whileHover={{ scale: 1.03, rotateY: -8, z: 50 }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Pluie d'or */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={`gold-${i}`}
              className="absolute text-2xl opacity-40"
              style={{
                left: `${2 + i * 3.8}%`,
                top: `${-15 + (i % 5) * 12}%`,
              }}
              animate={{
                y: [0, 450],
                rotate: [0, 540],
                scale: [0.8, 1.2, 0.6],
                opacity: [0.4, 0.9, 0]
              }}
              transition={{
                duration: 6 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            >
              {i % 5 === 0 ? '🪙' : i % 5 === 1 ? '💰' : i % 5 === 2 ? '💎' : i % 5 === 3 ? '⭐' : '✨'}
            </motion.div>
          ))}
        </div>

        {/* Rayons de soleil rotatifs */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`ray-${i}`}
              className="absolute w-1 bg-gradient-to-t from-transparent via-yellow-300/60 to-transparent"
              style={{
                left: '50%',
                top: '50%',
                height: '200%',
                transformOrigin: 'bottom',
                transform: `rotate(${i * 45}deg)`,
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scaleY: [0.5, 1.2, 0.5]
              }}
              transition={{
                duration: 3 + i * 0.2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Aura dorée pulsante */}
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-yellow-200/30 via-amber-300/20 to-transparent"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Contenu principal */}
        <div className="relative z-10 text-center">
          {/* Roue de la fortune */}
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1],
              y: [0, -10, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="text-8xl md:text-9xl mb-6 filter drop-shadow-2xl"
          >
            🎡
          </motion.div>

          {/* Titre doré */}
          <motion.h3 
            className="text-3xl md:text-4xl font-bold mb-4 text-amber-800 relative"
            animate={{
              textShadow: [
                "0 0 20px rgba(245, 158, 11, 0.6)",
                "0 0 40px rgba(245, 158, 11, 0.9)",
                "0 0 20px rgba(245, 158, 11, 0.6)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⭐ Sélection Manuelle ⭐
          </motion.h3>

          {/* Badge interactif doré */}
          <motion.div 
            className="inline-flex items-center gap-3 bg-amber-100/90 backdrop-blur rounded-2xl px-6 py-4 text-amber-800 font-bold shadow-xl"
            whileHover={{ scale: 1.05, rotate: -2 }}
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(245, 158, 11, 0.4)",
                "0 0 40px rgba(245, 158, 11, 0.8)",
                "0 0 20px rgba(245, 158, 11, 0.4)"
              ]
            }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            <motion.div
              animate={{ 
                rotate: [0, -360],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              🎯
            </motion.div>
            <span className="text-lg">Maître du Destin</span>
            <motion.div
              animate={{ 
                scale: [1, 1.4, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              💫
            </motion.div>
          </motion.div>
        </div>

        {/* Explosion d'étoiles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(18)].map((_, i) => (
            <motion.div
              key={`star-explosion-${i}`}
              className="absolute text-xl text-yellow-500"
              style={{
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: [0, Math.cos(i * 20) * 150],
                y: [0, Math.sin(i * 20) * 150],
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3 + i * 0.1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            >
              ⭐
            </motion.div>
          ))}
        </div>

        {/* Particules scintillantes */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`twinkle-${i}`}
              className="absolute text-sm text-amber-400"
              style={{
                left: `${15 + i * 6}%`,
                top: `${10 + (i % 4) * 20}%`,
              }}
              animate={{
                scale: [0, 2, 0],
                opacity: [0, 1, 0],
                rotate: [0, 720]
              }}
              transition={{
                duration: 1.5 + i * 0.2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>
      </motion.div>
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
