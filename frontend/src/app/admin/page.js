"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminDashboard from "./components/AdminDashboard";
import AdminSettings from "./components/AdminSettings";
import AdminLayout from "./components/AdminLayout";
import AuditLog from "./components/AuditLog";
import BlockedDevices from "./components/BlockedDevices";
import DirectMessages from "./components/DirectMessages";
import ReportDetails from "./components/ReportDetails";
import StatusBadge from "./components/StatusBadge";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5001";
const copy = {
  overview: [
    "Security overview",
    "Monitor reports, actions, and moderation activity.",
  ],
  reports: [
    "Reports",
    "Review reported Chronix content and make a final decision.",
  ],
  moderation: [
    "Moderation queue",
    "Reports requiring manual Chronix verification.",
  ],
  users: ["Users", "Chronix profiles involved in reports."],
  devices: [
    "Devices",
    "Review Chronix device identities and moderation history.",
  ],
  messages: ["Direct messages", "Inspect encrypted Chronix conversations available to administrators."],
  blocked: ["Blocked devices", "Devices blocked by Chronix users."],
  audit: ["Audit log", "Administrator decisions and security events."],
  settings: ["Settings", "Admin console configuration."],
};
function api(path, token, options = {}) {
  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  }).then(async (response) => {
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed.");
    return data;
  });
}

function Login({ onLogin }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    verificationCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to sign in.");
      onLogin(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8"
      >
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-700">
          Chronix Admin
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Manual verification portal
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Use administrator credentials and a verification code to access
          protected moderation records.
        </p>
        {[
          ["username", "Username", "text"],
          ["password", "Password", "password"],
          ["verificationCode", "Manual verification code", "text"],
        ].map(([key, label, type]) => (
          <label key={key} className="mt-5 block text-sm font-semibold">
            {label}
            <input
              required
              type={type}
              value={form[key]}
              onChange={(event) =>
                setForm({ ...form, [key]: event.target.value })
              }
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-cyan-600"
            />
          </label>
        ))}
        {error && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-cyan-700 px-4 py-3 font-bold text-white hover:bg-cyan-800 disabled:opacity-60"
        >
          {loading ? "Verifying…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
function ReportsList({ reports, onView }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = reports.filter((report) => {
    const text =
      `${report.id} ${report.reporterDeviceId} ${report.reportedDeviceId} ${report.reportReason || report.reason || ""}`.toLowerCase();
    return (
      (status === "all" || report.status === status) &&
      text.includes(search.toLowerCase())
    );
  });
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:flex-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search reports, device ID, or reason"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-600"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Report ID</th>
              <th>Reporter</th>
              <th>Reported user</th>
              <th>Content</th>
              <th>Reason</th>
              <th>AI status</th>
              <th>Status</th>
              <th className="px-5">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((report) => (
              <tr key={report.id} className="border-t border-slate-100">
                <td className="px-5 py-4 font-mono text-xs text-cyan-800">
                  {report.id}
                </td>
                <td>{report.reporterProfileName || report.reporterDeviceId}</td>
                <td>{report.reportedProfileName || report.reportedDeviceId}</td>
                <td className="capitalize">
                  {report.contentType?.split("/")[0] || "contact"}
                </td>
                <td className="max-w-48 truncate">
                  {report.reportReason || report.reason || "—"}
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
                    className="font-semibold text-cyan-700"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="px-5 py-10 text-center text-slate-500"
                >
                  No matching reports.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
function Directory({ reports, kind }) {
  const devices = useMemo(
    () =>
      Array.from(
        new Map(
          reports
            .flatMap((report) => [
              [
                report.reporterDeviceId,
                report.reporterProfileName || report.reporterProfile?.name,
              ],
              [
                report.reportedDeviceId,
                report.reportedProfileName || report.reportedProfile?.name,
              ],
            ])
            .filter(([id]) => id),
        ).entries(),
      ).map(([id, name]) => ({
        id,
        name,
        reports: reports.filter(
          (report) =>
            report.reporterDeviceId === id || report.reportedDeviceId === id,
        ).length,
      })),
    [reports],
  );
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[650px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">
              {kind === "users" ? "Profile" : "Device ID"}
            </th>
            <th>{kind === "users" ? "Chronix device ID" : "Profile"}</th>
            <th>Reports</th>
            <th>Account status</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr key={device.id} className="border-t border-slate-100">
              <td className="px-5 py-4">
                {kind === "users" ? (
                  device.name || "Unknown profile"
                ) : (
                  <span className="font-mono text-xs">{device.id}</span>
                )}
              </td>
              <td>
                {kind === "users" ? (
                  <span className="font-mono text-xs">{device.id}</span>
                ) : (
                  device.name || "Unknown profile"
                )}
              </td>
              <td>{device.reports}</td>
              <td>
                <StatusBadge status="pending" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default function AdminPage() {
  const [token, setToken] = useState("");
  const [page, setPage] = useState("overview");
  const [reports, setReports] = useState([]);
  const [audit, setAudit] = useState([]);
  const [blockedDevices, setBlockedDevices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState("10");
  const load = useCallback(async (tokenValue, background = false) => {
    if (!background) setLoading(true);
    try {
      const [reportData, auditData, chatData, blockedData, settingsData] = await Promise.all([
        api("/api/admin/reports", tokenValue),
        api("/api/admin/audit-log", tokenValue),
        api("/api/admin/chats", tokenValue),
        api("/api/admin/blocked-devices", tokenValue),
        api("/api/admin/settings", tokenValue),
      ]);
      setReports(reportData.reports || []);
      setAudit(auditData.entries || []);
      setChats(chatData.chats || []);
      setBlockedDevices(blockedData.relationships || []);
      setSettings(settingsData.settings || null);
      setLastUpdated(new Date());
      setIsLive(true);
      setError("");
    } catch (err) {
      setIsLive(false);
      setError(err.message);
    } finally {
      if (!background) setLoading(false);
    }
  }, []);
  async function viewChat(chatId) {
    setSelectedChatId(chatId);
    setChatMessages([]);
    setChatLoading(true);
    try {
      const data = await api(`/api/admin/chats/${encodeURIComponent(chatId)}`, token);
      setChatMessages(data.messages || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setChatLoading(false);
    }
  }
  async function unblockDevice({ blockerDeviceId, blockedDeviceId }) {
    try {
      await api("/api/admin/blocked-devices/unblock", token, {
        method: "POST",
        body: JSON.stringify({ blockerDeviceId, blockedDeviceId }),
      });
      setBlockedDevices((current) =>
        current.filter(
          (item) =>
            item.blockerDeviceId !== blockerDeviceId ||
            item.blockedDeviceId !== blockedDeviceId,
        ),
      );
      load(token, true);
    } catch (err) {
      setError(err.message);
    }
  }
  useEffect(() => {
    if (!token) return undefined;
    const refresh = () => load(token, true);
    refresh();
    const interval = autoRefresh
      ? window.setInterval(refresh, Number(refreshInterval) * 1000)
      : null;
    window.addEventListener("focus", refresh);
    return () => {
      if (interval) window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [token, load, autoRefresh, refreshInterval]);
  async function view(report) {
    setSelected(report);
    setMessage(report.reportedContent || null);
    if (report.reportedContent) return;
    if (!report.chatId || !report.messageId) return;
    try {
      const data = await api(
        `/api/admin/chats/${encodeURIComponent(report.chatId)}`,
        token,
      );
      const storedMessage = (data.messages || []).find(
          (item) =>
            String(item.id) === String(report.messageId) ||
            String(item.id) === `${report.messageId}-sent`,
        );
      if (storedMessage) setMessage(storedMessage);
    } catch (err) {
      setError(err.message);
    }
  }
  async function decide(status, reason) {
    const action = status === "accepted" ? "accept" : "reject";
    try {
      const result = await api(
        `/api/admin/reports/${encodeURIComponent(selected.id)}/${action}`,
        token,
        { method: "POST", body: JSON.stringify({ reason }) },
      );
      setReports((current) =>
        current.map((report) =>
          report.id === selected.id ? result.report : report,
        ),
      );
      setSelected(null);
      load(token);
    } catch (err) {
      setError(err.message);
    }
  }
  if (!token)
    return (
      <Login
        onLogin={(value) => {
          setToken(value);
          load(value);
        }}
      />
    );
  const [title, description] =
    copy[selected ? "reports" : page] || copy.overview;
  const content = selected ? (
    <ReportDetails
      report={selected}
      message={message}
      loading={loading}
      token={token}
      backendUrl={BACKEND_URL}
      onBack={() => setSelected(null)}
      onDecision={decide}
    />
  ) : page === "overview" ? (
    <AdminDashboard reports={reports} audit={audit} onView={view} />
  ) : page === "reports" || page === "moderation" ? (
    <ReportsList
      reports={
        page === "moderation"
          ? reports.filter(
              (report) => !["accepted", "rejected"].includes(report.status),
            )
          : reports
      }
      onView={view}
    />
  ) : page === "users" || page === "devices" ? (
    <Directory reports={reports} kind={page} />
  ) : page === "audit" ? (
    <AuditLog entries={audit} />
  ) : page === "blocked" ? (
    <BlockedDevices
      relationships={blockedDevices}
      onUnblock={unblockDevice}
    />
  ) : page === "settings" ? (
    <AdminSettings
      settings={settings}
      onRefresh={() => load(token)}
      loading={loading}
      autoRefresh={autoRefresh}
      refreshInterval={refreshInterval}
      onAutoRefreshChange={setAutoRefresh}
      onRefreshIntervalChange={setRefreshInterval}
    />
  ) : page === "messages" ? (
    <DirectMessages chats={chats} messages={chatMessages} selectedChatId={selectedChatId} onSelectChat={viewChat} loading={chatLoading} />
  ) : (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
      This section is ready for linked Chronix backend data.
    </div>
  );
  return (
    <AdminLayout
      page={page}
      onNavigate={setPage}
      onLogout={() => {
        setToken("");
        setSelected(null);
        setIsLive(false);
      }}
      title={selected ? "Report review" : title}
      description={
        selected
          ? "Inspect reported content and make a manual decision."
          : description
      }
      isLive={isLive}
      lastUpdated={lastUpdated}
      onRefresh={() => load(token)}
    >
      {error && (
        <p className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}
      {loading && !selected ? (
        <p className="text-sm text-slate-500">
          Loading secure moderation data…
        </p>
      ) : (
        content
      )}
    </AdminLayout>
  );
}
