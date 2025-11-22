/**
 * Tenant Management Hooks
 * 
 * Exportações centralizadas para todos os hooks relacionados com multi-tenancy
 */

export { useTenant } from '@/contexts/TenantContext';
export { useTenantRole } from '../useTenantRole';
export { useIsSuperAdmin } from '../useIsSuperAdmin';
export { useTenantSubscription } from '../useTenantSubscription';
