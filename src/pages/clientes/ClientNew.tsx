import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  phone: z.string().min(9, {
    message: "O número de telefone deve ter pelo menos 9 dígitos.",
  }),
  address: z.string().min(5, {
    message: "A morada deve ter pelo menos 5 caracteres.",
  }),
  taxId: z.string().min(9, {
    message: "O NIF deve ter exatamente 9 dígitos.",
  }).max(9, {
    message: "O NIF deve ter exatamente 9 dígitos.",
  }),
  notes: z.string().optional(),
});

const ClientNew = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      taxId: "",
      notes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const newClient: Client = {
      id: uuidv4(),
      ...values,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('Clientes')
        .insert({
          id: newClient.id,
          name: newClient.name,
          email: newClient.email,
          phone: newClient.phone,
          address: newClient.address,
          taxId: newClient.taxId,
          notes: newClient.notes,
          created_at: newClient.createdAt
        });

      if (error) throw error;
      
      toast.success("Cliente adicionado com sucesso!");
      navigate("/clientes/consultar");
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error("Erro ao adicionar cliente.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Novo Cliente</CardTitle>
          <CardDescription>Adicione um novo cliente ao sistema.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" placeholder="Nome do cliente" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="Email do cliente" type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" placeholder="Telefone do cliente" type="tel" {...form.register("phone")} />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="address">Morada</Label>
              <Input id="address" placeholder="Morada do cliente" {...form.register("address")} />
              {form.formState.errors.address && (
                <p className="text-sm text-red-500">{form.formState.errors.address.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="taxId">NIF</Label>
              <Input id="taxId" placeholder="NIF do cliente" {...form.register("taxId")} />
              {form.formState.errors.taxId && (
                <p className="text-sm text-red-500">{form.formState.errors.taxId.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea id="notes" placeholder="Notas adicionais" {...form.register("notes")} />
            </div>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Aguarde..." : "Adicionar Cliente"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientNew;
