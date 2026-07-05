import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Users, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeamLeaderboard {
  team_name: string;
  captain_name: string;
  partner_name: string;
  wins: number;
  losses: number;
  avg_team_score: number;
  team_rank: number;
}

interface IndividualLeaderboard {
  speaker_name: string;
  team_name: string;
  avg_score: number;
  rounds_spoken: number;
  individual_rank: number;
}

export const TournamentLeaderboard: React.FC = () => {
  const [teamLeaderboard, setTeamLeaderboard] = useState<TeamLeaderboard[]>([]);
  const [individualLeaderboard, setIndividualLeaderboard] = useState<IndividualLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);
      
      // Fetch team leaderboard
      const { data: teamData, error: teamError } = await supabase
        .from('tournament_team_leaderboard')
        .select('*')
        .order('team_rank', { ascending: true });

      if (teamError) throw teamError;

      // Fetch individual leaderboard
      const { data: individualData, error: individualError } = await supabase
        .from('tournament_individual_leaderboard')
        .select('*')
        .order('individual_rank', { ascending: true });

      if (individualError) throw individualError;

      setTeamLeaderboard(teamData || []);
      setIndividualLeaderboard(individualData || []);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
      toast({
        title: "Error",
        description: "Failed to load tournament leaderboards",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="font-semibold text-muted-foreground">#{rank}</span>;
  };

  const getWinRateColor = (wins: number, losses: number) => {
    const total = wins + losses;
    if (total === 0) return 'bg-muted';
    const winRate = wins / total;
    if (winRate >= 0.7) return 'bg-green-500';
    if (winRate >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Tournament Leaderboard</h2>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading leaderboards...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Trophy className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Tournament Leaderboard</h2>
      </div>

      <Tabs defaultValue="teams" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Rankings
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Individual Rankings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>Team Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              {teamLeaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No team results yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead className="text-center">W-L</TableHead>
                      <TableHead className="text-center">Win Rate</TableHead>
                      <TableHead className="text-center">Avg Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamLeaderboard.map((team) => {
                      const total = team.wins + team.losses;
                      const winRate = total > 0 ? (team.wins / total * 100).toFixed(1) : '0.0';
                      
                      return (
                        <TableRow key={team.team_name}>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              {getRankIcon(team.team_rank)}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {team.team_name}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{team.captain_name}</div>
                              <div className="text-muted-foreground">{team.partner_name}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">
                              {team.wins}-{team.losses}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div 
                                className={`w-3 h-3 rounded-full ${getWinRateColor(team.wins, team.losses)}`}
                              />
                              {winRate}%
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            {Number(team.avg_team_score).toFixed(1)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual">
          <Card>
            <CardHeader>
              <CardTitle>Individual Speaker Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              {individualLeaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No individual scores yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Speaker</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-center">Avg Score</TableHead>
                      <TableHead className="text-center">Rounds</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {individualLeaderboard.map((speaker) => (
                      <TableRow key={`${speaker.speaker_name}-${speaker.team_name}`}>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {getRankIcon(speaker.individual_rank)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {speaker.speaker_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {speaker.team_name}
                        </TableCell>
                        <TableCell className="text-center font-semibold text-lg">
                          {Number(speaker.avg_score).toFixed(1)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">
                            {speaker.rounds_spoken}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};