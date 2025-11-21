import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { UserPlus, Loader2, Calendar as CalendarIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const createUserSchema = z.object({
  name: z.string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres')
    .trim(),
  email: z.string()
    .email('Email inválido')
    .max(255, 'O email deve ter no máximo 255 caracteres')
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(6, 'A password deve ter pelo menos 6 caracteres')
    .max(72, 'A password deve ter no máximo 72 caracteres'),
  role: z.enum(['admin', 'editor', 'viewer'], {
    required_error: 'Selecione uma permissão',
  }),
  accessExpiresAt: z.date().nullable().optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserFormProps {
  onSuccess?: () => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUser, setCreatedUser] = useState<{ email: string; name: string } | null>(null);

  const [calendarOpen, setCalendarOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: 'viewer',
      accessExpiresAt: null,
    },
  });

  const selectedRole = watch('role');
  const accessExpiresAt = watch('accessExpiresAt');

  const onSubmit = async (data: CreateUserFormData) => {
    setIsSubmitting(true);

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        return;
      }

      // Call edge function to create user
      const { data: result, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: data.email,
          password: data.password,
          name: data.name,
          role: data.role,
          accessExpiresAt: data.accessExpiresAt?.toISOString(),
        },
      });

      if (error) {
        console.error('Error creating user:', error);
        toast.error(error.message || 'Erro ao criar utilizador');
        return;
      }

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      // Log audit action
      if (result?.user) {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          await supabase.rpc('log_user_audit', {
            p_admin_id: currentUser.id,
            p_target_user_id: result.user.id,
            p_action: 'created',
            p_details: {
              email: data.email,
              name: data.name,
              role: data.role,
            },
          });
        }
      }

      setCreatedUser({ email: data.email, name: data.name });
      toast.success(`Utilizador ${data.name} criado com sucesso!`);
      reset();
      onSuccess?.();
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast.error('Erro ao criar utilizador. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {createdUser && (
        <Alert className="mb-4 border-green-600/20 bg-green-50 dark:bg-green-950/20">
          <AlertDescription className="space-y-3">
            <p className="font-medium text-green-900 dark:text-green-100">
              Utilizador <span className="font-bold">{createdUser.name}</span> criado com sucesso!
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Nunca fez login
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.info('Funcionalidade de envio de email em desenvolvimento');
              }}
              className="mt-2"
            >
              Enviar instruções por email
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Criar Novo Utilizador
          </CardTitle>
          <CardDescription>
            Adicione um novo utilizador ao sistema com as permissões apropriadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="João Silva"
                  {...register('name')}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="joao@exemplo.com"
                  {...register('email')}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  {...register('password')}
                  disabled={isSubmitting}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Permissão *</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => setValue('role', value as any)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar permissão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessExpiresAt">Validade de acesso até (opcional)</Label>
              <Controller
                control={control}
                name="accessExpiresAt"
                render={({ field }) => (
                  <div className="flex gap-2">
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isSubmitting}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value 
                            ? format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) 
                            : "Selecionar data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={(date) => {
                            field.onChange(date);
                            if (date) {
                              setCalendarOpen(false);
                            }
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    {field.value && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          field.onChange(null);
                          setCalendarOpen(false);
                        }}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              />
              <p className="text-sm text-muted-foreground">
                Após esta data, o utilizador será automaticamente suspenso
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A criar...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Criar Utilizador
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default CreateUserForm;
