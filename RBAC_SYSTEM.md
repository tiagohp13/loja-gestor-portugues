# Sistema RBAC - Role-Based Access Control

## 📋 Visão Geral

Este projeto implementa um sistema completo de controlo de acesso baseado em papéis (RBAC) usando Supabase e React Query.

## 🏗️ Arquitetura

### Base de Dados

#### Tabela: `user_roles`
```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, role)
);
```

#### Enum: `app_role`
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');
```

### Funções de Segurança (SECURITY DEFINER)

#### `has_role(_user_id UUID, _role app_role)`
Verifica se um utilizador tem um papel específico.
```sql
SELECT public.has_role(auth.uid(), 'admin'); -- true/false
```

#### `get_user_role(_user_id UUID)`
Retorna o papel principal do utilizador (prioridade: admin > editor > viewer).
```sql
SELECT public.get_user_role(auth.uid()); -- 'admin', 'editor', ou 'viewer'
```

#### `has_any_role(_user_id UUID, _roles app_role[])`
Verifica se um utilizador tem qualquer um dos papéis especificados.
```sql
SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'editor']::app_role[]);
```

### Sincronização Automática

O sistema mantém compatibilidade com o campo `access_level` da tabela `user_profiles`:
- Quando `access_level` é atualizado em `user_profiles`, um trigger automático sincroniza o papel em `user_roles`
- Isso permite uma transição suave do sistema antigo para o RBAC

## 🎯 Papéis e Permissões

### 👑 Administrador (admin)
**Acesso total ao sistema**
- ✅ Visualizar todos os dados
- ✅ Criar novos registos
- ✅ Editar registos existentes
- ✅ Eliminar registos
- ✅ Gerir utilizadores e papéis
- ✅ Aceder a configurações avançadas

### ✏️ Editor (editor)
**Pode criar e editar conteúdo**
- ✅ Visualizar todos os dados
- ✅ Criar novos registos
- ✅ Editar registos existentes
- ❌ Eliminar registos
- ❌ Gerir utilizadores
- ❌ Aceder a configurações avançadas

### 👁️ Visualizador (viewer)
**Apenas leitura**
- ✅ Visualizar todos os dados
- ❌ Criar novos registos
- ❌ Editar registos
- ❌ Eliminar registos
- ❌ Gerir utilizadores
- ❌ Aceder a configurações

## 🔧 Como Usar no Frontend

### Hook Principal: `usePermissions()`

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { 
    isAdmin,      // true se admin
    isEditor,     // true se editor
    isViewer,     // true se viewer
    canCreate,    // true se admin ou editor
    canEdit,      // true se admin ou editor
    canDelete,    // true apenas se admin
    can,          // função para verificar permissões específicas
    hasRole,      // função para verificar role específico
    roleName      // nome amigável do papel
  } = usePermissions();

  return (
    <div>
      {canCreate && <Button>Criar Novo</Button>}
      {canDelete && <Button variant="destructive">Eliminar</Button>}
      
      {/* Verificar permissão específica */}
      {can("products.delete") && <Button>Eliminar Produto</Button>}
      
      {/* Verificar role específico */}
      {hasRole("admin") && <AdminPanel />}
    </div>
  );
}
```

### Hook Avançado: `useRolePermissions()`

```typescript
import { useRolePermissions } from '@/hooks/useRolePermissions';

function AdvancedComponent() {
  const {
    role,           // 'admin' | 'editor' | 'viewer' | null
    roleName,       // Nome amigável
    can,            // Verificar permissão granular
    hasRole,        // Verificar role específico
    hasAnyRole,     // Verificar múltiplos roles
    isLoading,
    isAdmin,
    isEditor,
    isViewer
  } = useRolePermissions();

  // Verificar permissão granular
  if (can("orders.delete")) {
    // Mostrar botão de eliminar encomenda
  }

  // Verificar múltiplos roles
  if (hasAnyRole(["admin", "editor"])) {
    // Mostrar formulário de edição
  }

  return <div>{roleName}</div>;
}
```

## 🔒 Segurança RLS (Row Level Security)

### Políticas Aplicadas à `user_roles`

```sql
-- Utilizadores podem ver os seus próprios roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Apenas admins podem modificar roles
CREATE POLICY "Admins can insert/update/delete roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));
```

### Exemplo de Política em Outras Tabelas

```sql
-- Apenas admins podem eliminar produtos
CREATE POLICY "Only admins can delete products"
ON public.products FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins e editores podem criar produtos
CREATE POLICY "Admins and editors can create products"
ON public.products FOR INSERT
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'editor']::app_role[]));
```

## 🎨 Componentes de Interface

### Gestão de Papéis (`/admin/roles`)

Página administrativa para:
- Ver todos os utilizadores do sistema
- Alterar papéis de utilizadores
- Ver estatísticas de distribuição de papéis
- Consultar matriz completa de permissões

**Acesso:** Apenas administradores

### Matriz de Permissões

Componente visual que mostra todas as permissões de cada papel:

| Recurso | Ação | Admin | Editor | Viewer |
|---------|------|-------|--------|--------|
| Produtos | Visualizar | ✓ | ✓ | ✓ |
| Produtos | Criar | ✓ | ✓ | ✗ |
| Produtos | Editar | ✓ | ✓ | ✗ |
| Produtos | Eliminar | ✓ | ✗ | ✗ |

## 🚀 Fluxo de Atribuição de Papéis

1. **Novo Utilizador**
   - Regista-se no sistema
   - Perfil criado automaticamente em `user_profiles` com `access_level: 'viewer'`
   - Trigger sincroniza automaticamente para `user_roles` com `role: 'viewer'`

2. **Atualização de Papel (por admin)**
   - Admin acede a `/admin/roles`
   - Seleciona novo papel no dropdown
   - Sistema atualiza `user_profiles.access_level`
   - Trigger sincroniza automaticamente para `user_roles.role`
   - Cache do React Query invalida automaticamente
   - UI atualiza instantaneamente

3. **Verificação de Permissões**
   - Frontend: `usePermissions()` consulta `get_user_role()`
   - Backend: Políticas RLS usam `has_role()` para validar acesso
   - Segurança dupla: UI + Base de Dados

## 🛡️ Boas Práticas de Segurança

### ✅ O que FAZER

- Sempre usar funções `SECURITY DEFINER` (`has_role`, `get_user_role`) nas políticas RLS
- Verificar permissões no frontend E backend (defesa em profundidade)
- Usar o hook `usePermissions()` em todos os componentes que precisam de controlo de acesso
- Testar alterações de papéis com diferentes utilizadores
- Nunca armazenar papéis em localStorage/sessionStorage (usar apenas Supabase)

### ❌ O que NÃO FAZER

- ❌ Nunca verificar papéis diretamente na tabela `user_roles` dentro de políticas RLS (causa recursão infinita)
- ❌ Nunca usar `auth.users` diretamente (esquema gerido pelo Supabase)
- ❌ Nunca confiar apenas na validação do frontend (sempre validar no backend)
- ❌ Nunca armazenar papéis em `user_profiles` e `user_roles` manualmente (usar trigger)

## 📊 Monitorização

### Ver Roles de Todos os Utilizadores
```sql
SELECT 
  up.email,
  up.name,
  ur.role,
  ur.created_at
FROM user_profiles up
LEFT JOIN user_roles ur ON ur.user_id = up.user_id
ORDER BY ur.role, up.created_at;
```

### Ver Utilizadores Sem Role Atribuído
```sql
SELECT up.* 
FROM user_profiles up
LEFT JOIN user_roles ur ON ur.user_id = up.user_id
WHERE ur.id IS NULL;
```

## 🔄 Compatibilidade

O sistema mantém **100% de compatibilidade** com código existente:
- `usePermissions()` continua a funcionar com `isAdmin`, `canCreate`, `canDelete`, etc.
- Código antigo que usa `access_level` continua funcional
- Sincronização automática entre `access_level` e `role`
- Transição sem breaking changes

## 📝 Próximos Passos (Opcional)

Para expandir o sistema RBAC no futuro:

1. **Permissões Granulares por Recurso**
   - Adicionar coluna `permissions JSONB` em `user_roles`
   - Permitir sobrescrever permissões específicas por utilizador

2. **Auditoria de Ações**
   - Log de alterações de papéis
   - Histórico de acessos por utilizador

3. **Papéis Temporários**
   - Adicionar `expires_at` em `user_roles`
   - Revogar automaticamente após expiração

4. **Múltiplos Papéis por Utilizador**
   - Remover restrição `UNIQUE(user_id, role)`
   - Permitir utilizador ser `editor` + `viewer` simultaneamente
