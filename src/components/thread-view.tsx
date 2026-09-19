import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { randomPlayfulNudge } from '@/constants/mock-network';
import { fetchThread, helpRequestMessage, sendMessage, type Message, type Profile } from '@/lib/api';

function QuickAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-sm border border-hairline dark:border-hairline-dark px-md py-xs active:opacity-60">
      <Text className="text-label font-sans-medium text-ink-muted dark:text-ink-muted-dark">
        {label}
      </Text>
    </Pressable>
  );
}

export function ThreadView({
  person,
  myUserId,
  showHeader = false,
  initialReply = '',
}: {
  person: Profile;
  myUserId: string;
  showHeader?: boolean;
  initialReply?: string;
}) {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [reply, setReply] = useState(initialReply);

  useEffect(() => {
    let cancelled = false;
    fetchThread(myUserId, person.id).then((rows) => {
      if (!cancelled) setMessages(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [myUserId, person.id]);

  async function appendMessage(text: string, kind: Message['kind'] = 'message') {
    const sent = await sendMessage(myUserId, person.id, text, kind);
    setMessages((current) => [...(current ?? []), sent]);
  }

  function sendReply() {
    if (!reply.trim()) return;
    appendMessage(reply.trim());
    setReply('');
  }

  function sendNudge() {
    appendMessage(randomPlayfulNudge(), 'nudge');
  }

  function fillHelpRequest() {
    setReply(helpRequestMessage(person));
  }

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {showHeader && (
        <View className="flex-row items-center gap-sm px-lg pt-lg pb-md">
          <Image
            source={{ uri: person.photo_url ?? undefined }}
            style={{ width: 44, height: 44, borderRadius: 4 }}
            contentFit="cover"
          />
          <Text className="text-title font-serif-medium text-ink dark:text-ink-dark">
            {person.name}
          </Text>
        </View>
      )}

      <View className="px-lg pt-md pb-lg border-b border-hairline dark:border-hairline-dark">
        <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
          {person.offer_text}
        </Text>
      </View>

      {messages === null ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerClassName="px-lg py-lg gap-lg">
          {messages.length === 0 && (
            <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark">
              No messages yet — say hi.
            </Text>
          )}
          {messages.map((message) => (
            <View key={message.id} className="gap-xs">
              <Text className="text-caption font-sans-medium text-ink-muted dark:text-ink-muted-dark uppercase">
                {message.from_user_id === myUserId ? 'You' : person.name} ·{' '}
                {new Date(message.created_at).toLocaleString(undefined, {
                  weekday: 'short',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
              <Text className="text-body font-sans text-ink dark:text-ink-dark">{message.body}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <View className="flex-row gap-sm px-lg pb-sm">
        <QuickAction label="👋 Send a nudge" onPress={sendNudge} />
        <QuickAction label="🙏 Ask for help" onPress={fillHelpRequest} />
      </View>

      <View className="flex-row gap-sm items-end px-lg pb-lg pt-sm border-t border-hairline dark:border-hairline-dark">
        <TextInput
          className="flex-1 text-body font-sans text-ink dark:text-ink-dark"
          style={{ minHeight: 44, maxHeight: 120, outlineWidth: 0 }}
          value={reply}
          onChangeText={setReply}
          placeholder="Reply"
          multiline
        />
        <Pressable
          onPress={sendReply}
          className="rounded-sm px-lg bg-accent dark:bg-accent-dark items-center justify-center"
          style={{ minHeight: 44 }}>
          <Text className="text-label font-sans-medium text-background dark:text-background-dark">
            Send
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
