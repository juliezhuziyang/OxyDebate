import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, ArrowRight, Bot, Globe, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useStreak } from '@/hooks/useStreak';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PageHero, SectionHeading } from '@/components/PageHero';
import { StreakBadge } from '@/components/StreakCelebration';
import { StreakWeekView, StreakHistoryGrid } from '@/components/StreakWeekView';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/page-loader';
import type { Section } from '@/components/Layout';
import { formatPracticeDateLabel, getLocalPracticeDate } from '@/utils/streak';
import { cn } from '@/lib/utils';

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  if (mins < 1) return '<1 min';
  return `${mins} min`;
};

const StreakPage = () => {
  const { user, loading, signOut, profile } = useAuth();
  const {
    streak,
    longestStreak,
    practicedToday,
    streakAtRisk,
    practiceDates,
    totalPracticeDays,
    recentSessions,
    streakLoading,
  } = useStreak();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Practice Streak · Oxymorona Debate';
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleNavSectionChange = (section: Section) => {
    if (section === 'tournament' || section === 'tournament-home') {
      navigate('/app?section=tournament-home');
      return;
    }
    navigate(`/app?section=${section}`);
  };

  if (loading || !user) {
    return (
      <div className="page-shell min-h-screen flex items-center justify-center">
        <PageLoader label="Loading streak..." />
      </div>
    );
  }

  const lastPracticeDate = profile?.last_practice_date;

  return (
    <div className="page-shell min-h-screen flex flex-col bg-background text-foreground">
      <Navigation
        activeSection={'practice-home' as Section}
        onSectionChange={handleNavSectionChange}
        isAuthenticated
        onLogout={signOut}
      />

      <main id="main-content" className="flex-1 container mx-auto px-4 py-10 md:py-16 max-w-4xl">
        <PageHero
          eyebrow="Consistency"
          title="Practice streak"
          description="Build the habit of daily debate practice. Any AI or Global session counts toward your streak."
          compact
        />

        {/* Hero stat */}
        <section className="mt-8 mb-12 p-6 md:p-8 rounded-xl border border-border bg-card shadow-elevated-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/10 border border-orange-400/20">
                <Flame className="h-8 w-8 text-orange-500" fill="currentColor" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current streak</p>
                <p className="text-5xl font-display font-semibold tabular-nums tracking-tight">
                  {streak}
                  <span className="text-lg font-normal text-muted-foreground ml-2">
                    {streak === 1 ? 'day' : 'days'}
                  </span>
                </p>
              </div>
            </div>
            <StreakBadge
              streak={streak}
              practicedToday={practicedToday}
              streakAtRisk={streakAtRisk}
              size="lg"
              showLabel
            />
          </div>

          <p className="mt-6 text-sm text-muted-foreground leading-relaxed border-t border-border pt-5">
            {practicedToday
              ? 'You practiced today. Return tomorrow to extend your streak.'
              : streakAtRisk
                ? 'Your streak expires at midnight unless you practice today.'
                : streak > 0
                  ? 'Practice today to keep your momentum going.'
                  : 'Complete a practice session to begin your streak.'}
          </p>
        </section>

        {/* Stats row */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Longest streak', value: longestStreak, suffix: longestStreak === 1 ? 'day' : 'days' },
            { label: 'Total practice days', value: totalPracticeDays, suffix: totalPracticeDays === 1 ? 'day' : 'days' },
            {
              label: 'Last practiced',
              value: lastPracticeDate ? formatPracticeDateLabel(lastPracticeDate).replace(/, \d{4}$/, '') : '—',
              suffix: '',
              isText: true,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card/80 p-5"
            >
              <p className="editorial-eyebrow text-[0.65rem] mb-2">{stat.label}</p>
              <p className={cn(
                'font-display font-semibold tracking-tight',
                stat.isText ? 'text-lg' : 'text-3xl tabular-nums'
              )}>
                {stat.value}
                {stat.suffix && !stat.isText && (
                  <span className="text-sm font-normal text-muted-foreground ml-1.5">{stat.suffix}</span>
                )}
              </p>
            </div>
          ))}
        </section>

        {/* This week */}
        <section className="mb-12">
          <SectionHeading
            eyebrow="This week"
            title="Practice calendar"
            description="Each flame marks a day you completed at least one practice session."
            className="mb-6"
          />
          <div className="rounded-xl border border-border bg-card p-5 md:p-6">
            {streakLoading ? (
              <PageLoader label="Loading calendar..." />
            ) : (
              <StreakWeekView practiceDates={practiceDates} />
            )}
          </div>
        </section>

        {/* History grid */}
        <section className="mb-12">
          <SectionHeading
            eyebrow="History"
            title="Last four weeks"
            className="mb-6"
          />
          <div className="rounded-xl border border-border bg-card p-5 md:p-6">
            <StreakHistoryGrid practiceDates={practiceDates} weeks={4} />
          </div>
        </section>

        {/* Recent sessions */}
        <section className="mb-12">
          <SectionHeading
            eyebrow="Activity"
            title="Recent sessions"
            className="mb-6"
          />
          <div className="rounded-xl border border-border overflow-hidden">
            {recentSessions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No practice sessions recorded yet.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentSessions.slice(0, 8).map((session) => (
                  <li
                    key={session.id}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="mt-0.5 flex items-center justify-center w-8 h-8 rounded-md bg-muted/60 shrink-0">
                      {session.session_type === 'global' ? (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Bot className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{session.topic}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {session.session_type === 'global' ? 'Global Practice' : 'AI Practice'}
                        {' · '}
                        {session.format}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {formatPracticeDateLabel(getLocalPracticeDate(new Date(session.created_at))).split(',')[0]}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center justify-end gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {formatDuration(session.duration_seconds)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            size="lg"
            className="font-medium"
            onClick={() => navigate('/app?section=practice-home')}
          >
            Start practicing
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="font-medium"
            onClick={() => navigate('/')}
          >
            Back to home
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StreakPage;
