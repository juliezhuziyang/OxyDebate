import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, Crown, Users } from 'lucide-react';

interface Application {
  id: string;
  application_type: 'cohost' | 'management';
  name: string;
  email: string;
  organization_school: string;
  message: string;
  desired_position?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const ApplicationManager = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications((data as Application[]) || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setApplications(prev => 
        prev.map(app => 
          app.id === id ? { ...app, status } : app
        )
      );

      toast({
        title: "Status Updated",
        description: `Application has been ${status}`,
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const ApplicationCard = ({ application }: { application: Application }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              {application.application_type === 'cohost' ? (
                <Crown className="w-5 h-5 text-primary" />
              ) : (
                <Users className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{application.name}</CardTitle>
              <CardDescription>
                {application.email} • {application.organization_school}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge(application.status)}
        </div>
      </CardHeader>
      <CardContent>
        {application.desired_position && (
          <div className="mb-3">
            <p className="text-sm font-medium text-muted-foreground">Desired Position:</p>
            <p className="text-sm">{application.desired_position}</p>
          </div>
        )}
        
        <div className="mb-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">Message:</p>
          <p className="text-sm bg-muted p-3 rounded-md">{application.message}</p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Applied: {new Date(application.created_at).toLocaleDateString()}
          </p>
          
          {application.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateApplicationStatus(application.id, 'rejected')}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => updateApplicationStatus(application.id, 'approved')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    );
  }

  const cohostApplications = applications.filter(app => app.application_type === 'cohost');
  const managementApplications = applications.filter(app => app.application_type === 'management');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Application Manager</h1>
        <p className="text-muted-foreground">Review and manage applications for tournament cohost and management team positions</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
          <TabsTrigger value="cohost">Cohost ({cohostApplications.length})</TabsTrigger>
          <TabsTrigger value="management">Management ({managementApplications.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({applications.filter(app => app.status === 'pending').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No applications received yet</p>
              </CardContent>
            </Card>
          ) : (
            applications.map(application => (
              <ApplicationCard key={application.id} application={application} />
            ))
          )}
        </TabsContent>

        <TabsContent value="cohost" className="mt-6">
          {cohostApplications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No cohost applications received yet</p>
              </CardContent>
            </Card>
          ) : (
            cohostApplications.map(application => (
              <ApplicationCard key={application.id} application={application} />
            ))
          )}
        </TabsContent>

        <TabsContent value="management" className="mt-6">
          {managementApplications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No management team applications received yet</p>
              </CardContent>
            </Card>
          ) : (
            managementApplications.map(application => (
              <ApplicationCard key={application.id} application={application} />
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {applications.filter(app => app.status === 'pending').length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending applications</p>
              </CardContent>
            </Card>
          ) : (
            applications
              .filter(app => app.status === 'pending')
              .map(application => (
                <ApplicationCard key={application.id} application={application} />
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};