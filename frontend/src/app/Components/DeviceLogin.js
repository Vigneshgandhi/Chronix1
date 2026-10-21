"use client";

import { useState } from "react";
import axios from "axios";

export default function DeviceLogin({ backendUrl }) {
  const [deviceId, setDeviceId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const value = deviceId.trim();
    if (value.length < 16 || value.length > 128) {
      setError("Enter a valid Chronix Device ID.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${backendUrl}/api/devices/${encodeURIComponent(value)}`);
      if (!response.data?.exists) throw new Error("That Device ID does not exist.");
      window.localStorage.setItem("chronix-device-login", value);
      window.location.reload();
    } catch (requestError) {
      setLoading(false);
      setError(requestError.response?.data?.error || requestError.message || "Unable to verify Device ID.");
    }
  };

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${backendUrl}/api/devices`);
      const generated = response.data?.deviceId;
      if (typeof generated !== "string") throw new Error("Server returned an invalid Device ID.");
      window.localStorage.setItem("chronix-device-login", generated);
      window.location.reload();
    } catch (requestError) {
      setLoading(false);
      setError(requestError.response?.data?.error || requestError.message || "Unable to create a Device ID.");
    }
  };

  return <main className="chronix-page flex min-h-screen items-center justify-center bg-[#07111d] px-6"><form onSubmit={submit} className="w-full max-w-lg rounded-3xl border border-cyan-500/20 bg-[#0b1624] p-8 shadow-2xl"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Chronix Device Login</p><h1 className="mt-3 text-3xl font-bold text-white">Sign in with your Device ID</h1><p className="mt-2 text-slate-400">Use the secure Device ID generated for this device. It is never used as your display name.</p><label className="mt-7 block text-sm font-medium text-slate-300">Device ID<input value={deviceId} onChange={(e) => setDeviceId(e.target.value)} autoFocus className="mt-2 w-full rounded-xl border border-cyan-500/20 bg-[#07111d] px-4 py-3 font-mono text-sm text-white outline-none focus:border-cyan-400" placeholder="Paste your Device ID" /></label>{error && <p className="mt-4 text-sm text-red-300">{error}</p>}<button disabled={loading} className="mt-7 w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-black disabled:opacity-50">{loading ? "Verifying…" : "Continue"}</button><button type="button" onClick={generate} disabled={loading} className="mt-3 w-full rounded-xl border border-cyan-500/30 px-4 py-3 font-semibold text-cyan-300 disabled:opacity-50">Create a new Device ID</button></form></main>;
}
