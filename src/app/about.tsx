import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ABOUT_MAX_WIDTH = 760;

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="text-label font-mono-medium text-ink-muted dark:text-ink-muted-dark uppercase">
      {children}
    </Text>
  );
}

export default function AboutScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top', 'left', 'right']}>
      <ScrollView contentContainerClassName="items-center pb-4xl">
        <View className="w-full px-lg pt-4xl" style={{ maxWidth: ABOUT_MAX_WIDTH }}>
          <Pressable onPress={() => router.back()} className="self-start mb-2xl" hitSlop={8}>
            <Text className="text-label font-sans-medium text-accent dark:text-accent-dark">
              ‹ Back
            </Text>
          </Pressable>

          <Text className="text-display font-serif-semibold text-ink dark:text-ink-dark">
            What is Hi
          </Text>
          <Text
            className="text-body font-sans text-ink-muted dark:text-ink-muted-dark mt-lg"
            style={{ lineHeight: 30 }}>
            No long posts, no redundant pictures. Hi generates new connections based on what you
            need and what you can offer — not a feed to scroll, not a broker in the middle, no
            anonymous accounts. True connections, fast and easy.
          </Text>

          <View className="gap-sm mt-4xl">
            <SectionLabel>How matching works</SectionLabel>
            <Text
              className="text-body font-sans text-ink dark:text-ink-dark mt-sm"
              style={{ lineHeight: 30 }}>
              When you post an ask, we compare the keywords in what you wrote — plus the category
              you picked — against what each person in your network offers, their skills, role,
              and city. It&apos;s a keyword search, not AI, so specific words in your request surface
              better matches.
            </Text>
          </View>

          <View className="mt-4xl pt-2xl border-t border-hairline dark:border-hairline-dark">
            <Text className="text-caption font-mono text-ink-muted dark:text-ink-muted-dark">
              © 2026 Hi. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
