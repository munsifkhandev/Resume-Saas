"use client";

import { useState } from "react";
import axios from "axios";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

// Hum bata rahe hain ki backend se data kaisa dikhega
interface AnalysisResult {
  ats_score: number;
  missing_skills: string[];
  summary: string;
  improvement_tips: string[];
}
// -------------------------------------------

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Pehle Resume select karein!");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Backend ko file bhejna (Port 8000)
      const response = await axios.post("http://127.0.0.1:8000/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Response mein jo 'analysis' key aa rahi hai backend se, usse set karein
      setResult(response.data.analysis);

    } catch (error) {
      console.error(error);
      alert("Upload failed! Kya Backend chal raha hai?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Resume Improver 🚀</h1>
          <p className="text-gray-600">Apna resume upload karein aur AI se check karwayein.</p>
        </header>

        {/* Upload Section */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center hover:bg-gray-50 transition">
            <Upload className="w-12 h-12 text-blue-500 mb-4" />
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="mb-4 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-400">Sirf PDF format allowed hai</p>
          </div>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <> <Loader2 className="animate-spin" /> Analyzing... </>
            ) : (
              "Check My Score"
            )}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="mt-8 space-y-6">

            {/* ATS Score Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">ATS Score</h2>
                <p className="text-gray-500">Based on industry standards</p>
              </div>
              <div className={`text-5xl font-black ${result.ats_score >= 70 ? "text-green-500" : "text-orange-500"}`}>
                {result.ats_score}/100
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" /> Summary
              </h3>
              <p className="text-gray-600 leading-relaxed">{result.summary}</p>
            </div>

            {/* Two Columns: Missing Skills & Improvements */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Missing Skills */}
              <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> Missing Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.missing_skills?.map((skill, i) => (
                    <span key={i} className="bg-white text-red-600 px-3 py-1 rounded-full text-sm font-medium border border-red-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Recommended Fixes
                </h3>
                <ul className="space-y-2">
                  {result.improvement_tips?.map((tip, i) => (
                    <li key={i} className="text-green-700 text-sm flex items-start gap-2">
                      <span className="mt-1">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}