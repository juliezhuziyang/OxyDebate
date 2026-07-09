import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { Section } from './Layout';
import { cn } from '@/lib/utils';
import { PageHero } from './PageHero';

import aiPracticeImg from '@/assets/section-ai-practice.jpg';
import globalPracticeImg from '@/assets/section-global-practice.jpg';
import rankingsImg from '@/assets/section-rankings.jpg';
import tournamentImg from '@/assets/section-tournament.jpg';
import postsImg from '@/assets/section-posts.jpg';
import newsImg from '@/assets/section-news.jpg';
import guideImg from '@/assets/section-guide.jpg';
import mydebateImg from '@/assets/section-mydebate.jpg';
import aiHeroImg from '@/assets/section-ai-hero.jpg';
import resourceImg from '@/assets/section-resource.jpg';

interface SectionItem {
  id: Section;
  title: string;
  description: string;
  image: string;
}

interface SectionHomeProps {
  title: string;
  subtitle: string;
  heroImage: string;
  items: SectionItem[];
  onNavigate: (section: Section) => void;
}

const SectionHome = ({ title, subtitle, heroImage, items, onNavigate }: SectionHomeProps) => {
  return (
    <div className="space-y-12 md:space-y-16 animate-fade-in">
      <div className="relative overflow-hidden border border-border">
        <img src={heroImage} alt={title} className="w-full h-52 md:h-64 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
          <PageHero
            eyebrow="Section"
            title={title}
            description={subtitle}
            className="border-0 bg-transparent shadow-none p-0 after:hidden"
          />
        </div>
      </div>

      <div className={cn(
        'grid gap-5 md:gap-6',
        items.length === 1 ? 'grid-cols-1 max-w-3xl' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      )}>
        {items.map((item) => (
          <article key={item.id} className={cn('group feature-card', items.length === 1 && 'md:flex-row md:max-w-none')}>
            <div className={cn(
              'overflow-hidden bg-muted/30',
              items.length === 1 ? 'md:w-2/5 h-48 md:h-auto' : 'h-40'
            )}>
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                loading="lazy"
              />
            </div>
            <div className={cn(
              'flex flex-col flex-1 p-5 md:p-6 border-t md:border-t-0 md:border-l border-border',
              items.length === 1 && 'md:justify-center'
            )}>
              <p className="editorial-eyebrow mb-2">Module</p>
              <h2 className="text-xl font-display font-semibold mb-2 group-hover:text-primary transition-colors">{item.title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-5">{item.description}</p>
              <Button onClick={() => onNavigate(item.id)} variant="outline" className="gap-2 w-fit">
                Open {item.title} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

/* ─── Pre-configured section home pages ─── */

export const PracticeHome = ({ onNavigate }: { onNavigate: (s: Section) => void }) => (
  <SectionHome
    title="Practice"
    subtitle="Sharpen your debate skills with AI-powered drills and real opponents from around the world."
    heroImage={aiHeroImg}
    items={[
      {
        id: 'ai-practice',
        title: 'AI Practice',
        description: 'Train with our AI debate coach. Get instant feedback on your arguments, rebuttals, and speaking structure. Perfect for solo practice sessions anytime.',
        image: aiPracticeImg,
      },
      {
        id: 'global-practice',
        title: 'Global Practice',
        description: 'Match with real debaters from around the world. Join live practice rooms, challenge opponents, and improve through authentic debate experience.',
        image: globalPracticeImg,
      },
      {
        id: 'rankings',
        title: 'Rankings',
        description: 'See where you stand among the global community. Track your rating, win streaks, and climb the leaderboard as you improve.',
        image: rankingsImg,
      },
    ]}
    onNavigate={onNavigate}
  />
);

export const TournamentHome = ({ onNavigate }: { onNavigate: (s: Section) => void }) => (
  <SectionHome
    title="Tournament"
    subtitle="Explore competitive debate events — past championships, results, and future opportunities."
    heroImage={tournamentImg}
    items={[
      {
        id: 'tournament',
        title: 'Shanghai Debate PentaLeague 2025',
        description: 'The inaugural PentaLeague has concluded. View championship results, speaker awards, full standings, and official tournament announcements.',
        image: tournamentImg,
      },
    ]}
    onNavigate={onNavigate}
  />
);

export const ResourceHome = ({ onNavigate }: { onNavigate: (s: Section) => void }) => (
  <SectionHome
    title="Resources"
    subtitle="Level up your knowledge with community content, global news, and expert debate guides."
    heroImage={resourceImg}
    items={[
      {
        id: 'content',
        title: 'Posts & Podcasts',
        description: 'Read insightful articles, listen to debate podcasts, and share your own content with the community. A space for ideas and discussion.',
        image: postsImg,
      },
      {
        id: 'global-news',
        title: 'Global News',
        description: 'Stay informed with the latest debate events, competitions, and developments from around the world. Never miss an important update.',
        image: newsImg,
      },
      {
        id: 'debate-guide',
        title: 'Debate Guide',
        description: 'Learn debate fundamentals, advanced strategies, and format-specific tips through our comprehensive guide library.',
        image: guideImg,
      },
    ]}
    onNavigate={onNavigate}
  />
);

export const MyDebateHome = ({ onNavigate }: { onNavigate: (s: Section) => void }) => (
  <SectionHome
    title="My Debate"
    subtitle="Track your journey, join the team, and share your feedback."
    heroImage={mydebateImg}
    items={[
      {
        id: 'my-progress',
        title: 'My Progress',
        description: 'View your practice history, session stats, scores, and improvement over time. A personal dashboard for your debate journey.',
        image: mydebateImg,
      },
      {
        id: 'join-us',
        title: 'Join Us',
        description: 'Interested in becoming part of the Oxymorona team? Apply as a debater, judge, or contributor and help grow the community.',
        image: resourceImg,
      },
      {
        id: 'feedback',
        title: 'Feedback',
        description: 'Help us improve! Share your thoughts, report issues, or suggest new features. Your voice shapes the future of this platform.',
        image: aiPracticeImg,
      },
    ]}
    onNavigate={onNavigate}
  />
);
