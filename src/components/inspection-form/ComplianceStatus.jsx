import React, { useMemo } from "react";
import { formatInput } from "./utils";
import SectionHeader from "./SectionHeader";

/* ---------------------------
   Compliance Status (Permits)
   - includes date validation & formatting
   ---------------------------*/
export default function ComplianceStatus({ permits, setPermits, lawFilter, errors }) {
  const updatePermitField = (index, field, value, formatter = (v) => v) => {
    const clone = [...permits];
    clone[index] = { ...clone[index], [field]: formatter(value) };
    setPermits(clone);
  };

  // Filter permits by selected laws
  const filtered = useMemo(() => {
    if (!lawFilter || lawFilter.length === 0) return permits;
    return permits.filter((p) => lawFilter.includes(p.lawId));
  }, [permits, lawFilter]);

  // Group permits by lawId
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach((p) => {
      if (!groups[p.lawId]) groups[p.lawId] = [];
      groups[p.lawId].push(p);
    });
    return groups;
  }, [filtered]);

  return (
    <section className="p-4 mb-6 bg-white border border-black">
      <SectionHeader title="Compliance Status - DENR Permits / Licenses / Clearance" />
      <div className="overflow-x-auto">
        <table className="w-full border border-collapse border-black">
          <thead>
            <tr>
              <th className="p-2 text-left border border-black">
                Environmental Law
              </th>
              <th className="p-2 border border-black">Permit</th>
              <th className="p-2 border border-black">Permit Number</th>
              <th className="p-2 border border-black">Date Issued</th>
              <th className="p-2 border border-black">Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([lawId, permitsArr]) =>
              permitsArr.map((perm, idx) => {
                const originalIndex = permits.findIndex(
                  (p) =>
                    p === perm ||
                    (p.lawId === perm.lawId && p.permitType === perm.permitType)
                );
                // if not found, skip
                if (originalIndex === -1) return null;
                return (
                  <tr key={`${perm.lawId}-${perm.permitType}`}>
                    {idx === 0 && (
                      <td
                        className="p-2 font-bold align-top border border-black"
                        rowSpan={permitsArr.length}
                      >
                        {perm.lawId}
                      </td>
                    )}
                    <td className="p-2 border border-black">
                      {perm.permitType}
                    </td>
                    <td className="p-2 border border-black">
                      <input
                        className="w-full px-2 py-1 text-black uppercase bg-white border border-black"
                        value={permits[originalIndex].permitNumber || ""}
                        onChange={(e) =>
                          updatePermitField(
                            originalIndex,
                            "permitNumber",
                            e.target.value,
                            formatInput.upper
                          )
                        }
                      />
                    </td>
                    <td className="p-2 border border-black">
                      <input
                        type="date"
                        className="w-full px-2 py-1 text-black bg-white border border-black"
                        value={permits[originalIndex].dateIssued || ""}
                        onChange={(e) =>
                          updatePermitField(
                            originalIndex,
                            "dateIssued",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td className="p-2 border border-black">
                      <input
                        type="date"
                        className="w-full px-2 py-1 text-black bg-white border border-black"
                        value={permits[originalIndex].expiryDate || ""}
                        onChange={(e) =>
                          updatePermitField(
                            originalIndex,
                            "expiryDate",
                            e.target.value
                          )
                        }
                      />
                    </td>
                  </tr>
                );
              })
            )}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-black">
                  No permits for selected laws. Please select applicable laws
                  above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
