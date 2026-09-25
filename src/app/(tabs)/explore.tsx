import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandHeader } from '@/components/brand-header';
import { PersonRow } from '@/components/person-row';
import { ThreadView } from '@/components/thread-view';
import { askCategories, type AskCategoryId } from '@/constants/mock-network';
import { ContentMaxWidth, ListPaneWidth } from '@/constants/theme';
import { colorTokens } from '@/constants/tokens';
import { useAuth } from '@/lib/auth-context';
import {
  fetchMyMessages,
  fetchNetwork,
  filterNetworkByOffer,
  formatLastContacted,
  getReconnectCandidate,
  lastContactByUser,
  reconnectMessage,
  searchNetwork,
  type Profile,
} from '@/lib/api';
import { useIsWideScreen } from '@/hooks/use-breakpoint';

function ReconnectBanner({ person, days }: { person: Profile; days: number }) {
  return (
    <View className="mx-lg mb-lg rounded-sm border border-hairline dark:border-hairline-dark bg-surface dark:bg-surface-dark px-lg py-lg gap-sm">
      <Text className="text-body font-sans text-ink dark:text-ink-dark">
        You haven&apos;t talked to {person.name} in {formatLastContacted(days)}.
      </Text>
      <Pressable
        onPress={() =>
          router.push({
            pathname: '/thread/[id]',
            params: { id: person.id, prefill: reconnectMessage(person) },
          })
        }
        className="self-start"
        hitSlop={8}>
        <Text className="text-label font-sans-medium text-accent dark:text-accent-dark">
          Say hi 👋
        </Text>
      </Pressable>
    </View>
  );
}

function OfferChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-sm border px-md py-xs active:opacity-60 ${
        active
          ? 'border-accent dark:border-accent-dark bg-accent dark:bg-accent-dark'
          : 'border-hairline dark:border-hairline-dark'
      }`}
      style={{ minHeight: 32, justifyContent: 'center' }}>
      <Text
        className={`text-caption font-sans-medium ${
          active
            ? 'text-background dark:text-background-dark'
            : 'text-ink-muted dark:text-ink-muted-dark'
        }`}>
        {label}
      </Text>
    </Pressable>
  );
}

function NetworkHeader({
  network,
  visibleCount,
  reconnect,
  query,
  onQueryChange,
  offerFilter,
  onOfferFilterChange,
}: {
  network: Profile[];
  visibleCount: number;
  reconnect: { person: Profile; days: number } | null;
  query: string;
  onQueryChange: (value: string) => void;
  offerFilter: AskCategoryId | null;
  onOfferFilterChange: (value: AskCategoryId | null) => void;
}) {
  const cityCount = new Set(network.map((person) => person.city).filter(Boolean)).size;
  const scheme = useColorScheme();
  const placeholderColor = colorTokens[scheme === 'dark' ? 'dark' : 'light'].inkMuted;
  const filtered = query.trim().length > 0 || offerFilter !== null;

  return (
    <View className="pt-2xl pb-lg gap-xs">
      <View className="px-lg pb-lg gap-xs">
        <Text className="text-display font-serif-semibold text-ink dark:text-ink-dark">Network</Text>
        <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
          {filtered ? `${visibleCount} of ${network.length} people` : `${network.length} people, ${cityCount} cities`}
        </Text>
      </View>

      <View className="px-lg pb-md gap-sm">
        <TextInput
          className="text-body font-sans text-ink dark:text-ink-dark rounded-sm border border-hairline dark:border-hairline-dark px-lg"
          style={{ minHeight: 44, outlineWidth: 0 }}
          value={query}
          onChangeText={onQueryChange}
          placeholder="Search by name or skill"
          placeholderTextColor={placeholderColor}
          autoCapitalize="none"
          returnKeyType="search"
        />

        <Text className="text-caption font-sans-medium text-ink-muted dark:text-ink-muted-dark uppercase mt-xs">
          What they can offer
        </Text>
        <View className="flex-row flex-wrap gap-xs">
          <OfferChip label="All" active={offerFilter === null} onPress={() => onOfferFilterChange(null)} />
          {askCategories.map((entry) => (
            <OfferChip
              key={entry.id}
              label={entry.label}
              active={offerFilter === entry.id}
              onPress={() => onOfferFilterChange(offerFilter === entry.id ? null : entry.id)}
            />
          ))}
        </View>
      </View>

      {reconnect && <ReconnectBanner person={reconnect.person} days={reconnect.days} />}
    </View>
  );
}

export default function NetworkScreen() {
  const isWide = useIsWideScreen();
  const { session } = useAuth();
  const [network, setNetwork] = useState<Profile[] | null>(null);
  const [reconnect, setReconnect] = useState<{ person: Profile; days: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [offerFilter, setOfferFilter] = useState<AskCategoryId | null>(null);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    Promise.all([fetchNetwork(session.user.id), fetchMyMessages(session.user.id)]).then(
      ([people, messages]) => {
        if (cancelled) return;
        setNetwork(people);
        setSelectedId((current) => current ?? people[0]?.id ?? null);
        setReconnect(getReconnectCandidate(people, lastContactByUser(session.user.id, messages)));
      }
    );
    return () => {
      cancelled = true;
    };
  }, [session]);

  if (!session) {
    return (
      <SafeAreaView
        className="flex-1 bg-background dark:bg-background-dark items-center justify-center px-lg"
        edges={['top', 'left', 'right']}>
        <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark">
          Sign in to see your network.
        </Text>
        <Pressable onPress={() => router.replace('/sign-in')} hitSlop={8} className="mt-lg">
          <Text className="text-label font-sans-medium text-accent dark:text-accent-dark">
            Sign in →
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!network) {
    return (
      <SafeAreaView
        className="flex-1 bg-background dark:bg-background-dark items-center justify-center"
        edges={['top', 'left', 'right']}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  const filteredNetwork = filterNetworkByOffer(searchNetwork(network, query), offerFilter);
  const selectedPerson =
    filteredNetwork.find((person) => person.id === selectedId) ?? filteredNetwork[0] ?? null;
  const header = (
    <NetworkHeader
      network={network}
      visibleCount={filteredNetwork.length}
      reconnect={reconnect}
      query={query}
      onQueryChange={setQuery}
      offerFilter={offerFilter}
      onOfferFilterChange={setOfferFilter}
    />
  );

  if (isWide) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['left', 'right']}>
        <BrandHeader />
        <View className="flex-1 items-center">
          <View className="flex-1 flex-row w-full" style={{ maxWidth: ContentMaxWidth }}>
            <View
              className="border-r border-hairline dark:border-hairline-dark"
              style={{ width: ListPaneWidth }}>
              <FlatList
                data={filteredNetwork}
                keyExtractor={(person) => person.id}
                ListHeaderComponent={header}
                renderItem={({ item }) => (
                  <PersonRow
                    person={item}
                    selected={item.id === selectedId}
                    onPress={() => setSelectedId(item.id)}
                  />
                )}
              />
            </View>
            <View className="flex-1">
              {selectedPerson && (
                <ThreadView
                  key={selectedPerson.id}
                  person={selectedPerson}
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
      <BrandHeader />
      <FlatList
        data={filteredNetwork}
        keyExtractor={(person) => person.id}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <PersonRow person={item} onPress={() => router.push({ pathname: '/thread/[id]', params: { id: item.id } })} />
        )}
        contentContainerClassName="pb-2xl"
      />
    </SafeAreaView>
  );
}
