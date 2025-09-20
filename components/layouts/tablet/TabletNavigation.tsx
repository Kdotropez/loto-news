/**
 * NAVIGATION TABLETTE
 * Navigation adaptative pour tablettes
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  component?: React.ComponentType<any>;
}

interface TabletNavigationProps {
  items: NavigationItem[];
  activeTab: string;
  onTabChange?: (tab: string) => void;
  orientation: 'vertical' | 'horizontal';
}

export default function TabletNavigation({
  items,
  activeTab,
  onTabChange,
  orientation
}: TabletNavigationProps) {
  
  if (orientation === 'vertical') {
    // Navigation latérale (paysage)
    return (
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-gray-800 mb-4">Navigation</h3>
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon && <item.icon className="w-5 h-5" />}
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Navigation horizontale (portrait)
  return (
    <div className="bg-white border-t border-gray-200 px-2 py-2">
      <div className="flex justify-around">
        {items.slice(0, 4).map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.icon && <item.icon className="w-5 h-5" />}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


