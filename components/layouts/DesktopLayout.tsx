/**
 * LAYOUT DESKTOP
 * Interface optimisée pour écrans larges (≥1024px)
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import DesktopHeader from './desktop/DesktopHeader';
import DesktopSidebar from './desktop/DesktopSidebar';
import DesktopFooter from './desktop/DesktopFooter';

interface DesktopLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  sidebarContent?: React.ReactNode;
  headerProps?: {
    remainingCombinations?: number;
    remainingCombinationsSecondTirage?: number;
    onDataUpdate?: () => void;
    lastDraw?: any;
    chanceLevel?: number;
  };
}

export default function DesktopLayout({
  children,
  showSidebar = true,
  sidebarContent,
  headerProps = {}
}: DesktopLayoutProps) {
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Desktop */}
      <DesktopHeader {...headerProps} />
      
      <div className="flex flex-1">
        {/* Sidebar optionnelle */}
        {showSidebar && (
          <DesktopSidebar>
            {sidebarContent}
          </DesktopSidebar>
        )}
        
        {/* Contenu principal */}
        <main className={`flex-1 ${showSidebar ? 'lg:ml-64' : ''}`}>
          <div className="container mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
      
      {/* Footer Desktop */}
      <DesktopFooter />
    </div>
  );
}



