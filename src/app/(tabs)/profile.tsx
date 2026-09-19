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
import { socialPlatforms, socialUrl, type SocialPlatform } from '@/constants/me';
import { colorTokens } from '@/constants/tokens';
import { useAuth } from '@/lib/auth-context';
import { fetchMyProfile, updateMyProfile, type Profile } from '@/lib/api';

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
  const scheme = useColorScheme();
  const placeholderColor = colorTokens[scheme === 'dark' ? 'dark' : 'light'].inkMuted;

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    fetchMyProfile(session.user.id).then((row) => {
      if (!cancelled) setMe(row);
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
              <Avatar name={me.name} seed={me.id} size={104} />
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
                  <TextInput
                    className="text-caption font-sans text-ink dark:text-ink-dark"
                    style={{ outlineWidth: 0 }}
                    value={me.city}
                    onChangeText={(city) => setMe((current) => current && { ...current, city })}
                    placeholder="City"
                    placeholderTextColor={placeholderColor}
                  />
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
