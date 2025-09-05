import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Geocode: address -> lat/lng
async function geocodeAddress(address, setFormData) {
  if (!address) return;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address
  )}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.length > 0) {
    const { lat, lon } = data[0];
    setFormData((prev) => ({
      ...prev,
      latitude: parseFloat(lat).toFixed(6),
      longitude: parseFloat(lon).toFixed(6),
    }));
  }
}

// Reverse geocode: lat/lng -> address
async function reverseGeocode(lat, lon, setFormData) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data && data.address) {
    setFormData((prev) => ({
      ...prev,
      province: (data.address.state || prev.province || "").toUpperCase(),
      city: (
        data.address.city ||
        data.address.town ||
        data.address.village ||
        prev.city ||
        ""
      ).toUpperCase(),
      barangay: (
        data.address.suburb ||
        data.address.neighbourhood ||
        data.address.village || // ✅ added village fallback
        prev.barangay ||
        ""
      ).toUpperCase(),
      streetBuilding: (
        data.address.road ||
        prev.streetBuilding ||
        ""
      ).toUpperCase(),
      postalCode: (
        data.address.postcode ||
        prev.postalCode ||
        ""
      ).toUpperCase(),
      latitude: lat,
      longitude: lon,
    }));
  }
}

function LocationMarker({ formData, setFormData }) {
  useMapEvents({
    click(e) {
      reverseGeocode(
        e.latlng.lat.toFixed(6),
        e.latlng.lng.toFixed(6),
        setFormData
      );
    },
  });

  return formData.latitude && formData.longitude ? (
    <Marker
      position={[parseFloat(formData.latitude), parseFloat(formData.longitude)]}
      icon={markerIcon}
    />
  ) : null;
}

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

  const handleChange = async (e) => {
    const { name, value } = e.target;
    const newValue = value.toUpperCase();
    const newForm = { ...formData, [name]: newValue };
    setFormData(newForm);

    if (["province", "city", "barangay", "streetBuilding"].includes(name)) {
      const address = `${newForm.streetBuilding}, ${newForm.barangay}, ${newForm.city}, ${newForm.province}`;
      await geocodeAddress(address, setFormData);
    }
  };

  const handleCoordinatesChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl p-8 bg-white shadow-lg rounded-2xl">
      {/* Left: Form */}
      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        <h2 className="mb-6 text-2xl font-bold text-center text-sky-600">
          Add Establishment
        </h2>

        {/* Row 1: Name & Business */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label field="name">Name</Label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <Label field="natureOfBusiness">Nature of Business</Label>
            <input
              type="text"
              name="natureOfBusiness"
              value={formData.natureOfBusiness}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Row 2: Year */}
        <div>
          <Label field="yearEstablished">Year Established</Label>
          <input
            type="text"
            name="yearEstablished"
            value={formData.yearEstablished}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
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
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <Label field="city">City</Label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
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
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <Label field="streetBuilding">Street/Building</Label>
            <input
              type="text"
              name="streetBuilding"
              value={formData.streetBuilding}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
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
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Row 4: Coordinates */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label field="latitude">Latitude</Label>
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleCoordinatesChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <Label field="longitude">Longitude</Label>
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleCoordinatesChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 font-medium text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-3 font-medium text-white rounded-lg bg-sky-600 hover:bg-sky-700"
          >
            Save
          </button>
        </div>
      </form>

      {/* Right: Map */}
      <div className="h-[600px] w-full rounded-lg overflow-hidden shadow">
        <MapContainer
          center={[formData.latitude || 12.8797, formData.longitude || 121.774]}
          zoom={formData.latitude ? 15 : 6}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          <LocationMarker formData={formData} setFormData={setFormData} />
        </MapContainer>
      </div>
    </div>
  );
}
