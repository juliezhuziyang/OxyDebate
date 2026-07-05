import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Users, Trophy, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Participant {
  id: string;
  displayName: string;
  email?: string;
  userId?: string; // Only available for authenticated users
}

interface MeetingControlsProps {
  isHost: boolean;
  sessionId: string;
  participants: Participant[];
  onSpeakerAssignment: (propSpeakers: string[], oppSpeakers: string[]) => void;
  onResultSubmission: (result: 'prop_wins' | 'opp_wins' | 'tie') => void;
}

export const MeetingControls = ({ 
  isHost, 
  sessionId, 
  participants,
  onSpeakerAssignment, 
  onResultSubmission 
}: MeetingControlsProps) => {
  // Timer state
  const [timerDuration, setTimerDuration] = useState(5 * 60); // Default 5 minutes
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimerDialog, setShowTimerDialog] = useState(false);
  const [minutes, setMinutes] = useState('5');
  const [seconds, setSeconds] = useState('0');
  
  // Speaker assignment state
  const [showSpeakerDialog, setShowSpeakerDialog] = useState(false);
  const [propSpeakers, setPropSpeakers] = useState(['', '', '', '']);
  const [oppSpeakers, setOppSpeakers] = useState(['', '', '', '']);
  
  // Show all participants in dropdowns, but only authenticated ones will have wins/losses tracked
  const allParticipants = participants;
  
  // Debug logging
  console.log('MeetingControls participants:', participants);
  console.log('allParticipants for dropdowns:', allParticipants);
  
  // Result submission state
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [selectedResult, setSelectedResult] = useState<'prop_wins' | 'opp_wins' | 'tie' | null>(null);

  // Timer real-time sync
  useEffect(() => {
    console.log('Setting up timer sync for session:', sessionId);
    
    // First load initial state
    const loadInitialState = async () => {
      try {
        const { data, error } = await supabase
          .from('practice_matches')
          .select('timer_duration_seconds, timer_remaining_seconds, timer_is_running')
          .eq('id', sessionId)
          .single();

        if (error) {
          console.error('Error loading initial timer state:', error);
          return;
        }

        if (data) {
          console.log('Setting initial timer state:', data);
          setTimerDuration(data.timer_duration_seconds || 0);
          setTimerRemaining(data.timer_remaining_seconds || 0);
          setIsTimerRunning(data.timer_is_running || false);
        }
      } catch (error) {
        console.error('Error loading initial timer state:', error);
      }
    };

    loadInitialState();
    
    // Then set up real-time subscription with improved channel name
    const channel = supabase
      .channel(`practice-match-timer:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'practice_matches',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          console.log('REALTIME: Timer update received by', isHost ? 'HOST' : 'PARTICIPANT', ':', payload);
          const newData = payload.new as any;
          
          const newDuration = newData.timer_duration_seconds || 0;
          const newRemaining = newData.timer_remaining_seconds || 0;
          const newRunning = newData.timer_is_running || false;
          
          console.log('REALTIME: Updating timer state from realtime:', { 
            newDuration, 
            newRemaining, 
            newRunning,
            isHost: isHost ? 'HOST' : 'PARTICIPANT'
          });
          
          setTimerDuration(newDuration);
          setTimerRemaining(newRemaining);
          setIsTimerRunning(newRunning);
        }
      )
      .subscribe((status) => {
        console.log('REALTIME: Channel subscription status:', status, 'for', isHost ? 'HOST' : 'PARTICIPANT');
      });

    return () => {
      console.log('Cleaning up timer sync for', isHost ? 'HOST' : 'PARTICIPANT');
      supabase.removeChannel(channel);
    };
  }, [sessionId, isHost]);

  // Remove the duplicate load initial timer state effect since it's now in the sync effect

  // Timer countdown effect
  useEffect(() => {
    console.log('COUNTDOWN EFFECT TRIGGERED:', { 
      isTimerRunning, 
      timerRemaining, 
      isHost,
      sessionId,
      effectTimestamp: new Date().toISOString()
    });
    
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && timerRemaining > 0) {
      console.log('STARTING COUNTDOWN INTERVAL');
      interval = setInterval(async () => {
        console.log('COUNTDOWN TICK - remaining:', timerRemaining);
        const newRemaining = timerRemaining - 1;
        
        // Update local state for immediate UI update
        setTimerRemaining(newRemaining);
        console.log('Local countdown update: newRemaining =', newRemaining);
        
        if (isHost) {
          console.log('Host updating timer in database:', newRemaining);
          try {
            const { error } = await supabase
              .from('practice_matches')
              .update({
                timer_remaining_seconds: newRemaining,
                timer_is_running: newRemaining > 0,
                timer_updated_at: new Date().toISOString()
              })
              .eq('id', sessionId);
              
            if (error) {
              console.error('Error updating timer:', error);
            } else {
              console.log('Database updated successfully with remaining:', newRemaining);
            }
          } catch (error) {
            console.error('Error updating timer:', error);
          }
        }

        // Play bell sound when timer reaches zero
        if (newRemaining === 0) {
          console.log('Timer finished - playing bell sound');
          // Create audio context and play bell sound
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1);
            
            toast({
              title: "Time's Up!",
              description: "The timer has reached zero.",
            });
          } catch (error) {
            console.error('Error playing bell sound:', error);
          }
        }
      }, 1000);
    } else {
      console.log('COUNTDOWN NOT STARTING because:', {
        isTimerRunning,
        timerRemaining,
        reason: !isTimerRunning ? 'timer not running' : 'no time remaining'
      });
    }
    
    return () => {
      if (interval) {
        console.log('CLEARING COUNTDOWN INTERVAL');
        clearInterval(interval);
      }
    };
  }, [isTimerRunning, timerRemaining, isHost, sessionId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSetTimer = async () => {
    const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
    console.log('Setting timer:', { minutes, seconds, totalSeconds });
    
    if (totalSeconds <= 0) {
      toast({
        title: "Invalid Time",
        description: "Please set a valid time duration.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Updating timer in database for session:', sessionId);
      
      // Update local state immediately for responsiveness
      setTimerDuration(totalSeconds);
      setTimerRemaining(totalSeconds);
      setIsTimerRunning(false);
      
      const { data, error } = await supabase
        .from('practice_matches')
        .update({
          timer_duration_seconds: totalSeconds,
          timer_remaining_seconds: totalSeconds,
          timer_is_running: false,
          timer_updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select();

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Timer updated successfully:', data);
      setShowTimerDialog(false);
      
      toast({
        title: "Timer Set",
        description: `Timer set to ${formatTime(totalSeconds)}`,
      });
    } catch (error) {
      console.error('Error setting timer:', error);
      toast({
        title: "Error",
        description: "Failed to set timer",
        variant: "destructive"
      });
    }
  };

  const handleStartTimer = async () => {
    console.log('START BUTTON CLICKED - current state:', { 
      timerRemaining, 
      timerDuration, 
      isTimerRunning,
      sessionId 
    });
    
    if (timerRemaining <= 0) {
      console.log('START BLOCKED: No time remaining');
      toast({
        title: "No Time Set",
        description: "Please set a timer duration first.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Starting timer in database for session:', sessionId);
      
      // Update local state immediately
      setIsTimerRunning(true);
      console.log('Local state updated: isTimerRunning = true');
      
      const { error } = await supabase
        .from('practice_matches')
        .update({
          timer_is_running: true,
          timer_updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error starting timer:', error);
        // Revert local state on error
        setIsTimerRunning(false);
        throw error;
      }
      
      console.log('Timer started successfully in database');
    } catch (error) {
      console.error('Error starting timer:', error);
      toast({
        title: "Error",
        description: "Failed to start timer",
        variant: "destructive"
      });
    }
  };

  const handlePauseTimer = async () => {
    console.log('PAUSE BUTTON CLICKED - current state:', { 
      timerRemaining, 
      isTimerRunning,
      sessionId 
    });
    
    try {
      // Update local state immediately
      setIsTimerRunning(false);
      console.log('Local state updated: isTimerRunning = false');
      
      const { error } = await supabase
        .from('practice_matches')
        .update({
          timer_is_running: false,
          timer_updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
        
      if (error) {
        console.error('Error pausing timer:', error);
        // Revert local state on error
        setIsTimerRunning(true);
        throw error;
      }
      
      console.log('Timer paused successfully');
    } catch (error) {
      console.error('Error pausing timer:', error);
    }
  };

  const handleResetTimer = async () => {
    console.log('RESET BUTTON CLICKED - current state:', { 
      timerRemaining, 
      timerDuration,
      isTimerRunning,
      sessionId 
    });
    
    try {
      // Update local state immediately
      setTimerRemaining(timerDuration);
      setIsTimerRunning(false);
      console.log('Local state updated: timerRemaining =', timerDuration, 'isTimerRunning = false');
      
      const { error } = await supabase
        .from('practice_matches')
        .update({
          timer_remaining_seconds: timerDuration,
          timer_is_running: false,
          timer_updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
        
      if (error) {
        console.error('Error resetting timer:', error);
        throw error;
      }
      
      console.log('Timer reset successfully');
    } catch (error) {
      console.error('Error resetting timer:', error);
    }
  };

  const handleSpeakerSubmit = () => {
    if (!propSpeakers[0] || !oppSpeakers[0]) {
      toast({
        title: "Missing Speakers",
        description: "Please assign at least the first speakers for both sides",
        variant: "destructive"
      });
      return;
    }
    onSpeakerAssignment(propSpeakers, oppSpeakers);
    setShowSpeakerDialog(false);
  };

  const handleResultSubmit = async () => {
    if (!selectedResult) {
      toast({
        title: "Missing Result",
        description: "Please select a result",
        variant: "destructive"
      });
      return;
    }

    // Record wins/losses for authenticated participants
    try {
      // Get ALL authenticated participants (not just speakers) to increment their total sessions
      const allAuthenticatedParticipants = allParticipants
        .filter(p => p.userId)
        .map(p => p.userId);

      // Get participants who actually spoke for win/loss tracking
      const propParticipants = propSpeakers
        .filter(speaker => speaker.trim())
        .map(speaker => allParticipants.find(p => p.displayName === speaker))
        .filter(p => p?.userId);

      const oppParticipants = oppSpeakers
        .filter(speaker => speaker.trim())
        .map(speaker => allParticipants.find(p => p.displayName === speaker))
        .filter(p => p?.userId);

      // First, increment total sessions for ALL authenticated participants
      if (allAuthenticatedParticipants.length > 0) {
        await supabase.rpc('increment_total_sessions_for_participants', { 
          participant_user_ids: allAuthenticatedParticipants 
        });
      }

      // Then update win/loss records based on result
      const updatePromises = [];

      if (selectedResult === 'prop_wins') {
        // Prop team wins
        for (const participant of propParticipants) {
          if (participant?.userId) {
            updatePromises.push(
              supabase.rpc('increment_user_wins', { user_id: participant.userId })
            );
          }
        }
        for (const participant of oppParticipants) {
          if (participant?.userId) {
            updatePromises.push(
              supabase.rpc('increment_user_losses', { user_id: participant.userId })
            );
          }
        }
      } else if (selectedResult === 'opp_wins') {
        // Opp team wins
        for (const participant of oppParticipants) {
          if (participant?.userId) {
            updatePromises.push(
              supabase.rpc('increment_user_wins', { user_id: participant.userId })
            );
          }
        }
        for (const participant of propParticipants) {
          if (participant?.userId) {
            updatePromises.push(
              supabase.rpc('increment_user_losses', { user_id: participant.userId })
            );
          }
        }
      }
      // For ties, no wins/losses are recorded but total sessions still count

      await Promise.all(updatePromises);

      const totalSpeakers = propParticipants.length + oppParticipants.length;
      const resultText = selectedResult === 'tie' ? 'Tie declared' : 
                        selectedResult === 'prop_wins' ? 'Proposition wins' : 'Opposition wins';

      toast({
        title: "Session Complete",
        description: `${resultText}. ${allAuthenticatedParticipants.length} participants' sessions updated, ${totalSpeakers} speakers' records updated.`,
      });
    } catch (error) {
      console.error('Error updating user profiles:', error);
      toast({
        title: "Warning",
        description: "Result saved but user profile updates failed",
        variant: "destructive"
      });
    }

    onResultSubmission(selectedResult);
    setShowResultDialog(false);
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-background/95 backdrop-blur border rounded-lg p-4 shadow-lg">
      <div className="flex items-center gap-4">
        {/* Timer Display - Visible to everyone */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <div className={`text-lg font-mono font-bold min-w-[60px] ${timerRemaining <= 10 && timerRemaining > 0 ? 'text-red-500' : ''}`}>
            {formatTime(timerRemaining)}
          </div>
        </div>

        {/* Host-only controls */}
        {isHost && (
          <>
            <Separator orientation="vertical" className="h-8" />
            
            {/* Timer Controls */}
            <div className="flex items-center gap-2">
              <Dialog open={showTimerDialog} onOpenChange={setShowTimerDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Set Timer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Set Timer Duration</DialogTitle>
                  </DialogHeader>
                  <div className="flex items-center gap-2">
                    <div>
                      <Label htmlFor="minutes">Minutes</Label>
                      <Input
                        id="minutes"
                        type="number"
                        min="0"
                        max="59"
                        value={minutes}
                        onChange={(e) => setMinutes(e.target.value)}
                        className="w-20"
                      />
                    </div>
                    <span className="mt-6">:</span>
                    <div>
                      <Label htmlFor="seconds">Seconds</Label>
                      <Input
                        id="seconds"
                        type="number"
                        min="0"
                        max="59"
                        value={seconds}
                        onChange={(e) => setSeconds(e.target.value)}
                        className="w-20"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setShowTimerDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSetTimer}>
                      Set Timer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartTimer}
                disabled={isTimerRunning || timerRemaining <= 0}
              >
                <Play className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePauseTimer}
                disabled={!isTimerRunning}
              >
                <Pause className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetTimer}
                disabled={timerDuration <= 0}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Speaker Assignment */}
            <Dialog open={showSpeakerDialog} onOpenChange={setShowSpeakerDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Assign Speakers
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Assign Speaker Roles</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">Proposition Team</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {propSpeakers.map((speaker, index) => (
                        <div key={index}>
                          <Label htmlFor={`prop-${index}`}>
                            {index === 0 ? '1st Speaker *' : `${index + 1}${index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'} Speaker`}
                          </Label>
                          <Select
                            value={speaker}
                            onValueChange={(value) => {
                              const newSpeakers = [...propSpeakers];
                              newSpeakers[index] = value;
                              setPropSpeakers(newSpeakers);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : '4th'} speaker`} />
                            </SelectTrigger>
                            <SelectContent>
                              {allParticipants.map((participant) => (
                                <SelectItem key={participant.id} value={participant.displayName}>
                                  {participant.displayName} {participant.userId ? '(Account)' : '(Guest)'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">Opposition Team</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {oppSpeakers.map((speaker, index) => (
                        <div key={index}>
                          <Label htmlFor={`opp-${index}`}>
                            {index === 0 ? '1st Speaker *' : `${index + 1}${index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'} Speaker`}
                          </Label>
                          <Select
                            value={speaker}
                            onValueChange={(value) => {
                              const newSpeakers = [...oppSpeakers];
                              newSpeakers[index] = value;
                              setOppSpeakers(newSpeakers);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : '4th'} speaker`} />
                            </SelectTrigger>
                            <SelectContent>
                              {allParticipants.map((participant) => (
                                <SelectItem key={participant.id} value={participant.displayName}>
                                  {participant.displayName} {participant.userId ? '(Account)' : '(Guest)'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setShowSpeakerDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSpeakerSubmit}>
                    Save Speaker Assignments
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Result Submission */}
            <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trophy className="w-4 h-4 mr-2" />
                  Declare Result
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Declare Debate Result</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Label>Select the winner:</Label>
                  <Select value={selectedResult || ''} onValueChange={(value) => setSelectedResult(value as 'prop_wins' | 'opp_wins' | 'tie')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prop_wins">Proposition Wins</SelectItem>
                      <SelectItem value="opp_wins">Opposition Wins</SelectItem>
                      <SelectItem value="tie">Tie/Draw</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setShowResultDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleResultSubmit}>
                    Submit Result
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
};