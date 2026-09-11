import { Image } from 'expo-image';
import { router } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { networkPeople, type NetworkPerson } from '@/constants/mock-network';

const cityCount = new Set(networkPeople.map((person) => person.city)).size;

function NetworkRow({ person }: { person: NetworkPerson }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/thread/[id]', params: { id: person.id } })}
      className="flex-row gap-md py-lg border-b border-hairline dark:border-hairline-dark active:opacity-60">
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

export default function NetworkScreen() {
  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-background-dark"
      edges={['top', 'left', 'right']}>
      <View className="px-lg pt-2xl pb-lg gap-xs">
        <Text className="text-display font-serif-semibold text-ink dark:text-ink-dark">
          Network
        </Text>
        <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
          {networkPeople.length} people, {cityCount} cities
        </Text>
      </View>

      <FlatList
        data={networkPeople}
        keyExtractor={(person) => person.id}
        renderItem={({ item }) => <NetworkRow person={item} />}
        contentContainerClassName="px-lg pb-2xl"
      />
    </SafeAreaView>
  );
}
