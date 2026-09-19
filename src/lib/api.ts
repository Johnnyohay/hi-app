import { askCategories, type AskCategoryId } from '@/constants/mock-network';
import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type MessageRow = Database['public']['Tables']['messages']['Row'];

export type Profile = Omit<ProfileRow, 'social_links'> & {
  social_links: Record<string, string>;
};

export type Message = Omit<MessageRow, 'kind'> & {
  kind: 'message' | 'nudge' | 'help_request' | 'reconnect';
};

export async function fetchMyProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
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
export async function fetchNetwork(excludeUserId: string): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*').neq('id', excludeUserId).order('name');
  if (error) throw error;
  return data as Profile[];
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
