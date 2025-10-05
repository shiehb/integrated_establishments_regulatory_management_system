import React from "react";

/* ---------------------------
   Section header
   ---------------------------*/
export default function SectionHeader({ title }) {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold text-sky-700">{title}</h2>
      <div className="mt-2 border-b border-black" />
    </div>
  );
}
