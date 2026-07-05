import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TournamentLeaderboard } from '@/components/TournamentLeaderboard';
import { TournamentAnnouncementsPublic } from '@/components/tournament/TournamentAnnouncementsPublic';
import {
  PENTALEAGUE_2025,
  PENTALEAGUE_CLOSING_MESSAGE,
  PENTALEAGUE_RESULTS,
  PENTALEAGUE_TIMELINE,
} from '@/constants/pentaleague2025';
import tournamentHero from '@/assets/section-tournament.jpg';
import type { LucideIcon } from 'lucide-react';
import {
  Award,
  Calendar,
  MapPin,
  Medal,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const PentaLeague2025Public = () => {
  const [activeTab, setActiveTab] = useState('results');

  return (
    <div className="animate-fade-in -mx-4 md:-mx-0">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-none md:rounded-2xl border-y md:border border-border shadow-elevated-lg mb-10 md:mb-14">
        <div className="absolute inset-0">
          <img
            src={tournamentHero}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/50 dark:from-background/98 dark:via-background/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative px-6 py-14 md:px-12 md:py-20 lg:py-24 max-w-5xl">
          <div className="flex flex-wrap gap-2 mb-5">
            <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              Tournament Concluded
            </Badge>
            <Badge variant="outline" className="border-muted-foreground/40 bg-background/60 backdrop-blur-sm">
              Registration Closed
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-playfair tracking-tight leading-tight mb-4">
            {PENTALEAGUE_2025.name}
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-6">
            The inaugural Shanghai Debate PentaLeague brought together passionate debaters for
            two days of rigorous Public Forum competition, intellectual exchange, and
            championship-level discourse.
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              {PENTALEAGUE_2025.dates}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              {PENTALEAGUE_2025.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              {PENTALEAGUE_2025.format}
            </span>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-5xl mx-auto px-4 md:px-0">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1 mb-8 md:mb-10">
          <TabsTrigger value="results" className="flex-1 min-w-[7rem] gap-1.5">
            <Trophy className="w-4 h-4" />
            Results
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex-1 min-w-[7rem] gap-1.5">
            Announcements
          </TabsTrigger>
          <TabsTrigger value="standings" className="flex-1 min-w-[7rem] gap-1.5">
            <Medal className="w-4 h-4" />
            Standings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="mt-0 space-y-14 md:space-y-20">
          <ChampionsSection />
          <SpeakerAwardsSection />
          <TimelineSection />
          <ClosingSection />
          <FutureCTA />
        </TabsContent>

        <TabsContent value="announcements" className="mt-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold font-playfair mb-2">Tournament Announcements</h2>
            <p className="text-muted-foreground">
              Official updates from the PentaLeague 2025 organizing committee.
            </p>
          </div>
          <TournamentAnnouncementsPublic />
        </TabsContent>

        <TabsContent value="standings" className="mt-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold font-playfair mb-2">Full Standings</h2>
            <p className="text-muted-foreground">
              Complete team and individual speaker rankings from the tournament.
            </p>
          </div>
          <TournamentLeaderboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ChampionsSection = () => {
  const [champion, runnerUp, third] = PENTALEAGUE_RESULTS.teams;

  return (
    <section>
      <SectionHeader
        icon={Trophy}
        title="Champions"
        subtitle="Celebrating the teams that rose to the top through five rounds of fierce, thoughtful debate."
      />

      {/* Champion spotlight */}
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border-2 border-secondary/50',
          'bg-gradient-to-br from-secondary/15 via-card to-primary/5',
          'p-8 md:p-10 mb-6 shadow-elevated-lg text-center'
        )}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
        <span className="text-4xl mb-3 block">{champion.emoji}</span>
        <p className="text-sm font-semibold uppercase tracking-widest text-secondary mb-2">
          {champion.label}
        </p>
        <h3 className="text-3xl md:text-4xl font-bold font-playfair mb-2">{champion.teamName}</h3>
        <p className="text-lg text-muted-foreground">{champion.members.join(' & ')}</p>
      </div>

      {/* Runner-up & third */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[runnerUp, third].map((team) => (
          <div
            key={team.place}
            className="rounded-2xl border border-border bg-card p-6 md:p-8 text-center hover:border-primary/20 transition-colors shadow-sm"
          >
            <span className="text-3xl mb-2 block">{team.emoji}</span>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {team.label}
            </p>
            <h4 className="text-xl md:text-2xl font-bold font-playfair mb-1">{team.teamName}</h4>
            <p className="text-muted-foreground">{team.members.join(' & ')}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const SpeakerAwardsSection = () => (
  <section>
    <SectionHeader
      icon={Award}
      title="Speaker Awards"
      subtitle="Recognizing individual excellence in argumentation, analysis, and delivery."
    />
    <div className="grid sm:grid-cols-3 gap-4 md:gap-6">
      {PENTALEAGUE_RESULTS.speakers.map((speaker, index) => (
        <div
          key={speaker.place}
          className={cn(
            'rounded-2xl border bg-card p-6 text-center shadow-sm',
            'hover:shadow-md hover:border-primary/20 transition-all',
            index === 0 && 'sm:col-span-3 sm:max-w-md sm:mx-auto border-secondary/40 bg-gradient-to-b from-secondary/10 to-card'
          )}
        >
          <span className="text-3xl mb-2 block">{speaker.emoji}</span>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            {speaker.label}
          </p>
          <p className="text-xl md:text-2xl font-bold font-playfair">{speaker.name}</p>
        </div>
      ))}
    </div>
  </section>
);

const TimelineSection = () => (
  <section>
    <SectionHeader
      icon={Calendar}
      title="Tournament Journey"
      subtitle="From registration to the closing ceremony — a look back at PentaLeague 2025."
    />
    <div className="relative pl-6 md:pl-8 border-l-2 border-primary/20 space-y-8">
      {PENTALEAGUE_TIMELINE.map((item, index) => (
        <div key={index} className="relative">
          <span className="absolute -left-[1.65rem] md:-left-[2.15rem] top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
          <p className="text-sm font-medium text-primary mb-1">{item.date}</p>
          <h4 className="text-lg font-semibold font-playfair mb-1">{item.title}</h4>
          <p className="text-muted-foreground leading-relaxed">{item.description}</p>
        </div>
      ))}
    </div>
  </section>
);

const ClosingSection = () => (
  <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-secondary/5 p-8 md:p-12 text-center">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/5 via-transparent to-transparent" />
    <div className="relative max-w-3xl mx-auto">
      <Sparkles className="w-8 h-8 mx-auto text-secondary mb-4" />
      <h2 className="text-2xl md:text-3xl font-bold font-playfair mb-6">
        Closing Ceremony
      </h2>
      <p className="text-base md:text-lg leading-relaxed text-foreground/90 italic">
        &ldquo;{PENTALEAGUE_CLOSING_MESSAGE}&rdquo;
      </p>
    </div>
  </section>
);

const FutureCTA = () => (
  <section className="text-center py-8 md:py-12 rounded-2xl border border-dashed border-primary/30 bg-primary/5">
    <Trophy className="w-10 h-10 mx-auto text-primary mb-4" />
    <h3 className="text-xl md:text-2xl font-bold font-playfair mb-3">
      See you at the next PentaLeague
    </h3>
    <p className="text-muted-foreground max-w-lg mx-auto mb-6 leading-relaxed">
      PentaLeague 2025 may be over, but the journey continues. Follow our announcements and
      start preparing — the next chapter of Shanghai debate awaits.
    </p>
    <Button variant="outline" asChild className="gap-2">
      <a href="/announcements">Follow community updates</a>
    </Button>
  </section>
);

const SectionHeader = ({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) => (
  <div className="mb-8 md:mb-10">
    <div className="flex items-center gap-2 text-primary mb-2">
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium uppercase tracking-wider">PentaLeague 2025</span>
    </div>
    <h2 className="text-2xl md:text-3xl font-bold font-playfair mb-2">{title}</h2>
    <p className="text-muted-foreground max-w-2xl">{subtitle}</p>
  </div>
);
