/**
 * Validates if a phone number is a valid Indian mobile number
 * @param {string} phoneNumber - The phone number to validate
 * @returns {Object} Object with isValid boolean and error message
 */
export function validateIndianMobileNumber(phoneNumber) {
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
  const validPrefixes = ['6', '7', '8', '9']; // Indian mobile numbers start with 6, 7, 8, or 9
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
 * Cleans phone number input
 * @param {string} input - User input
 * @returns {string} Cleaned phone number
 */
export function cleanPhoneInput(input) {
  if (!input) return '';
  
  // Remove all non-digit characters except + at the beginning
  let cleaned = input.replace(/[^\d+]/g, '');
  
  // Remove leading +91 or 91 if present
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('91')) {
    cleaned = cleaned.substring(2);
  }
  
  // Limit to 10 digits
  cleaned = cleaned.substring(0, 10);
  
  return cleaned;
}
