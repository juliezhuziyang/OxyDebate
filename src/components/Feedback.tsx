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
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Send us your feedback</h1>
      <p className="text-sm text-muted-foreground">We will forward it to juliezhu.ziyang@gmail.com.</p>
      <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your feedback here..." className="min-h-40" />
      <Button onClick={submit} disabled={loading}>{loading ? 'Sending...' : 'Send feedback'}</Button>
    </div>
  );
};
