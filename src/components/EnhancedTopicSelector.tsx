import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Shuffle, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { TopicSearcher } from './TopicSearcher';

interface TopicSelectorProps {
  onTopicSelected: (topic: { title: string; description: string }) => void;
  onBack: () => void;
}

interface Topic {
  title: string;
  description: string;
  category: string;
  difficulty: string;
}

export const EnhancedTopicSelector = ({ onTopicSelected, onBack }: TopicSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customTopic, setCustomTopic] = useState({ title: '', description: '' });
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTopicSearcher, setShowTopicSearcher] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const categories = ['all', 'politics', 'technology', 'science', 'environment', 'education', 'society', 'customized'];

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedTopics: Topic[] = (data || []).map(topic => ({
        title: topic.title,
        description: topic.description,
        category: topic.is_custom ? 'customized' : topic.category,
        difficulty: topic.difficulty
      }));
      
      setTopics(formattedTopics);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast({
        title: "Error",
        description: "Failed to load topics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getRandomTopic = () => {
    if (topics.length === 0) return;
    const randomIndex = Math.floor(Math.random() * topics.length);
    const topic = topics[randomIndex];
    onTopicSelected(topic);
  };

  const handleCustomTopicSubmit = async () => {
    if (!customTopic.title.trim() || !customTopic.description.trim()) return;
    
    if (user) {
      try {
        const { error } = await supabase
          .from('topics')
          .insert({
            title: customTopic.title,
            description: customTopic.description,
            category: 'general',
            is_custom: true,
            created_by_user_id: user.id
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Custom topic added to the community bank!",
        });
        
        fetchTopics(); // Refresh topics
      } catch (error) {
        console.error('Error creating custom topic:', error);
        toast({
          title: "Error",
          description: "Failed to save custom topic",
          variant: "destructive",
        });
      }
    }
    
    onTopicSelected(customTopic);
  };

  const handleTopicsFound = async (newTopics: Array<{ title: string; description: string; category: string }>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('topics')
        .insert(
          newTopics.map(topic => ({
            title: topic.title,
            description: topic.description,
            category: topic.category,
            is_custom: true,
            created_by_user_id: user.id
          }))
        );

      if (error) throw error;

      toast({
        title: "Success",
        description: `Added ${newTopics.length} new topics to the bank!`,
      });
      
      fetchTopics(); // Refresh topics
      setShowTopicSearcher(false);
    } catch (error) {
      console.error('Error adding topics:', error);
      toast({
        title: "Error",
        description: "Failed to add some topics",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-300';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-300';
      case 'advanced': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-pulse">Loading topics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Setup
        </Button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Choose Your Topic
        </h1>
        <div></div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <Button onClick={getRandomTopic} variant="outline" className="gap-2">
            <Shuffle className="w-4 h-4" />
            Random Topic
          </Button>
          <Button 
            onClick={() => setShowTopicSearcher(!showTopicSearcher)} 
            variant="outline" 
            className="gap-2"
          >
            <Search className="w-4 h-4" />
            Find More Topics
          </Button>
        </div>
      </div>

      {showTopicSearcher && (
        <div className="mb-6">
          <TopicSearcher onTopicsFound={handleTopicsFound} />
        </div>
      )}

      <Card className="bg-card/50 backdrop-blur-sm border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Custom Topic
          </CardTitle>
          <CardDescription>Design your own debate topic for the community</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Topic title"
            value={customTopic.title}
            onChange={(e) => setCustomTopic(prev => ({ ...prev, title: e.target.value }))}
          />
          <Input
            placeholder="Topic description"
            value={customTopic.description}
            onChange={(e) => setCustomTopic(prev => ({ ...prev, description: e.target.value }))}
          />
          <Button 
            onClick={handleCustomTopicSubmit}
            disabled={!customTopic.title.trim() || !customTopic.description.trim()}
            className="w-full"
          >
            Practice with Custom Topic
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.map((topic, index) => (
          <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/30 hover:shadow-lg transition-shadow">
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between">
                <Badge className={getDifficultyColor(topic.difficulty)}>
                  {topic.difficulty}
                </Badge>
                <Badge variant="outline">
                  {topic.category}
                </Badge>
              </div>
              <CardTitle className="text-base leading-tight">
                {topic.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {topic.description}
              </p>
              
              <Button
                onClick={() => onTopicSelected(topic)}
                className="w-full"
                variant="outline"
              >
                Select Topic
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/30">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No topics found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};