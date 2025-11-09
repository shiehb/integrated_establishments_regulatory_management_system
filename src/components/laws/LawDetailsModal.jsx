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
    <div className="relative w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
      <button
        type="button"
        onClick={onClose}
        className="absolute -top-4 -right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-lg transition hover:text-slate-700"
        aria-label="Close law details modal"
      >
        ×
      </button>

      <header className="mb-6">
        <p className="text-sm uppercase tracking-wide text-slate-400 font-semibold">
          Laws & Regulations
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-800">
          {law.law_title || law.reference_code}
        </h2>
        <p className="text-sm text-slate-500 mt-1">{law.reference_code}</p>
      </header>

      <section className="space-y-4">
        <div>
          <h3 className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            Category
          </h3>
          <p className="mt-1 text-sm text-slate-700">
            {law.category || "Uncategorized"}
          </p>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            Status
          </h3>
          <p className="mt-1 text-sm text-slate-700">{law.status}</p>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            Effective Date
          </h3>
          <p className="mt-1 text-sm text-slate-700">{effectiveDate}</p>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            Description
          </h3>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {law.description || "No description provided."}
          </p>
        </div>
      </section>
    </div>
  );
}

