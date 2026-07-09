import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export const Feedback = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!message.trim()) {
      toast({ title: 'Please write some feedback first.' });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-feedback', {
        body: {
          message,
          email: user?.email || 'anonymous@user.com',
          name: user?.user_metadata?.display_name || user?.email || 'Anonymous',
        },
      });
      if (error) throw error;
      toast({ title: 'Thanks for your feedback!' });
      setMessage('');
    } catch (e: any) {
      toast({ title: 'Failed to send feedback', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="border-b border-border pb-6">
        <p className="editorial-eyebrow mb-2">My Debate</p>
        <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">Send us your feedback</h1>
        <p className="text-sm text-muted-foreground mt-2">Help shape the platform — we read every message.</p>
      </div>
      <div className="surface-panel space-y-4">
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Share ideas, report issues, or suggest improvements..." className="min-h-40 border-border bg-background" />
        <Button onClick={submit} disabled={loading}>{loading ? 'Sending...' : 'Send feedback'}</Button>
      </div>
    </div>
  );
};
