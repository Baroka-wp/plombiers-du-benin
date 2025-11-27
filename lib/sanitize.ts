/**
 * Utility functions for sanitizing user inputs
 */

/**
 * Sanitize string input by removing potentially dangerous characters
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove null bytes and control characters
  return input
    .replace(/\0/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Sanitize text input (allows more characters than sanitizeString)
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove null bytes and dangerous control characters but keep newlines and tabs
  return input
    .replace(/\0/g, '')
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  const sanitized = sanitizeString(input);
  
  // Basic URL validation
  try {
    const url = new URL(sanitized);
    // Only allow https and http protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return '';
    }
    return sanitized;
  } catch {
    // If URL parsing fails, return empty string
    return '';
  }
}

/**
 * Sanitize phone number (remove all non-digit characters)
 */
export function sanitizePhone(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove all non-digit characters
  return input.replace(/\D/g, '');
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(input: string | number | null | undefined): number | null {
  if (typeof input === 'number') {
    return isNaN(input) ? null : input;
  }
  
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  const num = Number(input);
  return isNaN(num) ? null : num;
}

