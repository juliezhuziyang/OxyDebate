import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PentaLeague2025Public } from '@/components/tournament/PentaLeague2025Public';
import { TournamentHome } from '@/components/SectionHome';
import { PENTALEAGUE_2025 } from '@/constants/pentaleague2025';
import type { Section } from '@/components/Layout';

const TournamentPage = () => {
  const { eventSlug } = useParams<{ eventSlug?: string }>();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const isPentaLeague = eventSlug === PENTALEAGUE_2025.id;

  useEffect(() => {
    document.title = isPentaLeague
      ? 'Shanghai Debate PentaLeague 2025 · Oxymorona Debate'
      : 'Tournament · Oxymorona Debate';
  }, [isPentaLeague]);

  const handleNavSection = (section: Section) => {
    if (user) {
      navigate(`/app?section=${section}`);
      return;
    }
    if (section === 'tournament-home') {
      navigate('/tournament');
      return;
    }
    if (section === 'tournament') {
      navigate(`/tournament/${PENTALEAGUE_2025.id}`);
      return;
    }
    navigate('/auth');
  };

  const goToPentaLeague = () => {
    navigate(`/tournament/${PENTALEAGUE_2025.id}`);
  };

  return (
    <div className="page-shell min-h-screen flex flex-col bg-background text-foreground">
      <Navigation
        activeSection={isPentaLeague ? 'tournament' : 'tournament-home'}
        onSectionChange={handleNavSection}
        isAuthenticated={!!user}
        onLogout={signOut}
      />
      <main id="main-content" className="container mx-auto px-4 py-8 md:py-10 flex-1">
        {isPentaLeague ? (
          <>
            <Link
              to="/tournament"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              ← Back to Tournament
            </Link>
            <PentaLeague2025Public />
          </>
        ) : (
          <TournamentHome onNavigate={(section) => {
            if (section === 'tournament') {
              goToPentaLeague();
            }
          }} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TournamentPage;
