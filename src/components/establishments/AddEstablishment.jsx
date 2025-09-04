import { useState } from "react";

export default function AddEstablishment({ onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    natureOfBusiness: "",
    yearEstablished: "",
    province: "",
    city: "",
    barangay: "",
    streetBuilding: "",
    postalCode: "",
    latitude: "",
    longitude: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (
      !formData.name.trim() ||
      !formData.natureOfBusiness.trim() ||
      !formData.yearEstablished.trim() ||
      !formData.province.trim() ||
      !formData.city.trim() ||
      !formData.barangay.trim() ||
      !formData.streetBuilding.trim() ||
      !formData.postalCode.trim() ||
      !formData.latitude.trim() ||
      !formData.longitude.trim()
    ) {
      return;
    }

    console.log("New Establishment:", formData);
    onClose();
  };

  const Label = ({ field, children }) => (
    <label className="flex items-center justify-between text-sm font-medium text-gray-700">
      <span>
        {children} <span className="text-red-500">*</span>
      </span>
      {submitted && !formData[field]?.trim() && (
        <span className="text-xs text-red-500">Required</span>
      )}
    </label>
  );

  return (
    <div className="w-full max-w-2xl p-8 bg-white shadow-lg rounded-2xl">
      <h2 className="mb-6 text-2xl font-bold text-center text-sky-600">
        Add Establishment
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        {/* Row 1: Name and Nature of Business */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label field="name">Name</Label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${
                submitted && !formData.name.trim()
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>
          <div>
            <Label field="natureOfBusiness">Nature of Business</Label>
            <input
              type="text"
              name="natureOfBusiness"
              value={formData.natureOfBusiness}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${
                submitted && !formData.natureOfBusiness.trim()
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>
        </div>

        {/* Row 2: Year Established */}
        <div>
          <Label field="yearEstablished">Year Established</Label>
          <input
            type="text"
            name="yearEstablished"
            value={formData.yearEstablished}
            onChange={handleChange}
            className={`w-full p-2 border rounded-lg ${
              submitted && !formData.yearEstablished.trim()
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
        </div>

        {/* Row 3: Address */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label field="province">Province</Label>
            <input
              type="text"
              name="province"
              value={formData.province}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${
                submitted && !formData.province.trim()
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>
          <div>
            <Label field="city">City</Label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${
                submitted && !formData.city.trim()
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label field="barangay">Barangay</Label>
            <input
              type="text"
              name="barangay"
              value={formData.barangay}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${
                submitted && !formData.barangay.trim()
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>
          <div>
            <Label field="streetBuilding">Street/Building</Label>
            <input
              type="text"
              name="streetBuilding"
              value={formData.streetBuilding}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${
                submitted && !formData.streetBuilding.trim()
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>
        </div>
        <div>
          <Label field="postalCode">Postal Code</Label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            className={`w-full p-2 border rounded-lg ${
              submitted && !formData.postalCode.trim()
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
        </div>

        {/* Row 4: Coordinates */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label field="latitude">latitude</Label>
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${
                submitted && !formData.latitude.trim()
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>
          <div>
            <Label field="longitude">longitude</Label>
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${
                submitted && !formData.longitude.trim()
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
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
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
