/**
 * Design tokens — the single source of truth for color, type, and spacing.
 * Consumed by tailwind.config.ts (NativeWind utility classes) and by
 * src/constants/theme.ts (native color-scheme switching, non-NativeWind styles).
 *
 * Palette: one warm neutral background, one ink, one accent — used sparingly.
 * No blues, no purples, no rainbow category colors.
 */

export const colorTokens = {
  light: {
    background: '#F6F1E7', // warm parchment, not #FFFFFF
    surface: '#EDE6D6', // rows, sunken fields, dividers between sections
    ink: '#221F1B', // primary text, not #000000
    inkMuted: '#6B6559', // secondary text, meta
    accent: '#A63D2F', // terracotta — CTAs, active states, links only
    hairline: '#DED5C2', // borders, rules
  },
  dark: {
    background: '#17140F',
    surface: '#211D16',
    ink: '#F3ECDE',
    inkMuted: '#A79C89',
    accent: '#E2694F',
    hairline: '#332D22',
  },
} as const;

export type ColorScheme = keyof typeof colorTokens;
export type ColorToken = keyof typeof colorTokens.light;

export const fontFamilyTokens = {
  serif: {
    regular: 'Fraunces_400Regular',
    medium: 'Fraunces_500Medium',
    semibold: 'Fraunces_600SemiBold',
    semiboldItalic: 'Fraunces_600SemiBold_Italic',
  },
  sans: {
    regular: 'Geist_400Regular',
    medium: 'Geist_500Medium',
    semibold: 'Geist_600SemiBold',
  },
} as const;

/**
 * Type scale: at least 4 distinct sizes, each with a deliberate line-height
 * and letter-spacing — hierarchy comes from more than font-weight.
 */
export const typeScale = {
  display: {
    fontFamily: fontFamilyTokens.serif.semibold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.4,
  },
  title: {
    fontFamily: fontFamilyTokens.serif.medium,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: fontFamilyTokens.sans.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontFamily: fontFamilyTokens.sans.medium,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  label: {
    fontFamily: fontFamilyTokens.sans.medium,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.4,
  },
  caption: {
    fontFamily: fontFamilyTokens.sans.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
} as const;

export type TypeScaleToken = keyof typeof typeScale;

/** 8pt grid. */
export const spacingTokens = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export type SpacingToken = keyof typeof spacingTokens;

/** Sharp, editorial — never pill-shaped or glassy. */
export const radiusTokens = {
  none: 0,
  sm: 4,
  md: 10,
} as const;
