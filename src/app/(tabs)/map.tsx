import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { MapCanvas, PersonSummaryCard } from '@/components/people-map';
import { ContentMaxWidth, ListPaneWidth } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { fetchMyProfile, fetchNetwork, type Profile } from '@/lib/api';
import { flagPrefix } from '@/lib/country-flag';
import { useIsWideScreen } from '@/hooks/use-breakpoint';

function MeDetailCard({ me }: { me: Profile }) {
  return (
    <View className="gap-md">
      <View className="flex-row gap-md items-center">
        <Avatar name={me.name} seed={me.id} size={64} photoUrl={me.photo_url} />
        <View className="flex-1 gap-xs">
          <Text className="text-title font-serif-medium text-ink dark:text-ink-dark">
            {me.name} (you)
          </Text>
          <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
            {flagPrefix(me.country_code)}{me.city} — {me.role}
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
        <Pressable onPress={() => router.replace('/sign-in')} hitSlop={8} className="mt-lg">
          <Text className="text-label font-sans-medium text-accent dark:text-accent-dark">
            Sign in →
          </Text>
        </Pressable>
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
                <PersonSummaryCard person={selectedPerson} onMessage={() => goToThread(selectedPerson.id)} />
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
            <PersonSummaryCard person={selectedPerson} onMessage={() => goToThread(selectedPerson.id)} />
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
