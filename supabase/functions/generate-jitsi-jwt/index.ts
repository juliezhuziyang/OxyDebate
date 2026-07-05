import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { create, getNumericDate, Header, Payload } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { roomName, userName, userEmail, isHost, userId } = await req.json();

    // Your API key and App ID
    const API_KEY = "vpaas-magic-cookie-33efea029781448088cb08c821f698b8/d4b86b";
    const APP_ID = "vpaas-magic-cookie-33efea029781448088cb08c821f698b8";
    
    // Your private key (PKCS#8 format)
    const privateKeyPem = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCGZ+3BwuLAhmQY
nWUPaY4PhGIkDQy45ZDRu/NroaWY2+lEUzAnWnJpRokPSumG3uKYdrFW2MHxxxV1
8a/d718WUofDnQYcxlloYKP7ng7n3DNJfMOnvos08NPl3kZ5w56rA3PsAPltwr5C
K/W04o6oFqsfcw0di/s5SZsv8HLs+i+ZZmgeysxCmAsbhBgukh1vjAzc7Qkb8eB3
PMREPe2lw/6OHBJbJuTg/MS1Kfq6SKms3RLQEOUUxc7yBiFXTd4en375ZuiZndK1
OMk14Ol6WE+SVQTn5rJZGMz6WjW7hTKijsTLRSZvAfykIRi42hsNFo0mVGEe5s3s
sSkFOIS7AgMBAAECggEAV10gnyy1RV1VnOZZ9U2wSIfNXw+YcGrP2nRoAlMdF6IC
GyZTi5DwA1wU5PrVlpQ0B9RG62OTlTvJyFNj9EeOsCzPEKh1e6i2HvGKRZh0qeNo
9uCBMPza8XuE0MrNVoKAFTr2U7ZCa0UFdG+sk3ocLkglzRh0svr1PkSI+f06RqxR
JjUfvwx2ycdFwH2ujRpeeBieSNFSS1UOMMeaIzm0MrOEouxyR78YoPTZvB+7YMzW
oow2pb85Uw0iZCIvdpSX0necHvIIkGpltG8SAgIuCbzvKBzojVV1InEa8ajAZ3FZ
YDiebrSuFVR5+pXuKgVIMge332VfnCvXklsYL4Nn6QKBgQD5GpeiYbqQg0FKOnvQ
K6wnGnGqeTf7IGWdSvFMaGZ0ZFuGZbajQCwk+1RAqer9UNLyns4wlqTTo6MzokIk
V17yjL35cKEaLosW0MlhadjYpIKk8fk66P68fHjTPxLCtWROMm1tg2VW/wWnRcOn
RANAU3dQedfMCx7OsiMOxOT3dQKBgQCKIHfsRtAHTookzQk5e0gcymcOwht5cOyI
LOo/GxS4Yhh7AO/pD8gOlF7XPvw9MBqDBabW6iOg+lkZNCFa0mqwqHZQZpJOvjov
kJXmXP4GB9ibFeFrQpE9dDbAmCe8lFVf6ZOuK61HBWKgN4m5EPbV+Dxf8vPzGV+W
xRa7Yx41bwKBgD/1dveHdjqCqPHhIEcr33DO1l5570i4Yb7ILjp7F8tMtT9FwGYc
JPl92n0b460U4oTPB4vsMffxLQcl4yunj0Zhoql4JLUvPCEojHxJjBbb7nthcaeR
iU5l+zPqHuwFXPLC+dvDf/KdWhs/y2OYD+mlRJ5SGnlWZZuWm2/AWDW9AoGAAsLP
YtuvgNXjEQVAL/P05w5srPDYV78YG0i6jfRen6jmUF8ebIwyNYhltOu/YwG5JfFQ
+m7Hs4oNieFu4T/ffhR/+O9z8TsAMr8zH92v/jLd84uma9xyxsWx6nugH7bfVgF3
QD4DQq4q4IT7rcVXCcPigRB8K9nP/VWHNMuwaOUCgYBwKpSlAPpp5e+Ihc4VFFEu
Osag+F2iRWtU8j1t+bjVtVOindpFCDUE4VGlsQgJOdBSww6mgGCdzozppBgQIGrU
WWoBMbOAIEFcL/Ay0zxOBr5tS3hAU8e0/nI1Rk+xCBjV6lhFDGcfjbue2xyfn+Js
urZKTiaRuqT99mme4zu+VA==
-----END PRIVATE KEY-----`;

    // Import the private key
    const binaryDerString = atob(privateKeyPem
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\s/g, ''));
    
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
      binaryDer[i] = binaryDerString.charCodeAt(i);
    }

    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );

    // Create JWT header
    const header: Header = {
      alg: "RS256",
      typ: "JWT",
      kid: API_KEY
    };

    // Create JWT payload
    const now = Math.floor(Date.now() / 1000);
    const payload: Payload = {
      iss: "chat",
      aud: "jitsi",
      exp: now + 7200, // 2 hours
      nbf: now - 10,   // 10 seconds ago
      sub: APP_ID,
      room: `*`,
      context: {
        user: {
          id: userId,
          name: userName,
          email: userEmail,
          moderator: isHost,
        },
        features: {
          livestreaming: false,
          recording: false,
          transcription: false,
          "outbound-call": false
        }
      }
    };

    // Generate JWT
    const jwt = await create(header, payload, privateKey);

    console.log('Generated JWT for room:', roomName, 'user:', userName, 'isHost:', isHost);

    return new Response(
      JSON.stringify({ jwt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating JWT:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});