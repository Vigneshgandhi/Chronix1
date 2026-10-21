"use client";


import { Check, CheckCheck, Copy, Edit3, FileText, Flag, Image as ImageIcon, Pin, Trash2, Video, X } from "lucide-react";
import { useEffect, useState } from "react";
import { decryptFile } from "../utils/crypto";

const BACKEND_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5001";

function formatFileSize(size) {
  if (!Number.isFinite(Number(size))) return "";
  const bytes = Number(size);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileSource(file) {
  const payload = file?.file || file?.blob || file;
  const remoteUrl = file?.url || file?.dataUrl || file?.previewUrl || file?.href;

  const normalizedRemoteUrl = typeof remoteUrl === "string" && remoteUrl
    ? new URL(remoteUrl, BACKEND_URL).toString()
    : "";

  return {
    payload,
    remoteUrl: normalizedRemoteUrl,
    type: file?.type || payload?.type || "",
    name: file?.name || payload?.name || "Attachment",
    size: file?.size ?? payload?.size,
  };
}

function createPreviewBlob(payload, type) {
  if (typeof Blob === "undefined" || !payload) return null;
  if (payload instanceof Blob) return payload;
  if (payload instanceof ArrayBuffer) return new Blob([payload], { type });
  if (ArrayBuffer.isView(payload)) return new Blob([payload], { type });

  // Supports a Buffer that was JSON-serialized by an API instead of sent as
  // a Socket.IO binary attachment.
  if (payload?.type === "Buffer" && Array.isArray(payload.data)) {
    return new Blob([new Uint8Array(payload.data)], { type });
  }

  return null;
}

function FilePreview({ file, privateKey }) {
  const { payload, remoteUrl, type, name, size } = getFileSource(file);
  const [objectUrl, setObjectUrl] = useState("");
  const [error, setError] = useState("");
  const isEncrypted = Boolean(file?.encryptedFileKey && file?.authTag && file?.iv);
  const source = isEncrypted ? objectUrl : remoteUrl || objectUrl;
  const isImage = type.startsWith("image/");
  const isVideo = type.startsWith("video/");
  const isPdf = type === "application/pdf" || name.toLowerCase().endsWith(".pdf");

  useEffect(() => {
    let active = true;

    if (isEncrypted) {
      if (!privateKey) {
        Promise.resolve().then(() => {
          if (active) setError("Unlock this device to preview the attachment.");
        });
        return undefined;
      }

      let url = "";
      decryptFile(file, privateKey)
        .then((blob) => {
          if (!active) return;
          url = URL.createObjectURL(blob);
          setObjectUrl(url);
        })
        .catch(() => {
          if (active) setError("Attachment decryption failed.");
        });

      return () => {
        active = false;
        if (url) URL.revokeObjectURL(url);
      };
    }

    if (remoteUrl) return undefined;
    const previewBlob = createPreviewBlob(payload, type);
    if (!previewBlob) return undefined;

    const url = URL.createObjectURL(previewBlob);
    const frame = requestAnimationFrame(() => setObjectUrl(url));
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      URL.revokeObjectURL(url);
    };
  }, [file, isEncrypted, payload, privateKey, remoteUrl, type]);

  return (
    <article className="mt-3 overflow-hidden rounded-xl border border-chronix-deep/10 bg-white/80 text-chronix-deep">
      {source && isImage && (
        <img src={source} alt={name} className="max-h-64 w-full object-cover" />
      )}
      {source && isVideo && (
        <video controls preload="metadata" className="max-h-64 w-full bg-chronix-elevated">
          <source src={source} type={type || undefined} />
          Your browser cannot preview this video.
        </video>
      )}
      {source && isPdf && (
        <iframe title={`Preview of ${name}`} src={source} className="h-64 w-full bg-white" />
      )}
      <div className="flex items-center gap-3 p-3 text-sm">
        <span className="rounded-lg bg-chronix-primary/10 p-2 text-chronix-primary">
          {isImage ? <ImageIcon size={18} /> : isVideo ? <Video size={18} /> : <FileText size={18} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{name}</p>
          {size !== undefined && <p className="text-xs text-slate-500">{formatFileSize(size)}</p>}
        </div>
        {error ? (
          <span className="text-xs text-red-600">{error}</span>
        ) : source ? (
          <a
            href={source}
            download={name}
            target={isEncrypted ? undefined : "_blank"}
            rel={isEncrypted ? undefined : "noreferrer"}
            className="rounded-lg px-3 py-2 text-xs font-semibold text-chronix-primary hover:bg-chronix-primary/10"
          >
            Open
          </a>
        ) : (
          <span className="text-xs text-slate-500">Preview unavailable</span>
        )}
      </div>
    </article>
  );
}

export default function MessageList({ messages = [], socket, chatId, privateKey }) {
  const safeMessages = Array.isArray(messages) ? messages : [];
  const [contextMenu, setContextMenu] = useState(null);
  const [reportStatus, setReportStatus] = useState("");

  async function reportMessage(message) {
    if (!socket?.connected) {
      setReportStatus("Report could not be submitted while disconnected.");
      return;
    }
    setReportStatus("Submitting report…");
    const files = [];
    try {
      for (const file of message.files || []) {
        if (!file?.url || !privateKey) continue;
        const blob = await decryptFile(file, privateKey);
        const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); });
        files.push({ name: file.name, type: file.type, size: file.size, dataUrl, encryptionVersion: file.encryptionVersion || 1 });
      }
    } catch {
      setReportStatus("The attachment could not be decrypted for reporting.");
      return;
    }
    socket.emit("message:report", { chatId, messageId: message.id, category: "other", reason: "User reported message content", content: { text: message.text || "", files, senderDeviceId: message.senderDeviceId } }, (result) => {
      setReportStatus(result?.success ? `Report submitted for manual verification (${result.reportId}).` : (result?.error || "Report could not be submitted."));
    });
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white px-4 py-6 sm:px-6">
      {reportStatus && <div className="mb-4 rounded-xl border border-chronix-secondary/20 bg-chronix-elevated px-4 py-3 text-center text-sm text-chronix-label" role="status">{reportStatus}</div>}
      <div className="mb-8 flex justify-center">
        <span className="rounded-full border border-chronix-secondary/70 bg-chronix-primary/15 px-4 py-2 text-xs text-chronix-label">
          Stored securely on this device
        </span>
      </div>

      {safeMessages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="max-w-sm text-center text-sm leading-6 text-slate-400">
            No messages yet. Send a message to start the conversation.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {safeMessages.map((message, index) => {
            if (!message) return null;
            const isSent = message.type === "sent";
            const messageKey = message.storageKey || message.id || `${message.chatId || "chat"}-${index}`;
            const files = Array.isArray(message.files)
              ? message.files
              : message.file
              ? [message.file]
              : [];

            return (
              <div key={messageKey} className={`flex ${isSent ? "justify-end" : "justify-start"}`} onContextMenu={(event) => { event.preventDefault(); setContextMenu({ message, x: event.clientX, y: event.clientY }); }}>
                <div className={`w-[50%] rounded-3xl px-5 py-4 shadow-lg ${isSent ? "rounded-br-md bg-chronix-primary text-white" : "rounded-bl-md border border-chronix-secondary/20 bg-chronix-elevated text-chronix-deep"}`}>
                  {message.moderationStatus === "removed" ? <p className="font-medium text-red-500">Message removed by Chronix moderation.</p> : <>
                  {message.pinned && <p className="mb-2 text-xs font-semibold text-amber-500">📌 Pinned</p>}
                  {!isSent && <p className="mb-2 text-xs font-semibold text-chronix-accent">{message.sender || "Anonymous Device"}</p>}
                  {message.text && <p className="break-words whitespace-pre-wrap leading-7">{message.text} {message.edited && <span className="text-xs opacity-60">(edited)</span>}</p>}
                  {files.map((file, fileIndex) => <FilePreview key={file?.id || `${file?.name || "file"}-${fileIndex}`} file={file} privateKey={privateKey} />)}
                  <div className={`mt-3 flex items-center justify-end gap-1 text-xs ${isSent ? "text-white/70" : "text-slate-400"}`}>
                    {message.time && <span>{message.time}</span>}
                    {isSent && (message.status === "read" ? <CheckCheck size={15} /> : <Check size={15} />)}
                  </div>
                  </>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {contextMenu && <div className="fixed z-50 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10" style={{ left: contextMenu.x, top: contextMenu.y }} onMouseLeave={() => setContextMenu(null)} role="menu" aria-label="Message actions">
        <div className="flex items-center justify-between px-3 py-2"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Message actions</p><p className="mt-0.5 max-w-44 truncate text-xs text-slate-500">{contextMenu.message.text || "Attachment"}</p></div><button onClick={() => setContextMenu(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Close menu"><X size={15} /></button></div>
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-800" onClick={() => { navigator.clipboard?.writeText(contextMenu.message.text || ""); setContextMenu(null); }}><Copy size={16} />Copy message</button>
        <button disabled={contextMenu.message.moderationStatus === "removed"} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-800 disabled:cursor-not-allowed disabled:opacity-40" onClick={() => { socket?.emit(contextMenu.message.pinned ? "message:unpin" : "message:pin", { chatId, messageId: contextMenu.message.id }); setContextMenu(null); }}><Pin size={16} />{contextMenu.message.pinned ? "Unpin message" : "Pin message"}</button>
        <button disabled={contextMenu.message.pinned || contextMenu.message.moderationStatus === "removed"} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-800 disabled:cursor-not-allowed disabled:opacity-40" onClick={() => { const text = window.prompt("Edit message", contextMenu.message.text); if (text !== null) socket?.emit("message:edit", { chatId, messageId: contextMenu.message.id, text }); setContextMenu(null); }}><Edit3 size={16} />Edit message</button>
        <div className="my-1 border-t border-slate-100" />
        <button disabled={contextMenu.message.moderationStatus === "removed"} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40" onClick={() => { socket?.emit("message:delete-for-me", { chatId, messageId: contextMenu.message.id }); setContextMenu(null); }}><Trash2 size={16} />Delete for me</button>
        <button disabled={contextMenu.message.pinned || contextMenu.message.moderationStatus === "removed" || contextMenu.message.type !== "sent"} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40" onClick={() => { socket?.emit("message:delete-for-everyone", { chatId, messageId: contextMenu.message.id }); setContextMenu(null); }}><Trash2 size={16} />Delete for everyone</button>
        <button disabled={contextMenu.message.moderationStatus === "removed"} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40" onClick={() => { if (window.confirm("Report this message?\n\nThe selected message will be securely submitted for manual verification.")) reportMessage(contextMenu.message); setContextMenu(null); }}><Flag size={16} />Report message</button>
      </div>}
    </div>
  );
}
