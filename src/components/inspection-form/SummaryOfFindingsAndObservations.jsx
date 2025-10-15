import React, { useMemo, forwardRef, useState } from "react";
import * as InspectionConstants from "../../constants/inspectionform/index";
import { formatInput } from "./utils";
import SectionHeader from "./SectionHeader";
import AdvancedImageUpload from "./AdvancedImageUpload";
import ImageLightbox from "./ImageLightbox";
import { Camera, FileText } from "lucide-react";

const { PREDEFINED_REMARKS } = InspectionConstants;

/* ---------------------------
   Summary Of Findings and Observations (with predefined remarks)
   ---------------------------*/
const SummaryOfFindingsAndObservations = forwardRef(function SummaryOfFindingsAndObservations({
  systems,
  setSystems,
  lawFilter,
  errors,
  isReadOnly = false,
  findingImages = {},
  setFindingImages,
  generalFindings = [],
  setGeneralFindings,
  onUploadFinding,
}, ref) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [expandedFindings, setExpandedFindings] = useState({});
  const filteredSystems = useMemo(() => {
    if (!lawFilter || lawFilter.length === 0) return systems;
    return systems.filter(
      (s) =>
        lawFilter.includes(s.lawId) ||
        s.system === "Commitment/s from previous Technical Conference"
    );
  }, [systems, lawFilter]);

  const updateSystem = (index, field, value, formatter = (v) => v) => {
    const clone = [...systems];
    const system = clone[index];

    if (field === "compliant") {
      if (value === "Yes") {
        // ✅ Auto-set when compliant
        clone[index] = {
          ...system,
          compliant: "Yes",
          nonCompliant: false,
          remarks: "Compliant",
          autoSynced: false, // Clear auto-sync flag on manual change
          syncedFrom: null
        };
      } else if (value === "No") {
        // ✅ Reset when non-compliant
        clone[index] = {
          ...system,
          compliant: "No",
          nonCompliant: true,
          remarks: "",
          autoSynced: false, // Clear auto-sync flag on manual change
          syncedFrom: null
        };
      }
    } else {
      clone[index] = { ...system, [field]: formatter(value) };
      
      // Clear auto-sync flag when manually editing remarks
      if (field === "remarks") {
        clone[index].autoSynced = false;
        clone[index].syncedFrom = null;
      }
    }

    setSystems(clone);
  };

  // Toggle finding upload section
  const toggleFindingUpload = (systemId) => {
    setExpandedFindings(prev => ({
      ...prev,
      [systemId]: !prev[systemId]
    }));
  };

  // Open lightbox
  const openLightbox = (images, index) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Get system ID for image association
  const getSystemId = (system, index) => {
    return `${system.system}-${index}`;
  };

  // Update system summary (for textbox) - preserve auto-generated content and allow additions
  const updateSystemSummary = (index, summaryText) => {
    const clone = [...systems];
    const system = clone[index];
    const originalAutoSummary = system.originalAutoSummary || system.autoSummary || "";
    
    // Check if user is trying to modify the auto-generated part
    if (summaryText.length < originalAutoSummary.length && 
        !summaryText.includes("Additional Observations:")) {
      // User is trying to delete auto-generated content - prevent this
      return;
    }
    
    clone[index] = {
      ...system,
      autoSummary: summaryText,
      remarks: summaryText,
      manuallyEdited: true
    };
    setSystems(clone);
  };

  // Clear auto-summary and revert to manual entry
  const clearAutoSummary = (index) => {
    const clone = [...systems];
    clone[index] = {
      ...clone[index],
      autoSummary: "",
      autoSummaryActive: false,
      autoSynced: false,
      syncedFrom: null,
      remarks: "",
      remarksOption: ""
    };
    setSystems(clone);
  };

  return (
    <section ref={ref} data-section="findings" className="p-3 mb-4 bg-white rounded-lg shadow-sm border border-gray-300 scroll-mt-[120px]" style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
      <SectionHeader title="Summary of Findings and Observations" />
      <div className="space-y-2.5">
        {filteredSystems.map((s) => {
          const globalIndex = systems.findIndex(
            (sys) => sys.system === s.system
          );
          if (globalIndex === -1) return null;

          return (
            <div key={`${s.system}-${globalIndex}`} className="p-2.5 bg-gray-50 border border-gray-300 rounded-md">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm text-gray-900 flex items-center gap-2">
                  {s.system}
                  {s.autoSynced && (
                    <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full flex items-center gap-1" title="Auto-synced from compliance item">
                      🔄 Auto-synced
                    </span>
                  )}
                </div>
                <div className="flex gap-4">
                  <label className="text-sm text-gray-900">
                    <input
                      type="radio"
                      checked={s.compliant === "Yes"}
                      onChange={() => updateSystem(globalIndex, "compliant", "Yes")}
                      className="mr-1.5 text-sky-600 focus:ring-sky-500"
                      disabled={isReadOnly}
                    />{" "}
                    Compliant
                  </label>
                  <label className="text-sm text-gray-900">
                    <input
                      type="radio"
                      checked={s.nonCompliant === true}
                      onChange={() => updateSystem(globalIndex, "compliant", "No")}
                      className="mr-1.5 text-sky-600 focus:ring-sky-500"
                      disabled={isReadOnly}
                    />{" "}
                    Non-Compliant
                  </label>
                </div>
              </div>

              <div className="mt-2.5">
                {s.autoSynced || s.autoSummaryActive ? (
                  // TEXTBOX for auto-synced findings (replaces dropdown)
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                        {s.autoSummary ? (
                          <>
                            <span>📝 Auto-generated Summary (Protected + Additions)</span>
                            {s.manuallyEdited && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                ✏️ With Additions
                              </span>
                            )}
                          </>
                        ) : (
                          'Findings Summary'
                        )}
                      </label>
                      {s.autoSummary && !isReadOnly && (
                        <button
                          onClick={() => clearAutoSummary(globalIndex)}
                          className="text-xs text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-1"
                          title="Clear auto-summary and return to dropdown"
                        >
                          🗑️ Clear Auto-Summary
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <textarea
                        value={s.autoSummary || ""}
                        onChange={(e) => updateSystemSummary(globalIndex, e.target.value)}
                        placeholder="Summary will auto-generate when compliance items are marked, or you can type manually..."
                        className={`
                          w-full border rounded-md px-3 py-2 text-gray-900 min-h-[200px] font-mono text-sm
                          ${s.autoSummary 
                            ? 'border-sky-400 bg-sky-50/30' 
                            : 'border-gray-300 bg-white'
                          }
                          focus:ring-2 focus:ring-sky-500 focus:border-sky-500
                        `}
                        disabled={isReadOnly}
                      />
                      {s.originalAutoSummary && (
                        <div className="absolute top-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded border">
                          Auto-generated content is protected
                        </div>
                      )}
                    </div>
                    {s.autoSummary && !s.manuallyEdited && (
                      <p className="text-xs text-sky-600 flex items-center gap-1">
                        <span>ℹ️</span>
                        <span>Auto-generated content is protected. You can add additional observations below the "Additional Observations:" section.</span>
                      </p>
                    )}
                  </div>
                ) : (
                  // TEXTBOX for manual findings (no dropdown)
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">
                      Findings Summary
                    </label>
                    <textarea
                      value={s.remarks || ""}
                      onChange={(e) =>
                        updateSystem(globalIndex, "remarks", e.target.value, formatInput.upper)
                      }
                      placeholder="Enter findings summary..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 min-h-[200px] focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      disabled={isReadOnly}
                    />
                  </div>
                )}

              </div>

              {/* Image Upload Section for Individual Finding */}
              {setFindingImages && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => toggleFindingUpload(getSystemId(s, globalIndex))}
                    disabled={isReadOnly}
                    className="flex items-center gap-2 text-sm font-medium text-sky-700 hover:text-sky-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <Camera className="w-4 h-4" />
                    {expandedFindings[getSystemId(s, globalIndex)] ? 'Hide' : 'Add'} Evidence Documents
                    {findingImages[getSystemId(s, globalIndex)]?.length > 0 && (
                      <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-xs rounded-full">
                        {findingImages[getSystemId(s, globalIndex)].length}
                      </span>
                    )}
                  </button>

                  {expandedFindings[getSystemId(s, globalIndex)] && (
                    <div className="mt-3">
                      <AdvancedImageUpload
                        images={findingImages[getSystemId(s, globalIndex)] || []}
                        setImages={(newImages) => {
                          setFindingImages({
                            ...findingImages,
                            [getSystemId(s, globalIndex)]: newImages
                          });
                        }}
                        onUpload={onUploadFinding ? (imgs) => onUploadFinding(getSystemId(s, globalIndex), imgs) : null}
                        maxFileSize={5 * 1024 * 1024}
                        allowedFormats={['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']}
                        maxFiles={10}
                        showCaptions={true}
                        isReadOnly={isReadOnly}
                        label={null}
                        systemId={getSystemId(s, globalIndex)}
                      />
                    </div>
                  )}

                  {/* Display uploaded images with click to view */}
                  {findingImages[getSystemId(s, globalIndex)]?.length > 0 && !expandedFindings[getSystemId(s, globalIndex)] && (
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      {findingImages[getSystemId(s, globalIndex)].slice(0, 3).map((img, idx) => (
                        <button
                          key={img.id}
                          onClick={() => openLightbox(findingImages[getSystemId(s, globalIndex)], idx)}
                          className="w-12 h-12 rounded-md overflow-hidden border border-gray-300 hover:border-sky-500 transition-colors"
                        >
                          {img.type === 'application/pdf' ? (
                            <div className="w-full h-full bg-red-50 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-red-600" />
                            </div>
                          ) : (
                            <img 
                              src={img.url} 
                              alt={img.caption || img.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </button>
                      ))}
                      {findingImages[getSystemId(s, globalIndex)].length > 3 && (
                        <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-600 font-medium border border-gray-300">
                          +{findingImages[getSystemId(s, globalIndex)].length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* General Findings Documents Section */}
      {setGeneralFindings && (
        <div className="mt-6 pt-6 border-t-2 border-gray-300">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-gray-700" />
            <h3 className="text-base font-semibold text-gray-800">General Inspection Documents</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Upload general inspection photos or documents not specific to individual findings.
          </p>
          <AdvancedImageUpload
            images={generalFindings}
            setImages={setGeneralFindings}
            onUpload={onUploadFinding ? (imgs) => onUploadFinding('general', imgs) : null}
            maxFileSize={5 * 1024 * 1024}
            allowedFormats={['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']}
            maxFiles={20}
            showCaptions={true}
            isReadOnly={isReadOnly}
            label="Upload General Documents"
            systemId="general"
          />
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}
    </section>
  );
});

export default SummaryOfFindingsAndObservations;
