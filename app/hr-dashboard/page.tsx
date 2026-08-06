"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle2, ChevronRight, BarChart3, Users, Clock, Sparkles } from "lucide-react";

export default function HRDashboard() {
  const [jdText, setJdText] = useState("");
  const [resumeCount, setResumeCount] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResumeCount(e.target.files.length);
    }
  };

  const handleScan = () => {
    if (resumeCount === 0 || !jdText) return;
    setIsScanning(true);
    
    // Mock scanning progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 5) + 2;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsScanning(false);
          setShowResults(true);
        }, 500);
      }
      setScanProgress(progress);
    }, 150);
  };

  const mockResults = [
    { id: 1, name: "Alex Chen", score: 96, role: "Senior Full Stack", skills: ["React", "Node.js", "System Design"], match: "Exceptional" },
    { id: 2, name: "Sarah Jenkins", score: 92, role: "Frontend Lead", skills: ["Next.js", "TypeScript", "Tailwind"], match: "Strong" },
    { id: 3, name: "Michael Chang", score: 88, role: "Software Engineer", skills: ["Python", "AWS", "React"], match: "Strong" },
    { id: 4, name: "Emma Wilson", score: 84, role: "UI Engineer", skills: ["Vue", "Figma", "CSS"], match: "Good" },
    { id: 5, name: "James Miller", score: 79, role: "Backend Developer", skills: ["Java", "Spring", "SQL"], match: "Moderate" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        
        {/* Header */}
        <header className="mb-12 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs font-semibold text-cyan-400 tracking-wider uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Enterprise Edition
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            HR Bulk Scanner
          </h1>
          <p className="text-zinc-400 max-w-2xl text-lg mx-auto md:mx-0">
            Upload up to 2000 resumes at once. Our AI will instantly scan, extract skills, and rank candidates against your Job Description.
          </p>
        </header>

        {!showResults ? (
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
            {/* Left Col: Upload & JD */}
            <div className="space-y-6">
              
              {/* Job Description Card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  Job Description
                </h2>
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the complete job description here to rank candidates against..."
                  className="w-full h-[200px] p-5 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>

              {/* Upload Card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500" />
                    Bulk Resumes
                  </h2>
                  <span className="text-xs font-bold px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700 uppercase tracking-wider">
                    Max 2000 Files
                  </span>
                </div>
                
                <div className="relative border-2 border-dashed border-zinc-700 hover:border-cyan-500/50 hover:bg-cyan-500/5 rounded-2xl p-10 text-center transition-all cursor-pointer group">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 rounded-full flex items-center justify-center text-zinc-500 transition-colors">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Upload Candidate Resumes</h3>
                  <p className="text-sm text-zinc-500 mb-4">Drag and drop folders or files here (PDF, DOCX)</p>
                  
                  {resumeCount > 0 && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full text-sm font-bold">
                      <FileText className="w-4 h-4" />
                      {resumeCount} Files Selected
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Col: Action & Scan State */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-center items-center text-center min-h-[400px] relative overflow-hidden">
              
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

              {!isScanning ? (
                <div className="relative z-10 w-full max-w-sm">
                  <div className="w-20 h-20 mx-auto bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/50">
                    <Users className="w-10 h-10 text-zinc-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Ready to Analyze</h3>
                  <p className="text-zinc-400 mb-8 text-sm">
                    Upload your JD and candidate pool to initiate the AI ranking sequence.
                  </p>
                  <button
                    onClick={handleScan}
                    disabled={resumeCount === 0 || !jdText}
                    className="w-full py-4 bg-white hover:bg-zinc-200 text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-500 font-bold rounded-2xl transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2 disabled:cursor-not-allowed text-lg"
                  >
                    <Sparkles className="w-5 h-5" />
                    Start AI Scan
                  </button>
                </div>
              ) : (
                <div className="relative z-10 w-full max-w-sm">
                  <div className="relative w-32 h-32 mx-auto mb-8">
                    <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
                    <div 
                      className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"
                      style={{ animationDuration: '1.5s' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-3xl font-extrabold text-white">{scanProgress}%</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 animate-pulse">Scanning {resumeCount} Resumes</h3>
                  <p className="text-sm text-zinc-400">Extracting skills, experience, and matching against requirements...</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Results View */
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Scan Complete</h2>
                <p className="text-zinc-400 text-lg">Successfully ranked <span className="text-cyan-400 font-bold">{resumeCount || 5} candidates</span> based on your JD.</p>
              </div>
              <button 
                onClick={() => { setShowResults(false); setScanProgress(0); }}
                className="px-6 py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white rounded-xl text-sm font-bold transition-all"
              >
                New Scan
              </button>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Candidates", val: resumeCount || 5, icon: Users, color: "text-blue-400" },
                { label: "Top Matches (>90%)", val: "2", icon: CheckCircle2, color: "text-emerald-400" },
                { label: "Avg Score", val: "87", icon: BarChart3, color: "text-cyan-400" },
                { label: "Time Saved", val: "4 hrs", icon: Clock, color: "text-purple-400" }
              ].map((stat, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{stat.label}</span>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="text-4xl font-extrabold text-white">{stat.val}</div>
                </div>
              ))}
            </div>

            {/* Ranked List */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-xl overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-12 gap-4 p-5 border-b border-zinc-800 bg-zinc-950/50 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  <div className="col-span-1 text-center">Rank</div>
                  <div className="col-span-4">Candidate</div>
                  <div className="col-span-2 text-center">Match Score</div>
                  <div className="col-span-4">Top Matched Skills</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                <div className="divide-y divide-zinc-800">
                  {mockResults.map((cand, idx) => (
                    <div key={cand.id} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-zinc-800/50 transition-colors group cursor-pointer">
                      
                      <div className="col-span-1 flex justify-center">
                        <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${idx === 0 ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50' : idx === 1 ? 'bg-zinc-300/20 text-zinc-300 ring-1 ring-zinc-300/50' : idx === 2 ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/50' : 'bg-zinc-800 text-zinc-500'}`}>
                          #{idx + 1}
                        </span>
                      </div>
                      
                      <div className="col-span-4">
                        <div className="font-bold text-white text-base mb-1">{cand.name}</div>
                        <div className="text-xs text-zinc-400 font-medium">{cand.role}</div>
                      </div>
                      
                      <div className="col-span-2 flex flex-col items-center justify-center">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-3xl font-extrabold ${cand.score > 90 ? 'text-emerald-400' : cand.score > 80 ? 'text-cyan-400' : 'text-zinc-300'}`}>
                            {cand.score}
                          </span>
                          <span className="text-xs text-zinc-500 mb-1 font-bold">/ 100</span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1">{cand.match}</span>
                      </div>

                      <div className="col-span-4 flex flex-wrap gap-2 items-center">
                        {cand.skills.map(s => (
                          <span key={s} className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 shadow-sm">
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="col-span-1 flex justify-center">
                        <button className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-sm">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
