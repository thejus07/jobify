"use client";

import React, { useState } from "react";
import {
  MapPin,
  Building,
  Bookmark,
  ArrowUpRight,
  Clock,
} from "lucide-react";

export interface JobItem {
  id: string;
  title: string;
  slug: string;
  company: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    industry?: string | null;
    headquarters?: string | null;
  };
  location: string;
  workplaceType: string;
  jobType: string;
  experienceLevel: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  stipendRate?: string | null;
  skills: string[];
  applyUrl: string;
  source: string;
  postedAt: string | Date;
  clicksCount?: number;
  isSaved?: boolean;
}

interface JobCardProps {
  job: JobItem;
  onSelect: (job: JobItem) => void;
  onSavedChange?: (jobId: string, saved: boolean) => void;
}

function timeAgo(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export default function JobCard({ job, onSelect, onSavedChange }: JobCardProps) {
  const [saved, setSaved] = useState(job.isSaved || false);
  const [saving, setSaving] = useState(false);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaving(true);
    const nextState = !saved;
    setSaved(nextState);

    try {
      const res = await fetch("/api/saved-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      });

      if (!res.ok) {
        setSaved(!nextState);
      } else {
        const data = await res.json();
        setSaved(data.saved);
        if (onSavedChange) onSavedChange(job.id, data.saved);
      }
    } catch {
      setSaved(!nextState);
    } finally {
      setSaving(false);
    }
  };

  const getCompanyColor = (name: string) => {
    const colors = [
      "from-[#1d1d1f] to-[#434347]",
      "from-[#0071e3] to-[#2997ff]",
      "from-[#34c759] to-[#30b0c7]",
      "from-[#af52de] to-[#5856d6]",
      "from-[#ff9500] to-[#ff3b30]",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div
      onClick={() => onSelect(job)}
      id={`job-card-${job.id}`}
      className="apple-card group relative flex flex-col justify-between p-5 cursor-pointer"
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Apple Squircle Company Avatar */}
            {job.company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={job.company.logoUrl}
                alt={job.company.name}
                className="h-10 w-10 shrink-0 rounded-[12px] border border-black/[0.06] bg-white object-contain p-1.5 shadow-2xs"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br ${getCompanyColor(
                  job.company.name
                )} text-[12px] font-semibold text-white uppercase shadow-2xs`}
              >
                {job.company.name.slice(0, 2)}
              </div>
            )}

            <div>
              <h3 className="text-[14px] sm:text-[15px] font-semibold tracking-tight text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors duration-200 line-clamp-1">
                {job.title}
              </h3>
              <p className="text-[12px] text-[#86868b] flex items-center gap-1 mt-0.5 font-normal">
                <span>{job.company.name}</span>
              </p>
            </div>
          </div>

          {/* Apple Style Bookmark Pill Button */}
          <button
            onClick={handleToggleSave}
            disabled={saving}
            id={`bookmark-btn-${job.id}`}
            title={saved ? "Remove from saved" : "Save opportunity"}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 ${
              saved
                ? "bg-[#ff9500]/15 text-[#ff9500]"
                : "bg-black/[0.03] text-[#86868b] hover:bg-black/[0.07] hover:text-[#1d1d1f]"
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Apple Status Pills */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          {/* Job Type Badge */}
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-tight ${
              job.jobType === "INTERNSHIP"
                ? "bg-[#34c759]/10 text-[#248a3d]"
                : job.jobType === "CO_OP"
                ? "bg-[#af52de]/10 text-[#8e44ad]"
                : "bg-[#0071e3]/10 text-[#0071e3]"
            }`}
          >
            {job.jobType === "INTERNSHIP" ? "Internship" : job.jobType === "CO_OP" ? "Co-op" : "Full-Time"}
          </span>

          {/* Workplace Badge */}
          <span className="rounded-full bg-black/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-[#1d1d1f]">
            {job.workplaceType === "REMOTE"
              ? "Remote"
              : job.workplaceType === "HYBRID"
              ? "Hybrid"
              : "On-Site"}
          </span>

          {/* Location */}
          <span className="flex items-center gap-1 text-[11px] text-[#86868b] ml-0.5">
            <MapPin className="h-3 w-3 shrink-0 text-[#86868b]" />
            <span className="truncate max-w-[140px]">{job.location}</span>
          </span>
        </div>

        {/* Skills Pills */}
        {job.skills && job.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {job.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-black/[0.03] px-2 py-0.5 text-[10px] font-medium text-[#86868b]"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="rounded-full bg-black/[0.02] px-1.5 py-0.5 text-[10px] text-[#86868b]">
                +{job.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="mt-4 pt-3 border-t border-black/[0.04] flex items-center justify-between text-[11px] text-[#86868b]">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-[#86868b]" />
          {timeAgo(job.postedAt)}
        </span>

        <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[#0071e3] group-hover:translate-x-0.5 transition-transform duration-200">
          View
          <ArrowUpRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}
