import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThreadView } from '@/components/thread-view';
import { ContentMaxWidth, ListPaneWidth } from '@/constants/theme';
import { networkPeople, type NetworkPerson } from '@/constants/mock-network';
import { useIsWideScreen } from '@/hooks/use-breakpoint';

const cityCount = new Set(networkPeople.map((person) => person.city)).size;

function NetworkRow({
  person,
  selected,
  onPress,
}: {
  person: NetworkPerson;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row gap-md px-lg py-lg border-b border-hairline dark:border-hairline-dark active:opacity-60 ${
        selected ? 'bg-surface dark:bg-surface-dark' : ''
      }`}>
      <Image
        source={{ uri: person.photo }}
        style={{ width: 64, height: 64, borderRadius: 4 }}
        contentFit="cover"
      />
      <View className="flex-1 gap-xs">
        <View className="flex-row items-baseline justify-between">
          <Text className="text-title font-serif-medium text-ink dark:text-ink-dark">
            {person.name}
          </Text>
          <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark uppercase">
            {person.offerCategory}
          </Text>
        </View>
        <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
          {person.city} — {person.role}
        </Text>
        <Text className="text-body font-sans text-ink dark:text-ink-dark">{person.offerText}</Text>
      </View>
    </Pressable>
  );
}

function NetworkHeader() {
  return (
    <View className="px-lg pt-2xl pb-lg gap-xs">
      <Text className="text-display font-serif-semibold text-ink dark:text-ink-dark">Network</Text>
      <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
        {networkPeople.length} people, {cityCount} cities
      </Text>
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
                  <NetworkRow
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
          <NetworkRow person={item} onPress={() => router.push({ pathname: '/thread/[id]', params: { id: item.id } })} />
        )}
        contentContainerClassName="pb-2xl"
      />
    </SafeAreaView>
  );
}
