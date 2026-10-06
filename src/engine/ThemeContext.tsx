/**
 * ThemeContext - Dynamic CSS Custom Properties Injection & Theme Engine
 *
 * Implements:
 * - Dynamic transformation of ThemeTokens into CSS custom properties
 * - Non-destructive :root DOM style injection with cleanup
 * - Seamless integration with StoreContext and independent standalone usage
 * - Zero `any` types
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  ThemeTokens,
  ColorTokens,
  TypographyTokens,
  ShapeTokens,
  LayoutTokens,
  AnimationTokens,
  BorderRadiusValue,
  AnimationIntensityValue,
} from '../types/theme';
import { StoreContext } from './StoreContext';

// ---------------------------------------------------------------------------
// Constants & Radius/Animation Mappings
// ---------------------------------------------------------------------------

export const BORDER_RADIUS_MAP: Record<BorderRadiusValue, string> = {
  none: '0px',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
};

export const ANIMATION_DURATION_MAP: Record<AnimationIntensityValue, string> = {
  snappy: '150ms',
  smooth: '300ms',
  subtle: '300ms',
  cinematic: '600ms',
};

export const ANIMATION_EASING_MAP: Record<AnimationIntensityValue, string> = {
  snappy: 'cubic-bezier(0.2, 0, 1, 1)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  subtle: 'cubic-bezier(0.4, 0, 0.2, 1)',
  cinematic: 'cubic-bezier(0.16, 1, 0.3, 1)',
};

export const DEFAULT_THEME_TOKENS: ThemeTokens = {
  colors: {
    primary: '#111827',
    secondary: '#4B5563',
    accent: '#3B82F6',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textMuted: '#6B7280',
    border: '#E5E7EB',
  },
  typography: {
    headingFont: 'Inter, sans-serif',
    bodyFont: 'Inter, sans-serif',
    scale: 'normal',
  },
  shape: {
    borderRadius: 'md',
    cardStyle: 'bordered',
  },
  layout: {
    headerStyle: 'centered',
    heroVariant: 'standard',
    contentDensity: 'comfortable',
  },
  animation: {
    intensity: 'smooth',
  },
};

/**
 * Transforms a ThemeTokens object into a flat map of CSS variables.
 */
export function generateThemeCssVariables(tokens: ThemeTokens): Record<string, string> {
  const borderRadius = BORDER_RADIUS_MAP[tokens.shape.borderRadius] || '0.375rem';
  const animationDuration = ANIMATION_DURATION_MAP[tokens.animation.intensity] || '300ms';
  const animationEasing = ANIMATION_EASING_MAP[tokens.animation.intensity] || 'cubic-bezier(0.4, 0, 0.2, 1)';

  return {
    // 1. Color Custom Properties
    '--color-primary': tokens.colors.primary,
    '--color-secondary': tokens.colors.secondary,
    '--color-accent': tokens.colors.accent,
    '--color-background': tokens.colors.background,
    '--color-bg': tokens.colors.background,
    '--color-surface': tokens.colors.surface,
    '--color-text': tokens.colors.text,
    '--color-text-muted': tokens.colors.textMuted,
    '--color-border': tokens.colors.border,

    // 2. Typography Custom Properties
    '--font-heading': tokens.typography.headingFont,
    '--font-body': tokens.typography.bodyFont,
    '--font-scale': tokens.typography.scale,

    // 3. Shape Custom Properties
    '--border-radius': borderRadius,
    '--theme-radius': borderRadius,
    '--radius-card':
      tokens.shape.borderRadius === 'none'
        ? '0px'
        : tokens.shape.cardStyle === 'flat'
        ? '0px'
        : borderRadius,
    '--radius-btn':
      tokens.shape.borderRadius === 'none'
        ? '0px'
        : tokens.shape.borderRadius === 'full'
        ? '9999px'
        : borderRadius,
    '--radius-button':
      tokens.shape.borderRadius === 'none'
        ? '0px'
        : tokens.shape.borderRadius === 'full'
        ? '9999px'
        : borderRadius,
    '--card-style': tokens.shape.cardStyle,

    // 4. Layout Custom Properties
    '--header-style': tokens.layout.headerStyle,
    '--hero-variant': tokens.layout.heroVariant,
    '--content-density': tokens.layout.contentDensity,

    // 5. Animation Custom Properties
    '--animation-duration': animationDuration,
    '--animation-easing': animationEasing,
  };
}

/**
 * Injects CSS custom properties into :root with cleanup mechanism.
 */
export function applyThemeToRoot(variables: Record<string, string>): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  const root = document.documentElement;
  const previousValues: Record<string, string> = {};

  Object.entries(variables).forEach(([key, value]) => {
    previousValues[key] = root.style.getPropertyValue(key);
    root.style.setProperty(key, value);
  });

  return () => {
    Object.entries(previousValues).forEach(([key, prevValue]) => {
      if (prevValue) {
        root.style.setProperty(key, prevValue);
      } else {
        root.style.removeProperty(key);
      }
    });
  };
}

// ---------------------------------------------------------------------------
// Context & Hook Interfaces
// ---------------------------------------------------------------------------

export interface ThemeContextValue {
  tokens: ThemeTokens;
  colors: ColorTokens;
  typography: TypographyTokens;
  shape: ShapeTokens;
  layout: LayoutTokens;
  animation: AnimationTokens;
  cssVariables: Record<string, string>;
  setThemeTokens: (tokens: ThemeTokens) => void;
  resetThemeTokens: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  tokens?: ThemeTokens;
  children?: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  tokens: explicitTokens,
  children,
}) => {
  // Check if StoreContext is active in ancestor tree
  const storeContext = useContext(StoreContext);
  const storeTheme = storeContext?.storeConfig?.theme;

  const initialTokens = explicitTokens || storeTheme || DEFAULT_THEME_TOKENS;
  const [tokens, setTokens] = useState<ThemeTokens>(initialTokens);

  // Sync if explicitTokens or storeTheme changes
  useEffect(() => {
    if (explicitTokens) {
      setTokens(explicitTokens);
    } else if (storeTheme) {
      setTokens(storeTheme);
    }
  }, [explicitTokens, storeTheme]);

  const cssVariables = useMemo(() => generateThemeCssVariables(tokens), [tokens]);

  // Inject CSS properties into :root on change with cleanup
  useEffect(() => {
    const cleanup = applyThemeToRoot(cssVariables);
    return cleanup;
  }, [cssVariables]);

  const setThemeTokens = useCallback((newTokens: ThemeTokens) => {
    setTokens(newTokens);
  }, []);

  const resetThemeTokens = useCallback(() => {
    setTokens(explicitTokens || storeTheme || DEFAULT_THEME_TOKENS);
  }, [explicitTokens, storeTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      tokens,
      colors: tokens.colors,
      typography: tokens.typography,
      shape: tokens.shape,
      layout: tokens.layout,
      animation: tokens.animation,
      cssVariables,
      setThemeTokens,
      resetThemeTokens,
    }),
    [tokens, cssVariables, setThemeTokens, resetThemeTokens]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
