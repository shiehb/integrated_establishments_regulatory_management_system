import React from "react";
import { formatInput } from "./utils";
import SectionHeader from "./SectionHeader";

/* ---------------------------
   Purpose of Inspection
   ---------------------------*/
export default function PurposeOfInspection({ state, setState, errors }) {
  const purposes = [
    {
      id: "VERIFY_ACCURACY",
      label:
        "Verify accuracy of information submitted by the establishment pertaining to new permit applications, renewals, or modifications.",
    },
    {
      id: "COMPLIANCE_STATUS",
      label:
        "Determine compliance status with ECC conditions, compliance with commitments made during Technical Conference, permit conditions, and other requirements",
    },
    {
      id: "INVESTIGATE_COMPLAINTS",
      label: "Investigate community complaints.",
    },
    {
      id: "CHECK_COMMITMENTS",
      label: "Check status of commitment(s)",
    },
    { id: "OTHER", label: "Others" },
  ];

  const accuracyDetailsOptions = [
    {
      id: "POA",
      label: "Permit to Operate Air (POA)",
    },
    {
      id: "DP",
      label: "Discharge Permit (DP)",
    },
    {
      id: "PMPIN",
      label: "PMPIN Application",
    },
    {
      id: "HW_ID",
      label: "Hazardous Waste ID Registration",
    },
    {
      id: "HW_TRANSPORTER",
      label: "Hazardous Waste Transporter Registration",
    },
    { id: "OTHER", label: "Others" },
  ];

  const commitmentStatusOptions = [
    {
      id: "ECOWATCH",
      label: "Industrial Ecowatch",
    },
    {
      id: "PEPP",
      label: "Philippine Environmental Partnership Program (PEPP)",
    },
    {
      id: "PAB",
      label: "Pollution Adjudication Board (PAB)",
    },
    { id: "OTHER", label: "Others" },
  ];

  const togglePurpose = (id) => {
    const arr = state.purposes || [];
    const exists = arr.includes(id);
    setState({
      ...state,
      purposes: exists ? arr.filter((p) => p !== id) : [...arr, id],
    });
  };

  const toggleAccuracyDetail = (id) => {
    const arr = state.accuracyDetails || [];
    const exists = arr.includes(id);
    setState({
      ...state,
      accuracyDetails: exists ? arr.filter((d) => d !== id) : [...arr, id],
    });
  };

  const toggleCommitmentStatus = (id) => {
    const arr = state.commitmentStatusDetails || [];
    const exists = arr.includes(id);
    setState({
      ...state,
      commitmentStatusDetails: exists
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
              checked={(state.purposes || []).includes(p.id)}
              onChange={() => togglePurpose(p.id)}
              className="w-4 h-4 mt-1 border-black"
            />
            <div className="flex-1">
              <div className="text-black">{p.label}</div>

              {p.id === "VERIFY_ACCURACY" &&
                (state.purposes || []).includes("VERIFY_ACCURACY") && (
                  <div className="p-3 mt-3 ml-6 border border-gray-300 rounded">
                    <label className="block mb-2 text-sm font-medium text-black">
                      Verify accuracy of (select all that apply):
                    </label>
                    <div className="space-y-2">
                      {accuracyDetailsOptions.map((item) => (
                        <div key={item.id} className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={(state.accuracyDetails || []).includes(
                                item.id
                              )}
                              onChange={() => toggleAccuracyDetail(item.id)}
                              className="w-4 h-4 border-black"
                            />
                            <span className="text-sm text-black">
                              {item.label}
                            </span>
                          </label>
                          {item.id === "OTHER" &&
                            (state.accuracyDetails || []).includes("OTHER") && (
                              <div className="mt-2 ml-6">
                                <label className="block mb-1 text-sm text-black">
                                  Specify other accuracy details:
                                </label>
                                <textarea
                                  value={state.accuracyOtherDetail || ""}
                                  onChange={(e) =>
                                    updateField(
                                      "accuracyOtherDetail",
                                      e.target.value
                                    )
                                  }
                                  placeholder="PLEASE SPECIFY..."
                                  className="w-full border border-black px-2 py-1 bg-white text-black min-h-[80px] uppercase"
                                />
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {p.id === "CHECK_COMMITMENTS" &&
                (state.purposes || []).includes("CHECK_COMMITMENTS") && (
                  <div className="p-3 mt-3 ml-6 border border-gray-300 rounded">
                    <label className="block mb-2 text-sm font-medium text-black">
                      Check status of (select all that apply):
                    </label>
                    <div className="space-y-2">
                      {commitmentStatusOptions.map((item) => (
                        <div key={item.id} className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={(
                                state.commitmentStatusDetails || []
                              ).includes(item.id)}
                              onChange={() => toggleCommitmentStatus(item.id)}
                              className="w-4 h-4 border-black"
                            />
                            <span className="text-sm text-black">
                              {item.label}
                            </span>
                          </label>
                          {item.id === "OTHER" &&
                            (state.commitmentStatusDetails || []).includes(
                              "OTHER"
                            ) && (
                              <div className="mt-2 ml-6">
                                <label className="block mb-1 text-sm text-black">
                                  Specify other commitment details:
                                </label>
                                <textarea
                                  value={state.commitmentOtherDetail || ""}
                                  onChange={(e) =>
                                    updateField(
                                      "commitmentOtherDetail",
                                      e.target.value
                                    )
                                  }
                                  placeholder="PLEASE SPECIFY..."
                                  className="w-full border border-black px-2 py-1 bg-white text-black min-h-[80px] uppercase"
                                />
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {p.id === "OTHER" && (state.purposes || []).includes("OTHER") && (
                <div className="mt-3 ml-6">
                  <label className="block mb-1 text-sm text-black">
                    Specify other purpose:
                  </label>
                  <textarea
                    value={state.otherPurpose || ""}
                    onChange={(e) =>
                      updateField("otherPurpose", e.target.value)
                    }
                    placeholder="PLEASE SPECIFY..."
                    className="w-full border border-black px-2 py-1 bg-white text-black min-h-[80px] uppercase"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        {errors.purpose && (
          <p className="text-sm text-red-600">{errors.purpose}</p>
        )}
      </div>
    </section>
  );
}
