/** Social platform config for the Profile tab's "Elsewhere" section — profile data itself lives in the database (lib/api.ts). */
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
