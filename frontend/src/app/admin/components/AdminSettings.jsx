"use client";

import { CheckCircle2, Clock3, Database, Globe2, RefreshCw, ShieldCheck } from "lucide-react";
import { useState } from "react";

function SettingRow({ icon: Icon, label, value, detail }) {
  return <div className="flex items-start gap-4 border-b border-slate-100 py-4 last:border-0"><span className="rounded-xl bg-cyan-50 p-2.5 text-cyan-700"><Icon size={18} /></span><div className="min-w-0"><p className="font-semibold text-slate-800">{label}</p><p className="mt-1 break-all font-mono text-sm text-slate-600">{value}</p>{detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}</div></div>;
}

export default function AdminSettings({ settings, onRefresh, loading, autoRefresh, refreshInterval, onAutoRefreshChange, onRefreshIntervalChange }) {
  return <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
    <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between gap-4"><div><h2 className="font-bold">Runtime configuration</h2><p className="mt-1 text-sm text-slate-500">Read-only service values and security state.</p></div><button onClick={onRefresh} disabled={loading} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50" aria-label="Refresh settings"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button></div><div className="mt-3">{settings ? <><SettingRow icon={Globe2} label="Client URL" value={settings.clientUrl} /><SettingRow icon={Globe2} label="Backend URL" value={settings.backendUrl} /><SettingRow icon={Clock3} label="Admin session duration" value={`${settings.sessionDurationHours} hours`} /><SettingRow icon={Database} label="Message encryption" value={settings.messageEncryption ? "Enabled" : "Disabled"} detail="Messages remain encrypted at rest in backend storage." /><SettingRow icon={ActivityIcon} label="Backend uptime" value={`${Math.floor(settings.uptimeSeconds / 3600)}h ${Math.floor((settings.uptimeSeconds % 3600) / 60)}m`} /></> : <p className="py-8 text-sm text-slate-500">Loading settings…</p>}</div></div>
    <div className="space-y-5"><div className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Console preferences</h2><label className="mt-5 flex items-center justify-between gap-4 text-sm font-medium"><span><span className="block">Automatic data refresh</span><span className="mt-1 block text-xs font-normal text-slate-500">Refresh reports and device data in the background.</span></span><input type="checkbox" checked={autoRefresh} onChange={(event) => onAutoRefreshChange(event.target.checked)} className="h-4 w-4 accent-cyan-700" /></label><label className="mt-5 block text-sm font-medium">Refresh interval<select value={refreshInterval} onChange={(event) => onRefreshIntervalChange(event.target.value)} disabled={!autoRefresh} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-cyan-600"><option value="5">5 seconds</option><option value="10">10 seconds</option><option value="30">30 seconds</option></select></label></div><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><div className="flex items-center gap-2 font-semibold text-emerald-800"><CheckCircle2 size={18} />Admin access protected</div><p className="mt-2 text-sm leading-6 text-emerald-800/80">Sensitive values are kept in server environment configuration and are not shown in this console.</p></div></div>
  </section>;
}

function ActivityIcon(props) {
  return <ShieldCheck {...props} />;
}
