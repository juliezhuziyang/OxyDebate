import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Clock, Bot, Square, MessageSquare, Save, X, History, Mic, MicOff, Loader2 } from 'lucide-react';
import { DebateFormat, Speaker, Skill } from './AIPractice';
import { supabase } from '@/integrations/supabase/client';
import { DebateSoFarChart } from './DebateSoFarChart';
import type { DebateSoFarData } from '@/types/debateContext';
import { generateDebateSoFarFallback, needsDebateContext, parseDebateSoFarResponse } from '@/utils/debateSoFar';
import {
  analyzeTranscript,
  buildTranscriptBasedFeedback,
  clampScoreToTranscript,
  parseAndValidateAIFeedback,
} from '@/utils/transcriptFeedback';

interface PracticeConfig {
  format: DebateFormat;
  topic: string;
  speaker: Speaker;
  skill: Skill;
  timeLimit: number;
}

interface PracticeSessionProps {
  config: PracticeConfig;
  onBack: () => void;
}

interface FeedbackData {
  score: number;
  strengths: string;
  improvements: string;
  specific: string;
  timing: string;
  timeUsed: string;
  totalTime: string;
  aiUnavailable?: boolean;
  aiError?: string;
}

export const PracticeSession = ({ config, onBack }: PracticeSessionProps) => {
  const [timeLeft, setTimeLeft] = useState(config.timeLimit * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [debateSoFar, setDebateSoFar] = useState<DebateSoFarData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [transcript, setTranscript] = useState('');
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [loadingContext, setLoadingContext] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [micActive, setMicActive] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef('');
  const shouldListenRef = useRef(false);
  const micStreamRef = useRef<MediaStream | null>(null);
  const restartTimeoutRef = useRef<number | null>(null);

  const stopMicStream = () => {
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;
  };

  const stopListening = () => {
    shouldListenRef.current = false;
    setMicActive(false);
    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    recognitionRef.current?.stop();
    stopMicStream();
    setIsListening(false);
    setInterimTranscript('');
  };

  const startRecognition = () => {
    const recognition = recognitionRef.current;
    if (!recognition || !shouldListenRef.current) return;

    try {
      recognition.start();
    } catch (err) {
      // Already running — safe to ignore InvalidStateError
      console.debug('Recognition start skipped:', err);
    }
  };

  const scheduleRecognitionRestart = () => {
    if (!shouldListenRef.current) {
      setIsListening(false);
      return;
    }

    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
    }

    restartTimeoutRef.current = window.setTimeout(() => {
      restartTimeoutRef.current = null;
      if (shouldListenRef.current) {
        startRecognition();
      }
    }, 150);
  };

  useEffect(() => {
    if (needsDebateContext(config.speaker)) {
      generateDebateContext();
    } else {
      setDebateSoFar(null);
    }
  }, [config.speaker, config.topic, config.format]);

  const generateDebateContext = async () => {
    const seed = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setLoadingContext(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-debate-context', {
        body: {
          topic: config.topic,
          format: config.format,
          speaker: config.speaker,
          seed,
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setDebateSoFar(parseDebateSoFarResponse(data, config.topic, config.format, config.speaker, seed));
    } catch (error) {
      console.error('Error generating debate context:', error);
      setDebateSoFar(generateDebateSoFarFallback(config.topic, config.format, config.speaker, seed));
    } finally {
      setLoadingContext(false);
    }
  };

  useEffect(() => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setMicError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let finalChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += text + ' ';
        } else {
          interim += text;
        }
      }

      setInterimTranscript(interim);

      if (finalChunk) {
        setTranscript((prev) => {
          const updated = prev + finalChunk;
          transcriptRef.current = updated;
          return updated;
        });
        setInterimTranscript('');
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Chrome ends the session after silence — onend will restart
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }

      console.error('Speech recognition error:', event.error);

      if (event.error === 'not-allowed') {
        shouldListenRef.current = false;
        setMicError('Microphone access was denied. Allow mic permission for this site in browser settings.');
        setIsListening(false);
        stopMicStream();
        return;
      }

      if (event.error === 'network') {
        setMicError('Speech recognition needs an internet connection (Chrome sends audio to Google servers).');
      } else if (event.error === 'audio-capture') {
        shouldListenRef.current = false;
        setMicError('No microphone detected. Check that a mic is connected and selected in system settings.');
        setIsListening(false);
        stopMicStream();
      } else {
        setMicError(`Speech recognition error: ${event.error}`);
      }
    };

    // Chrome stops every few seconds even with continuous=true — must restart while session is active
    recognition.onend = () => {
      if (shouldListenRef.current) {
        scheduleRecognitionRestart();
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    setRecognition(recognition);

    return () => {
      shouldListenRef.current = false;
      if (restartTimeoutRef.current) {
        window.clearTimeout(restartTimeoutRef.current);
      }
      recognition.stop();
      stopMicStream();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      handleSessionEnd();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionTiming = () => {
    const totalTimeSeconds = config.timeLimit * 60;
    const timeUsedSeconds = totalTimeSeconds - timeLeft;
    return { timeUsedSeconds, totalTimeSeconds };
  };

  const buildFeedbackFromTranscript = (
    speechTranscript: string,
    options?: { aiUnavailable?: boolean; aiError?: string }
  ): FeedbackData => {
    const { timeUsedSeconds, totalTimeSeconds } = getSessionTiming();
    return {
      ...buildTranscriptBasedFeedback({
        transcript: speechTranscript,
        timeUsedSeconds,
        totalTimeSeconds,
        skill: config.skill,
      }),
      aiUnavailable: options?.aiUnavailable,
      aiError: options?.aiError,
    };
  };

  const startSession = async () => {
    setMicError(null);

    if (!speechSupported || !recognitionRef.current) {
      setMicError('Speech recognition is not supported in this browser. Try Chrome or Edge on desktop.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
    } catch {
      setMicError('Could not access microphone. Check browser permission and system mic settings.');
      return;
    }

    setSessionStarted(true);
    setIsRunning(true);
    setIsRecording(true);
    setTranscript('');
    transcriptRef.current = '';
    setInterimTranscript('');

    shouldListenRef.current = true;
    setMicActive(true);
    startRecognition();
  };

  const endSpeechEarly = () => {
    setIsRunning(false);
    setIsRecording(false);
    stopListening();
    handleSessionEnd();
  };

  const pauseSession = () => {
    setIsRunning((prev) => {
      const next = !prev;
      if (next) {
        shouldListenRef.current = true;
        setMicActive(true);
        startRecognition();
      } else {
        shouldListenRef.current = false;
        setMicActive(false);
        recognitionRef.current?.stop();
        setIsListening(false);
      }
      return next;
    });
  };

  const resetSession = () => {
    stopListening();
    setTimeLeft(config.timeLimit * 60);
    setIsRunning(false);
    setIsRecording(false);
    setSessionStarted(false);
    setSessionEnded(false);
    setFeedback(null);
    setTranscript('');
    transcriptRef.current = '';
    setShowSaveOptions(false);
    setMicError(null);

    if (needsDebateContext(config.speaker)) {
      generateDebateContext();
    }
  };

  const handleSessionEnd = async () => {
    setIsRecording(false);
    setSessionEnded(true);
    stopListening();

    const finalTranscript = transcriptRef.current.trim();
    await generateAIFeedback(finalTranscript);
    setShowSaveOptions(true);
  };

  const generateAIFeedback = async (finalTranscript: string) => {
    setLoadingFeedback(true);
    const { timeUsedSeconds, totalTimeSeconds } = getSessionTiming();
    const analysis = analyzeTranscript(finalTranscript, timeUsedSeconds, totalTimeSeconds);

    if (analysis.isEmpty) {
      setFeedback(buildFeedbackFromTranscript(finalTranscript));
      setLoadingFeedback(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-feedback', {
        body: {
          transcript: finalTranscript,
          topic: config.topic,
          speaker: config.speaker,
          skill: config.skill,
          timeUsedSeconds,
          timeLimitMinutes: config.timeLimit,
        }
      });

      if (error) {
        const contextMessage =
          typeof error === 'object' && error !== null && 'context' in error
            ? String((error as { context?: { body?: string } }).context?.body ?? '')
            : '';
        throw new Error(data?.error || contextMessage || error.message || 'AI feedback service unavailable');
      }
      if (data?.error) throw new Error(data.error);

      if (typeof data?.score === 'number') {
        setFeedback({
          score: clampScoreToTranscript(data.score, analysis),
          strengths: data.strengths || 'See analysis below.',
          improvements: data.improvements || 'Continue developing your arguments.',
          specific: data.specific || '',
          timing: data.timing || `Used ${formatTime(timeUsedSeconds)} of ${formatTime(totalTimeSeconds)}.`,
          timeUsed: formatTime(timeUsedSeconds),
          totalTime: formatTime(totalTimeSeconds),
        });
      } else if (data?.feedback) {
        setFeedback(parseAndValidateAIFeedback(
          data.feedback,
          finalTranscript,
          timeUsedSeconds,
          totalTimeSeconds
        ));
      } else {
        throw new Error('No feedback received from AI');
      }
    } catch (error) {
      console.error('Error generating AI feedback:', error);
      const aiError = error instanceof Error ? error.message : 'AI feedback service unavailable';
      setFeedback(buildFeedbackFromTranscript(finalTranscript, {
        aiUnavailable: true,
        aiError,
      }));
    } finally {
      setLoadingFeedback(false);
    }
  };

  const savePractice = () => {
    const practiceRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      format: config.format,
      topic: config.topic,
      speaker: config.speaker,
      skill: config.skill,
      duration: config.timeLimit,
      timeUsed: config.timeLimit * 60 - timeLeft,
      completed: timeLeft === 0,
      transcript,
      feedback,
      saved: true
    };
    
    const existingHistory = JSON.parse(localStorage.getItem('practiceHistory') || '[]');
    existingHistory.push(practiceRecord);
    localStorage.setItem('practiceHistory', JSON.stringify(existingHistory));
    
    setShowSaveOptions(false);
  };

  const dismissPractice = () => {
    setShowSaveOptions(false);
    resetSession();
  };

  const getSkillTips = () => {
    const tips = {
      rebuttal: ['Address the strongest opposing arguments', 'Use the "Even if" framework', 'Provide counter-evidence'],
      argumentation: ['Use clear claim-warrant-impact structure', 'Provide concrete examples', 'Build logical chains'],
      weighing: ['Compare magnitude, probability, and timeframe', 'Use comparative language', 'Establish frameworks for evaluation'],
      modeling: ['Define key terms clearly', 'Set reasonable parameters', 'Explain practical implementation'],
      'case-building': ['Structure with clear themes', 'Ensure arguments are mutually reinforcing', 'Build to your strongest points'],
      POI: ['Time your interventions strategically', 'Keep questions concise', 'Aim to expose weaknesses'],
      summary: ['Crystallize key clashes', 'Highlight your side\'s strongest arguments', 'Provide clear voting issues']
    };
    
    return tips[config.skill] || [];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Configuration</span>
        </button>
        <div className="text-center">
          <h1 className="text-xl font-bold">Practice Session</h1>
          <p className="text-sm text-muted-foreground">
            {config.format} • {config.speaker} • {config.skill}
          </p>
        </div>
        <div></div>
      </div>

      {/* Topic Display */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
        <h2 className="text-lg font-semibold mb-2">Motion</h2>
        <p className="text-xl font-bold text-primary">{config.topic}</p>
      </div>

      {/* Debate Context */}
      {needsDebateContext(config.speaker) && (
        <DebateSoFarChart
          data={debateSoFar}
          format={config.format}
          loading={loadingContext}
        />
      )}

      {/* Timer and Controls */}
      <div className="bg-card border rounded-lg p-6">
        <div className="text-center space-y-6">
          <div className="text-6xl font-mono font-bold text-primary">
            {formatTime(timeLeft)}
          </div>
          
          <div className="flex justify-center space-x-4">
            {!sessionStarted ? (
              <button
                onClick={startSession}
                className="flex items-center space-x-2 px-8 py-4 debate-gradient text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-md"
              >
                <Play size={24} />
                <span>Start Practice</span>
              </button>
            ) : !sessionEnded ? (
              <>
                <button
                  onClick={pauseSession}
                  className="flex items-center space-x-2 px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {isRunning ? <Pause size={20} /> : <Play size={20} />}
                  <span>{isRunning ? 'Pause' : 'Resume'}</span>
                </button>

                <button
                  onClick={endSpeechEarly}
                  className="flex items-center space-x-2 px-6 py-3 border-2 border-accent text-accent rounded-lg font-semibold hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Square size={20} />
                  <span>End Speech</span>
                </button>
                
                <button
                  onClick={resetSession}
                  className="flex items-center space-x-2 px-6 py-3 border-2 border-muted-foreground text-muted-foreground rounded-lg font-semibold hover:bg-muted transition-colors"
                >
                  <RotateCcw size={20} />
                  <span>Reset</span>
                </button>
              </>
            ) : !showSaveOptions ? (
              <button
                onClick={resetSession}
                className="flex items-center space-x-2 px-8 py-4 debate-gradient text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-md"
              >
                <RotateCcw size={24} />
                <span>Practice Again</span>
              </button>
            ) : null}
          </div>

          {sessionStarted && !sessionEnded && (
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${micActive && isListening ? 'bg-destructive animate-pulse' : micActive ? 'bg-amber-500 animate-pulse' : 'bg-muted-foreground/50'}`} />
                {micActive ? <Mic className={isListening ? 'text-destructive' : 'text-amber-500'} size={16} /> : <MicOff className="text-muted-foreground" size={16} />}
                <span className="text-sm text-muted-foreground">
                  {!micActive
                    ? 'Not listening'
                    : isListening
                      ? 'Listening… speak clearly into your microphone'
                      : 'Reconnecting microphone…'}
                </span>
              </div>
              {micError && (
                <p className="text-sm text-destructive text-center max-w-md mx-auto">{micError}</p>
              )}
              {(transcript || interimTranscript) && (
                <div className="text-left text-sm bg-muted/40 rounded-lg p-3 max-h-28 overflow-y-auto border border-border/60">
                  <span className="text-muted-foreground">{transcript}</span>
                  <span className="text-foreground/70 italic">{interimTranscript}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Speech Transcript */}
      {transcript && sessionEnded && (
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-semibold mb-4 flex items-center space-x-2">
            <MessageSquare size={18} />
            <span>Your Speech Transcript</span>
          </h3>
          <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-4 max-h-40 overflow-y-auto">
            {transcript || "No speech detected. Please check your microphone permissions."}
          </div>
        </div>
      )}

      {/* AI Feedback */}
      {feedback && sessionEnded && (
        <div className="bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 rounded-xl p-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
              {loadingFeedback ? <Loader2 className="text-white animate-spin" size={24} /> : <Bot className="text-white" size={24} />}
            </div>
            <div className="flex-1 space-y-6">
              {feedback.aiUnavailable && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <p className="font-medium">AI coach is unavailable right now</p>
                  <p className="mt-1 text-amber-800">
                    {feedback.aiError?.includes('OpenAI API key')
                      ? 'The OpenAI API key is not configured on the server. An admin needs to add OPENAI_API_KEY in Supabase Edge Function secrets.'
                      : (feedback.aiError || 'Showing a basic automated analysis instead of full AI feedback.')}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-accent">AI Coach Analysis</h3>
                <div className="flex items-center space-x-2 bg-accent/10 rounded-lg px-4 py-2">
                  <span className="text-sm font-medium text-accent">Overall Score:</span>
                  <span className="text-2xl font-bold text-accent">{feedback.score}/100</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Strengths</span>
                  </h4>
                  <p className="text-sm text-green-700 leading-relaxed">{feedback.strengths}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Areas for Improvement</span>
                  </h4>
                  <p className="text-sm text-blue-700 leading-relaxed">{feedback.improvements}</p>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Specific to Your {config.skill} Skills</span>
                </h4>
                <p className="text-sm text-purple-700 leading-relaxed">{feedback.specific}</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
                <h4 className="font-semibold text-orange-800 mb-3 flex items-center space-x-2">
                  <Clock size={16} />
                  <span>Time Management</span>
                </h4>
                <p className="text-sm text-orange-700 mb-2">{feedback.timing}</p>
                <div className="flex items-center space-x-4 text-xs text-orange-600">
                  <span>Time Used: <strong>{feedback.timeUsed}</strong></span>
                  <span>Total Time: <strong>{feedback.totalTime}</strong></span>
                </div>
              </div>

              <div className="bg-accent/5 border border-accent/20 rounded-lg p-5">
                <h4 className="font-semibold text-accent mb-3">Next Steps</h4>
                <p className="text-sm text-muted-foreground">
                  Keep practicing your {config.skill} skills with these insights in mind. Focus on the improvement areas 
                  and continue building on your strengths. Regular practice will help you develop into a stronger debater.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save/Dismiss Options */}
      {showSaveOptions && (
        <div className="flex justify-center space-x-4">
          <button
            onClick={savePractice}
            className="flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <Save size={20} />
            <span>Save Practice</span>
          </button>
          <button
            onClick={dismissPractice}
            className="flex items-center space-x-2 px-6 py-3 border-2 border-muted-foreground text-muted-foreground rounded-lg font-semibold hover:bg-muted transition-colors"
          >
            <X size={20} />
            <span>Dismiss Practice</span>
          </button>
        </div>
      )}

      {/* Skill Tips */}
      {!sessionEnded && (
        <div className="bg-muted/30 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Tips for {config.skill}</h3>
          <ul className="space-y-2">
            {getSkillTips().map((tip, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-primary font-bold">•</span>
                <span className="text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
