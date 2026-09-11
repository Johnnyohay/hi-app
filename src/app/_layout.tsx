import { Fraunces_500Medium, Fraunces_600SemiBold, useFonts as useFrauncesFonts } from '@expo-google-fonts/fraunces';
import { Geist_400Regular, Geist_500Medium, Geist_600SemiBold, useFonts as useGeistFonts } from '@expo-google-fonts/geist';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [frauncesLoaded] = useFrauncesFonts({ Fraunces_500Medium, Fraunces_600SemiBold });
  const [geistLoaded] = useGeistFonts({ Geist_400Regular, Geist_500Medium, Geist_600SemiBold });

  if (!frauncesLoaded || !geistLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="thread/[id]"
          options={{
            headerShadowVisible: false,
            headerStyle: { backgroundColor: Colors.light.background },
            headerTintColor: Colors.light.ink,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
