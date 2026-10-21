"use client";

import { ArrowLeft, Bot, ShieldAlert } from "lucide-react";
import { useState } from "react";
import ReportContentPreview from "./ReportContentPreview";
import StatusBadge from "./StatusBadge";
import { formatTimestamp } from "../utils";

export default function ReportDetails({
  report,
  message,
  loading,
  token,
  backendUrl,
  onBack,
  onDecision,
}) {
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);
  const ai = report.aiResult || {};
  return (
    <div>
      <button
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700"
      >
        <ArrowLeft size={16} />
        Back to reports
      </button>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_390px]">
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Reported content</h2>
            <p className="mt-1 text-sm text-slate-500">
              Secure, administrator-only preview.
            </p>
          </div>
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
              Loading report content…
            </div>
          ) : (
            <ReportContentPreview
              message={message}
              token={token}
              backendUrl={backendUrl}
            />
          )}
        </section>
        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-cyan-800">{report.id}</p>
                <h2 className="mt-1 font-bold">Report information</h2>
              </div>
              <StatusBadge status={report.status || "pending"} />
            </div>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Reporter
                </dt>
                <dd className="mt-1 font-medium">
                  {report.reporterProfileName ||
                    report.reporterProfile?.name ||
                    "Unknown"}
                </dd>
                <dd className="font-mono text-xs text-slate-500">
                  {report.reporterDeviceId}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Reported user
                </dt>
                <dd className="mt-1 font-medium">
                  {report.reportedProfileName ||
                    report.reportedProfile?.name ||
                    "Unknown"}
                </dd>
                <dd className="font-mono text-xs text-slate-500">
                  {report.reportedDeviceId}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Reason
                </dt>
                <dd className="mt-1 text-slate-700">
                  {report.description ||
                    report.reportReason ||
                    report.reason ||
                    "No reason supplied."}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Reference
                </dt>
                <dd className="mt-1 font-mono text-xs text-slate-600">
                  Chat: {report.chatId || "—"}
                  <br />
                  Message: {report.messageId || "—"}
                </dd>
              </div>
            </dl>
          </section>
          <section className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-5">
            <div className="flex gap-2">
              <Bot size={19} className="text-cyan-700" />
              <h2 className="font-bold">AI Moderation Analysis</h2>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">Decision</p>
                <p className="mt-1 font-semibold capitalize">
                  {ai.aiDecision?.replaceAll("_", " ") || "Unavailable"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Confidence</p>
                <p className="mt-1 font-semibold">
                  {typeof ai.confidence === "number"
                    ? `${Math.round(ai.confidence * 100)}%`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Category</p>
                <p className="mt-1 font-semibold capitalize">
                  {ai.category || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Analyzed</p>
                <p className="mt-1 text-xs font-semibold">
                  {ai.analyzedAt
                    ? formatTimestamp(ai.analyzedAt)
                    : "—"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-600">
              AI analysis assists administrator review. Final moderation
              decisions are made by Chronix administrators.
            </p>
          </section>
          {!["accepted", "rejected"].includes(report.status) && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="font-bold">Administrator action</h2>
              <label className="mt-4 block text-sm font-medium">
                Decision reason (optional)
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className="mt-2 min-h-20 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-cyan-600"
                  placeholder="Add a review note"
                />
              </label>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => onDecision("rejected", reason)}
                  className="flex-1 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50"
                >
                  Reject report
                </button>
                <button
                  onClick={() => setConfirming(true)}
                  className="flex-1 rounded-xl bg-cyan-700 px-3 py-2.5 text-sm font-bold text-white hover:bg-cyan-800"
                >
                  Accept report
                </button>
              </div>
              {confirming && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex gap-2">
                    <ShieldAlert
                      size={18}
                      className="shrink-0 text-amber-700"
                    />
                    <p className="text-sm text-amber-900">
                      Accept this report? This will remove the reported content
                      from both participants&apos; chat views.
                    </p>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => setConfirming(false)}
                      className="rounded-lg px-3 py-2 text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => onDecision("accepted", reason)}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                    >
                      Accept and remove
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
