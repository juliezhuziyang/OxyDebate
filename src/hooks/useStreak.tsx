import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  getLocalPracticeDate,
  getEffectiveStreak,
  hasPracticedToday,
  isStreakAtRisk,
  type RecordPracticeParams,
  type RecordPracticeResult,
} from '@/utils/streak';
import { StreakCelebration } from '@/components/StreakCelebration';

export interface StreakCelebrationState {
  streak: number;
  extended: boolean;
}

interface StreakContextType {
  streak: number;
  longestStreak: number;
  practicedToday: boolean;
  streakAtRisk: boolean;
  recordPractice: (params: RecordPracticeParams) => Promise<RecordPracticeResult | null>;
  dismissCelebration: () => void;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

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

  const streak = getEffectiveStreak(profile);
  const longestStreak = profile?.longest_streak ?? 0;
  const practicedToday = hasPracticedToday(profile);
  const streakAtRisk = isStreakAtRisk(profile);

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
        return result;
      } catch (error) {
        console.error('Failed to record practice streak:', error);
        return null;
      }
    },
    [user, refreshProfile]
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
        recordPractice,
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
