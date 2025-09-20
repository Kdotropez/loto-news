/**
 * SIDEBAR DESKTOP
 * Barre latérale pour la version desktop
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface DesktopSidebarProps {
  children?: React.ReactNode;
}

export default function DesktopSidebar({ children }: DesktopSidebarProps) {
  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-16 bottom-0 w-64 bg-white shadow-lg border-r border-gray-200 z-30"
    >
      <div className="p-4 h-full overflow-y-auto">
        {children || (
          <div className="text-center text-gray-500 mt-8">
            <p>Sidebar Desktop</p>
            <p className="text-sm">Navigation avancée</p>
          </div>
        )}
      </div>
    </motion.aside>
  );
}


