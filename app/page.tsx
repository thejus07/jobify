"use client";

import React, { useState, useEffect, useCallback } from "react";
import HeroSearch from "@/components/HeroSearch";
import JobFilters, { FilterState } from "@/components/JobFilters";
import JobCard, { JobItem } from "@/components/JobCard";
import JobDetailsModal from "@/components/JobDetailsModal";
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  Code2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);

  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    type: "ALL",
    workplace: "ALL",
    experience: "ALL",
    postedWithin: "all",
    sort: "newest",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
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
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [query, location, filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleHeroSearch = ({ q, location: loc, type }: { q: string; location: string; type: string }) => {
    setQuery(q);
    setLocation(loc);
    setFilters((prev) => ({ ...prev, type }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setQuery("");
    setLocation("");
    setFilters({
      type: "ALL",
      workplace: "ALL",
      experience: "ALL",
      postedWithin: "all",
      sort: "newest",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 space-y-7">
      {/* Apple Keynote Hero */}
      <HeroSearch
        initialQuery={query}
        initialLocation={location}
        initialType={filters.type}
        totalCount={pagination.total || 154}
        onSearch={handleHeroSearch}
      />

      {/* Apple Bento Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <a
          href="/practice"
          className="apple-card group p-4.5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-black/[0.04] text-[#1d1d1f] group-hover:scale-105 transition-transform duration-200">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-[#1d1d1f] tracking-tight">Technical Practice</h4>
              <p className="text-[11px] text-[#86868b]">Interactive coding interview hub</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-[#86868b] group-hover:text-[#0071e3] group-hover:translate-x-0.5 transition-all" />
        </a>

        <a
          href="/resume"
          className="apple-card group p-4.5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#0071e3]/10 text-[#0071e3] group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-[#1d1d1f] tracking-tight">AI Resume Studio</h4>
              <p className="text-[11px] text-[#86868b]">Truthful bullet tailoring & match score</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-[#86868b] group-hover:text-[#0071e3] group-hover:translate-x-0.5 transition-all" />
        </a>

        <a
          href="/dashboard"
          className="apple-card group p-4.5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#34c759]/10 text-[#248a3d] group-hover:scale-105 transition-transform duration-200">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-[#1d1d1f] tracking-tight">Application Tracker</h4>
              <p className="text-[11px] text-[#86868b]">Kanban board for all your submissions</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-[#86868b] group-hover:text-[#0071e3] group-hover:translate-x-0.5 transition-all" />
        </a>
      </div>

      {/* Filter Bar */}
      <div id="job-filters-container">
        <JobFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          totalResults={pagination.total}
        />
      </div>

      {/* Jobs Listings Container */}
      <div>
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
          /* Empty State */
          <div className="rounded-[28px] border border-black/[0.06] bg-white p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f5f7] text-[#86868b] mb-3">
              <Inbox className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#1d1d1f]">No opportunities match your search</h3>
            <p className="mt-1 text-[13px] text-[#86868b] max-w-sm mx-auto font-normal">
              Try adjusting keywords or resetting filters to explore all current listings.
            </p>
            <button
              onClick={handleResetFilters}
              id="empty-state-reset-btn"
              className="mt-4 apple-btn-primary px-5 py-2 text-[12px] font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Job Cards Grid */
          <div
            id="job-listings-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSelect={(selected) => setSelectedJob(selected)}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page <= 1}
              id="pagination-prev-btn"
              className="flex items-center gap-1 rounded-full bg-white border border-black/[0.06] px-4 py-1.5 text-[12px] font-medium text-[#1d1d1f] hover:bg-black/[0.03] disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>

            <span className="text-[12px] text-[#86868b] px-3 font-normal">
              Page <strong className="font-semibold text-[#1d1d1f]">{pagination.page}</strong> of{" "}
              <strong className="font-semibold text-[#1d1d1f]">{pagination.totalPages}</strong>
            </span>

            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page >= pagination.totalPages}
              id="pagination-next-btn"
              className="flex items-center gap-1 rounded-full bg-white border border-black/[0.06] px-4 py-1.5 text-[12px] font-medium text-[#1d1d1f] hover:bg-black/[0.03] disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      <JobDetailsModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onToggleSave={(jobId, isSaved) => {
          setJobs((prev) =>
            prev.map((j) => (j.id === jobId ? { ...j, isSaved } : j))
          );
        }}
      />
    </div>
  );
}
