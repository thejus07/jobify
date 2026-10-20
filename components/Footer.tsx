"use client";

import React from "react";
import { Briefcase, Shield, Globe, Share2, Code2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-black/[0.06] bg-[#f5f5f7]/60 mt-16">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="col-span-2">
            <a href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#1d1d1f] text-white shadow-2xs">
                <Briefcase className="h-3.5 w-3.5" />
              </div>
              <span className="text-[14px] font-semibold text-[#1d1d1f] tracking-tight">
                Jobify
              </span>
            </a>
            <p className="mt-3 max-w-sm text-[12px] leading-relaxed text-[#86868b] font-normal">
              Direct, verified early-career discovery platform for tech internships and new graduate roles. Made with precision by Pixelmind.
            </p>
            <div className="mt-4 flex items-center gap-3 text-[#86868b]">
              <a href="https://pixelmind.co.in" target="_blank" rel="noopener noreferrer" title="Pixelmind Website" className="hover:text-[#1d1d1f] transition"><Globe className="h-3.5 w-3.5" /></a>
              <a href="#" title="Code" className="hover:text-[#1d1d1f] transition"><Code2 className="h-3.5 w-3.5" /></a>
              <a href="#" title="Share" className="hover:text-[#1d1d1f] transition"><Share2 className="h-3.5 w-3.5" /></a>
            </div>
          </div>

          {/* Opportunities */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#1d1d1f]">Opportunities</h4>
            <ul className="mt-3 space-y-2 text-[12px]">
              <li><a href="/internships" className="text-[#86868b] hover:text-[#1d1d1f] transition">Internships</a></li>
              <li><a href="/internships?workplace=REMOTE" className="text-[#86868b] hover:text-[#1d1d1f] transition">Remote Roles</a></li>
              <li><a href="/full-time" className="text-[#86868b] hover:text-[#1d1d1f] transition">New Grad Full-Time</a></li>
              <li><a href="/jobs?skill=Python" className="text-[#86868b] hover:text-[#1d1d1f] transition">Software Engineering</a></li>
              <li><a href="/jobs?skill=AI" className="text-[#86868b] hover:text-[#1d1d1f] transition">AI & Machine Learning</a></li>
            </ul>
          </div>

          {/* Tools & Resources */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#1d1d1f]">Studio & Prep</h4>
            <ul className="mt-3 space-y-2 text-[12px]">
              <li><a href="/practice" className="text-[#86868b] hover:text-[#1d1d1f] transition">Coding Practice</a></li>
              <li><a href="/leaderboard" className="text-[#86868b] hover:text-[#1d1d1f] transition">Leaderboard</a></li>
              <li><a href="/resume" className="text-[#86868b] hover:text-[#1d1d1f] transition">AI Resume Studio</a></li>
              <li><a href="/dashboard" className="text-[#86868b] hover:text-[#1d1d1f] transition">Application Tracker</a></li>
              <li><a href="/companies" className="text-[#86868b] hover:text-[#1d1d1f] transition">Companies</a></li>
            </ul>
          </div>

          {/* Employers & Platform */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#1d1d1f]">Employers</h4>
            <ul className="mt-3 space-y-2 text-[12px]">
              <li><a href="/post-job" className="text-[#86868b] hover:text-[#1d1d1f] transition">Post an Opening</a></li>
              <li><a href="/companies" className="text-[#86868b] hover:text-[#1d1d1f] transition">Directory</a></li>
              <li><a href="#" className="text-[#86868b] hover:text-[#1d1d1f] transition">ATS Feeds</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Links */}
        <div className="mt-10 border-t border-black/[0.05] pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#86868b] gap-3">
          <div className="flex items-center gap-1.5">
            <span>© 2026 Jobify. Made by</span>
            <a
              href="https://pixelmind.co.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#1d1d1f] hover:text-[#0071e3] transition underline underline-offset-2"
            >
              pixelmind.co.in
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-[#1d1d1f] transition">Privacy</a>
            <a href="#" className="hover:text-[#1d1d1f] transition">Terms</a>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.04] px-2.5 py-0.5 text-[10px] text-[#1d1d1f] font-medium">
              <Shield className="h-3 w-3 text-[#34c759]" />
              Verified Listings
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
