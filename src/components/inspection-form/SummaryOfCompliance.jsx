import React, { useEffect, forwardRef } from "react";
import * as InspectionConstants from "../../constants/inspectionform/index";
import { formatInput } from "./utils";
import SectionHeader from "./SectionHeader";

/* ---------------------------
   Summary Of Compliance (with predefined remarks)
   ---------------------------*/
const SummaryOfCompliance = forwardRef(function SummaryOfCompliance({ 
  items, 
  setItems, 
  lawFilter, 
  errors, 
  isReadOnly = false,
  systems,
  setSystems,
  onComplianceChange
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
            compliant: "N/A",
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

  // Ensure textareas start with single-line height
  useEffect(() => {
    const textareas = document.querySelectorAll('textarea[min-h-40px]');
    textareas.forEach(textarea => {
      if (!textarea.value.trim()) {
        textarea.style.height = '40px';
      }
    });
  }, [items]);

  // Ensure all items have default "N/A" compliant value
  useEffect(() => {
    const needsUpdate = items.some(item => !item.compliant || item.compliant === "");
    if (needsUpdate) {
      const updatedItems = items.map(item => ({
        ...item,
        compliant: item.compliant || "N/A"
      }));
      setItems(updatedItems);
    }
  }, [items, setItems]);


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
        // ✅ Clear remarks when Yes - let user enter their own
        clone[index] = {
          ...clone[index],
          compliant: value,
          remarksOption: "",
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
      } else if (value === "N/A") {
        // ✅ Set to N/A (default state)
        clone[index] = {
          ...clone[index],
          compliant: value,
          remarksOption: "",
          remarks: "",
        };
      } else {
        clone[index] = { ...clone[index], compliant: value };
      }
      
      
      // Trigger compliance change callback (for recommendations visibility)
      if (onComplianceChange) {
        onComplianceChange(clone);
      }
    } else {
      clone[index] = { ...clone[index], [field]: formatter(value) };
      
    }

    setItems(clone);
  };

  // Validate all PD-1586 rows before allowing new row addition
  const validatePD1586Rows = () => {
    const pd1586Items = items.filter(item => item.lawId === "PD-1586");
    
    // Only validate rows that have some content (not completely empty)
    const rowsToValidate = pd1586Items.filter(item => 
      item.conditionNumber?.trim() || 
      item.complianceRequirement?.trim() || 
      item.compliant !== "N/A" ||
      item.remarks?.trim() ||
      item.remarksOption?.trim()
    );
    
    const invalidRows = rowsToValidate.filter(item => {
      // Check basic required fields only if user has started filling them
      if (item.conditionNumber?.trim() && !item.complianceRequirement?.trim()) {
        return true;
      }
      if (item.complianceRequirement?.trim() && !item.conditionNumber?.trim()) {
        return true;
      }
      
      // For remarks validation:
      // If compliant is "Yes", remarks should be filled
      // If compliant is "No", need both remarksOption and remarks text
      if (item.compliant === "Yes") {
        // For "Yes", just need some remarks text
        return !item.remarks?.trim();
      } else if (item.compliant === "No") {
        // For "No", need both dropdown selection and text input
        return !item.remarksOption?.trim() || !item.remarks?.trim();
      }
      
      return false;
    });
    
    return {
      isValid: invalidRows.length === 0,
      invalidCount: invalidRows.length
    };
  };

  // Add new PD-1586 row
  const handleAddPD1586Row = () => {
    // Validate all existing PD-1586 rows
    const validation = validatePD1586Rows();
    
    if (!validation.isValid) {
      return;
    }
    
    // Add new row using helper function from constants
    const newRow = InspectionConstants.addPD1586Condition(items);
    setItems([...items, newRow]);
  };

  // Delete PD-1586 row
  const handleDeletePD1586Row = (conditionId) => {
    // Don't allow deleting the first default row (PD-1586-1)
    if (conditionId === "PD-1586-1") {
      return;
    }
    
    setItems(items.filter(item => item.conditionId !== conditionId));
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
        // For PD-1586, get all items from state, for others use predefined items
        const lawItems = lawId === "PD-1586" 
          ? items.filter(item => item.lawId === "PD-1586")
          : InspectionConstants.getComplianceItemsByLaw(lawId) || [];
        
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
                    {lawId === "PD-1586" && !isReadOnly && lawItems.length >= 2 && (
                      <th className="py-2 px-3 border border-gray-300 w-20 text-sm font-semibold text-gray-700">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {lawItems.map((li, index) => {
                    // For PD-1586, use the item directly from state
                    // For other laws, find the item in state by conditionId
                    const item = lawId === "PD-1586" 
                      ? li 
                      : items.find(i => i.conditionId === li.conditionId);
                    
                    if (!item) return null;

                    // Calculate rowSpan for merging duplicate lawCitation cells (only for non-PD-1586)
                    const currentCitation = lawId === "PD-1586" ? "" : (li.lawCitation || "");
                    const _nextCitation = lawId === "PD-1586" ? "" : (index < lawItems.length - 1 ? lawItems[index + 1].lawCitation || "" : "");
                    const prevCitation = lawId === "PD-1586" ? "" : (index > 0 ? lawItems[index - 1].lawCitation || "" : "");
                    
                    // Count consecutive duplicates starting from current index (only for non-PD-1586)
                    let rowSpan = 1;
                    if (lawId !== "PD-1586") {
                      for (let i = index + 1; i < lawItems.length; i++) {
                        if (lawItems[i].lawCitation === currentCitation) {
                          rowSpan++;
                        } else {
                          break;
                        }
                      }
                    }
                    
                    // Only show the cell if it's the first occurrence of this citation (only for non-PD-1586)
                    const shouldShowCitation = lawId === "PD-1586" ? true : (index === 0 || prevCitation !== currentCitation);

                    return (
                      <tr key={`${lawId}-${item.conditionId}-${index}`}>
                        {/* First column - Condition No. for PD-1586, Citation for others */}
                        {lawId === "PD-1586" ? (
                          <td className="py-1.5 px-3 border border-gray-300">
                            <input
                              type="text"
                              value={item.conditionNumber || ""}
                              onChange={(e) => {
                                const itemIndex = items.findIndex(i => i.conditionId === item.conditionId);
                                updateItem(
                                  itemIndex,
                                  "conditionNumber",
                                  e.target.value,
                                  formatInput.upper
                                );
                              }}
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
                              onChange={(e) => {
                                const itemIndex = items.findIndex(i => i.conditionId === item.conditionId);
                                updateItem(
                                  itemIndex,
                                  "complianceRequirement",
                                  e.target.value,
                                  formatInput.upper
                                );
                                // Auto-resize textarea
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.max(40, e.target.scrollHeight) + 'px';
                              }}
                              ref={(el) => {
                                if (el && !el.value.trim()) {
                                  el.style.height = '40px';
                                }
                              }}
                              placeholder="Enter compliance requirement"
                              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md min-h-[40px] uppercase focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none overflow-hidden"
                              disabled={isReadOnly}
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{li.complianceRequirement}</span>
                          )}
                        </td>

                        {/* Compliant checkboxes */}
                        <td className="py-1.5 px-3 border border-gray-300">
                          <div className="flex items-center gap-3">
                            <label className="flex items-center text-sm text-gray-900">
                              <input
                                type="checkbox"
                                checked={item.compliant === "Yes"}
                                onChange={() => {
                                  const itemIndex = items.findIndex(i => i.conditionId === item.conditionId);
                                  const newValue = item.compliant === "Yes" ? "N/A" : "Yes";
                                  updateItem(
                                    itemIndex,
                                    "compliant",
                                    newValue,
                                    (v) => v
                                  );
                                }}
                                className="mr-2 text-sky-600 focus:ring-sky-500"
                                disabled={isReadOnly}
                              />
                              Yes
                            </label>
                            <label className="flex items-center text-sm text-gray-900">
                              <input
                                type="checkbox"
                                checked={item.compliant === "No"}
                                onChange={() => {
                                  const itemIndex = items.findIndex(i => i.conditionId === item.conditionId);
                                  const newValue = item.compliant === "No" ? "N/A" : "No";
                                  updateItem(
                                    itemIndex,
                                    "compliant",
                                    newValue,
                                    (v) => v
                                  );
                                }}
                                className="mr-2 text-sky-600 focus:ring-sky-500"
                                disabled={isReadOnly}
                              />
                              No
                            </label>
                            <label className="flex items-center text-sm text-gray-900">
                              <input
                                type="checkbox"
                                checked={item.compliant === "N/A"}
                                onChange={() => {
                                  const itemIndex = items.findIndex(i => i.conditionId === item.conditionId);
                                  const newValue = item.compliant === "N/A" ? "N/A" : "N/A";
                                  updateItem(
                                    itemIndex,
                                    "compliant",
                                    newValue,
                                    (v) => v
                                  );
                                }}
                                className="mr-2 text-sky-600 focus:ring-sky-500"
                                disabled={isReadOnly}
                              />
                              N/A
                            </label>
                          </div>
                          {errors[`compliant-${items.findIndex(i => i.conditionId === item.conditionId)}`] && (
                            <p className="text-sm text-red-600">
                              {errors[`compliant-${items.findIndex(i => i.conditionId === item.conditionId)}`]}
                            </p>
                          )}
                        </td>

                        {/* Remarks */}
                        <td className="py-1.5 px-3 border border-gray-300">
                          {item.compliant === "Yes" ? (
                            // ✅ Show textbox for user to enter their own remarks
                            <textarea
                              value={item.remarks || ""}
                              onChange={(e) => {
                                const itemIndex = items.findIndex(i => i.conditionId === item.conditionId);
                                updateItem(
                                  itemIndex,
                                  "remarks",
                                  e.target.value,
                                  (v) => v
                                );
                                // Auto-resize textarea
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.max(40, e.target.scrollHeight) + 'px';
                              }}
                              ref={(el) => {
                                if (el && !el.value.trim()) {
                                  el.style.height = '40px';
                                }
                              }}
                              placeholder="Enter remarks"
                              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 min-h-[40px] resize-none overflow-hidden"
                              disabled={isReadOnly}
                            />
                          ) : (
                            <>
                              <select
                                value={item.remarksOption || ""}
                                onChange={(e) => {
                                  const itemIndex = items.findIndex(i => i.conditionId === item.conditionId);
                                  updateItem(
                                    itemIndex,
                                    "remarksOption",
                                    e.target.value,
                                    (v) => v
                                  );
                                }}
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
                                  onChange={(e) => {
                                    const itemIndex = items.findIndex(i => i.conditionId === item.conditionId);
                                    updateItem(
                                      itemIndex,
                                      "remarks",
                                      e.target.value,
                                      formatInput.upper
                                    );
                                    // Auto-resize textarea
                                    e.target.style.height = 'auto';
                                    e.target.style.height = Math.max(40, e.target.scrollHeight) + 'px';
                                  }}
                                  ref={(el) => {
                                    if (el && !el.value.trim()) {
                                      el.style.height = '40px';
                                    }
                                  }}
                                  placeholder={`ENTER DETAILS FOR: ${item.remarksOption.toUpperCase()}...`}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 min-h-[40px] uppercase mt-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none overflow-hidden"
                                  disabled={isReadOnly}
                                />
                              )}
                            </>
                          )}

                          {errors[`remarks-${items.findIndex(i => i.conditionId === item.conditionId)}`] && (
                            <p className="text-sm text-red-600">
                              {errors[`remarks-${items.findIndex(i => i.conditionId === item.conditionId)}`]}
                            </p>
                          )}
                        </td>

                        {/* Actions column - Delete button for PD-1586 */}
                        {lawId === "PD-1586" && !isReadOnly && lawItems.length >= 2 && (
                          <td className="py-1.5 px-2 border border-gray-300 text-center align-middle">
                            {item.conditionId !== "PD-1586-1" && (
                              <button
                                type="button"
                                onClick={() => handleDeletePD1586Row(item.conditionId)}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors flex items-center gap-1"
                                title="Remove this compliance requirement"
                              >
                                <span>×</span> Remove
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Add Row button for PD-1586 */}
            {lawId === "PD-1586" && !isReadOnly && (
              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleAddPD1586Row}
                  className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                  title="Add new compliance requirement row"
                >
                  + Add New Compliance Requirements
                </button>
                {!validatePD1586Rows().isValid && (
                  <span className="text-sm text-red-600 font-medium">
                    Please fill all fields in existing rows before adding new ones
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
});

export default SummaryOfCompliance;
