import {
  askCategories,
  type AskCategoryId,
  type FeedbackTagId,
  type ReportReasonId,
} from '@/constants/mock-network';
import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type MessageRow = Database['public']['Tables']['messages']['Row'];
type AskRow = Database['public']['Tables']['asks']['Row'];
type RatingRow = Database['public']['Tables']['ratings']['Row'];
type ReportRow = Database['public']['Tables']['reports']['Row'];

export type Profile = Omit<ProfileRow, 'social_links'> & {
  social_links: Record<string, string>;
};

export type Message = Omit<MessageRow, 'kind'> & {
  kind: 'message' | 'nudge' | 'help_request' | 'reconnect';
};

export type Ask = Omit<AskRow, 'category'> & { category: AskCategoryId };

export type Rating = Omit<RatingRow, 'feedback_tag'> & { feedback_tag: FeedbackTagId | null };

export type Report = Omit<ReportRow, 'reason'> & { reason: ReportReasonId };

export async function fetchMyProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

/** Uploads a picked image as the caller's avatar and returns its public URL. Optional — nothing requires a photo. */
export async function uploadAvatar(userId: string, uri: string, contentType: string): Promise<string> {
  const ext = contentType === 'image/png' ? 'png' : 'jpg';
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, arrayBuffer, { contentType, upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

export async function updateMyProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return data as Profile;
}

/** Everyone else in the directory. */
/** Everyone excludeUserId has blocked — used to keep blocked people out of the directory automatically. */
async function fetchBlockedIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', userId);
  if (error) throw error;
  return (data ?? []).map((row) => row.blocked_id);
}

export async function fetchNetwork(excludeUserId: string): Promise<Profile[]> {
  const [{ data, error }, blockedIds] = await Promise.all([
    supabase.from('profiles').select('*').neq('id', excludeUserId).order('name'),
    fetchBlockedIds(excludeUserId),
  ]);
  if (error) throw error;
  const blocked = new Set(blockedIds);
  return (data as Profile[]).filter((person) => !blocked.has(person.id));
}

export async function isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('blocks')
    .select('id')
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId)
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}

export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await supabase.from('blocks').insert({ blocker_id: blockerId, blocked_id: blockedId });
  if (error) throw error;
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);
  if (error) throw error;
}

export async function fileReport(
  reporterId: string,
  reportedId: string,
  reason: ReportReasonId,
  details: string
): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .insert({ reporter_id: reporterId, reported_id: reportedId, reason, details });
  if (error) throw error;
}

export async function fetchThread(myUserId: string, otherUserId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(from_user_id.eq.${myUserId},to_user_id.eq.${otherUserId}),and(from_user_id.eq.${otherUserId},to_user_id.eq.${myUserId})`
    )
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Message[];
}

export async function sendMessage(
  fromUserId: string,
  toUserId: string,
  body: string,
  kind: Message['kind'] = 'message'
): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ from_user_id: fromUserId, to_user_id: toUserId, body, kind })
    .select('*')
    .single();
  if (error) throw error;
  return data as Message;
}

export async function postAsk(userId: string, category: AskCategoryId, needText: string) {
  const { error } = await supabase.from('asks').insert({ user_id: userId, category, need_text: needText });
  if (error) throw error;
}

/** Every request I've posted, newest first. */
export async function fetchMyAsks(userId: string): Promise<Ask[]> {
  const { data, error } = await supabase
    .from('asks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Ask[];
}

/** Everyone else's open requests — the pool matchAsksForMyOffer ranks against what I offer. */
export async function fetchNetworkAsks(excludeUserId: string): Promise<Ask[]> {
  const { data, error } = await supabase
    .from('asks')
    .select('*')
    .neq('user_id', excludeUserId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Ask[];
}

/** My existing rating for one person, if I've already rated them (prefills the rating UI). */
export async function fetchMyRatingFor(raterId: string, ratedId: string): Promise<Rating | null> {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('rater_id', raterId)
    .eq('rated_id', ratedId)
    .maybeSingle();
  if (error) throw error;
  return data as Rating | null;
}

/** Every rating I've received, for the aggregate shown on my own profile. */
export async function fetchMyReceivedRatings(userId: string): Promise<Rating[]> {
  const { data, error } = await supabase.from('ratings').select('*').eq('rated_id', userId);
  if (error) throw error;
  return data as Rating[];
}

/** Rates someone — stars plus one optional preset tag. Re-rating the same person updates it. */
export async function rateProfile(
  raterId: string,
  ratedId: string,
  stars: number,
  feedbackTag: FeedbackTagId | null
): Promise<Rating> {
  const { data, error } = await supabase
    .from('ratings')
    .upsert(
      { rater_id: raterId, rated_id: ratedId, stars, feedback_tag: feedbackTag },
      { onConflict: 'rater_id,rated_id' }
    )
    .select('*')
    .single();
  if (error) throw error;
  return data as Rating;
}

/** Every message involving me, newest first — used to derive last-contact-per-person. */
export async function fetchMyMessages(myUserId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`from_user_id.eq.${myUserId},to_user_id.eq.${myUserId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Message[];
}

/** Last-contact timestamp per other-party user id, derived from a message list. */
export function lastContactByUser(myUserId: string, messages: Message[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const message of messages) {
    const other = message.from_user_id === myUserId ? message.to_user_id : message.from_user_id;
    if (!map.has(other)) map.set(other, message.created_at);
  }
  return map;
}

export const RECONNECT_THRESHOLD_DAYS = 90;

export function daysSince(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24));
}

export function formatLastContacted(days: number): string {
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.round(days / 30)}mo ago`;
  return `${Math.round(days / 365)}y ago`;
}

/** The most overdue contact past the reconnect threshold, if any, only considering people with prior contact. */
export function getReconnectCandidate(
  network: Profile[],
  lastContact: Map<string, string>
): { person: Profile; days: number } | null {
  let best: { person: Profile; days: number } | null = null;
  for (const person of network) {
    const lastAt = lastContact.get(person.id);
    if (!lastAt) continue;
    const days = daysSince(lastAt);
    if (days >= RECONNECT_THRESHOLD_DAYS && (!best || days > best.days)) {
      best = { person, days };
    }
  }
  return best;
}

export function reconnectMessage(person: Profile): string {
  return `Hey ${person.name.split(' ')[0]}, it's been a while. How are you?`;
}

export function helpRequestMessage(person: Profile): string {
  return `Hi ${person.name.split(' ')[0]}, following up on what you offered (${person.offer_text.toLowerCase()}). Could you help with this?`;
}

/** Directory search by name or skill — distinct from matchPeopleForAsk, which only ranks people against a free-text need. */
export function searchNetwork(network: Profile[], query: string): Profile[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return network;
  return network.filter(
    (person) =>
      person.name.toLowerCase().includes(trimmed) ||
      person.skills.some((skill) => skill.toLowerCase().includes(trimmed))
  );
}

/** Filters the directory to people whose offer falls under a given category — the "what can you offer" side of matching. */
export function filterNetworkByOffer(network: Profile[], categoryId: AskCategoryId | null): Profile[] {
  if (!categoryId) return network;
  return network.filter((person) => person.offer_category === categoryId);
}

const ASK_STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'about', 'someone', 'know', 'knows', 'who',
  'can', 'help', 'need', 'this', 'that', 'have', 'has', 'does', 'you',
  'your', 'are', 'from', 'city', 'good', 'want', 'like', 'first', 'time',
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');
}

function askKeywords(need: string): string[] {
  return normalize(need)
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !ASK_STOPWORDS.has(word));
}

/** Ranks network people by keyword overlap with a free-text ask, optionally scoped to a category. */
export function matchPeopleForAsk(
  network: Profile[],
  need: string,
  categoryId?: AskCategoryId | null
): Profile[] {
  const category = askCategories.find((entry) => entry.id === categoryId);
  const keywords = [...askKeywords(need), ...(category?.keywords ?? [])];
  if (keywords.length === 0) return [];

  const scored = network
    .map((person) => {
      const haystack = normalize(
        `${person.offer_category ?? ''} ${person.offer_text} ${person.role} ${person.city} ${person.skills.join(' ')}`
      );
      const score = keywords.reduce((total, word) => total + (haystack.includes(word) ? 1 : 0), 0);
      return { person, score };
    })
    .sort((a, b) => b.score - a.score);

  const strong = scored.filter((entry) => entry.score >= 2);
  const pool = strong.length > 0 ? strong : scored.filter((entry) => entry.score >= 1);
  return pool.map((entry) => entry.person);
}

/**
 * The reverse of matchPeopleForAsk: other people's open requests that overlap
 * with what my own profile offers, so I can see who might want my help.
 */
export function matchAsksForMyOffer(
  myProfile: Profile,
  asks: Ask[],
  network: Profile[]
): { ask: Ask; person: Profile }[] {
  const profileById = new Map(network.map((person) => [person.id, person]));
  const keywords = [
    ...(myProfile.offer_category ? [myProfile.offer_category] : []),
    ...askKeywords(myProfile.offer_text),
    ...myProfile.skills.map((skill) => skill.toLowerCase()),
  ];
  if (keywords.length === 0) return [];

  const scored = asks
    .map((ask) => {
      const person = profileById.get(ask.user_id);
      if (!person) return null;
      const haystack = normalize(`${ask.category} ${ask.need_text}`);
      const score = keywords.reduce((total, word) => total + (haystack.includes(word) ? 1 : 0), 0);
      return { ask, person, score };
    })
    .filter((entry): entry is { ask: Ask; person: Profile; score: number } => entry !== null && entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map(({ ask, person }) => ({ ask, person }));
}
