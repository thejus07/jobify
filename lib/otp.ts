// OTP generation, delivery simulation, and verification engine for Jobify

interface OtpRecord {
  otp: string;
  email: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

// Global in-memory OTP registry across Next.js dev & runtime
declare global {
  // eslint-disable-next-line no-var
  var __jobifyOtpStore: Map<string, OtpRecord> | undefined;
}

const otpStore: Map<string, OtpRecord> = global.__jobifyOtpStore || new Map();
if (process.env.NODE_ENV !== "production") {
  global.__jobifyOtpStore = otpStore;
}

export const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
export const MAX_VERIFY_ATTEMPTS = 5;

export function generateOtp(length = 6): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

export function saveOtpForEmail(email: string, otp: string): OtpRecord {
  const normalizedEmail = email.toLowerCase().trim();
  const record: OtpRecord = {
    otp,
    email: normalizedEmail,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
    createdAt: Date.now(),
  };

  otpStore.set(normalizedEmail, record);
  console.log(`\n==================================================`);
  console.log(`🔐 [JOBIFY OTP SERVICE]`);
  console.log(`Target Email: ${normalizedEmail}`);
  console.log(`Verification Code: ${otp}`);
  console.log(`Expires in: 10 minutes`);
  console.log(`==================================================\n`);

  return record;
}

export function verifyOtpForEmail(
  email: string,
  candidateOtp: string
): { success: boolean; error?: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const record = otpStore.get(normalizedEmail);

  if (!record) {
    return {
      success: false,
      error: "No verification code was requested for this email. Please click 'Send OTP'.",
    };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return {
      success: false,
      error: "Verification code has expired. Please request a new OTP.",
    };
  }

  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    otpStore.delete(normalizedEmail);
    return {
      success: false,
      error: "Too many incorrect attempts. Please request a new verification code.",
    };
  }

  record.attempts += 1;

  if (record.otp.trim() !== candidateOtp.trim()) {
    const remaining = MAX_VERIFY_ATTEMPTS - record.attempts;
    return {
      success: false,
      error: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
    };
  }

  // OTP successfully verified - consume it
  otpStore.delete(normalizedEmail);
  return { success: true };
}

export function getActiveOtpForEmail(email: string): string | null {
  const normalizedEmail = email.toLowerCase().trim();
  const record = otpStore.get(normalizedEmail);
  if (!record || Date.now() > record.expiresAt) return null;
  return record.otp;
}
