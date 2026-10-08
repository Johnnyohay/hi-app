import { router, usePathname } from 'expo-router';
import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import { Pressable, ScrollView, useColorScheme, View, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';

import { Colors, ContentMaxWidth, Spacing } from '@/constants/theme';
import { useIsWideScreen } from '@/hooks/use-breakpoint';

export default function AppTabs() {
  return (
    <Tabs style={{ flex: 1 }}>
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Ask</TabButton>
          </TabTrigger>
          <TabTrigger name="messages" href="/messages" asChild>
            <TabButton>Messages</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>Network</TabButton>
          </TabTrigger>
          <TabTrigger name="map" href="/map" asChild>
            <TabButton>Map</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton>Profile</TabButton>
          </TabTrigger>
          <AboutLink />
        </CustomTabList>
      </TabList>
      <TabSlot style={{ flex: 1 }} />
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButtonView, pressed && styles.pressed]}>
      <ThemedText type="label" themeColor={isFocused ? 'ink' : 'inkMuted'}>
        {children}
      </ThemedText>
      <View
        style={[
          styles.tabIndicator,
          { backgroundColor: isFocused ? colors.accent : 'transparent' },
        ]}
      />
    </Pressable>
  );
}

/** Not a tab route (About lives outside the (tabs) group) — styled to match TabButton so it reads as one. */
function AboutLink() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isFocused = usePathname() === '/about';

  return (
    <Pressable
      onPress={() => router.push('/about')}
      style={({ pressed }) => [styles.tabButtonView, pressed && styles.pressed]}>
      <ThemedText type="label" themeColor={isFocused ? 'ink' : 'inkMuted'}>
        About
      </ThemedText>
      <View
        style={[styles.tabIndicator, { backgroundColor: isFocused ? colors.accent : 'transparent' }]}
      />
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  // The tab row doesn't fit alongside the full brand group at phone width —
  // previously it just silently overflowed off-screen, making the tabs past
  // "Messages" untappable (and anything behind that overflow able to
  // intercept taps meant for them). Drop the tagline and let the row scroll
  // horizontally so every tab stays reachable instead.
  const isWide = useIsWideScreen();

  return (
    <View
      {...props}
      style={[
        styles.bar,
        { backgroundColor: colors.background, borderBottomColor: colors.hairline },
      ]}>
      <View style={styles.innerContainer}>
        <View style={styles.brandGroup}>
          <ThemedText type="title">Hi</ThemedText>
          {isWide && (
            <ThemedText type="label" themeColor="inkMuted">
              True connections, fast and easy
            </ThemedText>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
          style={styles.tabsScroll}>
          {props.children}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  innerContainer: {
    width: '100%',
    maxWidth: ContentMaxWidth,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabsScroll: {
    flex: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  pressed: {
    opacity: 0.6,
  },
  tabButtonView: {
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  tabIndicator: {
    height: 2,
    borderRadius: 1,
  },
});
