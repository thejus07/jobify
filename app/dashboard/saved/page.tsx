"use client";

import React, { useState, useEffect } from "react";
import JobCard, { JobItem } from "@/components/JobCard";
import JobDetailsModal from "@/components/JobDetailsModal";
import { Bookmark, Inbox, ArrowLeft } from "lucide-react";

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/saved-jobs");
      if (res.ok) {
        const data = await res.json();
        setSavedJobs(data.savedJobs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavedChange = (jobId: string, saved: boolean) => {
    if (!saved) {
      setSavedJobs((prev) => prev.filter((item) => item.job.id !== jobId));
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center gap-2">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Application Pipeline
        </a>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50/60 via-white to-orange-50/60 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
          <Bookmark className="h-4 w-4" />
          <span>Saved Opportunities</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Bookmarked Roles</h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Jobs and internships you have saved for later review or preparation.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading saved jobs...</div>
      ) : savedJobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Inbox className="mx-auto h-8 w-8 text-slate-400 mb-2" />
          <h3 className="text-sm font-bold text-slate-900">No saved opportunities yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Click the bookmark icon on any job card to save it here.
          </p>
          <a
            href="/jobs"
            className="mt-4 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
          >
            Explore Jobs
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedJobs.map((item) => (
            <JobCard
              key={item.id}
              job={item.job}
              onSelect={(j) => setSelectedJob(j)}
              onSavedChange={handleSavedChange}
            />
          ))}
        </div>
      )}

      <JobDetailsModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onToggleSave={handleSavedChange}
      />
    </div>
  );
}
