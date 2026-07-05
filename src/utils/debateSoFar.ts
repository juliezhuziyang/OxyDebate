import type { DebateFormat, Speaker } from '@/components/AIPractice';
import type { DebateSide, DebateSoFarData, DebateSpeechPoint } from '@/types/debateContext';

const WSDC_ORDER: Speaker[] = ['PM', 'LO', 'DPM', 'DLO', 'GW', 'OW', 'GR', 'OR'];

const PF_ORDER: Speaker[] = ['constructive', 'rebuttal', 'summary', 'final-focus'];

const WSDC_LABELS: Partial<Record<Speaker, string>> = {
  PM: 'Prime Minister',
  LO: 'Leader of Opposition',
  DPM: 'Deputy PM',
  DLO: 'Deputy LO',
  GW: 'Government Whip',
  OW: 'Opposition Whip',
  GR: 'Gov Reply',
  OR: 'Opp Reply',
};

const PF_LABELS: Partial<Record<Speaker, string>> = {
  constructive: 'Constructive',
  rebuttal: 'Rebuttal',
  summary: 'Summary',
  'final-focus': 'Final Focus',
};

function isGovernmentSide(speaker: Speaker): boolean {
  return ['PM', 'DPM', 'GW', 'GR'].includes(speaker);
}

function pfSide(speaker: Speaker, index: number): DebateSide {
  if (speaker === 'constructive') return index % 2 === 0 ? 'pro' : 'con';
  return index % 2 === 0 ? 'pro' : 'con';
}

export function getPriorSpeakers(format: DebateFormat, speaker: Speaker): Speaker[] {
  const order = format === 'WSDC' ? WSDC_ORDER : PF_ORDER;
  const index = order.indexOf(speaker);
  if (index <= 0) return [];
  return order.slice(0, index);
}

export function needsDebateContext(speaker: Speaker): boolean {
  return speaker !== 'PM' && speaker !== 'constructive';
}

function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

function pick<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length)];
}

function getSide(format: DebateFormat, speaker: Speaker, pfIndex?: number): DebateSide {
  if (format === 'WSDC') {
    return isGovernmentSide(speaker) ? 'government' : 'opposition';
  }
  return pfSide(speaker, pfIndex ?? 0);
}

function getLabel(format: DebateFormat, speaker: Speaker, pfIndex?: number): string {
  if (format === 'WSDC') return WSDC_LABELS[speaker] || speaker;
  if (speaker === 'constructive') {
    return pfIndex === 0 ? 'Pro Constructive' : 'Con Constructive';
  }
  return PF_LABELS[speaker] || speaker;
}

function buildPoint(
  rng: () => number,
  topic: string,
  side: DebateSide,
  label: string
): string {
  const shortTopic = topic.length > 60 ? `${topic.slice(0, 57)}…` : topic;

  const govFrames = [
    `${label} framed ${shortTopic} as urgent for public welfare and democratic stability.`,
    `${label} argued regulation on ${shortTopic} prevents harms while preserving core freedoms.`,
    `${label} cited real-world examples showing benefits of proactive policy on ${shortTopic}.`,
    `${label} built a principled model showing how ${shortTopic} can be resolved without overreach.`,
  ];

  const oppFrames = [
    `${label} challenged that ${shortTopic} reforms create unintended costs and enforcement gaps.`,
    `${label} warned ${shortTopic} policies risk chilling innovation and individual rights.`,
    `${label} attacked the feasibility of implementation and questioned the evidence base.`,
    `${label} reframed ${shortTopic} as a trade-off the other side underestimates.`,
  ];

  const proFrames = [
    `${label} established economic and social benefits of affirming ${shortTopic}.`,
    `${label} presented a clear implementation plan with measurable outcomes on ${shortTopic}.`,
    `${label} linked ${shortTopic} to improved equity and long-term growth.`,
  ];

  const conFrames = [
    `${label} exposed structural flaws in the affirmative case on ${shortTopic}.`,
    `${label} argued ${shortTopic} causes more harm than good under realistic conditions.`,
    `${label} prioritized constitutional and practical constraints over idealistic claims.`,
  ];

  const pool =
    side === 'government' ? govFrames :
    side === 'opposition' ? oppFrames :
    side === 'pro' ? proFrames : conFrames;

  return pick(rng, pool);
}

export function generateDebateSoFarFallback(
  topic: string,
  format: DebateFormat,
  speaker: Speaker,
  seed: string
): DebateSoFarData {
  const rng = seededRandom(`${seed}:${topic}:${format}:${speaker}`);
  const prior = getPriorSpeakers(format, speaker);

  const speeches: DebateSpeechPoint[] = prior.map((s, i) => {
    const side = getSide(format, s, format === 'PF' && s === 'constructive' ? i : undefined);
    const label =
      format === 'PF' && s === 'constructive'
        ? getLabel(format, s, i)
        : getLabel(format, s);
    return {
      speaker: s,
      label,
      side,
      point: buildPoint(rng, topic, side, label),
      strength: Math.round(55 + rng() * 35),
    };
  });

  // PF rebuttal+ needs both constructives even though "constructive" is one role in config
  if (format === 'PF' && speaker !== 'constructive' && !speeches.some((s) => s.label.includes('Constructive'))) {
    ['Pro Constructive', 'Con Constructive'].forEach((label, i) => {
      const side: DebateSide = i === 0 ? 'pro' : 'con';
      speeches.unshift({
        speaker: 'constructive',
        label,
        side,
        point: buildPoint(rng, topic, side, label),
        strength: Math.round(55 + rng() * 35),
      });
    });
  }

  const govTotal = speeches
    .filter((s) => s.side === 'government' || s.side === 'pro')
    .reduce((sum, s) => sum + s.strength, 0);
  const oppTotal = speeches
    .filter((s) => s.side === 'opposition' || s.side === 'con')
    .reduce((sum, s) => sum + s.strength, 0);
  const total = Math.max(govTotal + oppTotal, 1);

  const focusHints = [
    `Respond to the strongest ${format === 'WSDC' ? 'opposition' : ' opposing'} point while advancing your side on ${topic.slice(0, 40)}${topic.length > 40 ? '…' : ''}.`,
    `Weigh impacts clearly — show why your side wins the latest clash on this motion.`,
    `Extend an under-defended argument from earlier speeches and answer the latest rebuttal directly.`,
  ];

  return {
    speeches: speeches.slice(-4),
    clashScore: {
      government: Math.round((govTotal / total) * 100),
      opposition: Math.round((oppTotal / total) * 100),
    },
    focus: pick(rng, focusHints),
  };
}

export function parseDebateSoFarResponse(
  raw: unknown,
  topic: string,
  format: DebateFormat,
  speaker: Speaker,
  seed: string
): DebateSoFarData {
  if (raw && typeof raw === 'object' && 'speeches' in raw) {
    const data = raw as DebateSoFarData;
    if (Array.isArray(data.speeches) && data.speeches.length > 0) {
      return {
        speeches: data.speeches.slice(0, 4),
        clashScore: data.clashScore || { government: 50, opposition: 50 },
        focus: data.focus || '',
      };
    }
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parseDebateSoFarResponse(parsed, topic, format, speaker, seed);
    } catch {
      // legacy plain text — wrap as single block in focus, generate speeches from fallback
      const fallback = generateDebateSoFarFallback(topic, format, speaker, seed);
      return { ...fallback, focus: raw.slice(0, 180) };
    }
  }

  return generateDebateSoFarFallback(topic, format, speaker, seed);
}

export function sideColor(side: DebateSide): string {
  switch (side) {
    case 'government':
    case 'pro':
      return 'hsl(var(--primary))';
    case 'opposition':
    case 'con':
      return 'hsl(var(--secondary))';
    default:
      return 'hsl(var(--muted-foreground))';
  }
}

export function sideLabel(side: DebateSide, format: DebateFormat): string {
  if (format === 'WSDC') {
    return side === 'government' ? 'Gov' : 'Opp';
  }
  return side === 'pro' ? 'Pro' : 'Con';
}
