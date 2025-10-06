import React, { useEffect, useState } from "react";
import * as InspectionConstants from "../../constants/inspectionform/index";
import { formatInput, validatePhoneOrFax, validateEmailAddress, validateInspectionDateTime, getInspectionCreatedAt } from "./utils";
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
  clearError,
}) {
  // State for phone/fax validation
  const [phoneValidation, setPhoneValidation] = useState({ isValid: false, message: "" });
  // State for email validation
  const [emailValidation, setEmailValidation] = useState({ isValid: false, message: "" });
  // State for date/time validation
  const [dateTimeValidation, setDateTimeValidation] = useState({ isValid: false, message: "" });

  // Autofill when inspectionData provided
  useEffect(() => {
    console.log("🏢 GeneralInformation received inspectionData:", inspectionData);
    
    if (
      inspectionData &&
      inspectionData.establishments_detail &&
      inspectionData.establishments_detail.length > 0
    ) {
      const establishment = inspectionData.establishments_detail[0];
      console.log("🏢 Processing establishment data:", establishment);
      
      // Build address from establishment data
      const street = establishment.street_building || "";
      const barangay = establishment.barangay || "";
      const city = establishment.city || "";
      const province = establishment.province || "";
      const postalCode = establishment.postal_code || "";

      const fullAddress =
        `${street}, ${barangay}, ${city}, ${province}, ${postalCode}`.toUpperCase();

      // Build coordinates from establishment data
      const coordsString =
        establishment.latitude && establishment.longitude
          ? `${establishment.latitude}, ${establishment.longitude}`
          : "";

      setData((prevData) => ({
        ...prevData,
        establishment_name: formatInput.upper(establishment.name || ""),
        address: formatInput.upper(fullAddress),
        coordinates: formatInput.coords(coordsString),
        nature_of_business: formatInput.upper(establishment.nature_of_business || ""),
        year_established: establishment.year_established || "",
        operating_hours: establishment.operating_hours || "",
        operating_days_per_week: establishment.operating_days_per_week || "",
        operating_days_per_year: establishment.operating_days_per_year || "",
        phone_fax_no: establishment.phone_fax_no || establishment.phone || "",
        email_address: establishment.email_address || establishment.email || "",
        environmental_laws: [inspectionData.law],
      }));

      if (onLawFilterChange) onLawFilterChange([inspectionData.law]);
    }
  }, [inspectionData, onLawFilterChange, setData]); // Include dependencies

  // Validate phone/fax when data changes
  useEffect(() => {
    if (data.phone_fax_no && data.phone_fax_no.trim() !== "") {
      const validation = validatePhoneOrFax(data.phone_fax_no);
      setPhoneValidation(validation);
    } else {
      setPhoneValidation({ isValid: false, message: "" });
    }
  }, [data.phone_fax_no]);

  // Validate email when data changes
  useEffect(() => {
    if (data.email_address && data.email_address.trim() !== "") {
      const validation = validateEmailAddress(data.email_address);
      setEmailValidation(validation);
    } else {
      setEmailValidation({ isValid: false, message: "" });
    }
  }, [data.email_address]);

  // Validate date/time when data changes
  useEffect(() => {
    if (data.inspection_date_time && data.inspection_date_time.trim() !== "") {
      const inspectionCreatedAt = getInspectionCreatedAt(inspectionData);
      const validation = validateInspectionDateTime(data.inspection_date_time, inspectionCreatedAt);
      setDateTimeValidation(validation);
    } else {
      setDateTimeValidation({ isValid: false, message: "" });
    }
  }, [data.inspection_date_time, inspectionData]);

  const updateField = (field, value, formatter = formatInput.upper) => {
    setData({ ...data, [field]: formatter(value) });
  };

  // Handle phone/fax validation
  const handlePhoneFaxChange = (value) => {
    const formattedValue = formatInput.phone(value);
    setData({ ...data, phone_fax_no: formattedValue });
    
    // Clear error when user changes the value
    if (clearError) clearError("phone_fax_no");
    
    // Validate the phone/fax number
    const validation = validatePhoneOrFax(formattedValue);
    setPhoneValidation(validation);
  };

  // Handle email validation
  const handleEmailChange = (value) => {
    const formattedValue = formatInput.lower(value);
    setData({ ...data, email_address: formattedValue });
    
    // Clear error when user changes the value
    if (clearError) clearError("email_address");
    
    // Validate the email address
    const validation = validateEmailAddress(formattedValue);
    setEmailValidation(validation);
  };

  // Handle date/time validation
  const handleDateTimeChange = (value) => {
    setData({ ...data, inspection_date_time: value });
    
    // Clear error when user changes the value
    if (clearError) clearError("inspection_date_time");
    
    // Validate the date/time
    const inspectionCreatedAt = getInspectionCreatedAt(inspectionData);
    const validation = validateInspectionDateTime(value, inspectionCreatedAt);
    setDateTimeValidation(validation);
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
    const selected = data.environmental_laws || [];
    const isInitialLaw = inspectionData && inspectionData.law === lawId;
    // Don't allow unchecking the initial law (required law)
    if (isInitialLaw && selected.includes(lawId)) return;
    const updated = selected.includes(lawId)
      ? selected.filter((l) => l !== lawId)
      : [...selected, lawId];
    setData({ ...data, environmental_laws: updated });
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
              inspectionData && inspectionData.law === law.id;
            const isChecked = (data.environmental_laws || []).includes(law.id);
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
          value={data.establishment_name || ""}
          readOnly
          title="Auto-filled from inspection data"
        />
        {errors.establishment_name && (
          <p className="text-sm text-red-600">{errors.establishment_name}</p>
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
            title="Auto-filled from inspection data"
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
            title="Auto-filled from inspection data"
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
          value={data.nature_of_business || ""}
          readOnly
          title="Auto-filled from inspection data"
        />
        {errors.nature_of_business && (
          <p className="text-sm text-red-600">{errors.nature_of_business}</p>
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
            value={data.year_established || ""}
            readOnly
            title="Auto-filled from inspection data"
          />
          {errors.year_established && (
            <p className="text-sm text-red-600">{errors.year_established}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 text-sm text-black">
            Inspection Date & Time<span className="text-red-600">*</span>
          </label>
          <div className="relative">
          <input
            type="datetime-local"
              className={`w-full px-2 py-1 text-black bg-white border ${
                data.inspection_date_time && data.inspection_date_time.trim() !== ""
                  ? dateTimeValidation.isValid
                    ? dateTimeValidation.warning
                      ? "border-yellow-500"
                      : "border-green-500"
                    : "border-red-500"
                  : "border-black"
              }`}
            value={data.inspection_date_time || ""}
              onChange={(e) => handleDateTimeChange(e.target.value)}
              max={new Date().toISOString().slice(0, 16)} // Prevent future dates
            />
            {/* Validation status indicator */}
            {data.inspection_date_time && data.inspection_date_time.trim() !== "" && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                {dateTimeValidation.isValid ? (
                  dateTimeValidation.warning ? (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )
                ) : (
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
          </div>
          {/* Validation message */}
          {data.inspection_date_time && data.inspection_date_time.trim() !== "" && (
            <p className={`text-xs mt-1 ${
              dateTimeValidation.isValid
                ? dateTimeValidation.warning
                  ? "text-yellow-600"
                  : "text-green-600"
                : "text-red-600"
            }`}>
              {dateTimeValidation.message}
            </p>
          )}
          {/* Error message from form validation */}
          {errors.inspection_date_time && (
            <p className="text-sm text-red-600">{errors.inspection_date_time}</p>
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
              data.operating_hours === "" 
                ? "" 
                : [8, 12, 24].includes(Number(data.operating_hours))
                  ? data.operating_hours 
                  : "Others"   // ✅ custom numbers map back to "Others"
            }
            onChange={(e) => {
              const val = e.target.value;
              // Clear error when user changes the value
              if (clearError) clearError("operating_hours");
              
              if (val === "Others") {
                updateField("operating_hours", "Others", (v) => v); 
              } else if (val === "") {
                updateField("operating_hours", "");
              } else {
                updateField("operating_hours", parseInt(val), (v) => v);
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
          {(![8, 12, 24].includes(Number(data.operating_hours)) && data.operating_hours !== "") && (
            <input
              type="number"
              min="1"
              max="24"
              className="w-full mt-2 px-2 py-1 text-black bg-white border border-black"
              placeholder="Enter custom hours (1–24)"
              value={typeof data.operating_hours === "number" ? data.operating_hours : ""}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                // Clear error when user changes the value
                if (clearError) clearError("operating_hours");
                
                if (!isNaN(val) && val >= 1 && val <= 24) {
                  updateField("operating_hours", val, (v) => v);
                } else {
                  updateField("operating_hours", "Others", (v) => v); // keep textbox open
                }
              }}
            />
          )}

          {/* Error message */}
          {errors.operating_hours && (
            <p className="text-sm text-red-600">{errors.operating_hours}</p>
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
              data.operating_days_per_week === "" 
                ? "" 
                : [5, 6, 7].includes(Number(data.operating_days_per_week))
                  ? data.operating_days_per_week 
                  : "Others"
            }
            onChange={(e) => {
              const val = e.target.value;
              // Clear error when user changes the value
              if (clearError) clearError("operating_days_per_week");
              
              if (val === "Others") {
                updateField("operating_days_per_week", "Others", (v) => v); 
              } else if (val === "") {
                updateField("operating_days_per_week", "");
              } else {
                const daysPerWeek = parseInt(val);
                updateField("operating_days_per_week", daysPerWeek, (v) => v);
                
                // Auto-calculate operating days per year
                const calculatedDaysPerYear = calculateOperatingDaysPerYear(daysPerWeek);
                if (calculatedDaysPerYear) {
                  updateField("operating_days_per_year", calculatedDaysPerYear, (v) => v);
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
          {(![5, 6, 7].includes(Number(data.operating_days_per_week)) && data.operating_days_per_week !== "") && (
            <input
              type="number"
              min="1"
              max="7"
              className="w-full mt-2 px-2 py-1 text-black bg-white border border-black"
              placeholder="Enter custom days (1–7)"
              value={typeof data.operating_days_per_week === "number" ? data.operating_days_per_week : ""}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                // Clear error when user changes the value
                if (clearError) clearError("operating_days_per_week");
                
                if (!isNaN(val) && val >= 1 && val <= 7) {
                  updateField("operating_days_per_week", val, (v) => v);
                  
                  // Auto-calculate operating days per year
                  const calculatedDaysPerYear = calculateOperatingDaysPerYear(val);
                  if (calculatedDaysPerYear) {
                    updateField("operating_days_per_year", calculatedDaysPerYear, (v) => v);
                  }
                } else {
                  updateField("operating_days_per_week", "Others", (v) => v);
                }
              }}
            />
          )}

          {errors.operating_days_per_week && (
            <p className="text-sm text-red-600">
              {errors.operating_days_per_week}
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
              data.operating_days_per_year === "" 
                ? "" 
                : [250, 300, 365].includes(Number(data.operating_days_per_year))
                  ? data.operating_days_per_year 
                  : "Others"
            }
            onChange={(e) => {
              const val = e.target.value;
              // Clear error when user changes the value
              if (clearError) clearError("operating_days_per_year");
              
              if (val === "Others") {
                updateField("operating_days_per_year", "Others", (v) => v); 
              } else if (val === "") {
                updateField("operating_days_per_year", "");
              } else {
                updateField("operating_days_per_year", parseInt(val), (v) => v);
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
          {(![250, 300, 365].includes(Number(data.operating_days_per_year)) && data.operating_days_per_year !== "") && (
            <input
              type="number"
              min="1"
              max="365"
              className="w-full mt-2 px-2 py-1 text-black bg-white border border-black"
              placeholder="Enter custom days (1–365)"
              value={typeof data.operating_days_per_year === "number" ? data.operating_days_per_year : ""}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                // Clear error when user changes the value
                if (clearError) clearError("operating_days_per_year");
                
                if (!isNaN(val) && val >= 1 && val <= 365) {
                  updateField("operating_days_per_year", val, (v) => v);
                } else {
                  updateField("operating_days_per_year", "Others", (v) => v);
                }
              }}
            />
          )}

          {errors.operating_days_per_year && (
            <p className="text-sm text-red-600">
              {errors.operating_days_per_year}
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
          <div className="relative">
          <input
              className={`w-full px-2 py-1 text-black bg-white border ${
                data.phone_fax_no && data.phone_fax_no.trim() !== ""
                  ? phoneValidation.isValid
                    ? phoneValidation.warning
                      ? "border-yellow-500"
                      : "border-green-500"
                    : "border-red-500"
                  : "border-black"
              }`}
            value={data.phone_fax_no || ""}
              onChange={(e) => handlePhoneFaxChange(e.target.value)}
              placeholder="e.g., 09123456789 or 02-123-4567 / 02-123-4568"
            />
            {/* Validation status indicator */}
            {data.phone_fax_no && data.phone_fax_no.trim() !== "" && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                {phoneValidation.isValid ? (
                  phoneValidation.warning ? (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )
                ) : (
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
          </div>
          {/* Validation message */}
          {data.phone_fax_no && data.phone_fax_no.trim() !== "" && (
            <p className={`text-xs mt-1 ${
              phoneValidation.isValid
                ? phoneValidation.warning
                  ? "text-yellow-600"
                  : "text-green-600"
                : "text-red-600"
            }`}>
              {phoneValidation.message}
            </p>
          )}
          {/* Error message from form validation */}
          {errors.phone_fax_no && (
            <p className="text-sm text-red-600">{errors.phone_fax_no}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 text-sm text-black">
            Email Address<span className="text-red-600">*</span>
          </label>
          <div className="relative">
          <input
            type="email"
              className={`w-full px-2 py-1 text-black lowercase bg-white border ${
                data.email_address && data.email_address.trim() !== ""
                  ? emailValidation.isValid
                    ? emailValidation.warning
                      ? "border-yellow-500"
                      : "border-green-500"
                    : "border-red-500"
                  : "border-black"
              }`}
            value={data.email_address || ""}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="e.g., example@company.com"
            />
            {/* Validation status indicator */}
            {data.email_address && data.email_address.trim() !== "" && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                {emailValidation.isValid ? (
                  emailValidation.warning ? (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )
                ) : (
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
          </div>
          {/* Validation message */}
          {data.email_address && data.email_address.trim() !== "" && (
            <div className="mt-1">
              <p className={`text-xs ${
                emailValidation.isValid
                  ? emailValidation.warning
                    ? "text-yellow-600"
                    : "text-green-600"
                  : "text-red-600"
              }`}>
                {emailValidation.message}
              </p>
              {/* Show suggestion if available */}
              {emailValidation.suggestion && (
                <p className="text-xs text-blue-600 mt-1">
                  💡 {emailValidation.suggestion}
                </p>
              )}
            </div>
          )}
          {/* Error message from form validation */}
          {errors.email_address && (
            <p className="text-sm text-red-600">{errors.email_address}</p>
          )}
        </div>
      </div>
    </section>
  );
}


