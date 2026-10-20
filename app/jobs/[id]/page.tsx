"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import {
  Building,
  MapPin,
  ExternalLink,
  Bookmark,
  Sparkles,
  ArrowLeft,
  Calendar,
  CheckCircle2,
} from "lucide-react";

function JobDetailContent() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/jobs/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (d.job?.isSaved !== undefined) setSaved(d.job.isSaved);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleToggleSave = async () => {
    if (!data?.job) return;
    const next = !saved;
    setSaved(next);
    try {
      const res = await fetch("/api/saved-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: data.job.id }),
      });
      if (res.ok) {
        const resData = await res.json();
        setSaved(resData.saved);
      }
    } catch {
      setSaved(!next);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading job specifications...</div>;
  }

  if (!data?.job) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Job Not Found</h2>
        <p className="text-xs text-slate-500">This role may have expired or been removed by the company.</p>
        <a href="/jobs" className="inline-block rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white">
          Back to Directory
        </a>
      </div>
    );
  }

  const { job } = data;
  const skills = Array.isArray(job.skills) ? job.skills : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Back button */}
      <div>
        <a
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all opportunities
        </a>
      </div>

      {/* Main Job Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {job.company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={job.company.logoUrl}
                alt={job.company.name}
                className="h-16 w-16 shrink-0 rounded-2xl border border-slate-100 object-contain p-2 shadow-xs bg-white"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-xl font-bold text-white uppercase shadow-xs">
                {job.company.name.slice(0, 2)}
              </div>
            )}

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{job.title}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600">
                <a href={`/companies/${job.company.slug}`} className="font-bold text-indigo-600 hover:underline">
                  {job.company.name}
                </a>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {job.location}
                </span>
                {job.company.industry && (
                  <>
                    <span>•</span>
                    <span className="text-slate-500">{job.company.industry}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleToggleSave}
              id="job-page-save-btn"
              className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                saved
                  ? "border-amber-200 bg-amber-50 text-amber-600"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Bookmark className={`h-5 w-5 ${saved ? "fill-amber-500" : ""}`} />
            </button>

            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="job-page-apply-btn"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/25 hover:from-indigo-700 hover:to-violet-700 transition"
            >
              Apply on Company Site
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
            {job.jobType === "INTERNSHIP" ? "🎓 Internship" : "💼 Full-Time"}
          </span>
          <span className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
            {job.workplaceType === "REMOTE" ? "🌐 Remote" : job.workplaceType === "HYBRID" ? "🏢 Hybrid" : "📍 On-Site"}
          </span>
          <span className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
            {job.experienceLevel}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
            <Calendar className="h-3.5 w-3.5" />
            Verified {new Date(job.lastVerifiedAt).toLocaleDateString()}
          </span>
        </div>

        {/* AI Resume Banner */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Want to optimize your resume for this role?</h3>
              <p className="text-xs text-slate-500">Run our Gemini AI resume fit analysis to tailor your skills and bullets.</p>
            </div>
          </div>

          <a
            href={`/resume?jobId=${job.id}`}
            id="job-page-tailor-btn"
            className="rounded-xl border border-indigo-200 bg-white px-4 py-2 text-xs font-bold text-indigo-700 shadow-xs hover:bg-indigo-50 transition"
          >
            Launch AI Tailor →
          </a>
        </div>

        {/* Required Skills */}
        {skills.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Target Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((s: string) => (
                <span key={s} className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Role Specifications</h2>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {job.description}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobDetailPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading job specifications...</div>}>
      <JobDetailContent />
    </Suspense>
  );
}
