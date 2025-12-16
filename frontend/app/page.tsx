"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { Upload, Flame, Hammer, BarChart3, Loader2, Printer, AlertTriangle, CheckCircle, FileText } from "lucide-react";

// --- 1. TYPESCRIPT INTERFACES (Fix for 'any' error) ---
interface AnalyzerResult {
  ats_score: number;
  missing_skills: string[];
  summary: string;
  improvement_tips: string[];
}

interface RoastResult {
  roast_title: string;
  burns: string[];
  overall_verdict: string;
}

interface BuilderResult {
  personal_info: { name: string; email: string; phone: string; linkedin: string; summary: string };
  skills: string[];
  experience: Array<{ role: string; company: string; duration: string; points: string[] }>;
  education: Array<{ degree: string; university: string; year: string }>;
  projects?: Array<{ name: string; tech_stack: string; description: string }>;
}

// Union Type (Result teeno mein se koi bhi ho sakta hai)
type ResultData = AnalyzerResult | RoastResult | BuilderResult | null;

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState("");
  const [mode, setMode] = useState<"analyze" | "roast" | "builder">("analyze");
  const [loading, setLoading] = useState(false);

  // Use specific type instead of 'any'
  const [result, setResult] = useState<ResultData>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const handleProcess = async () => {
    if (!file) return alert("Please upload a resume first!");
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDesc);
    formData.append("mode", mode);

    try {
      const res = await axios.post("http://127.0.0.1:8000/process", formData);
      setResult(res.data.data);
    } catch (e) {
      console.error(e);
      alert("Error processing resume. Check backend console.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to check types (Type Guards)
  const isAnalyzer = (data: any): data is AnalyzerResult => mode === "analyze";
  const isRoast = (data: any): data is RoastResult => mode === "roast";
  const isBuilder = (data: any): data is BuilderResult => mode === "builder";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 print:bg-white">

      {/* --- HEADER & INPUTS (Print mein hide honge) --- */}
      <div className="max-w-6xl mx-auto p-6 print:hidden">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Resume AI Supertool 🚀
          </h1>
          <p className="text-slate-500 text-lg">Analyze, Roast, or Rewrite your resume instantly.</p>
        </header>

        {/* TABS SWITCHER */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {[
            { id: "analyze", label: "Analyzer", icon: BarChart3, color: "bg-blue-600" },
            { id: "roast", label: "Roast Me", icon: Flame, color: "bg-red-600" },
            { id: "builder", label: "ATS Builder", icon: Hammer, color: "bg-green-600" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-sm hover:scale-105
                ${mode === tab.id ? `${tab.color} text-white shadow-lg ring-2 ring-offset-2 ring-slate-300` : "bg-white text-slate-600 border border-slate-200"}`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        {/* INPUT BOX (Optimized Layout) */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 grid md:grid-cols-2 gap-8 items-stretch">

          {/* File Upload */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition group h-full">
            <div className="bg-slate-100 p-4 rounded-full mb-4 group-hover:bg-blue-100 transition">
              <Upload className="text-slate-400 group-hover:text-blue-500 w-8 h-8" />
            </div>
            <input type="file" className="hidden" id="file-upload" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <label htmlFor="file-upload" className="text-center cursor-pointer">
              <span className="text-slate-700 font-medium block text-lg">{file ? file.name : "Click to Upload Resume"}</span>
              <span className="text-slate-400 text-sm mt-1">PDF Format Only</span>
            </label>
          </div>

          {/* Job Description & Action */}
          <div className="flex flex-col gap-4 h-full">
            <textarea
              className="flex-grow p-4 border border-slate-300 rounded-xl text-sm focus:ring-2 ring-blue-500 outline-none resize-none shadow-inner"
              placeholder="Paste Job Description here (Optional)..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />
            <button
              onClick={handleProcess}
              disabled={loading}
              className={`py-4 rounded-xl font-bold text-white text-lg shadow-md flex items-center justify-center gap-2 disabled:opacity-50 transition hover:shadow-lg
                ${mode === "roast" ? "bg-red-600 hover:bg-red-700" : mode === "builder" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
              `}
            >
              {loading ? <><Loader2 className="animate-spin" /> Processing AI...</> :
                mode === "roast" ? "🔥 Roast My Resume" :
                  mode === "builder" ? "🛠️ Rewrite Resume" : "📊 Check Score"}
            </button>
          </div>
        </div>
      </div>

      {/* --- RESULTS AREA --- */}
      {result && (
        <div className="max-w-5xl mx-auto p-6 animate-in slide-in-from-bottom-8 duration-700">

          {/* === MODE 1: ANALYZER === */}
          {isAnalyzer(result) && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">ATS Score</h2>
                  <p className="text-slate-500">Industry Standard Match</p>
                </div>
                <div className={`text-7xl font-black ${result.ats_score > 75 ? "text-green-500" : result.ats_score > 50 ? "text-orange-500" : "text-red-500"}`}>
                  {result.ats_score}%
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><FileText className="text-purple-500" /> Summary</h3>
                <p className="text-slate-600 leading-relaxed">{result.summary}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-8 rounded-2xl border border-red-100">
                  <h3 className="font-bold text-red-700 mb-4 flex items-center gap-2"><AlertTriangle size={20} /> Missing Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missing_skills?.map((s, i) => (
                      <span key={i} className="bg-white px-3 py-1 rounded-lg text-sm font-semibold text-red-600 border border-red-200 shadow-sm">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-green-50 p-8 rounded-2xl border border-green-100">
                  <h3 className="font-bold text-green-700 mb-4 flex items-center gap-2"><CheckCircle size={20} /> Improvement Tips</h3>
                  <ul className="space-y-3">
                    {result.improvement_tips?.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-green-800 text-sm">
                        <span className="mt-1">•</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* === MODE 2: ROAST 🔥 === */}
          {isRoast(result) && (
            <div className="bg-slate-900 text-white p-10 rounded-3xl shadow-2xl border-4 border-red-600 relative overflow-hidden text-center">
              <div className="absolute -top-10 -right-10 opacity-10 text-red-500"><Flame size={300} /></div>
              <h2 className="text-4xl font-black text-red-500 mb-2 uppercase tracking-widest">🔥 Resume Roast</h2>
              <h3 className="text-2xl font-bold italic text-slate-300 mb-8 border-b border-slate-700 pb-6 inline-block">
                "{result.roast_title}"
              </h3>

              <div className="grid gap-4 relative z-10 text-left max-w-3xl mx-auto">
                {result.burns?.map((burn, i) => (
                  <div key={i} className="bg-slate-800 p-4 rounded-xl border-l-4 border-red-500 text-lg shadow-lg transform hover:-translate-y-1 transition">
                    💀 {burn}
                  </div>
                ))}
              </div>
              <p className="mt-10 text-slate-400 italic text-sm border-t border-slate-800 pt-4">"{result.overall_verdict}"</p>
            </div>
          )}

          {/* === MODE 3: ATS BUILDER (Printable) === */}
          {isBuilder(result) && (
            <div>
              <div className="flex justify-end mb-4 print:hidden">
                <button onClick={() => window.print()} className="bg-slate-800 hover:bg-black text-white px-6 py-2 rounded-lg flex gap-2 font-bold shadow-lg transition">
                  <Printer size={18} /> Save as PDF
                </button>
              </div>

              <div ref={printRef} className="bg-white shadow-2xl p-16 min-h-[1100px] text-black print:shadow-none print:p-0 mx-auto max-w-[210mm]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                <div className="text-center border-b-2 border-black pb-6 mb-8">
                  <h1 className="text-4xl font-bold uppercase tracking-wide">{result.personal_info?.name}</h1>
                  <p className="mt-3 text-sm font-medium">
                    {result.personal_info?.email} • {result.personal_info?.phone} • {result.personal_info?.linkedin}
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="font-bold uppercase border-b border-gray-400 mb-3 text-sm tracking-wider">Professional Summary</h3>
                  <p className="text-sm leading-relaxed text-justify">{result.personal_info?.summary}</p>
                </div>

                <div className="mb-8">
                  <h3 className="font-bold uppercase border-b border-gray-400 mb-3 text-sm tracking-wider">Technical Skills</h3>
                  <p className="text-sm font-medium">{result.skills?.join(" • ")}</p>
                </div>

                <div className="mb-8">
                  <h3 className="font-bold uppercase border-b border-gray-400 mb-4 text-sm tracking-wider">Work Experience</h3>
                  {result.experience?.map((job, i) => (
                    <div key={i} className="mb-5">
                      <div className="flex justify-between font-bold text-sm">
                        <span>{job.role}</span>
                        <span>{job.duration}</span>
                      </div>
                      <div className="text-sm italic mb-2 font-semibold text-gray-700">{job.company}</div>
                      <ul className="list-disc ml-4 space-y-1">
                        {job.points?.map((pt, j) => (
                          <li key={j} className="text-sm pl-1">{pt}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mb-8">
                  <h3 className="font-bold uppercase border-b border-gray-400 mb-3 text-sm tracking-wider">Education</h3>
                  {result.education?.map((edu, i) => (
                    <div key={i} className="flex justify-between text-sm mb-1">
                      <div>
                        <span className="font-bold">{edu.university}</span>
                        <span className="block italic">{edu.degree}</span>
                      </div>
                      <span className="font-bold">{edu.year}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}