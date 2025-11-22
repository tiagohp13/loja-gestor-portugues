import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface TenantEditData {
  id: string;
  name: string;
  slug: string;
  tax_id?: string | null;
  phone?: string | null;
  website?: string | null;
  industry_sector?: string | null;
  status: string;
}

interface TenantEditModalProps {
  tenant: TenantEditData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INDUSTRY_SECTORS = [
  'Comércio',
  'Serviços',
  'Indústria',
  'Tecnologia',
  'Saúde',
  'Educação',
  'Construção',
  'Alimentação',
  'Transporte',
  'Outro'
];

const TenantEditModal: React.FC<TenantEditModalProps> = ({
  tenant,
  open,
  onOpenChange,
}) => {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<TenantEditData>({
    id: '',
    name: '',
    slug: '',
    tax_id: '',
    phone: '',
    website: '',
    industry_sector: '',
    status: 'active',
  });

  useEffect(() => {
    if (tenant) {
      setFormData(tenant);
    }
  }, [tenant]);

  const validateNIF = (nif: string): boolean => {
    if (!nif) return true;
    return /^\d{9}$/.test(nif);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome da organização é obrigatório');
      return;
    }

    if (formData.tax_id && !validateNIF(formData.tax_id)) {
      toast.error('Introduza um NIF válido com 9 dígitos');
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          name: formData.name,
          tax_id: formData.tax_id || null,
          phone: formData.phone || null,
          website: formData.website || null,
          industry_sector: formData.industry_sector || null,
          status: formData.status,
        })
        .eq('id', formData.id);

      if (error) throw error;

      toast.success('Organização atualizada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['all-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-tenants'] });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating tenant:', error);
      toast.error(error.message || 'Erro ao atualizar organização');
    } finally {
      setIsSaving(false);
    }
  };

  if (!tenant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Editar Organização</DialogTitle>
              <DialogDescription>
                Atualize as informações da organização
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informação Básica */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Informação Básica</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Organização *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: AquaParaíso"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (não editável)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_id">NIF</Label>
                <Input
                  id="tax_id"
                  value={formData.tax_id || ''}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                  placeholder="9 dígitos"
                  maxLength={9}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+351..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry_sector">Setor de Atividade</Label>
                <Select 
                  value={formData.industry_sector || ''} 
                  onValueChange={(value) => setFormData({ ...formData, industry_sector: value })}
                >
                  <SelectTrigger id="industry_sector">
                    <SelectValue placeholder="Selecione um setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_SECTORS.map((sector) => (
                      <SelectItem key={sector} value={sector.toLowerCase()}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'A guardar...' : 'Guardar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TenantEditModal;
