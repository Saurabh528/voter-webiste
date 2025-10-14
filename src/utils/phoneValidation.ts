/**
 * Validates if a phone number is a valid Indian mobile number
 * @param phoneNumber - The phone number to validate
 * @returns Object with isValid boolean and error message
 */
export function validateIndianMobileNumber(phoneNumber: string): {
  isValid: boolean;
  error?: string;
} {
  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Check if empty
  if (!cleanNumber) {
    return {
      isValid: false,
      error: "Phone number is required"
    };
  }
  
  // Check length (should be 10 digits for Indian mobile)
  if (cleanNumber.length !== 10) {
    return {
      isValid: false,
      error: "Indian mobile number must be 10 digits"
    };
  }
  
  // Check if starts with valid Indian mobile prefixes
  const validPrefixes = [
    '6', '7', '8', '9'  // Indian mobile numbers start with 6, 7, 8, or 9
  ];
  
  const firstDigit = cleanNumber[0];
  if (!validPrefixes.includes(firstDigit)) {
    return {
      isValid: false,
      error: "Invalid Indian mobile number format"
    };
  }
  
  // Check for obviously invalid patterns
  const invalidPatterns = [
    /^(\d)\1{9}$/,  // All same digits (1111111111)
    /^(1234567890|0987654321)$/,  // Sequential patterns
    /^(\d{2})\1{4}$/,  // Repeated pairs (1212121212)
  ];
  
  for (const pattern of invalidPatterns) {
    if (pattern.test(cleanNumber)) {
      return {
        isValid: false,
        error: "Invalid phone number pattern"
      };
    }
  }
  
  return {
    isValid: true
  };
}

/**
 * Formats phone number for display
 * @param phoneNumber - Raw phone number
 * @returns Formatted phone number with +91 prefix
 */
export function formatIndianPhoneNumber(phoneNumber: string): string {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  if (cleanNumber.length === 10) {
    return `+91 ${cleanNumber.slice(0, 5)} ${cleanNumber.slice(5)}`;
  }
  
  return phoneNumber;
}

/**
 * Sanitizes and cleans phone number input - STRICT SECURITY
 * @param input - User input
 * @returns Cleaned phone number (only digits)
 */
export function cleanPhoneInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // STRICT: Only allow digits - remove ALL other characters including +, -, spaces, etc.
  let cleaned = input.replace(/[^\d]/g, '');
  
  // Remove leading 91 if present (Indian country code)
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }
  
  // Limit to exactly 10 digits maximum
  cleaned = cleaned.substring(0, 10);
  
  return cleaned;
}

/**
 * Validates input contains only safe characters
 * @param input - User input
 * @returns true if input is safe
 */
export function isInputSafe(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return true; // Empty/null is safe
  }
  
  // Only allow digits, spaces, +, and - for phone numbers
  const safePattern = /^[\d\s+\-]*$/;
  
  // Check for common SQL injection patterns
  const dangerousPatterns = [
    /['"`;]/g,           // Quotes and semicolons
    /(\/\*|\*\/)/g,      // SQL comments
    /(union|select|insert|update|delete|drop|create|alter)/gi, // SQL keywords
    /(<script|javascript:|on\w+\s*=)/gi, // XSS patterns
    /(\bor\b|\band\b)/gi, // Boolean operators
    /(exec|execute)/gi,   // Execution commands
    /(xp_|sp_)/gi,       // SQL Server procedures
  ];
  
  // Check if input contains only safe characters
  if (!safePattern.test(input)) {
    return false;
  }
  
  // Check for dangerous patterns
  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      return false;
    }
  }
  
  return true;
}
