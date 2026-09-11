import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { networkPeople, sampleThread, type ThreadMessage } from '@/constants/mock-network';

export default function ThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const person = networkPeople.find((candidate) => candidate.id === id) ?? sampleThread.person;
  const [messages, setMessages] = useState<ThreadMessage[]>(sampleThread.messages);
  const [reply, setReply] = useState('');

  function sendReply() {
    if (!reply.trim()) return;
    setMessages((current) => [
      ...current,
      { id: `${current.length + 1}`, from: 'me', text: reply.trim(), sentAt: 'Just now' },
    ]);
    setReply('');
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['left', 'right']}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View className="flex-row items-center gap-sm">
              <Image
                source={{ uri: person.photo }}
                style={{ width: 28, height: 28, borderRadius: 4 }}
                contentFit="cover"
              />
              <Text className="text-title font-serif-medium text-ink dark:text-ink-dark">
                {person.name}
              </Text>
            </View>
          ),
        }}
      />

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="px-lg pt-md pb-lg border-b border-hairline dark:border-hairline-dark">
          <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
            {sampleThread.context}
          </Text>
        </View>

        <ScrollView className="flex-1" contentContainerClassName="px-lg py-lg gap-lg">
          {messages.map((message) => (
            <View key={message.id} className="gap-xs">
              <Text className="text-caption font-sans-medium text-ink-muted dark:text-ink-muted-dark uppercase">
                {message.from === 'me' ? 'You' : person.name} · {message.sentAt}
              </Text>
              <Text className="text-body font-sans text-ink dark:text-ink-dark">{message.text}</Text>
            </View>
          ))}
        </ScrollView>

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
    </SafeAreaView>
  );
}
