"use client";

import Link from "next/link";
import {
  ArrowRight,
  Download,
  ShieldCheck,
  Lock,
  Database,
  Send,
  Smartphone,
} from "lucide-react";

export default function Hero() {
  const stats = [
    {
      icon: <Lock className="h-7 w-7 text-chronix-primary" />,
      value: "256-bit",
      label: "End-to-End Encryption",
    },
    {
      icon: <ShieldCheck className="h-7 w-7 text-chronix-primary" />,
      value: "100%",
      label: "Anonymous Identity",
    },
    {
      icon: <Database className="h-7 w-7 text-chronix-primary" />,
      value: "0",
      label: "Cloud Storage",
    },
    {
      icon: <Send className="h-7 w-7 text-chronix-primary" />,
      value: "P2P",
      label: "Direct Messaging",
    },
  ];

  return (
    <section className="chronix-hero relative mb-20 overflow-hidden text-chronix-deep">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#4D00D730,transparent_55%)]" />

      <div className="absolute left-1/2 top-40 h-96 w-96 -translate-x-1/2 rounded-full bg-chronix-primary/15 blur-[140px]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pt-28">

        {/* Hero */}
        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* Left */}
          <div>

            <span className="inline-flex items-center gap-2 rounded-full border border-chronix-secondary chronix-primary px-4 py-2 text-sm font-bold text-chronix-accent">
              <ShieldCheck size={16} />
              Anonymous • Decentralized • Secure
            </span>

            <h1 className="mt-8 text-5xl font-black leading-tight text-chronix-primary md:text-7xl">
              Messaging
              <span className="block text-chronix-accent">
                Without Limits
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-slate-400">
              Chronix is a next-generation private messenger built for complete
              anonymity. Your phone becomes your encrypted vault, your identity
              stays private, and your conversations never belong to anyone else.
            </p>

            {/* Feature Tags */}
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                "No Phone Number",
                "Encrypted Vault",
                "Peer-to-Peer",
                "Offline Messaging",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-chronix-secondary/70 bg-white/5 px-4 py-2 text-sm text-chronix-label"
                >
                  {item}
                </span>
              ))}
            </div>

            {/* Buttons */}
            <div className="mt-10 flex flex-wrap gap-5">
              <Link
                href="/download"
                className="chronix-primary flex items-center gap-3 rounded-xl px-7 py-4 font-semibold shadow-xl shadow-chronix-primary/30 hover:scale-[1.02]"
              >
                <Download size={20} />
                Download
              </Link>

              <Link
                href="/features"
                className="chronix-outline flex items-center gap-3 rounded-xl bg-white/5 px-7 py-4"
              >
                Explore Features
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>

          {/* Right */}
          <div className="relative flex justify-center">

            {/* Glow */}
            <div className="absolute h-80 w-80 rounded-full bg-chronix-primary/20 blur-[100px]" />

            {/* Phone */}
            <div className="relative h-[620px] w-[320px] rounded-[45px] border border-chronix-secondary bg-chronix-surface p-3 shadow-2xl shadow-chronix-primary/20">

              <div className="h-full rounded-[35px] bg-white">

                {/* Header */}
                <div className="flex items-center justify-between p-6">
                  <div>
                    <h3 className="font-bold text-chronix-accent">Chronix</h3>
                    <p className="text-xs text-chronix-accent">
                      Secure Conversation
                    </p>
                  </div>

                  <ShieldCheck className="text-chronix-primary" />
                </div>

                {/* Messages */}

                <div className="space-y-4 p-6">

                  <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-chronix-primary text-white px-4 py-3">
                    🔒 Encrypted message sent.
                  </div>

                  <div className="ml-auto max-w-[75%] rounded-2xl rounded-br-sm bg-fuchsia-300 px-4 py-3">
                    Identity verified ✔
                  </div>

                  <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-chronix-primary text-white px-4 py-3">
                    No servers involved 🚀
                  </div>

                </div>

                {/* Bottom */}
                <div className="absolute bottom-8 left-0 flex w-full justify-center">
                  <div className="flex items-center gap-3 rounded-full bg-chronix-primary text-white px-5 py-3 text-chronix-label backdrop-blur">
                    <Smartphone size={18} />
                    Device Protected
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Statistics */}

        <div className="mt-24 grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl md:grid-cols-2 xl:grid-cols-4">

          {stats.map((item) => (
            <div
              key={item.label}
              className="chronix-elevated rounded-2xl p-6 transition hover:-translate-y-1 hover:border-chronix-secondary"
            >
              <div className="mb-5">{item.icon}</div>

              <h2 className="text-4xl font-bold text-chronix-primary">
                {item.value}
              </h2>

              <p className="mt-2 text-slate-400">
                {item.label}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
