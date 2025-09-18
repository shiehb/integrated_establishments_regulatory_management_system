// src/components/inspections/SummaryOfFindingsAndObservations.jsx
import React from "react";
import { useFormContext } from "react-hook-form";

const FINDINGS_CONFIG = {
  "PD-1586": ["EIS Conditionalities"],
  "RA-6969": ["Chemical Management", "Hazardous Waste Management"],
  "RA-8749": ["Air Quality Management"],
  "RA-9275": ["Water Quality Management"],
  "RA-9003": ["Solid Waste Management"],
};

export default function SummaryOfFindingsAndObservations() {
  const { register, watch, setValue } = useFormContext();
  const selected = watch("environmentalLaws") || [];

  const setStatus = (law, index, value) => {
    setValue(`findings.${law}.${index}.status`, value);
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-sky-700">
        Summary of Findings & Observations
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm bg-white border">
          <thead className="text-white bg-sky-700">
            <tr>
              <th className="p-2 text-left border">Law / System</th>
              <th className="p-2 border">Compliant</th>
              <th className="p-2 border">Non-Compliant</th>
              <th className="p-2 border">N/A</th>
              <th className="p-2 border">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {selected.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No laws selected yet.
                </td>
              </tr>
            )}

            {selected.map((law) =>
              (FINDINGS_CONFIG[law] || []).map((system, si) => (
                <tr key={`${law}-${si}`} className="hover:bg-gray-50">
                  <td className="p-2 font-medium border">
                    {system} <div className="text-xs text-gray-400">{law}</div>
                  </td>

                  {["compliant", "non-compliant", "na"].map((opt) => (
                    <td key={opt} className="p-2 text-center border">
                      <input
                        type="checkbox"
                        checked={watch(`findings.${law}.${si}.status`) === opt}
                        onChange={() => setStatus(law, si, opt)}
                      />
                    </td>
                  ))}

                  <td className="p-2 border">
                    <textarea
                      {...register(`findings.${law}.${si}.remarks`)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
