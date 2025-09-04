import { useState } from "react";

export default function EditEstablishment({ establishmentData, onClose }) {
  const [formData, setFormData] = useState({
    name: establishmentData?.name || "",
    natureOfBusiness: establishmentData?.natureOfBusiness || "",
    yearEstablished: establishmentData?.yearEstablished || "",
    address: {
      province: establishmentData?.address?.province || "",
      city: establishmentData?.address?.city || "",
      barangay: establishmentData?.address?.barangay || "",
      streetBuilding: establishmentData?.address?.streetBuilding || "",
      postalCode: establishmentData?.address?.postalCode || "",
    },
    coordinates: {
      latitude: establishmentData?.coordinates?.latitude || "",
      longitude: establishmentData?.coordinates?.longitude || "",
    },
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value.toUpperCase(),
      },
    }));
  };

  const handleCoordinatesChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [name]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (
      !formData.name.trim() ||
      !formData.natureOfBusiness.trim() ||
      !formData.yearEstablished.trim() ||
      !formData.address.province.trim() ||
      !formData.address.city.trim() ||
      !formData.address.barangay.trim() ||
      !formData.address.streetBuilding.trim() ||
      !formData.address.postalCode.trim() ||
      !formData.coordinates.latitude.trim() ||
      !formData.coordinates.longitude.trim()
    ) {
      return;
    }

    console.log("Updated Establishment:", formData);
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
        Edit Establishment
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        {/* Name */}
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

        {/* Nature of Business */}
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

        {/* Year Established */}
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

        {/* Address */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label field="province">Province</Label>
            <input
              type="text"
              name="province"
              value={formData.address.province}
              onChange={handleAddressChange}
              className={`w-full p-2 border rounded-lg ${
                submitted && !formData.address.province.trim()
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
              value={formData.address.city}
              onChange={handleAddressChange}
              className={`w-full p-2 border rounded-lg ${
                submitted && !formData.address.city.trim()
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>
          <div>
            <Label field="barangay">Barangay</Label>
            <input
              type="text"
              name="barangay"
              value={formData.address.barangay}
              onChange={handleAddressChange}
              className={`w-full p-2 border rounded-lg ${
                submitted && !formData.address.barangay.trim()
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
              value={formData.address.streetBuilding}
              onChange={handleAddressChange}
              className={`w-full p-2 border rounded-lg ${
                submitted && !formData.address.streetBuilding.trim()
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>
          <div>
            <Label field="postalCode">Postal Code</Label>
            <input
              type="text"
              name="postalCode"
              value={formData.address.postalCode}
              onChange={handleAddressChange}
              className={`w-full p-2 border rounded-lg ${
                submitted && !formData.address.postalCode.trim()
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label field="latitude">latitude</Label>
            <input
              type="text"
              name="latitude"
              value={formData.coordinates.latitude}
              onChange={handleCoordinatesChange}
              className={`w-full p-2 border rounded-lg ${
                submitted && !formData.coordinates.latitude.trim()
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
              value={formData.coordinates.longitude}
              onChange={handleCoordinatesChange}
              className={`w-full p-2 border rounded-lg ${
                submitted && !formData.coordinates.longitude.trim()
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
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
