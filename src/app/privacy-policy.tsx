import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DOC_MAX_WIDTH = 760;

function H2({ children }: { children: string }) {
  return (
    <Text className="text-title font-serif-medium text-ink dark:text-ink-dark mt-4xl mb-sm">
      {children}
    </Text>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark mt-md" style={{ lineHeight: 28 }}>
      {children}
    </Text>
  );
}

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top', 'left', 'right']}>
      <ScrollView contentContainerClassName="items-center pb-4xl">
        <View className="w-full px-lg pt-4xl" style={{ maxWidth: DOC_MAX_WIDTH }}>
          <Pressable onPress={() => router.back()} className="self-start mb-2xl" hitSlop={8}>
            <Text className="text-label font-sans-medium text-accent dark:text-accent-dark">‹ Back</Text>
          </Pressable>

          <Text className="text-display font-serif-semibold text-ink dark:text-ink-dark">Privacy Policy</Text>
          <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark mt-xs">
            Last updated September 25, 2026
          </Text>

          <P>
            This page explains what Hi collects, how it&apos;s used, who else can see it, and what
            outside services it passes through. This is a working, plain-language policy for the
            product as it actually operates today — not a template.
          </P>

          <H2>Information we collect</H2>
          <P>
            When you create an account: the email and password you provide (or, once available,
            the name/email a sign-in provider like Google or Microsoft shares — this option exists
            in the app but is not active yet).
          </P>
          <P>
            When you build your profile, only what you choose to add: name, role, city, bio, the
            skills you list, what you&apos;re currently looking for, links to your other profiles, and
            an optional profile photo. Location is only ever collected as a map coordinate you
            either type in (via city search) or share from your device — never tracked in the
            background, and never required.
          </P>
          <P>
            Content you create while using the app: messages you send, requests (&quot;asks&quot;) you post,
            and ratings you give other members.
          </P>

          <H2>Who can see what</H2>
          <P>
            Hi is a directory, not a private diary — your name, role, city, bio, skills, and what
            you offer are visible to every other signed-in member; that visibility is how matching
            works. The same is true for requests you post.
          </P>
          <P>
            Messages are different: only you and the other person in a conversation can read it.
            Nobody else, including other members, can see your messages.
          </P>
          <P>
            Ratings you give or receive are visible only to the two people involved — not shown
            publicly and not visible to the rest of the network.
          </P>

          <H2>How we use it</H2>
          <P>
            Solely to run the app: authenticating you, showing your profile to other members,
            matching requests with people who might help, delivering messages, and showing you
            feedback you&apos;ve received. We do not sell your information, and we do not use it for
            advertising.
          </P>

          <H2>Services we rely on</H2>
          <P>
            Hi&apos;s backend — accounts, database, file storage — runs on Supabase, which processes
            this data on our behalf as our infrastructure provider. When you search for a city, that
            search text is sent to Mapbox to look up matching places. If you sign in with Google or
            Microsoft once that option is enabled, we receive the basic profile information those
            providers share when you authorize it. We don&apos;t share your information with anyone
            beyond what&apos;s needed to operate the app through these providers.
          </P>

          <H2>Data retention and deletion</H2>
          <P>
            Your data is kept for as long as your account is active. You can delete or edit most of
            your profile directly in the app at any time. To delete your account and associated
            data entirely, contact us at the address below.
          </P>

          <H2>Security</H2>
          <P>
            Passwords must meet a minimum strength requirement and are never stored in plain text.
            On mobile, your session is encrypted using your device&apos;s own secure storage rather than
            plain app storage. Access to every table in our database is restricted at the database
            level — not just in the app&apos;s own code — so, for example, only you and a conversation&apos;s
            other participant can ever read that conversation&apos;s messages.
          </P>

          <H2>Children&apos;s privacy</H2>
          <P>
            Hi is not directed at, and may not be used by, anyone under 13 years old. If we learn an
            account belongs to someone under 13, we will delete it.
          </P>

          <H2>Changes to this policy</H2>
          <P>If this policy changes, we&apos;ll update the date at the top of this page.</P>

          <H2>Contact</H2>
          <P>
            Questions about this policy or your data can be sent via{' '}
            <Text className="text-accent dark:text-accent-dark">
              github.com/Johnnyohay/hi-app/issues
            </Text>
            .
          </P>

          <View className="mt-4xl pt-2xl border-t border-hairline dark:border-hairline-dark">
            <Text className="text-caption font-mono text-ink-muted dark:text-ink-muted-dark">
              © 2026 Hi. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
