import React, { useState, useEffect } from "react";
import { formatInput, validatePurposeOfInspection, validateVerifyAccuracyDetails, validateCommitmentStatusDetails } from "./utils";
import SectionHeader from "./SectionHeader";

/* ---------------------------
   Purpose of Inspection
   ---------------------------*/
export default function PurposeOfInspection({ state, setState, errors, isReadOnly = false }) {
  // State for validation
  const [purposeValidation, setPurposeValidation] = useState({ isValid: false, message: "" });
  const [accuracyDetailsValidation, setAccuracyDetailsValidation] = useState({ isValid: false, message: "" });
  const [commitmentDetailsValidation, setCommitmentDetailsValidation] = useState({ isValid: false, message: "" });

  // Validate purpose of inspection when state changes
  useEffect(() => {
    const validation = validatePurposeOfInspection(state);
    setPurposeValidation(validation);
  }, [state]);

  // Validate accuracy details when they change
  useEffect(() => {
    if (state.verify_accuracy) {
      const validation = validateVerifyAccuracyDetails(state.verify_accuracy_details);
      setAccuracyDetailsValidation(validation);
    } else {
      setAccuracyDetailsValidation({ isValid: false, message: "" });
    }
  }, [state.verify_accuracy, state.verify_accuracy_details]);

  // Validate commitment details when they change
  useEffect(() => {
    if (state.check_commitment_status) {
      const validation = validateCommitmentStatusDetails(state.commitment_status_details);
      setCommitmentDetailsValidation(validation);
    } else {
      setCommitmentDetailsValidation({ isValid: false, message: "" });
    }
  }, [state.check_commitment_status, state.commitment_status_details]);

  const purposes = [
    {
      id: "verify_accuracy",
      label:
        "Verify accuracy of information submitted by the establishment pertaining to new permit applications, renewals, or modifications.",
    },
    {
      id: "determine_compliance",
      label:
        "Determine compliance status with ECC conditions, compliance with commitments made during Technical Conference, permit conditions, and other requirements",
    },
    {
      id: "investigate_complaints",
      label: "Investigate community complaints.",
    },
    {
      id: "check_commitment_status",
      label: "Check status of commitment(s)",
    },
    { id: "other_purpose", label: "Others" },
  ];

  const accuracyDetailsOptions = [
    {
      id: "Permit to Operate Air (POA)",
      label: "Permit to Operate Air (POA)",
    },
    {
      id: "Discharge Permit (DP)",
      label: "Discharge Permit (DP)",
    },
    {
      id: "PMPIN Application",
      label: "PMPIN Application",
    },
    {
      id: "Hazardous Waste ID Registration",
      label: "Hazardous Waste ID Registration",
    },
    {
      id: "Hazardous Waste Transporter Registration",
      label: "Hazardous Waste Transporter Registration",
    },
    { id: "Others", label: "Others" },
  ];

  const commitmentStatusOptions = [
    {
      id: "Industrial Ecowatch",
      label: "Industrial Ecowatch",
    },
    {
      id: "Philippine Environmental Partnership Program (PEPP)",
      label: "Philippine Environmental Partnership Program (PEPP)",
    },
    {
      id: "Pollution Adjudication Board (PAB)",
      label: "Pollution Adjudication Board (PAB)",
    },
    { id: "Others", label: "Others" },
  ];

  const togglePurpose = (id) => {
    setState({
      ...state,
      [id]: !state[id],
    });
  };

  const toggleAccuracyDetail = (id) => {
    const arr = state.verify_accuracy_details || [];
    const exists = arr.includes(id);
    setState({
      ...state,
      verify_accuracy_details: exists ? arr.filter((d) => d !== id) : [...arr, id],
    });
  };

  const toggleCommitmentStatus = (id) => {
    const arr = state.commitment_status_details || [];
    const exists = arr.includes(id);
    setState({
      ...state,
      commitment_status_details: exists
        ? arr.filter((d) => d !== id)
        : [...arr, id],
    });
  };

  const updateField = (field, value, formatter = (v) => formatInput.upper(v)) =>
    setState({ ...state, [field]: formatter(value) });

  return (
    <section className="p-4 mb-6 bg-white border border-black">
      <SectionHeader title="Purpose of Inspection" />
      <div className="space-y-4">
        {purposes.map((p) => (
          <div key={p.id} className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={state[p.id] || false}
              onChange={() => togglePurpose(p.id)}
              className="w-4 h-4 mt-1 border-black"
              disabled={isReadOnly}
            />
            <div className="flex-1">
              <div className="text-black">{p.label}</div>

              {p.id === "verify_accuracy" &&
                state.verify_accuracy && (
                  <div className={`p-3 mt-3 ml-6 border rounded ${
                    accuracyDetailsValidation.isValid === false 
                      ? "border-red-500 bg-red-50" 
                      : "border-gray-300"
                  }`}>
                    <label className="block mb-2 text-sm font-medium text-black">
                      Verify accuracy of (select all that apply):
                      <span className="text-red-600">*</span>
                    </label>
                    <div className="space-y-2">
                      {accuracyDetailsOptions.map((item) => (
                        <div key={item.id} className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={(state.verify_accuracy_details || []).includes(
                                item.id
                              )}
                              onChange={() => toggleAccuracyDetail(item.id)}
                              className="w-4 h-4 border-black"
                              disabled={isReadOnly}
                            />
                            <span className="text-sm text-black">
                              {item.label}
                            </span>
                          </label>
                          {item.id === "Others" &&
                            (state.verify_accuracy_details || []).includes("Others") && (
                              <div className="mt-2 ml-6">
                                <label className="block mb-1 text-sm text-black">
                                  Specify other accuracy details:
                                  <span className="text-red-600">*</span>
                                </label>
                                <textarea
                                  value={state.verify_accuracy_others || ""}
                                  onChange={(e) =>
                                    updateField(
                                      "verify_accuracy_others",
                                      e.target.value
                                    )
                                  }
                                  placeholder="PLEASE SPECIFY..."
                                  className="w-full border border-black px-2 py-1 bg-white text-black min-h-[80px] uppercase"
                                  disabled={isReadOnly}
                                />
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                    {/* Validation message for accuracy details */}
                    {!accuracyDetailsValidation.isValid && accuracyDetailsValidation.message && (
                      <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
                        <p className="text-sm text-red-600">
                          ⚠️ {accuracyDetailsValidation.message}
                        </p>
                      </div>
                    )}
                  </div>
                )}

              {p.id === "check_commitment_status" &&
                state.check_commitment_status && (
                  <div className={`p-3 mt-3 ml-6 border rounded ${
                    commitmentDetailsValidation.isValid === false 
                      ? "border-red-500 bg-red-50" 
                      : "border-gray-300"
                  }`}>
                    <label className="block mb-2 text-sm font-medium text-black">
                      Check status of (select all that apply):
                      <span className="text-red-600">*</span>
                    </label>
                    <div className="space-y-2">
                      {commitmentStatusOptions.map((item) => (
                        <div key={item.id} className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={(
                                state.commitment_status_details || []
                              ).includes(item.id)}
                              onChange={() => toggleCommitmentStatus(item.id)}
                              className="w-4 h-4 border-black"
                              disabled={isReadOnly}
                            />
                            <span className="text-sm text-black">
                              {item.label}
                            </span>
                          </label>
                          {item.id === "Others" &&
                            (state.commitment_status_details || []).includes(
                              "Others"
                            ) && (
                              <div className="mt-2 ml-6">
                                <label className="block mb-1 text-sm text-black">
                                  Specify other commitment details:
                                  <span className="text-red-600">*</span>
                                </label>
                                <textarea
                                  value={state.commitment_status_others || ""}
                                  onChange={(e) =>
                                    updateField(
                                      "commitment_status_others",
                                      e.target.value
                                    )
                                  }
                                  placeholder="PLEASE SPECIFY..."
                                  className="w-full border border-black px-2 py-1 bg-white text-black min-h-[80px] uppercase"
                                  disabled={isReadOnly}
                                />
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                    {/* Validation message for commitment details */}
                    {!commitmentDetailsValidation.isValid && commitmentDetailsValidation.message && (
                      <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
                        <p className="text-sm text-red-600">
                          ⚠️ {commitmentDetailsValidation.message}
                        </p>
                      </div>
                    )}
                  </div>
                )}

              {p.id === "other_purpose" && state.other_purpose && (
                <div className="mt-3 ml-6">
                  <label className="block mb-1 text-sm text-black">
                    Specify other purpose:
                    <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={state.other_purpose_specify || ""}
                    onChange={(e) =>
                      updateField("other_purpose_specify", e.target.value)
                    }
                    placeholder="PLEASE SPECIFY..."
                    className="w-full border border-black px-2 py-1 bg-white text-black min-h-[80px] uppercase"
                    disabled={isReadOnly}
                  />
                  {/* Validation message for other purpose */}
                  {state.other_purpose && (!state.other_purpose_specify || state.other_purpose_specify.trim() === "") && (
                    <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
                      <p className="text-sm text-red-600">
                        ⚠️ Please specify the other purpose
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* General validation message */}
        {!purposeValidation.isValid && purposeValidation.message && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
            <p className="text-sm text-red-600">
              ⚠️ {purposeValidation.message}
            </p>
          </div>
        )}
        
        {/* Existing form validation errors */}
        {errors.purpose && (
          <p className="text-sm text-red-600">{errors.purpose}</p>
        )}
      </div>
    </section>
  );
}


