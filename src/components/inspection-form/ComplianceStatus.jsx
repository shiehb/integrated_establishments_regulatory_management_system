import React, { useMemo, useState, useEffect, forwardRef } from "react";
import { formatInput, validateDateIssued, validateExpiryDate, validatePermitDates } from "./utils";
import SectionHeader from "./SectionHeader";
import { validatePermitNumber, getPermitExample } from "./permitValidation";

/* ---------------------------
   Compliance Status (Permits)
   - includes date validation & formatting
   ---------------------------*/
const ComplianceStatus = forwardRef(function ComplianceStatus({ permits, setPermits, lawFilter, errors = {}, isReadOnly = false }, ref) {
  // State for validation
  const [dateValidations, setDateValidations] = useState({});
  const [permitNumberValidations, setPermitNumberValidations] = useState({});

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

  // Validate permit numbers when permits change
  useEffect(() => {
    const validations = {};
    permits.forEach((permit, index) => {
      if (permit.permitNumber && permit.permitNumber.trim() !== '') {
        const validation = validatePermitNumber(
          permit.permitNumber,
          permit.lawId,
          permit.permitType
        );
        validations[index] = validation;
      }
    });
    setPermitNumberValidations(validations);
  }, [permits]);

  // Filter permits by selected laws only
  const filtered = useMemo(() => {
    // Filter by law only
    if (lawFilter && lawFilter.length > 0) {
      return permits.filter((p) => lawFilter.includes(p.lawId));
    }
    
    return permits;
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
    <section ref={ref} data-section="compliance-status" className="p-3 mb-4 bg-white rounded-lg shadow-sm border border-gray-300 scroll-mt-[120px]" style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
      <SectionHeader title="Compliance Status - DENR Permits / Licenses / Clearance" />
      {errors.permits && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            {errors.permits}
          </p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border border-collapse border-gray-300 rounded-md">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-3 text-left border border-gray-300 text-sm font-semibold text-gray-700">
                Environmental Law
              </th>
              <th className="py-2 px-3 border border-gray-300 text-sm font-semibold text-gray-700">Permit</th>
              <th className="py-2 px-3 border border-gray-300 text-sm font-semibold text-gray-700">Permit Number</th>
              <th className="py-2 px-3 border border-gray-300 text-sm font-semibold text-gray-700">Date Issued</th>
              <th className="py-2 px-3 border border-gray-300 text-sm font-semibold text-gray-700">Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([, permitsArr]) =>
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
                        className="py-1.5 px-3 font-semibold align-top border border-gray-300 text-sm text-gray-900"
                        rowSpan={permitsArr.length}
                      >
                        {perm.lawId}
                      </td>
                    )}
                    <td className="py-1.5 px-3 border border-gray-300 text-sm text-gray-900">
                      {perm.permitType}
                    </td>
                    <td className="py-1.5 px-3 border border-gray-300">
                      <div>
                        <input
                          className={`w-full px-3 py-2 text-gray-900 uppercase bg-white border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                            permitNumberValidations[originalIndex]
                              ? permitNumberValidations[originalIndex].isValid
                                ? 'border-green-500'
                                : permitNumberValidations[originalIndex].warning
                                ? 'border-yellow-500'
                                : 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          value={permits[originalIndex].permitNumber || ""}
                          onChange={(e) =>
                            updatePermitField(
                              originalIndex,
                              "permitNumber",
                              e.target.value,
                              formatInput.upper
                            )
                          }
                          placeholder={getPermitExample(perm.lawId, perm.permitType) || 'Enter permit number'}
                          title={`Example: ${getPermitExample(perm.lawId, perm.permitType)}`}
                          disabled={isReadOnly}
                        />
                        {/* Permit Number Validation Message - Only show errors and warnings */}
                        {permitNumberValidations[originalIndex] && permitNumberValidations[originalIndex].message && 
                         (!permitNumberValidations[originalIndex].isValid || permitNumberValidations[originalIndex].warning) && (
                          <p className={`text-xs mt-1 ${
                            permitNumberValidations[originalIndex].warning
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}>
                            {permitNumberValidations[originalIndex].message}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-1.5 px-3 border border-gray-300">
                      <div className="relative">
                        <input
                          type="date"
                          className={`w-full px-3 py-2 text-gray-900 bg-white border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                            dateValidations[originalIndex]?.dateIssued?.isValid === false
                              ? "border-red-500"
                              : dateValidations[originalIndex]?.dateIssued?.warning
                              ? "border-yellow-500"
                              : "border-gray-300"
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
                          disabled={isReadOnly}
                        />
                      </div>
                      {/* Validation message - Only show errors and warnings */}
                      {dateValidations[originalIndex]?.dateIssued && 
                       (!dateValidations[originalIndex].dateIssued.isValid || dateValidations[originalIndex].dateIssued.warning) && (
                        <p className={`text-xs mt-1 ${
                          dateValidations[originalIndex].dateIssued.warning
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}>
                          {dateValidations[originalIndex].dateIssued.message}
                        </p>
                      )}
                    </td>
                    <td className="py-1.5 px-3 border border-gray-300">
                      <div className="relative">
                        <input
                          type="date"
                          className={`w-full px-3 py-2 text-gray-900 bg-white border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                            dateValidations[originalIndex]?.expiryDate?.isValid === false
                              ? "border-red-500"
                              : dateValidations[originalIndex]?.expiryDate?.warning
                              ? "border-yellow-500"
                              : "border-gray-300"
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
                          disabled={isReadOnly}
                          placeholder="Leave blank if no expiry"
                          title="Leave blank if this permit has no expiry date"
                        />
                      </div>
                      {/* Validation message - Only show errors and warnings */}
                      {dateValidations[originalIndex]?.expiryDate && dateValidations[originalIndex].expiryDate.message && 
                       (!dateValidations[originalIndex].expiryDate.isValid || dateValidations[originalIndex].expiryDate.warning) && (
                        <p className={`text-xs mt-1 ${
                          dateValidations[originalIndex].expiryDate.warning
                            ? "text-yellow-600"
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
                <td colSpan="5" className="py-4 px-3 text-center text-sm text-gray-600">
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
});

export default ComplianceStatus;
