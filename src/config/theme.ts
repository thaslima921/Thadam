// =========================================================================
// THADAM TN — KANCHI SILK DESIGN SYSTEM & TOKENS (docs/DESIGN.md)
// "Explore Beyond the Famous. Empower the Local."
// =========================================================================

export const colors = {
  // Theme 1: Kanchi Silk Palette
  background: '#FBF3E4',
  surface: '#FFF8EA',
  ink: '#3A0F18',
  primary: '#7A1426',
  onPrimary: '#FBF3E4',
  gold: '#B8862B',
  goldText: '#8A6508',
  line: '#DDC48F',
  navBg: '#F4E6C8',

  // Pressure indicators (Always pair with text + dot)
  pressureComfortable: '#17702F',
  pressureModerate: '#8A6508',
  pressureHigh: '#B45309',
  pressureVeryHigh: '#B3261E',

  // Semantic & UI aliases
  surfaceSubtle: '#F4E6C8',
  border: '#DDC48F',
  borderLight: '#E8D8B6',
  textPrimary: '#3A0F18',
  textSecondary: '#6B4048',
  textTertiary: '#8A6508',
  textWhite: '#FBF3E4',
  textGold: '#8A6508',

  // Semantic feedback
  success: '#17702F',
  forestGreen: '#17702F',
  forestGreenLight: 'rgba(23, 112, 47, 0.12)',
  warning: '#B45309',
  coral: '#B45309',
  danger: '#B3261E',
  error: '#B3261E',
  sand: '#DDC48F',
  sandLight: '#F4E6C8',
  warmSand: '#F4E6C8',
  accentGold: '#B8862B',
  secondary: '#8A6508',
  timelinePath: '#DDC48F',
  secondaryIndigo: '#3A0F18',
  goldLight: '#F4E6C8',
  warmSandLight: '#FBF3E4',
  coralLight: 'rgba(180, 83, 9, 0.15)',

  // Overlays
  overlayDark: 'rgba(58, 15, 24, 0.65)',
  overlayGlass: 'rgba(251, 243, 228, 0.92)',
  overlaySheet: 'rgba(58, 15, 24, 0.50)',
};

import { Platform } from 'react-native';

export const typography = {
  fontFamily: Platform.select({
    web: 'HindMadurai_400Regular, "Hind Madurai", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    default: 'HindMadurai_400Regular',
  }) as string,
  fontFamilyHeading: Platform.select({
    web: 'CormorantGaramond_700Bold, "Cormorant Garamond", Georgia, serif',
    default: 'CormorantGaramond_700Bold',
  }) as string,
  fontFamilyMedium: Platform.select({
    web: 'HindMadurai_500Medium, "Hind Madurai", sans-serif',
    default: 'HindMadurai_500Medium',
  }) as string,
  fontFamilyBold: Platform.select({
    web: 'HindMadurai_700Bold, "Hind Madurai", sans-serif',
    default: 'HindMadurai_700Bold',
  }) as string,
  fontFamilyMono: 'monospace',
  sizes: {
    xs: 12,
    small: 13,
    sm: 14,
    body: 15,
    md: 16,
    lg: 18,
    xl: 20,
    h3: 21,
    sectionHeading: 21,
    h2: 26,
    screenHeading: 26,
    '2xl': 26,
    h1: 34,
    display: 34,
    '3xl': 34,
    metadata: 11,
    supporting: 13,
    cardHeading: 17,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    uppercaseTag: 1.0,
  },
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  screenPadding: 20,
  xl: 24,
  xxl: 32,
  '2xl': 32,
  xxxl: 40,
  huge: 48,
};

export const radii = {
  button: 12,
  input: 14,
  cardSmall: 14,
  smCard: 14,
  card: 14, // docs/DESIGN.md: card 14
  hero: 24,
  sheet: 24, // docs/DESIGN.md: sheet 24
  pill: 999, // docs/DESIGN.md: pill 999
  full: 999,
  archHero: 160, // Signature Element 1: Arch hero top corner radius 160
  sm: 8,
  md: 12,
  lg: 14,
  xl: 24,
};

export const shadows = {
  subtle: {
    shadowColor: '#3A0F18',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  // Soft, opacity 0.08 per docs/DESIGN.md
  card: {
    shadowColor: '#3A0F18',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  floating: {
    shadowColor: '#3A0F18',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },
  elevated: {
    shadowColor: '#3A0F18',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },
};
