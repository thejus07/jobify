"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, Building, MapPin, Globe, CheckCircle2, AlertCircle, ArrowRight, ShieldAlert, Loader2 } from "lucide-react";

export default function PostJobPage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: string; companyName?: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    companyWebsite: "",
    location: "Remote",
    workplaceType: "REMOTE",
    jobType: "INTERNSHIP",
    experienceLevel: "ENTRY_LEVEL",
    applyUrl: "",
    skills: "React, TypeScript, Node.js",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdJob, setCreatedJob] = useState<any>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCurrentUser(data.user);
            if (data.user.companyName) {
              setFormData((prev) => ({
                ...prev,
                companyName: prev.companyName || data.user.companyName,
              }));
            }
          }
        }
      } catch {
        setCurrentUser(null);
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to post job");
      }

      setCreatedJob(data.job);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#0071e3]" />
      </div>
    );
  }

  const isJobPoster = currentUser && (currentUser.role === "RECRUITER" || currentUser.role === "ADMIN");

  if (!isJobPoster) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-black/[0.04] text-[#0071e3]">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">
            Job Poster Access Only
          </h1>
          <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed max-w-md mx-auto">
            {currentUser
              ? "Your current account is registered as a Job Seeker. To publish openings, you must log in with a verified corporate company account."
              : "Posting jobs is reserved for registered Job Posters with verified company email domains."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href="/"
            className="w-full sm:w-auto rounded-full bg-[#0071e3] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#0077ed] transition shadow-xs"
          >
            {currentUser ? "Sign In as Job Poster" : "Sign In / Register"}
          </a>
          <a
            href="/jobs"
            className="w-full sm:w-auto rounded-full border border-black/[0.1] bg-white px-6 py-2.5 text-xs font-medium text-[#1d1d1f] hover:bg-black/[0.03] transition"
          >
            Explore Openings
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-900 to-slate-900 p-8 text-white shadow-xl">
        <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider mb-2">
          <PlusCircle className="h-4 w-4" />
          <span>Employer Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Post an Early-Career Opening</h1>
        <p className="text-xs sm:text-sm text-indigo-200 mt-1">
          Reach thousands of ambitious university students and new graduate engineers.
        </p>
      </div>

      {createdJob ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Opportunity Successfully Published!</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Your posting &ldquo;{createdJob.title}&rdquo; is now active on the public Jobify job directory and discoverable by candidates.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <a
              href={`/jobs/${createdJob.id}`}
              id="view-created-job-btn"
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
            >
              View Live Posting →
            </a>
            <button
              onClick={() => {
                setCreatedJob(null);
                setFormData({
                  title: "",
                  companyName: "",
                  companyWebsite: "",
                  location: "Remote",
                  workplaceType: "REMOTE",
                  jobType: "INTERNSHIP",
                  experienceLevel: "ENTRY_LEVEL",
                  applyUrl: "",
                  skills: "",
                  description: "",
                });
              }}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Post Another Opening
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
              <input
                type="text"
                required
                id="post-job-title"
                placeholder="e.g. Software Engineer Intern, Summer 2027"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                required
                id="post-job-company"
                placeholder="e.g. Stripe, Figma, Startup Inc"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Opportunity Type</label>
              <select
                id="post-job-type"
                value={formData.jobType}
                onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="INTERNSHIP">Internship</option>
                <option value="CO_OP">Co-Op</option>
                <option value="FULL_TIME">Full-Time New Grad</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Workplace Setting</label>
              <select
                id="post-job-workplace"
                value={formData.workplaceType}
                onChange={(e) => setFormData({ ...formData, workplaceType: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">On-Site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                id="post-job-location"
                placeholder="San Francisco, CA or Remote"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Official Application URL *
            </label>
            <input
              type="url"
              required
              id="post-job-apply-url"
              placeholder="https://jobs.lever.co/company/job-id or greenhouse URL"
              value={formData.applyUrl}
              onChange={(e) => setFormData({ ...formData, applyUrl: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Key Skills (Comma Separated)
            </label>
            <input
              type="text"
              id="post-job-skills"
              placeholder="React, TypeScript, Python, Docker"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Job Description *</label>
            <textarea
              required
              rows={6}
              id="post-job-description"
              placeholder="About the role, engineering stack, qualifications, responsibilities..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            id="submit-post-job-btn"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/25 hover:from-indigo-700 hover:to-violet-700 transition disabled:opacity-50"
          >
            {loading ? "Publishing Opening..." : "Publish Job Opening"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}
    </div>
  );
}
