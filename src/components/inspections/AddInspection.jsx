import { useState, useMemo } from "react";

/**
 Props:
  - establishments: array of establishment objects (should include id, name, address, coordinates, natureOfBusiness)
  - onCancel()
  - onSave(array newInspectionsPayload) -> called with payload ready to send to backend
  - lawReinspectionRules (optional): object mapping law -> months until next reinspection
*/
export default function AddInspection({
  establishments = [],
  onCancel,
  onSave,
  lawReinspectionRules = {
    "PD-1586": 12,
    "RA-6969": 6,
    "RA-8749": 12,
    "RA-9275": 12,
    "RA-9003": 12,
  },
}) {
  const [step, setStep] = useState(1);
  const [selectedEstablishments, setSelectedEstablishments] = useState([]);
  const [selectedLaw, setSelectedLaw] = useState("");
  // additional laws per establishment (map estId -> array of extra laws)
  const [extraLaws, setExtraLaws] = useState({});

  // helper: toggle main selection
  const toggleSelect = (id) => {
    setSelectedEstablishments((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // toggle extra law for an establishment
  const toggleExtraLaw = (estId, law) => {
    setExtraLaws((prev) => {
      const current = prev[estId] || [];
      if (current.includes(law)) {
        return { ...prev, [estId]: current.filter((l) => l !== law) };
      } else {
        return { ...prev, [estId]: [...current, law] };
      }
    });
  };

  // generate inspection id (kept from your original but stable)
  const sectionPrefixes = {
    "PD-1586": "EIA",
    "RA-6969": "TOX",
    "RA-8749": "AIR",
    "RA-9275": "WATER",
    "RA-9003": "WASTE",
  };
  const generateInspectionId = (section, index) => {
    const prefix = sectionPrefixes[section] || "GEN";
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-5);
    return `${prefix}-${year}-${timestamp}-${index}`;
  };

  const calculateNextInspection = (law, baseDate = new Date()) => {
    const months = lawReinspectionRules[law] ?? 12;
    const d = new Date(baseDate);
    d.setMonth(d.getMonth() + months);
    // normalize to yyyy-mm-dd
    return d.toISOString().split("T")[0];
  };

  // convenience: law options
  const lawOptions = useMemo(
    () => [
      { id: "PD-1586", label: "PD-1586 (EIA)" },
      { id: "RA-6969", label: "RA-6969 (Toxic Substances)" },
      { id: "RA-8749", label: "RA-8749 (Clean Air)" },
      { id: "RA-9275", label: "RA-9275 (Clean Water)" },
      { id: "RA-9003", label: "RA-9003 (Solid Waste)" },
    ],
    []
  );

  // Build preview rows for step 2
  const selectedRows = establishments.filter((e) =>
    selectedEstablishments.includes(e.id)
  );

  return (
    <div className="w-full p-4 overflow-y-auto bg-white">
      <h2 className="mb-6 text-2xl font-bold text-sky-600">
        New Inspection – Step {step}
      </h2>

      {step === 1 && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1">
            <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
              <h3 className="mb-3 text-lg font-semibold text-sky-700">
                Select Law / Section (Primary)
              </h3>
              <select
                value={selectedLaw}
                onChange={(e) => setSelectedLaw(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-sky-500"
              >
                <option value="">-- Choose a Section --</option>
                {lawOptions.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-600">
                Primary law will be applied to all selected establishments.
                After the first inspection, the system records next reinspection
                date. You may add *additional* laws per establishment below.
              </p>
            </div>
          </div>

          {/* establishments list */}
          <div className="col-span-2">
            <h3 className="mb-2 font-medium">Select Establishments</h3>
            <table className="w-full border border-gray-300 rounded-lg shadow-sm">
              <thead>
                <tr className="text-sm text-center text-white bg-sky-700">
                  <th className="w-10 border border-gray-300"></th>
                  <th className="p-2 border border-gray-300">Name</th>
                  <th className="p-2 border border-gray-300">
                    Nature of Business
                  </th>
                  <th className="p-2 border border-gray-300">Address</th>
                  <th className="p-2 border border-gray-300">Extra Laws</th>
                </tr>
              </thead>
              <tbody>
                {establishments.map((e) => (
                  <tr
                    key={e.id}
                    className="text-xs text-center transition hover:bg-gray-50"
                  >
                    <td className="p-2 border border-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedEstablishments.includes(e.id)}
                        onChange={() => toggleSelect(e.id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="p-2 border border-gray-300">{e.name}</td>
                    <td className="p-2 border border-gray-300">
                      {e.natureOfBusiness || e.nature_of_business}
                    </td>
                    <td className="p-2 border border-gray-300">
                      {`${e.address?.street || e.street_building || ""}, ${
                        e.address?.barangay || e.barangay || ""
                      }, ${e.address?.city || e.city || ""}, ${
                        e.address?.province || e.province || ""
                      }`}
                    </td>

                    <td className="p-2 border border-gray-300">
                      {/* additional laws checkboxes */}
                      <div className="flex flex-wrap justify-center gap-1">
                        {lawOptions.map((l) => (
                          <label
                            key={l.id}
                            className="inline-flex items-center gap-1 text-xs"
                          >
                            <input
                              type="checkbox"
                              disabled={!selectedEstablishments.includes(e.id)}
                              checked={(extraLaws[e.id] || []).includes(l.id)}
                              onChange={() => toggleExtraLaw(e.id, l.id)}
                            />
                            <span>{l.id}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <div>
          <h3 className="mb-4 font-medium">Review Inspections</h3>
          <table className="w-full border rounded-lg">
            <thead>
              <tr className="text-sm text-center text-white bg-sky-700">
                <th className="p-1 border">Inspection ID</th>
                <th className="p-1 border">Name</th>
                <th className="p-1 border">Primary Law</th>
                <th className="p-1 border">Additional Laws</th>
                <th className="p-1 border">Next Inspection Date</th>
                <th className="p-1 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {selectedRows.map((e, index) => {
                const id = generateInspectionId(selectedLaw, index);
                const extras = extraLaws[e.id] || [];
                const nextDate = calculateNextInspection(selectedLaw);
                return (
                  <tr key={id} className="text-xs text-center">
                    <td className="p-2 border border-gray-300">{id}</td>
                    <td className="p-2 border border-gray-300">{e.name}</td>
                    <td className="p-2 border border-gray-300">
                      {selectedLaw}
                    </td>
                    <td className="p-2 border border-gray-300">
                      {extras.join(", ") || "-"}
                    </td>
                    <td className="p-2 border border-gray-300">{nextDate}</td>
                    <td className="p-2 border border-gray-300">Pending</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-8">
        <button
          onClick={onCancel}
          className="p-2 px-4 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>

        {step === 1 && (
          <button
            onClick={() => setStep(2)}
            disabled={selectedEstablishments.length === 0 || !selectedLaw}
            className="p-2 px-4 text-white rounded bg-sky-600 hover:bg-sky-700 disabled:opacity-50"
          >
            Next
          </button>
        )}

        {step === 2 && (
          <button
            onClick={() => {
              // Build backend payload:
              // - inspectionList (single object)
              // - items: per establishment: primary law + extra laws + nextInspectionDate
              const now = new Date().toISOString();
              const payload = {
                created_at: now,
                created_by: "CURRENT_USER_ID", // replace by auth user id in real integration
                law: selectedLaw,
                status: "PENDING",
                items: selectedRows.map((e, idx) => {
                  const id = generateInspectionId(selectedLaw, idx);
                  const extras = extraLaws[e.id] || [];
                  const nextInspectionDate =
                    calculateNextInspection(selectedLaw);
                  // Also prepare establishment law history updates
                  const establishmentLaws = [
                    {
                      establishment_id: e.id,
                      law: selectedLaw,
                      last_inspected_date: null, // will be set upon completion
                      next_inspection_date: nextInspectionDate,
                    },
                    // extras
                    ...extras.map((law) => ({
                      establishment_id: e.id,
                      law,
                      last_inspected_date: null,
                      next_inspection_date: calculateNextInspection(law),
                    })),
                  ];

                  return {
                    id,
                    establishment_id: e.id,
                    establishment_name: e.name,
                    primary_law: selectedLaw,
                    additional_laws: extras,
                    status: "PENDING",
                    scheduled_date: null,
                    next_inspection_date: nextInspectionDate,
                    created_at: now,
                    establishment_laws: establishmentLaws,
                  };
                }),
              };

              // pass to parent for API call
              onSave(payload);
            }}
            className="p-2 px-4 text-white bg-green-600 rounded hover:bg-green-700"
          >
            Confirm & Create
          </button>
        )}
      </div>
    </div>
  );
}
