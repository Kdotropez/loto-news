/**
 * HEADER TABLETTE
 * En-tête optimisé pour tablettes
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Star, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface TabletHeaderProps {
  remainingCombinations?: number;
  remainingCombinationsSecondTirage?: number;
  onDataUpdate?: () => void;
  lastDraw?: any;
  chanceLevel?: number;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export default function TabletHeader({
  remainingCombinations = 19068840,
  onDataUpdate,
  lastDraw,
  onMenuToggle,
  showMenuButton = false
}: TabletHeaderProps) {
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
      <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo et menu */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {showMenuButton && (
              <button
                onClick={onMenuToggle}
                className="p-2 sm:p-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
            
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-white/70">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate max-w-[220px] md:max-w-none">
                  Kdo Loto Gagnant
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Version Tablette
                </p>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            <div className="text-right">
              <div className="text-base sm:text-lg font-bold text-primary-700">
                {(remainingCombinations / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-gray-500">Combinaisons</p>
            </div>
            {lastDraw?.date && (
              <div className="hidden sm:block text-right">
                <div className="text-xs text-slate-500">Dernier tirage</div>
                <div className="text-sm font-semibold text-slate-700">
                  {new Date(lastDraw.date).toLocaleDateString('fr-FR')}
                </div>
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || !onDataUpdate}
              className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors shadow-sm disabled:opacity-50"
              title="Actualiser les données"
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline text-xs font-semibold">Actualiser</span>
            </button>
            <button
              onClick={handleResetLocalCache}
              className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors shadow-sm"
              title="Réinitialiser le cache local"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden md:inline text-xs font-semibold">Cache</span>
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}


