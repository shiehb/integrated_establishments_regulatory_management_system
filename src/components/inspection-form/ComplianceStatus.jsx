import React, { useMemo, useState, useEffect } from "react";
import { formatInput, validateDateIssued, validateExpiryDate, validatePermitDates } from "./utils";
import SectionHeader from "./SectionHeader";

/* ---------------------------
   Compliance Status (Permits)
   - includes date validation & formatting
   ---------------------------*/
export default function ComplianceStatus({ permits, setPermits, lawFilter, errors }) {
  // State for validation
  const [dateValidations, setDateValidations] = useState({});

  const updatePermitField = (index, field, value, formatter = (v) => v) => {
    const clone = [...permits];
    clone[index] = { ...clone[index], [field]: formatter(value) };
    setPermits(clone);
  };

  // Validate dates when permits change
  useEffect(() => {
    const validations = {};
    permits.forEach((permit, index) => {
      const dateIssuedValidation = validateDateIssued(permit.dateIssued, permit.permitNumber);
      const expiryDateValidation = validateExpiryDate(permit.expiryDate, permit.dateIssued, permit.permitNumber);
      const combinedValidation = validatePermitDates(permit.dateIssued, permit.expiryDate);
      
      validations[index] = {
        dateIssued: dateIssuedValidation,
        expiryDate: expiryDateValidation,
        combined: combinedValidation
      };
    });
    setDateValidations(validations);
  }, [permits]);

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
                  <tr key={`${perm.lawId}-${perm.permitType}-${originalIndex}`}>
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
                      <div className="relative">
                        <input
                          type="date"
                          className={`w-full px-2 py-1 text-black bg-white border ${
                            dateValidations[originalIndex]?.dateIssued?.isValid === false
                              ? "border-red-500"
                              : dateValidations[originalIndex]?.dateIssued?.warning
                              ? "border-yellow-500"
                              : "border-black"
                          }`}
                          value={permits[originalIndex].dateIssued || ""}
                          onChange={(e) =>
                            updatePermitField(
                              originalIndex,
                              "dateIssued",
                              e.target.value
                            )
                          }
                          max={new Date().toISOString().split('T')[0]} // Prevent future dates
                        />
                      </div>
                      {/* Validation message */}
                      {dateValidations[originalIndex]?.dateIssued && (
                        <p className={`text-xs mt-1 ${
                          dateValidations[originalIndex].dateIssued.isValid
                            ? dateValidations[originalIndex].dateIssued.warning
                              ? "text-yellow-600"
                              : "text-green-600"
                            : "text-red-600"
                        }`}>
                          {dateValidations[originalIndex].dateIssued.message}
                        </p>
                      )}
                    </td>
                    <td className="p-2 border border-black">
                      <div className="relative">
                        <input
                          type="date"
                          className={`w-full px-2 py-1 text-black bg-white border ${
                            dateValidations[originalIndex]?.expiryDate?.isValid === false
                              ? "border-red-500"
                              : dateValidations[originalIndex]?.expiryDate?.warning
                              ? "border-yellow-500"
                              : "border-black"
                          }`}
                          value={permits[originalIndex].expiryDate || ""}
                          onChange={(e) =>
                            updatePermitField(
                              originalIndex,
                              "expiryDate",
                              e.target.value
                            )
                          }
                          min={permits[originalIndex].dateIssued || undefined} // Prevent dates before issued date
                        />
                      </div>
                      {/* Validation message */}
                      {dateValidations[originalIndex]?.expiryDate && (
                        <p className={`text-xs mt-1 ${
                          dateValidations[originalIndex].expiryDate.isValid
                            ? dateValidations[originalIndex].expiryDate.warning
                              ? "text-yellow-600"
                              : "text-green-600"
                            : "text-red-600"
                        }`}>
                          {dateValidations[originalIndex].expiryDate.message}
                        </p>
                      )}
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
