import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as InspectionConstants from "../../constants/inspectionform/index";
import LayoutForm from "../LayoutForm";

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
  const storageKey = `inspection-form-${inspectionData?.id || "draft"}`;

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
      establishmentName: "",
      address: "",
      coordinates: "",
      natureOfBusiness: "",
      yearEstablished: "",
      inspectionDateTime: "",
      environmentalLaws: [],
      operatingHours: "",
      operatingDaysPerWeek: "",
      operatingDaysPerYear: "",
      phoneFaxNo: "",
      emailAddress: "",
    }
  );

  const [purpose, setPurpose] = useState(
    savedData?.purpose || {
      purposes: [],
      accuracyDetails: [],
      commitmentStatusDetails: [],
      otherPurpose: "",
      accuracyOtherDetail: "",
      commitmentOtherDetail: "",
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

  // Auto-save
  useEffect(() => {
    const saveData = {
      general,
      purpose,
      permits,
      complianceItems,
      systems,
      recommendationState,
      lawFilter,
      lastSaved: new Date().toISOString(),
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(saveData));
      setLastSaveTime(new Date().toISOString());
    } catch (e) {
      console.error("auto-save error", e);
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

  // Prefill law filter from inspectionData
  useEffect(() => {
    if (inspectionData?.section) {
      setLawFilter([inspectionData.section]);
    }
  }, [inspectionData]);

  /* ======================
     Validation
     ====================== */
  const validateForm = () => {
    const errs = {};

    // General Info
    if (!general.establishmentName)
      errs.establishmentName = "Establishment name is required.";
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
    if (!general.natureOfBusiness) {
      errs.natureOfBusiness = "Nature of Business is required.";
    }

    if (general.yearEstablished) {
      if (!/^\d{4}$/.test(general.yearEstablished)) {
        errs.yearEstablished = "Enter a 4-digit year.";
      } else if (Number(general.yearEstablished) > new Date().getFullYear()) {
        errs.yearEstablished = "Year cannot be in the future.";
      }
    } else {
      errs.yearEstablished = "Year established is required.";
    }

    // Operating Hours (required and must be 1–24)
    if (!general.operatingHours) {
      errs.operatingHours = "Operating Hours is required.";
      } else if (general.operatingHours < 1 || general.operatingHours > 24) {
      errs.operatingHours = "Operating Hours must be between 1 and 24.";
    }

    // Operating Days/Week (now required and must be 1–7)
    if (!general.operatingDaysPerWeek) {
      errs.operatingDaysPerWeek = "Operating Days/Week is required.";
    } else if (general.operatingDaysPerWeek < 1 || general.operatingDaysPerWeek > 7) {
      errs.operatingDaysPerWeek = "Operating Days/Week must be between 1 and 7.";
    }

    // Operating Days/Year (now required and must be 1–365)
    if (!general.operatingDaysPerYear) {
      errs.operatingDaysPerYear = "Operating Days/Year is required.";
    } else if (general.operatingDaysPerYear < 1 || general.operatingDaysPerYear > 365) {
      errs.operatingDaysPerYear = "Operating Days/Year must be between 1 and 365.";
    }

    // Phone/Fax No. (now required)
    if (!general.phoneFaxNo) {
      errs.phoneFaxNo = "Phone/Fax No. is required.";
    }

    // Email Address (now required)
    if (!general.emailAddress) {
      errs.emailAddress = "Email Address is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(general.emailAddress))
        errs.emailAddress = "Enter a valid email.";
    }

    if (general.inspectionDateTime) {
      const inspDate = new Date(general.inspectionDateTime);
      if (isNaN(inspDate.getTime())) {
        errs.inspectionDateTime = "Invalid inspection date/time.";
      } else if (inspDate < new Date()) {
        errs.inspectionDateTime = "Inspection date/time cannot be in the past.";
      }
    } else {
      errs.inspectionDateTime = "Inspection date/time is required.";
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

  /* ======================
     Handlers
     ====================== */
  const handleSave = () => {
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      alert("Please fix errors before saving.");
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
    } catch (e) {
      console.error("clear draft error", e);
    }
    
    // Navigate back to inspections list after successful save
    navigate("/inspections");
  };

  const handleClose = () => {
    const keep = confirm("Keep your draft?");
    if (!keep) localStorage.removeItem(storageKey);
    
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
            onClose={handleClose}
            lastSaveTime={lastSaveTime}
            isOnline={isOnline}
          />

          <div className="p-4">
        <GeneralInformation
          data={general}
          setData={setGeneral}
          onLawFilterChange={setLawFilter}
          inspectionData={inspectionData}
          errors={errors}
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
    </LayoutForm>
  );
}
