import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Users, Globe, Star, Calendar, Play, Trash2, Edit3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { JoinSession } from './JoinSession';
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';

interface PracticeMatch {
  id: string;
  creator_user_id: string;
  opponent_user_id?: string;
  topic_id?: string;
  topic_title: string;
  status: string;
  difficulty: string;
  start_time?: string;
  end_time?: string;
  winner_user_id?: string;
  recording_url?: string;
  created_at: string;
  creator_profile?: {
    display_name: string;
    username: string;
    avatar_url?: string;
    rating: number;
  };
  opponent_profile?: {
    display_name: string;
    username: string;
    avatar_url?: string;
    rating: number;
  };
}

interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
}

export const RealGlobalPractice = () => {
  const [activeTab, setActiveTab] = useState<'find' | 'create' | 'attended'>('find');
  const [matches, setMatches] = useState<PracticeMatch[]>([]);
  const [attendedSessions, setAttendedSessions] = useState<PracticeMatch[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinedSessionId, setJoinedSessionId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCustomTopic, setShowCustomTopic] = useState(false);
  const [rescheduleSessionId, setRescheduleSessionId] = useState<string | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState('');
  
  // Create session form
  const [newSession, setNewSession] = useState({
    topic_id: '',
    topic_title: '',
    difficulty: 'beginner',
    start_time: '',
    description: ''
  });
  
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchMatches();
    fetchTopics();
    fetchAttendedSessions();
  }, []);

  const fetchMatches = async () => {
    try {
      console.warn('🔍 FETCHING MATCHES - check this log!');
      const { data, error } = await supabase
        .from('practice_matches')
        .select(`
          *,
          creator_profile:profiles!practice_matches_creator_user_id_fkey (
            display_name,
            username,
            avatar_url,
            rating
          )
        `)
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Raw matches data:', data);
      
      // Auto-end expired sessions that are still active/waiting
      const sessionsToAutoEnd = (data as any)?.filter((match: PracticeMatch) => {
        if (!match.start_time) return false;
        const startTime = new Date(match.start_time);
        const now = new Date();
        const sessionExpired = now.getTime() - startTime.getTime() > 2 * 60 * 60 * 1000; // 2 hours
        return sessionExpired && (match.status === 'active' || match.status === 'waiting') && match.opponent_user_id;
      }) || [];

      // Auto-end expired sessions with participants
      if (sessionsToAutoEnd.length > 0) {
        try {
          for (const session of sessionsToAutoEnd) {
            await supabase
              .from('practice_matches')
              .update({ 
                status: 'completed',
                end_time: new Date().toISOString()
              })
              .eq('id', session.id);
          }
          console.log(`Auto-ended ${sessionsToAutoEnd.length} expired sessions`);
        } catch (error) {
          console.error('Error auto-ending sessions:', error);
        }
      }

      // Filter out sessions that have expired (2 hours after start time)
      // Only show expired sessions if user created or joined them
      const filteredMatches = (data as any)?.filter((match: PracticeMatch) => {
        if (!match.start_time) return true;
        
        const startTime = new Date(match.start_time);
        const now = new Date();
        const sessionExpired = now.getTime() - startTime.getTime() > 2 * 60 * 60 * 1000; // 2 hours
        
        console.log('Session filter check:', {
          id: match.id,
          start_time: match.start_time,
          startTime: startTime.toISOString(),
          now: now.toISOString(),
          sessionExpired,
          isCreatorOrOpponent: match.creator_user_id === user?.id || match.opponent_user_id === user?.id
        });
        
        // If session is expired (2+ hours after start), don't show it
        if (sessionExpired) {
          return false;
        }
        
        return true;
      }) || [];
      
      console.log('Filtered matches:', filteredMatches);
      setMatches(filteredMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to load practice sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchAttendedSessions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('practice_matches')
        .select(`
          *,
          creator_profile:profiles!practice_matches_creator_user_id_fkey (
            display_name,
            username,
            avatar_url,
            rating
          ),
          opponent_profile:profiles!practice_matches_opponent_user_id_fkey (
            display_name,
            username,
            avatar_url,
            rating
          )
        `)
        .or(`creator_user_id.eq.${user.id},opponent_user_id.eq.${user.id}`)
        .in('status', ['completed', 'active'])
        .order('end_time', { ascending: false });

      if (error) throw error;
      
      // Filter to include completed sessions and expired active sessions (2+ hours after start)
      const attendedSessions = (data as any)?.filter((session: PracticeMatch) => {
        if (session.status === 'completed') return true;
        
        // Check if active session has expired (2+ hours after start)
        if (session.status === 'active' && session.start_time) {
          const startTime = new Date(session.start_time);
          const now = new Date();
          const sessionExpired = now.getTime() - startTime.getTime() > 2 * 60 * 60 * 1000; // 2 hours
          return sessionExpired;
        }
        
        return false;
      }) || [];
      
      setAttendedSessions(attendedSessions);
    } catch (error) {
      console.error('Error fetching attended sessions:', error);
    }
  };

  const createSession = async () => {
    if (!user || !newSession.topic_title || !newSession.difficulty || !newSession.start_time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields including start time",
        variant: "destructive",
      });
      return;
    }

    console.log('🚀 CREATING SESSION WITH DATA:', {
      topic_title: newSession.topic_title,
      difficulty: newSession.difficulty,
      start_time: newSession.start_time,
      userLocalTime: new Date(newSession.start_time),
      currentTime: new Date()
    });
    console.warn('📝 Creating session - check this log!');

    // Parse user input as Eastern Time and compare with current Eastern Time
    const easternTimeZone = 'America/New_York';
    const currentUTC = new Date();
    
    // Parse the user input and treat it as Eastern Time
    // User enters "2025-07-29T23:48" meaning "23:48 Eastern Time on July 29th"
    const [datePart, timePart] = newSession.start_time.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    
    // Create a date object representing the time components (this will be in local timezone by default)
    // But we'll treat these components as if they represent Eastern Time
    const easternTimeDate = new Date(year, month - 1, day, hour, minute, 0);
    
    // Now use fromZonedTime to convert this Eastern time to UTC
    // fromZonedTime treats the input date as being in the specified timezone
    const startTimeInUTC = fromZonedTime(easternTimeDate, easternTimeZone);
    
    console.log('🔍 CORRECT TIMEZONE CONVERSION:');
    console.log('1. User input:', newSession.start_time);
    console.log('2. Current UTC:', currentUTC.toISOString());
    console.log('3. Current Eastern formatted:', formatInTimeZone(currentUTC, easternTimeZone, 'yyyy-MM-dd HH:mm:ss zzz'));
    console.log('4. Created local date object:', easternTimeDate.toISOString(), '(ignoring timezone)');
    console.log('5. Treating as Eastern, converted to UTC:', startTimeInUTC.toISOString());
    console.log('6. Verify back to Eastern:', formatInTimeZone(startTimeInUTC, easternTimeZone, 'yyyy-MM-dd HH:mm:ss zzz'));
    
    const timeDiff = startTimeInUTC.getTime() - currentUTC.getTime();
    const timeDiffMinutes = timeDiff / (1000 * 60);
    
    console.log('8. Time difference (minutes):', timeDiffMinutes);
    
    if (timeDiff < -5 * 60 * 1000) { // More than 5 minutes in the past
      toast({
        title: "Warning", 
        description: `Start time cannot be more than 5 minutes in the past. Current Eastern Time: ${formatInTimeZone(currentUTC, easternTimeZone, 'HH:mm')}`,
        variant: "destructive",
      });
      return;
    }

    try {
      // If custom topic, save it to topics table first
      let topicId = newSession.topic_id;
      if (showCustomTopic && newSession.topic_title) {
        const { data: newTopic, error: topicError } = await supabase
          .from('topics')
          .insert({
            title: newSession.topic_title,
            description: `Custom topic created by user`,
            category: 'custom',
            difficulty: newSession.difficulty,
            is_custom: true,
            created_by_user_id: user.id
          })
          .select()
          .single();

        if (topicError) throw topicError;
        topicId = newTopic.id;
        
        // Refresh topics list
        fetchTopics();
      }

      const { error } = await supabase
        .from('practice_matches')
        .insert({
          creator_user_id: user.id,
          topic_id: topicId || null,
          topic_title: newSession.topic_title,
          difficulty: newSession.difficulty,
          start_time: startTimeInUTC.toISOString(),
          status: 'waiting'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Practice session created! Waiting for opponents...",
      });

      setNewSession({
        topic_id: '',
        topic_title: '',
        difficulty: 'beginner',
        start_time: '',
        description: ''
      });
      setShowCustomTopic(false);

      fetchMatches();
      setActiveTab('find');
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to create practice session",
        variant: "destructive",
      });
    }
  };

  const joinSession = async (sessionId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to join sessions",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('practice_matches')
        .update({
          opponent_user_id: user.id,
          status: 'active',
          start_time: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      setJoinedSessionId(sessionId);
      toast({
        title: "Success",
        description: "Joined practice session!",
      });
    } catch (error) {
      console.error('Error joining session:', error);
      toast({
        title: "Error",
        description: "Failed to join session",
        variant: "destructive",
      });
    }
  };

  const getTimeUntilStart = (startTime?: string): string => {
    if (!startTime) return 'Starting now';
    
    const start = new Date(startTime);
    const now = currentTime;
    const diff = start.getTime() - now.getTime();
    
    if (diff <= 0) return 'Starting now';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const canJoinSession = (startTime?: string, isCreator: boolean = false, sessionStatus?: string): boolean => {
    if (!startTime) return true;
    
    // Disable buttons for completed sessions
    if (sessionStatus === 'completed') return false;
    
    if (isCreator) {
      return true;
    }
    
    // startTime is stored in UTC, currentTime should also be UTC for comparison
    const start = new Date(startTime);
    const now = new Date(); // Always use UTC for comparison
    const diff = start.getTime() - now.getTime();
    const diffMinutes = diff / (1000 * 60);
    
    // Can join if session starts within 15 minutes in the past to 1 hour in the future
    return diffMinutes >= -15 && diffMinutes <= 60;
  };

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'beginner': return 'bg-green-500/20 text-green-300';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-300';
      case 'advanced': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const canDeleteSession = (startTime?: string): boolean => {
    if (!startTime) return false;
    const start = new Date(startTime);
    const now = new Date();
    const timeDiff = start.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return hoursDiff >= 1; // Can delete 1 hour before start
  };

  const canRescheduleSession = (startTime?: string): boolean => {
    if (!startTime) return false;
    const start = new Date(startTime);
    const now = new Date();
    const timeDiff = start.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    return minutesDiff >= 10; // Can reschedule 10 minutes before start
  };

  const deleteSession = async (sessionId: string) => {
    try {
      console.log('🗑️ Attempting to delete session:', sessionId);
      
      const { error } = await supabase
        .from('practice_matches')
        .delete()
        .eq('id', sessionId);

      if (error) {
        console.error('❌ Delete error:', error);
        throw error;
      }

      console.log('✅ Session deleted successfully');
      
      // Immediately remove from local state to update UI
      setMatches(prev => prev.filter(match => match.id !== sessionId));

      toast({
        title: "Success",
        description: "Session deleted successfully",
      });

      // Also refresh from server to ensure consistency
      fetchMatches();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
    }
  };

  const rescheduleSession = async () => {
    if (!rescheduleSessionId || !rescheduleTime) return;

    try {
      // Parse reschedule time similar to create session
      const easternTimeZone = 'America/New_York';
      const currentUTC = new Date();
      
      const [datePart, timePart] = rescheduleTime.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);
      
      const easternTimeDate = new Date(year, month - 1, day, hour, minute, 0);
      const startTimeInUTC = fromZonedTime(easternTimeDate, easternTimeZone);
      
      const timeDiff = startTimeInUTC.getTime() - currentUTC.getTime();
      
      if (timeDiff < -5 * 60 * 1000) { // More than 5 minutes in the past
        toast({
          title: "Warning", 
          description: `Start time cannot be more than 5 minutes in the past. Current Eastern Time: ${formatInTimeZone(currentUTC, easternTimeZone, 'HH:mm')}`,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('practice_matches')
        .update({ start_time: startTimeInUTC.toISOString() })
        .eq('id', rescheduleSessionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session rescheduled successfully",
      });

      setRescheduleSessionId(null);
      setRescheduleTime('');
      fetchMatches();
    } catch (error) {
      console.error('Error rescheduling session:', error);
      toast({
        title: "Error",
        description: "Failed to reschedule session",
        variant: "destructive",
      });
    }
  };

  if (joinedSessionId) {
    // Check if current user is the creator/host
    const currentSession = matches.find(m => m.id === joinedSessionId);
    const isHost = currentSession?.creator_user_id === user?.id;
    
    return (
      <JoinSession 
        sessionId={joinedSessionId}
        onBack={() => setJoinedSessionId(null)}
        isHost={isHost}
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-pulse">Loading practice arena...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Global Practice Arena
        </h1>
        <p className="text-muted-foreground">
          Join live debates with debaters from around the world
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'find' | 'create' | 'attended')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="find">Find Sessions</TabsTrigger>
          <TabsTrigger value="create">Create Session</TabsTrigger>
          <TabsTrigger value="attended">Attended Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="find" className="space-y-4">
          {matches.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm border-border/30">
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No active sessions. Be the first to create one!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {matches.map((session) => (
                <Card key={session.id} className="bg-card/50 backdrop-blur-sm border-border/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{session.topic_title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getLevelColor(session.difficulty)}>
                          {session.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {getTimeUntilStart(session.start_time)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={session.creator_profile?.avatar_url} />
                          <AvatarFallback>
                            {session.creator_profile?.display_name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {session.creator_profile?.display_name || session.creator_profile?.username}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Star className="w-3 h-3" />
                            <span>{session.creator_profile?.rating || 1000}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Host management buttons */}
                        {session.creator_user_id === user?.id && session.status === 'waiting' && !session.opponent_user_id && (
                          <>
                            {canDeleteSession(session.start_time) && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Session</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this session? This action cannot be undone and the session will be removed permanently.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => deleteSession(session.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            {canRescheduleSession(session.start_time) && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => {
                                      setRescheduleSessionId(session.id);
                                      // Pre-fill with current time
                                      if (session.start_time) {
                                        const easternTimeZone = 'America/New_York';
                                        const currentTime = formatInTimeZone(new Date(session.start_time), easternTimeZone, "yyyy-MM-dd'T'HH:mm");
                                        setRescheduleTime(currentTime);
                                      }
                                    }}
                                  >
                                    <Edit3 className="w-4 h-4" />
                                    Reschedule
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Reschedule Session</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">New Start Time</label>
                                      <Input
                                        type="datetime-local"
                                        value={rescheduleTime}
                                        onChange={(e) => setRescheduleTime(e.target.value)}
                                      />
                                      <p className="text-xs text-muted-foreground">
                                        All times are in Eastern Time (ET).
                                      </p>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setRescheduleSessionId(null);
                                          setRescheduleTime('');
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        onClick={rescheduleSession}
                                        disabled={!rescheduleTime}
                                      >
                                        Reschedule
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </>
                        )}
                        
                        <Button
                          onClick={() => {
                            const isCreator = session.creator_user_id === user?.id;
                            console.log('🔍 START/JOIN SESSION CLICKED:', {
                              sessionId: session.id,
                              canJoin: canJoinSession(session.start_time, isCreator, session.status),
                              isCreator,
                              userId: user?.id,
                              creatorId: session.creator_user_id,
                              startTime: session.start_time,
                              sessionStatus: session.status,
                              buttonDisabled: !canJoinSession(session.start_time, isCreator, session.status)
                            });
                            if (isCreator) {
                              console.log('🔍 CREATOR STARTING SESSION');
                              console.log('🔍 SETTING JOINED SESSION ID TO:', session.id);
                              setJoinedSessionId(session.id);
                              console.log('🔍 JOINED SESSION ID SET, should navigate to JoinSession component');
                            } else {
                              console.log('🔍 OPPONENT JOINING SESSION');
                              joinSession(session.id);
                            }
                          }}
                          disabled={!canJoinSession(session.start_time, session.creator_user_id === user?.id, session.status)}
                          className="gap-2 hover:bg-primary/90 transition-colors"
                          style={{ 
                            backgroundColor: !canJoinSession(session.start_time, session.creator_user_id === user?.id, session.status) ? '#666' : '',
                            cursor: !canJoinSession(session.start_time, session.creator_user_id === user?.id, session.status) ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <Play className="w-4 h-4" />
                          {session.creator_user_id === user?.id ? 'Start Session' : 'Join Session'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/30">
            <CardHeader>
              <CardTitle>Create Practice Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Topic *</label>
                {!showCustomTopic ? (
                  <Select value={newSession.topic_id} onValueChange={(value) => {
                    if (value === 'custom') {
                      setShowCustomTopic(true);
                      setNewSession(prev => ({
                        ...prev,
                        topic_id: '',
                        topic_title: ''
                      }));
                    } else {
                      const topic = topics.find(t => t.id === value);
                      setNewSession(prev => ({
                        ...prev,
                        topic_id: value,
                        topic_title: topic?.title || ''
                      }));
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.title}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">
                        ✏️ Create Custom Topic
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter your custom topic"
                      value={newSession.topic_title}
                      onChange={(e) => setNewSession(prev => ({ ...prev, topic_title: e.target.value }))}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setShowCustomTopic(false);
                        setNewSession(prev => ({ ...prev, topic_title: '', topic_id: '' }));
                      }}
                    >
                      Back to Topic Selection
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty Level</label>
                <Select value={newSession.difficulty} onValueChange={(value) => 
                  setNewSession(prev => ({ ...prev, difficulty: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time *</label>
                <Input
                  type="datetime-local"
                  value={newSession.start_time}
                  onChange={(e) => setNewSession(prev => ({ ...prev, start_time: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  All times are in Eastern Time (ET). Select when the debate should start.
                </p>
              </div>

              <Button 
                disabled={!newSession.topic_title || !newSession.difficulty || !newSession.start_time}
                onClick={() => {
                console.error('🚨 CREATE SESSION BUTTON CLICKED! 🚨');
                console.log('Form data check:', {
                  user: !!user,
                  topic_title: newSession.topic_title,
                  difficulty: newSession.difficulty,
                  start_time: newSession.start_time,
                  showCustomTopic,
                  buttonDisabled: !newSession.topic_title || !newSession.difficulty || !newSession.start_time
                });
                createSession();
              }} className="w-full">
                Create Session
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attended" className="space-y-4">
          {attendedSessions.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm border-border/30">
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No attended sessions yet. Join some debates to see them here!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {attendedSessions.map((session) => (
                <Card key={session.id} className="bg-card/50 backdrop-blur-sm border-border/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{session.topic_title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getLevelColor(session.difficulty)}>
                          {session.difficulty}
                        </Badge>
                        {session.winner_user_id === user?.id && (
                          <Badge className="bg-green-500/20 text-green-300">Won</Badge>
                        )}
                        {session.winner_user_id && session.winner_user_id !== user?.id && (
                          <Badge className="bg-red-500/20 text-red-300">Lost</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={session.creator_profile?.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {session.creator_profile?.display_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {session.creator_user_id === user?.id ? 'You' : 
                             session.creator_profile?.display_name || session.creator_profile?.username}
                          </span>
                        </div>
                        <span className="text-muted-foreground">vs</span>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={session.opponent_profile?.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {session.opponent_profile?.display_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {session.opponent_user_id === user?.id ? 'You' : 
                             session.opponent_profile?.display_name || session.opponent_profile?.username}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(session.end_time || session.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      {session.recording_url ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          onClick={async () => {
                            // Get the public URL from Supabase storage
                            const { data } = supabase.storage
                              .from('audio-posts')
                              .getPublicUrl(session.recording_url);
                            
                            const videoElement = document.createElement('video');
                            videoElement.src = data.publicUrl;
                            videoElement.controls = true;
                            videoElement.style.width = '100%';
                            videoElement.style.maxWidth = '800px';
                            videoElement.style.height = 'auto';
                            
                            const modal = document.createElement('div');
                            modal.style.position = 'fixed';
                            modal.style.top = '0';
                            modal.style.left = '0';
                            modal.style.width = '100%';
                            modal.style.height = '100%';
                            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                            modal.style.display = 'flex';
                            modal.style.alignItems = 'center';
                            modal.style.justifyContent = 'center';
                            modal.style.zIndex = '1000';
                            modal.style.padding = '20px';
                            
                            const closeButton = document.createElement('button');
                            closeButton.innerHTML = '✕';
                            closeButton.style.position = 'absolute';
                            closeButton.style.top = '20px';
                            closeButton.style.right = '20px';
                            closeButton.style.background = 'white';
                            closeButton.style.border = 'none';
                            closeButton.style.borderRadius = '50%';
                            closeButton.style.width = '40px';
                            closeButton.style.height = '40px';
                            closeButton.style.fontSize = '20px';
                            closeButton.style.cursor = 'pointer';
                            closeButton.onclick = () => document.body.removeChild(modal);
                            
                            modal.appendChild(videoElement);
                            modal.appendChild(closeButton);
                            modal.onclick = (e) => {
                              if (e.target === modal) {
                                document.body.removeChild(modal);
                              }
                            };
                            
                            document.body.appendChild(modal);
                          }}
                        >
                          <Play className="w-3 h-3" />
                          Watch Recording
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="gap-2" disabled>
                          <Play className="w-3 h-3" />
                          No Recording
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};