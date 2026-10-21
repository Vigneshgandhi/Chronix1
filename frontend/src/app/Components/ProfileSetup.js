"use client";

import { useState } from "react";

const AVATARS = ["🙂", "😎", "🦊", "🐼", "🚀", "🌙", "⚡", "🎧"];

export default function ProfileSetup({ onComplete, initialProfile = null }) {
  const [name, setName] = useState(/^Device\s/i.test(initialProfile?.name || "") ? "" : (initialProfile?.name || ""));
  const [avatarEmoji, setAvatarEmoji] = useState(AVATARS[0]);
  const [statusMessage, setStatusMessage] = useState("Available");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return setError("Profile name is required.");
    if (trimmedName.length > 40) return setError("Profile name must be 40 characters or fewer.");
    if (statusMessage.trim().length > 140) return setError("Status must be 140 characters or fewer.");
    if (password.length < 12) return setError("Create a security password with at least 12 characters.");
    if (password !== confirmPassword) return setError("Security passwords do not match.");
    onComplete({ profile: { name: trimmedName, avatarEmoji, statusMessage: statusMessage.trim() }, password });
  };

  return (
    <main className="chronix-page flex min-h-screen items-center justify-center bg-[#07111d] px-6">
      <form onSubmit={submit} className="w-full max-w-lg rounded-3xl border border-cyan-500/20 bg-[#0b1624] p-8 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Welcome to Chronix</p>
        <h1 className="mt-3 text-3xl font-bold text-white">Create your profile</h1>
        <p className="mt-2 text-slate-400">Create your profile before entering chats.</p>
        <label className="mt-7 block text-sm font-medium text-slate-300">Name
          <input value={name} onChange={(e) => { setName(e.target.value); setError(""); }} maxLength={40} autoFocus className="mt-2 w-full rounded-xl border border-cyan-500/20 bg-[#07111d] px-4 py-3 text-white outline-none focus:border-cyan-400" placeholder="Enter your name" />
        </label>
        <fieldset className="mt-5"><legend className="text-sm font-medium text-slate-300">Avatar</legend><div className="mt-3 flex flex-wrap gap-2">{AVATARS.map((avatar) => <button type="button" key={avatar} onClick={() => setAvatarEmoji(avatar)} className={`rounded-xl px-3 py-2 text-2xl ${avatarEmoji === avatar ? "bg-cyan-500/30 ring-2 ring-cyan-400" : "bg-cyan-500/10"}`}>{avatar}</button>)}</div></fieldset>
        <label className="mt-5 block text-sm font-medium text-slate-300">Status <span className="text-slate-500">(optional)</span>
          <textarea value={statusMessage} onChange={(e) => setStatusMessage(e.target.value)} maxLength={140} rows={2} className="mt-2 w-full resize-none rounded-xl border border-cyan-500/20 bg-[#07111d] px-4 py-3 text-white outline-none focus:border-cyan-400" />
        </label>
        <label className="mt-5 block text-sm font-medium text-slate-300">Security password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={12} autoComplete="new-password" className="mt-2 w-full rounded-xl border border-cyan-500/20 bg-[#07111d] px-4 py-3 text-white outline-none focus:border-cyan-400" placeholder="At least 12 characters" />
        </label>
        <label className="mt-5 block text-sm font-medium text-slate-300">Confirm security password
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={12} autoComplete="new-password" className="mt-2 w-full rounded-xl border border-cyan-500/20 bg-[#07111d] px-4 py-3 text-white outline-none focus:border-cyan-400" />
        </label>
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        <button type="submit" className="mt-7 w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-black transition hover:bg-cyan-400">Continue to Chronix</button>
      </form>
    </main>
  );
}
