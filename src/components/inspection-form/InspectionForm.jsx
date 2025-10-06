import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as InspectionConstants from "../../constants/inspectionform/index";
import LayoutForm from "../LayoutForm";
import { saveInspectionDraft, completeInspection } from "../../services/api";
import { useAutoSave } from "../../hooks/useAutoSave";
import { validateInspectionForm } from "../../utils/formValidation";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { useNotifications } from "../NotificationManager";

// Import all section components
import InternalHeader from "./InternalHeader";
import GeneralInformation from "./GeneralInformation";
import PurposeOfInspection from "./PurposeOfInspection";
import ComplianceStatus from "./ComplianceStatus";
import SummaryOfCompliance from "./SummaryOfCompliance";
import SummaryOfFindingsAndObservations from "./SummaryOfFindingsAndObservations";
import Recommendations from "./Recommendations";

/* ---------------------------
   Main Inspection Form Component
   ---------------------------*/
export default function InspectionForm({ inspectionData }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const inspectionId = id || inspectionData?.id;
  const storageKey = `inspection-form-${inspectionId || "draft"}`;
  const notifications = useNotifications();

  // Load saved draft
  const loadSavedData = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("loadSavedData error", e);
    }
    return null;
  };

  const savedData = loadSavedData();

  // State
  const [general, setGeneral] = useState(
    savedData?.general || {
      establishment_name: "",
      address: "",
      coordinates: "",
      nature_of_business: "",
      year_established: "",
      inspection_date_time: "",
      environmental_laws: [],
      operating_hours: "",
      operating_days_per_week: "",
      operating_days_per_year: "",
      phone_fax_no: "",
      email_address: "",
    }
  );

  const [purpose, setPurpose] = useState(
    savedData?.purpose || {
      verify_accuracy: false,
      verify_accuracy_details: [],
      verify_accuracy_others: "",
      determine_compliance: false,
      investigate_complaints: false,
      check_commitment_status: false,
      commitment_status_details: [],
      commitment_status_others: "",
      other_purpose: false,
      other_purpose_specify: "",
    }
  );

  const [permits, setPermits] = useState(
    savedData?.permits || InspectionConstants.initialPermits || []
  );
  const [complianceItems, setComplianceItems] = useState(
    savedData?.complianceItems ||
      InspectionConstants.initialComplianceItems ||
      []
  );
  const [systems, setSystems] = useState(
    savedData?.systems || InspectionConstants.INSPECTION_SYSTEMS || []
  );
  const [recommendationState, setRecommendationState] = useState(
    savedData?.recommendationState || { checked: [], otherText: "" }
  );

  const [lawFilter, setLawFilter] = useState(savedData?.lawFilter || []);
  const [lastSaveTime, setLastSaveTime] = useState(
    savedData?.lastSaved || null
  );
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [errors, setErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [inspectionStatus, setInspectionStatus] = useState(null);
  const [fullInspectionData, setFullInspectionData] = useState(null);
  
  // Confirmation dialog states
  const [completeConfirmation, setCompleteConfirmation] = useState({ 
    open: false, 
    compliance: '', 
    violations: '', 
    findings: '' 
  });
  const [closeConfirmation, setCloseConfirmation] = useState({ open: false });
  const [loading, setLoading] = useState(false);

  // Form data object for auto-save
  const formData = {
    general,
    purpose,
    permits,
    complianceItems,
    systems,
    recommendationState,
    lawFilter,
  };

  // Auto-save configuration
  const autoSaveOptions = {
    interval: 30000, // 30 seconds
    enabled: !!inspectionId && isOnline,
    validateBeforeSave: (data) => {
      const validation = validateInspectionForm(data);
      // Allow saving even with validation errors (draft mode)
      // But log warnings for debugging
      if (!validation.isValid) {
        console.warn('⚠️ Form validation warnings (saving as draft):', validation.errors);
      }
      return true; // Always allow saving in draft mode
    },
    onSaveSuccess: (response) => {
      console.log('✅ Auto-save successful:', response);
      // Update last save time in localStorage as well
      try {
        const currentData = JSON.parse(localStorage.getItem(storageKey) || '{}');
        currentData.lastSaved = new Date().toISOString();
        localStorage.setItem(storageKey, JSON.stringify(currentData));
      } catch (e) {
        console.error('Error updating localStorage after auto-save:', e);
      }
    },
    onSaveError: (error) => {
      console.error('❌ Auto-save failed:', error);
      // Could show a toast notification here
    },
  };

  // Initialize auto-save
  const {
    isSaving: isAutoSaving,
    lastSaveTime: autoSaveLastTime,
    saveError: autoSaveError,
    isOnline: autoSaveIsOnline,
    saveNow: saveNow,
    resetLastSavedData,
    hasDataChanged,
  } = useAutoSave(formData, inspectionId, autoSaveOptions);

  // Local storage auto-save (backup)
  useEffect(() => {
    const saveData = {
      general,
      purpose,
      permits,
      complianceItems,
      systems,
      recommendationState,
      lawFilter,
      lastSaved: autoSaveLastTime || new Date().toISOString(),
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(saveData));
      setLastSaveTime(autoSaveLastTime || new Date().toISOString());
    } catch (e) {
      console.error("localStorage auto-save error", e);
    }
  }, [
    general,
    purpose,
    permits,
    complianceItems,
    systems,
    recommendationState,
    lawFilter,
    storageKey,
    autoSaveLastTime,
  ]);

  // Online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Prefill law filter from fullInspectionData
  useEffect(() => {
    if (fullInspectionData?.law) {
      console.log("🔧 Setting law filter from inspection data:", fullInspectionData.law);
      setLawFilter([fullInspectionData.law]);
    }
  }, [fullInspectionData]);

  // Load draft from backend when component mounts
  useEffect(() => {
    const loadDraftFromBackend = async () => {
      if (!inspectionId) return;
      
      try {
        console.log("🔍 Fetching inspection data for ID:", inspectionId);
        const token = localStorage.getItem('access');
        console.log("🔑 Token available:", !!token);
        
        // Try to fetch inspection data to get the form
        const response = await fetch(`http://127.0.0.1:8000/api/inspections/${inspectionId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log("📡 API Response status:", response.status);
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          console.log("📄 Response content-type:", contentType);
          
          if (contentType && contentType.includes('application/json')) {
            const inspectionData = await response.json();
          
          // Store full inspection data for autofill
          setFullInspectionData(inspectionData);
          
          // Store inspection status for completion logic
          setInspectionStatus(inspectionData.current_status);
          
          if (inspectionData.form?.checklist?.is_draft) {
            const draftData = inspectionData.form.checklist;
            
            // Load draft data into form state
            if (draftData.general) setGeneral(draftData.general);
            if (draftData.purpose) setPurpose(draftData.purpose);
            if (draftData.permits) setPermits(draftData.permits);
            if (draftData.complianceItems) setComplianceItems(draftData.complianceItems);
            if (draftData.systems) setSystems(draftData.systems);
            if (draftData.recommendationState) setRecommendationState(draftData.recommendationState);
            
            console.log("📝 Loaded draft from backend:", draftData);
          }
          
            console.log("📋 Loaded inspection data:", inspectionData);
          } else {
            const htmlResponse = await response.text();
            console.error("❌ Received HTML instead of JSON. Response:", htmlResponse.substring(0, 200) + "...");
            console.error("This usually means the API endpoint is not found or authentication failed.");
          }
        } else {
          console.error("❌ API request failed with status:", response.status);
          const errorText = await response.text();
          console.error("Error response:", errorText.substring(0, 200) + "...");
        }
      } catch (error) {
        console.error("Failed to load draft from backend:", error);
      }
    };

    loadDraftFromBackend();
  }, [inspectionId]);

  // Load current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const token = localStorage.getItem('access');
        const response = await fetch('http://127.0.0.1:8000/api/auth/me/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const userData = await response.json();
            setCurrentUser(userData);
          } else {
            console.error("❌ Received HTML instead of JSON for user profile");
          }
        } else {
          console.error("❌ Failed to load user profile, status:", response.status);
        }
      } catch (error) {
        console.error("Failed to load current user:", error);
      }
    };

    loadCurrentUser();
  }, []);

  /* ======================
     Validation
     ====================== */
  const validateForm = () => {
    const errs = {};

    // General Info
    if (!general.establishment_name)
      errs.establishment_name = "Establishment name is required.";
    if (!general.address) errs.address = "Address is required.";

    // Coordinates (now required)
    if (!general.coordinates) {
      errs.coordinates = "Coordinates are required.";
    } else {
      const parts = general.coordinates.split(",").map((s) => s.trim());
      if (
        parts.length !== 2 ||
        isNaN(Number(parts[0])) ||
        isNaN(Number(parts[1]))
      ) {
        errs.coordinates = "Coordinates must be in 'lat, lon' decimal format.";
      }
    }

    // Nature of Business (now required)
    if (!general.nature_of_business) {
      errs.nature_of_business = "Nature of Business is required.";
    }

    if (general.year_established) {
      if (!/^\d{4}$/.test(general.year_established)) {
        errs.year_established = "Enter a 4-digit year.";
      } else if (Number(general.year_established) > new Date().getFullYear()) {
        errs.year_established = "Year cannot be in the future.";
      }
    } else {
      errs.year_established = "Year established is required.";
    }

    // Operating Hours (required and must be 1–24)
    if (!general.operating_hours) {
      errs.operating_hours = "Operating Hours is required.";
      } else if (general.operating_hours < 1 || general.operating_hours > 24) {
      errs.operating_hours = "Operating Hours must be between 1 and 24.";
    }

    // Operating Days/Week (now required and must be 1–7)
    if (!general.operating_days_per_week) {
      errs.operating_days_per_week = "Operating Days/Week is required.";
    } else if (general.operating_days_per_week < 1 || general.operating_days_per_week > 7) {
      errs.operating_days_per_week = "Operating Days/Week must be between 1 and 7.";
    }

    // Operating Days/Year (now required and must be 1–365)
    if (!general.operating_days_per_year) {
      errs.operating_days_per_year = "Operating Days/Year is required.";
    } else if (general.operating_days_per_year < 1 || general.operating_days_per_year > 365) {
      errs.operating_days_per_year = "Operating Days/Year must be between 1 and 365.";
    }

    // Phone/Fax No. (now required)
    if (!general.phone_fax_no) {
      errs.phone_fax_no = "Phone/Fax No. is required.";
    }

    // Email Address (now required)
    if (!general.email_address) {
      errs.email_address = "Email Address is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(general.email_address))
        errs.email_address = "Enter a valid email.";
    }

    if (general.inspection_date_time) {
      const inspDate = new Date(general.inspection_date_time);
      if (isNaN(inspDate.getTime())) {
        errs.inspection_date_time = "Invalid inspection date/time.";
      } else if (inspDate < new Date()) {
        errs.inspection_date_time = "Inspection date/time cannot be in the past.";
      }
    } else {
      errs.inspection_date_time = "Inspection date/time is required.";
    }

    // Compliance
    complianceItems.forEach((c, i) => {
      if (!c.compliant) errs[`compliant-${i}`] = "Select compliance status.";
      if (c.compliant === "Non-Compliant") {
        if (!c.remarksOption) errs[`remarks-${i}`] = "Select a remark option.";
        if (c.remarksOption === "Other" && !c.remarks)
          errs[`remarks-${i}`] = "Enter custom remarks.";
      }
    });

    // Findings
    systems.forEach((s, i) => {
      if (!s.compliant && !s.nonCompliant)
        errs[`systemStatus-${i}`] = `Select status for "${s.system}".`;
      if (s.nonCompliant) {
        if (!s.remarksOption)
          errs[`sysRemarks-${i}`] = "Select a remark option.";
        if (s.remarksOption === "Other" && !s.remarks)
          errs[`sysRemarks-${i}`] = "Enter custom remarks.";
      }
    });

    // Recommendations
    if (!recommendationState.checked?.length)
      errs.recommendations = "Select at least one recommendation.";
    if (
      recommendationState.checked?.includes("Other Recommendations") &&
      !recommendationState.otherText
    ) {
      errs.recommendations = "Provide text for other recommendation.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Function to clear specific field errors
  const clearError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  /* ======================
     Handlers
     ====================== */
  const handleSave = () => {
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      notifications.warning("Please fix errors before saving.", { 
        title: 'Validation Error' 
      });
      return;
    }

    const formData = {
      general,
      purpose,
      permits,
      complianceItems,
      systems,
      recommendationState,
    };

    console.log("✅ Form ready to submit:", formData);

    try {
      localStorage.removeItem(storageKey);
      notifications.success("Inspection saved successfully!", { 
        title: 'Save Successful' 
      });
    } catch (e) {
      console.error("clear draft error", e);
      notifications.error("Error clearing draft data", { 
        title: 'Warning' 
      });
    }
    
    // Navigate back to inspections list after successful save
    navigate("/inspections");
  };

  const handleDraft = async () => {
    if (!inspectionId) {
      notifications.error("No inspection ID found. Cannot save draft.", { 
        title: 'Draft Save Failed' 
      });
      return;
    }

    // Save as draft without validation
    const formData = {
      general,
      purpose,
      permits,
      complianceItems,
      systems,
      recommendationState,
    };

    try {
      console.log("📝 Saving as draft:", formData);
      
      // Save draft to backend
      await saveInspectionDraft(inspectionId, { form_data: formData });
      
      // Clear localStorage draft since it's saved to backend
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {
        console.error("clear draft error", e);
      }
      
      // Show success message
      notifications.success("Draft saved successfully!", { 
        title: 'Draft Saved' 
      });
      
      // Navigate back to inspections list
      navigate("/inspections");
    } catch (error) {
      console.error("Failed to save draft:", error);
      notifications.error(`Failed to save draft: ${error.message}`, { 
        title: 'Draft Save Failed' 
      });
    }
  };

  const handleComplete = () => {
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      notifications.warning("Please fix errors before completing the inspection.", { 
        title: 'Validation Error' 
      });
      return;
    }

    if (!inspectionId) {
      notifications.error("No inspection ID found. Cannot complete inspection.", { 
        title: 'Completion Failed' 
      });
      return;
    }

    // Show completion confirmation dialog with form inputs
    setCompleteConfirmation({ 
      open: true, 
      compliance: '', 
      violations: '', 
      findings: '' 
    });
  };

  const executeComplete = async () => {
    const { compliance, violations, findings } = completeConfirmation;
    
    if (!compliance) {
      notifications.error("Compliance decision is required to complete the inspection.", { 
        title: 'Missing Information' 
      });
      return;
    }

    if (!['COMPLIANT', 'NON_COMPLIANT', 'PARTIALLY_COMPLIANT'].includes(compliance.toUpperCase())) {
      notifications.error("Invalid compliance decision. Please enter COMPLIANT, NON_COMPLIANT, or PARTIALLY_COMPLIANT.", { 
        title: 'Invalid Input' 
      });
      return;
    }

    if (compliance.toUpperCase() === 'NON_COMPLIANT' && !violations) {
      notifications.error("Violations description is required for non-compliant inspections.", { 
        title: 'Missing Information' 
      });
      return;
    }

    if (!findings) {
      notifications.error("Findings summary is required to complete the inspection.", { 
        title: 'Missing Information' 
      });
      return;
    }

    setLoading(true);
    const formData = {
      general,
      purpose,
      permits,
      complianceItems,
      systems,
      recommendationState,
    };

    try {
      console.log("✅ Completing inspection with data:", formData);
      
      // Complete the inspection
      await completeInspection(inspectionId, {
        form_data: formData,
        compliance_decision: compliance.toUpperCase(),
        violations_found: violations,
        findings_summary: findings,
        remarks: 'Inspection completed via form'
      });
      
      // Clear localStorage draft since it's completed
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {
        console.error("clear draft error", e);
      }
      
      // Show success message
      notifications.success("Inspection completed successfully!", { 
        title: 'Inspection Completed',
        duration: 6000
      });
      
      // Close confirmation dialog
      setCompleteConfirmation({ open: false, compliance: '', violations: '', findings: '' });
      
      // Navigate back to inspections list
      navigate("/inspections");
    } catch (error) {
      console.error("Failed to complete inspection:", error);
      notifications.error(`Failed to complete inspection: ${error.message}`, { 
        title: 'Completion Failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCloseConfirmation({ open: true });
  };

  const executeClose = (keepDraft) => {
    if (!keepDraft) {
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {
        console.error("Error removing draft:", e);
      }
    }
    
    setCloseConfirmation({ open: false });
    
    // Navigate back to inspections list
    navigate("/inspections");
  };

  /* ======================
     Render
     ====================== */
    return (
      <LayoutForm>
        <div className="w-full bg-white">
          <InternalHeader
            onSave={handleSave}
            onDraft={handleDraft}
            onClose={handleClose}
            onComplete={handleComplete}
            lastSaveTime={autoSaveLastTime || lastSaveTime}
            isOnline={autoSaveIsOnline}
            isSaving={isAutoSaving}
            saveError={autoSaveError}
            hasDataChanged={hasDataChanged}
            showCompleteButton={currentUser?.userlevel === 'Monitoring Personnel' && inspectionStatus === 'MONITORING_IN_PROGRESS'}
          />

          <div className="p-4">
        <GeneralInformation
          data={general}
          setData={setGeneral}
          onLawFilterChange={setLawFilter}
          inspectionData={fullInspectionData}
          errors={errors}
          clearError={clearError}
        />
        <PurposeOfInspection
          state={purpose}
          setState={setPurpose}
          errors={errors}
        />

        {lawFilter.length > 0 && (
          <>
            <ComplianceStatus
              permits={permits}
              setPermits={setPermits}
              lawFilter={lawFilter}
              errors={errors}
            />
            <SummaryOfCompliance
              items={complianceItems}
              setItems={setComplianceItems}
              lawFilter={lawFilter}
              errors={errors}
            />
            <SummaryOfFindingsAndObservations
              systems={systems}
              setSystems={setSystems}
              lawFilter={lawFilter}
              errors={errors}
            />
          </>
        )}

        <Recommendations
          recState={recommendationState}
          setRecState={setRecommendationState}
          errors={errors}
        />
      </div>
    </div>

    {/* Completion Confirmation Dialog */}
    <ConfirmationDialog
      open={completeConfirmation.open}
      title="Complete Inspection"
      message={
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Please provide the following information to complete the inspection:
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compliance Decision *
            </label>
            <select
              value={completeConfirmation.compliance}
              onChange={(e) => setCompleteConfirmation(prev => ({ ...prev, compliance: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Compliance Decision</option>
              <option value="COMPLIANT">COMPLIANT</option>
              <option value="NON_COMPLIANT">NON_COMPLIANT</option>
              <option value="PARTIALLY_COMPLIANT">PARTIALLY_COMPLIANT</option>
            </select>
          </div>

          {completeConfirmation.compliance === 'NON_COMPLIANT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Violations Found *
              </label>
              <textarea
                value={completeConfirmation.violations}
                onChange={(e) => setCompleteConfirmation(prev => ({ ...prev, violations: e.target.value }))}
                placeholder="Describe the violations found..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Summary of Findings and Observations *
            </label>
            <textarea
              value={completeConfirmation.findings}
              onChange={(e) => setCompleteConfirmation(prev => ({ ...prev, findings: e.target.value }))}
              placeholder="Provide a summary of findings and observations..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
            />
          </div>
        </div>
      }
      confirmText="Complete Inspection"
      cancelText="Cancel"
      confirmColor="green"
      size="lg"
      loading={loading}
      onCancel={() => setCompleteConfirmation({ open: false, compliance: '', violations: '', findings: '' })}
      onConfirm={executeComplete}
    />

    {/* Close Confirmation Dialog */}
    <ConfirmationDialog
      open={closeConfirmation.open}
      title="Close Inspection Form"
      message={
        <div>
          <p className="mb-2">Are you sure you want to close the inspection form?</p>
          <p className="text-sm text-gray-600">
            Your current progress will be saved as a draft unless you choose to discard it.
          </p>
        </div>
      }
      confirmText="Keep Draft & Close"
      cancelText="Discard & Close"
      confirmColor="sky"
      size="md"
      onCancel={() => executeClose(false)}
      onConfirm={() => executeClose(true)}
    />

    </LayoutForm>
  );
}
