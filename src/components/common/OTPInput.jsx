import { useState, useRef, useEffect } from "react";

const OTPInput = ({ 
  length = 6, 
  value = "", 
  onChange, 
  onComplete, 
  disabled = false,
  className = "",
  error = false 
}) => {
  const [otp, setOtp] = useState(value.split(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    setOtp(value.split(""));
  }, [value]);

  const handleChange = (index, value) => {
    if (disabled) return;
    
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Call onChange with the complete OTP string
    const otpString = newOtp.join("");
    onChange(otpString);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all digits are filled
    if (otpString.length === length && !otpString.includes("")) {
      onComplete(otpString);
    }
  };

  const handleKeyDown = (index, e) => {
    if (disabled) return;

    // Handle backspace
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // If current input is empty, focus previous input
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        onChange(newOtp.join(""));
      }
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const pastedDigits = text.replace(/\D/g, "").slice(0, length);
        const newOtp = [...otp];
        for (let i = 0; i < pastedDigits.length; i++) {
          newOtp[i] = pastedDigits[i];
        }
        setOtp(newOtp);
        onChange(newOtp.join(""));
        
        // Focus the next empty input or the last input
        const nextIndex = Math.min(pastedDigits.length, length - 1);
        inputRefs.current[nextIndex]?.focus();
      });
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const pastedDigits = pastedText.replace(/\D/g, "").slice(0, length);
    
    const newOtp = [...otp];
    for (let i = 0; i < pastedDigits.length; i++) {
      newOtp[i] = pastedDigits[i];
    }
    setOtp(newOtp);
    onChange(newOtp.join(""));
    
    // Focus the next empty input or the last input
    const nextIndex = Math.min(pastedDigits.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={`flex gap-2 justify-center ${className}`}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={otp[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`
            w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500
            transition-colors duration-200
            ${error 
              ? "border-red-500 bg-red-50" 
              : "border-gray-300 hover:border-gray-400"
            }
            ${disabled 
              ? "bg-gray-100 cursor-not-allowed" 
              : "bg-white"
            }
          `}
        />
      ))}
    </div>
  );
};

export default OTPInput;
