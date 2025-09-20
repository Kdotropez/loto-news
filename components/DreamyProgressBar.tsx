'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Save } from 'lucide-react';

interface DreamyProgressBarProps {
  currentStep: 'select' | 'generate' | 'save';
  onReset?: () => void;
  isManualSelection?: boolean;
  onSwitchSelection?: () => void;
}

export default function DreamyProgressBar({ currentStep, onReset, isManualSelection, onSwitchSelection }: DreamyProgressBarProps) {
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
    <motion.div 
      className="container-pastel-purple dreamy-progress-bar relative rounded-3xl p-4 md:p-6 shadow-2xl border-3 overflow-hidden"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, type: "spring" }}
      whileHover={{ scale: 1.02, rotateX: 2 }}
    >
      {/* Constellation magique en arrière-plan */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`constellation-${i}`}
            className="absolute text-lg md:text-2xl opacity-30"
            style={{
              left: `${5 + i * 4.5}%`,
              top: `${10 + (i % 5) * 18}%`,
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 360],
              scale: [0.8, 1.4, 0.8],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: 4 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          >
            {i % 8 === 0 ? '🌟' : i % 8 === 1 ? '✨' : i % 8 === 2 ? '💫' : i % 8 === 3 ? '🎭' : i % 8 === 4 ? '🎪' : i % 8 === 5 ? '🎨' : i % 8 === 6 ? '🎯' : '🎲'}
          </motion.div>
        ))}
      </div>

      {/* Aura magique pulsante */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-purple-200/40 via-pink-200/30 to-transparent"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.7, 0.3]
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      {/* Rayons de lumière rotatifs */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`light-ray-${i}`}
            className="absolute w-0.5 bg-gradient-to-t from-transparent via-purple-300/60 to-transparent"
            style={{
              left: '50%',
              top: '50%',
              height: '150%',
              transformOrigin: 'bottom',
              transform: `rotate(${i * 60}deg)`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scaleY: [0.5, 1.3, 0.5]
            }}
            transition={{
              duration: 4 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Header Magique Spectaculaire */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Icône centrale avec multiple animations */}
          <div className="relative">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1],
                y: [0, -3, 0]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-2xl md:text-3xl"
            >
              🏆
            </motion.div>
            {/* Cercle magique autour */}
            <motion.div
              className="absolute inset-0 border-2 border-purple-300/50 rounded-full"
              animate={{ rotate: [0, -360], scale: [1, 1.3, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Titre enchanté */}
          <div className="flex flex-col">
            <motion.h3 
              className="text-lg md:text-2xl font-bold text-purple-800 relative"
              animate={{
                textShadow: [
                  "0 0 10px rgba(147, 51, 234, 0.5)",
                  "0 0 30px rgba(147, 51, 234, 0.8)",
                  "0 0 10px rgba(147, 51, 234, 0.5)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              ✨ Quête de Fortune ✨
            </motion.h3>
            <motion.p 
              className="text-xs md:text-sm text-purple-600 font-medium"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎭 Votre Aventure Magique
            </motion.p>
          </div>
        </div>
        
        {(onReset || onSwitchSelection) && (
          <div 
            className="flex gap-2 md:gap-3"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'inherit'
            }}
          >
            {onSwitchSelection && (
              <motion.div
                onClick={onSwitchSelection}
                className="relative cursor-pointer group"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none'
                }}
              >
                {/* Aura magique du bouton */}
                <motion.div
                  className="absolute inset-0 rounded-xl blur-sm"
                  style={{
                    background: 'linear-gradient(to right, rgba(236, 72, 153, 0.6), rgba(139, 92, 246, 0.6))'
                  }}
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.6, 0.9, 0.6]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* Corps du bouton */}
                <div 
                  className="relative text-white px-3 md:px-4 py-2 rounded-xl shadow-xl border overflow-hidden"
                  style={{
                    background: 'linear-gradient(to right, #ec4899, #8b5cf6)',
                    borderColor: '#c084fc',
                    color: '#ffffff'
                  }}
                >
                  {/* Particules scintillantes */}
                  <div 
                    className="absolute inset-0 overflow-hidden"
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none'
                    }}
                  >
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={`switch-sparkle-${i}`}
                        className="absolute text-white/80 text-xs"
                        style={{
                          left: `${20 + i * 30}%`,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: 'transparent',
                          border: 'none'
                        }}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                          rotate: [0, 180]
                        }}
                        transition={{
                          duration: 1.5 + i * 0.3,
                          repeat: Infinity,
                          delay: i * 0.5,
                        }}
                      >
                        ✨
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Contenu du bouton */}
                  <div 
                    className="relative z-10 flex items-center gap-1 md:gap-2"
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#ffffff'
                    }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-sm"
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none'
                      }}
                    >
                      {isManualSelection ? '🔮' : '🎯'}
                    </motion.div>
                    <span 
                      className="text-xs md:text-sm font-bold whitespace-nowrap"
                      style={{
                        color: '#ffffff',
                        backgroundColor: 'transparent',
                        border: 'none'
                      }}
                    >
                      {isManualSelection ? 'Passer en IA' : 'Passer en Manuel'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            
            {onReset && (
              <motion.div
                onClick={onReset}
                className="relative cursor-pointer group"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none'
                }}
              >
                {/* Aura magique du bouton reset */}
                <motion.div
                  className="absolute inset-0 rounded-xl blur-sm"
                  style={{
                    background: 'linear-gradient(to right, rgba(239, 68, 68, 0.6), rgba(249, 115, 22, 0.6))'
                  }}
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.9, 0.5]
                  }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
                
                {/* Corps du bouton rectangulaire */}
                <div 
                  className="relative text-white px-3 md:px-4 py-2 rounded-xl shadow-xl border overflow-hidden"
                  style={{
                    background: 'linear-gradient(to right, #ef4444, #f97316)',
                    borderColor: '#fb7185',
                    color: '#ffffff'
                  }}
                >
                  {/* Particules scintillantes */}
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={`reset-sparkle-${i}`}
                        className="absolute text-white/80 text-xs"
                        style={{
                          left: `${20 + i * 30}%`,
                          top: '50%',
                          transform: 'translateY(-50%)'
                        }}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                          rotate: [0, 180]
                        }}
                        transition={{
                          duration: 1.5 + i * 0.3,
                          repeat: Infinity,
                          delay: i * 0.5,
                        }}
                      >
                        ✨
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Contenu du bouton */}
                  <div 
                    className="relative z-10 flex items-center gap-1 md:gap-2"
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#ffffff'
                    }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, -360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-sm"
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none'
                      }}
                    >
                      🔄
                    </motion.div>
                    <span 
                      className="text-xs md:text-sm font-bold whitespace-nowrap"
                      style={{
                        color: '#ffffff',
                        backgroundColor: 'transparent',
                        border: 'none'
                      }}
                    >
                      Recommencer
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Barre de Progression Magique Spectaculaire */}
      <div className="relative mb-4 md:mb-6">
        {/* Fond cristallin de la barre */}
        <div className="h-4 md:h-6 bg-gradient-to-r from-purple-900/40 via-purple-800/40 to-purple-900/40 rounded-2xl overflow-hidden shadow-2xl border border-purple-300/30">
          {/* Progression arc-en-ciel magique */}
          <motion.div
            className="h-full bg-gradient-to-r from-pink-400 via-purple-500 via-blue-500 via-green-400 via-yellow-400 to-red-500 rounded-2xl relative shadow-xl"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            {/* Onde magique qui traverse */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-2xl"
              animate={{ x: ["-150%", "150%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Particules scintillantes dans la barre */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`progress-sparkle-${i}`}
                  className="absolute text-white text-sm"
                  style={{
                    left: `${10 + i * 10}%`,
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                  animate={{
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 360]
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

        {/* Comète magique qui suit la progression */}
        <motion.div
          className="absolute -top-2 text-2xl md:text-3xl"
          style={{ left: `${Math.max(0, progressPercentage - 3)}%` }}
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 360],
            y: [0, -8, 0],
            x: [0, 5, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🌠
        </motion.div>

        {/* Explosions d'étoiles aux extrémités */}
        <motion.div
          className="absolute -top-3 -left-2 text-xl"
          animate={{ 
            scale: [0.5, 1.2, 0.5],
            rotate: [0, 180, 360],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          💫
        </motion.div>
        
        <motion.div
          className="absolute -top-3 -right-2 text-xl"
          animate={{ 
            scale: [0.8, 1.5, 0.8],
            rotate: [360, 0, 360],
            opacity: [0.3, 0.9, 0.3]
          }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
        >
          🎆
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
    </motion.div>
  );
}
