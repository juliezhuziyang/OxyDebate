import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Settings, Trophy, Users, Clock, Megaphone, Trash2, Edit } from 'lucide-react';
import { TournamentLeaderboard } from './TournamentLeaderboard';
import { TournamentAnnouncements } from './TournamentAnnouncements';

import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Round {
  id: string;
  round_number: number;
  round_name: string;
  is_active: boolean;
}

interface Match {
  id: string;
  round_id: string;
  prop_team_name: string;
  opp_team_name: string;
  winner_team: string | null;
  round_name?: string;
}

interface Team {
  team_name: string;
  name: string;
  partner_name: string;
  email: string;
  partner_email: string;
}

interface SpeakerScore {
  id: string;
  match_id: string;
  speaker_name: string;
  team_name: string;
  speaker_score: number;
}

export const TournamentAdmin: React.FC = () => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [speakerScores, setSpeakerScores] = useState<SpeakerScore[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Form states
  const [newRound, setNewRound] = useState({ round_number: '', round_name: '' });
  const [newMatch, setNewMatch] = useState({ round_id: '', prop_team: '', opp_team: '' });
  const [scoreUpdate, setScoreUpdate] = useState({ round_id: '', match_id: '', speaker_name: '', team_name: '', score: '' });
  const [matchResult, setMatchResult] = useState({ round_id: '', match_id: '', winner: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch rounds
      const { data: roundsData, error: roundsError } = await supabase
        .from('tournament_rounds')
        .select('*')
        .order('round_number', { ascending: true });
      
      if (roundsError) throw roundsError;

      // Fetch matches with round names
      const { data: matchesData, error: matchesError } = await supabase
        .from('tournament_matches')
        .select(`
          *,
          tournament_rounds(round_name)
        `)
        .order('created_at', { ascending: false });
      
      if (matchesError) throw matchesError;

      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('tournament_debaters')
        .select('team_name, name, partner_name, email, partner_email')
        .order('team_name');
      
      if (teamsError) throw teamsError;

      // Fetch speaker scores
      const { data: scoresData, error: scoresError } = await supabase
        .from('tournament_speaker_scores')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (scoresError) throw scoresError;

      setRounds(roundsData || []);
      setMatches(matchesData?.map(match => ({
        ...match,
        round_name: (match as any).tournament_rounds?.round_name
      })) || []);
      setTeams(teamsData || []);
      setSpeakerScores(scoresData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load tournament data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createRound = async () => {
    if (!newRound.round_number || !newRound.round_name) {
      toast({
        title: "Error",
        description: "Please fill in all round details",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('tournament_rounds')
        .insert({
          round_number: parseInt(newRound.round_number),
          round_name: newRound.round_name,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Round created successfully"
      });

      setNewRound({ round_number: '', round_name: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating round:', error);
      toast({
        title: "Error",
        description: "Failed to create round",
        variant: "destructive"
      });
    }
  };

  const createMatch = async () => {
    if (!newMatch.round_id || !newMatch.prop_team || !newMatch.opp_team) {
      toast({
        title: "Error",
        description: "Please fill in all match details",
        variant: "destructive"
      });
      return;
    }

    if (newMatch.prop_team === newMatch.opp_team) {
      toast({
        title: "Error",
        description: "A team cannot play against itself",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('tournament_matches')
        .insert({
          round_id: newMatch.round_id,
          prop_team_name: newMatch.prop_team,
          opp_team_name: newMatch.opp_team
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Match created successfully"
      });

      setNewMatch({ round_id: '', prop_team: '', opp_team: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        title: "Error",
        description: "Failed to create match",
        variant: "destructive"
      });
    }
  };

  const updateSpeakerScore = async () => {
    if (!scoreUpdate.match_id || !scoreUpdate.speaker_name || !scoreUpdate.team_name || !scoreUpdate.score) {
      toast({
        title: "Error",
        description: "Please fill in all score details",
        variant: "destructive"
      });
      return;
    }

    const score = parseFloat(scoreUpdate.score);
    if (isNaN(score) || score < 0 || score > 100) {
      toast({
        title: "Error",
        description: "Please enter a valid score between 0 and 100",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if score already exists for this speaker in this match
      const { data: existingScore, error: checkError } = await supabase
        .from('tournament_speaker_scores')
        .select('id')
        .eq('match_id', scoreUpdate.match_id)
        .eq('speaker_name', scoreUpdate.speaker_name)
        .eq('team_name', scoreUpdate.team_name)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingScore) {
        // Update existing score
        const { error } = await supabase
          .from('tournament_speaker_scores')
          .update({ speaker_score: score })
          .eq('id', existingScore.id);

        if (error) throw error;
      } else {
        // Insert new score
        const { error } = await supabase
          .from('tournament_speaker_scores')
          .insert({
            match_id: scoreUpdate.match_id,
            speaker_name: scoreUpdate.speaker_name,
            team_name: scoreUpdate.team_name,
            speaker_score: score
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Speaker score updated successfully"
      });

      setScoreUpdate({ round_id: '', match_id: '', speaker_name: '', team_name: '', score: '' });
      fetchData();
    } catch (error) {
      console.error('Error updating speaker score:', error);
      toast({
        title: "Error",
        description: "Failed to update speaker score",
        variant: "destructive"
      });
    }
  };

  const updateMatchResult = async () => {
    if (!matchResult.match_id || !matchResult.winner) {
      toast({
        title: "Error",
        description: "Please select a match and winner",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('tournament_matches')
        .update({ winner_team: matchResult.winner })
        .eq('id', matchResult.match_id);

      if (error) throw error;

      const selectedMatch = matches.find(m => m.id === matchResult.match_id);
      const isRevision = selectedMatch?.winner_team !== null;

      toast({
        title: "Success",
        description: isRevision ? "Match result revised successfully" : "Match result updated successfully"
      });

      setMatchResult({ round_id: '', match_id: '', winner: '' });
      fetchData();
    } catch (error) {
      console.error('Error updating match result:', error);
      toast({
        title: "Error",
        description: "Failed to update match result",
        variant: "destructive"
      });
    }
  };

  const deleteMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('tournament_matches')
        .delete()
        .eq('id', matchId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Match deleted successfully"
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting match:', error);
      toast({
        title: "Error",
        description: "Failed to delete match",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Tournament Admin</h2>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading admin panel...</p>
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
        <Settings className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Tournament Admin</h2>
      </div>

      <Tabs defaultValue="rounds" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="rounds">Rounds</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="scores">Scores</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="rounds">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Round
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="round-number">Round Number</Label>
                  <Input
                    id="round-number"
                    type="number"
                    placeholder="1"
                    value={newRound.round_number}
                    onChange={(e) => setNewRound(prev => ({ ...prev, round_number: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="round-name">Round Name</Label>
                  <Input
                    id="round-name"
                    placeholder="e.g., Preliminary Round 1"
                    value={newRound.round_name}
                    onChange={(e) => setNewRound(prev => ({ ...prev, round_name: e.target.value }))}
                  />
                </div>
                <Button onClick={createRound} className="w-full">
                  Create Round
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Existing Rounds
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rounds.length === 0 ? (
                  <p className="text-muted-foreground">No rounds created yet</p>
                ) : (
                  <div className="space-y-2">
                    {rounds.map((round) => (
                      <div key={round.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">{round.round_name}</div>
                          <div className="text-sm text-muted-foreground">Round {round.round_number}</div>
                        </div>
                        <Badge variant={round.is_active ? "default" : "secondary"}>
                          {round.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="matches">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Create New Match
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="match-round">Round</Label>
                    <Select value={newMatch.round_id} onValueChange={(value) => setNewMatch(prev => ({ ...prev, round_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select round" />
                      </SelectTrigger>
                      <SelectContent>
                        {rounds.map((round) => (
                          <SelectItem key={round.id} value={round.id}>
                            {round.round_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="prop-team">Proposition Team</Label>
                    <Select value={newMatch.prop_team} onValueChange={(value) => setNewMatch(prev => ({ ...prev, prop_team: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select prop team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.team_name} value={team.team_name}>
                            {team.team_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="opp-team">Opposition Team</Label>
                    <Select value={newMatch.opp_team} onValueChange={(value) => setNewMatch(prev => ({ ...prev, opp_team: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select opp team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.team_name} value={team.team_name}>
                            {team.team_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={createMatch} className="w-full">
                  Create Match
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tournament Matches</CardTitle>
              </CardHeader>
              <CardContent>
                {matches.length === 0 ? (
                  <p className="text-muted-foreground">No matches created yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Round</TableHead>
                        <TableHead>Proposition</TableHead>
                        <TableHead>Opposition</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matches.map((match) => (
                        <TableRow key={match.id}>
                          <TableCell>{match.round_name}</TableCell>
                          <TableCell className="font-medium">{match.prop_team_name}</TableCell>
                          <TableCell className="font-medium">{match.opp_team_name}</TableCell>
                          <TableCell>
                            {match.winner_team ? (
                              <Badge variant="outline">
                                {match.winner_team === 'prop' ? match.prop_team_name : match.opp_team_name} wins
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteMatch(match.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scores">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Update Speaker Scores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div>
                  <Label htmlFor="score-round">Round</Label>
                  <Select value={scoreUpdate.round_id} onValueChange={(value) => setScoreUpdate(prev => ({ ...prev, round_id: value, match_id: '', team_name: '', speaker_name: '' }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select round" />
                    </SelectTrigger>
                    <SelectContent>
                      {rounds.map((round) => (
                        <SelectItem key={round.id} value={round.id}>
                          {round.round_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="score-match">Match</Label>
                  <Select 
                    value={scoreUpdate.match_id} 
                    onValueChange={(value) => setScoreUpdate(prev => ({ ...prev, match_id: value, team_name: '', speaker_name: '' }))}
                    disabled={!scoreUpdate.round_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select match" />
                    </SelectTrigger>
                    <SelectContent>
                      {matches
                        .filter(match => match.round_id === scoreUpdate.round_id)
                        .map((match) => (
                          <SelectItem key={match.id} value={match.id}>
                            {match.prop_team_name} vs {match.opp_team_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="speaker-team">Team</Label>
                  <Select 
                    value={scoreUpdate.team_name} 
                    onValueChange={(value) => setScoreUpdate(prev => ({ ...prev, team_name: value, speaker_name: '' }))}
                    disabled={!scoreUpdate.match_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {scoreUpdate.match_id && (() => {
                        const selectedMatch = matches.find(m => m.id === scoreUpdate.match_id);
                        if (!selectedMatch) return [];
                        return [
                          <SelectItem key="prop" value={selectedMatch.prop_team_name}>
                            {selectedMatch.prop_team_name}
                          </SelectItem>,
                          <SelectItem key="opp" value={selectedMatch.opp_team_name}>
                            {selectedMatch.opp_team_name}
                          </SelectItem>
                        ];
                      })()}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="speaker-name">Speaker</Label>
                  <Select 
                    value={scoreUpdate.speaker_name} 
                    onValueChange={(value) => setScoreUpdate(prev => ({ ...prev, speaker_name: value }))}
                    disabled={!scoreUpdate.team_name}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select speaker" />
                    </SelectTrigger>
                    <SelectContent>
                      {scoreUpdate.team_name && (() => {
                        const selectedTeam = teams.find(t => t.team_name === scoreUpdate.team_name);
                        if (!selectedTeam) return [];
                        return [
                          <SelectItem key="speaker1" value={selectedTeam.name}>
                            <div className="flex flex-col">
                              <span>{selectedTeam.name}</span>
                              <span className="text-xs text-muted-foreground">{selectedTeam.email}</span>
                            </div>
                          </SelectItem>,
                          <SelectItem key="speaker2" value={selectedTeam.partner_name}>
                            <div className="flex flex-col">
                              <span>{selectedTeam.partner_name}</span>
                              <span className="text-xs text-muted-foreground">{selectedTeam.partner_email}</span>
                            </div>
                          </SelectItem>
                        ];
                      })()}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="speaker-score">Score (0-100)</Label>
                  <Input
                    id="speaker-score"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="75.5"
                    value={scoreUpdate.score}
                    onChange={(e) => setScoreUpdate(prev => ({ ...prev, score: e.target.value }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={updateSpeakerScore} className="w-full">
                    Update Score
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Update & Revise Match Results
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                You can set results for new matches or revise previously announced results.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="result-round">Round</Label>
                  <Select value={matchResult.round_id} onValueChange={(value) => setMatchResult(prev => ({ ...prev, round_id: value, match_id: '', winner: '' }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select round" />
                    </SelectTrigger>
                    <SelectContent>
                      {rounds.map((round) => (
                        <SelectItem key={round.id} value={round.id}>
                          {round.round_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="result-match">Match</Label>
                  <Select 
                    value={matchResult.match_id} 
                    onValueChange={(value) => {
                      const selectedMatch = matches.find(m => m.id === value);
                      setMatchResult(prev => ({ 
                        ...prev, 
                        match_id: value,
                        winner: selectedMatch?.winner_team || ''
                      }));
                    }}
                    disabled={!matchResult.round_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select match" />
                    </SelectTrigger>
                    <SelectContent>
                      {matches
                        .filter(match => match.round_id === matchResult.round_id)
                        .map((match) => (
                          <SelectItem key={match.id} value={match.id}>
                            {match.prop_team_name} vs {match.opp_team_name}
                            {match.winner_team && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                (Result set)
                              </span>
                            )}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="winner">Winner</Label>
                  <Select value={matchResult.winner} onValueChange={(value) => setMatchResult(prev => ({ ...prev, winner: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select winner" />
                    </SelectTrigger>
                    <SelectContent>
                      {matchResult.match_id && (() => {
                        const selectedMatch = matches.find(m => m.id === matchResult.match_id);
                        if (!selectedMatch) return [];
                        return [
                          <SelectItem key="prop" value="prop">
                            {selectedMatch.prop_team_name} (Proposition)
                          </SelectItem>,
                          <SelectItem key="opp" value="opp">
                            {selectedMatch.opp_team_name} (Opposition)
                          </SelectItem>
                        ];
                      })()}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={updateMatchResult} className="w-full">
                    {(() => {
                      const selectedMatch = matches.find(m => m.id === matchResult.match_id);
                      return selectedMatch?.winner_team ? 'Revise Result' : 'Set Result';
                    })()}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements">
          <TournamentAnnouncements />
        </TabsContent>
      </Tabs>
    </div>
  );
};