/**
 * Design tokens — the single source of truth for color, type, and spacing.
 * Consumed by tailwind.config.ts (NativeWind utility classes) and by
 * src/constants/theme.ts (native color-scheme switching, non-NativeWind styles).
 *
 * Colors: back to the original warm palette. Type (IBM Plex Sans/Mono) and
 * the sharper "Field Index" corner radii stayed from that redesign pass —
 * only the color direction was reverted.
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
  // Kept the "serif" key name so every existing `font-serif*` className
  // across the app still resolves correctly — only the typeface changed,
  // from Fraunces to IBM Plex Sans's bolder weights for display/title text.
  serif: {
    regular: 'IBMPlexSans_500Medium',
    medium: 'IBMPlexSans_600SemiBold',
    semibold: 'IBMPlexSans_700Bold',
    semiboldItalic: 'IBMPlexSans_700Bold_Italic',
  },
  sans: {
    regular: 'IBMPlexSans_400Regular',
    medium: 'IBMPlexSans_500Medium',
    semibold: 'IBMPlexSans_600SemiBold',
  },
  mono: {
    regular: 'IBMPlexMono_400Regular',
    medium: 'IBMPlexMono_500Medium',
  },
} as const;

/**
 * Type scale: at least 4 distinct sizes, each with a deliberate line-height
 * and letter-spacing — hierarchy comes from more than font-weight.
 */
export const typeScale = {
  display: {
    fontFamily: fontFamilyTokens.serif.semibold,
    fontSize: 42,
    lineHeight: 48,
    letterSpacing: -0.2,
  },
  title: {
    fontFamily: fontFamilyTokens.serif.medium,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.1,
  },
  body: {
    fontFamily: fontFamilyTokens.sans.regular,
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontFamily: fontFamilyTokens.sans.medium,
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0,
  },
  label: {
    fontFamily: fontFamilyTokens.mono.medium,
    fontSize: 13,
    lineHeight: 19,
    letterSpacing: 0.4,
  },
  caption: {
    fontFamily: fontFamilyTokens.mono.regular,
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 0.3,
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

/** Sharp and flat — a directory, not a stack of soft cards. */
export const radiusTokens = {
  none: 0,
  sm: 2,
  md: 4,
} as const;
