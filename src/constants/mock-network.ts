/**
 * Sample network data for the three design-review screens. Not real member
 * data — replaced once Supabase schema and seeding land (build step 2).
 */

export type OfferCategoryLabel =
  | 'Career intro'
  | 'Financial advice'
  | 'Mentorship'
  | 'Founder advice'
  | 'Local guide'
  | 'Technical help';

export type NetworkPerson = {
  id: string;
  name: string;
  city: string;
  /** Equirectangular coordinates, used by the Map tab. */
  lat: number;
  lng: number;
  role: string;
  photo: string;
  offerCategory: OfferCategoryLabel;
  offerText: string;
  /** Short tags for the "what I can help with" showcase. */
  skills: string[];
  /** Days since the last message either way — drives the Reconnect prompt. */
  lastContactedDaysAgo: number;
};

export const networkPeople: NetworkPerson[] = [
  {
    id: 'dana-osei',
    name: 'Dana Osei',
    city: 'Lima',
    lat: -12.05,
    lng: -77.04,
    role: 'Banking, Mibanco',
    photo:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop',
    offerCategory: 'Career intro',
    offerText: 'Can introduce you to hiring managers at banks in Peru.',
    skills: ['Banking', 'Hiring intros', 'Peru market'],
    lastContactedDaysAgo: 2,
  },
  {
    id: 'marco-tellez',
    name: 'Marco Téllez',
    city: 'Mexico City',
    lat: 19.43,
    lng: -99.13,
    role: 'Founder, Cursana',
    photo:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
    offerCategory: 'Founder advice',
    offerText: 'Happy to talk through early fundraising and hiring your first ten.',
    skills: ['Fundraising', 'Early hiring', 'Go-to-market'],
    lastContactedDaysAgo: 164,
  },
  {
    id: 'priya-nair',
    name: 'Priya Nair',
    city: 'Singapore',
    lat: 1.35,
    lng: 103.82,
    role: 'Product, Grab',
    photo:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
    offerCategory: 'Mentorship',
    offerText: 'Mentoring PMs moving from consulting into tech.',
    skills: ['Product mentorship', 'Career switches', 'Interview prep'],
    lastContactedDaysAgo: 14,
  },
  {
    id: 'jonas-weber',
    name: 'Jonas Weber',
    city: 'Berlin',
    lat: 52.52,
    lng: 13.4,
    role: 'Engineering lead, Zalando',
    photo:
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=600&auto=format&fit=crop',
    offerCategory: 'Technical help',
    offerText: 'Can review your infra setup or sit in on a technical interview loop.',
    skills: ['Infra reviews', 'Interview loops', 'Engineering hiring'],
    lastContactedDaysAgo: 301,
  },
  {
    id: 'amara-diallo',
    name: 'Amara Diallo',
    city: 'Dakar',
    lat: 14.72,
    lng: -17.47,
    role: 'Wealth management, SGBS',
    photo:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    offerCategory: 'Financial advice',
    offerText: 'Personal finance guidance from ten years in banking.',
    skills: ['Personal finance', 'Savings planning', 'Banking'],
    lastContactedDaysAgo: 45,
  },
  {
    id: 'felipe-arango',
    name: 'Felipe Arango',
    city: 'Bogotá',
    lat: 4.71,
    lng: -74.07,
    role: 'Runs a walking-tour company',
    photo:
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=600&auto=format&fit=crop',
    offerCategory: 'Local guide',
    offerText: 'Knows Bogotá well — good for a first trip or a relocation.',
    skills: ['Local tips', 'Relocation', 'City tours'],
    lastContactedDaysAgo: 9,
  },
];

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

export type AskCategoryId = 'connection' | 'job' | 'friend' | 'health' | 'travel' | 'other';

export type AskCategory = {
  id: AskCategoryId;
  label: string;
  placeholder: string;
  /** Extra keywords folded into matching so picking a category alone still surfaces people. */
  keywords: string[];
};

export const askCategories: AskCategory[] = [
  {
    id: 'connection',
    label: 'A connection',
    placeholder: 'I need an intro to someone in fintech.',
    keywords: ['intro', 'connection', 'network'],
  },
  {
    id: 'job',
    label: 'A job',
    placeholder: 'I need leads on product roles in Berlin.',
    keywords: ['job', 'career', 'hiring', 'fundraising'],
  },
  {
    id: 'friend',
    label: 'A friend',
    placeholder: 'I just moved to Singapore and want to meet people.',
    keywords: ['friend', 'social'],
  },
  {
    id: 'health',
    label: 'Wellness',
    placeholder: 'I need advice on finding a good doctor abroad.',
    keywords: ['health', 'doctor', 'wellness', 'medical'],
  },
  {
    id: 'travel',
    label: 'Travel tips',
    placeholder: 'I need tips on visiting Bogotá for the first time.',
    keywords: ['travel', 'tourism', 'guide'],
  },
  {
    id: 'other',
    label: 'Something else',
    placeholder: "What's on your mind?",
    keywords: [],
  },
];

/** Ranks network people by keyword overlap with a free-text ask, optionally scoped to a category. Mock scoring — replaced by real matching once the backend lands. */
export function matchPeopleForAsk(need: string, categoryId?: AskCategoryId | null): NetworkPerson[] {
  const category = askCategories.find((entry) => entry.id === categoryId);
  const keywords = [...askKeywords(need), ...(category?.keywords ?? [])];
  if (keywords.length === 0) return [];

  const scored = networkPeople
    .map((person) => {
      const haystack = normalize(
        `${person.offerCategory} ${person.offerText} ${person.role} ${person.city} ${person.skills.join(' ')}`
      );
      const score = keywords.reduce((total, word) => total + (haystack.includes(word) ? 1 : 0), 0);
      return { person, score };
    })
    .sort((a, b) => b.score - a.score);

  // Require overlap on at least two keywords so a single incidental word (e.g. a
  // shared place name) doesn't surface an unrelated person; fall back to a
  // single strong match if that's genuinely all there is.
  const strong = scored.filter((entry) => entry.score >= 2);
  const pool = strong.length > 0 ? strong : scored.filter((entry) => entry.score >= 1);
  return pool.map((entry) => entry.person);
}

export type ThreadMessage = {
  id: string;
  from: 'them' | 'me';
  text: string;
  sentAt: string;
};

export const sampleThread = {
  person: networkPeople[0],
};

/** Sample thread content, generated for whichever person is selected. */
export function getSampleMessages(person: NetworkPerson): {
  context: string;
  messages: ThreadMessage[];
} {
  const firstName = person.name.split(' ')[0];
  return {
    context: `You reached out about ${person.offerCategory.toLowerCase()}.`,
    messages: [
      {
        id: '1',
        from: 'me',
        text: `Hi ${firstName} — a friend from the network mentioned you might be able to help with this. Do you have a few minutes this week?`,
        sentAt: 'Mon 9:14 AM',
      },
      {
        id: '2',
        from: 'them',
        text: 'Happy to help — let me get back to you on this shortly.',
        sentAt: 'Mon 11:40 AM',
      },
    ],
  };
}

/** Threshold for surfacing a "you haven't spoken in a while" prompt. */
export const RECONNECT_THRESHOLD_DAYS = 90;

/** The most overdue contact past the reconnect threshold, if any. */
export function getReconnectCandidate(): NetworkPerson | null {
  const overdue = networkPeople.filter((person) => person.lastContactedDaysAgo >= RECONNECT_THRESHOLD_DAYS);
  if (overdue.length === 0) return null;
  return overdue.sort((a, b) => b.lastContactedDaysAgo - a.lastContactedDaysAgo)[0];
}

export function formatLastContacted(days: number): string {
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.round(days / 30)}mo ago`;
  return `${Math.round(days / 365)}y ago`;
}

export function reconnectMessage(person: NetworkPerson): string {
  return `Hey ${person.name.split(' ')[0]} — it's been a while. How are you?`;
}

export function helpRequestMessage(person: NetworkPerson): string {
  return `Hi ${person.name.split(' ')[0]} — following up on what you offered (${person.offerText.toLowerCase()}). Could you help with this?`;
}

const PLAYFUL_NUDGES = [
  'Just thinking of you 👋',
  'Rate your day so far, 1–10, no explanation.',
  'Tell me one weird thing that happened today.',
  'Sending you a completely pointless hello.',
  'Poke.',
];

export function randomPlayfulNudge(): string {
  return PLAYFUL_NUDGES[Math.floor(Math.random() * PLAYFUL_NUDGES.length)];
}
