import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import type { NetworkPerson } from '@/constants/mock-network';

export function PersonRow({
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
        style={{ width: 72, height: 72, borderRadius: 4 }}
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
