import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as InspectionConstants from "../../constants/inspectionform/index";
import LayoutForm from "../LayoutForm";
import { saveInspectionDraft, completeInspection, getInspection, updateInspection } from "../../services/api";
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
  const [errors, setErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [inspectionStatus, setInspectionStatus] = useState(null);
  const [fullInspectionData, setFullInspectionData] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const draftNotificationShown = useRef(false);
  
  // Confirmation dialog states
  const [completeConfirmation, setCompleteConfirmation] = useState({ 
    open: false, 
    compliance: '', 
    violations: '', 
    findings: '' 
  });
  const [closeConfirmation, setCloseConfirmation] = useState({ open: false });
  const [loading, setLoading] = useState(false);


  // Local storage backup (only for manual saves)
  useEffect(() => {
    const saveData = {
      general,
      purpose,
      permits,
      complianceItems,
      systems,
      recommendationState,
      lawFilter,
      lastSaved: lastSaveTime || new Date().toISOString(),
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(saveData));
      console.log("💾 LocalStorage backup saved:", saveData);
    } catch (e) {
      console.error("localStorage backup error", e);
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
    lastSaveTime,
  ]);

  // Prefill law filter from fullInspectionData
  useEffect(() => {
    if (fullInspectionData?.law && !lawFilter.includes(fullInspectionData.law)) {
      console.log("🔧 Setting law filter from inspection data:", fullInspectionData.law);
      setLawFilter([fullInspectionData.law]);
    }
  }, [fullInspectionData, lawFilter]);

  // Load draft from backend when component mounts
  useEffect(() => {
    const loadDraftFromBackend = async () => {
      if (!inspectionId || isDataLoaded) return;
      
      try {
        console.log("🔍 Fetching inspection data for ID:", inspectionId);
        
        // Use the API service instead of direct fetch
        const inspectionData = await getInspection(inspectionId);
        
        console.log("📋 Loaded inspection data:", inspectionData);
        
        // Store full inspection data for autofill
        setFullInspectionData(inspectionData);
        
        // Store inspection status for completion logic
        setInspectionStatus(inspectionData.current_status);
        
        // Check if there's draft data to load
        if (inspectionData.form?.checklist?.is_draft) {
          const draftData = inspectionData.form.checklist;
          
          console.log("📝 Found draft data:", draftData);
          
          // Load draft data into form state, preserving existing values if they exist
          if (draftData.general) {
            console.log("📝 Loading general data from draft:", draftData.general);
            setGeneral(prevGeneral => ({
              ...prevGeneral,
              ...draftData.general,
              // Ensure required fields from inspection data are preserved only if not in draft
              establishment_name: draftData.general.establishment_name || prevGeneral.establishment_name,
              address: draftData.general.address || prevGeneral.address,
              coordinates: draftData.general.coordinates || prevGeneral.coordinates,
              nature_of_business: draftData.general.nature_of_business || prevGeneral.nature_of_business,
              year_established: draftData.general.year_established || prevGeneral.year_established,
            }));
          }
          
          if (draftData.purpose) {
            setPurpose(draftData.purpose);
          }
          
          if (draftData.permits) {
            setPermits(draftData.permits);
          }
          
          if (draftData.complianceItems) {
            setComplianceItems(draftData.complianceItems);
          }
          
          if (draftData.systems) {
            setSystems(draftData.systems);
          }
          
          if (draftData.recommendationState) {
            setRecommendationState(draftData.recommendationState);
          }
          
          if (draftData.lawFilter) {
            setLawFilter(draftData.lawFilter);
          }
          
          // Update last save time from draft
          if (draftData.last_saved) {
            setLastSaveTime(draftData.last_saved);
          }
          
          console.log("✅ Draft data loaded successfully into form state");
          
          // Show notification that draft was loaded (only once)
          if (!draftNotificationShown.current) {
            notifications.info("Draft inspection form loaded successfully. You can continue editing where you left off.", {
              title: 'Draft Loaded',
              duration: 5000
            });
            draftNotificationShown.current = true;
          }
        } else {
          console.log("📝 No draft data found, using fresh form");
        }
        
        // Mark data as loaded to prevent duplicate loading
        setIsDataLoaded(true);
        
      } catch (error) {
        console.error("Failed to load draft from backend:", error);
        notifications.error("Failed to load inspection data. Please refresh the page.", {
          title: 'Loading Error',
          duration: 5000
        });
        setIsDataLoaded(true); // Still mark as loaded to prevent infinite retries
      }
    };

    loadDraftFromBackend();
  }, [inspectionId, isDataLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

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
      } else if (inspDate > new Date()) {
        errs.inspection_date_time = "Inspection date/time cannot be in the future.";
      } else if (fullInspectionData?.created_at) {
        const creationDate = new Date(fullInspectionData.created_at);
        if (!isNaN(creationDate.getTime()) && inspDate < creationDate) {
          errs.inspection_date_time = "Inspection date/time cannot be before the creation date.";
        }
      }
    } else {
      errs.inspection_date_time = "Inspection date/time is required.";
    }

    // Environmental Laws (at least one must be selected)
    if (!general.environmental_laws || general.environmental_laws.length === 0) {
      errs.environmental_laws = "At least one environmental law must be selected.";
    }

    // Compliance - only validate items for selected environmental laws
    const selectedLaws = general.environmental_laws || [];
    complianceItems.forEach((c, i) => {
      // Only validate if the compliance item's law is selected
      if (selectedLaws.includes(c.lawId)) {
      if (!c.compliant) errs[`compliant-${i}`] = "Select compliance status.";
      if (c.compliant === "Non-Compliant") {
        if (!c.remarksOption) errs[`remarks-${i}`] = "Select a remark option.";
        if (c.remarksOption === "Other" && !c.remarks)
          errs[`remarks-${i}`] = "Enter custom remarks.";
        }
      }
    });

    // Findings - only validate systems for selected environmental laws
    systems.forEach((s, i) => {
      // Only validate if the system's law is selected (exclude "Commitment/s from previous Technical Conference")
      const shouldValidate = selectedLaws.includes(s.lawId) && s.system !== "Commitment/s from previous Technical Conference";
      
      if (shouldValidate) {
      if (!s.compliant && !s.nonCompliant)
        errs[`systemStatus-${i}`] = `Select status for "${s.system}".`;
      if (s.nonCompliant) {
        if (!s.remarksOption)
          errs[`sysRemarks-${i}`] = "Select a remark option.";
        if (s.remarksOption === "Other" && !s.remarks)
          errs[`sysRemarks-${i}`] = "Enter custom remarks.";
        }
      }
    });

    // Recommendations - no validation required

    setErrors(errs);
    
    // Log validation errors to console for debugging
    if (Object.keys(errs).length > 0) {
      console.log("🚨 Validation Errors Found:", errs);
      console.log("📋 Error Summary:");
      Object.entries(errs).forEach(([field, message]) => {
        console.log(`  • ${field}: ${message}`);
      });
    }
    
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

  // Function to clear system data when environmental law is unchecked
  const clearSystemsForUnselectedLaws = (selectedLaws) => {
    const updatedSystems = systems.map(system => {
      // If the system's law is not selected and it's not the "Commitment/s from previous Technical Conference"
      // Also, only clear if the system has a lawId (to avoid clearing systems without lawId)
      if (!selectedLaws.includes(system.lawId) && system.system !== "Commitment/s from previous Technical Conference" && system.lawId) {
        return {
          ...system,
          compliant: false,
          nonCompliant: false,
          notApplicable: false,
          remarks: "",
          remarksOption: ""
        };
      }
      return system;
    });
    setSystems(updatedSystems);
  };

  // Function to clear compliance items for unselected laws
  const clearComplianceItemsForUnselectedLaws = (selectedLaws) => {
    const updatedComplianceItems = complianceItems.map(item => {
      // If the compliance item's law is not selected
      if (!selectedLaws.includes(item.lawId)) {
        return {
          ...item,
          compliant: "",
          remarksOption: "",
          remarks: ""
        };
      }
      return item;
    });
    setComplianceItems(updatedComplianceItems);
  };

  /* ======================
     Helper Functions
     ====================== */
  
  // Function to determine compliance status based on form data
  const determineComplianceStatus = () => {
    // Check compliance items
    const hasNonCompliantItems = complianceItems.some(item => item.compliant === "No");
    const hasCompliantItems = complianceItems.some(item => item.compliant === "Yes");
    
    // Check systems (findings)
    const hasNonCompliantSystems = systems.some(system => system.nonCompliant);
    const hasCompliantSystems = systems.some(system => system.compliant);
    
    // Determine overall compliance
    if (hasNonCompliantItems || hasNonCompliantSystems) {
      return 'NON_COMPLIANT';
    } else if (hasCompliantItems || hasCompliantSystems) {
      return 'COMPLIANT';
    } else {
      // If no compliance data is filled, assume non-compliant for safety
      return 'NON_COMPLIANT';
    }
  };

  const generateViolationsSummary = () => {
    const violations = [];
    
    // Check compliance items for violations
    complianceItems.forEach(item => {
      if (item.compliant === "No") {
        violations.push(`• ${item.item}: ${item.remarksOption || 'Non-compliant'}`);
      }
    });
    
    // Check systems for violations
    systems.forEach(system => {
      if (system.nonCompliant) {
        const remarks = system.remarksOption === "Other" ? system.remarks : system.remarksOption;
        violations.push(`• ${system.system}: ${remarks || 'Non-compliant'}`);
      }
    });
    
    return violations.length > 0 ? violations.join('\n') : 'No violations found';
  };

  const generateFindingsSummary = () => {
    const findings = [];
    
    // Add compliance items findings
    const compliantItems = complianceItems.filter(item => item.compliant === "Yes");
    const nonCompliantItems = complianceItems.filter(item => item.compliant === "No");
    
    if (compliantItems.length > 0) {
      findings.push(`Compliant Items (${compliantItems.length}):`);
      compliantItems.forEach(item => {
        findings.push(`• ${item.item}: Compliant`);
      });
    }
    
    if (nonCompliantItems.length > 0) {
      findings.push(`Non-Compliant Items (${nonCompliantItems.length}):`);
      nonCompliantItems.forEach(item => {
        findings.push(`• ${item.item}: ${item.remarksOption || 'Non-compliant'}`);
      });
    }
    
    // Add systems findings
    const compliantSystems = systems.filter(system => system.compliant);
    const nonCompliantSystems = systems.filter(system => system.nonCompliant);
    
    if (compliantSystems.length > 0) {
      findings.push(`Compliant Systems (${compliantSystems.length}):`);
      compliantSystems.forEach(system => {
        findings.push(`• ${system.system}: Compliant`);
      });
    }
    
    if (nonCompliantSystems.length > 0) {
      findings.push(`Non-Compliant Systems (${nonCompliantSystems.length}):`);
      nonCompliantSystems.forEach(system => {
        const remarks = system.remarksOption === "Other" ? system.remarks : system.remarksOption;
        findings.push(`• ${system.system}: ${remarks || 'Non-compliant'}`);
      });
    }
    
    return findings.length > 0 ? findings.join('\n') : 'No findings recorded';
  };

  // Function to determine the appropriate status based on current status and compliance
  const determineNewStatus = (currentStatus, complianceStatus) => {
    // If current status is MONITORING_IN_PROGRESS, update to appropriate completion status
    if (currentStatus === 'MONITORING_IN_PROGRESS') {
      return complianceStatus === 'COMPLIANT' 
        ? 'MONITORING_COMPLETED_COMPLIANT' 
        : 'MONITORING_COMPLETED_NON_COMPLIANT';
    }
    
    // For other statuses, determine based on user level and compliance
    const userLevel = currentUser?.userlevel;
    
    if (userLevel === 'Section Chief') {
      // Section Chief completion should go to Division Chief for review
      return 'DIVISION_REVIEWED';
    } else if (userLevel === 'Unit Head') {
      return complianceStatus === 'COMPLIANT' 
        ? 'UNIT_COMPLETED_COMPLIANT' 
        : 'UNIT_COMPLETED_NON_COMPLIANT';
    } else if (userLevel === 'Monitoring Personnel') {
      return complianceStatus === 'COMPLIANT' 
        ? 'MONITORING_COMPLETED_COMPLIANT' 
        : 'MONITORING_COMPLETED_NON_COMPLIANT';
    }
    
    // Default fallback
    return currentStatus;
  };

  /* ======================
     Handlers
     ====================== */
  const handleSave = async () => {
    if (!inspectionId) {
      notifications.error("No inspection ID found. Cannot save.", { 
        title: 'Save Failed' 
      });
      return;
    }

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      // Show detailed error summary
      const errorCount = Object.keys(errors).length;
      const errorSummary = Object.entries(errors)
        .map(([, message]) => `• ${message}`)
        .join('\n');
      
      notifications.warning(
        `Please fix ${errorCount} validation error(s) before saving:\n\n${errorSummary}`, 
        { 
          title: 'Validation Error',
          duration: 10000 // Show for 10 seconds
        }
      );
      return;
    }

    // Save as draft in database (same as handleDraft but with validation)
    const formDataToSave = {
      general,
      purpose,
      permits,
      complianceItems,
      systems,
      recommendationState,
      lawFilter,
    };

    try {
      console.log("💾 Saving validated form as draft:", formDataToSave);
      console.log("💾 General data being saved:", general);
      console.log("💾 LawFilter being saved:", lawFilter);
      
      // Determine compliance status
      const complianceStatus = determineComplianceStatus();
      console.log("🔍 Determined compliance status:", complianceStatus);
      
      // Determine new status based on current status and compliance
      const currentStatus = fullInspectionData?.current_status || 'CREATED';
      const newStatus = determineNewStatus(currentStatus, complianceStatus);
      console.log("📊 Current status:", currentStatus, "→ New status:", newStatus);
      
      // Save draft to backend
      await saveInspectionDraft(inspectionId, { form_data: formDataToSave });
      
      // Update inspection status if it has changed
      if (newStatus !== currentStatus) {
        console.log("🔄 Updating inspection status to:", newStatus);
        
        // Prepare update data
        const updateData = { 
          current_status: newStatus,
          compliance_status: complianceStatus
        };
        
        // If status is DIVISION_REVIEWED, the backend will automatically assign to Division Chief
        if (newStatus === 'DIVISION_REVIEWED') {
          console.log("📋 Status changed to DIVISION_REVIEWED - will be assigned to Division Chief");
        }
        
        await updateInspection(inspectionId, updateData);
      }
      
      // Update last save time
      const now = new Date().toISOString();
      setLastSaveTime(now);
      
      // Clear localStorage draft since it's saved to backend
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.error("clear draft error", e);
      }
      
      // Show success message with status info
      let statusMessage = "Inspection saved successfully!";
      
      if (newStatus !== currentStatus) {
        if (newStatus === 'DIVISION_REVIEWED') {
          statusMessage = "Inspection saved successfully! Status updated to Division Reviewed - assigned to Division Chief for review.";
        } else if (newStatus === 'UNIT_COMPLETED_COMPLIANT') {
          statusMessage = "Inspection saved successfully! Status updated to Unit Completed - Compliant.";
        } else if (newStatus === 'UNIT_COMPLETED_NON_COMPLIANT') {
          statusMessage = "Inspection saved successfully! Status updated to Unit Completed - Non-Compliant.";
        } else if (newStatus === 'MONITORING_COMPLETED_COMPLIANT') {
          statusMessage = "Inspection saved successfully! Status updated to Monitoring Completed - Compliant.";
        } else if (newStatus === 'MONITORING_COMPLETED_NON_COMPLIANT') {
          statusMessage = "Inspection saved successfully! Status updated to Monitoring Completed - Non-Compliant.";
        } else {
          statusMessage = `Inspection saved successfully! Status updated to: ${newStatus.replace(/_/g, ' ')}`;
        }
      }
      
      notifications.success(statusMessage, { 
        title: 'Save Successful' 
      });
      
      // Navigate back to inspections list
    navigate("/inspections");
    } catch (error) {
      console.error("Failed to save inspection:", error);
      notifications.error(`Failed to save inspection: ${error.message}`, { 
        title: 'Save Failed' 
      });
    }
  };

  const handleDraft = async () => {
    if (!inspectionId) {
      notifications.error("No inspection ID found. Cannot save draft.", { 
        title: 'Draft Save Failed' 
      });
      return;
    }

    // Save as draft without validation
    const formDataToSave = {
      general,
      purpose,
      permits,
      complianceItems,
      systems,
      recommendationState,
      lawFilter,
    };

    try {
      console.log("📝 Saving as draft:", formDataToSave);
      console.log("📝 General data being saved:", general);
      console.log("📝 LawFilter being saved:", lawFilter);
      
      // Save draft to backend
      await saveInspectionDraft(inspectionId, { form_data: formDataToSave });
      
      // Update last save time
      const now = new Date().toISOString();
      setLastSaveTime(now);
      
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
      
      // Show detailed error summary
      const errorCount = Object.keys(errors).length;
      const errorSummary = Object.entries(errors)
        .map(([, message]) => `• ${message}`)
        .join('\n');
      
      notifications.warning(
        `Please fix ${errorCount} validation error(s) before completing:\n\n${errorSummary}`, 
        { 
          title: 'Validation Error',
          duration: 10000 // Show for 10 seconds
        }
      );
      return;
    }

    if (!inspectionId) {
      notifications.error("No inspection ID found. Cannot complete inspection.", { 
        title: 'Completion Failed' 
      });
      return;
    }

    // Automatically determine compliance status based on collected data
    const autoCompliance = determineComplianceStatus();
    
    // Show completion confirmation dialog with auto-determined compliance
    setCompleteConfirmation({ 
      open: true, 
      compliance: autoCompliance, 
      violations: '', 
      findings: '' 
    });
  };

  const executeComplete = async () => {
    const { compliance } = completeConfirmation;
    
    if (!compliance) {
      notifications.error("Compliance decision is required to complete the inspection.", { 
        title: 'Missing Information' 
      });
      return;
    }

    // Automatically generate violations and findings based on collected data
    const autoViolations = generateViolationsSummary();
    const autoFindings = generateFindingsSummary();

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
        violations_found: autoViolations,
        findings_summary: autoFindings,
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
            lastSaveTime={lastSaveTime}
            showCompleteButton={currentUser?.userlevel === 'Monitoring Personnel' && inspectionStatus === 'MONITORING_IN_PROGRESS'}
            isDraft={fullInspectionData?.form?.checklist?.is_draft || false}
          />

          <div className="p-4">
            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-semibold text-red-800">
                    {Object.keys(errors).length} Validation Error(s) Found
                  </h3>
                </div>
                <p className="text-sm text-red-700 mb-3">
                  Please fix the following errors before saving or completing the inspection:
                </p>
                <div className="space-y-1">
                  {Object.entries(errors).map(([field, message]) => (
                    <div key={field} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span className="text-sm text-red-700">{message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
        <GeneralInformation
          data={general}
          setData={setGeneral}
          onLawFilterChange={(selectedLaws) => {
            setLawFilter(selectedLaws);
            // Clear systems and compliance items for unselected laws
            clearSystemsForUnselectedLaws(selectedLaws);
            clearComplianceItemsForUnselectedLaws(selectedLaws);
          }}
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
            Based on the collected inspection data, the following compliance status has been determined:
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compliance Decision (Auto-determined)
            </label>
            <div className={`w-full p-3 border rounded-md ${
              completeConfirmation.compliance === 'COMPLIANT' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {completeConfirmation.compliance === 'COMPLIANT' ? '✅' : '❌'}
                </span>
                <span className="font-semibold">
                  {completeConfirmation.compliance === 'COMPLIANT' ? 'COMPLIANT' : 'NON-COMPLIANT'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Summary of Findings and Observations (Auto-generated)
            </label>
            <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-700 max-h-32 overflow-y-auto">
              {generateFindingsSummary()}
            </div>
          </div>

          {completeConfirmation.compliance === 'NON_COMPLIANT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Violations Found (Auto-generated)
              </label>
              <div className="w-full p-3 border border-red-200 rounded-md bg-red-50 text-sm text-red-700 max-h-32 overflow-y-auto">
                {generateViolationsSummary()}
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600">
            Click "Complete Inspection" to finalize the inspection with the above status.
          </p>
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
