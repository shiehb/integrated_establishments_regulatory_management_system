import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { updateEstablishment } from "../../services/api";
import ConfirmationDialog from "../common/ConfirmationDialog";
import osm from "../map/osm-provider"; // ✅ use OSM provider
import { 
  ALLOWED_PROVINCES, 
  NATURE_OF_BUSINESS_OPTIONS, 
  ILOCOS_REGION_BOUNDS,
  ILOCOS_REGION_CENTER,
  ILOCOS_CITIES_BY_PROVINCE,
  POSTAL_CODES_BY_CITY,
  BARANGAYS_BY_CITY
} from "../../constants/establishmentConstants";
import { useNotifications } from "../NotificationManager";

// Fix Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const markerIcon = new L.Icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});


// Forward geocoding: address -> coordinates and postal code
async function forwardGeocode(province, city = null, barangay = null) {
  let query;
  if (barangay && city) {
    query = `${barangay}, ${city}, ${province}, Philippines`;
  } else if (city) {
    query = `${city}, ${province}, Philippines`;
  } else {
    query = `${province}, Philippines`;
  }
  
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat).toFixed(6),
        longitude: parseFloat(data[0].lon).toFixed(6),
        postalCode: data[0].address?.postcode || null
      };
    }
  } catch (error) {
    console.error('Forward geocoding error:', error);
  }
  return null;
}

// Helper function to find best match for province
function findBestProvinceMatch(osmProvince) {
  if (!osmProvince) return "";
  
  const osmUpper = osmProvince.toUpperCase();
  
  // Direct match
  if (ALLOWED_PROVINCES.includes(osmUpper)) {
    return osmUpper;
  }
  
  // Fuzzy matching for common variations
  const provinceMap = {
    "LAOAG": "ILOCOS NORTE",
    "VIGAN": "ILOCOS SUR", 
    "SAN FERNANDO": "LA UNION",
    "DAGUPAN": "PANGASINAN",
    "SAN CARLOS": "PANGASINAN",
    "ALAMINOS": "PANGASINAN",
    "URDANETA": "PANGASINAN"
  };
  
  // Check if OSM city name matches a known city in our provinces
  for (const [city, province] of Object.entries(provinceMap)) {
    if (osmUpper.includes(city) || city.includes(osmUpper)) {
      return province;
    }
  }
  
  // Check if OSM province name contains our province names
  for (const province of ALLOWED_PROVINCES) {
    if (osmUpper.includes(province) || province.includes(osmUpper)) {
      return province;
    }
  }
  
  return "";
}

// Helper function to find best match for city
function findBestCityMatch(osmCity, selectedProvince) {
  if (!osmCity || !selectedProvince) return "";
  
  const osmUpper = osmCity.toUpperCase();
  const availableCities = ILOCOS_CITIES_BY_PROVINCE[selectedProvince] || [];
  
  // Direct match
  if (availableCities.includes(osmUpper)) {
    return osmUpper;
  }
  
  // Fuzzy matching - check if OSM city contains or is contained in our cities
  for (const city of availableCities) {
    if (osmUpper.includes(city) || city.includes(osmUpper)) {
      return city;
    }
  }
  
  return "";
}


// Reverse geocode: lat/lng -> address
async function reverseGeocode(lat, lon, setFormData, setMapZoom) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data && data.address) {
    const osmProvince = data.address.state;
    const osmCity = data.address.city || data.address.town || data.address.village;
    const bestProvince = findBestProvinceMatch(osmProvince);
    const bestCity = findBestCityMatch(osmCity, bestProvince);
    
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        province: bestProvince || prev.address.province || "",
        city: bestCity || prev.address.city || "",
        barangay: prev.address.barangay, // Keep existing barangay unchanged
        streetBuilding: prev.address.streetBuilding, // Keep existing street/building unchanged
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
    setMapZoom(18); // Manual click zoom level
  }
}

function LocationMarker({ formData, setFormData, setMapZoom }) {
  useMapEvents({
    click(e) {
      reverseGeocode(
        e.latlng.lat.toFixed(6),
        e.latlng.lng.toFixed(6),
        setFormData,
        setMapZoom
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
  const [mapZoom, setMapZoom] = useState(8); // Track zoom level for different selection types
  const notifications = useNotifications();

  // Track if address/coordinate fields have changed
  const hasLocationChanged = 
    formData.address.province !== establishmentData?.province ||
    formData.address.city !== establishmentData?.city ||
    formData.address.barangay !== establishmentData?.barangay ||
    formData.address.streetBuilding !== establishmentData?.street_building ||
    formData.coordinates.latitude !== establishmentData?.latitude ||
    formData.coordinates.longitude !== establishmentData?.longitude;

  // Show warning only if establishment has polygon and location changed
  const showPolygonWarning = hasLocationChanged && 
    establishmentData?.polygon && 
    establishmentData.polygon.length > 0;

  // Create conditional message for confirmation dialog
  const confirmationMessage = showPolygonWarning ? (
    <>
      <p className="mb-4">Are you sure you want to save changes to this establishment?</p>
      <div className="p-3 bg-amber-50 border-l-4 border-amber-400 rounded">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="ml-3">
            <p className="text-sm font-medium text-amber-800">
              Modifying the address or coordinates will clear the existing polygon boundary. You will need to redraw the polygon after saving.
            </p>
          </div>
        </div>
      </div>
    </>
  ) : (
    "Are you sure you want to save changes to this establishment?"
  );

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

  const handleAddressChange = async (e) => {
    const { name, value } = e.target;
    
    // Skip uppercase for barangay (already uppercase in dropdown)
    const processedValue = name === 'barangay' ? value : value.toUpperCase();
    
    const newFormData = {
      ...formData,
      address: {
        ...formData.address,
        [name]: processedValue,
        // Clear city when province changes
        ...(name === "province" ? { city: "" } : {}),
        // Clear barangay when city changes
        ...(name === "city" ? { barangay: "" } : {}),
      },
    };
    
    setFormData(newFormData);

    // Clear province error when user starts typing
    if (name === "province" && errors.province) {
      setErrors((prev) => ({ ...prev, province: "" }));
    }

    // Only run geocoding logic for province and city, not barangay
    if (name === "province" && value) {
      // Update map to province center when province is selected
      const coords = await forwardGeocode(value);
      if (coords) {
        setFormData((prev) => ({
          ...prev,
          coordinates: {
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
        }));
        setMapZoom(13); // Province zoom level
      }
    } else if (name === "city" && value && newFormData.address.province) {
      // Update map to city center when city is selected
      const coords = await forwardGeocode(newFormData.address.province, value);
      if (coords) {
        setFormData((prev) => ({
          ...prev,
          coordinates: {
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
        }));
        setMapZoom(15); // City zoom level
      }

      // Auto-populate postal code when city is selected
      let postalCode = "";
      if (coords && coords.postalCode) {
        postalCode = coords.postalCode;
      } else {
        // Fallback to hardcoded mapping
        postalCode = getPostalCodeForCity(newFormData.address.province, value);
      }

      if (postalCode) {
        setFormData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            postalCode: postalCode,
          },
        }));
      }
    } else if (name === "barangay" && value && newFormData.address.province && newFormData.address.city) {
      // Forward geocode to get barangay center coordinates when barangay is selected
      const coords = await forwardGeocode(newFormData.address.province, newFormData.address.city, value);
      if (coords) {
        setFormData((prev) => ({
          ...prev,
          coordinates: {
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
        }));
        setMapZoom(17); // Barangay zoom level (between city 15 and manual 18)
      }
    }
  };

  // Get available cities for the selected province
  const getAvailableCities = () => {
    const selectedProvince = formData.address.province;
    return ILOCOS_CITIES_BY_PROVINCE[selectedProvince] || [];
  };

  // Get available barangays for the selected city
  const getAvailableBarangays = () => {
    const selectedProvince = formData.address.province;
    const selectedCity = formData.address.city;
    if (!selectedProvince || !selectedCity) return [];
    return BARANGAYS_BY_CITY[selectedProvince]?.[selectedCity] || [];
  };

  // Get postal code for the selected city
  const getPostalCodeForCity = (province, city) => {
    if (!province || !city) return "";
    return POSTAL_CODES_BY_CITY[province]?.[city] || "";
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
      notifications.success(
        "Establishment updated successfully!",
        {
          title: "Establishment Updated",
          duration: 4000
        }
      );
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
      } else {
        notifications.error(
          "Error updating establishment: " +
            (err.response?.data?.detail || JSON.stringify(err.response?.data)),
          {
            title: "Update Failed",
            duration: 8000
          }
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
              className={`w-full p-2 border rounded-lg uppercase-input ${
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
                className="w-full p-2 border rounded-lg uppercase-input"
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
                  className="w-full p-2 mt-2 border rounded-lg uppercase-input"
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
                className="w-full p-2 border rounded-lg uppercase-input"
              />
            </div>
          </div>

          {/* Province & City */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label field="address.province">Province</Label>
              <select
                name="province"
                value={formData.address.province}
                onChange={handleAddressChange}
                className={`w-full p-2 border rounded-lg uppercase-input ${
                  errors.province ? "border-red-500" : ""
                }`}
              >
                <option value="">Select Province</option>
                {ALLOWED_PROVINCES.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
              {errors.province && (
                <p className="mt-1 text-xs text-red-500">{errors.province}</p>
              )}
            </div>
            <div>
              <Label field="address.city">City/Municipality</Label>
              <select
                name="city"
                value={formData.address.city}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded-lg uppercase-input"
                disabled={!formData.address.province}
              >
                <option value="">
                  {formData.address.province ? "Select City/Municipality" : "Select Province first"}
                </option>
                {getAvailableCities().map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Barangay & Street */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label field="address.barangay">Barangay</Label>
              <select
                name="barangay"
                value={formData.address.barangay}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded-lg uppercase-input"
                disabled={!formData.address.city}
              >
                <option value="">
                  {formData.address.city ? "Select Barangay" : "Select City first"}
                </option>
                {getAvailableBarangays().map((barangay) => (
                  <option key={barangay} value={barangay}>
                    {barangay}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label field="address.streetBuilding">Street/Building</Label>
              <input
                type="text"
                name="streetBuilding"
                value={formData.address.streetBuilding}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded-lg uppercase-input"
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
                className="w-full p-2 border rounded-lg uppercase-input"
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
          message={confirmationMessage}
          loading={loading}
          onCancel={() => setShowConfirm(false)}
          onConfirm={confirmEdit}
        />
      </div>
      <div className="order-2 h-[600px] w-full rounded-lg overflow-hidden shadow">
        <MapContainer
          key={`${formData.coordinates.latitude}-${formData.coordinates.longitude}`}
          center={[
            formData.coordinates.latitude || ILOCOS_REGION_CENTER.latitude,
            formData.coordinates.longitude || ILOCOS_REGION_CENTER.longitude,
          ]}
          zoom={formData.coordinates.latitude ? mapZoom : 8} // Dynamic zoom based on selection type
          style={{ 
            height: "100%", 
            width: "100%",
            cursor: "default"
          }}
          bounds={[
            [ILOCOS_REGION_BOUNDS.south, ILOCOS_REGION_BOUNDS.west],
            [ILOCOS_REGION_BOUNDS.north, ILOCOS_REGION_BOUNDS.east]
          ]}
          boundsOptions={{ padding: [20, 20] }}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer name="Google Satellite">
              <TileLayer
                url={osm.googleSatellite.url}
                attribution={osm.googleSatellite.attribution}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked name="3D Terrain">
              <TileLayer
                url="https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=Usuq2JxAdrdQy7GmBVyr"
                attribution='<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
                maxZoom={22}
              />
            </LayersControl.BaseLayer>
          </LayersControl>
          <LocationMarker formData={formData} setFormData={setFormData} setMapZoom={setMapZoom} />
        </MapContainer>
      </div>
    </div>
  );
}
