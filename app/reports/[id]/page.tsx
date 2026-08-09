"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  RotateCcw,
  History as HistoryIcon,
  ChevronLeft,
  Printer,
  Sparkles,
  TrendingUp,
  Brain,
  MessageSquare,
  Zap,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { createClient } from "@/lib/supabase/client";

interface InterviewRecord {
  id: string;
  user_id: string;
  role: string;
  experience_level: string;
  interview_type: string;
  actual_duration_seconds?: number;
  duration_minutes?: number;
  created_at?: string;
  status?: string;
}

export default function CandidateScoreReport({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const reportId = params.id;
  const router = useRouter();

  const [interview, setInterview] = useState<InterviewRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);
  const [reportData, setReportData] = useState<Record<string, unknown> | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReport() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?error=Please%20sign%20in%20to%20view%20your%20report");
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8009";
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const authToken = authSession?.access_token;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      };

      // First load session info
      try {
        const sessionRes = await fetch(`${backendUrl}/interviews/${reportId}`, { headers });
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setInterview({
            id: reportId,
            user_id: user.id,
            role: sessionData.role || "Interview",
            experience_level: sessionData.experience_level || "",
            interview_type: sessionData.interview_type || "Technical Round",
            duration_minutes: sessionData.duration_minutes || 30,
            status: sessionData.status,
          });
        }
      } catch (_) {}

      // Poll for report readiness (report is generated async after interview ends)
      let attempts = 0;
      const maxAttempts = 20; // Poll for up to ~60s

      const poll = async () => {
        attempts++;
        try {
          const reportRes = await fetch(`${backendUrl}/interviews/${reportId}/report`, { headers });

          if (reportRes.status === 200) {
            const data = await reportRes.json();
            if (data.report_ready && data.report) {
              setReportData(data.report);
              setPolling(false);
              setLoading(false);
              return;
            }
          } else if (reportRes.status === 409) {
            // Interview not ended yet
            setPollError("Interview session has not ended yet. Please end the interview first.");
            setPolling(false);
            setLoading(false);
            return;
          }

          if (attempts >= maxAttempts) {
            setPollError("Report generation is taking longer than expected. Please refresh the page in a few seconds.");
            setPolling(false);
            setLoading(false);
            return;
          }

          // Poll again in 3 seconds
          setTimeout(poll, 3000);
        } catch (_) {
          if (attempts >= maxAttempts) {
            setPolling(false);
            setLoading(false);
          } else {
            setTimeout(poll, 3000);
          }
        }
      };

      setLoading(false); // Show the page with loading indicator for the report section
      poll();
    }

    loadReport();
  }, [reportId, router]);

  const formatCallTime = (secs?: number) => {
    if (!secs) return "14 mins 05 secs";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} mins ${s} secs`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white px-4">
        <div className="relative size-16 flex items-center justify-center mb-4">
          <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-zinc-400 text-sm font-medium">Loading report...</p>
      </div>
    );
  }

  if (polling && !reportData) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white px-4">
        <div className="relative size-16 flex items-center justify-center mb-6">
          <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">Generating Your Report</h2>
        <p className="text-zinc-400 text-sm text-center max-w-sm">
          Our AI is analysing all your answers and generating a comprehensive scorecard. This usually takes 10–20 seconds.
        </p>
      </div>
    );
  }

  if (pollError && !reportData) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white px-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">Report Not Ready</h2>
        <p className="text-zinc-400 text-sm text-center max-w-sm mb-6">{pollError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // Helper to safely access report fields
  const rd = reportData || {};
  const overallScore = (rd.overall_score as number) ?? 0;
  const recommendation = (rd.recommendation as string) ?? "Needs Improvement";
  const technicalScore = (rd.technical_score as number) ?? 0;
  const communicationScore = (rd.communication_score as number) ?? 0;
  const problemSolvingScore = (rd.problem_solving_score as number) ?? 0;
  const jdMatchScore = (rd.jd_match_score as number) ?? 0;
  const strengths = (rd.strengths as Array<{area: string; detail: string}>) ?? [];
  const weaknesses = (rd.weaknesses as Array<{area: string; detail: string}>) ?? [];
  const recommendedTopics = (rd.recommended_topics as Array<{topic: string; reason: string}>) ?? [];
  const finalAssessment = (rd.final_assessment as string) ?? "";
  const competencyScores = (rd.competency_scores as Record<string, number>) ?? {};

  const radarSkills = Object.entries(competencyScores).map(([skill, score]) => ({
    skill,
    score: score as number,
  }));

  return (

    <div className="min-h-screen bg-zinc-950 text-white selection:bg-zinc-800 py-8 md:py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/history"
                className="text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-900"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Interview Completed
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Interview Evaluation Scorecard
            </h1>
            <p className="text-zinc-400 text-sm md:text-base mt-1">
              Candidate Performance Analysis for <strong className="text-white">{interview?.role}</strong> ({interview?.interview_type})
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
            <Link
              href="/ai-mock-interview"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gradient hover:opacity-95 text-xs font-semibold text-primary-foreground shadow-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              New Interview
            </Link>
          </div>
        </div>

        {/* Overview Row: Overall Score Ring & Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Overall Score Card */}
          <div className="md:col-span-5 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-brand-gradient" />

            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-6 flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              Overall Performance Rating
            </span>

            {/* Score Ring Gauge */}
            <div className="relative size-44 flex items-center justify-center mb-6">
              <svg className="size-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-zinc-800"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeDasharray="263.89"
                  strokeDashoffset={263.89 - (263.89 * overallScore) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--brand-purple, #a855f7)" />
                    <stop offset="100%" stopColor="var(--brand-blue, #3b82f6)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {overallScore}
                </span>
                <span className="text-xs text-zinc-500 font-medium">out of 100</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              {recommendation}
            </div>

            <p className="text-xs text-zinc-400 max-w-xs">
              Actual Call Time: <strong className="text-white">{formatCallTime(interview?.actual_duration_seconds)}</strong>
            </p>
          </div>

          {/* Sub-Skill Score Bars */}
          <div className="md:col-span-7 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Core Competency Breakdown
            </h3>

            <div className="space-y-5">
              {/* Skill Item 1 */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-zinc-300 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    Technical Knowledge
                  </span>
                  <span className="text-white">{technicalScore}%</span>
                </div>
                <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    style={{ width: `${technicalScore}%` }}
                  />
                </div>
              </div>

              {/* Skill Item 2 */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-zinc-300 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    Communication & Clarity
                  </span>
                  <span className="text-white">{communicationScore}%</span>
                </div>
                <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                    style={{ width: `${communicationScore}%` }}
                  />
                </div>
              </div>

              {/* Skill Item 3 */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-zinc-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Problem Solving & Trade-offs
                  </span>
                  <span className="text-white">{problemSolvingScore}%</span>
                </div>
                <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    style={{ width: `${problemSolvingScore}%` }}
                  />
                </div>
              </div>

              {/* Skill Item 4 */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-zinc-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    JD Match Score
                  </span>
                  <span className="text-white">{jdMatchScore}%</span>
                </div>
                <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    style={{ width: `${jdMatchScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skill Radar Chart & Key Strengths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Radar Chart */}
          <div className="md:col-span-5 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center justify-center shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 self-start">
              Candidate Skill Matrix
            </h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarSkills.length > 0 ? radarSkills : [{skill: "Technical", score: overallScore}]}>
                  <PolarGrid stroke="#3f3f46" />
                  <PolarAngleAxis dataKey="skill" stroke="#a1a1aa" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#52525b" />
                  <Radar
                    name="Candidate"
                    dataKey="score"
                    stroke="#a855f7"
                    fill="#a855f7"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Strengths */}
          <div className="md:col-span-7 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Key Strengths & Highlights
            </h3>
            <ul className="space-y-3.5">
              {strengths.length > 0 ? strengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs md:text-sm text-zinc-300 leading-relaxed">
                  <span className="size-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    ✓
                  </span>
                  <span>{item.detail || (item as unknown as string)}</span>
                </li>
              )) : (
                <li className="text-zinc-500 text-xs">No strengths recorded for this session.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Weak Areas & Personalized Roadmap */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Missed Concepts / Weak Points */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Weak Points & Missed Concepts
            </h3>
            <ul className="space-y-3.5">
              {weaknesses.length > 0 ? weaknesses.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs md:text-sm text-zinc-300 leading-relaxed">
                  <span className="size-5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    !
                  </span>
                  <span>{item.detail || (item as unknown as string)}</span>
                </li>
              )) : (
                <li className="text-zinc-500 text-xs">No weak areas identified.</li>
              )}
            </ul>
          </div>

          {/* Actionable Learning Roadmap */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Personalized Learning Roadmap
            </h3>
            <div className="space-y-4">
              {recommendedTopics.length > 0 ? recommendedTopics.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                  <span className="size-6 rounded-lg bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.topic}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{item.reason}</p>
                  </div>
                </div>
              )) : (
                <p className="text-zinc-500 text-xs">No specific topics recommended for this session.</p>
              )}
              {finalAssessment && (
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-primary/20 mt-2">
                  <p className="text-xs text-zinc-300 leading-relaxed italic">&ldquo;{finalAssessment}&rdquo;</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions Banner */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 hidden sm:flex">
              <HistoryIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Track Your Long-Term Growth</h4>
              <p className="text-xs text-zinc-400">View all your previous mock interviews and progress reports.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/history"
              className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 transition-colors"
            >
              View Interview History
            </Link>
            <Link
              href="/ai-mock-interview"
              className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-brand-gradient hover:opacity-95 text-xs font-semibold text-primary-foreground shadow-lg flex items-center justify-center gap-2"
            >
              Practice Again
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
