import { Menu, LogOut, Bell, ChevronDown } from 'lucide-react';
import { Section } from './Layout';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useStreak } from '@/hooks/useStreak';
import { StreakBadge } from '@/components/StreakCelebration';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavigationProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export const Navigation = ({ activeSection, onSectionChange, isAuthenticated, onLogout }: NavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { streak, practicedToday, streakAtRisk } = useStreak();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<null | 'practice' | 'resource' | 'mydebate'>(null);
  const closeTimeout = useRef<number | null>(null);

  const [hasNewAnnouncements, setHasNewAnnouncements] = useState(false);

  useEffect(() => {
    const loadLatest = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('announcements')
          .select('published_at')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) return;
        const latest = data?.published_at ? new Date(data.published_at).getTime() : 0;
        const lastSeen = parseInt(localStorage.getItem('ann_last_seen_ts') || '0', 10);
        if (latest && latest > lastSeen) setHasNewAnnouncements(true);
      } catch {}
    };
    loadLatest();
  }, []);

  const goToTournament = () => {
    if (isAuthenticated) {
      onSectionChange('tournament-home');
    } else {
      navigate('/tournament');
    }
  };

  const goToAnnouncements = () => {
    if (location.pathname.startsWith('/announcements')) {
      return;
    }
    localStorage.setItem('ann_last_seen_ts', Date.now().toString());
    setHasNewAnnouncements(false);
    navigate('/announcements');
  };

  const handleOpen = (menu: 'practice' | 'resource' | 'mydebate') => {
    if (closeTimeout.current) {
      window.clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setOpenMenu(menu);
  };

  const handleCloseWithDelay = () => {
    if (closeTimeout.current) window.clearTimeout(closeTimeout.current);
    closeTimeout.current = window.setTimeout(() => setOpenMenu(null), 120);
  };

  const navLinkClass = (active: boolean) =>
    cn(
      'text-[0.72rem] font-semibold uppercase tracking-editorial transition-colors inline-flex items-center gap-1 py-1',
      active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
    );

  const dropdownClass =
    'absolute left-0 mt-3 bg-popover border border-border py-1 w-56 z-50 animate-fade-in shadow-elevated-lg';

  const dropdownItemClass =
    'block w-full text-left px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors';

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-[4.25rem]">
          {/* Brand */}
          <a href="/" className="flex items-center gap-3 group">
            <img
              src="/lovable-uploads/38ceb41b-5f98-475f-8a33-19dc45ce9689.png"
              alt="Oxymorona Debate logo"
              className="h-8 w-8 object-contain"
              loading="lazy"
            />
            <div className="leading-none">
              <span className="block font-display text-lg md:text-xl font-semibold tracking-tight">Oxymorona</span>
              <span className="block text-[0.65rem] uppercase tracking-editorial text-muted-foreground mt-1">Debate Society</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-7 ml-auto">
            {/* Practice menu */}
            <div
              className="relative"
              onMouseEnter={() => handleOpen('practice')}
              onMouseLeave={handleCloseWithDelay}
            >
              <button
                onClick={() => onSectionChange('practice-home')}
                className={navLinkClass(['practice-home','ai-practice','global-practice','rankings'].includes(activeSection))}
              >
                Practice <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </button>
              {openMenu === 'practice' && (
                <div className={dropdownClass}>
                  <button onClick={() => onSectionChange('ai-practice')} className={dropdownItemClass}>AI Practice</button>
                  <button onClick={() => onSectionChange('global-practice')} className={dropdownItemClass}>Global Practice</button>
                  <button onClick={() => onSectionChange('rankings')} className={dropdownItemClass}>Rankings</button>
                </div>
              )}
            </div>

            {/* Tournament */}
            <button onClick={goToTournament} className={navLinkClass(['tournament-home','tournament'].includes(activeSection))}>
              Tournament
            </button>

            {/* Resource menu */}
            <div
              className="relative"
              onMouseEnter={() => handleOpen('resource')}
              onMouseLeave={handleCloseWithDelay}
            >
              <button
                onClick={() => onSectionChange('resource-home')}
                className={navLinkClass(['resource-home','content','global-news','debate-guide'].includes(activeSection))}
              >
                Resource <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </button>
              {openMenu === 'resource' && (
                <div className={dropdownClass}>
                  <button onClick={() => onSectionChange('content')} className={dropdownItemClass}>Community Posts</button>
                  <button onClick={() => onSectionChange('global-news')} className={dropdownItemClass}>Podcasts</button>
                  <button onClick={() => onSectionChange('debate-guide')} className={dropdownItemClass}>Debate Guide</button>
                </div>
              )}
            </div>

            {/* My Debate */}
            <div
              className="relative"
              onMouseEnter={() => handleOpen('mydebate')}
              onMouseLeave={handleCloseWithDelay}
            >
              <button
                onClick={() => onSectionChange('mydebate-home')}
                className={navLinkClass(['mydebate-home','my-progress','join-us','feedback'].includes(activeSection))}
              >
                My Debate <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </button>
              {openMenu === 'mydebate' && (
                <div className={dropdownClass}>
                  <button onClick={() => onSectionChange('my-progress')} className={dropdownItemClass}>My Progress</button>
                  <button onClick={() => onSectionChange('join-us')} className={dropdownItemClass}>Join Us</button>
                  <button onClick={() => onSectionChange('feedback')} className={dropdownItemClass}>Feedback</button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 pl-4 ml-1 border-l border-border">
              {isAuthenticated && (
                <StreakBadge
                  streak={streak}
                  practicedToday={practicedToday}
                  streakAtRisk={streakAtRisk}
                  size="sm"
                  onClick={() => navigate('/streak')}
                />
              )}

              <button
                onClick={goToAnnouncements}
                className="relative p-2 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label="View announcements"
              >
                <Bell className="h-5 w-5" />
                {hasNewAnnouncements && (
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-card" />
                )}
              </button>

              <ThemeToggle />

              {isAuthenticated ? (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              ) : (
                <Button asChild size="sm" className="font-medium tracking-wide">
                  <a href="/auth">Sign in</a>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-1 md:hidden">
            {isAuthenticated && (
              <StreakBadge
                streak={streak}
                practicedToday={practicedToday}
                streakAtRisk={streakAtRisk}
                size="sm"
                onClick={() => navigate('/streak')}
              />
            )}
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-muted hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-1 animate-fade-in bg-card/95 backdrop-blur-sm rounded-b-lg mb-2">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="section-label">Updates</span>
              <button onClick={() => { goToAnnouncements(); setIsMobileMenuOpen(false); }} className="relative p-2 rounded-md hover:bg-muted" aria-label="View announcements">
                <Bell className="h-5 w-5" />
                {hasNewAnnouncements && <span className="absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-card" />}
              </button>
            </div>

            <div className="px-4 py-2">
              <button
                onClick={() => { onSectionChange('practice-home'); setIsMobileMenuOpen(false); }}
                className="section-label mb-2 hover:text-primary transition-colors"
              >
                Practice
              </button>
              <div className="space-y-0.5 pl-2 border-l-2 border-primary/20">
                <button onClick={() => { onSectionChange('ai-practice'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2.5 text-sm hover:text-primary transition-colors">AI Practice</button>
                <button onClick={() => { onSectionChange('global-practice'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2.5 text-sm hover:text-primary transition-colors">Global Practice</button>
                <button onClick={() => { onSectionChange('rankings'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2.5 text-sm hover:text-primary transition-colors">Rankings</button>
              </div>
            </div>

            <button onClick={() => { goToTournament(); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 font-display hover:bg-muted transition-colors">Tournament</button>

            <div className="px-4 py-2">
              <button
                onClick={() => { onSectionChange('resource-home'); setIsMobileMenuOpen(false); }}
                className="section-label mb-2 hover:text-primary transition-colors"
              >
                Resource
              </button>
              <div className="space-y-0.5 pl-2 border-l-2 border-primary/20">
                <button onClick={() => { onSectionChange('content'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2.5 text-sm hover:text-primary transition-colors">Community Posts</button>
                <button onClick={() => { onSectionChange('global-news'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2.5 text-sm hover:text-primary transition-colors">Podcasts</button>
                <button onClick={() => { onSectionChange('debate-guide'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2.5 text-sm hover:text-primary transition-colors">Debate Guide</button>
              </div>
            </div>

            <div className="px-4 py-2">
              <button
                onClick={() => { onSectionChange('mydebate-home'); setIsMobileMenuOpen(false); }}
                className="section-label mb-2 hover:text-primary transition-colors"
              >
                My Debate
              </button>
              <div className="space-y-0.5 pl-2 border-l-2 border-primary/20">
                <button onClick={() => { onSectionChange('my-progress'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2.5 text-sm hover:text-primary transition-colors">My Progress</button>
                <button onClick={() => { onSectionChange('join-us'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2.5 text-sm hover:text-primary transition-colors">Join Us</button>
                <button onClick={() => { onSectionChange('feedback'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2.5 text-sm hover:text-primary transition-colors">Feedback</button>
              </div>
            </div>

            <div className="px-4 pt-3 border-t border-border mt-2">
              {isAuthenticated ? (
                <button
                  onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-2 w-full text-left py-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              ) : (
                <Button asChild variant="outline" className="w-full">
                  <a href="/auth">Sign in</a>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
