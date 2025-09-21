import { useState } from "react";

export default function EditInspection({ inspection, onClose, onSave }) {
  const [section, setSection] = useState(inspection.section);

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
      <h2 className="mb-4 text-xl font-bold text-sky-600">
        Edit Inspection {inspection.id}
      </h2>

      <label className="block mb-2 font-medium">Section</label>
      <select
        value={section}
        onChange={(e) => setSection(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      >
        <option value="PD-1586">PD-1586</option>
        <option value="RA-6969">RA-6969</option>
        <option value="RA-8749">RA-8749</option>
        <option value="RA-9275">RA-9275</option>
        <option value="RA-9003">RA-9003</option>
      </select>

      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(section)}
          className="px-4 py-2 text-white rounded bg-sky-600 hover:bg-sky-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}
