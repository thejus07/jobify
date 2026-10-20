"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import JobFilters, { FilterState } from "@/components/JobFilters";
import JobCard, { JobItem } from "@/components/JobCard";
import JobDetailsModal from "@/components/JobDetailsModal";
import { Search, ChevronLeft, ChevronRight, Inbox, Compass } from "lucide-react";

export default function JobsContent() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [filters, setFilters] = useState<FilterState>({
    type: searchParams.get("type") || "ALL",
    workplace: searchParams.get("workplace") || "ALL",
    experience: searchParams.get("experience") || "ALL",
    postedWithin: searchParams.get("postedWithin") || "all",
    sort: "newest",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (location) params.set("location", location);
      if (filters.type !== "ALL") params.set("type", filters.type);
      if (filters.workplace !== "ALL") params.set("workplace", filters.workplace);
      if (filters.experience !== "ALL") params.set("experience", filters.experience);
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
  }, [query, location, filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 space-y-6">
      {/* Apple Style Page Header */}
      <div className="rounded-[28px] border border-black/[0.06] bg-white p-6 sm:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-0.5 text-[11px] font-medium text-[#86868b] tracking-tight">
              <Compass className="h-3.5 w-3.5 text-[#0071e3]" />
              <span>Explore Roles</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-[#1d1d1f] mt-2">
              Early-Career Opportunities
            </h1>
            <p className="text-[13px] text-[#86868b] mt-1 font-normal">
              Direct postings verified daily across tech companies and high-growth startups.
            </p>
          </div>

          {/* Quick inline search capsule */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPagination((p) => ({ ...p, page: 1 }));
              fetchJobs();
            }}
            className="flex w-full md:w-auto items-center gap-1.5 rounded-full bg-[#f5f5f7] p-1 border border-black/[0.05]"
          >
            <div className="relative flex-1 md:w-60">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#86868b]" />
              <input
                type="text"
                placeholder="Search title or skill..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent py-1.5 pl-8 pr-3 text-[12px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="apple-btn-primary px-4 py-1.5 text-[12px] font-medium"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Filter Component */}
      <JobFilters
        filters={filters}
        onChange={(updated) => {
          setFilters((prev) => ({ ...prev, ...updated }));
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        onReset={() => {
          setQuery("");
          setLocation("");
          setFilters({
            type: "ALL",
            workplace: "ALL",
            experience: "ALL",
            postedWithin: "all",
            sort: "newest",
          });
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        totalResults={pagination.total}
      />

      {/* Grid of Listings */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-[22px] border border-black/[0.05] bg-white p-5 animate-pulse flex flex-col justify-between"
            >
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-[12px] bg-black/[0.04]" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 rounded-full bg-black/[0.04]" />
                  <div className="h-3 w-1/2 rounded-full bg-black/[0.03]" />
                </div>
              </div>
              <div className="h-5 w-1/3 rounded-full bg-black/[0.03]" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-[28px] border border-black/[0.06] bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f5f7] text-[#86868b] mb-3">
            <Inbox className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-[#1d1d1f]">No opportunities match your criteria</h3>
          <p className="text-[13px] text-[#86868b] mt-1 max-w-sm mx-auto">
            Try adjusting your query or resetting filters to see all available roles.
          </p>
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

      {/* Pagination Controls in Apple Pill Style */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
            disabled={pagination.page <= 1}
            className="flex items-center gap-1 rounded-full bg-white border border-black/[0.06] px-4 py-1.5 text-[12px] font-medium text-[#1d1d1f] hover:bg-black/[0.03] disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </button>
          <span className="text-[12px] text-[#86868b] px-3 font-normal">
            Page <strong className="font-semibold text-[#1d1d1f]">{pagination.page}</strong> of{" "}
            <strong className="font-semibold text-[#1d1d1f]">{pagination.totalPages}</strong>
          </span>
          <button
            onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
            disabled={pagination.page >= pagination.totalPages}
            className="flex items-center gap-1 rounded-full bg-white border border-black/[0.06] px-4 py-1.5 text-[12px] font-medium text-[#1d1d1f] hover:bg-black/[0.03] disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <JobDetailsModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onToggleSave={(id, isSaved) => {
          setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, isSaved } : j)));
        }}
      />
    </div>
  );
}
