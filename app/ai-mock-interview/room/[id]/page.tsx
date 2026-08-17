"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Mic,
  MicOff,
  PhoneOff,
  Clock,
  ShieldAlert,
  Sparkles,
  Bot,
  User as UserIcon,
  ChevronLeft,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Room, RoomEvent, Track } from "livekit-client";

interface InterviewData {
  id: string;
  user_id: string;
  role: string;
  experience_level: string;
  interview_type: string;
  duration_minutes: number;
  duration_display?: string;
  job_description?: string;
  resume_text?: string;
  status?: string;
}

interface TranscriptItem {
  id: string;
  speaker: "interviewer" | "candidate";
  text: string;
  timestamp: string;
}

export default function VoiceInterviewRoom({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const roomId = params.id;
  const router = useRouter();

  // Room & Auth states
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState("Connecting to Voice Room...");
  const [unauthorized, setUnauthorized] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // LiveKit connection state
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);

  // Audio Controls & State
  const [speakerState, setSpeakerState] = useState<
    "connecting" | "ai_speaking" | "candidate_speaking" | "listening" | "ended"
  >("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  // Elapsed Call Timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Transcript Feed
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);

  // Pending (in-progress) transcript items per speaker — avoids creating new bubble per partial word
  const pendingTranscriptRef = useRef<Map<string, string>>(new Map());
  const pendingIdRef = useRef<Map<string, string>>(new Map());

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const livekitRoomRef = useRef<Room | null>(null);

  // Helper for approx duration label
  const getTargetDurationLabel = (type?: string) => {
    if (type === "HR Round" || type === "Behavioural Round") return "~10–15 min";
    if (type === "Coding Round") return "~30–45 min";
    return "~20–25 min";
  };

  // 1. Authenticate candidate & verify ownership of interview room
  useEffect(() => {
    async function verifyAndLoadRoom() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(
          `/login?error=${encodeURIComponent(
            "Please sign in to access your interview room"
          )}`
        );
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8009";
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const authToken = authSession?.access_token;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      };

      // Step 1: Load session from V1 backend
      setLoadingMsg("Loading your interview session...");
      try {
        const sessionRes = await fetch(`${backendUrl}/interviews/${roomId}`, { headers });

        if (sessionRes.status === 404) {
          setUnauthorized(true);
          setLoading(false);
          return;
        }

        if (!sessionRes.ok) {
          setSessionError("Failed to load interview session from backend.");
          setLoading(false);
          return;
        }

        const sessionData = await sessionRes.json();

        // Verify ownership via user_id from backend
        if (sessionData.user_id && sessionData.user_id !== user.id) {
          setUnauthorized(true);
          setLoading(false);
          return;
        }

        const interviewData: InterviewData = {
          id: roomId,
          user_id: user.id,
          role: sessionData.role || "",
          experience_level: sessionData.experience_level || "",
          interview_type: sessionData.interview_type || "",
          duration_minutes: sessionData.duration_minutes || 30,
          status: sessionData.status,
        };
        setInterview(interviewData);

        // Step 2: Get LiveKit token from V1 backend
        setLoadingMsg("Starting AI voice session...");
        const startRes = await fetch(`${backendUrl}/interviews/${roomId}/start`, {
          method: "POST",
          headers,
        });

        if (startRes.ok) {
          const startData = await startRes.json();
          if (startData.token && !startData._dev_mode) {
            setLivekitToken(startData.token);
            setLivekitUrl(startData.livekit_url);
          }
          else setSessionError("The voice service is not configured. Please try again after the backend LiveKit credentials are set.");
        } else {
          setSessionError("Unable to start the voice room. Please try again.");
        }

      } catch (err) {
        console.warn("Backend session load error:", err);
        // Fallback: allow room entry with minimal data (demo/offline mode)
        setInterview({
          id: roomId,
          user_id: user.id,
          role: "Interview",
          experience_level: "",
          interview_type: "Technical Round",
          duration_minutes: 30,
        });
      }

      setLoading(false);

      // The room is driven by LiveKit events. This remains disabled for local UI work.
      if (livekitToken === "__demo_mode__") setTimeout(() => {
        setSpeakerState("ai_speaking");
        setTranscript([
          {
            id: crypto.randomUUID(),
            speaker: "interviewer",
            text: "Hello! Welcome to your Nexora AI interview. I've analyzed your background and the role requirements. Let's get started — could you begin by briefly introducing yourself?",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setTimeout(() => setSpeakerState("listening"), 5000);
      }, 1500);
    }

    verifyAndLoadRoom();
  }, [roomId, router]);

  useEffect(() => {
    if (!livekitToken || !livekitUrl) return;
    const room = new Room();
    livekitRoomRef.current = room;
    const audioElements: HTMLMediaElement[] = [];
    room.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === Track.Kind.Audio) {
        const element = track.attach() as HTMLMediaElement;
        element.autoplay = true;
        document.body.appendChild(element);
        element.play().catch((err) => console.warn("Audio autoplay blocked by browser, retrying:", err));
        audioElements.push(element);
      }
    });
    room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      const aiSpeaking = speakers.some((s) => s.identity !== room.localParticipant.identity);
      const userSpeaking = speakers.some((s) => s.identity === room.localParticipant.identity);
      if (aiSpeaking) {
        setSpeakerState("ai_speaking");
      } else if (userSpeaking) {
        setSpeakerState("candidate_speaking");
      } else {
        setSpeakerState("listening");
      }
    });
    room.on(RoomEvent.TranscriptionReceived, ((segments: Array<{ text?: string; final?: boolean; id?: string }>, participant?: { identity?: string }) => {
      if (!segments.length) return;
      const isLocal = participant?.identity === room.localParticipant.identity;
      const speakerKey = participant?.identity ?? "unknown";
      const speakerRole: TranscriptItem["speaker"] = isLocal ? "candidate" : "interviewer";
      const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      segments.forEach((segment) => {
        if (!segment.text?.trim()) return;
        const segText = segment.text.trim();
        const isFinal = segment.final === true;

        if (!isFinal) {
          // ── Partial segment: update in-place or create a pending bubble ──
          const existingPendingId = pendingIdRef.current.get(speakerKey);
          if (existingPendingId) {
            // Update the existing pending bubble text
            setTranscript((prev) =>
              prev.map((item) =>
                item.id === existingPendingId ? { ...item, text: segText } : item
              )
            );
          } else {
            // First partial — create a new pending bubble
            const newId = crypto.randomUUID();
            pendingIdRef.current.set(speakerKey, newId);
            pendingTranscriptRef.current.set(speakerKey, segText);
            setTranscript((prev) => [
              ...prev,
              { id: newId, speaker: speakerRole, text: segText, timestamp },
            ]);
          }
        } else {
          // ── Final segment: finalize the pending bubble (or create if none) ──
          const existingPendingId = pendingIdRef.current.get(speakerKey);
          if (existingPendingId) {
            // Commit final text into the existing bubble
            setTranscript((prev) =>
              prev.map((item) =>
                item.id === existingPendingId ? { ...item, text: segText } : item
              )
            );
            pendingIdRef.current.delete(speakerKey);
            pendingTranscriptRef.current.delete(speakerKey);
          } else {
            // No pending bubble — create a completed one directly
            setTranscript((prev) => [
              ...prev,
              { id: crypto.randomUUID(), speaker: speakerRole, text: segText, timestamp },
            ]);
          }
        }
      });
    }) as never);
    void (async () => {
      try {
        await room.connect(livekitUrl, livekitToken);
        await room.startAudio();
        await room.localParticipant.setMicrophoneEnabled(true);
        setSpeakerState("listening");
      } catch (error) {
        console.error("LiveKit connection failed:", error);
        setSessionError("Could not connect to the voice room. Check microphone permission and try again.");
      }
    })();
    return () => {
      audioElements.forEach((element) => element.remove());
      room.disconnect();
      livekitRoomRef.current = null;
    };
  }, [livekitToken, livekitUrl]);

  // 2. Elapsed call timer (counts up)
  useEffect(() => {
    if (loading || unauthorized || speakerState === "ended") return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, unauthorized, speakerState]);

  // Auto-scroll transcript feed
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    void livekitRoomRef.current?.localParticipant.setMicrophoneEnabled(!nextMuted);
    if (nextMuted && speakerState === "candidate_speaking") {
      setSpeakerState("listening");
    }
  };

  // End Interview — call V1 backend to end session and trigger report generation
  const handleEndInterview = async () => {
    setSpeakerState("ended");
    setShowEndModal(false);
    livekitRoomRef.current?.disconnect();

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8009";
    const supabase = createClient();
    const { data: { session: authSession } } = await supabase.auth.getSession();
    const authToken = authSession?.access_token;

    try {
      // V1: End session + trigger background report generation
      await fetch(`${backendUrl}/interviews/${roomId}/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      });
    } catch (err) {
      console.warn("Could not call end interview endpoint:", err);
    }

    // Redirect to report page — it will poll until report is ready
    router.push(`/reports/${roomId}`);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white px-4">
        <div className="relative w-20 h-20 flex items-center justify-center mb-6">
          <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold">{loadingMsg}</h2>
        <p className="text-zinc-500 text-sm mt-1">Setting up your personalized AI interview session</p>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Session Error</h2>
          <p className="text-zinc-400 text-sm mb-6">{sessionError}</p>
          <Link href="/ai-mock-interview" className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold rounded-xl transition-colors inline-flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Back to Setup
          </Link>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-14 h-14 bg-destructive/10 text-destructive border border-destructive/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            This interview room is private and can only be accessed by the candidate who created it.
          </p>
          <Link
            href="/ai-mock-interview"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Return to Setup
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-zinc-800">
      {/* Standalone Immersive Room Header */}
      <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-4 md:px-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/ai-mock-interview"
            className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-900"
            title="Exit to Setup"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{interview?.role}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-medium">
                {interview?.interview_type}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">{interview?.experience_level}</p>
          </div>
        </div>

        {/* Dynamic Duration Badge & Elapsed Call Time */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>Target: <strong className="text-zinc-200 font-medium">{getTargetDurationLabel(interview?.interview_type)}</strong></span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 text-xs font-mono font-bold text-emerald-400">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>
      </header>

      {/* Main Room Content Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 grid md:grid-cols-12 gap-6 items-center">
        {/* Left Side: AI Interviewer Audio Visualizer */}
        <div className="md:col-span-7 flex flex-col items-center justify-center space-y-8 py-6">
          {/* AI Avatar Orb with Animated Aura */}
          <div className="relative flex items-center justify-center">
            {/* Pulsing Aura Rings when AI is speaking */}
            {speakerState === "ai_speaking" && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute size-56 rounded-full bg-primary/20 blur-2xl pointer-events-none"
                />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="absolute size-72 rounded-full bg-brand-purple/20 blur-3xl pointer-events-none"
                />
              </>
            )}

            <div className="relative z-10 size-40 md:size-48 rounded-full border-2 border-zinc-800 bg-zinc-900 shadow-2xl flex flex-col items-center justify-center p-6 text-center glow-ring">
              <div className="size-16 rounded-full bg-brand-gradient flex items-center justify-center mb-3 shadow-lg">
                <Bot className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">AI Interviewer</h3>
              <span className="text-[11px] text-zinc-500 font-medium">Nexora Adaptive Engine</span>
            </div>
          </div>

          {/* Equalizer Audio Wave Visualizer */}
          <div className="flex items-center gap-1.5 h-12">
            {[0.4, 0.7, 1.0, 0.6, 0.8, 0.3].map((heightFactor, idx) => {
              const isAiSpeaking = speakerState === "ai_speaking";
              const isCandidateSpeaking = speakerState === "candidate_speaking" && !isMuted;
              const isMoving = isAiSpeaking || isCandidateSpeaking;

              return (
                <motion.div
                  key={idx}
                  animate={
                    isAiSpeaking
                      ? { height: ["12px", `${heightFactor * 44}px`, "12px"] }
                      : isCandidateSpeaking
                      ? { height: ["8px", `${heightFactor * 32}px`, "8px"] }
                      : { height: "6px" }
                  }
                  transition={
                    isMoving
                      ? {
                          repeat: Infinity,
                          duration: 0.6 + idx * 0.1,
                          ease: "easeInOut",
                        }
                      : { duration: 0.2 }
                  }
                  className={`w-1.5 rounded-full transition-colors ${
                    isAiSpeaking
                      ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                      : isCandidateSpeaking
                      ? "bg-zinc-400 shadow-[0_0_8px_rgba(161,161,170,0.4)]"
                      : "bg-zinc-800"
                  }`}
                />
              );
            })}
          </div>

          {/* Speaker State Indicator Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/90 text-xs font-semibold text-zinc-300">
            <span
              className={`size-2.5 rounded-full ${
                speakerState === "ai_speaking"
                  ? "bg-emerald-500 animate-ping"
                  : speakerState === "candidate_speaking" && !isMuted
                  ? "bg-zinc-400 animate-pulse"
                  : "bg-zinc-600"
              }`}
            />
            <span>
              {speakerState === "connecting" && "Initializing AI Connection..."}
              {speakerState === "ai_speaking" && "AI Interviewer Speaking..."}
              {speakerState === "candidate_speaking" && (isMuted ? "Microphone Muted" : "Candidate Speaking...")}
              {speakerState === "listening" && (isMuted ? "Microphone Muted" : "Listening for your response...")}
              {speakerState === "ended" && "Interview Completed"}
            </span>
          </div>
        </div>

        {/* Right Side: Live Transcript Stream Drawer */}
        <div className="md:col-span-5 h-[380px] md:h-[480px] bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5 flex flex-col overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Live Transcript
            </h4>
            <span className="text-[10px] text-zinc-500 font-mono">{transcript.length} turns</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            {transcript.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-xs">
                <Bot className="w-8 h-8 mb-2 opacity-40" />
                <span>Transcript will stream here live...</span>
              </div>
            ) : (
              transcript.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col gap-1.5 text-xs ${
                    item.speaker === "interviewer" ? "items-start" : "items-end"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
                    {item.speaker === "interviewer" ? (
                      <>
                        <Bot className="w-3 h-3 text-primary" />
                        <span>AI Interviewer</span>
                      </>
                    ) : (
                      <>
                        <span>You</span>
                        <UserIcon className="w-3 h-3 text-emerald-400" />
                      </>
                    )}
                    <span>• {item.timestamp}</span>
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed ${
                      item.speaker === "interviewer"
                        ? "bg-zinc-950 border border-zinc-800 text-zinc-200"
                        : "bg-primary/20 border border-primary/30 text-white"
                    }`}
                  >
                    {item.text}
                  </div>
                </div>
              ))
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      </main>

      {/* Standalone Room Control Toolbar */}
      <footer className="h-24 border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-6 flex items-center justify-center z-20">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Mute Toggle */}
          <button
            type="button"
            onClick={handleToggleMute}
            className={`size-14 rounded-2xl border flex items-center justify-center transition-all ${
              isMuted
                ? "bg-destructive/20 border-destructive/40 text-destructive hover:bg-destructive/30"
                : "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"
            }`}
            title={isMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* End Session Button */}
          <button
            type="button"
            onClick={() => setShowEndModal(true)}
            className="h-14 px-6 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-semibold text-sm flex items-center gap-2.5 shadow-lg shadow-destructive/20 transition-transform active:scale-95"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Interview</span>
          </button>
        </div>
      </footer>

      {/* End Session Confirmation Modal */}
      <AnimatePresence>
        {showEndModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">End Interview Session?</h3>
              <p className="text-zinc-400 text-xs md:text-sm leading-relaxed mb-6">
                Are you sure you want to finish your interview now? Your actual elapsed duration ({formatTimer(elapsedSeconds)}) and response transcript will be submitted for evaluation.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEndModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs font-semibold transition-colors"
                >
                  Continue Interview
                </button>
                <button
                  type="button"
                  onClick={handleEndInterview}
                  className="px-5 py-2.5 rounded-xl bg-destructive hover:bg-destructive/90 text-white text-xs font-semibold transition-colors"
                >
                  End & Evaluate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
