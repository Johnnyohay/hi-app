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

export default function TermsOfServiceScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top', 'left', 'right']}>
      <ScrollView contentContainerClassName="items-center pb-4xl">
        <View className="w-full px-lg pt-4xl" style={{ maxWidth: DOC_MAX_WIDTH }}>
          <Pressable onPress={() => router.back()} className="self-start mb-2xl" hitSlop={8}>
            <Text className="text-label font-sans-medium text-accent dark:text-accent-dark">‹ Back</Text>
          </Pressable>

          <Text className="text-display font-serif-semibold text-ink dark:text-ink-dark">Terms of Service</Text>
          <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark mt-xs">
            Last updated September 25, 2026
          </Text>

          <H2>1. Acceptance</H2>
          <P>
            By creating an account or otherwise using Hi (&quot;the app,&quot; &quot;we,&quot; &quot;us&quot;), you agree to
            these Terms and to the Privacy Policy. If you don&apos;t agree, don&apos;t use the app.
          </P>

          <H2>2. Who can use Hi</H2>
          <P>
            You must be at least 13 years old to use Hi. You must provide accurate information
            when creating your account, and you&apos;re responsible for keeping your login credentials
            secure and for everything that happens under your account.
          </P>

          <H2>3. What Hi is — and isn&apos;t</H2>
          <P>
            Hi surfaces new connections based on genuine needs and interests — matching what
            you&apos;re looking for against what other members say they can offer, and vice versa.
            We don&apos;t verify
            members&apos; identities, credentials, or the truth of what&apos;s in their profile or
            requests, and we don&apos;t
            background-check anyone. Use ordinary judgment before meeting someone or acting on
            something you read here, the same as you would with an introduction from anyone else.
          </P>

          <H2>4. Acceptable use</H2>
          <P>You agree not to:</P>
          <P>
            • Harass, threaten, impersonate, or deceive other members{'\n'}
            • Put false, misleading, or illegal information in your profile, requests, or messages,
            or anything you don&apos;t have the right to share{'\n'}
            • Use the app for unsolicited advertising, spam, or recruiting unrelated to a genuine
            ask or offer{'\n'}
            • Scrape, mass-collect, or automate access to other members&apos; data{'\n'}
            • Attempt to bypass the app&apos;s security or access another member&apos;s account{'\n'}
            • Use the rating feature to harass, defame, or retaliate against another member
          </P>
          <P>
            We can remove content or suspend or terminate accounts that violate these terms, at our
            discretion.
          </P>

          <H2>5. Your content</H2>
          <P>
            Hi doesn&apos;t have a public feed or open-ended posting — what you share is your profile
            (including any photo), the requests you post alongside it, and the messages you send in
            a one-to-one chat. You keep ownership of all of it. By sharing it, you give Hi the
            license needed to store it and show it to the people it&apos;s meant for — your profile and
            requests to the rest of the network, your messages only to the person you sent them to
            — nothing more, and we don&apos;t use it for advertising or sell it.
          </P>
          <P>
            You&apos;re responsible for what you share and for having the right to share it — including
            any photo you upload.
          </P>

          <H2>6. Copyright &amp; intellectual property</H2>
          <P>
            The Hi name, logo, and the app&apos;s design, software, and underlying code are owned by
            Hi&apos;s operator and protected by copyright, trademark, and other applicable laws. Using
            the app gives you no ownership or license to that material beyond what&apos;s needed to
            use Hi as intended. You may not copy, modify, reverse-engineer, scrape, or redistribute
            the app, its source code, or its branding without prior written permission.
          </P>
          <P>
            If you believe something in another member&apos;s profile or requests — or a photo or
            message they&apos;ve sent you — infringes your copyright, send us a notice that includes:
            (1) a description of the copyrighted work you believe was infringed; (2) where in the
            app the infringing material appears; (3) your contact information; and (4) a statement,
            made in good faith and under penalty of perjury, that the use is unauthorized and that
            your notice is accurate. Send copyright notices via{' '}
            <Text className="text-accent dark:text-accent-dark">
              github.com/Johnnyohay/hi-app/issues
            </Text>
            . We&apos;ll review valid notices, remove infringing content, and may terminate the
            accounts of members who repeatedly infringe others&apos; copyrights.
          </P>

          <H2>7. Disclaimers</H2>
          <P>
            Hi is provided &quot;as is,&quot; without warranties of any kind, express or implied. We don&apos;t
            guarantee the app will be uninterrupted, error-free, or secure, and we&apos;re not
            responsible for the conduct of any member, on or off the app, or for the accuracy of
            what&apos;s in their profile, requests, or messages.
          </P>

          <H2>8. Limitation of liability</H2>
          <P>
            To the fullest extent the law allows, Hi and its operator won&apos;t be liable for any
            indirect, incidental, or consequential damages arising from your use of the app, or for
            any interaction, meeting, or transaction between members. Our total liability for any
            claim relating to the app is limited to the amount, if any, you&apos;ve paid us in the
            twelve months before the claim.
          </P>

          <H2>9. Dispute resolution</H2>
          <P>
            Most concerns can be resolved by contacting us directly — please try that first. For
            any dispute that can&apos;t be resolved informally, you and Hi agree to resolve it
            through binding individual arbitration rather than in court, except that either party
            may bring an individual claim in small claims court instead. You and Hi each waive the
            right to a jury trial and to participate in a class action, class arbitration, or
            representative action against the other.
          </P>

          <H2>10. Indemnification</H2>
          <P>
            You agree to cover any claims, damages, or costs arising from your own violation of
            these terms or misuse of the app.
          </P>

          <H2>11. Termination</H2>
          <P>
            You can stop using Hi and request account deletion at any time. We can suspend or
            terminate your access for violating these terms or for any other reason, with or
            without notice.
          </P>

          <H2>12. Changes</H2>
          <P>
            We may update these terms as the app changes. If we do, we&apos;ll update the date at the
            top of this page; continuing to use Hi after a change means you accept the updated
            terms.
          </P>

          <H2>13. Contact</H2>
          <P>
            Questions about these terms can be sent via{' '}
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
