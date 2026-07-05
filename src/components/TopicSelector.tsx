
import { useState, useEffect } from 'react';
import { Search, Shuffle, ArrowLeft, ExternalLink, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TopicSelectorProps {
  onTopicSelected: (topic: string) => void;
  onBack: () => void;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
}

export const TopicSelector = ({ onTopicSelected, onBack }: TopicSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customTopic, setCustomTopic] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(['all']);
  const { toast } = useToast();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('title');

      if (error) throw error;

      setTopics(data || []);
      
      // Extract unique categories
      const uniqueCategories = ['all', ...new Set(data?.map(topic => topic.category) || [])];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast({
        title: "Error",
        description: "Failed to load topics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getRandomTopic = () => {
    if (topics.length > 0) {
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      onTopicSelected(randomTopic.title);
    }
  };

  const handleCustomTopicSubmit = () => {
    if (customTopic.trim()) {
      onTopicSelected(customTopic.trim());
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center py-12">
          <div className="animate-pulse text-lg">Loading topics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Setup</span>
        </button>
        <h1 className="text-2xl font-bold">Choose Your Topic</h1>
        <div></div>
      </div>

      {/* Search and Filters */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>

        <button
          onClick={getRandomTopic}
          className="flex items-center justify-center space-x-2 px-4 py-3 gold-gradient text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Shuffle size={20} />
          <span>Random</span>
        </button>
      </div>

      {/* Custom Topic */}
      <div className="border rounded-lg p-6 bg-muted/30">
        <h3 className="text-lg font-semibold mb-3">Create Custom Topic</h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter your own debate motion..."
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleCustomTopicSubmit()}
          />
          <button
            onClick={handleCustomTopicSubmit}
            disabled={!customTopic.trim()}
            className="px-6 py-3 debate-gradient text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
          >
            Practice
          </button>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopics.map((topic) => (
          <div key={topic.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-card">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(topic.difficulty)}`}>
                  {topic.difficulty}
                </span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {topic.category}
                </span>
              </div>
              
              <h3 className="font-semibold text-sm leading-tight">
                {topic.title}
              </h3>
              
              <p className="text-muted-foreground text-sm">
                {topic.description}
              </p>
              
              <button
                onClick={() => onTopicSelected(topic.title)}
                className="w-full py-2 px-4 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Select Topic
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No topics found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};
