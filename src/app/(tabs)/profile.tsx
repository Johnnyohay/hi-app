import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, TextInput, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { initialMe, socialPlatforms, socialUrl, type SocialPlatform } from '@/constants/me';
import { colorTokens } from '@/constants/tokens';

const PROFILE_MAX_WIDTH = 800;

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="text-label font-sans-medium text-ink-muted dark:text-ink-muted-dark uppercase">
      {children}
    </Text>
  );
}

export default function ProfileScreen() {
  const [me, setMe] = useState(initialMe);
  const [editing, setEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const scheme = useColorScheme();
  const placeholderColor = colorTokens[scheme === 'dark' ? 'dark' : 'light'].inkMuted;

  function removeSkill(skill: string) {
    setMe((current) => ({ ...current, skills: current.skills.filter((entry) => entry !== skill) }));
  }

  function addSkill() {
    const trimmed = newSkill.trim();
    if (!trimmed || me.skills.includes(trimmed)) return;
    setMe((current) => ({ ...current, skills: [...current.skills, trimmed] }));
    setNewSkill('');
  }

  async function pickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    setMe((current) => ({ ...current, photo: result.assets[0].uri }));
  }

  function updateSocial(platform: SocialPlatform, handle: string) {
    setMe((current) => ({ ...current, socialLinks: { ...current.socialLinks, [platform]: handle } }));
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-background-dark"
      edges={['top', 'left', 'right']}>
      <ScrollView contentContainerClassName="items-center pb-4xl">
        <View className="w-full px-lg pt-2xl" style={{ maxWidth: PROFILE_MAX_WIDTH }}>
          <View className="flex-row items-start justify-between">
            <View className="flex-row gap-lg items-center flex-1">
              <Pressable onPress={editing ? pickPhoto : undefined} disabled={!editing}>
                <Image
                  source={{ uri: me.photo }}
                  style={{ width: 104, height: 104, borderRadius: 4 }}
                  contentFit="cover"
                />
                {editing && (
                  <View
                    pointerEvents="none"
                    className="absolute inset-0 items-center justify-center bg-ink/40 rounded-sm">
                    <Text className="text-caption font-sans-medium text-background">Change</Text>
                  </View>
                )}
              </Pressable>
              <View className="flex-1 gap-xs">
                {editing ? (
                  <TextInput
                    className="text-display font-serif-semibold text-ink dark:text-ink-dark"
                    style={{ outlineWidth: 0 }}
                    value={me.name}
                    onChangeText={(name) => setMe((current) => ({ ...current, name }))}
                  />
                ) : (
                  <Text className="text-display font-serif-semibold text-ink dark:text-ink-dark">
                    {me.name}
                  </Text>
                )}
                <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark">
                  {me.role}
                </Text>
                <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
                  {me.city}
                </Text>
              </View>
            </View>

            <Pressable onPress={() => setEditing((value) => !value)} hitSlop={8}>
              <Text className="text-label font-sans-medium text-accent dark:text-accent-dark">
                {editing ? 'Done' : 'Edit'}
              </Text>
            </Pressable>
          </View>

          <View className="gap-xs mt-2xl">
            <SectionLabel>What I do</SectionLabel>
            {editing ? (
              <TextInput
                className="text-body font-sans text-ink dark:text-ink-dark mt-xs"
                style={{ minHeight: 72, outlineWidth: 0 }}
                value={me.bio}
                onChangeText={(bio) => setMe((current) => ({ ...current, bio }))}
                placeholderTextColor={placeholderColor}
                multiline
              />
            ) : (
              <Text className="text-body font-sans text-ink dark:text-ink-dark mt-xs">{me.bio}</Text>
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
                  value={me.currentAsk}
                  onChangeText={(currentAsk) => setMe((current) => ({ ...current, currentAsk }))}
                  placeholderTextColor={placeholderColor}
                  multiline
                />
              ) : (
                <Text className="text-body font-sans text-ink dark:text-ink-dark">
                  {me.currentAsk}
                </Text>
              )}
            </View>
          </View>

          <View className="gap-sm mt-2xl">
            <SectionLabel>Elsewhere</SectionLabel>
            <View className="gap-sm mt-xs">
              {socialPlatforms.map((platform) => {
                const handle = me.socialLinks[platform.id] ?? '';
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

          <Pressable onPress={() => router.push('/sign-in')} className="self-start mt-2xl" hitSlop={8}>
            <Text className="text-label font-sans-medium text-accent dark:text-accent-dark">
              Account & sign-in →
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
