import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Verify Firebase ID Token via Google Identity Toolkit
async function verifyFirebaseToken(idToken: string, projectId: string): Promise<string> {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${Deno.env.get('FIREBASE_API_KEY')}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  const data = await response.json();
  if (!response.ok || !data.users || data.users.length === 0) {
    throw new Error(data.error?.message || 'Invalid or expired Firebase auth token.');
  }

  return data.users[0].localId; // Authenticated Firebase UID
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const idToken = authHeader.replace('Bearer ', '').trim();
    const firebaseProjectId = Deno.env.get('VITE_FIREBASE_PROJECT_ID') || 'embedx-pcb-workshop';
    
    // Verify user identity
    const uid = await verifyFirebaseToken(idToken, firebaseProjectId);

    const body = await req.json();
    const { attemptId, extension, contentType } = body;

    if (!attemptId || typeof attemptId !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing attemptId.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const allowedExts = ['png', 'jpg', 'jpeg'];
    const normalizedExt = (extension || '').toLowerCase().replace('.', '');
    if (!allowedExts.includes(normalizedExt)) {
      return new Response(JSON.stringify({ error: 'Only PNG and JPEG file formats are permitted.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const allowedContentTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (contentType && !allowedContentTypes.includes(contentType.toLowerCase())) {
      return new Response(JSON.stringify({ error: 'Invalid file content type.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase Admin Client using backend secret
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Server misconfiguration: Supabase credentials missing.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const path = `${uid}/${attemptId}.${normalizedExt}`;

    // Generate short-lived signed upload URL (valid for 15 minutes / 900 seconds)
    const { data: signedData, error: signedError } = await supabase.storage
      .from('payment-screenshots')
      .createSignedUploadUrl(path);

    if (signedError || !signedData) {
      console.error('Supabase signed URL error:', signedError);
      return new Response(JSON.stringify({ error: 'Failed to create signed upload URL.', details: signedError?.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        signedUrl: signedData.signedUrl,
        path: path,
        token: signedData.token,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('Generate upload URL error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
