
import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, Bot, MessageSquare, Trash2 } from 'lucide-react';

interface PracticeRecord {
  id: string;
  date: string;
  format: string;
  topic: string;
  speaker: string;
  skill: string;
  duration: number;
  timeUsed: number;
  completed: boolean;
  transcript?: string;
  feedback?: {
    score: number;
    strengths: string;
    improvements: string;
    specific: string;
    timing: string;
    timeUsed: string;
    totalTime: string;
  };
  saved: boolean;
}

interface PracticeHistoryProps {
  onBack: () => void;
}

export const PracticeHistory = ({ onBack }: PracticeHistoryProps) => {
  const [history, setHistory] = useState<PracticeRecord[]>([]);
  const [selectedPractice, setSelectedPractice] = useState<PracticeRecord | null>(null);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('practiceHistory') || '[]');
    setHistory(savedHistory.filter((record: PracticeRecord) => record.saved));
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const deletePractice = (id: string) => {
    const updatedHistory = history.filter(record => record.id !== id);
    setHistory(updatedHistory);
    
    const allHistory = JSON.parse(localStorage.getItem('practiceHistory') || '[]');
    const filteredHistory = allHistory.filter((record: PracticeRecord) => record.id !== id);
    localStorage.setItem('practiceHistory', JSON.stringify(filteredHistory));
    
    if (selectedPractice?.id === id) {
      setSelectedPractice(null);
    }
  };

  if (selectedPractice) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedPractice(null)}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to History</span>
          </button>
          <h1 className="text-xl font-bold">Practice Details</h1>
          <div></div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Practice Session</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div><strong>Date:</strong> {formatDate(selectedPractice.date)}</div>
            <div><strong>Format:</strong> {selectedPractice.format}</div>
            <div><strong>Speaker:</strong> {selectedPractice.speaker}</div>
            <div><strong>Skill:</strong> {selectedPractice.skill}</div>
            <div><strong>Duration:</strong> {selectedPractice.duration} minutes</div>
            <div><strong>Time Used:</strong> {formatTime(selectedPractice.timeUsed)}</div>
          </div>
          <div className="mt-4">
            <strong>Topic:</strong> {selectedPractice.topic}
          </div>
        </div>

        {selectedPractice.transcript && (
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center space-x-2">
              <MessageSquare size={18} />
              <span>Speech Transcript</span>
            </h3>
            <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-4 max-h-60 overflow-y-auto">
              {selectedPractice.transcript}
            </div>
          </div>
        )}

        {selectedPractice.feedback && (
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot className="text-white" size={20} />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">AI Coach Feedback</h3>
                  <div className="bg-accent/20 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium text-accent">Score: {selectedPractice.feedback.score}/100</span>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Strengths</h4>
                    <p className="text-sm text-green-700">{selectedPractice.feedback.strengths}</p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Areas for Improvement</h4>
                    <p className="text-sm text-blue-700">{selectedPractice.feedback.improvements}</p>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-2">Specific Recommendations</h4>
                    <p className="text-sm text-purple-700">{selectedPractice.feedback.specific}</p>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-medium text-orange-800 mb-2">Time Management</h4>
                    <p className="text-sm text-orange-700 mb-2">{selectedPractice.feedback.timing}</p>
                    <div className="flex items-center space-x-4 text-xs text-orange-600">
                      <span>Time Used: <strong>{selectedPractice.feedback.timeUsed}</strong></span>
                      <span>Total Time: <strong>{selectedPractice.feedback.totalTime}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to AI Practice</span>
        </button>
        <h1 className="text-xl font-bold">Practice History</h1>
        <div></div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="text-lg font-semibold mb-2">No Practice History</h3>
          <p className="text-muted-foreground">Start practicing to build your history!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((record) => (
            <div
              key={record.id}
              className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedPractice(record)}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold">{record.format} • {record.speaker}</span>
                    <span className="text-sm text-muted-foreground flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{formatDate(record.date)}</span>
                    </span>
                  </div>
                  <p className="text-sm text-primary font-medium">{record.topic}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Focus: {record.skill}</span>
                    <span>Time: {formatTime(record.timeUsed)} / {record.duration}min</span>
                    <span className={record.completed ? 'text-green-600' : 'text-yellow-600'}>
                      {record.completed ? 'Completed' : 'Ended Early'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePractice(record.id);
                  }}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
