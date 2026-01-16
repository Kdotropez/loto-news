export type ThemeTokens = {
  colors: {
    bg: string;
    text: string;
    muted: string;
    primary: string;
    primary600: string;
    info: string;
    info600: string;
    brand: string;
    brand600: string;
    accent: string;
    accent600: string;
    success: string;
    warning: string;
    error: string;
  };
  radius: { sm: string; md: string; lg: string; xl: string; full: string };
  shadows: { sm: string; md: string; lg: string };
  motion: { fast: string; normal: string; slow: string };
  gradients: { mobile: string; tablet: string; desktop: string };
};

export const themeTokens: ThemeTokens = {
  colors: {
    bg: 'var(--color-bg)',
    text: 'var(--color-text)',
    muted: 'var(--color-muted)',
    primary: 'var(--color-primary)',
    primary600: 'var(--color-primary-600)',
    info: 'var(--color-info)',
    info600: 'var(--color-info-600)',
    brand: 'var(--color-brand)',
    brand600: 'var(--color-brand-600)',
    accent: 'var(--color-accent)',
    accent600: 'var(--color-accent-600)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-error)'
  },
  radius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    full: 'var(--radius-full)'
  },
  shadows: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)'
  },
  motion: {
    fast: 'var(--motion-fast)',
    normal: 'var(--motion-normal)',
    slow: 'var(--motion-slow)'
  },
  gradients: {
    mobile: 'var(--gradient-mobile)',
    tablet: 'var(--gradient-tablet)',
    desktop: 'var(--gradient-desktop)'
  }
};




