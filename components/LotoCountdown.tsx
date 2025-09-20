'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Zap } from 'lucide-react';
import { CountdownCalculator, NextDrawInfo } from '@/lib/countdown-calculator';

interface LotoCountdownProps {
  className?: string;
  compact?: boolean;
}

export default function LotoCountdown({ className = '', compact = false }: LotoCountdownProps) {
  const [drawInfo, setDrawInfo] = useState<NextDrawInfo | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const countdownCalculator = new CountdownCalculator();
  
  useEffect(() => {
    setMounted(true);
    
    // Fonction pour mettre à jour le compte à rebours
    const updateCountdown = () => {
      const info = countdownCalculator.getNextDrawInfo();
      setDrawInfo(info);
    };
    
    // Mise à jour immédiate
    updateCountdown();
    
    // Mise à jour toutes les secondes
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Éviter le hydration mismatch
  if (!mounted || !drawInfo) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Clock className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-400">Chargement...</span>
      </div>
    );
  }
  
  const timeFormatted = countdownCalculator.formatTimeRemaining(drawInfo.timeRemaining);
  const contextMessage = countdownCalculator.getContextMessage(drawInfo);
  
  // Version compacte pour mobile
  if (compact) {
    return (
      <motion.div 
        className={`flex items-center gap-2 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Clock className="w-4 h-4 text-yellow-400" />
        <div className="text-sm">
          <div className="text-xs text-yellow-200 font-medium">
            Prochain Loto
          </div>
          <div className="text-yellow-100 font-semibold">
            {drawInfo.isPast ? "🎲 EN COURS" : timeFormatted}
          </div>
        </div>
      </motion.div>
    );
  }
  
  // Version complète
  return (
    <motion.div 
      className={`${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-400/30">
        <div className="flex items-center gap-3">
          {/* Icône animée */}
          <motion.div
            animate={{ 
              rotate: drawInfo.isToday && drawInfo.timeRemaining.hours < 1 ? 360 : 0,
              scale: drawInfo.isToday && drawInfo.timeRemaining.minutes < 10 ? [1, 1.1, 1] : 1
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 0.5, repeat: Infinity }
            }}
          >
            {drawInfo.isToday && drawInfo.timeRemaining.hours < 1 ? (
              <Zap className="w-6 h-6 text-yellow-400" />
            ) : (
              <Clock className="w-6 h-6 text-yellow-400" />
            )}
          </motion.div>
          
          <div className="flex-1">
            {/* Message contextuel */}
            <div className="text-sm text-yellow-200 mb-1">
              {contextMessage}
            </div>
            
            {/* Compte à rebours principal */}
            <div className="flex items-center gap-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={timeFormatted}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl font-bold text-yellow-100"
                >
                  {drawInfo.isPast ? "🎲 EN COURS" : timeFormatted}
                </motion.div>
              </AnimatePresence>
              
              {/* Date du tirage */}
              <div className="text-sm text-yellow-300 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {drawInfo.date.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'short' 
                })} 20h15
              </div>
            </div>
          </div>
        </div>
        
        {/* Barre de progression pour les dernières heures */}
        {drawInfo.isToday && drawInfo.timeRemaining.hours < 6 && !drawInfo.isPast && (
          <div className="mt-3">
            <div className="w-full bg-yellow-900/30 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.max(0, 100 - (drawInfo.totalSeconds / (6 * 60 * 60)) * 100)}%` 
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-xs text-yellow-300 mt-1 text-center">
              {drawInfo.timeRemaining.hours < 1 ? "🔥 DERNIÈRE HEURE !" : "⏰ Dernières heures"}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
