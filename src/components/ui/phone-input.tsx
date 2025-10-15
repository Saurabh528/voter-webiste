import { useState } from "react";
import { Input } from "./input";
import { AlertCircle } from "lucide-react";
import { validateIndianMobileNumber, cleanPhoneInput, isInputSafe } from "../../utils/phoneValidation";
import { cn } from "../../lib/utils";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean, error?: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onEnter?: () => void;
}

/**
 * Reusable phone input component with built-in validation
 * Follows industry best practices:
 * - Single Responsibility: Only handles phone input
 * - Controlled component pattern
 * - Accessible with ARIA attributes
 * - Visual feedback for errors
 * - Security: Input sanitization
 */
export function PhoneInput({
  value,
  onChange,
  onValidationChange,
  placeholder = "Enter phone number",
  className,
  disabled = false,
  autoFocus = false,
  onEnter,
}: PhoneInputProps) {
  const [validationError, setValidationError] = useState<string>("");
  const [touched, setTouched] = useState(false);

  const handleChange = (input: string) => {
    // Security: Check for malicious input
    if (!isInputSafe(input)) {
      setValidationError("Invalid characters detected");
      onValidationChange?.(false, "Invalid characters detected");
      return;
    }

    // Clean and sanitize input (remove non-digits, limit to 10)
    const cleaned = cleanPhoneInput(input);
    onChange(cleaned);

    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError("");
      onValidationChange?.(true);
    }
  };

  const handleBlur = () => {
    setTouched(true);

    // Only validate if there's input
    if (value.trim()) {
      const validation = validateIndianMobileNumber(value);
      if (!validation.isValid) {
        setValidationError(validation.error || "Invalid phone number");
        onValidationChange?.(false, validation.error);
      } else {
        setValidationError("");
        onValidationChange?.(true);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onEnter) {
      onEnter();
    }
  };

  const hasError = touched && validationError;

  return (
    <div className="space-y-2">
      <Input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        maxLength={10}
        aria-invalid={hasError ? "true" : "false"}
        aria-describedby={hasError ? "phone-error" : undefined}
        className={cn(
          "text-[18px] py-6 border-2 transition-colors",
          hasError
            ? "border-red-500 focus:border-red-500 focus-visible:ring-red-500"
            : "border-gray-300 focus:border-[#0A2647] focus-visible:ring-[#0A2647]",
          className
        )}
      />

      {hasError && (
        <div
          id="phone-error"
          className="flex items-center gap-2 text-red-600 text-[14px]"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Helper text for valid input */}
      {!hasError && value.length > 0 && (
        <p className="text-[12px] text-gray-500">
          {value.length}/10 digits
        </p>
      )}
    </div>
  );
}
