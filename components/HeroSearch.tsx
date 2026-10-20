"use client";

import React, { useState } from "react";
import { Search, MapPin, X, ArrowRight } from "lucide-react";

interface HeroSearchProps {
  initialQuery?: string;
  initialLocation?: string;
  initialType?: string;
  totalCount?: number;
  onSearch: (params: { q: string; location: string; type: string }) => void;
}

export default function HeroSearch({
  initialQuery = "",
  initialLocation = "",
  initialType = "ALL",
  totalCount = 154,
  onSearch,
}: HeroSearchProps) {
  const [q, setQ] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [selectedType, setSelectedType] = useState(initialType);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ q, location, type: selectedType });
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    onSearch({ q, location, type });
  };

  const quickPills = [
    { label: "Software Engineer", query: "Software Engineer" },
    { label: "AI & Machine Learning", query: "AI" },
    { label: "Frontend", query: "Frontend" },
    { label: "Backend", query: "Backend" },
    { label: "Network Engineer", query: "Network" },
    { label: "Python", query: "Python" },
  ];

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-b from-[#ffffff] via-[#ffffff] to-[#f5f5f7] border border-black/[0.06] p-8 sm:p-14 text-center shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
      {/* Apple Subtle Specular Background Lighting */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[380px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#0071e3]/10 via-[#2997ff]/5 to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-3xl">
        {/* Apple Keynote Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-black/[0.04] px-3.5 py-1 text-[11px] font-medium text-[#86868b] mb-5 tracking-tight">
          <span className="flex h-1.5 w-1.5 rounded-full bg-[#34c759] shadow-[0_0_8px_#34c759]" />
          <span>{totalCount} Verified Early-Career Roles Active</span>
        </div>

        {/* Big Apple Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-semibold tracking-[-0.035em] text-[#1d1d1f] leading-[1.08]">
          Find your next breakthrough role.
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-[15px] sm:text-[17px] text-[#86868b] font-normal leading-relaxed tracking-tight">
          Curated tech internships and new graduate roles from leading companies. Clean, verified, and always direct to employer boards.
        </p>

        {/* Apple Segmented Pill Switcher */}
        <div className="mt-7 flex justify-center">
          <div className="inline-flex rounded-full bg-black/[0.05] p-1 gap-1 border border-black/[0.04]">
            <button
              type="button"
              id="filter-tab-all"
              onClick={() => handleTypeSelect("ALL")}
              className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition-all duration-200 ${
                selectedType === "ALL"
                  ? "bg-white text-[#1d1d1f] shadow-xs"
                  : "text-[#86868b] hover:text-[#1d1d1f]"
              }`}
            >
              All Roles
            </button>
            <button
              type="button"
              id="filter-tab-internship"
              onClick={() => handleTypeSelect("INTERNSHIP")}
              className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition-all duration-200 ${
                selectedType === "INTERNSHIP"
                  ? "bg-white text-[#1d1d1f] shadow-xs"
                  : "text-[#86868b] hover:text-[#1d1d1f]"
              }`}
            >
              Internships
            </button>
            <button
              type="button"
              id="filter-tab-fulltime"
              onClick={() => handleTypeSelect("FULL_TIME")}
              className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition-all duration-200 ${
                selectedType === "FULL_TIME"
                  ? "bg-white text-[#1d1d1f] shadow-xs"
                  : "text-[#86868b] hover:text-[#1d1d1f]"
              }`}
            >
              Full-Time New Grad
            </button>
          </div>
        </div>

        {/* Apple Capsule Search Form */}
        <form
          onSubmit={handleFormSubmit}
          className="mt-6 flex flex-col sm:flex-row items-center gap-1.5 rounded-full bg-white p-1.5 border border-black/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_12px_36px_rgb(0,0,0,0.08)] transition-all duration-300"
        >
          {/* Query input */}
          <div className="relative flex-1 w-full flex items-center pl-3.5">
            <Search className="h-4 w-4 text-[#86868b] shrink-0" />
            <input
              type="text"
              id="hero-search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Title, skill (Python, React), or company..."
              className="w-full bg-transparent py-2.5 px-3 text-[13px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-hidden"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="mr-2 text-[#86868b] hover:text-[#1d1d1f] transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="hidden sm:block h-6 w-px bg-black/[0.08]" />

          {/* Location input */}
          <div className="relative w-full sm:w-56 flex items-center pl-3 sm:pl-2">
            <MapPin className="h-4 w-4 text-[#86868b] shrink-0" />
            <input
              type="text"
              id="hero-location-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or Remote"
              className="w-full bg-transparent py-2.5 px-3 text-[13px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-hidden"
            />
          </div>

          {/* Apple System Blue Action Button */}
          <button
            type="submit"
            id="hero-submit-search-btn"
            className="w-full sm:w-auto shrink-0 apple-btn-primary px-5 py-2.5 text-[13px] font-medium flex items-center justify-center gap-1.5"
          >
            <span>Search</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Quick Filter Tags in Apple Pill Style */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 text-xs">
          <span className="text-[#86868b] font-normal text-[11px] mr-1">Trending:</span>
          {quickPills.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setQ(p.query);
                onSearch({ q: p.query, location, type: selectedType });
              }}
              className="rounded-full bg-black/[0.03] hover:bg-black/[0.07] px-3 py-1 text-[11px] font-medium text-[#1d1d1f] transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
