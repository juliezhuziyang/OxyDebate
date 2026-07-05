import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MessageSquare, Loader2 } from 'lucide-react';
import type { DebateFormat } from './AIPractice';
import type { DebateSoFarData } from '@/types/debateContext';
import { sideColor, sideLabel } from '@/utils/debateSoFar';
import { cn } from '@/lib/utils';

interface DebateSoFarChartProps {
  data: DebateSoFarData | null;
  format: DebateFormat;
  loading?: boolean;
}

export function DebateSoFarChart({ data, format, loading }: DebateSoFarChartProps) {
  const govLabel = format === 'WSDC' ? 'Government' : 'Pro';
  const oppLabel = format === 'WSDC' ? 'Opposition' : 'Con';

  const momentumData = data
    ? [
        { name: govLabel, value: data.clashScore.government, fill: 'hsl(var(--primary))' },
        { name: oppLabel, value: data.clashScore.opposition, fill: 'hsl(var(--secondary))' },
      ]
    : [];

  return (
    <div className="rounded-xl border border-border bg-card p-5 md:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={18} className="text-primary" />
        <h3 className="font-semibold text-lg">Debate So Far</h3>
        {loading && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
      </div>

      {loading && !data ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-28 bg-muted rounded-lg" />
          <div className="h-16 bg-muted rounded-lg" />
          <div className="h-16 bg-muted rounded-lg" />
        </div>
      ) : data ? (
        <div className="space-y-5">
          {/* Momentum chart */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Argument momentum
            </p>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={momentumData} layout="vertical" margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border/50" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 12 }} className="fill-foreground" />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--popover-foreground))',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Momentum']}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
                    {momentumData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Speech timeline */}
          <div className="relative pl-4 border-l-2 border-border space-y-3">
            {data.speeches.map((speech, index) => (
              <div key={`${speech.speaker}-${index}`} className="relative animate-fade-in">
                <span
                  className="absolute -left-[1.35rem] top-1.5 h-3 w-3 rounded-full ring-2 ring-card"
                  style={{ backgroundColor: sideColor(speech.side) }}
                />
                <div className="rounded-lg bg-muted/40 border border-border/60 p-3">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">{speech.label}</span>
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded',
                        speech.side === 'government' || speech.side === 'pro'
                          ? 'bg-primary/15 text-primary'
                          : 'bg-secondary/20 text-secondary-foreground'
                      )}
                    >
                      {sideLabel(speech.side, format)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-snug line-clamp-2">{speech.point}</p>
                </div>
              </div>
            ))}
          </div>

          {data.focus && (
            <p className="text-sm text-foreground/90 bg-primary/5 border border-primary/15 rounded-lg px-3 py-2">
              <span className="font-medium text-primary">Your focus: </span>
              {data.focus}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
