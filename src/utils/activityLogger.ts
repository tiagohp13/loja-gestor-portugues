import { supabase } from '@/integrations/supabase/client';

export interface ActivityLogParams {
  actionType: string;
  actionDescription: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
}

/**
 * Log user activity for audit trail
 */
export const logUserActivity = async (params: ActivityLogParams): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Cannot log activity: No user authenticated');
      return;
    }

    const { error } = await supabase.rpc('log_user_activity', {
      p_user_id: user.id,
      p_action_type: params.actionType,
      p_action_description: params.actionDescription,
      p_entity_type: params.entityType || null,
      p_entity_id: params.entityId || null,
      p_entity_name: params.entityName || null,
    });

    if (error) {
      console.error('Error logging user activity:', error);
    }
  } catch (error) {
    console.error('Exception logging user activity:', error);
  }
};

/**
 * Helper functions for common activities
 */
export const activityLogger = {
  created: (entityType: string, entityName: string, entityId?: string) =>
    logUserActivity({
      actionType: 'create',
      actionDescription: `Criou ${entityType} "${entityName}"`,
      entityType,
      entityId,
      entityName,
    }),

  updated: (entityType: string, entityName: string, entityId?: string) =>
    logUserActivity({
      actionType: 'update',
      actionDescription: `Editou ${entityType} "${entityName}"`,
      entityType,
      entityId,
      entityName,
    }),

  deleted: (entityType: string, entityName: string, entityId?: string) =>
    logUserActivity({
      actionType: 'delete',
      actionDescription: `Eliminou ${entityType} "${entityName}"`,
      entityType,
      entityId,
      entityName,
    }),

  converted: (fromType: string, toType: string, entityName: string) =>
    logUserActivity({
      actionType: 'convert',
      actionDescription: `Converteu ${fromType} "${entityName}" em ${toType}`,
      entityType: fromType,
      entityName,
    }),
};
