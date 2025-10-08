import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as InspectionConstants from "../../constants/inspectionform/index";
import LayoutForm from "../LayoutForm";
import { saveInspectionDraft, completeInspection, getInspection, updateInspection, reviewInspection, forwardToLegal } from "../../services/api";
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

  // Determine button visibility based on status and user role
  const getButtonVisibility = () => {
    const userLevel = currentUser?.userlevel;
    const status = inspectionStatus;
    const isDraft = fullInspectionData?.form?.checklist?.is_draft || false;
    
    // Review statuses where main form should be read-only
    const reviewStatuses = ['UNIT_REVIEWED', 'SECTION_REVIEWED', 'DIVISION_REVIEWED', 'FINALIZED', 'CLOSED'];
    const isInReviewStatus = reviewStatuses.includes(status);
    
    // Statuses where Close Form, Draft, Submit buttons should be visible
    const editableStatuses = ['CREATED', 'SECTION_IN_PROGRESS', 'UNIT_IN_PROGRESS', 'MONITORING_IN_PROGRESS'];
    const isEditableStatus = editableStatuses.includes(status) || isDraft;
    
    return {
      // Close Form Button - Always visible (including in review statuses)
      showCloseButton: true,
      
      // Draft Button - Visible for all editable statuses including review statuses
      showDraftButton: isEditableStatus || isInReviewStatus,
      
      // Submit Button - Removed as per user request
      showSubmitButton: false,
      
      // Submit for Review Button - For Section Chief in SECTION_IN_PROGRESS and Unit Head in UNIT_IN_PROGRESS
      showSubmitForReviewButton: (userLevel === 'Section Chief' && status === 'SECTION_IN_PROGRESS') || 
                                 (userLevel === 'Unit Head' && status === 'UNIT_IN_PROGRESS'),
      
      // Submit for Review Button - Only for Monitoring Personnel in MONITORING_IN_PROGRESS
      showCompleteButton: userLevel === 'Monitoring Personnel' && status === 'MONITORING_IN_PROGRESS',
      
      // Send to Section Button - For Unit Head in UNIT_REVIEWED and in review forms (hidden when new button is shown)
      showSendToSectionButton: false, // Disabled in favor of generic "Send to Next Level" button
      
      // Send to Division Button - For Section Chief in SECTION_REVIEWED and in review forms (hidden when new button is shown)
      showSendToDivisionButton: false, // Disabled in favor of generic "Send to Next Level" button
      
      // Send to Next Level Button - Generic button for review workflow
      showSendToNextLevelButton: (userLevel === 'Unit Head' && status === 'UNIT_REVIEWED') ||
                                 (userLevel === 'Section Chief' && status === 'SECTION_REVIEWED') ||
                                 (userLevel === 'Division Chief' && status === 'DIVISION_REVIEWED'),
      
      // Get the next level name for button text
      getNextLevelName: () => {
        if (userLevel === 'Unit Head' && status === 'UNIT_REVIEWED') return 'Section';
        if (userLevel === 'Section Chief' && status === 'SECTION_REVIEWED') return 'Division';
        if (userLevel === 'Division Chief' && status === 'DIVISION_REVIEWED') {
          return 'Legal'; // Division Chief can always send to Legal
        }
        return 'Next Level';
      },
      
      // Review Button - For review workflow (Unit Head, Section Chief, Division Chief)
      showReviewButton: (userLevel === 'Unit Head' && status === 'UNIT_REVIEWED') ||
                       (userLevel === 'Section Chief' && status === 'SECTION_REVIEWED') ||
                       (userLevel === 'Division Chief' && status === 'DIVISION_REVIEWED'),
      
      // Forward to Legal Button - Only for Division Chief in DIVISION_REVIEWED (any compliance status)
      showForwardToLegalButton: userLevel === 'Division Chief' && status === 'DIVISION_REVIEWED',
      
      // Finalize Button - Only for Division Chief in DIVISION_REVIEWED (compliant cases)
      showFinalizeButton: userLevel === 'Division Chief' && status === 'DIVISION_REVIEWED' && determineComplianceStatus() === 'COMPLIANT',
      
      // Check if form should be read-only
      isReadOnly: isInReviewStatus && userLevel !== 'Division Chief'
    };
  };

  const buttonVisibility = getButtonVisibility();


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
        
        // Check if there's checklist data to load (draft or completed)
        if (inspectionData.form?.checklist && (inspectionData.form.checklist.is_draft || inspectionData.form.checklist.completed_at)) {
          const checklistData = inspectionData.form.checklist;
          
          console.log("📝 Found checklist data:", checklistData);
          
          // Load checklist data into form state, preserving existing values if they exist
          if (checklistData.general) {
            console.log("📝 Loading general data from checklist:", checklistData.general);
            setGeneral(prevGeneral => ({
              ...prevGeneral,
              ...checklistData.general,
              // Ensure required fields from inspection data are preserved only if not in checklist
              establishment_name: checklistData.general.establishment_name || prevGeneral.establishment_name,
              address: checklistData.general.address || prevGeneral.address,
              coordinates: checklistData.general.coordinates || prevGeneral.coordinates,
              nature_of_business: checklistData.general.nature_of_business || prevGeneral.nature_of_business,
              year_established: checklistData.general.year_established || prevGeneral.year_established,
            }));
          }
          
          if (checklistData.purpose) {
            setPurpose(checklistData.purpose);
          }
          
          if (checklistData.permits) {
            setPermits(checklistData.permits);
          }
          
          if (checklistData.complianceItems) {
            setComplianceItems(checklistData.complianceItems);
          }
          
          if (checklistData.systems) {
            setSystems(checklistData.systems);
          }
          
          if (checklistData.recommendationState) {
            setRecommendationState(checklistData.recommendationState);
          }
          
          if (checklistData.lawFilter) {
            setLawFilter(checklistData.lawFilter);
          }
          
          // Update last save time from checklist
          if (checklistData.last_saved) {
            setLastSaveTime(checklistData.last_saved);
          }
          
          console.log("✅ Checklist data loaded successfully into form state");
          
          // Show notification that checklist data was loaded (only once)
          if (!draftNotificationShown.current) {
            const isDraft = checklistData.is_draft;
            const message = isDraft 
              ? "Draft inspection form loaded successfully. You can continue editing where you left off."
              : "Completed inspection data loaded successfully. You can review the inspection details.";
            const title = isDraft ? 'Draft Loaded' : 'Inspection Data Loaded';
            
            notifications.info(message, {
              title: title,
              duration: 5000
            });
            draftNotificationShown.current = true;
          }
        } else {
          console.log("📝 No checklist data found, using fresh form");
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
    
    // Log compliance detection for debugging
    console.log('🔍 Compliance Detection:', {
      hasNonCompliantItems,
      hasCompliantItems,
      hasNonCompliantSystems,
      hasCompliantSystems,
      complianceItems: complianceItems.filter(item => item.compliant),
      systems: systems.filter(system => system.compliant || system.nonCompliant)
    });
    
    // Determine overall compliance
    if (hasNonCompliantItems || hasNonCompliantSystems) {
      console.log('❌ Result: NON_COMPLIANT');
      return 'NON_COMPLIANT';
    } else if (hasCompliantItems || hasCompliantSystems) {
      console.log('✅ Result: COMPLIANT');
      return 'COMPLIANT';
    } else {
      // If no compliance data is filled, assume non-compliant for safety
      console.log('⚠️ Result: NON_COMPLIANT (default - no data)');
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

  const handleSendToSection = async () => {
    if (!inspectionId) {
      notifications.error("No inspection ID found. Cannot send to section.", { 
        title: 'Send Failed' 
      });
      return;
    }

    try {
      setLoading(true);
      
      // Call the review action to change status to SECTION_REVIEWED
      await reviewInspection(inspectionId, {
        remarks: 'Sent to Section Chief for review'
      });
      
      notifications.success("Inspection sent to Section Chief successfully!", { 
        title: 'Sent to Section',
        duration: 6000
      });
      
      // Navigate back to inspections list
      navigate("/inspections");
    } catch (error) {
      console.error("Failed to send to section:", error);
      notifications.error(`Failed to send to section: ${error.message}`, { 
        title: 'Send Failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendToDivision = async () => {
    if (!inspectionId) {
      notifications.error("No inspection ID found. Cannot send to division.", { 
        title: 'Send Failed' 
      });
      return;
    }

    try {
      setLoading(true);
      
      // Call the review action to change status to DIVISION_REVIEWED
      await reviewInspection(inspectionId, {
        remarks: 'Sent to Division Chief for review'
      });
      
      notifications.success("Inspection sent to Division Chief successfully!", { 
        title: 'Sent to Division',
        duration: 6000
      });
      
      // Navigate back to inspections list
      navigate("/inspections");
    } catch (error) {
      console.error("Failed to send to division:", error);
      notifications.error(`Failed to send to division: ${error.message}`, { 
        title: 'Send Failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendToNextLevel = async () => {
    if (!inspectionId) {
      notifications.error("No inspection ID found. Cannot send to next level.", { 
        title: 'Send Failed' 
      });
      return;
    }

    const userLevel = currentUser?.userlevel;
    const status = inspectionStatus;
    let remarks = '';
    let successMessage = '';
    let nextLevel = '';

    try {
      setLoading(true);
      
      // Determine the next level based on current status and user level
      if (userLevel === 'Unit Head' && status === 'UNIT_REVIEWED') {
        nextLevel = 'Section';
        remarks = 'Sent to Section Chief for review';
        successMessage = 'Inspection sent to Section Chief successfully!';
      } else if (userLevel === 'Section Chief' && status === 'SECTION_REVIEWED') {
        nextLevel = 'Division';
        remarks = 'Sent to Division Chief for review';
        successMessage = 'Inspection sent to Division Chief successfully!';
      } else if (userLevel === 'Division Chief' && status === 'DIVISION_REVIEWED') {
        nextLevel = 'Legal';
        remarks = 'Forwarded case to Legal Unit';
        successMessage = 'Inspection forwarded to Legal Unit successfully!';
        // Call forward to legal instead of review
        await forwardToLegal(inspectionId, { remarks });
        notifications.success(successMessage, { 
          title: `Sent to ${nextLevel}`,
          duration: 6000
        });
        navigate("/inspections");
        return;
      }
      
      // Call the review action
      await reviewInspection(inspectionId, { remarks });
      
      notifications.success(successMessage, { 
        title: `Sent to ${nextLevel}`,
        duration: 6000
      });
      
      // Navigate back to inspections list
      navigate("/inspections");
    } catch (error) {
      console.error("Failed to send to next level:", error);
      notifications.error(`Failed to send to next level: ${error.message}`, { 
        title: 'Send Failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    // Review button should just open the form for viewing/reviewing
    // It should NOT change the status - that's what the "Send to Section/Division" buttons do
    notifications.info("Form opened for review. Use 'Send to Section/Division' buttons to advance the workflow.", { 
      title: 'Form Opened for Review',
      duration: 4000
    });
  };

  const handleForwardToLegal = async () => {
    if (!inspectionId) {
      notifications.error("No inspection ID found. Cannot forward to legal.", { 
        title: 'Forward Failed' 
      });
      return;
    }

    try {
      setLoading(true);
      
      // Call the forward to legal action
      await forwardToLegal(inspectionId, {
        remarks: 'Forwarded non-compliant case to Legal Unit'
      });
      
      notifications.success("Inspection forwarded to Legal Unit successfully!", { 
        title: 'Forwarded to Legal',
        duration: 6000
      });
      
      // Navigate back to inspections list
      navigate("/inspections");
    } catch (error) {
      console.error("Failed to forward to legal:", error);
      notifications.error(`Failed to forward to legal: ${error.message}`, { 
        title: 'Forward Failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!inspectionId) {
      notifications.error("No inspection ID found. Cannot finalize.", { 
        title: 'Finalize Failed' 
      });
      return;
    }

    try {
      setLoading(true);
      
      // Save the recommendation first
      await updateInspection(inspectionId, {
        recommendation: recommendationState
      });
      
      // Call the review action to change status to FINALIZED
      await reviewInspection(inspectionId, {
        remarks: 'Inspection finalized by Division Chief'
      });
      
      notifications.success("Inspection finalized successfully!", { 
        title: 'Inspection Finalized',
        duration: 6000
      });
      
      // Navigate back to inspections list
      navigate("/inspections");
    } catch (error) {
      console.error("Failed to finalize inspection:", error);
      notifications.error(`Failed to finalize inspection: ${error.message}`, { 
        title: 'Finalize Failed' 
      });
    } finally {
      setLoading(false);
    }
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
      const userLevel = currentUser?.userlevel;
      const status = inspectionStatus;
      let remarks = '';
      let successMessage = '';
      
      // Determine the appropriate action based on user level and status
      if (userLevel === 'Monitoring Personnel' && status === 'MONITORING_IN_PROGRESS') {
        remarks = 'Inspection submitted for Unit Head review';
        successMessage = 'Inspection submitted successfully! It has been sent to Unit Head for review.';
        console.log("✅ Submitting inspection for Unit Head review with data:", formData);
      } else if (userLevel === 'Section Chief' && status === 'SECTION_IN_PROGRESS') {
        remarks = 'Inspection submitted for Division Chief review';
        successMessage = 'Inspection submitted successfully! It has been sent to Division Chief for review.';
        console.log("✅ Submitting inspection for Division Chief review with data:", formData);
      } else if (userLevel === 'Unit Head' && status === 'UNIT_IN_PROGRESS') {
        remarks = 'Inspection submitted for Section Chief review';
        successMessage = 'Inspection submitted successfully! It has been sent to Section Chief for review.';
        console.log("✅ Submitting inspection for Section Chief review with data:", formData);
      } else {
        remarks = 'Inspection submitted for review';
        successMessage = 'Inspection submitted successfully!';
        console.log("✅ Submitting inspection for review with data:", formData);
      }
      
      // Complete the inspection
      await completeInspection(inspectionId, {
        form_data: formData,
        compliance_decision: compliance.toUpperCase(),
        violations_found: autoViolations,
        findings_summary: autoFindings,
        remarks: remarks
      });
      
      // Clear localStorage draft since it's completed
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {
        console.error("clear draft error", e);
      }
      
      // Show success message
      notifications.success(successMessage, { 
        title: 'Inspection Submitted',
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
            onSendToSection={handleSendToSection}
            onSendToDivision={handleSendToDivision}
            onSendToNextLevel={handleSendToNextLevel}
            onFinalize={handleFinalize}
            onReview={handleReview}
            onForwardToLegal={handleForwardToLegal}
            lastSaveTime={lastSaveTime}
            showCompleteButton={buttonVisibility.showCompleteButton}
            showSubmitForReviewButton={buttonVisibility.showSubmitForReviewButton}
            showSendToSectionButton={buttonVisibility.showSendToSectionButton}
            showSendToDivisionButton={buttonVisibility.showSendToDivisionButton}
            showSendToNextLevelButton={buttonVisibility.showSendToNextLevelButton}
            nextLevelName={buttonVisibility.getNextLevelName()}
            showFinalizeButton={buttonVisibility.showFinalizeButton}
            showReviewButton={buttonVisibility.showReviewButton}
            showForwardToLegalButton={buttonVisibility.showForwardToLegalButton}
            showDraftButton={buttonVisibility.showDraftButton}
            showSubmitButton={buttonVisibility.showSubmitButton}
            showCloseButton={buttonVisibility.showCloseButton}
            isDraft={fullInspectionData?.form?.checklist?.is_draft || false}
            complianceStatus={determineComplianceStatus()}
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

            {/* Compliance Status Summary */}
            {complianceItems.length > 0 && systems.length > 0 && (
              <div className={`mb-6 p-4 rounded-lg border ${
                determineComplianceStatus() === 'COMPLIANT' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className={`text-lg font-semibold ${
                    determineComplianceStatus() === 'COMPLIANT' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {determineComplianceStatus() === 'COMPLIANT' ? '✅ Compliance Status: COMPLIANT' : '❌ Compliance Status: NON-COMPLIANT'}
                  </h3>
                </div>
                
                {/* Compliance Items Summary */}
                <div className="mb-3">
                  <h4 className="font-medium text-gray-700 mb-2">Compliance Items:</h4>
                  <div className="space-y-1">
                    {complianceItems.filter(item => general.environmental_laws?.includes(item.lawId)).map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className={`w-3 h-3 rounded-full ${
                          item.compliant === 'Yes' ? 'bg-green-500' : 
                          item.compliant === 'No' ? 'bg-red-500' : 'bg-gray-300'
                        }`}></span>
                        <span className="text-gray-700">{item.item}:</span>
                        <span className={`font-medium ${
                          item.compliant === 'Yes' ? 'text-green-700' : 
                          item.compliant === 'No' ? 'text-red-700' : 'text-gray-500'
                        }`}>
                          {item.compliant || 'Not assessed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Systems Summary */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Systems/Findings:</h4>
                  <div className="space-y-1">
                    {systems.filter(system => general.environmental_laws?.includes(system.lawId)).map((system, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className={`w-3 h-3 rounded-full ${
                          system.compliant ? 'bg-green-500' : 
                          system.nonCompliant ? 'bg-red-500' : 'bg-gray-300'
                        }`}></span>
                        <span className="text-gray-700">{system.system}:</span>
                        <span className={`font-medium ${
                          system.compliant ? 'text-green-700' : 
                          system.nonCompliant ? 'text-red-700' : 'text-gray-500'
                        }`}>
                          {system.compliant ? 'Compliant' : 
                           system.nonCompliant ? 'Non-Compliant' : 'Not assessed'}
                        </span>
                      </div>
                    ))}
                  </div>
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
          isReadOnly={buttonVisibility.isReadOnly}
        />
        <PurposeOfInspection
          state={purpose}
          setState={setPurpose}
          errors={errors}
          isReadOnly={buttonVisibility.isReadOnly}
        />

        {lawFilter.length > 0 && (
          <>
            <ComplianceStatus
              permits={permits}
              setPermits={setPermits}
              lawFilter={lawFilter}
              errors={errors}
              isReadOnly={buttonVisibility.isReadOnly}
            />
            <SummaryOfCompliance
              items={complianceItems}
              setItems={setComplianceItems}
              lawFilter={lawFilter}
              errors={errors}
              isReadOnly={buttonVisibility.isReadOnly}
            />
            <SummaryOfFindingsAndObservations
              systems={systems}
              setSystems={setSystems}
              lawFilter={lawFilter}
              errors={errors}
              isReadOnly={buttonVisibility.isReadOnly}
            />
          </>
        )}

        <Recommendations
          recState={recommendationState}
          setRecState={setRecommendationState}
          errors={errors}
          isReadOnly={buttonVisibility.isReadOnly && currentUser?.userlevel !== 'Division Chief'}
          canEditRecommendation={currentUser?.userlevel === 'Division Chief' && inspectionStatus === 'DIVISION_REVIEWED'}
        />
      </div>
    </div>

    {/* Completion Confirmation Dialog */}
    <ConfirmationDialog
      open={completeConfirmation.open}
      title="Submit Inspection for Review"
      message={
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Based on the collected inspection data, the following compliance status has been determined. This inspection will be submitted to the Unit Head for review:
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
