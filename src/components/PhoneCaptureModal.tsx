import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Phone, X, AlertCircle } from "lucide-react";
import { capturePhone } from "../utils/api";
import { validateIndianMobileNumber, cleanPhoneInput } from "../utils/phoneValidation";

interface PhoneCaptureModalProps {
  onClose: () => void;
  translations: {
    title: string;
    subtitle: string;
    phonePlaceholder: string;
    submitButton: string;
    skipButton: string;
  };
}

export function PhoneCaptureModal({ onClose, translations: t }: PhoneCaptureModalProps) {
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handlePhoneChange = (value: string) => {
    const cleaned = cleanPhoneInput(value);
    setPhone(cleaned);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError("");
    }
  };

  const handleSubmit = async () => {
    if (!phone.trim()) {
      setValidationError("Phone number is required");
      return;
    }
    
    // Validate the phone number
    const validation = validateIndianMobileNumber(phone);
    if (!validation.isValid) {
      setValidationError(validation.error || "Invalid phone number");
      return;
    }
    
    try {
      const response = await capturePhone({
        phoneNumber: phone.trim(),
        source: 'modal'
      });
      
      if (response && !response.isValid) {
        setValidationError(response.error || "Invalid phone number");
        return;
      }
      
      console.log("Phone captured:", phone);
      setSubmitted(true);
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Error capturing phone:", error);
      
      // Check if it's a validation error from the backend
      if (error.response && error.response.data && error.response.data.error) {
        setValidationError(error.response.data.error);
        return;
      }
      
      // For other errors, still close modal
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full p-8 relative bg-white">
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
        >
          <X className="w-5 h-5" />
        </Button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <p className="text-[20px] text-green-600">धन्यवाद! आपको जल्द ही अपडेट मिलेगा।</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-[#0A2647] flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-[#FFD700]" />
              </div>
              <h2 className="text-[24px] sm:text-[28px] text-[#0A2647]">
                {t.title}
              </h2>
              <p className="text-[18px] text-[#0A2647]/80">
                {t.subtitle}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="tel"
                  placeholder={t.phonePlaceholder}
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className={`text-[20px] py-7 px-4 border-2 ${
                    validationError 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-[#0A2647]/20 focus:border-[#FFD700]"
                  }`}
                  maxLength={10}
                />
                
                {validationError && (
                  <div className="flex items-center gap-2 text-red-600 text-[16px]">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!phone.trim()}
                className="w-full text-[20px] py-7 bg-[#0A2647] hover:bg-[#144272] text-white"
              >
                {t.submitButton}
              </Button>

              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full text-[18px] py-6 text-[#0A2647]/70 hover:text-[#0A2647]"
              >
                {t.skipButton}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
