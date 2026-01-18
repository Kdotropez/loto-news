/**
 * HEADER MOBILE
 * En-tête optimisé pour smartphones
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Menu, Star, Target, RefreshCw, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MobileHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
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
  showStats?: boolean;
}

export default function MobileHeader({
  title,
  showBackButton = false,
  onBack,
  onMenuToggle,
  showMenuButton = true,
  remainingCombinations = 19068840,
  remainingCombinationsSecondTirage = 1906884,
  onDataUpdate,
  lastDraw,
  chanceLevel = 0,
  showStats = true
}: MobileHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    if (!onDataUpdate) return;
    setIsRefreshing(true);
    try {
      await onDataUpdate();
      toast.success('Données actualisées');
    } catch (error) {
      console.error('Erreur refresh:', error);
      toast.error('Erreur lors de l’actualisation');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-50"
    >
      {/* Barre principale */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3">
        
        {/* Côté gauche */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {showBackButton ? (
            <button
              onClick={onBack}
              className="p-2 sm:p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          ) : showMenuButton ? (
            <button
              onClick={onMenuToggle}
              className="p-2 sm:p-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          ) : null}
          
          {/* Logo + titre */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-white/70">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight truncate max-w-[140px] sm:max-w-none">
                {title || 'KDO LOTO'}
              </h1>
              {showStats && (
                <p className="text-[10px] sm:text-xs text-gray-500 leading-tight">
                  {(remainingCombinations / 1000000).toFixed(1)}M combinaisons
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Côté droit */}
        <div className="flex items-center gap-1.5 sm:gap-2 sm:justify-end w-full sm:w-auto">
          {/* Actualiser */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || !onDataUpdate}
            className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors shadow-sm disabled:opacity-50"
            title="Actualiser les données"
          >
            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-xs font-semibold">Actualiser</span>
          </button>

          {/* Réinitialiser cache */}
          <button
            onClick={handleResetLocalCache}
            className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors shadow-sm"
            title="Réinitialiser le cache local"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline text-xs font-semibold">Cache</span>
          </button>
        </div>
      </div>

      {/* Barre de statistiques (optionnelle) */}
      {showStats && (
        <div className="px-3 sm:px-4 pb-2">
          <div className="flex items-center justify-between text-[10px] sm:text-xs">
            
            {/* Niveau de chance */}
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-primary-600" />
              <span className="text-gray-600">Chance:</span>
              <span className="font-semibold text-primary-700">{chanceLevel}%</span>
            </div>

            {/* Dernier tirage (compact) */}
            {lastDraw && (
              <div className="flex items-center gap-1">
                <span className="text-gray-600">Dernier:</span>
                <div className="flex gap-0.5">
                  {lastDraw.numbers.slice(0, 3).map((num, index) => (
                    <span key={index} className="w-4 h-4 bg-primary-100 text-primary-800 text-xs font-bold rounded-full flex items-center justify-center">
                      {num}
                    </span>
                  ))}
                  <span className="text-gray-400 mx-1">...</span>
                  <span className="w-4 h-4 bg-loto-yellow text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {lastDraw.complementary}
                  </span>
                </div>
              </div>
            )}

            {/* Second tirage */}
            <div className="flex items-center gap-1">
              <span className="text-gray-600">2nd:</span>
              <span className="font-semibold text-loto-green">
                {(remainingCombinationsSecondTirage / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.header>
  );
}



