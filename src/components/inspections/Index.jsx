// src/components/inspections/Index.jsx
import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import GeneralInformation from "./forms/GeneralInformation";
import ComplianceStatus from "./forms/ComplianceStatus";
import SummaryOfFindingsAndObservations from "./forms/SummaryOfFindingsAndObservations";
import Recommendations from "./forms/Recommendations";
import { createInspectionList } from "../../services/api";

// validation schema (light example, extend as needed)
const schema = z.object({
  establishmentName: z.string().min(1),
  address: z.string().min(1),
  coordinates: z.string().min(1),
  natureOfBusiness: z.string().min(1),
  yearEstablished: z.string().min(4).max(4),
  inspectionDateTime: z.string().min(1),
  environmentalLaws: z.array(z.string()).min(1),
  // permits/findings/recommendations are optional, flexible
});

export default function AddInspection() {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      establishmentName: "",
      address: "",
      coordinates: "",
      natureOfBusiness: "",
      yearEstablished: "",
      inspectionDateTime: "",
      environmentalLaws: [],
      permits: {},
      findings: {},
      recommendations: {},
      attachments: null,
    },
  });

  const [step, setStep] = useState(1);
  const steps = ["General Info", "Compliance", "Findings", "Recommendations"];

  const onSubmit = async (data) => {
    try {
      // transform form data to payload expected by backend
      // build items per selected establishment (here single establishment form)
      const payload = {
        law: data.environmentalLaws[0] || null,
        created_by: "CURRENT_USER_ID",
        created_at: new Date().toISOString(),
        status: "PENDING",
        metadata: {
          establishmentName: data.establishmentName,
          address: data.address,
          coordinates: data.coordinates,
          natureOfBusiness: data.natureOfBusiness,
          yearEstablished: data.yearEstablished,
        },
        details: {
          environmentalLaws: data.environmentalLaws,
          permits: data.permits,
          findings: data.findings,
          recommendations: data.recommendations,
        },
      };

      // call API
      const res = await createInspectionList(payload);
      alert("Inspection created");
      console.log("create result", res);
    } catch (err) {
      console.error(err);
      alert("Error creating inspection (see console)");
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="max-w-5xl p-6 mx-auto space-y-6 bg-white rounded shadow"
      >
        <h1 className="text-3xl font-bold text-sky-700">Create Inspection</h1>

        <div className="flex gap-2">
          {steps.map((s, i) => (
            <button
              key={s}
              type="button"
              className={`px-3 py-1 rounded text-sm ${
                step === i + 1 ? "bg-sky-600 text-white" : "bg-gray-100"
              }`}
              onClick={() => setStep(i + 1)}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="pt-4">
          {step === 1 && <GeneralInformation />}
          {step === 2 && <ComplianceStatus />}
          {step === 3 && <SummaryOfFindingsAndObservations />}
          {step === 4 && <Recommendations />}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <div>
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
          </div>

          <div className="flex gap-2">
            {step < steps.length && (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="px-4 py-2 text-white rounded bg-sky-600"
              >
                Next
              </button>
            )}

            {step === steps.length && (
              <button
                type="submit"
                className="px-4 py-2 text-white bg-green-600 rounded"
              >
                Submit Inspection
              </button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
