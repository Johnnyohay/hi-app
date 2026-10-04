import { Pressable, Text, View, useColorScheme } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { Avatar } from '@/components/avatar';
import { WORLD_MAP_PATHS, WORLD_MAP_VIEW_BOX } from '@/constants/world-map-paths';
import type { Profile } from '@/lib/api';
import { colorTokens } from '@/constants/tokens';
import { flagPrefix } from '@/lib/country-flag';

// WORLD_MAP_VIEW_BOX is "0 0 494.7 265.7" — read its own width/height out so
// the graticule can be drawn in the exact same coordinate space as the
// landmass path, in one <Svg>, rather than two stacked ones (two full-size
// siblings in a column-flex View split the available height between them
// instead of overlapping — this keeps it to a single element instead).
const [, , WORLD_MAP_WIDTH, WORLD_MAP_HEIGHT] = WORLD_MAP_VIEW_BOX.split(' ').map(Number);

/** Longitude/latitude graticule, every 30°, drawn in the map's own coordinate space. */
const GRATICULE_LONGITUDES = Array.from({ length: 13 }, (_, i) => (i / 12) * WORLD_MAP_WIDTH); // every 30°, -180..180
const GRATICULE_LATITUDES = Array.from({ length: 7 }, (_, i) => (i / 6) * WORLD_MAP_HEIGHT); // every 30°, 90..-90

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
        <Svg width="100%" height="100%" viewBox={WORLD_MAP_VIEW_BOX} preserveAspectRatio="none">
          {WORLD_MAP_PATHS.map((d, index) => (
            <Path key={index} d={d} fill={colors.hairline} />
          ))}
          {GRATICULE_LONGITUDES.map((x) => (
            <Line
              key={`lon-${x}`}
              x1={x}
              y1={0}
              x2={x}
              y2={WORLD_MAP_HEIGHT}
              stroke={colors.ink}
              strokeOpacity={0.15}
              strokeWidth={0.6}
            />
          ))}
          {GRATICULE_LATITUDES.map((y) => (
            <Line
              key={`lat-${y}`}
              x1={0}
              y1={y}
              x2={WORLD_MAP_WIDTH}
              y2={y}
              stroke={colors.ink}
              strokeOpacity={0.15}
              strokeWidth={0.6}
            />
          ))}
        </Svg>
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
