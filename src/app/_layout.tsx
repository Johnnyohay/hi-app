import { Fraunces_500Medium, Fraunces_600SemiBold, useFonts as useFrauncesFonts } from '@expo-google-fonts/fraunces';
import { Geist_400Regular, Geist_500Medium, Geist_600SemiBold, useFonts as useGeistFonts } from '@expo-google-fonts/geist';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Colors } from '@/constants/theme';
import { AuthProvider } from '@/lib/auth-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();
  const [frauncesLoaded] = useFrauncesFonts({ Fraunces_500Medium, Fraunces_600SemiBold });
  const [geistLoaded] = useGeistFonts({ Geist_400Regular, Geist_500Medium, Geist_600SemiBold });

  // The tabs group owns "/" (native uses initialRouteName instead, above),
  // so on web a fresh visit to the bare root is sent to sign-in first. Runs
  // once on mount only — doesn't re-fire when navigation later returns to "/".
  useEffect(() => {
    if (pathname === '/') {
      router.replace('/sign-in');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!frauncesLoaded || !geistLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack initialRouteName="sign-in">
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
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
    </AuthProvider>
  );
}
