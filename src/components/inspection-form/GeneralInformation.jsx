import React, { useEffect, useState, useRef, forwardRef } from "react";
import * as InspectionConstants from "../../constants/inspectionform/index";
import { formatInput, validatePhoneOrFax, validateEmailAddress, validateInspectionDateTime } from "./utils";
import SectionHeader from "./SectionHeader";

/* ---------------------------
   General Information
   ---------------------------*/
const GeneralInformation = forwardRef(function GeneralInformation({
  data,
  setData,
  onLawFilterChange,
  inspectionData,
  errors,
  clearError,
  isReadOnly = false,
}, ref) {
  // State for phone/fax validation
  const [phoneValidation, setPhoneValidation] = useState({ isValid: false, message: "" });
  // State for email validation
  const [emailValidation, setEmailValidation] = useState({ isValid: false, message: "" });
  // State for date/time validation
  const [dateTimeValidation, setDateTimeValidation] = useState({ isValid: false, message: "" });
  
  // Ref to track if we've already processed inspection data
  const hasProcessedInspectionData = useRef(false);
  const processedInspectionId = useRef(null);

  // Autofill when inspectionData provided (only if no existing data)
  useEffect(() => {
    console.log("🏢 GeneralInformation received inspectionData:", inspectionData);
    
    if (
      inspectionData &&
      inspectionData.establishments_detail &&
      inspectionData.establishments_detail.length > 0 &&
      (!hasProcessedInspectionData.current || processedInspectionId.current !== inspectionData.id)
    ) {
      const establishment = inspectionData.establishments_detail[0];
      console.log("🏢 Processing establishment data:", establishment);
      
      // Check if we already have user-entered data (from draft) by looking at the current data state
      setData((currentData) => {
        const hasUserData = currentData.operating_hours || 
                           currentData.operating_days_per_week || 
                           currentData.operating_days_per_year || 
                           currentData.phone_fax_no || 
                           currentData.email_address || 
                           currentData.inspection_date_time ||
                           (currentData.environmental_laws && currentData.environmental_laws.length > 0);
        
        console.log("🏢 Has user data:", hasUserData);
        
        // Only auto-fill if we don't have user-entered data (not a draft)
        if (!hasUserData) {
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

          const newData = {
            ...currentData,
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
          };

          // Call onLawFilterChange outside of setData to avoid dependency issues
          setTimeout(() => {
            if (onLawFilterChange) onLawFilterChange([inspectionData.law]);
          }, 0);
          
          return newData;
        } else {
          console.log("🏢 Skipping auto-fill - user data already exists");
          // Still set the law filter if not already set
          if (!currentData.environmental_laws || currentData.environmental_laws.length === 0) {
            setTimeout(() => {
              if (onLawFilterChange) onLawFilterChange([inspectionData.law]);
            }, 0);
          }
          return currentData;
        }
      });
      
      hasProcessedInspectionData.current = true;
      processedInspectionId.current = inspectionData.id;
    }
  }, [inspectionData]); // eslint-disable-line react-hooks/exhaustive-deps

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
      const validation = validateInspectionDateTime(data.inspection_date_time, inspectionData?.created_at);
      setDateTimeValidation(validation);
    } else {
      setDateTimeValidation({ isValid: false, message: "" });
    }
  }, [data.inspection_date_time, inspectionData?.created_at]);

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
    const validation = validateInspectionDateTime(value, inspectionData?.created_at);
    setDateTimeValidation(validation);
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
    
    // Clear environmental laws error when user makes a selection
    if (clearError) clearError("environmental_laws");
    
    if (onLawFilterChange) onLawFilterChange(updated);
  };

  return (
    <section ref={ref} data-section="general" className="min-h-[calc(100vh-220px)] p-4 mb-6 bg-white border border-black scroll-mt-48" style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
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
                  disabled={(isInitialLaw && isChecked) || isReadOnly}
                />
                <span className="text-black">{law.label}</span>
                {isInitialLaw && isChecked && (
                  <span className="text-xs text-gray-500">(Required)</span>
                )}
              </label>
            );
          })}
        </div>
        {errors.environmental_laws && (
          <p className="text-sm text-red-600 mt-2">{errors.environmental_laws}</p>
        )}
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
                    ? "border-black"
                    : "border-red-500"
                  : "border-black"
              }`}
            value={data.inspection_date_time || ""}
              onChange={(e) => handleDateTimeChange(e.target.value)}
              max={new Date().toISOString().slice(0, 16)} // Prevent future dates
              disabled={isReadOnly}
            />
          </div>
          {/* Validation message */}
          {data.inspection_date_time && data.inspection_date_time.trim() !== "" && dateTimeValidation.message && (
            <p className={`text-xs mt-1 ${
              dateTimeValidation.isValid
                ? "text-green-600"
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
                updateField("operating_hours", "", (v) => v);
              } else {
                updateField("operating_hours", parseInt(val), (v) => v);
              }
            }}
            disabled={isReadOnly}
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
              disabled={isReadOnly}
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
                updateField("operating_days_per_week", "", (v) => v);
              } else {
                const daysPerWeek = parseInt(val);
                updateField("operating_days_per_week", daysPerWeek, (v) => v);
              }
            }}
            disabled={isReadOnly}
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
                } else {
                  updateField("operating_days_per_week", "Others", (v) => v);
                }
              }}
              disabled={isReadOnly}
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
                updateField("operating_days_per_year", "", (v) => v);
              } else {
                updateField("operating_days_per_year", parseInt(val), (v) => v);
              }
            }}
            disabled={isReadOnly}
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
              disabled={isReadOnly}
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
                    ? "border-green-500"
                    : "border-red-500"
                  : "border-black"
              }`}
            value={data.phone_fax_no || ""}
              onChange={(e) => handlePhoneFaxChange(e.target.value)}
              placeholder="e.g., 09123456789 or 02-123-4567 / 02-123-4568"
              disabled={isReadOnly}
            />
          </div>
          {/* Validation message */}
          {data.phone_fax_no && data.phone_fax_no.trim() !== "" && (
            <p className={`text-xs mt-1 ${
              phoneValidation.isValid
                ? "text-green-600"
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
              disabled={isReadOnly}
            />
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
});

export default GeneralInformation;


 