"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  ExternalLink,
  Bookmark,
  Sparkles,
  Share2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { JobItem } from "./JobCard";

interface JobDetailsModalProps {
  job: JobItem | null;
  onClose: () => void;
  onToggleSave?: (jobId: string, saved: boolean) => void;
}

export default function JobDetailsModal({
  job,
  onClose,
  onToggleSave,
}: JobDetailsModalProps) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(job?.isSaved || false);
  const [copied, setCopied] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  useEffect(() => {
    if (!job) {
      setDetails(null);
      setAiResult(null);
      return;
    }
    setSaved(job.isSaved || false);
    setAiResult(null);
    fetchJobDetails(job.id);
  }, [job]);

  const fetchJobDetails = async (jobId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      if (res.ok) {
        const data = await res.json();
        setDetails(data.job);
        if (data.job?.isSaved !== undefined) setSaved(data.job.isSaved);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!job) return null;

  const handleToggleSave = async () => {
    const next = !saved;
    setSaved(next);
    try {
      const res = await fetch("/api/saved-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setSaved(data.saved);
        if (onToggleSave) onToggleSave(job.id, data.saved);
      }
    } catch {
      setSaved(!next);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/jobs/${job.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunAiMatch = async () => {
    setAiAnalyzing(true);
    try {
      const res = await fetch("/api/ai/resume-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiResult(data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const currentJob = details || job;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-sm transition-all duration-300">
      <div className="relative h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Apple Frosted Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 apple-glass z-10">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-[#86868b] tracking-tight">
              Role Details
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              title="Copy link"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.04] text-[#1d1d1f] hover:bg-black/[0.08] transition"
            >
              {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-[#34c759]" /> : <Share2 className="h-3.5 w-3.5" />}
            </button>

            <button
              onClick={handleToggleSave}
              id="details-bookmark-btn"
              title={saved ? "Saved" : "Save"}
              className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                saved
                  ? "bg-[#ff9500]/15 text-[#ff9500]"
                  : "bg-black/[0.04] text-[#1d1d1f] hover:bg-black/[0.08]"
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} />
            </button>

            <button
              onClick={onClose}
              id="close-details-modal"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.04] text-[#1d1d1f] hover:bg-black/[0.08] transition ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Apple Style Header Card */}
          <div className="rounded-[22px] border border-black/[0.05] bg-[#f5f5f7] p-5">
            <div className="flex items-start gap-4">
              {currentJob.company.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentJob.company.logoUrl}
                  alt={currentJob.company.name}
                  className="h-12 w-12 shrink-0 rounded-[14px] border border-black/[0.06] object-contain p-2 bg-white shadow-2xs"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#1d1d1f] text-base font-semibold text-white uppercase shadow-2xs">
                  {currentJob.company.name.slice(0, 2)}
                </div>
              )}

              <div className="flex-1">
                <h2 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">
                  {currentJob.title}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[#86868b]">
                  <span className="font-medium text-[#1d1d1f]">{currentJob.company.name}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {currentJob.location}
                  </span>
                  {currentJob.company.industry && (
                    <>
                      <span>•</span>
                      <span>{currentJob.company.industry}</span>
                    </>
                  )}
                </div>

                <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      currentJob.jobType === "INTERNSHIP"
                        ? "bg-[#34c759]/10 text-[#248a3d]"
                        : "bg-[#0071e3]/10 text-[#0071e3]"
                    }`}
                  >
                    {currentJob.jobType === "INTERNSHIP" ? "Internship" : "Full-Time"}
                  </span>

                  <span className="rounded-full bg-white border border-black/[0.06] px-2.5 py-0.5 text-[11px] font-medium text-[#1d1d1f]">
                    {currentJob.workplaceType === "REMOTE"
                      ? "Remote"
                      : currentJob.workplaceType === "HYBRID"
                      ? "Hybrid"
                      : "On-Site"}
                  </span>

                  <span className="rounded-full bg-white border border-black/[0.06] px-2.5 py-0.5 text-[11px] font-medium text-[#86868b]">
                    {currentJob.experienceLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Resume Match Card */}
          <div className="rounded-[22px] border border-[#0071e3]/15 bg-gradient-to-br from-[#0071e3]/5 via-white to-transparent p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0071e3] text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-[13px] font-semibold text-[#1d1d1f]">AI Resume Fit</h4>
                  <p className="text-[11px] text-[#86868b]">Match your profile against this role</p>
                </div>
              </div>

              <button
                onClick={handleRunAiMatch}
                disabled={aiAnalyzing}
                id="ai-match-btn"
                className="apple-btn-primary px-3.5 py-1 text-[12px] font-medium flex items-center gap-1 disabled:opacity-50"
              >
                {aiAnalyzing ? "Analyzing..." : "Analyze"}
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {aiResult && (
              <div className="mt-4 pt-4 border-t border-black/[0.06] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0071e3] text-white text-[15px] font-bold">
                    {aiResult.score}%
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] font-semibold text-[#1d1d1f]">Relevance Assessment</p>
                    <p className="text-[11px] text-[#86868b] leading-relaxed mt-0.5">{aiResult.summary}</p>
                  </div>
                </div>

                {aiResult.matchedSkills?.length > 0 && (
                  <div>
                    <span className="text-[11px] font-medium text-[#248a3d]">Matching Skills:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {aiResult.matchedSkills.map((s: string) => (
                        <span key={s} className="rounded-full bg-[#34c759]/10 text-[#248a3d] px-2.5 py-0.5 text-[10px] font-medium">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {aiResult.missingSkills?.length > 0 && (
                  <div>
                    <span className="text-[11px] font-medium text-[#ff9500]">Recommended Additions:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {aiResult.missingSkills.map((s: string) => (
                        <span key={s} className="rounded-full bg-[#ff9500]/10 text-[#d97706] px-2.5 py-0.5 text-[10px] font-medium">
                          + {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Key Skills */}
          {currentJob.skills && currentJob.skills.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider mb-2.5">
                Target Technologies & Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {currentJob.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="rounded-full bg-black/[0.04] text-[#1d1d1f] px-3 py-1 text-[12px] font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job Description */}
          <div>
            <h4 className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider mb-2.5">
              Role Specifications & Context
            </h4>
            <div className="text-[13px] leading-relaxed text-[#1d1d1f]/90 whitespace-pre-line rounded-[20px] border border-black/[0.05] bg-[#fbfbfd] p-5 font-normal">
              {loading ? (
                <div className="py-8 text-center text-[#86868b]">Loading specifications...</div>
              ) : (
                currentJob.description || "No description provided."
              )}
            </div>
          </div>
        </div>

        {/* Sticky Modal Bottom Action Bar */}
        <div className="border-t border-black/[0.06] bg-white/90 backdrop-blur-md px-6 py-3.5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-[#86868b]">Verified Direct Employer Posting</p>
            <p className="text-[12px] font-medium text-[#1d1d1f]">{currentJob.company.name}</p>
          </div>

          <a
            href={currentJob.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="apply-official-btn"
            className="apple-btn-primary px-6 py-2.5 text-[13px] font-medium flex items-center gap-1.5"
          >
            <span>Apply on Company Site</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
