'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, Target } from 'lucide-react';
import { ComplexityLevel } from '../lib/complexity-manager';

interface LudicrousModeProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: ComplexityLevel) => void;
  currentMode: ComplexityLevel;
}

export default function LudicrousModeSelector({ isOpen, onClose, onSelectMode, currentMode }: LudicrousModeProps) {
  const [hoveredMode, setHoveredMode] = useState<ComplexityLevel | null>(null);

  const modes = [
    {
      id: 'beginner' as ComplexityLevel,
      title: '🌱 Apprenti Chanceux',
      subtitle: 'Simple et magique',
      description: 'Laissez la magie opérer !',
      color: 'from-emerald-400 via-teal-500 to-cyan-600',
      icon: Sparkles,
      particles: '✨🍀🌟',
      isActive: currentMode === 'beginner'
    },
    {
      id: 'intermediate' as ComplexityLevel,
      title: '⚡ Stratège Éclairé',
      subtitle: 'Équilibre parfait',
      description: 'Stratégie et intuition !',
      color: 'from-amber-400 via-orange-500 to-red-500',
      icon: Zap,
      particles: '⚡🎯🔥',
      isActive: currentMode === 'intermediate'
    },
    {
      id: 'expert' as ComplexityLevel,
      title: '🎯 Maître du Destin',
      subtitle: 'Contrôle total',
      description: 'Dominez les probabilités !',
      color: 'from-red-500 via-orange-500 to-yellow-500',
      icon: Target,
      particles: '🎯💎🏆',
      isActive: currentMode === 'expert'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Étoiles de fond animées */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-white/20 text-2xl"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.2, 0.8, 0.2],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </div>

            {/* Header magique */}
            <div className="text-center mb-8 relative z-10">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent mb-4"
                animate={{ 
                  backgroundPosition: ["0%", "100%", "0%"],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                ✨ Choisissez Votre Destin ✨
              </motion.h1>
              <p className="text-white/80 text-lg">
                Trois voies vers la fortune vous attendent...
              </p>
            </div>

            {/* Bouton fermer */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors z-20"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Modes en grille */}
            <div className="grid md:grid-cols-3 gap-6 relative z-10">
              {modes.map((mode, index) => (
                <motion.div
                  key={mode.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="relative group cursor-pointer"
                  onMouseEnter={() => setHoveredMode(mode.id)}
                  onMouseLeave={() => setHoveredMode(null)}
                  onClick={() => {
                    onSelectMode(mode.id);
                    onClose();
                  }}
                >
                  <div className={`relative bg-gradient-to-br ${mode.color} p-6 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl ${mode.isActive ? 'ring-4 ring-white/50' : ''}`}>
                    
                    {/* Particules animées */}
                    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                      {mode.particles.split('').map((particle, i) => (
                        <motion.div
                          key={i}
                          className="absolute text-2xl"
                          style={{
                            left: `${20 + i * 25}%`,
                            top: `${10 + (i % 2) * 60}%`,
                          }}
                          animate={hoveredMode === mode.id ? {
                            y: [0, -20, 0],
                            rotate: [0, 360],
                            scale: [1, 1.3, 1],
                          } : {}}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                          }}
                        >
                          {particle}
                        </motion.div>
                      ))}
                    </div>

                    {/* Contenu */}
                    <div className="relative z-10 text-center text-white">
                      <motion.div
                        animate={hoveredMode === mode.id ? { scale: 1.2 } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="mb-4"
                      >
                        <mode.icon className="w-16 h-16 mx-auto mb-2" />
                      </motion.div>
                      
                      <h3 className="text-2xl font-bold mb-2">{mode.title}</h3>
                      <p className="text-white/90 text-lg mb-3">{mode.subtitle}</p>
                      <p className="text-white/80 text-sm">{mode.description}</p>
                      
                      {mode.isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center"
                        >
                          <span className="text-green-600 font-bold text-sm">✓</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Effet de brillance au hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl"
                      initial={{ x: "-100%" }}
                      animate={hoveredMode === mode.id ? { x: "100%" } : { x: "-100%" }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer magique */}
            <motion.div 
              className="text-center mt-8 relative z-10"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p className="text-white/60 text-sm">
                🎲 Chaque choix façonne votre aventure vers la fortune ! 🎲
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
