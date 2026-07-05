import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PageLoader } from '@/components/ui/page-loader';
import { AnnouncementFeed } from '@/components/announcements/AnnouncementFeed';
import { AnnouncementArticle } from '@/components/announcements/AnnouncementArticle';
import { AnnouncementAdminForm } from '@/components/announcements/AnnouncementAdminForm';
import type { Section } from '@/components/Layout';

type ViewMode = 'feed' | 'article' | 'create' | 'edit';

const AnnouncementsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const {
    announcements,
    loading,
    isAdmin,
    uploadImage,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  } = useAnnouncements();

  const [view, setView] = useState<ViewMode>('feed');
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    document.title = id
      ? 'Announcement · Oxymorona Debate'
      : 'Announcements · Oxymorona Debate';
  }, [id]);

  useEffect(() => {
    if (id === 'new') {
      setView(isAdmin ? 'create' : 'feed');
      if (!isAdmin) navigate('/announcements', { replace: true });
      return;
    }
    if (id) {
      setView('article');
    } else {
      setView('feed');
      setEditingId(null);
    }
  }, [id, isAdmin, navigate]);

  const activeAnnouncement = id && id !== 'new'
    ? announcements.find((a) => a.id === id)
    : null;

  const published = announcements.filter((a) => a.is_published);
  const visibleForArticle = isAdmin
    ? announcements
    : published;

  const handleNavSection = (section: Section) => {
    navigate(user ? `/app?section=${section}` : '/auth');
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setEditingId(null);
  };

  const handleCreateClick = () => {
    resetForm();
    navigate('/announcements/new');
  };

  const handleEdit = () => {
    if (!activeAnnouncement) return;
    setTitle(activeAnnouncement.title);
    setContent(activeAnnouncement.content);
    setEditingId(activeAnnouncement.id);
    setView('edit');
  };

  const handleImageUpload = async (file: File) => {
    const url = await uploadImage(file);
    if (url) {
      setContent((prev) => `${prev || ''}<p><img src="${url}" alt="Announcement image" /></p>`);
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      if (view === 'edit' && editingId) {
        const ok = await updateAnnouncement(editingId, title, content, true);
        if (ok) navigate(`/announcements/${editingId}`);
      } else {
        const created = await createAnnouncement(title, content, true);
        if (created) {
          resetForm();
          navigate(`/announcements/${created.id}`);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const created = await createAnnouncement(title, content, false);
      if (created) {
        resetForm();
        navigate('/announcements');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activeAnnouncement) return;
    const ok = await deleteAnnouncement(activeAnnouncement.id);
    if (ok) navigate('/announcements');
  };

  const related = activeAnnouncement
    ? visibleForArticle
        .filter((a) => a.id !== activeAnnouncement.id && a.is_published)
        .slice(0, 3)
    : [];

  return (
    <div className="page-shell min-h-screen flex flex-col bg-background text-foreground">
      <Navigation
        activeSection={'global-news' as Section}
        onSectionChange={handleNavSection}
        isAuthenticated={!!user}
        onLogout={signOut}
      />

      <main id="main-content" className="container mx-auto px-4 py-8 md:py-12 flex-1 max-w-5xl">
        {loading && announcements.length === 0 ? (
          <PageLoader label="Loading announcements..." />
        ) : view === 'create' || view === 'edit' ? (
          <>
            <AnnouncementAdminForm
              title={title}
              content={content}
              saving={saving}
              mode={view === 'edit' ? 'edit' : 'create'}
              onTitleChange={setTitle}
              onContentChange={setContent}
              onPublish={handlePublish}
              onSaveDraft={handleSaveDraft}
              onCancel={() => {
                resetForm();
                navigate(editingId ? `/announcements/${editingId}` : '/announcements');
              }}
              onImageUpload={handleImageUpload}
            />
          </>
        ) : view === 'article' && activeAnnouncement ? (
          (!isAdmin && !activeAnnouncement.is_published) ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">This announcement is not available.</p>
              <button
                type="button"
                onClick={() => navigate('/announcements')}
                className="text-primary hover:underline text-sm"
              >
                Back to Announcements
              </button>
            </div>
          ) : (
            <AnnouncementArticle
              announcement={activeAnnouncement}
              related={related}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )
        ) : view === 'article' && id && !activeAnnouncement && !loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">This announcement could not be found.</p>
            <button
              type="button"
              onClick={() => navigate('/announcements')}
              className="text-primary hover:underline text-sm"
            >
              Back to Announcements
            </button>
          </div>
        ) : (
          <AnnouncementFeed
            announcements={announcements}
            loading={loading}
            isAdmin={isAdmin}
            onCreateClick={handleCreateClick}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AnnouncementsPage;
