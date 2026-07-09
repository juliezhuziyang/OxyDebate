import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  getLocalPracticeDate,
  getEffectiveStreak,
  hasPracticedToday,
  isStreakAtRisk,
  countPracticeDays,
  type RecordPracticeParams,
  type RecordPracticeResult,
} from '@/utils/streak';
import { StreakCelebration } from '@/components/StreakCelebration';

export interface StreakCelebrationState {
  streak: number;
  extended: boolean;
}

export interface RecentPracticeSession {
  id: string;
  topic: string;
  format: string;
  session_type: string | null;
  duration_seconds: number;
  created_at: string;
}

interface StreakContextType {
  streak: number;
  longestStreak: number;
  practicedToday: boolean;
  streakAtRisk: boolean;
  practiceDates: Set<string>;
  totalPracticeDays: number;
  recentSessions: RecentPracticeSession[];
  streakLoading: boolean;
  recordPractice: (params: RecordPracticeParams) => Promise<RecordPracticeResult | null>;
  refreshStreakData: () => Promise<void>;
  dismissCelebration: () => void;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

const PRACTICE_HISTORY_DAYS = 120;

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (!context) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
};

export const StreakProvider = ({ children }: { children: ReactNode }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [celebration, setCelebration] = useState<StreakCelebrationState | null>(null);
  const [practiceDates, setPracticeDates] = useState<Set<string>>(new Set());
  const [recentSessions, setRecentSessions] = useState<RecentPracticeSession[]>([]);
  const [streakLoading, setStreakLoading] = useState(false);

  const streak = getEffectiveStreak(profile);
  const longestStreak = profile?.longest_streak ?? 0;
  const practicedToday = hasPracticedToday(profile);
  const streakAtRisk = isStreakAtRisk(profile);
  const totalPracticeDays = countPracticeDays(practiceDates);

  const refreshStreakData = useCallback(async () => {
    if (!user) {
      setPracticeDates(new Set());
      setRecentSessions([]);
      return;
    }

    setStreakLoading(true);
    try {
      const since = new Date();
      since.setDate(since.getDate() - PRACTICE_HISTORY_DAYS);

      const { data, error } = await supabase
        .from('practice_sessions')
        .select('id, topic, format, session_type, duration_seconds, created_at')
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const dates = new Set<string>();
      for (const row of data ?? []) {
        dates.add(getLocalPracticeDate(new Date(row.created_at)));
      }

      setPracticeDates(dates);
      setRecentSessions((data ?? []) as RecentPracticeSession[]);
    } catch (error) {
      console.error('Failed to load practice history:', error);
    } finally {
      setStreakLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshStreakData();
  }, [refreshStreakData]);

  const recordPractice = useCallback(
    async (params: RecordPracticeParams): Promise<RecordPracticeResult | null> => {
      if (!user) return null;

      try {
        const { data, error } = await supabase.rpc('record_practice_and_streak', {
          p_practice_date: getLocalPracticeDate(),
          p_topic: params.topic,
          p_format: params.format,
          p_duration_seconds: params.durationSeconds,
          p_session_type: params.sessionType,
          p_completed: params.completed ?? true,
          p_score: params.score ?? null,
        });

        if (error) {
          console.error('Failed to record practice streak:', error);
          return null;
        }

        const result = data as RecordPracticeResult;

        if (result?.celebrate) {
          setCelebration({
            streak: result.current_streak,
            extended: result.extended,
          });
        }

        await refreshProfile();
        await refreshStreakData();
        return result;
      } catch (error) {
        console.error('Failed to record practice streak:', error);
        return null;
      }
    },
    [user, refreshProfile, refreshStreakData]
  );

  const dismissCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  return (
    <StreakContext.Provider
      value={{
        streak,
        longestStreak,
        practicedToday,
        streakAtRisk,
        practiceDates,
        totalPracticeDays,
        recentSessions,
        streakLoading,
        recordPractice,
        refreshStreakData,
        dismissCelebration,
      }}
    >
      {children}
      {celebration && (
        <StreakCelebration
          streak={celebration.streak}
          extended={celebration.extended}
          onDismiss={dismissCelebration}
        />
      )}
    </StreakContext.Provider>
  );
};
