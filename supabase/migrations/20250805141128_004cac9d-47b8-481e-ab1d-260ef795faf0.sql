-- Create storage policies for audio-posts bucket to allow users to upload session recordings
CREATE POLICY "Users can upload session recordings" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'audio-posts' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view session recordings" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'audio-posts');

CREATE POLICY "Users can update their session recordings" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'audio-posts' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their session recordings" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'audio-posts' AND auth.uid() IS NOT NULL);