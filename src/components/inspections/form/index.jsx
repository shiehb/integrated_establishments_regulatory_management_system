import React, { useState, useMemo } from "react";

const LAWS = [
  { id: "ALL", label: "All Laws" },
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
    permitType: "MOA for residuals to SLF",
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
function GeneralInformation({ data, setData }) {
  const toggleLaw = (lawId) => {
    const selected = data.environmentalLaws || [];
    const exists = selected.includes(lawId);
    const updated = exists
      ? selected.filter((l) => l !== lawId)
      : [...selected, lawId];
    setData({ ...data, environmentalLaws: updated });
  };

  return (
    <section className="p-4 mb-6 bg-white border border-black">
      <SectionHeader title="General Information" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block mb-1 text-sm text-black">
            Name of Establishment
          </label>
          <input
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.establishmentName}
            onChange={(e) =>
              setData({ ...data, establishmentName: e.target.value })
            }
            placeholder="Enter establishment name"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-black">Address</label>
          <input
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.address}
            onChange={(e) => setData({ ...data, address: e.target.value })}
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
            onChange={(e) => setData({ ...data, coordinates: e.target.value })}
            placeholder="Latitude, Longitude"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-black">
            Nature of Business
          </label>
          <input
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.natureOfBusiness}
            onChange={(e) =>
              setData({ ...data, natureOfBusiness: e.target.value })
            }
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
            onChange={(e) =>
              setData({ ...data, inspectionDateTime: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-black">
            Year Established
          </label>
          <input
            type="number"
            className="w-full px-2 py-1 text-black bg-white border border-black"
            value={data.yearEstablished}
            onChange={(e) =>
              setData({ ...data, yearEstablished: e.target.value })
            }
            placeholder="YYYY"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block mb-2 text-black">
          Applicable Environmental Laws (check all that apply)
        </label>
        <div className="flex flex-wrap gap-4">
          {LAWS.filter((l) => l.id !== "ALL").map((law) => (
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
    </section>
  );
}

/* ---------------------------
   Purpose Of Inspection
   ---------------------------*/
function PurposeOfInspection({ state, setState }) {
  const PURPOSES = [
    { id: "verify_accuracy", label: "Verify accuracy of information" },
    { id: "compliance_status", label: "Determine compliance status" },
    { id: "investigate_complaints", label: "Investigate community complaints" },
    { id: "check_commitments", label: "Check status of commitment(s)" },
    { id: "other", label: "Others" },
  ];

  const togglePurpose = (id) => {
    const arr = state.purposes || [];
    const exists = arr.includes(id);
    setState({
      ...state,
      purposes: exists ? arr.filter((p) => p !== id) : [...arr, id],
    });
  };

  return (
    <section className="p-4 mb-6 bg-white border border-black">
      <SectionHeader title="Purpose of Inspection" />
      <div className="space-y-3">
        {PURPOSES.map((p) => (
          <div key={p.id} className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={(state.purposes || []).includes(p.id)}
              onChange={() => togglePurpose(p.id)}
              className="w-4 h-4 mt-1 border-black"
            />
            <div>
              <div className="text-black">{p.label}</div>

              {p.id === "verify_accuracy" &&
                (state.purposes || []).includes("verify_accuracy") && (
                  <div className="mt-2 ml-6">
                    <label className="block mb-1 text-sm text-black">
                      Verify accuracy of (comma separated)
                    </label>
                    <input
                      className="w-full px-2 py-1 text-black bg-white border border-black"
                      value={state.accuracyDetails || ""}
                      onChange={(e) =>
                        setState({ ...state, accuracyDetails: e.target.value })
                      }
                      placeholder="POA, DP, PMPIN, etc."
                    />
                  </div>
                )}

              {p.id === "other" && (state.purposes || []).includes("other") && (
                <div className="mt-2 ml-6">
                  <label className="block mb-1 text-sm text-black">
                    Specify other purpose
                  </label>
                  <textarea
                    className="w-full border border-black px-2 py-1 bg-white text-black min-h-[80px]"
                    value={state.otherPurpose || ""}
                    onChange={(e) =>
                      setState({ ...state, otherPurpose: e.target.value })
                    }
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

  const filtered = useMemo(() => {
    if (!lawFilter || lawFilter === "ALL") return permits;
    return permits.filter((p) => p.lawId === lawFilter);
  }, [permits, lawFilter]);

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
            {filtered.map((perm, idx) => {
              const originalIndex = permits.findIndex(
                (p) =>
                  p.lawId === perm.lawId && p.permitType === perm.permitType
              );
              return (
                <tr key={`${perm.lawId}-${perm.permitType}`}>
                  <td className="p-2 border border-black">{perm.lawId}</td>
                  <td className="p-2 border border-black">{perm.permitType}</td>
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
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-black">
                  No permits for selected law.
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
  const filtered = useMemo(() => {
    if (!lawFilter || lawFilter === "ALL") return items;
    return items.filter((it) => it.lawId === lawFilter);
  }, [items, lawFilter]);

  const updateItem = (index, field, value) => {
    const clone = [...items];
    clone[index] = { ...clone[index], [field]: value };
    setItems(clone);
  };

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

  const removeByConditionId = (conditionId) => {
    setItems(items.filter((i) => i.conditionId !== conditionId));
  };

  return (
    <section className="p-4 mb-6 bg-white border border-black">
      <SectionHeader title="Summary of Compliance" />
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
            {filtered.map((item, idx) => {
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
                      value={items[globalIndex].complianceRequirement || ""}
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
                        <label key={opt} className="flex items-center gap-2">
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
                        onClick={() => removeByConditionId(item.conditionId)}
                        className="px-3 py-1 text-black bg-white border border-black"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-black">
                  No compliance items for selected law.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Add PD-1586 button always displayed (but only adds PD-1586 item) */}
        <div className="mt-4">
          <button
            onClick={addPD1586}
            className="px-4 py-2 text-black bg-white border border-black"
          >
            Add PD-1586 Condition
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------
   Summary Of Findings and Observations
   ---------------------------*/
function SummaryOfFindingsAndObservations({ systems, setSystems }) {
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
        {systems.map((s, i) => (
          <div key={s.system} className="p-3 border border-black">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="font-medium text-black">{s.system}</div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={s.compliant}
                    onChange={() => toggleStatus(i, "compliant")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-black">Compliant</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={s.nonCompliant}
                    onChange={() => toggleStatus(i, "nonCompliant")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-black">Non-Compliant</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={s.notApplicable}
                    onChange={() => toggleStatus(i, "notApplicable")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-black">N/A</span>
                </label>
              </div>
            </div>

            <div className="mt-2">
              <textarea
                className="w-full border border-black px-2 py-1 bg-white text-black min-h-[60px]"
                value={s.remarks}
                onChange={(e) => updateRemarks(i, e.target.value)}
                placeholder="Enter remarks..."
              />
            </div>
          </div>
        ))}
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
    environmentalLaws: ["PD-1586"], // mock default
  });

  const [purpose, setPurpose] = useState({ purposes: [] });
  const [permits, setPermits] = useState(initialPermits);
  const [complianceItems, setComplianceItems] = useState(
    initialComplianceItems
  );
  const [systems, setSystems] = useState([
    {
      system: "Environmental Impact Statement System",
      compliant: false,
      nonCompliant: false,
      notApplicable: false,
      remarks: "",
    },
    {
      system: "Chemical Management",
      compliant: false,
      nonCompliant: false,
      notApplicable: false,
      remarks: "",
    },
    {
      system: "Hazardous Waste Management",
      compliant: false,
      nonCompliant: false,
      notApplicable: false,
      remarks: "",
    },
    {
      system: "Air Quality Management",
      compliant: false,
      nonCompliant: false,
      notApplicable: false,
      remarks: "",
    },
    {
      system: "Water Quality Management",
      compliant: false,
      nonCompliant: false,
      notApplicable: false,
      remarks: "",
    },
    {
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

  const [lawFilter, setLawFilter] = useState("ALL");

  return (
    <div className="min-h-screen p-6 text-black bg-white">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Inspection / Compliance Form</h1>
          <p className="mt-1 text-sm text-black"></p>
        </header>

        {/* Law Filter controls */}
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm text-black">Filter by law:</label>
            <select
              className="px-2 py-1 text-black bg-white border border-black"
              value={lawFilter}
              onChange={(e) => setLawFilter(e.target.value)}
            >
              {LAWS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* quick buttons */}
            {LAWS.filter((l) => l.id !== "ALL").map((l) => (
              <button
                key={l.id}
                onClick={() => setLawFilter(l.id)}
                className={`px-2 py-1 border border-black bg-white text-black ${
                  lawFilter === l.id ? "font-bold" : ""
                }`}
              >
                {l.id}
              </button>
            ))}
            <button
              onClick={() => setLawFilter("ALL")}
              className="px-2 py-1 text-black bg-white border border-black"
            >
              Show All
            </button>
          </div>
        </div>

        <GeneralInformation data={general} setData={setGeneral} />
        <PurposeOfInspection state={purpose} setState={setPurpose} />
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
        />
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

          <button
            onClick={() => {
              // Reset filter
              setLawFilter("ALL");
            }}
            className="px-4 py-2 text-black bg-white border border-black"
          >
            Reset Filter
          </button>
        </div>
      </div>
    </div>
  );
}
