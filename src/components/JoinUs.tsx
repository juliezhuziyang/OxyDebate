import { useState, useCallback, memo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { useToast } from '@/hooks/use-toast';
import { Crown, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ApplicationForm {
  name: string;
  email: string;
  organizationSchool: string;
  message: string;
  desiredPosition?: string;
}

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

export const JoinUs = () => {
  const { user } = useAuth();
  const { isAdmin } = useRoles();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cohostForm, setCohostForm] = useState<ApplicationForm>({
    name: '',
    email: '',
    organizationSchool: '',
    message: ''
  });
  const [managementForm, setManagementForm] = useState<ApplicationForm>({
    name: '',
    email: '',
    organizationSchool: '',
    message: '',
    desiredPosition: ''
  });
  const [openDialog, setOpenDialog] = useState<'cohost' | 'management' | null>(null);
  
  // Admin state
  const [applications, setApplications] = useState<Application[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);

  const handleSubmit = async (type: 'cohost' | 'management') => {
    const form = type === 'cohost' ? cohostForm : managementForm;
    
    if (!form.name || !form.email || !form.organizationSchool || !form.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (type === 'management' && !form.desiredPosition) {
      toast({
        title: "Missing Information", 
        description: "Please specify the position you want",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          user_id: user?.id || null,
          application_type: type,
          name: form.name,
          email: form.email,
          organization_school: form.organizationSchool,
          message: form.message,
          desired_position: type === 'management' ? form.desiredPosition : null
        });

      if (error) throw error;

      toast({
        title: "Application Submitted",
        description: `Your ${type === 'cohost' ? 'tournament cohost' : 'management team'} application has been submitted successfully!`
      });

      // Reset form
      if (type === 'cohost') {
        setCohostForm({ name: '', email: '', organizationSchool: '', message: '' });
      } else {
        setManagementForm({ name: '', email: '', organizationSchool: '', message: '', desiredPosition: '' });
      }
      
      setOpenDialog(null);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCohostFormChange = useCallback((field: string, value: string) => {
    setCohostForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleManagementFormChange = useCallback((field: string, value: string) => {
    setManagementForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // Admin functions
  useEffect(() => {
    if (isAdmin) {
      fetchApplications();
    }
  }, [isAdmin]);

  const fetchApplications = async () => {
    setAdminLoading(true);
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
      setAdminLoading(false);
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

  // Admin view - show application management
  if (isAdmin) {
    const cohostApplications = applications.filter(app => app.application_type === 'cohost');
    const managementApplications = applications.filter(app => app.application_type === 'management');

    if (adminLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading applications...</p>
          </div>
        </div>
      );
    }

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
  }

  // Regular user view - show application forms
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Help us grow the Oxymorona Debate Community! We're looking for passionate individuals 
          to join our mission of making debate accessible to everyone.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Tournament Cohost Application */}
        <Card className="h-fit">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Tournament Cohost</CardTitle>
            <CardDescription>
              Help organize and run our tournaments as a cohost
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6 text-sm text-muted-foreground">
              <li>• Assist in tournament planning and execution</li>
              <li>• Help coordinate participants and schedules</li>
              <li>• Support live tournament operations</li>
              <li>• Contribute to post-tournament analysis</li>
            </ul>
            
            <Dialog open={openDialog === 'cohost'} onOpenChange={(open) => setOpenDialog(open ? 'cohost' : null)}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full">
                  Apply to be Cohost
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Tournament Cohost Application</DialogTitle>
                  <DialogDescription>
                    Tell us about your interest in helping organize tournaments
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cohost-name">Full Name *</Label>
                    <Input
                      id="cohost-name"
                      value={cohostForm.name}
                      onChange={(e) => handleCohostFormChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cohost-email">Email Address *</Label>
                    <Input
                      id="cohost-email"
                      type="email"
                      value={cohostForm.email}
                      onChange={(e) => handleCohostFormChange('email', e.target.value)}
                      placeholder="Enter your email address"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cohost-org">Organization/School *</Label>
                    <Input
                      id="cohost-org"
                      value={cohostForm.organizationSchool}
                      onChange={(e) => handleCohostFormChange('organizationSchool', e.target.value)}
                      placeholder="Enter your organization or school name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cohost-message">Tell us about yourself *</Label>
                    <Textarea
                      id="cohost-message"
                      value={cohostForm.message}
                      onChange={(e) => handleCohostFormChange('message', e.target.value)}
                      placeholder="Share your experience, motivations, and what you'd bring to the role..."
                      className="mt-1 min-h-[120px]"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setOpenDialog(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleSubmit('cohost')}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Management Team Application */}
        <Card className="h-fit">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Management Team</CardTitle>
            <CardDescription>
              Join our core team and help shape the future of our community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6 text-sm text-muted-foreground">
              <li>• Content creation and curation</li>
              <li>• Community engagement and growth</li>
              <li>• Platform development and improvement</li>
              <li>• Strategic planning and execution</li>
            </ul>
            
            <Dialog open={openDialog === 'management'} onOpenChange={(open) => setOpenDialog(open ? 'management' : null)}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full" variant="secondary">
                  Join Management Team
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Management Team Application</DialogTitle>
                  <DialogDescription>
                    Tell us about your skills and the role you'd like to take on
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="management-name">Full Name *</Label>
                    <Input
                      id="management-name"
                      value={managementForm.name}
                      onChange={(e) => handleManagementFormChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="management-email">Email Address *</Label>
                    <Input
                      id="management-email"
                      type="email"
                      value={managementForm.email}
                      onChange={(e) => handleManagementFormChange('email', e.target.value)}
                      placeholder="Enter your email address"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="management-org">Organization/School *</Label>
                    <Input
                      id="management-org"
                      value={managementForm.organizationSchool}
                      onChange={(e) => handleManagementFormChange('organizationSchool', e.target.value)}
                      placeholder="Enter your organization or school name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="management-position">Desired Position *</Label>
                    <Input
                      id="management-position"
                      value={managementForm.desiredPosition || ''}
                      onChange={(e) => handleManagementFormChange('desiredPosition', e.target.value)}
                      placeholder="e.g., Content Manager, Technical Lead, Marketing Coordinator"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="management-message">Tell us about yourself *</Label>
                    <Textarea
                      id="management-message"
                      value={managementForm.message}
                      onChange={(e) => handleManagementFormChange('message', e.target.value)}
                      placeholder="Share your experience, motivations, and what you'd bring to the role..."
                      className="mt-1 min-h-[120px]"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setOpenDialog(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleSubmit('management')}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-3">What happens next?</h3>
            <div className="text-left space-y-2 text-sm text-muted-foreground">
              <p>1. We'll review your application within 3-5 business days</p>
              <p>2. If selected, we'll reach out for a brief interview</p>
              <p>3. Successful candidates will be onboarded to their respective teams</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};