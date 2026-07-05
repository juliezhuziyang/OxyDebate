import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WSDC_ORDER = ['PM', 'LO', 'DPM', 'DLO', 'GW', 'OW', 'GR', 'OR'];
const PF_ORDER = ['constructive', 'rebuttal', 'summary', 'final-focus'];

function getPriorSpeakers(format: string, speaker: string): string[] {
  const order = format === 'WSDC' ? WSDC_ORDER : PF_ORDER;
  const index = order.indexOf(speaker);
  if (index <= 0) return [];
  return order.slice(0, index);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, format, speaker, seed } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const priorSpeakers = getPriorSpeakers(format, speaker);
    const sideKey = format === 'WSDC' ? 'government/opposition' : 'pro/con';
    const sessionSeed = seed || `${Date.now()}-${Math.random()}`;

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
            content: `You generate realistic, varied "debate so far" context for practice debates.

Return ONLY valid JSON with this exact shape:
{
  "speeches": [
    { "speaker": "LO", "label": "Leader of Opposition", "side": "opposition", "point": "One concise sentence (max 25 words)", "strength": 72 }
  ],
  "clashScore": { "government": 58, "opposition": 42 },
  "focus": "One sentence telling the current speaker what to prioritize"
}

Rules:
- Topic: "${topic}"
- Format: ${format}
- Current speaker: ${speaker}
- Prior speakers only: ${priorSpeakers.join(', ') || 'none'}
- Side values: ${format === 'WSDC' ? '"government" or "opposition"' : '"pro" or "con"'}
- Include ONLY speeches from prior speakers (max ${Math.min(priorSpeakers.length, 4)} entries)
- Each point must be specific to "${topic}" — no generic filler
- Vary arguments every session (seed: ${sessionSeed}) — imagine a different round with new examples
- Keep points SHORT (one sentence each)
- strength is 50-90 reflecting how persuasive that speech was
- clashScore must sum to 100
- focus is actionable advice for ${speaker} on this motion`
          },
          {
            role: 'user',
            content: `Generate unique debate-so-far JSON for seed ${sessionSeed}.`
          }
        ],
        temperature: 0.95,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate context');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating debate context:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
