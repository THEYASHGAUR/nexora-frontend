"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  AudioLines,
  CheckCircle2,
  Mail,
  ShieldCheck,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || !result.success) {
        setErrorMsg(result.error ?? "Unable to send reset link.");
        return;
      }

      setSuccessMsg(result.message ?? "Password reset link sent.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to send reset link.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-background px-4 py-8 text-foreground">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="bg-brand-gradient grid size-8 place-items-center rounded-lg">
            <AudioLines className="size-4 text-primary-foreground" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Nexora</span>
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to login
        </Link>
      </nav>

      <section className="mx-auto flex w-full max-w-md items-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.55, ease: EASE }}
          className="glass glow-ring w-full rounded-2xl p-7 md:p-9"
        >
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
              <ShieldCheck className="size-3 text-primary" />
              Secure reset
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">Forgot password?</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Enter your account email and we will send a secure reset link.
            </p>
          </div>

          {errorMsg ? (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          {successMsg ? (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-400">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-border bg-secondary/30 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="bg-brand-gradient flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-12px_oklch(0.554_0.234_293.6/0.8)] transition-shadow hover:shadow-[0_16px_40px_-12px_oklch(0.554_0.234_293.6/0.95)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Sending link..." : "Send reset link"}
              {!loading ? <ArrowRight className="size-4" /> : null}
            </motion.button>
          </form>
        </motion.div>
      </section>
    </main>
  );
}
