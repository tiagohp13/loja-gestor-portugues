import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateLoginRequest {
  email: string;
  ipAddress?: string;
  userAgent?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { email, ipAddress, userAgent }: ValidateLoginRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Validating login for:', email);

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, is_suspended, access_expires_at')
      .eq('email', email)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user exists
    if (!profile) {
      // User doesn't exist - log failed attempt
      await supabaseAdmin.rpc('log_failed_login_attempt', {
        p_email: email,
        p_ip_address: ipAddress || null,
        p_user_agent: userAgent || null,
        p_reason: 'user_not_found'
      });

      return new Response(
        JSON.stringify({ 
          valid: false, 
          reason: 'invalid_credentials',
          message: 'Email ou palavra-passe incorretos'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if account is suspended
    if (profile.is_suspended) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          reason: 'account_suspended',
          message: 'Conta suspensa. Contacte o administrador.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if access has expired
    if (profile.access_expires_at) {
      const expirationDate = new Date(profile.access_expires_at);
      const now = new Date();
      
      if (expirationDate < now) {
        // Auto-suspend expired account
        await supabaseAdmin
          .from('user_profiles')
          .update({ is_suspended: true })
          .eq('user_id', profile.user_id);

        // Log audit
        await supabaseAdmin.rpc('log_user_audit', {
          p_admin_id: profile.user_id, // system action
          p_target_user_id: profile.user_id,
          p_action: 'auto_suspended',
          p_details: { 
            reason: 'access_expired', 
            expired_at: profile.access_expires_at 
          }
        });

        return new Response(
          JSON.stringify({ 
            valid: false, 
            reason: 'access_expired',
            message: 'O seu acesso expirou. Contacte o administrador.'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // All checks passed
    return new Response(
      JSON.stringify({ 
        valid: true,
        userId: profile.user_id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
