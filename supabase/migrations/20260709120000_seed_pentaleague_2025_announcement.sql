-- Publish Shanghai Debate PentaLeague 2025 recruitment announcement
INSERT INTO public.announcements (
  title,
  content,
  is_published,
  published_at,
  created_at,
  updated_at,
  created_by_user_id
)
SELECT
  'Shanghai Debate PentaLeague 2025 — Now Recruiting Debaters & Judges',
  '<p><strong>The inaugural Shanghai Debate PentaLeague is coming to Shanghai this December — and we are looking for passionate debaters and experienced judges to join us.</strong></p>

<h2>About PentaLeague 2025</h2>
<p>Hosted by Oxymorona Debate Society, the Shanghai Debate PentaLeague 2025 is a two-day Public Forum tournament designed for rigorous competition, thoughtful discourse, and a welcoming community of debaters from across the region.</p>

<ul>
<li><strong>Format:</strong> Public Forum · 5 preliminary rounds + finals</li>
<li><strong>Dates:</strong> December 6–7, 2025</li>
<li><strong>Location:</strong> Shanghai, China</li>
<li><strong>Who should apply:</strong> High school PF teams (two speakers per team) and judges with debate experience</li>
</ul>

<h2>We are recruiting</h2>

<h3>Debaters</h3>
<p>If you and a partner are ready to test your arguments, rebuttals, and crossfire skills on a championship stage, PentaLeague is for you. Teams will compete across five rounds of Public Forum debate, with the strongest advancing to semifinals and the grand final.</p>
<p>Whether you are preparing for your first major tournament or looking to sharpen your skills against strong opposition, we welcome teams that bring curiosity, sportsmanship, and a commitment to the craft.</p>

<h3>Judges</h3>
<p>Great tournaments are built on great adjudication. We are actively recruiting judges with Public Forum (or equivalent) experience who can provide clear, constructive feedback and fair decisions. Judging at PentaLeague is an opportunity to support the next generation of debaters and stay connected to competitive debate in Shanghai.</p>

<h2>Why compete at PentaLeague?</h2>
<ul>
<li><strong>High-quality rounds</strong> — Five preliminary rounds plus elimination debates</li>
<li><strong>Speaker recognition</strong> — Gold, Silver, and Bronze speaker awards</li>
<li><strong>Community</strong> — Meet debaters from schools across the region</li>
<li><strong>Organized experience</strong> — Professional briefings, clear schedules, and dedicated tournament staff</li>
</ul>

<h2>How to register</h2>
<p>Registration is open for teams and judges. Visit our <a href="/tournament/shanghai-pentaleague-2025">PentaLeague 2025 tournament page</a> for full details, or sign in and go to <strong>My Debate → Feedback</strong> to express your interest. Please include:</p>
<ul>
<li>Your name and school</li>
<li>Role (debater team or judge)</li>
<li>For debaters: your partner''s name and contact email</li>
<li>For judges: your debate experience and formats judged</li>
</ul>

<p>Spaces are limited — we encourage early registration to secure your spot.</p>

<h2>Important dates</h2>
<ul>
<li><strong>November 2025</strong> — Preparation briefings and logistics for registered participants</li>
<li><strong>December 6, 2025</strong> — Rounds 1–4</li>
<li><strong>December 7, 2025</strong> — Round 5, semifinals, grand final &amp; closing ceremony</li>
</ul>

<p>We cannot wait to welcome you to the inaugural Shanghai Debate PentaLeague. Bring your best arguments — we will bring the stage.</p>

<p><em>— Oxymorona Debate Society · PentaLeague 2025 Organizing Committee</em></p>',
  true,
  '2025-11-06 00:00:00+08'::timestamptz,
  '2025-11-06 00:00:00+08'::timestamptz,
  '2025-11-06 00:00:00+08'::timestamptz,
  COALESCE(
    (SELECT created_by_user_id FROM public.announcements ORDER BY created_at LIMIT 1),
    (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
  )
WHERE NOT EXISTS (
  SELECT 1 FROM public.announcements
  WHERE title = 'Shanghai Debate PentaLeague 2025 — Now Recruiting Debaters & Judges'
);
