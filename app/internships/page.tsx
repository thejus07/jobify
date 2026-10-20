"use client";

import React, { useState, useEffect, useCallback } from "react";
import JobFilters, { FilterState } from "@/components/JobFilters";
import JobCard, { JobItem } from "@/components/JobCard";
import JobDetailsModal from "@/components/JobDetailsModal";
import { GraduationCap, Inbox } from "lucide-react";

export default function InternshipsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    type: "INTERNSHIP",
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

  const fetchInternships = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("type", "INTERNSHIP");
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
    fetchInternships();
  }, [fetchInternships]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/60 via-white to-teal-50/60 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
          <GraduationCap className="h-4 w-4" />
          <span>Student & Early-Career Hub</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          Tech Internships & Co-Ops
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl">
          Curated summer, fall, and spring internships at leading tech companies. Gain real-world engineering experience and mentorship.
        </p>
      </div>

      <JobFilters
        filters={filters}
        onChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
        onReset={() => setFilters({ type: "INTERNSHIP", workplace: "ALL", experience: "ALL", postedWithin: "all", sort: "newest" })}
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
          <h3 className="text-sm font-bold text-slate-900">No internships currently matching criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Check back shortly or reset your workplace filters.</p>
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
