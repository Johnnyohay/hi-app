import { useWindowDimensions } from 'react-native';

/** Two-column list/detail layouts kick in above this width (spec: 1024px). */
export const WIDE_BREAKPOINT = 1024;

export function useIsWideScreen() {
  const { width } = useWindowDimensions();
  return width >= WIDE_BREAKPOINT;
}
