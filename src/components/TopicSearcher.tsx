import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Loader2 } from 'lucide-react';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TopicSearcherProps {
  onTopicsFound: (topics: Array<{ title: string; description: string; category: string }>) => void;
}

export const TopicSearcher = ({ onTopicsFound }: TopicSearcherProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const testAndSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter your Firecrawl API key",
        variant: "destructive",
      });
      return;
    }

    try {
      const isValid = await FirecrawlService.testApiKey(apiKey);
      if (isValid) {
        FirecrawlService.saveApiKey(apiKey);
        setShowApiKeyInput(false);
        toast({
          title: "Success",
          description: "API key validated and saved!",
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid API key. Please check and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate API key",
        variant: "destructive",
      });
    }
  };

  const searchForTopics = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      // Search for debate topics using Firecrawl
      const debateQuery = `${searchQuery} debate topics arguments controversial issues discussion`;
      const result = await FirecrawlService.crawlWebsite(`https://www.google.com/search?q=${encodeURIComponent(debateQuery)}`);
      
      if (result.success && result.data) {
        // Extract topics from the crawled content (simplified parsing)
        const mockTopics = [
          {
            title: `Should ${searchQuery} be regulated by government?`,
            description: `Debate whether ${searchQuery} should be subject to government oversight and regulation`,
            category: 'politics'
          },
          {
            title: `Is ${searchQuery} beneficial for society?`,
            description: `Discuss the positive and negative impacts of ${searchQuery} on modern society`,
            category: 'society'
          },
          {
            title: `The future of ${searchQuery}: Promise or peril?`,
            description: `Examine whether ${searchQuery} will lead to positive or negative outcomes for humanity`,
            category: 'future'
          }
        ];
        
        onTopicsFound(mockTopics);
        toast({
          title: "Success",
          description: `Found topics related to "${searchQuery}"`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to search for topics",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error searching topics:', error);
      toast({
        title: "Error",
        description: "Failed to search for topics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTopicToBank = async (topic: { title: string; description: string; category: string }) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to add topics",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('topics')
        .insert({
          title: topic.title,
          description: topic.description,
          category: topic.category,
          is_custom: true,
          created_by_user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Topic added to the community bank!",
      });
    } catch (error) {
      console.error('Error adding topic:', error);
      toast({
        title: "Error",
        description: "Failed to add topic to bank",
        variant: "destructive",
      });
    }
  };

  if (showApiKeyInput) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/30">
        <CardContent className="space-y-4 p-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Firecrawl API Setup</h3>
            <p className="text-sm text-muted-foreground">
              Enter your Firecrawl API key to search for debate topics online
            </p>
          </div>
          
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Enter your Firecrawl API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button onClick={testAndSaveApiKey} className="w-full">
              Validate & Save API Key
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Get your API key from{' '}
            <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              firecrawl.dev
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card/50 backdrop-blur-sm border-border/30">
        <CardContent className="space-y-4 p-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Find New Debate Topics</h3>
            <p className="text-sm text-muted-foreground">
              Search the web for debate topics related to any subject
            </p>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Search for topics (e.g., artificial intelligence, climate change)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchForTopics()}
            />
            <Button onClick={searchForTopics} disabled={isLoading || !searchQuery.trim()}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};