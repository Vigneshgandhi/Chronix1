const styles = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  manual_review: "bg-amber-50 text-amber-800 ring-amber-200",
  accepted: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  rejected: "bg-slate-100 text-slate-700 ring-slate-200",
  removed: "bg-red-50 text-red-800 ring-red-200",
  not_violation: "bg-slate-100 text-slate-700 ring-slate-200",
};

export default function StatusBadge({ status = "pending" }) {
  const label = String(status).replaceAll("_", " ");
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${styles[status] || styles.pending}`}>{label}</span>;
}
