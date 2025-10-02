import { useState, useRef, useEffect, useCallback } from "react";
import { 
  X, 
  Search, 
  Filter, 
  CheckSquare, 
  Square, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Building2,
  MapPin,
  Calendar,
  FileText,
  ArrowRight,
  ArrowLeft,
  Loader2
} from "lucide-react";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { createInspection } from "../../services/api";

export default function InspectionWizard({
  establishments,
  onCancel,
  onSave,
  getLastInspectionLaw,
  existingInspections,
  userLevel,
}) {
  const [step, setStep] = useState(1);
  const [selectedEstablishments, setSelectedEstablishments] = useState([]);
  const [selectedLaw, setSelectedLaw] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterByBusiness, setFilterByBusiness] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [validationErrors, setValidationErrors] = useState({});
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [routingInfo, setRoutingInfo] = useState(null);
  const wizardRef = useRef(null);

  // Auto-save functionality
  useEffect(() => {
    const saveProgress = () => {
      const progressData = {
        step,
        selectedEstablishments,
        selectedLaw,
        searchQuery,
        filterByBusiness,
        sortBy,
        sortOrder,
        timestamp: new Date().toISOString()
      };
      
      try {
        localStorage.setItem('inspection-wizard-progress', JSON.stringify(progressData));
        setLastSaved(new Date());
      } catch (error) {
        console.warn('Failed to save wizard progress:', error);
      }
    };

    // Save progress when key data changes
    const timeoutId = setTimeout(saveProgress, 1000);
    return () => clearTimeout(timeoutId);
  }, [step, selectedEstablishments, selectedLaw, searchQuery, filterByBusiness, sortBy, sortOrder]);

  // Load saved progress on mount
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem('inspection-wizard-progress');
      if (savedProgress) {
        const progressData = JSON.parse(savedProgress);
        
        // Only restore if saved within last 24 hours
        const savedTime = new Date(progressData.timestamp);
        const now = new Date();
        const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          setStep(progressData.step || 1);
          setSelectedEstablishments(progressData.selectedEstablishments || []);
          setSelectedLaw(progressData.selectedLaw || "");
          setSearchQuery(progressData.searchQuery || "");
          setFilterByBusiness(progressData.filterByBusiness || "");
          setSortBy(progressData.sortBy || "name");
          setSortOrder(progressData.sortOrder || "asc");
          setLastSaved(savedTime);
        }
      }
    } catch (error) {
      console.warn('Failed to load wizard progress:', error);
    }
  }, []);

  // Get IDs of establishments that already have inspections
  const alreadyInspectedIds = existingInspections.map(
    (insp) => insp.establishmentId
  );

  // Filter and sort establishments
  const availableEstablishments = establishments
    .filter((e) => !alreadyInspectedIds.includes(e.id))
    .filter((e) => {
      const matchesSearch = !searchQuery || 
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.natureOfBusiness.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.address.barangay.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesBusinessFilter = !filterByBusiness || 
        e.natureOfBusiness.toLowerCase().includes(filterByBusiness.toLowerCase());
      
      return matchesSearch && matchesBusinessFilter;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "business":
          aValue = a.natureOfBusiness.toLowerCase();
          bValue = b.natureOfBusiness.toLowerCase();
          break;
        case "city":
          aValue = a.address.city.toLowerCase();
          bValue = b.address.city.toLowerCase();
          break;
        case "lastInspection":
          aValue = getLastInspectionLaw(a.id) || "";
          bValue = getLastInspectionLaw(b.id) || "";
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Validation functions
  const validateStep = useCallback((stepNumber) => {
    const errors = {};
    
    if (stepNumber === 1) {
      if (selectedEstablishments.length === 0) {
        errors.establishments = "Please select at least one establishment";
      } else if (selectedEstablishments.length > 50) {
        errors.establishments = "Cannot select more than 50 establishments at once";
      }
    }
    
    if (stepNumber === 2) {
      if (!selectedLaw) {
        errors.law = "Please select an environmental law";
      }
      
      // Check for potential conflicts
      const conflictingEstablishments = selectedEstablishments.filter(id => {
        const lastLaw = getLastInspectionLaw(id);
        return lastLaw && lastLaw !== selectedLaw;
      });
      
      if (conflictingEstablishments.length > 0) {
        errors.lawConflict = `Some establishments have different previous inspection laws. This may cause confusion in the workflow.`;
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [selectedEstablishments, selectedLaw, getLastInspectionLaw]);

  // Add this effect to handle clicks outside the confirmation dialog and keyboard navigation
  useEffect(() => {
    function handleClickOutside(e) {
      if (wizardRef.current && !wizardRef.current.contains(e.target)) {
        setShowConfirm(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (showConfirm) {
          setShowConfirm(false);
        } else {
          onCancel();
        }
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        // Ctrl/Cmd + Enter to proceed to next step or create inspections
        e.preventDefault();
        if (step < 3) {
          if (validateStep(step)) {
            setShowValidationSummary(false);
            setStep(step + 1);
          } else {
            setShowValidationSummary(true);
          }
        } else {
          setShowConfirm(true);
        }
      }
    }

    if (showConfirm) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showConfirm, step, validateStep, onCancel]);

  const toggleSelect = (id) => {
    setSelectedEstablishments((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Function to remove an establishment from selection
  const removeEstablishment = (id) => {
    setSelectedEstablishments((prev) => prev.filter((x) => x !== id));
  };

  // Bulk selection functions
  const selectAll = () => {
    setSelectedEstablishments(availableEstablishments.map(e => e.id));
  };

  const clearAll = () => {
    setSelectedEstablishments([]);
  };

  // Unused function - kept for future bulk selection by business type feature
  // const selectByBusinessType = (businessType) => {
  //   const matchingIds = availableEstablishments
  //     .filter(e => e.natureOfBusiness.toLowerCase().includes(businessType.toLowerCase()))
  //     .map(e => e.id);
  //   setSelectedEstablishments(prev => [...new Set([...prev, ...matchingIds])]);
  // };

  const clearValidationErrors = () => {
    setValidationErrors({});
    setShowValidationSummary(false);
  };

  const clearSavedProgress = () => {
    try {
      localStorage.removeItem('inspection-wizard-progress');
      setLastSaved(null);
    } catch (error) {
      console.warn('Failed to clear wizard progress:', error);
    }
  };

  // Get the most common law from previous inspections for guidance
  const getSuggestedLaw = () => {
    if (selectedEstablishments.length === 0) return "";

    const lawCounts = {};
    selectedEstablishments.forEach((id) => {
      const lastLaw = getLastInspectionLaw(id);
      if (lastLaw) {
        lawCounts[lastLaw] = (lawCounts[lastLaw] || 0) + 1;
      }
    });

    // Return the most common law
    return (
      Object.keys(lawCounts).sort((a, b) => lawCounts[b] - lawCounts[a])[0] ||
      ""
    );
  };

  const handleSave = async () => {
    if (selectedEstablishments.length === 0 || !selectedLaw) {
      alert("Please select at least one establishment and a law.");
      return;
    }

    setIsCreating(true);
    try {
      console.log("Starting inspection creation...");
      console.log("Selected establishments:", selectedEstablishments);
      console.log("Selected law:", selectedLaw);

      const newInspections = [];

      // Create only ONE inspection per establishment
      for (const establishmentId of selectedEstablishments) {
        console.log(
          `Creating inspection for establishment: ${establishmentId}`
        );

        // Create inspection payload - backend will handle auto-assignment and code generation
        const inspectionData = {
          establishment: establishmentId,
          section: selectedLaw,
          // Let backend handle district derivation and auto-assignment
        };

        console.log("Inspection payload:", inspectionData);

        // Call API to create inspection - ONLY ONCE
        const createdInspection = await createInspection(inspectionData);
        console.log("Created inspection:", createdInspection);

        newInspections.push(createdInspection);
        
        // Store routing info from the first inspection (they should all be the same)
        if (newInspections.length === 1 && createdInspection.routing_info) {
          setRoutingInfo(createdInspection.routing_info);
        }
      }

      console.log("All inspections created:", newInspections);
      await onSave(newInspections);
      clearSavedProgress(); // Clear saved progress on successful completion
      setShowConfirm(false);
    } catch (error) {
      console.error("Failed to create inspections:", error);
      alert(
        `Failed to create inspections: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div
      className="w-full p-4 pb-0 overflow-y-auto bg-white flex flex-col min-h-[80vh]"
      ref={wizardRef}
      role="main"
      aria-label="Inspection Creation Wizard"
    >
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-lg mb-6 border border-sky-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-sky-800">
                New Inspection Wizard
              </h2>
              <p className="text-sm text-sky-600">
                Step {step} of 3: {step === 1 ? "Select Establishments" : step === 2 ? "Choose Law" : "Review & Create"}
              </p>
              {lastSaved && (
                <p className="text-xs text-gray-500 mt-1">
                  Progress saved: {lastSaved.toLocaleTimeString()}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Press Ctrl+Enter to proceed • Escape to cancel
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isCreating}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            <button
              onClick={() => {
                clearSavedProgress();
                onCancel();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCreating}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>

            {step < 3 ? (
              <button
                onClick={() => {
                  if (validateStep(step)) {
                    setShowValidationSummary(false);
                    setStep(step + 1);
                  } else {
                    setShowValidationSummary(true);
                  }
                }}
                disabled={isCreating}
                className="flex items-center gap-2 px-4 py-2 text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step === 2 ? "Review" : "Next"}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={isCreating}
                className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Create Inspections
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Progress Indicator */}
        <div className="flex items-center gap-4" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3} aria-label={`Step ${step} of 3`}>
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= stepNumber
                    ? "bg-sky-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
                aria-label={`Step ${stepNumber}: ${stepNumber === 1 ? "Select Establishments" : stepNumber === 2 ? "Configure Law" : "Review & Create"}`}
              >
                {stepNumber}
              </div>
              <div className="text-sm text-gray-600">
                {stepNumber === 1 ? "Select" : stepNumber === 2 ? "Configure" : "Review"}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`w-8 h-0.5 mx-2 transition-colors ${
                    step > stepNumber ? "bg-sky-600" : "bg-gray-300"
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Validation Summary */}
      {showValidationSummary && Object.keys(validationErrors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-medium text-red-800">Please fix the following issues:</h4>
          </div>
          <ul className="space-y-2 text-sm text-red-700">
            {Object.entries(validationErrors).map(([key, message]) => (
              <li key={key} className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{message}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={clearValidationErrors}
            className="mt-3 px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step 1: Select establishments */}
      {step === 1 && (
        <div className="flex-grow space-y-6">
          {/* Selection Summary */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    {selectedEstablishments.length} of {availableEstablishments.length} establishments selected
                  </span>
                </div>
                {selectedEstablishments.length > 0 && (
                  <div className="text-sm text-blue-600">
                    {Math.round((selectedEstablishments.length / availableEstablishments.length) * 100)}% selected
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  disabled={availableEstablishments.length === 0 || isCreating}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={clearAll}
                  disabled={selectedEstablishments.length === 0 || isCreating}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search establishments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                disabled={isCreating}
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filterByBusiness}
                onChange={(e) => setFilterByBusiness(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors appearance-none bg-white"
                disabled={isCreating}
              >
                <option value="">All Business Types</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="service">Service</option>
                <option value="retail">Retail</option>
                <option value="construction">Construction</option>
                <option value="agriculture">Agriculture</option>
              </select>
            </div>

            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                disabled={isCreating}
              >
                <option value="name">Sort by Name</option>
                <option value="business">Sort by Business</option>
                <option value="city">Sort by City</option>
                <option value="lastInspection">Sort by Last Inspection</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isCreating}
                title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          {/* Establishments Table */}
          {availableEstablishments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {searchQuery || filterByBusiness ? "No establishments found" : "All establishments have been added to inspections"}
              </h3>
              <p className="text-gray-500">
                {searchQuery || filterByBusiness 
                  ? "Try adjusting your search or filter criteria"
                  : "All available establishments are already included in existing inspections"
                }
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-sky-700 text-white">
                  <tr className="text-sm">
                    <th className="w-12 px-4 py-3 text-left border-r border-sky-600">
                      <input
                        type="checkbox"
                        checked={selectedEstablishments.length === availableEstablishments.length && availableEstablishments.length > 0}
                        onChange={() => selectedEstablishments.length === availableEstablishments.length ? clearAll() : selectAll()}
                        className="cursor-pointer"
                        disabled={isCreating}
                      />
                    </th>
                    <th className="px-4 py-3 text-left border-r border-sky-600">Establishment</th>
                    <th className="px-4 py-3 text-left border-r border-sky-600">Business Type</th>
                    <th className="px-4 py-3 text-left border-r border-sky-600">Location</th>
                    <th className="px-4 py-3 text-center">Last Inspection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {availableEstablishments.map((e) => (
                    <tr
                      key={e.id}
                      className={`text-sm transition-colors hover:bg-gray-50 ${
                        selectedEstablishments.includes(e.id) ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedEstablishments.includes(e.id)}
                          onChange={() => toggleSelect(e.id)}
                          className="cursor-pointer"
                          disabled={isCreating}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{e.name}</div>
                        <div className="text-xs text-gray-500">ID: {e.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {e.natureOfBusiness}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs">
                            {e.address.city}, {e.address.province}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getLastInspectionLaw(e.id) ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            {getLastInspectionLaw(e.id)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select law for all establishments */}
      {step === 2 && (
        <div className="grid flex-grow grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column - Selected Establishments (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-800">Selected Establishments ({selectedEstablishments.length})</h4>
              </div>
              <p className="text-sm text-green-700">
                These establishments will be included in the inspection batch
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-sky-700 text-white sticky top-0">
                    <tr className="text-sm">
                      <th className="px-4 py-3 text-left border-r border-sky-600">Establishment</th>
                      <th className="px-4 py-3 text-left border-r border-sky-600">Location</th>
                      <th className="px-4 py-3 text-center border-r border-sky-600">Coordinates</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {establishments
                      .filter((e) => selectedEstablishments.includes(e.id))
                      .map((e) => (
                        <tr key={e.id} className="text-sm hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900">{e.name}</div>
                            <div className="text-xs text-gray-500">{e.natureOfBusiness}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-gray-600">
                              <MapPin className="w-3 h-3" />
                              <span className="text-xs">
                                {e.address.city}, {e.address.province}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-gray-500">
                            {e.coordinates.latitude && e.coordinates.longitude ? (
                              `${e.coordinates.latitude}, ${e.coordinates.longitude}`
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => removeEstablishment(e.id)}
                              className="flex items-center justify-center gap-1 px-2 py-1 text-xs text-red-600 rounded hover:bg-red-100 transition-colors"
                              title="Remove establishment"
                              disabled={isCreating}
                            >
                              <X size={12} />
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right column - Law selection (1/3 width) */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-sky-600" />
                <h3 className="font-medium text-gray-900">Environmental Law Selection</h3>
              </div>

              <div className="p-4 mb-6 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Important</span>
                </div>
                <p className="text-sm text-blue-700">
                  The same law will be applied to all <strong>{selectedEstablishments.length}</strong> selected establishments.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Select Environmental Law
                  </label>
                  <select
                    value={selectedLaw}
                    onChange={(e) => {
                      setSelectedLaw(e.target.value);
                      clearValidationErrors();
                    }}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors ${
                      validationErrors.law ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    disabled={isCreating}
                  >
                    <option value="">-- Choose Law --</option>
                    <option value="PD-1586">
                      PD-1586 (Environmental Impact Assessment)
                    </option>
                    <option value="RA-6969">
                      RA-6969 (Toxic Substances and Hazardous Waste)
                    </option>
                    <option value="RA-8749">RA-8749 (Clean Air Act)</option>
                    <option value="RA-9275">RA-9275 (Clean Water Act)</option>
                    <option value="RA-9003">
                      RA-9003 (Ecological Solid Waste Management)
                    </option>
                  </select>
                  {validationErrors.law && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.law}
                    </p>
                  )}
                </div>

                {/* Law Conflict Warning */}
                {validationErrors.lawConflict && (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Potential Conflict</span>
                    </div>
                    <p className="text-sm text-orange-700">{validationErrors.lawConflict}</p>
                  </div>
                )}

                {/* Smart Suggestions */}
                {!selectedLaw && getSuggestedLaw() && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Smart Suggestion</span>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      Based on previous inspections of selected establishments:
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedLaw(getSuggestedLaw())}
                      className="w-full px-3 py-2 text-sm font-medium text-yellow-800 bg-yellow-100 rounded hover:bg-yellow-200 transition-colors border border-yellow-300"
                      disabled={isCreating}
                    >
                      Use {getSuggestedLaw()}
                    </button>
                  </div>
                )}

                {/* Law Description */}
                {selectedLaw && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Law Details</h4>
                    <p className="text-sm text-gray-600">
                      {selectedLaw === "PD-1586" && "Environmental Impact Assessment System - requires ECC for environmentally critical projects"}
                      {selectedLaw === "RA-6969" && "Toxic Substances and Hazardous Waste Management - regulates hazardous materials"}
                      {selectedLaw === "RA-8749" && "Clean Air Act - controls air pollution and emissions"}
                      {selectedLaw === "RA-9275" && "Clean Water Act - protects water quality and resources"}
                      {selectedLaw === "RA-9003" && "Ecological Solid Waste Management - promotes proper waste disposal"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="flex-grow space-y-6">
          {/* Summary Card */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-600 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-800">Review & Confirm</h3>
                <p className="text-sm text-green-600">Review your inspection configuration before creating</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Establishments</span>
                </div>
                <div className="text-2xl font-bold text-green-700">{selectedEstablishments.length}</div>
                <div className="text-xs text-green-600">Selected for inspection</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Environmental Law</span>
                </div>
                <div className="text-lg font-bold text-green-700">{selectedLaw}</div>
                <div className="text-xs text-green-600">Applied to all inspections</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Initial Status</span>
                </div>
                <div className="text-lg font-bold text-green-700">
                  {userLevel === "Legal Unit" ? "LEGAL_REVIEW" : "PENDING"}
                </div>
                <div className="text-xs text-green-600">Workflow assignment</div>
              </div>
            </div>
          </div>

          {/* Detailed Review Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h4 className="font-medium text-gray-900">Inspection Details Preview</h4>
              <p className="text-sm text-gray-600 mt-1">
                Each establishment will receive a separate inspection record
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sky-700 text-white">
                  <tr className="text-sm">
                    <th className="px-4 py-3 text-left border-r border-sky-600">Establishment</th>
                    <th className="px-4 py-3 text-left border-r border-sky-600">Business Type</th>
                    <th className="px-4 py-3 text-left border-r border-sky-600">Location</th>
                    <th className="px-4 py-3 text-center border-r border-sky-600">Law</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {establishments
                    .filter((e) => selectedEstablishments.includes(e.id))
                    .map((e) => (
                      <tr key={e.id} className="text-sm hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{e.name}</div>
                          <div className="text-xs text-gray-500">ID: {e.id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {e.natureOfBusiness}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs">
                              {e.address.city}, {e.address.province}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {selectedLaw}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            userLevel === "Legal Unit" 
                              ? "bg-yellow-100 text-yellow-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {userLevel === "Legal Unit" ? "LEGAL_REVIEW" : "PENDING"}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Workflow Information */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Workflow Information</span>
            </div>
            <p className="text-sm text-blue-700 mb-2">
              Inspections will be automatically assigned based on your user level and workflow rules:
            </p>
            <ul className="text-sm text-blue-700 space-y-1 ml-4">
              <li>• Inspections will be created with appropriate initial status</li>
              <li>• Automatic assignment to relevant personnel based on workflow</li>
              <li>• District assignment based on establishment location</li>
              <li>• Unique inspection codes will be generated automatically</li>
            </ul>
          </div>
        </div>
      )}

      {/* Enhanced Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirm}
        title="Confirm Inspection Creation"
        message={
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Review Before Creating</span>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 mb-2">
                You are about to create <strong>{selectedEstablishments.length} inspection(s)</strong> with the following configuration:
              </p>
              <div className="space-y-1 text-sm text-blue-700">
                <div>• Environmental Law: <strong>{selectedLaw}</strong></div>
                <div>• Initial Status: <strong>{userLevel === "Legal Unit" ? "LEGAL_REVIEW" : "PENDING"}</strong></div>
                <div>• Automatic workflow assignment will be applied</div>
                <div>• Unique inspection codes will be generated</div>
              </div>
            </div>
            
            {/* District-Based Routing Information for Division Chief */}
            {userLevel === "Division Chief" && (
              <div className="bg-sky-50 p-4 rounded-lg border border-sky-200">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  <span className="font-medium text-sky-900">District-Based Automatic Routing</span>
                </div>
                <div className="text-sm text-sky-700 space-y-2">
                  <div className="bg-white p-3 rounded border border-sky-100">
                    <div className="font-medium text-sky-800 mb-1">📍 Location-Based Assignment</div>
                    <div>• District determined from establishment location (province + city)</div>
                    <div>• Personnel assigned from the same district as the establishment</div>
                  </div>
                  <div className="bg-white p-3 rounded border border-sky-100">
                    <div className="font-medium text-sky-800 mb-1">👥 Personnel Assignment</div>
                    <div>• <strong>Section Chief:</strong> Assigned based on law + district</div>
                    <div>• <strong>Unit Head:</strong> Assigned for EIA/Air/Water laws + district</div>
                    <div>• <strong>Monitoring Personnel:</strong> Assigned based on law + district</div>
                  </div>
                  <div className="bg-white p-3 rounded border border-sky-100">
                    <div className="font-medium text-sky-800 mb-1">🔄 Workflow Process</div>
                    <div className="space-y-1">
                      <div>• <strong>General Laws (EIA/Air/Water):</strong> Division Chief → Section Chief → Unit Head → Monitoring Personnel</div>
                      <div>• <strong>Toxic & Solid Waste (RA-6969/RA-9003):</strong> Division Chief → Section Chief → Monitoring Personnel (bypasses unit)</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <p className="text-sm text-gray-600">
              This action cannot be undone. Are you sure you want to proceed?
            </p>
          </div>
        }
        loading={isCreating}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleSave}
        confirmText={isCreating ? "Creating Inspections..." : "Create Inspections"}
      />
    </div>
  );
}
