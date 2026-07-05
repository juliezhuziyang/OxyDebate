/** Strip HTML tags and collapse whitespace for previews and plain-text analysis. */
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extract plain-text paragraphs from HTML or plain content. */
function extractParagraphs(content: string): string[] {
  if (!content.trim()) return [];

  if (/<p[\s>]/i.test(content)) {
    const matches = content.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) ?? [];
    const fromTags = matches
      .map((p) => stripHtml(p))
      .filter((p) => p.length > 0);
    if (fromTags.length > 0) return fromTags;
  }

  return content
    .split(/\n+/)
    .map((line) => stripHtml(line))
    .filter((line) => line.length > 0);
}

/** Short excerpt for the news feed index. */
export function getAnnouncementPreview(html: string, maxLength = 180): string {
  const text = stripHtml(html);
  if (!text) return 'Read the full announcement for details.';
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

/** Format publish date for display. */
export function formatAnnouncementDate(iso: string | null): string {
  if (!iso) return 'Recently published';
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatAnnouncementDateShort(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Expand short, unstructured announcements into readable long-form HTML.
 * Preserves meaning while adding headings and a polished closing section.
 */
export function enrichAnnouncementContent(title: string, content: string): string {
  const hasHeadings = /<h[23][^>]*>/i.test(content);
  const plainLength = stripHtml(content).length;

  if (hasHeadings && plainLength > 250) {
    return content;
  }

  const paragraphs = extractParagraphs(content);
  if (paragraphs.length === 0) {
    return content;
  }

  const lead = paragraphs[0];
  const body = paragraphs.slice(1);
  const titleLower = title.toLowerCase();

  let contextHeading = 'What you need to know';
  if (titleLower.includes('welcome') || titleLower.includes('launch')) {
    contextHeading = 'Welcome to the community';
  } else if (titleLower.includes('tournament') || titleLower.includes('competition')) {
    contextHeading = 'Tournament details';
  } else if (titleLower.includes('practice') || titleLower.includes('ai')) {
    contextHeading = 'How to get started';
  } else if (titleLower.includes('update') || titleLower.includes('new')) {
    contextHeading = "What's new";
  }

  const parts: string[] = [
    `<p><strong>${escapeHtml(lead)}</strong></p>`,
  ];

  if (body.length > 0) {
    parts.push(`<h2>${contextHeading}</h2>`);
    body.forEach((p) => {
      parts.push(`<p>${escapeHtml(p)}</p>`);
    });
  } else if (plainLength < 120) {
    parts.push(`<h2>${contextHeading}</h2>`);
    parts.push(
      `<p>We're sharing this update so every member of the Oxymorona Debate community stays informed and prepared. Take a moment to read through the details below — they'll help you make the most of what's available on the platform.</p>`
    );
  }

  parts.push('<h2>Next steps</h2>');
  parts.push(
    '<ul>' +
      '<li>Log in to <strong>oxydebate.com</strong> to access AI Practice, Global Practice, and Rankings.</li>' +
      '<li>Browse the <strong>Debate Guide</strong> under Resources for structured learning topics.</li>' +
      '<li>Share questions or feedback anytime through the <strong>Feedback</strong> section in My Debate.</li>' +
      '</ul>'
  );

  parts.push(
    '<p>Thank you for being part of Oxymorona Debate — where conviction meets curiosity. We look forward to seeing you in practice sessions and tournaments.</p>'
  );

  return parts.join('\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Content ready for article display (enriched when needed). */
export function getDisplayContent(announcement: { title: string; content: string }): string {
  return enrichAnnouncementContent(announcement.title, announcement.content);
}
