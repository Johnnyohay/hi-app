import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import { useState } from 'react';
import { Pressable, useColorScheme, View, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';

import { Colors, ContentMaxWidth, Spacing, type ThemeColor } from '@/constants/theme';

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

function AboutPanel({ colors, onClose }: { colors: Record<ThemeColor, string>; onClose: () => void }) {
  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.aboutCard,
          { backgroundColor: colors.surface, borderColor: colors.hairline },
        ]}>
        <View style={styles.aboutHeaderRow}>
          <ThemedText type="title">What is Hi</ThemedText>
          <Pressable onPress={onClose} hitSlop={8}>
            <ThemedText type="label" themeColor="inkMuted">
              Close
            </ThemedText>
          </Pressable>
        </View>
        <ThemedText type="body" themeColor="inkMuted" style={styles.aboutParagraph}>
          No long posts, no redundant pictures. Hi is for asking people you actually know,
          directly — no feed, no broker, no anonymous accounts. True connections, fast and easy.
        </ThemedText>

        <ThemedText type="label" style={styles.aboutSectionTitle}>
          How matching works
        </ThemedText>
        <ThemedText type="body" themeColor="inkMuted" style={styles.aboutParagraph}>
          When you post an ask, we compare the keywords in what you wrote — plus the category you
          picked — against what each person in your network offers, their skills, role, and city.
          It&apos;s a keyword search, not AI, so specific words in your request surface better
          matches.
        </ThemedText>
      </View>
    </View>
  );
}

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [aboutOpen, setAboutOpen] = useState(false);

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
          <ThemedText type="label" themeColor="inkMuted">
            True connections, fast and easy
          </ThemedText>
          <Pressable onPress={() => setAboutOpen(true)} hitSlop={8}>
            <ThemedText type="label" themeColor="accent" style={styles.aboutLink}>
              About
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.tabsRow}>{props.children}</View>
      </View>

      {aboutOpen && <AboutPanel colors={colors} onClose={() => setAboutOpen(false)} />}
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
  brandGroup: {
    marginRight: 'auto',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  aboutLink: {
    textDecorationLine: 'underline',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  aboutCard: {
    marginTop: 96,
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderRadius: 4,
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  aboutHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aboutSectionTitle: {
    marginTop: Spacing.md,
  },
  aboutParagraph: {
    lineHeight: 20,
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
