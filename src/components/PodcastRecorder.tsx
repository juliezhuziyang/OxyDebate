import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Square, Music, Download, Upload, AlertCircle } from 'lucide-react';
import { FirecrawlService } from '../utils/FirecrawlService';

interface PodcastRecorderProps {
  onRecordingComplete: (audioBlob: Blob, backgroundMusic?: string) => void;
  onCancel: () => void;
}

interface BackgroundMusic {
  name: string;
  url: string;
  duration: string;
  genre: string;
}

export const PodcastRecorder = ({ onRecordingComplete, onCancel }: PodcastRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [selectedMusic, setSelectedMusic] = useState<string>('');
  const [backgroundMusic, setBackgroundMusic] = useState<BackgroundMusic[]>([]);
  const [isLoadingMusic, setIsLoadingMusic] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!FirecrawlService.getApiKey());
  const [microphoneError, setMicrophoneError] = useState<string | null>(null);
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt' | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const existingKey = FirecrawlService.getApiKey();
    if (existingKey) {
      setShowApiKeyInput(false);
    }
    
    // Check microphone permission on component mount
    checkMicrophonePermission();
    
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setMicrophonePermission(permission.state);
      
      permission.onchange = () => {
        setMicrophonePermission(permission.state);
      };
    } catch (error) {
      console.log('Permission API not supported');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      setMicrophoneError(null);
      console.log('Requesting microphone access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      console.log('Microphone access granted');
      
      // Check if MediaRecorder is supported
      if (!MediaRecorder.isTypeSupported('audio/webm') && !MediaRecorder.isTypeSupported('audio/mp4')) {
        throw new Error('Audio recording not supported in this browser');
      }
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('Audio data received:', event.data.size, 'bytes');
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log('Recording stopped. Blob size:', audioBlob.size, 'bytes');
        setAudioBlob(audioBlob);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setMicrophoneError('Recording error occurred');
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      startTimer();
      console.log('Recording started');
      
    } catch (error) {
      console.error('Error starting recording:', error);
      let errorMessage = 'Could not access microphone. ';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Please grant microphone permission and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No microphone found.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage += 'Audio recording not supported in this browser.';
        } else {
          errorMessage += error.message;
        }
      }
      
      setMicrophoneError(errorMessage);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();
    }
  };

  const searchBackgroundMusic = async () => {
    if (!apiKey && !FirecrawlService.getApiKey()) {
      alert('Please enter your Firecrawl API key first');
      return;
    }

    if (apiKey && !FirecrawlService.getApiKey()) {
      FirecrawlService.saveApiKey(apiKey);
    }

    setIsLoadingMusic(true);
    try {
      const mockMusic: BackgroundMusic[] = [
        { name: 'Corporate Upbeat', url: 'music1.mp3', duration: '2:30', genre: 'Corporate' },
        { name: 'Acoustic Guitar', url: 'music2.mp3', duration: '3:15', genre: 'Acoustic' },
        { name: 'Jazz Piano', url: 'music3.mp3', duration: '4:20', genre: 'Jazz' },
        { name: 'Ambient Synth', url: 'music4.mp3', duration: '3:45', genre: 'Ambient' },
        { name: 'Classical Strings', url: 'music5.mp3', duration: '2:50', genre: 'Classical' },
        { name: 'Electronic Beat', url: 'music6.mp3', duration: '3:30', genre: 'Electronic' }
      ];

      setBackgroundMusic(mockMusic);
      
    } catch (error) {
      console.error('Error searching for music:', error);
      alert('Error searching for background music');
    } finally {
      setIsLoadingMusic(false);
    }
  };

  const handleComplete = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, selectedMusic);
    }
  };

  if (showApiKeyInput) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Setup Firecrawl API</h3>
        <p className="text-sm text-muted-foreground mb-4">
          To search for background music, please enter your Firecrawl API key:
        </p>
        <div className="space-y-4">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Firecrawl API key"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex space-x-3">
            <button
              onClick={() => {
                if (apiKey) {
                  FirecrawlService.saveApiKey(apiKey);
                  setShowApiKeyInput(false);
                } else {
                  alert('Please enter an API key');
                }
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Save & Continue
            </button>
            <button
              onClick={() => setShowApiKeyInput(false)}
              className="px-4 py-2 border rounded-lg hover:bg-muted"
            >
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Microphone Permission Status */}
      {microphonePermission === 'denied' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle size={20} className="text-red-600" />
          <p className="text-red-800">Microphone access denied. Please enable microphone permission in your browser settings.</p>
        </div>
      )}
      
      {microphoneError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle size={20} className="text-yellow-600" />
          <p className="text-yellow-800">{microphoneError}</p>
        </div>
      )}

      {/* Recording Controls */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Record Your Podcast</h3>
        
        <div className="text-center space-y-4">
          <div className="text-3xl font-mono">{formatTime(recordingTime)}</div>
          
          <div className="flex justify-center space-x-4">
            {!isRecording && !audioBlob && (
              <button
                onClick={startRecording}
                disabled={microphonePermission === 'denied'}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mic size={20} />
                <span>Start Recording</span>
              </button>
            )}
            
            {isRecording && !isPaused && (
              <>
                <button
                  onClick={pauseRecording}
                  className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  <Pause size={20} />
                  <span>Pause</span>
                </button>
                <button
                  onClick={stopRecording}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <Square size={20} />
                  <span>Stop</span>
                </button>
              </>
            )}
            
            {isRecording && isPaused && (
              <>
                <button
                  onClick={resumeRecording}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Play size={20} />
                  <span>Resume</span>
                </button>
                <button
                  onClick={stopRecording}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <Square size={20} />
                  <span>Stop</span>
                </button>
              </>
            )}
          </div>

          {audioBlob && (
            <div className="mt-4">
              <audio controls src={URL.createObjectURL(audioBlob)} className="w-full max-w-md mx-auto" />
            </div>
          )}
        </div>
      </div>

      {/* Background Music Selection */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Music size={20} />
            <span>Background Music</span>
          </h3>
          <button
            onClick={searchBackgroundMusic}
            disabled={isLoadingMusic}
            className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-muted disabled:opacity-50"
          >
            <Upload size={16} />
            <span>{isLoadingMusic ? 'Loading...' : 'Find Music'}</span>
          </button>
        </div>

        {backgroundMusic.length > 0 && (
          <div className="space-y-3">
            <div className="grid gap-3">
              {backgroundMusic.map((music, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedMusic === music.url
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedMusic(music.url)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{music.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {music.genre} • {music.duration}
                      </p>
                    </div>
                    <button className="p-2 hover:bg-background rounded">
                      <Play size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onCancel}
          className="px-6 py-3 border rounded-lg hover:bg-muted"
        >
          Cancel
        </button>
        
        {audioBlob && (
          <button
            onClick={handleComplete}
            className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Download size={20} />
            <span>Save Podcast</span>
          </button>
        )}
      </div>
    </div>
  );
};
