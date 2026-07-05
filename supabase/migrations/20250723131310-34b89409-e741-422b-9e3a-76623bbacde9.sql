-- Fix the foreign key relationship for posts to profiles
ALTER TABLE public.posts 
ADD CONSTRAINT posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);

-- Create a topics table to store debate topics
CREATE TABLE public.topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  is_custom BOOLEAN NOT NULL DEFAULT false,
  created_by_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on topics table
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- Create policies for topics table
CREATE POLICY "Topics are viewable by everyone" 
ON public.topics 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create custom topics" 
ON public.topics 
FOR INSERT 
WITH CHECK (auth.uid() = created_by_user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_topics_updated_at
BEFORE UPDATE ON public.topics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some debate topics
INSERT INTO public.topics (title, description, category, difficulty) VALUES
  ('Should social media platforms have stronger content moderation?', 'Debate whether social media companies should increase censorship and content filtering', 'technology', 'intermediate'),
  ('Is artificial intelligence a threat to humanity?', 'Discuss the potential risks and benefits of advanced AI systems', 'technology', 'advanced'),
  ('Should university education be free for all?', 'Argue for or against making higher education universally accessible', 'education', 'beginner'),
  ('Is climate change the most pressing global issue?', 'Debate priorities in addressing global challenges', 'environment', 'intermediate'),
  ('Should voting be mandatory in democratic societies?', 'Discuss compulsory voting and its impact on democracy', 'politics', 'intermediate'),
  ('Are electric vehicles the future of transportation?', 'Debate the viability and necessity of electric vehicle adoption', 'environment', 'beginner'),
  ('Should genetic engineering be used to enhance humans?', 'Explore the ethics of human genetic modification', 'science', 'advanced'),
  ('Is remote work better than office work?', 'Compare the benefits and drawbacks of different work arrangements', 'society', 'beginner'),
  ('Should cryptocurrency replace traditional currency?', 'Debate the future of digital vs traditional money systems', 'economics', 'intermediate'),
  ('Is space exploration worth the cost?', 'Argue for or against investing in space programs', 'science', 'intermediate');

-- Create a practice_matches table for real-time practice sessions
CREATE TABLE public.practice_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_user_id UUID NOT NULL,
  opponent_user_id UUID,
  topic_id UUID REFERENCES public.topics(id),
  topic_title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting', -- waiting, active, completed, cancelled
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  winner_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on practice_matches table
ALTER TABLE public.practice_matches ENABLE ROW LEVEL SECURITY;

-- Create policies for practice_matches table
CREATE POLICY "Practice matches are viewable by everyone" 
ON public.practice_matches 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create practice matches" 
ON public.practice_matches 
FOR INSERT 
WITH CHECK (auth.uid() = creator_user_id);

CREATE POLICY "Participants can update practice matches" 
ON public.practice_matches 
FOR UPDATE 
USING (auth.uid() = creator_user_id OR auth.uid() = opponent_user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_practice_matches_updated_at
BEFORE UPDATE ON public.practice_matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();