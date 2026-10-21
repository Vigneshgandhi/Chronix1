"use client";

import { useState } from "react";

export default function SecurityUnlock({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onUnlock(password);
    } catch (unlockError) {
      setError(unlockError.message || "Unable to unlock security material.");
      setLoading(false);
    }
  }

  return <main className="chronix-page flex min-h-screen items-center justify-center bg-[#07111d] px-6"><form onSubmit={submit} className="w-full max-w-lg rounded-3xl border border-cyan-500/20 bg-[#0b1624] p-8 shadow-2xl"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Chronix Security</p><h1 className="mt-3 text-3xl font-bold text-white">Unlock this device</h1><p className="mt-2 text-slate-400">Your private encryption key stays on this device and is unlocked only in protected application memory.</p><label className="mt-7 block text-sm font-medium text-slate-300">Security password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus autoComplete="current-password" className="mt-2 w-full rounded-xl border border-cyan-500/20 bg-[#07111d] px-4 py-3 text-white outline-none focus:border-cyan-400" /></label>{error && <p className="mt-4 text-sm text-red-300">{error}</p>}<button disabled={loading} className="mt-7 w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-black disabled:opacity-50">{loading ? "Unlocking…" : "Unlock securely"}</button></form></main>;
}
