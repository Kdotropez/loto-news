/**
 * HEADER DESKTOP
 * En-tête optimisé pour écrans larges
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, RefreshCw, Trash2,
  TrendingUp, DollarSign, Target, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DesktopHeaderProps {
  remainingCombinations?: number;
  remainingCombinationsSecondTirage?: number;
  onDataUpdate?: () => void;
  lastDraw?: {
    date: string;
    numbers: number[];
    complementary: number;
    joker?: string;
  } | null;
  chanceLevel?: number;
}

export default function DesktopHeader({
  remainingCombinations = 19068840,
  remainingCombinationsSecondTirage = 1906884,
  onDataUpdate,
  lastDraw,
  chanceLevel = 0
}: DesktopHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onDataUpdate?.();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResetLocalCache = () => {
    if (typeof window === 'undefined') return;
    const confirmed = window.confirm('Réinitialiser le cache local des tirages ?');
    if (!confirmed) return;
    try {
      localStorage.removeItem('loto_tirages');
      localStorage.removeItem('last_opendatasoft_sync');
      toast.success('Cache local réinitialisé');
      onDataUpdate?.();
    } catch (error) {
      console.error('Erreur reset cache:', error);
      toast.error('Impossible de réinitialiser le cache');
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 lg:px-6 py-3 lg:py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo et titre */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <div className="relative">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-lg ring-1 ring-white/70">
                <Star className="w-5 h-5 lg:w-7 lg:h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-loto-red rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Kdo Loto Gagnant
              </h1>
              <p className="text-sm lg:text-base text-gray-600">
                Optimisez vos chances au Loto National
              </p>
            </div>
          </motion.div>

          {/* Statistiques centrales */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden xl:flex items-center gap-8"
          >
            {/* Combinaisons restantes */}
            <div className="text-center">
              <div className="flex items-center gap-2 text-2xl font-bold text-primary-700">
                <Target className="w-6 h-6" />
                {(remainingCombinations / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-gray-500">Combinaisons principales</p>
            </div>

            {/* Second tirage */}
            <div className="text-center">
              <div className="flex items-center gap-2 text-xl font-bold text-loto-green">
                <Award className="w-5 h-5" />
                {(remainingCombinationsSecondTirage / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-gray-500">Second tirage</p>
            </div>

            {/* Niveau de chance */}
            <div className="text-center">
              <div className="flex items-center gap-2 text-xl font-bold text-loto-yellow">
                <TrendingUp className="w-5 h-5" />
                {chanceLevel}%
              </div>
              <p className="text-xs text-gray-500">Niveau chance</p>
            </div>

            {/* Dernier tirage */}
            {lastDraw && (
              <div className="text-center">
                <div className="flex items-center gap-1">
                  {lastDraw.numbers.map((num, index) => (
                    <span key={index} className="w-6 h-6 bg-primary-100 text-primary-800 text-xs font-bold rounded-full flex items-center justify-center">
                      {num}
                    </span>
                  ))}
                  <span className="w-6 h-6 bg-loto-yellow text-white text-xs font-bold rounded-full flex items-center justify-center ml-1">
                    {lastDraw.complementary}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(lastDraw.date).toLocaleDateString('fr-FR')}
                </p>
              </div>
            )}
          </motion.div>

          {/* Actions utilisateur */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 lg:gap-4 shrink-0"
          >
            {/* Actualiser */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors shadow-sm disabled:opacity-50"
              title="Actualiser les données"
            >
              <RefreshCw className={`w-4 h-4 lg:w-5 lg:h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden xl:inline text-sm font-semibold">Actualiser</span>
            </button>

            {/* Réinitialiser cache */}
            <button
              onClick={handleResetLocalCache}
              className="flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors shadow-sm"
              title="Réinitialiser le cache local"
            >
              <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="hidden xl:inline text-sm font-semibold">Réinitialiser cache</span>
            </button>
          </motion.div>
        </div>

        {/* Barre de progression pour les mises à jour */}
        {isRefreshing && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="absolute bottom-0 left-0 h-1 bg-primary-600 origin-left"
            style={{ width: '100%' }}
          />
        )}
      </div>
    </motion.header>
  );
}



