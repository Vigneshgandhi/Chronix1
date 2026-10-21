"use client";

import {
  ShieldCheck,
  Lock,
  KeyRound,
  Fingerprint,
  Database,
  FileLock2,
  EyeOff,
  Smartphone,
  Cpu,
  CheckCircle2,
} from "lucide-react";
import Navbar from "../Components/Navbar";
import React from "react";

const securityLayers = [
  {
    icon: Fingerprint,
    title: "Identity Protection",
    description:
      "Anonymous Chronix IDs replace phone numbers and email addresses.",
  },
  {
    icon: KeyRound,
    title: "Key Management",
    description:
      "Private keys remain securely stored inside the device's secure hardware.",
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description:
      "Messages are encrypted before leaving your device and decrypted only by the intended recipient.",
  },
  {
    icon: Database,
    title: "Encrypted Local Storage",
    description:
      "Chats and media are stored inside an encrypted local database instead of the cloud.",
  },
  {
    icon: FileLock2,
    title: "Encrypted Attachments",
    description:
      "Every image, video, document and voice note is encrypted before storage.",
  },
  {
    icon: EyeOff,
    title: "Privacy by Design",
    description:
      "Chronix collects no personal information and minimizes metadata exposure.",
  },
];

const principles = [
  "Zero-Knowledge Architecture",
  "No Phone Number Required",
  "No Permanent Cloud Storage",
  "Anonymous Chronix ID",
  "Forward Secrecy",
  "Encrypted Media Vault",
  "Biometric Authentication",
  "Tamper Resistant Storage",
];

export default function SecurityPage() {
  return (
    <React.Fragment>

    <Navbar />

    <main className="chronix-page chronix-hero min-h-screen">

      {/* Hero */}

      <section className="relative overflow-hidden">

        <div className="absolute inset-0 bg-[radial-gradient(circle,#06b6d430,transparent_70%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-28 text-center">

          <div className="mx-auto inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-cyan-300">
            <ShieldCheck className="mr-2 h-5 w-5" />
            Enterprise Grade Security
          </div>

          <h1 className="mt-8 text-5xl font-black md:text-7xl">
            Built Around
            <span className="block bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 bg-clip-text text-transparent">
              Privacy & Encryption
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-slate-400">
            Chronix is designed with zero-knowledge principles. Your identity,
            conversations, files and encryption keys remain under your control.
            No centralized server can read or access your messages.
          </p>

        </div>

      </section>

      {/* Security Layers */}

      <section className="mx-auto max-w-7xl px-6 py-24">

        <div className="text-center">

          <h2 className="text-4xl font-bold">
            Multi-Layer Security Architecture
          </h2>

          <p className="mt-4 text-slate-400">
            Every conversation passes through multiple independent security
            layers.
          </p>

        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {securityLayers.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="rounded-3xl border border-cyan-500/20 bg-slate-900/50 p-8 transition hover:-translate-y-2 hover:border-cyan-400 hover:shadow-xl hover:shadow-cyan-500/20"
              >
                <div className="mb-6 inline-flex rounded-2xl bg-cyan-500/10 p-4">
                  <Icon className="h-8 w-8 text-cyan-400" />
                </div>

                <h3 className="text-2xl font-bold">
                  {item.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-400">
                  {item.description}
                </p>
              </div>
            );
          })}

        </div>

      </section>

      {/* Encryption Flow */}

      <section className="border-y border-cyan-500/20 bg-[#0B1220]">

        <div className="mx-auto max-w-7xl px-6 py-24">

          <h2 className="text-center text-4xl font-bold">
            Message Encryption Flow
          </h2>

          <div className="mt-16 grid gap-8 md:grid-cols-5">

            {[
              "Identity Verified",
              "Encrypt Message",
              "Sign Packet",
              "Secure Transfer",
              "Decrypt on Device",
            ].map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-cyan-500/20 bg-slate-900 p-6 text-center"
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 font-bold text-black">
                  {index + 1}
                </div>

                <p className="font-semibold">
                  {step}
                </p>
              </div>
            ))}

          </div>

        </div>

      </section>

      {/* Privacy Principles */}

      <section className="mx-auto max-w-7xl px-6 py-24">

        <div className="grid items-center gap-14 lg:grid-cols-2">

          <div>

            <h2 className="text-4xl font-bold">
              Privacy First
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              Chronix follows modern security practices inspired by secure
              messaging systems while giving users greater ownership over their
              encrypted data.
            </p>

            <div className="mt-10 grid gap-5">

              {principles.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4"
                >
                  <CheckCircle2 className="text-cyan-400" />

                  <span>{item}</span>
                </div>
              ))}

            </div>

          </div>

          {/* Security Illustration */}

          <div className="rounded-[35px] border border-cyan-500/20 bg-slate-900 p-10">

            <div className="space-y-5">

              <div className="rounded-xl bg-cyan-500/10 p-5 text-center">
                <Smartphone className="mx-auto mb-2 text-cyan-400" />
                User Device
              </div>

              <div className="text-center text-cyan-400">↓</div>

              <div className="rounded-xl bg-cyan-500/10 p-5 text-center">
                <KeyRound className="mx-auto mb-2 text-cyan-400" />
                Encryption Engine
              </div>

              <div className="text-center text-cyan-400">↓</div>

              <div className="rounded-xl bg-cyan-500/10 p-5 text-center">
                <Cpu className="mx-auto mb-2 text-cyan-400" />
                Secure Transmission
              </div>

              <div className="text-center text-cyan-400">↓</div>

              <div className="rounded-xl bg-cyan-500/10 p-5 text-center">
                <Database className="mx-auto mb-2 text-cyan-400" />
                Recipient Vault
              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
    </React.Fragment>
  );
}
