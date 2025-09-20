import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import ConfirmationDialog from "../common/ConfirmationDialog";

export default function InspectionWizard({
  establishments,
  onCancel,
  onSave,
  getLastInspectionLaw,
  existingInspections,
}) {
  const [step, setStep] = useState(1);
  const [selectedEstablishments, setSelectedEstablishments] = useState([]);
  const [selectedLaw, setSelectedLaw] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const wizardRef = useRef(null);

  // Get IDs of establishments that already have inspections
  const alreadyInspectedIds = existingInspections.map(
    (insp) => insp.establishmentId
  );

  // Filter out establishments that already have inspections
  const availableEstablishments = establishments.filter(
    (e) => !alreadyInspectedIds.includes(e.id)
  );

  // Add this effect to handle clicks outside the confirmation dialog
  useEffect(() => {
    function handleClickOutside(e) {
      if (wizardRef.current && !wizardRef.current.contains(e.target)) {
        setShowConfirm(false);
      }
    }

    if (showConfirm) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showConfirm]);

  const toggleSelect = (id) => {
    setSelectedEstablishments((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Function to remove an establishment from selection
  const removeEstablishment = (id) => {
    setSelectedEstablishments((prev) => prev.filter((x) => x !== id));
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

  // Get the most common law from previous inspections for guidance
  const getSuggestedLaw = () => {
    if (selectedEstablishments.length === 0) return "";

    const lawCounts = {};
    selectedEstablishments.forEach((id) => {
      const lastLaw = getLastInspectionLaw(id);
      if (lastLaw) {
        lawCounts[lastLaw] = (lawCounts[lastLaw] || 0) + 1;
      }
    });

    // Return the most common law
    return (
      Object.keys(lawCounts).sort((a, b) => lawCounts[b] - lawCounts[a])[0] ||
      ""
    );
  };

  const handleSave = () => {
    // Create separate inspection for each selected establishment with the same law
    const newInspections = establishments
      .filter((e) => selectedEstablishments.includes(e.id))
      .map((e, index) => ({
        id: generateInspectionId(selectedLaw, index),
        establishmentId: e.id,
        section: selectedLaw,
        status: "PENDING",
      }));

    onSave(newInspections);
    setShowConfirm(false);
  };

  return (
    <div
      className="w-full p-4 pb-0 overflow-y-auto bg-white flex flex-col min-h-[80vh]"
      ref={wizardRef}
    >
      {/* Header with title and buttons on the same line */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-sky-600">
          New Inspection – Step {step} of 3
        </h2>

        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="p-1 px-4 bg-gray-300 rounded hover:bg-gray-400"
            >
              Back
            </button>
          )}

          <button
            onClick={onCancel}
            className="p-1 px-4 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && selectedEstablishments.length === 0) ||
                (step === 2 && !selectedLaw)
              }
              className="p-1 px-4 text-white rounded bg-sky-600 hover:bg-sky-700 disabled:opacity-50"
            >
              {step === 2 ? "Review" : "Next"}
            </button>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="p-1 px-4 text-white rounded bg-sky-600 hover:bg-sky-700"
            >
              Create Inspections
            </button>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex mb-6">
        <div
          className={`flex-1 h-2 mx-1 ${
            step >= 1 ? "bg-sky-600" : "bg-gray-300"
          }`}
        ></div>
        <div
          className={`flex-1 h-2 mx-1 ${
            step >= 2 ? "bg-sky-600" : "bg-gray-300"
          }`}
        ></div>
        <div
          className={`flex-1 h-2 mx-1 ${
            step >= 3 ? "bg-sky-600" : "bg-gray-300"
          }`}
        ></div>
      </div>

      {/* Step 1: Select establishments */}
      {step === 1 && (
        <div className="flex-grow">
          <h3 className="mb-4 font-medium">Select Establishments</h3>
          {availableEstablishments.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              All establishments have been added to inspections.
            </div>
          ) : (
            <table className="w-full border border-gray-300 rounded-lg shadow-sm">
              <thead>
                <tr className="text-sm text-center text-white bg-sky-700">
                  <th className="w-10 border border-gray-300"></th>
                  <th className="p-2 border border-gray-300">
                    Name of Establishments
                  </th>
                  <th className="p-2 border border-gray-300">
                    Nature of Business
                  </th>
                  <th className="p-2 border border-gray-300">Address</th>
                  <th className="p-2 border border-gray-300">
                    Last Inspection
                  </th>
                </tr>
              </thead>
              <tbody>
                {availableEstablishments.map((e) => (
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
                      {`${e.address.street}, ${e.address.barangay}, ${e.address.city}`}
                    </td>
                    <td className="p-2 border border-gray-300">
                      {getLastInspectionLaw(e.id) || "None"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Step 2: Select law for all establishments */}
      {step === 2 && (
        <div className="grid flex-grow grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left column - Selected Establishments (2/3 width) */}
          <div className="md:col-span-2">
            <h4 className="mb-2 font-medium">Selected Establishments:</h4>
            <div className="overflow-y-auto border border-gray-300 rounded max-h-96">
              <table className="w-full border border-gray-300 rounded-lg">
                <thead>
                  <tr className="text-sm text-center text-white bg-sky-700">
                    <th className="p-2 border border-gray-300">
                      Name of Establishments
                    </th>
                    <th className="p-2 border border-gray-300">Address</th>
                    <th className="p-2 border border-gray-300">Coordinates</th>
                    <th className="p-2 border border-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {establishments
                    .filter((e) => selectedEstablishments.includes(e.id))
                    .map((e) => (
                      <tr
                        key={e.id}
                        className="text-xs text-center transition hover:bg-gray-50"
                      >
                        <td className="p-2 border border-gray-300">{e.name}</td>
                        <td className="p-2 border border-gray-300">
                          {`${e.address.street}, ${e.address.barangay}, ${e.address.city}, ${e.address.province}, ${e.address.postalCode}`}
                        </td>
                        <td className="p-2 border border-gray-300">
                          {e.coordinates.latitude && e.coordinates.longitude ? (
                            <>
                              {e.coordinates.latitude},{" "}
                              {e.coordinates.longitude}
                            </>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="p-2 text-center border border-gray-300">
                          <button
                            onClick={() => removeEstablishment(e.id)}
                            className="flex items-center justify-center w-full gap-1 px-2 py-1 text-xs text-red-600 rounded hover:bg-red-100"
                            title="Remove establishment"
                          >
                            <X size={14} />
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column - Law selection (1/3 width) */}
          <div>
            <h3 className="mb-4 font-medium">
              Select Law for All Establishments
            </h3>

            <div className="p-4 mb-4 bg-gray-100 rounded">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> The same law will be applied to all{" "}
                {selectedEstablishments.length} selected establishments.
              </p>
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium">
                Select Environmental Law
              </label>
              <select
                value={selectedLaw}
                onChange={(e) => setSelectedLaw(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">-- Select Law --</option>
                <option value="PD-1586">
                  PD-1586 (Environmental Impact Assessment)
                </option>
                <option value="RA-6969">
                  RA-6969 (Toxic Substances and Hazardous Waste)
                </option>
                <option value="RA-8749">RA-8749 (Clean Air Act)</option>
                <option value="RA-9275">RA-9275 (Clean Water Act)</option>
                <option value="RA-9003">
                  RA-9003 (Ecological Solid Waste Management)
                </option>
              </select>

              {!selectedLaw && getSuggestedLaw() && (
                <p className="mt-2 text-sm text-gray-600">
                  Suggested based on previous inspections:{" "}
                  <button
                    type="button"
                    onClick={() => setSelectedLaw(getSuggestedLaw())}
                    className="underline text-sky-600"
                  >
                    {getSuggestedLaw()}
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="flex-grow">
          <h3 className="mb-4 font-medium">Review Inspections</h3>

          <div className="p-4 mb-4 rounded bg-blue-50">
            <p className="text-sm text-blue-800">
              <strong>
                Creating {selectedEstablishments.length} inspections
              </strong>{" "}
              with law: {selectedLaw}
            </p>
          </div>

          <table className="w-full border rounded-lg">
            <thead>
              <tr className="text-sm text-center text-white bg-sky-700">
                <th className="p-1 border">Inspection ID</th>
                <th className="p-1 border">Name of Establishments</th>
                <th className="p-1 border">Nature</th>
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
                      {selectedLaw}
                    </td>
                    <td className="p-2 border border-gray-300">Pending</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirm}
        title="Confirm Inspection Creation"
        message={`Are you sure you want to create ${selectedEstablishments.length} inspection(s) under ${selectedLaw}?`}
        loading={false}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleSave}
        confirmText="Create Inspections"
      />
    </div>
  );
}
