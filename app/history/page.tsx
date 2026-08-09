"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  History,
  Calendar,
  Clock,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Plus,
  Bot,
  ChevronRight,
  Play,
  Layers,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface InterviewItem {
  id: string;
  user_id: string;
  role: string;
  experience_level: string;
  interview_type: string;
  duration_minutes?: number;
  actual_duration_seconds?: number;
  created_at?: string;
  status?: string;
}

export default function CandidateInterviewHistory() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "completed" | "scheduled">("all");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    async function loadHistory() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?error=Please%20sign%20in%20to%20view%20your%20interview%20history");
        return;
      }

      setUserEmail(user.email || "");

      // Fetch user's interviews from Supabase
      const { data, error } = await supabase
        .from("interviews")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setInterviews(data);
      } else {
        // Sample fallback list for demonstrating UI
        setInterviews([
          {
            id: "sample-1",
            user_id: user.id,
            role: "Fullstack Developer",
            experience_level: "Senior (5+ yrs)",
            interview_type: "Technical Round",
            actual_duration_seconds: 845,
            created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
            status: "completed",
          },
          {
            id: "sample-2",
            user_id: user.id,
            role: "Backend Engineer",
            experience_level: "Mid-Level (2-5 yrs)",
            interview_type: "HR Round",
            actual_duration_seconds: 620,
            created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
            status: "completed",
          },
        ]);
      }

      setLoading(false);
    }

    loadHistory();
  }, [router]);

  const filteredInterviews = interviews.filter((item) => {
    if (filter === "completed") return item.status === "completed";
    if (filter === "scheduled") return item.status === "scheduled" || item.status === "in_progress";
    return true;
  });

  const formatDuration = (secs?: number) => {
    if (!secs) return "10 mins";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return "Today";
    const d = new Date(isoStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white px-4">
        <div className="relative size-16 flex items-center justify-center mb-4">
          <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-zinc-400 text-sm font-medium">Loading your interview history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-zinc-800 py-10 md:py-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800/80 border border-zinc-700/60 rounded-full text-xs font-semibold text-zinc-300 tracking-wider uppercase mb-2">
              <History className="w-3.5 h-3.5 text-primary" />
              Candidate Dashboard
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Interview History & Reports
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Showing practice sessions for <strong className="text-white">{userEmail}</strong>
            </p>
          </div>

          <Link
            href="/ai-mock-interview"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-gradient hover:opacity-95 text-xs font-semibold text-primary-foreground rounded-2xl shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Start New Mock Interview
          </Link>
        </div>

        {/* Filter Tabs & Stats Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 md:p-4">
          <div className="flex items-center gap-1.5 w-full sm:w-auto bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            {(["all", "completed", "scheduled"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-colors capitalize ${
                  filter === tab
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="text-xs text-zinc-400 font-medium">
            Total Sessions: <strong className="text-white font-bold">{interviews.length}</strong>
          </div>
        </div>

        {/* Interviews List */}
        <div className="space-y-4">
          {filteredInterviews.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
              <div className="size-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 mb-4 border border-zinc-700">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">No Interviews Found</h3>
              <p className="text-xs text-zinc-400 max-w-sm mb-6">
                You haven&apos;t taken any mock interviews under this filter yet. Practice your skills now!
              </p>
              <Link
                href="/ai-mock-interview"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-xl transition-colors"
              >
                Start Practice Session
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            filteredInterviews.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all shadow-xl hover:shadow-2xl"
              >
                {/* Left Info */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">{item.role}</h3>
                    <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-medium">
                      <Layers className="w-3 h-3 text-primary" />
                      {item.interview_type}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        item.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {item.status || "completed"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                      {item.experience_level}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      {formatDate(item.created_at)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      Call time: {formatDuration(item.actual_duration_seconds)}
                    </span>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  {item.status === "completed" ? (
                    <Link
                      href={`/reports/${item.id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      View Scorecard
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <Link
                      href={`/ai-mock-interview/room/${item.id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gradient hover:opacity-95 text-xs font-semibold text-primary-foreground shadow-md transition-all"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Enter Room
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
