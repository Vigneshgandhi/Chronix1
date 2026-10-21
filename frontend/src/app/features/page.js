"use client";
import React from 'react';

import {
  Lock,
  ShieldCheck,
  Database,
  Smartphone,
  Wifi,
  Bot,
  EyeOff,
  RefreshCw,
  FileLock2,
  Fingerprint,
  CloudOff,
  Zap,
  ArrowRight,
} from "lucide-react";
import Navbar from '../Components/Navbar';

const features = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description:
      "Every message, call, file, and media is encrypted before leaving your device using modern cryptographic standards.",
  },
  {
    icon: ShieldCheck,
    title: "Anonymous Identity",
    description:
      "Communicate using a unique Chronix ID instead of a phone number or email address.",
  },
  {
    icon: Database,
    title: "Device as Database",
    description:
      "Chats are securely stored only on your device in an encrypted local database.",
  },
  {
    icon: CloudOff,
    title: "No Centralized Cloud",
    description:
      "Your messages never live permanently on external servers.",
  },
  {
    icon: Wifi,
    title: "Peer-to-Peer Messaging",
    description:
      "Devices communicate directly whenever possible through secure peer-to-peer networking.",
  },
  {
    icon: Smartphone,
    title: "Offline Delivery",
    description:
      "Encrypted messages stay queued until the recipient becomes available.",
  },
  {
    icon: FileLock2,
    title: "Encrypted Vault",
    description:
      "Photos, videos, voice notes and documents remain encrypted even while stored locally.",
  },
  {
    icon: RefreshCw,
    title: "Forward Secrecy",
    description:
      "Every conversation continuously generates fresh encryption keys for maximum security.",
  },
  {
    icon: Bot,
    title: "AI Threat Detection",
    description:
      "On-device AI detects phishing links, spam, scams and malicious content without uploading chats.",
  },
  {
    icon: Fingerprint,
    title: "Biometric Lock",
    description:
      "Protect the application with fingerprint or Face ID authentication.",
  },
  {
    icon: EyeOff,
    title: "Hidden Mode",
    description:
      "Disguise the application and protect sensitive conversations behind a secret PIN.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Optimized networking ensures instant encrypted communication with minimal battery usage.",
  },
];

export default function FeaturesPage() {
  return (
    <React.Fragment>
    <Navbar/>
    <main className="chronix-page chronix-hero min-h-screen">

      {/* Hero */}

      <section className="relative overflow-hidden">

        <div className="absolute inset-0 bg-[radial-gradient(circle,#06b6d420,transparent_70%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-28">

          <div className="max-w-3xl">

            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
              🚀 Powerful Privacy Features
            </span>

            <h1 className="mt-8 text-5xl font-black leading-tight md:text-7xl">
              Everything You Need
              <span className="block bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 bg-clip-text text-transparent">
                To Stay Private
              </span>
            </h1>

            <p className="mt-8 text-lg leading-8 text-slate-400">
              Chronix combines modern encryption, decentralized communication,
              anonymous identity, and AI-powered protection into one secure
              messaging platform.
            </p>

          </div>

        </div>

      </section>

      {/* Features */}

      <section className="mx-auto max-w-7xl px-6 pb-24">

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="group rounded-3xl border border-cyan-500/20 bg-slate-900/50 p-8 transition duration-300 hover:-translate-y-2 hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/20"
              >
                <div className="mb-6 inline-flex rounded-2xl bg-cyan-500/10 p-4">
                  <Icon className="h-8 w-8 text-cyan-400" />
                </div>

                <h3 className="text-2xl font-bold">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-400">
                  {feature.description}
                </p>

                <button className="mt-8 flex items-center gap-2 text-cyan-400 transition group-hover:gap-3">
                  Learn More
                  <ArrowRight size={18} />
                </button>

              </div>
            );
          })}

        </div>

      </section>

      {/* Security Process */}

      <section className="border-y border-cyan-500/20 bg-[#0B1220]">

        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="text-center">

            <h2 className="text-4xl font-bold">
              How Chronix Protects Every Message
            </h2>

            <p className="mt-4 text-slate-400">
              Every conversation follows multiple layers of protection before
              reaching its destination.
            </p>

          </div>

          <div className="mt-20 grid gap-10 md:grid-cols-5">

            {[
              "Identity Verification",
              "Encrypt Message",
              "Secure P2P Transfer",
              "Signature Validation",
              "Decrypt on Recipient",
            ].map((step, i) => (
              <div
                key={step}
                className="relative rounded-2xl border border-cyan-500/20 bg-slate-900 p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 text-xl font-bold text-black">
                  {i + 1}
                </div>

                <h3 className="font-semibold">{step}</h3>
              </div>
            ))}

          </div>

        </div>

      </section>

      {/* Why Chronix */}

      <section className="mx-auto max-w-7xl px-6 py-24">

        <div className="rounded-[40px] border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 p-12">

          <h2 className="text-center text-4xl font-bold">
            Why Choose Chronix?
          </h2>

          <div className="mt-14 grid gap-10 md:grid-cols-3">

            <div>
              <h3 className="text-xl font-bold text-cyan-400">
                Maximum Privacy
              </h3>

              <p className="mt-4 text-slate-400">
                No phone numbers, no centralized storage, and complete
                end-to-end encryption.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-cyan-400">
                Decentralized
              </h3>

              <p className="mt-4 text-slate-400">
                Your device owns your data. Messages remain encrypted from
                sender to receiver.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-cyan-400">
                Built for the Future
              </h3>

              <p className="mt-4 text-slate-400">
                AI-powered security, encrypted vaults, biometric protection,
                and modern cryptography in one application.
              </p>
            </div>

          </div>

        </div>

      </section>

    </main>
    </React.Fragment>
  );
}
