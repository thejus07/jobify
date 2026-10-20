import { NextRequest, NextResponse } from "next/server";
import { validateEmailForRole } from "@/lib/email-validator";
import { generateOtp, saveOtpForEmail } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, role, companyName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Role-specific domain validation
    const validation = validateEmailForRole(cleanEmail, role || "CANDIDATE", companyName);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 2. Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in." },
        { status: 409 }
      );
    }

    // 3. Generate and register 6-digit OTP
    const otp = generateOtp(6);
    saveOtpForEmail(cleanEmail, otp);

    // 4. Send email directly to the recipient's inbox
    const mailResult = await sendOtpEmail({
      toEmail: cleanEmail,
      otp,
      role: role === "RECRUITER" ? "RECRUITER" : "CANDIDATE",
      companyName,
    });

    const isLiveDelivery = mailResult.success && mailResult.provider !== "simulation";

    return NextResponse.json({
      success: true,
      message: isLiveDelivery
        ? `A 6-digit verification code has been dispatched to ${cleanEmail}. Please check your inbox and spam folder.`
        : `Email delivery simulation: SMTP not configured in .env yet.`,
      companyDomain: validation.domain,
      mailDelivered: isLiveDelivery,
      provider: mailResult.provider,
      devOtp: !isLiveDelivery ? otp : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to dispatch verification code";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
