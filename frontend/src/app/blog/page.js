"use client";

import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Clock3,
  ShieldCheck,
  Bot,
  Newspaper,
  Lock,
  Cpu,
  Bell,
} from "lucide-react";
import React,{useState} from "react";
import Navbar from "../Components/Navbar";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5001";

const featured = {
  title: "Introducing Chronix: Privacy-First Messaging Without Compromise",
  category: "Product Update",
  date: "Coming Soon",
  read: "6 min read",
  description:
    "Discover how Chronix combines end-to-end encryption, anonymous identities, and secure local storage to create a new generation of private messaging.",
};

const articles = [
  {
    icon: Lock,
    category: "Security",
    title: "How End-to-End Encryption Protects Your Conversations",
    read: "5 min",
    date: "Coming Soon",
  },
  {
    icon: Bot,
    category: "AI Safety",
    title: "Using AI to Detect Scams Without Reading Your Messages",
    read: "7 min",
    date: "Coming Soon",
  },
  {
    icon: ShieldCheck,
    category: "Privacy",
    title: "Why Chronix Doesn't Require Your Phone Number",
    read: "4 min",
    date: "Coming Soon",
  },
  {
    icon: Cpu,
    category: "Technology",
    title: "Inside Chronix's Secure Local Storage Architecture",
    read: "8 min",
    date: "Coming Soon",
  },
  {
    icon: Newspaper,
    category: "Development",
    title: "Chronix Version 2.0 Roadmap",
    read: "5 min",
    date: "Coming Soon",
  },
  {
    icon: Bell,
    category: "Updates",
    title: "What's New in the Latest Chronix Release",
    read: "3 min",
    date: "Coming Soon",
  },
];

export default function BlogPage() {
  const [Email,setEmail] = useState("");
  async function handleSend() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/blog/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Email }),
      });
      if (!response.ok) throw new Error("Unable to subscribe right now.");
      setEmail("");
    } catch (error) {
      console.error("Error:", error);
    }
  } 
  return (
    <React.Fragment>
    <Navbar />
    <main className="chronix-page chronix-hero min-h-screen">

      {/* Hero */}

      <section className="relative overflow-hidden border-b border-cyan-500/20">

        <div className="absolute inset-0 bg-[radial-gradient(circle,#06b6d430,transparent_70%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-28 text-center">

          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-cyan-300">
            Chronix Blog
          </span>

          <h1 className="mt-8 text-5xl font-black md:text-7xl">
            News,
            <span className="block bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 bg-clip-text text-transparent">
              Security & Updates
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-slate-400">
            Learn about privacy, cybersecurity, encryption, AI safety, and the
            latest Chronix product updates.
          </p>

        </div>

      </section>

      {/* Featured Article */}

      <section className="mx-auto max-w-7xl px-6 py-20">

        <div className="overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-violet-500/10">

          <div className="grid items-center lg:grid-cols-2">

            <div className="p-10 lg:p-14">

              <span className="rounded-full bg-cyan-500/20 px-4 py-2 text-sm text-cyan-300">
                {featured.category}
              </span>

              <h2 className="mt-6 text-4xl font-bold leading-tight">
                {featured.title}
              </h2>

              <p className="mt-6 text-slate-300 leading-8">
                {featured.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-6 text-slate-400">

                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  {featured.date}
                </div>

                <div className="flex items-center gap-2">
                  <Clock3 size={18} />
                  {featured.read}
                </div>

              </div>

              <Link
                href="#"
                className="mt-10 inline-flex items-center gap-3 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black transition hover:bg-cyan-400"
              >
                Read Article
                <ArrowRight size={18} />
              </Link>

            </div>

            <div className="hidden h-full items-center justify-center bg-[#0B1220] lg:flex">

              <Newspaper className="h-48 w-48 text-cyan-500/30" />

            </div>

          </div>

        </div>

      </section>

      {/* Categories */}

      <section className="mx-auto max-w-7xl px-6">

        <div className="flex flex-wrap justify-center gap-4">

          {[
            "All",
            "Security",
            "Privacy",
            "AI",
            "Development",
            "Product",
            "Updates",
          ].map((category) => (
            <button
              key={category}
              className="rounded-full border border-cyan-500/20 bg-slate-900 px-5 py-3 transition hover:border-cyan-400 hover:bg-cyan-500/10"
            >
              {category}
            </button>
          ))}

        </div>

      </section>

      {/* Articles */}

      <section className="mx-auto max-w-7xl px-6 py-20">

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {articles.map((article) => {
            const Icon = article.icon;

            return (
              <div
                key={article.title}
                className="group rounded-3xl border border-cyan-500/20 bg-slate-900/50 p-8 transition hover:-translate-y-2 hover:border-cyan-400"
              >
                <div className="mb-6 inline-flex rounded-xl bg-cyan-500/10 p-4">
                  <Icon className="h-8 w-8 text-cyan-400" />
                </div>

                <span className="text-sm text-cyan-300">
                  {article.category}
                </span>

                <h3 className="mt-3 text-2xl font-bold leading-snug">
                  {article.title}
                </h3>

                <div className="mt-6 flex justify-between text-sm text-slate-400">

                  <span>{article.date}</span>

                  <span>{article.read}</span>

                </div>

                <Link
                  href="#"
                  className="mt-8 inline-flex items-center gap-2 text-cyan-400 transition group-hover:gap-3"
                >
                  Read More
                  <ArrowRight size={18} />
                </Link>

              </div>
            );
          })}

        </div>

      </section>

      {/* Newsletter */}

      <section className="border-t border-cyan-500/20 bg-[#0B1220]">

        <div className="mx-auto max-w-5xl px-6 py-24 text-center">

          <h2 className="text-4xl font-bold">
            Stay Updated
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Get notified about new Chronix releases, security improvements,
            privacy research, and feature announcements.
          </p>

          <div className="mx-auto mt-10 flex max-w-xl flex-col gap-4 sm:flex-row">

            <input
              type="email"
              placeholder="Enter your email"
              onChange={(e)=>{setEmail(e.target.value)}}
              className="flex-1 rounded-xl border border-cyan-500/20 bg-slate-900 px-5 py-4 outline-none focus:border-cyan-400"
            />

            <button className="rounded-xl bg-cyan-500 px-8 py-4 font-semibold text-black transition hover:bg-cyan-400"onClick={(e)=>{handleSend();e.preventDefault();}}>
              Subscribe
            </button>

          </div>

        </div>

      </section>

    </main>
    </React.Fragment>
  );
}
