// /mnt/data/InspectionForm.jsx
import React, { useState, useMemo, useEffect } from "react";
import * as InspectionConstants from "../../data/inspectionform/index";

const { PREDEFINED_REMARKS } = InspectionConstants;

/* ======================
   Input formatting helpers
   ====================== */
const formatInput = {
  upper: (val) =>
    val === undefined || val === null ? "" : String(val).toUpperCase(),
  lower: (val) =>
    val === undefined || val === null ? "" : String(val).toLowerCase(),
  title: (val) =>
    val === undefined || val === null
      ? ""
      : String(val)
          .toLowerCase()
          .replace(/\b\w/g, (ch) => ch.toUpperCase()),
  numeric: (val) =>
    val === undefined || val === null ? "" : String(val).replace(/\D/g, ""),
  coords: (val) => (val ? String(val).trim() : ""),
};

/* ======================
   Date helpers
   ====================== */
const toDateOnly = (input) => {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  // normalize to date-only (local)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const _isPastDate = (input) => {
  const d = toDateOnly(input);
  if (!d) return false;
  const today = toDateOnly(new Date());
  return d < today;
};

const isFutureDate = (input) => {
  const d = toDateOnly(input);
  if (!d) return false;
  const today = toDateOnly(new Date());
  return d > today;
};

const isSameOrAfter = (a, b) => {
  const da = toDateOnly(a);
  const db = toDateOnly(b);
  if (!da || !db) return false;
  return da >= db;
};

/* ---------------------------
   Section header
   ---------------------------*/
function SectionHeader({ title }) {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold text-sky-700">{title}</h2>
      <div className="mt-2 border-b border-black" />
    </div>
  );
}

/* ---------------------------
   General Information
   ---------------------------*/
function GeneralInformation({
  data,
  setData,
  onLawFilterChange,
  inspectionData,
  errors,
}) {
  // Autofill when inspectionData provided
  useEffect(() => {
    if (
      inspectionData &&
      inspectionData.establishments &&
      inspectionData.establishments.length > 0
    ) {
      const establishment = inspectionData.establishments[0];
      const address = establishment.address || {};
      const coords = establishment.coordinates || {};

      const street = address.street || establishment.street_building || "";
      const barangay = address.barangay || establishment.barangay || "";
      const city = address.city || establishment.city || "";
      const province = address.province || establishment.province || "";
      const postalCode = address.postalCode || establishment.postal_code || "";

      const fullAddress =
        `${street}, ${barangay}, ${city}, ${province}, ${postalCode}`.toUpperCase();

      const coordsString =
        coords.latitude && coords.longitude
          ? `${coords.latitude}, ${coords.longitude}`
          : establishment.latitude && establishment.longitude
          ? `${establishment.latitude}, ${establishment.longitude}`
          : "";

      setData((prevData) => ({
        ...prevData,
        establishmentName: formatInput.upper(establishment.name || ""),
        address: formatInput.upper(fullAddress),
        coordinates: formatInput.coords(coordsString),
        natureOfBusiness: formatInput.upper(
          establishment.natureOfBusiness ||
            establishment.nature_of_business ||
            ""
        ),
        yearEstablished:
          establishment.yearEstablished || establishment.year_established || "",
        environmentalLaws: [inspectionData.section],
      }));

      if (onLawFilterChange) onLawFilterChange([inspectionData.section]);
    }
  }, []); // Empty dependency array - run only once

  const updateField = (field, value, formatter = formatInput.upper) => {
    setData({ ...data, [field]: formatter(value) });
  };

  const toggleLaw = (lawId) => {
    const selected = data.environmentalLaws || [];
    const isInitialLaw = inspectionData && inspectionData.section === lawId;
    if (isInitialLaw && selected.includes(lawId)) return;
    const updated = selected.includes(lawId)
      ? selected.filter((l) => l !== lawId)
      : [...selected, lawId];
    setData({ ...data, environmentalLaws: updated });
    if (onLawFilterChange) onLawFilterChange(updated);
  };

  return (
    <section className="p-4 mb-6 bg-white border border-black">
      <SectionHeader title="General Information" />
      <div className="mt-4">
        <label className="block mb-2 text-black">
          Applicable Environmental Laws (check all that apply)
        </label>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {InspectionConstants.LAWS.map((law) => {
            const isInitialLaw =
              inspectionData && inspectionData.section === law.id;
            const isChecked = (data.environmentalLaws || []).includes(law.id);
            return (
              <label key={law.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleLaw(law.id)}
                  className="w-4 h-4 border-black"
                  disabled={isInitialLaw && isChecked}
                />
                <span className="text-black">{law.label}</span>
                {isInitialLaw && isChecked && (
                  <span className="text-xs text-gray-500">(Required)</span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <label className="block mb-1 text-sm text-black">
          Name of Establishment
        </label>
        <input
          className="w-full px-2 py-1 text-black uppercase bg-gray-100 border border-black"
          value={data.establishmentName || ""}
          readOnly
        />
        {errors.establishmentName && (
          <p className="text-sm text-red-600">{errors.establishmentName}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block mb-1 text-sm text-black">Address</label>
          <input
            className="w-full px-2 py-1 text-black uppercase bg-gray-100 border border-black"
            value={data.address || ""}
            readOnly
          />
          {errors.address && (
            <p className="text-sm text-red-600">{errors.address}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 text-sm text-black">
            Coordinates (Decimal)
          </label>
          <input
            className="w-full px-2 py-1 text-black uppercase bg-gray-100 border border-black"
            value={data.coordinates || ""}
            readOnly
          />
          {errors.coordinates && (
            <p className="text-sm text-red-600">{errors.coordinates}</p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label className="block mb-1 text-sm text-black">
          Nature of Business
        </label>
        <input
          className="w-full px-2 py-1 text-black uppercase bg-gray-100 border border-black"
          value={data.natureOfBusiness || ""}
          readOnly
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block mb-1 text-sm text-black">
            Year Established
          </label>
          <input
            type="number"
            className="w-full px-2 py-1 text-black uppercase bg-gray-100 border border-black"
            value={data.yearEstablished || ""}
            readOnly
          />
          {errors.yearEstablished && (
            <p className="text-sm text-red-600">{errors.yearEstablished}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 text-sm text-black">
            Inspection Date & Time
          </label>
          <input
            type="datetime-local"
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.inspectionDateTime || ""}
            onChange={(e) =>
              updateField("inspectionDateTime", e.target.value, (v) => v)
            }
          />
          {errors.inspectionDateTime && (
            <p className="text-sm text-red-600">{errors.inspectionDateTime}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block mb-1 text-sm text-black">
            Operating Hours/Day
          </label>
          <input
            className="w-full px-2 py-1 text-black uppercase bg-white border border-black"
            value={data.operatingHours || ""}
            onChange={(e) => updateField("operatingHours", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 text-sm text-black">
            Operating Days/Week
          </label>
          <input
            className="w-full px-2 py-1 text-black uppercase bg-white border border-black"
            value={data.operatingDaysPerWeek || ""}
            onChange={(e) =>
              updateField(
                "operatingDaysPerWeek",
                formatInput.numeric(e.target.value),
                (v) => v
              )
            }
          />
        </div>
        <div>
          <label className="block mb-1 text-sm text-black">
            Operating Days/Year
          </label>
          <input
            className="w-full px-2 py-1 text-black uppercase bg-white border border-black"
            value={data.operatingDaysPerYear || ""}
            onChange={(e) =>
              updateField(
                "operatingDaysPerYear",
                formatInput.numeric(e.target.value),
                (v) => v
              )
            }
          />
        </div>
      </div>

      <div className="my-4 border-t border-black" />

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block mb-1 text-sm text-black">
            Phone/ Fax No.
          </label>
          <input
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.phoneFaxNo || ""}
            onChange={(e) =>
              updateField(
                "phoneFaxNo",
                formatInput.numeric(e.target.value),
                (v) => v
              )
            }
          />
          {errors.phoneFaxNo && (
            <p className="text-sm text-red-600">{errors.phoneFaxNo}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 text-sm text-black">Email Address</label>
          <input
            type="email"
            className="w-full px-2 py-1 text-black lowercase bg-white border border-black"
            value={data.emailAddress || ""}
            onChange={(e) =>
              updateField("emailAddress", e.target.value, formatInput.lower)
            }
          />
          {errors.emailAddress && (
            <p className="text-sm text-red-600">{errors.emailAddress}</p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------
   Purpose of Inspection
   ---------------------------*/
function PurposeOfInspection({ state, setState, errors }) {
  const purposes = [
    {
      id: "VERIFY_ACCURACY",
      label:
        "Verify accuracy of information submitted by the establishment pertaining to new permit applications, renewals, or modifications.",
    },
    {
      id: "COMPLIANCE_STATUS",
      label:
        "Determine compliance status with ECC conditions, compliance with commitments made during Technical Conference, permit conditions, and other requirements",
    },
    {
      id: "INVESTIGATE_COMPLAINTS",
      label: "Investigate community complaints.",
    },
    {
      id: "CHECK_COMMITMENTS",
      label: "Check status of commitment(s)",
    },
    { id: "OTHER", label: "Others" },
  ];

  const accuracyDetailsOptions = [
    {
      id: "POA",
      label: "Permit to Operate Air (POA)",
    },
    {
      id: "DP",
      label: "Discharge Permit (DP)",
    },
    {
      id: "PMPIN",
      label: "PMPIN Application",
    },
    {
      id: "HW_ID",
      label: "Hazardous Waste ID Registration",
    },
    {
      id: "HW_TRANSPORTER",
      label: "Hazardous Waste Transporter Registration",
    },
    { id: "OTHER", label: "Others" },
  ];

  const commitmentStatusOptions = [
    {
      id: "ECOWATCH",
      label: "Industrial Ecowatch",
    },
    {
      id: "PEPP",
      label: "Philippine Environmental Partnership Program (PEPP)",
    },
    {
      id: "PAB",
      label: "Pollution Adjudication Board (PAB)",
    },
    { id: "OTHER", label: "Others" },
  ];

  const togglePurpose = (id) => {
    const arr = state.purposes || [];
    const exists = arr.includes(id);
    setState({
      ...state,
      purposes: exists ? arr.filter((p) => p !== id) : [...arr, id],
    });
  };

  const toggleAccuracyDetail = (id) => {
    const arr = state.accuracyDetails || [];
    const exists = arr.includes(id);
    setState({
      ...state,
      accuracyDetails: exists ? arr.filter((d) => d !== id) : [...arr, id],
    });
  };

  const toggleCommitmentStatus = (id) => {
    const arr = state.commitmentStatusDetails || [];
    const exists = arr.includes(id);
    setState({
      ...state,
      commitmentStatusDetails: exists
        ? arr.filter((d) => d !== id)
        : [...arr, id],
    });
  };

  const updateField = (field, value, formatter = (v) => formatInput.upper(v)) =>
    setState({ ...state, [field]: formatter(value) });

  return (
    <section className="p-4 mb-6 bg-white border border-black">
      <SectionHeader title="Purpose of Inspection" />
      <div className="space-y-4">
        {purposes.map((p) => (
          <div key={p.id} className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={(state.purposes || []).includes(p.id)}
              onChange={() => togglePurpose(p.id)}
              className="w-4 h-4 mt-1 border-black"
            />
            <div className="flex-1">
              <div className="text-black">{p.label}</div>

              {p.id === "VERIFY_ACCURACY" &&
                (state.purposes || []).includes("VERIFY_ACCURACY") && (
                  <div className="p-3 mt-3 ml-6 border border-gray-300 rounded">
                    <label className="block mb-2 text-sm font-medium text-black">
                      Verify accuracy of (select all that apply):
                    </label>
                    <div className="space-y-2">
                      {accuracyDetailsOptions.map((item) => (
                        <div key={item.id} className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={(state.accuracyDetails || []).includes(
                                item.id
                              )}
                              onChange={() => toggleAccuracyDetail(item.id)}
                              className="w-4 h-4 border-black"
                            />
                            <span className="text-sm text-black">
                              {item.label}
                            </span>
                          </label>
                          {item.id === "OTHER" &&
                            (state.accuracyDetails || []).includes("OTHER") && (
                              <div className="mt-2 ml-6">
                                <label className="block mb-1 text-sm text-black">
                                  Specify other accuracy details:
                                </label>
                                <textarea
                                  value={state.accuracyOtherDetail || ""}
                                  onChange={(e) =>
                                    updateField(
                                      "accuracyOtherDetail",
                                      e.target.value
                                    )
                                  }
                                  placeholder="PLEASE SPECIFY..."
                                  className="w-full border border-black px-2 py-1 bg-white text-black min-h-[80px] uppercase"
                                />
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {p.id === "CHECK_COMMITMENTS" &&
                (state.purposes || []).includes("CHECK_COMMITMENTS") && (
                  <div className="p-3 mt-3 ml-6 border border-gray-300 rounded">
                    <label className="block mb-2 text-sm font-medium text-black">
                      Check status of (select all that apply):
                    </label>
                    <div className="space-y-2">
                      {commitmentStatusOptions.map((item) => (
                        <div key={item.id} className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={(
                                state.commitmentStatusDetails || []
                              ).includes(item.id)}
                              onChange={() => toggleCommitmentStatus(item.id)}
                              className="w-4 h-4 border-black"
                            />
                            <span className="text-sm text-black">
                              {item.label}
                            </span>
                          </label>
                          {item.id === "OTHER" &&
                            (state.commitmentStatusDetails || []).includes(
                              "OTHER"
                            ) && (
                              <div className="mt-2 ml-6">
                                <label className="block mb-1 text-sm text-black">
                                  Specify other commitment details:
                                </label>
                                <textarea
                                  value={state.commitmentOtherDetail || ""}
                                  onChange={(e) =>
                                    updateField(
                                      "commitmentOtherDetail",
                                      e.target.value
                                    )
                                  }
                                  placeholder="PLEASE SPECIFY..."
                                  className="w-full border border-black px-2 py-1 bg-white text-black min-h-[80px] uppercase"
                                />
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {p.id === "OTHER" && (state.purposes || []).includes("OTHER") && (
                <div className="mt-3 ml-6">
                  <label className="block mb-1 text-sm text-black">
                    Specify other purpose:
                  </label>
                  <textarea
                    value={state.otherPurpose || ""}
                    onChange={(e) =>
                      updateField("otherPurpose", e.target.value)
                    }
                    placeholder="PLEASE SPECIFY..."
                    className="w-full border border-black px-2 py-1 bg-white text-black min-h-[80px] uppercase"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        {errors.purpose && (
          <p className="text-sm text-red-600">{errors.purpose}</p>
        )}
      </div>
    </section>
  );
}

/* ---------------------------
   Compliance Status (Permits)
   - includes date validation & formatting
   ---------------------------*/
function ComplianceStatus({ permits, setPermits, lawFilter, errors }) {
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
                      {errors[`permitNumber-${originalIndex}`] && (
                        <p className="text-sm text-red-600">
                          {errors[`permitNumber-${originalIndex}`]}
                        </p>
                      )}
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
                      {errors[`dateIssued-${originalIndex}`] && (
                        <p className="text-sm text-red-600">
                          {errors[`dateIssued-${originalIndex}`]}
                        </p>
                      )}
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
                      {errors[`expiryDate-${originalIndex}`] && (
                        <p className="text-sm text-red-600">
                          {errors[`expiryDate-${originalIndex}`]}
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

/* ---------------------------
   Summary Of Compliance (with predefined remarks)
   ---------------------------*/
function SummaryOfCompliance({ items, setItems, lawFilter, errors }) {
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
    clone[index] = { ...clone[index], [field]: formatter(value) };
    setItems(clone);
  };

  return (
    <section className="p-4 mb-6 bg-white border border-black">
      <SectionHeader title="Summary of Compliance" />
      {lawFilter.length === 0 && (
        <div className="p-4 text-center text-black">
          No compliance items for selected laws.
        </div>
      )}
      {lawFilter.map((lawId) => {
        const lawItems =
          InspectionConstants.getComplianceItemsByLaw(lawId) || [];
        return (
          <div key={lawId} className="mb-8">
            <div className="mb-2 text-lg font-bold text-black">{lawId}</div>
            <div className="overflow-x-auto">
              <table className="w-full border border-collapse border-black">
                <thead>
                  <tr>
                    <th className="p-2 border border-black w-50">
                      Applicable Laws and Citations
                    </th>
                    <th className="p-2 border border-black">
                      Compliance Requirement
                    </th>
                    <th className="p-2 border border-black w-15">Compliant</th>
                    <th className="p-2 border border-black w-50">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const citationGroups = {};
                    lawItems.forEach((li) => {
                      if (!citationGroups[li.lawCitation])
                        citationGroups[li.lawCitation] = [];
                      citationGroups[li.lawCitation].push(li);
                    });

                    return Object.entries(citationGroups).map(
                      ([citation, citationItems]) =>
                        citationItems.map((li, idx) => {
                          const globalIndex = items.findIndex(
                            (i) => i.conditionId === li.conditionId
                          );
                          if (globalIndex === -1) return null;
                          const item = items[globalIndex];

                          return (
                            <tr key={li.conditionId}>
                              {/* Citation cell */}
                              {idx === 0 && (
                                <td
                                  className="p-2 align-top border border-black"
                                  rowSpan={citationItems.length}
                                >
                                  {li.lawId === "PD-1586" ? (
                                    <input
                                      type="text"
                                      value={item.conditionNumber || ""}
                                      onChange={(e) =>
                                        updateItem(
                                          globalIndex,
                                          "conditionNumber",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Condition No."
                                      className="w-full px-2 py-1 text-black uppercase bg-white border border-black"
                                    />
                                  ) : (
                                    citation
                                  )}
                                </td>
                              )}

                              {/* Requirement cell */}
                              <td className="p-2 border border-black">
                                {li.lawId === "PD-1586" ? (
                                  <input
                                    type="text"
                                    value={item.complianceRequirement || ""}
                                    onChange={(e) =>
                                      updateItem(
                                        globalIndex,
                                        "complianceRequirement",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter Requirement"
                                    className="w-full px-2 py-1 text-black uppercase bg-white border border-black"
                                  />
                                ) : (
                                  li.complianceRequirement
                                )}
                              </td>

                              {/* Compliant radio buttons */}
                              <td className="p-2 border border-black">
                                {Object.values(
                                  InspectionConstants.COMPLIANCE_STATUS
                                ).map((opt) => (
                                  <label key={opt} className="block">
                                    <input
                                      type="radio"
                                      name={`comp-${li.conditionId}`}
                                      checked={item.compliant === opt}
                                      onChange={() =>
                                        updateItem(
                                          globalIndex,
                                          "compliant",
                                          opt,
                                          (v) => v
                                        )
                                      }
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

                              {/* Remarks dropdown */}
                              <td className="p-2 border border-black">
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
                                >
                                  <option value="">-- Select Remark --</option>
                                  {PREDEFINED_REMARKS.map((r) => (
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
                                  />
                                )}
                                {errors[`remarks-${globalIndex}`] && (
                                  <p className="text-sm text-red-600">
                                    {errors[`remarks-${globalIndex}`]}
                                  </p>
                                )}
                              </td>
                            </tr>
                          );
                        })
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </section>
  );
}

/* ---------------------------
   Summary Of Findings and Observations (with predefined remarks)
   ---------------------------*/
function SummaryOfFindingsAndObservations({
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

  const setRadioStatus = (index, status) => {
    const clone = [...systems];
    clone[index] = {
      ...clone[index],
      compliant: status === "compliant",
      nonCompliant: status === "nonCompliant",
    };
    setSystems(clone);
  };

  const updateField = (index, field, value, formatter = (v) => v) => {
    const clone = [...systems];
    clone[index] = { ...clone[index], [field]: formatter(value) };
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
            <div key={s.system} className="p-3 border border-black">
              <div className="flex items-center justify-between">
                <div className="font-medium text-black">{s.system}</div>
                <div className="flex gap-4">
                  <label>
                    <input
                      type="radio"
                      checked={s.compliant === true}
                      onChange={() => setRadioStatus(globalIndex, "compliant")}
                    />{" "}
                    Compliant
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={s.nonCompliant === true}
                      onChange={() =>
                        setRadioStatus(globalIndex, "nonCompliant")
                      }
                    />{" "}
                    Non-Compliant
                  </label>
                </div>
              </div>

              <div className="mt-2">
                <select
                  value={s.remarksOption || ""}
                  onChange={(e) =>
                    updateField(globalIndex, "remarksOption", e.target.value)
                  }
                  className="w-full px-2 py-1 text-black bg-white border border-black"
                >
                  <option value="">-- Select Remark --</option>
                  {PREDEFINED_REMARKS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {s.remarksOption === "Other" && (
                  <textarea
                    value={s.remarks || ""}
                    onChange={(e) =>
                      updateField(
                        globalIndex,
                        "remarks",
                        e.target.value,
                        formatInput.upper
                      )
                    }
                    placeholder="ENTER REMARKS..."
                    className="w-full border border-black px-2 py-1 bg-white text-black min-h-[60px] uppercase mt-2"
                  />
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

/* ---------------------------
   Recommendations
   ---------------------------*/
function Recommendations({ recState, setRecState, errors }) {
  const recommendations = [
    { id: "CONTINUE_OPERATION", label: "Continue Operation" },
    { id: "MONITOR_COMPLIANCE", label: "Monitor Compliance" },
    { id: "ISSUE_NOTICE", label: "Issue Notice of Violation" },
    { id: "CEASE_DESIST", label: "Cease and Desist Order" },
    { id: "OTHER", label: "Other Recommendations" },
  ];

  const toggle = (label) => {
    const set = new Set(recState.checked || []);
    if (set.has(label)) set.delete(label);
    else set.add(label);
    setRecState({ ...recState, checked: Array.from(set) });
  };

  const updateField = (field, value) => {
    setRecState({ ...recState, [field]: formatInput.upper(value) });
  };

  return (
    <section className="p-4 mb-6 bg-white border border-black">
      <SectionHeader title="Recommendations" />
      <div className="space-y-3">
        {recommendations.map((r) => (
          <label key={r.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={(recState.checked || []).includes(r.label)}
              onChange={() => toggle(r.label)}
              className="w-4 h-4"
            />
            <span className="text-sm text-black">{r.label}</span>
          </label>
        ))}

        {(recState.checked || []).includes("Other Recommendations") && (
          <div className="mt-2">
            <textarea
              value={recState.otherText || ""}
              onChange={(e) => updateField("otherText", e.target.value)}
              placeholder="ENTER OTHER RECOMMENDATION..."
              className="w-full border border-black px-2 py-1 bg-white text-black min-h-[80px] uppercase"
            />
            {errors.recommendations && (
              <p className="text-sm text-red-600">{errors.recommendations}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------------------
   Internal Header
   ---------------------------*/
function InternalHeader({ onSave, onClose, lastSaveTime, isOnline }) {
  return (
    <header className="fixed left-0 z-10 flex items-center justify-between w-full px-6 py-2 bg-white border-b border-gray-200 top-18">
      <div className="text-xl font-bold text-sky-700">Inspection Form</div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          {isOnline ? "Online" : "Offline"}
        </div>
        <div className="text-sm text-gray-600">
          {lastSaveTime
            ? `Saved: ${new Date(lastSaveTime).toLocaleString()}`
            : ""}
        </div>
        <button
          onClick={onClose}
          className="px-2 py-1 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
        >
          Close Form
        </button>
        <button
          onClick={onSave}
          className="flex items-center gap-1 px-2 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700"
        >
          Save
        </button>
      </div>
    </header>
  );
}

/* ---------------------------
   Main App (export default)
   ---------------------------*/
export default function App({ inspectionData }) {
  const storageKey = `inspection-form-${inspectionData?.id || "draft"}`;

  // Load saved draft
  const loadSavedData = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("loadSavedData error", e);
    }
    return null;
  };

  const savedData = loadSavedData();

  // State
  const [general, setGeneral] = useState(
    savedData?.general || {
      establishmentName: "",
      address: "",
      coordinates: "",
      natureOfBusiness: "",
      yearEstablished: "",
      inspectionDateTime: "",
      environmentalLaws: [],
      operatingHours: "",
      operatingDaysPerWeek: "",
      operatingDaysPerYear: "",
      phoneFaxNo: "",
      emailAddress: "",
    }
  );

  const [purpose, setPurpose] = useState(
    savedData?.purpose || {
      purposes: [],
      accuracyDetails: [],
      commitmentStatusDetails: [],
      otherPurpose: "",
      accuracyOtherDetail: "",
      commitmentOtherDetail: "",
    }
  );

  const [permits, setPermits] = useState(
    savedData?.permits || InspectionConstants.initialPermits || []
  );
  const [complianceItems, setComplianceItems] = useState(
    savedData?.complianceItems ||
      InspectionConstants.initialComplianceItems ||
      []
  );
  const [systems, setSystems] = useState(
    savedData?.systems || InspectionConstants.INSPECTION_SYSTEMS || []
  );
  const [recommendationState, setRecommendationState] = useState(
    savedData?.recommendationState || { checked: [], otherText: "" }
  );

  const [lawFilter, setLawFilter] = useState(savedData?.lawFilter || []);
  const [lastSaveTime, setLastSaveTime] = useState(
    savedData?.lastSaved || null
  );
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [errors, setErrors] = useState({});

  // Auto-save
  useEffect(() => {
    const saveData = {
      general,
      purpose,
      permits,
      complianceItems,
      systems,
      recommendationState,
      lawFilter,
      lastSaved: new Date().toISOString(),
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(saveData));
      setLastSaveTime(new Date().toISOString());
    } catch (e) {
      console.error("auto-save error", e);
    }
  }, [
    general,
    purpose,
    permits,
    complianceItems,
    systems,
    recommendationState,
    lawFilter,
    storageKey,
  ]);

  // Online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Prefill law filter from inspectionData
  useEffect(() => {
    if (inspectionData?.section) {
      setLawFilter([inspectionData.section]);
    }
  }, [inspectionData]);

  /* ======================
     Validation
     ====================== */
  const validateForm = () => {
    const errs = {};

    // General Info
    if (!general.establishmentName)
      errs.establishmentName = "Establishment name is required.";
    if (!general.address) errs.address = "Address is required.";

    if (general.coordinates) {
      const parts = general.coordinates.split(",").map((s) => s.trim());
      if (
        parts.length !== 2 ||
        isNaN(Number(parts[0])) ||
        isNaN(Number(parts[1]))
      ) {
        errs.coordinates = "Coordinates must be in 'lat, lon' decimal format.";
      }
    }

    if (general.yearEstablished) {
      if (!/^\d{4}$/.test(general.yearEstablished)) {
        errs.yearEstablished = "Enter a 4-digit year.";
      } else if (Number(general.yearEstablished) > new Date().getFullYear()) {
        errs.yearEstablished = "Year cannot be in the future.";
      }
    } else {
      errs.yearEstablished = "Year established is required.";
    }

    if (general.emailAddress) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(general.emailAddress))
        errs.emailAddress = "Enter a valid email.";
    }

    if (general.inspectionDateTime) {
      const inspDate = new Date(general.inspectionDateTime);
      if (isNaN(inspDate.getTime())) {
        errs.inspectionDateTime = "Invalid inspection date/time.";
      } else if (inspDate < new Date()) {
        errs.inspectionDateTime = "Inspection date/time cannot be in the past.";
      }
    } else {
      errs.inspectionDateTime = "Inspection date/time is required.";
    }

    // Permits
    permits.forEach((p, i) => {
      if (!p.permitNumber)
        errs[`permitNumber-${i}`] = "Permit number is required.";
      if (!p.dateIssued) {
        errs[`dateIssued-${i}`] = "Date issued is required.";
      } else if (isFutureDate(p.dateIssued)) {
        errs[`dateIssued-${i}`] = "Date issued cannot be in the future.";
      }
      if (!p.expiryDate) {
        errs[`expiryDate-${i}`] = "Expiry date is required.";
      } else if (p.dateIssued && !isSameOrAfter(p.expiryDate, p.dateIssued)) {
        errs[`expiryDate-${i}`] = "Expiry must be after issued date.";
      }
    });

    // Compliance
    complianceItems.forEach((c, i) => {
      if (!c.compliant) errs[`compliant-${i}`] = "Select compliance status.";
      if (c.compliant === "Non-Compliant") {
        if (!c.remarksOption) errs[`remarks-${i}`] = "Select a remark option.";
        if (c.remarksOption === "Other" && !c.remarks)
          errs[`remarks-${i}`] = "Enter custom remarks.";
      }
    });

    // Findings
    systems.forEach((s, i) => {
      if (!s.compliant && !s.nonCompliant)
        errs[`systemStatus-${i}`] = `Select status for "${s.system}".`;
      if (s.nonCompliant) {
        if (!s.remarksOption)
          errs[`sysRemarks-${i}`] = "Select a remark option.";
        if (s.remarksOption === "Other" && !s.remarks)
          errs[`sysRemarks-${i}`] = "Enter custom remarks.";
      }
    });

    // Recommendations
    if (!recommendationState.checked?.length)
      errs.recommendations = "Select at least one recommendation.";
    if (
      recommendationState.checked?.includes("Other Recommendations") &&
      !recommendationState.otherText
    ) {
      errs.recommendations = "Provide text for other recommendation.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ======================
     Handlers
     ====================== */
  const handleSave = () => {
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      alert("Please fix errors before saving.");
      return;
    }

    const formData = {
      general,
      purpose,
      permits,
      complianceItems,
      systems,
      recommendationState,
    };

    console.log("✅ Form ready to submit:", formData);

    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.error("clear draft error", e);
    }
    alert("Form submitted successfully!");
  };

  const handleClose = () => {
    const keep = confirm("Keep your draft?");
    if (!keep) localStorage.removeItem(storageKey);
    alert(keep ? "Form closed, draft saved." : "Form closed, draft discarded.");
  };

  /* ======================
     Render
     ====================== */
  return (
    <div className="min-h-screen bg-white">
      <InternalHeader
        onSave={handleSave}
        onClose={handleClose}
        lastSaveTime={lastSaveTime}
        isOnline={isOnline}
      />

      <div className="p-4 pt-2">
        <GeneralInformation
          data={general}
          setData={setGeneral}
          onLawFilterChange={setLawFilter}
          inspectionData={inspectionData}
          errors={errors}
        />
        <PurposeOfInspection
          state={purpose}
          setState={setPurpose}
          errors={errors}
        />

        {lawFilter.length > 0 && (
          <>
            <ComplianceStatus
              permits={permits}
              setPermits={setPermits}
              lawFilter={lawFilter}
              errors={errors}
            />
            <SummaryOfCompliance
              items={complianceItems}
              setItems={setComplianceItems}
              lawFilter={lawFilter}
              errors={errors}
            />
            <SummaryOfFindingsAndObservations
              systems={systems}
              setSystems={setSystems}
              lawFilter={lawFilter}
              errors={errors}
            />
          </>
        )}

        <Recommendations
          recState={recommendationState}
          setRecState={setRecommendationState}
          errors={errors}
        />
      </div>
    </div>
  );
}
