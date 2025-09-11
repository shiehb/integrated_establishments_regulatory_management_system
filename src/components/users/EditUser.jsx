import { useState } from "react";

export default function EditUser({ userData, onClose }) {
  const [formData, setFormData] = useState({
    firstName: userData?.firstName || "",
    middleName: userData?.middleName || "",
    lastName: userData?.lastName || "",
    email: userData?.email || "",
    userLevel: userData?.userLevel || "",
    section: userData?.section || "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;
    if (["firstName", "middleName", "lastName"].includes(name)) {
      newValue = value.toUpperCase();
    } else if (name === "email") {
      newValue = value.toLowerCase();
    }

    setFormData((prev) => {
      if (
        name === "userLevel" &&
        !["sectionchief", "unithead", "monitoringpersonnel"].includes(value)
      ) {
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
      !formData.email.trim() ||
      !formData.userLevel.trim() ||
      (["sectionchief", "unithead", "monitoringpersonnel"].includes(
        formData.userLevel
      ) &&
        !formData.section.trim())
    ) {
      return;
    }

    console.log("Updated User:", formData);
    onClose();
  };

  const Label = ({ field, children }) => (
    <label className="flex items-center justify-between text-sm font-medium text-gray-700">
      <span>
        {children} <span className="text-red-500">*</span>
      </span>
      {field === "section" &&
        submitted &&
        isSectionEnabled &&
        !formData.section.trim() && (
          <span className="text-xs text-red-500">Required</span>
        )}
      {field !== "section" && submitted && !formData[field]?.trim() && (
        <span className="text-xs text-red-500">Required</span>
      )}
    </label>
  );

  const isSectionEnabled = [
    "sectionchief",
    "unithead",
    "monitoringpersonnel",
  ].includes(formData.userLevel);

  return (
    <div className="w-full max-w-2xl p-8 bg-white shadow-lg rounded-2xl">
      <h2 className="mb-6 text-2xl font-bold text-center text-sky-600">
        Edit User
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        {/* Row 1: Names */}
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

        {/* Row 2: Email */}
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

        {/* Row 3: User Level + Section */}
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
              disabled={!isSectionEnabled}
              className={`w-full p-2 border rounded-lg ${
                submitted && isSectionEnabled && !formData.section.trim()
                  ? "border-red-500"
                  : "border-gray-300"
              } ${
                !isSectionEnabled
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : ""
              }`}
            >
              <option value="PD-1586">PD-1586</option>
              <option value="RA-6969">RA-6969</option>
              <option value="RA-8749">RA-8749</option>
              <option value="RA-9275">RA-9275</option>
              <option value="RA-9003">RA-9003</option>
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
    </div>
  );
}
