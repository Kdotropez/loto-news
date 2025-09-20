/**
 * HEADER TABLETTE
 * En-tête optimisé pour tablettes
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Star } from 'lucide-react';

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
  onMenuToggle,
  showMenuButton = false
}: TabletHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          
          {/* Logo et menu */}
          <div className="flex items-center gap-3">
            {showMenuButton && (
              <button
                onClick={onMenuToggle}
                className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Kdo Loto Gagnant
                </h1>
                <p className="text-sm text-gray-600">
                  Version Tablette
                </p>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="text-right">
            <div className="text-lg font-bold text-primary-700">
              {(remainingCombinations / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-gray-500">Combinaisons</p>
          </div>
        </div>
      </div>
    </motion.header>
  );
}


