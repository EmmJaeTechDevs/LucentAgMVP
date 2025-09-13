import { useState } from "react";
import { ChevronDown, ChevronUp, Check, X } from "lucide-react";

interface PasswordRule {
  id: string;
  text: string;
  isValid: boolean;
}

interface PasswordValidatorProps {
  password: string;
  username?: string;
  className?: string;
}

export function PasswordValidator({
  password,
  username = "",
  className = "",
}: PasswordValidatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const validatePassword = (pwd: string, user: string): PasswordRule[] => {
    return [
      {
        id: "length",
        text: "Must be 8 to 16 characters long",
        isValid: pwd.length >= 8 && pwd.length <= 16,
      },
      {
        id: "lowercase",
        text: "At least 1 lower case letter",
        isValid: /[a-z]/.test(pwd),
      },
      {
        id: "uppercase",
        text: "At least 1 upper case letter",
        isValid: /[A-Z]/.test(pwd),
      },
      {
        id: "number",
        text: "At least 1 number",
        isValid: /\d/.test(pwd),
      },
      {
        id: "special",
        text: "At least 1 special character",
        isValid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      },
      // {
      //   id: "username",
      //   text: "Cannot contain the username",
      //   isValid: !user || pwd.toLowerCase().indexOf(user.toLowerCase()) === -1
      // }
    ];
  };

  const rules = validatePassword(password, username);
  const allValid = rules.every((rule) => rule.isValid);

  return (
    <div className={`w-full ${className}`}>
      {/* Password Rules Dropdown Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        data-testid="password-rules-toggle"
      >
        <span className="text-sm font-medium">Password rules</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {/* Password Rules Content */}
      {isExpanded && (
        <div
          className="mt-2 p-4 bg-gray-800 rounded-lg space-y-3"
          data-testid="password-rules-content"
        >
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center space-x-3"
              data-testid={`password-rule-${rule.id}`}
            >
              <div
                className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                  rule.isValid ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {rule.isValid ? (
                  <Check className="w-2.5 h-2.5 text-white" />
                ) : (
                  <X className="w-2.5 h-2.5 text-white" />
                )}
              </div>
              <span
                className={`text-sm ${
                  rule.isValid ? "text-green-400" : "text-red-400"
                }`}
              >
                {rule.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Export validation functions for form submission
export const validatePasswordStrength = (
  password: string,
  username = "",
): boolean => {
  const rules = [
    password.length >= 8 && password.length <= 16,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    !username || password.toLowerCase().indexOf(username.toLowerCase()) === -1,
  ];

  return rules.every((rule) => rule === true);
};

export const getPasswordErrors = (
  password: string,
  username = "",
): string[] => {
  const errors: string[] = [];

  if (password.length < 8 || password.length > 16) {
    errors.push("Password must be between 8-16 characters long");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  if (username && password.toLowerCase().includes(username.toLowerCase())) {
    errors.push("Password cannot contain your username");
  }

  return errors;
};
