import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Crown, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MeetingControls } from './MeetingControls';
import { useToast } from '@/hooks/use-toast';

interface Participant {
  id: string;
  displayName: string;
  email?: string;
  userId?: string;
}

interface JoinSessionProps {
  sessionId: string;
  onBack: () => void;
  isHost?: boolean;
}

export const JoinSession = ({ sessionId, onBack, isHost = false }: JoinSessionProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [jitsiApi, setJitsiApi] = useState<any>(null);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const jitsiContainer = useRef<HTMLDivElement>(null);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [hasStartedRecording, setHasStartedRecording] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const handleSpeakerAssignment = async (propSpeakers: string[], oppSpeakers: string[]) => {
    try {
      const { error } = await supabase
        .from('practice_matches')
        .update({ 
          prop_speakers: propSpeakers.filter(s => s.trim() !== ''),
          opp_speakers: oppSpeakers.filter(s => s.trim() !== '')
        })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Speaker assignments saved",
      });
    } catch (error) {
      console.error('Error saving speaker assignments:', error);
      toast({
        title: "Error",
        description: "Failed to save speaker assignments",
        variant: "destructive",
      });
    }
  };

  const handleResultSubmission = async (result: 'prop_wins' | 'opp_wins' | 'tie') => {
    try {
      const { error } = await supabase
        .from('practice_matches')
        .update({ result })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Debate result recorded",
      });
    } catch (error) {
      console.error('Error saving result:', error);
      toast({
        title: "Error",
        description: "Failed to save result",
        variant: "destructive",
      });
    }
  };

  const startRecording = async () => {
    if (hasStartedRecording) return; // Prevent multiple recordings
    
    try {
      // Show instruction toast before starting recording
      toast({
        title: "Record Meeting",
        description: "When prompted, please select 'Current Tab' to record this website's meeting page only",
      });

      // Wait a moment for the toast to show
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Capture the current browser tab (debate arena with meeting)
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });
      
      // Also get microphone audio to ensure we capture user's voice
      const micStream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false 
      });
      
      // Create a combined stream with screen video and both audio tracks
      const combinedStream = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...displayStream.getAudioTracks(),
        ...micStream.getAudioTracks()
      ]);
      
      const recorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        await uploadRecording(blob);
        
        // Stop all tracks to release resources
        combinedStream.getTracks().forEach(track => track.stop());
        displayStream.getTracks().forEach(track => track.stop());
        micStream.getTracks().forEach(track => track.stop());
      };
      
      // Handle case where user stops screen sharing manually
      displayStream.getVideoTracks()[0].addEventListener('ended', () => {
        console.log('Screen sharing ended by user');
        stopRecording();
      });
      
      recorder.start();
      setMediaRecorder(recorder);
      setRecordedChunks(chunks);
      setIsRecording(true);
      setHasStartedRecording(true);
      
      toast({
        title: "Meeting Recording Active",
        description: "Recording the current tab with the meeting. Keep this tab focused for best results.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Please allow screen sharing and select 'Current Tab' to record the meeting page only.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const uploadRecording = async (videoBlob: Blob) => {
    try {
      const fileName = `session-${sessionId}-${Date.now()}.webm`;
      
      const { error: uploadError } = await supabase.storage
        .from('audio-posts')
        .upload(fileName, videoBlob, {
          contentType: 'video/webm',
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      // Update practice match with recording URL
      const { error: updateError } = await supabase
        .from('practice_matches')
        .update({ 
          recording_url: fileName
        })
        .eq('id', sessionId);

      if (updateError) throw updateError;

      toast({
        title: "Recording Saved",
        description: "Session recording has been saved successfully",
      });
    } catch (error) {
      console.error('Error uploading recording:', error);
      toast({
        title: "Upload Error",
        description: "Failed to save session recording",
        variant: "destructive",
      });
    }
  };

  const endSession = async () => {
    try {
      // Stop recording if it's active
      if (isRecording) {
        stopRecording();
      }
      
      // Update session status to 'completed' in database
      await supabase
        .from('practice_matches')
        .update({ status: 'completed', end_time: new Date().toISOString() })
        .eq('id', sessionId);
      
      // Dispose Jitsi API to kick everyone out
      if (jitsiApi) {
        jitsiApi.dispose();
        setJitsiApi(null);
      }
      
      setIsSessionEnded(true);
      
      // Go back after a brief delay
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  // Initialize Jitsi Meet automatically when component loads
  useEffect(() => {
    // Add current user to participants list immediately
    if (profile && participants.length === 0) {
      const displayName = profile.display_name || profile.username || 'Anonymous';
      const userNameWithRole = isHost ? `${displayName} (Host)` : displayName;
      
      const currentUser: Participant = {
        id: 'current-user-' + profile.user_id,
        displayName: userNameWithRole,
        email: profile.user_id + '@debate.app',
        userId: profile.user_id
      };
      
      setParticipants([currentUser]);
      console.log('Added current user immediately:', currentUser);
    }
    
    // Prevent multiple initializations
    if (jitsiApi) {
      return;
    }

    const initializeJitsi = async () => {
      if (typeof window !== 'undefined' && (window as any).JitsiMeetExternalAPI && jitsiContainer.current && profile) {
        const roomName = `vpaas-magic-cookie-33efea029781448088cb08c821f698b8/DebatePractice-${sessionId}`;
        
        // Use display name or username as fallback
        const displayName = profile.display_name || profile.username || 'Anonymous';
        const userNameWithRole = isHost ? `${displayName} (Host)` : displayName;
        
        try {
          // Generate fresh JWT token
          const { data: jwtData, error: jwtError } = await supabase.functions.invoke('generate-jitsi-jwt', {
            body: {
              roomName,
              userName: displayName,
              userEmail: profile.user_id + '@debate.app',
              isHost: isHost,
              userId: profile.user_id
            }
          });

          if (jwtError || !jwtData?.jwt) {
            console.error('Failed to generate JWT:', jwtError);
            return;
          }

          const api = new (window as any).JitsiMeetExternalAPI("8x8.vc", {
            roomName,
            parentNode: jitsiContainer.current,
            width: '100%',
            height: '100%',
            userInfo: {
              displayName: userNameWithRole,
              email: profile.user_id + '@debate.app'
            },
            configOverwrite: {
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              prejoinPageEnabled: false,
              enableWelcomePage: false,
              enableUserRolesBasedOnToken: true,
            },
            interfaceConfigOverwrite: {
              TOOLBAR_BUTTONS: isHost ? [
                'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                'mute-video-everyone'
              ] : [
                'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'profile', 'chat', 
                'videoquality', 'filmstrip', 'settings', 'raisehand',
                'tileview', 'videobackgroundblur'
              ],
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false,
              DEFAULT_BACKGROUND: '#000000'
            },
            jwt: jwtData.jwt
          });

          setJitsiApi(api);

          // Handle participant events
          api.addEventListener('participantJoined', (participant: any) => {
            console.log('Participant joined:', participant);
            
            // Extract user ID from email if it exists (format: user_id@debate.app)
            const userId = participant.email && participant.email.includes('@debate.app') 
              ? participant.email.split('@')[0] 
              : null;
            
            const newParticipant: Participant = {
              id: participant.id,
              displayName: participant.displayName,
              email: participant.email || null,
              userId: userId
            };
            
            setParticipants(prev => {
              const updated = [...prev.filter(p => p.id !== participant.id), newParticipant];
              console.log('Updated participants list:', updated);
              return updated;
            });
          });

          api.addEventListener('participantLeft', (participant: any) => {
            console.log('Participant left:', participant);
            setParticipants(prev => prev.filter(p => p.id !== participant.id));
          });

          // Handle when user leaves the meeting
          api.addEventListener('videoConferenceLeft', () => {
            console.log('User left the conference');
            onBack();
          });

          // Handle when room is ready
          api.addEventListener('videoConferenceJoined', () => {
            console.log('Successfully joined conference');
            
            // Add current user to participants list
            const displayName = profile.display_name || profile.username || 'Anonymous';
            const userNameWithRole = isHost ? `${displayName} (Host)` : displayName;
            
            const currentUser: Participant = {
              id: 'current-user-' + profile.user_id,
              displayName: userNameWithRole,
              email: profile.user_id + '@debate.app',
              userId: profile.user_id
            };
            
            setParticipants(prev => {
              const updated = [...prev.filter(p => p.userId !== profile.user_id), currentUser];
              console.log('Added current user to participants:', updated);
              return updated;
            });
            
            // Start recording automatically when first person joins
            if (!hasStartedRecording) {
              startRecording();
            }
          });
        } catch (error) {
          console.error('Error initializing Jitsi:', error);
        }
      }
    };

    // Small delay to ensure the container is rendered and profile is loaded
    if (profile) {
      setTimeout(initializeJitsi, 100);
    }

    return () => {
      if (jitsiApi) {
        jitsiApi.dispose();
        setJitsiApi(null);
      }
    };
  }, [profile]); // Trigger when profile loads

  if (isSessionEnded) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Session Ended</h2>
          <p className="text-lg">The host has ended this session. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header with back button only */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="secondary"
          onClick={onBack}
          className="flex items-center space-x-2 bg-white/90 hover:bg-white text-black"
        >
          <ArrowLeft size={20} />
          <span>Leave Session</span>
        </Button>
      </div>

      {/* Full-screen video conference */}
      <div 
        ref={jitsiContainer}
        className="w-full h-screen"
      />

      {/* Meeting Controls - Overlay on top of video */}
      <MeetingControls
        isHost={isHost}
        sessionId={sessionId}
        participants={participants}
        onSpeakerAssignment={handleSpeakerAssignment}
        onResultSubmission={handleResultSubmission}
      />

      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center space-x-2 bg-red-600/90 text-white px-4 py-2 rounded-lg">
            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
            <Mic size={16} />
            <span className="text-sm font-medium">Recording</span>
          </div>
        </div>
      )}

      {/* Bottom controls - End Session button for host - below the meeting area */}
      {isHost && (
        <div className="w-full py-8 px-4 bg-black">
          <div className="flex justify-start">
            <Button
              variant="destructive"
              onClick={endSession}
              className="flex items-center space-x-2 bg-red-600/90 hover:bg-red-600 text-white px-6 py-3"
            >
              <Crown size={20} />
              <span>End Session</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};