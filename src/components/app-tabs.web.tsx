import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import { Pressable, useColorScheme, View, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';

import { Colors, ContentMaxWidth, Spacing } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs style={{ flex: 1 }}>
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Ask</TabButton>
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

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View
      {...props}
      style={[
        styles.bar,
        { backgroundColor: colors.background, borderBottomColor: colors.hairline },
      ]}>
      <View style={styles.innerContainer}>
        <ThemedText type="title" style={styles.brandText}>
          Hi
        </ThemedText>

        <View style={styles.tabsRow}>{props.children}</View>
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
  tabsRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginLeft: 'auto',
  },
  brandText: {
    marginRight: 'auto',
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
