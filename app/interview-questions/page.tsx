"use client";

import { useState } from "react";

export default function InterviewInsights() {
  const [jdText, setJdText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [output, setOutput] = useState(""); // RESPONSE FROM BACKEND

  // For info cards
  const insights = [
    {
      icon: "📘",
      title: "Real Experiences",
      desc: "Learn from actual candidates",
    },
    {
      icon: "❓",
      title: "Common Questions",
      desc: "Frequently asked interview questions",
    },
    {
      icon: "💡",
      title: "Insider Tips",
      desc: "Strategies and hidden info",
    },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!jdText.trim()) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("jd_text", jdText);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8009";
      const response = await fetch(`${backendUrl}/interview-questions`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log(data);

      if (data.success) {
        setOutput(data.insights);
      } else {
        setOutput("Something went wrong!");
      }
    } catch (err) {
      console.error(err);
      setOutput("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-white selection:bg-zinc-700 py-12 md:py-24 px-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <header className="text-center mb-16 space-y-4">
            <div className="inline-block px-3 py-1 bg-zinc-700/50 border border-zinc-800 rounded-full text-xs font-semibold text-zinc-300 tracking-wider uppercase">
              Community & AI
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
              Interview Insights
            </h1>
            <p className="text-lg text-zinc-500 max-w-2xl mx-auto font-medium">
              Get past interview experiences, common questions, and insider tips. Just paste the job description below.
            </p>
          </header>

          {/* Form Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-lg shadow-black/40 p-8 md:p-10 mb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-lg font-bold text-white mb-4 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-zinc-900" />
                   Job Description
                </label>
                <div className={`relative transition-all duration-300 rounded-2xl ${isFocused ? "ring-4 ring-white/10 border-zinc-900" : "border-zinc-800"}`}>
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Paste the complete job description here..."
                    className="w-full h-64 p-6 border-2 border-transparent bg-zinc-950 rounded-2xl text-white placeholder-zinc-400 text-sm md:text-base leading-relaxed resize-none outline-none transition-colors focus:bg-zinc-900"
                  />
                  {jdText.length > 0 && (
                    <div className="absolute bottom-4 right-4 text-xs font-medium text-zinc-500 bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-800">
                      {jdText.length} characters
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !jdText.trim()}
                className="w-full bg-white text-zinc-950 font-semibold py-5 px-8 rounded-2xl shadow-xl shadow-zinc-900/10 transition-all hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] flex items-center justify-center gap-3 text-lg"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>Find Interview Insights →</>
                )}
              </button>
            </form>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-zinc-800">
              {insights.map((item, index) => (
                <div
                  key={index}
                  className="group p-6 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-300 transition-colors"
                >
                  <div className="text-3xl mb-4 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all">{item.icon}</div>
                  <h3 className="font-bold text-white text-base mb-1">{item.title}</h3>
                  <p className="text-sm font-medium text-zinc-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* OUTPUT SECTION */}
          {output && (
            <div className="mt-8 p-8 md:p-10 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h2 className="font-extrabold text-2xl mb-6 text-white flex items-center gap-3 relative z-10">
                <span className="w-2 h-8 bg-zinc-9500 rounded-full"></span>
                Generated Insights
              </h2>
              <pre className="whitespace-pre-wrap text-base font-medium text-zinc-300 leading-relaxed font-sans relative z-10">{output}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
