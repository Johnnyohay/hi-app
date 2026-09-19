import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PersonRow } from '@/components/person-row';
import { askCategories, type AskCategoryId } from '@/constants/mock-network';
import { colorTokens } from '@/constants/tokens';
import { useIsWideScreen } from '@/hooks/use-breakpoint';
import { useAuth } from '@/lib/auth-context';
import { fetchNetwork, matchPeopleForAsk, postAsk, type Profile } from '@/lib/api';

const COMPOSER_MAX_WIDTH = 800;

function CategoryChip({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-sm border border-hairline dark:border-hairline-dark px-lg py-md active:opacity-60"
      style={{ minHeight: 44, justifyContent: 'center' }}>
      <Text className="text-body font-sans-medium text-ink dark:text-ink-dark">{label}</Text>
    </Pressable>
  );
}

export default function AskScreen() {
  const { session } = useAuth();
  const [network, setNetwork] = useState<Profile[] | null>(null);
  const [category, setCategory] = useState<AskCategoryId | null>(null);
  const [need, setNeed] = useState('');
  const [submitted, setSubmitted] = useState<{ need: string; category: AskCategoryId } | null>(null);
  const canSend = need.trim().length > 0;
  const scheme = useColorScheme();
  const placeholderColor = colorTokens[scheme === 'dark' ? 'dark' : 'light'].inkMuted;
  const isWide = useIsWideScreen();

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    fetchNetwork(session.user.id).then((people) => {
      if (!cancelled) setNetwork(people);
    });
    return () => {
      cancelled = true;
    };
  }, [session]);

  const activeCategory = askCategories.find((entry) => entry.id === category);
  const matches = submitted && network ? matchPeopleForAsk(network, submitted.need, submitted.category) : [];

  function handleSend() {
    if (!canSend || !category || !session) return;
    postAsk(session.user.id, category, need.trim());
    setSubmitted({ need: need.trim(), category });
  }

  function handleEdit() {
    setSubmitted(null);
  }

  function handleChangeCategory() {
    setCategory(null);
    setNeed('');
  }

  if (!session) {
    return (
      <SafeAreaView
        className="flex-1 bg-background dark:bg-background-dark items-center justify-center px-lg"
        edges={['top', 'left', 'right']}>
        <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark">
          Sign in to ask your network.
        </Text>
      </SafeAreaView>
    );
  }

  if (submitted) {
    const submittedCategory = askCategories.find((entry) => entry.id === submitted.category);
    return (
      <SafeAreaView
        className="flex-1 bg-background dark:bg-background-dark"
        edges={['top', 'left', 'right']}>
        <View className="flex-1 items-center">
          <View className="flex-1 w-full" style={{ maxWidth: COMPOSER_MAX_WIDTH }}>
            <View className="px-lg pt-2xl pb-lg gap-xs">
              <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark uppercase">
                {submittedCategory?.label} ·{' '}
                {matches.length > 0
                  ? `${matches.length} match${matches.length === 1 ? '' : 'es'}`
                  : 'No matches yet'}
              </Text>
              <Text className="text-title font-serif-medium text-ink dark:text-ink-dark">
                “{submitted.need}”
              </Text>
              <Pressable onPress={handleEdit} className="self-start mt-xs" hitSlop={8}>
                <Text className="text-label font-sans-medium text-accent dark:text-accent-dark">
                  Edit ask
                </Text>
              </Pressable>
            </View>

            {matches.length > 0 ? (
              <FlatList
                data={matches}
                keyExtractor={(person) => person.id}
                renderItem={({ item }) => (
                  <PersonRow
                    person={item}
                    onPress={() =>
                      router.push({ pathname: '/thread/[id]', params: { id: item.id } })
                    }
                  />
                )}
                contentContainerClassName="pb-2xl"
              />
            ) : (
              <View className="px-lg pt-lg">
                <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark">
                  Nobody in your network matches this yet. We’ll notify you if that changes.
                </Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!category) {
    const picker = (
      <View className="w-full" style={{ maxWidth: COMPOSER_MAX_WIDTH }}>
        <Text className="text-display font-serif-semibold text-ink dark:text-ink-dark">
          Ask your people.
        </Text>
        <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark mt-sm">
          Pick one to start.
        </Text>
        <View className="flex-row flex-wrap gap-sm mt-xl">
          {askCategories.map((entry) => (
            <CategoryChip key={entry.id} label={entry.label} onPress={() => setCategory(entry.id)} />
          ))}
        </View>
      </View>
    );

    return (
      <SafeAreaView
        className="flex-1 bg-background dark:bg-background-dark"
        edges={['top', 'left', 'right']}>
        {isWide ? (
          <View className="flex-1 items-center px-lg pt-2xl">{picker}</View>
        ) : (
          <View className="flex-1 px-lg pt-2xl">{picker}</View>
        )}
      </SafeAreaView>
    );
  }

  const field = (
    <View className="w-full" style={{ maxWidth: COMPOSER_MAX_WIDTH }}>
      <Pressable onPress={handleChangeCategory} className="self-start" hitSlop={8}>
        <Text className="text-label font-sans-medium text-accent dark:text-accent-dark">
          ‹ {activeCategory?.label}
        </Text>
      </Pressable>

      <Text className="text-display font-serif-semibold text-ink dark:text-ink-dark mt-md">
        Tell us more.
      </Text>

      <TextInput
        className="text-body font-sans text-ink dark:text-ink-dark mt-xl"
        style={{ minHeight: 96, outlineWidth: 0 }}
        value={need}
        onChangeText={setNeed}
        placeholder={activeCategory?.placeholder}
        placeholderTextColor={placeholderColor}
        multiline
        autoFocus
        onSubmitEditing={handleSend}
        returnKeyType="send"
      />

      {isWide && (
        <Pressable
          disabled={!canSend || !network}
          onPress={handleSend}
          className="rounded-sm px-2xl py-md items-center self-start mt-xl bg-accent dark:bg-accent-dark"
          style={{ opacity: canSend && network ? 1 : 0.35, minHeight: 44 }}>
          {network ? (
            <Text className="text-label font-sans-medium text-background dark:text-background-dark">
              Send
            </Text>
          ) : (
            <ActivityIndicator />
          )}
        </Pressable>
      )}
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-background-dark"
      edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {isWide ? (
          <View className="flex-1 items-center px-lg pt-2xl">{field}</View>
        ) : (
          <>
            <View className="flex-1 px-lg pt-2xl">{field}</View>
            <View className="px-lg pb-lg">
              <Pressable
                disabled={!canSend || !network}
                onPress={handleSend}
                className="rounded-sm py-md items-center bg-accent dark:bg-accent-dark"
                style={{ opacity: canSend && network ? 1 : 0.35, minHeight: 44 }}>
                <Text className="text-label font-sans-medium text-background dark:text-background-dark">
                  Send
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
