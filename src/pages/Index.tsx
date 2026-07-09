
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useStreak } from '@/hooks/useStreak';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { StreakCard } from '@/components/StreakCelebration';
import type { Section } from '@/components/Layout';
import { Announcements } from '@/components/Announcements';

const Index = () => {
  const { user, signOut } = useAuth();
  const { streak, longestStreak, practicedToday, streakAtRisk, practiceDates } = useStreak();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Oxymorona Debate Community';

    const descText = 'Practice, debate, and rank up with Oxymorona — a global debate community powered by AI and real sessions.';
    let meta = document.querySelector("meta[name='description']");
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', descText);

    const canonicalHref = window.location.origin + '/';
    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalHref);
  }, []);

  const handleGetStarted = () => {
    navigate(user ? '/app?section=practice-home' : '/auth');
  };


  const handleNavSectionChange = (section: Section) => {
    if (section === 'tournament' || section === 'tournament-home') {
      navigate(user ? '/app?section=tournament-home' : '/tournament');
      return;
    }
    navigate(user ? `/app?section=${section}` : '/auth');
  };
  return (
    <div className="page-shell min-h-screen flex flex-col bg-background text-foreground">
      <Navigation
        activeSection={"ai-practice" as Section}
        onSectionChange={handleNavSectionChange}
        isAuthenticated={!!user}
        onLogout={signOut}
      />

      {/* Hero Section */}
      <section className="relative w-full min-h-[88vh] overflow-hidden border-b border-border">
        <img
          src="/lovable-uploads/81b3875b-f5ba-4565-873d-48077a07f163.png"
          alt="Students engaged in a debate at Oxymorona Community"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/88 to-background/20 dark:from-background dark:via-background/92 dark:to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        <div className="relative z-10 container mx-auto h-full min-h-[88vh] px-4 lg:px-8 flex items-end pb-16 md:pb-24">
          <div className="w-full flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="hero-panel opacity-0-start animate-fade-in-up max-w-3xl">
              <p className="editorial-eyebrow mb-4">Oxymorona Debate Society</p>
              <div className="hero-accent-line" />
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-semibold leading-[1.05] mb-6">
                Where conviction meets curiosity.
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-9 leading-relaxed max-w-xl">
                Train with AI, spar with real opponents, and climb global rankings — built for debaters who take the craft seriously.
              </p>
              <Button size="lg" onClick={handleGetStarted} aria-label="Get started" className="font-medium px-8">
                Enter the arena
              </Button>
            </div>

            {user && (
              <div className="opacity-0-start animate-fade-in-up w-full max-w-sm lg:mb-2" style={{ animationDelay: '120ms' }}>
                <StreakCard
                  streak={streak}
                  longestStreak={longestStreak}
                  practicedToday={practicedToday}
                  streakAtRisk={streakAtRisk}
                  practiceDates={practiceDates}
                  onPractice={() => navigate('/app?section=practice-home')}
                  onViewDetails={() => navigate('/streak')}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <main id="main-content">
        <Announcements />

        <section className="container mx-auto px-4 pb-20 md:pb-28">
          <div className="mb-12 md:mb-16 max-w-2xl">
            <p className="editorial-eyebrow mb-3">Leadership</p>
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">Meet our team</h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              The students building a global home for competitive debate.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <article className="team-card">
              <div className="flex items-center gap-4 mb-5">
                <img src="/lovable-uploads/c91fef03-82a7-466d-a99b-55f44262776a.png" alt="Julie Zhu profile photo" className="w-20 h-20 rounded-full border-2 border-primary/20 object-cover shadow-md" loading="lazy" />
                <div>
                  <h3 className="text-xl font-semibold">Julie Zhu</h3>
                  <p className="text-primary text-sm font-medium">President</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Julie is dedicated to creating a community where debate lovers can connect and grow together. With a strong interest in computer science, she combines her curiosity with creativity. Inspired by both her academic passions and her love for debate, she came up with the idea of developing this website as a space for like-minded students to share, learn, and inspire one another.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span>President of Oxymorona Debate Club</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span>3 years debate experience</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span>Joined multiple international tournaments including Papillon WSDC, Transpacific WSDC</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span>Won gold speaker award in East Asia WSDC</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span>Have judged Public Forum rounds</li>
              </ul>
            </article>

            <article className="team-card">
              <div className="flex items-center gap-4 mb-5">
                <img src="/lovable-uploads/e8c7daf1-e0a4-4f0b-b245-6b3ee9a50666.png" alt="Lina Lu profile photo" className="w-20 h-20 rounded-full border-2 border-primary/20 object-cover shadow-md" loading="lazy" />
                <div>
                  <h3 className="text-xl font-semibold">Lina Lu</h3>
                  <p className="text-primary text-sm font-medium">Vice President</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Lina is a passionate debater and a dedicated tennis athlete. Whether in the debate room or on the court, she brings focus, energy, and commitment to everything she does.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span>Vice president of Oxymorona Debate Club</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span>2 years debate experience in PF</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span>NHSDLC 2024 PF Offline High School best speaker award</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span>NHSDLC 2024 PF Offline Middle School Round of 16</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">●</span>NHSDLC 2025 PF Online HIGH School QuarterFinals</li>
              </ul>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
