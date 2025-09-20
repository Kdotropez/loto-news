/**
 * NAVIGATION MOBILE
 * Navigation en bas pour mobiles
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  color?: string;
  badge?: string | number;
}

interface MobileNavigationProps {
  items: NavigationItem[];
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

export default function MobileNavigation({
  items,
  activeTab,
  onTabChange
}: MobileNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-4 gap-1 p-2">
        {items.slice(0, 4).map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTabChange?.(item.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.icon && <item.icon className="w-5 h-5 mb-1" />}
              <span className="text-xs font-medium truncate">{item.label}</span>
              {item.badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}


