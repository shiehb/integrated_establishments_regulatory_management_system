import React, { useEffect } from "react";
import * as InspectionConstants from "../../constants/inspectionform/index";
import { formatInput } from "./utils";
import SectionHeader from "./SectionHeader";

/* ---------------------------
   General Information
   ---------------------------*/
export default function GeneralInformation({
  data,
  setData,
  onLawFilterChange,
  inspectionData,
  errors,
}) {
  // Autofill when inspectionData provided
  useEffect(() => {
    if (
      inspectionData &&
      inspectionData.establishments &&
      inspectionData.establishments.length > 0
    ) {
      const establishment = inspectionData.establishments[0];
      const address = establishment.address || {};
      const coords = establishment.coordinates || {};

      const street = address.street || establishment.street_building || "";
      const barangay = address.barangay || establishment.barangay || "";
      const city = address.city || establishment.city || "";
      const province = address.province || establishment.province || "";
      const postalCode = address.postalCode || establishment.postal_code || "";

      const fullAddress =
        `${street}, ${barangay}, ${city}, ${province}, ${postalCode}`.toUpperCase();

      const coordsString =
        coords.latitude && coords.longitude
          ? `${coords.latitude}, ${coords.longitude}`
          : establishment.latitude && establishment.longitude
          ? `${establishment.latitude}, ${establishment.longitude}`
          : "";

      setData((prevData) => ({
        ...prevData,
        establishmentName: formatInput.upper(establishment.name || ""),
        address: formatInput.upper(fullAddress),
        coordinates: formatInput.coords(coordsString),
        natureOfBusiness: formatInput.upper(
          establishment.natureOfBusiness ||
            establishment.nature_of_business ||
            ""
        ),
        yearEstablished:
          establishment.yearEstablished || establishment.year_established || "",
        environmentalLaws: [inspectionData.section],
      }));

      if (onLawFilterChange) onLawFilterChange([inspectionData.section]);
    }
  }, []); // Empty dependency array - run only once

  const updateField = (field, value, formatter = formatInput.upper) => {
    setData({ ...data, [field]: formatter(value) });
  };

  // Auto-calculate operating days per year based on operating days per week
  const calculateOperatingDaysPerYear = (daysPerWeek) => {
    if (!daysPerWeek || typeof daysPerWeek !== 'number') return null;
    
    // Calculate based on 52 weeks in a year
    const calculatedDays = daysPerWeek * 52;
    
    // Return predefined values if they match, otherwise return the calculated value
    if ([250, 300, 365].includes(calculatedDays)) {
      return calculatedDays;
    }
    
    // For custom calculations, return the calculated value
    return calculatedDays;
  };

  const toggleLaw = (lawId) => {
    const selected = data.environmentalLaws || [];
    const isInitialLaw = inspectionData && inspectionData.section === lawId;
    if (isInitialLaw && selected.includes(lawId)) return;
    const updated = selected.includes(lawId)
      ? selected.filter((l) => l !== lawId)
      : [...selected, lawId];
    setData({ ...data, environmentalLaws: updated });
    if (onLawFilterChange) onLawFilterChange(updated);
  };

  return (
    <section className="p-4 mb-6 bg-white border border-black">
      <SectionHeader title="General Information" />
      <div className="mt-4">
        <label className="block mb-2 text-black">
          Applicable Environmental Laws (check all that apply)
          <span className="text-red-600">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {InspectionConstants.LAWS.map((law) => {
            const isInitialLaw =
              inspectionData && inspectionData.section === law.id;
            const isChecked = (data.environmentalLaws || []).includes(law.id);
            return (
              <label key={law.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleLaw(law.id)}
                  className="w-4 h-4 border-black"
                  disabled={isInitialLaw && isChecked}
                />
                <span className="text-black">{law.label}</span>
                {isInitialLaw && isChecked && (
                  <span className="text-xs text-gray-500">(Required)</span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <label className="block mb-1 text-sm text-black">
          Name of Establishment<span className="text-red-600">*</span>
        </label>
        <input
          className="w-full px-2 py-1 text-black uppercase bg-gray-100 border border-black"
          value={data.establishmentName || ""}
          readOnly
        />
        {errors.establishmentName && (
          <p className="text-sm text-red-600">{errors.establishmentName}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block mb-1 text-sm text-black">
            Address<span className="text-red-600">*</span>
          </label>
          <input
            className="w-full px-2 py-1 text-black uppercase bg-gray-100 border border-black"
            value={data.address || ""}
            readOnly
          />
          {errors.address && (
            <p className="text-sm text-red-600">{errors.address}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 text-sm text-black">
            Coordinates (Decimal)<span className="text-red-600">*</span>
          </label>
          <input
            className="w-full px-2 py-1 text-black uppercase bg-gray-100 border border-black"
            value={data.coordinates || ""}
            readOnly
          />
          {errors.coordinates && (
            <p className="text-sm text-red-600">{errors.coordinates}</p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label className="block mb-1 text-sm text-black">
          Nature of Business<span className="text-red-600">*</span>
        </label>
        <input
          className="w-full px-2 py-1 text-black uppercase bg-gray-100 border border-black"
          value={data.natureOfBusiness || ""}
          readOnly
        />
        {errors.natureOfBusiness && (
          <p className="text-sm text-red-600">{errors.natureOfBusiness}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block mb-1 text-sm text-black">
            Year Established<span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            className="w-full px-2 py-1 text-black uppercase bg-gray-100 border border-black"
            value={data.yearEstablished || ""}
            readOnly
          />
          {errors.yearEstablished && (
            <p className="text-sm text-red-600">{errors.yearEstablished}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 text-sm text-black">
            Inspection Date & Time<span className="text-red-600">*</span>
          </label>
          <input
            type="datetime-local"
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.inspectionDateTime || ""}
            onChange={(e) =>
              updateField("inspectionDateTime", e.target.value, (v) => v)
            }
          />
          {errors.inspectionDateTime && (
            <p className="text-sm text-red-600">{errors.inspectionDateTime}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block mb-1 text-sm text-black">
            Operating Hours<span className="text-red-600">*</span>
          </label>

          {/* Dropdown */}
          <select
            className="w-full px-2 py-1 text-black uppercase bg-white border border-black"
            value={
              data.operatingHours === "" 
                ? "" 
                : [8, 12, 24].includes(Number(data.operatingHours))
                  ? data.operatingHours 
                  : "Others"   // ✅ custom numbers map back to "Others"
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === "Others") {
                updateField("operatingHours", "Others", (v) => v); 
              } else if (val === "") {
                updateField("operatingHours", "");
              } else {
                updateField("operatingHours", parseInt(val), (v) => v);
              }
            }}
          >
            <option value="">Select Operating Hours</option>
            <option value={8}>8 Hours</option>
            <option value={12}>12 Hours</option>
            <option value={24}>24 Hours</option>
            <option value="Others">Others</option>
          </select>

          {/* ✅ Show textbox for "Others" OR any non-predefined number */}
          {(![8, 12, 24].includes(Number(data.operatingHours)) && data.operatingHours !== "") && (
            <input
              type="number"
              min="1"
              max="24"
              className="w-full mt-2 px-2 py-1 text-black bg-white border border-black"
              placeholder="Enter custom hours (1–24)"
              value={typeof data.operatingHours === "number" ? data.operatingHours : ""}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 1 && val <= 24) {
                  updateField("operatingHours", val, (v) => v);
                } else {
                  updateField("operatingHours", "Others", (v) => v); // keep textbox open
                }
              }}
            />
          )}

          {/* Error message */}
          {errors.operatingHours && (
            <p className="text-sm text-red-600">{errors.operatingHours}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm text-black">
            Operating Days/Week<span className="text-red-600">*</span>
          </label>

          {/* Dropdown */}
          <select
            className="w-full px-2 py-1 text-black uppercase bg-white border border-black"
            value={
              data.operatingDaysPerWeek === "" 
                ? "" 
                : [5, 6, 7].includes(Number(data.operatingDaysPerWeek))
                  ? data.operatingDaysPerWeek 
                  : "Others"
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === "Others") {
                updateField("operatingDaysPerWeek", "Others", (v) => v); 
              } else if (val === "") {
                updateField("operatingDaysPerWeek", "");
              } else {
                const daysPerWeek = parseInt(val);
                updateField("operatingDaysPerWeek", daysPerWeek, (v) => v);
                
                // Auto-calculate operating days per year
                const calculatedDaysPerYear = calculateOperatingDaysPerYear(daysPerWeek);
                if (calculatedDaysPerYear) {
                  updateField("operatingDaysPerYear", calculatedDaysPerYear, (v) => v);
                }
              }
            }}
          >
            <option value="">Select Operating Days/Week</option>
            <option value={5}>5 Days</option>
            <option value={6}>6 Days</option>
            <option value={7}>7 Days</option>
            <option value="Others">Others</option>
          </select>

          {/* Show textbox for "Others" OR any non-predefined number */}
          {(![5, 6, 7].includes(Number(data.operatingDaysPerWeek)) && data.operatingDaysPerWeek !== "") && (
            <input
              type="number"
              min="1"
              max="7"
              className="w-full mt-2 px-2 py-1 text-black bg-white border border-black"
              placeholder="Enter custom days (1–7)"
              value={typeof data.operatingDaysPerWeek === "number" ? data.operatingDaysPerWeek : ""}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 1 && val <= 7) {
                  updateField("operatingDaysPerWeek", val, (v) => v);
                  
                  // Auto-calculate operating days per year
                  const calculatedDaysPerYear = calculateOperatingDaysPerYear(val);
                  if (calculatedDaysPerYear) {
                    updateField("operatingDaysPerYear", calculatedDaysPerYear, (v) => v);
                  }
                } else {
                  updateField("operatingDaysPerWeek", "Others", (v) => v);
                }
              }}
            />
          )}

          {errors.operatingDaysPerWeek && (
            <p className="text-sm text-red-600">
              {errors.operatingDaysPerWeek}
            </p>
          )}
        </div>
        <div>
          <label className="block mb-1 text-sm text-black">
            Operating Days/Year<span className="text-red-600">*</span>
          </label>

          {/* Dropdown */}
          <select
            className="w-full px-2 py-1 text-black uppercase bg-white border border-black"
            value={
              data.operatingDaysPerYear === "" 
                ? "" 
                : [250, 300, 365].includes(Number(data.operatingDaysPerYear))
                  ? data.operatingDaysPerYear 
                  : "Others"
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === "Others") {
                updateField("operatingDaysPerYear", "Others", (v) => v); 
              } else if (val === "") {
                updateField("operatingDaysPerYear", "");
              } else {
                updateField("operatingDaysPerYear", parseInt(val), (v) => v);
              }
            }}
          >
            <option value="">Select Operating Days/Year</option>
            <option value={250}>250 Days</option>
            <option value={300}>300 Days</option>
            <option value={365}>365 Days</option>
            <option value="Others">Others</option>
          </select>

          {/* Show textbox for "Others" OR any non-predefined number */}
          {(![250, 300, 365].includes(Number(data.operatingDaysPerYear)) && data.operatingDaysPerYear !== "") && (
            <input
              type="number"
              min="1"
              max="365"
              className="w-full mt-2 px-2 py-1 text-black bg-white border border-black"
              placeholder="Enter custom days (1–365)"
              value={typeof data.operatingDaysPerYear === "number" ? data.operatingDaysPerYear : ""}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 1 && val <= 365) {
                  updateField("operatingDaysPerYear", val, (v) => v);
                } else {
                  updateField("operatingDaysPerYear", "Others", (v) => v);
                }
              }}
            />
          )}

          {errors.operatingDaysPerYear && (
            <p className="text-sm text-red-600">
              {errors.operatingDaysPerYear}
            </p>
          )}
        </div>
      </div>

      <div className="my-4 border-t border-black" />

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block mb-1 text-sm text-black">
            Phone/ Fax No.<span className="text-red-600">*</span>
          </label>
          <input
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.phoneFaxNo || ""}
            onChange={(e) =>
              updateField(
                "phoneFaxNo",
                formatInput.numeric(e.target.value),
                (v) => v
              )
            }
          />
          {errors.phoneFaxNo && (
            <p className="text-sm text-red-600">{errors.phoneFaxNo}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 text-sm text-black">
            Email Address<span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            className="w-full px-2 py-1 text-black lowercase bg-white border border-black"
            value={data.emailAddress || ""}
            onChange={(e) =>
              updateField("emailAddress", e.target.value, formatInput.lower)
            }
          />
          {errors.emailAddress && (
            <p className="text-sm text-red-600">{errors.emailAddress}</p>
          )}
        </div>
      </div>
    </section>
  );
}
