
import { useState } from 'react';
import { Bot, Clock, Users, Target, ArrowRight, History } from 'lucide-react';
import { TopicSelector } from './TopicSelector';
import { PracticeSession } from './PracticeSession';
import { PracticeHistory } from './PracticeHistory';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type DebateFormat = 'WSDC' | 'PF';
export type Speaker = 'PM' | 'LO' | 'DPM' | 'DLO' | 'GW' | 'OW' | 'GR' | 'OR' | 'constructive' | 'rebuttal' | 'summary' | 'final-focus';
export type Skill = 'rebuttal' | 'argumentation' | 'weighing' | 'modeling' | 'case-building' | 'POI' | 'summary';

export interface PracticeConfig {
  format: DebateFormat;
  topic: string;
  speaker: Speaker;
  skill: Skill;
  timeLimit: number;
}

export const AIPractice = () => {
  const [currentStep, setCurrentStep] = useState<'config' | 'topic' | 'practice' | 'history'>('config');
  const [config, setConfig] = useState<Partial<PracticeConfig>>({});

  const speakers = {
    WSDC: [
      { id: 'PM' as Speaker, label: 'Prime Minister', description: 'Opening Government (1st)' },
      { id: 'LO' as Speaker, label: 'Leader of Opposition', description: 'Opening Opposition (1st)' },
      { id: 'DPM' as Speaker, label: 'Deputy Prime Minister', description: 'Opening Government (2nd)' },
      { id: 'DLO' as Speaker, label: 'Deputy Leader of Opposition', description: 'Opening Opposition (2nd)' },
      { id: 'GW' as Speaker, label: 'Government Whip', description: 'Closing Government (1st)' },
      { id: 'OW' as Speaker, label: 'Opposition Whip', description: 'Closing Opposition (1st)' },
      { id: 'GR' as Speaker, label: 'Government Reply', description: 'Closing Government (2nd)' },
      { id: 'OR' as Speaker, label: 'Opposition Reply', description: 'Closing Opposition (2nd)' },
    ],
    PF: [
      { id: 'constructive' as Speaker, label: 'Constructive', description: 'Opening case presentation' },
      { id: 'rebuttal' as Speaker, label: 'Rebuttal', description: 'Attacking opponent arguments' },
      { id: 'summary' as Speaker, label: 'Summary', description: 'Crystallizing key issues' },
      { id: 'final-focus' as Speaker, label: 'Final Focus', description: 'Closing arguments and weighing' },
    ],
  };

  const skills = [
    { id: 'argumentation' as Skill, label: 'Argumentation', description: 'Building strong logical arguments' },
    { id: 'rebuttal' as Skill, label: 'Rebuttal', description: 'Attacking opponent arguments' },
    { id: 'weighing' as Skill, label: 'Weighing', description: 'Comparative impact analysis' },
    { id: 'modeling' as Skill, label: 'Modeling', description: 'Defining the motion and framework' },
    { id: 'case-building' as Skill, label: 'Case Building', description: 'Constructing comprehensive cases' },
    { id: 'POI' as Skill, label: 'Points of Information', description: 'Strategic interventions' },
    { id: 'summary' as Skill, label: 'Summary', description: 'Crystallizing key issues' },
  ];

  const handleTopicSelected = (topic: string) => {
    setConfig(prev => ({ ...prev, topic }));
    setCurrentStep('practice');
  };

  if (currentStep === 'history') {
    return (
      <PracticeHistory
        onBack={() => setCurrentStep('config')}
      />
    );
  }

  if (currentStep === 'topic') {
    return (
      <TopicSelector
        onTopicSelected={handleTopicSelected}
        onBack={() => setCurrentStep('config')}
      />
    );
  }

  if (currentStep === 'practice' && config.topic) {
    return (
      <PracticeSession
        config={config as PracticeConfig}
        onBack={() => setCurrentStep('config')}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
      <div className="text-center space-y-4 pb-2">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-14 h-14 debate-gradient rounded-2xl flex items-center justify-center shadow-md">
            <Bot className="text-primary-foreground" size={26} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">AI Practice Arena</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Practice with our advanced AI coach and improve your debate skills
        </p>
        <Button
          variant="outline"
          onClick={() => setCurrentStep('history')}
          className="gap-2"
        >
          <History size={18} />
          My Practice History
        </Button>
      </div>

      <div className="grid gap-10">
        {/* Format Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Target size={20} className="text-primary" />
            <span>Select Debate Format</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {(['WSDC', 'PF'] as DebateFormat[]).map((format) => (
              <button
                key={format}
                onClick={() => setConfig(prev => ({ ...prev, format }))}
                className={cn(
                  'selection-card p-6',
                  config.format === format && 'selection-card-active'
                )}
              >
                <h3 className="text-lg font-semibold mb-2">
                  {format === 'WSDC' ? 'World Schools (WSDC)' : 'Public Forum (PF)'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {format === 'WSDC'
                    ? 'British Parliamentary style with 8 speakers total'
                    : 'American style with 2 speakers per side'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Speaker Selection */}
        {config.format && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users size={20} className="text-primary" />
              <span>Choose Speaker Position</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {speakers[config.format].map((speaker) => (
                <button
                  key={speaker.id}
                  onClick={() => setConfig(prev => ({ ...prev, speaker: speaker.id }))}
                  className={cn(
                    'selection-card',
                    config.speaker === speaker.id && 'selection-card-active'
                  )}
                >
                  <h4 className="font-semibold">{speaker.label}</h4>
                  <p className="text-sm text-muted-foreground">{speaker.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Skill Selection */}
        {config.speaker && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Target size={20} className="text-primary" />
              <span>Focus Skill</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {skills
                .filter((skill) => {
                  // Remove rebuttal option for Prime Minister since first speaker doesn't rebut
                  if (config.speaker === 'PM' && skill.id === 'rebuttal') {
                    return false;
                  }
                  return true;
                })
                .map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => setConfig(prev => ({ ...prev, skill: skill.id }))}
                  className={cn(
                    'selection-card',
                    config.skill === skill.id && 'selection-card-active'
                  )}
                >
                  <h4 className="font-medium">{skill.label}</h4>
                  <p className="text-xs text-muted-foreground">{skill.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Time Limit */}
        {config.skill && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock size={20} className="text-primary" />
              <span>Speech Duration</span>
            </h2>
            <div className="flex flex-wrap gap-3">
              {[3, 5, 7, 8].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => setConfig(prev => ({ ...prev, timeLimit: minutes }))}
                  className={cn(
                    'selection-card px-6 py-3',
                    config.timeLimit === minutes && 'selection-card-active'
                  )}
                >
                  {minutes} minutes
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Next Button */}
        {config.timeLimit && (
          <div className="flex justify-center pt-4">
            <Button
              variant="gradient"
              size="lg"
              onClick={() => setCurrentStep('topic')}
              className="gap-2 font-semibold px-8"
            >
              Choose Topic
              <ArrowRight size={20} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
