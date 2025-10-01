import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { updateEstablishment } from "../../services/api";
import ConfirmationDialog from "../common/ConfirmationDialog";
import osm from "../map/osm-provider"; // ✅ use OSM provider
import { 
  ALLOWED_PROVINCES, 
  NATURE_OF_BUSINESS_OPTIONS, 
  ILOCOS_REGION_BOUNDS,
  ILOCOS_REGION_CENTER 
} from "../../constants/establishmentConstants";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});


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

export default function EditEstablishment({
  establishmentData,
  onClose,
  onEstablishmentUpdated,
}) {
  const [formData, setFormData] = useState({
    id: establishmentData?.id || "",
    name: establishmentData?.name || "",
    natureOfBusiness: establishmentData?.nature_of_business || "",
    natureOfBusinessOther: "", // For "Others" textbox
    yearEstablished: establishmentData?.year_established || "",
    address: {
      province: establishmentData?.province || "",
      city: establishmentData?.city || "",
      barangay: establishmentData?.barangay || "",
      streetBuilding: establishmentData?.street_building || "",
      postalCode: establishmentData?.postal_code || "",
    },
    coordinates: {
      latitude: establishmentData?.latitude || "",
      longitude: establishmentData?.longitude || "",
    },
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleNatureOfBusinessChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      natureOfBusiness: value,
      // Clear "Others" textbox if a predefined option is selected
      natureOfBusinessOther: value !== "OTHERS" ? "" : prev.natureOfBusinessOther,
    }));
    // Clear error when user starts typing
    if (errors.natureOfBusiness) {
      setErrors((prev) => ({ ...prev, natureOfBusiness: "" }));
    }
  };

  const handleNatureOfBusinessOtherChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      natureOfBusinessOther: value.toUpperCase(),
    }));
    // Clear error when user starts typing
    if (errors.natureOfBusinessOther) {
      setErrors((prev) => ({ ...prev, natureOfBusinessOther: "" }));
    }
  };

  const handleYearChange = (e) => {
    let val = e.target.value.replace(/\D/g, ""); // only digits
    if (val.length > 4) val = val.slice(0, 4); // max 4 digits
    if (parseInt(val) > new Date().getFullYear()) {
      val = new Date().getFullYear().toString(); // cap at current year
    }
    setFormData((prev) => ({ ...prev, yearEstablished: val }));
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

    // Clear province error when user starts typing
    if (name === "province" && errors.province) {
      setErrors((prev) => ({ ...prev, province: "" }));
    }
  };

  const validateProvince = (province) => {
    const provinceUpper = province.toUpperCase().trim();
    if (!ALLOWED_PROVINCES.includes(provinceUpper)) {
      return `Province must be one of: ${ALLOWED_PROVINCES.join(", ")}`;
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setErrors({});

    // Validate province
    const provinceError = validateProvince(formData.address.province);
    if (provinceError) {
      setErrors((prev) => ({ ...prev, province: provinceError }));
    }

    // Validate required fields
    const isNatureOfBusinessValid = formData.natureOfBusiness.trim() && 
      (formData.natureOfBusiness !== "OTHERS" || formData.natureOfBusinessOther.trim());
    
    if (
      !formData.name.trim() ||
      !isNatureOfBusinessValid ||
      !formData.yearEstablished.trim() ||
      !formData.address.province.trim() ||
      !formData.address.city.trim() ||
      !formData.address.barangay.trim() ||
      !formData.address.streetBuilding.trim() ||
      !formData.address.postalCode.trim() ||
      !formData.coordinates.latitude.trim() ||
      !formData.coordinates.longitude.trim() ||
      provinceError
    ) {
      return;
    }
    setShowConfirm(true);
  };

  const confirmEdit = async () => {
    setLoading(true);
    try {
      // Determine the final nature of business value
      const finalNatureOfBusiness = formData.natureOfBusiness === "OTHERS" 
        ? formData.natureOfBusinessOther.trim()
        : formData.natureOfBusiness.trim();

      await updateEstablishment(formData.id, {
        name: formData.name.trim(),
        nature_of_business: finalNatureOfBusiness,
        year_established: formData.yearEstablished.trim(),
        province: formData.address.province.trim(),
        city: formData.address.city.trim(),
        barangay: formData.address.barangay.trim(),
        street_building: formData.address.streetBuilding.trim(),
        postal_code: formData.address.postalCode.trim(),
        latitude: formData.coordinates.latitude,
        longitude: formData.coordinates.longitude,
      });
      if (window.showNotification) {
        window.showNotification(
          "success",
          "Establishment updated successfully!"
        );
      }
      if (onEstablishmentUpdated) onEstablishmentUpdated();
      onClose();
    } catch (err) {
      console.error("Error updating establishment:", err);

      // Handle duplicate name error
      if (
        err.response?.data?.error?.name ||
        err.response?.data?.name ||
        err.response?.data?.error?.includes("name") ||
        err.response?.data?.error?.includes("already exists")
      ) {
        setErrors({ name: "An establishment with this name already exists." });
      } else if (window.showNotification) {
        window.showNotification(
          "error",
          "Error updating establishment: " +
            (err.response?.data?.detail || JSON.stringify(err.response?.data))
        );
      }
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const Label = ({ field, children }) => {
    const isRequired = submitted && (
      field.includes(".")
        ? !field
            .split(".")
            .reduce((o, i) => (o ? o[i] : ""), formData)
            ?.trim()
        : field === "natureOfBusiness"
        ? !formData.natureOfBusiness?.trim() || 
          (formData.natureOfBusiness === "OTHERS" && !formData.natureOfBusinessOther?.trim())
        : !formData[field]?.trim()
    );

    return (
      <label className="flex items-center justify-between text-sm font-medium text-gray-700">
        <span>
          {children} <span className="text-red-500">*</span>
        </span>
        {isRequired && (
          <span className="text-xs text-red-500">Required</span>
        )}
      </label>
    );
  };

  return (
    <div className="grid w-full max-w-6xl grid-cols-1 gap-6 p-8 bg-white shadow-lg md:grid-cols-2 rounded-2xl">
      {/* Form first, map second */}
      <div className="order-1">
        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          <h2 className="mb-6 text-2xl font-bold text-center text-sky-600">
            Edit Establishment
          </h2>

          {/* Name of Establishment */}
          <div>
            <Label field="name">Name of Establishment</Label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Business & Year Established */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label field="natureOfBusiness">Nature of Business</Label>
              <select
                name="natureOfBusiness"
                value={formData.natureOfBusiness}
                onChange={handleNatureOfBusinessChange}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select Nature of Business</option>
                {NATURE_OF_BUSINESS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {formData.natureOfBusiness === "OTHERS" && (
                <input
                  type="text"
                  name="natureOfBusinessOther"
                  value={formData.natureOfBusinessOther}
                  onChange={handleNatureOfBusinessOtherChange}
                  placeholder="Please specify..."
                  className="w-full p-2 mt-2 border rounded-lg"
                />
              )}
            </div>
            <div>
              <Label field="yearEstablished">Year Established</Label>
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
          </div>

          {/* Province & City */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label field="address.province">Province</Label>
              <input
                type="text"
                name="province"
                value={formData.address.province}
                onChange={handleAddressChange}
                className={`w-full p-2 border rounded-lg ${
                  errors.province ? "border-red-500" : ""
                }`}
                list="province-list"
                placeholder="Select from list"
              />
              <datalist id="province-list">
                {ALLOWED_PROVINCES.map((province) => (
                  <option key={province} value={province} />
                ))}
              </datalist>
              {errors.province && (
                <p className="mt-1 text-xs text-red-500">{errors.province}</p>
              )}
            </div>
            <div>
              <Label field="address.city">City</Label>
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
              <Label field="address.barangay">Barangay</Label>
              <input
                type="text"
                name="barangay"
                value={formData.address.barangay}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <Label field="address.streetBuilding">Street/Building</Label>
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
              <Label field="coordinates.latitude">Latitude</Label>
              <input
                type="text"
                name="latitude"
                value={formData.coordinates.latitude}
                onChange={(e) => {
                  // Only allow numbers, dot, and at most one dot
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
              <Label field="coordinates.longitude">Longitude</Label>
              <input
                type="text"
                name="longitude"
                value={formData.coordinates.longitude}
                onChange={(e) => {
                  // Only allow numbers, dot, and at most one dot
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
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 font-medium text-white rounded-lg bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400"
              disabled={loading}
            >
              Save Changes
            </button>
          </div>
        </form>
        <ConfirmationDialog
          open={showConfirm}
          title="Confirm Action"
          message="Are you sure you want to save changes to this establishment?"
          loading={loading}
          onCancel={() => setShowConfirm(false)}
          onConfirm={confirmEdit}
        />
      </div>
      <div className="order-2 h-[600px] w-full rounded-lg overflow-hidden shadow">
        <MapContainer
          center={[
            formData.coordinates.latitude || ILOCOS_REGION_CENTER.latitude,
            formData.coordinates.longitude || ILOCOS_REGION_CENTER.longitude,
          ]}
          zoom={formData.coordinates.latitude ? 18 : 8} // Zoom to show Ilocos Region
          style={{ height: "100%", width: "100%" }}
          bounds={[
            [ILOCOS_REGION_BOUNDS.south, ILOCOS_REGION_BOUNDS.west],
            [ILOCOS_REGION_BOUNDS.north, ILOCOS_REGION_BOUNDS.east]
          ]}
          boundsOptions={{ padding: [20, 20] }}
        >
          <TileLayer
            url={osm.maptiler.url}
            attribution={osm.maptiler.attribution}
          />
          <LocationMarker formData={formData} setFormData={setFormData} />
        </MapContainer>
      </div>
    </div>
  );
}
