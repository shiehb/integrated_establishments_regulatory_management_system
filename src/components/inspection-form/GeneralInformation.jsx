import React, { useEffect, useState, useRef, useMemo, forwardRef } from "react";
import * as InspectionConstants from "../../constants/inspectionform/index";
import { formatInput, validatePhoneOrFax, validateEmailAddress, validateInspectionDateTime } from "./utils";
import SectionHeader from "./SectionHeader";

const PCO_ACCREDITATION_REGEX = /^PCO\d+-\d{8}-\d{4}$/;

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
  systemUserEmails = [],
}, ref) {
  // State for phone/fax validation
  const [phoneValidation, setPhoneValidation] = useState({ isValid: false, message: "" });
  // State for email validation
  const [emailValidation, setEmailValidation] = useState({ isValid: false, message: "" });
  // State for date/time validation
  const [dateTimeValidation, setDateTimeValidation] = useState({ isValid: false, message: "" });
  // State for PCO accreditation validation
  const [pcoValidation, setPcoValidation] = useState({ isValid: false, message: "" });
  // State for confirmation modal
  const [confirmationModal, setConfirmationModal] = useState({ 
    isOpen: false, 
    lawId: null, 
    action: null, 
    lawName: null 
  });
  
  // Ref to track if we've already processed inspection data
  const hasProcessedInspectionData = useRef(false);
  const processedInspectionId = useRef(null);

  const normalizedUserEmails = useMemo(() => {
    return new Set(
      (systemUserEmails || [])
        .filter(Boolean)
        .map((email) => email.trim().toLowerCase())
    );
  }, [systemUserEmails]);

  // Autofill when inspectionData provided (only if no existing data)
  useEffect(() => {
    if (
      inspectionData &&
      inspectionData.establishments_detail &&
      inspectionData.establishments_detail.length > 0 &&
      (!hasProcessedInspectionData.current || processedInspectionId.current !== inspectionData.id)
    ) {
      const establishment = inspectionData.establishments_detail[0];
      
      // Check if we already have user-entered data (from draft) by looking at the current data state
      setData((currentData) => {
        const hasUserData = currentData.operating_hours || 
                           currentData.operating_days_per_week || 
                           currentData.operating_days_per_year || 
                           currentData.phone_fax_no || 
                           currentData.email_address || 
                           currentData.inspection_date_time ||
                           (currentData.environmental_laws && currentData.environmental_laws.length > 0);
        
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

        // Always auto-fill establishment fields regardless of user data
        const establishmentData = {
          establishment_name: formatInput.upper(establishment.name || ""),
          address: formatInput.upper(fullAddress),
          coordinates: formatInput.coords(coordsString),
          nature_of_business: formatInput.upper(establishment.nature_of_business || ""),
          year_established: establishment.year_established || "",
        };
        
        if (!hasUserData) {
          // Auto-fill all fields including establishment data
          const newData = {
            ...currentData,
            ...establishmentData,
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
          // Only update establishment fields, preserve user data for other fields
          const newData = {
            ...currentData,
            ...establishmentData, // Always update establishment fields
          };
          
          // Still set the law filter if not already set
          if (!currentData.environmental_laws || currentData.environmental_laws.length === 0) {
            setTimeout(() => {
              if (onLawFilterChange) onLawFilterChange([inspectionData.law]);
            }, 0);
          }
          return newData;
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
      const validation = validateEmailAddress(data.email_address, {
        disallowedEmails: normalizedUserEmails,
      });
      setEmailValidation(validation);
    } else {
      setEmailValidation({ isValid: false, message: "" });
    }
  }, [data.email_address, normalizedUserEmails]);

  // Validate PCO accreditation number when it changes
  useEffect(() => {
    const value = data.pco_accreditation_no || "";
    if (value.trim() === "") {
      setPcoValidation({ isValid: false, message: "" });
      return;
    }

    const isValid = PCO_ACCREDITATION_REGEX.test(value);
    setPcoValidation({
      isValid,
      message: isValid
        ? "PCO accreditation number format looks good."
        : "Use format PCO#-MMDDYYYY-#### (e.g., PCO1-12092022-3730)."
    });
  }, [data.pco_accreditation_no]);

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
    
    // Only validate if user has entered something (not on initial load)
    if (formattedValue.trim() !== "") {
      const validation = validatePhoneOrFax(formattedValue);
      setPhoneValidation(validation);
    } else {
      setPhoneValidation({ isValid: false, message: "" });
    }
  };

  // Handle email validation
  const handleEmailChange = (value) => {
    const formattedValue = formatInput.lower(value);
    setData({ ...data, email_address: formattedValue });
    
    // Clear error when user changes the value
    if (clearError) clearError("email_address");
    
    // Only validate if user has entered something (not on initial load)
    if (formattedValue.trim() !== "") {
      const validation = validateEmailAddress(formattedValue, {
        disallowedEmails: normalizedUserEmails,
      });
      setEmailValidation(validation);
    } else {
      setEmailValidation({ isValid: false, message: "" });
    }
  };

  // Handle PCO accreditation validation
  const handlePcoAccreditationChange = (value) => {
    const formattedValue = formatInput.upper(value);
    setData({ ...data, pco_accreditation_no: formattedValue });

    if (clearError) clearError("pco_accreditation_no");

    if (formattedValue.trim() === "") {
      setPcoValidation({ isValid: false, message: "" });
      return;
    }

    const isValid = PCO_ACCREDITATION_REGEX.test(formattedValue);
    setPcoValidation({
      isValid,
      message: isValid
        ? "PCO accreditation number format looks good."
        : "Use format PCO#-MMDDYYYY-#### (e.g., PCO1-12092022-3730)."
    });
  };

  // Handle date/time validation
  const handleDateTimeChange = (value) => {
    setData({ ...data, inspection_date_time: value });
    
    // Clear error when user changes the value
    if (clearError) clearError("inspection_date_time");
    
    // Only validate if user has entered something (not on initial load)
    if (value.trim() !== "") {
      const validation = validateInspectionDateTime(value, inspectionData?.created_at);
      setDateTimeValidation(validation);
    } else {
      setDateTimeValidation({ isValid: false, message: "" });
    }
  };


  const toggleLaw = (lawId) => {
    const selected = data.environmental_laws || [];
    const isInitialLaw = inspectionData && inspectionData.law === lawId;
    
    // Don't allow unchecking the initial law (required law)
    if (isInitialLaw && selected.includes(lawId)) return;
    
    // Show confirmation modal before making changes
    const lawName = InspectionConstants.LAWS.find(law => law.id === lawId)?.label || lawId;
    const action = selected.includes(lawId) ? 'remove' : 'add';
    
    setConfirmationModal({
      isOpen: true,
      lawId,
      action,
      lawName
    });
  };

  // Handle confirmed law toggle
  const confirmToggleLaw = () => {
    const { lawId, action } = confirmationModal;
    const selected = data.environmental_laws || [];
    
    const updated = action === 'add'
      ? [...selected, lawId]
      : selected.filter((l) => l !== lawId);
    
    setData({ ...data, environmental_laws: updated });
    
    // Clear environmental laws error when user makes a selection
    if (clearError) clearError("environmental_laws");
    
    if (onLawFilterChange) onLawFilterChange(updated);
    
    // Close modal
    setConfirmationModal({ isOpen: false, lawId: null, action: null, lawName: null });
  };

  // Handle cancel confirmation
  const cancelToggleLaw = () => {
    setConfirmationModal({ isOpen: false, lawId: null, action: null, lawName: null });
  };

  // Auto-fill inspection date/time when component mounts (only if not already set)
  useEffect(() => {
    if (!data.inspection_date_time && inspectionData) {
      const now = new Date();
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setData(prev => ({ ...prev, inspection_date_time: localDateTime }));
    }
  }, [inspectionData]); // eslint-disable-line react-hooks/exhaustive-deps


  return (
    <section ref={ref} data-section="general" className="p-3 mb-4 bg-white rounded-lg shadow-sm border border-gray-300 scroll-mt-[120px]" style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
      <SectionHeader title="General Information" />
      <div className="mt-3">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Applicable Environmental Laws (check all that apply)
          <span className="text-red-600">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {InspectionConstants.LAWS.map((law) => {
            const isInitialLaw = inspectionData && inspectionData.law === law.id;
            const isChecked = (data.environmental_laws || []).includes(law.id);
            
            return (
              <label key={law.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleLaw(law.id)}
                  className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                  disabled={isReadOnly || (isInitialLaw && isChecked)}
                />
                <span className="text-sm text-gray-900">
                  {law.label}
                </span>
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

      {/* Basic and Operating Details Card */}
      <div className="p-3 mt-3 bg-gray-50 rounded-md border border-gray-200 space-y-2.5">
      <div>
        <label htmlFor="establishment_name" className="block mb-1 text-sm font-medium text-gray-700">
          Name of Establishment<span className="text-red-600">*</span>
        </label>
        <input
          id="establishment_name"
          name="establishment_name"
          className="w-full px-3 py-2 text-gray-900 uppercase bg-gray-100 border border-gray-300 rounded-md"
          value={data.establishment_name || ""}
          readOnly
          title="Auto-filled from inspection data"
        />
        {errors.establishment_name && (
          <p className="text-sm text-red-600">{errors.establishment_name}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="address" className="block mb-1 text-sm font-medium text-gray-700">
            Address<span className="text-red-600">*</span>
          </label>
          <input
            id="address"
            name="address"
            className="w-full px-3 py-2 text-gray-900 uppercase bg-gray-100 border border-gray-300 rounded-md"
            value={data.address || ""}
            readOnly
            title="Auto-filled from inspection data"
          />
          {errors.address && (
            <p className="text-sm text-red-600">{errors.address}</p>
          )}
        </div>
        <div>
          <label htmlFor="coordinates" className="block mb-1 text-sm font-medium text-gray-700">
            Coordinates (Decimal)<span className="text-red-600">*</span>
          </label>
          <input
            id="coordinates"
            name="coordinates"
            className="w-full px-3 py-2 text-gray-900 uppercase bg-gray-100 border border-gray-300 rounded-md"
            value={data.coordinates || ""}
            readOnly
            title="Auto-filled from inspection data"
          />
          {errors.coordinates && (
            <p className="text-sm text-red-600">{errors.coordinates}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="nature_of_business" className="block mb-1 text-sm font-medium text-gray-700">
          Nature of Business<span className="text-red-600">*</span>
        </label>
        <input
          id="nature_of_business"
          name="nature_of_business"
          className="w-full px-3 py-2 text-gray-900 uppercase bg-gray-100 border border-gray-300 rounded-md"
          value={data.nature_of_business || ""}
          readOnly
          title="Auto-filled from inspection data"
        />
        {errors.nature_of_business && (
          <p className="text-sm text-red-600">{errors.nature_of_business}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="year_established" className="block mb-1 text-sm font-medium text-gray-700">
            Year Established<span className="text-red-600">*</span>
          </label>
          <input
            id="year_established"
            name="year_established"
            type="number"
            className="w-full px-3 py-2 text-gray-900 uppercase bg-gray-100 border border-gray-300 rounded-md"
            value={data.year_established || ""}
            readOnly
            title="Auto-filled from inspection data"
          />
          {errors.year_established && (
            <p className="text-sm text-red-600">{errors.year_established}</p>
          )}
        </div>
        <div>
          <label htmlFor="inspection_date_time" className="block mb-1 text-sm font-medium text-gray-700">
            Inspection Date & Time<span className="text-red-600">*</span>
          </label>
          <div className="relative">
          <input
            id="inspection_date_time"
            name="inspection_date_time"
            type="datetime-local"
              className={`w-full px-3 py-2 text-gray-900 bg-white border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                data.inspection_date_time && data.inspection_date_time.trim() !== ""
                  ? dateTimeValidation.isValid
                    ? "border-gray-300"
                    : "border-red-500"
                  : "border-gray-300"
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
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Operating Hours<span className="text-red-600">*</span>
          </label>

          {/* Dropdown */}
          <select
            className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
              className="w-full mt-2 px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Operating Days/Week<span className="text-red-600">*</span>
          </label>

          {/* Dropdown */}
          <select
            className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
              className="w-full mt-2 px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Operating Days/Year<span className="text-red-600">*</span>
          </label>

          {/* Dropdown */}
          <select
            className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
              className="w-full mt-2 px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
      </div>

      {/* Production Details Card */}
      <div className="p-3 mt-3 bg-gray-50 rounded-md border border-gray-200 space-y-2.5">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Product Lines<span className="text-red-600">*</span>
            </label>
            <input
              className="w-full px-3 py-2 text-gray-900 uppercase bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={data.product_lines || ""}
              onChange={(e) => updateField("product_lines", e.target.value)}
              placeholder="Enter product lines manufactured"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Declared Production Rate<span className="text-red-600">*</span>
            </label>
            <input
              className="w-full px-3 py-2 text-gray-900 uppercase bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={data.declared_production_rate || ""}
              onChange={(e) => updateField("declared_production_rate", e.target.value)}
              placeholder="Enter declared production rate"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Actual Production Rate<span className="text-red-600">*</span>
            </label>
            <input
              className="w-full px-3 py-2 text-gray-900 uppercase bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={data.actual_production_rate || ""}
              onChange={(e) => updateField("actual_production_rate", e.target.value)}
              placeholder="Enter actual production rate"
              disabled={isReadOnly}
            />
          </div>
        </div>
      </div>

      {/* Personnel and Contact Information Card */}
      <div className="p-3 mt-3 bg-gray-50 rounded-md border border-gray-200 space-y-2.5">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Managing Head<span className="text-red-600">*</span>
          </label>
          <input
            className="w-full px-3 py-2 text-gray-900 uppercase bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            value={data.managing_head || ""}
            onChange={(e) => updateField("managing_head", e.target.value)}
            placeholder="Enter managing head name"
            disabled={isReadOnly}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              PCO Name<span className="text-red-600">*</span>
            </label>
            <input
              className="w-full px-3 py-2 text-gray-900 uppercase bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={data.pco_name || ""}
              onChange={(e) => updateField("pco_name", e.target.value)}
              placeholder="Enter PCO name"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Interviewed Person<span className="text-red-600">*</span>
            </label>
            <input
              className="w-full px-3 py-2 text-gray-900 uppercase bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={data.interviewed_person || ""}
              onChange={(e) => updateField("interviewed_person", e.target.value)}
              placeholder="Enter details of person interviewed"
              disabled={isReadOnly}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              PCO Accreditation No.<span className="text-red-600">*</span>
            </label>
            <input
              className={`w-full px-3 py-2 text-gray-900 uppercase bg-white border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                data.pco_accreditation_no && data.pco_accreditation_no.trim() !== ""
                  ? pcoValidation.isValid
                    ? "border-green-500"
                    : "border-red-500"
                  : "border-gray-300"
              }`}
              value={data.pco_accreditation_no || ""}
              onChange={(e) => handlePcoAccreditationChange(e.target.value)}
              placeholder="e.g., PCO1-12092022-3730"
              disabled={isReadOnly}
            />
            {data.pco_accreditation_no && data.pco_accreditation_no.trim() !== "" && (
              <p
                className={`text-xs mt-1 ${
                  pcoValidation.isValid ? "text-green-600" : "text-red-600"
                }`}
              >
                {pcoValidation.message}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Effectivity Date<span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={data.effectivity_date || ""}
              onChange={(e) => setData({ ...data, effectivity_date: e.target.value })}
              disabled={isReadOnly}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Phone/ Fax No.<span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                className={`w-full px-3 py-2 text-gray-900 bg-white border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                  data.phone_fax_no && data.phone_fax_no.trim() !== ""
                    ? phoneValidation.isValid
                      ? "border-green-500"
                      : "border-red-500"
                    : "border-gray-300"
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
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Email Address<span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                className={`w-full px-3 py-2 text-gray-900 lowercase bg-white border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                  data.email_address && data.email_address.trim() !== ""
                    ? emailValidation.isValid
                      ? emailValidation.warning
                        ? "border-yellow-500"
                        : "border-green-500"
                      : "border-red-500"
                    : "border-gray-300"
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
      </div>

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0  bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    Confirm Environmental Law Change
                  </h3>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Are you sure you want to {confirmationModal.action === 'add' ? 'add' : 'remove'} the following environmental law?
                </p>
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium text-gray-900">{confirmationModal.lawName}</p>
                </div>
                {confirmationModal.action === 'remove' && (
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ Removing this law will clear all related compliance items and findings.
                  </p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cancelToggleLaw}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmToggleLaw}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    confirmationModal.action === 'add'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  {confirmationModal.action === 'add' ? 'Add Law' : 'Remove Law'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
});

export default GeneralInformation;


 