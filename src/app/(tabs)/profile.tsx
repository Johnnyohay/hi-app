import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { askCategories, feedbackTags } from '@/constants/mock-network';
import { socialPlatforms, socialUrl, type SocialPlatform } from '@/constants/me';
import { colorTokens } from '@/constants/tokens';
import { useAuth } from '@/lib/auth-context';
import {
  fetchMyAsks,
  fetchMyProfile,
  fetchMyReceivedRatings,
  fetchNetwork,
  fetchNetworkAsks,
  matchAsksForMyOffer,
  updateMyProfile,
  uploadAvatar,
  type Ask,
  type Profile,
  type Rating,
} from '@/lib/api';

const PROFILE_MAX_WIDTH = 800;

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="text-label font-sans-medium text-ink-muted dark:text-ink-muted-dark uppercase">
      {children}
    </Text>
  );
}

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const [me, setMe] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [locating, setLocating] = useState(false);
  const [myAsks, setMyAsks] = useState<Ask[] | null>(null);
  const [interested, setInterested] = useState<{ ask: Ask; person: Profile }[] | null>(null);
  const [myRatings, setMyRatings] = useState<Rating[] | null>(null);
  const scheme = useColorScheme();
  const placeholderColor = colorTokens[scheme === 'dark' ? 'dark' : 'light'].inkMuted;

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    Promise.all([
      fetchMyProfile(session.user.id),
      fetchMyAsks(session.user.id),
      fetchNetwork(session.user.id),
      fetchNetworkAsks(session.user.id),
      fetchMyReceivedRatings(session.user.id),
    ]).then(([profile, asks, network, networkAsks, ratings]) => {
      if (cancelled) return;
      setMe(profile);
      setMyAsks(asks);
      setMyRatings(ratings);
      if (profile) setInterested(matchAsksForMyOffer(profile, networkAsks, network));
    });
    return () => {
      cancelled = true;
    };
  }, [session]);

  function removeSkill(skill: string) {
    setMe((current) => current && { ...current, skills: current.skills.filter((entry) => entry !== skill) });
  }

  function addSkill() {
    const trimmed = newSkill.trim();
    if (!trimmed || !me || me.skills.includes(trimmed)) return;
    setMe((current) => current && { ...current, skills: [...current.skills, trimmed] });
    setNewSkill('');
  }

  async function pickAndUploadPhoto() {
    if (!session) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets[0]) return;

    setUploadingPhoto(true);
    try {
      const asset = result.assets[0];
      const photoUrl = await uploadAvatar(session.user.id, asset.uri, asset.mimeType ?? 'image/jpeg');
      const saved = await updateMyProfile(session.user.id, { photo_url: photoUrl });
      setMe(saved);
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function removePhoto() {
    if (!session) return;
    setUploadingPhoto(true);
    try {
      const saved = await updateMyProfile(session.user.id, { photo_url: null });
      setMe(saved);
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function useCurrentLocation() {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return;

    setLocating(true);
    try {
      const position = await Location.getCurrentPositionAsync({});
      setMe(
        (current) =>
          current && { ...current, lat: position.coords.latitude, lng: position.coords.longitude }
      );
    } finally {
      setLocating(false);
    }
  }

  function updateSocial(platform: SocialPlatform, handle: string) {
    setMe((current) => current && { ...current, social_links: { ...current.social_links, [platform]: handle } });
  }

  async function toggleEditing() {
    if (editing && me && session) {
      setSaving(true);
      try {
        const saved = await updateMyProfile(session.user.id, {
          name: me.name,
          city: me.city,
          bio: me.bio,
          skills: me.skills,
          current_ask: me.current_ask,
          social_links: me.social_links,
          lat: me.lat,
          lng: me.lng,
        });
        setMe(saved);
      } finally {
        setSaving(false);
      }
    }
    setEditing((value) => !value);
  }

  if (!session) {
    return (
      <SafeAreaView
        className="flex-1 bg-background dark:bg-background-dark items-center justify-center px-lg"
        edges={['top', 'left', 'right']}>
        <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark">
          Sign in to see your profile.
        </Text>
      </SafeAreaView>
    );
  }

  if (!me) {
    return (
      <SafeAreaView
        className="flex-1 bg-background dark:bg-background-dark items-center justify-center"
        edges={['top', 'left', 'right']}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-background-dark"
      edges={['top', 'left', 'right']}>
      <ScrollView contentContainerClassName="items-center pb-4xl">
        <View className="w-full px-lg pt-2xl" style={{ maxWidth: PROFILE_MAX_WIDTH }}>
          <View className="flex-row items-start justify-between">
            <View className="flex-row gap-lg items-center flex-1">
              <View className="gap-xs items-center">
                <Avatar name={me.name} seed={me.id} size={104} photoUrl={me.photo_url} />
                {editing && (
                  <Pressable onPress={pickAndUploadPhoto} disabled={uploadingPhoto} hitSlop={8}>
                    {uploadingPhoto ? (
                      <ActivityIndicator />
                    ) : (
                      <Text className="text-caption font-sans-medium text-accent dark:text-accent-dark">
                        {me.photo_url ? 'Change photo' : 'Add photo'}
                      </Text>
                    )}
                  </Pressable>
                )}
                {editing && me.photo_url && !uploadingPhoto && (
                  <Pressable onPress={removePhoto} hitSlop={8}>
                    <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
                      Remove
                    </Text>
                  </Pressable>
                )}
              </View>
              <View className="flex-1 gap-xs">
                {editing ? (
                  <TextInput
                    className="text-display font-serif-semibold text-ink dark:text-ink-dark"
                    style={{ outlineWidth: 0 }}
                    value={me.name}
                    onChangeText={(name) => setMe((current) => current && { ...current, name })}
                  />
                ) : (
                  <Text className="text-display font-serif-semibold text-ink dark:text-ink-dark">
                    {me.name || 'Add your name'}
                  </Text>
                )}
                <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark">
                  {me.role}
                </Text>
                {editing ? (
                  <View className="gap-xs">
                    <TextInput
                      className="text-caption font-sans text-ink dark:text-ink-dark"
                      style={{ outlineWidth: 0 }}
                      value={me.city}
                      onChangeText={(city) => setMe((current) => current && { ...current, city })}
                      placeholder="City"
                      placeholderTextColor={placeholderColor}
                    />
                    <Pressable onPress={useCurrentLocation} disabled={locating} hitSlop={8}>
                      {locating ? (
                        <ActivityIndicator size="small" />
                      ) : (
                        <Text className="text-caption font-sans-medium text-accent dark:text-accent-dark">
                          {me.lat != null ? 'Update pin on map' : 'Use current location for map'}
                        </Text>
                      )}
                    </Pressable>
                  </View>
                ) : (
                  <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
                    {me.city || 'Add your city'}
                  </Text>
                )}
              </View>
            </View>

            <Pressable onPress={toggleEditing} hitSlop={8} disabled={saving}>
              {saving ? (
                <ActivityIndicator />
              ) : (
                <Text className="text-label font-sans-medium text-accent dark:text-accent-dark">
                  {editing ? 'Done' : 'Edit'}
                </Text>
              )}
            </Pressable>
          </View>

          <View className="gap-xs mt-2xl">
            <SectionLabel>What I do</SectionLabel>
            {editing ? (
              <TextInput
                className="text-body font-sans text-ink dark:text-ink-dark mt-xs"
                style={{ minHeight: 72, outlineWidth: 0 }}
                value={me.bio}
                onChangeText={(bio) => setMe((current) => current && { ...current, bio })}
                placeholder="A couple sentences about what you do."
                placeholderTextColor={placeholderColor}
                multiline
              />
            ) : (
              <Text className="text-body font-sans text-ink dark:text-ink-dark mt-xs">
                {me.bio || 'Add a bio.'}
              </Text>
            )}
          </View>

          <View className="gap-sm mt-2xl">
            <SectionLabel>What I can help with</SectionLabel>
            <View className="flex-row flex-wrap gap-sm mt-xs">
              {me.skills.map((skill) => (
                <View
                  key={skill}
                  className="flex-row items-center gap-xs rounded-sm border border-hairline dark:border-hairline-dark px-md py-xs">
                  <Text className="text-label font-sans-medium text-ink dark:text-ink-dark">
                    {skill}
                  </Text>
                  {editing && (
                    <Pressable onPress={() => removeSkill(skill)} hitSlop={8}>
                      <Text className="text-label font-sans-medium text-ink-muted dark:text-ink-muted-dark">
                        ×
                      </Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>

            {editing && (
              <View className="flex-row gap-sm items-center mt-sm">
                <TextInput
                  className="flex-1 text-body font-sans text-ink dark:text-ink-dark rounded-sm border border-hairline dark:border-hairline-dark px-md"
                  style={{ minHeight: 40, outlineWidth: 0 }}
                  value={newSkill}
                  onChangeText={setNewSkill}
                  placeholder="Add a skill"
                  placeholderTextColor={placeholderColor}
                  onSubmitEditing={addSkill}
                  returnKeyType="done"
                />
                <Pressable
                  onPress={addSkill}
                  className="rounded-sm px-lg items-center justify-center bg-accent dark:bg-accent-dark"
                  style={{ minHeight: 40 }}>
                  <Text className="text-label font-sans-medium text-background dark:text-background-dark">
                    Add
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          <View className="gap-xs mt-2xl">
            <SectionLabel>What I need</SectionLabel>
            <View className="border-l-2 border-accent dark:border-accent-dark pl-lg mt-xs">
              {editing ? (
                <TextInput
                  className="text-body font-sans text-ink dark:text-ink-dark"
                  style={{ minHeight: 48, outlineWidth: 0 }}
                  value={me.current_ask}
                  onChangeText={(current_ask) => setMe((current) => current && { ...current, current_ask })}
                  placeholder="What are you looking for right now?"
                  placeholderTextColor={placeholderColor}
                  multiline
                />
              ) : (
                <Text className="text-body font-sans text-ink dark:text-ink-dark">
                  {me.current_ask || 'Add what you need.'}
                </Text>
              )}
            </View>
          </View>

          <View className="gap-sm mt-2xl">
            <SectionLabel>Elsewhere</SectionLabel>
            <View className="gap-sm mt-xs">
              {socialPlatforms.map((platform) => {
                const handle = me.social_links[platform.id] ?? '';
                const url = socialUrl(platform.id, handle);
                return (
                  <View key={platform.id} className="flex-row items-center gap-md">
                    <Text
                      className="text-body font-sans-medium text-ink dark:text-ink-dark"
                      style={{ width: 100 }}>
                      {platform.label}
                    </Text>
                    {editing ? (
                      <TextInput
                        className="flex-1 text-body font-sans text-ink dark:text-ink-dark rounded-sm border border-hairline dark:border-hairline-dark px-md"
                        style={{ minHeight: 40, outlineWidth: 0 }}
                        value={handle}
                        onChangeText={(value) => updateSocial(platform.id, value)}
                        placeholder={platform.placeholder}
                        placeholderTextColor={placeholderColor}
                        autoCapitalize="none"
                      />
                    ) : url ? (
                      <Pressable onPress={() => Linking.openURL(url)} hitSlop={8}>
                        <Text className="text-body font-sans text-accent dark:text-accent-dark">
                          {handle}
                        </Text>
                      </Pressable>
                    ) : (
                      <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark">
                        Not added
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          <View className="gap-sm mt-2xl">
            <SectionLabel>My requests</SectionLabel>
            {myAsks === null ? (
              <ActivityIndicator className="mt-sm" />
            ) : myAsks.length === 0 ? (
              <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark mt-xs">
                You haven&apos;t asked your network for anything yet.
              </Text>
            ) : (
              <View className="gap-sm mt-xs">
                {myAsks.map((ask) => (
                  <View
                    key={ask.id}
                    className="rounded-sm border border-hairline dark:border-hairline-dark px-lg py-md gap-xs">
                    <Text className="text-caption font-sans-medium text-ink-muted dark:text-ink-muted-dark uppercase">
                      {askCategories.find((entry) => entry.id === ask.category)?.label ?? ask.category}
                    </Text>
                    <Text className="text-body font-sans text-ink dark:text-ink-dark">{ask.need_text}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View className="gap-sm mt-2xl">
            <SectionLabel>Feedback you&apos;ve received</SectionLabel>
            {myRatings === null ? (
              <ActivityIndicator className="mt-sm" />
            ) : myRatings.length === 0 ? (
              <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark mt-xs">
                Nobody&apos;s rated you yet.
              </Text>
            ) : (
              <View className="gap-xs mt-xs">
                <Text className="text-title font-serif-medium text-ink dark:text-ink-dark">
                  {'★'.repeat(
                    Math.round(myRatings.reduce((total, r) => total + r.stars, 0) / myRatings.length)
                  )}{' '}
                  <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark">
                    ({myRatings.length} rating{myRatings.length === 1 ? '' : 's'})
                  </Text>
                </Text>
                <View className="flex-row flex-wrap gap-sm mt-xs">
                  {feedbackTags
                    .map((tag) => ({
                      tag,
                      count: myRatings.filter((r) => r.feedback_tag === tag.id).length,
                    }))
                    .filter((entry) => entry.count > 0)
                    .map(({ tag, count }) => (
                      <View
                        key={tag.id}
                        className="rounded-sm border border-hairline dark:border-hairline-dark px-md py-xs">
                        <Text className="text-label font-sans-medium text-ink dark:text-ink-dark">
                          {tag.label} · {count}
                        </Text>
                      </View>
                    ))}
                </View>
              </View>
            )}
          </View>

          <View className="gap-sm mt-2xl">
            <SectionLabel>People who might want my help</SectionLabel>
            {interested === null ? (
              <ActivityIndicator className="mt-sm" />
            ) : interested.length === 0 ? (
              <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark mt-xs">
                Nobody&apos;s asked for something matching what you offer yet.
              </Text>
            ) : (
              <View className="gap-sm mt-xs">
                {interested.map(({ ask, person }) => (
                  <Pressable
                    key={ask.id}
                    onPress={() => router.push({ pathname: '/thread/[id]', params: { id: person.id } })}
                    className="flex-row gap-md items-center rounded-sm border border-hairline dark:border-hairline-dark px-lg py-md active:opacity-60">
                    <Avatar name={person.name} seed={person.id} size={40} photoUrl={person.photo_url} />
                    <View className="flex-1 gap-xs">
                      <Text className="text-label font-sans-medium text-ink dark:text-ink-dark">
                        {person.name}
                      </Text>
                      <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
                        {ask.need_text}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View className="flex-row gap-lg mt-2xl">
            <Pressable onPress={() => router.push('/sign-in')} hitSlop={8}>
              <Text className="text-label font-sans-medium text-accent dark:text-accent-dark">
                Account & sign-in →
              </Text>
            </Pressable>
            <Pressable onPress={() => signOut()} hitSlop={8}>
              <Text className="text-label font-sans-medium text-ink-muted dark:text-ink-muted-dark">
                Sign out
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
