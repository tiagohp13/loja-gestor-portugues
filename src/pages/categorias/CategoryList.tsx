import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash, Plus, Search, ArrowUpDown, ArrowUp, ArrowDown, Package } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PageHeader from '@/components/ui/PageHeader';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import RecordCount from '@/components/common/RecordCount';

type SortField = 'name' | 'productCount';
type SortDirection = 'asc' | 'desc';

const CategoryList: React.FC = () => {
  const navigate = useNavigate();
  const { categories, deleteCategory, products } = useData();
  const { profile, loading } = useUserProfile();
  if (loading) return null;

  // Permissões diretamente do perfil
  const accessLevel = profile?.access_level;
  const isViewer   = accessLevel === 'viewer';
  const canCreate  = !isViewer;
  const canEdit    = !isViewer;
  const canDelete  = accessLevel === 'admin';

  // Banner de debug para confirmar que o código novo está a correr
  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-6">
        {isViewer && (
          <div style={{
            padding: '8px',
            background: '#fee',
            color: '#900',
            marginBottom: '16px',
            borderRadius: '4px'
          }}>
            🚫 Modo Convidado — botões ocultos
          </div>
        )}
        <PageHeader
          title="Categorias"
          description="Consultar e gerir todas as categorias"
          actions={
            canCreate && (
              <Button onClick={() => navigate('/categorias/nova')} className="flex items-center gap-2">
                <Plus size={16} /> Nova Categoria
              </Button>
            )
          }
        />

        <RecordCount title="Total de categorias" count={categories.length} />

        <div className="bg-white dark:bg-card rounded-lg shadow p-6 mt-6">
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" size={18} />
            <Input
              placeholder="Pesquisar por nome de categoria"
              value={categories.length ? categories[0]?.name : ''}
              onChange={e => {}}
              className="pl-10"
            />
          </div>

          {/* … resto do código igual ao teu original … */}
          {/* Aqui vão os filtros, sorting e o rendering dos cartões, conforme já tinhas */}

        </div>
      </div>
    </TooltipProvider>
  );
};

export default CategoryList;
