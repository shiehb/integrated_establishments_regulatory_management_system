import { useState, useEffect } from "react";
import api from "../../services/api";
import ConfirmationDialog from "../common/ConfirmationDialog";

export default function EditUser({ userData, onClose, onUserUpdated }) {
  const [formData, setFormData] = useState({
    firstName: userData?.first_name || "",
    middleName: userData?.middle_name || "",
    lastName: userData?.last_name || "",
    email: userData?.email || "",
    userLevel: userData?.userlevel || "",
    section: userData?.section || "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("User data received:", userData);
    console.log("Form data initialized:", {
      firstName: userData?.first_name,
      middleName: userData?.middle_name,
      lastName: userData?.last_name,
      email: userData?.email,
      userLevel: userData?.userlevel,
      section: userData?.section,
    });
  }, [userData]);

  // Section options depending on role
  const sectionOptionsByLevel = {
    "Section Chief": [
      {
        value: "PD-1586,RA-8749,RA-9275",
        label: "EIA, Air & Water Quality Monitoring Section",
      },
      {
        value: "RA-6969",
        label: "Toxic Chemicals & Hazardous Monitoring Section",
      },
      { value: "RA-9003", label: "Ecological Solid Waste Management Section" },
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (["firstName", "middleName", "lastName"].includes(name)) {
      newValue = value.toUpperCase();
    }
    setFormData((prev) => {
      if (name === "userLevel" && !sectionOptionsByLevel[value]) {
        return { ...prev, [name]: newValue, section: "" };
      }
      return { ...prev, [name]: newValue };
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
      const payload = {
        email: formData.email,
        first_name: formData.firstName,
        middle_name: formData.middleName,
        last_name: formData.lastName,
        userlevel: formData.userLevel,
        ...(formData.section ? { section: formData.section } : {}),
      };
      await api.put(`auth/users/${userData.id}/`, payload);

      if (window.showNotification) {
        window.showNotification("success", "User updated successfully!");
      }

      if (onUserUpdated) onUserUpdated();
      onClose();
    } catch (err) {
      if (window.showNotification) {
        window.showNotification(
          "error",
          "Error updating user: " +
            (err.response?.data?.detail || JSON.stringify(err.response?.data))
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const Label = ({ field, children }) => (
    <label className="flex items-center justify-between text-sm font-medium text-gray-700">
      <span>
        {children} <span className="text-red-500">*</span>
      </span>
      {field === "section" &&
        submitted &&
        sectionOptionsByLevel[formData.userLevel] &&
        !formData.section.trim() && (
          <span className="text-xs text-red-500">Required</span>
        )}
      {field !== "section" && submitted && !formData[field]?.trim() && (
        <span className="text-xs text-red-500">Required</span>
      )}
    </label>
  );

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
