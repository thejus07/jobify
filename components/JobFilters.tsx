"use client";

import React from "react";
import { SlidersHorizontal, RotateCcw, ChevronDown } from "lucide-react";

export interface FilterState {
  type: string;
  workplace: string;
  experience: string;
  postedWithin: string;
  sort: string;
}

interface JobFiltersProps {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  totalResults: number;
}

export default function JobFilters({
  filters,
  onChange,
  onReset,
  totalResults,
}: JobFiltersProps) {
  const isFiltered =
    filters.type !== "ALL" ||
    filters.workplace !== "ALL" ||
    filters.experience !== "ALL" ||
    filters.postedWithin !== "all" ||
    filters.sort !== "newest";

  return (
    <div className="rounded-[22px] border border-black/[0.06] bg-white p-3.5 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Filter Pill Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#86868b] pl-1 pr-1">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filter</span>
          </div>

          {/* Workplace Type */}
          <div className="relative inline-block">
            <select
              id="filter-workplace-select"
              value={filters.workplace}
              onChange={(e) => onChange({ workplace: e.target.value })}
              className="appearance-none rounded-full bg-black/[0.03] hover:bg-black/[0.06] border border-black/[0.05] pl-3.5 pr-7 py-1.5 text-[12px] font-medium text-[#1d1d1f] transition-all cursor-pointer focus:outline-hidden"
            >
              <option value="ALL">All Workplaces</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ONSITE">On-Site</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#86868b]" />
          </div>

          {/* Experience Level */}
          <div className="relative inline-block">
            <select
              id="filter-experience-select"
              value={filters.experience}
              onChange={(e) => onChange({ experience: e.target.value })}
              className="appearance-none rounded-full bg-black/[0.03] hover:bg-black/[0.06] border border-black/[0.05] pl-3.5 pr-7 py-1.5 text-[12px] font-medium text-[#1d1d1f] transition-all cursor-pointer focus:outline-hidden"
            >
              <option value="ALL">All Levels</option>
              <option value="INTERN">Intern</option>
              <option value="ENTRY_LEVEL">Entry-Level</option>
              <option value="ASSOCIATE">Associate</option>
              <option value="MID_SENIOR">Mid-Senior</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#86868b]" />
          </div>

          {/* Date Posted */}
          <div className="relative inline-block">
            <select
              id="filter-date-select"
              value={filters.postedWithin}
              onChange={(e) => onChange({ postedWithin: e.target.value })}
              className="appearance-none rounded-full bg-black/[0.03] hover:bg-black/[0.06] border border-black/[0.05] pl-3.5 pr-7 py-1.5 text-[12px] font-medium text-[#1d1d1f] transition-all cursor-pointer focus:outline-hidden"
            >
              <option value="all">Anytime</option>
              <option value="24h">Past 24 Hours</option>
              <option value="7d">Past 7 Days</option>
              <option value="30d">Past 30 Days</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#86868b]" />
          </div>

          {/* Clear Filters Button */}
          {isFiltered && (
            <button
              onClick={onReset}
              id="clear-filters-btn"
              className="flex items-center gap-1 rounded-full bg-[#ff3b30]/10 hover:bg-[#ff3b30]/20 text-[#ff3b30] px-3 py-1.5 text-[12px] font-medium transition-all"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>

        {/* Right: Results Count & Sort Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-[#86868b]">
            <strong className="font-semibold text-[#1d1d1f]">{totalResults}</strong> roles found
          </span>

          <div className="relative inline-block">
            <select
              id="filter-sort-select"
              value={filters.sort}
              onChange={(e) => onChange({ sort: e.target.value })}
              className="appearance-none rounded-full bg-black/[0.03] hover:bg-black/[0.06] border border-black/[0.05] pl-3.5 pr-7 py-1.5 text-[12px] font-medium text-[#1d1d1f] transition-all cursor-pointer focus:outline-hidden"
            >
              <option value="newest">Sort: Newest</option>
              <option value="popular">Sort: Most Viewed</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#86868b]" />
          </div>
        </div>
      </div>
    </div>
  );
}
