// PasswordRequirements.jsx
import { Check, X } from "lucide-react";

export default function PasswordRequirements({ password = "" }) {
  const requirements = [
    {
      id: "length",
      label: "Be at least 8 characters long",
      test: (pwd) => pwd.length >= 8,
    },
    {
      id: "case",
      label: "Include both lowercase and uppercase character",
      test: (pwd) => /(?=.*[a-z])/.test(pwd) && /(?=.*[A-Z])/.test(pwd),
    },
    {
      id: "numberOrSymbol",
      label: "Include at least one number or symbol",
      test: (pwd) => /(?=.*\d)/.test(pwd) || /(?=.*[@$!%*?&])/.test(pwd),
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
      </ul>
    </div>
  );
}

