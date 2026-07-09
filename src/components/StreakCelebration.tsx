import { useEffect } from 'react';
import { Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StreakCelebrationProps {
  streak: number;
  extended: boolean;
  onDismiss: () => void;
}

export const StreakCelebration = ({ streak, extended, onDismiss }: StreakCelebrationProps) => {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 4500);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  const title = extended ? 'Streak extended!' : streak === 1 ? 'Streak started!' : 'You\'re on fire!';
  const subtitle = extended
    ? 'You kept your practice streak going. Keep it up!'
    : 'Your first practice today — great work!';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Streak celebration"
    >
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-md animate-fade-in"
        onClick={onDismiss}
      />

      <div className="relative w-full max-w-sm text-center animate-streak-pop">
        <div className="streak-confetti" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="streak-confetti-piece" style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>

        <div className="relative mx-auto mb-6 streak-flame-wrap">
          <div className="streak-flame-glow" />
          <div className="streak-flame streak-flame-back" />
          <div className="streak-flame streak-flame-front" />
          <Flame className="absolute inset-0 m-auto h-16 w-16 text-white drop-shadow-lg streak-flame-icon" strokeWidth={1.5} />
        </div>

        <p className="editorial-eyebrow text-secondary mb-2">{title}</p>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Flame className="h-8 w-8 text-orange-500 streak-flame-icon" fill="currentColor" />
          <span className="text-6xl font-display font-bold tabular-nums tracking-tight text-foreground">
            {streak}
          </span>
        </div>
        <p className="text-lg font-semibold mb-1">
          {streak === 1 ? '1 day streak' : `${streak} day streak`}
        </p>
        <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto leading-relaxed">
          {subtitle}
        </p>

        <Button onClick={onDismiss} size="lg" className="font-semibold px-10">
          Continue
        </Button>
      </div>
    </div>
  );
};

interface StreakBadgeProps {
  streak: number;
  practicedToday?: boolean;
  streakAtRisk?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const StreakBadge = ({
  streak,
  practicedToday = false,
  streakAtRisk = false,
  size = 'md',
  showLabel = false,
  className,
}: StreakBadgeProps) => {
  const isActive = streak > 0;
  const isLit = practicedToday || isActive;

  const sizeClasses = {
    sm: 'h-8 px-2.5 gap-1.5 text-sm',
    md: 'h-10 px-3.5 gap-2 text-base',
    lg: 'h-12 px-4 gap-2.5 text-lg',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-semibold tabular-nums transition-all',
        sizeClasses[size],
        isLit
          ? 'bg-gradient-to-r from-orange-500/15 to-amber-400/15 text-orange-600 dark:text-orange-400 border border-orange-400/30 shadow-sm'
          : 'bg-muted/60 text-muted-foreground border border-border',
        streakAtRisk && !practicedToday && 'ring-2 ring-orange-400/40 animate-streak-pulse',
        className
      )}
      title={
        streakAtRisk && !practicedToday
          ? 'Practice today to keep your streak!'
          : isActive
            ? `${streak} day streak`
            : 'Start your streak today'
      }
    >
      <Flame
        className={cn(
          iconSizes[size],
          isLit ? 'text-orange-500 streak-flame-icon' : 'text-muted-foreground/50',
          practicedToday && 'animate-streak-flicker'
        )}
        fill={isLit ? 'currentColor' : 'none'}
      />
      <span>{streak}</span>
      {showLabel && <span className="text-xs font-medium uppercase tracking-wide opacity-80">streak</span>}
    </div>
  );
};

interface StreakCardProps {
  streak: number;
  longestStreak: number;
  practicedToday: boolean;
  streakAtRisk: boolean;
  onPractice?: () => void;
  className?: string;
}

export const StreakCard = ({
  streak,
  longestStreak,
  practicedToday,
  streakAtRisk,
  onPractice,
  className,
}: StreakCardProps) => {
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <div className={cn('streak-card', className)}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="editorial-eyebrow mb-1">Daily streak</p>
          <div className="flex items-center gap-3">
            <StreakBadge
              streak={streak}
              practicedToday={practicedToday}
              streakAtRisk={streakAtRisk}
              size="lg"
            />
            {longestStreak > streak && (
              <span className="text-xs text-muted-foreground">
                Best: {longestStreak}
              </span>
            )}
          </div>
        </div>
        <div className="streak-card-flame" aria-hidden="true">
          <Flame className="h-10 w-10 text-orange-500" fill="currentColor" />
        </div>
      </div>

      <div className="flex justify-between gap-1 mb-4">
        {weekDays.map((label, index) => {
          const isToday = index === todayIndex;
          const isPast = index < todayIndex;
          const isDone = practicedToday && isToday;
          const wasDone = isPast && streak > 0 && (streakAtRisk ? index < todayIndex - 1 : index <= todayIndex - 1);

          return (
            <div key={`${label}-${index}`} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={cn(
                  'w-full max-w-[2rem] aspect-square rounded-full flex items-center justify-center text-[0.65rem] font-bold border-2 transition-colors',
                  isDone || wasDone
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : isToday
                      ? 'border-orange-400 bg-orange-500/10 text-orange-600'
                      : 'border-border bg-muted/30 text-muted-foreground'
                )}
              >
                {(isDone || wasDone) && <Flame className="h-3 w-3" fill="currentColor" />}
              </div>
              <span className={cn('text-[0.6rem] uppercase', isToday ? 'text-orange-600 font-semibold' : 'text-muted-foreground')}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {practicedToday
          ? 'You practiced today — come back tomorrow to keep your streak alive!'
          : streakAtRisk
            ? 'Your streak is at risk! Complete a practice session today.'
            : streak > 0
              ? 'Practice today to extend your streak.'
              : 'Complete any AI or Global practice to start your streak.'}
      </p>

      {onPractice && !practicedToday && (
        <Button onClick={onPractice} className="w-full mt-4 font-medium" size="sm">
          Practice now
        </Button>
      )}
    </div>
  );
};
