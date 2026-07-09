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

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

/** Monday–Sunday date strings for the week containing referenceDate */
export function getCurrentWeekDateStrings(referenceDate = new Date()): string[] {
  const day = referenceDate.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(referenceDate);
  monday.setHours(12, 0, 0, 0);
  monday.setDate(referenceDate.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return getLocalPracticeDate(d);
  });
}

export function getWeekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS;
}

export function getTodayWeekIndex(referenceDate = new Date()): number {
  const today = getLocalPracticeDate(referenceDate);
  const weekDates = getCurrentWeekDateStrings(referenceDate);
  const index = weekDates.indexOf(today);
  return index >= 0 ? index : (referenceDate.getDay() + 6) % 7;
}

/** Last N days ending today — date string per cell (oldest first) */
export function getRecentDayRange(dayCount: number, referenceDate = new Date()): string[] {
  return Array.from({ length: dayCount }, (_, i) => {
    const d = new Date(referenceDate);
    d.setDate(referenceDate.getDate() - (dayCount - 1 - i));
    return getLocalPracticeDate(d);
  });
}

export function countPracticeDays(practiceDates: Set<string>): number {
  return practiceDates.size;
}

export function formatPracticeDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
