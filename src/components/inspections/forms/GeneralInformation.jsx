// src/components/inspections/GeneralInformation.jsx
import React from "react";
import { useFormContext } from "react-hook-form";

const LAW_OPTIONS = [
  { id: "PD-1586", label: "PD-1586 (EIS)" },
  { id: "RA-6969", label: "RA-6969 (Toxic Substances)" },
  { id: "RA-8749", label: "RA-8749 (Clean Air)" },
  { id: "RA-9275", label: "RA-9275 (Clean Water)" },
  { id: "RA-9003", label: "RA-9003 (Solid Waste)" },
];

export default function GeneralInformation() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const toggleLaw = (id) => {
    const current = watch("environmentalLaws") || [];
    if (current.includes(id))
      setValue(
        "environmentalLaws",
        current.filter((x) => x !== id)
      );
    else setValue("environmentalLaws", [...current, id]);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-sky-700">General Information</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block font-medium">Establishment Name</label>
          <input
            {...register("establishmentName")}
            className="w-full px-3 py-2 border rounded"
          />
          {errors.establishmentName && (
            <p className="text-sm text-red-600">
              {errors.establishmentName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium">Year Established</label>
          <input
            type="number"
            {...register("yearEstablished")}
            className="w-full px-3 py-2 border rounded"
          />
          {errors.yearEstablished && (
            <p className="text-sm text-red-600">
              {errors.yearEstablished.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block font-medium">Address</label>
          <textarea
            {...register("address")}
            className="w-full px-3 py-2 border rounded"
          />
          {errors.address && (
            <p className="text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Coordinates (lat, lng)</label>
          <input
            {...register("coordinates")}
            className="w-full px-3 py-2 border rounded"
          />
          {errors.coordinates && (
            <p className="text-sm text-red-600">{errors.coordinates.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Nature of Business</label>
          <input
            {...register("natureOfBusiness")}
            className="w-full px-3 py-2 border rounded"
          />
          {errors.natureOfBusiness && (
            <p className="text-sm text-red-600">
              {errors.natureOfBusiness.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium">Inspection Date & Time</label>
          <input
            type="datetime-local"
            {...register("inspectionDateTime")}
            className="w-full px-3 py-2 border rounded"
          />
          {errors.inspectionDateTime && (
            <p className="text-sm text-red-600">
              {errors.inspectionDateTime.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 font-medium">
          Applicable Environmental Laws (select one or more)
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {LAW_OPTIONS.map((l) => (
            <label
              key={l.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={(watch("environmentalLaws") || []).includes(l.id)}
                onChange={() => toggleLaw(l.id)}
                className="w-4 h-4"
              />
              <span>{l.label}</span>
            </label>
          ))}
        </div>
        {errors.environmentalLaws && (
          <p className="text-sm text-red-600">
            {errors.environmentalLaws.message}
          </p>
        )}
      </div>
    </div>
  );
}
