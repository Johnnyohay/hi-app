import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MapCanvas, PersonSummaryCard } from '@/components/people-map';
import { PersonRow } from '@/components/person-row';
import { askCategories, type AskCategoryId } from '@/constants/mock-network';
import { colorTokens } from '@/constants/tokens';
import { useIsWideScreen } from '@/hooks/use-breakpoint';
import { useAuth } from '@/lib/auth-context';
import { fetchNetwork, matchPeopleForAsk, postAsk, type Profile } from '@/lib/api';

const COMPOSER_MAX_WIDTH = 1040;

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

type ResultsView = 'list' | 'map';

function ViewToggle({ view, onChange }: { view: ResultsView; onChange: (view: ResultsView) => void }) {
  return (
    <View className="flex-row gap-lg">
      {(['list', 'map'] as const).map((option) => (
        <Pressable key={option} onPress={() => onChange(option)} hitSlop={8}>
          <Text
            className={`text-label font-sans-medium capitalize ${
              view === option ? 'text-ink dark:text-ink-dark' : 'text-ink-muted dark:text-ink-muted-dark'
            }`}>
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

/** The "designated place" — who's currently offering to help with this ask, live as you type, as a list or a map. */
function WhoCanHelp({ matches, onMessage }: { matches: Profile[]; onMessage: (id: string) => void }) {
  const [view, setView] = useState<ResultsView>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = matches.find((person) => person.id === selectedId) ?? null;

  return (
    <View className="mt-2xl gap-md">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-caption font-mono text-ink-muted dark:text-ink-muted-dark uppercase">
          {matches.length} {matches.length === 1 ? 'person offers' : 'people offer'} this
        </Text>
        {matches.length > 0 && <ViewToggle view={view} onChange={setView} />}
      </View>

      {matches.length === 0 ? (
        <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
          Nobody matches yet — keep typing, or try the category alone.
        </Text>
      ) : view === 'list' ? (
        <View className="rounded-sm border border-hairline dark:border-hairline-dark overflow-hidden">
          {matches.map((person) => (
            <PersonRow key={person.id} person={person} onPress={() => onMessage(person.id)} />
          ))}
        </View>
      ) : (
        <View className="gap-md">
          <MapCanvas network={matches} selectedId={selectedId} onSelect={setSelectedId} />
          {selected ? (
            <PersonSummaryCard person={selected} onMessage={() => onMessage(selected.id)} />
          ) : (
            <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
              Tap a pin to see who&apos;s there — people without a location on their profile
              won&apos;t show here, but do in the list.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

export default function AskScreen() {
  const { session } = useAuth();
  const [network, setNetwork] = useState<Profile[] | null>(null);
  const [category, setCategory] = useState<AskCategoryId | null>(null);
  const [need, setNeed] = useState('');
  const [submitted, setSubmitted] = useState<{ need: string; category: AskCategoryId } | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
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
  const liveMatches = network && category ? matchPeopleForAsk(network, need, category) : [];

  function goToThread(id: string) {
    router.push({ pathname: '/thread/[id]', params: { id } });
  }

  async function handleSend() {
    if (!canSend || !category || !session || sending) return;
    setSending(true);
    setSendError(null);
    try {
      await postAsk(session.user.id, category, need.trim());
      setSubmitted({ need: need.trim(), category });
    } catch {
      setSendError("Couldn't send that — try again.");
    } finally {
      setSending(false);
    }
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
        <Pressable onPress={() => router.replace('/sign-in')} hitSlop={8} className="mt-lg">
          <Text className="text-label font-sans-medium text-accent dark:text-accent-dark">
            Sign in →
          </Text>
        </Pressable>
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
              <Text className="text-caption font-mono text-ink-muted dark:text-ink-muted-dark uppercase">
                {submittedCategory?.label}
              </Text>
              <Text className="text-title font-serif-medium text-ink dark:text-ink-dark">
                “{submitted.need}”
              </Text>
              <Pressable onPress={handleEdit} className="self-start mt-xs" hitSlop={8}>
                <Text className="text-label font-sans-medium text-accent dark:text-accent-dark">
                  Edit ask
                </Text>
              </Pressable>
              <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark mt-sm">
                Matching works by comparing keywords in what you wrote (plus the category) against
                what each person in your network offers, their skills, role, and city — it&apos;s a
                keyword search, not AI, so specific words help.
              </Text>
            </View>

            <ScrollView contentContainerClassName="px-lg pb-2xl">
              <WhoCanHelp matches={matches} onMessage={goToThread} />
            </ScrollView>
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
        onChangeText={(value) => {
          setNeed(value);
          setSendError(null);
        }}
        placeholder={activeCategory?.placeholder}
        placeholderTextColor={placeholderColor}
        multiline
        autoFocus
        onSubmitEditing={handleSend}
        returnKeyType="send"
      />

      {sendError && (
        <Text className="text-caption font-sans text-accent dark:text-accent-dark mt-sm">
          {sendError}
        </Text>
      )}

      <WhoCanHelp matches={liveMatches} onMessage={goToThread} />

      {isWide && (
        <Pressable
          disabled={!canSend || !network || sending}
          onPress={handleSend}
          className="rounded-sm px-2xl py-md items-center self-start mt-xl bg-accent dark:bg-accent-dark"
          style={{ opacity: canSend && network && !sending ? 1 : 0.35, minHeight: 44 }}>
          {network && !sending ? (
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
          <ScrollView contentContainerClassName="items-center px-lg pt-2xl pb-2xl">{field}</ScrollView>
        ) : (
          <>
            <ScrollView className="flex-1" contentContainerClassName="px-lg pt-2xl pb-lg">
              {field}
            </ScrollView>
            <View className="px-lg pb-lg">
              <Pressable
                disabled={!canSend || !network || sending}
                onPress={handleSend}
                className="rounded-sm py-md items-center bg-accent dark:bg-accent-dark"
                style={{ opacity: canSend && network && !sending ? 1 : 0.35, minHeight: 44 }}>
                {sending ? (
                  <ActivityIndicator />
                ) : (
                  <Text className="text-label font-sans-medium text-background dark:text-background-dark">
                    Send
                  </Text>
                )}
              </Pressable>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
