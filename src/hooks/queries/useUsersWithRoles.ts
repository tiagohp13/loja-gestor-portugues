import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserWithRole {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: 'admin' | 'editor' | 'viewer';
  is_suspended?: boolean;
}

interface UseUsersWithRolesOptions {
  page?: number;
  limit?: number;
  enabled?: boolean;
}

/**
 * Hook to fetch all users with their roles efficiently
 * Uses a single optimized query instead of N+1 queries
 */
export const useUsersWithRoles = (options: UseUsersWithRolesOptions = {}) => {
  const { page = 1, limit = 50, enabled = true } = options;
  const offset = (page - 1) * limit;

  return useQuery({
    queryKey: ['users-with-roles', page, limit],
    queryFn: async () => {
      // Get user profiles without initial ordering
      const { data: profiles, error: profilesError, count } = await supabase
        .from('user_profiles')
        .select('user_id, name, email, avatar_url, is_suspended', { count: 'exact' })
        .range(offset, offset + limit - 1);

      if (profilesError) throw profilesError;
      if (!profiles) return { users: [], totalCount: 0 };

      // Get all user roles in a single query
      const userIds = profiles.map(p => p.user_id);
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      // Create a map for O(1) lookup
      const rolesMap = new Map(
        (roles || []).map(r => [r.user_id, r.role as 'admin' | 'editor' | 'viewer'])
      );

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = profiles.map(profile => ({
        id: profile.user_id,
        email: profile.email || 'Sem email',
        name: profile.name || undefined,
        avatar_url: profile.avatar_url || undefined,
        role: rolesMap.get(profile.user_id) || 'viewer',
        is_suspended: profile.is_suspended || false,
      }));

      // Custom sorting: Owner first, then by role, then alphabetically by name
      const OWNER_EMAIL = 'tiagohp13@hotmail.com';
      const sortedUsers = usersWithRoles.sort((a, b) => {
        // Owner always first
        const aIsOwner = a.email === OWNER_EMAIL;
        const bIsOwner = b.email === OWNER_EMAIL;
        if (aIsOwner) return -1;
        if (bIsOwner) return 1;

        // Then by role: admin > editor > viewer
        const roleOrder = { admin: 1, editor: 2, viewer: 3 };
        const roleComparison = roleOrder[a.role] - roleOrder[b.role];
        if (roleComparison !== 0) return roleComparison;

        // Within same role, alphabetically by name
        const aName = (a.name || a.email).toLowerCase();
        const bName = (b.name || b.email).toLowerCase();
        return aName.localeCompare(bName, 'pt-PT');
      });

      return {
        users: sortedUsers,
        totalCount: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    },
    enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to get role statistics
 */
export const useRoleStats = () => {
  return useQuery({
    queryKey: ['role-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role');

      if (error) throw error;

      const stats = (data || []).reduce(
        (acc, { role }) => {
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        admin: stats.admin || 0,
        editor: stats.editor || 0,
        viewer: stats.viewer || 0,
        total: (data || []).length,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};
