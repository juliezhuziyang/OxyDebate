import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Medal, Award, Trophy } from 'lucide-react';
import { PageLoader } from '@/components/ui/page-loader';
import { cn } from '@/lib/utils';

interface RankingPlayer {
  id: string;
  user_id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  total_sessions: number;
  total_practice_time: number;
  wins: number;
  losses: number;
  win_rate: number;
  rank: number;
}

export const RealRankings = () => {
  const [rankings, setRankings] = useState<RankingPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'global' | 'regional'>('global');
  const { user, profile } = useAuth();

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      const { data, error } = await supabase
        .from('global_rankings')
        .select('*')
        .limit(50);

      if (error) throw error;
      setRankings(data || []);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getDisplayName = (player: RankingPlayer) => {
    return player.display_name || player.username || 'Anonymous';
  };

  const getInitials = (player: RankingPlayer) => {
    const name = getDisplayName(player);
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return <PageLoader label="Loading rankings..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Global Rankings
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Climb the leaderboard through practice. Rankings use completed sessions — AI and Global — with practice time as the tiebreaker.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-muted rounded-lg p-1 flex gap-1 border border-border">
          <button
            onClick={() => setActiveTab('global')}
            className={cn(
              'px-6 py-2 rounded-md font-medium transition-all text-sm',
              activeTab === 'global'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            Global Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('regional')}
            className={cn(
              'px-6 py-2 rounded-md font-medium transition-all text-sm',
              activeTab === 'regional'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            Regional Rankings
          </button>
        </div>
      </div>

      {activeTab === 'global' ? (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Leaderboard */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border bg-muted/30">
                <h2 className="text-xl font-semibold">Global Leaderboard</h2>
                <p className="text-sm text-muted-foreground">Top debaters worldwide</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Rank</th>
                      <th className="text-left p-4 font-medium">Player</th>
                      <th className="text-center p-4 font-medium">Sessions</th>
                      <th className="text-center p-4 font-medium">Practice Time</th>
                      <th className="text-center p-4 font-medium">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground">
                          No rankings available yet. Start practicing to join the leaderboard!
                        </td>
                      </tr>
                    ) : (
                      rankings.map((player, index) => (
                        <tr
                          key={player.id}
                          className={cn(
                            'border-b border-border hover:bg-muted/40 transition-colors',
                            user && player.user_id === user.id && 'bg-primary/10 border-primary/30'
                          )}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {getRankIcon(player.rank)}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full debate-gradient flex items-center justify-center text-primary-foreground font-bold text-sm">
                                {getInitials(player)}
                              </div>
                              <div>
                                <p className="font-medium">{getDisplayName(player)}</p>
                                {user && player.user_id === user.id && (
                                  <p className="text-xs text-primary">You</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center font-medium">
                            {player.total_sessions}
                          </td>
                          <td className="p-4 text-center text-muted-foreground">
                            {formatTime(player.total_practice_time)}
                          </td>
                          <td className="p-4 text-center">
                            <span className={cn(
                              'font-medium',
                              player.win_rate >= 70 ? 'text-emerald-600 dark:text-emerald-400' :
                              player.win_rate >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                            )}>
                              {player.win_rate}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Stats */}
            {profile && (
              <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Your Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Sessions</span>
                    <span className="font-semibold">{profile.total_sessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Practice Time</span>
                    <span className="font-semibold">{formatTime(profile.total_practice_time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wins/Losses</span>
                    <span className="font-semibold">{profile.wins}/{profile.losses}</span>
                  </div>
                  {rankings.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Global Rank</span>
                      <span className="font-semibold">
                        {rankings.find(p => p.user_id === user?.id)?.rank || 'Unranked'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Players</span>
                  <span className="font-semibold">{rankings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Most Practice Time</span>
                  <span className="font-semibold">
                    {formatTime(Math.max(...rankings.map(p => p.total_practice_time), 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Most Sessions</span>
                  <span className="font-semibold">
                    {Math.max(...rankings.map(p => p.total_sessions), 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Regional Rankings Placeholder */
        <div className="text-center py-12">
          <div className="bg-card rounded-xl border border-border shadow-sm p-8">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Regional Rankings Coming Soon</h3>
            <p className="text-muted-foreground">
              Regional rankings will be available once we have more active users in different regions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};