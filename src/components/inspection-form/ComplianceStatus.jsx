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
      const dateIssuedValidation = validateDateIssued(permit.dateIssued);
      const expiryDateValidation = validateExpiryDate(permit.expiryDate, permit.dateIssued);
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
                        {/* Validation status indicator */}
                        {permits[originalIndex].dateIssued && (
                          <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                            {dateValidations[originalIndex]?.dateIssued?.isValid ? (
                              dateValidations[originalIndex]?.dateIssued?.warning ? (
                                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )
                            ) : (
                              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Validation message */}
                      {permits[originalIndex].dateIssued && dateValidations[originalIndex]?.dateIssued && (
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
                        {/* Validation status indicator */}
                        {permits[originalIndex].expiryDate && (
                          <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                            {dateValidations[originalIndex]?.expiryDate?.isValid ? (
                              dateValidations[originalIndex]?.expiryDate?.warning ? (
                                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )
                            ) : (
                              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Validation message */}
                      {permits[originalIndex].expiryDate && dateValidations[originalIndex]?.expiryDate && (
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
