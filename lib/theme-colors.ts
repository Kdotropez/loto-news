/**
 * THÈME COULEURS PASTELS FONCÉS
 * Palette de couleurs pastels foncés pour remplacer les couleurs sombres
 */

export const PASTEL_THEME = {
  // Couleurs principales pastels foncés
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe', 
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',  // Bleu pastel foncé principal
    600: '#0284c7',  // Plus foncé
    700: '#0369a1',  // Encore plus foncé
    800: '#075985',
    900: '#0c4a6e'
  },

  // Couleurs spécialisées pastels foncés
  mobile: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0', 
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // Vert pastel foncé
    600: '#16a34a',  // Plus foncé
    700: '#15803d',  // Encore plus foncé
    800: '#166534',
    900: '#14532d'
  },

  tablet: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd', 
    400: '#60a5fa',
    500: '#3b82f6',  // Bleu pastel foncé
    600: '#2563eb',  // Plus foncé
    700: '#1d4ed8',  // Encore plus foncé
    800: '#1e40af',
    900: '#1e3a8a'
  },

  desktop: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c', 
    500: '#f97316',  // Orange pastel foncé
    600: '#ea580c',  // Plus foncé
    700: '#c2410c',  // Encore plus foncé
    800: '#9a3412',
    900: '#7c2d12'
  },

  // Couleurs utilitaires pastels foncés
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',  // Vert pastel foncé
    600: '#16a34a',
    700: '#15803d'
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',  // Orange pastel foncé
    600: '#d97706',
    700: '#b45309'
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',  // Rouge pastel foncé
    600: '#dc2626',
    700: '#b91c1c'
  },

  // Couleurs de complexité pastels foncés
  beginner: {
    50: '#f0fdf4',
    500: '#22c55e',  // Vert pastel foncé
    600: '#16a34a',
    700: '#15803d'
  },

  intermediate: {
    50: '#fffbeb', 
    500: '#f59e0b',  // Orange pastel foncé
    600: '#d97706',
    700: '#b45309'
  },

  expert: {
    50: '#fef2f2',
    500: '#ef4444',  // Rouge pastel foncé
    600: '#dc2626', 
    700: '#b91c1c'
  },

  // Couleurs neutres pastels
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',  // Gris pastel foncé
    600: '#4b5563',  // Plus foncé
    700: '#374151',  // Encore plus foncé
    800: '#1f2937',
    900: '#111827'
  }
} as const;

// Classes Tailwind correspondantes
export const PASTEL_CLASSES = {
  // Boutons principaux
  btnPrimary: 'bg-sky-500 hover:bg-sky-600 text-white',
  btnSuccess: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  btnWarning: 'bg-amber-500 hover:bg-amber-600 text-white',
  btnError: 'bg-rose-500 hover:bg-rose-600 text-white',

  // Headers
  headerMobile: 'bg-emerald-500 text-white',
  headerTablet: 'bg-sky-500 text-white', 
  headerDesktop: 'bg-orange-500 text-white',

  // Bannières
  bannerPrimary: 'bg-sky-100 border-sky-300 text-sky-800',
  bannerSuccess: 'bg-emerald-100 border-emerald-300 text-emerald-800',
  bannerWarning: 'bg-amber-100 border-amber-300 text-amber-800',

  // Complexité
  complexityBeginner: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  complexityIntermediate: 'bg-amber-500 hover:bg-amber-600 text-white',
  complexityExpert: 'bg-rose-500 hover:bg-rose-600 text-white',

  // Gradients
  gradientMobile: 'from-emerald-400 to-emerald-600',
  gradientTablet: 'from-sky-400 to-sky-600',
  gradientDesktop: 'from-orange-400 to-orange-600'
} as const;
