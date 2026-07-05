
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import type { Section } from '@/components/Layout';
import { Announcements } from '@/components/Announcements';
import { ChevronDown } from 'lucide-react';

const Index = () => {
  const { user, signOut } = useAuth();
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
      <section className="relative w-full min-h-[85vh] md:min-h-screen overflow-hidden">
        <img
          src="/lovable-uploads/81b3875b-f5ba-4565-873d-48077a07f163.png"
          alt="Students engaged in a debate at Oxymorona Community"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30 dark:from-background/98 dark:via-background/85 dark:to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="relative z-10 container mx-auto h-full min-h-[85vh] md:min-h-screen px-4 lg:px-8 flex items-center">
          <div className="hero-panel opacity-0-start animate-fade-in-up max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
              Oxymorona Debate Community
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
              Where conviction meets curiosity. Train with AI, spar with real opponents, and climb the global rankings. Debate smarter. Win fairer. Grow together.
            </p>
            <Button size="lg" variant="gradient" onClick={handleGetStarted} aria-label="Get started" className="font-semibold">
              Get started
            </Button>
          </div>
        </div>

        <button
          onClick={() => document.getElementById('announcements')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors animate-bounce"
          aria-label="Scroll to announcements"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      </section>

      <main id="main-content">
        <Announcements />

        <section className="container mx-auto px-4 pb-16 md:pb-24">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Meet our team</h2>
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
