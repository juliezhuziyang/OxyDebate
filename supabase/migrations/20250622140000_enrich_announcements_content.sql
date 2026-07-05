-- Seed rich announcement content when the table is empty (optional starter posts)
-- Run via Supabase SQL Editor or: supabase db push

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.announcements LIMIT 1) THEN
    INSERT INTO public.announcements (title, content, is_published, published_at, created_by_user_id)
    VALUES (
      'Welcome to Oxymorona Debate',
      '<p><strong>We''re thrilled to welcome you to Oxymorona Debate — a global community where conviction meets curiosity.</strong></p>
<h2>What is Oxymorona Debate?</h2>
<p>Oxymorona Debate is a platform built by debaters, for debaters. Whether you''re preparing for your first tournament or sharpening skills for international competition, you''ll find tools, resources, and a community that supports your growth.</p>
<h2>What you can do here</h2>
<ul>
<li><strong>AI Practice</strong> — Train solo with instant feedback on arguments, structure, and delivery.</li>
<li><strong>Global Practice</strong> — Match with real opponents from around the world.</li>
<li><strong>Rankings</strong> — Track your progress and see where you stand in the community.</li>
<li><strong>Debate Guide</strong> — Learn from curated video lessons with study notes.</li>
</ul>
<h2>Getting started</h2>
<p>Create your account, explore the Practice section, and try an AI Practice session. Browse Resources for guides and community posts. If you have questions, visit <strong>My Debate → Feedback</strong> — we read every message.</p>
<p>Thank you for joining us. We can''t wait to see you in the debate room.</p>',
      true,
      now(),
      (SELECT id FROM auth.users LIMIT 1)
    );
  END IF;
END $$;

-- Note: Existing short announcements are expanded at display time by the app.
-- To permanently rewrite content in the database, edit announcements via the admin form
-- or run targeted UPDATE statements in the SQL Editor.
