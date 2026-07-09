import { useEffect } from 'react';
import { Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StreakWeekView } from '@/components/StreakWeekView';

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
  onClick?: () => void;
}

export const StreakBadge = ({
  streak,
  practicedToday = false,
  streakAtRisk = false,
  size = 'md',
  showLabel = false,
  className,
  onClick,
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

  const badgeClass = cn(
    'inline-flex items-center rounded-full font-semibold tabular-nums transition-all',
    sizeClasses[size],
    isLit
      ? 'bg-gradient-to-r from-orange-500/15 to-amber-400/15 text-orange-600 dark:text-orange-400 border border-orange-400/30 shadow-sm'
      : 'bg-muted/60 text-muted-foreground border border-border',
    streakAtRisk && !practicedToday && 'ring-2 ring-orange-400/40 animate-streak-pulse',
    onClick && 'cursor-pointer hover:border-orange-400/50 hover:shadow-md active:scale-[0.98]',
    className
  );

  const content = (
    <>
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
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={badgeClass}
        title={
          streakAtRisk && !practicedToday
            ? 'Practice today to keep your streak!'
            : isActive
              ? `${streak} day streak — view details`
              : 'Start your streak today'
        }
        aria-label="View streak details"
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={badgeClass}
      title={
        streakAtRisk && !practicedToday
          ? 'Practice today to keep your streak!'
          : isActive
            ? `${streak} day streak`
            : 'Start your streak today'
      }
    >
      {content}
    </div>
  );
};

interface StreakCardProps {
  streak: number;
  longestStreak: number;
  practicedToday: boolean;
  streakAtRisk: boolean;
  practiceDates: Set<string>;
  onPractice?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

export const StreakCard = ({
  streak,
  longestStreak,
  practicedToday,
  streakAtRisk,
  practiceDates,
  onPractice,
  onViewDetails,
  className,
}: StreakCardProps) => {
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
              onClick={onViewDetails}
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

      <StreakWeekView practiceDates={practiceDates} className="mb-4" />

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
