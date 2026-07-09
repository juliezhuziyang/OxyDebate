import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getCurrentWeekDateStrings,
  getLocalPracticeDate,
  getWeekdayLabels,
} from '@/utils/streak';

interface StreakWeekViewProps {
  practiceDates: Set<string>;
  compact?: boolean;
  className?: string;
}

export const StreakWeekView = ({
  practiceDates,
  compact = false,
  className,
}: StreakWeekViewProps) => {
  const weekDates = getCurrentWeekDateStrings();
  const weekLabels = getWeekdayLabels();
  const today = getLocalPracticeDate();

  return (
    <div className={cn('flex justify-between gap-1', className)}>
      {weekLabels.map((label, index) => {
        const dateStr = weekDates[index];
        const isToday = dateStr === today;
        const practiced = practiceDates.has(dateStr);

        return (
          <div key={`${label}-${dateStr}`} className="flex flex-col items-center gap-1.5 flex-1">
            <div
              className={cn(
                'w-full aspect-square rounded-full flex items-center justify-center border-2 transition-colors',
                compact ? 'max-w-[1.75rem]' : 'max-w-[2rem]',
                practiced
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : isToday
                    ? 'border-orange-400/70 bg-orange-500/5 text-orange-600/80'
                    : 'border-border bg-muted/30 text-muted-foreground'
              )}
              title={dateStr}
            >
              {practiced && (
                <Flame className={cn(compact ? 'h-2.5 w-2.5' : 'h-3 w-3')} fill="currentColor" />
              )}
            </div>
            <span
              className={cn(
                'uppercase',
                compact ? 'text-[0.55rem]' : 'text-[0.6rem]',
                isToday ? 'text-orange-600 font-semibold' : 'text-muted-foreground'
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

interface StreakHistoryGridProps {
  practiceDates: Set<string>;
  weeks?: number;
  className?: string;
}

/** Recent practice history — one row per week, oldest week on top */
export const StreakHistoryGrid = ({
  practiceDates,
  weeks = 4,
  className,
}: StreakHistoryGridProps) => {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() + mondayOffset);

  const rows: { dateStr: string; dayNum: number; isToday: boolean }[][] = [];

  for (let w = weeks - 1; w >= 0; w -= 1) {
    const weekStart = new Date(thisMonday);
    weekStart.setDate(thisMonday.getDate() - w * 7);
    const row = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dateStr = getLocalPracticeDate(d);
      return {
        dateStr,
        dayNum: d.getDate(),
        isToday: dateStr === getLocalPracticeDate(),
      };
    });
    rows.push(row);
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="grid grid-cols-7 gap-1.5 mb-1">
        {getWeekdayLabels().map((label) => (
          <span
            key={label}
            className="text-center text-[0.6rem] uppercase tracking-wider text-muted-foreground font-medium"
          >
            {label}
          </span>
        ))}
      </div>
      {rows.map((row) => (
        <div key={row[0].dateStr} className="grid grid-cols-7 gap-1.5">
          {row.map((cell) => {
            const practiced = practiceDates.has(cell.dateStr);
            return (
              <div
                key={cell.dateStr}
                title={cell.dateStr}
                className={cn(
                  'aspect-square rounded-md flex items-center justify-center text-[0.65rem] font-medium border transition-colors',
                  practiced
                    ? 'bg-orange-500/90 border-orange-500 text-white'
                    : cell.isToday
                      ? 'border-orange-400/60 bg-orange-500/5 text-orange-700 dark:text-orange-400'
                      : 'border-border/80 bg-muted/20 text-muted-foreground/70'
                )}
              >
                {practiced ? (
                  <Flame className="h-3 w-3" fill="currentColor" />
                ) : (
                  cell.dayNum
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
