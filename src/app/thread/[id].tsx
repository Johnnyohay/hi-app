import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { ThreadView } from '@/components/thread-view';
import { useAuth } from '@/lib/auth-context';
import { fetchMyProfile, type Profile } from '@/lib/api';

export default function ThreadScreen() {
  const { id, prefill } = useLocalSearchParams<{ id: string; prefill?: string }>();
  const { session } = useAuth();
  const [person, setPerson] = useState<Profile | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetchMyProfile(id).then((row) => {
      if (!cancelled) setPerson(row);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark items-center justify-center px-lg">
        <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark">
          Sign in to view this thread.
        </Text>
      </SafeAreaView>
    );
  }

  if (!person) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['left', 'right']}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View className="flex-row items-center gap-sm">
              <Avatar name={person.name} seed={person.id} size={32} photoUrl={person.photo_url} />
              <Text className="text-title font-serif-medium text-ink dark:text-ink-dark">
                {person.name}
              </Text>
            </View>
          ),
        }}
      />
      <ThreadView person={person} myUserId={session.user.id} initialReply={prefill} />
    </SafeAreaView>
  );
}
