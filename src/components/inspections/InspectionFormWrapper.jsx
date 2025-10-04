import { useState } from "react";
import InspectionForm from "./InspectionForm";

export default function InspectionFormWrapper({ 
  inspectionData, 
  onSave, 
  onClose, 
  userLevel,
  role 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (formData) => {
    setIsSubmitting(true);
    try {
      // Call the parent's save handler
      if (onSave) {
        await onSave(formData);
      }
    } catch (error) {
      console.error('Error saving inspection form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Always return to inspection list when closing
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-white">
      <InspectionForm
        inspectionData={inspectionData}
        onSave={handleSave}
        onClose={handleClose}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
