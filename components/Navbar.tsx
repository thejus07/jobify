"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Compass,
  GraduationCap,
  Code2,
  Trophy,
  Sparkles,
  Building2,
  Menu,
  X,
  User,
  LogOut,
  Plus,
  Bookmark,
  Layers,
  ChevronRight,
} from "lucide-react";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isJobPoster = Boolean(user && (user.role === "RECRUITER" || user.role === "ADMIN"));

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          return;
        }
      }
      setUser(null);
      setAuthMode("signin");
      setTimeout(() => {
        setAuthModalOpen(true);
      }, 350);
    } catch {
      setUser(null);
      setAuthMode("signin");
      setTimeout(() => {
        setAuthModalOpen(true);
      }, 350);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setUserDropdownOpen(false);
      window.location.href = "/";
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { name: "Explore", href: "/jobs" },
    { name: "Internships", href: "/internships" },
    { name: "Full-Time", href: "/full-time" },
    { name: "Practice", href: "/practice" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Resume AI", href: "/resume" },
    { name: "Companies", href: "/companies" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full apple-glass transition-all duration-300">
        <div className="mx-auto flex h-12 sm:h-14 max-w-6xl items-center justify-between px-4 sm:px-8">
          {/* Apple Style Brand Mark */}
          <a href="/" className="group flex items-center gap-2 transition hover:opacity-80">
            <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#1d1d1f] text-white shadow-xs group-hover:scale-105 transition-transform">
              <Briefcase className="h-3.5 w-3.5" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]">
              Jobify
            </span>
          </a>

          {/* Desktop Navigation - Apple style clean text pills */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className={`rounded-full px-3 py-1 text-[12px] font-medium tracking-tight transition-all duration-200 ${
                    isActive
                      ? "bg-black/[0.08] text-[#1d1d1f] font-semibold"
                      : "text-[#1d1d1f]/75 hover:text-[#1d1d1f] hover:bg-black/[0.04]"
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isJobPoster && (
              <a
                href="/post-job"
                id="navbar-post-job"
                className="hidden lg:inline-flex items-center gap-1 rounded-full bg-black/[0.04] hover:bg-black/[0.08] px-3 py-1 text-[11px] font-medium text-[#1d1d1f] transition"
              >
                <Plus className="h-3 w-3" />
                Post Job
              </a>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  id="user-menu-button"
                  className="flex items-center gap-1.5 rounded-full bg-black/[0.05] hover:bg-black/[0.09] py-1 pl-1 pr-2.5 transition text-[12px] font-medium text-[#1d1d1f]"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1d1d1f] text-[10px] font-semibold text-white uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="max-w-[90px] truncate">{user.name.split(" ")[0]}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-black/[0.08] bg-white/95 backdrop-blur-xl p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-black/[0.05]">
                      <p className="text-[12px] font-semibold text-[#1d1d1f] truncate">{user.name}</p>
                      <p className="text-[10px] text-[#86868b] truncate">{user.email}</p>
                    </div>

                    <a
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-[12px] text-[#1d1d1f] hover:bg-black/[0.04] transition"
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-[#86868b]" />
                        Tracker
                      </span>
                      <ChevronRight className="h-3 w-3 text-[#86868b]" />
                    </a>
                    <a
                      href="/dashboard/saved"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-[12px] text-[#1d1d1f] hover:bg-black/[0.04] transition"
                    >
                      <span className="flex items-center gap-2">
                        <Bookmark className="h-3.5 w-3.5 text-[#86868b]" />
                        Saved
                      </span>
                      <ChevronRight className="h-3 w-3 text-[#86868b]" />
                    </a>
                    <a
                      href="/resume"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-[12px] text-[#1d1d1f] hover:bg-black/[0.04] transition"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-[#0071e3]" />
                        Resume AI
                      </span>
                      <ChevronRight className="h-3 w-3 text-[#86868b]" />
                    </a>

                    {isJobPoster && (
                      <a
                        href="/post-job"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-[12px] font-medium text-[#0071e3] hover:bg-blue-50/50 transition"
                      >
                        <span className="flex items-center gap-2">
                          <Plus className="h-3.5 w-3.5" />
                          Post a Job
                        </span>
                        <ChevronRight className="h-3 w-3" />
                      </a>
                    )}

                    <div className="border-t border-black/[0.05] my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-medium text-[#ff3b30] hover:bg-[#ff3b30]/10 transition text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setAuthMode("signin");
                    setAuthModalOpen(true);
                  }}
                  id="signin-btn"
                  className="rounded-full px-3 py-1 text-[12px] font-medium text-[#1d1d1f]/80 hover:text-[#1d1d1f] hover:bg-black/[0.04] transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthModalOpen(true);
                  }}
                  id="signup-btn"
                  className="apple-btn-primary px-3 py-1 text-[12px] font-medium"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-toggle"
              aria-label="Toggle menu"
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/[0.05] text-[#1d1d1f]"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-black/[0.06] bg-white/95 backdrop-blur-2xl px-6 py-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-[14px] font-medium transition ${
                      isActive
                        ? "bg-black/[0.06] text-[#1d1d1f] font-semibold"
                        : "text-[#1d1d1f]/80 hover:bg-black/[0.03]"
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronRight className="h-4 w-4 text-[#86868b]" />
                  </a>
                );
              })}
              {isJobPoster && (
                <div className="pt-2 mt-2 border-t border-black/[0.06]">
                  <a
                    href="/post-job"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-[14px] font-medium text-[#0071e3]"
                  >
                    <span>Post an Opportunity</span>
                    <Plus className="h-4 w-4" />
                  </a>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          fetchUser();
        }}
      />
    </>
  );
}
