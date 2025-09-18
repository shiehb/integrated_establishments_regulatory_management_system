// src/components/inspections/ComplianceStatus.jsx
import React from "react";
import { useFormContext } from "react-hook-form";

const PERMIT_CONFIG = {
  "PD-1586": ["ECC1", "ECC2", "ECC3"],
  "RA-6969": ["DENR Registry ID", "PCL Compliance Certificate", "CCO Registry"],
  "RA-8749": ["POA No."],
  "RA-9275": ["Discharge Permit No."],
  "RA-9003": ["MOA/Agreement for residuals disposed to SLF w/ ECC"],
};

export default function ComplianceStatus() {
  const { register, watch } = useFormContext();
  const selected = watch("environmentalLaws") || [];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-sky-700">Compliance Status</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm bg-white border">
          <thead className="text-white bg-sky-700">
            <tr>
              <th className="p-2 text-left border">Law</th>
              <th className="p-2 text-left border">Permit</th>
              <th className="p-2 border">Permit No</th>
              <th className="p-2 border">Date Issued</th>
              <th className="p-2 border">Expiry Date</th>
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
              (PERMIT_CONFIG[law] || []).map((permit, idx) => (
                <tr key={`${law}-${idx}`} className="hover:bg-gray-50">
                  <td className="p-2 font-medium border">{law}</td>
                  <td className="p-2 border">{permit}</td>
                  <td className="p-2 border">
                    <input
                      {...register(`permits.${law}.${idx}.number`)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </td>
                  <td className="p-2 border">
                    <input
                      type="date"
                      {...register(`permits.${law}.${idx}.issued`)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </td>
                  <td className="p-2 border">
                    <input
                      type="date"
                      {...register(`permits.${law}.${idx}.expiry`)}
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
