-- Publish Shanghai Debate PentaLeague 2025 closing announcement
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
  'Shanghai Debate PentaLeague 2025 — Successfully Concluded',
  '<p><strong>The inaugural Shanghai Debate PentaLeague has come to a wonderful close. Thank you to every debater, judge, organizer, and supporter who made this tournament possible.</strong></p>

<h2>A tournament to remember</h2>
<p>Over two days of rigorous Public Forum competition in Shanghai, teams from across the region brought sharp arguments, thoughtful rebuttals, and exemplary sportsmanship to every round. From the opening preliminaries through the grand final and closing ceremony, PentaLeague 2025 showcased exactly what we hoped for when we launched this event: conviction, curiosity, and a community united by the love of debate.</p>

<h2>Congratulations to our award winners</h2>
<ul>
<li><strong>🏆 Champion:</strong> Tim Zhang &amp; Angela Liu</li>
<li><strong>🥈 Runner-up:</strong> Sharon Lu &amp; Coco Ke</li>
<li><strong>🥉 Second Runner-up:</strong> Serene &amp; Snow</li>
</ul>
<p><strong>Speaker awards:</strong> Gold — Tim Zhang · Silver — Catherine Zeng · Bronze — Sharon Lu</p>
<p>Full results and standings are available on our <a href="/tournament/shanghai-pentaleague-2025">PentaLeague 2025 tournament page</a>.</p>

<h2>Thank you</h2>
<p>To every <strong>debater</strong> who stepped into the room with courage and preparation — thank you for the quality of your arguments and the respect you showed your opponents.</p>
<p>To every <strong>judge</strong> who volunteered their time, expertise, and thoughtful feedback — thank you for upholding the standards that make competitive debate meaningful.</p>
<p>To our volunteers, school partners, and the Oxymorona Debate Society team — thank you for the countless hours behind the scenes that made PentaLeague run smoothly.</p>

<h2>Looking ahead</h2>
<p>PentaLeague 2025 may be over, but this is only the beginning. We are already thinking about the next edition — more teams, more rounds, and an even stronger home for debate in Shanghai.</p>
<p>Stay tuned for announcements on future tournaments. Follow our <a href="/announcements">Announcements</a> page, keep practicing on the platform, and we hope to see you — on stage or in the judge''s chair — at the next PentaLeague.</p>

<p>Thank you again for being part of the inaugural Shanghai Debate PentaLeague. Until next time — keep debating.</p>

<p><em>— Oxymorona Debate Society · PentaLeague 2025 Organizing Committee</em></p>',
  true,
  '2025-12-09 00:00:00+08'::timestamptz,
  '2025-12-09 00:00:00+08'::timestamptz,
  '2025-12-09 00:00:00+08'::timestamptz,
  COALESCE(
    (SELECT created_by_user_id FROM public.announcements ORDER BY created_at LIMIT 1),
    (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
  )
WHERE NOT EXISTS (
  SELECT 1 FROM public.announcements
  WHERE title = 'Shanghai Debate PentaLeague 2025 — Successfully Concluded'
);
