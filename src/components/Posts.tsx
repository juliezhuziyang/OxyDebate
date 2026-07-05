import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Heart, MessageCircle, Share2, Play, Pause, Mic, Square, Upload, Download, Trash } from 'lucide-react';
import { useRoles } from '@/hooks/useRoles';
interface Post {
  id: string;
  title: string;
  content: string;
  post_type: string;
  audio_url?: string | null;
  video_url?: string | null;
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  quoted_post_id?: string | null;
  profiles: {
    display_name: string | null;
    username?: string | null;
    avatar_url?: string | null;
  } | null;
}

export const Posts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [quotingPost, setQuotingPost] = useState<Post | null>(null);
  const [newPost, setNewPost] = useState<{
    title: string;
    content: string;
    tags: string;
    post_type: 'text' | 'audio' | 'video';
  }>({
    title: '',
    content: '',
    tags: '',
    post_type: 'text'
  });
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Audio playback states
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
  // UI states
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<{[postId: string]: any[]}>({});
  const [uploading, setUploading] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { isAdmin } = useRoles();
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // First get all posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Get unique user IDs
      const userIds = [...new Set(postsData?.map(post => post.user_id) || [])];
      
      // Fetch profiles for those user IDs - only select public fields for security
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of user_id to profile
      const profilesMap = new Map(profilesData?.map(profile => [profile.user_id, profile]) || []);

      // Combine posts with their profiles
      const postsWithProfiles = postsData?.map(post => ({
        ...post,
        profiles: profilesMap.get(post.user_id) || null
      })) || [];

      setPosts(postsWithProfiles);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (currentAudio) {
        currentAudio.pause();
      }
    };
  }, [stream, currentAudio]);

  // Recording functions
  const startRecording = async () => {
    try {
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        toast({
          title: "Error",
          description: "Your browser doesn't support audio recording",
          variant: "destructive",
        });
        return;
      }

      const userStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      setStream(userStream);
      
      const recorder = new MediaRecorder(userStream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        userStream.getTracks().forEach(track => track.stop());
        setStream(null);
        
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
      };

      recorder.onstart = () => {
        setRecordingTime(0);
        recordingTimerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      };

      recorder.onpause = () => {
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
      };

      recorder.onresume = () => {
        recordingTimerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      };

      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
      setIsRecording(true);
      setIsPaused(false);
      
      toast({
        title: "Recording started",
        description: "Speak into your microphone",
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      setIsPaused(true);
      toast({
        title: "Recording paused",
        description: "Click resume to continue",
      });
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      setIsPaused(false);
      toast({
        title: "Recording resumed",
        description: "Continue speaking",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      setMediaRecorder(null);
      setRecordingTime(0);
      
      toast({
        title: "Recording stopped",
        description: "Your audio is ready to upload",
      });
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      setMediaRecorder(null);
      setRecordingTime(0);
      setAudioBlob(null);
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  // File upload functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setAudioBlob(file);
        toast({
          title: "Audio file loaded",
          description: `Loaded ${file.name}`,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an audio file",
          variant: "destructive",
        });
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const uploadAudioToStorage = async (audioBlob: Blob): Promise<string | null> => {
    try {
      setUploading(true);
      const fileName = `${user!.id}/${Date.now()}.webm`;
      
      const { data, error } = await supabase.storage
        .from('audio-posts')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
          upsert: false
        });

      if (error) throw error;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio-posts')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload audio file",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const createPost = async () => {
    if (!user || !newPost.title.trim() || !newPost.content.trim()) return;
    
    if (newPost.post_type === 'audio' && !audioBlob) {
      toast({
        title: "Audio Required",
        description: "Please record or upload an audio file",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      let audioUrl = null;
      
      if (newPost.post_type === 'audio' && audioBlob) {
        audioUrl = await uploadAudioToStorage(audioBlob);
        if (!audioUrl) {
          // Upload failed, don't create the post
          return;
        }
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          title: newPost.title,
          content: newPost.content,
          post_type: newPost.post_type,
          audio_url: audioUrl,
          tags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          user_id: user.id,
          quoted_post_id: quotingPost?.id || null,
        } as any);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post created successfully!",
      });

      setNewPost({ title: '', content: '', tags: '', post_type: 'text' });
      setShowCreateForm(false);
      setAudioBlob(null);
      setQuotingPost(null);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if already liked
      const { data: existingLike, error: checkError } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        toast({
          title: "Unlike",
          description: "Removed like from post",
        });
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });
        
        if (error) throw error;
        
        toast({
          title: "Liked!",
          description: "Added like to post",
        });
      }

      fetchPosts(); // Refresh to get updated counts
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Get user profiles for comment authors - only select public fields for security
      const userIds = [...new Set(commentsData?.map(comment => comment.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(profilesData?.map(profile => [profile.user_id, profile]) || []);
      
      const commentsWithProfiles = commentsData?.map(comment => ({
        ...comment,
        profile: profilesMap.get(comment.user_id) || null
      })) || [];

      setComments(prev => ({ ...prev, [postId]: commentsWithProfiles }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const addComment = async (postId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      toast({
        title: "Comment added!",
        description: "Your comment has been posted",
      });
      
      fetchPosts(); // Refresh to get updated counts
      fetchComments(postId); // Refresh comments for this post
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const playAudio = async (audioUrl: string, postId: string) => {
    // Stop current playing audio if any
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }

    if (playingAudio === postId) {
      setPlayingAudio(null);
      return;
    }

    try {
      setPlayingAudio(postId);
      
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);
      
      audio.onended = () => {
        setPlayingAudio(null);
        setCurrentAudio(null);
      };
      
      audio.onerror = () => {
        console.error('Error loading audio file');
        setPlayingAudio(null);
        setCurrentAudio(null);
        toast({
          title: "Error",
          description: "Could not load audio file",
          variant: "destructive",
        });
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('Error playing audio:', error);
      setPlayingAudio(null);
      setCurrentAudio(null);
      toast({
        title: "Error",
        description: "Could not play audio",
        variant: "destructive",
      });
    }
  };

  const downloadAudio = (audioUrl: string, postTitle: string) => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${postTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deletePost = async (postId: string) => {
    if (!user) return;
    const ok = window.confirm('Delete this post?');
    if (!ok) return;
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast({ title: 'Post deleted' });
    } catch (e: any) {
      toast({ title: 'Failed to delete', description: e.message, variant: 'destructive' });
    }
  };
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-pulse">Loading posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Community Posts
          </h1>
          <p className="text-muted-foreground">Share your debates, insights, and audio content</p>
        </div>
        
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          Create Post
        </Button>
      </div>

      {showCreateForm && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/30">
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
            <CardDescription>Share your thoughts with the community</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={newPost.post_type === 'text' ? 'default' : 'outline'}
                onClick={() => setNewPost(prev => ({ ...prev, post_type: 'text' as const }))}
                size="sm"
              >
                Text
              </Button>
              <Button
                variant={newPost.post_type === 'audio' ? 'default' : 'outline'}
                onClick={() => setNewPost(prev => ({ ...prev, post_type: 'audio' as const }))}
                size="sm"
              >
                Audio
              </Button>
            </div>

            <Input
              placeholder="Post title"
              value={newPost.title}
              onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
            />

            <Textarea
              placeholder="What's on your mind?"
              value={newPost.content}
              onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
            />

            {newPost.post_type === 'audio' && (
              <div className="space-y-4 p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                <div className="text-sm font-medium">Audio Content</div>
                
                {/* Recording Controls */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {!isRecording && !audioBlob && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={startRecording}
                          className="gap-2"
                        >
                          <Mic className="w-4 h-4" />
                          Start Recording
                        </Button>
                        <div className="text-sm text-muted-foreground">or</div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Upload File
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="audio/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </>
                    )}
                    
                    {isRecording && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={isPaused ? resumeRecording : pauseRecording}
                          className="gap-2"
                        >
                          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                          {isPaused ? 'Resume' : 'Pause'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={stopRecording}
                          className="gap-2 text-red-500"
                        >
                          <Square className="w-4 h-4" />
                          Stop
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={cancelRecording}
                          size="sm"
                        >
                          Cancel
                        </Button>
                        <div className="flex items-center gap-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
                          <span className="font-mono">
                            {formatTime(recordingTime)}
                          </span>
                          <span className="text-muted-foreground">
                            {isPaused ? '(Paused)' : '(Recording)'}
                          </span>
                        </div>
                      </>
                    )}
                    
                    {audioBlob && !isRecording && (
                      <>
                        <Badge variant="default" className="gap-2">
                          <Play className="w-3 h-3" />
                          Audio Ready
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setAudioBlob(null)}
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          Remove
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => fileInputRef.current?.click()}
                          size="sm"
                          className="text-muted-foreground"
                        >
                          Replace
                        </Button>
                      </>
                    )}
                  </div>
                  
                  {uploading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                      Uploading audio...
                    </div>
                  )}
                </div>
              </div>
            )}

            <Input
              placeholder="Tags (comma separated)"
              value={newPost.tags}
              onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
            />

            {quotingPost && (
              <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-primary">Quoting post</span>
                  <Button variant="ghost" size="sm" onClick={() => setQuotingPost(null)} className="h-6 px-2 text-xs">Remove</Button>
                </div>
                <p className="text-sm font-medium">{quotingPost.title}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{quotingPost.content}</p>
                <p className="text-xs text-muted-foreground mt-1">— {quotingPost.profiles?.display_name || 'Anonymous'}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={createPost} 
                disabled={creating || !newPost.title.trim() || !newPost.content.trim()}
              >
                {creating ? 'Creating...' : 'Create Post'}
              </Button>
              <Button variant="outline" onClick={() => { setShowCreateForm(false); setQuotingPost(null); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur-sm border-border/30">
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="bg-card/50 backdrop-blur-sm border-border/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={post.profiles?.avatar_url} />
                    <AvatarFallback>
                      {post.profiles?.display_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{post.profiles?.display_name || 'Anonymous User'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={post.post_type === 'audio' ? 'default' : 'secondary'}>
                    {post.post_type}
                  </Badge>
                </div>
                <CardTitle>{post.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-foreground/90">{post.content}</p>

                {(post as any).quoted_post_id && (() => {
                  const quoted = posts.find(p => p.id === (post as any).quoted_post_id);
                  if (!quoted) return null;
                  return (
                    <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                      <p className="text-xs font-medium text-primary mb-1">Quoted post</p>
                      <p className="text-sm font-medium">{quoted.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{quoted.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">— {quoted.profiles?.display_name || 'Anonymous'}</p>
                    </div>
                  );
                })()}
                
                {post.post_type === 'audio' && post.audio_url && (
                  <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg border border-secondary/30">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playAudio(post.audio_url!, post.id)}
                        className="hover:bg-primary/10"
                      >
                        {playingAudio === post.id ? 
                          <Pause className="w-5 h-5" /> : 
                          <Play className="w-5 h-5" />
                        }
                      </Button>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {playingAudio === post.id ? 'Now Playing...' : 'Audio Content'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Click to {playingAudio === post.id ? 'pause' : 'play'}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadAudio(post.audio_url!, post.title)}
                      className="gap-2 text-muted-foreground hover:text-foreground"
                      title="Download audio"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(post.id)}
                    className="gap-2 hover:text-red-500 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    {post.likes_count}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => {
                      if (showComments === post.id) {
                        setShowComments(null);
                      } else {
                        setShowComments(post.id);
                        fetchComments(post.id);
                      }
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {post.comments_count}
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="gap-2" onClick={() => {
                    setQuotingPost(post);
                    setShowCreateForm(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}>
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>

                  {user && (isAdmin || user.id === post.user_id) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2 ml-auto"
                      onClick={() => deletePost(post.id)}
                    >
                      <Trash className="w-4 h-4" /> Delete
                    </Button>
                  )}
                </div>

                {showComments === post.id && (
                  <div className="mt-4 space-y-3 border-t border-border/30 pt-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addComment(post.id);
                          }
                        }}
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => addComment(post.id)}
                        disabled={!newComment.trim()}
                        size="sm"
                      >
                        Post
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {comments[post.id]?.length > 0 ? (
                        comments[post.id].map((comment: any) => (
                          <div key={comment.id} className="flex gap-3 p-3 bg-secondary/10 rounded-lg">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={comment.profile?.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {comment.profile?.display_name?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">
                                  {comment.profile?.display_name || 'Anonymous User'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};