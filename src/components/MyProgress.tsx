import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PracticeRecord {
  id: string;
  date: string; // ISO string
  timeUsed: number; // seconds
  saved: boolean;
}

function getWeekStart(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day + 6) % 7; // Monday as week start
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - diff);
  return date;
}

export const MyProgress = () => {
  const [history, setHistory] = useState<PracticeRecord[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('practiceHistory') || '[]';
      const parsed = JSON.parse(raw) as PracticeRecord[];
      setHistory(parsed.filter((r) => r.saved));
    } catch {
      setHistory([]);
    }
  }, []);

  const thisWeekMinutes = useMemo(() => {
    const now = new Date();
    const start = getWeekStart(now).getTime();
    return Math.round(
      history
        .filter((r) => new Date(r.date).getTime() >= start)
        .reduce((sum, r) => sum + (r.timeUsed || 0), 0) / 60
    );
  }, [history]);

  const last5Weeks = useMemo(() => {
    const weeks: { label: string; minutes: number }[] = [];
    const now = new Date();
    for (let i = 4; i >= 0; i--) {
      const temp = new Date(now);
      temp.setDate(now.getDate() - i * 7);
      const start = getWeekStart(temp);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      const minutes = Math.round(
        history
          .filter((r) => {
            const t = new Date(r.date).getTime();
            return t >= start.getTime() && t < end.getTime();
          })
          .reduce((sum, r) => sum + (r.timeUsed || 0), 0) / 60
      );
      const label = `${start.getMonth() + 1}/${start.getDate()}`;
      weeks.push({ label, minutes });
    }
    return weeks;
  }, [history]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <section className="grid md:grid-cols-3 gap-6">
        <div className="bg-card border rounded-lg p-6">
          <div className="text-sm text-muted-foreground">Time this week</div>
          <div className="text-3xl font-bold">{thisWeekMinutes} min</div>
        </div>
        <div className="bg-card border rounded-lg p-6">
          <div className="text-sm text-muted-foreground">Highest ranking</div>
          <div className="text-3xl font-bold">—</div>
          <div className="text-xs text-muted-foreground mt-1">Coming soon</div>
        </div>
        <div className="bg-card border rounded-lg p-6">
          <div className="text-sm text-muted-foreground">Total sessions</div>
          <div className="text-3xl font-bold">{history.length}</div>
        </div>
      </section>

      <section className="bg-card border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Practice time over last 5 weeks</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={last5Weeks} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-card border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2">Ranking trend (last 5 weeks)</h2>
        <p className="text-sm text-muted-foreground">Coming soon — we will chart your ranking once enough data is collected.</p>
      </section>
    </div>
  );
};
