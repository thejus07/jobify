"use client";

import React, { useState, useEffect, useCallback } from "react";
import JobFilters, { FilterState } from "@/components/JobFilters";
import JobCard, { JobItem } from "@/components/JobCard";
import JobDetailsModal from "@/components/JobDetailsModal";
import { Briefcase, Inbox } from "lucide-react";

export default function FullTimePage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    type: "FULL_TIME",
    workplace: "ALL",
    experience: "ALL",
    postedWithin: "all",
    sort: "newest",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  const fetchFullTime = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("type", "FULL_TIME");
      if (filters.workplace !== "ALL") params.set("workplace", filters.workplace);
      if (filters.postedWithin !== "all") params.set("postedWithin", filters.postedWithin);
      if (filters.sort) params.set("sort", filters.sort);
      params.set("page", String(pagination.page));
      params.set("limit", String(pagination.limit));

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchFullTime();
  }, [fetchFullTime]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/60 via-white to-violet-50/60 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
          <Briefcase className="h-4 w-4" />
          <span>New Graduate & Entry Level</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          Full-Time Early-Career Roles
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl">
          Full-time engineering, product, and data positions tailored for graduating seniors, master&apos;s students, and early-career developers.
        </p>
      </div>

      <JobFilters
        filters={filters}
        onChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
        onReset={() => setFilters({ type: "FULL_TIME", workplace: "ALL", experience: "ALL", postedWithin: "all", sort: "newest" })}
        totalResults={pagination.total}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl border border-slate-200 bg-white p-5 animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Inbox className="mx-auto h-8 w-8 text-slate-400 mb-2" />
          <h3 className="text-sm font-bold text-slate-900">No full-time roles matching filters</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting your workplace or experience selections.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSelect={(selected) => setSelectedJob(selected)}
            />
          ))}
        </div>
      )}

      <JobDetailsModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
}
