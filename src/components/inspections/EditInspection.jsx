// src/components/inspections/EditInspection.jsx
import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import GeneralInformation from "./forms/GeneralInformation";
import ComplianceStatus from "./forms/ComplianceStatus";
import SummaryOfFindingsAndObservations from "./forms/SummaryOfFindingsAndObservations";
import Recommendations from "./forms/Recommendations";
import { updateInspectionList } from "../../services/api";

const schema = z.object({
  establishmentName: z.string().min(1),
  address: z.string().min(1),
  environmentalLaws: z.array(z.string()).min(1),
});

export default function EditInspection({ inspection, onSaved, onCancel }) {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      establishmentName: inspection?.metadata?.establishmentName || "",
      address: inspection?.metadata?.address || "",
      coordinates: inspection?.metadata?.coordinates || "",
      natureOfBusiness: inspection?.metadata?.natureOfBusiness || "",
      yearEstablished: inspection?.metadata?.yearEstablished || "",
      inspectionDateTime: inspection?.created_at || "",
      environmentalLaws: inspection?.details?.environmentalLaws || [],
      permits: inspection?.details?.permits || {},
      findings: inspection?.details?.findings || {},
      recommendations: inspection?.details?.recommendations || {},
    },
  });

  const submit = async (data) => {
    try {
      const payload = {
        metadata: {
          establishmentName: data.establishmentName,
          address: data.address,
          coordinates: data.coordinates,
        },
        details: {
          environmentalLaws: data.environmentalLaws,
          permits: data.permits,
          findings: data.findings,
          recommendations: data.recommendations,
        },
      };
      await updateInspectionList(inspection.id, payload);
      alert("Updated");
      onSaved && onSaved();
    } catch (err) {
      console.error(err);
      alert("Error updating");
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(submit)}
        className="max-w-4xl p-6 mx-auto space-y-6 bg-white rounded shadow"
      >
        <h2 className="text-2xl font-bold">Edit Inspection {inspection.id}</h2>
        <GeneralInformation />
        <ComplianceStatus />
        <SummaryOfFindingsAndObservations />
        <Recommendations />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white rounded bg-sky-600"
          >
            Save
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
