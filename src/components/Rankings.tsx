
import { Trophy, TrendingUp, Medal, Star, Users } from 'lucide-react';

export const Rankings = () => {
  const mockLeaderboard = [
    {
      rank: 1,
      name: "Alexandra Chen",
      country: "Singapore",
      rating: 2847,
      wins: 156,
      totalDebates: 182,
      winRate: 85.7,
      trend: "+47"
    },
    {
      rank: 2,
      name: "Marcus Thompson",
      country: "United Kingdom",
      rating: 2823,
      wins: 143,
      totalDebates: 168,
      winRate: 85.1,
      trend: "+23"
    },
    {
      rank: 3,
      name: "Sofia Rodriguez",
      country: "Spain",
      rating: 2801,
      wins: 134,
      totalDebates: 157,
      winRate: 85.4,
      trend: "+19"
    },
    {
      rank: 4,
      name: "You",
      country: "Your Country",
      rating: 1847,
      wins: 67,
      totalDebates: 89,
      winRate: 75.3,
      trend: "+156"
    }
  ];

  const achievements = [
    { title: "First Victory", description: "Won your first debate", earned: true },
    { title: "Winning Streak", description: "Won 5 debates in a row", earned: true },
    { title: "Global Competitor", description: "Debated with people from 10 countries", earned: true },
    { title: "AI Master", description: "Completed 50 AI practice sessions", earned: false },
    { title: "Tournament Champion", description: "Won a global tournament", earned: false },
    { title: "Debate Scholar", description: "Reached 2000+ rating", earned: false }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Medal className="text-yellow-500" size={24} />;
      case 2: return <Medal className="text-gray-400" size={24} />;
      case 3: return <Medal className="text-amber-600" size={24} />;
      default: return <span className="text-lg font-bold w-6 text-center">{rank}</span>;
    }
  };

  const getCountryFlag = (country: string) => {
    // Mock flag implementation
    const flags: { [key: string]: string } = {
      "Singapore": "🇸🇬",
      "United Kingdom": "🇬🇧",
      "Spain": "🇪🇸",
      "Your Country": "🌍"
    };
    return flags[country] || "🌍";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 gold-gradient rounded-xl flex items-center justify-center">
            <Trophy className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-bold">Global Rankings</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Compete with debaters worldwide and climb the leaderboards
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Leaderboard */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
              <Trophy size={20} />
              <span>Global Leaderboard</span>
            </h2>
            
            <div className="space-y-4">
              {mockLeaderboard.map((player) => (
                <div 
                  key={player.rank} 
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    player.name === "You" 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10">
                      {getRankIcon(player.rank)}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getCountryFlag(player.country)}</span>
                      <div>
                        <h3 className={`font-semibold ${player.name === "You" ? "text-primary" : ""}`}>
                          {player.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{player.country}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">{player.rating}</span>
                      <div className={`flex items-center text-sm ${
                        player.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp size={14} />
                        <span>{player.trend}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {player.wins}W / {player.totalDebates - player.wins}L ({player.winRate}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ranking Categories */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Regional Rankings</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Asia-Pacific</span>
                  <span className="font-semibold">#247</span>
                </div>
                <div className="flex justify-between">
                  <span>Your Country</span>
                  <span className="font-semibold">#18</span>
                </div>
                <div className="flex justify-between">
                  <span>Your City</span>
                  <span className="font-semibold">#3</span>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Format Rankings</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>WSDC (BP)</span>
                  <span className="font-semibold">#312</span>
                </div>
                <div className="flex justify-between">
                  <span>Public Forum</span>
                  <span className="font-semibold">#198</span>
                </div>
                <div className="flex justify-between">
                  <span>Overall</span>
                  <span className="font-semibold">#267</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Player Stats */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Your Stats</h3>
            <div className="space-y-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-3xl font-bold text-primary">1847</div>
                <div className="text-sm text-muted-foreground">Current Rating</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold">67</div>
                  <div className="text-xs text-muted-foreground">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">22</div>
                  <div className="text-xs text-muted-foreground">Losses</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">75.3%</div>
                  <div className="text-xs text-muted-foreground">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">12</div>
                  <div className="text-xs text-muted-foreground">Streak</div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Achievements</h3>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div 
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    achievement.earned ? 'bg-primary/5' : 'bg-muted/30'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    achievement.earned ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Star size={16} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium ${
                      achievement.earned ? '' : 'text-muted-foreground'
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
