import { Pressable, Text, View, useColorScheme } from 'react-native';

import { Avatar } from '@/components/avatar';
import type { Profile } from '@/lib/api';
import { colorTokens } from '@/constants/tokens';
import { flagPrefix } from '@/lib/country-flag';

export function project(lat: number, lng: number) {
  return {
    xPct: ((lng + 180) / 360) * 100,
    yPct: ((90 - lat) / 180) * 100,
  };
}

function Pin({
  xPct,
  yPct,
  selected,
  isMe,
  onPress,
  inkColor,
  accentColor,
  ringColor,
}: {
  xPct: number;
  yPct: number;
  selected: boolean;
  isMe?: boolean;
  onPress: () => void;
  inkColor: string;
  accentColor: string;
  ringColor: string;
}) {
  const size = selected ? 14 : 10;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={{
        position: 'absolute',
        left: `${xPct}%`,
        top: `${yPct}%`,
        transform: [{ translateX: -size / 2 }, { translateY: -size / 2 }],
        width: size,
        height: size,
        borderRadius: size,
        backgroundColor: isMe ? inkColor : accentColor,
        borderWidth: selected ? 2 : 0,
        borderColor: ringColor,
      }}
    />
  );
}

/** A flat, borderless world projection with a pin per person who has a location — not a real map. */
export function MapCanvas({
  network,
  me,
  selectedId,
  onSelect,
}: {
  network: Profile[];
  me?: Profile | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const scheme = useColorScheme();
  const colors = colorTokens[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View
      className="w-full rounded-sm border border-hairline dark:border-hairline-dark bg-surface dark:bg-surface-dark overflow-hidden"
      style={{ aspectRatio: 2 }}>
      <View pointerEvents="none" className="absolute inset-0">
        <View className="absolute left-0 right-0 h-px bg-hairline dark:bg-hairline-dark" style={{ top: '50%' }} />
        <View className="absolute top-0 bottom-0 w-px bg-hairline dark:bg-hairline-dark" style={{ left: '50%' }} />
      </View>

      {me?.lat != null && me.lng != null && (
        <Pin
          xPct={project(me.lat, me.lng).xPct}
          yPct={project(me.lat, me.lng).yPct}
          selected={selectedId === 'me'}
          isMe
          onPress={() => onSelect('me')}
          inkColor={colors.ink}
          accentColor={colors.accent}
          ringColor={colors.background}
        />
      )}

      {network
        .filter((person) => person.lat != null && person.lng != null)
        .map((person) => {
          const { xPct, yPct } = project(person.lat as number, person.lng as number);
          return (
            <Pin
              key={person.id}
              xPct={xPct}
              yPct={yPct}
              selected={selectedId === person.id}
              onPress={() => onSelect(person.id)}
              inkColor={colors.ink}
              accentColor={colors.accent}
              ringColor={colors.background}
            />
          );
        })}
    </View>
  );
}

/** Who they are and what they offer — the detail shown for a selected person on a map. */
export function PersonSummaryCard({ person, onMessage }: { person: Profile; onMessage: () => void }) {
  return (
    <View className="gap-md">
      <View className="flex-row gap-md items-center">
        <Avatar name={person.name} seed={person.id} size={64} photoUrl={person.photo_url} />
        <View className="flex-1 gap-xs">
          <Text className="text-title font-serif-medium text-ink dark:text-ink-dark">{person.name}</Text>
          <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
            {flagPrefix(person.country_code)}{person.city} — {person.role}
          </Text>
        </View>
      </View>

      <Text className="text-body font-sans text-ink dark:text-ink-dark">{person.offer_text}</Text>

      <View className="flex-row flex-wrap gap-sm">
        {person.skills.map((skill) => (
          <View
            key={skill}
            className="rounded-sm border border-hairline dark:border-hairline-dark px-md py-xs">
            <Text className="text-label font-sans-medium text-ink dark:text-ink-dark">{skill}</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={onMessage}
        className="rounded-sm px-xl py-md items-center self-start bg-accent dark:bg-accent-dark"
        style={{ minHeight: 44 }}>
        <Text className="text-label font-sans-medium text-background dark:text-background-dark">
          Message
        </Text>
      </Pressable>
    </View>
  );
}
