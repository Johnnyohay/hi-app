import { Text, View, useColorScheme } from 'react-native';

import { colorTokens } from '@/constants/tokens';

/** Initials from a name: first + last word, or just the first letter for a single word. */
export function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return (words[0].slice(0, 1) + words[words.length - 1].slice(0, 1)).toUpperCase();
}

/** Deterministic pick between the two token colors bold enough to carry text — not a rainbow palette. */
function hashToVariant(seed: string): 'ink' | 'accent' {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 2 === 0 ? 'ink' : 'accent';
}

export function Avatar({ name, seed, size }: { name: string; seed: string; size: number }) {
  const scheme = useColorScheme();
  const colors = colorTokens[scheme === 'dark' ? 'dark' : 'light'];
  const variant = hashToVariant(seed);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        backgroundColor: variant === 'ink' ? colors.ink : colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text
        style={{
          color: colors.background,
          fontFamily: 'Fraunces_600SemiBold',
          fontSize: size * 0.4,
        }}>
        {initialsFor(name)}
      </Text>
    </View>
  );
}
