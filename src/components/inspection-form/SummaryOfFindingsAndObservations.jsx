import React, { useMemo } from "react";
import * as InspectionConstants from "../../constants/inspectionform/index";
import { formatInput } from "./utils";
import SectionHeader from "./SectionHeader";

const { PREDEFINED_REMARKS } = InspectionConstants;

/* ---------------------------
   Summary Of Findings and Observations (with predefined remarks)
   ---------------------------*/
export default function SummaryOfFindingsAndObservations({
  systems,
  setSystems,
  lawFilter,
  errors,
}) {
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
        // ✅ Auto-set remark when compliant
        clone[index] = {
          ...system,
          compliant: "Yes",
          nonCompliant: false,
          remarksOption: "Compliant",
          remarks: "",
        };
      } else if (value === "No") {
        // ✅ Reset remark when non-compliant
        clone[index] = {
          ...system,
          compliant: "No",
          nonCompliant: true,
          remarksOption: "",
          remarks: "",
        };
      }
    } else {
      clone[index] = { ...system, [field]: formatter(value) };
    }

    setSystems(clone);
  };

  return (
    <section className="p-4 mb-6 bg-white border border-black">
      <SectionHeader title="Summary of Findings and Observations" />
      <div className="space-y-4">
        {filteredSystems.map((s) => {
          const globalIndex = systems.findIndex(
            (sys) => sys.system === s.system
          );
          if (globalIndex === -1) return null;

          return (
            <div key={`${s.system}-${globalIndex}`} className="p-3 border border-black">
              <div className="flex items-center justify-between">
                <div className="font-medium text-black">{s.system}</div>
                <div className="flex gap-4">
                  <label>
                    <input
                      type="radio"
                      checked={s.compliant === "Yes"}
                      onChange={() => updateSystem(globalIndex, "compliant", "Yes")}
                    />{" "}
                    Compliant
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={s.nonCompliant === true}
                      onChange={() => updateSystem(globalIndex, "compliant", "No")}
                    />{" "}
                    Non-Compliant
                  </label>
                </div>
              </div>

              <div className="mt-2">
                {s.compliant === "Yes" ? (
                  <input
                    type="text"
                    value="Compliant"
                    readOnly
                    className="w-full px-2 py-1 text-black bg-gray-100 border border-black"
                  />
                ) : (
                  <>
                    <select
                      value={s.remarksOption || ""}
                      onChange={(e) =>
                        updateSystem(globalIndex, "remarksOption", e.target.value)
                      }
                      className="w-full px-2 py-1 text-black bg-white border border-black"
                    >
                      <option value="">-- Select Remark --</option>
                      {PREDEFINED_REMARKS.filter((r) => r !== "Compliant").map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    {s.remarksOption === "Other" && (
                      <textarea
                        value={s.remarks || ""}
                        onChange={(e) =>
                          updateSystem(globalIndex, "remarks", e.target.value, formatInput.upper)
                        }
                        placeholder="ENTER REMARKS..."
                        className="w-full border border-black px-2 py-1 bg-white text-black min-h-[60px] uppercase mt-2"
                      />
                    )}
                  </>
                )}

                {s.nonCompliant && errors[`sysRemarks-${globalIndex}`] && (
                  <p className="text-sm text-red-600">
                    {errors[`sysRemarks-${globalIndex}`]}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
