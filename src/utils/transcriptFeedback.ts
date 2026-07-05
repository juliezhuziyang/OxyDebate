export interface TranscriptAnalysis {
  wordCount: number;
  sentenceCount: number;
  isEmpty: boolean;
  maxReasonableScore: number;
  tier: 'empty' | 'minimal' | 'brief' | 'short' | 'moderate' | 'substantial';
}

export interface TranscriptFeedbackInput {
  transcript: string;
  timeUsedSeconds: number;
  totalTimeSeconds: number;
  skill: string;
}

export interface TranscriptFeedbackResult {
  score: number;
  strengths: string;
  improvements: string;
  specific: string;
  timing: string;
}

export function analyzeTranscript(
  transcript: string,
  timeUsedSeconds: number,
  totalTimeSeconds: number
): TranscriptAnalysis {
  const trimmed = transcript.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const sentenceCount = trimmed
    ? trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
    : 0;

  if (wordCount === 0) {
    return { wordCount: 0, sentenceCount: 0, isEmpty: true, maxReasonableScore: 0, tier: 'empty' };
  }

  let maxReasonableScore: number;
  let tier: TranscriptAnalysis['tier'];

  if (wordCount < 10) {
    tier = 'minimal';
    maxReasonableScore = 10;
  } else if (wordCount < 30) {
    tier = 'brief';
    maxReasonableScore = 25;
  } else if (wordCount < 80) {
    tier = 'short';
    maxReasonableScore = 45;
  } else if (wordCount < 150) {
    tier = 'moderate';
    maxReasonableScore = 65;
  } else {
    tier = 'substantial';
    maxReasonableScore = 100;
  }

  // Penalize long silence with very little content
  const minutesUsed = Math.max(timeUsedSeconds / 60, 0.1);
  const wordsPerMinute = wordCount / minutesUsed;
  const expectedMinWpm = 80;

  if (timeUsedSeconds >= 60 && wordsPerMinute < expectedMinWpm * 0.15) {
    maxReasonableScore = Math.min(maxReasonableScore, 10);
  } else if (timeUsedSeconds >= 120 && wordsPerMinute < expectedMinWpm * 0.25) {
    maxReasonableScore = Math.min(maxReasonableScore, 20);
  } else if (timeUsedSeconds >= totalTimeSeconds * 0.5 && wordCount < 40) {
    maxReasonableScore = Math.min(maxReasonableScore, 30);
  }

  return { wordCount, sentenceCount, isEmpty: false, maxReasonableScore, tier };
}

export function clampScoreToTranscript(score: number, analysis: TranscriptAnalysis): number {
  if (analysis.isEmpty) return 0;
  const clamped = Math.min(Math.max(0, Math.round(score)), analysis.maxReasonableScore);
  return clamped;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function buildTranscriptBasedFeedback(
  input: TranscriptFeedbackInput
): TranscriptFeedbackResult & { timeUsed: string; totalTime: string } {
  const { transcript, timeUsedSeconds, totalTimeSeconds, skill } = input;
  const analysis = analyzeTranscript(transcript, timeUsedSeconds, totalTimeSeconds);
  const timeUsed = formatTime(timeUsedSeconds);
  const totalTime = formatTime(totalTimeSeconds);
  const timePct = totalTimeSeconds > 0 ? (timeUsedSeconds / totalTimeSeconds) * 100 : 0;

  const timing =
    analysis.isEmpty
      ? `No speech was detected (${timeUsed} elapsed).`
      : timePct > 95
        ? `Used ${timeUsed} of ${totalTime} — good time usage, but scoring reflects content quality only.`
        : timePct > 50
          ? `Used ${timeUsed} of ${totalTime} — consider using more time to develop arguments.`
          : `Used only ${timeUsed} of ${totalTime} with ${analysis.wordCount} words — too little content for the time available.`;

  if (analysis.isEmpty) {
    return {
      score: 0,
      strengths: 'No speech content was detected to evaluate.',
      improvements:
        'Deliver an actual speech addressing the motion. Use your full time with structured arguments, evidence, and clear signposting.',
      specific: `A ${skill} practice requires spoken content — microphone permissions and clear delivery are essential.`,
      timing,
      timeUsed,
      totalTime,
    };
  }

  if (analysis.tier === 'minimal') {
    return {
      score: clampScoreToTranscript(5, analysis),
      strengths:
        analysis.wordCount > 0
          ? `Only ${analysis.wordCount} word(s) were captured — insufficient to demonstrate ${skill} skills.`
          : 'No meaningful speech content.',
      improvements:
        'Deliver a complete speech with an introduction, main arguments, and conclusion. Aim for at least several sentences directly addressing the motion.',
      specific: `For ${skill} practice, you need substantially more spoken content than a few words.`,
      timing,
      timeUsed,
      totalTime,
    };
  }

  if (analysis.tier === 'brief') {
    return {
      score: clampScoreToTranscript(15, analysis),
      strengths: `Your speech was very brief (${analysis.wordCount} words) — too short to assess ${skill} in depth.`,
      improvements:
        'Expand each argument with warrants and impacts. Use most of your allocated time and engage directly with the motion.',
      specific: 'Add evidence, respond to the debate context, and structure points clearly before concluding.',
      timing,
      timeUsed,
      totalTime,
    };
  }

  // Short/moderate/substantial without AI — conservative score from content volume only
  const volumeScore = Math.min(analysis.maxReasonableScore, Math.round(analysis.wordCount / 3));

  return {
    score: volumeScore,
    strengths: `Detected ${analysis.wordCount} words across ~${analysis.sentenceCount} sentence(s). Automated scoring could not fully analyze argument quality.`,
    improvements:
      'AI feedback was unavailable — review your transcript below and ensure each point has claim, warrant, and impact linked to the motion.',
    specific: `Focus on strengthening your ${skill} — add rebuttals, weighing, or structure as appropriate for your role.`,
    timing,
    timeUsed,
    totalTime,
  };
}

export function parseAndValidateAIFeedback(
  feedbackText: string,
  transcript: string,
  timeUsedSeconds: number,
  totalTimeSeconds: number
): TranscriptFeedbackResult & { timeUsed: string; totalTime: string } {
  const analysis = analyzeTranscript(transcript, timeUsedSeconds, totalTimeSeconds);
  const timeUsed = formatTime(timeUsedSeconds);
  const totalTime = formatTime(totalTimeSeconds);

  if (analysis.isEmpty) {
    return buildTranscriptBasedFeedback({
      transcript,
      timeUsedSeconds,
      totalTimeSeconds,
      skill: '',
    });
  }

  // Try JSON first
  try {
    const json = JSON.parse(feedbackText);
    if (typeof json.score === 'number') {
      return {
        score: clampScoreToTranscript(json.score, analysis),
        strengths: json.strengths || 'See feedback below.',
        improvements: json.improvements || 'Continue practicing.',
        specific: json.specific || json.recommendations || '',
        timing: json.timing || `Used ${timeUsed} of ${totalTime}.`,
        timeUsed,
        totalTime,
      };
    }
  } catch {
    // plain text fallback
  }

  const scoreMatch =
    feedbackText.match(/\*\*Score\*\*[:\s]*(\d+(?:\.\d+)?)/i) ||
    feedbackText.match(/(?:overall\s*)?score[:\s]*(\d+(?:\.\d+)?)\s*(?:\/\s*100)?/i) ||
    feedbackText.match(/(\d+(?:\.\d+)?)\s*\/\s*100/);

  let score = scoreMatch ? parseFloat(scoreMatch[1]) : analysis.maxReasonableScore * 0.5;
  score = clampScoreToTranscript(score, analysis);

  const strengthsMatch = feedbackText.match(/\*\*Strengths\*\*\s*([^*]+)/i);
  const improvementsMatch = feedbackText.match(/\*\*Areas for Improvement\*\*\s*([^*]+)/i);
  const specificMatch =
    feedbackText.match(/\*\*Specific Recommendations\*\*\s*([^*]+)/i) ||
    feedbackText.match(/\*\*Specific[^*]*\*\*\s*([^*]+)/i);

  return {
    score,
    strengths: strengthsMatch
      ? strengthsMatch[1].trim()
      : analysis.wordCount < 30
        ? `Very limited content (${analysis.wordCount} words) — little to praise.`
        : 'See AI analysis below.',
    improvements: improvementsMatch
      ? improvementsMatch[1].trim()
      : 'Expand and structure your arguments more fully.',
    specific: specificMatch ? specificMatch[1].trim() : feedbackText.slice(0, 300).trim(),
    timing: `Used ${timeUsed} of ${totalTime}. Score reflects transcript content only (${analysis.wordCount} words).`,
    timeUsed,
    totalTime,
  };
}
