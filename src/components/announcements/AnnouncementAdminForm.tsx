import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface AnnouncementAdminFormProps {
  title: string;
  content: string;
  saving: boolean;
  mode?: 'create' | 'edit';
  onTitleChange: (v: string) => void;
  onContentChange: (v: string) => void;
  onPublish: () => void;
  onSaveDraft: () => void;
  onCancel: () => void;
  onImageUpload: (file: File) => void;
}

const quillModules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'blockquote'],
    ['clean'],
  ],
} as const;

export const AnnouncementAdminForm = ({
  title,
  content,
  saving,
  mode = 'create',
  onTitleChange,
  onContentChange,
  onPublish,
  onSaveDraft,
  onCancel,
  onImageUpload,
}: AnnouncementAdminFormProps) => (
  <div className="animate-fade-in mb-10">
    <button
      type="button"
      onClick={onCancel}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to Announcements
    </button>

    <Card className="border-border/60 shadow-elevated max-w-3xl">
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create announcement' : 'Edit announcement'}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Use headings, lists, and bold text to structure long-form updates.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Announcement title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-base"
        />
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <ReactQuill theme="snow" value={content} onChange={onContentChange} modules={quillModules} />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <label className="cursor-pointer hover:text-foreground transition-colors">
            Add image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onImageUpload(e.target.files[0])}
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={onPublish} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? 'Publishing…' : 'Publish'}
          </Button>
          {mode === 'create' && (
            <Button variant="outline" onClick={onSaveDraft} disabled={saving}>
              Save draft
            </Button>
          )}
          <Button variant="ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);
