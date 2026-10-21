"use client";

import { Ban, Search, Unlock } from "lucide-react";
import { useMemo, useState } from "react";

export default function BlockedDevices({ relationships = [], onUnblock }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => relationships.filter((item) => `${item.blockerDeviceId} ${item.blockedDeviceId}`.toLowerCase().includes(search.toLowerCase())), [relationships, search]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search device IDs" className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-cyan-600" />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500"><Ban size={16} />{relationships.length} active block{relationships.length === 1 ? "" : "s"}</div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Blocking device</th><th>Blocked device</th><th>Status</th><th className="px-5">Action</th></tr></thead>
          <tbody>
            {filtered.map((item) => <tr key={`${item.blockerDeviceId}:${item.blockedDeviceId}`} className="border-t border-slate-100"><td className="px-5 py-4 font-mono text-xs">{item.blockerDeviceId}</td><td className="font-mono text-xs">{item.blockedDeviceId}</td><td><span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">Blocked</span></td><td className="px-5"><button onClick={() => onUnblock(item)} className="inline-flex items-center gap-2 font-semibold text-cyan-700 hover:text-cyan-900"><Unlock size={15} />Unblock</button></td></tr>)}
            {filtered.length === 0 && <tr><td colSpan="4" className="px-5 py-10 text-center text-slate-500">No blocked-device relationships found.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
