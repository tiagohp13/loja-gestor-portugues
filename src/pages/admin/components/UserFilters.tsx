import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar por nome ou email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Role Filter */}
      <Select value={roleFilter} onValueChange={onRoleFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Todos os papéis" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os papéis</SelectItem>
          <SelectItem value="admin">Administrador</SelectItem>
          <SelectItem value="editor">Editor</SelectItem>
          <SelectItem value="viewer">Visualizador</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Todos os estados" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os estados</SelectItem>
          <SelectItem value="active">Ativo</SelectItem>
          <SelectItem value="suspended">Suspenso</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default UserFilters;
