import { useMemo, useState } from "react";
import LawForm, { lawSchema } from "../../components/LawForm";
import { useNotifications } from "../../components/NotificationManager";
import * as lawApi from "../../services/lawApi";

const toFormDefaults = (law) => ({
  law_title: law?.law_title ?? "",
  reference_code: law?.reference_code ?? "",
  description: law?.description ?? "",
  category: law?.category ?? "",
  effective_date: law?.effective_date
    ? law.effective_date.includes("T")
      ? law.effective_date.split("T")[0]
      : law.effective_date
    : "",
  status: law?.status ?? "Inactive",
});

export default function EditLawModal({ law, onClose, onLawUpdated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notifications = useNotifications();

  const defaultValues = useMemo(() => toFormDefaults(law), [law]);

  const handleSubmit = async (values) => {
    if (!law) return;

    const parsed = lawSchema.safeParse(values);
    if (!parsed.success) {
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedLaw = await lawApi.updateLaw(law.id, parsed.data);

      notifications.success("Law updated successfully.", {
        title: "Law Updated",
        duration: 3000,
      });

      onLawUpdated?.(updatedLaw);
      onClose?.();
    } catch (error) {
      console.error("Error updating law:", error);
      notifications.error(error.message || "Failed to update law.", {
        title: "Update Error",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-3xl">
      <button
        type="button"
        onClick={onClose}
        className="absolute -top-4 -right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-lg transition hover:text-slate-700"
        aria-label="Close edit law modal"
      >
        ×
      </button>
      <LawForm
        mode="edit"
        defaultValues={defaultValues}
        isSubmitting={isSubmitting}
        onCancel={onClose}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

