import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface User {
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  phone?: string;
}

interface CreateUsersRequest {
  tenantId: string;
  tenantName: string;
  users: User[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { tenantId, tenantName, users }: CreateUsersRequest = await req.json();

    console.log('Creating users for tenant:', { tenantId, tenantName, usersCount: users.length });

    // Validar dados
    if (!tenantId || !users || users.length === 0) {
      throw new Error('Campos obrigatórios em falta');
    }

    // Verificar emails duplicados
    const emails = users.map(u => u.email);
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      throw new Error('Existem emails duplicados na lista de utilizadores');
    }

    const createdUsers: Array<{ email: string; password: string }> = [];

    // Criar cada utilizador
    for (const user of users) {
      const result = await createOrAssociateUser(
        supabase,
        user.email,
        user.name,
        user.role,
        tenantId,
        supabaseUrl,
        user.phone
      );
      if (result.password) {
        createdUsers.push({ email: user.email, password: result.password });
      }
    }

    console.log(`Created ${createdUsers.length} new users`);

    // Enviar emails para novos utilizadores
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
    console.error('Error in create-organization-users:', error);
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
