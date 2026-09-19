import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PersonRow } from '@/components/person-row';
import { ThreadView } from '@/components/thread-view';
import { ContentMaxWidth, ListPaneWidth } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import {
  fetchMyMessages,
  fetchNetwork,
  formatLastContacted,
  getReconnectCandidate,
  lastContactByUser,
  reconnectMessage,
  type Profile,
} from '@/lib/api';
import { useIsWideScreen } from '@/hooks/use-breakpoint';

function ReconnectBanner({ person, days }: { person: Profile; days: number }) {
  return (
    <View className="mx-lg mb-lg rounded-sm border border-hairline dark:border-hairline-dark bg-surface dark:bg-surface-dark px-lg py-lg gap-sm">
      <Text className="text-body font-sans text-ink dark:text-ink-dark">
        You haven&apos;t talked to {person.name} in {formatLastContacted(days)}.
      </Text>
      <Pressable
        onPress={() =>
          router.push({
            pathname: '/thread/[id]',
            params: { id: person.id, prefill: reconnectMessage(person) },
          })
        }
        className="self-start"
        hitSlop={8}>
        <Text className="text-label font-sans-medium text-accent dark:text-accent-dark">
          Say hi 👋
        </Text>
      </Pressable>
    </View>
  );
}

function NetworkHeader({
  network,
  reconnect,
}: {
  network: Profile[];
  reconnect: { person: Profile; days: number } | null;
}) {
  const cityCount = new Set(network.map((person) => person.city).filter(Boolean)).size;
  return (
    <View className="pt-2xl pb-lg gap-xs">
      <View className="px-lg pb-lg gap-xs">
        <Text className="text-display font-serif-semibold text-ink dark:text-ink-dark">Network</Text>
        <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
          {network.length} people, {cityCount} cities
        </Text>
      </View>
      {reconnect && <ReconnectBanner person={reconnect.person} days={reconnect.days} />}
    </View>
  );
}

export default function NetworkScreen() {
  const isWide = useIsWideScreen();
  const { session } = useAuth();
  const [network, setNetwork] = useState<Profile[] | null>(null);
  const [reconnect, setReconnect] = useState<{ person: Profile; days: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    Promise.all([fetchNetwork(session.user.id), fetchMyMessages(session.user.id)]).then(
      ([people, messages]) => {
        if (cancelled) return;
        setNetwork(people);
        setSelectedId((current) => current ?? people[0]?.id ?? null);
        setReconnect(getReconnectCandidate(people, lastContactByUser(session.user.id, messages)));
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
          Sign in to see your network.
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

  const selectedPerson = network.find((person) => person.id === selectedId) ?? network[0] ?? null;

  if (isWide) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['left', 'right']}>
        <View className="flex-1 items-center">
          <View className="flex-1 flex-row w-full" style={{ maxWidth: ContentMaxWidth }}>
            <View
              className="border-r border-hairline dark:border-hairline-dark"
              style={{ width: ListPaneWidth }}>
              <FlatList
                data={network}
                keyExtractor={(person) => person.id}
                ListHeaderComponent={<NetworkHeader network={network} reconnect={reconnect} />}
                renderItem={({ item }) => (
                  <PersonRow
                    person={item}
                    selected={item.id === selectedId}
                    onPress={() => setSelectedId(item.id)}
                  />
                )}
              />
            </View>
            <View className="flex-1">
              {selectedPerson && (
                <ThreadView
                  key={selectedPerson.id}
                  person={selectedPerson}
                  myUserId={session.user.id}
                  showHeader
                />
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top', 'left', 'right']}>
      <FlatList
        data={network}
        keyExtractor={(person) => person.id}
        ListHeaderComponent={<NetworkHeader network={network} reconnect={reconnect} />}
        renderItem={({ item }) => (
          <PersonRow person={item} onPress={() => router.push({ pathname: '/thread/[id]', params: { id: item.id } })} />
        )}
        contentContainerClassName="pb-2xl"
      />
    </SafeAreaView>
  );
}
