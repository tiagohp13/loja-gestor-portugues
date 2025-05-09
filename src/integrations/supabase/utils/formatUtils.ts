
// Utility functions to convert between Supabase snake_case and camelCase

/**
 * Convert Supabase snake_case to camelCase
 */
export const snakeToCamel = (obj: any) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }

  return Object.keys(obj).reduce((result, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = snakeToCamel(obj[key]);
    return result;
  }, {} as any);
};

/**
 * Convert camelCase to snake_case for Supabase
 */
export const camelToSnake = (obj: any) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  }

  return Object.keys(obj).reduce((result, key) => {
    const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    result[snakeKey] = camelToSnake(obj[key]);
    return result;
  }, {} as any);
};
