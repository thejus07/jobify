"use client";

import React, { useState, useEffect } from "react";
import { Building2, MapPin, Briefcase, ExternalLink, Search } from "lucide-react";

interface CompanyItem {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  website: string | null;
  industry: string | null;
  headquarters: string | null;
  description: string | null;
  activeJobsCount: number;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/companies");
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry && c.industry.toLowerCase().includes(search.toLowerCase())) ||
    (c.headquarters && c.headquarters.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Building2 className="h-4 w-4" />
            <span>Employer Directory</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Top Hiring Companies</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore verified employers actively recruiting students and entry-level software talent.
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search company or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-indigo-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Grid of Companies */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl border border-slate-200 bg-white p-5 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-400">No companies found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((comp) => (
            <a
              key={comp.id}
              href={`/companies/${comp.slug}`}
              id={`company-card-${comp.slug}`}
              className="card-hover group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition"
            >
              <div>
                <div className="flex items-start gap-3.5">
                  {comp.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={comp.logoUrl}
                      alt={comp.name}
                      className="h-12 w-12 shrink-0 rounded-xl border border-slate-100 object-contain p-1.5 shadow-xs bg-white"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-sm font-bold text-white uppercase shadow-xs">
                      {comp.name.slice(0, 2)}
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {comp.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {comp.headquarters || "San Francisco, CA"}
                    </p>
                  </div>
                </div>

                {comp.industry && (
                  <div className="mt-3">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {comp.industry}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-md px-2 py-0.5 text-[11px]">
                  {comp.activeJobsCount} active {comp.activeJobsCount === 1 ? "opening" : "openings"}
                </span>

                <span className="font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-xs">
                  View Roles →
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
