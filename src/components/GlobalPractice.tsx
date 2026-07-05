import { useState, useEffect } from 'react';
import { Globe, Users, Clock, MapPin, Star } from 'lucide-react';
import { JoinSession } from './JoinSession';

export const GlobalPractice = () => {
  const [activeTab, setActiveTab] = useState<'find' | 'create'>('find');
  const [joinedSessionId, setJoinedSessionId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const mockSessions = [
    {
      id: 1,
      title: "WSDC Practice - Technology Motions",
      host: "Sarah Chen",
      country: "Singapore",
      participants: 3,
      maxParticipants: 8,
      startTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
      level: "Intermediate",
      rating: 4.8
    },
    {
      id: 2,
      title: "Public Forum - Economics Debate",
      host: "Marcus Johnson",
      country: "United States",
      participants: 5,
      maxParticipants: 6,
      startTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      level: "Advanced",
      rating: 4.9
    },
    {
      id: 3,
      title: "Beginner-Friendly WSDC",
      host: "Emma Thompson",
      country: "United Kingdom",
      participants: 2,
      maxParticipants: 8,
      startTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      level: "Beginner",
      rating: 4.7
    }
  ];

  const getTimeUntilStart = (startTime: Date) => {
    const diff = startTime.getTime() - currentTime.getTime();
    
    if (diff <= 0) {
      return "Session started";
    }
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const canJoinSession = (startTime: Date) => {
    const diff = startTime.getTime() - currentTime.getTime();
    return diff <= 5 * 60 * 1000; // Can join 5 minutes before start
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleJoinSession = (sessionId: number) => {
    setJoinedSessionId(sessionId.toString());
  };

  const handleLeaveSession = () => {
    setJoinedSessionId(null);
  };

  if (joinedSessionId) {
    return <JoinSession sessionId={joinedSessionId} onBack={handleLeaveSession} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 debate-gradient rounded-xl flex items-center justify-center">
            <Globe className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-bold">Global Practice Arena</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Connect with debaters worldwide and practice together in real-time
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-muted p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('find')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'find'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Find Sessions
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Create Session
          </button>
        </div>
      </div>

      {activeTab === 'find' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Filter Sessions</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                <option>All Formats</option>
                <option>WSDC</option>
                <option>Public Forum</option>
              </select>
              <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                <option>All Levels</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
              <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                <option>Starting Soon</option>
                <option>Next Hour</option>
                <option>Today</option>
                <option>This Week</option>
              </select>
              <input
                type="text"
                placeholder="Search by topic..."
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-4">
            {mockSessions.map((session) => {
              const timeUntilStart = getTimeUntilStart(session.startTime);
              const canJoin = canJoinSession(session.startTime);
              
              return (
                <div key={session.id} className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{session.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(session.level)}`}>
                          {session.level}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Users size={16} />
                          <span>Host: {session.host}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin size={16} />
                          <span>{session.country}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={16} />
                          <span>
                            {timeUntilStart === "Session started" ? "Live now" : `Starts in ${timeUntilStart}`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star size={16} />
                          <span>{session.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{session.participants}/{session.maxParticipants}</div>
                        <div className="text-xs text-muted-foreground">participants</div>
                      </div>
                      <button 
                        onClick={() => handleJoinSession(session.id)}
                        disabled={!canJoin && timeUntilStart !== "Session started"}
                        className={`px-6 py-2 rounded-lg font-medium transition-opacity ${
                          canJoin || timeUntilStart === "Session started"
                            ? 'debate-gradient text-white hover:opacity-90'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {timeUntilStart === "Session started" ? "Join Live" : canJoin ? "Join Session" : "Wait to Join"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border rounded-lg p-8">
            <h3 className="text-xl font-semibold mb-6">Create New Practice Session</h3>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Session Title</label>
                <input
                  type="text"
                  placeholder="e.g., WSDC Practice - Social Media Motions"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Format</label>
                  <select className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option>WSDC (World Schools)</option>
                    <option>Public Forum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Skill Level</label>
                  <select className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>Mixed</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Max Participants</label>
                  <select className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option>4 participants</option>
                    <option>6 participants</option>
                    <option>8 participants</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Start Time</label>
                  <select className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option>Immediately</option>
                    <option>In 15 minutes</option>
                    <option>In 30 minutes</option>
                    <option>In 1 hour</option>
                    <option>Custom time</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Session Description</label>
                <textarea
                  placeholder="Describe what you'd like to practice, any specific focus areas, or house rules..."
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={4}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 debate-gradient text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Create Session
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
