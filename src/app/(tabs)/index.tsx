import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colorTokens } from '@/constants/tokens';

export default function AskScreen() {
  const [need, setNeed] = useState('');
  const canSend = need.trim().length > 0;
  const scheme = useColorScheme();
  const placeholderColor = colorTokens[scheme === 'dark' ? 'dark' : 'light'].inkMuted;

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-background-dark"
      edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-1 px-lg pt-2xl">
          <Text className="text-display font-serif-semibold text-ink dark:text-ink-dark">
            What do you need?
          </Text>

          <TextInput
            className="text-body font-sans text-ink dark:text-ink-dark mt-xl"
            style={{ minHeight: 96, outlineWidth: 0 }}
            value={need}
            onChangeText={setNeed}
            placeholder="I need someone who knows Series A fundraising in Bogotá."
            placeholderTextColor={placeholderColor}
            multiline
            autoFocus
          />
        </View>

        <View className="px-lg pb-lg">
          <Pressable
            disabled={!canSend}
            className="rounded-sm py-md items-center bg-accent dark:bg-accent-dark"
            style={{ opacity: canSend ? 1 : 0.35, minHeight: 44 }}>
            <Text className="text-label font-sans-medium text-background dark:text-background-dark">
              Send
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
