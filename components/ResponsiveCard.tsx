'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ResponsiveCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'bordered' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  onClick?: () => void;
  loading?: boolean;
}

export default function ResponsiveCard({
  title,
  subtitle,
  icon,
  children,
  className = '',
  variant = 'default',
  size = 'md',
  clickable = false,
  onClick,
  loading = false
}: ResponsiveCardProps) {

  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg';
      case 'bordered':
        return 'bg-white border-2 border-gray-300 shadow-sm';
      case 'flat':
        return 'bg-gray-50 border-0';
      default:
        return 'bg-white border border-gray-200 shadow-md';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-3 sm:p-4';
      case 'lg':
        return 'p-6 sm:p-8';
      default:
        return 'p-4 sm:p-6';
    }
  };

  const cardClasses = `
    responsive-card
    rounded-lg sm:rounded-xl
    transition-all duration-200
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${clickable ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]' : ''}
    ${loading ? 'animate-pulse' : ''}
    ${className}
  `;

  const CardContent = () => (
    <>
      {/* Header */}
      {(title || subtitle || icon) && (
        <div className="card-header mb-4">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="flex-shrink-0 mt-1">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="card-content">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </>
  );

  if (clickable && onClick) {
    return (
      <motion.div
        className={cardClasses}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CardContent />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cardClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CardContent />
    </motion.div>
  );
}

// Composant pour une grille de cartes responsive
export function ResponsiveCardGrid({
  children,
  columns = 'auto',
  gap = 'md',
  className = ''
}: {
  children: React.ReactNode;
  columns?: 'auto' | 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const getGridClasses = () => {
    let gridCols = '';
    
    if (columns === 'auto') {
      gridCols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    } else {
      switch (columns) {
        case 1:
          gridCols = 'grid-cols-1';
          break;
        case 2:
          gridCols = 'grid-cols-1 sm:grid-cols-2';
          break;
        case 3:
          gridCols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
          break;
        case 4:
          gridCols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
          break;
      }
    }

    const gapClass = gap === 'sm' ? 'gap-3' : gap === 'lg' ? 'gap-8' : 'gap-6';
    
    return `grid ${gridCols} ${gapClass}`;
  };

  return (
    <div className={`responsive-card-grid ${getGridClasses()} ${className}`}>
      {children}
    </div>
  );
}

// Composant pour les statistiques en cartes
export function StatCard({
  label,
  value,
  icon,
  trend,
  color = 'blue',
  size = 'md'
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900'
  };

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  return (
    <div className={`${colorClasses[color]} ${sizeClasses[size]} rounded-lg border-2`}>
      <div className="flex items-center justify-between mb-2">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        {trend && (
          <div className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      
      <div className="text-2xl sm:text-3xl font-bold mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      
      <div className="text-sm font-medium opacity-75">
        {label}
      </div>
    </div>
  );
}
