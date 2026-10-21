"use client";

import { FileText, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function ReportContentPreview({ message, token, backendUrl }) {
  const [sources, setSources] = useState({});
  const [errors, setErrors] = useState({});
  const files = useMemo(() => message?.files || [], [message]);
  useEffect(() => {
    let live = true;
    const urls = [];
    Promise.all(
      files.map(async (file, index) => {
        if (file?.dataUrl) {
          if (live)
            setSources((current) => ({ ...current, [index]: file.dataUrl }));
          return;
        }
        try {
          const attachmentUrl = new URL(file?.url || "", backendUrl);
          const name = decodeURIComponent(
            attachmentUrl.pathname.split("/").filter(Boolean).pop() || "",
          );
          if (!name) throw new Error("Attachment filename is missing.");
          const response = await fetch(
            `${backendUrl}/api/admin/files/${encodeURIComponent(name)}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (!response.ok) throw new Error(`Preview request failed (${response.status}).`);
          const url = URL.createObjectURL(await response.blob());
          urls.push(url);
          if (live) setSources((current) => ({ ...current, [index]: url }));
        } catch (error) {
          if (live) setErrors((current) => ({ ...current, [index]: error.message }));
        }
      }),
    ).catch(() => {});
    return () => {
      live = false;
      urls.forEach(URL.revokeObjectURL);
    };
  }, [backendUrl, files, token]);
  if (!message)
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
        No linked message content is available for this report.
      </div>
    );
  return (
    <div className="space-y-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Reported message
        </p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">
          {message.text || "[Attachment-only message]"}
        </p>
      </article>
      {files.map((file, index) => {
        const source = sources[index];
        const error = errors[index];
        const type = file?.type || "";
        return (
          <article
            key={`${file?.name || "file"}-${index}`}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FileText size={17} className="text-cyan-700" />
              {file?.name || "Attachment"}
            </div>
            {error ? (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            ) : !source ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <LoaderCircle size={15} className="animate-spin" />
                Loading secure preview…
              </p>
            ) : type.startsWith("image/") ? (
              <img
                src={source}
                alt={file?.name || "Reported attachment"}
                className="mt-4 max-h-[480px] w-full rounded-xl object-contain"
              />
            ) : type.startsWith("video/") ? (
              <video
                controls
                className="mt-4 max-h-[480px] w-full rounded-xl"
                src={source}
              />
            ) : type.startsWith("audio/") ? (
              <audio controls className="mt-4 w-full" src={source} />
            ) : type === "application/pdf" ||
              file?.name?.toLowerCase().endsWith(".pdf") ? (
              <iframe
                title={file?.name || "Document preview"}
                src={source}
                className="mt-4 h-[480px] w-full rounded-xl border"
              />
            ) : (
              <a
                href={source}
                download={file?.name || "attachment"}
                className="mt-4 inline-block text-sm font-semibold text-cyan-700"
              >
                Download controlled preview
              </a>
            )}
          </article>
        );
      })}
    </div>
  );
}
