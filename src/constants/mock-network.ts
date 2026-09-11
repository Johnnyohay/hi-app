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
  role: string;
  photo: string;
  offerCategory: OfferCategoryLabel;
  offerText: string;
};

export const networkPeople: NetworkPerson[] = [
  {
    id: 'dana-osei',
    name: 'Dana Osei',
    city: 'Lima',
    role: 'Banking, Mibanco',
    photo:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop',
    offerCategory: 'Career intro',
    offerText: 'Can introduce you to hiring managers at banks in Peru.',
  },
  {
    id: 'marco-tellez',
    name: 'Marco Téllez',
    city: 'Mexico City',
    role: 'Founder, Cursana',
    photo:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
    offerCategory: 'Founder advice',
    offerText: 'Happy to talk through early fundraising and hiring your first ten.',
  },
  {
    id: 'priya-nair',
    name: 'Priya Nair',
    city: 'Singapore',
    role: 'Product, Grab',
    photo:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
    offerCategory: 'Mentorship',
    offerText: 'Mentoring PMs moving from consulting into tech.',
  },
  {
    id: 'jonas-weber',
    name: 'Jonas Weber',
    city: 'Berlin',
    role: 'Engineering lead, Zalando',
    photo:
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=600&auto=format&fit=crop',
    offerCategory: 'Technical help',
    offerText: 'Can review your infra setup or sit in on a technical interview loop.',
  },
  {
    id: 'amara-diallo',
    name: 'Amara Diallo',
    city: 'Dakar',
    role: 'Wealth management, SGBS',
    photo:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    offerCategory: 'Financial advice',
    offerText: 'Personal finance guidance from ten years in banking.',
  },
  {
    id: 'felipe-arango',
    name: 'Felipe Arango',
    city: 'Bogotá',
    role: 'Runs a walking-tour company',
    photo:
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=600&auto=format&fit=crop',
    offerCategory: 'Local guide',
    offerText: 'Knows Bogotá well — good for a first trip or a relocation.',
  },
];

export type ThreadMessage = {
  id: string;
  from: 'them' | 'me';
  text: string;
  sentAt: string;
};

export const sampleThread: {
  person: NetworkPerson;
  context: string;
  messages: ThreadMessage[];
} = {
  person: networkPeople[0],
  context: 'You reached out about a career intro in banking, Peru.',
  messages: [
    {
      id: '1',
      from: 'me',
      text: 'Hi Dana — a friend from the Lima cohort mentioned you might know people at Mibanco. I’m looking to move into retail banking there this year.',
      sentAt: 'Mon 9:14 AM',
    },
    {
      id: '2',
      from: 'them',
      text: 'Happy to help. I know two people on the hiring side there — let me make an intro this week.',
      sentAt: 'Mon 11:40 AM',
    },
  ],
};
