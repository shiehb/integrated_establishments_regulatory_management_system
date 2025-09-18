import { useState } from "react";

export default function AddInspection({
  establishments,
  onCancel,
  onSave,
  getLastInspectionLaw,
}) {
  const [step, setStep] = useState(1);
  const [selectedEstablishments, setSelectedEstablishments] = useState([]);
  const [establishmentLaws, setEstablishmentLaws] = useState({}); // { establishmentId: law }

  const toggleSelect = (id) => {
    setSelectedEstablishments((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

    // When selecting an establishment, pre-fill with its last inspection law if available
    if (!establishmentLaws[id]) {
      const lastLaw = getLastInspectionLaw(id);
      if (lastLaw) {
        setEstablishmentLaws((prev) => ({
          ...prev,
          [id]: lastLaw,
        }));
      }
    }
  };

  const handleLawChange = (establishmentId, law) => {
    setEstablishmentLaws((prev) => ({
      ...prev,
      [establishmentId]: law,
    }));
  };

  // Map law → prefix for ID generation
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
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}-${year}-${timestamp}-${index}`;
  };

  return (
    <div className="w-full p-4 overflow-y-auto bg-white">
      <h2 className="mb-6 text-2xl font-bold text-sky-600">
        New Inspection – Step {step}
      </h2>

      {/* Step 1: Select establishments with individual law selection */}
      {step === 1 && (
        <div>
          <h3 className="mb-4 font-medium">Select Establishments and Laws</h3>
          <table className="w-full border border-gray-300 rounded-lg shadow-sm">
            <thead>
              <tr className="text-sm text-center text-white bg-sky-700">
                <th className="w-10 border border-gray-300"></th>
                <th className="p-2 border border-gray-300">Name</th>
                <th className="p-2 border border-gray-300">
                  Nature of Business
                </th>
                <th className="p-2 border border-gray-300">Address</th>
                <th className="p-2 border border-gray-300">Select Law</th>
              </tr>
            </thead>
            <tbody>
              {establishments.map((e) => {
                const lastLaw = getLastInspectionLaw(e.id);
                return (
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
                      {e.natureOfBusiness}
                    </td>
                    <td className="p-2 border border-gray-300">
                      {`${e.address.street}, ${e.address.barangay}, ${e.address.city}, ${e.address.province}, ${e.address.postalCode}`}
                    </td>
                    <td className="p-2 border border-gray-300">
                      <select
                        value={establishmentLaws[e.id] || ""}
                        onChange={(event) =>
                          handleLawChange(e.id, event.target.value)
                        }
                        className="w-full p-1 border border-gray-300 rounded"
                        disabled={!selectedEstablishments.includes(e.id)}
                      >
                        <option value="">-- Select Law --</option>
                        <option value="PD-1586">PD-1586 (EIA)</option>
                        <option value="RA-6969">
                          RA-6969 (Toxic Substances)
                        </option>
                        <option value="RA-8749">RA-8749 (Clean Air)</option>
                        <option value="RA-9275">RA-9275 (Clean Water)</option>
                        <option value="RA-9003">RA-9003 (Solid Waste)</option>
                      </select>
                      {lastLaw && (
                        <p className="mt-1 text-xs text-gray-500">
                          Last inspection: {lastLaw}
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
                <th className="p-1 border">Nature</th>
                <th className="p-1 border">Address</th>
                <th className="p-1 border">Coordinates</th>
                <th className="p-1 border">Section</th>
                <th className="p-1 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {establishments
                .filter((e) => selectedEstablishments.includes(e.id))
                .map((e, index) => (
                  <tr key={e.id} className="text-xs text-center">
                    <td className="p-2 border border-gray-300">
                      {generateInspectionId(establishmentLaws[e.id], index)}
                    </td>
                    <td className="p-2 border border-gray-300">{e.name}</td>
                    <td className="p-2 border border-gray-300">
                      {e.natureOfBusiness}
                    </td>
                    <td className="p-2 border border-gray-300">
                      {`${e.address.street}, ${e.address.barangay}, ${e.address.city}, ${e.address.province}, ${e.address.postalCode}`}
                    </td>
                    <td className="p-2 border border-gray-300">
                      {e.coordinates.latitude}, {e.coordinates.longitude}
                    </td>
                    <td className="p-2 border border-gray-300">
                      {establishmentLaws[e.id]}
                    </td>
                    <td className="p-2 border border-gray-300">Pending</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer buttons */}
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
            disabled={
              selectedEstablishments.length === 0 ||
              selectedEstablishments.some((id) => !establishmentLaws[id])
            }
            className="p-2 px-4 text-white rounded bg-sky-600 hover:bg-sky-700 disabled:opacity-50"
          >
            Next
          </button>
        )}

        {step === 2 && (
          <button
            onClick={() => {
              // Create separate inspection for each selected establishment
              const newInspections = establishments
                .filter((e) => selectedEstablishments.includes(e.id))
                .map((e, index) => ({
                  id: generateInspectionId(establishmentLaws[e.id], index),
                  establishmentId: e.id,
                  section: establishmentLaws[e.id],
                  status: "PENDING",
                }));

              onSave(newInspections);
            }}
            className="p-2 px-4 text-white bg-green-600 rounded hover:bg-green-700"
          >
            Confirm
          </button>
        )}
      </div>
    </div>
  );
}
