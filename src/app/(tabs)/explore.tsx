import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PersonRow } from '@/components/person-row';
import { ThreadView } from '@/components/thread-view';
import { ContentMaxWidth, ListPaneWidth } from '@/constants/theme';
import {
  formatLastContacted,
  getReconnectCandidate,
  networkPeople,
  reconnectMessage,
  type NetworkPerson,
} from '@/constants/mock-network';
import { useIsWideScreen } from '@/hooks/use-breakpoint';

const cityCount = new Set(networkPeople.map((person) => person.city)).size;

function ReconnectBanner({ person }: { person: NetworkPerson }) {
  return (
    <View className="mx-lg mb-lg rounded-sm border border-hairline dark:border-hairline-dark bg-surface dark:bg-surface-dark px-lg py-lg gap-sm">
      <Text className="text-body font-sans text-ink dark:text-ink-dark">
        You haven&apos;t talked to {person.name} in {formatLastContacted(person.lastContactedDaysAgo)}.
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

function NetworkHeader() {
  const reconnectCandidate = getReconnectCandidate();
  return (
    <View className="pt-2xl pb-lg gap-xs">
      <View className="px-lg pb-lg gap-xs">
        <Text className="text-display font-serif-semibold text-ink dark:text-ink-dark">Network</Text>
        <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
          {networkPeople.length} people, {cityCount} cities
        </Text>
      </View>
      {reconnectCandidate && <ReconnectBanner person={reconnectCandidate} />}
    </View>
  );
}

export default function NetworkScreen() {
  const isWide = useIsWideScreen();
  const [selectedId, setSelectedId] = useState(networkPeople[0].id);
  const selectedPerson = networkPeople.find((person) => person.id === selectedId) ?? networkPeople[0];

  if (isWide) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['left', 'right']}>
        <View className="flex-1 items-center">
          <View className="flex-1 flex-row w-full" style={{ maxWidth: ContentMaxWidth }}>
            <View
              className="border-r border-hairline dark:border-hairline-dark"
              style={{ width: ListPaneWidth }}>
              <NetworkHeader />
              <FlatList
                data={networkPeople}
                keyExtractor={(person) => person.id}
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
              <ThreadView key={selectedPerson.id} person={selectedPerson} showHeader />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top', 'left', 'right']}>
      <FlatList
        data={networkPeople}
        keyExtractor={(person) => person.id}
        ListHeaderComponent={NetworkHeader}
        renderItem={({ item }) => (
          <PersonRow person={item} onPress={() => router.push({ pathname: '/thread/[id]', params: { id: item.id } })} />
        )}
        contentContainerClassName="pb-2xl"
      />
    </SafeAreaView>
  );
}
