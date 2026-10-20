"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import { Building2, MapPin, Globe, ExternalLink, ArrowLeft, ShieldCheck } from "lucide-react";

function CompanyProfileContent() {
  const params = useParams();
  const slug = params?.slug as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/companies/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading company profile...</div>;
  }

  if (!data?.company) {
    return <div className="p-12 text-center text-slate-400">Company not found.</div>;
  }

  const { company, jobs = [] } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <a
          href="/companies"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all companies
        </a>
      </div>

      {/* Company Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            {company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.logoUrl}
                alt={company.name}
                className="h-16 w-16 shrink-0 rounded-2xl border border-slate-100 object-contain p-2 shadow-xs bg-white"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-xl font-bold text-white uppercase shadow-xs">
                {company.name.slice(0, 2)}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{company.name}</h1>
                <span title="Verified ATS Partner">
                  <ShieldCheck className="h-5 w-5 text-indigo-600 fill-indigo-100" />
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {company.headquarters || "San Francisco, CA"}
                </span>
                <span>•</span>
                <span>{company.industry || "Technology"}</span>
              </div>
            </div>
          </div>

          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <Globe className="h-4 w-4" />
              Official Website
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Active Openings */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4">
          Active Opportunities at {company.name} ({jobs.length})
        </h2>

        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-500">
            No active openings found at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job: any) => (
              <a key={job.id} href={`/jobs/${job.id}`}>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-indigo-300 transition">
                  <h3 className="text-sm font-bold text-slate-900 hover:text-indigo-600">{job.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{job.location}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="rounded-md bg-indigo-50 text-indigo-700 px-2 py-0.5 text-[11px] font-semibold">
                      {job.jobType}
                    </span>
                    <span className="text-xs font-semibold text-indigo-600">View Role →</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CompanyProfilePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading company profile...</div>}>
      <CompanyProfileContent />
    </Suspense>
  );
}
