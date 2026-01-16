/**
 * LAYOUT MOBILE
 * Interface optimisée pour smartphones (≤767px)
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MobileHeader from './mobile/MobileHeader';
import MobileNavigation from './mobile/MobileNavigation';
import MobileDrawer from './mobile/MobileDrawer';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  navigationItems?: Array<{
    id: string;
    label: string;
    icon: any;
    color?: string;
    badge?: string | number;
  }>;
  headerProps?: {
    remainingCombinations?: number;
    remainingCombinationsSecondTirage?: number;
    onDataUpdate?: () => void;
    lastDraw?: any;
    chanceLevel?: number;
  };
  showQuickActions?: boolean;
  quickActions?: Array<{
    id: string;
    label: string;
    icon: any;
    action: () => void;
    color?: string;
  }>;
}

export default function MobileLayout({
  children,
  title,
  showBackButton = false,
  onBack,
  activeTab = 'dashboard',
  onTabChange,
  navigationItems = [],
  headerProps = {},
  showQuickActions = false,
  quickActions = []
}: MobileLayoutProps) {
  const { isPortrait, isLandscape } = useDeviceDetection();
  const [showDrawer, setShowDrawer] = useState(false);
  const [showQuickActionsPanel, setShowQuickActionsPanel] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Mobile */}
      <MobileHeader 
        title={title}
        showBackButton={showBackButton}
        onBack={onBack}
        onMenuToggle={() => setShowDrawer(true)}
        showMenuButton={navigationItems.length > 0}
        {...headerProps}
      />
      
      {/* Contenu principal */}
      <main
        className="flex-1 overflow-auto"
        style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
      >
        <div className="px-3 py-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
      
      {/* Actions rapides flottantes */}
      {showQuickActions && quickActions.length > 0 && (
        <div
          className="fixed right-4 z-40"
          style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
        >
          <AnimatePresence>
            {showQuickActionsPanel && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="mb-4 space-y-2"
              >
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        action.action();
                        setShowQuickActionsPanel(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-full shadow-lg text-white font-medium ${
                        action.color || 'bg-primary-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{action.label}</span>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Bouton principal */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowQuickActionsPanel(!showQuickActionsPanel)}
            className="w-14 h-14 bg-primary-600 rounded-full shadow-lg flex items-center justify-center text-white"
          >
            <motion.div
              animate={{ rotate: showQuickActionsPanel ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              ✚
            </motion.div>
          </motion.button>
        </div>
      )}
      
      {/* Navigation en bas */}
      {navigationItems.length > 0 && (
        <MobileNavigation
          items={navigationItems}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      )}
      
      {/* Drawer de navigation */}
      <MobileDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        title="Navigation"
      >
        <div className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange?.(item.id);
                  setShowDrawer(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </MobileDrawer>
      
      {/* Overlay pour fermer les panels */}
      {(showDrawer || showQuickActionsPanel) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={() => {
            setShowDrawer(false);
            setShowQuickActionsPanel(false);
          }}
        />
      )}
    </div>
  );
}



