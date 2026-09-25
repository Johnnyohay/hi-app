/**
 * Native-side theme derived from the design tokens (src/constants/tokens.ts).
 * NativeWind utility classes read the same tokens via tailwind.config.ts —
 * this file exists for the color-scheme switching NativeWind's className
 * strings can't express well (two full, unrelated palettes rather than a
 * single hue shifted lighter/darker).
 */
import '@/global.css';

import { Platform } from 'react-native';

import { colorTokens, spacingTokens, typeScale } from '@/constants/tokens';

export const Colors = colorTokens;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const TypeScale = typeScale;

export const Fonts = Platform.select({
  web: {
    serif: 'var(--font-serif)',
    sans: 'var(--font-sans)',
    mono: 'var(--font-mono)',
  },
  default: {
    serif: 'IBMPlexSans_700Bold',
    sans: 'IBMPlexSans_400Regular',
    mono: 'IBMPlexMono_400Regular',
  },
});

export const Spacing = spacingTokens;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;

/** Width of the two-column list/detail shell on wide (web) screens. */
export const ContentMaxWidth = 1600;

/** Fixed width of the left list pane in a wide list/detail layout. */
export const ListPaneWidth = 480;
