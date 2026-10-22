"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Building2,
  KeyRound,
  RotateCw,
} from "lucide-react";
import { DISALLOWED_FREE_DOMAINS } from "@/lib/email-validator";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "signin" | "signup";
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({
  isOpen,
  initialMode = "signin",
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [role, setRole] = useState<"CANDIDATE" | "RECRUITER">("CANDIDATE");
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false); // false = info step, true = OTP entry step
  const [resendTimer, setResendTimer] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domainWarning, setDomainWarning] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setOtpStep(false);
    setError(null);
  }, [initialMode, isOpen]);

  // Handle countdown timer for OTP resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Real-time domain validation for Job Poster
  useEffect(() => {
    if (mode !== "signup" || role !== "RECRUITER" || !email.includes("@")) {
      setDomainWarning(null);
      return;
    }

    const domain = email.split("@")[1]?.toLowerCase().trim();
    if (domain && DISALLOWED_FREE_DOMAINS.has(domain)) {
      const cleanCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, "") || "yourcompany";
      setDomainWarning(
        `Job posters cannot use personal @${domain}. Please use your company domain (e.g. name@${cleanCompany}.com).`
      );
    } else {
      setDomainWarning(null);
    }
  }, [email, role, mode, companyName]);

  if (!isOpen) return null;

  // Step 1: Send OTP for Job Poster or directly Register for Job Seeker
  const handleInitialSignupOrSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // If Sign In mode
    if (mode === "signin") {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        onSuccess();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Login failed");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Signup flow: Both Job Seeker & Job Poster require OTP email verification
    if (role === "RECRUITER" && domainWarning) {
      setError(domainWarning);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role,
          companyName: role === "RECRUITER" ? companyName : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dispatch verification code");

      // Successfully sent OTP -> transition to Step 2
      setOtpStep(true);
      setResendTimer(30);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and complete registration (both Candidate & Recruiter)
  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          companyName: role === "RECRUITER" ? companyName : undefined,
          otp: otp.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      onSuccess();
      if (role === "RECRUITER") {
        window.location.href = "/post-job";
      } else {
        window.location.reload();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role,
          companyName: role === "RECRUITER" ? companyName : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend verification code");
      setResendTimer(30);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-300 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-[28px] border border-black/[0.08] bg-white p-7 shadow-2xl transition-all duration-300 animate-in zoom-in-95"
      >
        {/* Apple Style Close Button */}
        <button
          onClick={onClose}
          id="close-auth-modal"
          aria-label="Close"
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.04] text-[#1d1d1f] hover:bg-black/[0.08] transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#f5f5f7] text-[#1d1d1f]">
            {mode === "signin" ? (
              <Lock className="h-5 w-5 text-[#1d1d1f]" />
            ) : otpStep ? (
              <KeyRound className="h-5 w-5 text-[#0071e3]" />
            ) : role === "RECRUITER" ? (
              <Briefcase className="h-5 w-5 text-[#0071e3]" />
            ) : (
              <User className="h-5 w-5 text-[#0071e3]" />
            )}
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">
            {mode === "signin"
              ? "Sign in to Jobify"
              : otpStep
              ? role === "RECRUITER"
                ? "Verify Company Email"
                : "Verify Email Address"
              : role === "RECRUITER"
              ? "Join as Job Poster"
              : "Join as Job Seeker"}
          </h2>

          <p className="text-[12px] text-[#86868b] mt-1 font-normal leading-relaxed">
            {mode === "signin"
              ? "Access your dashboard, saved roles, and applications"
              : otpStep
              ? `Enter the 6-digit verification code sent to ${email}`
              : role === "RECRUITER"
              ? "Register with your verified corporate company email"
              : "Sign up with your personal Gmail or university email"}
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-[#ff3b30]/10 p-3 text-[12px] text-[#ff3b30]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {/* ================= STEP 2: OTP VERIFICATION (JOB POSTER) ================= */}
        {otpStep ? (
          <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4">
            {/* Email Dispatch Notice */}
            <div className="rounded-2xl border border-black/[0.06] bg-[#f5f5f7] p-3.5 text-center">
              <span className="text-[12px] font-semibold text-[#1d1d1f] flex items-center justify-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-[#0071e3]" />
                Verification Code Sent
              </span>
              <p className="text-[11px] text-[#86868b] mt-1 leading-relaxed">
                We sent a 6-digit code to <span className="font-semibold text-[#1d1d1f]">{email}</span>. Please check your inbox and spam folder.
              </p>
            </div>


            <div>
              <label className="block text-[11px] font-medium text-[#86868b] mb-1.5 text-center">
                6-Digit Security Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-[#86868b]" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  id="otp-input"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-full bg-[#f5f5f7] border border-black/[0.05] py-2.5 pl-10 pr-4 text-center text-[16px] tracking-widest font-mono text-[#1d1d1f] placeholder:text-[#86868b] focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              id="verify-otp-btn"
              className="apple-btn-primary w-full py-2.5 text-[13px] font-medium flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{loading ? "Verifying..." : "Verify & Complete Registration"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <button
                type="button"
                onClick={() => setOtpStep(false)}
                className="text-[#86868b] hover:text-[#1d1d1f] flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" /> Change email
              </button>

              <button
                type="button"
                disabled={resendTimer > 0 || loading}
                onClick={handleResendOtp}
                className="text-[#0071e3] hover:underline disabled:text-[#86868b] disabled:no-underline font-medium"
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend OTP"}
              </button>
            </div>
          </form>
        ) : (
          /* ================= STEP 1: INITIAL SIGNUP OR SIGNIN ================= */
          <form onSubmit={handleInitialSignupOrSignin} className="space-y-3.5">
            {/* Role Selection Switcher (Only in Signup Mode) */}
            {mode === "signup" && (
              <div>
                <label className="block text-[11px] font-medium text-[#86868b] mb-1.5 text-center">
                  I am a:
                </label>
                <div className="flex rounded-full bg-[#f5f5f7] p-1 border border-black/[0.05] gap-1">
                  <button
                    type="button"
                    id="role-jobseeker-btn"
                    onClick={() => {
                      setRole("CANDIDATE");
                      setError(null);
                    }}
                    className={`flex-1 rounded-full py-2 px-3 text-[12px] transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      role === "CANDIDATE"
                        ? "bg-white text-[#1d1d1f] shadow-xs font-semibold"
                        : "text-[#86868b] hover:text-[#1d1d1f] font-medium"
                    }`}
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Job Seeker</span>
                  </button>

                  <button
                    type="button"
                    id="role-jobposter-btn"
                    onClick={() => {
                      setRole("RECRUITER");
                      setError(null);
                    }}
                    className={`flex-1 rounded-full py-2 px-3 text-[12px] transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      role === "RECRUITER"
                        ? "bg-white text-[#1d1d1f] shadow-xs font-semibold"
                        : "text-[#86868b] hover:text-[#1d1d1f] font-medium"
                    }`}
                  >
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>Job Poster</span>
                  </button>
                </div>
              </div>
            )}

            {/* Company Name Input (Job Poster Only) */}
            {mode === "signup" && role === "RECRUITER" && (
              <div>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-[#86868b]" />
                  <input
                    type="text"
                    required
                    id="auth-company-name-input"
                    placeholder="Company name (e.g. Pixelart)"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-full bg-[#f5f5f7] border border-black/[0.05] py-2.5 pl-10 pr-4 text-[13px] text-[#1d1d1f] placeholder:text-[#86868b] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Full Name Input (Signup Mode) */}
            {mode === "signup" && (
              <div>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-[#86868b]" />
                  <input
                    type="text"
                    required
                    id="auth-name-input"
                    placeholder={role === "RECRUITER" ? "Hiring manager / Recruiter name" : "Full name"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-full bg-[#f5f5f7] border border-black/[0.05] py-2.5 pl-10 pr-4 text-[13px] text-[#1d1d1f] placeholder:text-[#86868b] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Email Address Input */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#86868b]" />
                <input
                  type="email"
                  required
                  id="auth-email-input"
                  placeholder={
                    mode === "signin"
                      ? "Email address"
                      : role === "RECRUITER"
                      ? companyName
                        ? `name@${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`
                        : "name@company.com"
                      : "name@gmail.com or university email"
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-full bg-[#f5f5f7] border py-2.5 pl-10 pr-4 text-[13px] text-[#1d1d1f] placeholder:text-[#86868b] focus:bg-white focus:outline-hidden transition-all ${
                    domainWarning ? "border-[#ff3b30] bg-[#ff3b30]/5" : "border-black/[0.05]"
                  }`}
                />
              </div>

              {/* Dynamic Domain Guidance Pill */}
              {mode === "signup" && (
                <div className="mt-1.5 px-2">
                  {role === "RECRUITER" ? (
                    domainWarning ? (
                      <p className="text-[11px] text-[#ff3b30] leading-tight">
                        {domainWarning}
                      </p>
                    ) : email.includes("@") && !DISALLOWED_FREE_DOMAINS.has(email.split("@")[1]) ? (
                      <p className="text-[11px] text-[#248a3d] flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Company domain recognized ({email.split("@")[1]}). OTP required.
                      </p>
                    ) : (
                      <p className="text-[10px] text-[#86868b]">
                        Must be your corporate address (e.g. name@pixelart.com). No @gmail.com.
                      </p>
                    )
                  ) : (
                    <p className="text-[10px] text-[#86868b]">
                      Personal (@gmail.com) or university emails accepted. A 6-digit OTP will verify your inbox.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#86868b]" />
                <input
                  type="password"
                  required
                  id="auth-password-input"
                  placeholder="Password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-full bg-[#f5f5f7] border border-black/[0.05] py-2.5 pl-10 pr-4 text-[13px] text-[#1d1d1f] placeholder:text-[#86868b] focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading || (mode === "signup" && role === "RECRUITER" && !!domainWarning)}
              id="auth-submit-btn"
              className="apple-btn-primary w-full py-2.5 text-[13px] font-medium flex items-center justify-center gap-1.5 disabled:opacity-50 mt-1"
            >
              <span>
                {loading
                  ? "Processing..."
                  : mode === "signin"
                  ? "Sign In"
                  : role === "RECRUITER"
                  ? "Verify Company Email (Send OTP)"
                  : "Verify Email (Send OTP)"}
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        )}

        {/* Mode Toggle */}
        {!otpStep && (
          <div className="mt-4 text-center">
            {mode === "signin" ? (
              <p className="text-[12px] text-[#86868b]">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  id="toggle-signup-btn"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                    setOtpStep(false);
                  }}
                  className="font-medium text-[#0071e3] hover:underline"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-[12px] text-[#86868b]">
                Already have an account?{" "}
                <button
                  type="button"
                  id="toggle-signin-btn"
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                    setOtpStep(false);
                  }}
                  className="font-medium text-[#0071e3] hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
