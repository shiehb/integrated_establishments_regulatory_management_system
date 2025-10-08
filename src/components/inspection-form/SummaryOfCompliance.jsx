import React, { useEffect, useMemo } from "react";
import * as InspectionConstants from "../../constants/inspectionform/index";
import { formatInput } from "./utils";
import SectionHeader from "./SectionHeader";

/* ---------------------------
   Summary Of Compliance (with predefined remarks)
   ---------------------------*/
export default function SummaryOfCompliance({ items, setItems, lawFilter, errors, isReadOnly = false }) {
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
    } else {
      clone[index] = { ...clone[index], [field]: formatter(value) };
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
    <section className="p-4 mb-6 bg-white border border-black">
      <SectionHeader title="Summary of Compliance" />
      {effectiveLawFilter.length === 0 && (
        <div className="p-4 text-center text-black">
          No compliance items for selected laws.
        </div>
      )}
      {effectiveLawFilter.map((lawId) => {
        const lawItems =
          InspectionConstants.getComplianceItemsByLaw(lawId) || [];
        return (
          <div key={lawId} className="mb-8">
            <div className="mb-2 text-lg font-bold text-black">
              {getLawFullName(lawId)}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border border-collapse border-black">
                <thead>
                  <tr>
                    <th className="p-2 border border-black w-50">
                      {lawId === "PD-1586" ? "Condition No." : "Applicable Laws and Citations"}
                    </th>
                    <th className="p-2 border border-black">
                      Compliance Requirement
                    </th>
                    <th className="p-2 border border-black w-15">Compliant</th>
                    <th className="p-2 border border-black w-50">Remarks</th>
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
                    const nextCitation = index < lawItems.length - 1 ? lawItems[index + 1].lawCitation || "" : "";
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
                          <td className="p-2 border border-black">
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
                              className="w-full px-2 py-1 text-black bg-white border border-black"
                              disabled={isReadOnly}
                            />
                          </td>
                        ) : (
                          /* Citation - with rowSpan for merging */
                          shouldShowCitation && (
                            <td 
                              className="p-2 border border-black align-top" 
                              rowSpan={rowSpan}
                            >
                              {currentCitation}
                            </td>
                          )
                        )}

                        {/* Requirement */}
                        <td className="p-2 border border-black">
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
                              className="w-full px-2 py-1 text-black bg-white border border-black min-h-[60px] uppercase"
                              disabled={isReadOnly}
                            />
                          ) : (
                            li.complianceRequirement
                          )}
                        </td>

                        {/* Compliant radio */}
                        <td className="p-2 border border-black">
                          {Object.values(
                            InspectionConstants.COMPLIANCE_STATUS
                          ).map((opt) => (
                            <label key={opt} className="block">
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
                        <td className="p-2 border border-black">
                          {item.compliant === "Yes" ? (
                            // ✅ Show "Compliant" as readonly text
                            <input
                              type="text"
                              value="Compliant"
                              readOnly
                              className="w-full px-2 py-1 text-black bg-gray-100 border border-black"
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
                                className="w-full px-2 py-1 text-black bg-white border border-black"
                                disabled={isReadOnly}
                              >
                                <option value="">-- Select Remark --</option>
                                {InspectionConstants.PREDEFINED_REMARKS.filter(
                                  (r) => r !== "Compliant"
                                ).map((r) => (
                                  <option key={r} value={r}>
                                    {r}
                                  </option>
                                ))}
                              </select>

                              {item.remarksOption === "Other" && (
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
                                  placeholder="ENTER REMARKS..."
                                  className="w-full border border-black px-2 py-1 bg-white text-black min-h-[60px] uppercase mt-2"
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
}
