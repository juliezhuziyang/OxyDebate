export const PENTALEAGUE_2025 = {
  id: 'shanghai-pentaleague-2025',
  name: 'Shanghai Debate PentaLeague 2025',
  shortName: 'PentaLeague 2025',
  location: 'Shanghai, China',
  dates: 'December 6–7, 2025',
  format: 'Public Forum · 5 rounds + finals',
  status: 'concluded' as const,
  registrationOpen: false,
} as const;

export const PENTALEAGUE_RESULTS = {
  teams: [
    {
      place: 1,
      label: 'Champion',
      emoji: '🏆',
      teamName: 'Team REDACTED',
      members: ['Tim Zhang', 'Angela Liu'],
    },
    {
      place: 2,
      label: 'Runner-up',
      emoji: '🥈',
      teamName: 'Team LOTTERY',
      members: ['Sharon Lu', 'Coco Ke'],
    },
    {
      place: 3,
      label: 'Second Runner-up',
      emoji: '🥉',
      teamName: 'Team BEA',
      members: ['Serene', 'Snow'],
    },
  ],
  speakers: [
    { place: 1, label: 'Gold Speaker', emoji: '🥇', name: 'Tim Zhang' },
    { place: 2, label: 'Silver Speaker', emoji: '🥈', name: 'Catherine Zeng' },
    { place: 3, label: 'Bronze Speaker', emoji: '🥉', name: 'Sharon Lu' },
  ],
} as const;

export const PENTALEAGUE_CLOSING_MESSAGE =
  'Thank you to all participants, judges, organizers, and supporters who made the inaugural Shanghai Debate PentaLeague possible. We are incredibly proud of the thoughtful debates, sportsmanship, and intellectual curiosity demonstrated throughout the tournament. Congratulations to all award winners, and we look forward to welcoming even more debaters in future editions.';

export const PENTALEAGUE_TIMELINE = [
  {
    date: 'October 2025',
    title: 'Registration Opens',
    description: 'Teams and judges from across the region registered for the inaugural PentaLeague.',
  },
  {
    date: 'November 2025',
    title: 'Preparation & Briefings',
    description: 'Registered teams received motions, logistics, and tournament guidelines.',
  },
  {
    date: 'Dec 6, 2025 · Morning',
    title: 'Round 1 & 2',
    description: 'Opening rounds set the tone with sharp arguments and rigorous analysis.',
  },
  {
    date: 'Dec 6, 2025 · Afternoon',
    title: 'Round 3 & 4',
    description: 'The field narrowed as teams battled for semifinal positions.',
  },
  {
    date: 'Dec 7, 2025 · Morning',
    title: 'Round 5 & Semifinals',
    description: 'The strongest teams advanced to the grand final stage.',
  },
  {
    date: 'Dec 7, 2025 · Evening',
    title: 'Grand Final & Closing Ceremony',
    description: 'Champions crowned, speaker awards presented, and the inaugural PentaLeague concluded in celebration.',
  },
] as const;
