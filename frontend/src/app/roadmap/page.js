"use client";

import {
  ShieldCheck,
  MessageSquare,
  Lock,
  Database,
  UserCircle2,
  Image,
  Mic,
  Search,
  Fingerprint,
  Moon,
  Bot,
  ShieldAlert,
  FileWarning,
  FileText,
  ArrowRight,
} from "lucide-react";
import React from "react";
import Navbar from "../Components/Navbar";

const version1 = [
  {
    icon: MessageSquare,
    title: "One-to-One Messaging",
    desc: "Secure private conversations with end-to-end encryption.",
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    desc: "Messages are encrypted before leaving your device.",
  },
  {
    icon: Image,
    title: "Media Sharing",
    desc: "Send images, videos and documents securely.",
  },
  {
    icon: Mic,
    title: "Voice Messages",
    desc: "Record and send encrypted voice notes.",
  },
  {
    icon: Database,
    title: "Encrypted Local Storage",
    desc: "Chats are stored securely inside your device.",
  },
  {
    icon: UserCircle2,
    title: "Anonymous Chronix ID",
    desc: "Connect without sharing your phone number.",
  },
  {
    icon: Fingerprint,
    title: "Biometric Lock",
    desc: "Unlock Chronix using fingerprint or Face ID.",
  },
  {
    icon: Search,
    title: "Search Chats",
    desc: "Quickly search messages and conversations.",
  },
  {
    icon: Moon,
    title: "Dark & Light Theme",
    desc: "Choose the interface that suits you.",
  },
];

const version2 = [
  {
    icon: Bot,
    title: "AI Conversation Review",
    desc: "AI analyzes conversations for abusive, threatening, scam or phishing content.",
  },
  {
    icon: ShieldAlert,
    title: "Conversation Risk Score",
    desc: "Displays a safety score to help users identify suspicious conversations.",
  },
  {
    icon: FileWarning,
    title: "Evidence Generator",
    desc: "Creates an encrypted evidence package containing messages, timestamps and attachments.",
  },
  {
    icon: FileText,
    title: "Cybercrime Complaint Assistant",
    desc: "Users can review the evidence and voluntarily submit a complaint to the appropriate cybercrime authority.",
  },
];

export default function RoadmapPage() {
  return (
    <React.Fragment>
    <Navbar />
    <main className="chronix-page chronix-hero min-h-screen">

      {/* Hero */}

      <section className="relative overflow-hidden border-b border-cyan-500/20">

        <div className="absolute inset-0 bg-[radial-gradient(circle,#06b6d430,transparent_70%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-28 text-center">

          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-cyan-300">
            Chronix Product Roadmap
          </span>

          <h1 className="mt-8 text-5xl font-black md:text-7xl">
            Building The Future Of
            <span className="block bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 bg-clip-text text-transparent">
              Private Communication
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-lg text-slate-400">
            Chronix evolves in carefully planned releases, starting with secure
            messaging and expanding into AI-assisted safety tools that always
            keep users in control.
          </p>

        </div>

      </section>

      {/* Version 1 */}

      <section className="mx-auto max-w-7xl px-6 py-24">

        <div className="mb-14 flex items-center gap-5">

          <div className="rounded-xl bg-cyan-500/10 p-4">
            <ShieldCheck className="h-8 w-8 text-cyan-400" />
          </div>

          <div>
            <p className="text-cyan-400">Version 1.0</p>
            <h2 className="text-4xl font-bold">
              Secure Messaging Foundation
            </h2>
          </div>

        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {version1.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-3xl border border-cyan-500/20 bg-slate-900/50 p-8 transition hover:-translate-y-2 hover:border-cyan-400"
              >
                <div className="mb-6 inline-flex rounded-xl bg-cyan-500/10 p-4">
                  <Icon className="h-8 w-8 text-cyan-400" />
                </div>

                <h3 className="text-2xl font-bold">
                  {feature.title}
                </h3>

                <p className="mt-4 text-slate-400 leading-7">
                  {feature.desc}
                </p>

              </div>
            );
          })}

        </div>

      </section>

      {/* Divider */}

      <section className="py-8">

        <div className="mx-auto flex max-w-7xl items-center justify-center">

          <div className="flex items-center gap-5">

            <div className="h-px w-24 bg-cyan-500/30"></div>

            <ArrowRight className="text-cyan-400" />

            <div className="h-px w-24 bg-cyan-500/30"></div>

          </div>

        </div>

      </section>

      {/* Version 2 */}

      <section className="mx-auto max-w-7xl px-6 pb-24">

        <div className="mb-14 flex items-center gap-5">

          <div className="rounded-xl bg-violet-500/10 p-4">
            <Bot className="h-8 w-8 text-violet-400" />
          </div>

          <div>
            <p className="text-violet-400">Version 2.0</p>
            <h2 className="text-4xl font-bold">
              AI Safety & Cybercrime Support
            </h2>
          </div>

        </div>

        <div className="grid gap-8 lg:grid-cols-2">

          {version2.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-3xl border border-violet-500/20 bg-slate-900/50 p-8 transition hover:-translate-y-2 hover:border-violet-400"
              >
                <div className="mb-6 inline-flex rounded-xl bg-violet-500/10 p-4">
                  <Icon className="h-8 w-8 text-violet-400" />
                </div>

                <h3 className="text-2xl font-bold">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-400">
                  {feature.desc}
                </p>

              </div>
            );
          })}

        </div>

      </section>

      {/* AI Reporting Flow */}

      <section className="border-y border-cyan-500/20 bg-[#0B1220]">

        <div className="mx-auto max-w-7xl px-6 py-24">

          <h2 className="text-center text-4xl font-bold">
            AI Safety Review Workflow
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-center text-slate-400">
            AI assists the user by identifying potentially harmful conversations.
            Any complaint is submitted only after the user reviews and confirms
            the evidence.
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-5">

            {[
              "Conversation Analysis",
              "Risk Detection",
              "User Warning",
              "Generate Evidence",
              "User Confirms Report",
            ].map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-cyan-500/20 bg-slate-900 p-6 text-center"
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 text-xl font-bold text-black">
                  {index + 1}
                </div>

                <p className="font-medium">
                  {step}
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* Note */}

      <section className="mx-auto max-w-5xl px-6 py-20">

        <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-8">

          <h3 className="text-2xl font-bold text-yellow-300">
            User-Controlled Reporting
          </h3>

          <p className="mt-5 leading-8 text-slate-300">
            Chronix AI never files complaints automatically. It only reviews
            conversations for indicators such as harassment, threats, scams,
            phishing attempts or other suspicious behavior. If the user decides
            to proceed, Chronix prepares an encrypted evidence package for
            review before the user voluntarily submits it to the appropriate
            cybercrime reporting authority.
          </p>

        </div>

      </section>

    </main>
    </React.Fragment>
  );
}
