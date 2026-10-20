"use client";

import React, { useState, useEffect } from "react";
import {
  Code2,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

interface Question {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  description: string;
  starterCode: string;
  acceptanceRate: number;
  points: number;
  isSolved: boolean;
  totalAttempts: number;
}

export default function PracticePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ passed: boolean; message: string; pointsAwarded?: number } | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/practice");
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
        if (data.questions?.length > 0) {
          setSelectedQuestion(data.questions[0]);
          setCode(data.questions[0].starterCode || "");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuestion = (q: Question) => {
    setSelectedQuestion(q);
    setCode(q.starterCode || "");
    setResult(null);
  };

  const handleSubmitCode = async () => {
    if (!selectedQuestion) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          code,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setResult({ passed: false, message: data.error || "Submission failed" });
      } else {
        setResult(data);
        if (data.passed) {
          // Update local status
          setQuestions((prev) =>
            prev.map((q) => (q.id === selectedQuestion.id ? { ...q, isSolved: true } : q))
          );
        }
      }
    } catch (err: unknown) {
      setResult({ passed: false, message: err instanceof Error ? err.message : "Error executing submission" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider mb-2">
            <Code2 className="h-4 w-4 text-indigo-400" />
            <span>Interactive Interview Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Daily Technical Practice</h1>
          <p className="text-xs sm:text-sm text-indigo-200/80 mt-1 max-w-xl">
            Solve curated data structures, algorithms, and system design challenges frequently asked in tech internship interviews.
          </p>
        </div>

        <a
          href="/leaderboard"
          className="flex items-center gap-2 rounded-xl border border-indigo-700/60 bg-indigo-900/60 px-4 py-2 text-xs font-bold text-indigo-200 hover:bg-indigo-800 transition"
        >
          <Trophy className="h-4 w-4 text-amber-400" />
          View Community Rankings →
        </a>
      </div>

      {/* Main Two-Column Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Question List */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Problem Directory</h3>
            <span className="text-[11px] font-semibold text-indigo-600">{questions.length} Questions</span>
          </div>

          <div className="space-y-2">
            {questions.map((q) => {
              const isSelected = selectedQuestion?.id === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => handleSelectQuestion(q)}
                  id={`practice-question-${q.slug}`}
                  className={`flex items-center justify-between rounded-xl border p-3 transition cursor-pointer ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50/50 shadow-xs"
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {q.isSolved ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-slate-300 ml-1 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{q.title}</h4>
                      <p className="text-[10px] text-slate-500">{q.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        q.difficulty === "EASY"
                          ? "bg-emerald-50 text-emerald-700"
                          : q.difficulty === "MEDIUM"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                    <span className="text-[11px] font-bold text-indigo-600">+{q.points} pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Code Workspace */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          {selectedQuestion ? (
            <>
              {/* Problem Title & Category */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{selectedQuestion.title}</h2>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        selectedQuestion.difficulty === "EASY"
                          ? "bg-emerald-50 text-emerald-700"
                          : selectedQuestion.difficulty === "MEDIUM"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {selectedQuestion.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Category: {selectedQuestion.category} • Acceptance Rate: {selectedQuestion.acceptanceRate}%
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
                    {selectedQuestion.points} Points
                  </span>
                </div>
              </div>

              {/* Problem Statement */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedQuestion.description}
              </div>

              {/* Code Editor Area */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5 text-indigo-600" />
                    Solution Editor (JavaScript / TypeScript)
                  </label>
                  <button
                    onClick={() => setCode(selectedQuestion.starterCode || "")}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset Code
                  </button>
                </div>

                <textarea
                  id="practice-code-editor"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={10}
                  className="w-full rounded-xl border border-slate-300 bg-slate-950 p-4 font-mono text-xs text-emerald-400 focus:border-indigo-500 focus:outline-hidden"
                  placeholder="// Implement your solution here..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">Automated test runner verification</span>

                <button
                  onClick={handleSubmitCode}
                  disabled={submitting}
                  id="practice-submit-btn"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  {submitting ? "Evaluating..." : "Run & Submit Solution"}
                </button>
              </div>

              {/* Result Banner */}
              {result && (
                <div
                  id="practice-result-banner"
                  className={`rounded-xl border p-4 text-xs flex items-start gap-3 ${
                    result.passed
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-rose-200 bg-rose-50 text-rose-800"
                  }`}
                >
                  {result.passed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold">
                      {result.passed ? "All Test Cases Passed! 🎉" : "Verification Incomplete"}
                    </h4>
                    <p className="mt-0.5">{result.message}</p>
                    {result.pointsAwarded && (
                      <p className="mt-1 font-semibold text-emerald-700">
                        +{result.pointsAwarded} points added to your candidate profile!
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-slate-400">Select a problem to start practicing.</div>
          )}
        </div>
      </div>
    </div>
  );
}
