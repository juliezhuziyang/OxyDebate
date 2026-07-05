import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, topic, speaker, skill, timeUsedSeconds, timeLimitMinutes } = await req.json();
    const trimmed = (transcript || '').trim();
    const wordCount = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;

    if (wordCount === 0) {
      return new Response(
        JSON.stringify({
          score: 0,
          strengths: 'No speech content was detected.',
          improvements: 'You must deliver an actual speech addressing the motion to receive a score.',
          specific: 'Ensure your microphone is working and speak clearly throughout your allocated time.',
          timing: `No words detected in ${timeUsedSeconds || 0} seconds of session time.`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const allocatedSeconds = (timeLimitMinutes || 5) * 60;
    const usedSeconds = timeUsedSeconds || 0;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a strict debate coach. Score ONLY what appears in the transcript — never invent arguments the speaker did not make.

Return ONLY valid JSON:
{
  "score": <0-100 integer>,
  "strengths": "<only praise things explicitly in the transcript, or state none>",
  "improvements": "<specific gaps based on what is missing from the transcript>",
  "specific": "<${skill}-focused advice tied to actual transcript content>",
  "timing": "<brief note on time used vs content volume>"
}

MANDATORY SCORING RULES (follow exactly):
- 0 words → score 0
- 1-9 words → score 0-10 maximum
- 10-29 words → score 0-25 maximum  
- 30-79 words → score 0-45 maximum
- 80-149 words → score 0-65 maximum
- 150+ words → may score up to 100 if quality warrants it
- If speaker used ${usedSeconds}s of ${allocatedSeconds}s allocated but transcript is tiny → score near the bottom of the allowed range
- Never give 50+ unless the transcript contains multiple developed arguments
- Never use generic template praise — quote or paraphrase ONLY what they actually said
- If transcript is gibberish, off-topic, or single repeated word → score accordingly low
- Be honest: mediocre content gets mediocre scores (40-55), not 75+

Topic: "${topic}"
Speaker: ${speaker}
Skill focus: ${skill}
Word count: ${wordCount}`
          },
          {
            role: 'user',
            content: `Score this transcript strictly. Do not assume anything not written here.

Time used: ${usedSeconds}s / ${allocatedSeconds}s allocated

Transcript:
"""
${trimmed}
"""`
          }
        ],
        temperature: 0.2,
        max_tokens: 600,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate feedback');
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    // Server-side clamp as safety net
    let maxScore = 100;
    if (wordCount < 10) maxScore = 10;
    else if (wordCount < 30) maxScore = 25;
    else if (wordCount < 80) maxScore = 45;
    else if (wordCount < 150) maxScore = 65;

    parsed.score = Math.max(0, Math.min(maxScore, Math.round(Number(parsed.score) || 0)));

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating AI feedback:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
