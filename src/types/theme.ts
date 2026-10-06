/**
 * Theme & Token Type Definitions
 * Exact alignment with PROJECT.md lines 177-205.
 * Decomposes theme tokens into reusable sub-interfaces for colors, typography, shapes, layout, and animation.
 */

export interface ColorTokens {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
}

export type TypographyScale = 'compact' | 'normal' | 'expressive';

export interface TypographyTokens {
  headingFont: string;
  bodyFont: string;
  scale: TypographyScale;
}

export type BorderRadiusValue = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type CardStyleValue = 'flat' | 'bordered' | 'elevated' | 'glassmorphic';

export interface ShapeTokens {
  borderRadius: BorderRadiusValue;
  cardStyle: CardStyleValue;
}

export type HeaderStyleValue = 'centered' | 'left-aligned' | 'transparent-overlay' | 'tech-hud';
export type HeroVariantValue = 'standard' | 'split' | 'fullscreen';
export type ContentDensityValue = 'spacious' | 'comfortable' | 'dense';

export interface LayoutTokens {
  headerStyle: HeaderStyleValue;
  heroVariant: HeroVariantValue;
  contentDensity: ContentDensityValue;
}

export type AnimationIntensityValue = 'subtle' | 'smooth' | 'snappy' | 'cinematic';

export interface AnimationTokens {
  intensity: AnimationIntensityValue;
}

export interface ThemeTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  shape: ShapeTokens;
  layout: LayoutTokens;
  animation: AnimationTokens;
}
