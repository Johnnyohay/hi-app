import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import {
  feedbackTags,
  randomPlayfulNudge,
  reportReasons,
  type FeedbackTagId,
  type ReportReasonId,
} from '@/constants/mock-network';
import {
  blockUser,
  fetchMyRatingFor,
  fetchThread,
  fileReport,
  helpRequestMessage,
  isBlocked,
  rateProfile,
  sendMessage,
  unblockUser,
  type Message,
  type Profile,
  type Rating,
} from '@/lib/api';

function QuickAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-sm border border-hairline dark:border-hairline-dark px-md py-xs active:opacity-60">
      <Text className="text-label font-sans-medium text-ink-muted dark:text-ink-muted-dark">
        {label}
      </Text>
    </Pressable>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (stars: number) => void }) {
  return (
    <View className="flex-row gap-xs">
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onChange(star)} hitSlop={6}>
          <Text style={{ fontSize: 24 }}>{star <= value ? '★' : '☆'}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function RatingPanel({ person, myUserId }: { person: Profile; myUserId: string }) {
  const [existing, setExisting] = useState<Rating | null | undefined>(undefined);
  const [expanded, setExpanded] = useState(false);
  const [stars, setStars] = useState(0);
  const [tag, setTag] = useState<FeedbackTagId | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchMyRatingFor(myUserId, person.id).then((rating) => {
      if (cancelled) return;
      setExisting(rating);
      setStars(rating?.stars ?? 0);
      setTag(rating?.feedback_tag ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [myUserId, person.id]);

  async function save() {
    if (stars === 0) return;
    setSaving(true);
    try {
      const saved = await rateProfile(myUserId, person.id, stars, tag);
      setExisting(saved);
      setExpanded(false);
    } finally {
      setSaving(false);
    }
  }

  if (existing === undefined) return null;

  if (!expanded) {
    return (
      <Pressable
        onPress={() => setExpanded(true)}
        className="px-lg py-sm border-b border-hairline dark:border-hairline-dark">
        <Text className="text-caption font-sans-medium text-accent dark:text-accent-dark">
          {existing ? `You rated ${person.name} ${'★'.repeat(existing.stars)} · Edit` : `Rate ${person.name}`}
        </Text>
      </Pressable>
    );
  }

  return (
    <View className="px-lg py-md gap-sm border-b border-hairline dark:border-hairline-dark">
      <Text className="text-caption font-sans-medium text-ink-muted dark:text-ink-muted-dark uppercase">
        Rate {person.name}
      </Text>
      <StarPicker value={stars} onChange={setStars} />
      <View className="flex-row flex-wrap gap-xs mt-xs">
        {feedbackTags.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => setTag((current) => (current === option.id ? null : option.id))}
            className={`rounded-sm border px-md py-xs ${
              tag === option.id
                ? 'border-accent dark:border-accent-dark bg-accent dark:bg-accent-dark'
                : 'border-hairline dark:border-hairline-dark'
            }`}>
            <Text
              className={`text-caption font-sans-medium ${
                tag === option.id
                  ? 'text-background dark:text-background-dark'
                  : 'text-ink-muted dark:text-ink-muted-dark'
              }`}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <View className="flex-row gap-lg mt-xs">
        <Pressable onPress={save} disabled={stars === 0 || saving} hitSlop={8}>
          {saving ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text
              className="text-label font-sans-medium text-accent dark:text-accent-dark"
              style={{ opacity: stars === 0 ? 0.35 : 1 }}>
              Save
            </Text>
          )}
        </Pressable>
        <Pressable onPress={() => setExpanded(false)} hitSlop={8}>
          <Text className="text-label font-sans-medium text-ink-muted dark:text-ink-muted-dark">
            Cancel
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function BlockControl({
  person,
  myUserId,
  blocked,
  onChange,
}: {
  person: Profile;
  myUserId: string;
  blocked: boolean | undefined;
  onChange: (blocked: boolean) => void;
}) {
  const [working, setWorking] = useState(false);

  async function toggle() {
    setWorking(true);
    try {
      if (blocked) {
        await unblockUser(myUserId, person.id);
        onChange(false);
      } else {
        await blockUser(myUserId, person.id);
        onChange(true);
      }
    } finally {
      setWorking(false);
    }
  }

  if (blocked === undefined) return null;

  return (
    <Pressable onPress={toggle} disabled={working} hitSlop={8}>
      <Text className="text-caption font-sans-medium text-ink-muted dark:text-ink-muted-dark">
        {working ? '…' : blocked ? `Unblock ${person.name}` : `Block ${person.name}`}
      </Text>
    </Pressable>
  );
}

function ReportPanel({ person, myUserId }: { person: Profile; myUserId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [reason, setReason] = useState<ReportReasonId | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit() {
    if (!reason) return;
    setSubmitting(true);
    try {
      await fileReport(myUserId, person.id, reason, details.trim());
      setSubmitted(true);
      setExpanded(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
        Reported — thanks, we&apos;ll review it.
      </Text>
    );
  }

  if (!expanded) {
    return (
      <Pressable onPress={() => setExpanded(true)} hitSlop={8}>
        <Text className="text-caption font-sans-medium text-ink-muted dark:text-ink-muted-dark">
          Report {person.name}
        </Text>
      </Pressable>
    );
  }

  return (
    <View className="gap-sm">
      <Text className="text-caption font-sans-medium text-ink-muted dark:text-ink-muted-dark uppercase">
        Report {person.name}
      </Text>
      <View className="flex-row flex-wrap gap-xs">
        {reportReasons.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => setReason(option.id)}
            className={`rounded-sm border px-md py-xs ${
              reason === option.id
                ? 'border-accent dark:border-accent-dark bg-accent dark:bg-accent-dark'
                : 'border-hairline dark:border-hairline-dark'
            }`}>
            <Text
              className={`text-caption font-sans-medium ${
                reason === option.id
                  ? 'text-background dark:text-background-dark'
                  : 'text-ink-muted dark:text-ink-muted-dark'
              }`}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        className="text-caption font-sans text-ink dark:text-ink-dark border border-hairline dark:border-hairline-dark rounded-sm px-md py-sm"
        style={{ minHeight: 60, outlineWidth: 0 }}
        value={details}
        onChangeText={setDetails}
        placeholder="Anything else that would help us look into this (optional)"
        multiline
      />
      <View className="flex-row gap-lg">
        <Pressable onPress={submit} disabled={!reason || submitting} hitSlop={8}>
          {submitting ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text
              className="text-label font-sans-medium text-accent dark:text-accent-dark"
              style={{ opacity: reason ? 1 : 0.35 }}>
              Submit report
            </Text>
          )}
        </Pressable>
        <Pressable onPress={() => setExpanded(false)} hitSlop={8}>
          <Text className="text-label font-sans-medium text-ink-muted dark:text-ink-muted-dark">
            Cancel
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export function ThreadView({
  person,
  myUserId,
  showHeader = false,
  initialReply = '',
}: {
  person: Profile;
  myUserId: string;
  showHeader?: boolean;
  initialReply?: string;
}) {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [reply, setReply] = useState(initialReply);
  const [blocked, setBlocked] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetchThread(myUserId, person.id).then((rows) => {
      if (!cancelled) setMessages(rows);
    });
    isBlocked(myUserId, person.id).then((value) => {
      if (!cancelled) setBlocked(value);
    });
    return () => {
      cancelled = true;
    };
  }, [myUserId, person.id]);

  async function appendMessage(text: string, kind: Message['kind'] = 'message') {
    const sent = await sendMessage(myUserId, person.id, text, kind);
    setMessages((current) => [...(current ?? []), sent]);
  }

  function sendReply() {
    if (!reply.trim()) return;
    appendMessage(reply.trim());
    setReply('');
  }

  function sendNudge() {
    appendMessage(randomPlayfulNudge(), 'nudge');
  }

  function fillHelpRequest() {
    setReply(helpRequestMessage(person));
  }

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {showHeader && (
        <View className="flex-row items-center gap-sm px-lg pt-lg pb-md">
          <Avatar name={person.name} seed={person.id} size={44} photoUrl={person.photo_url} />
          <Text className="text-title font-serif-medium text-ink dark:text-ink-dark">
            {person.name}
          </Text>
        </View>
      )}

      <View className="px-lg pt-md pb-lg border-b border-hairline dark:border-hairline-dark">
        <Text className="text-caption font-sans text-ink-muted dark:text-ink-muted-dark">
          {person.offer_text}
        </Text>
      </View>

      <RatingPanel person={person} myUserId={myUserId} />

      <View className="gap-sm px-lg py-sm border-b border-hairline dark:border-hairline-dark">
        <BlockControl person={person} myUserId={myUserId} blocked={blocked} onChange={setBlocked} />
        <ReportPanel person={person} myUserId={myUserId} />
      </View>

      {messages === null ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerClassName="px-lg py-lg gap-lg">
          {messages.length === 0 && (
            <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark">
              No messages yet — say hi.
            </Text>
          )}
          {messages.map((message) => (
            <View key={message.id} className="gap-xs">
              <Text className="text-caption font-sans-medium text-ink-muted dark:text-ink-muted-dark uppercase">
                {message.from_user_id === myUserId ? 'You' : person.name} ·{' '}
                {new Date(message.created_at).toLocaleString(undefined, {
                  weekday: 'short',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
              <Text className="text-body font-sans text-ink dark:text-ink-dark">{message.body}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {blocked ? (
        <View className="px-lg py-lg border-t border-hairline dark:border-hairline-dark">
          <Text className="text-body font-sans text-ink-muted dark:text-ink-muted-dark">
            You&apos;ve blocked {person.name}. Unblock them above to send a message again.
          </Text>
        </View>
      ) : (
        <>
          <View className="flex-row gap-sm px-lg pb-sm">
            <QuickAction label="👋 Send a nudge" onPress={sendNudge} />
            <QuickAction label="🙏 Ask for help" onPress={fillHelpRequest} />
          </View>

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
        </>
      )}
    </KeyboardAvoidingView>
  );
}
