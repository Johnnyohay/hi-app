import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThreadView } from '@/components/thread-view';
import { networkPeople, sampleThread } from '@/constants/mock-network';

export default function ThreadScreen() {
  const { id, prefill } = useLocalSearchParams<{ id: string; prefill?: string }>();
  const person = networkPeople.find((candidate) => candidate.id === id) ?? sampleThread.person;

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['left', 'right']}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View className="flex-row items-center gap-sm">
              <Image
                source={{ uri: person.photo }}
                style={{ width: 32, height: 32, borderRadius: 4 }}
                contentFit="cover"
              />
              <Text className="text-title font-serif-medium text-ink dark:text-ink-dark">
                {person.name}
              </Text>
            </View>
          ),
        }}
      />
      <ThreadView person={person} initialReply={prefill} />
    </SafeAreaView>
  );
}
