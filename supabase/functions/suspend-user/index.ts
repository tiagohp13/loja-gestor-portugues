import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SuspendUserRequest {
  userId: string;
  suspend: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin operations
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

    // Verify the user is an admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userRole || userRole.role !== 'admin') {
      console.error('User is not admin:', user.id);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { userId, suspend }: SuspendUserRequest = await req.json();

    if (!userId || suspend === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, suspend' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`${suspend ? 'Suspending' : 'Reactivating'} user:`, userId);

    // Update user_profiles
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update({ is_suspended: suspend })
      .eq('user_id', userId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to update user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update user metadata to reflect suspension status
    const { error: metadataError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          is_suspended: suspend
        }
      }
    );

    if (metadataError) {
      console.error('Error updating user metadata:', metadataError);
      // Continue anyway, profile was updated
    }

    // Record suspension history
    const { error: historyError } = await supabaseAdmin
      .from('user_suspension_history')
      .insert({
        user_id: userId,
        action: suspend ? 'suspended' : 'reactivated',
        performed_by: user.id,
        reason: suspend ? 'Suspenso por administrador' : 'Reativado por administrador'
      });

    if (historyError) {
      console.error('Error recording suspension history:', historyError);
      // Continue anyway, main operation succeeded
    }

    // If suspending, sign out all sessions for this user
    if (suspend) {
      console.log('Signing out all sessions for user:', userId);
      const { error: signOutError } = await supabaseAdmin.auth.admin.signOut(userId);
      
      if (signOutError) {
        console.error('Error signing out user:', signOutError);
        // Continue anyway, user is suspended in database
      }
    }

    console.log('User suspension status updated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        userId,
        suspended: suspend
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
