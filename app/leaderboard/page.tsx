"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Flame, CheckCircle2, Award, Medal, Sparkles } from "lucide-react";

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  headline: string;
  avatarUrl: string | null;
  location: string;
  solvedCount: number;
  totalPoints: number;
  streak: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-xs mb-2">
            <Trophy className="h-4 w-4" />
            <span>Community Rankings</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Engineering Leaderboard</h1>
          <p className="mt-1 text-xs sm:text-sm text-white/90 max-w-lg leading-relaxed">
            Candidates solving daily practice questions earn reputation points, maintain problem-solving streaks, and showcase their technical competence to hiring partners.
          </p>
        </div>

        <a
          href="/practice"
          className="rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-amber-700 shadow-sm hover:bg-amber-50 transition"
        >
          Solve Today&apos;s Problem →
        </a>
      </div>

      {/* Rankings Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Top Problem Solvers</h3>
          <span className="text-xs text-slate-500">Live rankings updated in real time</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading community standings...</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {leaderboard.map((user) => (
              <div
                key={user.id}
                id={`leaderboard-row-${user.rank}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition"
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center font-bold text-sm">
                    {user.rank === 1 ? (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-extrabold text-xs">
                        🥇 1
                      </span>
                    ) : user.rank === 2 ? (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-extrabold text-xs">
                        🥈 2
                      </span>
                    ) : user.rank === 3 ? (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-800 font-extrabold text-xs">
                        🥉 3
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs font-bold">#{user.rank}</span>
                    )}
                  </div>

                  {/* Candidate Avatar & Info */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs uppercase shadow-xs">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{user.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{user.headline}</p>
                    </div>
                  </div>
                </div>

                {/* Solved Stats */}
                <div className="flex items-center gap-6">
                  {/* Streak */}
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-orange-600 font-bold bg-orange-50 border border-orange-200/60 rounded-lg px-2.5 py-1">
                    <Flame className="h-4 w-4 fill-orange-500" />
                    <span>{user.streak}d streak</span>
                  </div>

                  {/* Solved */}
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">{user.solvedCount} Solved</div>
                    <div className="text-[10px] text-slate-500">{user.totalPoints} Points</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
