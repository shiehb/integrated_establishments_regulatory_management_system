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
      coordinates: {
        latitude: parseFloat(lat).toFixed(6),
        longitude: parseFloat(lon).toFixed(6),
      },
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
      address: {
        ...prev.address,
        province: (
          data.address.state ||
          prev.address.province ||
          ""
        ).toUpperCase(),
        city: (
          data.address.city ||
          data.address.town ||
          data.address.village ||
          prev.address.city ||
          ""
        ).toUpperCase(),
        barangay: (
          data.address.suburb ||
          data.address.neighbourhood ||
          data.address.village ||
          prev.address.barangay ||
          ""
        ).toUpperCase(),
        streetBuilding: (
          data.address.road ||
          prev.address.streetBuilding ||
          ""
        ).toUpperCase(),
        postalCode: (
          data.address.postcode ||
          prev.address.postalCode ||
          ""
        ).toUpperCase(),
      },
      coordinates: {
        latitude: lat,
        longitude: lon,
      },
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

  return formData.coordinates.latitude && formData.coordinates.longitude ? (
    <Marker
      position={[
        parseFloat(formData.coordinates.latitude),
        parseFloat(formData.coordinates.longitude),
      ]}
      icon={markerIcon}
    />
  ) : null;
}

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  const handleYearChange = (e) => {
    let val = e.target.value.replace(/\D/g, ""); // only digits
    if (val.length > 4) val = val.slice(0, 4); // max 4 digits
    if (parseInt(val) > new Date().getFullYear()) {
      val = new Date().getFullYear().toString(); // cap at current year
    }
    setFormData((prev) => ({ ...prev, yearEstablished: val }));
  };

  const handleAddressChange = async (e) => {
    const { name, value } = e.target;
    const newForm = {
      ...formData,
      address: {
        ...formData.address,
        [name]: value.toUpperCase(),
      },
    };
    setFormData(newForm);

    const address = `${newForm.address.streetBuilding}, ${newForm.address.barangay}, ${newForm.address.city}, ${newForm.address.province}`;
    await geocodeAddress(address, setFormData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

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

  function Label({ children }) {
    return (
      <label className="flex items-center justify-between text-sm font-medium text-gray-700">
        <span>
          {children} <span className="text-red-500">*</span>
        </span>
      </label>
    );
  }

  return (
    <div className="grid w-full max-w-6xl grid-cols-1 gap-6 p-8 bg-white shadow-lg md:grid-cols-2 rounded-2xl">
      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        <h2 className="mb-6 text-2xl font-bold text-center text-sky-600">
          Edit Establishment
        </h2>

        {/* Name */}
        <div>
          <Label>Name</Label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Business & Year Established */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Year Established</Label>

            <input
              type="number"
              name="yearEstablished"
              value={formData.yearEstablished}
              onChange={handleYearChange}
              min="1900"
              max={new Date().getFullYear()}
              placeholder="YYYY"
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <Label>Nature of Business</Label>
            <input
              type="text"
              name="natureOfBusiness"
              value={formData.natureOfBusiness}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Province & City */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Province</Label>
            <input
              type="text"
              name="province"
              value={formData.address.province}
              onChange={handleAddressChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <Label>City</Label>
            <input
              type="text"
              name="city"
              value={formData.address.city}
              onChange={handleAddressChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Barangay & Street */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Barangay</Label>
            <input
              type="text"
              name="barangay"
              value={formData.address.barangay}
              onChange={handleAddressChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <Label>Street/Building</Label>
            <input
              type="text"
              name="streetBuilding"
              value={formData.address.streetBuilding}
              onChange={handleAddressChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Postal Code */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label field="address.postalCode">Postal Code</Label>
            <input
              type="text"
              name="postalCode"
              value={formData.address.postalCode}
              onChange={(e) => {
                // Only allow numbers and max 4 digits
                let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                setFormData((prev) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    postalCode: val,
                  },
                }));
              }}
              className="w-full p-2 border rounded-lg"
              maxLength={4}
              inputMode="numeric"
              pattern="\d{4}"
            />
          </div>
          <div />
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Latitude</Label>
            <input
              type="text"
              name="latitude"
              value={formData.coordinates.latitude}
              onChange={(e) => {
                // Only allow numbers and a single dot
                let val = e.target.value
                  .replace(/[^0-9.]/g, "") // Remove non-numeric/non-dot
                  .replace(/^([^.]*\.)|\./g, (m, g1) => (g1 ? g1 : "")); // Only one dot allowed
                setFormData((prev) => ({
                  ...prev,
                  coordinates: {
                    ...prev.coordinates,
                    latitude: val,
                  },
                }));
              }}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <Label>Longitude</Label>
            <input
              type="text"
              name="longitude"
              value={formData.coordinates.longitude}
              onChange={(e) => {
                // Only allow numbers and a single dot
                let val = e.target.value
                  .replace(/[^0-9.]/g, "")
                  .replace(/^([^.]*\.)|\./g, (m, g1) => (g1 ? g1 : ""));
                setFormData((prev) => ({
                  ...prev,
                  coordinates: {
                    ...prev.coordinates,
                    longitude: val,
                  },
                }));
              }}
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
            Save Changes
          </button>
        </div>
      </form>

      {/* Map */}
      <div className="h-[600px] w-full rounded-lg overflow-hidden shadow">
        <MapContainer
          center={[
            formData.coordinates.latitude || 12.8797,
            formData.coordinates.longitude || 121.774,
          ]}
          zoom={formData.coordinates.latitude ? 15 : 6}
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
