"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  ShieldCheck,
  Download,
  ChevronRight,
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "Security", href: "/security" },
    { name: "Chat", href: "/Chat" },
    { name: "Roadmap", href: "/roadmap" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-chronix-deep/10 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chronix-primary shadow-lg shadow-chronix-primary/30 transition duration-300 group-hover:rotate-3 group-hover:scale-105">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-wide text-chronix-primary">
              Chronix
            </h1>
            <p className="-mt-1 text-xs text-chronix-accent">
              Anonymous Messenger
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="relative text-sm font-medium text-chronix-deep transition hover:text-chronix-primary after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-chronix-primary after:transition-all hover:after:w-full"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/download"
            className="chronix-primary group flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-lg shadow-chronix-primary/30 hover:scale-[1.02]"
          >
            <Download size={18} />
            Download
            <ChevronRight
              size={18}
              className="transition group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg border border-chronix-secondary p-2 text-chronix-secondary lg:hidden"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-t border-chronix-deep/10 bg-white/95 backdrop-blur-xl lg:hidden">
          <div className="space-y-2 px-6 py-6">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-lg px-4 py-3 text-chronix-deep transition hover:bg-chronix-primary/10 hover:text-chronix-primary"
              >
                {item.name}
              </Link>
            ))}

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/download"
                className="chronix-primary rounded-lg py-3 text-center font-semibold"
              >
                Download App
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
