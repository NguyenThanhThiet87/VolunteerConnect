import React, { useRef, useEffect } from 'react';

interface OTPInputProps {
  digits: string[];
  onChange: (digits: string[]) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  digits,
  onChange,
  disabled = false,
  autoFocus = true,
  className = ''
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, value: string) => {
    const numeric = value.replace(/\D/g, '');
    const newDigits = [...digits];

    if (!numeric) {
      newDigits[index] = '';
      onChange(newDigits);
    } else if (numeric.length > 1) {
      // Pasting full code or fast typing multiple characters
      const chars = numeric.split('').slice(0, 6);
      const startIdx = chars.length === 6 ? 0 : index;
      for (let i = 0; i < chars.length && startIdx + i < 6; i++) {
        newDigits[startIdx + i] = chars[i];
      }
      onChange(newDigits);
      const nextFocus = chars.length === 6 ? 5 : Math.min(startIdx + chars.length, 5);
      setTimeout(() => inputRefs.current[nextFocus]?.focus(), 10);
    } else {
      newDigits[index] = numeric;
      onChange(newDigits);
      if (index < 5) {
        setTimeout(() => inputRefs.current[index + 1]?.focus(), 10);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className={`flex justify-center gap-2 sm:gap-3 ${className}`}>
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onFocus={(e) => e.target.select()}
          className="w-11 h-13 sm:w-13 sm:h-14 text-center text-xl sm:text-2xl font-extrabold border-2 border-slate-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all bg-slate-50/50 text-slate-800 disabled:opacity-50"
        />
      ))}
    </div>
  );
};

export default OTPInput;
