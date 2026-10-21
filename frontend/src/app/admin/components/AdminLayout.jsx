"use client";

import {
  Activity,
  BadgeCheck,
  Ban,
  FileWarning,
  LayoutDashboard,
  LogOut,
  MonitorSmartphone,
  MessageSquare,
  RefreshCw,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { formatTimestamp } from "../utils";

const navigation = [
  ["overview", "Overview", LayoutDashboard],
  ["reports", "Reports", FileWarning],
  ["users", "Users", Users],
  ["devices", "Devices", MonitorSmartphone],
  ["messages", "Direct Messages", MessageSquare],
  ["moderation", "Moderation", ShieldCheck],
  ["blocked", "Blocked Devices", Ban],
  ["audit", "Audit Log", Activity],
];

export default function AdminLayout({
  page,
  onNavigate,
  onLogout,
  title,
  description,
  isLive,
  lastUpdated,
  onRefresh,
  children,
}) {
  return (
    <main className="min-h-screen bg-[#f7fafc] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[268px] shrink-0 border-r border-slate-200 bg-white p-5 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-600 text-lg font-black text-white">
              C
            </div>
            <div>
              <p className="font-bold tracking-tight">Chronix</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
                Admin console
              </p>
            </div>
          </div>
          <nav className="mt-8 space-y-1" aria-label="Admin navigation">
            {navigation.map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium ${page === id ? "bg-cyan-50 text-cyan-800" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <Icon size={18} aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>
          <div className="mt-8 border-t border-slate-200 pt-5">
            <p className="px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              System
            </p>
            <button
              onClick={() => onNavigate("settings")}
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Settings size={18} />
              Settings
            </button>
          </div>
          <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-cyan-100 font-bold text-cyan-800">
                A
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Chronix Admin</p>
                <p className="flex items-center gap-1 text-xs text-cyan-700">
                  <BadgeCheck size={13} />
                  Administrator
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <LogOut size={15} />
              Log out
            </button>
          </div>
        </aside>
        <section className="min-w-0 flex-1">
          <header className="flex min-h-[82px] items-center justify-between gap-5 border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
            <div>
              <p className="text-xl font-bold tracking-tight">{title}</p>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <div
                className={`flex items-center gap-2 text-xs font-semibold ${isLive ? "text-emerald-700" : "text-slate-500"}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${isLive ? "bg-emerald-500" : "bg-slate-400"}`}
                />
                {isLive ? "Live" : "Offline"}
              </div>
              {lastUpdated && (
                <span className="text-xs text-slate-400">
                  Updated {formatTimestamp(lastUpdated)}
                </span>
              )}
              <button
                onClick={onRefresh}
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                aria-label="Refresh admin data"
              >
                <RefreshCw size={16} />
              </button>
              <div className="grid h-9 w-9 place-items-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-800">
                A
              </div>
            </div>
          </header>
          <div className="p-5 sm:p-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
