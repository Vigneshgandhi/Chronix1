"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Smartphone,
  ShieldCheck,
  Wifi,
  WifiOff,
  Copy,
  Download,
  Check,
  X,
  ArrowRight,
  KeyRound,
  Loader2,
  AlertCircle,
  Ban,
  Flag,
  MessageCircle,
  Trash2,
  UserRound,
} from "lucide-react";

export default function ChatSidebar({
  selectedChat,
  setSelectedChat,
  socket,
  deviceId,
  devices = [],
  onDeviceConnected,
  onDeleteDevice,
  onBlockDevice,
  onReportDevice,
}) {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [targetDeviceId, setTargetDeviceId] = useState("");
  const [deviceError, setDeviceError] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

  const filteredDevices = useMemo(() => {
    const query = search.trim().toLowerCase();
    return devices.filter(
      (d) => d.deviceId !== deviceId && (!query || d.deviceId.toLowerCase().includes(query))
    );
  }, [devices, deviceId, search]);

  const copyDeviceId = async () => {
    if (!deviceId) return;
    try {
      await navigator.clipboard.writeText(deviceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Unable to copy device ID:", error);
    }
  };

  const downloadDeviceId = () => {
    if (!deviceId || typeof document === "undefined") return;
    const blob = new Blob([`${deviceId}\n`], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "chronix-device-id.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const openAddDeviceModal = () => {
    setTargetDeviceId("");
    setDeviceError("");
    setConnecting(false);
    setShowAddDevice(true);
  };

  const closeAddDeviceModal = () => {
    if (connecting) return;
    setShowAddDevice(false);
    setTargetDeviceId("");
    setDeviceError("");
  };

  const handleConnectDevice = () => {
    const target = targetDeviceId.trim();
    setDeviceError("");
    if (!deviceId) return setDeviceError("Your Chronix Device ID is not ready yet.");
    if (!target) return setDeviceError("Enter the Device ID you want to connect to.");
    if (target.length < 16 || target.length > 128) return setDeviceError("The Device ID is not valid.");
    if (target === deviceId) return setDeviceError("You cannot connect to your own device.");
    if (!socket?.connected) return setDeviceError("Chronix is currently disconnected from the server.");
    setConnecting(true);
    socket.emit("device:connect", { targetDeviceId: target }, (response) => {
      setConnecting(false);
      if (!response?.success) {
        return setDeviceError(response?.message || "The requested device could not be found.");
      }

      onDeviceConnected?.({
        deviceId: target,
        online: typeof response.online === "boolean" ? response.online : true,
        name: response.profile?.name || `Device ${target.slice(0, 8)}`,
        avatarEmoji: response.profile?.avatarEmoji,
        statusMessage: response.profile?.statusMessage,
      });

      setTargetDeviceId("");
      setDeviceError("");
      setShowAddDevice(false);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !connecting) {
      e.preventDefault();
      handleConnectDevice();
    }
    if (e.key === "Escape") closeAddDeviceModal();
  };

  return (
    <>
      <aside className="flex h-full w-full flex-col border-r border-cyan-500/20 bg-[#07111d]">
        {/* Header */}
        <div className="border-b border-cyan-500/20 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Chronix</h2>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                <ShieldCheck size={14} className="text-cyan-400" />
                Secure Messaging
              </div>
            </div>

            <button
              type="button"
              onClick={openAddDeviceModal}
              disabled={!deviceId}
              className="rounded-xl bg-cyan-500 p-3 text-black transition hover:scale-105 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
              title="Connect to device"
            >
              <Plus size={19} />
            </button>
          </div>

          {/* My Device ID */}
          <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-xl bg-cyan-500/10 p-2.5">
                  <Smartphone size={18} className="text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Your Device ID</p>
                  <p className="mt-1 truncate font-mono text-sm text-cyan-300">
                    {deviceId || "Generating..."}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={copyDeviceId}
                  disabled={!deviceId}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-cyan-500/10 hover:text-cyan-400 disabled:opacity-40"
                  title="Copy Device ID"
                >
                  {copied ? <Check size={17} className="text-green-400" /> : <Copy size={17} />}
                </button>
                <button
                  type="button"
                  onClick={downloadDeviceId}
                  disabled={!deviceId}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-cyan-500/10 hover:text-cyan-400 disabled:opacity-40"
                  title="Download Device ID"
                >
                  <Download size={17} />
                </button>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl border border-cyan-500/20 bg-[#0b1624] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Conversations Count Header */}
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Conversations</p>
          <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-400">
            {filteredDevices.length}
          </span>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredDevices.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
                <Smartphone size={28} className="text-cyan-400" />
              </div>
              <h3 className="mt-5 font-semibold text-white">No conversations</h3>
              <p className="mt-2 max-w-[240px] text-sm leading-6 text-slate-500">
                Connect to another Chronix device using its unique Device ID.
              </p>
              <button
                type="button"
                onClick={openAddDeviceModal}
                disabled={!deviceId}
                className="mt-5 flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-400 disabled:opacity-40"
              >
                <Plus size={17} /> Connect Device
              </button>
            </div>
          ) : (
            filteredDevices.map((device) => {
              const chatId = [deviceId, device.deviceId].sort().join(":");
              const active =
                selectedChat?.chatId === chatId ||
                selectedChat?.id === chatId ||
                selectedChat?.deviceId === device.deviceId;

              return (
                <button
                  key={device.deviceId}
                  type="button"
                  onClick={() => deviceId && device.deviceId && setSelectedChat(device)}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    setContextMenu({ device, x: event.clientX, y: event.clientY });
                  }}
                  className={`flex w-full items-center gap-4 border-b border-cyan-500/10 px-5 py-4 text-left transition ${
                    active ? "bg-cyan-500/10" : "hover:bg-slate-800/40"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div
                      className={`flex h-13 w-13 items-center justify-center rounded-full border ${
                        active ? "border-cyan-400 bg-cyan-500" : "border-cyan-500/20 bg-cyan-500/10"
                      }`}
                    >
                      <Smartphone size={21} className={active ? "text-black" : "text-cyan-400"} />
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#07111d] ${
                        device.online ? "bg-green-500" : "bg-slate-600"
                      }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-semibold text-white">
                        {device.name || `Device ${device.deviceId.slice(0, 8)}`}
                      </p>
                      {device.online ? (
                        <Wifi size={15} className="shrink-0 text-green-400" />
                      ) : (
                        <WifiOff size={15} className="shrink-0 text-slate-600" />
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">Chronix contact</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${device.online ? "bg-green-500" : "bg-slate-600"}`} />
                      <span className={`text-xs ${device.online ? "text-green-400" : "text-slate-500"}`}>
                        {device.online ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {contextMenu && (
          <div className="fixed z-50 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10" style={{ left: contextMenu.x, top: contextMenu.y }} onMouseLeave={() => setContextMenu(null)} role="menu" aria-label="Contact actions">
            <div className="px-3 py-2"><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Contact actions</p><p className="mt-0.5 truncate text-sm font-semibold text-slate-700">{contextMenu.device.name || "Chronix contact"}</p></div>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-800" onClick={() => { setSelectedChat(contextMenu.device); setContextMenu(null); }}><MessageCircle size={16} />Open chat</button>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-800" onClick={() => { setSelectedChat(contextMenu.device); setContextMenu(null); }}><UserRound size={16} />View profile</button>
            <div className="my-1 border-t border-slate-100" />
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-amber-700 hover:bg-amber-50" onClick={() => { onDeleteDevice?.(contextMenu.device); setContextMenu(null); }}><Trash2 size={16} />Delete device</button>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-700 hover:bg-red-50" onClick={() => { onBlockDevice?.(contextMenu.device); setContextMenu(null); }}><Ban size={16} />Block device</button>
            <button className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-700 hover:bg-red-50" onClick={() => { onReportDevice?.(contextMenu.device); setContextMenu(null); }}><Flag size={16} />Report contact</button>
          </div>
        )}

        {/* Server Status Footer */}
        <div className="border-t border-cyan-500/20 p-4">
          <div className="flex items-center justify-between rounded-xl bg-[#0B1220] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className={`h-2.5 w-2.5 rounded-full ${socket?.connected ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm text-slate-400">
                {socket?.connected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <ShieldCheck size={17} className="text-cyan-400" />
          </div>
        </div>
      </aside>

      {/* Connect Modal */}
      {showAddDevice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-md"
          onMouseDown={(e) => e.target === e.currentTarget && closeAddDeviceModal()}
        >
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-cyan-500/20 bg-[#07111d] shadow-2xl shadow-cyan-500/10">
            <div className="flex items-center justify-between border-b border-cyan-500/20 p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-cyan-500/10 p-3">
                  <KeyRound size={22} className="text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Connect Device</h2>
                  <p className="mt-1 text-sm text-slate-500">Start a private conversation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeAddDeviceModal}
                disabled={connecting}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <label htmlFor="chronix-target-device" className="text-sm font-medium text-slate-300">
                Device ID
              </label>
              <p className="mt-1 text-sm text-slate-500">
                Enter the Device ID shared by the person you want to communicate with.
              </p>

              <div className="relative mt-4">
                <Smartphone size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" />
                <input
                  id="chronix-target-device"
                  type="text"
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                  value={targetDeviceId}
                  disabled={connecting}
                  onChange={(e) => {
                    setTargetDeviceId(e.target.value);
                    setDeviceError("");
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter Chronix Device ID"
                  className="w-full rounded-xl border border-cyan-500/20 bg-[#0B1220] py-4 pl-12 pr-4 font-mono text-sm text-white outline-none transition placeholder:font-sans placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/10 disabled:opacity-60"
                />
              </div>

              {deviceError && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                  <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
                  <p className="text-sm leading-6 text-red-300">{deviceError}</p>
                </div>
              )}

              <div className="mt-5 rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={18} className="mt-0.5 shrink-0 text-cyan-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-300">Device-to-device identity</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Chronix uses the Device ID to identify the device you want to communicate with.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-cyan-500/20 p-6">
              <button
                type="button"
                onClick={closeAddDeviceModal}
                disabled={connecting}
                className="flex-1 rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConnectDevice}
                disabled={connecting || !targetDeviceId.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {connecting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Checking...
                  </>
                ) : (
                  <>
                    Connect <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
