export default function LawDetailsModal({ law, onClose }) {
  if (!law) return null;

  const effectiveDate = law.effective_date
    ? new Date(law.effective_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="w-full max-w-2xl p-8 bg-white shadow-lg rounded-2xl">
      <h2 className="mb-6 text-2xl font-bold text-center text-sky-600">
        Law Details
      </h2>

      <div className="space-y-5 text-sm">
        <div>
          <label className="text-sm font-medium text-gray-700">Law Title</label>
          <p className="mt-1 text-sm text-gray-900 font-semibold">
            {law.law_title || "N/A"}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Reference Code</label>
          <p className="mt-1 text-sm text-gray-900">
            {law.reference_code || "N/A"}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Category</label>
          <p className="mt-1 text-sm text-gray-900">
            {law.category || "Uncategorized"}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Status</label>
          <p className="mt-1 text-sm text-gray-900">{law.status || "N/A"}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Effective Date</label>
          <p className="mt-1 text-sm text-gray-900">{effectiveDate}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Description</label>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-900">
            {law.description || "No description provided."}
          </p>
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 font-medium text-gray-700 transition bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

