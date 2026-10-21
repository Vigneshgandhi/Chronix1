"use client";

import { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function AiSafetyBanner({
  riskLevel = "Medium",
  findings = [
    "Possible phishing attempt detected.",
    "Suspicious request for money.",
    "Conversation contains abusive language.",
  ],
  onReview,
  onReport,
  onDismiss,
}) {
  const [expanded, setExpanded] = useState(false);

  const riskStyles = {
    Low: {
      badge: "bg-green-500/20 text-green-400 border-green-500/30",
      icon: "text-green-400",
    },
    Medium: {
      badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      icon: "text-yellow-400",
    },
    High: {
      badge: "bg-red-500/20 text-red-400 border-red-500/30",
      icon: "text-red-400",
    },
  };

  const current = riskStyles[riskLevel] || riskStyles.Medium;

  return (
    <div className="mx-6 mt-5 rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-red-500/10 backdrop-blur">

      {/* Header */}

      <div className="flex items-start justify-between p-5">

        <div className="flex gap-4">

          <div className="rounded-xl bg-yellow-500/10 p-3">
            <ShieldAlert className={`h-6 w-6 ${current.icon}`} />
          </div>

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <h3 className="text-lg font-semibold text-white">
                AI Safety Review
              </h3>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${current.badge}`}
              >
                {riskLevel} Risk
              </span>

            </div>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Chronix AI has identified content that may require your attention.
              Please review the conversation before deciding whether to ignore,
              block, or report it.
            </p>

          </div>

        </div>

        <button
          onClick={onDismiss}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <X size={18} />
        </button>

      </div>

      {/* Expand */}

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between border-t border-white/10 px-5 py-3 text-sm text-cyan-400 hover:bg-white/5"
      >
        <span>View AI Findings</span>

        {expanded ? (
          <ChevronUp size={18} />
        ) : (
          <ChevronDown size={18} />
        )}
      </button>

      {/* Findings */}

      {expanded && (
        <div className="border-t border-white/10 px-5 py-5">

          <div className="space-y-4">

            {findings.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-xl bg-[#0B1220] p-4"
              >
                <AlertTriangle
                  className={current.icon}
                  size={18}
                />

                <p className="text-sm leading-6 text-slate-300">
                  {item}
                </p>

              </div>
            ))}

          </div>

          <div className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">

            <div className="flex items-start gap-3">

              <ShieldCheck
                className="mt-0.5 text-cyan-400"
                size={18}
              />

              <p className="text-sm leading-6 text-slate-300">
                AI analysis is advisory only. Chronix does not automatically
                report conversations. You remain in control of whether to take
                action.
              </p>

            </div>

          </div>

        </div>
      )}

      {/* Actions */}

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/10 p-5">

        <button
          onClick={onReview}
          className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 font-medium text-cyan-300 transition hover:bg-cyan-500/20"
        >
          Review Conversation
        </button>

        <button
          onClick={onReport}
          className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-600"
        >
          <FileText size={18} />
          Prepare Report
        </button>

      </div>

    </div>
  );
}