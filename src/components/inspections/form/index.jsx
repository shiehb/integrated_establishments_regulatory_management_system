import React, { useState, useMemo } from "react";
import Header from "../../Header";
import Footer from "../../Footer";

const LAWS = [
  { id: "PD-1586", label: "PD-1586" },
  { id: "RA-6969", label: "RA-6969" },
  { id: "RA-8749", label: "RA-8749" },
  { id: "RA-9275", label: "RA-9275" },
  { id: "RA-9003", label: "RA-9003" },
];

const initialPermits = [
  {
    lawId: "PD-1586",
    permitType: "ECC1",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
  },
  {
    lawId: "PD-1586",
    permitType: "ECC2",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
  },
  {
    lawId: "PD-1586",
    permitType: "ECC3",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
  },
  {
    lawId: "RA-6969",
    permitType: "DENR Registry ID",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
  },
  {
    lawId: "RA-6969",
    permitType: "PCL Compliance Certificate",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
  },
  {
    lawId: "RA-6969",
    permitType: "CCO Registry",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
  },
  {
    lawId: "RA-6969",
    permitType: "Importer Clearance No.",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
  },
  {
    lawId: "RA-6969",
    permitType: "Permit to Transport",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
  },
  {
    lawId: "RA-6969",
    permitType: "Copy of COT issued by licensed TSD Facility",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
  },
  {
    lawId: "RA-8749",
    permitType: "POA No.",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
  },
  {
    lawId: "RA-9275",
    permitType: "Discharge Permit No.",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
  },
  {
    lawId: "RA-9003",
    permitType: "With MOA/Agreement for residuals disposed of to a SLF w/ ECC",
    permitNumber: "",
    dateIssued: "",
    expiryDate: "",
  },
];

const initialComplianceItems = [
  {
    lawId: "PD-1586",
    lawCitation:
      "PD-1586: Environmental Compliance Certificate (ECC) Conditionalities",
    conditionId: "PD-1586-1",
    conditionNumber: "1",
    complianceRequirement: "Provide EIS document",
    compliant: "N/A",
    remarks: "",
  },
  {
    lawId: "RA-6969",
    lawCitation:
      "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act",
    conditionId: "RA-6969-PCL-1",
    applicableLaw: "Priority Chemical List",
    complianceRequirement: "Valid PCL Compliance Certificate",
    compliant: "N/A",
    remarks: "",
  },
  {
    lawId: "RA-6969",
    lawCitation: "RA 6969: Toxic Substances ...",
    conditionId: "RA-6969-PCL-2",
    applicableLaw: "Priority Chemical List",
    complianceRequirement: "Annual Reporting",
    compliant: "N/A",
    remarks: "",
  },
];

/* ---------------------------
   Helper little components
   ---------------------------*/
function SectionHeader({ title }) {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold text-black">{title}</h2>
      <div className="mt-2 border-b border-black" />
    </div>
  );
}

/* ---------------------------
   General Information
   ---------------------------*/
function GeneralInformation({ data, setData, onLawFilterChange }) {
  const toggleLaw = (lawId) => {
    const selected = data.environmentalLaws || [];
    const exists = selected.includes(lawId);
    const updated = exists
      ? selected.filter((l) => l !== lawId)
      : [...selected, lawId];

    setData({ ...data, environmentalLaws: updated });

    // Notify parent component about the filter change
    if (onLawFilterChange) {
      onLawFilterChange(updated);
    }
  };

  const updateField = (field, value) => {
    setData({ ...data, [field]: value });
  };

  return (
    <section className="p-4 mb-6 bg-white border border-black">
      <SectionHeader title="General Information" />
      <div className="mt-4">
        <label className="block mb-2 text-black">
          Applicable Environmental Laws (check all that apply)
        </label>
        <div className="flex flex-wrap gap-4">
          {LAWS.map((law) => (
            <label key={law.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={(data.environmentalLaws || []).includes(law.id)}
                onChange={() => toggleLaw(law.id)}
                className="w-4 h-4 border-black"
              />
              <span className="text-black">{law.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Name of Establishment - full width */}
      <div className="mt-4">
        <label className="block mb-1 text-sm text-black">
          Name of Establishment
        </label>
        <input
          className="w-full px-2 py-1 text-black bg-white border border-black"
          value={data.establishmentName}
          onChange={(e) => updateField("establishmentName", e.target.value)}
          placeholder="Enter establishment name"
        />
      </div>

      {/* Address and Coordinates - 2 columns */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block mb-1 text-sm text-black">Address</label>
          <input
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.address}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="Complete address"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm text-black">
            Coordinates (Decimal)
          </label>
          <input
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.coordinates}
            onChange={(e) => updateField("coordinates", e.target.value)}
            placeholder="Latitude, Longitude"
          />
        </div>
      </div>

      {/* Nature of Business - full width */}
      <div className="mt-4">
        <label className="block mb-1 text-sm text-black">
          Nature of Business
        </label>
        <input
          className="w-full px-2 py-1 text-black bg-white border border-black"
          value={data.natureOfBusiness}
          onChange={(e) => updateField("natureOfBusiness", e.target.value)}
        />
      </div>

      {/* Year Established and Inspection Date & Time - 2 columns */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block mb-1 text-sm text-black">
            Year Established
          </label>
          <input
            type="number"
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.yearEstablished}
            onChange={(e) => updateField("yearEstablished", e.target.value)}
            placeholder="YYYY"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm text-black">
            Inspection Date & Time
          </label>
          <input
            type="datetime-local"
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.inspectionDateTime}
            onChange={(e) => updateField("inspectionDateTime", e.target.value)}
          />
        </div>
      </div>

      {/* Operating Hours Section */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block mb-1 text-sm text-black">
            Operating Hours/Day
          </label>
          <input
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.operatingHours}
            onChange={(e) => updateField("operatingHours", e.target.value)}
            placeholder="e.g. 8AM-5PM"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-black">
            Operating Days/Week
          </label>
          <input
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.operatingDaysPerWeek}
            onChange={(e) =>
              updateField("operatingDaysPerWeek", e.target.value)
            }
            placeholder="e.g. Monday-Friday"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-black">
            Operating Days/Year
          </label>
          <input
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.operatingDaysPerYear}
            onChange={(e) =>
              updateField("operatingDaysPerYear", e.target.value)
            }
            placeholder="e.g. 300 days"
          />
        </div>
      </div>

      {/* Separator */}
      <div className="my-4 border-t border-black"></div>

      {/* Production Information Section */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 text-sm text-black">Product Lines</label>
          <input
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.productLines}
            onChange={(e) => updateField("productLines", e.target.value)}
            placeholder="e.g."
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-black">
            Production Rate as Declared in The ECC (Unit/day)
          </label>
          <input
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.declaredProductionRate}
            onChange={(e) =>
              updateField("declaredProductionRate", e.target.value)
            }
            placeholder="e.g."
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-black">
            Actual Production Rate (Unit/day)
          </label>
          <input
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.actualProductionRate}
            onChange={(e) =>
              updateField("actualProductionRate", e.target.value)
            }
            placeholder="e.g."
          />
        </div>
      </div>

      {/* Separator */}
      <div className="my-4 border-t border-black"></div>

      {/* Personnel Information Section */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block mb-1 text-sm text-black">
            Name of Managing Head
          </label>
          <input
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.managingHead}
            onChange={(e) => updateField("managingHead", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block mb-1 text-sm text-black">Name of PCO</label>
          <input
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.pcoName}
            onChange={(e) => updateField("pcoName", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-black">
            Name of person Interviewed, Designation
          </label>
          <input
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.interviewedPerson}
            onChange={(e) => updateField("interviewedPerson", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block mb-1 text-sm text-black">
            PCO Accreditation No.
          </label>
          <input
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.pcoAccreditationNo}
            onChange={(e) => updateField("pcoAccreditationNo", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-black">
            Date of Effectivity
          </label>
          <input
            type="date"
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.effectivityDate}
            onChange={(e) => updateField("effectivityDate", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block mb-1 text-sm text-black">
            Phone/ Fax No.
          </label>
          <input
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.phoneFaxNo}
            onChange={(e) => updateField("phoneFaxNo", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-black">Email Address</label>
          <input
            type="email"
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.emailAddress}
            onChange={(e) => updateField("emailAddress", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------
   Purpose Of Inspection
   ---------------------------*/
function PurposeOfInspection({ state, setState }) {
  const purposes = [
    {
      id: "verify_accuracy",
      label:
        "Verify accuracy of information submitted by the establishment pertaining to new permit applications, renewals, or modifications.",
    },
    {
      id: "compliance_status",
      label:
        "Determine compliance status with ECC conditions, compliance with commitments made during Technical Conference, permit conditions, and other requirements",
    },
    {
      id: "investigate_complaints",
      label: "Investigate community complaints.",
    },
    {
      id: "check_commitments",
      label: "Check status of commitment(s)",
    },
    {
      id: "other",
      label: "Others",
    },
  ];

  const accuracyDetailsOptions = [
    { id: "poa", label: "Permit to Operate Air (POA)" },
    { id: "dp", label: "Discharge Permit (DP)" },
    { id: "pmpin", label: "PMPIN Application" },
    { id: "hw_id", label: "Hazardous Waste ID Registration" },
    { id: "hw_transporter", label: "Hazardous Waste Transporter Registration" },
    { id: "accuracy_other", label: "Others" },
  ];

  const commitmentStatusOptions = [
    { id: "ecowatch", label: "Industrial Ecowatch" },
    {
      id: "pepp",
      label: "Philippine Environmental Partnership Program (PEPP)",
    },
    { id: "pab", label: "Pollution Adjudication Board (PAB)" },
    { id: "commitment_other", label: "Others" },
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

  const updateField = (field, value) => {
    setState({ ...state, [field]: value });
  };

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

              {/* Verify Accuracy Details */}
              {p.id === "verify_accuracy" &&
                (state.purposes || []).includes("verify_accuracy") && (
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
                          {/* Accuracy Other Detail Input */}
                          {item.id === "accuracy_other" &&
                            (state.accuracyDetails || []).includes(
                              "accuracy_other"
                            ) && (
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
                                  placeholder="Please specify other accuracy details..."
                                  className="w-full border border-black px-2 py-1 bg-white text-black min-h-[80px]"
                                />
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Commitment Status Details */}
              {p.id === "check_commitments" &&
                (state.purposes || []).includes("check_commitments") && (
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
                          {/* Commitment Other Detail Input */}
                          {item.id === "commitment_other" &&
                            (state.commitmentStatusDetails || []).includes(
                              "commitment_other"
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
                                  placeholder="Please specify other commitment details..."
                                  className="w-full border border-black px-2 py-1 bg-white text-black min-h-[80px]"
                                />
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Other Purpose Input */}
              {p.id === "other" && (state.purposes || []).includes("other") && (
                <div className="mt-3 ml-6">
                  <label className="block mb-1 text-sm text-black">
                    Specify other purpose:
                  </label>
                  <textarea
                    value={state.otherPurpose || ""}
                    onChange={(e) =>
                      updateField("otherPurpose", e.target.value)
                    }
                    placeholder="Please specify other purpose of inspection..."
                    className="w-full border border-black px-2 py-1 bg-white text-black min-h-[80px]"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------
   Compliance Status (Permits)
   ---------------------------*/
function ComplianceStatus({ permits, setPermits, lawFilter }) {
  const updatePermitField = (index, field, value) => {
    const newPermits = [...permits];
    newPermits[index] = { ...newPermits[index], [field]: value };
    setPermits(newPermits);
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
                    p.lawId === perm.lawId && p.permitType === perm.permitType
                );
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
                        className="w-full px-2 py-1 text-black bg-white border border-black"
                        value={permits[originalIndex].permitNumber}
                        onChange={(e) =>
                          updatePermitField(
                            originalIndex,
                            "permitNumber",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td className="p-2 border border-black">
                      <input
                        type="date"
                        className="w-full px-2 py-1 text-black bg-white border border-black"
                        value={permits[originalIndex].dateIssued}
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
                        value={permits[originalIndex].expiryDate}
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

/* ---------------------------
   Summary Of Compliance (with filtering and add/remove for PD-1586)
   ---------------------------*/
function SummaryOfCompliance({ items, setItems, lawFilter }) {
  // Get unique selected laws
  const selectedLaws = lawFilter && lawFilter.length > 0 ? lawFilter : [];

  // Helper to update an item
  const updateItem = (index, field, value) => {
    const clone = [...items];
    clone[index] = { ...clone[index], [field]: value };
    setItems(clone);
  };

  // Helper to add PD-1586 condition
  const addPD1586 = () => {
    const nextId = `PD-1586-${
      items.filter((i) => i.lawId === "PD-1586").length + 1
    }`;
    const newItem = {
      lawId: "PD-1586",
      lawCitation:
        "Presidential Decree No. 1586 (Environmental Impact Statement System)",
      conditionId: nextId,
      conditionNumber: "",
      complianceRequirement: "",
      compliant: "N/A",
      remarks: "",
    };
    setItems([...items, newItem]);
  };

  // Helper to remove item by conditionId
  const removeByConditionId = (conditionId) => {
    setItems(items.filter((i) => i.conditionId !== conditionId));
  };

  return (
    <section className="p-4 mb-6 bg-white border border-black">
      <SectionHeader title="Summary of Compliance" />
      {selectedLaws.length === 0 && (
        <div className="p-4 text-center text-black">
          No compliance items for selected laws. Please select applicable laws
          above.
        </div>
      )}
      {selectedLaws.map((lawId) => {
        const lawItems = items.filter((it) => it.lawId === lawId);
        return (
          <div key={lawId} className="mb-8">
            <div className="mb-2 text-lg font-bold text-black">{lawId}</div>
            <div className="overflow-x-auto">
              <table className="w-full border border-collapse border-black">
                <thead>
                  <tr>
                    <th className="p-2 border border-black">
                      Applicable Laws and Citations
                    </th>
                    <th className="p-2 border border-black">
                      Compliance Requirements
                    </th>
                    <th className="p-2 border border-black">Compliant</th>
                    <th className="p-2 border border-black">Remarks</th>
                    <th className="p-2 border border-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lawItems.map((item, idx) => {
                    const globalIndex = items.findIndex(
                      (i) => i.conditionId === item.conditionId
                    );
                    return (
                      <tr key={item.conditionId}>
                        <td className="p-2 align-top border border-black">
                          <div className="font-medium text-black">
                            {item.lawCitation}
                          </div>
                          <div className="mt-2 text-sm text-black">
                            Condition: {item.conditionId}
                          </div>
                          {item.lawId === "PD-1586" && (
                            <div className="mt-2">
                              <input
                                placeholder="Condition No."
                                value={items[globalIndex].conditionNumber || ""}
                                onChange={(e) =>
                                  updateItem(
                                    globalIndex,
                                    "conditionNumber",
                                    e.target.value
                                  )
                                }
                                className="w-32 px-2 py-1 text-black bg-white border border-black"
                              />
                            </div>
                          )}
                        </td>
                        <td className="p-2 align-top border border-black">
                          <textarea
                            value={
                              items[globalIndex].complianceRequirement || ""
                            }
                            onChange={(e) =>
                              updateItem(
                                globalIndex,
                                "complianceRequirement",
                                e.target.value
                              )
                            }
                            className="w-full border border-black px-2 py-1 min-h-[60px] bg-white text-black"
                          />
                        </td>
                        <td className="p-2 align-top border border-black">
                          <div className="flex flex-col gap-2">
                            {["Yes", "No", "N/A"].map((opt) => (
                              <label
                                key={opt}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="radio"
                                  name={`comp-${item.conditionId}`}
                                  checked={items[globalIndex].compliant === opt}
                                  onChange={() =>
                                    updateItem(globalIndex, "compliant", opt)
                                  }
                                  className="w-4 h-4 border-black"
                                />
                                <span className="text-black">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </td>
                        <td className="p-2 align-top border border-black">
                          <input
                            value={items[globalIndex].remarks || ""}
                            onChange={(e) =>
                              updateItem(globalIndex, "remarks", e.target.value)
                            }
                            className="w-full px-2 py-1 text-black bg-white border border-black"
                          />
                        </td>
                        <td className="p-2 border border-black">
                          {item.lawId === "PD-1586" && (
                            <button
                              onClick={() =>
                                removeByConditionId(item.conditionId)
                              }
                              className="px-3 py-1 text-black bg-white border border-black"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {lawItems.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-black">
                        No compliance items for {lawId}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Add PD-1586 button only shown when PD-1586 is selected */}
            {lawId === "PD-1586" && (
              <div className="mt-4">
                <button
                  onClick={addPD1586}
                  className="px-4 py-2 text-black bg-white border border-black"
                >
                  Add PD-1586 Condition
                </button>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

/* ---------------------------
   Summary Of Findings and Observations
   ---------------------------*/
function SummaryOfFindingsAndObservations({ systems, setSystems, lawFilter }) {
  // Filter systems by selected laws
  const filteredSystems = useMemo(() => {
    if (!lawFilter || lawFilter.length === 0) return systems;
    return systems.filter((s) => lawFilter.includes(s.lawId));
  }, [systems, lawFilter]);

  const toggleStatus = (index, status) => {
    const clone = [...systems];
    const item = { ...clone[index] };
    if (status === "compliant") {
      item.compliant = !item.compliant;
      if (item.compliant) {
        item.nonCompliant = false;
        item.notApplicable = false;
      }
    } else if (status === "nonCompliant") {
      item.nonCompliant = !item.nonCompliant;
      if (item.nonCompliant) {
        item.compliant = false;
        item.notApplicable = false;
      }
    } else {
      item.notApplicable = !item.notApplicable;
      if (item.notApplicable) {
        item.compliant = false;
        item.nonCompliant = false;
      }
    }
    clone[index] = item;
    setSystems(clone);
  };

  const updateRemarks = (index, val) => {
    const clone = [...systems];
    clone[index] = { ...clone[index], remarks: val };
    setSystems(clone);
  };

  return (
    <section className="p-4 mb-6 bg-white border border-black">
      <SectionHeader title="Summary of Findings and Observations" />
      <div className="space-y-4">
        {filteredSystems.map((s, i) => {
          // Find the global index in the original systems array
          const globalIndex = systems.findIndex(
            (sys) => sys.system === s.system
          );
          return (
            <div key={s.system} className="p-3 border border-black">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="font-medium text-black">{s.system}</div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={systems[globalIndex].compliant}
                      onChange={() => toggleStatus(globalIndex, "compliant")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black">Compliant</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={systems[globalIndex].nonCompliant}
                      onChange={() => toggleStatus(globalIndex, "nonCompliant")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black">Non-Compliant</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={systems[globalIndex].notApplicable}
                      onChange={() =>
                        toggleStatus(globalIndex, "notApplicable")
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black">N/A</span>
                  </label>
                </div>
              </div>

              <div className="mt-2">
                <textarea
                  className="w-full border border-black px-2 py-1 bg-white text-black min-h-[60px]"
                  value={systems[globalIndex].remarks}
                  onChange={(e) => updateRemarks(globalIndex, e.target.value)}
                  placeholder="Enter remarks..."
                />
              </div>
            </div>
          );
        })}
        {filteredSystems.length === 0 && (
          <div className="p-4 text-center text-black">
            No findings for selected laws.
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------------------
   Recommendations
   ---------------------------*/
function Recommendations({ recState, setRecState }) {
  const RECS = [
    "For confirmatory sampling/further monitoring",
    "For issuance of Temporary/Renewal of permit to operate (POA) and/or Renewal of Discharge Permit (DP)",
    "For accreditation of Pollution Control Office(PCO)/Seminar requirement of Managing Head",
    "For Submission of Self-Monitoring Report (SMR)/Compliance monitoring Report(CMR)",
    "For issuance of Notice of Violation(NOV)",
    "For issuance of suspension of ECC/5-day CDO",
    "For endorsement to Pollution Adjudication Board (PAB)",
    "Other Recommendations",
  ];

  const toggle = (label) => {
    const set = new Set(recState.checked || []);
    if (set.has(label)) set.delete(label);
    else set.add(label);
    setRecState({ ...recState, checked: Array.from(set) });
  };

  return (
    <section className="p-4 mb-6 bg-white border border-black">
      <SectionHeader title="Recommendations" />
      <div className="space-y-3">
        {RECS.map((r) => (
          <label key={r} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={(recState.checked || []).includes(r)}
              onChange={() => toggle(r)}
              className="w-4 h-4"
            />
            <span className="text-sm text-black">{r}</span>
          </label>
        ))}

        {(recState.checked || []).includes("Other Recommendations") && (
          <div className="mt-2">
            <textarea
              value={recState.otherText || ""}
              onChange={(e) =>
                setRecState({ ...recState, otherText: e.target.value })
              }
              placeholder="Enter other recommendation..."
              className="w-full border border-black px-2 py-1 bg-white text-black min-h-[80px]"
            />
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------------------
   Main App
   ---------------------------*/
export default function App() {
  const [general, setGeneral] = useState({
    establishmentName: "",
    address: "",
    coordinates: "",
    natureOfBusiness: "",
    yearEstablished: "",
    inspectionDateTime: "",
    environmentalLaws: [], // Start with empty array
    // New fields
    operatingHours: "",
    operatingDaysPerWeek: "",
    operatingDaysPerYear: "",
    productLines: "",
    declaredProductionRate: "",
    actualProductionRate: "",
    managingHead: "",
    pcoName: "",
    interviewedPerson: "",
    pcoAccreditationNo: "",
    effectivityDate: "",
    phoneFaxNo: "",
    emailAddress: "",
  });

  const [purpose, setPurpose] = useState({
    purposes: [],
    accuracyDetails: [],
    commitmentStatusDetails: [],
    otherPurpose: "",
    accuracyOtherDetail: "",
    commitmentOtherDetail: "",
  });
  const [permits, setPermits] = useState(initialPermits);
  const [complianceItems, setComplianceItems] = useState(
    initialComplianceItems
  );
  const [systems, setSystems] = useState([
    {
      lawId: "PD-1586",
      system: "Environmental Impact Statement System",
      compliant: false,
      nonCompliant: false,
      notApplicable: false,
      remarks: "",
    },
    {
      lawId: "RA-6969",
      system: "Chemical Management",
      compliant: false,
      nonCompliant: false,
      notApplicable: false,
      remarks: "",
    },
    {
      lawId: "RA-6969",
      system: "Hazardous Waste Management",
      compliant: false,
      nonCompliant: false,
      notApplicable: false,
      remarks: "",
    },
    {
      lawId: "RA-8749",
      system: "Air Quality Management",
      compliant: false,
      nonCompliant: false,
      notApplicable: false,
      remarks: "",
    },
    {
      lawId: "RA-9275",
      system: "Water Quality Management",
      compliant: false,
      nonCompliant: false,
      notApplicable: false,
      remarks: "",
    },
    {
      lawId: "RA-9003",
      system: "Solid Waste Management",
      compliant: false,
      nonCompliant: false,
      notApplicable: false,
      remarks: "",
    },
  ]);
  const [recommendationState, setRecommendationState] = useState({
    checked: [],
  });

  const [lawFilter, setLawFilter] = useState([]);

  const handleLawFilterChange = (selectedLaws) => {
    setLawFilter(selectedLaws);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Scrollable Content */}
      <div className="pt-24 pb-20">
        <div className="max-w-6xl p-6 mx-auto">
          <GeneralInformation
            data={general}
            setData={setGeneral}
            onLawFilterChange={handleLawFilterChange}
          />
          <PurposeOfInspection state={purpose} setState={setPurpose} />

          {/* Only show these sections if laws are selected */}
          {lawFilter.length > 0 && (
            <>
              <ComplianceStatus
                permits={permits}
                setPermits={setPermits}
                lawFilter={lawFilter}
              />
              <SummaryOfCompliance
                items={complianceItems}
                setItems={setComplianceItems}
                lawFilter={lawFilter}
              />
              <SummaryOfFindingsAndObservations
                systems={systems}
                setSystems={setSystems}
                lawFilter={lawFilter}
              />
            </>
          )}

          {/* Recommendations always shown */}
          <Recommendations
            recState={recommendationState}
            setRecState={setRecommendationState}
          />

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                // simple local "save" demo: log to console
                console.log({
                  general,
                  purpose,
                  permits,
                  complianceItems,
                  systems,
                  recommendationState,
                });
                alert("Form state logged to console (see devtools).");
              }}
              className="px-4 py-2 text-black bg-white border border-black"
            >
              Save (console)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
