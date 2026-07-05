
import { useState, useEffect } from 'react';
import { Clock, User, MessageSquare, Target, TrendingUp, Loader2 } from 'lucide-react';
import { PracticeConfig } from './AIPractice';
import { supabase } from '@/integrations/supabase/client';

interface DebateTrackerProps {
  config: PracticeConfig;
  transcript: string;
  timeElapsed: number;
  isActive: boolean;
}

export const DebateTracker = ({ config, transcript, timeElapsed, isActive }: DebateTrackerProps) => {
  const [debateContext, setDebateContext] = useState<string>('');
  const [loadingContext, setLoadingContext] = useState(false);

  useEffect(() => {
    generateDebateContext();
  }, [config.topic, config.format, config.speaker]);

  const generateDebateContext = async () => {
    setLoadingContext(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-debate-context', {
        body: {
          topic: config.topic,
          format: config.format,
          speaker: config.speaker
        }
      });

      if (error) throw error;
      setDebateContext(data.context || 'Context generation temporarily unavailable.');
    } catch (error) {
      console.error('Error generating debate context:', error);
      setDebateContext(getTopicSpecificContext(config.topic).currentFocus);
    } finally {
      setLoadingContext(false);
    }
  };

  const getTopicSpecificContext = (topic: string) => {
    // Fallback context generation
    const contexts = {
      'Technology': {
        keyAreas: ['Privacy & Data', 'Innovation vs Regulation', 'Digital Divide', 'Automation Impact'],
        currentFocus: 'Examining technological advancement implications',
        stakeholders: ['Consumers', 'Tech Companies', 'Governments', 'Society']
      },
      'Environment': {
        keyAreas: ['Climate Action', 'Economic Impact', 'International Cooperation', 'Individual vs Collective'],
        currentFocus: 'Analyzing environmental policy effectiveness',
        stakeholders: ['Future Generations', 'Developing Nations', 'Industries', 'Environmental Groups']
      },
      'Education': {
        keyAreas: ['Access & Equity', 'Teaching Methods', 'Funding', 'Technology Integration'],
        currentFocus: 'Evaluating educational system reforms',
        stakeholders: ['Students', 'Teachers', 'Parents', 'Educational Institutions']
      },
      'default': {
        keyAreas: ['Core Arguments', 'Evidence Quality', 'Logical Structure', 'Counter-arguments'],
        currentFocus: 'Building comprehensive case analysis',
        stakeholders: ['Primary Actors', 'Secondary Effects', 'Long-term Impact', 'Broader Society']
      }
    };

    const topicKey = Object.keys(contexts).find(key => 
      topic.toLowerCase().includes(key.toLowerCase())
    ) || 'default';
    
    return contexts[topicKey as keyof typeof contexts];
  };

  const analyzeTranscript = (text: string) => {
    const words = text.split(' ').filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgWordsPerSentence: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
      pace: words.length > 0 ? Math.round((words.length / Math.max(timeElapsed, 1)) * 60) : 0
    };
  };

  const getSpeechQualityIndicators = (analysis: any) => {
    const indicators = [];
    
    if (analysis.pace > 120 && analysis.pace < 180) {
      indicators.push({ type: 'good', text: 'Good speaking pace' });
    } else if (analysis.pace > 180) {
      indicators.push({ type: 'warning', text: 'Speaking too fast' });
    } else if (analysis.pace < 120 && analysis.pace > 0) {
      indicators.push({ type: 'warning', text: 'Speaking too slow' });
    }

    if (analysis.avgWordsPerSentence > 15 && analysis.avgWordsPerSentence < 25) {
      indicators.push({ type: 'good', text: 'Well-structured sentences' });
    } else if (analysis.avgWordsPerSentence > 25) {
      indicators.push({ type: 'warning', text: 'Sentences too long' });
    }

    return indicators;
  };

  const topicContext = getTopicSpecificContext(config.topic);
  const speechAnalysis = analyzeTranscript(transcript);
  const qualityIndicators = getSpeechQualityIndicators(speechAnalysis);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <h3 className="text-lg font-semibold">Debate Progress</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-muted-foreground" />
            <span className="text-sm">Time: {formatTime(timeElapsed)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <User size={16} className="text-muted-foreground" />
            <span className="text-sm">{config.speaker}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MessageSquare size={16} className="text-muted-foreground" />
            <span className="text-sm">{speechAnalysis.wordCount} words</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp size={16} className="text-muted-foreground" />
            <span className="text-sm">{speechAnalysis.pace} WPM</span>
          </div>
        </div>
      </div>

      {/* AI-Generated Debate Context */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Target size={20} className="text-primary" />
          <h3 className="text-lg font-semibold">Debate So Far</h3>
          {loadingContext && <Loader2 size={16} className="animate-spin" />}
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {debateContext || 'Generating context...'}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Key Areas to Address</h4>
            <div className="grid grid-cols-2 gap-2">
              {topicContext.keyAreas.map((area, index) => (
                <div key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {area}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Key Stakeholders</h4>
            <div className="flex flex-wrap gap-1">
              {topicContext.stakeholders.map((stakeholder, index) => (
                <span key={index} className="text-xs bg-muted px-2 py-1 rounded">
                  {stakeholder}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Speech Quality */}
      {transcript && (
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Speech Quality</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Sentences:</span>
              <span>{speechAnalysis.sentenceCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Avg. words/sentence:</span>
              <span>{speechAnalysis.avgWordsPerSentence}</span>
            </div>
            
            {qualityIndicators.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Live Feedback</h4>
                {qualityIndicators.map((indicator, index) => (
                  <div key={index} className={`text-xs px-2 py-1 rounded mb-1 ${
                    indicator.type === 'good' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {indicator.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skill Focus */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Skill Focus: {config.skill}</h3>
        
        <div className="text-sm text-muted-foreground">
          {config.skill === 'argumentation' && (
            <p>Focus on: Clear claim → Evidence → Impact chain. Build logically connected arguments.</p>
          )}
          {config.skill === 'rebuttal' && (
            <p>Focus on: Identify → Analyze → Counter. Address opponent's strongest points directly.</p>
          )}
          {config.skill === 'weighing' && (
            <p>Focus on: Compare impacts, timeframe, probability. Show why your side matters more.</p>
          )}
          {config.skill === 'modeling' && (
            <p>Focus on: Define key terms, set clear parameters, establish the framework for debate.</p>
          )}
          {config.skill === 'case-building' && (
            <p>Focus on: Structure your case logically, connect all arguments to the motion.</p>
          )}
          {config.skill === 'POI' && (
            <p>Focus on: Ask strategic questions that advance your case or expose weaknesses.</p>
          )}
          {config.skill === 'summary' && (
            <p>Focus on: Crystalize key clashes, emphasize your strongest arguments, provide closure.</p>
          )}
        </div>
      </div>
    </div>
  );
};
