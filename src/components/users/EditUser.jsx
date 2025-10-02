import { useState, useEffect } from "react";
import api from "../../services/api";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { useNotifications } from "../NotificationManager";

export default function EditUser({ userData, onClose, onUserUpdated }) {
  const [formData, setFormData] = useState({
    firstName: userData?.first_name || "",
    middleName: userData?.middle_name || "",
    lastName: userData?.last_name || "",
    email: userData?.email || "",
    userLevel: userData?.userlevel || "",
    section: userData?.section || "",
    unitHead: "", // New field for Unit Head selection
  });
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const notifications = useNotifications();

  useEffect(() => {
    console.log("User data received:", userData);
    
    // Initialize form data and determine section mapping
    let initialSection = userData?.section || "";
    let initialUnitHead = "";
    
    // Map existing section values to new hierarchical structure
    if (userData?.userlevel === "Section Chief") {
      if (["PD-1586", "RA-8749", "RA-9275"].includes(initialSection)) {
        initialSection = "EIA_AIR_WATER";
        initialUnitHead = userData?.section || "";
      } else if (initialSection === "PD-1586,RA-8749,RA-9275") {
        initialSection = "EIA_AIR_WATER";
        initialUnitHead = ""; // No specific unit head selected
      } else if (initialSection === "RA-6969") {
        initialSection = "TOXIC";
      } else if (initialSection === "RA-9003") {
        initialSection = "SOLID";
      }
    }
    
    setFormData({
      firstName: userData?.first_name || "",
      middleName: userData?.middle_name || "",
      lastName: userData?.last_name || "",
      email: userData?.email || "",
      userLevel: userData?.userlevel || "",
      section: initialSection,
      unitHead: initialUnitHead,
    });
    
    console.log("Form data initialized:", {
      firstName: userData?.first_name,
      middleName: userData?.middle_name,
      lastName: userData?.last_name,
      email: userData?.email,
      userLevel: userData?.userlevel,
      section: initialSection,
      unitHead: initialUnitHead,
    });
  }, [userData]);

  // Section options depending on role - Updated hierarchical structure
  const sectionOptionsByLevel = {
    "Section Chief": [
      {
        value: "EIA_AIR_WATER",
        label: "EIA, Air & Water Quality Monitoring Section",
        hasUnitHead: true, // This section has Unit Head sub-options
      },
      {
        value: "TOXIC",
        label: "Toxic Chemicals & Hazardous Monitoring Section",
        hasUnitHead: false, // Direct management, no Unit Head
      },
      { 
        value: "SOLID", 
        label: "Ecological Solid Waste Management Section",
        hasUnitHead: false, // Direct management, no Unit Head
      },
    ],
    "Unit Head": [
      { value: "PD-1586", label: "EIA Monitoring Unit" },
      { value: "RA-8749", label: "Air Quality Monitoring Unit" },
      { value: "RA-9275", label: "Water Quality Monitoring Unit" },
    ],
    "Monitoring Personnel": [
      { value: "PD-1586", label: "EIA Monitoring Personnel" },
      { value: "RA-8749", label: "Air Quality Monitoring Personnel" },
      { value: "RA-9275", label: "Water Quality Monitoring Personnel" },
      { value: "RA-6969", label: "Toxic Chemicals Monitoring Personnel" },
      { value: "RA-9003", label: "Solid Waste Monitoring Personnel" },
    ],
  };

  // Unit Head options for EIA, Air & Water section
  const unitHeadOptions = {
    "EIA_AIR_WATER": [
      { value: "PD-1586", label: "EIA" },
      { value: "RA-8749", label: "Air" },
      { value: "RA-9275", label: "Water" },
    ],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (["firstName", "middleName", "lastName"].includes(name)) {
      newValue = value.toUpperCase();
    }
    
    setFormData((prev) => {
      let newFormData = { ...prev, [name]: newValue };
      
      // Reset section when user level changes
      if (name === "userLevel") {
        newFormData.section = "";
        newFormData.unitHead = "";
      }
      
      // Reset unit head when section changes
      if (name === "section") {
        newFormData.unitHead = "";
      }
      
      return newFormData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (
      !formData.firstName.trim() ||
      !formData.middleName.trim() ||
      !formData.lastName.trim() ||
      !formData.userLevel.trim() ||
      (sectionOptionsByLevel[formData.userLevel] && !formData.section.trim())
    ) {
      return;
    }
    setShowConfirm(true);
  };

  const confirmEdit = async () => {
    setLoading(true);
    try {
      // Determine the final section value based on hierarchical selection
      let finalSection = formData.section;
      
      // If section chief with EIA_AIR_WATER and unit head is selected, use unit head value
      if (formData.userLevel === "Section Chief" && formData.section === "EIA_AIR_WATER" && formData.unitHead) {
        finalSection = formData.unitHead;
      }
      // If section chief with EIA_AIR_WATER but no unit head, use the combined value
      else if (formData.userLevel === "Section Chief" && formData.section === "EIA_AIR_WATER" && !formData.unitHead) {
        finalSection = "PD-1586,RA-8749,RA-9275"; // Combined value for all three
      }
      // If section chief with TOXIC, map to RA-6969
      else if (formData.userLevel === "Section Chief" && formData.section === "TOXIC") {
        finalSection = "RA-6969";
      }
      // If section chief with SOLID, map to RA-9003
      else if (formData.userLevel === "Section Chief" && formData.section === "SOLID") {
        finalSection = "RA-9003";
      }

      const payload = {
        email: formData.email,
        first_name: formData.firstName,
        middle_name: formData.middleName,
        last_name: formData.lastName,
        userlevel: formData.userLevel,
        ...(finalSection ? { section: finalSection } : {}),
      };
      await api.put(`auth/users/${userData.id}/`, payload);

      notifications.success(
        "User updated successfully!",
        {
          title: "User Updated",
          duration: 4000
        }
      );

      if (onUserUpdated) onUserUpdated();
      onClose();
    } catch (err) {
      notifications.error(
        "Error updating user: " +
          (err.response?.data?.detail || JSON.stringify(err.response?.data)),
        {
          title: "Update Failed",
          duration: 8000
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const Label = ({ field, children }) => {
    return (
      <label className="flex items-center justify-between text-sm font-medium text-gray-700">
        <span>
          {children} {field !== "unitHead" && <span className="text-red-500">*</span>}
        </span>
        {field === "section" &&
          submitted &&
          sectionOptionsByLevel[formData.userLevel] &&
          !formData.section.trim() && (
            <span className="text-xs text-red-500">Required</span>
          )}
        {field !== "section" && field !== "unitHead" && submitted && !formData[field]?.trim() && (
          <span className="text-xs text-red-500">Required</span>
        )}
      </label>
    );
  };

  return (
    <div className="w-full max-w-2xl p-8 bg-white shadow-lg rounded-2xl">
      <h2 className="mb-6 text-2xl font-bold text-center text-sky-600">
        Edit User
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        {/* Names */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label field="firstName">First Name</Label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${
                submitted && !formData.firstName.trim()
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>
          <div>
            <Label field="middleName">Middle Name</Label>
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${
                submitted && !formData.middleName.trim()
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>
          <div>
            <Label field="lastName">Last Name</Label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${
                submitted && !formData.lastName.trim()
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>
        </div>

        {/* Email (disabled) */}
        <div>
          <Label field="email">Email</Label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
            className="w-full p-2 text-gray-500 bg-gray-100 border rounded-lg cursor-not-allowed"
          />
        </div>

        {/* User Level + Section */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label field="userLevel">User Level</Label>
            <select
              name="userLevel"
              value={formData.userLevel}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${
                submitted && !formData.userLevel.trim()
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            >
              <option value="">Select User Level</option>
              <option value="Legal Unit">Legal Unit</option>
              <option value="Division Chief">Division Chief</option>
              <option value="Section Chief">Section Chief</option>
              <option value="Unit Head">Unit Head</option>
              <option value="Monitoring Personnel">Monitoring Personnel</option>
            </select>
          </div>
          <div>
            <Label field="section">Section</Label>
            <select
              name="section"
              value={formData.section}
              onChange={handleChange}
              disabled={!sectionOptionsByLevel[formData.userLevel]}
              className={`w-full p-2 border rounded-lg ${
                submitted &&
                sectionOptionsByLevel[formData.userLevel] &&
                !formData.section.trim()
                  ? "border-red-500"
                  : "border-gray-300"
              } ${
                !sectionOptionsByLevel[formData.userLevel]
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : ""
              }`}
            >
              <option value="">Select Section</option>
              {sectionOptionsByLevel[formData.userLevel]?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Unit Head Selection - Only show for Section Chief with EIA_AIR_WATER */}
        {formData.userLevel === "Section Chief" && formData.section === "EIA_AIR_WATER" && (
          <div>
            <Label field="unitHead">Unit Head</Label>
            <select
              name="unitHead"
              value={formData.unitHead}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${
                submitted && !formData.unitHead.trim()
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            >
              <option value="">Select Unit Head (Optional)</option>
              {unitHeadOptions["EIA_AIR_WATER"]?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            
            {/* Dynamic Info Panel for EIA, Air & Water Section Chief */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm">
                  <h4 className="font-medium text-blue-900 mb-1">EIA, Air & Water Section Chief</h4>
                  <div className="text-blue-700 space-y-1">
                    {!formData.unitHead ? (
                      <div>
                        <p className="font-medium">📋 General Section Chief</p>
                        <p>• Will oversee all three areas: EIA, Air Quality, and Water Quality</p>
                        <p>• Manages the entire EIA, Air & Water Quality Monitoring Section</p>
                        <p>• Can coordinate activities across all three environmental domains</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">🎯 Specific Unit Chief</p>
                        <p>• Will focus on: <span className="font-semibold">{unitHeadOptions["EIA_AIR_WATER"].find(opt => opt.value === formData.unitHead)?.label}</span></p>
                        <p>• Specialized oversight of specific environmental monitoring area</p>
                        <p>• Works under the general Section Chief structure</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Info Panel for other sections */}
        {formData.userLevel === "Section Chief" && formData.section === "TOXIC" && (
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                <svg className="w-5 h-5 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm">
                <h4 className="font-medium text-sky-900 mb-1">Toxic Chemicals Section Chief</h4>
                <div className="text-sky-700">
                  <p>• Direct management of Toxic Chemicals & Hazardous Monitoring Section</p>
                  <p>• Oversees RA-6969 compliance and monitoring activities</p>
                  <p>• No sub-units - direct oversight of all toxic chemical monitoring personnel</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {formData.userLevel === "Section Chief" && formData.section === "SOLID" && (
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                <svg className="w-5 h-5 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm">
                <h4 className="font-medium text-sky-900 mb-1">Solid Waste Section Chief</h4>
                <div className="text-sky-700">
                  <p>• Direct management of Ecological Solid Waste Management Section</p>
                  <p>• Oversees RA-9003 compliance and monitoring activities</p>
                  <p>• No sub-units - direct oversight of all solid waste monitoring personnel</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 font-medium text-gray-700 transition bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-3 font-medium text-white transition rounded-lg bg-sky-600 hover:bg-sky-700"
          >
            Save Changes
          </button>
        </div>
      </form>

      <ConfirmationDialog
        open={showConfirm}
        title="Confirm Action"
        message="Are you sure you want to save changes to this user?"
        loading={loading}
        onCancel={() => setShowConfirm(false)}
        onConfirm={confirmEdit}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </div>
  );
}
