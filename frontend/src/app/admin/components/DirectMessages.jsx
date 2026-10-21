"use client";

import { MessageSquare, Paperclip, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { formatTimestamp } from "../utils";

function participants(chatId) {
  return String(chatId || "")
    .split(":")
    .filter(Boolean);
}

export default function DirectMessages({ chats = [], messages = [], selectedChatId, onSelectChat, loading }) {
  const [search, setSearch] = useState("");
  const filteredChats = useMemo(() => chats.filter((chat) => {
    const value = `${chat.chatId} ${chat.lastMessage?.text || ""}`.toLowerCase();
    return value.includes(search.toLowerCase());
  }), [chats, search]);

  return (
    <section className="grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)]">
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conversations" className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-cyan-600" />
          </div>
        </div>
        <div className="max-h-[620px] overflow-y-auto">
          {filteredChats.map((chat) => (
            <button key={chat.chatId} onClick={() => onSelectChat(chat.chatId)} className={`w-full border-b border-slate-100 p-4 text-left hover:bg-slate-50 ${selectedChatId === chat.chatId ? "bg-cyan-50" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2 font-semibold text-slate-800"><MessageSquare size={16} className="shrink-0 text-cyan-700" /><span className="truncate">{participants(chat.chatId).join(" ↔ ") || chat.chatId}</span></span>
                <span className="shrink-0 text-xs text-slate-400">{chat.messageCount}</span>
              </div>
              <p className="mt-2 truncate text-xs text-slate-500">{chat.lastMessage?.text || (chat.lastMessage?.files?.length ? "Attachment" : "No text content")}</p>
            </button>
          ))}
          {filteredChats.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No direct conversations found.</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        {!selectedChatId ? (
          <div className="grid min-h-[300px] place-items-center p-8 text-center text-sm text-slate-500"><div><MessageSquare size={28} className="mx-auto mb-3 text-cyan-700" /><p>Select a conversation to inspect its messages.</p></div></div>
        ) : (
          <>
            <div className="border-b border-slate-200 p-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Direct conversation</p><h2 className="mt-1 font-mono text-sm text-cyan-800">{selectedChatId}</h2></div>
            <div className="max-h-[620px] space-y-3 overflow-y-auto p-5">
              {loading && <p className="text-sm text-slate-500">Loading messages…</p>}
              {!loading && messages.map((message) => <article key={message.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-mono text-xs font-semibold text-cyan-800">{message.senderDeviceId || "Unknown sender"}</span><span className="text-xs text-slate-400">{formatTimestamp(message.timestamp)}</span></div>{message.text && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">{message.text}</p>}{message.files?.length > 0 && <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-500"><Paperclip size={14} />{message.files.length} attachment{message.files.length === 1 ? "" : "s"}</p>}</article>)}
              {!loading && messages.length === 0 && <p className="text-sm text-slate-500">No messages are available for this conversation.</p>}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
