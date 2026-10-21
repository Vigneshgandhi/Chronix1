import { CheckCircle2, FileWarning, ShieldAlert, Trash2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatTimestamp } from "../utils";

function Stat({ icon: Icon, label, value, detail, color }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <span className={`rounded-xl p-3 ${color}`}>
          <Icon size={20} />
        </span>
      </div>
      <p className="mt-4 text-xs font-medium text-slate-500">{detail}</p>
    </article>
  );
}

export default function AdminDashboard({ reports, audit, onView }) {
  const count = (status) =>
    reports.filter((report) => report.status === status).length;
  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={ShieldAlert}
          label="Pending Reports"
          value={
            reports.filter(
              (report) => !["accepted", "rejected"].includes(report.status),
            ).length
          }
          detail="Needs administrator review"
          color="bg-amber-50 text-amber-700"
        />
        <Stat
          icon={CheckCircle2}
          label="Accepted Reports"
          value={count("accepted")}
          detail="Confirmed policy violations"
          color="bg-emerald-50 text-emerald-700"
        />
        <Stat
          icon={FileWarning}
          label="Rejected Reports"
          value={count("rejected")}
          detail="Content retained"
          color="bg-slate-100 text-slate-700"
        />
        <Stat
          icon={Trash2}
          label="Removed Content"
          value={
            reports.filter((report) => report.contentState === "removed").length
          }
          detail="Removed after review"
          color="bg-red-50 text-red-700"
        />
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-bold">Recent reports</h2>
            <p className="mt-1 text-sm text-slate-500">
              Latest moderation activity across Chronix.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Report</th>
                <th>Reporter</th>
                <th>Reported user</th>
                <th>Content</th>
                <th>AI status</th>
                <th>Status</th>
                <th className="px-5">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.slice(0, 6).map((report) => (
                <tr key={report.id} className="border-t border-slate-100">
                  <td className="px-5 py-4 font-mono text-xs text-cyan-800">
                    {report.id}
                  </td>
                  <td>
                    {report.reporterProfileName ||
                      report.reporterDeviceId ||
                      "Unknown"}
                  </td>
                  <td>
                    {report.reportedProfileName ||
                      report.reportedDeviceId ||
                      "Unknown"}
                  </td>
                  <td className="capitalize">
                    {report.contentType?.split("/")[0] || "contact"}
                  </td>
                  <td>
                    <StatusBadge
                      status={
                        report.aiResult?.aiDecision === "violation"
                          ? "manual_review"
                          : report.analysisStatus || "pending"
                      }
                    />
                  </td>
                  <td>
                    <StatusBadge status={report.status || "pending"} />
                  </td>
                  <td className="px-5">
                    <button
                      onClick={() => onView(report)}
                      className="font-semibold text-cyan-700 hover:text-cyan-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold">Security activity</h2>
        <div className="mt-4 space-y-3">
          {audit
            .slice(-5)
            .reverse()
            .map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0"
              >
                <span className="mt-0.5 rounded-full bg-cyan-50 p-2 text-cyan-700">
                  <ShieldAlert size={15} />
                </span>
                <div>
                  <p className="text-sm font-medium">
                    {String(entry.action || "Security event").replaceAll(
                      "_",
                      " ",
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {entry.targetDeviceId || entry.reportId || "Chronix"} ·{" "}
                    {entry.timestamp
                      ? formatTimestamp(entry.timestamp)
                      : "Just now"}
                  </p>
                </div>
              </div>
            )) || (
            <p className="text-sm text-slate-500">
              No administrative activity yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
