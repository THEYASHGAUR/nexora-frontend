"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  AudioLines,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || !result.success) {
        setErrorMsg(result.error ?? "Unable to update password.");
        return;
      }

      setSuccessMsg(result.message ?? "Password updated successfully.");
      setPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to update password.";
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
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Sign in
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
              Password recovery
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">Create a new password</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Use a strong password that you have not used for Nexora before.
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
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full rounded-xl border border-border bg-secondary/30 py-3 pl-10 pr-11 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-muted-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat password"
                  className="w-full rounded-xl border border-border bg-secondary/30 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading || Boolean(successMsg)}
              className="bg-brand-gradient flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-12px_oklch(0.554_0.234_293.6/0.8)] transition-shadow hover:shadow-[0_16px_40px_-12px_oklch(0.554_0.234_293.6/0.95)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Updating..." : "Update password"}
              {!loading ? <ArrowRight className="size-4" /> : null}
            </motion.button>
          </form>

          {successMsg ? (
            <Link
              href="/ai-mock-interview"
              className="mt-4 flex w-full items-center justify-center rounded-xl border border-border bg-secondary/40 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary/70"
            >
              Continue to app
            </Link>
          ) : null}
        </motion.div>
      </section>
    </main>
  );
}
