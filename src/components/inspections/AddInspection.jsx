import { useState } from "react";

export default function AddInspection({ establishments, onCancel, onSave }) {
  const [step, setStep] = useState(1);
  const [selectedEstablishments, setSelectedEstablishments] = useState([]);
  const [selectedLaw, setSelectedLaw] = useState("");

  const toggleSelect = (id) => {
    setSelectedEstablishments((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Map law → prefix for ID generation
  const sectionPrefixes = {
    "PD-1586": "EIA", // Environmental Impact Assessment
    "RA-6969": "TOX", // Toxic Substances
    "RA-8749": "AIR", // Clean Air Act
    "RA-9275": "WATER", // Clean Water Act
    "RA-9003": "WASTE", // Ecological Solid Waste
  };

  // Generate inspection ID based on section and timestamp
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

      {/* Step 1: Select establishments + law */}
      {step === 1 && (
        <div className="grid grid-cols-3 gap-6">
          {/* Law Selection - Now on the LEFT */}
          <div className="col-span-1">
            <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
              <h3 className="mb-3 text-lg font-semibold text-sky-700">
                Select Law / Section
              </h3>
              <select
                value={selectedLaw}
                onChange={(e) => setSelectedLaw(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-sky-500"
              >
                <option value="">-- Choose a Section --</option>
                <option value="PD-1586">PD-1586 (EIA)</option>
                <option value="RA-6969">RA-6969 (Toxic Substances)</option>
                <option value="RA-8749">RA-8749 (Clean Air)</option>
                <option value="RA-9275">RA-9275 (Clean Water)</option>
                <option value="RA-9003">RA-9003 (Solid Waste)</option>
              </select>
              <p className="mt-2 text-sm text-gray-600">
                Please select which law/section applies to this inspection.
              </p>
            </div>
          </div>

          {/* Establishments Table - Now on the RIGHT */}
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
                      {e.natureOfBusiness}
                    </td>
                    <td className="p-2 border border-gray-300">
                      {`${e.address.street}, ${e.address.barangay}, ${e.address.city}, ${e.address.province}, ${e.address.postalCode}`}
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
                      {generateInspectionId(selectedLaw, index)}
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
                      {selectedLaw}
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
            disabled={selectedEstablishments.length === 0 || !selectedLaw}
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
                  id: generateInspectionId(selectedLaw, index),
                  establishmentId: e.id,
                  section: selectedLaw,
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
