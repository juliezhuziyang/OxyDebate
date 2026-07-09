
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from './Navigation';
import { AIPractice } from './AIPractice';
import { RealGlobalPractice } from './RealGlobalPractice';
import { RealRankings } from './RealRankings';
import { Posts } from './Posts';
import { PageLoader } from '@/components/ui/page-loader';
import { MyProgress } from '@/components/MyProgress';
import { Feedback } from '@/components/Feedback';
import { DebateGuide } from '@/components/DebateGuide';
import { Podcasts } from '@/components/Podcasts';
import { JoinUs } from '@/components/JoinUs';
import Tournament from '@/components/Tournament';
import { PracticeHome, TournamentHome, ResourceHome, MyDebateHome } from './SectionHome';
import { Footer } from './Footer';

export type Section = 'practice-home' | 'tournament-home' | 'resource-home' | 'mydebate-home' | 'ai-practice' | 'global-practice' | 'rankings' | 'content' | 'tournament' | 'global-news' | 'debate-guide' | 'my-progress' | 'join-us' | 'feedback';

export const Layout = () => {
  const [activeSection, setActiveSection] = useState<Section>('practice-home');
  const [guideId, setGuideId] = useState<string | null>(null);
  const [podcastId, setPodcastId] = useState<string | null>(null);
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/';
    }
  }, [user, loading]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sectionParam = params.get('section') as Section | null;
    const guideParam = params.get('guide');
    const podcastParam = params.get('podcast');
    if (sectionParam) {
      setActiveSection(sectionParam);
    }
    setGuideId(guideParam);
    setPodcastId(podcastParam);
  }, []);

  const syncUrl = (section: Section, options?: { guide?: string | null; podcast?: string | null }) => {
    const url = new URL(window.location.href);
    url.searchParams.set('section', section);
    if (options?.guide) {
      url.searchParams.set('guide', options.guide);
    } else {
      url.searchParams.delete('guide');
    }
    if (options?.podcast) {
      url.searchParams.set('podcast', options.podcast);
    } else {
      url.searchParams.delete('podcast');
    }
    window.history.pushState({}, '', url.toString());
  };

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    setGuideId(null);
    setPodcastId(null);
    syncUrl(section, { guide: null, podcast: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGuideNavigate = (id: string | null) => {
    setGuideId(id);
    setPodcastId(null);
    syncUrl('debate-guide', { guide: id, podcast: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePodcastNavigate = (id: string | null) => {
    setPodcastId(id);
    setGuideId(null);
    syncUrl('global-news', { podcast: id, guide: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="page-shell min-h-screen flex items-center justify-center">
        <PageLoader label="Loading..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'practice-home':
        return <PracticeHome onNavigate={handleSectionChange} />;
      case 'tournament-home':
        return <TournamentHome onNavigate={handleSectionChange} />;
      case 'resource-home':
        return <ResourceHome onNavigate={handleSectionChange} />;
      case 'mydebate-home':
        return <MyDebateHome onNavigate={handleSectionChange} />;
      case 'ai-practice':
        return <AIPractice />;
      case 'global-practice':
        return <RealGlobalPractice />;
      case 'rankings':
        return <RealRankings />;
      case 'content':
        return <Posts />;
      case 'tournament':
        return <Tournament onBackToHome={() => handleSectionChange('tournament-home')} />;
      case 'global-news':
        return <Podcasts podcastId={podcastId} onNavigatePodcast={handlePodcastNavigate} />;
      case 'debate-guide':
        return <DebateGuide guideId={guideId} onNavigateGuide={handleGuideNavigate} />;
      case 'join-us':
        return <JoinUs />;
      case 'my-progress':
        return <MyProgress />;
      case 'feedback':
        return <Feedback />;
      default:
        return <PracticeHome onNavigate={handleSectionChange} />;
    }
  };

  return (
    <div className="page-shell min-h-screen flex flex-col">
      <Navigation 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        isAuthenticated={!!user}
        onLogout={signOut}
      />
      <main id="main-content" className="container mx-auto px-4 py-10 md:py-14 flex-1 animate-fade-in">
        {renderSection()}
      </main>
      <Footer />
    </div>
  );
};
