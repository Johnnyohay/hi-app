import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { ThreadView } from '@/components/thread-view';
import { ContentMaxWidth, ListPaneWidth } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { fetchMyThreads, subscribeToMyInbox, type ThreadSummary } from '@/lib/api';
import { useIsWideScreen } from '@/hooks/use-breakpoint';

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function ThreadRow({
  thread,
  myUserId,
  selected,
  onPress,
}: {
  thread: ThreadSummary;
  myUserId: string;
  selected?: boolean;
  onPress: () => void;
}) {
  const { person, lastMessage, unreadCount } = thread;
  const isMine = lastMessage.from_user_id === myUserId;

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row gap-md px-lg py-lg border-b border-hairline dark:border-hairline-dark active:opacity-60 ${
        selected ? 'bg-surface dark:bg-surface-dark' : ''
      }`}>
      <Avatar name={person.name} seed={person.id} size={56} photoUrl={person.photo_url} />
      <View className="flex-1 gap-xs">
        <View className="flex-row items-baseline justify-between">
          <Text className="text-title font-serif-medium text-ink dark:text-ink-dark">
            {person.name}
          </Text>
          <Text className="text-caption font-mono text-ink-muted dark:text-ink-muted-dark">
            {relativeTime(lastMessage.created_at)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between gap-sm">
          <Text
            className={`text-body font-sans flex-1 ${
              unreadCount > 0
                ? 'text-ink dark:text-ink-dark font-sans-medium'
                : 'text-ink-muted dark:text-ink-muted-dark'
            }`}
            numberOfLines={1}>
            {isMine ? 'You: ' : ''}
            {lastMessage.body}
          </Text>
          {unreadCount > 0 && (
            <View className="rounded-sm bg-accent dark:bg-accent-dark px-sm" style={{ minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
              <Text className="text-caption font-mono-medium text-background dark:text-background-dark">
                {unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function MessagesHeader({ count }: { count: number }) {
  return (
    <View className="px-lg pt-2xl pb-lg gap-xs">
      <Text className="text-display font-serif-semibold text-ink dark:text-ink-dark">Messages</Text>
      <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
        {count === 0 ? 'No conversations yet' : `${count} conversation${count === 1 ? '' : 's'}`}
      </Text>
    </View>
  );
}

export default function MessagesScreen() {
  const isWide = useIsWideScreen();
  const { session } = useAuth();
  const [threads, setThreads] = useState<ThreadSummary[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    const myUserId = session.user.id;

    function load() {
      fetchMyThreads(myUserId).then((rows) => {
        if (cancelled) return;
        setThreads(rows);
        setSelectedId((current) => current ?? rows[0]?.person.id ?? null);
      });
    }

    load();
    const unsubscribe = subscribeToMyInbox(myUserId, load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [session]);

  if (!session) {
    return (
      <SafeAreaView
        className="flex-1 bg-background dark:bg-background-dark items-center justify-center px-lg"
        edges={['top', 'left', 'right']}>
        <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark">
          Sign in to see your messages.
        </Text>
        <Pressable onPress={() => router.replace('/sign-in')} hitSlop={8} className="mt-lg">
          <Text className="text-label font-sans-medium text-accent dark:text-accent-dark">
            Sign in →
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!threads) {
    return (
      <SafeAreaView
        className="flex-1 bg-background dark:bg-background-dark items-center justify-center"
        edges={['top', 'left', 'right']}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  const selectedThread = threads.find((thread) => thread.person.id === selectedId) ?? threads[0] ?? null;
  const header = <MessagesHeader count={threads.length} />;

  if (isWide) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['left', 'right']}>
        <View className="flex-1 items-center">
          <View className="flex-1 flex-row w-full" style={{ maxWidth: ContentMaxWidth }}>
            <View
              className="border-r border-hairline dark:border-hairline-dark"
              style={{ width: ListPaneWidth }}>
              <FlatList
                data={threads}
                keyExtractor={(thread) => thread.person.id}
                ListHeaderComponent={header}
                ListEmptyComponent={
                  <Text className="px-lg text-body font-sans text-ink-muted dark:text-ink-muted-dark">
                    Message someone from your network to start a conversation.
                  </Text>
                }
                renderItem={({ item }) => (
                  <ThreadRow
                    thread={item}
                    myUserId={session.user.id}
                    selected={item.person.id === selectedId}
                    onPress={() => setSelectedId(item.person.id)}
                  />
                )}
              />
            </View>
            <View className="flex-1">
              {selectedThread && (
                <ThreadView
                  key={selectedThread.person.id}
                  person={selectedThread.person}
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
        data={threads}
        keyExtractor={(thread) => thread.person.id}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <Text className="px-lg text-body font-sans text-ink-muted dark:text-ink-muted-dark">
            Message someone from your network to start a conversation.
          </Text>
        }
        renderItem={({ item }) => (
          <ThreadRow
            thread={item}
            myUserId={session.user.id}
            onPress={() => router.push({ pathname: '/thread/[id]', params: { id: item.person.id } })}
          />
        )}
        contentContainerClassName="pb-2xl"
      />
    </SafeAreaView>
  );
}
