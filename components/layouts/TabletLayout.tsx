/**
 * LAYOUT TABLETTE
 * Interface optimisée pour tablettes (768px - 1023px)
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TabletHeader from './tablet/TabletHeader';
import TabletNavigation from './tablet/TabletNavigation';
import TabletFooter from './tablet/TabletFooter';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

interface TabletLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  navigationItems?: Array<{
    id: string;
    label: string;
    icon: any;
    component?: React.ComponentType<any>;
  }>;
  headerProps?: {
    remainingCombinations?: number;
    remainingCombinationsSecondTirage?: number;
    onDataUpdate?: () => void;
    lastDraw?: any;
    chanceLevel?: number;
  };
}

export default function TabletLayout({
  children,
  activeTab = 'dashboard',
  onTabChange,
  navigationItems = [],
  headerProps = {}
}: TabletLayoutProps) {
  const { isPortrait, isLandscape } = useDeviceDetection();
  const [showNavigationPanel, setShowNavigationPanel] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Tablette */}
      <TabletHeader 
        {...headerProps}
        onMenuToggle={() => setShowNavigationPanel(!showNavigationPanel)}
        showMenuButton={navigationItems.length > 0}
      />
      
      {/* Contenu principal avec navigation adaptative */}
      <div className="flex flex-1 relative">
        {/* Navigation latérale en paysage */}
        {isLandscape && navigationItems.length > 0 && (
          <motion.div
            initial={{ x: -250 }}
            animate={{ x: showNavigationPanel ? 0 : -250 }}
            className="fixed left-0 top-16 bottom-0 w-64 bg-white shadow-lg z-40 lg:relative lg:translate-x-0"
          >
            <TabletNavigation
              items={navigationItems}
              activeTab={activeTab}
              onTabChange={(tab) => {
                onTabChange?.(tab);
                setShowNavigationPanel(false);
              }}
              orientation="vertical"
            />
          </motion.div>
        )}
        
        {/* Contenu principal */}
        <main className="flex-1 overflow-auto">
          <div className={`${isPortrait ? 'px-4 py-4' : 'px-6 py-6'} max-w-full`}>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
      
      {/* Navigation en bas en portrait */}
      {isPortrait && navigationItems.length > 0 && (
        <TabletNavigation
          items={navigationItems}
          activeTab={activeTab}
          onTabChange={onTabChange}
          orientation="horizontal"
        />
      )}
      
      {/* Footer Tablette */}
      <TabletFooter />
      
      {/* Overlay pour fermer le menu en paysage */}
      {isLandscape && showNavigationPanel && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-30 lg:hidden"
          onClick={() => setShowNavigationPanel(false)}
        />
      )}
    </div>
  );
}



