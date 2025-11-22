import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdditionalUser {
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  phone?: string;
}

interface CreateOrganizationRequest {
  tenantName: string;
  adminEmail: string;
  subscriptionPlan: 'free' | 'basic' | 'premium' | 'unlimited';
  subscriptionStatus: 'active' | 'suspended' | 'cancelled';
  subscriptionStartsAt: string;
  notes?: string;
  isSuperAdminTenant?: boolean;
  taxId?: string;
  phone?: string;
  website?: string;
  industrySector?: string;
  additionalUsers?: AdditionalUser[];
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
      isSuperAdminTenant = false,
      taxId,
      phone,
      website,
      industrySector,
      additionalUsers = []
    }: CreateOrganizationRequest = await req.json();

    console.log('Creating organization:', { tenantName, adminEmail, subscriptionPlan, additionalUsersCount: additionalUsers.length });

    // Validar dados
    if (!tenantName || !adminEmail || !subscriptionPlan || !subscriptionStatus) {
      throw new Error('Campos obrigatórios em falta');
    }

    // Validar NIF para planos Basic e Premium
    const needsTaxId = (subscriptionPlan === 'basic' || subscriptionPlan === 'premium') && !isSuperAdminTenant;
    if (needsTaxId && !taxId) {
      throw new Error('NIF é obrigatório para planos Basic e Premium');
    }

    if (taxId && !/^\d{9}$/.test(taxId)) {
      throw new Error('NIF inválido. Deve ter 9 dígitos');
    }

    // Determinar limites do plano
    const planLimits = {
      free: { maxUsers: 1, maxProducts: 5 },
      basic: { maxUsers: 3, maxProducts: null },
      premium: { maxUsers: 10, maxProducts: null },
      unlimited: { maxUsers: null, maxProducts: null }
    };

    const limits = planLimits[subscriptionPlan];

    // Validar número de utilizadores
    const totalUsers = 1 + additionalUsers.length; // +1 para o admin principal
    if (!isSuperAdminTenant && limits.maxUsers && totalUsers > limits.maxUsers) {
      throw new Error(`Limite de utilizadores excedido. Plano ${subscriptionPlan} permite no máximo ${limits.maxUsers} utilizadores`);
    }

    // Verificar emails duplicados
    const allEmails = [adminEmail, ...additionalUsers.map(u => u.email)];
    const uniqueEmails = new Set(allEmails);
    if (uniqueEmails.size !== allEmails.size) {
      throw new Error('Existem emails duplicados na lista de utilizadores');
    }

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
        tax_id: taxId || null,
        phone: phone || null,
        website: website || null,
        industry_sector: industrySector || null,
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

    // 3. Criar/Associar utilizadores
    const createdUsers: Array<{ email: string; password?: string }> = [];

    // Processar admin principal
    const adminResult = await createOrAssociateUser(
      supabase,
      adminEmail,
      'Admin Principal',
      'admin',
      tenant.id,
      supabaseUrl
    );
    if (adminResult.password) {
      createdUsers.push({ email: adminEmail, password: adminResult.password });
    }

    // Processar utilizadores adicionais
    for (const user of additionalUsers) {
      const userResult = await createOrAssociateUser(
        supabase,
        user.email,
        user.name,
        user.role,
        tenant.id,
        supabaseUrl,
        user.phone
      );
      if (userResult.password) {
        createdUsers.push({ email: user.email, password: userResult.password });
      }
    }

    console.log(`Created ${createdUsers.length} new users, associated ${totalUsers} users total`);

    // 4. Enviar emails para novos utilizadores
    if (createdUsers.length > 0) {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      
      if (resendApiKey) {
        for (const user of createdUsers) {
          try {
            const emailResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`
              },
              body: JSON.stringify({
                from: 'NEXORA <onboarding@resend.dev>',
                to: [user.email],
                subject: `Bem-vindo à organização ${tenantName}`,
                html: `
                  <h1>Bem-vindo à ${tenantName}!</h1>
                  <p>A sua conta foi criada na plataforma NEXORA.</p>
                  <p><strong>Email:</strong> ${user.email}</p>
                  <p><strong>Password temporária:</strong> ${user.password}</p>
                  <p>Por favor, faça login e altere a sua password nas configurações.</p>
                  <p><a href="${supabaseUrl.replace('//', '//')}/login">Fazer Login</a></p>
                `
              })
            });

            if (!emailResponse.ok) {
              console.error('Failed to send email to', user.email, await emailResponse.text());
            } else {
              console.log('Welcome email sent to', user.email);
            }
          } catch (emailError) {
            console.error('Error sending email to', user.email, emailError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          tenant,
          totalUsers,
          newUsers: createdUsers.length,
          createdUsers: createdUsers.map(u => ({ email: u.email, password: u.password }))
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

async function createOrAssociateUser(
  supabase: any,
  email: string,
  name: string,
  role: 'admin' | 'editor' | 'viewer',
  tenantId: string,
  supabaseUrl: string,
  phone?: string
): Promise<{ userId: string; password?: string }> {
  // Verificar se utilizador já existe
  const { data: existingUser } = await supabase.auth.admin.listUsers();
  const userExists = existingUser?.users.find((u: any) => u.email === email);

  let userId: string;
  let temporaryPassword: string | undefined;

  if (userExists) {
    console.log('User already exists:', email);
    userId = userExists.id;
  } else {
    // Criar novo utilizador
    temporaryPassword = generatePassword();
    const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        name
      }
    });

    if (userError) {
      console.error('Error creating user:', userError);
      throw new Error(`Erro ao criar utilizador ${email}: ${userError.message}`);
    }

    userId = newUser.user!.id;
    console.log('New user created:', userId, email);
  }

  // Criar/atualizar perfil
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      email,
      name,
      phone: phone || null,
      access_level: role === 'admin' ? 'admin' : role === 'editor' ? 'editor' : 'viewer'
    });

  if (profileError) {
    console.error('Error creating/updating profile:', profileError);
  }

  // Associar utilizador ao tenant
  const { error: tenantUserError } = await supabase
    .from('tenant_users')
    .insert({
      tenant_id: tenantId,
      user_id: userId,
      role,
      status: 'active'
    })
    .select()
    .single();

  if (tenantUserError) {
    // Se já existe, atualizar
    if (tenantUserError.code === '23505') {
      const { error: updateError } = await supabase
        .from('tenant_users')
        .update({ role, status: 'active' })
        .eq('tenant_id', tenantId)
        .eq('user_id', userId);

      if (updateError) {
        throw new Error(`Erro ao atualizar associação do utilizador ${email}: ${updateError.message}`);
      }
    } else {
      throw new Error(`Erro ao associar utilizador ${email}: ${tenantUserError.message}`);
    }
  }

  // Criar/atualizar contexto se for o admin principal
  if (role === 'admin') {
    const { error: contextError } = await supabase
      .from('user_contexts')
      .upsert({
        user_id: userId,
        current_tenant_id: tenantId
      });

    if (contextError) {
      console.error('Error creating context:', contextError);
    }
  }

  return { userId, password: temporaryPassword };
}

function generatePassword(): string {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}
