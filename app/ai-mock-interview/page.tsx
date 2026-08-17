"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  User,
  Sparkles,
  X,
  Upload,
  Clock,
  Briefcase,
  Check,
  ChevronDown,
  Lock,
  Layers,
  Award,
  AlertCircle,
  ShieldCheck,
  Mic,
  Sun,
  Volume2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AIInterviewSetup() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Role and Experience Level
  const [role, setRole] = useState("Fullstack Developer");
  const [experienceLevel, setExperienceLevel] = useState("Mid-Level (2-5 yrs)");
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isExpOpen, setIsExpOpen] = useState(false);

  // Interview Type & Approx Duration
  const [interviewType, setInterviewType] = useState<
    "Technical Round" | "HR Round" | "Behavioural Round" | "Coding Round"
  >("Technical Round");
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  // Difficulty selection
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  // Error/Loading states
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const roleOptions = [
    "Fullstack Developer",
    "Frontend Engineer",
    "Backend Engineer",
    "DevOps Engineer",
    "AI/ML Engineer",
    "Mobile Developer",
  ];

  const expOptions = [
    "Junior (0-2 yrs)",
    "Mid-Level (2-5 yrs)",
    "Senior (5+ yrs)",
    "Lead / Architect",
  ];

  const interviewTypes = [
    {
      name: "Technical Round",
      durationDisplay: "~20–25 min",
      approxMinutes: 25,
      description: "Deep dive into core engineering concepts, architecture & trade-offs.",
      disabled: false,
    },
    {
      name: "HR Round",
      durationDisplay: "~10–15 min",
      approxMinutes: 15,
      description: "Cultural fit, career goals, background & communication skills.",
      disabled: false,
    },
    {
      name: "Behavioural Round",
      durationDisplay: "~10–15 min",
      approxMinutes: 15,
      description: "STAR-method questions on conflict resolution, leadership & teamwork.",
      disabled: false,
    },
    {
      name: "Coding Round",
      durationDisplay: "~30–45 min",
      approxMinutes: 45,
      description: "Live coding editor and algorithmic problem solving.",
      disabled: true,
      badge: "Coming Soon",
    },
  ] as const;

  const selectedTypeObj =
    interviewTypes.find((t) => t.name === interviewType) || interviewTypes[0];

  const roleRef = useRef<HTMLDivElement>(null);
  const expRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setIsRoleOpen(false);
      }
      if (expRef.current && !expRef.current.contains(event.target as Node)) {
        setIsExpOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setIsTypeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileRead = async (file: File) => {
    setFileName(file.name);

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8009";

        const res = await fetch(`${backendUrl}/extract-pdf`, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.text) {
            setResume(data.text);
            return;
          }
        }
      } catch (err) {
        console.warn("Backend PDF extraction fallback to local reader:", err);
      }
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawText = (e.target?.result as string) || "";
      // Strip null bytes (\u0000) and invalid non-printable control characters that crash PostgreSQL text columns
      const sanitizedText = rawText
        .replace(/\0/g, "")
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
        .replace(/%PDF-[^\n\r]+/g, "")
        .trim();

      setResume(sanitizedText || `Resume details from ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type.includes("text") || file.type === "application/pdf")) {
      handleFileRead(file);
    }
  };

  const handleStartInterview = async () => {
    setLoading(true);
    setLoadingStep("");
    setErrorMsg(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login?error=Please%20sign%20in%20to%20start%20your%20interview");
      return;
    }

    // Step 1: Microphone Access Check
    setLoadingStep("Requesting microphone access...");
    try {
      if (typeof window !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } else {
        throw new Error("Microphone API not supported in this browser environment");
      }
    } catch (micErr: unknown) {
      console.error("Microphone access check failed:", micErr);
      setErrorMsg(
        "Microphone access is required for the AI voice interview. Please grant microphone permissions in your browser settings and try again."
      );
      setLoading(false);
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8009";

    // Step 2: Verify Backend API Keys
    setLoadingStep("Verifying backend credentials...");
    try {
      const verifyRes = await fetch(`${backendUrl}/interview/verify-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!verifyRes.ok) {
        let errMsg = "Backend credential check failed.";
        try {
          const errData = await verifyRes.json();
          errMsg = errData?.detail?.error || errData?.error || errData?.detail || errMsg;
        } catch {}
        setErrorMsg(errMsg + " Please configure all keys in nexora-backend/.env");
        setLoading(false);
        return;
      }

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        setErrorMsg(
          verifyData.error ||
            "Backend credential check failed. Please ensure valid OpenAI, Deepgram, and LiveKit keys are configured."
        );
        setLoading(false);
        return;
      }
    } catch (err: unknown) {
      console.error("Backend API verification error:", err);
      setErrorMsg(
        `Cannot reach backend server at ${backendUrl}. Please ensure the nexora-backend server is running.`
      );
      setLoading(false);
      return;
    }

    // Step 3: Get Supabase auth token
    const { data: { session: authSession } } = await supabase.auth.getSession();
    const authToken = authSession?.access_token;

    // Step 4: Send to V1 /interviews endpoint (parse + plan)
    setLoadingStep("Analysing your resume and JD...");
    try {
      const cleanResume = (resume || "")
        .replace(/\0/g, "")
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ");
      const cleanJd = (jobDescription || "")
        .replace(/\0/g, "")
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ");

      const createRes = await fetch(`${backendUrl}/interviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          role,
          interview_type: selectedTypeObj.name,
          experience_level: experienceLevel,
          difficulty,
          duration_minutes: selectedTypeObj.approxMinutes,
          resume_text: cleanResume,
          jd_text: cleanJd,
        }),
      });

      if (!createRes.ok) {
        let errMsg = "Failed to prepare interview session.";
        try {
          const errData = await createRes.json();
          errMsg = errData?.detail || errData?.error || errMsg;
        } catch {}
        setErrorMsg(errMsg);
        setLoading(false);
        return;
      }

      const createData = await createRes.json();
      const sessionId = createData.session_id;

      if (!sessionId) {
        setErrorMsg("Backend did not return a valid session ID. Please try again.");
        setLoading(false);
        return;
      }

      // Step 5: Navigate to interview room with backend session_id
      setLoadingStep("Interview ready! Entering room...");
      router.push(`/ai-mock-interview/room/${sessionId}`);

    } catch (err: unknown) {
      console.error("Error creating interview session:", err);
      const msg = err instanceof Error ? err.message : "Failed to create interview session.";
      setErrorMsg(`Could not start interview: ${msg}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-white selection:bg-zinc-700 py-12 md:py-20 px-4">
      <div className="w-full max-w-5xl mx-auto">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <header className="mb-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800/80 border border-zinc-700/60 rounded-full text-xs font-semibold text-zinc-300 tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              AI Mock Interview Setup
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Configure Your Practice Interview
            </h1>
            <p className="text-zinc-400 max-w-2xl text-base md:text-lg mt-2">
              Select your targeted role and upload your details. The AI interviewer adapts question depth and session length dynamically to your responses.
            </p>
          </header>

          {/* Key Verification / General Error Alert */}
          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-xs md:text-sm text-destructive shadow-lg">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden">
            {/* Top Config Row: Role, Experience Level, Interview Type */}
            <div className="p-6 md:p-8 border-b border-zinc-800 bg-zinc-900/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Role Selection */}
                <div ref={roleRef} className="relative">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                    <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                    Target Role
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsRoleOpen(!isRoleOpen)}
                    className="w-full px-4 py-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between hover:border-zinc-700 transition-all text-sm font-medium text-zinc-200"
                  >
                    <span className="truncate">{role}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 transition-transform ${isRoleOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isRoleOpen && (
                    <div className="absolute z-30 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl py-2 max-h-56 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                      {roleOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setRole(opt);
                            setIsRoleOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-zinc-800 transition-colors text-sm font-medium text-zinc-300"
                        >
                          <span>{opt}</span>
                          {role === opt && <Check className="w-4 h-4 text-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Experience Level */}
                <div ref={expRef} className="relative">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                    <Award className="w-3.5 h-3.5 text-zinc-400" />
                    Experience Level
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsExpOpen(!isExpOpen)}
                    className="w-full px-4 py-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between hover:border-zinc-700 transition-all text-sm font-medium text-zinc-200"
                  >
                    <span className="truncate">{experienceLevel}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 transition-transform ${isExpOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isExpOpen && (
                    <div className="absolute z-30 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2">
                      {expOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setExperienceLevel(opt);
                            setIsExpOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-zinc-800 transition-colors text-sm font-medium text-zinc-300"
                        >
                          <span>{opt}</span>
                          {experienceLevel === opt && <Check className="w-4 h-4 text-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Interview Type Dropdown */}
                <div ref={typeRef} className="relative">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-zinc-400" />
                    Interview Type
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsTypeOpen(!isTypeOpen)}
                    className="w-full px-4 py-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between hover:border-zinc-700 transition-all text-sm font-medium text-zinc-200"
                  >
                    <span className="truncate">{interviewType}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 transition-transform ${isTypeOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isTypeOpen && (
                    <div className="absolute z-30 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2">
                      {interviewTypes.map((opt) => (
                        <button
                          key={opt.name}
                          type="button"
                          disabled={opt.disabled}
                          onClick={() => {
                            if (!opt.disabled) {
                              setInterviewType(opt.name);
                              setIsTypeOpen(false);
                            }
                          }}
                          className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors text-sm font-medium ${
                            opt.disabled
                              ? "opacity-50 cursor-not-allowed bg-zinc-950/40 text-zinc-500"
                              : "hover:bg-zinc-800 text-zinc-300"
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold">{opt.name}</span>
                            <span className="text-[11px] text-zinc-400">{opt.durationDisplay}</span>
                          </div>
                          {opt.disabled ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                              <Lock className="w-3 h-3" />
                              {opt.badge}
                            </span>
                          ) : (
                            interviewType === opt.name && <Check className="w-4 h-4 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Automatic Approx Duration Notice */}
              <div className="mt-5 flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    Estimated duration for <strong className="text-zinc-200">{selectedTypeObj.name}</strong> (adapts dynamically):
                  </span>
                </div>
                <span className="font-bold text-white bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1">
                  {selectedTypeObj.durationDisplay}
                </span>
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="px-6 md:px-8 pb-6 border-b border-zinc-800">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 mb-3 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["easy", "medium", "hard"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`px-4 py-3 rounded-2xl border text-sm font-semibold transition-all capitalize ${
                      difficulty === level
                        ? level === "easy"
                          ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300 shadow-lg shadow-emerald-500/10"
                          : level === "medium"
                          ? "border-amber-500/60 bg-amber-500/15 text-amber-300 shadow-lg shadow-amber-500/10"
                          : "border-red-500/60 bg-red-500/15 text-red-300 shadow-lg shadow-red-500/10"
                        : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                    }`}
                  >
                    {level === "easy" ? "🟢 Easy" : level === "medium" ? "🟡 Medium" : "🔴 Hard"}
                  </button>
                ))}
              </div>
            </div>

            {/* JD and Resume Upload Inputs */}
            <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
              {/* Job Description */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-7 h-7 bg-zinc-800 rounded-full flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-zinc-300" />
                  </div>
                  <h2 className="text-base font-bold text-white">Job Description</h2>
                </div>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the target job description here..."
                  className="w-full h-[210px] p-4 bg-zinc-950 border border-zinc-800 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-zinc-700 transition-all text-xs md:text-sm text-zinc-200 placeholder:text-zinc-600"
                />
              </div>

              {/* Resume */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-7 h-7 bg-zinc-800 rounded-full flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-zinc-300" />
                  </div>
                  <h2 className="text-base font-bold text-white">Your Resume</h2>
                </div>

                {!resume ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    className={`relative h-[210px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900/50"
                    }`}
                  >
                    <input
                      type="file"
                      accept=".txt,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileRead(file);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="w-10 h-10 mb-3 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 text-zinc-400">
                      <Upload className="w-4 h-4" />
                    </div>
                    <p className="font-semibold text-sm text-white mb-1">Upload Resume</p>
                    <p className="text-xs text-zinc-500">Supports TXT, PDF files</p>
                  </div>
                ) : (
                  <div className="h-[210px] bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-center">
                    <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-sm">
                      <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">
                          {fileName || "Resume Uploaded"}
                        </p>
                        <p className="text-xs text-emerald-400 mt-0.5 font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ready for AI analysis
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setResume("");
                          setFileName("");
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pre-Interview Environment Note */}
            <div className="mx-6 md:mx-8 mb-6 p-4 md:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs md:text-sm flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5 md:mt-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-amber-300 tracking-wide flex items-center gap-2">
                    Important Note Before Starting
                  </p>
                  <p className="text-amber-200/90 leading-relaxed text-xs md:text-xs">
                    Please make sure you are in a <strong>quiet environment</strong> with <strong>good lighting</strong> and a working <strong>microphone</strong> so that there will be no problems or background noise during your interview.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center text-[11px] font-semibold text-amber-300/80 bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-500/20">
                <Mic className="w-3.5 h-3.5" />
                <Sun className="w-3.5 h-3.5" />
                <Volume2 className="w-3.5 h-3.5" />
                <span>Quiet & Well-lit Room</span>
              </div>
            </div>

            {/* Start Button Footer */}
            <div className="p-6 md:p-8 pt-0 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800/60 mt-2">
              <div className="text-xs text-zinc-500 text-center sm:text-left flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                API credentials verified automatically before entering.
              </div>
              <button
                type="button"
                onClick={handleStartInterview}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 bg-brand-gradient hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="truncate max-w-[200px]">{loadingStep || "Preparing..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Start Voice Interview
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
