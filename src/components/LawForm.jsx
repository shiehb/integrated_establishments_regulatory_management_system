import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const lawSchema = z.object({
  law_title: z.string().min(3, "Law title is required"),
  reference_code: z.string().optional(),
  description: z.string().min(10, "Description is required"),
  category: z.string().min(2, "Category is required"),
  effective_date: z.string().min(1, "Effective date is required"),
  status: z.enum(["Active", "Inactive"]),
});

const defaultFormValues = {
  law_title: "",
  reference_code: "",
  description: "",
  category: "",
  effective_date: "",
  status: "Active",
};

export default function LawForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = "create",
}) {
  const mergedDefaults = useMemo(() => {
    return {
      ...defaultFormValues,
      ...defaultValues,
    };
  }, [defaultValues]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(lawSchema),
    defaultValues: mergedDefaults,
    mode: "onBlur",
  });

  useEffect(() => {
    reset(mergedDefaults);
  }, [mergedDefaults, reset]);

  const submitHandler = (values) => {
    onSubmit?.(values);
  };

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="space-y-6 bg-white rounded-xl border border-slate-200 shadow-sm p-6"
    >
      <header>
        <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">
          {mode === "edit" ? "Update Law" : "New Law"}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {mode === "edit"
            ? "Modify the details of the selected law. Changes will apply immediately once saved."
            : "Provide the complete details of the law or regulation you want to add."}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Law Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("law_title")}
            className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
              errors.law_title ? "border-red-400" : "border-slate-300"
            }`}
            placeholder="e.g., Clean Air Act"
            autoComplete="off"
          />
          {errors.law_title && (
            <p className="text-xs text-red-500">
              {errors.law_title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Reference Code
          </label>
          <input
            type="text"
            {...register("reference_code")}
            className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
              errors.reference_code ? "border-red-400" : "border-slate-300"
            }`}
            placeholder="e.g., RA 8749"
            autoComplete="off"
          />
          {errors.reference_code && (
            <p className="text-xs text-red-500">
              {errors.reference_code.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("description")}
            rows={5}
            className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
              errors.description ? "border-red-400" : "border-slate-300"
            }`}
            placeholder="Describe the scope and intent of the law."
          />
          {errors.description && (
            <p className="text-xs text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Category <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("category")}
            className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
              errors.category ? "border-red-400" : "border-slate-300"
            }`}
            placeholder="e.g., Environmental"
            autoComplete="off"
          />
          {errors.category && (
            <p className="text-xs text-red-500">
              {errors.category.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Effective Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register("effective_date")}
            className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
              errors.effective_date ? "border-red-400" : "border-slate-300"
            }`}
          />
          {errors.effective_date && (
            <p className="text-xs text-red-500">
              {errors.effective_date.message}
            </p>
          )}
        </div>

      </div>
      <input type="hidden" {...register("status")} />

      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-400"
          disabled={isSubmitting || (mode === "edit" && !isDirty)}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
              {mode === "edit" ? "Saving..." : "Creating..."}
            </span>
          ) : mode === "edit" ? (
            "Save Changes"
          ) : (
            "Create Law"
          )}
        </button>
      </div>
    </form>
  );
}

LawForm.defaultProps = {
  defaultValues: defaultFormValues,
};

