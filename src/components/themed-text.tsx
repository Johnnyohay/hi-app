import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor, TypeScale } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextType = keyof typeof TypeScale | 'mono';

export type ThemedTextProps = TextProps & {
  type?: ThemedTextType;
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'body', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'ink'] },
        type === 'mono' ? styles.mono : styles[type],
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  display: TypeScale.display,
  title: TypeScale.title,
  body: TypeScale.body,
  bodyMedium: TypeScale.bodyMedium,
  label: TypeScale.label,
  caption: TypeScale.caption,
  mono: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    lineHeight: 16,
  },
});
