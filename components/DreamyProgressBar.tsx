'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Save } from 'lucide-react';

interface DreamyProgressBarProps {
  currentStep: 'select' | 'generate' | 'save';
  onReset?: () => void;
}

export default function DreamyProgressBar({ currentStep, onReset }: DreamyProgressBarProps) {
  const steps = [
    {
      id: 'select',
      label: 'Sélectionner',
      icon: Sparkles,
      color: 'from-emerald-400 to-teal-500',
      particle: '✨'
    },
    {
      id: 'generate',
      label: 'Générer',
      icon: Zap,
      color: 'from-amber-400 to-orange-500',
      particle: '⚡'
    },
    {
      id: 'save',
      label: 'Sauvegarder',
      icon: Save,
      color: 'from-blue-400 to-purple-500',
      particle: '💎'
    }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const currentIndex = getCurrentStepIndex();
  const progressPercentage = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-xl p-2 md:p-4 shadow-xl border-2 border-white/20 overflow-hidden">
      {/* Particules flottantes - réduites sur mobile */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-sm md:text-lg opacity-40"
            style={{
              left: `${15 + i * 25}%`,
              top: `${30 + (i % 2) * 30}%`,
            }}
            animate={{
              y: [0, -8, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 1,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            {steps[i % 3]?.particle}
          </motion.div>
        ))}
      </div>

      {/* Header ultra-compact */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-1 md:gap-2">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="text-lg md:text-xl"
          >
            🌟
          </motion.div>
          <h3 className="text-sm md:text-lg font-bold text-white drop-shadow-lg">
            Quête Fortune
          </h3>
        </div>
        
        {onReset && (
          <button
            onClick={onReset}
            className="text-white/80 hover:text-white transition-colors px-1 py-1 rounded-full hover:bg-white/20 text-xs md:text-sm"
            title="Recommencer"
          >
            🔄
          </button>
        )}
      </div>

      {/* Barre de progression éclatante */}
      <div className="relative mb-2 md:mb-3">
        {/* Fond de la barre */}
        <div className="h-2 md:h-3 bg-black/30 rounded-full overflow-hidden shadow-inner">
          {/* Progression animée */}
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 rounded-full relative shadow-lg"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Effet de brillance intense */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>

        {/* Étincelles sur la barre */}
        <motion.div
          className="absolute -top-1 text-yellow-200 text-lg md:text-xl"
          style={{ left: `${Math.max(0, progressPercentage - 5)}%` }}
          animate={{ 
            scale: [1, 1.8, 1],
            rotate: [0, 180, 360],
            y: [0, -5, 0]
          }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ⭐
        </motion.div>
      </div>

      {/* Indicateurs d'étapes seulement */}
      <div className="flex justify-center items-center gap-4 relative z-10">
        {steps.map((step, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.id} className="flex items-center">
              {/* Point indicateur */}
              <motion.div
                className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-white shadow-lg border-2 border-yellow-300' 
                    : 'bg-white/40 border border-white/60'
                }`}
                animate={isCurrent ? { 
                  scale: [1, 1.3, 1],
                  boxShadow: [
                    "0 0 0 0 rgba(255, 255, 255, 0.5)",
                    "0 0 0 8px rgba(255, 255, 255, 0.2)",
                    "0 0 0 0 rgba(255, 255, 255, 0.5)"
                  ]
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />

              {/* Particule de l'étape active */}
              {isCurrent && (
                <motion.div
                  className="text-lg md:text-xl absolute"
                  animate={{
                    y: [0, -8, 0],
                    scale: [1, 1.4, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {step.particle}
                </motion.div>
              )}

              {/* Séparateur */}
              {index < steps.length - 1 && (
                <div className="w-8 md:w-12 h-0.5 bg-white/30 mx-2" />
              )}
            </div>
          );
        })}
      </div>

      {/* Message inspirant - masqué sur mobile */}
      <motion.div 
        className="hidden md:block text-center mt-2 relative z-10"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <p className="text-xs text-white/80 italic font-medium">
          {currentIndex === 0 && "🎯 Choisissez vos numéros chanceux..."}
          {currentIndex === 1 && "⚡ La magie opère..."}
          {currentIndex === 2 && "💎 Votre fortune vous attend !"}
        </p>
      </motion.div>
    </div>
  );
}
