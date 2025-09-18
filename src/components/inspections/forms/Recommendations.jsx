// src/components/inspections/Recommendations.jsx
import React from "react";
import { useFormContext } from "react-hook-form";

const DEFAULT_RECOS = [
  "For confirmatory sampling/further monitoring",
  "For issuance of Temporary/Renewal of POA or DP",
  "For accreditation of PCO / Seminar for Managing Head",
  "For Submission of SMR / CMR",
  "For Technical Conference / NOM",
  "For issuance of NOV",
  "For suspension of ECC",
  "For endorsement to PAB",
  "Other Recommendations",
];

export default function Recommendations() {
  const { register, watch, setValue } = useFormContext();
  const selectedRecos = watch("recommendations") || {};

  const toggle = (label) => {
    setValue(`recommendations.${label}`, !selectedRecos[label]);
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-sky-700">Recommendations</h2>

      <div className="space-y-3">
        {DEFAULT_RECOS.map((r, i) => (
          <label key={i} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!(selectedRecos && selectedRecos[r])}
              onChange={() => toggle(r)}
              className="w-4 h-4"
            />
            <span>{r}</span>
          </label>
        ))}
      </div>

      {selectedRecos && selectedRecos["Other Recommendations"] && (
        <div className="mt-3">
          <label className="block font-medium">
            Other Recommendation (details)
          </label>
          <textarea
            {...register("recommendations.otherText")}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      )}

      <div className="mt-4">
        <label className="block font-medium">Supporting files (optional)</label>
        <input
          type="file"
          multiple
          {...register("attachments")}
          className="mt-2"
        />
        <p className="mt-1 text-xs text-gray-500">
          PDF, JPG, PNG etc. (files will be handled by your upload flow)
        </p>
      </div>
    </div>
  );
}
