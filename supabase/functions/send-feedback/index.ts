import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackRequest {
  name?: string;
  email?: string;
  message: string;
}

// Utility function to escape HTML characters (Deno-compatible)
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Utility function to safely format HTML email content
const formatEmailContent = (name?: string, email?: string, message?: string): string => {
  const safeName = name ? escapeHtml(name.trim().slice(0, 100)) : 'Anonymous';
  const safeEmail = email ? escapeHtml(email.trim().slice(0, 255)) : 'N/A';
  const safeMessage = message ? escapeHtml(message.trim().slice(0, 2000)).replace(/\n/g, '<br/>') : '';
  
  return `
    <h2>New feedback received</h2>
    <p><strong>From:</strong> ${safeName} (${safeEmail})</p>
    <p><strong>Message:</strong></p>
    <p>${safeMessage}</p>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message }: FeedbackRequest = await req.json();

    // Validate input lengths
    if (name && name.length > 100) {
      return new Response(JSON.stringify({ error: "Name too long" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (email && email.length > 255) {
      return new Response(JSON.stringify({ error: "Email too long" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!message || message.length > 2000) {
      return new Response(JSON.stringify({ error: "Message required and must be under 2000 characters" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const emailResponse = await resend.emails.send({
      from: "Oxymorona <onboarding@resend.dev>",
      to: ["juliezhu.ziyang@gmail.com"],
      subject: `New feedback from ${name || 'Anonymous'}`,
      html: formatEmailContent(name, email, message),
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
