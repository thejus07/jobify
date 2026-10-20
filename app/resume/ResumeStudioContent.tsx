"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Download,
  Building,
  RotateCcw,
  Printer,
  Check,
} from "lucide-react";

interface JobOption {
  id: string;
  title: string;
  company: { name: string };
  skills: string[];
}

export default function ResumeStudioContent() {
  const searchParams = useSearchParams();
  const targetJobId = searchParams.get("jobId");

  const [resumeText, setResumeText] = useState(
    `Alex Chen
San Francisco, CA | alex.chen@example.com | github.com/alexchen-dev

EDUCATION
University of California, Berkeley - B.S. in Computer Science (Expected May 2027)

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, Go, SQL, HTML/CSS
Frameworks & Tools: React, Next.js, Node.js, Express, Tailwind CSS, Prisma, PostgreSQL, Docker, AWS, Git

EXPERIENCE
Software Engineering Intern | Acme Cloud (June 2026 - August 2026)
- Developed responsive dashboard components in Next.js and TypeScript, increasing page performance by 35%.
- Implemented RESTful APIs and Prisma database queries on PostgreSQL handling 50k daily active requests.
- Collaborated in an agile team of 6 engineers with weekly sprints, code reviews, and CI/CD pipelines.

PROJECTS
DevJob Tracker: Built full-stack application for tracking technical internship applications with Next.js, Tailwind, and SQLite.
Distributed Key-Value Store: Implemented Raft consensus algorithm in Go with fault tolerance and snapshotting.`
  );

  const [availableJobs, setAvailableJobs] = useState<JobOption[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(targetJobId || "");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [editableResume, setEditableResume] = useState(resumeText);
  const [tailoringApplied, setTailoringApplied] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchUserResume();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs?limit=30");
      if (res.ok) {
        const data = await res.json();
        setAvailableJobs(data.jobs || []);
        if (!selectedJobId && data.jobs?.length > 0) {
          setSelectedJobId(data.jobs[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserResume = async () => {
    try {
      const res = await fetch("/api/ai/resume");
      if (res.ok) {
        const data = await res.json();
        if (data.resumes && data.resumes.length > 0) {
          setResumeText(data.resumes[0].rawText);
          setEditableResume(data.resumes[0].rawText);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedJobId) return;
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch("/api/ai/resume-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobId: selectedJobId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplyTailoredBullets = () => {
    if (!analysisResult?.tailoredBullets || analysisResult.tailoredBullets.length === 0) return;

    // Append / replace bullets in the editable resume
    const formattedBullets = analysisResult.tailoredBullets.map((b: string) => `- ${b}`).join("\n");
    const updated = `${editableResume}\n\nAI-TAILORED IMPACT HIGHLIGHTS:\n${formattedBullets}`;
    setEditableResume(updated);
    setTailoringApplied(true);
  };

  const handlePrintDownload = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Resume - Tailored via Jobify</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; font-size: 12px; line-height: 1.6; color: #1e293b; }
            pre { white-space: pre-wrap; font-family: inherit; font-size: inherit; }
          </style>
        </head>
        <body>
          <pre>${editableResume}</pre>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-violet-200/80 bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-xs mb-2">
            <Sparkles className="h-4 w-4" />
            <span>Powered by Google Gemini</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">AI Resume Studio</h1>
          <p className="mt-1 text-xs sm:text-sm text-indigo-100 max-w-lg leading-relaxed">
            Audit your resume against live requirements from top tech companies. Receive objective match scores, keyword gap analyses, and truthful bullet point enhancements.
          </p>
        </div>

        <button
          onClick={handlePrintDownload}
          id="resume-download-btn"
          className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-indigo-700 shadow-sm hover:bg-indigo-50 transition"
        >
          <Download className="h-4 w-4" />
          Export / Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input & Job Selector */}
        <div className="lg:col-span-6 space-y-4">
          {/* Target Job Selector Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Step 1: Select Target Opportunity
            </label>
            <select
              id="resume-job-selector"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-hidden"
            >
              {availableJobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} — {j.company.name}
                </option>
              ))}
            </select>
          </div>

          {/* Resume Editor Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Step 2: Candidate Resume (Editable Preview)
              </label>
              <span className="text-[11px] text-slate-400">Pure text extraction</span>
            </div>

            <textarea
              id="resume-text-input"
              rows={16}
              value={editableResume}
              onChange={(e) => setEditableResume(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 font-mono text-xs text-slate-800 leading-relaxed focus:border-indigo-500 focus:outline-hidden"
              placeholder="Paste or edit your resume text here..."
            />

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setEditableResume(resumeText)}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Original Text
              </button>

              <button
                type="button"
                id="run-ai-analysis-btn"
                onClick={handleAnalyze}
                disabled={analyzing || !selectedJobId}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-700 hover:to-violet-700 transition disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {analyzing ? "Gemini Evaluating..." : "Run Match Analysis"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Match & Tailoring Results */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs min-h-[580px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  Gemini Evaluation & Gap Report
                </h3>
                {analysisResult && (
                  <span className="text-xs font-bold text-indigo-600">
                    Match Score: {analysisResult.score}%
                  </span>
                )}
              </div>

              {analyzing ? (
                <div className="py-24 text-center space-y-3">
                  <div className="mx-auto h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                  <p className="text-xs text-slate-500">Gemini is comparing your qualifications against job specs...</p>
                </div>
              ) : !analysisResult ? (
                <div className="py-24 text-center space-y-2 text-slate-400">
                  <FileText className="mx-auto h-12 w-12 text-slate-300" />
                  <h4 className="text-xs font-bold text-slate-600">No Analysis Generated Yet</h4>
                  <p className="text-[11px] max-w-xs mx-auto">
                    Select a target opportunity and click &quot;Run Match Analysis&quot; to review your candidate fit and truthful bullet recommendations.
                  </p>
                </div>
              ) : (
                <div className="space-y-4" id="ai-analysis-container">
                  {/* Score Card */}
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white font-extrabold text-lg shadow-xs">
                      {analysisResult.score}%
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Overall Match Percentage</h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {analysisResult.summary}
                      </p>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                      <h5 className="text-[11px] font-bold text-emerald-800 flex items-center gap-1 mb-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Matching Skills ({analysisResult.matchedSkills?.length || 0})
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {analysisResult.matchedSkills?.map((s: string) => (
                          <span key={s} className="rounded-md bg-white border border-emerald-200 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                      <h5 className="text-[11px] font-bold text-amber-800 flex items-center gap-1 mb-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                        Keywords to Highlight ({analysisResult.missingSkills?.length || 0})
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {analysisResult.missingSkills?.map((s: string) => (
                          <span key={s} className="rounded-md bg-white border border-amber-200 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {analysisResult.recommendations?.length > 0 && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-1">
                      <h5 className="text-xs font-bold text-slate-800">Actionable Suggestions:</h5>
                      <ul className="space-y-1 text-[11px] text-slate-600">
                        {analysisResult.recommendations.map((r: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tailored Bullets */}
                  {analysisResult.tailoredBullets?.length > 0 && (
                    <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-violet-900">
                          Truthfully Optimized Bullet Points:
                        </h5>
                        <button
                          type="button"
                          id="apply-tailored-bullets-btn"
                          onClick={handleApplyTailoredBullets}
                          className="flex items-center gap-1 rounded-lg bg-violet-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-violet-700 transition"
                        >
                          <Check className="h-3 w-3" />
                          {tailoringApplied ? "Applied!" : "Insert into Preview"}
                        </button>
                      </div>
                      <div className="space-y-1.5 text-[11px] text-slate-700">
                        {analysisResult.tailoredBullets.map((b: string, i: number) => (
                          <div key={i} className="p-2 rounded-lg bg-white border border-violet-100">
                            • {b}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">All data processed with high confidentiality</span>
              <button
                onClick={handlePrintDownload}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
              >
                <Printer className="h-3.5 w-3.5" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
