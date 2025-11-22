import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateOrganizationRequest {
  tenantName: string;
  adminEmail: string;
  subscriptionPlan: 'free' | 'basic' | 'premium' | 'unlimited';
  subscriptionStatus: 'active' | 'suspended' | 'cancelled';
  subscriptionStartsAt: string;
  notes?: string;
  isSuperAdminTenant?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      tenantName,
      adminEmail,
      subscriptionPlan,
      subscriptionStatus,
      subscriptionStartsAt,
      notes,
      isSuperAdminTenant = false
    }: CreateOrganizationRequest = await req.json();

    console.log('Creating organization:', { tenantName, adminEmail, subscriptionPlan });

    // Validar dados
    if (!tenantName || !adminEmail || !subscriptionPlan || !subscriptionStatus) {
      throw new Error('Campos obrigatórios em falta');
    }

    // Determinar limites do plano
    const planLimits = {
      free: { maxUsers: 1, maxProducts: 5 },
      basic: { maxUsers: 3, maxProducts: null },
      premium: { maxUsers: 10, maxProducts: null },
      unlimited: { maxUsers: null, maxProducts: null }
    };

    const limits = planLimits[subscriptionPlan];

    // Gerar slug único
    const slug = tenantName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // 1. Criar tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: tenantName,
        slug,
        status: 'active',
        settings: {
          notes: notes || null,
          is_superadmin_tenant: isSuperAdminTenant
        }
      })
      .select()
      .single();

    if (tenantError) {
      console.error('Error creating tenant:', tenantError);
      throw new Error(`Erro ao criar organização: ${tenantError.message}`);
    }

    console.log('Tenant created:', tenant.id);

    // 2. Criar subscrição
    const { error: subscriptionError } = await supabase
      .from('tenant_subscriptions')
      .insert({
        tenant_id: tenant.id,
        plan_name: isSuperAdminTenant ? 'unlimited' : subscriptionPlan,
        status: subscriptionStatus,
        max_users: isSuperAdminTenant ? null : limits.maxUsers,
        max_products: isSuperAdminTenant ? null : limits.maxProducts,
        created_at: subscriptionStartsAt
      });

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);
      throw new Error(`Erro ao criar subscrição: ${subscriptionError.message}`);
    }

    console.log('Subscription created');

    // 3. Verificar se utilizador já existe
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users.find(u => u.email === adminEmail);

    let userId: string;
    let passwordGenerated = false;
    let temporaryPassword = '';

    if (userExists) {
      console.log('User already exists:', adminEmail);
      userId = userExists.id;
    } else {
      // Criar novo utilizador
      temporaryPassword = generatePassword();
      const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          name: adminEmail.split('@')[0]
        }
      });

      if (userError) {
        console.error('Error creating user:', userError);
        throw new Error(`Erro ao criar utilizador: ${userError.message}`);
      }

      userId = newUser.user!.id;
      passwordGenerated = true;
      console.log('New user created:', userId);
    }

    // 4. Criar perfil de utilizador se não existir
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        email: adminEmail,
        name: adminEmail.split('@')[0],
        access_level: 'admin'
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }

    // 5. Associar utilizador ao tenant como admin
    const { error: tenantUserError } = await supabase
      .from('tenant_users')
      .insert({
        tenant_id: tenant.id,
        user_id: userId,
        role: 'admin',
        status: 'active'
      });

    if (tenantUserError) {
      console.error('Error associating user to tenant:', tenantUserError);
      throw new Error(`Erro ao associar utilizador: ${tenantUserError.message}`);
    }

    console.log('User associated to tenant');

    // 6. Criar contexto do utilizador
    const { error: contextError } = await supabase
      .from('user_contexts')
      .upsert({
        user_id: userId,
        current_tenant_id: tenant.id
      });

    if (contextError) {
      console.error('Error creating context:', contextError);
    }

    // 7. Enviar email de convite se criou novo utilizador
    if (passwordGenerated) {
      try {
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        
        if (resendApiKey) {
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
              from: 'NEXORA <onboarding@resend.dev>',
              to: [adminEmail],
              subject: `Bem-vindo à organização ${tenantName}`,
              html: `
                <h1>Bem-vindo à ${tenantName}!</h1>
                <p>A sua conta de administrador foi criada na plataforma NEXORA.</p>
                <p><strong>Email:</strong> ${adminEmail}</p>
                <p><strong>Password temporária:</strong> ${temporaryPassword}</p>
                <p>Por favor, faça login e altere a sua password nas configurações.</p>
                <p><a href="${supabaseUrl.replace('//', '//')}/login">Fazer Login</a></p>
              `
            })
          });

          if (!emailResponse.ok) {
            console.error('Failed to send email:', await emailResponse.text());
          } else {
            console.log('Welcome email sent');
          }
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Não falhar a operação se o email falhar
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          tenant,
          userId,
          passwordGenerated,
          temporaryPassword: passwordGenerated ? temporaryPassword : null
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in create-organization:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});

function generatePassword(): string {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}
