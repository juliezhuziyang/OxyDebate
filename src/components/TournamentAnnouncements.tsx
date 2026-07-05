import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Megaphone, Upload, X, FileText, Image } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface TournamentAnnouncement {
  id: string;
  title: string;
  content: string;
  target_type: string;
  target_team_name: string | null;
  target_individual_email: string | null;
  file_attachments: any;
  created_at: string;
}

interface Team {
  team_name: string;
  name: string;
  partner_name: string;
}

interface Judge {
  email: string;
  name: string;
}

export const TournamentAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<TournamentAnnouncement[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState('all');
  const [targetTeam, setTargetTeam] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch announcements
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('tournament_announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (announcementsError) throw announcementsError;

      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('tournament_debaters')
        .select('team_name, name, partner_name')
        .order('team_name');
      
      if (teamsError) throw teamsError;

      // Fetch judges
      const { data: judgesData, error: judgesError } = await supabase
        .from('tournament_judges')
        .select('email, name')
        .order('name');
      
      if (judgesError) throw judgesError;

      setAnnouncements(announcementsData || []);
      setTeams(teamsData || []);
      setJudges(judgesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load announcements data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: "Only images and PDF files are allowed",
          variant: "destructive"
        });
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: "Files must be under 10MB",
          variant: "destructive"
        });
      }
      
      return isValidType && isValidSize;
    });
    
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (attachments.length === 0) return [];
    
    setUploading(true);
    const uploadedFiles = [];
    
    try {
      for (const file of attachments) {
        const ext = file.name.split('.').pop();
        const path = `tournament/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from('announcements')
          .upload(path, file, { upsert: true, contentType: file.type });
        
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from('announcements').getPublicUrl(path);
        
        uploadedFiles.push({
          name: file.name,
          url: data.publicUrl,
          type: file.type,
          size: file.size
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload some files",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
    
    return uploadedFiles;
  };

  const createAnnouncement = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in title and content",
        variant: "destructive"
      });
      return;
    }

    if (targetType === 'team' && !targetTeam) {
      toast({
        title: "Error",
        description: "Please select a team",
        variant: "destructive"
      });
      return;
    }

    if (targetType === 'individual' && !targetEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    try {
      // Upload files first
      const uploadedFiles = await uploadFiles();
      
      const { error } = await supabase
        .from('tournament_announcements')
        .insert({
          title: title.trim(),
          content: content.trim(),
          target_type: targetType,
          target_team_name: targetType === 'team' ? targetTeam : null,
          target_individual_email: targetType === 'individual' ? targetEmail : null,
          file_attachments: uploadedFiles,
          created_by_user_id: user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement created successfully"
      });

      // Reset form
      setTitle('');
      setContent('');
      setTargetType('all');
      setTargetTeam('');
      setTargetEmail('');
      setAttachments([]);
      
      fetchData();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive"
      });
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tournament_announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement deleted successfully"
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive"
      });
    }
  };

  const getTargetDescription = (announcement: TournamentAnnouncement) => {
    switch (announcement.target_type) {
      case 'all':
        return 'All participants';
      case 'debaters':
        return 'All debaters';
      case 'judges':
        return 'All judges';
      case 'team':
        return `Team: ${announcement.target_team_name}`;
      case 'individual':
        return `Individual: ${announcement.target_individual_email}`;
      default:
        return 'Unknown';
    }
  };

  const allEmails = [
    ...teams.flatMap(team => [team.name, team.partner_name]),
    ...judges.map(judge => judge.email)
  ].filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Announcement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Create Tournament Announcement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Announcement title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="target-type">Send To</Label>
            <Select value={targetType} onValueChange={setTargetType}>
              <SelectTrigger>
                <SelectValue placeholder="Select target audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Participants</SelectItem>
                <SelectItem value="debaters">All Debaters</SelectItem>
                <SelectItem value="judges">All Judges</SelectItem>
                <SelectItem value="team">Specific Team</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {targetType === 'team' && (
            <div>
              <Label htmlFor="target-team">Select Team</Label>
              <Select value={targetTeam} onValueChange={setTargetTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.team_name} value={team.team_name}>
                      {team.team_name} ({team.name} & {team.partner_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {targetType === 'individual' && (
            <div>
              <Label htmlFor="target-email">Email Address</Label>
              <Select value={targetEmail} onValueChange={setTargetEmail}>
                <SelectTrigger>
                  <SelectValue placeholder="Select email or type custom" />
                </SelectTrigger>
                <SelectContent>
                  {allEmails.map((email) => (
                    <SelectItem key={email} value={email}>
                      {email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Content</Label>
            <div className="border rounded-md">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                style={{ minHeight: '200px' }}
                modules={{
                  toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link'],
                    ['clean']
                  ]
                }}
              />
            </div>
          </div>

          <div>
            <Label>File Attachments</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Add Files (Images/PDF)
                </Button>
              </div>
              
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {file.type.startsWith('image/') ? (
                          <Image className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button 
            onClick={createAnnouncement} 
            className="w-full"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Create Announcement'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Announcements */}
      <Card>
        <CardHeader>
          <CardTitle>Tournament Announcements ({announcements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No announcements created yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Attachments</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium">{announcement.title}</TableCell>
                    <TableCell>{getTargetDescription(announcement)}</TableCell>
                    <TableCell>
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {announcement.file_attachments && Array.isArray(announcement.file_attachments) && announcement.file_attachments.length > 0 ? (
                        <div className="flex gap-1">
                          {announcement.file_attachments.map((file: any, index: number) => (
                            <a
                              key={index}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                            >
                              {file.type?.startsWith('image/') ? (
                                <Image className="h-3 w-3" />
                              ) : (
                                <FileText className="h-3 w-3" />
                              )}
                              {file.name}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteAnnouncement(announcement.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
