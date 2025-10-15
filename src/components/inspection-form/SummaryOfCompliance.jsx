import React, { useEffect, forwardRef } from "react";
import * as InspectionConstants from "../../constants/inspectionform/index";
import { formatInput } from "./utils";
import SectionHeader from "./SectionHeader";
import { autoSyncComplianceToFinding } from "./complianceFindingsMapping";
import { updateSystemsWithAutoSummaries } from "./summaryGenerator";

/* ---------------------------
   Summary Of Compliance (with predefined remarks)
   - Now with auto-sync to findings!
   ---------------------------*/
const SummaryOfCompliance = forwardRef(function SummaryOfCompliance({ 
  items, 
  setItems, 
  lawFilter, 
  errors, 
  isReadOnly = false,
  systems,
  setSystems,
  onComplianceChange,
  showSyncNotification
}, ref) {
  useEffect(() => {
    if (!lawFilter || lawFilter.length === 0) return;
    let changed = false;
    const clone = [...items];
    lawFilter.forEach((lawId) => {
      const lawItems = InspectionConstants.getComplianceItemsByLaw(lawId) || [];
      lawItems.forEach((li) => {
        const exists = clone.find((c) => c.conditionId === li.conditionId);
        if (!exists) {
          clone.push({
            conditionId: li.conditionId,
            lawId: li.lawId,
            lawCitation: li.lawCitation,
            complianceRequirement: li.complianceRequirement || "",
            compliant: "",
            remarksOption: "",
            remarks: "",
            conditionNumber: "",
          });
          changed = true;
        }
      });
    });
    if (changed) setItems(clone);
  }, [lawFilter, items, setItems]);

  // Auto-sync all compliance items to findings whenever items change
  useEffect(() => {
    if (!systems || !setSystems || !items || items.length === 0) return;
    
    // Generate auto-summaries for all systems based on current compliance items
    const updatedSystems = updateSystemsWithAutoSummaries(systems, items);
    
    // Check if anything actually changed
    const hasChanges = JSON.stringify(systems) !== JSON.stringify(updatedSystems);
    
    if (hasChanges) {
      setSystems(updatedSystems);
      console.log('🔄 Auto-summaries generated for all systems');
    }
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateItem = (
    index,
    field,
    value,
    formatter = (v) => (typeof v === "string" ? formatInput.upper(v) : v)
  ) => {
    const clone = [...items];
    if (!clone[index]) return;

    if (field === "compliant") {
      if (value === "Yes") {
        // ✅ Auto-set to Compliant when Yes
        clone[index] = {
          ...clone[index],
          compliant: value,
          remarksOption: "Compliant",
          remarks: "",
        };
      } else if (value === "No") {
        // ✅ Reset remarks when No
        clone[index] = {
          ...clone[index],
          compliant: value,
          remarksOption: "",
          remarks: "",
        };
      } else {
        clone[index] = { ...clone[index], compliant: value };
      }
      
      // 🔄 AUTO-SYNC to corresponding finding system
      if (systems && setSystems) {
        const oldSystems = [...systems];
        const updatedSystems = autoSyncComplianceToFinding(clone[index], systems);
        
        // Check if any system was actually updated
        const hasChanges = JSON.stringify(oldSystems) !== JSON.stringify(updatedSystems);
        
        if (hasChanges) {
          setSystems(updatedSystems);
          console.log('🔄 Auto-synced compliance to finding:', clone[index].complianceRequirement);
          
          // Show notification about auto-sync
          if (showSyncNotification) {
            const status = value === "Yes" ? "Compliant" : "Non-Compliant";
            showSyncNotification(
              `Finding auto-updated: Corresponding system marked as ${status}`,
              'info'
            );
          }
        }
      }
      
      // Trigger compliance change callback (for recommendations visibility)
      if (onComplianceChange) {
        onComplianceChange(clone);
      }
    } else {
      clone[index] = { ...clone[index], [field]: formatter(value) };
      
      // If updating remarks, also sync to findings
      if ((field === "remarksOption" || field === "remarks") && systems && setSystems && clone[index].compliant === "No") {
        const updatedSystems = autoSyncComplianceToFinding(clone[index], systems);
        setSystems(updatedSystems);
        
        if (showSyncNotification && value && value.trim() !== "") {
          showSyncNotification(
            `Remarks auto-copied to corresponding finding system`,
            'info'
          );
        }
      }
    }

    setItems(clone);
  };

  const getLawFullName = (lawId) => {
    const law = InspectionConstants.LAWS.find((l) => l.id === lawId);
    if (law) return law.fullName;
    if (lawId === "Pollution-Control")
      return "Pollution Control Officer Accreditation";
    if (lawId === "Self-Monitoring") return "Self-Monitoring Report";
    return lawId;
  };

  const ALWAYS_INCLUDED_LAWS = ["Pollution-Control", "Self-Monitoring"];
  const effectiveLawFilter = [
    ...new Set([...(lawFilter || []), ...ALWAYS_INCLUDED_LAWS]),
  ];

  return (
    <section ref={ref} data-section="summary-compliance" className="p-3 mb-4 bg-white rounded-lg shadow-sm border border-gray-300 scroll-mt-[120px]" style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
      <SectionHeader title="Summary of Compliance" />
      {errors.compliance_items && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            {errors.compliance_items}
          </p>
        </div>
      )}
      {effectiveLawFilter.length === 0 && (
        <div className="py-4 px-3 text-center text-sm text-gray-600">
          No compliance items for selected laws.
        </div>
      )}
      {effectiveLawFilter.map((lawId) => {
        const lawItems =
          InspectionConstants.getComplianceItemsByLaw(lawId) || [];
        return (
          <div key={lawId} className="mb-6">
            <div className="mb-2 text-base font-semibold text-gray-800 pb-2 border-b border-gray-200">
              {getLawFullName(lawId)}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border border-collapse border-gray-300 rounded-md">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-3 border border-gray-300 w-50 text-sm font-semibold text-gray-700">
                      {lawId === "PD-1586" ? "Condition No." : "Applicable Laws and Citations"}
                    </th>
                    <th className="py-2 px-3 border border-gray-300 text-sm font-semibold text-gray-700">
                      Compliance Requirement
                    </th>
                    <th className="py-2 px-3 border border-gray-300 w-15 text-sm font-semibold text-gray-700">Compliant</th>
                    <th className="py-2 px-3 border border-gray-300 w-50 text-sm font-semibold text-gray-700">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {lawItems.map((li, index) => {
                    const globalIndex = items.findIndex(
                      (i) => i.conditionId === li.conditionId
                    );
                    if (globalIndex === -1) return null;
                    const item = items[globalIndex];

                    // Calculate rowSpan for merging duplicate lawCitation cells
                    const currentCitation = li.lawCitation || "";
                    const _nextCitation = index < lawItems.length - 1 ? lawItems[index + 1].lawCitation || "" : "";
                    const prevCitation = index > 0 ? lawItems[index - 1].lawCitation || "" : "";
                    
                    // Count consecutive duplicates starting from current index
                    let rowSpan = 1;
                    for (let i = index + 1; i < lawItems.length; i++) {
                      if (lawItems[i].lawCitation === currentCitation) {
                        rowSpan++;
                      } else {
                        break;
                      }
                    }
                    
                    // Only show the cell if it's the first occurrence of this citation
                    const shouldShowCitation = index === 0 || prevCitation !== currentCitation;

                    return (
                      <tr key={`${lawId}-${li.conditionId}-${index}`}>
                        {/* First column - Condition No. for PD-1586, Citation for others */}
                        {lawId === "PD-1586" ? (
                          <td className="py-1.5 px-3 border border-gray-300">
                            <input
                              type="text"
                              value={item.conditionNumber || ""}
                              onChange={(e) =>
                                updateItem(
                                  globalIndex,
                                  "conditionNumber",
                                  e.target.value,
                                  formatInput.upper
                                )
                              }
                              placeholder="Enter condition number"
                              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                              disabled={isReadOnly}
                            />
                          </td>
                        ) : (
                          /* Citation - with rowSpan for merging */
                          shouldShowCitation && (
                            <td 
                              className="py-1.5 px-3 border border-gray-300 align-top text-sm text-gray-900" 
                              rowSpan={rowSpan}
                            >
                              {currentCitation}
                            </td>
                          )
                        )}

                        {/* Requirement */}
                        <td className="py-1.5 px-3 border border-gray-300">
                          {lawId === "PD-1586" ? (
                            <textarea
                              value={item.complianceRequirement || ""}
                              onChange={(e) =>
                                updateItem(
                                  globalIndex,
                                  "complianceRequirement",
                                  e.target.value,
                                  formatInput.upper
                                )
                              }
                              placeholder="Enter compliance requirement"
                              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md min-h-[60px] uppercase focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                              disabled={isReadOnly}
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{li.complianceRequirement}</span>
                          )}
                        </td>

                        {/* Compliant radio */}
                        <td className="py-1.5 px-3 border border-gray-300">
                          {Object.values(
                            InspectionConstants.COMPLIANCE_STATUS
                          ).map((opt) => (
                            <label key={opt} className="block text-sm text-gray-900">
                              <input
                                type="radio"
                                name={`comp-${li.lawId}-${li.conditionId}-${globalIndex}`}
                                checked={item.compliant === opt}
                                onChange={() =>
                                  updateItem(
                                    globalIndex,
                                    "compliant",
                                    opt,
                                    (v) => v
                                  )
                                }
                                className="mr-1.5 text-sky-600 focus:ring-sky-500"
                                disabled={isReadOnly}
                              />{" "}
                              {opt}
                            </label>
                          ))}
                          {errors[`compliant-${globalIndex}`] && (
                            <p className="text-sm text-red-600">
                              {errors[`compliant-${globalIndex}`]}
                            </p>
                          )}
                        </td>

                        {/* Remarks */}
                        <td className="py-1.5 px-3 border border-gray-300">
                          {item.compliant === "Yes" ? (
                            // ✅ Show "Compliant" as readonly text
                            <input
                              type="text"
                              value="Compliant"
                              readOnly
                              className="w-full px-3 py-2 text-gray-900 bg-gray-100 border border-gray-300 rounded-md"
                            />
                          ) : (
                            <>
                              <select
                                value={item.remarksOption || ""}
                                onChange={(e) =>
                                  updateItem(
                                    globalIndex,
                                    "remarksOption",
                                    e.target.value,
                                    (v) => v
                                  )
                                }
                                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                disabled={isReadOnly}
                              >
                                <option value="">-- Select Remark --</option>
                                {(() => {
                                  // Get category-specific remarks or fall back to general remarks
                                  const categoryRemarks = InspectionConstants.DENR_REMARKS_BY_CATEGORY[item.category] || 
                                                         InspectionConstants.PREDEFINED_REMARKS.filter(r => r !== "Compliant");
                                  return categoryRemarks.map((r) => (
                                    <option key={r} value={r}>
                                      {r}
                                    </option>
                                  ));
                                })()}
                              </select>

                              {item.remarksOption && item.remarksOption !== "" && (
                                <textarea
                                  value={item.remarks || ""}
                                  onChange={(e) =>
                                    updateItem(
                                      globalIndex,
                                      "remarks",
                                      e.target.value,
                                      formatInput.upper
                                    )
                                  }
                                  placeholder={`ENTER DETAILS FOR: ${item.remarksOption.toUpperCase()}...`}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 min-h-[60px] uppercase mt-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                  disabled={isReadOnly}
                                />
                              )}
                            </>
                          )}

                          {errors[`remarks-${globalIndex}`] && (
                            <p className="text-sm text-red-600">
                              {errors[`remarks-${globalIndex}`]}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </section>
  );
});

export default SummaryOfCompliance;
