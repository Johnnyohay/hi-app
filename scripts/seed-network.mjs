// Seeds the local Supabase database with demo network accounts so the app
// isn't an empty directory on a fresh `supabase db reset`. Each person is a
// real, auto-confirmed account (not a fake row) — the app can't tell the
// difference between these and someone who actually signed up.
//
// Usage: node scripts/seed-network.mjs
// Requires the local stack to be running (`npx supabase start`).

const API_URL = 'http://127.0.0.1:54321';
// Local dev's well-known service role key (from `supabase start` output) —
// never a production secret.
const SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const PEOPLE = [
  {
    email: 'dana.osei@hult.edu',
    name: 'Dana Osei',
    city: 'Lima', lat: -12.05, lng: -77.04,
    role: 'Banking, Mibanco',
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop',
    offer_category: 'Career intro',
    offer_text: 'Can introduce you to hiring managers at banks in Peru.',
    skills: ['Banking', 'Hiring intros', 'Peru market'],
  },
  {
    email: 'marco.tellez@hult.edu',
    name: 'Marco Téllez',
    city: 'Mexico City', lat: 19.43, lng: -99.13,
    role: 'Founder, Cursana',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
    offer_category: 'Founder advice',
    offer_text: 'Happy to talk through early fundraising and hiring your first ten.',
    skills: ['Fundraising', 'Early hiring', 'Go-to-market'],
  },
  {
    email: 'priya.nair@hult.edu',
    name: 'Priya Nair',
    city: 'Singapore', lat: 1.35, lng: 103.82,
    role: 'Product, Grab',
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
    offer_category: 'Mentorship',
    offer_text: 'Mentoring PMs moving from consulting into tech.',
    skills: ['Product mentorship', 'Career switches', 'Interview prep'],
  },
  {
    email: 'jonas.weber@hult.edu',
    name: 'Jonas Weber',
    city: 'Berlin', lat: 52.52, lng: 13.4,
    role: 'Engineering lead, Zalando',
    photo_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=600&auto=format&fit=crop',
    offer_category: 'Technical help',
    offer_text: 'Can review your infra setup or sit in on a technical interview loop.',
    skills: ['Infra reviews', 'Interview loops', 'Engineering hiring'],
  },
  {
    email: 'amara.diallo@hult.edu',
    name: 'Amara Diallo',
    city: 'Dakar', lat: 14.72, lng: -17.47,
    role: 'Wealth management, SGBS',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    offer_category: 'Financial advice',
    offer_text: 'Personal finance guidance from ten years in banking.',
    skills: ['Personal finance', 'Savings planning', 'Banking'],
  },
  {
    email: 'felipe.arango@hult.edu',
    name: 'Felipe Arango',
    city: 'Bogotá', lat: 4.71, lng: -74.07,
    role: 'Runs a walking-tour company',
    photo_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=600&auto=format&fit=crop',
    offer_category: 'Local guide',
    offer_text: 'Knows Bogotá well — good for a first trip or a relocation.',
    skills: ['Local tips', 'Relocation', 'City tours'],
  },
];

async function request(method, path, body) {
  const res = await fetch(API_URL + path, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(method !== 'GET' ? { Prefer: 'return=representation' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

for (const person of PEOPLE) {
  const created = await request('POST', '/auth/v1/admin/users', {
    email: person.email,
    password: 'hi-network-demo-2026',
    email_confirm: true,
    user_metadata: { full_name: person.name },
  });

  await request('PATCH', `/rest/v1/profiles?id=eq.${created.id}`, {
    name: person.name,
    role: person.role,
    city: person.city,
    lat: person.lat,
    lng: person.lng,
    photo_url: person.photo_url,
    bio: person.offer_text,
    offer_category: person.offer_category,
    offer_text: person.offer_text,
    skills: person.skills,
  });

  console.log(`seeded ${person.name} -> ${created.id}`);
}

console.log('done');
