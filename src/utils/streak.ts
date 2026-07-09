export type SessionType = 'ai' | 'global';

export interface RecordPracticeParams {
  topic: string;
  format: string;
  durationSeconds: number;
  sessionType: SessionType;
  completed?: boolean;
  score?: number | null;
}

export interface RecordPracticeResult {
  current_streak: number;
  longest_streak: number;
  extended: boolean;
  celebrate: boolean;
  first_practice_today: boolean;
}

/** Returns today's date in the user's local timezone as YYYY-MM-DD */
export function getLocalPracticeDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayPracticeDate(date = new Date()): string {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalPracticeDate(yesterday);
}

export interface StreakProfileFields {
  current_streak?: number | null;
  longest_streak?: number | null;
  last_practice_date?: string | null;
}

/** Streak is active if the user practiced today or yesterday */
export function getEffectiveStreak(profile: StreakProfileFields | null | undefined): number {
  if (!profile?.last_practice_date) return 0;

  const today = getLocalPracticeDate();
  const yesterday = getYesterdayPracticeDate();

  if (profile.last_practice_date === today || profile.last_practice_date === yesterday) {
    return profile.current_streak ?? 0;
  }

  return 0;
}

export function hasPracticedToday(profile: StreakProfileFields | null | undefined): boolean {
  if (!profile?.last_practice_date) return false;
  return profile.last_practice_date === getLocalPracticeDate();
}

export function isStreakAtRisk(profile: StreakProfileFields | null | undefined): boolean {
  if (!profile?.last_practice_date) return false;
  const streak = getEffectiveStreak(profile);
  if (streak === 0) return false;
  return profile.last_practice_date === getYesterdayPracticeDate();
}
