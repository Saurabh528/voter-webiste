/**
 * General input sanitization utilities for security
 */

/**
 * Sanitizes text input by removing dangerous characters
 * @param input - User input
 * @returns Sanitized input
 */
export function sanitizeTextInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove dangerous characters and patterns
  let sanitized = input
    .replace(/[<>'"`;]/g, '') // Remove HTML/XML and SQL dangerous chars
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi, '') // Remove SQL keywords
    .trim();
  
  return sanitized;
}

/**
 * Sanitizes enrollment number input (alphanumeric only)
 * @param input - User input
 * @returns Sanitized enrollment number
 */
export function sanitizeEnrollmentInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Only allow alphanumeric characters, forward slash, and hyphens
  // NO auto-padding - let user type freely, backend will handle normalization
  const sanitized = input.replace(/[^a-zA-Z0-9\/\-]/g, '');

  return sanitized;
}

/**
 * Sanitizes name input (letters, spaces, and common name characters only)
 * @param input - User input
 * @returns Sanitized name
 */
export function sanitizeNameInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Allow letters, spaces, dots, apostrophes, and hyphens (common in names)
  const sanitized = input.replace(/[^a-zA-Z\s\.'\-]/g, '');
  
  return sanitized;
}

/**
 * Validates if input contains only safe characters for text fields
 * @param input - User input
 * @returns true if input is safe
 */
export function isTextInputSafe(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return true; // Empty/null is safe
  }
  
  // Check for dangerous patterns
  const dangerousPatterns = [
    /[<>'"`;]/g,           // HTML/XML and SQL dangerous chars
    /javascript:/gi,        // JavaScript protocol
    /on\w+\s*=/gi,         // Event handlers
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi, // SQL keywords
    /<script/gi,           // Script tags
    /<\/script>/gi,        // Closing script tags
    /<iframe/gi,           // Iframe tags
    /<object/gi,           // Object tags
    /<embed/gi,            // Embed tags
  ];
  
  // Check for dangerous patterns
  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Validates if input contains only safe characters for enrollment numbers
 * @param input - User input
 * @returns true if input is safe
 */
export function isEnrollmentInputSafe(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return true; // Empty/null is safe
  }
  
  // Only allow alphanumeric, forward slash, and hyphens
  const safePattern = /^[a-zA-Z0-9\/\-]*$/;
  
  return safePattern.test(input);
}

/**
 * Validates if input contains only safe characters for names
 * @param input - User input
 * @returns true if input is safe
 */
export function isNameInputSafe(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return true; // Empty/null is safe
  }
  
  // Allow letters, spaces, dots, apostrophes, and hyphens
  const safePattern = /^[a-zA-Z\s\.'\-]*$/;
  
  return safePattern.test(input);
}
