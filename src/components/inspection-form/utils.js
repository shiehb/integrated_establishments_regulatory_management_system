/* ======================
   Input formatting helpers
   ====================== */
export const formatInput = {
  upper: (val) =>
    val === undefined || val === null ? "" : String(val).toUpperCase(),
  lower: (val) =>
    val === undefined || val === null ? "" : String(val).toLowerCase(),
  title: (val) =>
    val === undefined || val === null
      ? ""
      : String(val)
          .toLowerCase()
          .replace(/\b\w/g, (ch) => ch.toUpperCase()),
  numeric: (val) =>
    val === undefined || val === null ? "" : String(val).replace(/\D/g, ""),
  coords: (val) => (val ? String(val).trim() : ""),
};

/* ======================
   Date helpers
   ====================== */
export const toDateOnly = (input) => {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  // normalize to date-only (local)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

export const _isPastDate = (input) => {
  const d = toDateOnly(input);
  if (!d) return false;
  const today = toDateOnly(new Date());
  return d < today;
};

export const isFutureDate = (input) => {
  const d = toDateOnly(input);
  if (!d) return false;
  const today = toDateOnly(new Date());
  return d > today;
};

export const isSameOrAfter = (a, b) => {
  const da = toDateOnly(a);
  const db = toDateOnly(b);
  if (!da || !db) return false;
  return da >= db;
};
