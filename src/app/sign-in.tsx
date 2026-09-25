import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colorTokens } from '@/constants/tokens';
import { isSupabaseConfigured } from '@/lib/supabase';
import { oauthProviders, useAuth, type OAuthProviderId } from '@/lib/auth-context';

const SIGN_IN_MAX_WIDTH = 560;

type Mode = 'signin' | 'signup';

export default function SignInScreen() {
  const { session, signInWithPassword, signUpWithPassword, signInWithProvider } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [status, setStatus] = useState<{ kind: 'idle' | 'sent' | 'error'; message?: string }>({
    kind: 'idle',
  });
  const scheme = useColorScheme();
  const placeholderColor = colorTokens[scheme === 'dark' ? 'dark' : 'light'].inkMuted;

  // Covers every path that can produce a session — password sign-in,
  // auto-confirmed sign-up, and OAuth — without special-casing each one.
  useEffect(() => {
    if (session) {
      router.replace('/(tabs)');
    }
  }, [session]);

  async function handleSubmit() {
    const trimmed = email.trim();
    const trimmedName = name.trim();
    if (!trimmed || !password) return;
    if (mode === 'signup' && (!trimmedName || !agreedToTerms)) return;

    const { error } =
      mode === 'signin'
        ? await signInWithPassword(trimmed, password)
        : await signUpWithPassword(trimmed, password, trimmedName);

    if (error) {
      setStatus({ kind: 'error', message: error });
    } else if (mode === 'signup') {
      setStatus({ kind: 'sent', message: 'Check your inbox to confirm your account.' });
    } else {
      setStatus({ kind: 'idle' });
    }
  }

  async function handleProvider(provider: OAuthProviderId) {
    const { error } = await signInWithProvider(provider);
    if (error) setStatus({ kind: 'error', message: error });
  }

  const canSubmit =
    email.trim().length > 0 &&
    password.length > 0 &&
    (mode === 'signin' || (name.trim().length > 0 && agreedToTerms));

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-background-dark"
      edges={['top', 'left', 'right']}>
      <ScrollView contentContainerClassName="items-center px-lg pt-4xl pb-4xl">
        <View className="w-full" style={{ maxWidth: SIGN_IN_MAX_WIDTH }}>
          <Text className="text-display font-serif-semibold text-ink dark:text-ink-dark">Hi</Text>
          <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark mt-sm">
            No long posts, no redundant pictures. New connections, matched by what you need and
            what you can offer.
          </Text>

          {!isSupabaseConfigured && (
            <View className="mt-xl rounded-sm border border-hairline dark:border-hairline-dark bg-surface dark:bg-surface-dark px-lg py-lg">
              <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark">
                Backend isn&apos;t connected yet. This screen is real and will work as soon as
                Supabase credentials are added to .env, and each provider below is enabled in the
                Supabase dashboard.
              </Text>
            </View>
          )}

          <View className="gap-sm mt-xl">
            {oauthProviders.map((provider) => (
              <Pressable
                key={provider.id}
                onPress={() => handleProvider(provider.id)}
                className="rounded-sm px-2xl py-md items-center border border-hairline dark:border-hairline-dark active:opacity-60"
                style={{ minHeight: 44 }}>
                <Text className="text-label font-sans-medium text-ink dark:text-ink-dark">
                  Continue with {provider.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View className="flex-row items-center gap-md mt-xl">
            <View className="flex-1 h-px bg-hairline dark:bg-hairline-dark" />
            <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">or</Text>
            <View className="flex-1 h-px bg-hairline dark:bg-hairline-dark" />
          </View>

          <View className="flex-row gap-lg mt-xl">
            <Pressable onPress={() => setMode('signin')} hitSlop={8}>
              <Text
                className={`text-label font-sans-medium ${
                  mode === 'signin'
                    ? 'text-ink dark:text-ink-dark'
                    : 'text-ink-muted dark:text-ink-muted-dark'
                }`}>
                Sign in
              </Text>
            </Pressable>
            <Pressable onPress={() => setMode('signup')} hitSlop={8}>
              <Text
                className={`text-label font-sans-medium ${
                  mode === 'signup'
                    ? 'text-ink dark:text-ink-dark'
                    : 'text-ink-muted dark:text-ink-muted-dark'
                }`}>
                Create account
              </Text>
            </Pressable>
          </View>

          {mode === 'signup' && (
            <TextInput
              className="text-body font-sans text-ink dark:text-ink-dark mt-lg rounded-sm border border-hairline dark:border-hairline-dark px-lg"
              style={{ minHeight: 48, outlineWidth: 0 }}
              value={name}
              onChangeText={(value) => {
                setName(value);
                setStatus({ kind: 'idle' });
              }}
              placeholder="Your name"
              placeholderTextColor={placeholderColor}
              autoCapitalize="words"
              returnKeyType="next"
            />
          )}

          <TextInput
            className="text-body font-sans text-ink dark:text-ink-dark mt-lg rounded-sm border border-hairline dark:border-hairline-dark px-lg"
            style={{ minHeight: 48, outlineWidth: 0 }}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setStatus({ kind: 'idle' });
            }}
            placeholder="you@email.com"
            placeholderTextColor={placeholderColor}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
          />

          <View className="flex-row items-center gap-sm mt-sm">
            <TextInput
              className="flex-1 text-body font-sans text-ink dark:text-ink-dark rounded-sm border border-hairline dark:border-hairline-dark px-lg"
              style={{ minHeight: 48, outlineWidth: 0 }}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setStatus({ kind: 'idle' });
              }}
              placeholder="Password"
              placeholderTextColor={placeholderColor}
              autoCapitalize="none"
              secureTextEntry={!showPassword}
              onSubmitEditing={handleSubmit}
              returnKeyType="go"
            />
            <Pressable onPress={() => setShowPassword((value) => !value)} hitSlop={8}>
              <Text className="text-label font-sans-medium text-ink-muted dark:text-ink-muted-dark">
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            className="rounded-sm px-2xl py-md items-center self-start mt-lg bg-accent dark:bg-accent-dark"
            style={{ opacity: canSubmit ? 1 : 0.35, minHeight: 44 }}>
            <Text className="text-label font-sans-medium text-background dark:text-background-dark">
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Text>
          </Pressable>

          {mode === 'signup' && (
            <Pressable
              onPress={() => setAgreedToTerms((value) => !value)}
              className="flex-row items-start gap-sm mt-md"
              hitSlop={8}>
              <View
                className="items-center justify-center border rounded-sm"
                style={{
                  width: 20,
                  height: 20,
                  marginTop: 1,
                  borderColor: placeholderColor,
                }}>
                {agreedToTerms && (
                  <View className="w-full h-full items-center justify-center rounded-sm bg-accent dark:bg-accent-dark">
                    <Text className="text-label font-sans-medium text-background dark:text-background-dark">
                      ✓
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark flex-1">
                I agree to the{' '}
                <Text
                  className="text-accent dark:text-accent-dark"
                  onPress={() => router.push('/terms-of-service')}>
                  Terms
                </Text>{' '}
                and{' '}
                <Text
                  className="text-accent dark:text-accent-dark"
                  onPress={() => router.push('/privacy-policy')}>
                  Privacy Policy
                </Text>
                , and I understand Hi doesn&apos;t verify who I&apos;m talking to — I&apos;ll use
                ordinary caution, like meeting in public, before meeting anyone in person.
              </Text>
            </Pressable>
          )}

          {status.kind === 'sent' && (
            <View className="mt-lg rounded-sm border border-hairline dark:border-hairline-dark bg-surface dark:bg-surface-dark px-lg py-lg">
              <Text className="text-body font-sans text-ink dark:text-ink-dark">{status.message}</Text>
            </View>
          )}
          {status.kind === 'error' && (
            <Text className="text-body font-sans text-accent dark:text-accent-dark mt-lg">
              {status.message}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
