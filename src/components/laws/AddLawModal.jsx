import { useState } from "react";
import LawForm, { lawSchema } from "../../components/LawForm";
import { useNotifications } from "../../components/NotificationManager";
import * as lawApi from "../../services/lawApi";

const defaultValues = {
  law_title: "",
  reference_code: "",
  description: "",
  category: "",
  effective_date: "",
  status: "Active",
};

export default function AddLawModal({ onClose, onLawAdded }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notifications = useNotifications();

  const handleSubmit = async (values) => {
    const parsed = lawSchema.safeParse(values);
    if (!parsed.success) {
      return;
    }

    setIsSubmitting(true);
    try {
      const newLaw = await lawApi.createLaw(parsed.data);

      notifications.success("Law created successfully.", {
        title: "Law Created",
        duration: 3000,
      });

      onLawAdded?.(newLaw);
      onClose?.();
    } catch (error) {
      console.error("Error creating law:", error);
      notifications.error(error.message || "Failed to create law.", {
        title: "Creation Error",
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
        aria-label="Close add law modal"
      >
        ×
      </button>
      <LawForm
        mode="create"
        defaultValues={defaultValues}
        isSubmitting={isSubmitting}
        onCancel={onClose}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

