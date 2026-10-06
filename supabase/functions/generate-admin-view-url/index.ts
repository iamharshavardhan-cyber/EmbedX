import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifyFirebaseTokenAndRole(idToken: string): Promise<{ uid: string; email?: string }> {
  const firebaseApiKey = Deno.env.get('FIREBASE_API_KEY');
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  const data = await response.json();
  if (!response.ok || !data.users || data.users.length === 0) {
    throw new Error(data.error?.message || 'Invalid or expired Firebase auth token.');
  }

  const user = data.users[0];
  return { uid: user.localId, email: user.email };
}

async function verifyAdminRoleInFirestore(uid: string, idToken: string): Promise<boolean> {
  const firebaseProjectId = Deno.env.get('VITE_FIREBASE_PROJECT_ID') || 'embedx-pcb-workshop';
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/roles/${uid}`;

  const response = await fetch(firestoreUrl, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!response.ok) return false;

  const data = await response.json();
  const role = data.fields?.role?.stringValue;
  return role === 'admin' || role === 'super_admin';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const idToken = authHeader.replace('Bearer ', '').trim();
    const { uid } = await verifyFirebaseTokenAndRole(idToken);

    // Verify caller has admin or super_admin role
    const isAdmin = await verifyAdminRoleInFirestore(uid, idToken);
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Unauthorized. Admin role required.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { screenshotRef } = body;

    if (!screenshotRef || typeof screenshotRef !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing screenshotRef.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Server misconfiguration: Supabase credentials missing.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate short-lived signed GET URL (valid for 10 minutes / 600 seconds)
    const { data: signedData, error: signedError } = await supabase.storage
      .from('payment-screenshots')
      .createSignedUrl(screenshotRef, 600);

    if (signedError || !signedData) {
      return new Response(JSON.stringify({ error: 'Failed to create signed GET URL.', details: signedError?.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        signedUrl: signedData.signedUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('Generate admin view URL error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
