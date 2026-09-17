/** Mock "own profile" data for the Profile tab — replaced by the signed-in user's row once auth lands. */
export type SocialPlatform = 'linkedin' | 'instagram' | 'x' | 'website';

export const socialPlatforms: { id: SocialPlatform; label: string; placeholder: string }[] = [
  { id: 'linkedin', label: 'LinkedIn', placeholder: 'username' },
  { id: 'instagram', label: 'Instagram', placeholder: '@handle' },
  { id: 'x', label: 'X', placeholder: '@handle' },
  { id: 'website', label: 'Website', placeholder: 'yourdomain.com' },
];

/** Turns a raw handle/username into a clickable URL for the given platform. */
export function socialUrl(platform: SocialPlatform, handle: string): string | null {
  const trimmed = handle.trim().replace(/^@/, '');
  if (!trimmed) return null;

  switch (platform) {
    case 'linkedin':
      return `https://linkedin.com/in/${trimmed}`;
    case 'instagram':
      return `https://instagram.com/${trimmed}`;
    case 'x':
      return `https://x.com/${trimmed}`;
    case 'website':
      return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
  }
}

export type MeProfile = {
  name: string;
  city: string;
  lat: number;
  lng: number;
  role: string;
  photo: string;
  bio: string;
  skills: string[];
  currentAsk: string;
  socialLinks: Partial<Record<SocialPlatform, string>>;
};

export const initialMe: MeProfile = {
  name: 'Sam Rivera',
  city: 'New York',
  lat: 40.71,
  lng: -74.01,
  role: 'Product designer, independent',
  photo:
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=600&auto=format&fit=crop',
  bio: 'Design generalist. Ten years building fintech and health products, most recently at a Series B startup. Now freelancing and figuring out what’s next.',
  skills: ['Product design', '0→1 UX', 'Hiring design teams', 'Portfolio reviews'],
  currentAsk: 'A warm intro to seed-stage founders hiring their first designer.',
  socialLinks: {
    linkedin: 'samrivera',
    website: 'samrivera.design',
  },
};
