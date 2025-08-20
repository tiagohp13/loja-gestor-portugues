import DOMPurify from 'dompurify';
import { z } from 'zod';

// Input sanitization utility
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return DOMPurify.sanitize(input.trim(), { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

// HTML content sanitization (for rich text areas if needed)
export const sanitizeHTML = (html: string): string => {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
};

// Common validation schemas
export const emailSchema = z.string()
  .email('Email inválido')
  .max(255, 'Email muito longo');

export const passwordSchema = z.string()
  .min(6, 'A palavra-passe deve ter pelo menos 6 caracteres')
  .max(128, 'Palavra-passe muito longa')
  .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'A palavra-passe deve conter pelo menos uma letra e um número');

export const nameSchema = z.string()
  .min(1, 'Nome é obrigatório')
  .max(100, 'Nome muito longo')
  .regex(/^[a-zA-ZÀ-ÿ\s]*$/, 'Nome deve conter apenas letras e espaços');

export const phoneSchema = z.string()
  .max(20, 'Telefone muito longo')
  .regex(/^[+\d\s\-()]*$/, 'Formato de telefone inválido')
  .optional()
  .or(z.literal(''));

export const taxIdSchema = z.string()
  .max(20, 'NIF muito longo')
  .regex(/^\d*$/, 'NIF deve conter apenas números')
  .optional()
  .or(z.literal(''));

// Validation function for form data
export const validateAndSanitizeFormData = <T extends Record<string, any>>(
  data: T,
  schema: z.ZodSchema<any>
): { isValid: boolean; sanitizedData?: T; errors?: string[] } => {
  try {
    // Sanitize string fields
    const sanitizedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key] = sanitizeInput(value);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    // Validate with schema
    const validatedData = schema.parse(sanitizedData);
    
    return {
      isValid: true,
      sanitizedData: validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(e => e.message)
      };
    }
    return {
      isValid: false,
      errors: ['Erro de validação desconhecido']
    };
  }
};

// Rate limiting utility (client-side)
const requestCounts = new Map<string, { count: number; timestamp: number }>();

export const checkClientRateLimit = (
  operation: string, 
  maxRequests = 10, 
  windowMs = 60000
): boolean => {
  const now = Date.now();
  const key = operation;
  const record = requestCounts.get(key);

  if (!record || now - record.timestamp > windowMs) {
    requestCounts.set(key, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
};

// Security headers utility for CSP
export const getSecurityHeaders = () => ({
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.supabase.co",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
});