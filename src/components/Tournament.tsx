import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { PentaLeague2025Public } from '@/components/tournament/PentaLeague2025Public';
import { TournamentAdmin } from '@/components/TournamentAdmin';
import { TournamentAnnouncements } from '@/components/TournamentAnnouncements';
import { TournamentLeaderboard } from '@/components/TournamentLeaderboard';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

interface TournamentProps {
  onBackToHome?: () => void;
}

const Tournament = ({ onBackToHome }: TournamentProps) => {
  const { user } = useAuth();
  const { isAdmin, isTournamentAdmin } = useRoles();
  const isStaff = isAdmin || isTournamentAdmin;

  const [debaters, setDebaters] = useState<any[]>([]);
  const [judges, setJudges] = useState<any[]>([]);
  const [checkInSessions, setCheckInSessions] = useState<any[]>([]);
  const [checkIns, setCheckIns] = useState<any[]>([]);

  useEffect(() => {
    if (!isStaff) return;
    fetchDebaters();
    fetchJudges();
    fetchCheckInSessions();
    fetchCheckIns();
  }, [isStaff]);

  const fetchDebaters = async () => {
    const { data } = await supabase.from('tournament_debaters').select('*');
    setDebaters(data || []);
  };

  const fetchJudges = async () => {
    const { data } = await supabase.from('tournament_judges').select('*');
    setJudges(data || []);
  };

  const fetchCheckInSessions = async () => {
    const { data } = await supabase.from('check_in_sessions').select('*').order('created_at', { ascending: false });
    setCheckInSessions(data || []);
  };

  const fetchCheckIns = async () => {
    const { data } = await supabase.from('check_ins').select('*');
    setCheckIns(data || []);
  };

  const deleteDebater = async (id: string) => {
    try {
      const { error } = await supabase.from('tournament_debaters').delete().eq('id', id);
      if (error) throw error;
      toast.success('Team and all related records deleted successfully!');
      fetchDebaters();
    } catch (error: any) {
      toast.error('Failed to delete team: ' + error.message);
    }
  };

  const approveJudge = async (id: string) => {
    try {
      const { error } = await supabase.from('tournament_judges').update({ status: 'approved' }).eq('id', id);
      if (error) throw error;
      toast.success('Judge approved successfully!');
      fetchJudges();
    } catch (error: any) {
      toast.error('Failed to approve judge: ' + error.message);
    }
  };

  const deleteJudge = async (id: string) => {
    try {
      const { error } = await supabase.from('tournament_judges').delete().eq('id', id);
      if (error) throw error;
      toast.success('Judge deleted successfully!');
      fetchJudges();
    } catch (error: any) {
      toast.error('Failed to delete judge: ' + error.message);
    }
  };

  const startCheckInSession = async () => {
    if (!user?.id) return;
    try {
      await supabase.from('check_in_sessions')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('is_active', true);
      const { error } = await supabase.from('check_in_sessions').insert([{
        created_by_user_id: user.id,
        is_active: true,
      }]);
      if (error) throw error;
      toast.success('Check-in session started!');
      fetchCheckInSessions();
    } catch (error: any) {
      toast.error('Failed to start check-in session: ' + error.message);
    }
  };

  const endCheckInSession = async () => {
    try {
      const { error } = await supabase.from('check_in_sessions')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('is_active', true);
      if (error) throw error;
      toast.success('Check-in session ended!');
      fetchCheckInSessions();
    } catch (error: any) {
      toast.error('Failed to end check-in session: ' + error.message);
    }
  };

  const activeSession = checkInSessions.find((session) => session.is_active);
  const currentSessionCheckIns = activeSession
    ? checkIns.filter((checkIn) => checkIn.session_id === activeSession.id)
    : [];

  const allRegisteredEmails = [
    ...debaters.map((d) => (d.email || '').trim()),
    ...debaters.map((d) => (d.partner_email || '').trim()),
    ...judges.filter((j) => j.status === 'approved').map((j) => (j.email || '').trim()),
  ].filter(Boolean).map((email) => email.toLowerCase());

  const checkedInEmails = currentSessionCheckIns.map((c) => (c.participant_email || '').trim().toLowerCase());
  const notCheckedInEmails = allRegisteredEmails.filter((email) => !checkedInEmails.includes(email));

  if (isStaff) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Tournament Administration</h1>
        <p className="text-muted-foreground mb-8">
          Shanghai Debate PentaLeague 2025 — concluded. Registration is closed.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Admin Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Check-in Management</h3>
              <div className="flex gap-2 mb-4">
                <Button onClick={startCheckInSession} disabled={!!activeSession}>
                  Start Check-in Session
                </Button>
                <Button onClick={endCheckInSession} disabled={!activeSession} variant="outline">
                  End Check-in Session
                </Button>
              </div>

              {activeSession && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 text-green-600">Present ({checkedInEmails.length})</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {currentSessionCheckIns.map((checkIn) => (
                        <Badge key={checkIn.id} variant="secondary" className="block w-fit">
                          {checkIn.participant_email}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">Missing ({notCheckedInEmails.length})</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {notCheckedInEmails.map((email) => (
                        <Badge key={email} variant="outline" className="block w-fit">
                          {email}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />
            <TournamentAnnouncements />
            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Registered Teams ({debaters.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {debaters.map((debater) => (
                  <div key={debater.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <strong>{debater.team_name}</strong> - {debater.name} & {debater.partner_name}
                      <br />
                      <small className="text-muted-foreground">{debater.school}</small>
                      <br />
                      <small className="text-muted-foreground">{debater.email} | {debater.partner_email}</small>
                    </div>
                    <Button onClick={() => deleteDebater(debater.id)} variant="destructive" size="sm">
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Judge Applications ({judges.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {judges.map((judge) => (
                  <div key={judge.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <strong>{judge.name}</strong> - {judge.email}
                      <br />
                      <small className="text-muted-foreground">
                        Status: {judge.status} | Experience: {judge.judge_experience}
                      </small>
                    </div>
                    <div className="flex gap-2">
                      {judge.status === 'pending' && (
                        <Button onClick={() => approveJudge(judge.id)} variant="default" size="sm">
                          Approve
                        </Button>
                      )}
                      <Button onClick={() => deleteJudge(judge.id)} variant="destructive" size="sm">
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />
          </CardContent>
        </Card>

        <TournamentLeaderboard />
        <Separator className="my-8" />
        <TournamentAdmin />
      </div>
    );
  }

  return (
    <>
      {onBackToHome && (
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tournament
        </button>
      )}
      <PentaLeague2025Public />
    </>
  );
};

export default Tournament;
