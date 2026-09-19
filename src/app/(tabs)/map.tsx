import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { ContentMaxWidth, ListPaneWidth } from '@/constants/theme';
import { colorTokens } from '@/constants/tokens';
import { useAuth } from '@/lib/auth-context';
import { fetchMyProfile, fetchNetwork, type Profile } from '@/lib/api';
import { useIsWideScreen } from '@/hooks/use-breakpoint';

function project(lat: number, lng: number) {
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

function MapCanvas({
  network,
  me,
  selectedId,
  onSelect,
}: {
  network: Profile[];
  me: Profile | null;
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

function DetailCard({ person, onMessage }: { person: Profile; onMessage: () => void }) {
  return (
    <View className="gap-md">
      <View className="flex-row gap-md items-center">
        <Avatar name={person.name} seed={person.id} size={64} />
        <View className="flex-1 gap-xs">
          <Text className="text-title font-serif-medium text-ink dark:text-ink-dark">{person.name}</Text>
          <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
            {person.city} — {person.role}
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

function MeDetailCard({ me }: { me: Profile }) {
  return (
    <View className="gap-md">
      <View className="flex-row gap-md items-center">
        <Avatar name={me.name} seed={me.id} size={64} />
        <View className="flex-1 gap-xs">
          <Text className="text-title font-serif-medium text-ink dark:text-ink-dark">
            {me.name} (you)
          </Text>
          <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
            {me.city} — {me.role}
          </Text>
        </View>
      </View>
      <Pressable onPress={() => router.push('/profile')} hitSlop={8} className="self-start">
        <Text className="text-label font-sans-medium text-accent dark:text-accent-dark">
          View your profile
        </Text>
      </Pressable>
    </View>
  );
}

function MapHeader({ network }: { network: Profile[] }) {
  const cityCount = new Set(network.map((person) => person.city).filter(Boolean)).size;
  return (
    <View className="px-lg pt-2xl pb-lg gap-xs">
      <Text className="text-display font-serif-semibold text-ink dark:text-ink-dark">Map</Text>
      <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
        {network.length} people, {cityCount} cities
      </Text>
    </View>
  );
}

export default function MapScreen() {
  const isWide = useIsWideScreen();
  const { session } = useAuth();
  const [network, setNetwork] = useState<Profile[] | null>(null);
  const [me, setMe] = useState<Profile | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    Promise.all([fetchNetwork(session.user.id), fetchMyProfile(session.user.id)]).then(
      ([people, myProfile]) => {
        if (cancelled) return;
        setNetwork(people);
        setMe(myProfile);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [session]);

  if (!session) {
    return (
      <SafeAreaView
        className="flex-1 bg-background dark:bg-background-dark items-center justify-center px-lg"
        edges={['top', 'left', 'right']}>
        <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark">
          Sign in to see the map.
        </Text>
      </SafeAreaView>
    );
  }

  if (!network) {
    return (
      <SafeAreaView
        className="flex-1 bg-background dark:bg-background-dark items-center justify-center"
        edges={['top', 'left', 'right']}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  const selectedPerson = network.find((person) => person.id === selectedId) ?? null;
  const isMeSelected = selectedId === 'me';

  function goToThread(id: string) {
    router.push({ pathname: '/thread/[id]', params: { id } });
  }

  if (isWide) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['left', 'right']}>
        <View className="flex-1 items-center">
          <View className="flex-1 flex-row w-full" style={{ maxWidth: ContentMaxWidth }}>
            <View className="flex-1">
              <MapHeader network={network} />
              <View className="px-lg">
                <MapCanvas network={network} me={me} selectedId={selectedId} onSelect={setSelectedId} />
              </View>
            </View>
            <View
              className="border-l border-hairline dark:border-hairline-dark px-lg pt-2xl"
              style={{ width: ListPaneWidth }}>
              {isMeSelected && me ? (
                <MeDetailCard me={me} />
              ) : selectedPerson ? (
                <DetailCard person={selectedPerson} onMessage={() => goToThread(selectedPerson.id)} />
              ) : (
                <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark">
                  Tap a pin to see who&apos;s there.
                </Text>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top', 'left', 'right']}>
      <ScrollView contentContainerClassName="pb-2xl">
        <MapHeader network={network} />
        <View className="px-lg">
          <MapCanvas network={network} me={me} selectedId={selectedId} onSelect={setSelectedId} />
        </View>
        <View className="px-lg pt-xl">
          {isMeSelected && me ? (
            <MeDetailCard me={me} />
          ) : selectedPerson ? (
            <DetailCard person={selectedPerson} onMessage={() => goToThread(selectedPerson.id)} />
          ) : (
            <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark">
              Tap a pin to see who&apos;s there.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
