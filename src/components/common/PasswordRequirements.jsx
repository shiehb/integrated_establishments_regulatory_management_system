// PasswordRequirements.jsx
import { Check, X } from "lucide-react";

export default function PasswordRequirements({ password = "", showMatchRequirement = false, passwordsMatch = false }) {
  const requirements = [
    {
      id: "length",
      label: "Minimum 8 characters",
      test: (pwd) => pwd.length >= 8,
    },
    {
      id: "uppercase",
      label: "At least one uppercase letter (A-Z)",
      test: (pwd) => /(?=.*[A-Z])/.test(pwd),
    },
    {
      id: "lowercase",
      label: "At least one lowercase letter (a-z)",
      test: (pwd) => /(?=.*[a-z])/.test(pwd),
    },
    {
      id: "number",
      label: "At least one number (0-9)",
      test: (pwd) => /(?=.*\d)/.test(pwd),
    },
    {
      id: "special",
      label: "At least one special character (@$!%*?&)",
      test: (pwd) => /(?=.*[@$!%*?&])/.test(pwd),
    },
  ];

  const getRequirementStatus = (requirement) => {
    if (!password) return "idle"; // No password entered yet
    return requirement.test(password) ? "met" : "unmet";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "met":
        return "text-green-600";
      case "unmet":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "met":
        return <Check className="w-3.5 h-3.5" />;
      case "unmet":
        return <X className="w-3.5 h-3.5" />;
      default:
        return <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>;
    }
  };

  const matchStatus = !password 
    ? "idle" 
    : passwordsMatch 
    ? "met" 
    : "unmet";

  return (
    <div className="p-3 mt-4 rounded-lg bg-gray-50">
      <h3 className="mb-2 text-xs font-medium text-gray-700">
        Password Requirements:
      </h3>
      <ul className="space-y-1.5">
        {requirements.map((requirement) => {
          const status = getRequirementStatus(requirement);
          return (
            <li
              key={requirement.id}
              className={`flex items-center gap-2 text-xs transition-colors ${getStatusColor(
                status
              )}`}
            >
              {getStatusIcon(status)}
              <span>{requirement.label}</span>
            </li>
          );
        })}
        {showMatchRequirement && (
          <li
            className={`flex items-center gap-2 text-xs transition-colors ${getStatusColor(
              matchStatus
            )}`}
          >
            {getStatusIcon(matchStatus)}
            <span>Passwords match</span>
          </li>
        )}
      </ul>
    </div>
  );
}

