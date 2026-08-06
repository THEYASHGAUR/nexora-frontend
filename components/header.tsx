"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AudioLines, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Resume Analyzer", href: "/" },
    { name: "AI Mock Interview", href: "/ai-mock-interview" },
    { name: "Interview Insights", href: "/interview-questions" },
    { name: "HR Dashboard", href: "/hr-dashboard" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/landing" className="flex items-center gap-2.5 group">
          <span className="bg-brand-gradient grid size-8 place-items-center rounded-lg transition-opacity group-hover:opacity-90">
            <AudioLines className="size-4 text-primary-foreground" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Nexora</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Login
          </Link>
          <Link
            href="/login"
            className="bg-brand-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-primary-foreground shadow-[0_10px_30px_-12px_oklch(0.554_0.234_293.6/0.7)] transition-shadow hover:shadow-[0_16px_40px_-12px_oklch(0.554_0.234_293.6/0.9)]"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <nav className="flex flex-col gap-1 p-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary/60"
              >
                Login
              </Link>
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-brand-gradient justify-center inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
