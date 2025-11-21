import { supabase } from "@/integrations/supabase/client";

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail({ to, subject, text }: SendEmailParams): Promise<void> {
  if (!to) {
    console.warn("Email não fornecido, envio cancelado");
    return;
  }

  try {
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: { to, subject, text },
    });

    if (error) {
      console.error("Erro ao enviar email:", error);
      throw error;
    }

    console.log("Email enviado com sucesso para:", to);
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    // Não bloqueia a operação principal, apenas loga o erro
  }
}

export const EMAIL_TEMPLATES = {
  userSuspended: {
    subject: "A sua conta no ERP foi suspensa",
    text: `Olá,

Informamos que a sua conta de acesso ao ERP foi suspensa pelo administrador.

Deixará temporariamente de conseguir iniciar sessão e utilizar o sistema. Caso considere que esta suspensão não é adequada ou tenha alguma questão, por favor contacte o responsável pelo sistema ou a administração da empresa.

Esta mensagem foi enviada automaticamente. Por favor, não responda a este email.

Cumprimentos,
Equipa de Gestão do ERP`,
  },
  userReactivated: {
    subject: "A sua conta no ERP foi reativada",
    text: `Olá,

Informamos que a sua conta de acesso ao ERP foi reativada. Já pode voltar a iniciar sessão e utilizar o ERP normalmente com as permissões que lhe foram atribuídas.

Se tiver alguma dificuldade no acesso ou detetar algum problema, por favor contacte o responsável pelo sistema ou a administração da empresa.

Esta mensagem foi enviada automaticamente. Por favor, não responda a este email.

Cumprimentos,
Equipa de Gestão do ERP`,
  },
};
