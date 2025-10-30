import { camelToSnake } from "./formatUtils";

/**
 * Convert an object from camelCase to snake_case for Supabase insert operations
 */
export const toInsert = (obj: any) => camelToSnake(obj);

/**
 * Convert an object from camelCase to snake_case for Supabase update operations
 */
export const toUpdate = (obj: any) => camelToSnake(obj);
