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

  return (
    <div className="w-full p-4 overflow-y-auto bg-white">
      <h2 className="mb-6 text-2xl font-bold text-sky-600">
        New Inspection – Step {step}
      </h2>

      {/* Step 1: Select establishments + law */}
      {step === 1 && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <h3 className="mb-2 font-medium">Select Establishments</h3>
            <table className="w-full border border-gray-300 rounded-lg">
              <thead>
                <tr className="text-sm text-center text-white bg-sky-700">
                  <th className="w-10 border border-gray-300"></th>
                  <th className="p-1 border border-gray-300">Name</th>
                  <th className="p-1 border border-gray-300">
                    Nature of Business
                  </th>
                  <th className="p-1 border border-gray-300">City</th>
                </tr>
              </thead>
              <tbody>
                {establishments.map((e) => (
                  <tr
                    key={e.id}
                    className="text-xs text-center hover:bg-gray-50"
                  >
                    <td className="p-2 border border-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedEstablishments.includes(e.id)}
                        onChange={() => toggleSelect(e.id)}
                      />
                    </td>
                    <td className="p-2 border border-gray-300">{e.name}</td>
                    <td className="p-2 border border-gray-300">
                      {e.natureOfBusiness}
                    </td>
                    <td className="p-2 border border-gray-300">
                      {e.address.city}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="mb-2 font-medium">Select Law</h3>
            <select
              value={selectedLaw}
              onChange={(e) => setSelectedLaw(e.target.value)}
              className="p-2 border border-gray-300 rounded w-30"
            >
              <option value="">-- Select --</option>
              <option value="PD-1586">PD-1586</option>
              <option value="RA-6969">RA-6969</option>
              <option value="RA-8749">RA-8749</option>
              <option value="RA-9275">RA-9275</option>
              <option value="RA-9003">RA-9003</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <div>
          <h3 className="mb-4 font-medium">Review Inspection</h3>
          <table className="w-full border rounded-lg">
            <thead>
              <tr className="text-sm text-center text-white bg-sky-700">
                <th className="p-1 border">Name</th>
                <th className="p-1 border">Nature</th>
                <th className="p-1 border">Address</th>
                <th className="p-1 border">Coordinates</th>
                <th className="p-1 border">Section</th>
              </tr>
            </thead>
            <tbody>
              {establishments
                .filter((e) => selectedEstablishments.includes(e.id))
                .map((e) => (
                  <tr key={e.id} className="text-xs text-center">
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
              onSave({
                establishments: selectedEstablishments,
                law: selectedLaw,
              });
              onCancel();
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
