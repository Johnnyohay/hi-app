import type { Config } from 'tailwindcss';
import nativewindPreset from 'nativewind/preset';

import { colorTokens, fontFamilyTokens, radiusTokens, spacingTokens, typeScale } from './src/constants/tokens';

type FontSizeEntry = [string, { lineHeight: string; letterSpacing: string }];

const fontSize = Object.fromEntries(
  Object.entries(typeScale).map(([key, value]): [string, FontSizeEntry] => [
    key,
    [`${value.fontSize}px`, { lineHeight: `${value.lineHeight}px`, letterSpacing: `${value.letterSpacing}px` }],
  ])
) satisfies Record<string, FontSizeEntry>;

export default {
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  presets: [nativewindPreset],
  theme: {
    extend: {
      fontFamily: {
        serif: [fontFamilyTokens.serif.regular],
        'serif-medium': [fontFamilyTokens.serif.medium],
        'serif-semibold': [fontFamilyTokens.serif.semibold],
        sans: [fontFamilyTokens.sans.regular],
        'sans-medium': [fontFamilyTokens.sans.medium],
        'sans-semibold': [fontFamilyTokens.sans.semibold],
      },
      fontSize,
      colors: {
        background: colorTokens.light.background,
        surface: colorTokens.light.surface,
        ink: colorTokens.light.ink,
        'ink-muted': colorTokens.light.inkMuted,
        accent: colorTokens.light.accent,
        hairline: colorTokens.light.hairline,
        'background-dark': colorTokens.dark.background,
        'surface-dark': colorTokens.dark.surface,
        'ink-dark': colorTokens.dark.ink,
        'ink-muted-dark': colorTokens.dark.inkMuted,
        'accent-dark': colorTokens.dark.accent,
        'hairline-dark': colorTokens.dark.hairline,
      },
      spacing: Object.fromEntries(
        Object.entries(spacingTokens).map(([key, value]) => [key, `${value}px`])
      ),
      borderRadius: Object.fromEntries(
        Object.entries(radiusTokens).map(([key, value]) => [key, `${value}px`])
      ),
    },
  },
  plugins: [],
} satisfies Config;
