import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold,
  useFonts as usePlexSansFonts,
} from '@expo-google-fonts/ibm-plex-sans';
import { IBMPlexMono_400Regular, IBMPlexMono_500Medium, useFonts as usePlexMonoFonts } from '@expo-google-fonts/ibm-plex-mono';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Colors } from '@/constants/theme';
import { AuthProvider } from '@/lib/auth-context';
import { Sentry } from '@/lib/sentry';

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();
  const [plexSansLoaded] = usePlexSansFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_700Bold,
  });
  const [plexMonoLoaded] = usePlexMonoFonts({ IBMPlexMono_400Regular, IBMPlexMono_500Medium });

  // The tabs group owns "/" (native uses initialRouteName instead, above),
  // so on web a fresh visit to the bare root is sent to sign-in first. Runs
  // once on mount only — doesn't re-fire when navigation later returns to "/".
  useEffect(() => {
    if (pathname === '/') {
      router.replace('/sign-in');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!plexSansLoaded || !plexMonoLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack initialRouteName="sign-in">
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
          <Stack.Screen name="about" options={{ headerShown: false }} />
          <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
          <Stack.Screen name="terms-of-service" options={{ headerShown: false }} />
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

export default Sentry.wrap(RootLayout);
