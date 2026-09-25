import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { colorTokens, radiusTokens } from '@/constants/tokens';

const DURATION = 400;

export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: {
      opacity: 1,
    },
    100: {
      opacity: 0,
      easing: Easing.out(Easing.ease),
    },
  });

  const mark = (
    <View style={styles.badge}>
      <Text style={styles.wordmark}>Hi</Text>
    </View>
  );

  return animate ? (
    <Animated.View
      entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.splashOverlay}>
      {mark}
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setAnimate(true);
        });
      }}
      style={styles.splashOverlay}>
      {mark}
    </View>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colorTokens.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  badge: {
    width: 96,
    height: 96,
    borderRadius: radiusTokens.md,
    backgroundColor: colorTokens.light.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontFamily: 'IBMPlexSans_700Bold',
    fontSize: 36,
    lineHeight: 40,
    color: colorTokens.light.background,
  },
});
