"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import {
  Activity,
  ArrowRight,
  AudioLines,
  Braces,
  BrainCircuit,
  Building2,
  Check,
  ChevronDown,
  ClipboardList,
  FileText,
  History,
  LineChart,
  Mic,
  Minus,
  Play,
  PlayCircle,
  Repeat,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

/* ---------------------------------- motion --------------------------------- */

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <Reveal>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-5 text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
          {title}
        </h2>
      </Reveal>
      {sub ? (
        <Reveal delay={0.1}>
          <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground">{sub}</p>
        </Reveal>
      ) : null}
    </div>
  );
}

/* ------------------------------- chrome bits ------------------------------- */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 });
  return (
    <motion.div
      style={{ scaleX: width }}
      className="bg-brand-gradient fixed inset-x-0 top-0 z-[60] h-[2px] origin-left"
      aria-hidden
    />
  );
}

function CursorSpotlight() {
  const x = useMotionValue(-500);
  const y = useMotionValue(-500);
  const sx = useSpring(x, { stiffness: 90, damping: 22, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 90, damping: 22, mass: 0.4 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed z-0 hidden h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full md:block"
      style={{
        left: sx,
        top: sy,
        background:
          "radial-gradient(circle, color-mix(in oklab, var(--brand-purple) 16%, transparent) 0%, transparent 65%)",
      }}
    />
  );
}

const NAV = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-border bg-background/70 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5"
        aria-label="Main"
      >
        <a href="#top" className="flex items-center gap-2.5">
          <span className="bg-brand-gradient grid size-8 place-items-center rounded-lg">
            <AudioLines className="size-4 text-primary-foreground" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Nexora</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {n.label}
            </a>
          ))}
          {/* <a
            href="#top"
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="size-4" /> Github
          </a> */}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {/* <a
            href="/login"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Login
          </a> */}
          <GradientButton href="/login">Start Free Interview</GradientButton>
        </div>

        <button
          className="rounded-md border border-border p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="size-4" /> : <Minus className="size-4" />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-border bg-background/95 px-5 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {[...NAV, { label: "Github", href: "#top" }, { label: "Login", href: "/login" }].map(
              (n) => (
                <a
                  key={n.label}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2.5 text-sm text-muted-foreground"
                >
                  {n.label}
                </a>
              ),
            )}
            <GradientButton href="/login" className="mt-2 justify-center">
              Start Free Interview
            </GradientButton>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function GradientButton({
  children,
  href,
  className = "",
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: EASE }}
      className={`bg-brand-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_10px_30px_-12px_oklch(0.554_0.234_293.6/0.8)] transition-shadow hover:shadow-[0_16px_40px_-12px_oklch(0.554_0.234_293.6/0.95)] ${className}`}
    >
      {children}
    </motion.a>
  );
}

function GhostButton({
  children,
  href,
  className = "",
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: EASE }}
      className={`inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-secondary/70 ${className}`}
    >
      {children}
    </motion.a>
  );
}

/* ----------------------------------- hero ---------------------------------- */

function Blobs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="animate-blob absolute -top-40 -left-24 size-[520px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--brand-purple)_38%,transparent),transparent_65%)] blur-3xl" />
      <div className="animate-blob absolute -top-20 right-[-10%] size-[560px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--brand-blue)_32%,transparent),transparent_65%)] blur-3xl [animation-delay:-6s]" />
      <div className="animate-blob absolute top-[48%] left-1/3 size-[420px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--brand-purple)_22%,transparent),transparent_65%)] blur-3xl [animation-delay:-12s]" />
    </div>
  );
}

function Particles() {
  const dots = Array.from({ length: 22 }, (_, i) => ({
    left: (i * 37) % 100,
    top: (i * 61) % 100,
    d: 6 + (i % 7),
    delay: (i % 9) * 0.6,
  }));
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((p, i) => (
        <motion.span
          key={i}
          className="absolute size-[3px] rounded-full bg-foreground/25"
          style={{ left: `${p.left}%`, top: `${p.top}%` }}
          animate={{ y: [0, -22, 0], opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: p.d, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function Waveform({ bars = 28, active = true }: { bars?: number; active?: boolean }) {
  return (
    <div className="flex h-8 items-center gap-[3px]">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.span
          key={i}
          className="bg-brand-gradient w-[3px] rounded-full"
          animate={active ? { height: [6, 10 + ((i * 7) % 22), 6] } : { height: 5 }}
          transition={{
            duration: 1 + ((i % 5) * 0.15),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.04,
          }}
        />
      ))}
    </div>
  );
}

function ScoreRing({ label, value }: { label: string; value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const c = 2 * Math.PI * 26;
  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <div className="relative size-[68px]">
        <svg viewBox="0 0 64 64" className="size-full -rotate-90">
          <circle cx="32" cy="32" r="26" className="fill-none stroke-border" strokeWidth="5" />
          <motion.circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={inView ? { strokeDashoffset: c - (c * value) / 100 } : {}}
            transition={{ duration: 1.4, ease: EASE }}
          />
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute inset-0 grid place-items-center text-sm font-semibold">
          {value}
        </span>
      </div>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

function HeroDashboard() {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(useTransform(ry, [-0.5, 0.5], [8, -8]), {
    stiffness: 120,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(rx, [-0.5, 0.5], [-10, 10]), {
    stiffness: 120,
    damping: 20,
  });

  return (
    <motion.div
      className="relative [perspective:1400px]"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        rx.set((e.clientX - r.left) / r.width - 0.5);
        ry.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1, ease: EASE, delay: 0.25 }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="glass glow-ring relative rounded-2xl p-4"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            <span className="text-xs font-medium">Interview in progress</span>
          </div>
          <span className="rounded-md border border-border bg-secondary/50 px-2 py-1 font-mono text-[11px] text-muted-foreground">
            18:24
          </span>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            { icon: FileText, t: "Resume uploaded", s: "arjun_sde2.pdf" },
            { icon: ClipboardList, t: "Job description", s: "Backend Engineer · Fintech" },
          ].map((c) => (
            <div
              key={c.t}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/60 p-3"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-secondary">
                <c.icon className="size-4 text-primary" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{c.t}</p>
                <p className="truncate text-[11px] text-muted-foreground">{c.s}</p>
              </div>
              <Check className="ml-auto size-4 shrink-0 text-primary" />
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-xl border border-border bg-surface-2/60 p-4">
          <div className="flex items-center gap-3">
            <span className="bg-brand-gradient grid size-8 place-items-center rounded-full">
              <Mic className="size-4 text-primary-foreground" />
            </span>
            <Waveform />
            <span className="ml-auto text-[11px] text-muted-foreground">AI speaking</span>
          </div>
          <div className="mt-4 space-y-2.5 text-[13px] leading-relaxed">
            <p className="text-muted-foreground">
              <span className="text-foreground">AI:</span> Walk me through how you kept your cache
              layer consistent under write bursts.
            </p>
            <p className="text-muted-foreground">
              <span className="text-foreground">You:</span> I used a write-through cache with a
              short TTL and…
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3 rounded-xl border border-border bg-surface-2/60 p-4">
          <ScoreRing label="Feedback" value={86} />
          <ScoreRing label="Confidence" value={78} />
          <ScoreRing label="Communication" value={91} />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="glass absolute -top-6 -left-6 hidden rounded-xl px-3 py-2 lg:block"
      >
        <p className="text-[11px] text-muted-foreground">Technical question 7 / 12</p>
      </motion.div>
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="glass absolute -right-5 bottom-16 hidden items-center gap-2 rounded-xl px-3 py-2 lg:flex"
      >
        <TrendingUp className="size-3.5 text-primary" />
        <p className="text-[11px]">+14% since last session</p>
      </motion.div>
    </motion.div>
  );
}

function Hero() {
  return (
    <section id="top" className="noise relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      <Blobs />
      <Particles />
      <div className="grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[1.05fr_1fr]">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              Voice-native AI interviewer
            </span>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl md:leading-[1.05]"
          >
            <span className="text-gradient">Your Personal AI Interviewer.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xl text-base leading-relaxed text-pretty text-muted-foreground md:text-lg"
          >
            Practice realistic AI interviews tailored to your resume and job description. Receive
            deep technical feedback, improve your confidence, and crack your next software
            engineering interview.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
            <GradientButton href="/login" className="px-5 py-3">
              Start Mock Interview <ArrowRight className="size-4" />
            </GradientButton>
            <GhostButton href="#demo" className="px-5 py-3">
              <Play className="size-4" /> Watch Demo
            </GhostButton>
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" /> Resume stays private
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5" /> 12,000+ practice sessions
            </span>
          </motion.div>
        </motion.div>

        <HeroDashboard />
      </div>
    </section>
  );
}

/* -------------------------------- social proof ------------------------------ */

const LOGOS = ["Northwind", "Aperture", "Lumenly", "Volten", "Cobalt", "Harbor", "Quanta", "Fern"];

function SocialProof() {
  return (
    <section className="border-y border-border py-12">
      <p className="text-center text-xs tracking-[0.18em] text-muted-foreground uppercase">
        Trusted by aspiring software engineers
      </p>
      <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="animate-marquee flex w-max items-center gap-14 opacity-55">
          {[...LOGOS, ...LOGOS].map((l, i) => (
            <span
              key={`${l}-${i}`}
              className="flex items-center gap-2 text-sm font-semibold tracking-tight text-muted-foreground"
            >
              <span className="size-3.5 rounded-[4px] border border-muted-foreground/60" />
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- features -------------------------------- */

const FEATURES = [
  { icon: Mic, t: "AI Voice Interviews", d: "Natural spoken interviews with human-like pacing." },
  {
    icon: Repeat,
    t: "Real-Time Follow-Ups",
    d: "Cross-questions built from what you just answered.",
  },
  { icon: FileText, t: "Resume Based Interviews", d: "Every project on your resume gets probed." },
  { icon: Target, t: "Job Description Matching", d: "Questions weighted to the exact role." },
  { icon: Users, t: "Behavioral Interviews", d: "STAR-structured rounds with tone analysis." },
  { icon: Braces, t: "Technical Interviews", d: "DSA, system design, and language internals." },
  { icon: Building2, t: "Company Specific", d: "Match the bar and style of your target company." },
  { icon: ClipboardList, t: "Instant Interview Report", d: "A full breakdown seconds after you end." },
  { icon: Activity, t: "Weakness Detection", d: "Pinpoints the concepts that cost you points." },
  { icon: BrainCircuit, t: "Improvement Plan", d: "A personalized week-by-week practice path." },
  { icon: History, t: "Interview History", d: "Track every session and score over time." },
  { icon: PlayCircle, t: "Interview Replay", d: "Replay audio with a synced annotated transcript." },
];

function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Features"
          title={<>Everything a real interviewer does — on demand.</>}
          sub="Nexora listens, reasons about your answer, and pushes deeper, exactly like a senior engineer across the table."
        />
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((f) => (
            <motion.article
              key={f.t}
              variants={fadeUp}
              className="hover-lift group relative overflow-hidden rounded-2xl border border-border bg-surface/60 p-6"
            >
              <div
                aria-hidden
                className="absolute -top-16 -right-16 size-40 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--brand-purple)_28%,transparent),transparent_70%)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
              />
              <span className="relative grid size-10 place-items-center rounded-xl border border-border bg-secondary/70">
                <f.icon className="size-[18px] text-primary" />
              </span>
              <h3 className="relative mt-5 text-[15px] font-semibold tracking-tight">{f.t}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------- how it works ------------------------------- */

const STEPS = [
  { t: "Upload Resume", d: "We parse your projects, stack, and experience depth.", icon: FileText },
  {
    t: "Paste Job Description",
    d: "Nexora maps role requirements to a question plan.",
    icon: ClipboardList,
  },
  { t: "Take AI Voice Interview", d: "Speak naturally. Expect follow-ups.", icon: Mic },
  { t: "Receive Detailed Report", d: "Scores, weak topics, and a practice plan.", icon: LineChart },
];

function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 60%"],
  });
  const height = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="How it works"
          title="From resume to report in four steps."
          sub="No setup, no scheduling, no awkward peer mock. Start an interview whenever you have twenty minutes."
        />
        <div ref={ref} className="relative mx-auto mt-16 max-w-3xl">
          <div className="absolute top-2 bottom-2 left-[19px] w-px bg-border md:left-1/2 md:-translate-x-1/2" />
          <motion.div
            style={{ scaleY: height }}
            className="bg-brand-gradient absolute top-2 bottom-2 left-[19px] w-px origin-top md:left-1/2 md:-translate-x-1/2"
          />
          <div className="space-y-10">
            {STEPS.map((s, i) => (
              <Reveal key={s.t} delay={i * 0.05}>
                <div
                  className={`relative flex items-start gap-5 pl-12 md:w-1/2 ${
                    i % 2 === 0
                      ? "md:pl-0 md:pr-12 md:text-right"
                      : "md:ml-auto md:pl-12 md:pr-0"
                  }`}
                >
                  <span
                    className={`bg-brand-gradient absolute top-1 left-[10px] grid size-[18px] place-items-center rounded-full ring-4 ring-background ${
                      i % 2 === 0
                        ? "md:left-auto md:-right-[9px]"
                        : "md:-left-[9px] md:right-auto"
                    }`}
                  >
                    <span className="size-1.5 rounded-full bg-primary-foreground" />
                  </span>
                  <div className={i % 2 === 0 ? "md:ml-auto" : ""}>
                    <p className="text-xs tracking-widest text-muted-foreground uppercase">
                      Step {i + 1}
                    </p>
                    <h3 className="mt-2 flex items-center gap-2 text-lg font-semibold tracking-tight md:inline-flex">
                      <s.icon className="size-4 text-primary" />
                      {s.t}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- demo ------------------------------------ */

const SCRIPT: { who: "ai" | "you"; text: string }[] = [
  { who: "ai", text: "Tell me about yourself." },
  { who: "you", text: "I'm a backend engineer working mostly on Node and Redis-backed services…" },
  { who: "ai", text: "Interesting. You mentioned Redis. Why Redis instead of Memcached?" },
  { who: "you", text: "We needed sorted sets and persistence for the leaderboard workload." },
  { who: "ai", text: "Suppose Redis crashes. How will your backend recover?" },
];

function useTypedScript() {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const line = SCRIPT[index % SCRIPT.length]!;
    let i = 0;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTyped("");
    const id = window.setInterval(() => {
      i += 1;
      setTyped(line.text.slice(0, i));
      if (i >= line.text.length) {
        window.clearInterval(id);
        window.setTimeout(() => setIndex((v) => v + 1), 1600);
      }
    }, 24);
    return () => window.clearInterval(id);
  }, [index]);

  return { index, typed };
}

function DemoSection() {
  const { index, typed } = useTypedScript();
  const history = SCRIPT.slice(0, index % SCRIPT.length);
  const current = SCRIPT[index % SCRIPT.length]!;

  return (
    <section id="demo" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Live demo"
          title="Listen to how an interview actually flows."
          sub="Nexora holds context across the conversation, so one shallow answer turns into three sharper questions."
        />
        <Reveal className="mt-14">
          <div className="glass glow-ring relative mx-auto max-w-3xl overflow-hidden rounded-2xl p-6 md:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--brand-blue)_28%,transparent),transparent_70%)] blur-3xl"
            />
            <div className="relative flex flex-col items-center gap-4">
              <motion.span
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="bg-brand-gradient grid size-16 place-items-center rounded-full shadow-[0_0_60px_-10px_oklch(0.554_0.234_293.6/0.9)]"
              >
                <AudioLines className="size-7 text-primary-foreground" />
              </motion.span>
              <Waveform bars={40} active={current.who === "ai"} />
              <p className="text-[11px] tracking-widest text-muted-foreground uppercase">
                {current.who === "ai" ? "Nexora is speaking" : "Listening to you"}
              </p>
            </div>

            <div className="relative mt-8 space-y-3">
              {history.slice(-2).map((l, i) => (
                <p key={i} className="text-sm leading-relaxed text-muted-foreground/60">
                  <span className="font-medium text-foreground/70">
                    {l.who === "ai" ? "AI" : "You"}:
                  </span>{" "}
                  {l.text}
                </p>
              ))}
              <p className="text-base leading-relaxed">
                <span className={current.who === "ai" ? "text-primary" : "text-muted-foreground"}>
                  {current.who === "ai" ? "AI" : "You"}:
                </span>{" "}
                {typed}
                <span className="animate-caret ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] bg-primary" />
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------- comparison -------------------------------- */

const COMPARE = [
  ["Static question banks", "Adaptive questions from your answers"],
  ["Generic feedback", "Deep technical analysis per topic"],
  ["No follow-up questions", "Real cross questioning"],
  ["No memory of the session", "Full conversation memory"],
  ["One-way chatbot", "A real AI interviewer that listens"],
];

function WhyNexora() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Why Nexora"
          title="Practice that actually behaves like an interview."
        />
        <Reveal className="mt-14">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border bg-surface/50">
            <div className="grid grid-cols-2 border-b border-border text-sm font-medium">
              <div className="px-5 py-4 text-muted-foreground">Traditional practice</div>
              <div className="bg-brand-gradient bg-clip-text px-5 py-4 text-transparent">
                Nexora
              </div>
            </div>
            {COMPARE.map(([a, b], i) => (
              <motion.div
                key={a}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
                className="grid grid-cols-2 border-b border-border last:border-b-0"
              >
                <div className="flex items-start gap-2.5 px-5 py-4 text-sm text-muted-foreground">
                  <X className="mt-0.5 size-4 shrink-0 opacity-60" />
                  {a}
                </div>
                <div className="flex items-start gap-2.5 border-l border-border px-5 py-4 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {b}
                </div>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------- report preview ------------------------------- */

const RADAR = [
  { k: "Technical", v: 88 },
  { k: "Confidence", v: 74 },
  { k: "Communication", v: 91 },
  { k: "Problem Solving", v: 82 },
  { k: "Behavior", v: 79 },
];

const TREND = [
  { s: "1", v: 54 },
  { s: "2", v: 61 },
  { s: "3", v: 66 },
  { s: "4", v: 72 },
  { s: "5", v: 79 },
  { s: "6", v: 84 },
];

function ReportPreview() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Interview report"
          title="A report your mentor would be proud of."
          sub="Every session ends with measurable signal — what you nailed, what broke down, and exactly what to study next."
        />
        <Reveal className="mt-14">
          <div className="glass grid gap-4 rounded-2xl p-4 md:p-6 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface-2/60 p-5">
              <p className="text-xs text-muted-foreground">Overall score</p>
              <p className="text-brand-gradient mt-1 text-5xl font-bold tracking-tight">83</p>
              <p className="mt-1 text-xs text-muted-foreground">Strong hire signal for SDE-2</p>
              <div className="mt-6 space-y-3">
                {RADAR.map((r) => (
                  <div key={r.k}>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{r.k}</span>
                      <span>{r.v}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <motion.div
                        className="bg-brand-gradient h-full rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${r.v}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, ease: EASE }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface-2/60 p-5">
              <p className="text-xs text-muted-foreground">Skill radar</p>
              <div className="mt-2 h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={RADAR} outerRadius="72%">
                    <PolarGrid stroke="oklch(1 0 0 / 12%)" />
                    <PolarAngleAxis
                      dataKey="k"
                      tick={{ fill: "oklch(0.672 0.012 286)", fontSize: 10 }}
                    />
                    <Radar
                      dataKey="v"
                      stroke="#7C3AED"
                      fill="#7C3AED"
                      fillOpacity={0.28}
                      isAnimationActive
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-border bg-surface-2/60 p-5">
                <p className="text-xs text-muted-foreground">Progress over sessions</p>
                <div className="mt-2 h-[110px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={TREND} margin={{ top: 6, right: 4, bottom: 0, left: 4 }}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        fill="url(#areaGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-surface-2/60 p-5">
                <p className="text-xs text-muted-foreground">Weak topics</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Cache invalidation", "Idempotency", "Index selection"].map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-destructive/25 bg-destructive/10 px-2 py-1 text-[11px] text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">Strong topics</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["REST design", "Concurrency", "Debugging story"].map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-primary/25 bg-primary/10 px-2 py-1 text-[11px] text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------- testimonials ------------------------------- */

const TESTIMONIALS = [
  {
    q: "The follow-ups broke me in practice so the real panel didn't. First time I felt calm in a system design round.",
    n: "Ananya R.",
    r: "SDE-1 · Fintech",
    g: "from-[#7C3AED] to-[#2563EB]",
  },
  {
    q: "It caught that I hand-wave around concurrency. Two weeks on the improvement plan and my scores moved 20 points.",
    n: "Dev M.",
    r: "Backend Engineer",
    g: "from-[#2563EB] to-[#7C3AED]",
  },
  {
    q: "Reading my own transcript was brutal and useful. The replay feature is the reason I actually improved.",
    n: "Sara K.",
    r: "Full-stack Engineer",
    g: "from-[#7C3AED] to-[#4F46E5]",
  },
];

function Testimonials() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading eyebrow="Testimonials" title="Quiet confidence, earned in practice." />
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-14 grid gap-4 md:grid-cols-3"
        >
          {TESTIMONIALS.map((t) => (
            <motion.figure
              key={t.n}
              variants={fadeUp}
              className="hover-lift rounded-2xl border border-border bg-surface/60 p-6"
            >
              <blockquote className="text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.q}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span
                  className={`grid size-9 place-items-center rounded-full bg-gradient-to-br ${t.g} text-xs font-semibold text-primary-foreground`}
                >
                  {t.n.charAt(0)}
                </span>
                <span>
                  <span className="block text-[13px] font-medium">{t.n}</span>
                  <span className="block text-[11px] text-muted-foreground">{t.r}</span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------------------------- pricing --------------------------------- */

type PricingRegion = "IN" | "US";

const PRICING_REGIONS: { code: PricingRegion; label: string; flag: string }[] = [
  { code: "IN", label: "India", flag: "🇮🇳" },
  { code: "US", label: "US", flag: "🇺🇸" },
];

const PLANS = [
  {
    name: "Free",
    price: { IN: "₹0", US: "$0" },
    period: "forever",
    note: "Start with the basics",
    items: ["1 free interview", "Basic AI report", "Resume and JD matching"],
    featured: false,
    cta: "Start Free",
  },
  {
    name: "Pay Per Interview",
    price: { IN: "₹40", US: "$0.42" },
    period: "per interview",
    note: "Buy only when you practice",
    items: ["1 full voice interview", "Detailed scorecard", "Personal improvement plan"],
    featured: true,
    cta: "Buy Interview",
  },
  {
    name: "Enterprise",
    price: { IN: "Custom", US: "Custom" },
    period: "pricing",
    note: "For teams and hiring programs",
    items: ["Bulk candidate interviews", "HR analytics dashboard", "Custom reports and support"],
    featured: false,
    cta: "Contact Sales",
  },
];

function Pricing() {
  const [region, setRegion] = useState<PricingRegion>("IN");

  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple pricing for every interview prep journey."
          sub="Start free, pay per interview, or build a custom plan for your hiring team."
        />
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-xl border border-border bg-surface/70 p-1">
            {PRICING_REGIONS.map((item) => (
              <button
                key={item.code}
                type="button"
                aria-pressed={region === item.code}
                onClick={() => setRegion(item.code)}
                className={`flex min-w-24 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  region === item.code
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span aria-hidden>{item.flag}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-14 grid gap-4 md:grid-cols-3"
        >
          {PLANS.map((p) => (
            <motion.div
              key={p.name}
              variants={fadeUp}
              className={`relative rounded-2xl border p-7 ${
                p.featured
                  ? "glow-ring border-primary/40 bg-surface"
                  : "hover-lift border-border bg-surface/50"
              }`}
            >
              {p.featured ? (
                <span className="bg-brand-gradient absolute -top-3 left-7 rounded-full px-2.5 py-1 text-[11px] font-medium text-primary-foreground">
                  Most popular
                </span>
              ) : null}
              <h3 className="text-sm font-medium">{p.name}</h3>
              <p className="mt-3 text-4xl font-bold tracking-tight">
                {p.price[region]}
                <span className="text-sm font-normal text-muted-foreground">
                  {p.price[region] === "Custom" ? "" : p.period === "forever" ? ` ${p.period}` : `/${p.period}`}
                </span>
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">{p.note}</p>
              <ul className="mt-6 space-y-2.5">
                {p.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 shrink-0 text-primary" /> {item}
                  </li>
                ))}
              </ul>
              {p.featured ? (
                <GradientButton href="/login" className="mt-7 w-full justify-center py-3">
                  {p.cta}
                </GradientButton>
              ) : (
                <GhostButton href="/login" className="mt-7 w-full justify-center py-3">
                  {p.cta}
                </GhostButton>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------ FAQ ----------------------------------- */

const FAQS = [
  {
    q: "How realistic are the interviews?",
    a: "Nexora speaks, listens, and interrupts with follow-ups based on your actual answer — including pressure questions on the tradeoffs you mention.",
  },
  {
    q: "Which roles are supported?",
    a: "Software engineering roles across backend, frontend, full-stack, mobile, data, and platform, from intern through senior.",
  },
  {
    q: "Can I upload my own resume?",
    a: "Yes. Upload a PDF and the interviewer builds questions around your specific projects, stack, and claims.",
  },
  {
    q: "Can I practice company-specific interviews?",
    a: "Pick a target company profile and the question mix, difficulty curve, and rubric adjust to match that bar.",
  },
  {
    q: "How is the feedback generated?",
    a: "Your transcript is scored against a rubric for technical depth, structure, communication, and confidence, then turned into concrete study actions.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-5">
        <SectionHeading eyebrow="FAQ" title="Answers before you start." />
        <div className="mt-12 divide-y divide-border rounded-2xl border border-border bg-surface/50">
          {FAQS.map((f, i) => (
            <div key={f.q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="text-[15px] font-medium">{f.q}</span>
                <ChevronDown
                  className={`size-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <motion.div
                initial={false}
                animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="overflow-hidden"
              >
                <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- CTA/foot -------------------------------- */

function FinalCTA() {
  return (
    <section className="relative px-5 py-20">
      <Reveal>
        <div className="noise relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-surface px-6 py-20 text-center">
          <div
            aria-hidden
            className="animate-blob absolute -top-32 left-1/2 size-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--brand-purple)_40%,transparent),transparent_65%)] blur-3xl"
          />
          <div className="grid-bg pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse,black,transparent_70%)]" />
          <h2 className="relative text-3xl font-bold tracking-tight text-balance sm:text-5xl">
            Ready to Crack Your Next Interview?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
            Your first interview is free. Twenty minutes from now you&apos;ll know exactly what to fix.
          </p>
          <div className="relative mt-8 flex justify-center">
            <GradientButton href="/login" className="px-6 py-3.5 text-[15px]">
              Start Your First Interview <ArrowRight className="size-4" />
            </GradientButton>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 sm:flex-row">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="bg-brand-gradient grid size-7 place-items-center rounded-lg">
            <AudioLines className="size-3.5 text-primary-foreground" />
          </span>
          <span className="text-sm font-semibold tracking-tight">Nexora</span>
        </a>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {["Features", "How it Works", "Pricing", "FAQ"].map((l) => (
            <a
              key={l}
              href={l === "Pricing" ? "#pricing" : l === "FAQ" ? "#faq" : l === "Features" ? "#features" : "#how-it-works"}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {l}
            </a>
          ))}
        </nav>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Nexora</p>
      </div>
    </footer>
  );
}

/* ---------------------------------- page ------------------------------------ */

export default function NexoraLanding() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      <ScrollProgress />
      <CursorSpotlight />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <SocialProof />
        <Features />
        <HowItWorks />
        <DemoSection />
        <WhyNexora />
        <ReportPreview />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
