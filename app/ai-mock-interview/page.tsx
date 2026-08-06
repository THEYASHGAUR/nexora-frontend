"use client";

import { useState, useEffect, useRef } from "react";
import {
  FileText,
  User,
  Sparkles,
  Mic,
  X,
  Upload,
  Clock,
  Briefcase,
  Check,
  ChevronDown,
} from "lucide-react";

export default function AIInterview() {
  const [screen, setScreen] = useState(1);
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [timer, setTimer] = useState(0);
//   const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");

  // Custom Dropdown States
  const [duration, setDuration] = useState("15 min");
  const [isDurationOpen, setIsDurationOpen] = useState(false);

  const [interviewType, setInterviewType] = useState("Technical Round");
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  const durationOptions = ["10 min", "15 min", "30 min"];
  const interviewTypeOptions = [
    "Technical Round",
    "Behavioural Round",
    "Coding Round",
    "HR Round",
  ];

  // Refs to detect outside clicks
  const durationRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        durationRef.current &&
        !durationRef.current.contains(event.target as Node)
      ) {
        setIsDurationOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setIsTypeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Timer effect
  useEffect(() => {
    if (screen === 3) {
      const interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [screen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setResume(e.target?.result as string);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type.includes("text") || file.type === "application/pdf")
    ) {
      handleFileRead(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileRead(file);
  };

  const handleStartInterview = () => {
    if (jobDescription && resume) {
      setScreen(2);
      setTimeout(() => {
        setCurrentQuestion("Tell me about yourself and your experience...");
        setScreen(3);
      }, 3000);
    }
  };

  const handleEndSession = () => {
    setScreen(1);
    setTimer(0);
    setCurrentQuestion("");
    setJobDescription("");
    setResume("");
    setFileName("");
    setDuration("15 min");
    setInterviewType("Technical Round");
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-white selection:bg-zinc-700 py-12 md:py-24 px-4">
      <div className="w-full max-w-5xl mx-auto">
        {screen === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12 space-y-4 text-center md:text-left">
              <div className="inline-block px-3 py-1 bg-zinc-700/50 border border-zinc-800 rounded-full text-xs font-semibold text-zinc-300 tracking-wider uppercase">
                AI Interviewer
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                AI Mock Interview
              </h1>
              <p className="text-zinc-500 max-w-xl text-lg md:text-xl">
                Practice your interview skills. Paste your JD and resume to get personalized questions.
              </p>
            </header>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-lg shadow-black/40 overflow-hidden">
              {/* Dropdowns */}
              <div className="p-8 border-b border-zinc-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Duration Dropdown */}
                  <div ref={durationRef} className="relative">
                    <label className="flex items-center gap-2 text-sm font-bold text-white mb-3 uppercase tracking-wider">
                      <Clock className="w-4 h-4 text-zinc-400" />
                      Duration
                    </label>
                    <button
                      onClick={() => setIsDurationOpen(!isDurationOpen)}
                      className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between hover:bg-zinc-200 transition-all text-sm font-semibold text-zinc-300"
                    >
                      <span>{duration}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-zinc-400 transition-transform ${isDurationOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isDurationOpen && (
                      <div className="absolute z-20 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                        {durationOptions.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setDuration(opt);
                              setIsDurationOpen(false);
                            }}
                            className="w-full px-5 py-3 text-left flex items-center justify-between hover:bg-zinc-950 transition-colors text-sm font-medium text-zinc-300"
                          >
                            <span>{opt}</span>
                            {duration === opt && <Check className="w-4 h-4 text-white" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Interview Type Dropdown */}
                  <div ref={typeRef} className="relative">
                    <label className="flex items-center gap-2 text-sm font-bold text-white mb-3 uppercase tracking-wider">
                      <Briefcase className="w-4 h-4 text-zinc-400" />
                      Interview Type
                    </label>
                    <button
                      onClick={() => setIsTypeOpen(!isTypeOpen)}
                      className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between hover:bg-zinc-200 transition-all text-sm font-semibold text-zinc-300"
                    >
                      <span>{interviewType}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-zinc-400 transition-transform ${isTypeOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isTypeOpen && (
                      <div className="absolute z-20 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                        {interviewTypeOptions.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setInterviewType(opt);
                              setIsTypeOpen(false);
                            }}
                            className="w-full px-5 py-3 text-left flex items-center justify-between hover:bg-zinc-950 transition-colors text-sm font-medium text-zinc-300"
                          >
                            <span>{opt}</span>
                            {interviewType === opt && <Check className="w-4 h-4 text-white" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* JD and Resume */}
              <div className="grid md:grid-cols-2 gap-8 p-8">
                {/* Job Description */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Job Description</h2>
                  </div>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    className="w-full h-[220px] p-5 bg-zinc-950 border border-zinc-800 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-zinc-900 transition-all text-sm"
                  />
                </div>

                {/* Resume */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Your Resume</h2>
                  </div>

                  {!resume ? (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`relative h-[220px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                        isDragging
                          ? "border-zinc-900 bg-zinc-950 scale-[1.02]"
                          : "border-zinc-800 bg-zinc-950 hover:border-zinc-300 hover:bg-zinc-200/50"
                      }`}
                    >
                      <input
                        type="file"
                        accept=".txt,.pdf"
                        onChange={handleFileInput}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="w-12 h-12 mb-4 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 shadow-sm text-zinc-400">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-white mb-1">Upload Resume</p>
                      <p className="text-xs text-zinc-500">Supports TXT, PDF</p>
                    </div>
                  ) : (
                    <div className="h-[220px] bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-center">
                      <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-sm">
                        <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate">{fileName || "Resume uploaded"}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">Ready for analysis</p>
                        </div>
                        <button
                          onClick={() => {
                            setResume("");
                            setFileName("");
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-400 hover:bg-zinc-200 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Start Button */}
              <div className="p-8 pt-0 flex justify-end">
                <button
                  onClick={handleStartInterview}
                  disabled={!jobDescription || !resume}
                  className="w-full md:w-auto px-10 py-4 bg-white hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 font-semibold rounded-2xl shadow-xl shadow-zinc-900/10 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <Sparkles className="w-5 h-5" />
                  Start AI Interview
                </button>
              </div>
            </div>
          </div>
        )}

        {screen === 2 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
            <div className="relative w-32 h-32 flex items-center justify-center mb-8">
              <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-zinc-900 rounded-full border-t-transparent animate-spin"></div>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-3">Preparing Interview</h2>
            <p className="text-zinc-500 font-medium">Analyzing job requirements and your background...</p>
          </div>
        )}

        {screen === 3 && (
          <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-xl shadow-black/40 p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-zinc-800">
                <div className="h-full bg-zinc-900 w-1/3 animate-pulse rounded-full"></div>
              </div>

              <div className="inline-block px-4 py-1.5 bg-zinc-800 rounded-full font-mono text-zinc-400 font-bold tracking-widest text-sm mb-10">
                {formatTime(timer)}
              </div>
              
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 md:p-12 mb-12 min-h-[200px] flex items-center justify-center">
                <p className="text-2xl md:text-3xl font-medium text-white leading-relaxed max-w-2xl mx-auto">
                  &ldquo;{currentQuestion}&rdquo;
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="w-20 h-20 bg-white hover:bg-zinc-200 rounded-full flex items-center justify-center shadow-xl shadow-zinc-900/20 text-zinc-950 transition-transform active:scale-95 group">
                  <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />
                </button>
                <div className="w-px h-12 bg-zinc-700 hidden sm:block mx-4"></div>
                <button
                  onClick={handleEndSession}
                  className="px-8 py-4 bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold rounded-full hover:bg-zinc-950 hover:text-white transition-colors"
                >
                  End Session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
