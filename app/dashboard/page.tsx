"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Building,
  MapPin,
  ExternalLink,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";

interface ApplicationItem {
  id: string;
  status: string;
  notes: string | null;
  appliedDate: string | null;
  followUpDate: string | null;
  salaryOffer: number | null;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    slug: string;
    location: string;
    jobType: string;
    workplaceType: string;
    applyUrl: string;
    skills: string[];
    company: {
      id: string;
      name: string;
      slug: string;
      logoUrl: string | null;
    };
  };
}

const COLUMNS = [
  { id: "SAVED", label: "Saved", color: "bg-slate-100 text-slate-700 border-slate-300" },
  { id: "APPLIED", label: "Applied", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "ASSESSMENT", label: "Assessment", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "INTERVIEW", label: "Interview", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "OFFER", label: "Offer", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "REJECTED", label: "Rejected", color: "bg-rose-50 text-rose-700 border-rose-200" },
];

export default function DashboardPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: string, nextStatus: string) => {
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, status: nextStatus }),
      });

      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status: nextStatus } : app))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNotes = async (appId: string) => {
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, notes: editNotes }),
      });

      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, notes: editNotes } : app))
        );
        setEditingId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (appId: string) => {
    try {
      const res = await fetch(`/api/applications?id=${appId}`, { method: "DELETE" });
      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.id !== appId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Layers className="h-4 w-4" />
            <span>Candidate Application Tracker</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Application Pipeline</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track and manage your recruiting stages from saved bookmark to offer acceptance.
          </p>
        </div>

        <a
          href="/jobs"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
        >
          Explore More Opportunities →
        </a>
      </div>

      {/* Kanban Pipeline Board */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading your candidate tracker...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colApps = applications.filter((a) => a.status === col.id);
            return (
              <div
                key={col.id}
                id={`kanban-column-${col.id.toLowerCase()}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 flex flex-col gap-3 min-h-[420px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-bold border ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{colApps.length}</span>
                </div>

                {/* Cards in Column */}
                <div className="flex flex-col gap-2.5">
                  {colApps.map((app) => (
                    <div
                      key={app.id}
                      id={`app-card-${app.id}`}
                      className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2 hover:border-indigo-300 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                            {app.job.title}
                          </h4>
                          <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
                            {app.job.company.name}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(app.id)}
                          title="Remove from tracker"
                          className="text-slate-300 hover:text-rose-500 p-0.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{app.job.location}</span>
                      </div>

                      {/* Status Selector Dropdown */}
                      <div className="pt-1">
                        <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                          Move to Stage:
                        </label>
                        <select
                          value={app.status}
                          id={`status-select-${app.id}`}
                          onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                          className="w-full rounded-md border border-slate-200 bg-slate-50 py-1 px-1.5 text-[11px] font-semibold text-slate-700 focus:outline-hidden"
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Notes Section */}
                      <div className="pt-1 border-t border-slate-100">
                        {editingId === app.id ? (
                          <div className="space-y-1.5">
                            <textarea
                              rows={2}
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              placeholder="Add interview notes, recruiter contact, dates..."
                              className="w-full rounded-md border border-slate-300 p-1.5 text-[11px] text-slate-800 focus:outline-hidden"
                            />
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => setEditingId(null)}
                                className="rounded-sm px-2 py-0.5 text-[10px] text-slate-500"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveNotes(app.id)}
                                className="rounded-sm bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white"
                              >
                                Save Note
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingId(app.id);
                              setEditNotes(app.notes || "");
                            }}
                            className="cursor-pointer text-[10px] text-slate-500 hover:text-slate-800 py-0.5 line-clamp-2"
                          >
                            {app.notes ? (
                              <span>📝 {app.notes}</span>
                            ) : (
                              <span className="text-slate-300 italic">+ Add notes or reminder</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Outbound Link */}
                      <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <a
                          href={app.job.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                        >
                          Company Page
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>

                        <a
                          href={`/resume?jobId=${app.job.id}`}
                          className="text-violet-600 font-semibold hover:underline"
                        >
                          Resume Match
                        </a>
                      </div>
                    </div>
                  ))}

                  {colApps.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-[11px] text-slate-400">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
