import { useState } from "react";

export default function AddUser({ onClose }) {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    userLevel: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.firstName.trim() ||
      !formData.middleName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.userLevel.trim()
    ) {
      alert("All fields are required.");
      return;
    }

    console.log("New User:", formData);
    onClose(); // Close modal after submit
  };

  return (
    <div className="w-full max-w-2xl p-6 bg-white shadow rounded-2xl">
      <h2 className="mb-4 text-xl font-semibold">Add User</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: First, Middle, Last Name */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full p-2 border rounded-lg"
            required
          />
          <input
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            placeholder="Middle Name"
            className="w-full p-2 border rounded-lg"
            required
          />
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>

        {/* Row 2: Email + User Level */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-2 border rounded-lg"
            required
          />
          <select
            name="userLevel"
            value={formData.userLevel}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            required
          >
            <option value="LegalUnit">Legal Unit</option>
            <option value="DivisionChief">Division Chief</option>
            <option value="SectionChief">Section Chief</option>
            <option value="UnitHead">Unit Head</option>
            <option value="MonitoringPersonnel">Monitoring Personnel</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
