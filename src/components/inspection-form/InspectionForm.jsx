import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as InspectionConstants from "../../constants/inspectionform/index";
import LayoutForm from "../LayoutForm";
import { saveInspectionDraft, completeInspection, getInspection, updateInspection, reviewInspection, forwardToLegal, sendToSection, sendToDivision, closeInspection, sendNOV, sendNOO, uploadFindingDocument } from "../../services/api";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { useNotifications } from "../NotificationManager";

// Import all section components
import UnifiedInspectionHeader from "./UnifiedInspectionHeader";
import GeneralInformation from "./GeneralInformation";
import PurposeOfInspection from "./PurposeOfInspection";
import ComplianceStatus from "./ComplianceStatus";
import SummaryOfCompliance from "./SummaryOfCompliance";
import SummaryOfFindingsAndObservations from "./SummaryOfFindingsAndObservations";
import Recommendations from "./Recommendations";
import InspectionPolygonMap from "./InspectionPolygonMap";
import ValidationSummary from "./ValidationSummary";

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
  
  // Finding images state - stores images for each finding system
  const [findingImages, setFindingImages] = useState(
    savedData?.findingImages || {}
  );
  
  // General findings documents state
  const [generalFindings, setGeneralFindings] = useState(
    savedData?.generalFindings || []
  );
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
  const [actionConfirmation, setActionConfirmation] = useState({ 
    open: false, 
    inspection: null, 
    action: null 
  });
  const [loading, setLoading] = useState(false);
  const [hasFormChanges, setHasFormChanges] = useState(false);
  const [hasActionTaken, setHasActionTaken] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  
  // Tab navigation state and refs
  const [activeSection, setActiveSection] = useState('general');
  const generalRef = useRef(null);
  const purposeRef = useRef(null);
  const complianceStatusRef = useRef(null);
  const summaryComplianceRef = useRef(null);
  const findingsRef = useRef(null);
  const recommendationsRef = useRef(null);
  
  const sectionRefs = useMemo(() => ({
    general: generalRef,
    purpose: purposeRef,
    'compliance-status': complianceStatusRef,
    'summary-compliance': summaryComplianceRef,
    findings: findingsRef,
    recommendations: recommendationsRef
  }), []);

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

  // Determine button visibility and access control based on status and user role
  const getButtonVisibility = () => {
    const userLevel = currentUser?.userlevel;
    const status = inspectionStatus;
    const isDraft = fullInspectionData?.form?.checklist?.is_draft || false;
    
    // Review statuses where main form should be read-only
    const reviewStatuses = ['UNIT_REVIEWED', 'SECTION_REVIEWED', 'DIVISION_REVIEWED', 'LEGAL_REVIEW', 'FINALIZED', 'CLOSED'];
    const isInReviewStatus = reviewStatuses.includes(status);
    
    // Statuses where Close Form, Draft, Submit buttons should be visible
    const editableStatuses = ['CREATED', 'SECTION_IN_PROGRESS', 'UNIT_IN_PROGRESS', 'MONITORING_IN_PROGRESS'];
    const isEditableStatus = editableStatuses.includes(status) || isDraft;
    
    // NEW ACCESS CONTROL LOGIC:
    // All fields are read-only during review process
    // Only Division Chief can edit recommendations
    const isDivisionChief = userLevel === 'Division Chief';
    const isFormReadOnly = isInReviewStatus; // Make form read-only during review
    
    return {
      // Close Form Button - Always visible (including in review statuses)
      showCloseButton: true,
      
      // Draft Button - Hidden during review statuses
      showDraftButton: isEditableStatus && !isInReviewStatus,
      
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
      
      // Send to Next Level Button - For Unit Head and Section Chief
      showSendToNextLevelButton: (
        (userLevel === 'Unit Head' && status === 'UNIT_REVIEWED') ||
        (userLevel === 'Section Chief' && status === 'SECTION_REVIEWED')
      ),
      
      // Get the next level name for button text
      getNextLevelName: () => {
        if (userLevel === 'Unit Head' && status === 'UNIT_REVIEWED') return 'Section';
        if (userLevel === 'Section Chief' && status === 'SECTION_REVIEWED') return 'Division';
        if (userLevel === 'Division Chief' && status === 'DIVISION_REVIEWED') {
          return 'Legal'; // Division Chief can always send to Legal
        }
        return 'Next Level';
      },
      
      // Review Button - Only for Unit Head who uses it to enter the form
      showReviewButton: (userLevel === 'Unit Head' && status === 'UNIT_REVIEWED'),
      
      // Forward to Legal Button - Only for Division Chief in DIVISION_REVIEWED (any compliance status)
      showForwardToLegalButton: userLevel === 'Division Chief' && status === 'DIVISION_REVIEWED',
      
      // Mark as Compliant Button - Only for Division Chief in DIVISION_REVIEWED
      showMarkAsCompliantButton: userLevel === 'Division Chief' && status === 'DIVISION_REVIEWED',
      
      // Finalize Button - Disabled (functionality moved to Close Form)
      showFinalizeButton: false,
      
      // Legal Unit buttons - NOV and NOO buttons for Legal Unit in LEGAL_REVIEW
      showSendNOVButton: userLevel === 'Legal Unit' && status === 'LEGAL_REVIEW',
      showSendNOOButton: userLevel === 'Legal Unit' && status === 'LEGAL_REVIEW',
      
      // Save Recommendation Button - Only for Division Chief
      showSaveRecommendationButton: isDivisionChief,
      
      // NEW ACCESS CONTROL:
      // All fields are read-only by default
      isReadOnly: isFormReadOnly,
      
      // Only Division Chief can edit recommendations
      canEditRecommendation: isDivisionChief,
      
      // Division Chief specific access
      isDivisionChief: isDivisionChief
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
      findingImages,
      generalFindings,
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
    findingImages,
    generalFindings,
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
          
          if (checklistData.findingImages) {
            setFindingImages(checklistData.findingImages);
          }
          
          if (checklistData.generalFindings) {
            setGeneralFindings(checklistData.generalFindings);
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

  // Auto-save to database for editable statuses
  useEffect(() => {
    // Only auto-save for Section Chief, Unit Head, Monitoring Personnel in editable statuses
    const editableStatuses = ['SECTION_IN_PROGRESS', 'UNIT_IN_PROGRESS', 'MONITORING_IN_PROGRESS'];
    const isEditable = editableStatuses.includes(inspectionStatus);
    
    if (!isEditable || !inspectionId || !hasFormChanges) return;
    
    // Debounce: save after 3 seconds of inactivity
    const timer = setTimeout(async () => {
      try {
        setAutoSaveStatus('saving');
        
        const formDataToSave = {
          general,
          purpose,
          permits,
          complianceItems,
          systems,
          recommendationState,
          findingImages,
          generalFindings
        };
        
        await saveInspectionDraft(inspectionId, { form_data: formDataToSave });
        console.log('✅ Auto-saved to database');
        setLastSaveTime(new Date().toISOString());
        setHasFormChanges(false);
        setAutoSaveStatus('saved');
      } catch (error) {
        console.error('Auto-save failed:', error);
        setAutoSaveStatus('error');
        // Don't show error to user for auto-save failures
      }
    }, 3000); // 3 second debounce
    
    return () => clearTimeout(timer);
  }, [general, purpose, permits, complianceItems, systems, recommendationState, findingImages, generalFindings, inspectionStatus, inspectionId, hasFormChanges]);

  // Scroll detection for tab navigation
  useEffect(() => {
    const mainContainer = document.getElementById('inspection-form-container');
    
    if (!mainContainer) return;

    const observerOptions = {
      root: mainContainer, // Watch the scrollable container, not the window
      rootMargin: '-20% 0px -70% 0px', // Trigger when section is 20% from top of viewport
      threshold: [0, 0.1, 0.5, 1]
    };

    const observerCallback = (entries) => {
      // Find the entry with the highest intersection ratio
      let maxRatio = 0;
      let activeEntry = null;

      entries.forEach((entry) => {
        if (entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          activeEntry = entry;
        }
      });

      if (activeEntry && activeEntry.isIntersecting) {
        const sectionId = activeEntry.target.getAttribute('data-section');
        if (sectionId) {
          setActiveSection(sectionId);
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all section refs
    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sectionRefs]);

  // Scroll to section handler - Enhanced for sticky tabs
  const scrollToSection = (sectionId) => {
    const ref = sectionRefs[sectionId];
    
    if (ref && ref.current) {
      // Use scrollIntoView which respects scroll-margin-top CSS
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
      
      // Update active section immediately for better UX
      setActiveSection(sectionId);
    }
  };

  // Determine if form is compliant, non-compliant, or mixed
  const determineOverallCompliance = () => {
    const hasNonCompliantItems = complianceItems.some(item => item.compliant === "No");
    const hasNonCompliantSystems = systems.some(system => system.nonCompliant);
    
    return {
      isCompliant: !hasNonCompliantItems && !hasNonCompliantSystems,
      isNonCompliant: hasNonCompliantItems || hasNonCompliantSystems,
      hasCompliantItems: complianceItems.some(item => item.compliant === "Yes") || systems.some(system => system.compliant === "Yes"),
      hasNonCompliantItems: hasNonCompliantItems || hasNonCompliantSystems
    };
  };

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

    // DENR Permits Validation - At least one permit must be filled
    const selectedLaws = general.environmental_laws || [];
    const permitsForSelectedLaws = permits.filter(p => selectedLaws.includes(p.lawId));
    const hasAtLeastOnePermitFilled = permitsForSelectedLaws.some(
      p => p.permitNumber && p.permitNumber.trim() !== ""
    );
    
    if (selectedLaws.length > 0 && !hasAtLeastOnePermitFilled) {
      errs.permits = "At least one DENR Permit, License, or Clearance is required.";
    }

    // Summary of Compliance Validation - At least one compliance item must be filled
    const complianceItemsForSelectedLaws = complianceItems.filter(item => selectedLaws.includes(item.lawId));
    const hasAtLeastOneComplianceItemFilled = complianceItemsForSelectedLaws.some(
      item => item.compliant && item.compliant.trim() !== ""
    );
    
    if (selectedLaws.length > 0 && complianceItemsForSelectedLaws.length > 0 && !hasAtLeastOneComplianceItemFilled) {
      errs.compliance_items = "At least one compliance item must be evaluated.";
    }

    // Compliance - validate individual items for selected environmental laws
    complianceItems.forEach((c, i) => {
      // Only validate if the compliance item's law is selected
      if (selectedLaws.includes(c.lawId)) {
      if (!c.compliant) errs[`compliant-${i}`] = "Select compliance status.";
      if (c.compliant === "No") {
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
        if (!s.remarks || s.remarks.trim() === "")
          errs[`sysRemarks-${i}`] = "Enter findings summary.";
        }
      }
    });

    // Recommendations - Conditional validation based on compliance status
    const complianceStatus = determineOverallCompliance();
    if (complianceStatus.isNonCompliant) {
      // If non-compliant, at least one recommendation is required
      const hasRecommendation = recommendationState.checked && recommendationState.checked.length > 0;
      if (!hasRecommendation) {
        errs.recommendations = "At least one recommendation is required for non-compliant inspections.";
      }
    }

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
    setHasFormChanges(true);
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
    setHasFormChanges(true);
  };

  /* ======================
     Helper Functions
     ====================== */
  

  const generateViolationsSummary = () => {
    const violations = [];
    
    // Check compliance items for violations
    complianceItems.forEach(item => {
      if (item.compliant === "No") {
        const itemName = item.complianceRequirement || 
                         (item.conditionNumber ? `Condition ${item.conditionNumber}` : '') ||
                         item.applicableLaw ||
                         'Unnamed Item';
        violations.push(`• ${itemName}: ${item.remarksOption || 'Non-compliant'}`);
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
        const itemName = item.complianceRequirement || 
                         (item.conditionNumber ? `Condition ${item.conditionNumber}` : '') ||
                         item.applicableLaw ||
                         'Unnamed Item';
        findings.push(`• ${itemName}: Compliant`);
      });
    }
    
    if (nonCompliantItems.length > 0) {
      findings.push(`Non-Compliant Items (${nonCompliantItems.length}):`);
      nonCompliantItems.forEach(item => {
        const itemName = item.complianceRequirement || 
                         (item.conditionNumber ? `Condition ${item.conditionNumber}` : '') ||
                         item.applicableLaw ||
                         'Unnamed Item';
        findings.push(`• ${itemName}: ${item.remarksOption || 'Non-compliant'}`);
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
  const determineNewStatus = (currentStatus) => {
    // Determine next status based on current status (matching backend logic)
    if (currentStatus === 'MONITORING_IN_PROGRESS') {
      // Monitoring Personnel submits for Unit Head review
      return 'UNIT_REVIEWED';
    } else if (currentStatus === 'UNIT_IN_PROGRESS') {
      // Unit Head submits for Section Chief review
      return 'SECTION_REVIEWED';
    } else if (currentStatus === 'SECTION_IN_PROGRESS') {
      // Section Chief submits for Division Chief review
      return 'DIVISION_REVIEWED';
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
      findingImages,
      generalFindings,
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
      const newStatus = determineNewStatus(currentStatus);
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
        if (newStatus === 'UNIT_REVIEWED') {
          statusMessage = "Inspection saved successfully! Status updated to Unit Reviewed - assigned to Unit Head for review.";
        } else if (newStatus === 'DIVISION_REVIEWED') {
          statusMessage = "Inspection saved successfully! Status updated to Division Reviewed - assigned to Division Chief for review.";
        } else if (newStatus === 'UNIT_COMPLETED_COMPLIANT') {
          statusMessage = "Inspection saved successfully! Status updated to Unit Completed - Compliant.";
        } else if (newStatus === 'UNIT_COMPLETED_NON_COMPLIANT') {
          statusMessage = "Inspection saved successfully! Status updated to Unit Completed - Non-Compliant.";
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
      findingImages,
      generalFindings,
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
      
      // Determine the next level and call appropriate action
      if (userLevel === 'Unit Head' && status === 'UNIT_REVIEWED') {
        nextLevel = 'Section';
        remarks = 'Sent to Section Chief for review';
        successMessage = 'Inspection sent to Section Chief successfully!';
        // Call send to section action
        await sendToSection(inspectionId, { remarks });
      } else if (userLevel === 'Section Chief' && status === 'SECTION_REVIEWED') {
        nextLevel = 'Division';
        remarks = 'Sent to Division Chief for review';
        successMessage = 'Inspection sent to Division Chief successfully!';
        // Call send to division action
        await sendToDivision(inspectionId, { remarks });
      } else if (userLevel === 'Division Chief' && status === 'DIVISION_REVIEWED') {
        nextLevel = 'Legal';
        remarks = 'Forwarded case to Legal Unit';
        successMessage = 'Inspection forwarded to Legal Unit successfully!';
        // Call forward to legal action
        await forwardToLegal(inspectionId, { remarks });
      } else {
        throw new Error('Invalid user level or status for sending to next level');
      }
      
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

  const handleSendNOV = async () => {
    if (!inspectionId) {
      notifications.error("No inspection ID found. Cannot send NOV.", { 
        title: 'Send NOV Failed' 
      });
      return;
    }

    // Show confirmation dialog for NOV
    setActionConfirmation({
      open: true,
      inspection: { id: inspectionId, code: fullInspectionData?.code || 'Unknown' },
      action: 'send_nov'
    });
  };

  const handleSendNOO = async () => {
    if (!inspectionId) {
      notifications.error("No inspection ID found. Cannot send NOO.", { 
        title: 'Send NOO Failed' 
      });
      return;
    }

    // Show confirmation dialog for NOO
    setActionConfirmation({
      open: true,
      inspection: { id: inspectionId, code: fullInspectionData?.code || 'Unknown' },
      action: 'send_noo'
    });
  };

  const handleSaveRecommendation = async () => {
    if (!inspectionId) {
      notifications.error("No inspection ID found. Cannot save recommendation.", { 
        title: 'Save Failed' 
      });
      return;
    }

    try {
      setLoading(true);
      
      // Save the recommendation
      await updateInspection(inspectionId, {
        recommendation: recommendationState
      });
      
      notifications.success("Recommendation saved successfully!", { 
        title: 'Recommendation Saved',
        duration: 4000
      });
      
      // Update last save time
      setLastSaveTime(new Date().toISOString());
    } catch (error) {
      console.error("Failed to save recommendation:", error);
      notifications.error(`Failed to save recommendation: ${error.message}`, { 
        title: 'Save Failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async () => {
    const { inspection, action } = actionConfirmation;
    if (!inspection || !action) return;

    try {
      setLoading(true);
      
      if (action === 'send_nov') {
        await sendNOV(inspection.id, {
          violation_breakdown: generateViolationsSummary(),
          payment_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          penalty_fees: 'To be determined based on violation severity'
        });
        
        setHasActionTaken(true);
        notifications.success("Notice of Violation sent successfully!", { 
          title: 'NOV Sent',
          duration: 6000
        });
      } else if (action === 'send_noo') {
        await sendNOO(inspection.id, {
          violation_breakdown: generateViolationsSummary(),
          payment_deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days from now
          penalty_fees: 'To be determined based on violation severity'
        });
        
        setHasActionTaken(true);
        notifications.success("Notice of Order sent successfully!", { 
          title: 'NOO Sent',
          duration: 6000
        });
      } else if (action === 'mark_compliant') {
        // Execute the onConfirm callback from actionConfirmation
        if (actionConfirmation.onConfirm) {
          await actionConfirmation.onConfirm();
        }
        // Close confirmation dialog
        setActionConfirmation({ open: false, inspection: null, action: null });
        return; // Don't navigate here, onConfirm handles it
      }
      
      // Close confirmation dialog
      setActionConfirmation({ open: false, inspection: null, action: null });
      
      // Navigate back to inspections list
      navigate("/inspections");
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
      notifications.error(`Failed to ${action}: ${error.message}`, { 
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} Failed` 
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
      findingImages,
      generalFindings,
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

  const handleMarkAsCompliant = async () => {
    const complianceStatus = determineComplianceStatus();
    
    if (complianceStatus !== 'COMPLIANT') {
      notifications.warning(
        'Cannot mark as compliant. Please ensure all compliance items and systems are marked as compliant.',
        { title: 'Action Not Allowed' }
      );
      return;
    }
    
    setActionConfirmation({
      open: true,
      inspection: fullInspectionData,
      action: 'mark_compliant',
      message: 'Are you sure you want to mark this inspection as compliant? The inspection will be closed with compliant status.',
      onConfirm: async () => {
        try {
          setLoading(true);
          await closeInspection(inspectionId, {
            remarks: 'Marked as compliant by Division Chief',
            final_status: 'CLOSED'
          });
          notifications.success('Inspection marked as compliant successfully', { title: 'Inspection Closed' });
          navigate("/inspections");
        } catch (error) {
          notifications.error(`Failed to mark as compliant: ${error.message}`, { title: 'Action Failed' });
          setLoading(false);
        }
      }
    });
  };

  const handleClose = async () => {
    const userLevel = currentUser?.userlevel;
    const status = inspectionStatus;

    // Section Chief closing from SECTION_REVIEWED
    if (userLevel === 'Section Chief' && status === 'SECTION_REVIEWED') {
      if (hasFormChanges) {
        // Show confirmation
        setActionConfirmation({
          open: true,
          inspection: fullInspectionData,
          action: 'close_section_review',
          message: 'You have unsaved changes. Do you want to close and send this inspection to Division Chief?',
          onConfirm: async () => {
            try {
              setLoading(true);
              await sendToDivision(inspectionId, {
                remarks: 'Reviewed and closed by Section Chief'
              });
              notifications.success('Inspection sent to Division Chief successfully', { title: 'Review Completed' });
              navigate("/inspections");
            } catch (error) {
              notifications.error(`Failed to close: ${error.message}`, { title: 'Close Failed' });
              setLoading(false);
            }
          }
        });
        return;
      } else {
        // No changes - auto-close
        try {
          setLoading(true);
          await sendToDivision(inspectionId, {
            remarks: 'Reviewed by Section Chief - no changes needed'
          });
          notifications.success('Inspection sent to Division Chief', { title: 'Review Completed' });
          navigate("/inspections");
          return;
        } catch (error) {
          notifications.error(`Failed to close: ${error.message}`, { title: 'Close Failed' });
          setLoading(false);
          return;
        }
      }
    }

    // Division Chief closing from DIVISION_REVIEWED
    if (userLevel === 'Division Chief' && status === 'DIVISION_REVIEWED') {
      const complianceStatus = determineComplianceStatus();
      
      if (hasFormChanges) {
        // Show confirmation
        setActionConfirmation({
          open: true,
          inspection: fullInspectionData,
          action: 'close_division_review',
          message: `You have unsaved changes. Do you want to close this inspection as ${complianceStatus}?`,
          onConfirm: async () => {
            try {
              setLoading(true);
              const newStatus = complianceStatus === 'COMPLIANT' ? 'CLOSED_COMPLIANT' : 'CLOSED_NON_COMPLIANT';
              await closeInspection(inspectionId, {
                remarks: 'Closed by Division Chief',
                final_status: newStatus
              });
              notifications.success(`Inspection closed successfully as ${complianceStatus}`, { title: 'Inspection Closed' });
              navigate("/inspections");
            } catch (error) {
              notifications.error(`Failed to close: ${error.message}`, { title: 'Close Failed' });
              setLoading(false);
            }
          }
        });
        return;
      } else {
        // No changes - auto-finalize
        try {
          setLoading(true);
          const newStatus = complianceStatus === 'COMPLIANT' ? 'CLOSED_COMPLIANT' : 'CLOSED_NON_COMPLIANT';
          await closeInspection(inspectionId, {
            remarks: 'Reviewed by Division Chief - no changes needed',
            final_status: newStatus
          });
          notifications.success(`Inspection closed as ${complianceStatus}`, { title: 'Inspection Closed' });
          navigate("/inspections");
          return;
        } catch (error) {
          notifications.error(`Failed to close: ${error.message}`, { title: 'Close Failed' });
          setLoading(false);
          return;
        }
      }
    }

    // Legal Unit closing from LEGAL_REVIEW
    if (userLevel === 'Legal Unit' && status === 'LEGAL_REVIEW') {
      if (hasActionTaken || hasFormChanges) {
        // Show confirmation if NOV/NOO was sent or changes made
        setActionConfirmation({
          open: true,
          inspection: fullInspectionData,
          action: 'close_legal_review',
          message: 'Do you want to close this legal review? The inspection will be marked as closed.',
          onConfirm: async () => {
            try {
              setLoading(true);
              await closeInspection(inspectionId, {
                remarks: 'Legal review completed',
                final_status: 'CLOSED_NON_COMPLIANT'
              });
              notifications.success('Legal review closed successfully', { title: 'Review Closed' });
              navigate("/inspections");
            } catch (error) {
              notifications.error(`Failed to close: ${error.message}`, { title: 'Close Failed' });
              setLoading(false);
            }
          }
        });
        return;
      } else {
        // No action taken - auto-close
        try {
          setLoading(true);
          await closeInspection(inspectionId, {
            remarks: 'Legal review completed - no action needed',
            final_status: 'CLOSED_NON_COMPLIANT'
          });
          notifications.success('Legal review closed', { title: 'Review Closed' });
          navigate("/inspections");
          return;
        } catch (error) {
          notifications.error(`Failed to close: ${error.message}`, { title: 'Close Failed' });
          setLoading(false);
          return;
        }
      }
    }

    // Default: show regular close confirmation for other cases
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

  // Generate validation status for tabs - only show when user has interacted or saving
  const getValidationStatus = () => {
    const validationStatus = {};
    
    // Only show validation indicators if user has made changes or is saving
    const hasUserInteraction = hasFormChanges || Object.keys(errors).length > 0;
    
    if (!hasUserInteraction) {
      // Return empty status when no user interaction
      return {
        general: { hasErrors: false, isIncomplete: false },
        purpose: { hasErrors: false, isIncomplete: false },
        'compliance-status': { hasErrors: false, isIncomplete: false },
        'summary-compliance': { hasErrors: false, isIncomplete: false },
        findings: { hasErrors: false, isIncomplete: false },
        recommendations: { hasErrors: false, isIncomplete: false }
      };
    }
    
    // Check General Information - only show critical field errors
    const criticalGeneralErrors = [
      'establishment_name', 'environmental_laws', 'inspection_date_time'
    ].some(field => errors[field]);
    validationStatus.general = {
      hasErrors: criticalGeneralErrors,
      isIncomplete: !general.establishment_name || !general.environmental_laws?.length
    };
    
    // Check Purpose of Inspection - only show if no purpose selected
    const purposeErrors = [
      'verify_accuracy', 'determine_compliance', 'investigate_complaints',
      'check_commitment_status', 'other_purpose'
    ].some(field => errors[field]);
    validationStatus.purpose = {
      hasErrors: purposeErrors,
      isIncomplete: !purpose.verify_accuracy && !purpose.determine_compliance && 
                   !purpose.investigate_complaints && !purpose.check_commitment_status && 
                   !purpose.other_purpose
    };
    
    // Check Compliance Status - only show permit errors when user has selected laws
    const complianceErrors = Object.keys(errors).some(key => key.startsWith('permits'));
    validationStatus['compliance-status'] = {
      hasErrors: complianceErrors && general.environmental_laws?.length > 0,
      isIncomplete: false
    };
    
    // Check Summary of Compliance - only show when user has interacted with compliance items
    const summaryErrors = Object.keys(errors).some(key => key.startsWith('remarks-') || key === 'compliance_items');
    validationStatus['summary-compliance'] = {
      hasErrors: summaryErrors,
      isIncomplete: false
    };
    
    // Check Summary of Findings - only show when user has made compliance decisions
    const findingsErrors = Object.keys(errors).some(key => key.startsWith('sysRemarks-') || key.startsWith('systemStatus-'));
    validationStatus.findings = {
      hasErrors: findingsErrors,
      isIncomplete: false
    };
    
    // Check Recommendations - only show when non-compliant and user should add recommendations
    const recommendationsErrors = Object.keys(errors).some(key => key.startsWith('recommendation-'));
    const complianceStatus = determineOverallCompliance();
    validationStatus.recommendations = {
      hasErrors: recommendationsErrors,
      isIncomplete: complianceStatus.isNonCompliant && 
                   !recommendationState.recommendations?.length &&
                   (complianceItems.some(item => item.compliant === "No") || hasUserInteraction)
    };
    
    return validationStatus;
  };

  /* ======================
     Render
     ====================== */
    return (
      <LayoutForm
        inspectionHeader={
          <UnifiedInspectionHeader
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
            onSendNOV={handleSendNOV}
            onSendNOO={handleSendNOO}
            onSaveRecommendation={handleSaveRecommendation}
            onMarkAsCompliant={handleMarkAsCompliant}
            lastSaveTime={lastSaveTime}
            autoSaveStatus={autoSaveStatus}
            showCompleteButton={buttonVisibility.showCompleteButton}
            showSubmitForReviewButton={buttonVisibility.showSubmitForReviewButton}
            showSendToSectionButton={buttonVisibility.showSendToSectionButton}
            showSendToDivisionButton={buttonVisibility.showSendToDivisionButton}
            showSendToNextLevelButton={buttonVisibility.showSendToNextLevelButton}
            nextLevelName={buttonVisibility.getNextLevelName()}
            showFinalizeButton={buttonVisibility.showFinalizeButton}
            showReviewButton={buttonVisibility.showReviewButton}
            showForwardToLegalButton={buttonVisibility.showForwardToLegalButton}
            showSendNOVButton={buttonVisibility.showSendNOVButton}
            showSendNOOButton={buttonVisibility.showSendNOOButton}
            showSaveRecommendationButton={buttonVisibility.showSaveRecommendationButton}
            showMarkAsCompliantButton={buttonVisibility.showMarkAsCompliantButton}
            showDraftButton={buttonVisibility.showDraftButton}
            showSubmitButton={buttonVisibility.showSubmitButton}
            showCloseButton={buttonVisibility.showCloseButton}
            isDraft={fullInspectionData?.form?.checklist?.is_draft || false}
            activeSection={activeSection}
            onTabClick={scrollToSection}
            validationStatus={getValidationStatus()}
          />
        }
        rightSidebar={
          fullInspectionData && (
            <InspectionPolygonMap 
              inspectionData={fullInspectionData}
              currentUser={currentUser}
            />
          )
        }
      >
        <div className="w-full bg-gray-50">

        {/* Validation Summary - Only show when user has made changes and there are errors */}
        {hasFormChanges && Object.keys(errors).length > 0 && (
          <ValidationSummary 
            errors={errors} 
            onScrollToSection={scrollToSection}
          />
        )}
            
        <GeneralInformation
          ref={sectionRefs.general}
          data={general}
          setData={(newData) => {
            setGeneral(newData);
            setHasFormChanges(true);
          }}
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
          ref={sectionRefs.purpose}
          state={purpose}
          setState={(newState) => {
            setPurpose(newState);
            setHasFormChanges(true);
          }}
          errors={errors}
          isReadOnly={buttonVisibility.isReadOnly}
        />

        {lawFilter.length > 0 && (
          <>
            <ComplianceStatus
              ref={sectionRefs['compliance-status']}
              permits={permits}
              setPermits={setPermits}
              lawFilter={lawFilter}
              errors={errors}
              isReadOnly={buttonVisibility.isReadOnly}
            />
            <SummaryOfCompliance
              ref={sectionRefs['summary-compliance']}
              items={complianceItems}
              setItems={(newItems) => {
                setComplianceItems(newItems);
                setHasFormChanges(true);
              }}
              lawFilter={lawFilter}
              errors={errors}
              isReadOnly={buttonVisibility.isReadOnly}
              systems={systems}
              setSystems={(newSystems) => {
                setSystems(newSystems);
                setHasFormChanges(true);
              }}
              onComplianceChange={(updatedItems) => {
                // This callback triggers when compliance changes
                // Used to update recommendations visibility
                console.log('🔄 Compliance changed, checking recommendations visibility');
              }}
              showSyncNotification={(message, type) => {
                // Show toast notification for auto-sync
                notifications.info(message, {
                  title: '🔄 Auto-Sync',
                  duration: 3000
                });
              }}
            />
            <SummaryOfFindingsAndObservations
              ref={sectionRefs.findings}
              systems={systems}
              setSystems={(newSystems) => {
                setSystems(newSystems);
                setHasFormChanges(true);
              }}
              lawFilter={lawFilter}
              errors={errors}
              isReadOnly={buttonVisibility.isReadOnly}
              findingImages={findingImages}
              setFindingImages={(newImages) => {
                setFindingImages(newImages);
                setHasFormChanges(true);
              }}
              generalFindings={generalFindings}
              setGeneralFindings={(newGeneralFindings) => {
                setGeneralFindings(newGeneralFindings);
                setHasFormChanges(true);
              }}
              onUploadFinding={async (systemId, imagesToUpload) => {
                // Upload handler with actual API integration
                console.log('Uploading images for system:', systemId, imagesToUpload);
                
                try {
                  for (const image of imagesToUpload) {
                    // Update progress to show uploading
                    const updateProgress = (progress) => {
                      if (systemId === 'general') {
                        setGeneralFindings(prev => prev.map(img => 
                          img.id === image.id ? { ...img, uploadProgress: progress } : img
                        ));
                      } else {
                        setFindingImages(prev => ({
                          ...prev,
                          [systemId]: (prev[systemId] || []).map(img =>
                            img.id === image.id ? { ...img, uploadProgress: progress } : img
                          )
                        }));
                      }
                    };

                    updateProgress(30);

                    // Upload to backend
                    const findingType = systemId === 'general' ? 'general' : 'individual';
                    const response = await uploadFindingDocument(
                      inspectionId,
                      systemId,
                      image.file,
                      image.caption || '',
                      findingType
                    );

                    updateProgress(100);

                    // Update with backend URL and mark as uploaded
                    if (systemId === 'general') {
                      setGeneralFindings(prev => prev.map(img => 
                        img.id === image.id 
                          ? { ...img, uploaded: true, uploadProgress: 100, backendId: response.id, url: response.file_url || img.url }
                          : img
                      ));
                    } else {
                      setFindingImages(prev => ({
                        ...prev,
                        [systemId]: (prev[systemId] || []).map(img =>
                          img.id === image.id 
                            ? { ...img, uploaded: true, uploadProgress: 100, backendId: response.id, url: response.file_url || img.url }
                            : img
                        )
                      }));
                    }

                    console.log('✅ Image uploaded successfully:', response);
                  }
                  
                  notifications.success('Documents uploaded successfully!', {
                    title: 'Upload Complete'
                  });
                } catch (error) {
                  console.error('Upload failed:', error);
                  
                  // Mark images as failed
                  imagesToUpload.forEach(image => {
                    if (systemId === 'general') {
                      setGeneralFindings(prev => prev.map(img => 
                        img.id === image.id ? { ...img, error: error.message, uploadProgress: 0 } : img
                      ));
                    } else {
                      setFindingImages(prev => ({
                        ...prev,
                        [systemId]: (prev[systemId] || []).map(img =>
                          img.id === image.id ? { ...img, error: error.message, uploadProgress: 0 } : img
                        )
                      }));
                    }
                  });
                  
                  notifications.error(`Upload failed: ${error.message}`, {
                    title: 'Upload Error'
                  });
                }
              }}
            />
          </>
        )}

        {/* Conditionally display Recommendations based on compliance status */}
        {(() => {
          const complianceStatus = determineOverallCompliance();
          // Show recommendations only if non-compliant
          if (complianceStatus.isNonCompliant) {
            return (
              <Recommendations
                ref={sectionRefs.recommendations}
                recState={recommendationState}
                setRecState={(newState) => {
                  setRecommendationState(newState);
                  setHasFormChanges(true);
                }}
                errors={errors}
                isReadOnly={buttonVisibility.isReadOnly}
                canEditRecommendation={buttonVisibility.canEditRecommendation}
              />
            );
          }
          // If compliant, hide recommendations section
          return null;
        })()}
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

    {/* Action Confirmation Dialog */}
    <ConfirmationDialog
      open={actionConfirmation.open}
      title={
        actionConfirmation.action === 'send_nov' 
          ? 'Send Notice of Violation' 
          : actionConfirmation.action === 'send_noo'
          ? 'Send Notice of Order'
          : actionConfirmation.action === 'mark_compliant'
          ? 'Mark as Compliant'
          : 'Confirm Action'
      }
      message={
        actionConfirmation.message || (
          <div>
            <p className="mb-2">
              {actionConfirmation.action === 'send_nov' 
                ? `Are you sure you want to send Notice of Violation for inspection ${actionConfirmation.inspection?.code}?`
                : actionConfirmation.action === 'send_noo'
                ? `Are you sure you want to send Notice of Order for inspection ${actionConfirmation.inspection?.code}?`
                : 'Are you sure you want to proceed with this action?'
              }
            </p>
            <p className="text-sm text-gray-600">
              {actionConfirmation.action === 'send_nov' 
                ? 'This will send a Notice of Violation to the establishment with a 30-day compliance deadline.'
                : actionConfirmation.action === 'send_noo'
                ? 'This will send a Notice of Order to the establishment with a 60-day compliance deadline.'
                : ''
              }
            </p>
          </div>
        )
      }
      confirmText={
        actionConfirmation.action === 'send_nov' 
          ? 'Send NOV' 
          : actionConfirmation.action === 'send_noo'
          ? 'Send NOO'
          : 'Confirm'
      }
      cancelText="Cancel"
      confirmColor="red"
      size="md"
      loading={loading}
      onCancel={() => setActionConfirmation({ open: false, inspection: null, action: null })}
      onConfirm={executeAction}
    />

    </LayoutForm>
  );
}
