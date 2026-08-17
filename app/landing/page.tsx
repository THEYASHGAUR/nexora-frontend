"use client";

import { useState, useRef, FormEvent, DragEvent, KeyboardEvent } from "react";

interface AnalysisResult {
  match_score?: string;
  ats_score?: string;
  summary?: string;
  strengths?: string[];
  missing_skills?: string[];
}

interface ApiResponse {
  analysis: string | AnalysisResult;
  jd_summary: string | object;
  selected_chunks_count?: number;
}

type TabType = "text" | "link" | "file";

export default function ResumeAnalyzer() {
  const [activeTab, setActiveTab] = useState<TabType>("text");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ApiResponse | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "warn" | "success";
  } | null>(null);

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8009";
  const ANALYZE_ENDPOINT = `${backendUrl}/analyze`;
  const DEFAULT_TOP_K = 5;

  const showToast = (message: string, type: "warn" | "success" = "warn") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return "";
    const units = ["B", "KB", "MB", "GB"];
    const exponent = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
    );
    const size = bytes / 1024 ** exponent;
    return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[exponent]}`;
  };

  const handleFileSelect = (file: File | undefined) => {
    if (file) setResumeFile(file);
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) setResumeFile(file);
  };

  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault();

    if (!resumeFile) {
      showToast("Please upload your resume to proceed.");
      return;
    }

    if (!jdText.trim()) {
      showToast("Provide a JD file or paste the JD text to continue.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("top_k", String(DEFAULT_TOP_K));
    formData.append("jd_text", jdText);

    setIsAnalyzing(true);
    showToast("Analyzing resume...");

    try {
      const response = await fetch(ANALYZE_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      const payload: ApiResponse = await response.json();

      if (!response.ok) {
        const errorMessage =
          (payload as { error?: string })?.error || "Unable to analyze resume.";
        throw new Error(errorMessage);
      }

      showToast("Analysis complete!", "success");
      setResults(payload);
      setTimeout(
        () => resultsRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to analyze resume.";
      showToast(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const parseAnalysis = (analysis: string | AnalysisResult): AnalysisResult => {
    const stripCodeFence = (s: string) => {
      return s
        .replace(/^```\s*json\s*/i, "")
        .replace(/^```/, "")
        .replace(/```\s*$/, "")
        .trim();
    };

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const normalize = (obj: any): AnalysisResult => {
      if (!obj || typeof obj !== "object") return {};
      const out: AnalysisResult = {};
      out.match_score =
        (obj.match_score ?? obj.matchScore ?? obj.match) || obj.score;
      out.ats_score =
        obj.ats_score ?? obj.atsScore ?? obj.ats ?? null;
      // summary may be under several keys (summary or an advice question)
      out.summary =
        obj.summary ??
        obj.description ??
        obj["Should u apply in this Job?"] ??
        obj["should_u_apply"] ??
        obj["should_apply"];
      // ensure arrays
      out.strengths = Array.isArray(obj.strengths)
        ? obj.strengths
        : obj.strengths
        ? [String(obj.strengths)]
        : [];
      out.missing_skills = Array.isArray(obj.missing_skills)
        ? obj.missing_skills
        : obj.missingSkills
        ? obj.missingSkills
        : obj.missing_skills
        ? [String(obj.missing_skills)]
        : [];
      return out;
    };

    if (typeof analysis === "string") {
      const cleaned = stripCodeFence(analysis);
      try {
        const parsed = JSON.parse(cleaned);
        return normalize(parsed);
      } catch {
        return {};
      }
    }
    return normalize(analysis as AnalysisResult);
  };

  const parseJdSummary = (jd: string | object) => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const normalizeJd = (obj: any) => {
      if (!obj || typeof obj !== "object") return obj;
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const out: any = {};
      out.job_title =
        obj.job_title ||
        obj.jobTitle ||
        obj.title ||
        obj.jobTitle_raw ||
        obj["job title"] ||
        obj.job ||
        null;
      out.company = obj.company || obj.company_name || obj.employer || null;
      out.location = obj.location || obj.city || obj.location_raw || null;
      out.company_description =
        obj.company_description ||
        obj.company_description ||
        obj.company_overview ||
        obj.company_summary ||
        null;
      out.overview = obj.overview || obj.description || obj.summary || null;
      out.role_summary =
        obj.role_summary || obj.role_description || obj.role || null;
      out.responsibilities =
        obj.responsibilities || obj.responsibility || obj.resp || [];

      // Normalize requirements nested object
      const req =
        obj.requirements || obj.requirement || obj.requirement_details || {};
      out.requirements = {};
      out.requirements.education =
        req.education ||
        req.education_required ||
        req.education_required ||
        req["education_required"] ||
        req.education_required ||
        req.education_required ||
        null;
      out.requirements.experience =
        req.experience ||
        req.experience_required ||
        req["experience_required"] ||
        req.years ||
        null;
      out.requirements.skills =
        req.skills ||
        req.skills_required ||
        req.skills_required ||
        req.skills_required ||
        req.skills_required ||
        req.skills_required ||
        [];

      out.must_haves = obj.must_haves || obj.mustHaves || obj.mandatory || [];
      out.nice_to_haves =
        obj.nice_to_haves || obj.niceToHaves || obj.preferred || [];
      out.benefits =
        obj.benefits || obj.package_offering || obj.benefits_offered || [];
      return out;
    };

    if (typeof jd !== "string") {
      // already an object, normalize and return
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      return normalizeJd(jd as any);
    }

    const stripCodeFence = (s: string) =>
      s
        .replace(/^```\s*json\s*/i, "")
        .replace(/^```/, "")
        .replace(/```\s*$/, "")
        .trim();
    const cleaned = stripCodeFence(jd as string);
    try {
      const parsed = JSON.parse(cleaned);
      return normalizeJd(parsed);
    } catch {
      return jd; // return original string if not parseable
    }
  };

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const buildJdTextForCopy = (jd: any) => {
    if (!jd) return "";
    if (typeof jd === "string") return jd;

    const lines: string[] = [];
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const push = (label: string, value: any) => {
      if (!value) return;
      lines.push(`${label}: ${value}`);
    };

    push("Job Title", jd.job_title || jd.jobTitle || jd.title);
    push("Company", jd.company);
    push("Location", jd.location);
    if (jd.company_description) {
      lines.push("");
      lines.push("Company Description:");
      lines.push(jd.company_description);
    }
    if (jd.overview) {
      lines.push("");
      lines.push("Overview:");
      lines.push(jd.overview);
    }
    if (jd.role_summary || jd.role_description) {
      lines.push("");
      lines.push("Role:");
      lines.push(jd.role_summary || jd.role_description);
    }
    if (Array.isArray(jd.responsibilities) && jd.responsibilities.length) {
      lines.push("");
      lines.push("Responsibilities:");
      jd.responsibilities.forEach((r: string) => lines.push(`- ${r}`));
    }
    const req = jd.requirements || {};
    if (req.education || req.experience || Array.isArray(req.skills)) {
      lines.push("");
      lines.push("Requirements:");
      if (req.education) lines.push(`- Education: ${req.education}`);
      if (req.experience) lines.push(`- Experience: ${req.experience}`);
      if (Array.isArray(req.skills) && req.skills.length) {
        lines.push("- Skills:");
        req.skills.forEach((s: string) => lines.push(`  - ${s}`));
      }
    }

    if (Array.isArray(jd.must_haves) && jd.must_haves.length) {
      lines.push("");
      lines.push("Must Haves:");
      jd.must_haves.forEach((m: string) => lines.push(`- ${m}`));
    }
    if (Array.isArray(jd.nice_to_haves) && jd.nice_to_haves.length) {
      lines.push("");
      lines.push("Nice To Haves:");
      jd.nice_to_haves.forEach((n: string) => lines.push(`- ${n}`));
    }
    if (Array.isArray(jd.benefits) && jd.benefits.length) {
      lines.push("");
      lines.push("Benefits:");
      jd.benefits.forEach((b: string) => lines.push(`- ${b}`));
    }

    return lines.join("\n");
  };

  const analysis = results ? parseAnalysis(results.analysis) : null;
  const jdSummaryParsed = results ? parseJdSummary(results.jd_summary) : null;

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-white selection:bg-zinc-700">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-24">
        {/* Header */}
        <header className="mb-12 space-y-4 text-center md:text-left">
          <div className="inline-block px-3 py-1 bg-zinc-700/50 border border-zinc-800 rounded-full text-xs font-semibold text-zinc-300 tracking-wider uppercase">
            AI-Powered Analysis
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Resume Analyzer
          </h1>
          <p className="text-zinc-500 max-w-xl text-lg md:text-xl">
            Upload your resume and the job description to get an instant match score and personalized feedback.
          </p>
        </header>

        {/* Main Form */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Resume Upload */}
          <section className="bg-zinc-900 p-6 md:p-8 rounded-3xl border border-zinc-800 shadow-lg shadow-black/40">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-900 text-white text-xs">1</span>
              Your Resume
            </h2>
            
            {!resumeFile ? (
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragOver
                    ? "border-zinc-900 bg-zinc-950 scale-[1.02]"
                    : "border-zinc-800 hover:border-zinc-300 hover:bg-zinc-950/50"
                }`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => resumeInputRef.current?.click()}
                onKeyDown={(e: KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    resumeInputRef.current?.click();
                  }
                }}
                tabIndex={0}
                role="button"
              >
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                />
                <div className="w-12 h-12 mx-auto mb-4 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="font-semibold text-white mb-1">Upload Resume</p>
                <p className="text-sm text-zinc-500">PDF, DOC, or DOCX</p>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-950">
                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 shadow-sm">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{resumeFile.name}</p>
                  <p className="text-xs text-zinc-500">{formatBytes(resumeFile.size)}</p>
                </div>
                <button
                  onClick={() => setResumeFile(null)}
                  className="p-2 text-zinc-400 hover:text-zinc-400 hover:bg-zinc-700/50 rounded-lg transition-colors"
                  aria-label="Remove file"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </section>

          {/* Job Description */}
          <section className="bg-zinc-900 p-6 md:p-8 rounded-3xl border border-zinc-800 shadow-lg shadow-black/40">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-900 text-white text-xs">2</span>
              Job Description
            </h2>

            <div className="flex bg-zinc-800 p-1 rounded-xl mb-4">
              <button
                className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${activeTab === "text" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-white"}`}
                onClick={() => setActiveTab("text")}
              >
                Text
              </button>
              <button className="flex-1 text-sm font-semibold py-2 text-zinc-400 cursor-not-allowed">
                Link
              </button>
              <button
                className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${activeTab === "file" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-white"}`}
                onClick={() => setActiveTab("file")}
              >
                File
              </button>
            </div>

            {activeTab === "text" && (
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-[180px] p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-zinc-900 transition-all resize-none"
              />
            )}
            {activeTab === "file" && (
              <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-8 text-center bg-zinc-950 hover:border-zinc-300 hover:bg-zinc-200/50 transition-all cursor-pointer">
                <input type="file" accept=".pdf,.doc,.docx,.txt" className="block mx-auto text-xs mb-2 opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                <div className="w-10 h-10 mx-auto mb-3 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 border border-zinc-800">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-zinc-300">Upload JD file</p>
              </div>
            )}
          </section>
        </div>

        {/* Action Button */}
        <div className="flex justify-end mb-12">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full md:w-auto px-10 py-4 bg-white text-zinc-950 rounded-2xl font-semibold text-lg hover:bg-zinc-200 focus:outline-none focus:ring-4 focus:ring-white/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-zinc-900/10"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </>
            ) : (
              "Analyze Resume"
            )}
          </button>
        </div>

        {/* Results */}
        {results && (
          <section ref={resultsRef} className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Analysis Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-lg shadow-black/40 flex flex-col justify-between hover:border-zinc-300 transition-colors">
                <p className="text-sm font-bold text-zinc-500 mb-2 uppercase tracking-wider">Match Score</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold tracking-tighter text-white">{analysis?.match_score ?? "--"}</span>
                  <span className="text-xl font-bold text-zinc-400">/ 100</span>
                </div>
              </div>

              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-lg shadow-black/40 flex flex-col justify-between hover:border-zinc-300 transition-colors">
                <p className="text-sm font-bold text-zinc-500 mb-2 uppercase tracking-wider">ATS Score</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold tracking-tighter text-white">{analysis?.ats_score ?? "--"}</span>
                  <span className="text-xl font-bold text-zinc-400">/ 100</span>
                </div>
              </div>

              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-lg shadow-black/40 flex flex-col justify-between hover:border-zinc-300 transition-colors">
                <p className="text-sm font-bold text-zinc-500 mb-2 uppercase tracking-wider">Relevant Chunks</p>
                <span className="text-5xl font-extrabold tracking-tighter text-white">{results.selected_chunks_count ?? "--"}</span>
              </div>
            </div>

            <div className="p-8 bg-zinc-900 text-white rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-3 text-zinc-400 uppercase tracking-wider">Recommendation</h3>
              <p className="text-xl md:text-2xl font-medium leading-relaxed relative z-10">{analysis?.summary || "No summary returned."}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-lg shadow-black/40">
                <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500" />
                   Strengths
                </h3>
                <ul className="space-y-4">
                  {analysis?.strengths?.length ? (
                    analysis.strengths.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-zinc-300">
                        <svg className="w-5 h-5 text-white shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="leading-relaxed font-medium">{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-zinc-400 italic">None</li>
                  )}
                </ul>
              </div>

              <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-lg shadow-black/40">
                <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-red-500" />
                   Missing Skills
                </h3>
                <ul className="space-y-4">
                  {analysis?.missing_skills?.length ? (
                    analysis.missing_skills.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-zinc-300">
                        <svg className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                        <span className="leading-relaxed font-medium">{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-zinc-400 italic">None</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-lg shadow-black/40">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-white">JD Summary</h3>
                <button
                  onClick={async () => {
                    const textToCopy = buildJdTextForCopy(jdSummaryParsed ?? results?.jd_summary);
                    try {
                      await navigator.clipboard.writeText(textToCopy);
                      showToast("JD summary copied to clipboard", "success");
                    } catch {
                      showToast("Failed to copy JD summary", "warn");
                    }
                  }}
                  className="px-5 py-2 text-sm font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors focus:ring-2 focus:ring-zinc-200 outline-none"
                >
                  Copy Summary
                </button>
              </div>

              {typeof jdSummaryParsed === "string" ? (
                <p className="text-zinc-300 leading-relaxed font-medium">{jdSummaryParsed}</p>
              ) : (
                (() => {
                  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                  const jd: any = jdSummaryParsed;
                  return (
                    <div className="space-y-8 text-zinc-200">
                      <div>
                        <h4 className="text-2xl font-extrabold text-white">
                          {jd.job_title || jd.jobTitle || jd.title || "Job Title"}
                        </h4>
                        <p className="text-base text-zinc-500 mt-2 font-semibold">
                          {jd.company ? jd.company : ""}
                          {jd.company && jd.location ? " • " : ""}
                          {jd.location ? jd.location : ""}
                        </p>
                      </div>

                      {jd.overview && <p className="leading-relaxed text-lg">{jd.overview}</p>}

                      {(jd.role_summary || jd.role_description) && (
                        <div>
                          <h5 className="font-bold text-white mb-2 uppercase tracking-wider text-sm text-zinc-500">Role</h5>
                          <p className="leading-relaxed font-medium">{jd.role_summary || jd.role_description}</p>
                        </div>
                      )}

                      {Array.isArray(jd.responsibilities) && jd.responsibilities.length > 0 && (
                        <div>
                          <h5 className="font-bold text-white mb-4 uppercase tracking-wider text-sm text-zinc-500">Responsibilities</h5>
                          <ul className="space-y-3">
                            {jd.responsibilities.map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-4">
                                <span className="text-zinc-300 mt-1 text-xs">●</span>
                                <span className="leading-relaxed font-medium">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {jd.requirements && (
                        <div>
                          <h5 className="font-bold text-white mb-4 uppercase tracking-wider text-sm text-zinc-500">Requirements</h5>
                          <div className="space-y-3 bg-zinc-950 p-6 rounded-2xl border border-zinc-800/60">
                            {jd.requirements.education && (
                              <div className="flex flex-col sm:flex-row sm:gap-2">
                                <strong className="text-white min-w-[120px]">Education:</strong>
                                <span className="font-medium text-zinc-300">{jd.requirements.education}</span>
                              </div>
                            )}
                            {jd.requirements.experience && (
                              <div className="flex flex-col sm:flex-row sm:gap-2">
                                <strong className="text-white min-w-[120px]">Experience:</strong>
                                <span className="font-medium text-zinc-300">{jd.requirements.experience}</span>
                              </div>
                            )}
                            {jd.requirements.skills_required && (
                              <div className="flex flex-col sm:flex-row sm:gap-2">
                                <strong className="text-white min-w-[120px]">Skills:</strong>
                                <span className="font-medium text-zinc-300">{jd.requirements.skills_required}</span>
                              </div>
                            )}
                            {jd.package_offering && (
                              <div className="flex flex-col sm:flex-row sm:gap-2">
                                <strong className="text-white min-w-[120px]">Package:</strong>
                                <span className="font-medium text-zinc-300">{jd.package_offering}</span>
                              </div>
                            )}
                            
                            {Array.isArray(jd.requirements.skills) && jd.requirements.skills.length > 0 && (
                              <div className="mt-6 flex flex-wrap gap-2 pt-2 border-t border-zinc-800">
                                {jd.requirements.skills.map((s: string, i: number) => (
                                  <span key={i} className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm font-bold text-zinc-300 shadow-sm">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>

            <details className="group pt-4">
              <summary className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-white cursor-pointer select-none transition-colors">
                <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                View Raw Response
              </summary>
              <pre className="mt-4 p-6 text-xs text-zinc-400 bg-zinc-900 text-zinc-300 rounded-2xl overflow-x-auto shadow-inner">
                {JSON.stringify(results, null, 2)}
              </pre>
            </details>
          </section>
        )}

        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-sm font-bold shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-300 ${
              toast.type === "success"
                ? "bg-zinc-900 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
