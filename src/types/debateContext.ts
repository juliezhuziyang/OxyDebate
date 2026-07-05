export type DebateSide = 'government' | 'opposition' | 'pro' | 'con';

export interface DebateSpeechPoint {
  speaker: string;
  label: string;
  side: DebateSide;
  point: string;
  strength: number;
}

export interface DebateSoFarData {
  speeches: DebateSpeechPoint[];
  clashScore: {
    government: number;
    opposition: number;
  };
  focus: string;
}
