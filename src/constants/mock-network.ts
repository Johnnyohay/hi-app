/** Ask-flow config — not user data. Network people, threads, and asks live in the database (see lib/api.ts). */

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

export type FeedbackTagId =
  | 'amazing_supportive'
  | 'nice_approach'
  | 'quick_helpful'
  | 'didnt_feel_substantial'
  | 'unresponsive';

export type FeedbackTag = { id: FeedbackTagId; label: string };

/** Preset feedback options for rating someone — deliberately no free text, so feedback stays constructive. */
export const feedbackTags: FeedbackTag[] = [
  { id: 'amazing_supportive', label: 'Amazing, supportive experience' },
  { id: 'nice_approach', label: 'Nice approach' },
  { id: 'quick_helpful', label: 'Quick and helpful' },
  { id: 'didnt_feel_substantial', label: "Didn't feel substantial" },
  { id: 'unresponsive', label: 'Unresponsive' },
];

export type ReportReasonId =
  | 'harassment'
  | 'spam'
  | 'fake_profile'
  | 'inappropriate_content'
  | 'safety_concern'
  | 'other';

export type ReportReason = { id: ReportReasonId; label: string };

/** Reports are only ever visible to the reporter and, via the dashboard, the app operator — never to the person reported. */
export const reportReasons: ReportReason[] = [
  { id: 'harassment', label: 'Harassment or threats' },
  { id: 'spam', label: 'Spam or unsolicited advertising' },
  { id: 'fake_profile', label: 'Fake or impersonating profile' },
  { id: 'inappropriate_content', label: 'Inappropriate content' },
  { id: 'safety_concern', label: 'Safety concern' },
  { id: 'other', label: 'Something else' },
];
