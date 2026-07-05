-- Enable realtime for practice_matches table
ALTER TABLE public.practice_matches REPLICA IDENTITY FULL;

-- Add the table to realtime publication if not already added
SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'practice_matches';

-- If the above query returns no rows, add the table to realtime
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'practice_matches'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.practice_matches;
    END IF;
END $$;